import 'server-only'
import { sql } from './client'
import type { ClaimStatus } from '@/lib/claims'

/* The claim workflow's storage. Nothing here reads or writes an authoritative Guneku fact.
 *
 * Every function that touches one member's claims takes `clerkUserId` as its first argument
 * and scopes every statement by it — the same rule as members.ts, for the same reason: there
 * is no "get any claim" function to reach for by mistake, so a handler cannot read one
 * person's claims while holding another person's session. The reviewer functions are the
 * deliberate exception and are named so that no one calls them without noticing.
 *
 * `person_slug` points at a record in founding-names.json. This module never resolves it,
 * never copies the person's details in, and has no way to change them. */

/** The row as stored. `reviewed_by` is in here because the reviewer surface needs it; it is
 *  stripped before anything reaches a claimant — see `toClaimantView`. */
export type ClaimRow = {
  id: string
  clerk_user_id: string
  person_slug: string
  status: ClaimStatus
  note: string | null
  created_at: string
  updated_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

/** What a claimant is allowed to see about their own claim. No reviewer identity, no
 *  moderation reasoning: the outcome is theirs, the deliberation is not. */
export type ClaimantView = {
  id: string
  person_slug: string
  status: ClaimStatus
  note: string | null
  created_at: string
  reviewed_at: string | null
}

export function toClaimantView(row: ClaimRow): ClaimantView {
  return {
    id:          row.id,
    person_slug: row.person_slug,
    status:      row.status,
    note:        row.note,
    created_at:  row.created_at,
    reviewed_at: row.reviewed_at,
  }
}

/** This member's own claims, newest first. */
export async function listMyClaims(clerkUserId: string): Promise<ClaimantView[]> {
  const rows = (await sql`
    SELECT * FROM profile_claims
    WHERE clerk_user_id = ${clerkUserId}
    ORDER BY created_at DESC
  `) as ClaimRow[]
  return rows.map(toClaimantView)
}

/** This member's live claim on this record, if any. Used to decide whether the claim button
 *  should be offered at all, so the ordinary case never reaches a constraint violation. */
export async function findLiveClaim(
  clerkUserId: string, personSlug: string,
): Promise<ClaimantView | null> {
  const rows = (await sql`
    SELECT * FROM profile_claims
    WHERE clerk_user_id = ${clerkUserId}
      AND person_slug   = ${personSlug}
      AND status IN ('pending', 'approved')
    LIMIT 1
  `) as ClaimRow[]
  return rows[0] ? toClaimantView(rows[0]) : null
}

/** Is this record already associated with somebody? Answered as a boolean and never as a
 *  name: who holds an approved claim is not public, and is not another claimant's business. */
export async function personIsTaken(personSlug: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM profile_claims
    WHERE person_slug = ${personSlug} AND status = 'approved'
    LIMIT 1
  `
  return rows.length > 0
}

/** Open a claim. The caller must have established eligibility first; this writes the row.
 *  A duplicate is refused by the partial unique index, which the route turns into a 409. */
export async function createClaim(
  clerkUserId: string, personSlug: string, note: string | null,
): Promise<ClaimantView> {
  const rows = (await sql`
    INSERT INTO profile_claims (clerk_user_id, person_slug, note)
    VALUES (${clerkUserId}, ${personSlug}, ${note})
    RETURNING *
  `) as ClaimRow[]
  return toClaimantView(rows[0])
}

/* ── State changes ───────────────────────────────────────────────────────────────────────
 *
 * Both of these carry `AND status = 'pending'` in the WHERE clause rather than checking the
 * status in TypeScript and then writing. That is not belt-and-braces, it is the actual
 * concurrency control: two reviewers pressing approve on the same claim at the same moment
 * both pass a read-then-write check, and only one passes this. The loser updates no rows and
 * gets null back, which the route reports as "already decided". */

/** Withdraw. Scoped by the claimant's own id as well as the claim id, so guessing an id
 *  cannot withdraw somebody else's request. */
export async function withdrawOwnClaim(
  clerkUserId: string, claimId: string,
): Promise<ClaimantView | null> {
  const rows = (await sql`
    UPDATE profile_claims
    SET status = 'withdrawn', updated_at = NOW()
    WHERE id = ${claimId}
      AND clerk_user_id = ${clerkUserId}
      AND status = 'pending'
    RETURNING *
  `) as ClaimRow[]
  return rows[0] ? toClaimantView(rows[0]) : null
}

/** Approve or reject. `reviewerId` comes from the reviewer's Clerk session; the route has
 *  already established the role and that the reviewer is not the claimant. */
export async function decideClaim(
  claimId: string, status: 'approved' | 'rejected', reviewerId: string,
): Promise<ClaimRow | null> {
  const rows = (await sql`
    UPDATE profile_claims
    SET status      = ${status},
        reviewed_at = NOW(),
        reviewed_by = ${reviewerId},
        updated_at  = NOW()
    WHERE id = ${claimId}
      AND status = 'pending'
    RETURNING *
  `) as ClaimRow[]
  return rows[0] ?? null
}

/* ── Reviewer reads ──────────────────────────────────────────────────────────────────────
 * Named for what they are. Every caller must have passed requireRole('reviewer') first. */

/** One claim, whoever it belongs to. Reviewer-only. */
export async function getClaimForReview(claimId: string): Promise<ClaimRow | null> {
  const rows = (await sql`
    SELECT * FROM profile_claims WHERE id = ${claimId} LIMIT 1
  `) as ClaimRow[]
  return rows[0] ?? null
}

/** The queue: pending claims, oldest first, because the person who has waited longest is
 *  the person who should be answered next. Reviewer-only. */
export async function listPendingForReview(limit = 100): Promise<ClaimRow[]> {
  return (await sql`
    SELECT * FROM profile_claims
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT ${limit}
  `) as ClaimRow[]
}
