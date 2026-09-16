import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/lib/api-errors'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import { authErrorResponse } from '@/lib/auth'
import { requireVerifiedGunekuan } from '@/lib/business-auth'
import {
  parseBusinessInput, getMyBusiness, updateMyBusiness, archiveMyBusiness,
} from '@/lib/db/businesses'

/* Editing and withdrawing a business you own.
 *
 * Every statement behind these handlers carries `AND clerk_user_id = $you` in its own WHERE
 * clause rather than checking ownership first and writing second. That is not belt and
 * braces: it is the actual control. Changing the id in the URL to somebody else's business
 * updates no rows and returns null, which becomes a 404 — the same answer a business that
 * does not exist gets, because telling a stranger "that exists but is not yours" confirms
 * the existence of somebody else's record to somebody who only guessed an id. */

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  try {
    const { userId } = await requireVerifiedGunekuan()
    const found = await getMyBusiness(userId, id)
    if (!found) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    return NextResponse.json({ business: found.row, videos: found.videos })
  } catch (err) {
    const { body, status } = authErrorResponse(err)
    if (status !== 500) return NextResponse.json(body, { status })
    return apiError('Business read failed', err)
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  try {
    const { userId } = await requireVerifiedGunekuan()

    if (rateLimited('businesses', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const parsed = parseBusinessInput(await req.json().catch(() => ({})))
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const row = await updateMyBusiness(userId, id, parsed.input)
    if (!row) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

    return NextResponse.json({ business: row })
  } catch (err) {
    const { body, status } = authErrorResponse(err)
    if (status !== 500) return NextResponse.json(body, { status })
    return apiError('Business update failed', err)
  }
}

/** Archive, never delete. A record that is gone cannot be restored when somebody withdrew
 *  the wrong one, and cannot answer what was published at a URL last week. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  try {
    const { userId } = await requireVerifiedGunekuan()

    if (rateLimited('businesses', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const row = await archiveMyBusiness(userId, id)
    if (!row) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

    return NextResponse.json({ business: row })
  } catch (err) {
    const { body, status } = authErrorResponse(err)
    if (status !== 500) return NextResponse.json(body, { status })
    return apiError('Business archive failed', err)
  }
}
