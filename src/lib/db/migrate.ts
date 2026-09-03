import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

dotenv.config({ path: '.env.local' })

/* Versioned migration runner. Closes the half of R-025 that is code.
 *
 * Files live in ./migrations, named `NNNN_description.sql`, and run in filename order. Each
 * one that succeeds is recorded in `schema_migrations`, so a second run applies nothing and
 * an environment can be asked what it has rather than assumed. That matters here because
 * Preview and Production may or may not share a Neon branch (unresolved), so "I already ran
 * that" must be a fact the database states, not something a person remembers.
 *
 * Statements within a file run in order, one HTTP request each — see the note in the
 * apply loop for why that is not a transaction and what it requires of the SQL.
 *
 * Run with:  npm run db:migrate
 * Inspect with: npm run db:status  — prints what is applied and what is pending, and
 * changes nothing.
 *
 * The pre-existing `indigene_profiles` table was created by the earlier unversioned form of
 * this script. 0001 does not recreate it and does not touch it. */

const DIR = join(dirname(fileURLToPath(import.meta.url)), 'migrations')

function files() {
  return readdirSync(DIR).filter(f => f.endsWith('.sql')).sort()
}

function connect() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error(
      'DATABASE_URL is not set. Put a connection string in .env.local, or run this against\n' +
      'a specific environment deliberately. Nothing was changed.',
    )
    process.exit(1)
  }
  return neon(url)
}

type Sql = ReturnType<typeof connect>

async function applied(sql: Sql): Promise<Set<string>> {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  const rows = (await sql`SELECT version FROM schema_migrations`) as { version: string }[]
  return new Set(rows.map(r => r.version))
}

async function status() {
  const sql = connect()
  const done = await applied(sql)
  console.log('Migrations:')
  for (const f of files()) {
    console.log(`  ${done.has(f) ? 'applied ' : 'PENDING '} ${f}`)
  }
  if (files().every(f => done.has(f))) console.log('Nothing pending.')
}

/* Splits a file into statements on semicolons, ignoring those inside line comments,
   quoted strings or dollar-quoted blocks. Enough for schema DDL; it is not a SQL parser and
   is not asked to be one. */
export function statements(sqlText: string): string[] {
  const out: string[] = []
  let buf = '', quote: string | null = null, dollar: string | null = null, line = false

  for (let i = 0; i < sqlText.length; i++) {
    const c = sqlText[i], next = sqlText[i + 1]

    if (line) { buf += c; if (c === '\n') line = false; continue }
    if (quote) { buf += c; if (c === quote && next !== quote) quote = null; continue }
    if (dollar) {
      buf += c
      if (sqlText.startsWith(dollar, i)) { buf += sqlText.slice(i + 1, i + dollar.length); i += dollar.length - 1; dollar = null }
      continue
    }
    if (c === '-' && next === '-') { line = true; buf += c; continue }
    if (c === "'" || c === '"') { quote = c; buf += c; continue }
    if (c === '$') {
      const m = /^\$[A-Za-z_]*\$/.exec(sqlText.slice(i))
      if (m) { dollar = m[0]; buf += m[0]; i += m[0].length - 1; continue }
    }
    if (c === ';') { if (buf.trim()) out.push(buf.trim()); buf = ''; continue }
    buf += c
  }
  if (buf.trim()) out.push(buf.trim())
  return out.filter(s => s.replace(/--[^\n]*/g, '').trim().length > 0)
}

async function migrate() {
  const sql = connect()
  const done = await applied(sql)
  const pending = files().filter(f => !done.has(f))

  if (pending.length === 0) {
    console.log('Nothing to apply.')
    return
  }

  for (const f of pending) {
    const body = readFileSync(join(DIR, f), 'utf-8')
    console.log(`Applying ${f} …`)

    /* Neon's HTTP driver sends one statement per request and cannot wrap a whole file in a
       transaction, so this applies statements in order and stops at the first failure. That
       means a failed migration can leave earlier statements applied — stated plainly rather
       than implied away. It is survivable here only because every statement in these files
       is idempotent (CREATE ... IF NOT EXISTS), so re-running after a fix is safe. A
       migration that is NOT idempotent must not go through this runner: move to the pooled
       driver and a real transaction first. */
    for (const stmt of statements(body)) {
      await sql.query(stmt)
    }

    await sql`INSERT INTO schema_migrations (version) VALUES (${f})`
    console.log(`  ${f} applied.`)
  }
  console.log(`Done. ${pending.length} migration(s) applied.`)
}

const cmd = process.argv[2] === 'status' ? status : migrate
cmd().catch(err => {
  console.error('Migration failed. Nothing further was applied.')
  console.error(err)
  process.exit(1)
})
