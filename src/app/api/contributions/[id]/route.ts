import { NextRequest, NextResponse } from 'next/server'
import { requireUser, requireRole } from '@/lib/auth'
import { apiError } from '@/lib/api-errors'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import { isContributionAction, ACTION_RESULT, actorFor } from '@/lib/contributions'
import {
  withdrawOwnContribution, getContributionForReview, decideContribution, toContributorView,
} from '@/lib/db/contributions'

/* Every state change a contribution can undergo, and who may make it.
 *
 *   withdraw   the contributor, on their own pending submission
 *   accept     a reviewer or palace-admin, on somebody else's pending submission
 *   reject     a reviewer or palace-admin, on somebody else's pending submission
 *
 * `member` and `contributor` cannot accept or reject. `requireRole('reviewer')` answers 403
 * from the session's own claims; a role in a request body is not read and would change
 * nothing if it were. Being able to submit is not being able to decide.
 *
 * A contributor can never accept their own contribution, whatever role they hold. That is
 * checked explicitly and separately from the role system, because a reviewer is also a son
 * or daughter of Guneku and may well have submitted something themselves.
 *
 * ── Accepting publishes nothing ──────────────────────────────────────────────────────────
 *
 * `decideContribution` writes a status, a timestamp and a reviewer id to one row in
 * `contributions`. It does not touch founding-names.json, bodies.json, chapters.json, the
 * quarter registry, the chronology or any other reviewed record — this file imports none of
 * them and has no way to reach one. "Accepted" means Guneku has taken the contribution up
 * for editorial action; a person then makes the change deliberately, or does not. */

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params

  try {
    const body   = await req.json().catch(() => ({}))
    const action = (body as { action?: unknown }).action

    if (!isContributionAction(action)) {
      return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
    }

    if (rateLimited('contributions', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    /* ── The contributor's own action ────────────────────────────────────────────────── */
    if (actorFor(action) === 'contributor') {
      const { userId } = await requireUser()

      const withdrawn = await withdrawOwnContribution(userId, id)

      /* Null covers three cases that must be indistinguishable from outside: no such row,
         not yours, already decided. Telling them apart would confirm the existence of
         another member's submission to somebody who only guessed an id. */
      if (!withdrawn) {
        return NextResponse.json(
          { error: 'That contribution can no longer be withdrawn.' }, { status: 409 },
        )
      }
      return NextResponse.json({ contribution: withdrawn })
    }

    /* ── A reviewer's decision ───────────────────────────────────────────────────────── */
    const reviewer = await requireRole('reviewer')

    const existing = await getContributionForReview(id)
    if (!existing) {
      return NextResponse.json({ error: 'That contribution does not exist.' }, { status: 404 })
    }

    /* Nobody decides their own submission, whatever role they hold. */
    if (existing.clerk_user_id === reviewer.userId) {
      return NextResponse.json(
        { error: 'You cannot review your own contribution. Another reviewer must decide it.' },
        { status: 403 },
      )
    }

    const status = ACTION_RESULT[action] as 'accepted' | 'rejected'

    const decided = await decideContribution(id, status, reviewer.userId)
    if (!decided) {
      return NextResponse.json(
        { error: 'That contribution has already been decided.' }, { status: 409 },
      )
    }

    /* The contributor view even here: this goes to a reviewer's browser, and the reviewer's
       own id has no business travelling back out to it. */
    return NextResponse.json({ contribution: toContributorView(decided) })
  } catch (err) {
    return apiError('Contribution decision failed', err)
  }
}
