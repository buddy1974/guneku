import doc from '@/data/businesses/businesses.json'
import { getFoundingName } from './community'
import { identityIndex } from './identity-index'

/* The Guneku Business Directory — what a business is, and what may be published about it.
 *
 * ── Two stores, one directory, and why ───────────────────────────────────────────────────
 *
 * The register already works this way and this follows it rather than inventing a second
 * arrangement. `/indigenes` renders the reviewed names in `founding-names.json` alongside the
 * profiles members create for themselves in Neon; a reader sees one directory, and the two
 * halves have different authorities behind them.
 *
 * Businesses are the same shape of problem:
 *
 *   CURATED     the businesses the Fondom has recorded and confirmed — MaxPromo, Fondom
 *               Studios, Midas. Reviewed content, in JSON, in git, changed by a person in a
 *               commit. They render statically and need no database to be read.
 *   REGISTERED  what a verified son or daughter of Guneku enters about their own business.
 *               User-generated, owner-managed, and therefore in Neon where it can be edited.
 *
 * `allBusinesses()` merges them for the public surfaces. Everything in this module is pure
 * and reads the curated half only; the database half arrives through `src/lib/db/businesses.ts`
 * and is folded in by the page, so a page renders with or without a database.
 *
 * ── A business is not a person ───────────────────────────────────────────────────────────
 *
 * A business record carries no biography. It points at a canonical person by slug and stops,
 * exactly as a profile claim points at a register slug and stops. The person's name, standing
 * and history stay in the register, which this module reads and never writes.
 *
 * And a person is attached only where somebody established the relationship. Where the
 * Fondom has confirmed a business but not yet confirmed who in the register its owner is, the
 * relationship is HELD: the name is recorded as text, no slug is invented, and the public page
 * says the connection is not yet confirmed. A shared surname has never established anything
 * here and does not start with businesses.
 *
 * ── A business address is not a residence ────────────────────────────────────────────────
 *
 * The register publishes a country against a person and never a town (ADR-082). A business
 * publishes its own public address, town and street included, because that address belongs to
 * the business and is already public. The two never cross: nothing here writes to the
 * register, and no business address is ever read back as somebody's home. */

/* ── Categories ───────────────────────────────────────────────────────────────────────────
 *
 * A closed list, because an open one fragments a directory in a fortnight: "Media", "media",
 * "Media & Film" and "Creative" become four filters holding one business each. A business has
 * exactly one primary category and as many tags as are useful — the narrow specialism goes in
 * a tag, never in a new category. */

export const BUSINESS_CATEGORIES = [
  'technology-digital',
  'property-real-estate',
  'media-creative',
  'health-care',
  'medical-practice',
  'laboratory-diagnostics',
  'agriculture-aquaculture',
  'retail-commerce',
  'construction-trades',
  'professional-services',
] as const

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number]

export const CATEGORY_LABEL: Record<BusinessCategory, string> = {
  'technology-digital':      'Technology & Digital',
  'property-real-estate':    'Property & Real Estate',
  'media-creative':          'Media & Creative',
  'health-care':             'Health & Care Services',
  'medical-practice':        'Medical Practice',
  'laboratory-diagnostics':  'Laboratory & Diagnostics',
  'agriculture-aquaculture': 'Agriculture & Aquaculture',
  'retail-commerce':         'Retail & Commerce',
  'construction-trades':     'Construction & Trades',
  'professional-services':   'Professional Services',
}

export function isBusinessCategory(v: unknown): v is BusinessCategory {
  return typeof v === 'string' && (BUSINESS_CATEGORIES as readonly string[]).includes(v)
}

/* ── Relationships ────────────────────────────────────────────────────────────────────────
 *
 * Not everybody is an owner, and calling them all one would misdescribe most of them. A
 * physician in a practice is not its proprietor; a managing director is not necessarily a
 * shareholder; an operator runs something somebody else may own. The word used is the word
 * the evidence supports. */

export const BUSINESS_RELATIONSHIPS = [
  'owner', 'founder', 'co-founder', 'director', 'managing-director',
  'operator', 'practitioner', 'physician', 'associated',
] as const

export type BusinessRelationship = (typeof BUSINESS_RELATIONSHIPS)[number]

