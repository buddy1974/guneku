import { NextRequest, NextResponse } from 'next/server'
import {
  getAllUpdates, getAllPalaceArticles, getAllKingdomArticles,
  getAllNotables, getAllPages,
} from '@/lib/content'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase().trim() || ''
  if (q.length < 2) return NextResponse.json({ results: [] })

  const results: { id: string; title: string; section: string; href: string }[] = []

  const updates = getAllUpdates()
  for (const u of updates) {
    if (u.title.toLowerCase().includes(q) || u.excerpt?.toLowerCase().includes(q)) {
      results.push({ id: u.id, title: u.title, section: 'Village Square', href: `/updates/${u.slug}` })
    }
  }

  const palace = getAllPalaceArticles()
  for (const a of palace) {
    if (a.title.toLowerCase().includes(q) || a.body?.toLowerCase().includes(q)) {
      results.push({ id: a.id, title: a.title, section: 'The Palace', href: `/palace/${a.slug}` })
    }
  }

  const kingdom = getAllKingdomArticles()
  for (const a of kingdom) {
    if (a.title.toLowerCase().includes(q) || a.body?.toLowerCase().includes(q)) {
      results.push({ id: a.id, title: a.title, section: 'The Kingdom', href: `/kingdom/${a.slug}` })
    }
  }

  const notables = getAllNotables()
  for (const n of notables) {
    if ((n as any).name?.toLowerCase().includes(q) || (n as any).bio?.toLowerCase().includes(q)) {
      results.push({ id: n.id, title: (n as any).name, section: 'Notables', href: `/notables/${n.slug}` })
    }
  }

  return NextResponse.json({ results: results.slice(0, 8) })
}
