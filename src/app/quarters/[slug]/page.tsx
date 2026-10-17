import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/layout/PageHero'
import { pageMetadata } from '@/lib/seo'
import { PageGraph } from '@/components/seo/PageGraph'
import { PLACE_ID } from '@/lib/schema'
import { allQuarters, getQuarter, type QuarterLink } from '@/lib/quarter-pages'
import { councilFor } from '@/lib/quarter-councils'

export function generateStaticParams() {
  return allQuarters().map(q => ({ slug: q.slug }))
}

/* Said once, because the page and its metadata must not describe the quarter differently.
   A quarter with nothing recorded says so, in the same words in both places. */
function described(q: NonNullable<ReturnType<typeof getQuarter>>): string {
  return q.links.length > 0
    ? `${q.name}, one of the twenty-seven quarters of Guneku: ${q.links.map(l => l.label).slice(0, 3).join(', ')}.`
    : `${q.name} is one of the twenty-seven quarters of Guneku, in Mbengwi Subdivision, Momo Division. Help us tell its story.`
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const q = getQuarter(slug)
  if (!q) return {}

  return {
    ...pageMetadata({
      title: `${q.name} — a quarter of Guneku`,
      description: described(q),
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
  fondom:      'The Fondom',
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
      {/* A quarter is part of the village, so the page is about Guneku rather than about
          a place of its own: the record holds no boundary and no coordinates for a
          quarter, and a Place node with a name and nothing else says less than nothing. */}
      <PageGraph
        path={`/quarters/${q.slug}`}
        name={`${q.name} — a quarter of Guneku`}
        description={described(q)}
        about={PLACE_ID}
        trail={[{ name: 'The 27 quarters', path: '/quarters' }]}
      />

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
                <h2 className={`inst-h2 ${q.note ? 'mt-8' : ''}`}>{q.name} on this site</h2>

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
                        {/* `evidence` is the editors' note on why this link belongs to the
                            quarter. It stays in the registry and is not shown to readers. */}
                        <Link href={l.href} className="inst-link mt-2 inline-block">
                          Read more →
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
                <h2 className="inst-h2">{q.name}&rsquo;s story is still to be written</h2>
                <p className="inst-body mt-3 max-w-2xl">
                  {q.name} is one of our twenty-seven quarters, and its page is waiting for the
                  people who know it best. Its history, its families, its market day, its
                  churches and schools, who holds office there, its photographs: all of it
                  belongs here.
                </p>
                <p className="inst-body mt-3 max-w-2xl">
                  A quarter that has stood for generations deserves to be described by its own
                  people. If you are from {q.name}, help us tell its story.
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
                    Members of this quarter&rsquo;s council known to the Palace.
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
                    A council has more members than are listed here. If you know who else serves
                    on this one, please tell us.
                  </p>
                </>
              ) : (
                <>
                  <p className="inst-body mt-2 max-w-2xl">
                    {q.name} has its own traditional council, as every quarter of Guneku does.
                    Its members are not yet listed here.
                  </p>
                  <p className="inst-body mt-3 max-w-2xl !text-[0.9rem]">
                    If you know who sits on the {q.name} council, please tell us.
                  </p>
                </>
              )}

              <Link
                href={`/my-guneku/contribute/new?type=quarter-information&targetType=quarter&targetId=${encodeURIComponent(q.name)}`}
                className="inst-btn inst-btn-primary mt-5"
              >
                {council.members.length > 0
                  ? 'Add a council member'
                  : 'Tell us who sits on this council'}
              </Link>
            </div>
          </div>

          <aside className="self-start">
            <div className="inst-card p-5">
              <h2 className="inst-h3">Know something missing?</h2>
              <p className="inst-body mt-2 !text-[0.88rem]">
                If you know {q.name} &mdash; its history, its institutions, who holds office
                there, its market, its families &mdash; share it with us. The Palace reviews
                every contribution before it appears.
              </p>
              <Link
                href={`/my-guneku/contribute/new?targetType=quarter&targetId=${encodeURIComponent(q.name)}`}
                className="inst-btn inst-btn-primary mt-4 w-full justify-center">
                Share what you know
              </Link>
            </div>

            <div className="mt-6 border-t border-[var(--rule)] pt-5">
              <p className="inst-eyebrow">Elsewhere</p>
              <ul className="mt-2.5 list-none space-y-2 p-0">
                <li><Link href="/quarters" className="inst-link">All twenty-seven quarters →</Link></li>
                <li><Link href="/fondom/about-guneku" className="inst-link">About Guneku →</Link></li>
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
