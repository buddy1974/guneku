import gallery from '@/data/gallery/video-gallery.json'
import overridesDoc from '@/data/gallery/video-overrides.json'

/* Guneku TV — the one place a film becomes public.
 *
 * Every public surface goes through `approvedFilms()`: the watch hub, the homepage
 * selection, the search index, the sitemap and the structured data. There is deliberately no
 * second path to a film, because the moment there are two, one of them forgets an exclusion.
 *
 * ── The lifecycle, and why it has four states rather than a boolean ───────────────────────
 *
 *   discovered  a video exists on the channel. That is all it means. It is not a record of
 *               Guneku and it is not public.
 *   reviewed    a person has looked at it and knows what it shows.
 *   approved    the Fondom publishes it. Only this state reaches the public.
 *   held        deliberately not surfaced, and the reason is written down.
 *
 * A newly discovered upload must never become an approved historical record merely because
 * it appeared on the channel. The channel is where films are hosted; the archive is what the
 * Fondom asserts about its own history. A sync can add to `discovered`. Nothing but a human
 * moves anything to `approved`.
 *
 * ── What is excluded, by name and by rule ────────────────────────────────────────────────
 *
 *   `2jS-ael4Ccg` is private on the channel and is deny-listed here explicitly, so no future
 *   synchronisation can pull it in by accident. The record's own note says it is "deliberately
 *   not surfaced"; this is that decision expressed as code rather than as a sentence.
 *
 *   The nine Bonn WhatsApp originals are a different thing entirely and are not films in this
 *   library at all. They are uncatalogued `.mp4` files under
 *   `public/images/gallery/visit-to-fons-palace-by-eu-residents/`, held because their speakers
 *   and subjects are unconfirmed (R-007). Nothing here references them. The ten Bonn entries
 *   that ARE in this library are the films the Fondom published on its own YouTube channel —
 *   a distinction the source record draws itself, and one worth not blurring.
 */

/** Deny-listed for good. A future sync sees these and skips them. */
const DENIED_YOUTUBE_IDS = new Set<string>([
  '2jS-ael4Ccg', // private on the channel; the record says deliberately not surfaced
])

export type FilmState = 'discovered' | 'reviewed' | 'approved' | 'held'

/** The six coarse groups. `null` where the record does not support one — a film is never
 *  pushed into a group to make the set look complete. */
export type FilmGroup = 'Palace' | 'Culture' | 'Development' | 'GUDECA' | 'Community' | 'Archive'

export const FILM_GROUPS: FilmGroup[] = [
  'Palace', 'Culture', 'Development', 'GUDECA', 'Community', 'Archive',
]

export type Film = {
  youtubeId: string
  youtubeUrl: string
  /** The title the site shows. Curated; present on all 46. */
  displayTitle: string
  /** The channel's own published title, ONLY where this archive verified it against YouTube.
   *  Null on 44 of 46, and null must render as no claim rather than as a guess. */
  publishedTitle: string | null
  titleVerified: boolean
  thumb: string | null
  /** The fine-grained sourced label, e.g. "GUDECA Europe, Bonn 2026". Authoritative. */
  category: string
  /** The coarse group, resolved from `category`. Null when the source does not support one. */
  group: FilmGroup | null
  context: string | null
  relatedRoute: string | null
  ordering: number
  state: FilmState
  featured: boolean
  highlight: boolean
  /** True when an editorial override changed something about this film. */
  overridden: boolean
}

type RawFilm = {
  youtubeId?: string
  youtubeUrl?: string
  displayTitle?: string
  title?: string | null
  titleVerified?: boolean
  thumb?: string | null
  category?: string
  context?: string | null
  relatedRoute?: string | null
  ordering?: number | string
  state?: number | string
}

type Override = Partial<{
  displayTitle: string
  group: FilmGroup
  category: string
  context: string
  relatedRoute: string
  ordering: number
  featured: boolean
  highlight: boolean
  state: 'approved' | 'held'
}>

const OVERRIDES = (overridesDoc.overrides || {}) as Record<string, Override>

