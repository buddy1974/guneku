import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { sql, databaseConfigState } from '@/lib/db/client'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import {
  createBusiness, getMyBusiness, updateMyBusiness, archiveMyBusiness,
  listMyBusinesses, listPublicBusinesses, parseBusinessInput,
} from '@/lib/db/businesses'

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
 *   It can only ever apply the versioned files in this repository, which are reviewed and
 *   purely additive — every statement in every file is `CREATE ... IF NOT EXISTS`, with no
 *   DROP, TRUNCATE, DELETE, UPDATE or ALTER anywhere, asserted by
 *   src/lib/db/migrations/migrations.test.ts on every test run — and recorded in
 *   `schema_migrations` so a second run applies nothing. It accepts no SQL from the caller.
 *   There is no parameter that could carry any, and the request body is never read.
 *
 *   It never returns or logs the connection string, its host, or the token.
 */

/* ── This is the endpoint's fifth life ───────────────────────────────────────────────────
 *
 * Restore, apply, verify, delete — every time. The lifecycle is what makes it safe, and the
 * last step is the one that would be tempting to skip.
 *
 *   2026-09-03  added for 0000 and 0001; removed 2026-09-04 (64b60b3)
 *   2026-09-05  restored for 0002; removed the same day (28b9762)
 *   2026-09-05  restored for 0003, contributions; removed the same day (238f1af)
 *   2026-09-05  restored for 0004, Palace correspondence; removed the same day (f054b4c)
 *   2026-09-16  restored for 0005, the Business Directory tables
 *
 * If you are reading this in a deployed build and 0005 is already applied, this file should
 * not be here: remove it.
 *
 * ── What is new this time, and why ───────────────────────────────────────────────────────
 *
 * One extra action, `acceptance`, behind the same token and removed with the same file.
 *
 * 0005 is the first migration whose value is a WORKFLOW rather than a table: a verified
 * Gunekuan creating, editing and withdrawing a business, and nobody else touching it.
 * Confirming the table exists would not confirm any of that. Going through the real HTTP API
 * instead would need a Clerk account and an approved identity claim created in production
 * for a person who does not exist, which is a far worse thing to leave behind than a
 * temporary endpoint.
 *
 * So `acceptance` runs one fixed sequence against the real production database, through the
 * same query functions the API uses, under two synthetic owner ids, and deletes what it made.
 * It reads nothing from the request. There is no parameter it could take. */

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

/* ── The acceptance sequence ──────────────────────────────────────────────────────────────
 *
 * Fixed, hard-coded, and self-cleaning. Two synthetic owners, one business, and a hard
 * DELETE at the end — not an archive, because an archived row is still a row and this must
 * leave production exactly as it found it. */

const OWNER_A = 'acceptance-check-owner-a'
const OWNER_B = 'acceptance-check-owner-b'
const PERSON = 'acceptance-check-person'
const TEST_NAME = 'ACCEPTANCE CHECK — delete me'

type Check = { check: string; pass: boolean; detail?: string }

