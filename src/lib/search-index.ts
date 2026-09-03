import 'server-only'

import {
  getAllUpdates, getAllPalaceArticles, getAllKingdomArticles,
  getAllNotables, getAllInstitutions, getImageGallery,
} from '@/lib/content'
import { allQuarters } from '@/lib/quarter-pages'
import { allLocations } from '@/lib/explore'
import { allBodies, membersOf, allFoundingNames } from '@/lib/community'
import current from '@/data/current-notices.json'
import videoGallery from '@/data/gallery/video-gallery.json'
import villageFacts from '@/data/home/village-facts.json'

/* One index for everything a visitor may search. Deterministic: built from the published
 * records at module load, scored by string rules, no model involved anywhere.
 *
 * The index is an allow-list, not a sweep. Every source below is reached through a named
 * loader and filtered before it is added, because search is the one surface that can surface
 * anything — a held record that no page links is still exposed the moment a search finds it.
 *
 * What is deliberately excluded, and why:
 *   - `publicVisibility: 'hold'`  — the Business Directory, held pending separate approval
 *   - `noindex: true`             — the six empty Kingdom stubs
 *   - a missing `publishedAt`     — unpublished records; the content loaders do not filter
 *                                   these themselves, which is the defect R-026 was about
 *   - `src/data/pages/gudeca-exco.json` — Joomla sample data, four fictitious names (R-011)
 *   - `src/data/about/`           — nine dead duplicate files (R-012)
 *   - `articles-index.json`       — a legacy index that would duplicate every update
 *   - officers' personal mobile numbers, and anything the content pass withheld
 *
 * Neither loader nor page ever reads a phone number, an email or a private note into an
 * entry: the searchable text of every entry is assembled field by field below, so a field
 * added to a record later cannot become searchable by accident. */

export type SearchGroup =
  | 'People' | 'Places' | 'Palace & history' | 'Projects'
  | 'Institutions' | 'News & records' | 'Photos' | 'Films' | 'Questions'

export type SearchEntry = {
  id: string
  title: string
  group: SearchGroup
  href: string
  /** One line of context shown under the title. Never a phone number or an email. */
  excerpt: string
  /** Extra terms a person might reasonably type. Not shown. */
  keywords: string[]
  /** Nudges a whole class up or down when scores tie. */
  weight: number
}

export const GROUP_ORDER: SearchGroup[] = [
  'People', 'Places', 'Palace & history', 'Projects',
  'Institutions', 'News & records', 'Photos', 'Films', 'Questions',
]

const strip = (html: string | null | undefined) =>
  (html || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()

const clip = (s: string, n = 180) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s)

