import { getFoundingName, getBody, getChapter } from './community'
import { GUNEKU_QUARTERS_27 } from './quarters'

/* Moderated contributions: the rules, with no database and no Clerk in sight.
 *
 * ── The standing editorial principle this implements ─────────────────────────────────────
 *
 *   STRUCTURAL COMPLETENESS IS ENCOURAGED. FACTUAL FABRICATION IS PROHIBITED.
 *
 * Guneku must not hide a known institution merely because its record is incomplete. A
 * quarter council that exists but whose members the archive does not name should appear —
 * named as a structure, honest about the gap, and with a way for the people who know to
 * supply it. What must never happen is the gap being filled by invention.
 *
 * So the four cases, and what each one means here:
 *
 *   known fact                     publish it accurately
 *   known body, incomplete record  show the structure, publish what is known, say plainly
 *                                  what is missing, and offer this contribution route
 *   unknown person or office       never invent — no placeholder name, no "TBC" that reads
 *                                  as a person, no inferred office-holder
 *   owner-supplied correction      authoritative, unless the owner marks it tentative
 *
 * ── Contribution is not publication ──────────────────────────────────────────────────────
 *
 * Accepting a contribution changes no canonical content. It records that Guneku has reviewed
 * it and accepted it for editorial action; the editing is a separate, deliberate act by a
 * person. Nothing in this module or the ones that use it can write to a reviewed record, and
 * the wording throughout says "accepted for editorial action" rather than "published",
 * because telling a contributor their information is live when it is not would be a lie the
 * site tells on the Fondom's behalf. */

/* ── Types ───────────────────────────────────────────────────────────────────────────────
 * A closed list. An arbitrary type would let a caller invent categories of contribution the
 * Palace has no process for, and a queue is only reviewable if its contents are predictable. */

export const CONTRIBUTION_TYPES = [
  'correction', 'missing-information', 'quarter-information', 'gudeca-information',
  'person-information', 'history-culture', 'photo-archive', 'other',
] as const

export type ContributionType = (typeof CONTRIBUTION_TYPES)[number]

export function isContributionType(v: unknown): v is ContributionType {
  return typeof v === 'string' && (CONTRIBUTION_TYPES as readonly string[]).includes(v)
}

export const TYPE_LABEL: Record<ContributionType, string> = {
  'correction':          'A correction',
  'missing-information': 'Something missing',
  'quarter-information': 'About a quarter',
  'gudeca-information':  'About GUDECA',
  'person-information':  'About a person in the register',
  'history-culture':     'History or culture',
  'photo-archive':       'Photographs or archive material',
  'other':               'Something else',
}

export const TYPE_HINT: Record<ContributionType, string> = {
  'correction':          'Something in the record is wrong and should be put right.',
  'missing-information': 'The record is silent about something you know.',
  'quarter-information': 'A quarter — its council, its institutions, its families, its life.',
  'gudeca-information':  'A GUDECA chapter or its executive.',
  'person-information':  'Something to add or correct about a person already in the register.',
  'history-culture':     'Custom, language, chronology, or how something came to be.',
  'photo-archive':       'You hold photographs or documents the Fondom should see.',
  'other':               'Anything the categories above do not cover.',
}

/* ── Targets ─────────────────────────────────────────────────────────────────────────────
 * What a contribution is about. Every id is checked against the reviewed records before a
 * row is written, so a browser cannot invent a quarter, a person, a body or a chapter. */

export const TARGET_TYPES = ['quarter', 'person', 'body', 'chapter', 'page', 'general'] as const
export type TargetType = (typeof TARGET_TYPES)[number]

export function isTargetType(v: unknown): v is TargetType {
  return typeof v === 'string' && (TARGET_TYPES as readonly string[]).includes(v)
}

const QUARTERS = new Set<string>(GUNEKU_QUARTERS_27)

/* A path, not a canonical identity. It is stored so a reviewer knows which page a reader was
   looking at, and it is rendered as text and never as a link — a value from a request body
   that becomes an href is how an open redirect starts. The charset is deliberately narrow. */
const PAGE_PATH = /^\/[A-Za-z0-9/_-]{0,120}$/

export type ResolvedTarget =
  | { ok: true;  targetType: TargetType; targetId: string | null; label: string }
  | { ok: false; error: string }

/** Validates a target against the canonical records. The label it returns is read from those
 *  records, never from the request — so a reviewer's queue shows the Fondom's own name for a
 *  thing, not a name a contributor typed. */
