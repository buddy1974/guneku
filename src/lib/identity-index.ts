import namesDoc from '@/data/community/founding-names.json'
import fonProfile from '@/data/palace/fon-walters-profile.json'
import type { FoundingName } from './community'

/* One human, one identity — decided by a rule rather than by whoever is reading.
 *
 * ── Why this exists ──────────────────────────────────────────────────────────────────────
 *
 * The register grew from eleven names to fifty-two by hand, and every addition was checked
 * against the existing entries by a person remembering them. That works at fifty. It does
 * not work at a hundred and fifty, and the failure mode is the worst one this repository
 * has: the same son of Guneku published twice under two spellings, each with half his life
 * attached, neither claimable without the Palace deciding which is him.
 *
 * So the check is written down. Give this module a name as a source wrote it and it answers
 * one of four things, deterministically, from the records the repository already holds:
 *
 *   EXISTING      this is somebody we already have. Reuse the slug. Do not create.
 *   NEW_SAFE      no existing identity is touched. Safe to open a new entry.
 *   AMBIGUOUS     it could be more than one person, or a near-miss of one. A human decides.
 *   INSUFFICIENT  not enough name to be an identity at all.
 *
 * ── What it deliberately does NOT do ─────────────────────────────────────────────────────
 *
 * It confers nothing. It does not decide that somebody is a Notable, a member of the Royal
 * Family, of the diaspora, or of any body or chapter. It matches name strings and stops.
 * Standing comes from the record, explicitly, exactly as it did before this file existed —
 * see ADR-038 and the `notable` / `royalRole` fields in founding-names.json.
 *
 * In particular: a shared surname is NOT an identity and NEVER a relationship. Everyone in
 * the Palace household today happens to be called Fomuki, which is precisely the coincidence
 * that makes a surname rule tempting and wrong.
 *
 * ── It holds no contact detail ───────────────────────────────────────────────────────────
 *
 * No telephone number, no address, no handle, no photograph and no private metadata enters
 * this module or anything it returns. It reads display names and aliases from records that
 * are already public, and the one hand-written table below holds name spellings only. */

/* ── Normalisation ────────────────────────────────────────────────────────────────────────
 *
 * Matching happens on normalised tokens, never on the stored string. The stored string is
 * how the Fondom writes a person's name and is not ours to alter. */

/** Courtesy titles that are never part of a Meta name and are dropped before matching.
 *  Deliberately short: `Ni`, `Ba`, `Bah`, `Pa`, `Ma`, `Mama`, `Fon`, `Tan` and `Mola` are
 *  NOT here, because each appears in this register as part of somebody's actual name —
 *  Ni Charles, Ma Rose, Fon Mathias. They are handled by the courtesy-prefix rule below
 *  instead, which is about shape rather than about dropping a token. */
const TITLES = new Set([
  'mr', 'mrs', 'ms', 'miss', 'madam', 'dr', 'prof', 'professor',
  'hrh', 'hrm', 'hon', 'rev', 'reverend', 'pastor', 'sir', 'late', 'the', 'president',
])

/** A courtesy prefix plus exactly one given name is a way of addressing somebody, not a way
 *  of identifying them. "Pa Andrew", "Aunty Pat", "Tan Prince" and "Mola Ekema" name a real
 *  person whose actual identity the source did not record. */
const COURTESY_PREFIXES = new Set([
  'pa', 'ba', 'bah', 'ni', 'ma', 'mama', 'papa', 'daddy', 'aunty', 'auntie',
  'tan', 'mola', 'tomfon', 'ngum', 'mbe', 'mbeh',
])

/** Words that mark a string as an organisation, a channel or a placeholder rather than a
 *  person. Checked only after an exact identity match has been ruled out, so a real person
 *  whose name contains one of these — Fondom Calvin — is never mistaken for a company. */
const ORGANISATION_MARKERS = new Set([
  'studios', 'studio', 'group', 'initiative', 'foundation', 'association',
  'gudeca', 'guneccul', 'cig', 'ltd', 'limited', 'company', 'committee',
  'university', 'school', 'college', 'branch', 'chapter', 'palace', 'council',
  'members', 'member', 'unnamed', 'investigator', 'multiple', 'acdif', 'centre', 'center',
])