function build(): SearchEntry[] {
  const out: SearchEntry[] = []
  const push = (e: SearchEntry) => { out.push(e) }

  /* ── People: the bodies, their members, and the notables ── */
  for (const body of allBodies()) {
    push({
      id: `body:${body.id}`,
      title: body.name,
      group: 'People',
      href: `/people/${body.id}`,
      excerpt: clip(strip(body.standfirst)),
      keywords: [body.short, 'register', 'office', 'council', 'body'].filter(Boolean) as string[],
      weight: 3,
    })
    for (const m of membersOf(body.id)) {
      push({
        id: `member:${body.id}:${m.slug}`,
        title: m.display,
        group: 'People',
        href: `/people/${body.id}`,
        /* Role and body only. No contact detail of any kind enters the index. */
        excerpt: clip([m.role, body.short].filter(Boolean).join(' · ')),
        keywords: [...(m.aliases || []), body.short].filter(Boolean) as string[],
        weight: 2,
      })
    }
  }
  for (const n of allFoundingNames()) {
    if (out.some(e => e.id.endsWith(`:${n.slug}`))) continue
    push({
      id: `founding:${n.slug}`,
      title: n.display,
      group: 'People',
      href: `/indigenes/founding/${n.slug}`,
      excerpt: clip([n.role, n.chapter].filter(Boolean).join(' · ')),
      keywords: (n.aliases || []) as string[],
      weight: 2,
    })
  }
  for (const p of getAllNotables()) {
    const rec = p as unknown as { name?: string; title?: string; origin?: string; bio?: string }
    push({
      id: `notable:${p.slug}`,
      title: rec.name || p.slug,
      group: 'People',
      href: `/notables/${p.slug}`,
      excerpt: clip([rec.title, rec.origin].filter(Boolean).join(' · ') || strip(rec.bio)),
      keywords: ['notable', 'son of guneku', 'daughter of guneku'],
      weight: 2,
    })
  }

  /* ── Places: the 27 quarters, and the located places ── */
  for (const q of allQuarters()) {
    push({
      id: `quarter:${q.slug}`,
      title: q.name,
      group: 'Places',
      href: `/quarters/${q.slug}`,
      excerpt: q.links.length
        ? `A quarter of Guneku — ${q.links.length} ${q.links.length === 1 ? 'record' : 'records'} in the archive`
        : 'A quarter of Guneku — nothing recorded in the archive yet',
      keywords: ['quarter', 'quarters'],
      weight: q.links.length ? 3 : 1,
    })
  }
  for (const l of allLocations()) {
    if (l.type === 'village') continue
    push({
      id: `place:${l.id}`,
      title: l.name,
      group: 'Places',
      href: l.publicUrl,
      excerpt: clip(l.description),
      keywords: [l.type, l.quarter || ''].filter(Boolean) as string[],
      weight: 2,
    })
  }

  /* ── Palace & history ── */
  for (const a of getAllPalaceArticles()) {
    if (!a.publishedAt) continue
    push({
      id: `palace:${a.slug}`,
      title: a.title,
      group: 'Palace & history',
      href: `/palace/${a.slug}`,
      excerpt: clip(strip(a.body)),
      keywords: ['palace', 'fon', 'hrh'],
      weight: 3,
    })
  }
  for (const a of getAllKingdomArticles()) {
    /* The six empty stubs carry noindex and stay out: a search result that leads to an
       empty page is worse than no result. */
    if ((a as unknown as { noindex?: boolean }).noindex) continue
    push({
      id: `kingdom:${a.slug}`,
      title: a.title,
      group: 'Palace & history',
      href: `/kingdom/${a.slug}`,
      excerpt: clip(strip(a.body)),
      keywords: ['kingdom', 'village', 'history'],
      weight: 3,
    })
  }

  /* ── Projects: the development register ── */
  type Dev = { name: string; description: string; href: string; status?: string; class?: string }
  for (const d of current.development as Dev[]) {
    push({
      id: `project:${d.name}`,
      title: d.name,
      group: 'Projects',
      href: d.href,
      excerpt: clip([d.status, d.description].filter(Boolean).join(' — ')),
      keywords: [d.class || '', 'project', 'development'].filter(Boolean),
      weight: 3,
    })
  }

  /* ── Institutions ── */
  for (const i of getAllInstitutions()) {
    /* `hold` is the Business Directory, held pending separate approval. It is the only
       institution excluded. */
    if (i.publicVisibility === 'hold') continue

    /* Nine records carry a `route` because their content lives on another page — the Afor
       Foundation on /education, GUYODECA on /gudeca/guyodeca, and so on. They were briefly
       excluded here, which meant searching "Afor Foundation" found nothing at all. They are
       real institutions people search by name, so they are indexed and pointed at the page
       that actually holds them. */
    const href = typeof i.route === 'string' ? i.route : `/institutions/${i.id}`

    push({
      id: `institution:${i.id}`,
      title: i.name,
      group: 'Institutions',
      href,
      excerpt: clip(strip(i.description)),
      keywords: [i.category || '', 'institution'].filter(Boolean) as string[],
      weight: 3,
    })
  }

  /* ── News & records ── */
  for (const u of getAllUpdates()) {
    /* An update with no publishedAt is not published. The loader does not filter these,
       so the filter lives here. */
    if (!u.publishedAt) continue
    push({
      id: `update:${u.slug}`,
      title: u.title,
      group: 'News & records',
      href: `/updates/${u.slug}`,
      excerpt: clip(u.excerpt || strip(u.body)),
      keywords: ['news', 'update', 'record', new Date(u.publishedAt).getFullYear().toString()],
      weight: 2,
    })
  }

  /* ── Photos: albums, never individual held files ── */
  for (const album of getImageGallery()?.albums || []) {
    const a = album as unknown as { id: string; title?: string; images?: unknown[] }
    push({
      id: `album:${a.id}`,
      title: a.title || a.id,
      group: 'Photos',
      href: `/gallery/images/${a.id}`,
      excerpt: `${(a.images || []).length} photographs in the Guneku archive`,
      keywords: ['photograph', 'photographs', 'album', 'gallery', 'archive'],
      weight: 2,
    })
  }

  /* ── Films: the approved corpus only ── */
  type Vid = {
    youtubeId?: string
    /** The curated title. Present on all 46; `title` is null on most of them, which is why
     *  this is the one read first — reading `title` alone indexed 2 films out of 46. */
    displayTitle?: string
    title?: string | null
    category?: string
    context?: string
    relatedRoute?: string | null
  }
  for (const v of (videoGallery.dbVideos || []) as Vid[]) {
    const title = v.displayTitle || v.title
    if (!title) continue
    push({
      id: `film:${v.youtubeId || title}`,
      title,
      group: 'Films',
      /* There is no per-film route, so a result lands on the film archive. `relatedRoute`
         points at the record a film documents, not at the film, so it is offered as a
         keyword rather than as the destination. */
      href: '/gallery/videos',
      excerpt: clip(v.context || 'A film from the Guneku Fondom channel'),
      keywords: ['film', 'video', 'watch', v.category || '', v.relatedRoute || ''].filter(Boolean),
      weight: 1,
    })
  }

  /* ── The site's own pages ──
     Without these, a reader who types what they want to reach — "map", "the quarters",
     "the gallery" — finds records that mention it but never the page that is it. */
  const PAGES: Array<[string, string, SearchGroup, string, string[]]> = [
    ['/explore', 'Explore Guneku — the map', 'Places',
      'The places of Guneku, mapped where a position is recorded and listed where it is not.',
      ['map', 'maps', 'location', 'locations', 'where', 'geography', 'explore']],
    ['/quarters', 'The twenty-seven quarters', 'Places',
      'Every quarter of Guneku, with what the archive holds about each.',
      ['quarter', 'quarters', '27', 'twenty-seven']],
    ['/projects', 'The development register', 'Projects',
      'Every project and institution at the stage its own sources establish.',
      ['projects', 'development', 'register', 'work']],
    ['/people', 'The bodies of Guneku', 'People',
      'The Traditional Council, GUDECA’s executives, the Michi Əbeŋ committee and the Palace household.',
      ['people', 'office', 'officers', 'holders', 'council', 'bodies']],
    ['/indigenes', 'The indigenes register', 'People',
      'Guneku sons and daughters worldwide, searchable by name and by quarter.',
      ['indigenes', 'directory', 'register', 'diaspora', 'members']],
    ['/gallery/images', 'The image gallery', 'Photos',
      'Fifteen albums of photographs from the Guneku archive.',
      ['photographs', 'photos', 'pictures', 'gallery', 'images', 'album', 'albums']],
    ['/gallery/videos', 'Guneku films', 'Films',
      'Films from the Fondom’s own channel.',
      ['films', 'videos', 'watch', 'guneku tv', 'television', 'channel']],
    ['/gudeca', 'GUDECA', 'Institutions',
      'The Guneku Development and Cultural Association and its chapters.',
      ['gudeca', 'chapters', 'association', 'diaspora']],
    ['/education', 'Education in Guneku', 'Institutions',
      'Schools, scholarships and the education record.',
      ['education', 'school', 'schools', 'scholarship', 'students']],
    ['/support', 'Support a Guneku project', 'Projects',
      'Offer funds, materials, expertise, volunteering or partnership. No payment is taken on this site.',
      ['support', 'donate', 'donation', 'help', 'give', 'contribute', 'fund']],
    ['/contact', 'Contact the Palace', 'Palace & history',
      'How to reach the Guneku Palace.',
      ['contact', 'reach', 'message', 'email', 'telephone', 'write']],
  ]
  for (const [href, title, group, excerpt, keywords] of PAGES) {
    push({ id: `page:${href}`, title, group, href, excerpt, keywords, weight: 5 })
  }

  /* ── Questions: the published FAQ ── */
  type Faq = { q: string; a: string; href?: string }
  for (const f of (villageFacts.faq || []) as Faq[]) {
    push({
      id: `faq:${f.q}`,
      title: f.q,
      group: 'Questions',
      href: f.href || '/',
      excerpt: clip(f.a),
      keywords: ['question', 'faq'],
      weight: 1,
    })
  }

  return out
}

