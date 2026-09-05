import 'server-only'
import { sql } from './client'
import type { CorrespondenceCategory, CorrespondenceStatus } from '@/lib/correspondence'

/* Storage for Palace correspondence.
 *
 * Every statement here names `palace_correspondence` and nothing else — asserted by a test,
 * as with claims and contributions. No canonical record can be reached from this module.
 *
 * The privacy rule that matters most is enforced by the shape of the types, not by callers
 * remembering: `SenderView` has no `internal_note` and no `handled_by` field, so a Palace
 * working note cannot reach the person who wrote in even if a route returns the wrong
 * object. There is no code path that puts one in front of a sender. */

export type CorrespondenceRow = {
  id: string
  clerk_user_id: string | null
  sender_name: string
  sender_email: string | null
  sender_phone: string | null
  category: CorrespondenceCategory
  subject: string
  message: string
  status: CorrespondenceStatus
  response: string | null
  responded_at: string | null
  internal_note: string | null
  handled_by: string | null
  created_at: string
  updated_at: string
}

/** What the person who wrote in may see: their own letter, where it has got to, and the
 *  Palace's reply if there is one. Not the internal note. Not who handled it. */
export type SenderView = {
  id: string
  category: CorrespondenceCategory
  subject: string
  message: string
  status: CorrespondenceStatus
  response: string | null
  responded_at: string | null
  created_at: string
}

export function toSenderView(row: CorrespondenceRow): SenderView {
  return {
    id:           row.id,
    category:     row.category,
    subject:      row.subject,
    message:      row.message,
    status:       row.status,
    response:     row.response,
    responded_at: row.responded_at,
    created_at:   row.created_at,
  }
}

/** Record a letter. `clerkUserId` is null for a signed-out visitor — no identity is
 *  manufactured, and null means "no account" rather than "unknown account". */
export async function createCorrespondence(input: {
  clerkUserId: string | null
  senderName: string
  senderEmail: string | null
  senderPhone: string | null
  category: CorrespondenceCategory
  subject: string
  message: string
}): Promise<SenderView> {
  const rows = (await sql`
    INSERT INTO palace_correspondence (
      clerk_user_id, sender_name, sender_email, sender_phone,
      category, subject, message
    ) VALUES (
      ${input.clerkUserId}, ${input.senderName}, ${input.senderEmail}, ${input.senderPhone},
      ${input.category}, ${input.subject}, ${input.message}
    )
    RETURNING *
  `) as CorrespondenceRow[]
  return toSenderView(rows[0])
}

/** This member's own correspondence, newest first. */
export async function listMyCorrespondence(clerkUserId: string): Promise<SenderView[]> {
  const rows = (await sql`
    SELECT * FROM palace_correspondence
    WHERE clerk_user_id = ${clerkUserId}
    ORDER BY created_at DESC
  `) as CorrespondenceRow[]
  return rows.map(toSenderView)
}

/** One letter, only if it belongs to this member. Scoped by both ids, so guessing an id
 *  cannot open somebody else's correspondence. */
export async function getMyCorrespondence(
  clerkUserId: string, id: string,
): Promise<SenderView | null> {
  const rows = (await sql`
    SELECT * FROM palace_correspondence
    WHERE id = ${id} AND clerk_user_id = ${clerkUserId}
    LIMIT 1
  `) as CorrespondenceRow[]
  return rows[0] ? toSenderView(rows[0]) : null
}

/* ── Palace reads and writes ─────────────────────────────────────────────────────────────
 * Named for what they are. Every caller must have passed requireRole('palace-admin'). */

/** The queue: everything not yet closed, oldest first. */
export async function listForPalace(limit = 100): Promise<CorrespondenceRow[]> {
  return (await sql`
    SELECT * FROM palace_correspondence
    WHERE status <> 'closed'
    ORDER BY created_at ASC
    LIMIT ${limit}
  `) as CorrespondenceRow[]
}

export async function getForPalace(id: string): Promise<CorrespondenceRow | null> {
  const rows = (await sql`
    SELECT * FROM palace_correspondence WHERE id = ${id} LIMIT 1
  `) as CorrespondenceRow[]
  return rows[0] ?? null
}

/** Move a letter to `in-review` or `closed`. Guarded in the statement by the states the
 *  action is allowed from, so two clerks acting at once cannot both succeed. */
export async function setStatus(
  id: string, status: 'in-review' | 'closed',
  allowedFrom: readonly CorrespondenceStatus[], handledBy: string,
): Promise<CorrespondenceRow | null> {
  const rows = (await sql`
    UPDATE palace_correspondence
    SET status = ${status}, handled_by = ${handledBy}, updated_at = NOW()
    WHERE id = ${id}
      AND status = ANY(${allowedFrom as unknown as string[]})
    RETURNING *
  `) as CorrespondenceRow[]
  return rows[0] ?? null
}

/** Record the Palace's reply. Sets the response and its timestamp together, which is what
 *  the table's own constraint requires. */
export async function recordResponse(
  id: string, response: string,
  allowedFrom: readonly CorrespondenceStatus[], handledBy: string,
): Promise<CorrespondenceRow | null> {
  const rows = (await sql`
    UPDATE palace_correspondence
    SET response     = ${response},
        responded_at = NOW(),
        status       = 'responded',
        handled_by   = ${handledBy},
        updated_at   = NOW()
    WHERE id = ${id}
      AND status = ANY(${allowedFrom as unknown as string[]})
    RETURNING *
  `) as CorrespondenceRow[]
  return rows[0] ?? null
}

/** Record a Palace working note. Deliberately does NOT change the status: jotting something
 *  down is not a decision, and a note must not quietly advance a letter. */
export async function recordInternalNote(
  id: string, note: string,
  allowedFrom: readonly CorrespondenceStatus[], handledBy: string,
): Promise<CorrespondenceRow | null> {
  const rows = (await sql`
    UPDATE palace_correspondence
    SET internal_note = ${note}, handled_by = ${handledBy}, updated_at = NOW()
    WHERE id = ${id}
      AND status = ANY(${allowedFrom as unknown as string[]})
    RETURNING *
  `) as CorrespondenceRow[]
  return rows[0] ?? null
}