export const RELATIONSHIP_LABEL: Record<BusinessRelationship, string> = {
  'owner':             'Owner',
  'founder':           'Founder',
  'co-founder':        'Co-founder',
  'director':          'Director',
  'managing-director': 'Managing Director',
  'operator':          'Operator',
  'practitioner':      'Practitioner',
  'physician':         'Physician',
  'associated':        'Associated with Guneku',
}

export function isBusinessRelationship(v: unknown): v is BusinessRelationship {
  return typeof v === 'string' && (BUSINESS_RELATIONSHIPS as readonly string[]).includes(v)
}

/* ── Publication ──────────────────────────────────────────────────────────────────────────
 *
 * The same vocabulary the institution records already use, extended with the two states a
 * user-entered record needs. `held` is the word this repository uses for "kept, not shown"
 * (ADR-005) and it is kept rather than renamed to something tidier. */

export const BUSINESS_STATUSES = ['draft', 'pending', 'public', 'held', 'archived'] as const
export type BusinessStatus = (typeof BUSINESS_STATUSES)[number]

export function isBusinessStatus(v: unknown): v is BusinessStatus {
  return typeof v === 'string' && (BUSINESS_STATUSES as readonly string[]).includes(v)
}

/** The one state a stranger may see. Everything else is the Fondom's or the owner's. */
export function isPublicBusiness(b: { status: BusinessStatus }): boolean {
  return b.status === 'public'
}

/* ── The record ───────────────────────────────────────────────────────────────────────── */

export type BusinessPerson = {
  /** A canonical register slug, or the Fon's profile id. Absent when the relationship is
   *  recorded but the person has not been reconciled — see `heldName`. */
  personSlug?: string
  /** The name as the Fondom supplied it, used ONLY where `personSlug` is absent. Recording a
   *  name is not the same as claiming it is somebody in the register. */
  heldName?: string
  relationship: BusinessRelationship
  /** Why this relationship is recorded. Rendered, so a reader can see the basis. */
  evidence: string
}

export type BusinessLocation = {
  country: string
  city?: string
  /** The public business address. A business may publish a street; a person may not. */
  address?: string
}

export type BusinessVideo = {
  /** An eleven-character YouTube id, never a URL and never markup. */
  videoId: string
  title?: string
}

export type BusinessLinks = {
  website?: string
  facebook?: string
  instagram?: string
  linkedin?: string
  youtube?: string
}

/** Contact the OWNER has elected to publish. Never copied from a person's own record. */
export type BusinessContact = {
  phone?: string
  email?: string
}

export type Business = {
  slug: string
  name: string
  /** Also-known-as, so a search for the other brand reaches the same business. */
  aliases?: string[]
  tagline?: string
  description?: string
  category: BusinessCategory
  tags?: string[]
  status: BusinessStatus
  location?: BusinessLocation
  /** Additional places the business trades from. A branch is not a second business. */
  otherLocations?: BusinessLocation[]
  serviceAreas?: string[]
  services?: string[]
  links?: BusinessLinks
  contact?: BusinessContact
  logo?: string
  cover?: string
  gallery?: string[]
  videos?: BusinessVideo[]
  people?: BusinessPerson[]
  /** Where this record came from, and what is not established. Rendered on the page. */
  sourceNote?: string
  /** Why a record is held, when it is. */
  holdReason?: string
  /** Set on records that came from Neon, so a surface can tell the two halves apart. */
  registered?: boolean
  updatedAt?: string
}

const CURATED = (doc.businesses as Business[])

/** Every curated business, whatever its status. Reviewer surfaces only. */
export function curatedBusinesses(): Business[] {
  return CURATED
}

/** The curated businesses a stranger may see. */
export function publicCuratedBusinesses(): Business[] {
  return CURATED.filter(isPublicBusiness)
}

export function getCuratedBusiness(slug: string): Business | null {
  return CURATED.find(b => b.slug === slug) ?? null
}

/** Merge the curated half with whatever the database supplied, newest content first but
 *  curated records ahead of registered ones, and never two records under one slug. A curated
 *  record wins a collision: it is the reviewed one. */
export function mergeBusinesses(curated: Business[], registered: Business[]): Business[] {
  const seen = new Set(curated.map(b => b.slug))
  return [...curated, ...registered.filter(b => !seen.has(b.slug))]
}

/* ── Discovery ────────────────────────────────────────────────────────────────────────── */

export type BusinessFilters = {
  q?: string
  category?: string
  country?: string
}

