import { sql } from './client'
import type { IndigeneProfile, PublicIndigeneProfile } from '@/types/indigene'

/** Postgres 23505 — unique_violation. Here it means one thing only: this Clerk user already
 *  owns a profile, because `clerk_user_id` is the only unique column on the table. A caller
 *  should be sent to the profile they already have, not shown a fault. */
export const UNIQUE_VIOLATION = '23505'

export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null &&
    (err as { code?: unknown }).code === UNIQUE_VIOLATION
}

/* Comma-separated because it is interpolated into the SELECT as SQL, not as a parameter.
   Nothing user-supplied ever reaches this string — it is a fixed list written here and
   nowhere else, so the projection cannot be widened by a request. */
const PUBLIC_COLUMNS = [
  'id', 'created_at', 'full_name', 'display_name', 'photo_url',
  'current_city', 'current_country', 'country_flag',
  'profession', 'employer', 'bio',
  'quarter', 'family_lineage', 'generation',
  'website_url', 'facebook_url', 'instagram_url',
  'linkedin_url', 'twitter_url', 'youtube_url',
  'is_verified', 'willing_to_mentor', 'open_to_connect', 'skills_text',
] as const

/** Exported so a test can assert what the public directory publishes, rather than trusting
 *  that nobody widened it. `clerk_user_id` must never appear here. */
export const PUBLIC_PROFILE_COLUMNS: readonly string[] = PUBLIC_COLUMNS

function splitSkills(v: unknown): string[] {
  return typeof v === 'string' && v
    ? v.split(',').map(s => s.trim()).filter(Boolean)
    : []
}

function rowToProfile(row: Record<string, unknown>): IndigeneProfile {
  return {
    ...(row as unknown as IndigeneProfile),
    skills: splitSkills(row.skills_text),
  }
}

/* Built field by field rather than by spreading the row. A spread would republish whatever
   the query happened to return — which is exactly how `clerk_user_id` and the `total_count`
   window column ended up in the public payload in the first place. */
function rowToPublicProfile(row: Record<string, unknown>): PublicIndigeneProfile {
  const s = (k: string) => (typeof row[k] === 'string' && row[k] ? (row[k] as string) : undefined)
  return {
    id:                String(row.id),
    created_at:        String(row.created_at),
    full_name:         String(row.full_name ?? ''),
    display_name:      s('display_name'),
    photo_url:         s('photo_url'),
    current_city:      s('current_city'),
    current_country:   s('current_country'),
    country_flag:      s('country_flag'),
    profession:        s('profession'),
    employer:          s('employer'),
    bio:               s('bio'),
    quarter:           s('quarter'),
    family_lineage:    s('family_lineage'),
    generation:        s('generation'),
    website_url:       s('website_url'),
    facebook_url:      s('facebook_url'),
    instagram_url:     s('instagram_url'),
    linkedin_url:      s('linkedin_url'),
    twitter_url:       s('twitter_url'),
    youtube_url:       s('youtube_url'),
    is_verified:       row.is_verified       === true,
    willing_to_mentor: row.willing_to_mentor === true,
    open_to_connect:   row.open_to_connect   === true,
    skills:            splitSkills(row.skills_text),
  }
}

export async function getProfileByClerkId(
  clerkUserId: string
): Promise<IndigeneProfile | null> {
  const rows = await sql`
    SELECT * FROM indigene_profiles
    WHERE clerk_user_id = ${clerkUserId}
    LIMIT 1
  `
  return rows[0] ? rowToProfile(rows[0] as Record<string, unknown>) : null
}

/** Does this Clerk user already own a profile? Cheaper than fetching the row, and it is the
 *  question both the onboarding page and the create handler actually need to ask. */
