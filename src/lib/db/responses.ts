import { NextResponse } from 'next/server'
import { DbConfigError } from '@/lib/db/client'

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
  console.error(`${context}:`, err)
  return NextResponse.json(
    { error: 'Something went wrong. Please try again.' },
    { status: 500 },
  )
}
