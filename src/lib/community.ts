/* The community register: chapters, and the founding names seeded into the
 * Indigenes Directory.
 *
 * Two rules this module exists to enforce.
 *
 * ONE SOURCE FOR CHAPTERS. /diaspora, /gudeca and the chapter pages all read
 * `chapters.json`. Before this, the Germany chapter said "Essen — Ruhr Valley"
 * on /gudeca and "Essen / Ruhr" on /diaspora, and both were wrong: the Europe
 * chapter meets in BONN, at the Fon's Palace there. A fact kept in one place
 * can be corrected once.
 *
 * A SEED STUB IS NOT A PROFILE. A founding name publishes four things and no
 * more — display name, role, chapter, and the source the name came from. Every
 * other field belongs to the person, and arrives only when they claim the entry
 * and fill it in themselves. `CardSafe` below is that contract in the type
 * system: it is the only shape a stub component may render.
 */

import chaptersDoc from '@/data/community/chapters.json'
import namesDoc    from '@/data/community/founding-names.json'

export type ChapterScope = 'home' | 'diaspora'

export interface Chapter {
  id: string
  scope: ChapterScope
  flag: string
  country: string
  city: string
  org: string
  note?: string
  openForNames: boolean
}

export interface FoundingName {
  slug: string
  display: string
  aliases: string[]
  role: string
  chapter: string
  source: string
  sourceLabel: string
  note?: string
}

/** Everything a seed stub is allowed to render. Widening this type is a
 *  publication decision, not a refactor — see founding-names.json. */
export interface CardSafe {
  slug: string
  display: string
  role: string
  sourceLabel: string
  chapter: Chapter | null
}

const CHAPTERS = (chaptersDoc.chapters as Chapter[])
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
  return NAMES.filter(n => n.chapter === chapterId)
}

/** How many seeded names a chapter carries — used for the chapter cards. */
export function foundingCount(chapterId: string): number {
  return foundingNamesFor(chapterId).length
}

export function toCardSafe(n: FoundingName): CardSafe {
  return {
    slug:        n.slug,
    display:     n.display,
    role:        n.role,
    sourceLabel: n.sourceLabel,
    chapter:     getChapter(n.chapter),
  }
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
