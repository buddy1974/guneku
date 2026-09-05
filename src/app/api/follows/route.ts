import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { apiError } from '@/lib/api-errors'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import { listFollows, addFollow, removeFollow, getMember } from '@/lib/db/members'
import {
  isFollowChoice, isTopicId, isCanonicalQuarter, MY_QUARTER,
  QUARTER_NOT_SET_MESSAGE, QUARTER_UNKNOWN_MESSAGE,
  type FollowChoice,
} from '@/lib/follow-topics'

/* What a member has asked to hear about.
 *
 * This is a preference store and nothing more. Following a topic here sends no email, joins
 * no list and triggers nothing: it records a standing wish, and delivering on it is later
 * work with its own controls. Nothing in this file imports the mailer, and that is
 * deliberate — a route that could send is a route that eventually will.
 *
 * The member is the Clerk session, always. There is no member field in any body, and every
 * statement underneath is scoped by the id `requireUser()` returns. */

const CHOICES_PATH = '/my-guneku'

/** Resolves what a caller named into the (subject_type, subject_id) pair actually stored.
 *
 *  This is the only place a choice becomes a row, so it is the only place that needs to be
 *  right about two things: an unapproved string never becomes a subscription, and the
 *  quarter comes from the member's own record rather than from anything they sent. */
type Resolved =
  | { ok: true; subjectType: 'topic' | 'quarter'; subjectId: string }
  | { ok: false; status: 400 | 409; error: string }

async function resolveChoice(clerkUserId: string, choice: FollowChoice): Promise<Resolved> {
  if (isTopicId(choice)) {
    return { ok: true, subjectType: 'topic', subjectId: choice }
  }

  /* My quarter. Read from the member's own row, server-side, and never guessed. */
  const member = await getMember(clerkUserId)
  const quarter = member?.quarter ?? null

  if (!quarter) {
    /* Not an error in the member's conduct — they simply have not told us yet. 409 with a
       message that says exactly what to do, rather than a silent failure or a guess. */
    return { ok: false, status: 409, error: QUARTER_NOT_SET_MESSAGE }
  }
  if (!isCanonicalQuarter(quarter)) {
    return { ok: false, status: 409, error: QUARTER_UNKNOWN_MESSAGE }
  }

  return { ok: true, subjectType: 'quarter', subjectId: quarter }
}

/** The member's follows, expressed in the taxonomy's own terms rather than as table rows.
 *  The client never needs `subject_type`, an id or a timestamp to draw a set of switches. */
async function currentChoices(clerkUserId: string) {
  const rows = await listFollows(clerkUserId)
  const topics  = rows.filter(r => r.subject_type === 'topic').map(r => r.subject_id)
  const quarter = rows.find(r => r.subject_type === 'quarter')?.subject_id ?? null
  return { topics, quarter }
}

async function readChoice(req: NextRequest): Promise<FollowChoice | null> {
  const body = await req.json().catch(() => ({}))
  const raw  = (body as { topic?: unknown }).topic
  return isFollowChoice(raw) ? raw : null
}

export async function GET() {
  try {
    const { userId } = await requireUser()
    /* Only ever this member's own. There is no way to ask for anybody else's, and no
       endpoint anywhere reports who follows a topic. */
    return NextResponse.json(await currentChoices(userId))
  } catch (err) {
    return apiError('Follow listing failed', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser()

    if (rateLimited('follows', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const choice = await readChoice(req)
    if (!choice) {
      /* An unapproved string. Refused before it can reach the database, so the table cannot
         accumulate targets nobody can ever publish to. */
      return NextResponse.json({ error: 'That is not something you can follow.' }, { status: 400 })
    }

    const resolved = await resolveChoice(userId, choice)
    if (!resolved.ok) {
      return NextResponse.json(
        { error: resolved.error, ...(choice === MY_QUARTER ? { settingsUrl: CHOICES_PATH } : {}) },
        { status: resolved.status },
      )
    }

    /* Idempotent by construction: addFollow is ON CONFLICT DO NOTHING against the UNIQUE
       constraint, so following twice is following once and the second call is not an error. */
    await addFollow(userId, resolved.subjectType, resolved.subjectId)

    return NextResponse.json(await currentChoices(userId))
  } catch (err) {
    return apiError('Follow failed', err)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await requireUser()

    if (rateLimited('follows', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const choice = await readChoice(req)
    if (!choice) {
      return NextResponse.json({ error: 'That is not something you can follow.' }, { status: 400 })
    }

    if (isTopicId(choice)) {
      await removeFollow(userId, 'topic', choice)
    } else {
      /* Unfollowing a quarter must work even when the member has since changed or cleared
         the quarter on their details — otherwise a preference could be stranded, followed
         and unremovable. So every quarter row this member holds is removed, rather than
         only the one their current quarter resolves to. Still scoped to their own id. */
      const { quarter } = await currentChoices(userId)
      if (quarter) await removeFollow(userId, 'quarter', quarter)
    }

    /* Unfollowing something that was never followed is a no-op, not a fault: DELETE
       describes the state the caller wants, and that state is already true. */
    return NextResponse.json(await currentChoices(userId))
  } catch (err) {
    return apiError('Unfollow failed', err)
  }
}
