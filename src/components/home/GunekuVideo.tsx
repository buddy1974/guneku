import Link  from 'next/link'
import Image from 'next/image'
import { PlayCircle } from 'lucide-react'
import { approvedFilms, featuredFilm, highlightFilms, channel } from '@/lib/guneku-tv'

/* The homepage's window onto Guneku TV.
 *
 * It reads the same `approvedFilms()` predicate as /watch, the search index, the sitemap and
 * the structured data — so a film held in `video-overrides.json` disappears from here at the
 * same moment it disappears from everywhere else. Before this it filtered
 * `dbVideos.state === 1` inline, which meant a second place that had to remember the rules.
 *
 * A small editorial selection, not the library. Thumbnails only: no player and no iframe on
 * the homepage at all, so a reader arriving on a slow connection is never made to download a
 * YouTube runtime before they have chosen to watch anything. */
export function GunekuVideo() {
  const featured = featuredFilm()
  if (!featured) return null

  const total = approvedFilms().length
  const rest  = highlightFilms(3)
  const more  = Math.max(0, total - 1 - rest.length)
  const ch    = channel()

  return (
    <section className="inst-alt inst-rule">
      <div className="inst-wrap inst-sec">

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inst-eyebrow">Guneku TV</p>
            <h2 className="inst-h2 mt-1.5">Watch Guneku</h2>
            <p className="inst-body mt-2 max-w-2xl">
              Palace messages, community events, development reports and culture &mdash;{' '}
              {total} films from the Fondom&rsquo;s own channel, each attached to the record it
              documents.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/watch" className="inst-btn inst-btn-primary">Guneku TV</Link>
            <a href={ch.url} target="_blank" rel="noopener noreferrer" className="inst-btn inst-btn-quiet">
              On YouTube
            </a>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">

          {/* Featured — the poster frame, leading into the hub where it can be played. */}
          <article className="inst-card overflow-hidden">
            <Link href="/watch" className="group block no-underline">
              <div className="relative aspect-video w-full bg-[var(--stone)]">
                {featured.thumb && (
                  <Image
                    src={featured.thumb} alt="" fill unoptimized loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
                  <PlayCircle
                    className="h-14 w-14 text-white drop-shadow-[0_1px_5px_rgba(0,0,0,0.65)]"
                    strokeWidth={1.15} aria-hidden
                  />
                </span>
              </div>
              <div className="p-5">
                <p className="inst-tag">{featured.category}</p>
                <h3 className="inst-h3 mt-1.5">{featured.displayTitle}</h3>
                {featured.context && (
                  <p className="inst-body mt-2 !text-[0.88rem]">{featured.context}</p>
                )}
              </div>
            </Link>
          </article>

          {/* The selection. Three, not forty-six. */}
          <ul className="list-none p-0">
            {rest.map(f => (
              <li key={f.youtubeId} className="inst-row">
                <Link href="/watch" className="group grid grid-cols-[6.5rem_1fr] items-start gap-3.5 py-3 no-underline">
                  <span className="relative block aspect-video w-full overflow-hidden bg-[var(--stone)]">
                    {f.thumb && (
                      <Image src={f.thumb} alt="" fill unoptimized loading="lazy" sizes="104px"
                             className="object-cover" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="inst-h3 block !text-[0.95rem] leading-snug group-hover:text-[var(--royal-green)]">
                      {f.displayTitle}
                    </span>
                    <span className="inst-meta mt-1 block">{f.category}</span>
                  </span>
                </Link>
              </li>
            ))}

            {more > 0 && (
              <li className="pt-4">
                <Link href="/watch" className="inst-link">
                  {more} more {more === 1 ? 'film' : 'films'} in Guneku TV →
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
