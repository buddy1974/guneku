import { PageHero } from '@/components/layout/PageHero'
import { Reveal }   from '@/components/ui/Reveal'
import Link         from 'next/link'
import {
  allProjects, projectsByClass, statusVocabulary, responsibleBodyLink,
  REGISTER_STATEMENT, registerReviewedOn, contributeHref, NOT_RECORDED,
  type Project, type ProjectClass,
} from '@/lib/projects'

export const metadata = {
  alternates: { canonical: '/projects' },
  description: "The full Guneku development register — projects, institutions, programmes, proposals, historical records and open issues, each shown at the stage its sources establish, with what the register does not yet record stated plainly.",
  title: 'Projects — Guneku Development',
}

/* The development register.
 *
 * This page used to carry its own hardcoded array of eleven cards, independent of the
 * register the home page reads. Two lists, one subject, no link between them. There is now
 * one register, src/data/current-notices.json, and both views read it; every number here is
 * counted from that file rather than typed.
 *
 * ── What this pass added, and what it deliberately did not ───────────────────────────────
 *
 * Added: the register's own provenance, published rather than kept in the file; the
 * responsible body for each entry; the evidence each entry rests on; a stable anchor per
 * entry; and a route by which a member can supply or correct any of it.
 *
 * Not added: a location, a timeline, a current stage, a completion percentage, or any
 * financial figure. The register holds none of those for any of the twenty-eight entries —
 * see NOT_RECORDED in src/lib/projects.ts. A progress bar here would be drawn from nothing,
 * and an "Amount raised: —" row would assert that Guneku keeps project accounts and has not
 * updated them. Neither is established, so neither is shown. The absence is stated once,
 * precisely, instead of being implied twenty-eight times. */

const STATUS_COLOR: Record<string, string> = {
  'st-active':     'oklch(0.46 0.10 150)',
  'st-ongoing':    'oklch(0.50 0.10 240)',
  'st-proposed':   'var(--ink-400)',
  'st-historical': 'var(--ink-400)',
}

const CLASS_NOTE: Record<ProjectClass, string> = {
  'PROJECT':             'Work under way in the village, with a body carrying it.',
  'PROGRAMME':           'Something that runs repeatedly rather than finishing.',
  'INSTITUTION':         'A standing body or facility, not a project with an end date.',
  'PROPOSED INITIATIVE': 'Proposed and recorded as proposed. Not begun.',
  'HISTORICAL RECORD':   'Completed, delivered or ended. Kept as part of the record.',
  'OPEN ISSUE':          'A problem the community has raised and the sources leave unresolved.',
}