/** Lowercase, strip accents, drop anything parenthetical, drop punctuation. A parenthetical
 *  is how a source adds a role or a nickname to a display name — "Fah Elvis Tayong (Delegate
 *  CIG)" — and it is context, not part of the name. */
export function normaliseName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The distinctive tokens of a name: normalised, titles removed, single letters removed.
 *  A single letter is an initial — "Ngati Bah G." — and an initial cannot distinguish two
 *  people, so it must not be allowed to join or separate them. */
export function tokensOf(value: string): string[] {
  return normaliseName(value)
    .split(' ')
    .filter(t => t.length > 1 && !TITLES.has(t))
}

/** True when the name is a courtesy prefix plus exactly one given name. */
function isCourtesyOnly(tokens: string[]): boolean {
  return tokens.length === 2 && COURTESY_PREFIXES.has(tokens[0])
}

function looksLikeOrganisation(tokens: string[]): boolean {
  return tokens.some(t => ORGANISATION_MARKERS.has(t))
}

/** Below this length a one-character difference is not a transcription slip, it is a
 *  different word. `Eni` and `Ni`, `Tah` and `Bah`, `Fon` and `Don` are all one edit apart
 *  and all different people; letting short tokens match nearly would flood every verdict
 *  with coincidences and bury the two or three that matter. */
const NEAR_MATCH_MIN_LENGTH = 4

/** Levenshtein distance, capped at 2 — beyond that the answer is "not close" and the exact
 *  number is of no use to anybody. Used only to catch a transcription slip in one token,
 *  never to match two names outright. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > 2) return 3
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
    prev = row
  }
  return Math.min(prev[b.length], 3)
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|')

/* ── The index ────────────────────────────────────────────────────────────────────────────
 *
 * Every identity the repository already holds, from all the surfaces that hold one. The
 * five person models stay separate — this reads them, it does not merge them. */

export type IdentityKind = 'register' | 'fon'

export type Identity = {
  /** The register slug, or the profile's own id. Stable, and what a reuse points at. */
  id: string
  kind: IdentityKind
  display: string
  /** Every spelling a source has used for this person. */
  names: string[]
  /** Where the identity lives, so a reviewer can go and read it. */
  href: string
}

/* The reigning Fon is not a register entry and must never become one — he has his own record
 * and his own page. He is in the index precisely so that a discovery spelling of his name
 * resolves HERE and cannot open a fifty-third entry beside the fifty-two.
 *
 * Every spelling below is one a record in this repository already uses:
 *   the profile's own `title`, `fullName` and `regnalName`;
 *   "H.R.H Dr. Fomuki Ticha IX" and "H.R.M Dr. Ticha W. Fomuki", from the 2021 news records;
 *   "Walters Formuki", the misspelling the community record carries.
 * The misspelling is listed because a name that is never written down cannot be caught. */
const FON_NAME_VARIANTS = [
  fonProfile.title,
  fonProfile.fullName,
  fonProfile.regnalName,
  'Fon Fomuki Walters Ticha IX',
  'Fomuki Walters Ticha',
  'Fomuki Walters',
  'Walters Fomuki',
  'Walters Formuki',
  'Fomuki Ticha IX',
  'Ticha W. Fomuki',
]

let cached: Identity[] | null = null

export function identityIndex(): Identity[] {
  if (cached) return cached

  const register = (namesDoc.names as FoundingName[]).map<Identity>(n => ({
    id: n.slug,
    kind: 'register',
    display: n.display,
    names: [n.display, ...(n.aliases ?? [])],
    href: `/indigenes/founding/${n.slug}`,
  }))

  cached = [
    ...register,
    {
      id: 'fon-walters-profile',
      kind: 'fon',
      display: fonProfile.title,
      names: FON_NAME_VARIANTS,
      href: '/palace/fon-walters-profile',
    },
  ]
  return cached
}

/* ── Classification ───────────────────────────────────────────────────────────────────────
 *
 * Three tiers of match, and only the first is ever decisive.
 *
 *   EXACT   the same name, or the same name with the parts in the other order. Cameroonian
 *           records invert given and family names freely — "Mbakwa Jonathan" and "Jonathan
 *           Mbakwa" — so an inversion is treated as the same string, which it is.
 *   SUBSET  every token of the candidate appears in the identity, but not the reverse.
 *           "Roland Forbang" inside "Roland Teboh Forbang". Suggestive; never decisive,
 *           because a village contains more than one Forbang.
 *   TOUCH   one shared token, or one token a single character away from another. A shared
 *           surname. Reported so a human can see it; never a match on its own. */
