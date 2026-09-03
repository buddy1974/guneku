import { NextRequest, NextResponse } from 'next/server'
import { requireUser, authErrorResponse } from '@/lib/auth'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import { getMember, saveMember, type MemberInput } from '@/lib/db/members'
import { GUNEKU_QUARTERS_27 } from '@/lib/quarters'

/* The signed-in member's own platform record. Never anybody else's: `requireUser()` supplies
 * the id, and no field in the body can change whose row is read or written. There is
 * intentionally no `GET /api/me/:id` and no way to ask for another member. */

const MAX = { name: 120, email: 200, place: 120 } as const

const str = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null
  const t = v.trim().slice(0, max)
  return t || null
}
const bool = (v: unknown): boolean | undefined => (typeof v === 'boolean' ? v : undefined)

const QUARTERS = new Set<string>(GUNEKU_QUARTERS_27)

function fail(err: unknown) {
  const { body, status } = authErrorResponse(err)
  return NextResponse.json(body, { status })
}

export async function GET() {
  try {
    const { userId, role } = await requireUser()
    const member = await getMember(userId)
    /* The role is reported so the UI can label it. It is not writable here — see PUT. */
    return NextResponse.json({ member, role })
  } catch (err) {
    return fail(err)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await requireUser()

    if (rateLimited('me', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const b = await req.json()

    /* An allow-list, field by field. Anything the body carries that is not named here is
       discarded — notably `role`, `clerk_user_id` and anything resembling a verified claim.
       Role elevation is server-side only and never travels in a request body: a member who
       posts {"role":"palace-admin"} changes nothing. */
    const quarter = str(b.quarter, MAX.place)
    const input: MemberInput = {
      displayName:   str(b.displayName, MAX.name),
      email:         str(b.email, MAX.email),
      country:       str(b.country, MAX.place),
      /* Constrained to the 27 canonical quarters, so free text cannot invent a place in
         Guneku that does not exist. An unrecognised value is dropped, not stored. */
      quarter:       quarter && QUARTERS.has(quarter) ? quarter : null,
      chapter:       str(b.chapter, MAX.place),
      profilePublic: bool(b.profilePublic),
      showCountry:   bool(b.showCountry),
      showQuarter:   bool(b.showQuarter),
      contactable:   bool(b.contactable),
    }

    const member = await saveMember(userId, input)
    return NextResponse.json({ member })
  } catch (err) {
    return fail(err)
  }
}
