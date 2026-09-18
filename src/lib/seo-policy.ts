import { allFoundingNames, getFoundingName, type FoundingName } from './community'
import { publicCuratedBusinesses } from './businesses'

/* Who gets offered to a search engine, and why.
 *
 * ── The decision, and the decision that replaced it ──────────────────────────────────────
 *
 * From 2026-09-17 this file held a richness threshold: an entry was offered for indexing
 * only if it carried two facts beyond the name, which excluded 32 of the 113. The reasoning
 * was about thin pages, and it was sound reasoning about search results and wrong about what
 * this register is for.
 *
 * Marcel settled it on 2026-09-18, and the argument is the better one. The register exists
 * so that a son or daughter of Guneku can recognise their own presence in the Fondom record.
 * The person most likely to search a Guneku name is the person who owns it, or their family.
 * A confirmed record excluded from search because the Palace has not yet been told very much
 * about that person is the register failing precisely the reader it was built for — and it
 * fails them silently, because nobody can tell from the page that it is being withheld.
 *
 * So: every legitimate public register record is eligible. Thinness is not a bar, and
 * PERSON_INDEX_THRESHOLD is 0 to say so in the one place the number is read.
 *
 * ── What eligibility still means ─────────────────────────────────────────────────────────
 *
 * "Legitimate and public" is not a formality, and it is not weakened here. It means the slug
 * resolves to a reviewed record in `founding-names.json`, which is the whole gate: a name
 * the Fondom has recorded but not confirmed, an ambiguous identity, a held relationship, a
 * private detail — none of those ever enter that file. They are held in the business
 * directory as `heldName`, or in Neon behind a claim, or nowhere. The register is the list
 * of people the Palace has confirmed are sons and daughters of Guneku, and being in it is
 * the confirmation. A slug that does not resolve is not indexable, and there is nothing
 * else to test because there is nothing else in the file.
 *
 * ── What this does NOT authorise ─────────────────────────────────────────────────────────
 *
 * Nothing about what a page says changes. No biography is written, no occupation inferred,
 * no location guessed, no text padded to reach a word count, no structured-data field
 * invented to make a node look fuller. A name-only record stays a name-only record and says
 * so on its face. `personSignals` survives — not as a gate now, but because knowing how much
 * the Fondom holds about each person is worth being able to report.
 *
 * Nothing here changes what is published. It changes only what is submitted. */

/** A fact the page already shows, beyond the name. Reported, no longer a gate. */
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

/** Facts a register entry must carry beyond its name to be offered for indexing.
 *
 *  **Zero, since 2026-09-18.** It is kept, rather than deleted with the rule it enforced,
 *  because the number is read by the sitemap tests and quoted in the build report, and a
 *  silent constant is easier to reinstate by accident than an explicit zero. Raising it
 *  above zero re-excludes people and is a decision for the Palace, not a tuning knob. */
export const PERSON_INDEX_THRESHOLD = 0

/** Why a register page is not offered for indexing, or null when it is. */
export type PersonIndexBar = 'not-a-record' | 'too-thin'

export function personIndexBar(slugOrName: string | FoundingName): PersonIndexBar | null {
  const n = typeof slugOrName === 'string' ? getFoundingName(slugOrName) : slugOrName
  /* The reviewed register is the eligibility gate, and it is the only one. A held,
     ambiguous or unconfirmed name is not in it; a private detail is not in it; a slug that
     resolves to nothing is not a page. */
  if (!n) return 'not-a-record'
  if (personSignals(n).length < PERSON_INDEX_THRESHOLD) return 'too-thin'
  return null
}

export function isPersonIndexable(slugOrName: string | FoundingName): boolean {
  return personIndexBar(slugOrName) === null
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
 * Now that every record is offered for indexing, the thinnest entries are the ones a snippet
 * has to work hardest for — so the builder uses every fact the page already shows, including
 * the chapter, which it did not before. That is context, not content: the chapter is printed
 * in the entry's own table and in its hero. Where a record holds nothing but a name and an
 * office, the snippet says that and stops. A concise true sentence is the right answer for a
 * concise true record, and padding it would be the one thing this policy forbids.
 *
 * Nothing is asserted that the page does not already show. */
export function personDescription(
  n: FoundingName, bodyName?: string | null, chapterLabel?: string | null,
): string {
  if (n.deceased) {
    return `${n.display} — ${n.role}. A record kept in the Guneku Fondom archive.`
  }

  const facts: string[] = []
  if (bodyName) facts.push(bodyName)
  if (n.profession) facts.push(n.profession)
  if (n.residence) facts.push(n.residence)
  /* The chapter, written the way the cards write it — `placeLabel`, so the Europe chapter
     reads "GUDECA Europe" rather than "Meetings rotate across Europe", which is a true
     sentence about the chapter and a poor answer to "where is this person". Skipped when the
     residence has already said the same country. */
  if (chapterLabel && chapterLabel !== n.residence
      && !(n.residence && chapterLabel.endsWith(`, ${n.residence}`))) {
    facts.push(chapterLabel)
  }
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
  /** How many are withheld for each reason. Thinness must stay at zero. */
  bars: Record<PersonIndexBar, number>
} {
  const all = allFoundingNames()
  const bars: Record<PersonIndexBar, number> = { 'not-a-record': 0, 'too-thin': 0 }
  let indexable = 0
  for (const n of all) {
    const bar = personIndexBar(n)
    if (bar) bars[bar]++
    else indexable++
  }
  return {
    total: all.length,
    indexable,
    noindex: all.length - indexable,
    threshold: PERSON_INDEX_THRESHOLD,
    bars,
  }
}
