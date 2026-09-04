import { getFoundingName, type FoundingName } from './community'

/* The claiming workflow's rules, with no database and no Clerk in sight.
 *
 * Everything here is a pure decision over the reviewed records and a status string, which is
 * why it is a separate module from src/lib/db/claims.ts. Eligibility and state transitions
 * are the two places where getting it wrong is a harm rather than a bug — offering to claim a
 * dead person, or letting a claimant approve themselves — so they are written where they can
 * be read and tested in isolation. */

export const CLAIM_STATUSES = ['pending', 'approved', 'rejected', 'withdrawn'] as const
export type ClaimStatus = (typeof CLAIM_STATUSES)[number]

export function isClaimStatus(v: unknown): v is ClaimStatus {
  return typeof v === 'string' && (CLAIM_STATUSES as readonly string[]).includes(v)
}

/** A live claim occupies the record: it is the reason a second one cannot be made. Matches
 *  the partial unique indexes in migration 0002 exactly — if these ever disagree, the
 *  database is right and this is wrong. */
export const LIVE_STATUSES: readonly ClaimStatus[] = ['pending', 'approved']

export function isLive(status: ClaimStatus): boolean {
  return LIVE_STATUSES.includes(status)
}

/* ── Eligibility ─────────────────────────────────────────────────────────────────────────
 *
 * Read from explicit metadata on the record. Nothing is inferred: not from the absence of a
 * photograph, not from a date, not from wording in a note, and above all not from anything
 * that could be mistaken for a guess about whether someone is alive.
 *
 * `deceased` is set in founding-names.json and has been since the register was written. The
 * page for such an entry has never offered a claim action and says why: the record of a
 * Fondom includes those who are gone, and there is nobody to invite.
 *
 * `claimable: false` is the second lever, and it exists so that "this record should not be
 * claimed" can be a decision the Palace records in the data rather than a rule somebody
 * codes. Absent means claimable — the register is a register of living sons and daughters
 * and the ordinary case must not need a flag. */
export type Ineligible = 'unknown' | 'deceased' | 'not-claimable'

export type Eligibility =
  | { ok: true;  person: FoundingName }
  | { ok: false; reason: Ineligible }

export function claimEligibility(slug: unknown): Eligibility {
  if (typeof slug !== 'string' || !slug.trim()) return { ok: false, reason: 'unknown' }

  const person = getFoundingName(slug.trim())
  if (!person) return { ok: false, reason: 'unknown' }

  /* First and without exception. A deceased record is never claimable, by anybody, for any
     reason, and no other condition can override this. */
  if (person.deceased === true) return { ok: false, reason: 'deceased' }

  if (person.claimable === false) return { ok: false, reason: 'not-claimable' }

  return { ok: true, person }
}

export function isClaimable(slug: unknown): boolean {
  return claimEligibility(slug).ok
}

/** What a visitor is told, and it is all a visitor is told. A refusal never explains the
 *  moderation state of anybody else's claim. */
export const INELIGIBLE_MESSAGE: Record<Ineligible, string> = {
  unknown:
    'That entry is not in the Guneku register.',
  deceased:
    'This entry is kept as a record and is not offered for claiming. '
    + 'If something here is wrong, or the family would rather it were not published, '
    + 'the Palace contact page is open.',
  'not-claimable':
    'This entry is not open to be claimed. The Palace contact page is open if you need to '
    + 'reach the Fondom about it.',
}

/* ── Transitions ─────────────────────────────────────────────────────────────────────────
 *
 * Four states, and only three edges out of one of them. Every other move is refused, so a
 * replayed request, a stale browser tab or a crafted body cannot walk a claim backwards from
 * approved to pending or re-decide something already decided. */
export type ClaimAction = 'withdraw' | 'approve' | 'reject'

export const ACTION_RESULT: Record<ClaimAction, ClaimStatus> = {
  withdraw: 'withdrawn',
  approve:  'approved',
  reject:   'rejected',
}

export function isClaimAction(v: unknown): v is ClaimAction {
  return v === 'withdraw' || v === 'approve' || v === 'reject'
}

/** Only a pending claim can move. approved, rejected and withdrawn are terminal: a decision
 *  that can be quietly revised later is not a decision. Reopening one is a deliberate act for
 *  a human with database access, not an API call. */
export function canTransition(from: ClaimStatus, action: ClaimAction): boolean {
  return from === 'pending' && isClaimAction(action)
}

/** Who may perform which action. Authorisation is enforced server-side in the route against
 *  the Clerk session; this states the rule in one place so both sides agree.
 *
 *  A claimant may withdraw their own claim and may do nothing else — most importantly, a
 *  claimant can never approve their own claim, which is the whole reason review exists. */
export function actorFor(action: ClaimAction): 'claimant' | 'reviewer' {
  return action === 'withdraw' ? 'claimant' : 'reviewer'
}

/** Claimant-facing wording. Deliberately neutral for a rejection: the claimant is told the
 *  outcome and where to go next, never a reviewer's reasoning, and never who decided. */
export const STATUS_LABEL: Record<ClaimStatus, string> = {
  pending:   'Awaiting review',
  approved:  'Confirmed',
  rejected:  'Not confirmed',
  withdrawn: 'Withdrawn',
}

export const STATUS_NOTE: Record<ClaimStatus, string> = {
  pending:
    'The Palace has your request. Nothing on the public record has changed, and nothing will '
    + 'change without a person reviewing it first.',
  approved:
    'Your Guneku member account is now associated with this record. The record itself is '
    + 'unchanged — its history, office and sources stay as the Fondom holds them.',
  rejected:
    'This request was not confirmed. You can write to the Palace if you would like to take '
    + 'it further.',
  withdrawn:
    'You withdrew this request. You may make it again if you wish.',
}
