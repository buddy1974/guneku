import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { sql, databaseConfigState } from '@/lib/db/client'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'

/* A one-shot migration endpoint, and an honest account of why it exists.
 *
 * Production's `DATABASE_URL` is marked Sensitive in Vercel, so `vercel env pull` returns an
 * empty string for it. That is a deliberate security control and working around it would be
 * worse than the problem: the value is a password. But the production *runtime* holds the
 * real string and uses it successfully. So the migration runs where the credential already
 * is, rather than the credential travelling to where the migration is.
 *
 * ── Why this is not a backdoor ───────────────────────────────────────────────────────────
 *
 *   It is inert by default. With `MIGRATE_TOKEN` unset — which is how it ships — every
 *   request gets 404, indistinguishable from a route that does not exist. Nothing can be run
 *   until the owner deliberately sets that variable.
 *
 *   Unsetting the variable again disables it permanently, with no deploy and no code change.
 *   That is the intended lifecycle: set it, migrate, unset it.
 *
 *   It can only ever apply the versioned files in this repository, which are reviewed, purely
 *   additive (`CREATE ... IF NOT EXISTS`, twelve statements, no DROP, TRUNCATE, DELETE or
 *   UPDATE anywhere) and recorded in `schema_migrations` so a second run applies nothing.
 *   It accepts no SQL from the caller. There is no parameter that could carry any.
 *
 *   It never returns or logs the connection string, its host, or the token.
 */

export const dynamic = 'force-dynamic'

const MIGRATIONS_DIR = join(process.cwd(), 'src', 'lib', 'db', 'migrations')

/** Constant-time compare, so a wrong token cannot be discovered a character at a time. */
function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/* Splits a file into statements. Deliberately simple: these files are reviewed DDL, not
   arbitrary input, and there is no path by which a caller supplies SQL. */
function statements(sqlText: string): string[] {
  return sqlText
    .replace(/--[^\n]*/g, '')
    .split(/;\s*(?:\n|$)/)
    .map(s => s.trim())
    .filter(Boolean)
}

export async function POST(req: NextRequest) {
  const expected = process.env.MIGRATE_TOKEN?.trim()

  /* Unset means this route does not exist. Not 403 — 404, so its presence is not even
     confirmed to someone probing for it. */
  if (!expected) {
    return new NextResponse('Not found', { status: 404 })
  }

  if (rateLimited('admin-migrate', senderKey(req))) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }

  const provided = req.headers.get('x-migrate-token') || ''
  if (!provided || !tokenMatches(provided, expected)) {
    console.error('Migration endpoint: token mismatch.')
    return new NextResponse('Not found', { status: 404 })
  }

  const state = databaseConfigState()
  if (!state.ok) {
    console.error(`Migration endpoint: DATABASE_URL is ${state.reason}.`)
    return NextResponse.json({ error: 'The database is not configured.' }, { status: 503 })
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    const done = new Set(
      ((await sql`SELECT version FROM schema_migrations`) as { version: string }[])
        .map(r => r.version),
    )

    const files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()
    const pending = files.filter(f => !done.has(f))
    const applied: string[] = []

    for (const file of pending) {
      const body = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8')
      for (const stmt of statements(body)) {
        await sql.query(stmt)
      }
      await sql`INSERT INTO schema_migrations (version) VALUES (${file})`
      applied.push(file)
    }

    /* Report the resulting shape so the caller can verify without a second mechanism. */
    const tables = ((await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `) as { table_name: string }[]).map(r => r.table_name)

    console.log(`Migration endpoint: applied ${applied.length}, already present ${done.size}.`)

    return NextResponse.json({
      ok: true,
      alreadyApplied: [...done],
      applied,
      tables,
    })
  } catch (err) {
    /* Never the caught message: a driver error can carry connection or schema detail. */
    console.error('Migration endpoint failed:', err)
    return NextResponse.json(
      { error: 'The migration did not complete. See the server log.' },
      { status: 500 },
    )
  }
}
