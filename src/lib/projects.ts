import current from '@/data/current-notices.json'
import { getBody, getChapter, allChapters } from './community'

/* The development register, normalised.
 *
 * ── What the source actually holds ───────────────────────────────────────────────────────
 *
 * `src/data/current-notices.json` → `development` is the single register that both the home
 * page and /projects read. Twenty-eight entries, eight fields, and — this is the finding that
 * shapes everything below — **every one of those eight fields is populated on every entry**.
 * The register is complete for what it defines.
 *
 * What it does not define is equally important, and is uniform across all twenty-eight:
 * there is no location, no timeline, no current stage, no statement of needs, and
 * **no financial field of any kind**. Not a target, not an amount raised, not an amount
 * spent, not a balance, not a donor total. Not one entry has one.
 *
 * ── What follows from that ───────────────────────────────────────────────────────────────
 *
 * Rendering "Financial information awaiting update" on twenty-eight records would assert
 * that Guneku keeps project accounts and has not refreshed them. Nobody has established
 * that. The same applies to a location row, a timeline row and a progress figure: a field
 * shown as empty is still a claim that the field exists and is tracked.
 *
 * So this module publishes what the register holds and nothing else, and the absence is
 * stated **once**, precisely, at register level — see `NOT_RECORDED`. That is the difference
 * between naming a gap and manufacturing one on every card.
 *
 * Nothing here computes, infers or derives a fact. No status is guessed from a date, no
 * stage from a status, no completion percentage from anything at all. */

type RegisterEntry = {
  name: string
  class?: string
  status: string
  statusClass: string
  body: string
  lastUpdate: string
  description: string
  href: string
}

export type ProjectClass =
  | 'PROJECT' | 'INSTITUTION' | 'PROGRAMME'
  | 'PROPOSED INITIATIVE' | 'HISTORICAL RECORD' | 'OPEN ISSUE'

export type Project = {
  /** Stable, derived from the name. The register has no ids and no duplicate names. */
  slug: string
  name: string
  class: ProjectClass
  /** The register's own word, never re-derived. */
  status: string
  statusClass: string
  description: string
  /** Who the record says carries it. Free text — see `responsibleBodyLink`. */
  body: string
  /** How the record is evidenced. NOT a date: the register's `lastUpdate` holds provenance
   *  such as "Recognised by the Ministry of Arts and Culture" or "Burned September 2022"
   *  as often as it holds a date, and parsing it into a timeline would invent one. */
  asRecorded: string
  /** The canonical record this entry points at, or null where the register points back at
   *  itself — meaning this entry has no record beyond its own line. */
  recordHref: string | null
}

const CLASS_ORDER: readonly ProjectClass[] = [
  'PROJECT', 'PROGRAMME', 'INSTITUTION',
  'PROPOSED INITIATIVE', 'HISTORICAL RECORD', 'OPEN ISSUE',
]

/** A slug from the name. Stable as long as the name is, which is what the register
 *  guarantees — and a load-time check below refuses duplicates rather than silently
 *  merging two projects into one identity. */
export function projectSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toProject(e: RegisterEntry): Project {
  return {
    slug:        projectSlug(e.name),
    name:        e.name,
    class:       (e.class ?? 'PROJECT') as ProjectClass,
    status:      e.status,
    statusClass: e.statusClass,
    description: e.description,
    body:        e.body,
    asRecorded:  e.lastUpdate,
    /* `/projects` in the register means "no record of its own". Carrying that through as a
       link would send a reader back to the page they are already on. */
    recordHref:  e.href && e.href !== '/projects' ? e.href : null,
  }
}

const PROJECTS: Project[] = (current.development as RegisterEntry[]).map(toProject)

/* Load-time invariant. Two entries sharing a slug would be two projects with one identity —
   the contribution route would target the wrong one and the anchor would land on the wrong
   record. The build fails here rather than publishing that. */
{
  const seen = new Set<string>()
  for (const p of PROJECTS) {
    if (seen.has(p.slug)) {
      throw new Error(
        `Two entries in the development register produce the slug "${p.slug}" ` +
        `(from "${p.name}"). Rename one, or give the register explicit ids.`,
      )
    }
    seen.add(p.slug)
  }
}

export function allProjects(): Project[] {
  return PROJECTS
}

export function getProject(slug: string): Project | null {
  return PROJECTS.find(p => p.slug === slug) ?? null
}

/** Grouped in a fixed display order. Empty groups are dropped; a class is never invented to
 *  make the page look fuller. */
export function projectsByClass(): { name: ProjectClass; items: Project[] }[] {
  return CLASS_ORDER
    .map(c => ({ name: c, items: PROJECTS.filter(p => p.class === c) }))
    .filter(g => g.items.length > 0)
}

/** The status vocabulary the register actually uses, counted from it. Offered as a filter
 *  only because the data supports it — nothing is added to round the list out. */
export function statusVocabulary(): { status: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const p of PROJECTS) counts.set(p.status, (counts.get(p.status) ?? 0) + 1)
  return [...counts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count || a.status.localeCompare(b.status))
}

