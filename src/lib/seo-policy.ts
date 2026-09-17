import { allFoundingNames, getFoundingName, type FoundingName } from './community'
import { publicCuratedBusinesses } from './businesses'

/* Who gets offered to a search engine, and why.
 *
 * ── The problem this decides ─────────────────────────────────────────────────────────────
 *
 * The register holds 113 sons and daughters of Guneku. Every one of them is public, linked
 * and claimable, and that is the point of the register — a person should be able to find
 * their own name and say "this is me". But offering all 113 to a search engine is a
 * different act, and a page that says only "X is named in the Fondom record" is the classic
 * thin page: a hundred near-identical templates, each carrying one fact, is not what an
 * index is for and is not how the Fondom's people are best represented.
 *
 * The opposite mistake would be to delete or hide them, or — far worse — to write
 * biographies nobody confirmed so the pages would look substantial. Neither is on offer.
 *
 * ── The threshold ────────────────────────────────────────────────────────────────────────
 *
 * An entry is offered for indexing when it carries at least TWO facts beyond the person's
 * name, each one already published on the page and each one traceable to a record. Below
 * that it stays exactly where it is — public, crawlable, linked from the directory and from
 * its body's roster — but marked `noindex, follow`: a search engine may walk through it to
 * everything it links to, and is asked not to list the page itself.
 *
 * `follow` rather than `noindex, nofollow` is deliberate. These pages link outward to
 * bodies, chapters and businesses that ARE worth indexing, and cutting that path would cost
 * the directory its shape for no gain.
 *
 * Two was chosen by looking rather than by taste: one signal is satisfied by bare membership
 * of a body, which most of the register has, and three would exclude people who plainly have
 * a public story — a chapter and a profession, say. Two is the point at which the page says
 * something a stranger could not have guessed from the name alone.
 *
 * Nothing here changes what is published. It changes only what is submitted. */

/** A fact the page already shows, beyond the name. */
export type PersonSignal =
  | 'body' | 'chapter' | 'profession' | 'residence' | 'royalRole'
  | 'notable' | 'profileUrl' | 'note' | 'aliases' | 'business' | 'deceased'

/** A note has to say something; a few words of provenance is not a second fact. */
const NOTE_MIN = 40

/** Curated public businesses, by the person slug each is recorded against. */
function businessPeople(): Set<string> {
  const out = new Set<string>()
  for (const b of publicCuratedBusinesses()) {
    for (const p of b.people ?? []) if (p.personSlug) out.add(p.personSlug)
  }
  return out
}

let withBusiness: Set<string> | null = null

export function personSignals(n: FoundingName): PersonSignal[] {
  withBusiness ??= businessPeople()
  const s: PersonSignal[] = []
  if (n.body) s.push('body')
  if (n.chapter) s.push('chapter')
  if (n.profession) s.push('profession')
  if (n.residence) s.push('residence')
  if (n.royalRole) s.push('royalRole')
  if (n.notable) s.push('notable')
  if (n.profileUrl) s.push('profileUrl')
  if (n.note && String(n.note).trim().length >= NOTE_MIN) s.push('note')
  if ((n.aliases ?? []).length > 0) s.push('aliases')
  if (withBusiness.has(n.slug)) s.push('business')
  /* An in-memoriam record is kept deliberately and is a fact about the person. */
  if (n.deceased) s.push('deceased')
  return s
}

/** Facts beyond the name that a register entry must carry to be offered for indexing. */
export const PERSON_INDEX_THRESHOLD = 2

export function isPersonIndexable(slugOrName: string | FoundingName): boolean {
  const n = typeof slugOrName === 'string' ? getFoundingName(slugOrName) : slugOrName
  if (!n) return false
  return personSignals(n).length >= PERSON_INDEX_THRESHOLD
}

/** Every register slug offered for indexing, sorted. Used by the sitemap. */
export function indexablePersonSlugs(): string[] {
  return allFoundingNames().filter(isPersonIndexable).map(n => n.slug).sort()
}

/* ── What a register entry's search snippet should say ───────────────────────────────────
 *
 * Every one of the 113 previously ended in the same sentence — "An unclaimed entry in the
 * Guneku register, open to be claimed by its owner" — which pushed some past 220 characters
 * and made a hundred snippets that differ only in a name. A description is the page's answer
 * to "why this result", so it is built from what this entry actually holds, longest fact
 * first, and it stops when it runs out of facts rather than padding to a length.
 *
 * Nothing is asserted that the page does not already show. */
export function personDescription(n: FoundingName, bodyName?: string | null): string {
  if (n.deceased) {
    return `${n.display} — ${n.role}. A record kept in the Guneku Fondom archive.`
  }

  const facts: string[] = []
  if (bodyName) facts.push(bodyName)
  if (n.profession) facts.push(n.profession)
  if (n.residence) facts.push(n.residence)
  if (n.notable) facts.push('a Notable of Guneku')

  const lead = `${n.display} — ${n.role}`
  const body = facts.length ? `${lead}. ${facts.join(' · ')}.` : `${lead}.`
  const tail = ' An entry in the Guneku indigenes register.'

  /* 158 keeps the whole sentence inside what a result actually shows. */
  return (body.length + tail.length <= 158 ? body + tail : body).slice(0, 158).trim()
}

/** The counts, for the record and for the tests that hold this policy in place. */
export function personIndexabilitySummary(): {
  total: number; indexable: number; noindex: number; threshold: number
} {
  const all = allFoundingNames()
  const indexable = all.filter(isPersonIndexable).length
  return {
    total: all.length,
    indexable,
    noindex: all.length - indexable,
    threshold: PERSON_INDEX_THRESHOLD,
  }
}
