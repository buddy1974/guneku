import { NextResponse } from 'next/server'
import { DbConfigError } from '@/lib/db/client'

/* Postgres 42P01 — undefined_table. Production reached the database successfully and was told
   the table does not exist, because no migration has ever been applied there. That is a
   provisioning state, not a fault: the connection works, the schema is simply not created
   yet. It deserves the same honest 503 as an unconfigured database rather than a 500 that
   tells a visitor the site is broken. */
const UNDEFINED_TABLE = '42P01'

function isNotProvisioned(err: unknown): boolean {
  return typeof err === 'object' && err !== null &&
    (err as { code?: unknown }).code === UNDEFINED_TABLE
}

/* A database route answers one of three ways, and the distinction matters operationally:
 *   configured and working      -> the data
 *   not configured              -> 503, "not available yet", because nothing is broken and
 *                                  retrying will not help until someone sets a variable
 *   configured but it failed    -> 500, "try again"
 *
 * The caller is never told which, beyond the status. The reason is logged server-side. */
export function dbErrorResponse(context: string, err: unknown) {
  if (err instanceof DbConfigError) {
    console.error(`${context}: database not configured (${err.reason}).`)
    return NextResponse.json(
      { error: 'This part of Guneku is not available yet.' },
      { status: 503 },
    )
  }
  if (isNotProvisioned(err)) {
    console.error(`${context}: the table does not exist — no migration has been applied to `
      + `this database. Run "npm run db:migrate" against it.`)
    return NextResponse.json(
      { error: 'This part of Guneku is not available yet.' },
      { status: 503 },
    )
  }

  console.error(`${context}:`, err)
  return NextResponse.json(
    { error: 'Something went wrong. Please try again.' },
    { status: 500 },
  )
}
