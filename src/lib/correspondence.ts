/* Palace correspondence: the rules, with no database, no Clerk and no mailer.
 *
 * ── What this is, and what it is not ─────────────────────────────────────────────────────
 *
 *   A contribution says   "the public Guneku record should be changed."
 *   Correspondence says   "I want to speak to the Palace about something."
 *
 * The first is reviewed and may eventually alter a page. The second is private, is never
 * published anywhere, and is answered rather than acted upon. Keeping them apart is the
 * point: a letter to the Fon about a family matter must never end up in a queue whose
 * purpose is editing the public record.
 *
 * ── Who may speak to the Palace ──────────────────────────────────────────────────────────
 *
 * Anybody. A villager does not need an account to write to their own Fon, and the existing
 * public form keeps working exactly as it does today. Signing in adds one thing: the letter
 * also appears privately in My Guneku, so the sender can see where it has got to. */

export const CORRESPONDENCE_CATEGORIES = [
  'general-enquiry', 'palace-matter', 'community-matter', 'development-matter',
  'cultural-matter', 'information-request', 'other',
] as const

export type CorrespondenceCategory = (typeof CORRESPONDENCE_CATEGORIES)[number]

export function isCategory(v: unknown): v is CorrespondenceCategory {
  return typeof v === 'string'
    && (CORRESPONDENCE_CATEGORIES as readonly string[]).includes(v)
}

export const CATEGORY_LABEL: Record<CorrespondenceCategory, string> = {
  'general-enquiry':     'General enquiry',
  'palace-matter':       'A Palace matter',
  'community-matter':    'A community matter',
  'development-matter':  'Development or a project',
  'cultural-matter':     'Culture or tradition',
  'information-request': 'A request for information',
  'other':               'Something else',
}

/* ── The public form's own topic list ────────────────────────────────────────────────────
 *
 * `PALACE_TOPICS` in the modal has eleven entries and has been in front of visitors for
 * some time. It is not replaced — changing what a working public form offers, to suit a
 * database column added afterwards, is the tail wagging the dog. The topics are mapped onto
 * the seven categories here, and the visitor's own words are kept verbatim as the subject.
 *
 * Anything unmapped becomes 'other' rather than being refused: a topic the Palace has been
 * accepting for months must not start failing because a mapping table is short. */
const TOPIC_TO_CATEGORY: Record<string, CorrespondenceCategory> = {
  'Palace / traditional matters': 'palace-matter',
  'Community development':        'community-matter',
  'Project support':              'development-matter',
  'GUDECA':                       'community-matter',
  'Education':                    'community-matter',
  'Culture':                      'cultural-matter',
  'Diaspora':                     'community-matter',
  'Business / partnership':       'other',
  'Visit / appointment request':  'palace-matter',
  'General enquiry':              'general-enquiry',
  'Other':                        'other',
}

export function categoryForTopic(topic: string): CorrespondenceCategory {
  return TOPIC_TO_CATEGORY[topic.trim()] ?? 'other'
}

/* ── Workflow ────────────────────────────────────────────────────────────────────────────
 * Four states. Not a CRM: no assignment, no priority, no SLA, no pipeline stages. */

export const CORRESPONDENCE_STATUSES = ['received', 'in-review', 'responded', 'closed'] as const
export type CorrespondenceStatus = (typeof CORRESPONDENCE_STATUSES)[number]

export function isStatus(v: unknown): v is CorrespondenceStatus {
  return typeof v === 'string'
    && (CORRESPONDENCE_STATUSES as readonly string[]).includes(v)
}

export type PalaceAction = 'begin-review' | 'respond' | 'close' | 'note'

export function isPalaceAction(v: unknown): v is PalaceAction {
  return v === 'begin-review' || v === 'respond' || v === 'close' || v === 'note'
}

/** What each action leaves the letter in. `note` is deliberately absent: recording a working
 *  note is not a change of state, and a Palace clerk jotting something down must not silently
 *  advance a letter towards closed. */
export const ACTION_RESULT: Record<Exclude<PalaceAction, 'note'>, CorrespondenceStatus> = {
  'begin-review': 'in-review',
  'respond':      'responded',
  'close':        'closed',
}

/** Which states an action may be taken from. A closed letter is finished: reopening it is a
 *  deliberate act for someone with database access, not an API call. */