export type MatchTier = 'exact' | 'subset' | 'contains' | 'touch'

export type IdentityMatch = {
  identity: Identity
  tier: MatchTier
  /** The tokens that caused the match, so the reason is legible rather than asserted. */
  on: string[]
  /** True when the candidate is written exactly as the record writes the name, part for part
   *  and in the same order — not merely the same parts rearranged. An inversion may be two
   *  people; the name itself, spelled as the record spells it, is the person. */
  literal?: boolean
}

export type Classification = 'EXISTING' | 'NEW_SAFE' | 'AMBIGUOUS' | 'INSUFFICIENT'

export type CandidateVerdict = {
  /** The candidate exactly as the source wrote it. Never altered. */
  candidate: string
  classification: Classification
  /** Set only for EXISTING: the identity to reuse. */
  resolvesTo?: Identity
  matches: IdentityMatch[]
  /** Why the classifier decided what it did, in one sentence a person can check. */
  reason: string
}

/** How many identities use each token. Built once; a token used by exactly one identity is
 *  decisive, because no second person in the record answers to it. */
let tokenOwners: Map<string, Set<string>> | null = null

function ownersOf(token: string): Set<string> {
  if (!tokenOwners) {
    tokenOwners = new Map()
    for (const identity of identityIndex()) {
      for (const name of identity.names) {
        for (const t of tokensOf(name)) {
          if (!tokenOwners.has(t)) tokenOwners.set(t, new Set())
          tokenOwners.get(t)!.add(identity.id)
        }
      }
    }
  }
  return tokenOwners.get(token) ?? new Set()
}

function matchesFor(tokens: string[]): IdentityMatch[] {
  const out: IdentityMatch[] = []

  for (const identity of identityIndex()) {
    let best: IdentityMatch | null = null

    for (const name of identity.names) {
      const other = tokensOf(name)
      if (other.length === 0) continue

      if (sameSet(tokens, other)) {
        best = {
          identity,
          tier: 'exact',
          on: [...tokens],
          literal: tokens.join(' ') === other.join(' '),
        }
        if (best.literal) break
        continue
      }

      const shared = tokens.filter(t => other.includes(t))

      if (shared.length >= 2 && shared.length === tokens.length) {
        if (best?.tier !== 'exact') best = { identity, tier: 'subset', on: shared }
        continue
      }

      /* The reverse of a subset, and it needed its own case.
       *
       * The register holds a man recorded only as "Fabian" — one name, from a set of meeting
       * minutes. The Fondom then confirmed a "Fabian Fomuki". The subset rule above asks
       * whether the CANDIDATE fits inside an identity and could not see it, because here the
       * identity fits inside the candidate. A thin entry swallowed by a fuller name is the
       * same question in the other direction and deserves the same answer: a person decides.
       *
       * It is especially sharp for a one-token entry, which any fuller name containing that
       * name will now reach. That is correct. A register entry that is a single given name
       * cannot be told apart from a longer name containing it by any rule, and pretending
       * otherwise is how the same man ends up entered twice. */
      const identityInside = other.length >= 1
        && other.length < tokens.length
        && other.every(t => tokens.includes(t))
      if (identityInside) {
        if (best?.tier !== 'exact' && best?.tier !== 'subset') {
          best = { identity, tier: 'contains', on: [...other] }
        }
        continue
      }

      /* A token one character away from another — Onias against Onies, Gongho against
         Fongho. One such token is a coincidence; the caller decides what two of them mean. */
      const near = tokens.filter(t =>
        t.length >= NEAR_MATCH_MIN_LENGTH &&
        other.some(o =>
          o !== t && o.length >= NEAR_MATCH_MIN_LENGTH && editDistance(t, o) <= 1))
      const touching = [...new Set([...shared, ...near])]
      if (touching.length > 0 && !best) {
        best = { identity, tier: 'touch', on: touching }
      }
    }

    if (best) out.push(best)
  }

  return out
}