function ProjectCard({ p }: { p: Project }) {
  const color    = STATUS_COLOR[p.statusClass] ?? 'var(--ink-400)'
  const bodyHref = responsibleBodyLink(p.body)

  return (
    /* The anchor is the project's address. A contribution about this entry targets
       /projects#<slug>, and that slug is validated against the register. */
    <div id={p.slug} className="card-royal p-6 flex flex-col h-full scroll-mt-24"
         style={{ borderTopWidth: '3px', borderTopColor: color }}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-cinzel text-foreground text-lg leading-snug flex-1 pr-3">{p.name}</h3>
        <span className="text-[10px] font-semibold uppercase tracking-[0.07em] px-2 py-0.5 shrink-0 rounded-[2px] border"
              style={{ color, borderColor: color }}>
          {p.status}
        </span>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>

      {/* ── What the register establishes ── */}
      <dl className="mt-4 grid gap-1.5 text-xs border-t border-[var(--rule)] pt-4">
        <div className="flex gap-2">
          <dt className="text-[var(--ink-400)] shrink-0 w-[7.5rem]">Carried by</dt>
          <dd className="m-0 text-muted-foreground">
            {bodyHref
              ? <Link href={bodyHref} className="text-primary no-underline hover:underline">{p.body}</Link>
              : p.body}
          </dd>
        </div>
        <div className="flex gap-2">
          {/* Not "last updated": the register's value is provenance — how the entry is
              evidenced — and often names an event rather than a date. Labelling it as an
              update date would invent a project timeline out of a citation. */}
          <dt className="text-[var(--ink-400)] shrink-0 w-[7.5rem]">As recorded</dt>
          <dd className="m-0 text-muted-foreground">{p.asRecorded}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {p.recordHref && (
          <Link href={p.recordHref} className="text-primary text-xs tracking-widest no-underline hover:underline">
            The record →
          </Link>
        )}
        <Link href={contributeHref(p)}
              className="text-[var(--ink-400)] text-xs tracking-widest no-underline hover:text-primary">
          Provide an update
        </Link>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const register   = allProjects()
  const groups     = projectsByClass()
  const statuses   = statusVocabulary()
  const reviewedOn = registerReviewedOn()

  /* Counted, not asserted. */
  const total    = register.length
  const proposed = register.filter(p => p.class === 'PROPOSED INITIATIVE').length
  const running  = register.filter(p =>
    p.class === 'PROJECT' || p.class === 'PROGRAMME' || p.class === 'INSTITUTION').length

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label="DEVELOPMENT"
        title="GUNEKU PROJECTS"
        subtitle={`The full development register — ${total} entries: ${running} running, ${proposed} proposed, and the rest recorded as history or as open issues.`} />

      <Reveal>
        <section className="max-w-7xl mx-auto px-6 pt-12">
          <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
            Every entry below is grouped by what it actually is. A proposal is shown as a
            proposal, a standing institution is not counted as a project, and nothing is
            promoted to a stage its sources do not support.
          </p>

          {/* ── Jump links. The register's own classes, counted. ── */}
          <nav aria-label="Register sections" className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
            {groups.map(g => (
              <a key={g.name} href={`#${g.name.toLowerCase().replace(/\s+/g, '-')}`}
                 className="text-primary text-xs tracking-widest no-underline hover:underline">
                {g.name} · {g.items.length}
              </a>
            ))}
          </nav>

          {/* ── The status vocabulary, counted from the register rather than declared. ── */}
          <p className="mt-4 text-[var(--ink-400)] text-xs leading-relaxed max-w-3xl">
            Statuses in this register:{' '}
            {statuses.map((s, i) => (
              <span key={s.status}>
                {i > 0 && ' · '}{s.status} ({s.count})
              </span>
            ))}
          </p>

          <Link href="/institutions" className="text-primary text-xs tracking-widest mt-4 inline-block no-underline hover:underline">
            The institutions of Guneku →
          </Link>
        </section>
      </Reveal>

      {/* ── What the register does not record ──────────────────────────────────────────
          Stated once, at register level, because it is true of every entry equally.
          Repeating it as five empty rows on twenty-eight cards would say the same thing
          140 times and make a complete record look derelict. */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 pt-10">
          <div className="card-royal p-6 max-w-3xl">
            <h2 className="section-label">What this register does not record</h2>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              The register establishes what each entry is, who carries it, and the record it
              rests on. It does not hold the following for any entry, and nothing here is
              estimated to fill the gap.
            </p>
            <dl className="mt-4 grid gap-3">
              {NOT_RECORDED.map(n => (
                <div key={n.field}>
                  <dt className="text-foreground text-xs font-semibold uppercase tracking-[0.07em]">
                    {n.field}
                  </dt>
                  <dd className="m-0 mt-1 text-muted-foreground text-sm leading-relaxed">
                    {n.note}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              If you can supply any of it,{' '}
              <Link href="/my-guneku/contribute/new?type=missing-information&targetType=page&targetId=%2Fprojects"
                    className="text-primary no-underline hover:underline">
                tell the Palace
              </Link>
              . Nothing is published until a person has reviewed it.
            </p>
          </div>
        </section>
      </Reveal>

      {groups.map(group => (
        <Reveal key={group.name}>
          <section id={group.name.toLowerCase().replace(/\s+/g, '-')}
                   className="max-w-7xl mx-auto px-6 py-12 scroll-mt-20">
            <div className="mb-6">
              <h2 className="section-label">{group.name} · {group.items.length}</h2>
              <p className="mt-2 text-muted-foreground text-sm">{CLASS_NOTE[group.name]}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {group.items.map(p => <ProjectCard key={p.slug} p={p} />)}
            </div>
          </section>
        </Reveal>
      ))}

      {/* ── The register's own provenance ── */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="border-t border-[var(--rule)] pt-6 max-w-3xl">
            <h2 className="section-label">About this register</h2>
            {REGISTER_STATEMENT.map((line, i) => (
              <p key={i} className="mt-3 text-muted-foreground text-sm leading-relaxed">
                {line}
              </p>
            ))}
            <p className="mt-4 text-[var(--ink-400)] text-xs tracking-widest">
              Last reviewed {reviewedOn}
            </p>
          </div>
        </section>
      </Reveal>
    </main>
  )
}
