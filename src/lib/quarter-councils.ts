import { allFoundingNames, type FoundingName } from './community'
import { GUNEKU_QUARTERS_27 } from './quarters'

/* Who the archive names in the traditional council of a quarter — and, far more often,
 * the honest statement that it names nobody.
 *
 * ── Why this exists ──────────────────────────────────────────────────────────────────────
 *
 * Every one of the twenty-seven quarters of Guneku has a traditional council. That is a fact
 * about the Fondom, established by the record: the Fon called quarter elections in 2021, the
 * electoral commission toured the village, and councillors were installed in the Palace. The
 * councils exist.
 *
 * What the archive mostly does not hold is who sits on them. For twenty-six of the
 * twenty-seven quarters, the Fondom's records name nobody at all.
 *
 * The wrong response to that is to omit the councils, which would publish the false
 * impression that Guneku's quarters have no governance. The other wrong response is to fill
 * them in — with a plausible name, a "TBC" that reads as a person, or an office inferred
 * from somebody living in the right place. Both are worse than the gap.
 *
 * So the structure is shown, what is known is published, what is missing is named as missing,
 * and the people who know are given a way to supply it. That is the standing editorial
 * principle applied to the most incomplete part of the record:
 *
 *   STRUCTURAL COMPLETENESS IS ENCOURAGED. FACTUAL FABRICATION IS PROHIBITED.
 *
 * ── How a person is attached to a quarter ────────────────────────────────────────────────
 *
 * Only by the register's own words. A record is attached to a quarter when that quarter's
 * canonical name appears, as a whole word, in the `role` string the Fondom supplied — and
 * the sentence that justifies it is carried through and rendered beside the name, so a
 * reader can see exactly why the attachment was made. Nothing is inferred from where someone
 * lives, what they do, or which body they sit in.
 *
 * The consequence is deliberate: this finds Fun, and finds nothing for the other
 * twenty-six. That is the true state of the archive and the page says so. */

export type CouncilMember = {
  slug: string
  display: string
  /** The register's own words. Rendered, never paraphrased. */
  role: string
  deceased: boolean
}

export type QuarterCouncil = {
  quarter: string
  /** Whoever the record names in this quarter's council. Usually empty, and that is the
   *  fact rather than a failure. */
  members: CouncilMember[]
  /** True when the archive names nobody — the state the contribution route exists for. */
  incomplete: boolean
}

/** Whole-word, case-insensitive. "Fun" must not match "Funmbot", and a quarter name with a
 *  hyphen or a space must match exactly as written. */
function namesQuarter(role: string, quarter: string): boolean {
  const escaped = quarter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^A-Za-z])${escaped}([^A-Za-z]|$)`, 'i').test(role)
}

/* Only a record that is actually about quarter governance. Someone whose role happens to
   mention a quarter for another reason — a project there, an event held there — is not
   thereby a councillor, and calling them one would be exactly the invention this module
   exists to avoid. */
function isCouncilRole(role: string): boolean {
  return /quarter\s+head|quarter\s+traditional\s+council|head\s+of\s+\w+\s+quarter/i.test(role)
}

function toMember(n: FoundingName): CouncilMember {
  return {
    slug: n.slug, display: n.display, role: n.role, deceased: n.deceased === true,
  }
}

export function councilFor(quarter: string): QuarterCouncil {
  const members = allFoundingNames()
    .filter(n => typeof n.role === 'string'
      && isCouncilRole(n.role)
      && namesQuarter(n.role, quarter))
    .map(toMember)

  return { quarter, members, incomplete: members.length === 0 }
}

/** Every canonical quarter, each with whatever the record holds. Twenty-seven entries,
 *  always — a quarter is never dropped for being undocumented. */
export function allQuarterCouncils(): QuarterCouncil[] {
  return GUNEKU_QUARTERS_27.map(q => councilFor(q))
}

/** How much of the village's governance the archive actually records. Published as a plain
 *  count on the quarters index, because a reader is owed the scale of the gap rather than a
 *  page that looks complete. */
export function councilCoverage(): { recorded: number; total: number } {
  const all = allQuarterCouncils()
  return { recorded: all.filter(c => !c.incomplete).length, total: all.length }
}

/* ── The names the archive attaches to no canonical quarter ───────────────────────────────
 *
 * The register names quarter office-holders for places that are not on the canonical list of
 * twenty-seven — Njinebai, for one. The 2021 election reports name many more: Toh, Nyeh,
 * Tuengyie, Benjoh, Njizam, Sang, Kimbot, Wunmenyeh, Tonmitoh, Bighebomi, Mbengtibat.
 *
 * That is a genuine discrepancy between two Fondom sources, and it is NOT resolved here. It
 * is not this module's place to decide that a quarter the archive names does not exist, nor
 * to add it to a canonical list that carries a "do not change without a Palace source"
 * instruction. The names are simply reported, so the discrepancy is visible to the owner
 * rather than silently dropped.
 *
 * Nothing consumes this on a public page. It exists so the question can be asked. */
export function councilNamesOutsideCanonicalQuarters(): CouncilMember[] {
  const canonical = [...GUNEKU_QUARTERS_27]
  return allFoundingNames()
    .filter(n => typeof n.role === 'string' && isCouncilRole(n.role))
    .filter(n => !canonical.some(q => namesQuarter(n.role, q)))
    .map(toMember)
}
