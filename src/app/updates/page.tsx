import Link  from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getAllUpdates } from '@/lib/content'
import type { Update }   from '@/lib/content'

export const metadata = {
  title:       'Village Square — News from Guneku Fondom',
  description: 'The Guneku news archive — announcements, events and community records from the Fondom, kept in order by year.',
}

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Undated'

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
    <main className="surface-ink min-h-screen">

      {/* ── Masthead ── */}
      <section className="border-b border-white/10">
        <div className="shell py-14 md:py-20">
          <p className="ed-eyebrow">The Village Square</p>
          <h1 className="ed-display mt-4 text-[var(--ivory)]">News from Guneku</h1>
          <p className="ed-body mt-5 text-white/60">
            Announcements, events and community records from the Fondom — kept in order,
            so that what happened in earlier years is not lost behind what happened last.
          </p>
          <p className="ed-meta mt-6 text-white/40">
            {updates.length} {updates.length === 1 ? 'record' : 'records'} · {years.filter(y => y !== 'Undated').length} years
          </p>
        </div>
      </section>

      {/* ── Featured ── */}
      {featured && (
        <section className="border-b border-white/10">
          <div className="shell py-12 md:py-16">
            <Link href={`/updates/${featured.slug}`} className="group grid gap-8 no-underline md:grid-cols-[1.1fr_1fr] md:items-center">
              {featured.featuredImage && (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/30">
                  <Image
                    src={featured.featuredImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    priority
                  />
                </div>
              )}
              <div>
                <p className="ed-kicker text-[var(--brass)]">Latest · {fmt(featured.publishedAt)}</p>
                <h2 className="ed-h2 mt-3 text-[var(--ivory)] transition-colors group-hover:text-[var(--brass)]">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="ed-body mt-4 text-white/60 line-clamp-4">{featured.excerpt}</p>
                )}
                <span className="ed-kicker mt-5 inline-flex items-center gap-2 text-[var(--brass)]">
                  Read the full story <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── Archive by year ── */}
      <section className="shell py-12 md:py-16">
        {years.map(year => (
          <section key={year} className="mb-12 last:mb-0">
            <div className="flex items-baseline gap-4">
              <h2 className="font-cormorant text-[2.5rem] font-semibold leading-none text-[var(--brass)]">{year}</h2>
              <span className="rule-hair flex-1" />
              <span className="ed-meta text-white/35">
                {byYear.get(year)!.length} {byYear.get(year)!.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            <ul className="mt-4 list-none p-0">
              {byYear.get(year)!.map(u => (
                <li key={u.slug} className="border-b border-white/10 first:border-t">
                  <Link
                    href={`/updates/${u.slug}`}
                    className="group grid items-baseline gap-1 py-4 no-underline sm:grid-cols-[9.5rem_1fr] sm:gap-6"
                  >
                    <span className="ed-meta text-white/40">{fmt(u.publishedAt)}</span>
                    <span>
                      <span className="ed-h3 block text-[var(--ivory)] transition-colors group-hover:text-[var(--brass)]">
                        {u.title}
                      </span>
                      {u.excerpt && (
                        <span className="ed-body mt-1 block !text-[0.82rem] text-white/50 line-clamp-2">
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
