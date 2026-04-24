import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const search  = req.nextUrl.searchParams.get('search') || ''
  const quarter = req.nextUrl.searchParams.get('quarter') || ''
  const country = req.nextUrl.searchParams.get('country') || ''
  const page    = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const limit   = 24
  const offset  = (page - 1) * limit

  let query = supabaseAdmin
    .from('indigene_profiles')
    .select('*', { count: 'exact' })
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,profession.ilike.%${search}%,current_city.ilike.%${search}%`)
  }
  if (quarter) query = query.eq('quarter', quarter)
  if (country) query = query.eq('current_country', country)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profiles: data, total: count, page, limit })
}
