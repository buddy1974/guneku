import { NextResponse } from 'next/server'
import { AuthError } from '@/lib/auth'
import { DbConfigError } from '@/lib/db/client'

/* One place that decides what a caller is told when a protected route fails.
 *
 * ADR-023: a handler that talks to Clerk and Neon must never return the caught message. A
 * driver error can carry a host, a schema, a role name or a fragment of a connection string,
 * and every one of them is one screenshot away from being a disclosure. The reason is logged
 * server-side; the caller gets a status and a sentence that names nothing.
 *
 *   401 / 403   the caller's own situation, and safe to describe
 *   409         a conflict they can act on, so the message says what to do
 *   503         unconfigured or unmigrated database: nothing is broken and retrying will not
 *               help until somebody provisions it
 *   500         anything else, described as nothing at all */

/** Postgres 42P01 — undefined_table. The connection worked; the schema is not there yet. */
const UNDEFINED_TABLE = '42P01'
/** Postgres 23505 — unique_violation. */
const UNIQUE_VIOLATION = '23505'

function codeOf(err: unknown): string | undefined {
  return typeof err === 'object' && err !== null
    ? (err as { code?: unknown }).code as string | undefined
    : undefined
}

export function isUndefinedTable(err: unknown): boolean {
  return codeOf(err) === UNDEFINED_TABLE
}

export function isUniqueViolation(err: unknown): boolean {
  return codeOf(err) === UNIQUE_VIOLATION
}

/** Turns anything a protected handler can throw into the response it should send.
 *
 *  `conflict` lets a route name what a unique violation means in its own terms — the same
 *  SQLSTATE means "you already have a profile" in one route and "this record has already been
 *  approved to somebody" in another, and only the route knows which. */
export function apiError(
  context: string,
  err: unknown,
  conflict?: { error: string; [k: string]: unknown },
): NextResponse {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status })
  }

  if (conflict && isUniqueViolation(err)) {
    /* A lost race against a partial unique index. The database stopped a duplicate, which is
       what it is there for; the caller gets the ordinary answer rather than a fault. */
    return NextResponse.json(conflict, { status: 409 })
  }

  if (err instanceof DbConfigError) {
    console.error(`${context}: database not configured (${err.reason}).`)
    return NextResponse.json(
      { error: 'This part of Guneku is not available yet.' }, { status: 503 },
    )
  }

  if (isUndefinedTable(err)) {
    console.error(`${context}: the table does not exist — no migration has been applied to `
      + `this database. Run "npm run db:migrate" against it.`)
    return NextResponse.json(
      { error: 'This part of Guneku is not available yet.' }, { status: 503 },
    )
  }

  console.error(`${context}:`, err)
  return NextResponse.json(
    { error: 'Something went wrong. Please try again.' }, { status: 500 },
  )
}
