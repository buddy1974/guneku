import { NextRequest, NextResponse } from 'next/server'
import {
  getProfileByClerkId,
  profileExists,
  createProfile,
  updateProfile,
  isUniqueViolation,
} from '@/lib/db/queries'
import { DbConfigError } from '@/lib/db/client'
import { sendNewIndigeneAlert } from '@/lib/email/send'
import { requireUser, AuthError } from '@/lib/auth'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'

/* A person's own directory profile. Closes R-023.
 *
 * This route previously opened with `const userId = 'demo-user'` and no session check, which
 * made it a public write endpoint against Neon where every caller landed on the same row.
 * The user id now comes from Clerk, server-side, on every request.
 *
 * The id is never taken from the body or the query string. That is the point: a caller who
 * could name their own user id could edit anybody's profile, and `requireUser()` is what
 * makes "one user cannot update another user's data" true by construction rather than by
 * the handler remembering to check. `createProfile` and `updateProfile` both take that id as
 * their first argument and scope every statement by it.
 *
 * These routes talk to Neon, and a driver error can carry connection or schema detail, so
 * none of them returns the caught message (ADR-023). */

/** Where a member is sent when they already have what they were trying to create. */
const PROFILE_PATH = '/indigenes/profile'

/* One place that decides what a caller is told, so no handler can leak by forgetting.
 *
 * 401/403  the caller's own problem, and safe to name
 * 409      they already own a profile — not a fault, a wrong turn, so it carries the way out
 * 503      the database is unconfigured or unmigrated: nothing is broken and retrying will
 *          not help until somebody provisions it
 * 500      anything else, described to the caller as nothing at all */
const UNDEFINED_TABLE = '42P01'

function fail(context: string, err: unknown) {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status })
  }

  /* A unique violation on this table can only be `clerk_user_id`, so it means one thing:
     two creates raced and this one lost. The member is not shown a conflict they cannot
     act on — they are told the profile exists and given the link to it. */
  if (isUniqueViolation(err)) {
    return NextResponse.json(
      { error: 'You already have a profile.', profileUrl: PROFILE_PATH },
      { status: 409 },
    )
  }

  if (err instanceof DbConfigError) {
    console.error(`${context}: database not configured (${err.reason}).`)
    return NextResponse.json(
      { error: 'This part of Guneku is not available yet.' },
      { status: 503 },
    )
  }
  if (typeof err === 'object' && err !== null &&
      (err as { code?: unknown }).code === UNDEFINED_TABLE) {
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

export async function GET() {
  try {
    const { userId } = await requireUser()
    const profile = await getProfileByClerkId(userId)
    return NextResponse.json({ profile })
  } catch (err) {
    return fail('Indigene profile read failed', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser()

    /* A signed-in caller is still rate limited: an account is not a licence to write in a
       loop, and the alert below reaches the Palace inbox. */
    if (rateLimited('indigene-profile', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    /* One profile per person. The UNIQUE constraint on clerk_user_id still enforces it — and
       still catches the race, in `fail` above — but a constraint violation is the database
       stopping a mistake, not a way to tell a member something. Asking first means the
       ordinary case gets an ordinary answer with somewhere to go. */
    if (await profileExists(userId)) {
      return NextResponse.json(
        { error: 'You already have a profile.', profileUrl: PROFILE_PATH },
        { status: 409 },
      )
    }

    const body    = await req.json()
    const profile = await createProfile(userId, body)

    sendNewIndigeneAlert({
      name:       profile.full_name,
      profession: profile.profession  || 'Not specified',
      location:   profile.current_city && profile.current_country
        ? `${profile.current_city}, ${profile.current_country}`
        : 'Not specified',
      quarter:    profile.quarter     || 'Not specified',
      profileUrl: `https://www.guneku.org${PROFILE_PATH}`,
    }).catch(err => console.error('New indigene alert failed:', err))

    return NextResponse.json({ profile }, { status: 201 })
  } catch (err) {
    return fail('Indigene profile creation failed', err)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await requireUser()

    if (rateLimited('indigene-profile', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const body    = await req.json()
    /* Scoped by the session's own user id, so the body cannot redirect the write. */
    const profile = await updateProfile(userId, body)

    /* No row updated means this member has never created a profile. Saying so is more useful
       than the fixed 500 the previous version produced by handing `undefined` onward. */
    if (!profile) {
      return NextResponse.json(
        { error: 'You do not have a profile yet.', createUrl: '/indigenes/onboarding' },
        { status: 404 },
      )
    }

    return NextResponse.json({ profile })
  } catch (err) {
    return fail('Indigene profile update failed', err)
  }
}