/* ── Category resolution ──────────────────────────────────────────────────────────────────
 *
 * Deterministic, ordered, and applied to the record's own `category` string. No model
 * classifies a film: a misfiled film is a small error, but a model deciding that a funeral is
 * a festival is a different kind of mistake, and on a village's own record it is not
 * recoverable by an apology.
 *
 * Rules run in order and the first match wins:
 *
 *   1. an explicit `group` override                    -> that group
 *   2. category mentions GUDECA                        -> GUDECA
 *   3. category mentions Palace                        -> Palace
 *   4. category mentions culture, or Mɨchi Ǝbeŋ        -> Culture
 *   5. category is exactly Community                   -> Community
 *   6. anything else                                   -> null
 *
 * Rule 2 precedes rule 3 on purpose: "GUDECA Europe, Bonn 2026" is a chapter's meeting, not
 * a Palace occasion, even where the Fon attends.
 *
 * Health, Governance and Education are the categories that reach rule 6 today. None of the
 * six groups fits them: "Development" would be an invention about what a health documentary
 * is, and "Archive" would say something false about when it was made. They keep their own
 * sourced label, which is more useful to a reader anyway, and the coarse group stays empty
 * until the Palace says otherwise. Development and Archive therefore have no films yet, and
 * showing them as empty is the honest result rather than a gap to be filled.
 */
export function resolveGroup(category: string, override?: FilmGroup): FilmGroup | null {
  if (override) return override
  const c = category.toLowerCase()
  if (c.includes('gudeca')) return 'GUDECA'
  if (c.includes('palace')) return 'Palace'
  if (c.includes('culture') || c.includes('mɨchi') || c.includes('əbeŋ') || c.includes('ǝbeŋ')) return 'Culture'
  if (c.trim() === 'community') return 'Community'
  return null
}

function normalise(raw: RawFilm): Film | null {
  const youtubeId = (raw.youtubeId || '').trim()
  if (!youtubeId) return null

  const o = OVERRIDES[youtubeId] || {}

  /* The source record's `state` is 1 for every one of the 46, meaning published. An override
     may hold a film; nothing may approve one that the source did not carry. */
  const sourceApproved = String(raw.state) === '1'
  const state: FilmState =
    o.state === 'held' ? 'held'
    : sourceApproved ? 'approved'
    : 'reviewed'

  const category = o.category || raw.category || 'Archive'

  return {
    youtubeId,
    youtubeUrl: raw.youtubeUrl || `https://youtu.be/${youtubeId}`,
    displayTitle: o.displayTitle || raw.displayTitle || '',
    /* Only assert the channel's title where the archive verified it. */
    publishedTitle: raw.titleVerified && raw.title ? raw.title : null,
    titleVerified: Boolean(raw.titleVerified),
    thumb: raw.thumb || null,
    category,
    group: resolveGroup(category, o.group),
    context: o.context ?? raw.context ?? null,
    relatedRoute: o.relatedRoute ?? raw.relatedRoute ?? null,
    ordering: Number(o.ordering ?? raw.ordering ?? 9999),
    state,
    featured: Boolean(o.featured),
    highlight: Boolean(o.highlight),
    overridden: Object.keys(o).length > 0,
  }
}

/** Every film in the library, whatever its state. Not for public rendering. */
export function allFilms(): Film[] {
  return (gallery.dbVideos as RawFilm[])
    .map(normalise)
    .filter((f): f is Film => f !== null)
    .sort((a, b) => a.ordering - b.ordering)
}

/** The approval predicate. The only way a film becomes public.
 *
 *  Conservative by construction: a film must be positively approved, carry a title and an id,
 *  and not be deny-listed. Anything uncertain — a missing title, an unexpected state, an id on
 *  the deny list — is not public. */
export function approvedFilms(): Film[] {
  return allFilms().filter(f =>
    f.state === 'approved' &&
    f.displayTitle.length > 0 &&
    !DENIED_YOUTUBE_IDS.has(f.youtubeId),
  )
}

export function heldFilms(): Film[] {
  return allFilms().filter(f => f.state === 'held')
}

/** True when this id must never be surfaced, whatever else says otherwise. Exported so a
 *  future sync adapter can ask before it writes anything. */
export function isDenied(youtubeId: string): boolean {
  return DENIED_YOUTUBE_IDS.has(youtubeId)
}

export function deniedCount(): number {
  return DENIED_YOUTUBE_IDS.size
}

/** The featured film: an explicit override first, then the record's own `featuredVideoId`,
 *  then the first by ordering. Always an approved film or nothing. */
export function featuredFilm(): Film | null {
  const approved = approvedFilms()
  const explicit = approved.find(f => f.featured)
  if (explicit) return explicit

  const fromRecord = approved.find(f => f.youtubeId === gallery.featuredVideoId)
  return fromRecord || approved[0] || null
}

/** The editorial selection for the homepage. `highlight` overrides first; otherwise the
 *  first few by ordering, excluding whatever is already featured. */