/** Lowercase, strip punctuation, collapse spaces. The same shape of normalisation the
 *  identity index uses, so "Midas Property" and "midas  property!" find the same business. */
function norm(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

/** The text a search looks at. Name, aliases, tagline, category, tags, services and place —
 *  never a person's name, because a directory of businesses should not become a way of
 *  searching for people by the businesses they are attached to. */
function haystack(b: Business): string {
  return norm([
    b.name,
    ...(b.aliases ?? []),
    b.tagline ?? '',
    CATEGORY_LABEL[b.category],
    ...(b.tags ?? []),
    ...(b.services ?? []),
    b.location?.city ?? '',
    b.location?.country ?? '',
    ...(b.serviceAreas ?? []),
  ].join(' '))
}

export function filterBusinesses(all: Business[], f: BusinessFilters): Business[] {
  const terms = f.q ? norm(f.q).split(' ').filter(Boolean) : []
  return all.filter(b => {
    if (f.category && b.category !== f.category) return false
    if (f.country && (b.location?.country ?? '') !== f.country) return false
    if (terms.length === 0) return true
    const hay = haystack(b)
    return terms.every(t => hay.includes(t))
  })
}

/** The categories actually present, with counts, in the register's own order. Never a
 *  category with nothing in it: an empty filter is a dead end dressed as a choice. */
export function categoriesPresent(all: Business[]): Array<{
  category: BusinessCategory; label: string; count: number
}> {
  return BUSINESS_CATEGORIES
    .map(category => ({
      category,
      label: CATEGORY_LABEL[category],
      count: all.filter(b => b.category === category).length,
    }))
    .filter(c => c.count > 0)
}

/** The countries actually present, alphabetically. */
export function countriesPresent(all: Business[]): Array<{ country: string; count: number }> {
  const counts = new Map<string, number>()
  for (const b of all) {
    const c = b.location?.country
    if (c) counts.set(c, (counts.get(c) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => a.country.localeCompare(b.country))
}

/** Businesses to show beside one, by category first and place second. Never itself. */
export function relatedBusinesses(all: Business[], b: Business, limit = 3): Business[] {
  const others = all.filter(x => x.slug !== b.slug)
  const sameCategory = others.filter(x => x.category === b.category)
  const samePlace = others.filter(x =>
    x.category !== b.category && x.location?.country === b.location?.country)
  return [...sameCategory, ...samePlace].slice(0, limit)
}

/* ── People on a business ─────────────────────────────────────────────────────────────── */

export type ResolvedBusinessPerson = {
  relationship: BusinessRelationship
  relationshipLabel: string
  evidence: string
  /** The display name to render: the register's, or the held name as supplied. */
  display: string
  /** Where to send a reader. Null when the person is not reconciled. */
  href: string | null
  /** True when no canonical identity has been established for this name yet. */
  held: boolean
}

/** Resolve a business's people against the register, and say plainly when one is not there.
 *
 *  A `personSlug` that does not resolve is treated as HELD rather than rendered as a broken
 *  link — a slug can only stop resolving if somebody removed or renamed a register entry, and
 *  a business page is not the place to discover that. */
export function resolveBusinessPeople(b: Business): ResolvedBusinessPerson[] {
  return (b.people ?? []).map(p => {
    const base = {
      relationship: p.relationship,
      relationshipLabel: RELATIONSHIP_LABEL[p.relationship],
      evidence: p.evidence,
    }

    if (p.personSlug) {
      const person = getFoundingName(p.personSlug)
      if (person) {
        return { ...base, display: person.display, href: `/indigenes/founding/${person.slug}`, held: false }
      }
      /* Not in the register. It may be the Fon, who has his own record and is in the identity
         index but never in the register. */
      const identity = identityIndex().find(i => i.id === p.personSlug)
      if (identity) {
        return { ...base, display: identity.display, href: identity.href, held: false }
      }
    }

    return {
      ...base,
      display: p.heldName ?? 'Not yet confirmed',
      href: null,
      held: true,
    }
  })
}

/* ── Slugs ────────────────────────────────────────────────────────────────────────────────
 *
 * A published business URL is a link somebody may have written down, so a slug is fixed at
 * creation and does NOT follow the name afterwards. Renaming a business changes the heading
 * on its page and nothing else — the same reasoning that kept `fabian` when that entry's
 * display name was corrected (ADR-087). */

export function businessSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

/** A slug nothing else is using. Collisions are resolved by counting up, because two people
 *  may legitimately run businesses of the same name and neither may take the other's URL. */
export function uniqueBusinessSlug(name: string, taken: Iterable<string>): string {
  const base = businessSlug(name) || 'business'
  const used = new Set(taken)
  if (!used.has(base)) return base
  for (let n = 2; n < 500; n++) {
    const candidate = `${base}-${n}`
    if (!used.has(candidate)) return candidate
  }
  throw new Error('Could not allocate a business slug.')
}

/* ── YouTube ──────────────────────────────────────────────────────────────────────────────
 *
 * A video is stored as an eleven-character id and nothing else. Never a URL, never an iframe,
 * never anything a contributor typed that a browser might execute.
 *
 * The embed is built from the id by our own code, so the only thing a contributor controls is
 * which video plays. `youtube-nocookie.com` is used because a village directory has no reason
 * to set an advertising cookie on a reader who only scrolled past a video. */

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

const YOUTUBE_HOSTS = new Set([
  'youtube.com', 'www.youtube.com', 'm.youtube.com',
  'youtu.be', 'www.youtu.be', 'music.youtube.com',
])

/** The video id in a YouTube link, or null. Accepts the four forms people actually paste and
 *  refuses everything else, including a bare id — a bare id is indistinguishable from a typo
 *  and accepting one would let an empty-looking field become a working embed. */
export function youtubeIdFrom(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const raw = input.trim()
  if (!raw) return null

  let url: URL
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
  } catch {
    return null
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return null

  const path = url.pathname.replace(/^\/+/, '')

  /* youtu.be/<id> */
  if (url.hostname.toLowerCase().endsWith('youtu.be')) {
    const id = path.split('/')[0]
    return YOUTUBE_ID.test(id) ? id : null
  }

  /* youtube.com/watch?v=<id> */
  if (path === 'watch') {
    const id = url.searchParams.get('v') ?? ''
    return YOUTUBE_ID.test(id) ? id : null
  }

  /* youtube.com/shorts/<id>, /embed/<id>, /live/<id>, /v/<id> */
  const m = /^(?:shorts|embed|live|v)\/([^/?#]+)/.exec(path)
  if (m && YOUTUBE_ID.test(m[1])) return m[1]

  return null
}

export function youtubeEmbedUrl(videoId: string): string {
  if (!YOUTUBE_ID.test(videoId)) throw new Error('Refusing to embed a malformed video id.')
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}

export function youtubeThumbnail(videoId: string): string {
  if (!YOUTUBE_ID.test(videoId)) throw new Error('Refusing to build a malformed thumbnail.')
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

export function isYoutubeId(v: unknown): v is string {
  return typeof v === 'string' && YOUTUBE_ID.test(v)
}

/* ── Links ────────────────────────────────────────────────────────────────────────────────
 *
 * Every outbound link a contributor supplies is parsed before it is stored, and only http and
 * https survive. `javascript:`, `data:` and `vbscript:` are the reason this function exists:
 * a link is the one field where a directory hands a reader's browser something a stranger
 * wrote. */

export function safeExternalUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const raw = input.trim()
  if (!raw) return null
  let url: URL
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (!url.hostname.includes('.')) return null
  return url.toString()
}

/** How a website reads on a page: the host, without the scheme or a trailing slash. */
export function displayUrl(url: string): string {
  try {
    const u = new URL(url)
    return (u.hostname.replace(/^www\./, '') + u.pathname).replace(/\/$/, '')
  } catch {
    return url
  }
}

/* ── Presentation ─────────────────────────────────────────────────────────────────────── */

/** Where a business reads as being: "Douala, Cameroon", or just the country. */
export function locationLabel(l?: BusinessLocation): string | null {
  if (!l) return null
  return [l.city, l.country].filter(Boolean).join(', ') || null
}

/** Two initials for the placeholder mark, from the words that carry meaning. */
export function businessInitials(name: string): string {
  const words = name
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w && !['the', 'and', 'of', 'ltd', 'limited'].includes(w.toLowerCase()))
  if (words.length === 0) return 'G'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/** A stable hue per business, so a placeholder is the same colour every time it renders and
 *  two businesses side by side are rarely the same. Deterministic, never random. */
export function placeholderHue(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 360
  return h
}
