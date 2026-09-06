import { NextRequest, NextResponse } from 'next/server'
import { requireUser, requireRole } from '@/lib/auth'
import { apiError } from '@/lib/api-errors'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import {
  isPalaceAction, canAct, MAX, replyRecipient, subjectLine,
  type PalaceAction, type ReplyDelivery,
} from '@/lib/correspondence'
import { sendPalaceResponse } from '@/lib/email/send'
import {
  getMyCorrespondence, getForPalace, setStatus, recordResponse, recordInternalNote,
  toSenderView,
} from '@/lib/db/correspondence'

/* One letter: read by the person who wrote it, acted on by the Palace.
 *
 * ── Two different readers, two different answers ─────────────────────────────────────────
 *
 * GET is the sender's own view, scoped by their Clerk id as well as the letter id, so
 * guessing an id opens nothing. It returns a `SenderView`, which has no `internal_note` and
 * no `handled_by`: the Palace's working note is private from the person who wrote in, and
 * that is enforced by the type having no such field rather than by this handler remembering
 * to delete one.
 *
 * PATCH is the Palace acting, and requires `palace-admin`.
 *
 * ── Why palace-admin and not reviewer ────────────────────────────────────────────────────
 *
 * `reviewer` exists to decide claims and contributions — questions about what the public
 * record should say. Answering a villager's private letter is speaking *for the Palace*, and
 * nothing about being trusted to check a register implies that authority. So this route asks
 * for `palace-admin` specifically, and a reviewer gets the same 403 a member does.
 *
 * ── The Palace answers as the Palace ─────────────────────────────────────────────────────
 *
 * A response is institutional correspondence from the Fondom. Nothing here signs a reply with
 * a name, and nothing here writes on behalf of the Fon. Where a responder wants to identify
 * themselves they do it in their own words, inside the text they write. */

/* A 400 the Palace can act on. `apiError` maps anything it does not recognise to a fixed
   500, which would turn "you left the reply empty" into "something went wrong" — so this is
   caught explicitly before it gets there. */
class BadRequest extends Error {}

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  try {
    const { userId } = await requireUser()

    const letter = await getMyCorrespondence(userId, id)
    /* Not found and not yours are the same answer. Telling them apart would confirm that
       somebody else's correspondence exists to anyone who guessed an id. */
    if (!letter) {
      return NextResponse.json({ error: 'That correspondence was not found.' }, { status: 404 })
    }
    return NextResponse.json({ correspondence: letter })
  } catch (err) {
    return apiError('Correspondence read failed', err)
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params

  try {
    const body   = await req.json().catch(() => ({})) as Record<string, unknown>
    const action = body.action

    if (!isPalaceAction(action)) {
      return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
    }

    /* Speaking for the Palace, not merely reviewing the record. */
    const palace = await requireRole('palace-admin')

    if (rateLimited('palace-correspondence', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const existing = await getForPalace(id)
    if (!existing) {
      return NextResponse.json({ error: 'That correspondence does not exist.' }, { status: 404 })
    }

    if (!canAct(existing.status, action)) {
      return NextResponse.json(
        { error: 'That cannot be done to this correspondence now.' }, { status: 409 },
      )
    }

    /* The states this action may be taken from, passed into the statement so the guard is
       the UPDATE itself: two clerks acting in the same second cannot both succeed. */
    const from = allowedFrom(action)

    const updated = await apply(action, id, body, from, palace.userId)

    if (!updated) {
      return NextResponse.json(
        { error: 'That correspondence has already moved on.' }, { status: 409 },
      )
    }

    /* ── Delivery ────────────────────────────────────────────────────────────────────────
     *
     * Persist first, then send. Until 2026-09-06 there was no second half: a reply was
     * written, the status became `responded`, and the villager never received it. Most
     * people write to the Palace signed out, and My Guneku shows a letter only to the
     * account that wrote it — so for most senders "answered" meant nothing arrived.
     *
     * The order is the safety property. `recordResponse` has already committed by the time
     * a message is attempted, so a provider outage costs the delivery and never the reply.
     * The Palace is told which happened; the letter stays answered either way.
     *
     * Nothing is sent for `begin-review`, `note` or `close`. A working note is internal by
     * construction, and emailing one would hand the sender the Palace's own deliberations.
     *
     * Duplicate sends are prevented by the state machine rather than by a flag: `respond` is
     * allowed only from `received` or `in-review`, and the UPDATE carries that condition, so
     * a second press finds the letter already `responded` and gets a 409 before any mail is
     * composed. */
    let delivery: ReplyDelivery | undefined
    if (action === 'respond') {
      const to = replyRecipient(existing.sender_email)
      if (!to) {
        delivery = 'no-recipient'
      } else {
        try {
          await sendPalaceResponse({
            toEmail:         to,
            senderName:      subjectLine(existing.sender_name, MAX.name),
            subject:         subjectLine(existing.subject, MAX.subject),
            originalMessage: existing.message,
            response:        updated.response ?? '',
            sentOn:          new Date().toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            }),
          })
          delivery = 'sent'
        } catch (err) {
          /* Logged for us, reported to the Palace, and never surfaced to anyone else. The
             provider's own message is not returned: it can quote the address it failed to
             reach, which is somebody's private data. */
          console.error('Palace reply could not be emailed (the reply is saved):', err)
          delivery = 'failed'
        }
      }
    }

    /* Even to the Palace's own browser, the sender view goes back. The internal note lives
       in the queue's server-rendered page; there is no reason for it to travel in an API
       response, and every reason for this route never to be the thing that leaks it. */
    return NextResponse.json({ correspondence: toSenderView(updated), ...(delivery ? { delivery } : {}) })
  } catch (err) {
    if (err instanceof BadRequest) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return apiError('Correspondence update failed', err)
  }
}

function allowedFrom(action: PalaceAction) {
  switch (action) {
    case 'begin-review': return ['received'] as const
    case 'respond':      return ['received', 'in-review'] as const
    case 'close':        return ['received', 'in-review', 'responded'] as const
    case 'note':         return ['received', 'in-review', 'responded'] as const
  }
}

async function apply(
  action: PalaceAction, id: string, body: Record<string, unknown>,
  from: readonly ('received' | 'in-review' | 'responded' | 'closed')[], handledBy: string,
) {
  if (action === 'begin-review') return setStatus(id, 'in-review', from, handledBy)
  if (action === 'close')        return setStatus(id, 'closed', from, handledBy)

  if (action === 'respond') {
    const text = typeof body.response === 'string' ? body.response.trim() : ''
    /* A response is an explicit human act. There is no default text, no template that fires
       on a status change, and nothing anywhere that composes a reply automatically. */
    if (!text) throw new BadRequest('Please write the reply before sending it.')
    return recordResponse(id, text.slice(0, MAX.response), from, handledBy)
  }

  const note = typeof body.note === 'string' ? body.note.trim() : ''
  if (!note) throw new BadRequest('Please write the note before saving it.')
  return recordInternalNote(id, note.slice(0, MAX.note), from, handledBy)
}
