/* The community register: chapters, and the founding names seeded into the
 * Indigenes Directory.
 *
 * Two rules this module exists to enforce.
 *
 * A CHAPTER IS NOT A CITY. This is the correction that shaped the model. The
 * Germany chapter was first recorded as "Essen — Ruhr Valley", then corrected to
 * "Bonn", and both were wrong in the same way: GUDECA EU is a Europe-wide chapter
 * whose meetings rotate, and Bonn is the official residence of H.R.H. the Fon —
 * where the March 2026 meeting happened to be held, not where the chapter sits.
 * So `kind` separates a constituted chapter from a place people live, and a
 * chapter carries `place` (free text, "Meetings rotate across Europe") rather
 * than a city field that invites the same mistake a third time.
 *
 * ONE SOURCE. /diaspora, /gudeca and the chapter pages all read `chapters.json`,
 * so a fact about a chapter is corrected once, in one file.
 *
 * A BODY IS NOT A PLACE. A chapter answers "where", a body answers "which office".
 * Thadeus Fon is General President of GUDECA and a member of the Douala chapter, and
 * both are true at once, so `body` and `chapter` are separate fields and either may
 * be absent. The Traditional Council is the governing body of the village — His
 * Royal Highness is the king, and these are the people through whom Guneku is
 * governed — so it gets a register of its own rather than a paragraph in an article.
 *
 * A SEED STUB IS NOT A PROFILE. A founding name publishes four things and no
 * more — display name, role, chapter, and the source the name came from. Every
 * other field belongs to the person, and arrives only when they claim the entry
 * and fill it in themselves. `CardSafe` below is that contract in the type
 * system: it is the only shape a stub component may render.
 */

import chaptersDoc from '@/data/community/chapters.json'
import bodiesDoc   from '@/data/community/bodies.json'
import namesDoc    from '@/data/community/founding-names.json'

export type ChapterScope = 'home' | 'diaspora'
export type ChapterKind  = 'chapter' | 'location'

export interface Chapter {
  id: string
  /** A constituted chapter keeps a register. A location is a place people live. */
  kind: ChapterKind
  scope: ChapterScope
  flag: string
  country: string
  /** Where this body actually sits. For a chapter that rotates, it says so. */
  place: string
  /** Short badge label — "GUDECA EU", "Douala". */
  short: string
  org: string
  /** A location under a chapter: names recorded here belong to that chapter. */
  partOf?: string
  note?: string
  openForNames: boolean
}

export type BodyKind = 'governing' | 'association' | 'committee' | 'household' | 'royal'

export interface Body {
  id: string
  order: number
  name: string
  short: string
  kind: BodyKind
  standfirst: string
  /** The year the roster describes, or 'undated'. Always shown. */
  asRecorded: string
  sourceNote: string
  chapter?: string
  route?: string
  routeLabel?: string
}

export interface FoundingName {
  slug: string
  display: string
  aliases: string[]
  role: string
  /** The office-holding body, if any. */
  body?: string
  /** The place, if any. Null for an officer whose location the record omits. */
  chapter: string | null
  source: string
  sourceLabel: string
  /** Only where the person already has a published profile on this site. */
  profileUrl?: string
  /** Recorded with respect, and never offered for claiming. */
  deceased?: boolean

  /* ── The independent dimensions ─────────────────────────────────────────────────────────
     A person can hold several of these at once, and none of them implies another. Keeping
     them apart is the whole point of the 2026-09-03 correction: the site had been treating
     professional prominence as though it conferred traditional standing, which it does not. */

  /** Traditional governance standing around the Fon. Set explicitly, never derived from
   *  profession, prominence, education or diaspora achievement. */
  notable?: boolean
  notableNote?: string

  /** A place in the Royal Family. `'queen'` for a Queen of the Palace. The Palace is a
   *  polygamous household: several Queens is the normal case, and no seniority among them is
   *  recorded or implied. */
  royalRole?: 'queen' | null

  /** Country of residence, where the record establishes one. Feeds the diaspora dimension
   *  when a person's chapter does not already settle it. */
  residence?: string | null

  profession?: string
  professionPlace?: string
  photo?: string
  note?: string
}

/** Everything a seed stub is allowed to render. Widening this type is a
 *  publication decision, not a refactor — see founding-names.json. */