export async function profileExists(clerkUserId: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM indigene_profiles
    WHERE clerk_user_id = ${clerkUserId}
    LIMIT 1
  `
  return rows.length > 0
}

export async function createProfile(
  clerkUserId: string,
  data: Partial<IndigeneProfile>
): Promise<IndigeneProfile> {
  const rows = await sql`
    INSERT INTO indigene_profiles (
      clerk_user_id, full_name, display_name, photo_url, cover_photo_url,
      current_city, current_country, country_flag,
      profession, employer, bio,
      quarter, family_lineage, family_home, generation, year_left_guneku,
      website_url, facebook_url, instagram_url, linkedin_url,
      twitter_url, youtube_url,
      is_public, willing_to_mentor, open_to_connect, skills_text
    ) VALUES (
      ${clerkUserId},
      ${data.full_name || ''},
      ${data.display_name || null},
      ${data.photo_url || null},
      ${data.cover_photo_url || null},
      ${data.current_city || null},
      ${data.current_country || null},
      ${data.country_flag || null},
      ${data.profession || null},
      ${data.employer || null},
      ${data.bio || null},
      ${data.quarter || null},
      ${data.family_lineage || null},
      ${data.family_home || null},
      ${data.generation || null},
      ${data.year_left_guneku || null},
      ${data.website_url || null},
      ${data.facebook_url || null},
      ${data.instagram_url || null},
      ${data.linkedin_url || null},
      ${data.twitter_url || null},
      ${data.youtube_url || null},
      ${data.is_public !== false},
      ${data.willing_to_mentor || false},
      ${data.open_to_connect !== false},
      ${Array.isArray(data.skills) ? data.skills.join(', ') : null}
    )
    RETURNING *
  `
  return rowToProfile(rows[0] as Record<string, unknown>)
}

/* The columns a member may change about themselves, and nothing else. `clerk_user_id`, `id`,
   `is_verified` and `created_at` are absent by design: ownership, the Palace's verification
   mark and the record's own history are not the member's to edit, and a column that is not
   in this list cannot be reached through this function whatever a request body says. */
const EDITABLE_TEXT = [
  'display_name', 'photo_url', 'cover_photo_url',
  'current_city', 'current_country', 'country_flag',
  'profession', 'employer', 'bio',
  'quarter', 'family_lineage', 'family_home', 'generation',
  'website_url', 'facebook_url', 'instagram_url',
  'linkedin_url', 'twitter_url', 'youtube_url',
] as const

const EDITABLE_BOOL = ['is_public', 'willing_to_mentor', 'open_to_connect'] as const

/** A member's own profile, updated in place.
 *
 * Rewritten on 2026-09-04 from a fixed `COALESCE(value, column)` statement per column. That
 * shape could set a field and could leave it alone, but it could never clear one: an empty
 * string arrived as null and COALESCE read null as "unchanged", so a member who wanted to
 * remove a wrong employer or an old link had no way to do it. Editing that cannot undo is
 * not editing.
 *
 * So the SET clause is now built from what the caller actually sent:
 *   field absent          -> the column is not in the statement at all, and keeps its value
 *   field is empty string -> the column is set to NULL, because that was asked for
 *   field has a value     -> the column takes it
 *
 * Column names come from the two fixed lists above and never from the request; every value
 * is a bound parameter. Returns null when the member has no profile to update. */
export async function updateProfile(
  clerkUserId: string,
  data: Partial<IndigeneProfile>
): Promise<IndigeneProfile | null> {
  const sets: string[]     = []
  const params: unknown[]  = []

  const push = (column: string, value: unknown) => {
    params.push(value)
    sets.push(`${column} = $${params.length}`)
  }

  /* full_name is NOT NULL in the schema, so it is set but never cleared: a blank one is
     treated as "not supplied" rather than as an instruction the database would refuse. */
  if (typeof data.full_name === 'string' && data.full_name.trim()) {
    push('full_name', data.full_name.trim())
  }

  for (const column of EDITABLE_TEXT) {
    const raw = data[column]
    if (raw === undefined) continue
    const value = typeof raw === 'string' ? raw.trim() : ''
    push(column, value === '' ? null : value)
  }

  for (const column of EDITABLE_BOOL) {
    const raw = data[column]
    if (typeof raw === 'boolean') push(column, raw)
  }

  if (data.year_left_guneku !== undefined) {
    const year = Number(data.year_left_guneku)
    push('year_left_guneku', Number.isFinite(year) && year > 0 ? Math.trunc(year) : null)
  }

  if (data.skills !== undefined) {
    const text = Array.isArray(data.skills) ? data.skills.join(', ').trim() : ''
    push('skills_text', text === '' ? null : text)
  }

  /* Nothing to change is not a failure. Return the row as it stands so the caller still gets
     the profile back and the form still reports a save. */
  if (sets.length === 0) return getProfileByClerkId(clerkUserId)

  sets.push('updated_at = NOW()')
  params.push(clerkUserId)

  const rows = (await sql.query(
    `UPDATE indigene_profiles SET ${sets.join(', ')}
     WHERE clerk_user_id = $${params.length}
     RETURNING *`,
    params,
  )) as Record<string, unknown>[]

  /* No row means this user has no profile to update. That is a 404 for the caller, not a
     crash: the previous version passed `undefined` into `rowToProfile` and threw, so a PUT
     from someone who had never onboarded came back as a fixed 500 saying nothing useful. */
  return rows[0] ? rowToProfile(rows[0]) : null
}

export async function listProfiles(opts: {
  search?:  string
  quarter?: string
  country?: string
  page?:    number
  limit?:   number
}): Promise<{ profiles: PublicIndigeneProfile[]; total: number }> {
  const limit  = opts.limit  || 24
  const offset = ((opts.page || 1) - 1) * limit

  const search  = opts.search  ? `%${opts.search.toLowerCase()}%`  : null
  const quarter = opts.quarter || null
  const country = opts.country || null

  /* Every optional parameter is cast explicitly.
   *
   * Without the casts Postgres refuses the query outright: `$1 IS NULL` gives it a parameter
   * in a context that implies no type, and it answers `could not determine data type of
   * parameter $1` (SQLSTATE 42P18). That is what /api/indigenes/all returned the moment the
   * table existed and the query could finally be attempted at all — the bug had been sitting
   * behind a missing table and, before that, behind a client that could never be called.
   *
   * `::text` on each side of the null check is the whole fix.
   *
   * Written with `sql.query(text, params)` rather than a tagged template because the column
   * list is SQL, not a value, and a tagged template can only interpolate values. The list is
   * the fixed `PUBLIC_COLUMNS` constant above — nothing from the request reaches the query
   * text — while every caller-supplied filter stays a bound parameter, $1 to $5. */
  const rows = (await sql.query(
    `SELECT ${PUBLIC_COLUMNS.join(', ')}, COUNT(*) OVER() AS total_count
     FROM indigene_profiles
     WHERE is_public = true
       AND (
         $1::text IS NULL OR (
           LOWER(full_name)                 LIKE $1::text OR
           LOWER(COALESCE(profession, ''))  LIKE $1::text OR
           LOWER(COALESCE(current_city, '')) LIKE $1::text
         )
       )
       AND ($2::text IS NULL OR quarter = $2::text)
       AND ($3::text IS NULL OR current_country = $3::text)
     ORDER BY created_at DESC
     LIMIT $4::int
     OFFSET $5::int`,
    [search, quarter, country, limit, offset],
  )) as Record<string, unknown>[]

  /* `total_count` is a window column that belongs to the query, not to a person. It is read
     here and deliberately not carried into the profile objects. */
  const total    = rows[0] ? Number(rows[0].total_count) : 0
  const profiles = rows.map(rowToPublicProfile)
  return { profiles, total }
}