export function highlightFilms(limit = 4): Film[] {
  const approved = approvedFilms()
  const chosen = approved.filter(f => f.highlight)
  if (chosen.length > 0) return chosen.slice(0, limit)

  const featured = featuredFilm()
  return approved.filter(f => f.youtubeId !== featured?.youtubeId).slice(0, limit)
}

/** The sourced categories present among approved films, with counts. These are the filter
 *  facets — the record's own labels, not a scheme invented for the page. */
export function categoryFacets(): Array<{ category: string; count: number }> {
  const counts = new Map<string, number>()
  for (const f of approvedFilms()) counts.set(f.category, (counts.get(f.category) || 0) + 1)
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))
}

export function groupFacets(): Array<{ group: FilmGroup; count: number }> {
  const approved = approvedFilms()
  return FILM_GROUPS
    .map(group => ({ group, count: approved.filter(f => f.group === group).length }))
}

export type FilmQuery = {
  category?: string
  group?: string
  q?: string
  page?: number
  perPage?: number
}

export type FilmPage = {
  films: Film[]
  total: number
  page: number
  pages: number
  perPage: number
}

/** Filter, search and paginate over approved films only. Deterministic string matching —
 *  the same query always returns the same films in the same order, and no model is involved.
 *  This is not a second search engine: the unified index in search-index.ts reads the same
 *  `approvedFilms()`, so the two can never disagree about what exists. */
export function queryFilms(query: FilmQuery = {}): FilmPage {
  const perPage = Math.min(Math.max(query.perPage ?? 12, 1), 48)
  let films = approvedFilms()

  if (query.category) {
    films = films.filter(f => f.category === query.category)
  }
  if (query.group && (FILM_GROUPS as string[]).includes(query.group)) {
    films = films.filter(f => f.group === query.group)
  }
  if (query.q && query.q.trim().length >= 2) {
    const terms = query.q.toLowerCase().split(/\s+/).filter(t => t.length > 1)
    films = films.filter(f => {
      const hay = [f.displayTitle, f.category, f.context || '', f.publishedTitle || '']
        .join(' ').toLowerCase()
      /* Every term must land, matching the unified search's rule. */
      return terms.every(t => hay.includes(t))
    })
  }

  const total = films.length
  const pages = Math.max(Math.ceil(total / perPage), 1)
  const page = Math.min(Math.max(query.page ?? 1, 1), pages)

  return {
    films: films.slice((page - 1) * perPage, page * perPage),
    total, page, pages, perPage,
  }
}

export function getFilm(youtubeId: string): Film | null {
  return approvedFilms().find(f => f.youtubeId === youtubeId) || null
}

/** The channel, for a link out. Never a Studio or admin URL. */
export function channel() {
  return {
    id: gallery.youtubeChannelId as string,
    url: gallery.channelUrl as string,
    title: gallery.channelTitle as string,
  }
}

/** The record's note on material held back. Rendered on the hub, because a reader deserves
 *  to know the archive holds more than it shows and why.
 *
 *  The note is redacted before it leaves this function. Its source text names the private
 *  channel upload by id — the previous /gallery/videos page published that id verbatim — and
 *  printing the identifier of something deliberately not surfaced hands a reader the one
 *  thing the decision was meant to withhold. The transparency is kept; the id is not.
 *
 *  The deny list in this module remains the enforcement. This only stops the id being
 *  *published*; `DENIED_YOUTUBE_IDS` is what stops the film being *served*. */
export function heldNote(): string | null {
  const raw = (gallery.pendingVideos as string) || null
  if (!raw) return null

  let note = raw
  for (const id of DENIED_YOUTUBE_IDS) {
    /* Take the surrounding punctuation with the id, so "One video on the channel, <id>, is
       private" reads "One video on the channel is private" rather than leaving a stray comma
       where the identifier used to be. Note the doubled backslashes: inside a template
       literal `\s` collapses to a bare `s`, which silently produces a regex that matches
       nothing. */
    note = note
      .replace(new RegExp(`,\\s*${id}\\s*,`, 'g'), '')
      .replace(new RegExp(`\\(\\s*${id}\\s*\\)`, 'g'), '')
      .replace(new RegExp(`\\s*${id}\\s*`, 'g'), ' ')
  }
  return note.replace(/\s{2,}/g, ' ').replace(/\s+([.,;])/g, '$1').trim()
}

export function librarySourceNote(): string | null {
  return (gallery.sourceNote as string) || null
}