export function resolveTarget(targetType: unknown, targetId: unknown): ResolvedTarget {
  if (!isTargetType(targetType)) {
    return { ok: false, error: 'That is not something you can contribute about.' }
  }

  if (targetType === 'general') {
    return { ok: true, targetType, targetId: null, label: 'The Guneku record in general' }
  }

  if (typeof targetId !== 'string' || !targetId.trim()) {
    return { ok: false, error: 'Please say which record this concerns.' }
  }
  const id = targetId.trim()

  switch (targetType) {
    case 'quarter': {
      if (!QUARTERS.has(id)) {
        return { ok: false, error: 'That is not one of the quarters the Fondom publishes.' }
      }
      return { ok: true, targetType, targetId: id, label: `${id} quarter` }
    }
    case 'person': {
      const person = getFoundingName(id)
      if (!person) return { ok: false, error: 'That entry is not in the Guneku register.' }
      /* A deceased record is deliberately allowed here. It cannot be *claimed* — there is
         nobody to invite — but a family or a neighbour correcting what the archive says
         about someone who has gone is exactly the kind of contribution a village record
         needs, and refusing it would lose the people who remember best. */
      return { ok: true, targetType, targetId: person.slug, label: person.display }
    }
    case 'body': {
      const body = getBody(id)
      if (!body) return { ok: false, error: 'That is not a body the Fondom records.' }
      return { ok: true, targetType, targetId: body.id, label: body.name }
    }
    case 'chapter': {
      const chapter = getChapter(id)
      if (!chapter) return { ok: false, error: 'That is not a chapter the Fondom records.' }
      return { ok: true, targetType, targetId: chapter.id, label: `${chapter.org} — ${chapter.place}` }
    }
    case 'page': {
      if (!PAGE_PATH.test(id)) {
        return { ok: false, error: 'That is not a page on Guneku.org.' }
      }
      return { ok: true, targetType, targetId: id, label: id }
    }
  }
}

/* ── Workflow ────────────────────────────────────────────────────────────────────────────
 * Four states and three edges, all out of pending. Same shape as the claim workflow, and
 * deliberately so: one moderation vocabulary is easier to reason about than two. */

export const CONTRIBUTION_STATUSES = ['pending', 'accepted', 'rejected', 'withdrawn'] as const
export type ContributionStatus = (typeof CONTRIBUTION_STATUSES)[number]

export type ContributionAction = 'withdraw' | 'accept' | 'reject'

export const ACTION_RESULT: Record<ContributionAction, ContributionStatus> = {
  withdraw: 'withdrawn',
  accept:   'accepted',
  reject:   'rejected',
}

export function isContributionAction(v: unknown): v is ContributionAction {
  return v === 'withdraw' || v === 'accept' || v === 'reject'
}

/** Only a pending contribution can move. The other three are terminal. */
export function canTransition(from: ContributionStatus, action: ContributionAction): boolean {
  return from === 'pending' && isContributionAction(action)
}

/** A contributor may withdraw their own submission and may do nothing else. Accepting and
 *  rejecting belong to a reviewer, and never to the person who submitted. */
export function actorFor(action: ContributionAction): 'contributor' | 'reviewer' {
  return action === 'withdraw' ? 'contributor' : 'reviewer'
}

/* Contributor-facing wording.
 *
 * "Accepted" deliberately does not say "published". An accepted contribution has been taken
 * up for editorial action; whether and when it becomes part of the public record is a
 * separate decision by a person. Saying "published" would tell somebody their grandmother's
 * name is on the site when it is not. */
export const STATUS_LABEL: Record<ContributionStatus, string> = {
  pending:   'Awaiting review',
  accepted:  'Accepted for editorial action',
  rejected:  'Not taken up',
  withdrawn: 'Withdrawn',
}

export const STATUS_NOTE: Record<ContributionStatus, string> = {
  pending:
    'The Palace has what you sent. Nothing on the public record has changed, and nothing will '
    + 'change without a person reviewing it first.',
  accepted:
    'Guneku has accepted this for editorial action. That is not the same as it being on the '
    + 'site yet — updating the record is a separate step, done by a person.',
  rejected:
    'This was not taken up. You can write to the Palace if you would like to take it further.',
  withdrawn:
    'You withdrew this. You may send it again if you wish.',
}

export const MAX_CONTENT = 4000
export const MAX_SOURCE  = 1000
