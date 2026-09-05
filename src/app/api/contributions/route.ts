import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { apiError } from '@/lib/api-errors'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import {
  isContributionType, resolveTarget, MAX_CONTENT, MAX_SOURCE,
} from '@/lib/contributions'
import { listMyContributions, createContribution } from '@/lib/db/contributions'

/* Supplying what the Guneku record is missing, or correcting what it has wrong.
 *
 * Every submission starts `pending` and nothing about it is public. Creating one changes no
 * page, no register, no roster and no JSON file — this route imports nothing that could
 * write a canonical record, and there is no path from here to one.
 *
 * The contributor is the Clerk session, always. There is no submitter field in the body, and
 * `createContribution` takes the id from `requireUser()` as its first argument. */

export async function GET() {
  try {
    const { userId } = await requireUser()
    /* Only ever this member's own, already stripped of reviewer identity. */
    const contributions = await listMyContributions(userId)
    return NextResponse.json({ contributions })
  } catch (err) {
    return apiError('Contribution listing failed', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser()

    /* A signed-in contributor is still rate limited. An account is not a licence to write in
       a loop, and every row here becomes something a person has to read. */
    if (rateLimited('contributions', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const body = await req.json().catch(() => ({})) as Record<string, unknown>

    if (!isContributionType(body.type)) {
      return NextResponse.json(
        { error: 'Please choose what kind of contribution this is.' }, { status: 400 },
      )
    }

    /* The target is checked against the reviewed records, never taken on trust. A browser
       cannot invent a quarter, a person, a body or a chapter — and the label a reviewer
       later sees is read from those records rather than from anything sent here. */
    const target = resolveTarget(body.targetType, body.targetId)
    if (!target.ok) {
      return NextResponse.json({ error: target.error }, { status: 400 })
    }

    const rawContent = typeof body.content === 'string' ? body.content.trim() : ''
    if (!rawContent) {
      return NextResponse.json(
        { error: 'Please say what you would like to add or correct.' }, { status: 400 },
      )
    }

    const rawSource = typeof body.sourceNote === 'string' ? body.sourceNote.trim() : ''

    const contribution = await createContribution(userId, {
      type:       body.type,
      targetType: target.targetType,
      targetId:   target.targetId,
      content:    rawContent.slice(0, MAX_CONTENT),
      sourceNote: rawSource ? rawSource.slice(0, MAX_SOURCE) : null,
    })

    return NextResponse.json({ contribution }, { status: 201 })
  } catch (err) {
    return apiError('Contribution creation failed', err)
  }
}
