import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { apiError } from '@/lib/api-errors'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import { claimEligibility, INELIGIBLE_MESSAGE } from '@/lib/claims'
import { listMyClaims, findLiveClaim, createClaim } from '@/lib/db/claims'

/* Opening and listing profile claims.
 *
 * A claim is a request for review and nothing else. Creating one changes no public page, no
 * biography, no office, no Royal Family standing, no Notable standing, no GUDECA membership
 * and no diaspora classification — those live in reviewed JSON records that this route has no
 * way to write and does not import.
 *
 * The claimant is the Clerk session, always. There is no claimant field in the body, no
 * `userId` parameter, and no way to file a claim in somebody else's name: `requireUser()`
 * supplies the id and `createClaim` takes it as its first argument. */

const MAX_NOTE = 1200

const CLAIMS_PATH = '/my-guneku'

export async function GET() {
  try {
    const { userId } = await requireUser()
    /* Only ever this member's own. There is deliberately no way to ask for anybody else's,
       and the rows are mapped to the claimant view, which carries no reviewer identity. */
    const claims = await listMyClaims(userId)
    return NextResponse.json({ claims })
  } catch (err) {
    return apiError('Claim listing failed', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser()

    if (rateLimited('claims', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const body = await req.json().catch(() => ({}))

    /* Eligibility is decided against the reviewed record, not against anything the browser
       said about it. A deceased entry is refused here as well as being un-offered in the
       page, because a page that does not show a button is not a rule. */
    const eligibility = claimEligibility((body as { personSlug?: unknown }).personSlug)
    if (!eligibility.ok) {
      return NextResponse.json(
        { error: INELIGIBLE_MESSAGE[eligibility.reason] },
        { status: eligibility.reason === 'unknown' ? 404 : 403 },
      )
    }
    const slug = eligibility.person.slug

    /* The claimant's own words, capped. Optional by design: nobody has to justify their own
       name, and no identity document is asked for here or anywhere in this workflow. */
    const rawNote = (body as { note?: unknown }).note
    const note = typeof rawNote === 'string' && rawNote.trim()
      ? rawNote.trim().slice(0, MAX_NOTE)
      : null

    /* Asked before writing so the ordinary duplicate gets an ordinary answer. The partial
       unique index still catches the race — see the catch below. */
    const existing = await findLiveClaim(userId, slug)
    if (existing) {
      return NextResponse.json(
        {
          error: existing.status === 'approved'
            ? 'This record is already associated with your account.'
            : 'You already have a request awaiting review for this record.',
          claimsUrl: CLAIMS_PATH,
        },
        { status: 409 },
      )
    }

    const claim = await createClaim(userId, slug, note)
    return NextResponse.json({ claim }, { status: 201 })
  } catch (err) {
    /* Two tabs, two submits: the check above passed twice and the index caught the second. */
    return apiError('Claim creation failed', err, {
      error: 'You already have a request for this record.',
      claimsUrl: CLAIMS_PATH,
    })
  }
}
