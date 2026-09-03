import { NextRequest, NextResponse } from 'next/server'
import { search } from '@/lib/search-index'

/* Typeahead for the header search box. It answers from the same filtered index as /search,
 * which is the point of replacing what was here before: the previous version substring-
 * matched four content types directly out of the unfiltered content loaders, so an
 * unpublished record could be surfaced by typing part of its title. It also missed people,
 * quarters, places, projects, institutions, photographs, films and the FAQ entirely.
 *
 * Deliberately small: a few results per group, enough for a dropdown. The full answer is
 * /search, which is server-rendered and works with no JavaScript at all. No model is
 * involved, so this route costs nothing per keystroke beyond the string comparison. */

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.slice(0, 120) || ''
  if (q.trim().length < 2) return NextResponse.json({ results: [], total: 0 })

  try {
    const { groups, total } = search(q, 3)

    /* Flattened for a dropdown, but each row keeps its group so the UI can label it. */
    const results = groups.flatMap(g =>
      g.results.map(r => ({ id: r.id, title: r.title, group: g.group, href: r.href, excerpt: r.excerpt })),
    ).slice(0, 10)

    return NextResponse.json({ results, total })
  } catch (err) {
    console.error('Search route failed:', err)
    return NextResponse.json({ error: 'Search is unavailable. Please try again.' }, { status: 500 })
  }
}