export interface CardSafe {
  /** A fact about the person, never an office and never a title. */
  profession?: string | null
  notable?: boolean
  royalRole?: 'queen' | null
  slug: string
  display: string
  role: string
  sourceLabel: string
  profileUrl?: string
  deceased: boolean
  chapter: Chapter | null
  body: Body | null
}

const CHAPTERS = (chaptersDoc.chapters as Chapter[])
const BODIES   = (bodiesDoc.bodies as Body[]).slice().sort((a, b) => a.order - b.order)
const NAMES    = (namesDoc.names as FoundingName[])

export function allChapters(): Chapter[] {
  return CHAPTERS
}

export function chaptersByScope(scope: ChapterScope): Chapter[] {
  return CHAPTERS.filter(c => c.scope === scope)
}

export function getChapter(id: string): Chapter | null {
  return CHAPTERS.find(c => c.id === id) ?? null
}

export function allFoundingNames(): FoundingName[] {
  return NAMES
}

export function getFoundingName(slug: string): FoundingName | null {
  return NAMES.find(n => n.slug === slug) ?? null
}

export function foundingNamesFor(chapterId: string): FoundingName[] {
  const c  = getChapter(chapterId)
  const id = c ? registerIdFor(c) : chapterId
  return NAMES.filter(n => n.chapter === id)
}

/** How many seeded names a place shows — its own register, or its chapter's. */
export function foundingCount(chapterId: string): number {
  return foundingNamesFor(chapterId).length
}

export function toCardSafe(n: FoundingName): CardSafe {
  return {
    slug:        n.slug,
    display:     n.display,
    role:        n.role,
    sourceLabel: n.sourceLabel,
    profileUrl:  n.profileUrl,
    deceased:    Boolean(n.deceased),
    chapter:     n.chapter ? getChapter(n.chapter) : null,
    body:        n.body ? getBody(n.body) : null,
    /* Carried onto the card because the Fondom supplied it — Humphrey Njoh Munan is recorded
       as a businessman, and a card that dropped it would quietly lose what was given. It is
       a fact about the person, not an office, and it is never a reason to call them a
       Notable. */
    profession:  n.profession ?? null,
    notable:     n.notable === true,
    royalRole:   n.royalRole ?? null,
  }
}

/* ── Bodies ───────────────────────────────────────────────────────────────── */

/* ── Notables ────────────────────────────────────────────────────────────────────────────
 * A Guneku Notable holds a place in the traditional governance of the village around the Fon.
 * It is not a word for a distinguished son or daughter, and the site said otherwise until
 * 2026-09-03 — /notables was a two-card professional directory, which inverted the meaning.
 *
 * Nothing here infers standing. `notable` is set in the record, and the only rule applied is
 * that every member of the Traditional Council holds it, because that is what the council is.
 * Appearing in a record as an election official, a witness, a clergyman or a participant does
 * not make anyone a Notable. */
export function isNotable(n: FoundingName): boolean {
  return n.notable === true
}

export function allNotables(): FoundingName[] {
  return NAMES.filter(isNotable)
}

/* ── Diaspora ────────────────────────────────────────────────────────────────────────────
 * Diaspora means a Guneku person living outside Cameroon. That is all it means. It is not a
 * second word for distinguished, and it is not conferred by GUDECA office.
 *
 * Derived, never stored, from two things the record already establishes:
 *   - a chapter whose scope is 'diaspora' (GUDECA EU, GUDECA US, and the overseas locations)
 *   - a residence outside Cameroon
 *
 * Yaoundé, Douala, Bamenda and Mbengwi are home chapters, so their members are not diaspora
 * however senior their office. */
export function isDiaspora(n: FoundingName): boolean {
  if (n.residence) {
    return n.residence.trim().toLowerCase() !== 'cameroon'
  }
  if (!n.chapter) return false
  const c = CHAPTERS.find(x => x.id === n.chapter)
  return c?.scope === 'diaspora'
}

export function diasporaNames(): FoundingName[] {
  return NAMES.filter(isDiaspora)
}

/** Diaspora people grouped by the chapter or place that establishes it. */
export function diasporaByChapter(): Array<{ chapter: Chapter; people: FoundingName[] }> {
  return CHAPTERS
    .filter(c => c.scope === 'diaspora')
    .map(chapter => ({ chapter, people: NAMES.filter(n => n.chapter === chapter.id) }))
    .filter(g => g.people.length > 0)
}

