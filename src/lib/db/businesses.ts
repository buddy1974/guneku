import 'server-only'
import { sql } from './client'
import {
  type Business, type BusinessCategory, type BusinessRelationship, type BusinessStatus,
  isBusinessCategory, isBusinessRelationship, youtubeIdFrom, safeExternalUrl,
  uniqueBusinessSlug,
} from '@/lib/businesses'

/* Storage for the businesses people register about themselves.
 *
 * Every function that touches one owner's businesses takes `clerkUserId` and scopes every
 * statement by it — the same rule members.ts and claims.ts follow, for the same reason. There
 * is no "get any business for editing" function to reach for by mistake, so a handler cannot
 * edit one person's shop while holding another person's session. Changing an id in a URL
 * finds nothing, because the id is not the only thing the query matches on.
 *
 * `person_slug` is never a parameter of a write. It is read from the caller's own approved
 * claim by `requireVerifiedGunekuan()` and passed in by the route, so a member cannot attach
 * a business to somebody else's name however the request is shaped. */

export type BusinessRow = {
  id: string
  slug: string
  clerk_user_id: string
  person_slug: string
  relationship: BusinessRelationship
  name: string
  tagline: string | null
  description: string | null
  category: BusinessCategory
  tags: string[]
  services: string[]
  service_areas: string[]
  country: string | null
  city: string | null
  address: string | null
  website: string | null
  facebook: string | null
  instagram: string | null
  linkedin: string | null
  youtube: string | null
  publish_contact: boolean
  contact_phone: string | null
  contact_email: string | null
  logo_url: string | null
  cover_url: string | null
  status: BusinessStatus
  created_at: string
  updated_at: string
}

export type BusinessVideoRow = {
  id: string
  business_id: string
  video_id: string
  title: string | null
  position: number
}

/** Turn a stored row into the shape every public surface reads, so a registered business and
 *  a curated one render through exactly the same component. Contact details are carried ONLY
 *  when their publication was chosen — the column check makes that true in the database, and
 *  this makes it true again on the way out. */
export function rowToBusiness(row: BusinessRow, videos: BusinessVideoRow[] = []): Business {
  const links = {
    website:   row.website   ?? undefined,
    facebook:  row.facebook  ?? undefined,
    instagram: row.instagram ?? undefined,
    linkedin:  row.linkedin  ?? undefined,
    youtube:   row.youtube   ?? undefined,
  }
  const hasLink = Object.values(links).some(Boolean)

  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? undefined,
    description: row.description ?? undefined,
    category: row.category,
    tags: row.tags ?? [],
    status: row.status,
    location: row.country
      ? { country: row.country, city: row.city ?? undefined, address: row.address ?? undefined }
      : undefined,
    serviceAreas: row.service_areas ?? [],
    services: row.services ?? [],
    links: hasLink ? links : undefined,
    contact: row.publish_contact
      ? { phone: row.contact_phone ?? undefined, email: row.contact_email ?? undefined }
      : undefined,
    logo: row.logo_url ?? undefined,
    cover: row.cover_url ?? undefined,
    videos: videos
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(v => ({ videoId: v.video_id, title: v.title ?? undefined })),
    people: [{
      personSlug: row.person_slug,
      relationship: row.relationship,
      evidence: 'Registered by this son or daughter of Guneku, whose identity the Palace has '
              + 'confirmed against the register.',
    }],
    registered: true,
    updatedAt: row.updated_at,
  }
}

/* ── What a browser may send ──────────────────────────────────────────────────────────────
 *
 * Every field is cleaned here and nothing reaches a statement unparsed. Links are resolved to
 * absolute http(s) URLs or dropped, which is what stops `javascript:` ever being stored.
 * Videos are reduced to eleven-character ids, so no URL and no markup is kept at all. */

const MAX = {
  name: 120, tagline: 180, description: 4000, place: 120, address: 200,
  item: 120, contact: 160,
} as const

const LIMIT = { tags: 12, services: 30, areas: 12, videos: 12 }

const text = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null
  const t = v.trim().replace(/\s+/g, ' ').slice(0, max)
  return t || null
}

const list = (v: unknown, cap: number): string[] => {
  if (!Array.isArray(v)) return []
  const out: string[] = []
  for (const item of v) {
    const t = text(item, MAX.item)
    if (t && !out.includes(t)) out.push(t)
    if (out.length >= cap) break
  }
  return out
}

export type BusinessInput = {
  name: string
  tagline: string | null
  description: string | null
  category: BusinessCategory
  relationship: BusinessRelationship
  tags: string[]
  services: string[]
  serviceAreas: string[]
  country: string | null
  city: string | null
  address: string | null
  website: string | null
  facebook: string | null
  instagram: string | null
  linkedin: string | null
  youtube: string | null
  publishContact: boolean
  contactPhone: string | null
  contactEmail: string | null
  logoUrl: string | null
  coverUrl: string | null
  videoIds: Array<{ videoId: string; title: string | null }>
}

