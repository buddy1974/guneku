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

export type BodyKind = 'governing' | 'association' | 'committee' | 'household'

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
  note?: string
}

/** Everything a seed stub is allowed to render. Widening this type is a
 *  publication decision, not a refactor — see founding-names.json. */
export interface CardSafe {
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
  }
}

/* ── Bodies ───────────────────────────────────────────────────────────────── */

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