/* ── The responsible body ────────────────────────────────────────────────────────────────
 *
 * `body` is free text and holds several different kinds of thing: an organisation
 * ("GUDECA Europe"), an office-holder ("HRH Fon Fomuki Walters Ticha IX"), a named
 * individual ("Sam Fongoh"), a place ("Munam · Mbengeghang · Fringyeng"), and sometimes a
 * description ("Guneku sons and daughters, largely in the diaspora").
 *
 * It is linked to a canonical record ONLY on an exact match. Fuzzy matching would be the
 * place a relationship got invented: "GUDECA Europe" is not the same string as "GUDECA EU
 * Chapter — Executive", and deciding they are the same body is a judgement about Guneku's
 * institutions that belongs to the Palace, not to a normaliser. Where there is no exact
 * match the text is shown exactly as recorded, unlinked. */
export function responsibleBodyLink(body: string): string | null {
  const value = body.trim()

  for (const b of ['traditional-council', 'gudeca-national', 'gudeca-eu-exco',
                   'michi-ebeng-committee', 'palace-household']) {
    if (getBody(b)?.name === value) return `/people/${b}`
  }

  for (const c of allChapters()) {
    if (`${c.org} — ${c.place}` === value || c.org === value) {
      return getChapter(c.id) ? `/gudeca/chapters/${c.id}` : null
    }
  }

  return null
}

/* ── What the register does not record ───────────────────────────────────────────────────
 *
 * Stated once, at register level, because it is true of every entry equally. Repeating it as
 * five "awaiting update" rows on twenty-eight cards would say the same thing 140 times, make
 * a complete record look derelict, and — for the financial rows especially — imply an
 * accounting practice that has never been established.
 *
 * Financial information is deliberately first and deliberately explicit. */
export const NOT_RECORDED: readonly { field: string; note: string }[] = [
  {
    field: 'Financial information',
    /* Worded precisely, because an inaccurate transparency statement is worse than none.
       Two entries DO quote an amount inside their own description — the Afor scholarship and
       €800 reported toward Solar Phase II — as their sources state it. What the register has
       no field for is a target, a total raised, a total spent or a balance, and nothing here
       lifts a figure out of prose into one or adds two of them together. */
    note: 'We do not publish targets, totals raised, totals spent or balances: there is no field '
        + 'for them here, and none is calculated. Where a project’s description mentions an '
        + 'amount, it is given as it was announced and is never aggregated into a total. Project '
        + 'accounts will be published when the Palace releases them.',
  },
  {
    field: 'Location',
    note: 'Where each project sits in the village, beyond what its description says.',
  },
  {
    field: 'Timeline',
    note: 'Start and completion dates. The date beside each entry is when we last had news of it, '
        + 'not a project milestone.',
  },
  {
    field: 'Current stage',
    note: 'A stage or percentage of completion beyond the status shown. We do not estimate one.',
  },
  {
    field: 'Needs',
    note: 'What each project still needs — labour, materials or expertise.',
  },
]

/* ── What a reader is told about how this register works ─────────────────────────────────
 *
 * The register's own `sourceNote` is written for whoever maintains it. It is accurate and it
 * is not public prose: it says "already in this repository", names "the fixed vocabulary in
 * classVocabulary", and used to end by naming a repository file path — which put the location
 * of the one deliberately withheld record on a public page.
 *
 * So the note is NOT published verbatim. The statement below carries the same meaning in the
 * Fondom's own register: where entries come from, that classes and statuses come from the
 * records rather than from anyone's judgement, that a proposal stays a proposal, and that
 * some material is deliberately held back. The canonical record is left exactly as it is —
 * rewriting a maintainer's note so it reads well in public would be editing the source to
 * suit the presentation, which is backwards.
 *
 * The review date is not rewritten. It is read from the record, because it is a fact. */
export const REGISTER_STATEMENT: readonly string[] = [
  'These are the projects, programmes and institutions of Guneku, as the Fondom has reviewed '
  + 'them for publication here.',

  'Each one is shown for what it is — a project, a programme, a standing institution, a '
  + 'proposal, something completed, or an open issue. A proposal stays a proposal until work '
  + 'actually begins.',

  'The status beside each entry is what we know today. Where we do not yet know, we say so '
  + 'rather than estimate.',

  'Some work is not listed yet while the Fondom reviews how it should be presented.',

  'This page is reviewed whenever there is news of any project on it.',
]

/** The date the register was last reviewed, read from the record because it is a fact about
 *  the record. Nothing else from the maintainer's note is published — see the comment above
 *  and `REGISTER_STATEMENT`. */
export function registerReviewedOn(): string {
  return (current as { reviewedOn: string }).reviewedOn
}

/** Where a member goes to supply or correct a project's record. The target is the register
 *  entry itself, addressed by its anchor on /projects — see src/lib/contributions.ts, which
 *  validates the slug against this module rather than accepting the path on trust. */
export function contributeHref(p: Project, type = 'missing-information'): string {
  const target = encodeURIComponent(`/projects#${p.slug}`)
  return `/my-guneku/contribute/new?type=${type}&targetType=page&targetId=${target}`
}
