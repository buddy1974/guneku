import 'server-only'
import { sql } from './client'

/* Queries for the platform side of a member: who they are on Guneku.org, and what they
 * follow. Nothing here reads or writes an authoritative Guneku fact.
 *
 * Every function takes `clerkUserId` as its first argument and scopes every statement by
 * it. That is the whole of the cross-user protection and it is deliberately not optional:
 * there is no "get any member" function to call by mistake, so a handler cannot read one
 * person's row while holding another person's session. The caller must have obtained that id
 * from `requireUser()`, never from a request body. */

export type CommunityMember = {
  id: string
  clerk_user_id: string
  display_name: string | null
  email: string | null
  country: string | null
  /** What the member says about themselves. Unverified — never render it as established. */
  quarter: string | null
  chapter: string | null
  profile_public: boolean
  show_country: boolean
  show_quarter: boolean
  contactable: boolean
  created_at: string
  updated_at: string
}

export type FollowSubject = 'project' | 'topic' | 'quarter' | 'event' | 'institution'

export type Follow = {
  id: string
  subject_type: FollowSubject
  subject_id: string
  created_at: string
}

/** The member's own row, or null before they have saved anything. */
export async function getMember(clerkUserId: string): Promise<CommunityMember | null> {
  const rows = (await sql`
    SELECT * FROM community_members WHERE clerk_user_id = ${clerkUserId} LIMIT 1
  `) as CommunityMember[]
  return rows[0] ?? null
}

/** Fields a member is allowed to set about themselves. Anything not listed is not writable
 *  through this path — notably `clerk_user_id`, and notably nothing about the register. */
export type MemberInput = {
  displayName?: string | null
  email?: string | null
  country?: string | null
  quarter?: string | null
  chapter?: string | null
  profilePublic?: boolean
  showCountry?: boolean
  showQuarter?: boolean
  contactable?: boolean
}

/* Upsert on clerk_user_id: a member's first save creates the row, later saves update it.
   COALESCE means an omitted field keeps its stored value instead of being nulled, so a
   partial form submission cannot silently erase what the member set last time. */
export async function saveMember(
  clerkUserId: string,
  input: MemberInput,
): Promise<CommunityMember> {
  const rows = (await sql`
    INSERT INTO community_members (
      clerk_user_id, display_name, email, country, quarter, chapter,
      profile_public, show_country, show_quarter, contactable, updated_at
    ) VALUES (
      ${clerkUserId},
      ${input.displayName ?? null},
      ${input.email ?? null},
      ${input.country ?? null},
      ${input.quarter ?? null},
      ${input.chapter ?? null},
      ${input.profilePublic ?? false},
      ${input.showCountry ?? true},
      ${input.showQuarter ?? false},
      ${input.contactable ?? false},
      NOW()
    )
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      display_name   = COALESCE(${input.displayName ?? null}, community_members.display_name),
      email          = COALESCE(${input.email ?? null},       community_members.email),
      country        = COALESCE(${input.country ?? null},     community_members.country),
      quarter        = COALESCE(${input.quarter ?? null},     community_members.quarter),
      chapter        = COALESCE(${input.chapter ?? null},     community_members.chapter),
      profile_public = COALESCE(${input.profilePublic ?? null}, community_members.profile_public),
      show_country   = COALESCE(${input.showCountry ?? null},   community_members.show_country),
      show_quarter   = COALESCE(${input.showQuarter ?? null},   community_members.show_quarter),
      contactable    = COALESCE(${input.contactable ?? null},   community_members.contactable),
      updated_at     = NOW()
    RETURNING *
  `) as CommunityMember[]
  return rows[0]
}

/** Everything this member follows, newest first. */
export async function listFollows(clerkUserId: string): Promise<Follow[]> {
  return (await sql`
    SELECT id, subject_type, subject_id, created_at
    FROM follows
    WHERE clerk_user_id = ${clerkUserId}
    ORDER BY created_at DESC
  `) as Follow[]
}

/** Idempotent: following twice is following once. */
export async function addFollow(
  clerkUserId: string, subjectType: FollowSubject, subjectId: string,
): Promise<void> {
  await sql`
    INSERT INTO follows (clerk_user_id, subject_type, subject_id)
    VALUES (${clerkUserId}, ${subjectType}, ${subjectId})
    ON CONFLICT (clerk_user_id, subject_type, subject_id) DO NOTHING
  `
}

/* Scoped by clerk_user_id as well as by subject, so a caller cannot delete somebody else's
   follow by guessing an id. */
export async function removeFollow(
  clerkUserId: string, subjectType: FollowSubject, subjectId: string,
): Promise<void> {
  await sql`
    DELETE FROM follows
    WHERE clerk_user_id = ${clerkUserId}
      AND subject_type  = ${subjectType}
      AND subject_id    = ${subjectId}
  `
}
