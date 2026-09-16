import 'server-only'
import { requireUser, AuthError, type GunekuUser } from './auth'
import { sql } from './db/client'
import { getFoundingName } from './community'

/* Who may register a business, and the one question that decides it.
 *
 * ── Not every account is a Gunekuan ──────────────────────────────────────────────────────
 *
 * Anybody may open a Clerk account on this site; that is what lets a visitor write to the
 * Palace or follow a project. It establishes that somebody exists and can receive email. It
 * establishes nothing whatever about Guneku.
 *
 * The Business Directory says, on every card, that these are the businesses of sons and
 * daughters of Guneku. That sentence is the product. So the gate is not "are you signed in"
 * and not "have you filled in a profile" — it is:
 *
 *     has a person at the Palace reviewed this account and associated it with a
 *     named son or daughter of Guneku in the register?
 *
 * Which is exactly what an APPROVED PROFILE CLAIM is (ADR-047). The claim workflow already
 * exists, already has a reviewer queue, and already guarantees one approved claim per person.
 * Nothing new is invented here: this reads the answer that workflow produces.
 *
 * ── Enforced server-side, and only server-side ───────────────────────────────────────────
 *
 * A hidden button is not a permission. Every route that creates or changes a business calls
 * `requireVerifiedGunekuan()` first, and a hand-made POST from a signed-in stranger fails on
 * the same line a browser would. The page-level check exists to be kind; this one exists to
 * be true. */

/** A member the Palace has reviewed and associated with a register entry. */
export type VerifiedGunekuan = GunekuUser & {
  /** The register slug the approved claim points at. Read from the database, never a body. */
  personSlug: string
  /** How that person is written in the register, for greeting them by their own name. */
  personDisplay: string
}

/** What a visitor is told, and all they are told. It does not say whether they have a claim,
 *  whether one is pending, or what the register holds — a refusal is not a place to leak the
 *  moderation state of somebody's identity. */
export const NOT_VERIFIED_MESSAGE =
  'Business registration is available to verified Gunekuans.'

/** The approved claim for this account, or null. One row at most: the database enforces one
 *  approved claim per member per record, and the reviewer workflow enforces one per person. */
export async function approvedPersonSlug(clerkUserId: string): Promise<string | null> {
  const rows = (await sql`
    SELECT person_slug FROM profile_claims
    WHERE clerk_user_id = ${clerkUserId}
      AND status = 'approved'
    ORDER BY reviewed_at DESC NULLS LAST
    LIMIT 1
  `) as Array<{ person_slug: string }>
  return rows[0]?.person_slug ?? null
}

/** The signed-in member if the Palace has verified who they are in Guneku; otherwise a 403.
 *
 *  A 403 rather than a 401 is deliberate for a signed-in caller: they are known, they simply
 *  may not do this. A signed-out caller gets the 401 `requireUser` raises, one line earlier. */
export async function requireVerifiedGunekuan(): Promise<VerifiedGunekuan> {
  const user = await requireUser()

  const personSlug = await approvedPersonSlug(user.userId)
  if (!personSlug) throw new AuthError(NOT_VERIFIED_MESSAGE, 403)

  /* The claim points at the register by slug and the register is upstream of this database,
     so the entry can in principle have been withdrawn since the claim was approved. If the
     person is no longer in the register there is nobody to attach a business to, and saying
     so is better than writing a row pointing at nothing. */
  const person = getFoundingName(personSlug)
  if (!person) throw new AuthError(NOT_VERIFIED_MESSAGE, 403)

  return { ...user, personSlug, personDisplay: person.display }
}

/** The same question without the throw, for a page that wants to render an explanation
 *  rather than an error. Returns null for a visitor, for a member with no approved claim, and
 *  for anything that goes wrong reading the answer — the safe direction is "not verified". */
export async function optionalVerifiedGunekuan(): Promise<VerifiedGunekuan | null> {
  try {
    return await requireVerifiedGunekuan()
  } catch {
    return null
  }
}
