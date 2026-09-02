import Link  from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getAllUpdates } from '@/lib/content'
import type { Update }   from '@/lib/content'
import { PageHero }      from '@/components/layout/PageHero'

export const metadata = {
  alternates: { canonical: '/updates' },
  title:       'Village Square — News from Guneku Fondom',
  description: 'The Guneku news archive — announcements, events and community records from the Fondom, kept in order by year.',
}

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Undated'

/* Migrated 2026-09-02 from the separate `ed-*` / `surface-ink` campaign language into
   the institutional system the homepage uses. Every record, date, excerpt and route is
   unchanged; only the surface, type scale and accents move — paper ground, deep green
   headings, oxblood year markers, one restrained ochre rule. */
export default function UpdatesPage() {
  const updates = getAllUpdates()
  const [featured, ...rest] = updates

  /* Group the remainder by year so the page reads as an archive rather than
     a wall of latest-first cards. Undated records are kept together at the end. */
  const byYear = new Map<string, Update[]>()
  for (const u of rest) {
    const key = u.publishedAt ? String(new Date(u.publishedAt).getFullYear()) : 'Undated'
    if (!byYear.has(key)) byYear.set(key, [])
    byYear.get(key)!.push(u)
  }
  const years = [...byYear.keys()].sort((a, b) => {
    if (a === 'Undated') return 1
    if (b === 'Undated') return -1
    return Number(b) - Number(a)
  })

  return (
    <main className="min-h-screen bg-[var(--paper)]">

      <PageHero
        label="THE VILLAGE SQUARE"
        title="News from Guneku"
        subtitle={`Announcements, events and community records from the Fondom — kept in order, so that what happened in earlier years is not lost behind what happened last. ${updates.length} ${updates.length === 1 ? 'record' : 'records'} across ${years.filter(y => y !== 'Undated').length} years.`}
      />

      {/* ── Latest ── */}
      {featured && (
        <section className="inst-alt inst-rule">
          <div className="inst-wrap inst-sec">
            <Link href={`/updates/${featured.slug}`}
                  className="group grid items-start gap-8 no-underline md:grid-cols-[1.1fr_1fr]">
              {featured.featuredImage && (
                <div className="relative aspect-[16/10] w-full overflow-hidden border border-[var(--rule)] bg-[var(--stone)]">
                  <Image
                    src={featured.featuredImage}
                    alt={(featured as unknown as { leadImageAlt?: string }).leadImageAlt || featured.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              <div>
                <p className="inst-tag">Latest · {fmt(featured.publishedAt)}</p>
                <h2 className="inst-h2 mt-2 group-hover:text-[var(--royal-green)]">
                  {featured.title}
                </h2>
                <div className="mt-3 h-0.5 w-10 bg-[var(--ochre)]" />
                {featured.excerpt && (
                  <p className="inst-body mt-4 line-clamp-4">{featured.excerpt}</p>
                )}
                <span className="inst-link mt-5 inline-flex items-center gap-2">
                  Read the full story <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── Archive by year ── */}
      <section className="inst-wrap inst-sec">
        {years.map(year => (
          <section key={year} className="mb-12 last:mb-0">
            <div className="flex items-baseline gap-4">
              {/* Oxblood marks the year — the secondary identity colour, used once per band. */}
              <h2 className="font-[family-name:var(--font-display)] text-[2.1rem] font-bold leading-none text-[var(--oxblood)]">
                {year}
              </h2>
              <span className="h-px flex-1 bg-[var(--rule)]" />
              <span className="inst-meta">
                {byYear.get(year)!.length} {byYear.get(year)!.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            <ul className="mt-3 list-none p-0">
              {byYear.get(year)!.map(u => (
                <li key={u.slug} className="inst-row">
                  <Link
                    href={`/updates/${u.slug}`}
                    className="group grid items-baseline gap-1 py-4 no-underline sm:grid-cols-[9.5rem_1fr] sm:gap-6"
                  >
                    <span className="inst-meta">{fmt(u.publishedAt)}</span>
                    <span>
                      <span className="inst-h3 block group-hover:text-[var(--royal-green)]">
                        {u.title}
                      </span>
                      {u.excerpt && (
                        <span className="inst-body mt-1 block !text-[0.84rem] line-clamp-2">
                          {u.excerpt}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </main>
  )
}
