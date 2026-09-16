'use client'

import { useState } from 'react'
import Image from 'next/image'
import { type BusinessVideo, youtubeEmbedUrl, youtubeThumbnail } from '@/lib/businesses'

/* A business's videos, loaded when somebody asks for one.
 *
 * A page that mounts twelve YouTube iframes has pulled in twelve players, twelve sets of
 * third-party scripts and twelve cookie decisions before the reader has decided to watch
 * anything. Most of this audience is on a mid-range Android on a throttled connection in
 * Cameroon (R-008), where that is the difference between a page and a wait.
 *
 * So each video is a poster and a button until it is pressed. The poster comes from YouTube's
 * own thumbnail for the id, the embed is built by `youtubeEmbedUrl` from the same id, and the
 * id is eleven characters this application validated before storing. Nothing a contributor
 * typed is rendered as markup at any point. */

export function BusinessVideos({ videos, businessName }: {
  videos: BusinessVideo[]
  businessName: string
}) {
  const [playing, setPlaying] = useState<string | null>(null)

  if (videos.length === 0) return null

  return (
    <div className="mt-5 grid gap-5 sm:grid-cols-2">
      {videos.map((v, i) => {
        const title = v.title || `${businessName} — video ${i + 1}`
        const isPlaying = playing === v.videoId

        return (
          <figure key={v.videoId} className="m-0">
            <div className="biz-video">
              {isPlaying ? (
                <iframe
                  src={`${youtubeEmbedUrl(v.videoId)}?autoplay=1&rel=0`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <>
                  <Image
                    src={youtubeThumbnail(v.videoId)}
                    alt=""
                    fill
                    sizes="(max-width: 40rem) 100vw, 50vw"
                    className="biz-video-poster"
                    unoptimized
                  />
                  <button
                    type="button"
                    className="biz-video-play"
                    onClick={() => setPlaying(v.videoId)}
                  >
                    {/* The accessible name says what pressing it does and to what, rather
                        than "play" on twelve identical buttons. */}
                    <span aria-hidden="true">▶</span>
                    <span className="sr-only">Play {title}</span>
                  </button>
                </>
              )}
            </div>
            {v.title && <figcaption className="inst-meta mt-2">{v.title}</figcaption>}
          </figure>
        )
      })}
    </div>
  )
}