const ALLOWED_FROM: Record<PalaceAction, readonly CorrespondenceStatus[]> = {
  'begin-review': ['received'],
  'respond':      ['received', 'in-review'],
  'close':        ['received', 'in-review', 'responded'],
  /* A note may be recorded at any point up to closing — including on a letter already
     answered, because the Palace may want to record what was said afterwards. */
  'note':         ['received', 'in-review', 'responded'],
}

export function canAct(from: CorrespondenceStatus, action: PalaceAction): boolean {
  return ALLOWED_FROM[action]?.includes(from) ?? false
}

/* ── What the sender is told ─────────────────────────────────────────────────────────────
 *
 * Plain, and never a promise the Palace has not made. "Received" does not say when somebody
 * will reply, because nobody has undertaken to. */
export const STATUS_LABEL: Record<CorrespondenceStatus, string> = {
  'received':  'Received',
  'in-review': 'With the Palace',
  'responded': 'Answered',
  'closed':    'Closed',
}

export const STATUS_NOTE: Record<CorrespondenceStatus, string> = {
  'received':
    'The Palace has your message. It is private, and it is not published anywhere on '
    + 'Guneku.org.',
  'in-review':
    'Someone at the Palace is looking at this.',
  'responded':
    'The Palace has answered. The reply is below.',
  'closed':
    'This correspondence is closed. You may write again if there is more to say.',
}

export const MAX = {
  name:     120,
  email:    200,
  phone:    60,
  subject:  200,
  message:  4000,
  response: 6000,
  note:     4000,
} as const

/** The Palace answers as the Palace. A response is institutional correspondence from the
 *  Fondom unless the person writing it identifies themselves in their own words — this
 *  system never signs a letter with a name, and above all never signs one as the Fon. */
export const RESPONSE_ATTRIBUTION = 'The Guneku Palace'

/* ── Answering by email ──────────────────────────────────────────────────────────────────
 *
 * Until 2026-09-06 the Palace could write a reply and the sender never received it. The
 * reply was persisted, the status became `responded`, and a villager who had written in
 * without an account had no way to see it: My Guneku shows a letter only to the signed-in
 * account that wrote it, and most people write in signed out.
 *
 * Delivery is now part of `respond`, and these functions are the whole of the rules — kept
 * out here where they can be tested without a mailer, a database or a session.
 *
 * Consent is not inferred from the address alone. The public form requires the sender to
 * confirm that the Palace may use their details to reply, and refuses an address that fails
 * validation. An address in the record therefore means somebody gave it for this purpose.
 * It is validated again here anyway, because by the time a letter is answered the record is
 * old data, and because a reply is the one moment this system sends something outward. */

/** The address a reply may be sent to, or null. Null is an ordinary outcome rather than a
 *  failure: plenty of letters arrive with a callback number and no email at all. */
export function replyRecipient(senderEmail: string | null | undefined): string | null {
  if (typeof senderEmail !== 'string') return null
  const address = senderEmail.trim()
  if (!address || address.length > MAX.email) return null

  /* Recipient injection. A mail API accepts an array or a comma-separated string, so an
     address carrying a comma, a semicolon, angle brackets or whitespace could turn one
     recipient into several — and the extra ones would receive a stranger's private letter
     to their Fon. Rejected outright rather than split and cleaned up. */
  if (/[,;<>\s"'\\]/.test(address)) return null

  /* Header injection. Neither CR nor LF survives the check above; this states the intent
     rather than leaving it as a consequence. */
  if (/[\r\n]/.test(address)) return null

  /* The same shape the public form accepts. Deliberately identical: an address good enough
     to write in with is good enough to be answered at, and a stricter rule here would mean
     silently declining to answer somebody the form had already accepted. */
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address)) return null

  return address
}

/** What happened when the Palace pressed send. Reported to the Palace, never to the sender,
 *  and never allowed to undo the reply — the letter is answered either way. */
export type ReplyDelivery = 'sent' | 'no-recipient' | 'failed'

export const DELIVERY_NOTE: Record<ReplyDelivery, string> = {
  'sent':
    'The reply was recorded and emailed to the sender.',
  'no-recipient':
    'The reply was recorded. This letter carries no email address, so nothing was sent — if '
    + 'a callback number was given, the Palace will need to telephone.',
  'failed':
    'The reply was recorded, but the email could not be sent. Nothing was lost: the reply is '
    + 'saved, and it can be sent another way.',
}

/** A single line of somebody's own text, made safe to place in a mail subject. */
export function subjectLine(text: string, limit = 120): string {
  return text.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, limit)
}
