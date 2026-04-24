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
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
