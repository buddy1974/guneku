import { FOLLOW_TOPICS, MY_QUARTER, isTopicId, type TopicId } from './follow-topics'
import { GUNEKU_QUARTERS_27 } from './quarters'

/* What the Fondom would send to people who asked to hear, and what it may never send.
 *
 * Pure: no database, no mailer, no session, no environment. The rules about *what may be
 * announced* are the part worth testing hardest, because the failure mode of a notification
 * system is not that a message fails to arrive — it is that a message arrives which should
 * never have left, carrying something private to a few hundred people at once.
 *
 * ── Nothing here sends ───────────────────────────────────────────────────────────────────
 *
 * There is deliberately no dispatch in this phase. Two things are missing and neither is
 * code that could be written here:
 *
 *   1. A sender the Fondom can use. `EMAIL_FROM` is unset in every environment, so mail
 *      leaves as `onboarding@resend.dev` — Resend's testing sender, which cannot deliver to
 *      arbitrary recipients and would be the wrong name on a letter from the Palace even if
 *      it could. A verified guneku.org sender needs SPF and DKIM records on the domain, and
 *      only the owner can create those.
 *
 *   2. A record of what was already sent. Duplicate protection across two requests means
 *      persistence, persistence means a migration, and a migration is the owner's decision.
 *
 * So this file, and the preflight built on it, go exactly as far as is safe: they say who
 * would be written to and what could be said, and stop. `docs/programme-architecture.md`
 * §3 has the sequence the send will follow when those two things exist.
 *
 * ── What may become a notification ───────────────────────────────────────────────────────
 *
 * Only published Guneku content, and only content that is published *now*. A draft, a
 * pending contribution, a claim, a letter to the Palace, a held film, a staged photograph
 * and an unpublished project are each excluded here rather than filtered later, because a
 * filter that runs late is a filter somebody can forget to run. */

/** The kinds of published record a notification may be about. A closed set, like the topic
 *  taxonomy it maps onto: an announcement about a thing Guneku does not publish is not an
 *  announcement, it is a leak. */
export const ANNOUNCEABLE = ['update', 'project', 'film', 'page'] as const
export type Announceable = (typeof ANNOUNCEABLE)[number]

export function isAnnounceable(v: unknown): v is Announceable {
  return typeof v === 'string' && (ANNOUNCEABLE as readonly string[]).includes(v)
}

/* ── What may never be announced ─────────────────────────────────────────────────────────
 *
 * Written as a list rather than left implicit, so that adding a kind of notification means
 * reading it. Each of these is something the platform holds and must never broadcast. */
export const NEVER_ANNOUNCE = [
  'a pending or draft contribution',
  'a profile claim, at any stage',
  'private Palace correspondence, including a reply',
  'a reviewer or Palace internal note',
  'a member\u2019s private profile fields',
  'held film or archive material',
  'a staged archive photograph',
  'an unpublished project or an unpublished page',
] as const

/** A notification target: one of the eight published topics, or a member's own quarter. */
export type NotifyAudience =
  | { kind: 'topic'; topic: TopicId }
  | { kind: 'quarter'; quarter: string }

export function parseAudience(v: unknown): NotifyAudience | null {
  if (isTopicId(v)) return { kind: 'topic', topic: v }
  if (typeof v === 'string' && (GUNEKU_QUARTERS_27 as readonly string[]).includes(v)) {
    return { kind: 'quarter', quarter: v }
  }
  return null
}

/** How an audience is stored in `follows`. The eight topics are ('topic', id); a quarter
 *  follow is ('quarter', <the canonical quarter name>) — which is what `MY_QUARTER` in the
 *  member's own UI resolves to when they choose it. */
export function subjectFor(audience: NotifyAudience): { type: 'topic' | 'quarter'; id: string } {
  return audience.kind === 'topic'
    ? { type: 'topic', id: audience.topic }
    : { type: 'quarter', id: audience.quarter }
}

export function audienceLabel(audience: NotifyAudience): string {
  if (audience.kind === 'quarter') return `${audience.quarter} quarter`
  return FOLLOW_TOPICS.find(t => t.id === audience.topic)?.label ?? audience.topic
}

/** Every audience the Fondom could write to: the eight topics, then the 27 quarters. */
export function allAudiences(): NotifyAudience[] {
  return [
    ...FOLLOW_TOPICS.map(t => ({ kind: 'topic', topic: t.id }) as NotifyAudience),
    ...GUNEKU_QUARTERS_27.map(q => ({ kind: 'quarter', quarter: q }) as NotifyAudience),
  ]
}

/* ── Why a follower may not be reachable ─────────────────────────────────────────────────
 *
 * Counted and shown rather than quietly dropped. A Palace clerk told "34 members follow
 * Projects" who then reaches 11 of them has been misled by their own admin screen; told "34
 * follow this, 11 have given an email", they know what they are looking at. */
export type Reachability = {
  followers: number
  withEmail: number
  withoutEmail: number
}

export function reachability(rows: Array<{ email: string | null }>): Reachability {
  const withEmail = rows.filter(r => usableAddress(r.email) !== null).length
  return { followers: rows.length, withEmail, withoutEmail: rows.length - withEmail }
}

/** An address that could actually be written to. Same shape the public forms accept, and the
 *  same refusal of anything that could turn one recipient into several — see
 *  `replyRecipient` in `correspondence.ts`, which enforces this for the Palace's own replies.
 *  Duplicated deliberately rather than shared: these are two different decisions that happen
 *  to agree today, and coupling them would mean loosening one loosens the other. */
export function usableAddress(email: string | null | undefined): string | null {
  if (typeof email !== 'string') return null
  const address = email.trim()
  if (!address || address.length > 200) return null
  if (/[,;<>\s"'\\]/.test(address)) return null
  if (/[\r\n]/.test(address)) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address)) return null
  return address
}

/** Distinct, writable addresses from a set of follower rows. Deduplicated, because two
 *  accounts sharing a household address must not mean two letters. */
export function recipientList(rows: Array<{ email: string | null }>): string[] {
  const seen = new Set<string>()
  for (const r of rows) {
    const address = usableAddress(r.email)
    if (address) seen.add(address.toLowerCase())
  }
  return [...seen].sort()
}

/* ── What the Fondom is not building ─────────────────────────────────────────────────────
 *
 * Stated here so a future reader knows these were decisions, not omissions. The brief for
 * Stay Connected ruled each of them out, and nothing since has changed it. */
export const NOT_BUILT = [
  'an automatic newsletter',
  'email triggered by publishing',
  'a digest scheduler',
  'a Palace broadcast to everybody',
  'marketing automation',
  'push notifications',
] as const

/** The two things that stand between the preflight and a send, in the order they must be
 *  resolved. Rendered to the Palace so the screen explains itself. */
export const SEND_BLOCKERS = [
  {
    what: 'A sender address the Fondom owns',
    why:
      'EMAIL_FROM is not set in any environment, so mail leaves as Resend\u2019s testing '
      + 'sender. That address cannot deliver to arbitrary recipients, and it would be the '
      + 'wrong name on a letter from the Palace even if it could.',
    needs:
      'SPF and DKIM records on guneku.org, which only the domain\u2019s owner can create, '
      + 'and then EMAIL_FROM set to the verified address.',
  },
  {
    what: 'A record of what has already been sent',
    why:
      'Without one, pressing send twice writes to every follower twice, and there is no way '
      + 'to honour a bounce or a complaint that Resend reports afterwards.',
    needs:
      'A small table for dispatches and suppressions \u2014 a migration, which is an owner '
      + 'decision rather than an engineering one.',
  },
] as const

export { MY_QUARTER }
