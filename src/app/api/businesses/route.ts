import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/lib/api-errors'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import { authErrorResponse } from '@/lib/auth'
import { requireVerifiedGunekuan } from '@/lib/business-auth'
import { parseBusinessInput, createBusiness, listMyBusinesses } from '@/lib/db/businesses'
import { reservedBusinessSlugs } from '@/lib/business-directory'

/* Registering a business, and listing the ones you have registered.
 *
 * The gate is `requireVerifiedGunekuan()` and it is the first thing that runs. A Clerk
 * session is not enough: the Palace must have reviewed an identity claim and associated the
 * account with a named son or daughter of Guneku. A signed-in stranger posting this by hand
 * gets the same 403 the page would have shown them, from the same function.
 *
 * `personSlug` is never read from the body. It comes back from that check, out of the
 * approved claim, which is what makes it impossible to register a business in somebody
 * else's name however the request is shaped. */

export async function GET() {
  try {
    const { userId } = await requireVerifiedGunekuan()
    const rows = await listMyBusinesses(userId)
    return NextResponse.json({ businesses: rows })
  } catch (err) {
    const { body, status } = authErrorResponse(err)
    if (status !== 500) return NextResponse.json(body, { status })
    return apiError('Business listing failed', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, personSlug } = await requireVerifiedGunekuan()

    if (rateLimited('businesses', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const parsed = parseBusinessInput(await req.json().catch(() => ({})))
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    /* The curated businesses are statically routed, so a registered one may not take one of
       their slugs — it would be unreachable behind the static page. */
    const row = await createBusiness(userId, personSlug, parsed.input, reservedBusinessSlugs())

    return NextResponse.json({ business: row }, { status: 201 })
  } catch (err) {
    const { body, status } = authErrorResponse(err)
    if (status !== 500) return NextResponse.json(body, { status })
    return apiError('Business creation failed', err)
  }
}