export type ParseResult =
  | { ok: true; input: BusinessInput }
  | { ok: false; error: string }

/** Parse and validate a submission. Returns one readable sentence on failure, never a field
 *  map of internals: the form knows what it asked for, and an error is for the person. */
export function parseBusinessInput(body: unknown): ParseResult {
  const b = (body ?? {}) as Record<string, unknown>

  const name = text(b.name, MAX.name)
  if (!name) return { ok: false, error: 'Give the business a name.' }

  if (!isBusinessCategory(b.category)) {
    return { ok: false, error: 'Choose a category for the business.' }
  }

  /* Absent means owner, which is the ordinary case. A value that is not on the list is a
     crafted request rather than a mistake somebody could make in the form. */
  const relationship: BusinessRelationship =
    b.relationship === undefined || b.relationship === null || b.relationship === ''
      ? 'owner'
      : isBusinessRelationship(b.relationship)
        ? b.relationship
        : 'owner'

  const rawVideos = Array.isArray(b.videos) ? b.videos.slice(0, LIMIT.videos) : []
  const videoIds: BusinessInput['videoIds'] = []
  for (const raw of rawVideos) {
    const entry = (raw ?? {}) as Record<string, unknown>
    const source = typeof raw === 'string' ? raw : entry.url ?? entry.videoId
    const videoId = youtubeIdFrom(source)
    if (!videoId) return { ok: false, error: 'Enter a valid YouTube video link.' }
    if (videoIds.some(v => v.videoId === videoId)) continue
    videoIds.push({ videoId, title: text(entry.title, MAX.item) })
  }

  const publishContact = b.publishContact === true

  return {
    ok: true,
    input: {
      name,
      tagline: text(b.tagline, MAX.tagline),
      description: text(b.description, MAX.description),
      category: b.category,
      relationship,
      tags: list(b.tags, LIMIT.tags),
      services: list(b.services, LIMIT.services),
      serviceAreas: list(b.serviceAreas, LIMIT.areas),
      country: text(b.country, MAX.place),
      city: text(b.city, MAX.place),
      address: text(b.address, MAX.address),
      website:   safeExternalUrl(b.website),
      facebook:  safeExternalUrl(b.facebook),
      instagram: safeExternalUrl(b.instagram),
      linkedin:  safeExternalUrl(b.linkedin),
      youtube:   safeExternalUrl(b.youtube),
      /* Contact is kept only when publication was chosen. Storing it "just in case" would
         keep a private number in a column after somebody turned publication off, which is
         the opposite of what turning it off means. */
      publishContact,
      contactPhone: publishContact ? text(b.contactPhone, MAX.contact) : null,
      contactEmail: publishContact ? text(b.contactEmail, MAX.contact) : null,
      logoUrl:  safeExternalUrl(b.logoUrl),
      coverUrl: safeExternalUrl(b.coverUrl),
      videoIds,
    },
  }
}

/* ── Reads ────────────────────────────────────────────────────────────────────────────── */

async function videosFor(businessIds: string[]): Promise<Map<string, BusinessVideoRow[]>> {
  const map = new Map<string, BusinessVideoRow[]>()
  if (businessIds.length === 0) return map
  const rows = (await sql`
    SELECT * FROM business_videos
    WHERE business_id = ANY(${businessIds})
    ORDER BY position ASC
  `) as BusinessVideoRow[]
  for (const r of rows) {
    const list = map.get(r.business_id) ?? []
    list.push(r)
    map.set(r.business_id, list)
  }
  return map
}

/** Every business a stranger may see. The only read with no owner scope, and the only one
 *  that filters on status rather than on a session. */
export async function listPublicBusinesses(): Promise<Business[]> {
  const rows = (await sql`
    SELECT * FROM businesses WHERE status = 'public' ORDER BY updated_at DESC
  `) as BusinessRow[]
  const videos = await videosFor(rows.map(r => r.id))
  return rows.map(r => rowToBusiness(r, videos.get(r.id) ?? []))
}

/** One public business by slug, or null. */
export async function getPublicBusiness(slug: string): Promise<Business | null> {
  const rows = (await sql`
    SELECT * FROM businesses WHERE slug = ${slug} AND status = 'public' LIMIT 1
  `) as BusinessRow[]
  if (!rows[0]) return null
  const videos = await videosFor([rows[0].id])
  return rowToBusiness(rows[0], videos.get(rows[0].id) ?? [])
}

/** This owner's businesses, whatever their status. Scoped by their own id. */
export async function listMyBusinesses(clerkUserId: string): Promise<BusinessRow[]> {
  return (await sql`
    SELECT * FROM businesses
    WHERE clerk_user_id = ${clerkUserId} AND status <> 'archived'
    ORDER BY created_at DESC
  `) as BusinessRow[]
}