/* ── The Royal Family ────────────────────────────────────────────────────────────────────
 * The Queens are returned in register order. No ordering by seniority is applied, because
 * none is recorded — inventing "first" or "senior" would be inventing royal hierarchy. */
export const ROYAL_FAMILY_BODY = 'palace-household'

export function palaceQueens(): FoundingName[] {
  return NAMES.filter(n => n.royalRole === 'queen')
}

export function royalFamilyOthers(): FoundingName[] {
  return NAMES.filter(n => n.body === ROYAL_FAMILY_BODY && n.royalRole !== 'queen')
}

/* ── Sons and daughters ──────────────────────────────────────────────────────────────────
 * The professional and community profiles. Deliberately separate from Notables: professional
 * prominence is not a traditional title, and conflating them is the error being corrected. */
export function hasProfile(n: FoundingName): boolean {
  return Boolean(n.profileUrl)
}

export function allBodies(): Body[] {
  return BODIES
}

export function getBody(id: string): Body | null {
  return BODIES.find(b => b.id === id) ?? null
}

/** The members of a body, in the order the register lists them — which is the
 *  order of office, not alphabetical. A roster read alphabetically loses its
 *  meaning: the Chairman belongs at the top. */
export function membersOf(bodyId: string): FoundingName[] {
  return NAMES.filter(n => n.body === bodyId)
}

export function memberCount(bodyId: string): number {
  return membersOf(bodyId).length
}

/** The governing body of the village. Named once, here. */
export const GOVERNING_BODY = 'traditional-council'

/** How a roster's date is written. An undated roster says so plainly rather than
 *  reading "as recorded undated" — the date is the reader's warning that a roster
 *  may be out of date, so it has to be legible. */
export function recordedLabel(b: Body): string {
  return b.asRecorded === 'undated' ? 'undated' : `as recorded ${b.asRecorded}`
}

/* ── Chapters vs locations ────────────────────────────────────────────────── */

/** Only constituted chapters keep a register of their own. */
export function constitutedChapters(scope?: ChapterScope): Chapter[] {
  return CHAPTERS.filter(c => c.kind === 'chapter' && (!scope || c.scope === scope))
}

/** Where a place's names are actually recorded: its parent chapter, or itself. */
export function registerIdFor(c: Chapter): string {
  return c.partOf ?? c.id
}

/** The chapter a place belongs to, if it belongs to one. */
export function parentChapter(c: Chapter): Chapter | null {
  return c.partOf ? getChapter(c.partOf) : null
}

/** How a place is written on a card or in a sentence. */
export function placeLabel(c: Chapter): string {
  return c.kind === 'chapter' && c.country === 'Europe' ? c.org : `${c.place}, ${c.country}`
}

/* ── The one submission contract ───────────────────────────────────────────
   Claiming your own entry, adding somebody to a chapter, and asking for a name
   to come down are the same motion with a different intent. One form, one API
   route, one place to review what arrives. */

export const SUBMISSION_INTENTS = ['claim', 'add', 'remove'] as const
export type SubmissionIntent = typeof SUBMISSION_INTENTS[number]

export function isIntent(v: unknown): v is SubmissionIntent {
  return typeof v === 'string' && (SUBMISSION_INTENTS as readonly string[]).includes(v)
}

export const INTENT_COPY: Record<SubmissionIntent, {
  eyebrow: string
  heading: string
  standfirst: string
  cta: string
}> = {
  claim: {
    eyebrow:   'CLAIM YOUR ENTRY',
    heading:   'This is your name — take it over',
    standfirst:
      'The directory carries your name because a Fondom or GUDECA record names you. ' +
      'Claim it and the entry becomes yours: you decide what it says, and what stays private. ' +
      'The Palace confirms it is you, then sends you the link to complete your profile.',
    cta:       'Send my claim',
  },
  add: {
    eyebrow:   'ADD A NAME',
    heading:   'Add a son or daughter of Guneku',
    standfirst:
      'Anyone may put a name forward — your own, or someone you know belongs here. ' +
      'Give us the name and where they stand with Guneku. The Palace checks it, ' +
      'then the person is invited to complete their own profile. Nobody else fills it in for them.',
    cta:       'Send the name',
  },
  remove: {
    eyebrow:   'REMOVE A NAME',
    heading:   'Ask for a name to be taken down',
    standfirst:
      'If your name is in the directory and you would rather it were not, say so here. ' +
      'It comes down — no reason required, no argument made.',
    cta:       'Send the request',
  },
}
