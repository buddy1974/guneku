import { NextRequest, NextResponse } from 'next/server'
import {
  getProfileByClerkId,
  createProfile,
  updateProfile,
} from '@/lib/db/queries'
import { sendNewIndigeneAlert } from '@/lib/email/send'
import { requireUser, authErrorResponse } from '@/lib/auth'
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
 * the handler remembering to check.
 *
 * These routes talk to Neon, and a driver error can carry connection or schema detail, so
 * none of them returns the caught message (ADR-023). */

function fail(err: unknown) {
  const { body, status } = authErrorResponse(err)
  return NextResponse.json(body, { status })
}

export async function GET() {
  try {
    const { userId } = await requireUser()
    const profile = await getProfileByClerkId(userId)
    return NextResponse.json({ profile })
  } catch (err) {
    return fail(err)
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

    const body    = await req.json()
    const profile = await createProfile(userId, body)

    sendNewIndigeneAlert({
      name:       profile.full_name,
      profession: profile.profession  || 'Not specified',
      location:   profile.current_city && profile.current_country
        ? `${profile.current_city}, ${profile.current_country}`
        : 'Not specified',
      quarter:    profile.quarter     || 'Not specified',
      profileUrl: 'https://www.guneku.org/indigenes/profile',
    }).catch(err => console.error('New indigene alert failed:', err))

    return NextResponse.json({ profile }, { status: 201 })
  } catch (err) {
    return fail(err)
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
    return NextResponse.json({ profile })
  } catch (err) {
    return fail(err)
  }
}
