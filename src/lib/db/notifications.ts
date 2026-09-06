import 'server-only'
import { sql } from './client'
import { subjectFor, type NotifyAudience } from '@/lib/notify'

/* Who would be written to, if the Fondom could write. Reads only; there is no send in this
 * phase and nothing here writes a row.
 *
 * Every statement names `follows` and `community_members` and nothing else. No canonical
 * Guneku record is reachable from this module, and no table holding moderation content —
 * claims, contributions, correspondence — is joined to it. A notification audience is built
 * from two facts and no others: somebody asked to hear about a thing, and they gave an
 * address.
 *
 * ── Why the email comes from `community_members` and not from Clerk ──────────────────────
 *
 * Clerk holds the address a person signed up with. `community_members.email` holds the one
 * they gave Guneku, and it is the one the member can see and change in My Guneku. Writing to
 * the sign-up address instead would mean writing to an address the member was never shown in
 * the context of the Fondom asking to write to them — and it would put a Clerk read on a path
 * that has no need of one. The join is on `clerk_user_id`, which both tables already carry. */

export type FollowerRow = {
  clerk_user_id: string
  email: string | null
  display_name: string | null
}

/** Everyone following one audience, with whatever address the member gave Guneku.
 *
 *  Unfollowing is the unsubscribe. There is no second opt-out list to fall out of step with
 *  it: the row is deleted by `removeFollow`, so it is not returned here, so nothing could be
 *  addressed to them. That is why unsubscribe works without any code that implements
 *  unsubscribing. */
export async function followersOf(audience: NotifyAudience): Promise<FollowerRow[]> {
  const { type, id } = subjectFor(audience)
  return (await sql`
    SELECT f.clerk_user_id, m.email, m.display_name
    FROM follows f
    LEFT JOIN community_members m ON m.clerk_user_id = f.clerk_user_id
    WHERE f.subject_type = ${type}
      AND f.subject_id   = ${id}
    ORDER BY f.created_at ASC
  `) as FollowerRow[]
}

/** Follower counts for every audience at once, so a preflight screen is one query rather
 *  than thirty-five. Returns raw counts; the reachability split is computed in `notify.ts`,
 *  which is pure and tested. */
export async function followerCounts(): Promise<
  Array<{ subject_type: string; subject_id: string; followers: number; with_email: number }>
> {
  return (await sql`
    SELECT f.subject_type,
           f.subject_id,
           COUNT(*)::int AS followers,
           COUNT(m.email)::int AS with_email
    FROM follows f
    LEFT JOIN community_members m ON m.clerk_user_id = f.clerk_user_id
    WHERE f.subject_type IN ('topic', 'quarter')
    GROUP BY f.subject_type, f.subject_id
  `) as Array<{ subject_type: string; subject_id: string; followers: number; with_email: number }>
}
