/* Notes written for editors, shown to readers.
 *
 * Several registers carry a free-text `note` that does two jobs at once. Part of it is
 * information a reader wants — "Elected by the councillors of Zone 2 and installed at the
 * Palace on 30 July 2021." Part of it is the editors' provenance and scope: who confirmed
 * the entry and when, what the entry deliberately does not claim, which records were merged.
 * That second part is how the register stays honest, and it stays in the data. On the page,
 * though, it makes Guneku sound like an outside researcher describing its own people.
 *
 * `publicNote` keeps the first kind of sentence and leaves out the second. It rewrites
 * nothing a reader sees except by omission, and the source text is never changed — the same
 * principle as the projects register, which stopped publishing its source note rather than
 * rewriting it to read better. */

/** Sentences that are provenance or scope, not information. */
const EDITORIAL = new RegExp([
  String.raw`\b(is|are|was) (not )?recorded\b`,
  String.raw`\brecorded (here|for|only|against|as|in)\b`,
  String.raw`\bnone is (inferred|invented|implied|named|recorded)\b`,
  String.raw`\b(or|is) implied\b`,
  String.raw`\bnot asserted\b`,
  String.raw`\b(is|are|be) established\b|\bestablishes\b|\bnot established\b`,
  String.raw`\bthe record\b|\bthe register\b|\bthe archive\b|\brecords? (him|her|that)\b`,
  String.raw`\bconfirmed (a|by) \b|\bby the Fondom\b|\bthe Fondom (settled|confirmed|corrected|having|records)\b`,
  String.raw`\b(merged|folded|supersedes|alias|legacy listing|split again|kept out of)\b`,
  String.raw`\bsupplied\b|\bno source\b|\bis carried\b|\bas the council roster spells it\b`,
  String.raw`\bis published\b|\bnot named here\b|\bno business is attached\b|\bthis entry is not connected\b`,
  String.raw`\bWritten as the Fondom writes\b|\broster gives\b|\bnames him as a member\b|\bbranch record\b`,
].join('|'), 'i')

/** The reader's part of an editors' note, or null when nothing of it is for the reader. */
export function publicNote(note: string | null | undefined): string | null {
  if (!note) return null
  const kept = note
    .split(/(?<=[.;])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !EDITORIAL.test(s))
    .map(s => s.replace(/, so not of the diaspora\./, '.'))
  return kept.length ? kept.join(' ') : null
}
