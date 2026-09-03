'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PlayCircle } from 'lucide-react'
import type { Film } from '@/lib/guneku-tv'

/* A film card that shows a poster frame and nothing else until someone asks to watch.
 *
 * The rule this enforces: **no iframe exists on the page until a click.** Forty-six embedded
 * YouTube players would each pull a few hundred kilobytes of player code and set cookies
 * before a reader had chosen to watch anything — on a mid-range Android over a throttled
 * connection, which is most of this audience, the page would simply not arrive. So the card
 * is an image and a button, and the iframe is created in place, once, for the one film the
 * reader picked.
 *
 * `youtube-nocookie.com` is used deliberately: a reader browsing the Fondom's archive has not
 * asked to be tracked, and the poster-frame approach means nothing is requested from YouTube
 * at all until they press play. */
export function FilmCard({
  film, priority = false, sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: { film: Film; priority?: boolean; sizes?: string }) {
  const [playing, setPlaying] = useState(false)

  return (
    <article className="inst-card flex h-full flex-col overflow-hidden">
      <div className="relative aspect-video w-full bg-[var(--stone)]">
        {playing ? (
          <iframe
            /* autoplay is correct here and only here: the reader just pressed play. */
            src={`https://www.youtube-nocookie.com/embed/${film.youtubeId}?autoplay=1&rel=0`}
            title={film.displayTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play: ${film.displayTitle}`}
            className="group absolute inset-0 h-full w-full cursor-pointer border-0 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--royal-green)]"
          >
            {film.thumb && (
              <Image
                src={film.thumb} alt="" fill unoptimized sizes={sizes}
                loading={priority ? undefined : 'lazy'} priority={priority}
                className="object-cover"
              />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
              <PlayCircle
                className="h-14 w-14 text-white drop-shadow-[0_1px_5px_rgba(0,0,0,0.65)]"
                strokeWidth={1.15} aria-hidden
              />
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="inst-tag">{film.category}</p>
        <h3 className="inst-h3 mt-1.5 !text-[1.02rem]">{film.displayTitle}</h3>

        {film.context && (
          <p className="inst-body mt-1.5 flex-1 !text-[0.85rem]">{film.context}</p>
        )}

        {/* The channel's own title is shown only where this archive verified it against
            YouTube. On 44 of the 46 it is unverified, and there the subject above is what the
            record establishes — the player itself carries whatever the channel calls it. */}
        {film.publishedTitle && (
          <p className="inst-meta mt-2">Published on YouTube as &ldquo;{film.publishedTitle}&rdquo;</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          {film.relatedRoute && (
            <Link href={film.relatedRoute} className="inst-link">The record this documents →</Link>
          )}
          <a
            href={film.youtubeUrl} target="_blank" rel="noopener noreferrer"
            className="inst-link inline-flex items-center gap-1.5"
          >
            <PlayCircle className="h-3.5 w-3.5" aria-hidden /> Watch on YouTube
          </a>
        </div>
      </div>
    </article>
  )
}