async function runAcceptance(): Promise<{ checks: Check[]; leftBehind: number }> {
  const checks: Check[] = []
  const ok = (check: string, pass: boolean, detail?: string) => {
    checks.push({ check, pass, ...(detail ? { detail } : {}) })
  }

  let createdId: string | null = null

  try {
    const parsed = parseBusinessInput({
      name: TEST_NAME,
      category: 'retail-commerce',
      description: 'Temporary record written by the production acceptance check.',
      country: 'Cameroon',
      city: 'Guneku',
      website: 'javascript:alert(1)',
      videos: [{ url: 'https://youtu.be/dQw4w9WgXcQ' }],
      publishContact: false,
      contactPhone: '+000 000 000',
      personSlug: 'marcel-tabit-akwe',
    })
    ok('input parses', parsed.ok)
    if (!parsed.ok) return { checks, leftBehind: 0 }

    ok('unsafe website dropped before storage', parsed.input.website === null)
    ok('contact discarded without consent', parsed.input.contactPhone === null)
    ok(
      'video reduced to an eleven-character id',
      parsed.input.videoIds.length === 1 && parsed.input.videoIds[0].videoId === 'dQw4w9WgXcQ',
    )

    /* CREATE — person_slug comes from the caller, not from the body. The body above carries
       a real person's slug on purpose; it must be ignored in favour of what is passed. */
    const created = await createBusiness(OWNER_A, PERSON, parsed.input, [])
    createdId = created.id
    ok('created against the production database', Boolean(created.id))
    ok('starts pending, not public', created.status === 'pending', created.status)
    ok('person_slug taken from the caller, never the body', created.person_slug === PERSON,
       created.person_slug)
    ok('slug allocated', Boolean(created.slug), created.slug)

    /* READ — the owner sees it; another identity does not, and gets the same answer as for a
       business that does not exist. */
    ok('owner can read it', Boolean(await getMyBusiness(OWNER_A, created.id)))
    ok('another identity cannot read it', (await getMyBusiness(OWNER_B, created.id)) === null)

    /* NOT PUBLIC — a pending business must not reach the directory. */
    const publicNow = await listPublicBusinesses()
    ok('absent from the public directory while pending',
       !publicNow.some(b => b.name === TEST_NAME))

    /* EDIT — the owner may; another identity may not, and no rows move. */
    const edited = await updateMyBusiness(OWNER_A, created.id, {
      ...parsed.input, tagline: 'Edited by the acceptance check.',
    })
    ok('owner can edit it', edited?.tagline === 'Edited by the acceptance check.')

    const stolen = await updateMyBusiness(OWNER_B, created.id, {
      ...parsed.input, name: 'TAKEN OVER',
    })
    ok('another identity cannot edit it', stolen === null)

    const afterAttempt = await getMyBusiness(OWNER_A, created.id)
    ok('the failed edit changed nothing', afterAttempt?.row.name === TEST_NAME,
       afterAttempt?.row.name)

    /* CONSTRAINTS — the two the schema carries, tried directly rather than assumed. */
    try {
      await sql`
        UPDATE businesses SET publish_contact = FALSE, contact_phone = '+000'
        WHERE id = ${created.id}
      `
      ok('schema refuses contact without consent', false, 'the update was allowed')
    } catch {
      ok('schema refuses contact without consent', true)
    }

    try {
      await sql`
        INSERT INTO business_videos (business_id, video_id)
        VALUES (${created.id}, ${'not-an-id'})
      `
      ok('schema refuses a malformed video id', false, 'the insert was allowed')
    } catch {
      ok('schema refuses a malformed video id', true)
    }

    /* ARCHIVE — and it leaves the owner's own list. */
    const archived = await archiveMyBusiness(OWNER_A, created.id)
    ok('owner can archive it', archived?.status === 'archived', archived?.status)
    const mine = await listMyBusinesses(OWNER_A)
    ok('archived business leaves the owner list', !mine.some(b => b.id === created.id))
  } catch (err) {
    ok('the sequence completed', false, err instanceof Error ? err.name : 'unknown error')
  }

  /* CLEAN UP — a hard delete, always attempted, whatever happened above. The cascade takes
     the video rows with it. */
  if (createdId) {
    await sql`DELETE FROM businesses WHERE id = ${createdId}`
  }
  await sql`DELETE FROM businesses WHERE clerk_user_id IN (${OWNER_A}, ${OWNER_B})`

  const left = ((await sql`
    SELECT COUNT(*)::int AS n FROM businesses WHERE clerk_user_id IN (${OWNER_A}, ${OWNER_B})
  `) as { n: number }[])[0].n
  checks.push({ check: 'temporary record removed', pass: left === 0 })

  return { checks, leftBehind: left }
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

  /* The only thing read from the request, and it selects between two fixed behaviours. */
  const action = req.nextUrl.searchParams.get('action') === 'acceptance' ? 'acceptance' : 'migrate'

  try {
    if (action === 'acceptance') {
      const { checks, leftBehind } = await runAcceptance()
      const failed = checks.filter(c => !c.pass)
      console.log(`Acceptance: ${checks.length - failed.length}/${checks.length} passed.`)
      return NextResponse.json({
        ok: failed.length === 0,
        passed: checks.length - failed.length,
        total: checks.length,
        leftBehind,
        checks,
      })
    }

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

    /* Report the resulting shape so the caller can verify without a second mechanism, and
       without any endpoint that runs caller-supplied SQL ever existing. All of these are
       reads of the catalogue: no user input reaches them and they change nothing. */
    const tables = ((await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `) as { table_name: string }[]).map(r => r.table_name)

    const indexes = ((await sql`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public' ORDER BY indexname
    `) as { indexname: string }[]).map(r => r.indexname)

    /* Column-level detail for the three tables 0005 creates, so "matches the migration" is
       something the catalogue states rather than something this handler asserts. */
    const columns = ((await sql`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('businesses', 'business_videos', 'business_images')
      ORDER BY table_name, ordinal_position
    `) as Array<Record<string, unknown>>)

    const constraints = ((await sql`
      SELECT c.conname, c.contype, t.relname AS table_name
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname IN ('businesses', 'business_videos', 'business_images')
      ORDER BY t.relname, c.conname
    `) as Array<Record<string, unknown>>)

    /* Row counts on the tables that existed before today, so "nothing else was touched" is
       a fact about production rather than a hope. */
    const existing = ((await sql`
      SELECT
        (SELECT COUNT(*)::int FROM indigene_profiles)    AS indigene_profiles,
        (SELECT COUNT(*)::int FROM community_members)    AS community_members,
        (SELECT COUNT(*)::int FROM follows)              AS follows,
        (SELECT COUNT(*)::int FROM profile_claims)       AS profile_claims,
        (SELECT COUNT(*)::int FROM contributions)        AS contributions,
        (SELECT COUNT(*)::int FROM palace_correspondence) AS palace_correspondence
    `) as Array<Record<string, number>>)[0]

    const ledger = ((await sql`
      SELECT version, applied_at FROM schema_migrations ORDER BY version
    `) as { version: string; applied_at: string }[])

    console.log(`Migration endpoint: applied ${applied.length}, already present ${done.size}.`)

    return NextResponse.json({
      ok: true,
      alreadyApplied: [...done],
      applied,
      tables,
      indexes,
      columns,
      constraints,
      existingRowCounts: existing,
      ledger,
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
