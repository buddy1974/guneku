import { NextRequest, NextResponse } from 'next/server'
import { requireUser, requireRole } from '@/lib/auth'
import { apiError } from '@/lib/api-errors'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import { isClaimAction, ACTION_RESULT, actorFor } from '@/lib/claims'
import {
  withdrawOwnClaim, getClaimForReview, decideClaim, toClaimantView,
} from '@/lib/db/claims'

/* Every state change a claim can undergo, and who is allowed to make it.
 *
 * Three actions, two actors, one rule each:
 *
 *   withdraw   the claimant, on their own pending claim
 *   approve    a reviewer or palace-admin, on somebody else's pending claim
 *   reject     a reviewer or palace-admin, on somebody else's pending claim
 *
 * A `member` and a `contributor` can do neither of the last two: `requireRole('reviewer')`
 * answers 403, server-side, from the session's own claims. A role in a request body is not
 * read, cannot be read, and would change nothing if it were — the role comes from Clerk's
 * public metadata via the session, never from the browser.
 *
 * A claimant can never approve their own claim. That is checked explicitly below and is not
 * left to the role system, because a reviewer is also a member of Guneku and may perfectly
 * well have a claim of their own waiting. Holding the role is not permission to decide your
 * own case.
 *
 * Approving changes no historical record. It writes a status, a timestamp and a reviewer id
 * to one row in `profile_claims`. The person's biography, office, standing and sources live
 * in reviewed JSON that this route does not import and cannot write. */

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params

  try {
    const body   = await req.json().catch(() => ({}))
    const action = (body as { action?: unknown }).action

    if (!isClaimAction(action)) {
      return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
    }

    if (rateLimited('claims', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    /* ── The claimant's own action ───────────────────────────────────────────────────── */
    if (actorFor(action) === 'claimant') {
      const { userId } = await requireUser()

      /* Scoped by the claimant's id as well as the claim id, and by `status = 'pending'` in
         the statement itself. A guessed id cannot withdraw somebody else's request. */
      const claim = await withdrawOwnClaim(userId, id)

      /* Null covers three cases that must be indistinguishable from outside: no such claim,
         not yours, already decided. Telling them apart would confirm the existence of another
         member's claim to somebody who only guessed an id. */
      if (!claim) {
        return NextResponse.json(
          { error: 'That request can no longer be withdrawn.' },
          { status: 409 },
        )
      }
      return NextResponse.json({ claim })
    }

    /* ── A reviewer's decision ───────────────────────────────────────────────────────── */
    const reviewer = await requireRole('reviewer')

    const existing = await getClaimForReview(id)
    if (!existing) {
      return NextResponse.json({ error: 'That claim does not exist.' }, { status: 404 })
    }

    /* Nobody decides their own case, whatever role they hold. */
    if (existing.clerk_user_id === reviewer.userId) {
      return NextResponse.json(
        { error: 'You cannot review your own claim. Another reviewer must decide it.' },
        { status: 403 },
      )
    }

    const status = ACTION_RESULT[action] as 'approved' | 'rejected'

    /* `AND status = 'pending'` lives in the UPDATE, so two reviewers pressing approve at the
       same moment cannot both succeed: the loser updates no rows and is told so. */
    const decided = await decideClaim(id, status, reviewer.userId)
    if (!decided) {
      return NextResponse.json(
        { error: 'That claim has already been decided.' },
        { status: 409 },
      )
    }

    /* The claimant view even here: this response goes to a reviewer's browser, and the
       reviewer's own id has no business travelling back out to it. */
    return NextResponse.json({ claim: toClaimantView(decided) })
  } catch (err) {
    /* The one-approved-per-record index. Two different members claimed the same son of
       Guneku and a second reviewer approved the other one first. */
    return apiError('Claim decision failed', err, {
      error: 'Another claim for this record has already been approved.',
    })
  }
}