/** One business this owner may edit. Scoped by BOTH ids, so guessing one finds nothing. */
export async function getMyBusiness(
  clerkUserId: string, id: string,
): Promise<{ row: BusinessRow; videos: BusinessVideoRow[] } | null> {
  const rows = (await sql`
    SELECT * FROM businesses WHERE id = ${id} AND clerk_user_id = ${clerkUserId} LIMIT 1
  `) as BusinessRow[]
  if (!rows[0]) return null
  const videos = await videosFor([rows[0].id])
  return { row: rows[0], videos: videos.get(rows[0].id) ?? [] }
}

/* ── Writes ───────────────────────────────────────────────────────────────────────────── */

async function takenSlugs(): Promise<string[]> {
  const rows = (await sql`SELECT slug FROM businesses`) as Array<{ slug: string }>
  return rows.map(r => r.slug)
}

async function replaceVideos(
  businessId: string, videos: BusinessInput['videoIds'],
): Promise<void> {
  await sql`DELETE FROM business_videos WHERE business_id = ${businessId}`
  for (let i = 0; i < videos.length; i++) {
    await sql`
      INSERT INTO business_videos (business_id, video_id, title, position)
      VALUES (${businessId}, ${videos[i].videoId}, ${videos[i].title}, ${i})
      ON CONFLICT (business_id, video_id) DO NOTHING
    `
  }
}

/** Open a business. `personSlug` comes from the caller's approved claim and NOT from the
 *  body — that is the whole of the impersonation guarantee.
 *
 *  A new business starts `pending`: it is the owner's, it is complete enough to look at, and
 *  a person decides whether it goes on the public directory. That is the same shape as every
 *  other thing a member submits here. */
export async function createBusiness(
  clerkUserId: string,
  personSlug: string,
  input: BusinessInput,
  reservedSlugs: string[] = [],
): Promise<BusinessRow> {
  const slug = uniqueBusinessSlug(input.name, [...(await takenSlugs()), ...reservedSlugs])

  const rows = (await sql`
    INSERT INTO businesses (
      slug, clerk_user_id, person_slug, relationship,
      name, tagline, description, category, tags, services, service_areas,
      country, city, address,
      website, facebook, instagram, linkedin, youtube,
      publish_contact, contact_phone, contact_email,
      logo_url, cover_url, status
    ) VALUES (
      ${slug}, ${clerkUserId}, ${personSlug}, ${input.relationship},
      ${input.name}, ${input.tagline}, ${input.description}, ${input.category},
      ${input.tags}, ${input.services}, ${input.serviceAreas},
      ${input.country}, ${input.city}, ${input.address},
      ${input.website}, ${input.facebook}, ${input.instagram}, ${input.linkedin},
      ${input.youtube},
      ${input.publishContact}, ${input.contactPhone}, ${input.contactEmail},
      ${input.logoUrl}, ${input.coverUrl}, 'pending'
    )
    RETURNING *
  `) as BusinessRow[]

  await replaceVideos(rows[0].id, input.videoIds)
  return rows[0]
}

/** Update a business this owner owns. The slug is NOT in the SET clause: a rename changes
 *  the heading on the page and never the address somebody wrote down.
 *
 *  Scoped by `clerk_user_id` in the statement itself rather than checked beforehand, so
 *  editing somebody else's business updates no rows and returns null however the request was
 *  shaped. */
export async function updateMyBusiness(
  clerkUserId: string, id: string, input: BusinessInput,
): Promise<BusinessRow | null> {
  const rows = (await sql`
    UPDATE businesses SET
      relationship   = ${input.relationship},
      name           = ${input.name},
      tagline        = ${input.tagline},
      description    = ${input.description},
      category       = ${input.category},
      tags           = ${input.tags},
      services       = ${input.services},
      service_areas  = ${input.serviceAreas},
      country        = ${input.country},
      city           = ${input.city},
      address        = ${input.address},
      website        = ${input.website},
      facebook       = ${input.facebook},
      instagram      = ${input.instagram},
      linkedin       = ${input.linkedin},
      youtube        = ${input.youtube},
      publish_contact= ${input.publishContact},
      contact_phone  = ${input.contactPhone},
      contact_email  = ${input.contactEmail},
      logo_url       = ${input.logoUrl},
      cover_url      = ${input.coverUrl},
      updated_at     = NOW()
    WHERE id = ${id} AND clerk_user_id = ${clerkUserId}
    RETURNING *
  `) as BusinessRow[]

  if (!rows[0]) return null
  await replaceVideos(rows[0].id, input.videoIds)
  return rows[0]
}

/** Archive rather than delete. The repository's own pattern for withdrawing something: a
 *  record that is gone cannot be restored when somebody archived the wrong one, and cannot
 *  answer what was published at a URL last week. Scoped by owner. */
export async function archiveMyBusiness(
  clerkUserId: string, id: string,
): Promise<BusinessRow | null> {
  const rows = (await sql`
    UPDATE businesses
    SET status = 'archived', updated_at = NOW()
    WHERE id = ${id} AND clerk_user_id = ${clerkUserId} AND status <> 'archived'
    RETURNING *
  `) as BusinessRow[]
  return rows[0] ?? null
}