/** Classify one candidate name against everything the repository already holds.
 *
 *  The rules, in the order they are applied:
 *
 *   1. An exact match, and no other identity is touched on a second distinct token
 *      -> EXISTING. The second-token test is what keeps "Jonathan Mbakwa" out: the register
 *      holds Mbakwa Jonathan, and ALSO Amamuki Jonathan and Mbakwa Bernard, so the candidate
 *      is flanked on the forename and on the surname at once and cannot be placed. "Rebecca
 *      Fomuki" is not flanked — the other Fomukis share the surname and nothing else — so
 *      she resolves cleanly to Mrs. Fomuki Rebecca.
 *   2. Two exact matches -> AMBIGUOUS. Two people are written the same way.
 *   3. An organisation, a channel or a placeholder -> INSUFFICIENT.
 *   4. A courtesy prefix and one given name -> INSUFFICIENT.
 *   5. Fewer than two distinctive tokens -> INSUFFICIENT.
 *   6. A subset match, or two near-tokens against one identity -> AMBIGUOUS.
 *   7. Otherwise -> NEW_SAFE, with any single shared surname reported but not acted on. */
export function classifyCandidate(candidate: string): CandidateVerdict {
  const tokens = tokensOf(candidate)
  const matches = matchesFor(tokens)
  const exact = matches.filter(m => m.tier === 'exact')

  if (exact.length === 1) {
    const others = matches.filter(m => m !== exact[0])
    const flankingTokens = new Set(others.flatMap(m => m.on))
    /* Two ways a match settles the question.
     *
     * The name written exactly as the record writes it is the person. "Sam Fongoh" is Sam
     * Fongoh, however many other entries happen to contain Sam or Fongoh.
     *
     * Otherwise the parts have been rearranged, and one of them must belong to nobody else:
     * "Rebecca" belongs to one woman and "IX" to one Fon, however many people share Fomuki.
     * "Jonathan" and "Mbakwa" each belong to two men, which is why that name cannot be
     * placed by anybody but the Palace. */
    const decisive = exact[0].literal === true || tokens.some(t => {
      const owners = ownersOf(t)
      return owners.size === 1 && owners.has(exact[0].identity.id)
    })
    if (!decisive && others.length >= 2 && flankingTokens.size >= 2) {
      return {
        candidate,
        classification: 'AMBIGUOUS',
        matches,
        reason:
          `Matches ${exact[0].identity.display}, but the register also holds other people ` +
          `sharing ${[...flankingTokens].join(' and ')}. Which person is meant is not ` +
          'established by the name alone.',
      }
    }
    return {
      candidate,
      classification: 'EXISTING',
      resolvesTo: exact[0].identity,
      matches,
      reason: `Already in the record as ${exact[0].identity.display}.`,
    }
  }

  if (exact.length > 1) {
    return {
      candidate,
      classification: 'AMBIGUOUS',
      matches,
      reason:
        'More than one existing identity is written this way: ' +
        exact.map(m => m.identity.display).join(', ') + '.',
    }
  }

  if (looksLikeOrganisation(tokens)) {
    return { candidate, classification: 'INSUFFICIENT', matches, reason: 'Not a person.' }
  }

  if (isCourtesyOnly(tokens)) {
    return {
      candidate,
      classification: 'INSUFFICIENT',
      matches,
      reason: 'A courtesy title and one given name. The source did not record who this is.',
    }
  }

  if (tokens.length < 2) {
    return {
      candidate,
      classification: 'INSUFFICIENT',
      matches,
      reason: 'Too little of a name to be an identity.',
    }
  }

  const subset = matches.find(m => m.tier === 'subset')
  if (subset) {
    return {
      candidate,
      classification: 'AMBIGUOUS',
      matches,
      reason:
        `Every part of this name is inside ${subset.identity.display}, but it is shorter — ` +
        'the same man written briefly, or a different one who shares a name.',
    }
  }

  const contains = matches.find(m => m.tier === 'contains')
  if (contains) {
    return {
      candidate,
      classification: 'AMBIGUOUS',
      matches,
      reason:
        `The register already holds ${contains.identity.display}, and this name contains it ` +
        'in full — the same person written more fully, or a different one. The record does ' +
        'not say which.',
    }
  }

  const nearDuplicate = matches.find(m => m.tier === 'touch' && m.on.length >= 2)
  if (nearDuplicate) {
    return {
      candidate,
      classification: 'AMBIGUOUS',
      matches,
      reason:
        `Two parts of this name are a letter away from ${nearDuplicate.identity.display}. ` +
        'That is either a transcription slip or two people.',
    }
  }

  const touched = matches.filter(m => m.tier === 'touch')
  return {
    candidate,
    classification: 'NEW_SAFE',
    matches,
    reason: touched.length
      ? 'No existing identity matches. Shares one name part with ' +
        touched.map(m => m.identity.display).join(', ') +
        ', which the register already treats as different people.'
      : 'No existing identity is touched.',
  }
}

