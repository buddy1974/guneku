import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { pageMetadata, SITE_URL } from '@/lib/seo'
import { FilmCard } from '@/components/watch/FilmCard'
import {
  approvedFilms, featuredFilm, queryFilms, categoryFacets, groupFacets,
  channel, heldNote, FILM_GROUPS,
} from '@/lib/guneku-tv'

const PER_PAGE = 12

export const metadata = pageMetadata({
  title: 'Guneku TV',
  description:
    'Films of Guneku from the Fondom’s own channel — the Palace, Mɨchi Ǝbeŋ and culture, the GUDECA chapters, health, governance and education, each attached to the record it documents.',
  path: '/watch',
})

/* Guneku TV.
 *
 * Everything on this page comes through `approvedFilms()`, the single approval predicate. No
 * film reaches a reader by any other route, which is what makes the exclusions hold: the
 * private channel upload is deny-listed in one place, and the held Bonn originals are not in
 * this library at all.
 *
 * Filters and search are plain GET links and a plain GET form, so the whole hub works with no
 * JavaScript, every view is linkable, and the back button behaves. The only client JavaScript
 * on the page is the per-card play button, and it exists so that no YouTube iframe is created
 * until a reader asks for one. */
export default async function WatchPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; group?: string; q?: string; page?: string }>
}) {
  const sp = await searchParams
  const q = (sp.q || '').slice(0, 120)
  const category = sp.category || ''
  const group = sp.group || ''
  const page = Number.parseInt(sp.page || '1', 10) || 1

  const filtering = Boolean(category || group || q.trim().length >= 2)
  const result = queryFilms({ category, group, q, page, perPage: PER_PAGE })
  const featured = featuredFilm()
  const total = approvedFilms().length
  const facets = categoryFacets()
  const groups = groupFacets()
  const ch = channel()
  const held = heldNote()

  /* Structured data only for the featured film, and only from fields actually known. No
     uploadDate, no duration, no description: YouTube knows those, this record does not, and
     inventing them to satisfy a schema validator would be inventing facts about Guneku. */
  const filmSchema = featured
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: featured.displayTitle,
        ...(featured.context ? { abstract: featured.context } : {}),
        ...(featured.thumb ? { thumbnailUrl: featured.thumb } : {}),
        embedUrl: `https://www.youtube-nocookie.com/embed/${featured.youtubeId}`,
        url: `${SITE_URL}/watch`,
        isPartOf: { '@type': 'CreativeWorkSeries', name: 'Guneku TV' },
        publisher: { '@type': 'Organization', name: 'Guneku Fondom', url: SITE_URL },
      }
    : null

  const withParams = (next: Record<string, string | undefined>) => {
    const u = new URLSearchParams()
    const merged = { category, group, q, ...next }
    for (const [k, v] of Object.entries(merged)) if (v) u.set(k, v)
    const s = u.toString()
    return s ? `/watch?${s}` : '/watch'
  }

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      {filmSchema && (
        <script type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(filmSchema) }} />
      )}

      <PageHero
        label="GUNEKU TV"
        title="Films of Guneku"
        subtitle={`${total} films from the Fondom’s own channel, each attached to the record it documents. Nothing plays until you ask it to.`}
      />

      {/* ── Featured ── */}
      {featured && !filtering && (
        <section className="inst-alt inst-rule border-b border-[var(--rule)]">
          <div className="inst-wrap inst-sec">
            <p className="inst-eyebrow">Featured</p>
            <div className="mt-4 grid gap-7 lg:grid-cols-[1.55fr_1fr] lg:gap-10">
              <FilmCard film={featured} priority sizes="(max-width: 1024px) 100vw, 60vw" />
              <div className="self-center">
                <h2 className="inst-h2">{featured.displayTitle}</h2>
                {featured.context && <p className="inst-body mt-3">{featured.context}</p>}
                <div className="mt-4 h-0.5 w-10 bg-[var(--ochre)]" />
                <p className="inst-meta mt-4">{featured.category}</p>
                {featured.relatedRoute && (
                  <Link href={featured.relatedRoute} className="inst-btn inst-btn-quiet mt-5">
                    Read the record
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Search and filters ── */}
      <section className="inst-wrap inst-sec">
        <form action="/watch" method="get" role="search" className="max-w-xl">
          <label htmlFor="watch-q" className="block text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[var(--ink-600)]">
            Search the films
          </label>
          <div className="mt-2 flex flex-wrap gap-3">
            <input
              id="watch-q" name="q" type="search" defaultValue={q} maxLength={120}
              placeholder="A subject, a chapter, a year…"
              className="min-w-0 flex-1 rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] px-3.5 py-2.5 text-[0.95rem] text-[var(--ink-900)] focus:border-[var(--royal-green)] focus:outline-none"
            />
            {category && <input type="hidden" name="category" value={category} />}
            {group && <input type="hidden" name="group" value={group} />}
            <button type="submit" className="inst-btn inst-btn-primary">Search</button>
          </div>
        </form>

        {/* Coarse groups. Only those with films are offered — an empty filter is a dead end,
            and Development and Archive have no films because no record supports putting one
            there. */}
        <div className="mt-7">
          <p className="inst-eyebrow">By subject</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Link href={withParams({ group: undefined, page: undefined })}
                  className={`inst-btn ${!group ? 'inst-btn-primary' : 'inst-btn-quiet'}`}>
              All
            </Link>
            {groups.filter(g => g.count > 0).map(g => (
              <Link key={g.group} href={withParams({ group: g.group, page: undefined })}
                    className={`inst-btn ${group === g.group ? 'inst-btn-primary' : 'inst-btn-quiet'}`}>
                {g.group} <span className="opacity-60">{g.count}</span>
              </Link>
            ))}
          </div>
          {FILM_GROUPS.some(g => !groups.find(x => x.group === g)?.count) && (
            <p className="inst-meta mt-2.5 max-w-2xl">
              {FILM_GROUPS.filter(g => !groups.find(x => x.group === g)?.count).join(' and ')}{' '}
              {FILM_GROUPS.filter(g => !groups.find(x => x.group === g)?.count).length === 1 ? 'has' : 'have'}{' '}
              no films: no record supports placing one there, and a film is not moved to fill a
              gap. Use the archive&rsquo;s own labels below instead.
            </p>
          )}
        </div>

        {/* The record's own categories. These are sourced labels, not a scheme invented for
            this page, which is why there are nine rather than six. */}
        <div className="mt-7 border-t border-[var(--rule)] pt-6">
          <p className="inst-eyebrow">By the archive&rsquo;s own label</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Link href={withParams({ category: undefined, page: undefined })}
                  className={`inst-btn ${!category ? 'inst-btn-primary' : 'inst-btn-quiet'}`}>
              All {total}
            </Link>
            {facets.map(f => (
              <Link key={f.category} href={withParams({ category: f.category, page: undefined })}
                    className={`inst-btn ${category === f.category ? 'inst-btn-primary' : 'inst-btn-quiet'}`}>
                {f.category} <span className="opacity-60">{f.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── The films ── */}
      <section className="inst-alt border-y border-[var(--rule)]">
        <div className="inst-wrap inst-sec">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="inst-h2">
              {filtering ? 'Matching films' : 'The whole library'}
            </h2>
            <p className="inst-meta">
              {result.total === 0 ? 'none' :
                `${result.total} film${result.total === 1 ? '' : 's'}` +
                (result.pages > 1 ? ` · page ${result.page} of ${result.pages}` : '')}
            </p>
          </div>

          {result.total === 0 ? (
            <div className="mt-6 max-w-2xl">
              <p className="inst-body">
                No film in the archive matches that. The Fondom&rsquo;s channel holds {total}{' '}
                approved films; much of Guneku has never been filmed at all.
              </p>
              <Link href="/watch" className="inst-btn inst-btn-quiet mt-4">Show every film</Link>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {result.films.map((f, i) => (
                  <FilmCard key={f.youtubeId} film={f} priority={i === 0 && filtering} />
                ))}
              </div>

              {result.pages > 1 && (
                <nav aria-label="Film pages" className="mt-9 flex flex-wrap items-center gap-2">
                  {result.page > 1 && (
                    <Link href={withParams({ page: String(result.page - 1) })} className="inst-btn inst-btn-quiet">
                      ← Previous
                    </Link>
                  )}
                  {Array.from({ length: result.pages }, (_, i) => i + 1).map(n => (
                    <Link key={n} href={withParams({ page: n === 1 ? undefined : String(n) })}
                          aria-current={n === result.page ? 'page' : undefined}
                          className={`inst-btn ${n === result.page ? 'inst-btn-primary' : 'inst-btn-quiet'}`}>
                      {n}
                    </Link>
                  ))}
                  {result.page < result.pages && (
                    <Link href={withParams({ page: String(result.page + 1) })} className="inst-btn inst-btn-quiet">
                      Next →
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── What the archive holds and does not show ── */}
      <section className="inst-wrap inst-sec">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          {held && (
            <div>
              <h2 className="inst-h2">Material held back</h2>
              <p className="inst-body mt-3 max-w-2xl">{held}</p>
              <p className="inst-body mt-3 max-w-2xl">
                Nothing above is captioned by guesswork. Where this archive has not verified a
                film&rsquo;s published title, no title is asserted &mdash; the subject shown is
                the one the record establishes, and no speaker is named who is not named in a
                source.
              </p>
            </div>
          )}

          <aside className="self-start">
            <h2 className="inst-h3">The channel</h2>
            <p className="inst-body mt-2 !text-[0.9rem]">
              Every film here is hosted on the Fondom&rsquo;s own channel, {ch.title}.
            </p>
            <a href={ch.url} target="_blank" rel="noopener noreferrer"
               className="inst-link mt-2.5 inline-block">
              Visit the channel on YouTube →
            </a>
            <div className="mt-6 border-t border-[var(--rule)] pt-5">
              <p className="inst-eyebrow">Elsewhere</p>
              <ul className="mt-2.5 list-none space-y-2 p-0">
                <li><Link href="/gallery/images" className="inst-link">The photograph archive →</Link></li>
                <li><Link href="/updates" className="inst-link">News and records →</Link></li>
                <li><Link href="/search" className="inst-link">Search everything →</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
