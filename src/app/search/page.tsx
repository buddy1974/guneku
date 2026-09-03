import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { pageMetadata } from '@/lib/seo'
import { search, indexSize, indexBreakdown } from '@/lib/search-index'

export const metadata = {
  ...pageMetadata({
    title: 'Search Guneku',
    description:
      'Search the whole Guneku record at once — people and office holders, quarters and places, the Palace and the Kingdom, projects, institutions, news, photographs and films.',
    path: '/search',
  }),
  /* The page is indexable; a particular result set is not. */
  robots: { index: true, follow: true },
}

/* Search runs on the server. The form is a plain GET, so it works with no JavaScript, the
   result page is linkable and shareable, and the browser's back button behaves. There is no
   model involved anywhere: the same query always returns the same results in the same order. */
export default async function SearchPage({
  searchParams,
}: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const query = (q || '').slice(0, 120)
  const results = query.trim().length >= 2 ? search(query) : null
  const breakdown = indexBreakdown()

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label="SEARCH"
        title="Search Guneku"
        subtitle={`One search across the whole record — ${indexSize()} entries: people and office holders, quarters and places, the Palace and the Kingdom, projects, institutions, news, photographs and films.`}
      />

      <section className="inst-wrap inst-sec">
        <form action="/search" method="get" role="search" className="max-w-2xl">
          <label htmlFor="q" className="block text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[var(--ink-600)]">
            What are you looking for?
          </label>
          <div className="mt-2 flex flex-wrap gap-3">
            <input
              id="q" name="q" type="search" defaultValue={query} autoFocus
              maxLength={120} placeholder="A name, a quarter, a project, a year…"
              className="min-w-0 flex-1 rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] px-3.5 py-3 text-[1rem] text-[var(--ink-900)] focus:border-[var(--royal-green)] focus:outline-none"
            />
            <button type="submit" className="inst-btn inst-btn-primary">Search</button>
          </div>
        </form>

        {/* ── No query yet: say what is searchable rather than showing an empty box ── */}
        {!results && (
          <div className="mt-10">
            <h2 className="inst-h3">What is in the index</h2>
            <ul className="mt-3 grid list-none gap-x-8 gap-y-0 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {breakdown.map(b => (
                <li key={b.group} className="inst-row">
                  <div className="flex items-baseline justify-between gap-4 py-2.5">
                    <span className="inst-body !text-[0.9rem]">{b.group}</span>
                    <span className="inst-meta">{b.count}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="inst-meta mt-5 max-w-2xl">
              The Business Directory, the empty Kingdom stubs and any record without a
              publication date are deliberately not searchable. Nothing held reaches this
              index.
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {results && results.total === 0 && (
          <div className="mt-10 max-w-2xl">
            <h2 className="inst-h2">Nothing found for &ldquo;{query}&rdquo;</h2>
            <p className="inst-body mt-3">
              The Guneku record holds nothing matching that. It may be spelled differently in
              the archive, or it may simply not have been written down yet &mdash; much of the
              village is not, and that is what the contribution route is for.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/indigenes/submit?intent=add" className="inst-btn inst-btn-primary">
                Contribute to the record
              </Link>
              <Link href="/quarters" className="inst-btn inst-btn-quiet">Browse the quarters</Link>
            </div>
          </div>
        )}

        {results && results.total > 0 && (
          <div className="mt-10">
            <p className="inst-meta">
              {results.total} {results.total === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
            </p>

            <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-x-14">
              {results.groups.map(g => (
                <section key={g.group} aria-labelledby={`g-${g.group}`}>
                  <h2 id={`g-${g.group}`} className="inst-eyebrow">{g.group}</h2>
                  <ul className="mt-2.5 list-none p-0">
                    {g.results.map(r => (
                      <li key={r.id} className="inst-row">
                        <Link href={r.href} className="group block py-3.5 no-underline">
                          <span className="inst-h3 !text-[1.02rem] group-hover:text-[var(--royal-green)]">
                            {r.title}
                          </span>
                          {r.excerpt && (
                            <span className="inst-body mt-1 block !text-[0.86rem]">{r.excerpt}</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <p className="inst-meta mt-10 max-w-2xl">
              Results are ranked by how closely the record matches what you typed. Nothing
              here is generated: every entry is a record in the Guneku archive, and the link
              takes you to it.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