const INDEX = build()

export function indexSize() {
  return INDEX.length
}

export function indexBreakdown(): Array<{ group: SearchGroup; count: number }> {
  return GROUP_ORDER
    .map(group => ({ group, count: INDEX.filter(e => e.group === group).length }))
    .filter(g => g.count > 0)
}

const STOP = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'is', 'are'])

function terms(q: string): string[] {
  return q.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/)
    .filter(t => t.length > 1 && !STOP.has(t))
}

function scoreEntry(e: SearchEntry, q: string, ts: string[]): number {
  const title = e.title.toLowerCase()
  const excerpt = e.excerpt.toLowerCase()
  const keys = e.keywords.map(k => k.toLowerCase()).join(' ')

  let s = 0
  if (title === q) s += 60
  else if (title.startsWith(q)) s += 40
  else if (title.includes(q)) s += 28

  for (const t of ts) {
    if (title.includes(t)) s += 10
    else if (keys.includes(t)) s += 5
    else if (excerpt.includes(t)) s += 3
  }

  /* Every term must land somewhere, or the entry is not a result at all. Halving the score
     instead was not enough: "map of guneku" returned 159 rows, because "guneku" alone
     matches most of the archive. A query is a sentence the reader means, not a bag of words
     to be partially satisfied. */
  if (ts.length > 1) {
    const missed = ts.some(t => !title.includes(t) && !keys.includes(t) && !excerpt.includes(t))
    if (missed) return 0
  }

  return s > 0 ? s + e.weight : 0
}

export type SearchResults = {
  query: string
  total: number
  groups: Array<{ group: SearchGroup; results: SearchEntry[] }>
}

/** Deterministic search. The same query always returns the same results in the same order. */
export function search(rawQuery: string, perGroup = 8): SearchResults {
  const q = rawQuery.toLowerCase().trim()
  const ts = terms(q)

  if (q.length < 2) return { query: rawQuery, total: 0, groups: [] }

  const scored = INDEX
    .map(e => ({ e, s: scoreEntry(e, q, ts) }))
    .filter(r => r.s > 0)
    /* Score, then title, so ties are stable rather than dependent on index order. */
    .sort((a, b) => b.s - a.s || a.e.title.localeCompare(b.e.title))

  const groups = GROUP_ORDER
    .map(group => ({ group, results: scored.filter(r => r.e.group === group).slice(0, perGroup).map(r => r.e) }))
    .filter(g => g.results.length > 0)

  return { query: rawQuery, total: scored.length, groups }
}
