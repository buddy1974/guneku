import 'server-only'
import { sql } from './client'
import type { ContributionStatus, ContributionType, TargetType } from '@/lib/contributions'

/* Storage for moderated contributions.
 *
 * Nothing here writes a canonical Guneku record, and there is no code path from this module
 * to one. Every statement names `contributions` and nothing else — asserted by a test, the
 * same way the claims module is — so accepting a contribution can change a row's status and
 * can do nothing whatever to a quarter, a person, a body or a chapter.
 *
 * Every contributor-facing function takes `clerkUserId` first and scopes its statement by it.
 * The reviewer functions are the deliberate exception and are named so that nobody calls one
 * without noticing. */

export type ContributionRow = {
  id: string
  clerk_user_id: string
  type: ContributionType
  target_type: TargetType
  target_id: string | null
  content: string
  source_note: string | null
  status: ContributionStatus
  created_at: string
  updated_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

/** What a contributor may see about their own submission. No reviewer identity: the outcome
 *  is theirs, the deliberation is not. */
export type ContributorView = {
  id: string
  type: ContributionType
  target_type: TargetType
  target_id: string | null
  content: string
  source_note: string | null
  status: ContributionStatus
  created_at: string
  reviewed_at: string | null
}

export function toContributorView(row: ContributionRow): ContributorView {
  return {
    id:          row.id,
    type:        row.type,
    target_type: row.target_type,
    target_id:   row.target_id,
    content:     row.content,
    source_note: row.source_note,
    status:      row.status,
    created_at:  row.created_at,
    reviewed_at: row.reviewed_at,
  }
}

/** This member's own contributions, newest first. */
export async function listMyContributions(clerkUserId: string): Promise<ContributorView[]> {
  const rows = (await sql`
    SELECT * FROM contributions
    WHERE clerk_user_id = ${clerkUserId}
    ORDER BY created_at DESC
  `) as ContributionRow[]
  return rows.map(toContributorView)
}

/** Open a contribution. The caller has already validated the type and resolved the target
 *  against the canonical records; this writes the row. */
export async function createContribution(
  clerkUserId: string,
  input: {
    type: ContributionType
    targetType: TargetType
    targetId: string | null
    content: string
    sourceNote: string | null
  },
): Promise<ContributorView> {
  const rows = (await sql`
    INSERT INTO contributions (
      clerk_user_id, type, target_type, target_id, content, source_note
    ) VALUES (
      ${clerkUserId}, ${input.type}, ${input.targetType},
      ${input.targetId}, ${input.content}, ${input.sourceNote}
    )
    RETURNING *
  `) as ContributionRow[]
  return toContributorView(rows[0])
}

/* ── State changes ───────────────────────────────────────────────────────────────────────
 * Both carry `AND status = 'pending'` in the WHERE clause. That is the concurrency control,
 * not a second opinion: two reviewers deciding at the same moment both pass a read-then-write
 * check and only one passes this. The loser updates no rows and gets null. */

/** Withdraw. Scoped by the contributor's own id as well as the row id, so guessing an id
 *  cannot withdraw somebody else's submission. */
export async function withdrawOwnContribution(
  clerkUserId: string, id: string,
): Promise<ContributorView | null> {
  const rows = (await sql`
    UPDATE contributions
    SET status = 'withdrawn', updated_at = NOW()
    WHERE id = ${id}
      AND clerk_user_id = ${clerkUserId}
      AND status = 'pending'
    RETURNING *
  `) as ContributionRow[]
  return rows[0] ? toContributorView(rows[0]) : null
}

/** Accept or reject. Writes a status, a timestamp and the reviewer's id to ONE ROW. It does
 *  not, and cannot, alter any canonical record — accepting means Guneku has taken the
 *  contribution up for editorial action, and the editing is a separate act by a person. */
export async function decideContribution(
  id: string, status: 'accepted' | 'rejected', reviewerId: string,
): Promise<ContributionRow | null> {
  const rows = (await sql`
    UPDATE contributions
    SET status      = ${status},
        reviewed_at = NOW(),
        reviewed_by = ${reviewerId},
        updated_at  = NOW()
    WHERE id = ${id}
      AND status = 'pending'
    RETURNING *
  `) as ContributionRow[]
  return rows[0] ?? null
}

/* ── Reviewer reads ──────────────────────────────────────────────────────────────────────
 * Named for what they are. Every caller must have passed requireRole('reviewer') first. */

export async function getContributionForReview(id: string): Promise<ContributionRow | null> {
  const rows = (await sql`
    SELECT * FROM contributions WHERE id = ${id} LIMIT 1
  `) as ContributionRow[]
  return rows[0] ?? null
}

/** The queue: pending contributions, oldest first. Reviewer-only. */
export async function listPendingContributions(limit = 100): Promise<ContributionRow[]> {
  return (await sql`
    SELECT * FROM contributions
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT ${limit}
  `) as ContributionRow[]
}
