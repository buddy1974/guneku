import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/layout/PageHero'
import { pageMetadata } from '@/lib/seo'
import { allQuarters, getQuarter, type QuarterLink } from '@/lib/quarter-pages'
import { councilFor } from '@/lib/quarter-councils'

export function generateStaticParams() {
  return allQuarters().map(q => ({ slug: q.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const q = getQuarter(slug)
  if (!q) return {}

  const described = q.links.length > 0
    ? `What the Guneku Fondom’s records establish about ${q.name} quarter: ${q.links.map(l => l.label).slice(0, 3).join(', ')}.`
    : `${q.name} is one of the twenty-seven quarters of Guneku. The Fondom’s archive holds no record about it yet.`

  return {
    ...pageMetadata({
      title: `${q.name} — a quarter of Guneku`,
      description: described,
      path: `/quarters/${q.slug}`,
    }),
    /* A page with nothing recorded is offered to a reader who arrives, but not to a search
       engine as though it held something. It becomes indexable when it has content. */
    ...(q.links.length === 0 ? { robots: { index: false, follow: true } } : {}),
  }
}

const KIND_LABEL: Record<QuarterLink['kind'], string> = {
  person:      'Person',
  people:      'Register',
  institution: 'Institution',
  project:     'Development',
  update:      'Record',
  kingdom:     'The Kingdom',
  gallery:     'Archive',
}

export default async function QuarterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const q = getQuarter(slug)
  if (!q) notFound()

  /* Whoever the archive names in this quarter's traditional council — usually nobody. */
  const council = councilFor(q.name)

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label="A QUARTER OF GUNEKU"
        title={q.name}
        subtitle={`One of the twenty-seven quarters of Guneku, in Mbengwi Subdivision, Momo Division.`}
      />

      <section className="inst-wrap inst-sec">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <div>
            {q.note && (
              <p className="inst-body max-w-2xl border-l-2 border-[var(--ochre)] pl-4">
                {q.note}
              </p>
            )}

            {q.links.length > 0 ? (
              <>
                <h2 className={`inst-h2 ${q.note ? 'mt-8' : ''}`}>In the record</h2>
                <p className="inst-body mt-2 max-w-2xl">
                  Every entry below is attached to {q.name} because a record says so, and the
                  sentence that says it is quoted with each one.
                </p>

                <ul className="mt-6 list-none p-0">
                  {q.links.map(l => (
                    <li key={l.href + l.label} className="inst-row">
                      <div className="py-4">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="inst-tag">{KIND_LABEL[l.kind]}</span>
                          <Link href={l.href} className="inst-h3 no-underline hover:text-[var(--royal-green)]">
                            {l.label}
                          </Link>
                        </div>
                        <p className="inst-body mt-2 max-w-2xl !text-[0.86rem] text-[var(--ink-600)]">
                          {l.evidence}
                        </p>
                        <Link href={l.href} className="inst-link mt-2 inline-block">
                          Read the record →
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              /* The honest empty state. It says what is true — the archive holds nothing
                 about this quarter — rather than filling the page with paragraphs that
                 would read as knowledge and be invention. */
              <div className={q.note ? 'mt-8' : ''}>
                <h2 className="inst-h2">Nothing recorded yet</h2>
                <p className="inst-body mt-3 max-w-2xl">
                  {q.name} is named in the Fondom&rsquo;s list of twenty-seven quarters, and
                  that is all the archive currently holds about it. No institution, project,
                  office holder, market day or photograph in the record names it.
                </p>
                <p className="inst-body mt-3 max-w-2xl">
                  This page is deliberately empty rather than filled. A quarter that has stood
                  for generations deserves a record written by the people who live in it, not a
                  paragraph assembled to look complete.
                </p>
              </div>
            )}
            {/* ── The quarter council ──────────────────────────────────────────────────
                Every quarter of Guneku has a traditional council. The Fon called quarter
                elections in 2021 and councillors were installed in the Palace, so the
                councils exist as a matter of record. What the archive mostly does not hold
                is who sits on them.

                Omitting the council would publish the false impression that this quarter has
                no governance. Filling it with a plausible name, or a "TBC" that reads as a
                person, would be worse. So the structure is shown, what is known is published,
                the gap is named as a gap, and the people who know are given a way in. */}
            <div className="mt-10 border-t border-[var(--rule)] pt-8">
              <h2 className="inst-h2">The {q.name} quarter council</h2>

              {council.members.length > 0 ? (
                <>
                  <p className="inst-body mt-2 max-w-2xl">
                    Those the Fondom&rsquo;s records name in this quarter&rsquo;s council. The
                    words beside each name are the record&rsquo;s own.
                  </p>
                  <ul className="mt-5 list-none p-0">
                    {council.members.map(m => (
                      <li key={m.slug} className="inst-row py-3.5">
                        <Link href={`/indigenes/founding/${m.slug}`}
                              className="inst-h3 no-underline hover:text-[var(--royal-green)]">
                          {m.display}
                        </Link>
                        <p className="inst-body mt-1 max-w-2xl !text-[0.88rem]">{m.role}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="inst-meta mt-4 max-w-2xl">
                    A council has more members than the archive names. If you know who else
                    serves on this one, the record is open to you.
                  </p>
                </>
              ) : (
                <>
                  <p className="inst-body mt-2 max-w-2xl">
                    {q.name} holds its own traditional council, as every quarter of Guneku
                    does. <strong className="text-[var(--ink-900)]">The Fondom&rsquo;s record
                    does not yet name who sits on it.</strong>
                  </p>
                  <p className="inst-body mt-3 max-w-2xl !text-[0.9rem]">
                    No name is supplied here by guesswork. The council is shown because it
                    exists; it is empty because the record is silent, and that is a gap the
                    people of {q.name} can close.
                  </p>
                </>
              )}

              <Link
                href={`/my-guneku/contribute/new?type=quarter-information&targetType=quarter&targetId=${encodeURIComponent(q.name)}`}
                className="inst-btn inst-btn-primary mt-5"
              >
                {council.members.length > 0
                  ? 'Add to this council’s record'
                  : 'Provide this council’s information'}
              </Link>
            </div>
          </div>

          <aside className="self-start">
            <div className="inst-card p-5">
              <h2 className="inst-h3">Know something missing?</h2>
              <p className="inst-body mt-2 !text-[0.88rem]">
                If you know {q.name} &mdash; its history, its institutions, who holds office
                there, its market, its families &mdash; put it forward. Nothing is published
                until the Palace has reviewed it.
              </p>
              <Link
                href={`/my-guneku/contribute/new?targetType=quarter&targetId=${encodeURIComponent(q.name)}`}
                className="inst-btn inst-btn-primary mt-4 w-full justify-center">
                Contribute to the record
              </Link>
            </div>

            <div className="mt-6 border-t border-[var(--rule)] pt-5">
              <p className="inst-eyebrow">Elsewhere</p>
              <ul className="mt-2.5 list-none space-y-2 p-0">
                <li><Link href="/quarters" className="inst-link">All twenty-seven quarters →</Link></li>
                <li><Link href="/kingdom/about-guneku" className="inst-link">About Guneku →</Link></li>
                <li><Link href="/people/traditional-council" className="inst-link">The Traditional Council →</Link></li>
                <li><Link href="/projects" className="inst-link">The development register →</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
