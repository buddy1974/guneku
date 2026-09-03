import { NextRequest, NextResponse } from 'next/server'
import { listProfiles } from '@/lib/db/queries'
import { dbErrorResponse } from '@/lib/db/responses'

export async function GET(req: NextRequest) {
  try {
    const p      = req.nextUrl.searchParams
    const result = await listProfiles({
      search:  p.get('search')  || undefined,
      quarter: p.get('quarter') || undefined,
      country: p.get('country') || undefined,
      page:    parseInt(p.get('page') || '1'),
      limit:   24,
    })
    return NextResponse.json({ profiles: result.profiles, total: result.total })
  } catch (err) {
    /* Never return the caught message: this route talks to Neon, and a driver error can
       carry connection or schema detail (R-020). An unconfigured database answers 503
       rather than 500 — nothing is broken and retrying will not help. */
    return dbErrorResponse('Indigenes listing failed', err)
  }
}
