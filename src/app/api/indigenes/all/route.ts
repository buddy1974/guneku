import { NextRequest, NextResponse } from 'next/server'
import { listProfiles } from '@/lib/db/queries'

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
     carry connection or schema detail. Log the cause for us, tell the caller one fixed
     thing. Closes R-020. */
    console.error('Indigenes listing failed:', err)
    return NextResponse.json({ error: 'Could not load the directory. Please try again.' }, { status: 500 })
  }
}
