import { PageHero } from '@/components/layout/PageHero'
import { Reveal }   from '@/components/ui/Reveal'
import Link         from 'next/link'
import current      from '@/data/current-notices.json'

export const metadata = {
  alternates: { canonical: '/projects' },
  description: "The full Guneku development register — projects, institutions, programmes, proposals, historical records and open issues, each shown at the stage its sources establish.", title: 'Projects — Guneku Development' }

/* This page used to carry its own hardcoded array of eleven cards, independent of
   the register the home page reads. Two lists, one subject, no link between them —
   and a subtitle ("11 active · 4 proposed") that described neither. There is now one
   register, src/data/current-notices.json, and both views read it. Every number on
   this page is counted from that file rather than typed. */

type Entry = {
  name: string
  class?: string
  status: string
  statusClass: string
  body: string
  lastUpdate: string
  description: string
  href: string
}

/* The register's own status colours, matching the .st-* rules in globals.css.
   No new colour is introduced here. */
const STATUS_COLOR: Record<string, string> = {
  'st-active':     'oklch(0.46 0.10 150)',
  'st-ongoing':    'oklch(0.50 0.10 240)',
  'st-proposed':   'var(--ink-400)',
  'st-historical': 'var(--ink-400)',
}

/* Fixed display order. The vocabulary itself lives in the register. */
const CLASS_ORDER = [
  'PROJECT',
  'PROGRAMME',
  'INSTITUTION',
  'PROPOSED INITIATIVE',
  'HISTORICAL RECORD',
  'OPEN ISSUE',
] as const

const CLASS_NOTE: Record<string, string> = {
  'PROJECT':             'Work under way in the village, with a body carrying it.',
  'PROGRAMME':           'Something that runs repeatedly rather than finishing.',
  'INSTITUTION':         'A standing body or facility, not a project with an end date.',
  'PROPOSED INITIATIVE': 'Proposed and recorded as proposed. Not begun.',
  'HISTORICAL RECORD':   'Completed, delivered or ended. Kept as part of the record.',
  'OPEN ISSUE':          'A problem the community has raised and the sources leave unresolved.',
}

export default function ProjectsPage() {
  const register = current.development as Entry[]

  const groups = CLASS_ORDER
    .map(c => ({ name: c, items: register.filter(e => e.class === c) }))
    .filter(g => g.items.length > 0)

  /* Counted, not asserted. */
  const total    = register.length
  const proposed = register.filter(e => e.class === 'PROPOSED INITIATIVE').length
  const running  = register.filter(e =>
    e.class === 'PROJECT' || e.class === 'PROGRAMME' || e.class === 'INSTITUTION').length

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
          <Link href="/institutions" className="text-primary text-xs tracking-widest mt-4 inline-block no-underline hover:underline">
            The institutions of Guneku →
          </Link>
        </section>
      </Reveal>

      {groups.map(group => (
        <Reveal key={group.name}>
          <section className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-6">
              {/* A heading, not a styled div: the cards below are h3 and the page
                  needs an h2 between them and the h1 for a sequential outline. */}
              <h2 className="section-label">{group.name} · {group.items.length}</h2>
              <p className="mt-2 text-muted-foreground text-sm">{CLASS_NOTE[group.name]}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {group.items.map(p => {
                const color = STATUS_COLOR[p.statusClass] ?? 'var(--ink-400)'
                const card = (
                  <div className="card-royal p-6 flex flex-col h-full"
                       style={{ borderTopWidth: '3px', borderTopColor: color }}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-cinzel text-foreground text-lg leading-snug flex-1 pr-3">{p.name}</h3>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.07em] px-2 py-0.5 shrink-0 rounded-[2px] border"
                            style={{ color, borderColor: color }}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">{p.description}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-[var(--ink-400)] text-xs tracking-widest">{p.lastUpdate}</span>
                      {p.href && p.href !== '/projects' && (
                        <span className="text-primary text-xs tracking-widest shrink-0">Learn more →</span>
                      )}
                    </div>
                  </div>
                )
                return p.href && p.href !== '/projects' ? (
                  <Link key={p.name} href={p.href} className="block no-underline">{card}</Link>
                ) : (
                  <div key={p.name}>{card}</div>
                )
              })}
            </div>
          </section>
        </Reveal>
      ))}
    </main>
  )
}