/* ── Candidates against each other ────────────────────────────────────────────────────────
 *
 * Classifying one name at a time answers "is this somebody we already have". It cannot
 * answer "are two of the names in front of me the same man", and that is the other half of
 * the duplicate problem: the Water Management Committee of 2021 records a Gongho Onias, the
 * community record of 2026 carries a Timkoh Onies Fongho, and if both are written in the
 * same pass the register gains two entries for what may be one person.
 *
 * So a pool is checked against itself as well. When two candidates collide, the one from the
 * stronger source stays and the weaker is held — which is the source order the Fondom
 * already works to: a reviewed record on this site outranks a name on a group record. */

export type PoolEntry = {
  name: string
  /** Where the name came from, printed against the verdict. */
  from: string
  /** Source authority, 1 strongest. A collision holds the higher number. */
  priority: number
}

export type PoolVerdict = CandidateVerdict & { from: string }

function collide(rawA: string[], rawB: string[]): boolean {
  /* Deduplicated first, and that is not tidiness.
   *
   * A source wrote one man's name as "Tibi Enerst Tibi", so his tokens were
   * ['tibi','enerst','tibi']. Counting them as written made `shared` two long against every
   * other Tibi in the batch - the same token twice, read as two agreements - and held six
   * unrelated people on the strength of one family name. Two people must agree on two
   * DIFFERENT parts of a name before the guard says anything. */
  const a = [...new Set(rawA)]
  const b = [...new Set(rawB)]

  if (sameSet(a, b)) return true

  const shared = a.filter(t => b.includes(t))
  if (shared.length >= 2) return true

  /* Near-misses are counted only for tokens that did NOT already match exactly, so one token
     cannot be both an agreement and a near-agreement and reach two on its own. */
  const near = a.filter(t =>
    !b.includes(t) &&
    t.length >= NEAR_MATCH_MIN_LENGTH &&
    b.some(o => o.length >= NEAR_MATCH_MIN_LENGTH && editDistance(t, o) <= 1))

  return new Set([...shared, ...near]).size >= 2
}

export function classifyPool(entries: PoolEntry[]): PoolVerdict[] {
  const verdicts: PoolVerdict[] = entries.map(e => ({ from: e.from, ...classifyCandidate(e.name) }))

  const safe = verdicts
    .map((v, i) => ({ v, i, tokens: tokensOf(v.candidate), priority: entries[i].priority }))
    .filter(x => x.v.classification === 'NEW_SAFE')

  for (let a = 0; a < safe.length; a++) {
    for (let b = a + 1; b < safe.length; b++) {
      if (!collide(safe[a].tokens, safe[b].tokens)) continue
      /* The weaker source is held. A tie holds the later one, so the order of the pool
         cannot silently change which of two equal sources survives. */
      const loser = safe[a].priority <= safe[b].priority ? safe[b] : safe[a]
      const keeper = loser === safe[a] ? safe[b] : safe[a]
      if (loser.v.classification !== 'NEW_SAFE') continue
      loser.v.classification = 'AMBIGUOUS'
      loser.v.reason =
        `Too close to "${keeper.v.candidate}", which comes from a stronger source ` +
        `(${keeper.v.from}). One man written twice, or two men — the record does not say.`
    }
  }

  return verdicts
}

/** The slug a new entry should take: normalised, hyphenated, and checked against every slug
 *  the register already holds. Returns null when the slug is taken — the caller must then
 *  decide, because silently appending a number would create exactly the second identity for
 *  one man that this module exists to prevent. */
export function proposeSlug(display: string): string | null {
  const slug = normaliseName(display).replace(/\s+/g, '-')
  if (!slug) return null
  const taken = new Set((namesDoc.names as FoundingName[]).map(n => n.slug))
  return taken.has(slug) ? null : slug
}
