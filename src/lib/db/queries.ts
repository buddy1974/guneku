import { sql } from './client'
import type { IndigeneProfile } from '@/types/indigene'

function rowToProfile(row: Record<string, unknown>): IndigeneProfile {
  return {
    ...(row as any),
    skills: typeof row.skills_text === 'string' && row.skills_text
      ? row.skills_text.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
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

export async function updateProfile(
  clerkUserId: string,
  data: Partial<IndigeneProfile>
): Promise<IndigeneProfile> {
  const rows = await sql`
    UPDATE indigene_profiles SET
      full_name         = COALESCE(${data.full_name        || null}, full_name),
      display_name      = COALESCE(${data.display_name     || null}, display_name),
      photo_url         = COALESCE(${data.photo_url        || null}, photo_url),
      cover_photo_url   = COALESCE(${data.cover_photo_url  || null}, cover_photo_url),
      current_city      = COALESCE(${data.current_city     || null}, current_city),
      current_country   = COALESCE(${data.current_country  || null}, current_country),
      country_flag      = COALESCE(${data.country_flag     || null}, country_flag),
      profession        = COALESCE(${data.profession       || null}, profession),
      employer          = COALESCE(${data.employer         || null}, employer),
      bio               = COALESCE(${data.bio              || null}, bio),
      quarter           = COALESCE(${data.quarter          || null}, quarter),
      family_lineage    = COALESCE(${data.family_lineage   || null}, family_lineage),
      family_home       = COALESCE(${data.family_home      || null}, family_home),
      generation        = COALESCE(${data.generation       || null}, generation),
      year_left_guneku  = COALESCE(${data.year_left_guneku || null}, year_left_guneku),
      website_url       = COALESCE(${data.website_url      || null}, website_url),
      facebook_url      = COALESCE(${data.facebook_url     || null}, facebook_url),
      instagram_url     = COALESCE(${data.instagram_url    || null}, instagram_url),
      linkedin_url      = COALESCE(${data.linkedin_url     || null}, linkedin_url),
      twitter_url       = COALESCE(${data.twitter_url      || null}, twitter_url),
      youtube_url       = COALESCE(${data.youtube_url      || null}, youtube_url),
      is_public         = COALESCE(${data.is_public        ?? null}, is_public),
      willing_to_mentor = COALESCE(${data.willing_to_mentor ?? null}, willing_to_mentor),
      skills_text       = COALESCE(
                            ${Array.isArray(data.skills) ? data.skills.join(', ') : null},
                            skills_text
                          ),
      updated_at        = NOW()
    WHERE clerk_user_id = ${clerkUserId}
    RETURNING *
  `
  return rowToProfile(rows[0] as Record<string, unknown>)
}

export async function listProfiles(opts: {
  search?:  string
  quarter?: string
  country?: string
  page?:    number
  limit?:   number
}): Promise<{ profiles: IndigeneProfile[]; total: number }> {
  const limit  = opts.limit  || 24
  const offset = ((opts.page || 1) - 1) * limit

  const search  = opts.search  ? `%${opts.search.toLowerCase()}%`  : null
  const quarter = opts.quarter || null
  const country = opts.country || null

  const rows = await sql`
    SELECT *, COUNT(*) OVER() AS total_count
    FROM indigene_profiles
    WHERE is_public = true
      AND (
        ${search} IS NULL OR (
          LOWER(full_name)                  LIKE ${search} OR
          LOWER(COALESCE(profession, ''))   LIKE ${search} OR
          LOWER(COALESCE(current_city,''))  LIKE ${search}
        )
      )
      AND (${quarter} IS NULL OR quarter = ${quarter})
      AND (${country} IS NULL OR current_country = ${country})
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `

  const total    = rows[0] ? Number((rows[0] as any).total_count) : 0
  const profiles = rows.map(r => rowToProfile(r as Record<string, unknown>))
  return { profiles, total }
}
