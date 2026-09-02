import Link  from 'next/link'
import Image from 'next/image'
import { PlayCircle } from 'lucide-react'
import gallery from '@/data/gallery/video-gallery.json'

/* Guneku's YouTube channel is the community's video archive, so it gets a
   real section rather than a gallery footnote. Titles here are the real
   published titles, verified against YouTube; nothing is invented. Only the
   public channel URL is ever published — never a Studio or admin URL. */
export function GunekuVideo() {
  const videos   = gallery.dbVideos.filter(v => v.state === 1)
  const featured = videos[0]
  /* An editorial subset, not the whole archive. Forty-five items beside one selected
     video is what stretched this grid and left the dead space under the card. */
  const rest     = videos.slice(1, 6)
  const more     = Math.max(0, videos.length - 6)

  if (!featured) return null

  return (
    <section className="inst-alt inst-rule">
      <div className="inst-wrap inst-sec">

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inst-eyebrow">Guneku Video</p>
            <h2 className="inst-h2 mt-1.5">Watch Guneku</h2>
            <p className="inst-body mt-2 max-w-2xl">
              Reports, community events, development updates, Palace messages and
              stories from Guneku.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/gallery/videos" className="inst-btn inst-btn-quiet">All videos</Link>
            <a href={gallery.channelUrl} target="_blank" rel="noopener noreferrer" className="inst-btn inst-btn-primary">
              Guneku on YouTube
            </a>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">

          {/* Featured — real thumbnail, click through to the page it belongs to */}
          <article className="inst-card overflow-hidden">
            <Link href={featured.relatedRoute || '/gallery/videos'} className="group block no-underline">
              <div className="relative aspect-video w-full bg-[var(--stone)]">
                <Image
                  src={featured.thumb}
                  alt={featured.displayTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="h-14 w-14 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]" strokeWidth={1.25} aria-hidden />
                </span>
              </div>
              <div className="p-5">
                <p className="inst-tag">{featured.category} · Latest</p>
                <h3 className="inst-h2 mt-1.5 group-hover:text-[var(--burgundy-i)]">{featured.displayTitle}</h3>
                <p className="inst-body mt-2">{featured.context}</p>
                <p className="inst-meta mt-2">Published on YouTube as “{featured.title}”</p>
                <p className="inst-link mt-3">Watch video →</p>
              </div>
            </Link>
          </article>

          {/* More from the channel */}
          <div>
            <h3 className="inst-tag">More from the channel</h3>
            <ul className="mt-3 list-none p-0">
              {rest.map(v => (
                <li key={v.youtubeId} className="inst-row">
                  <Link href={v.relatedRoute || '/gallery/videos'} className="group flex gap-3 py-3 no-underline">
                    <span className="relative aspect-video w-28 shrink-0 bg-[var(--stone)]">
                      <Image src={v.thumb} alt={v.displayTitle} fill sizes="112px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="inst-tag block">{v.category}</span>
                      <span className="inst-h3 mt-0.5 block group-hover:text-[var(--burgundy-i)]">{v.displayTitle}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link href="/gallery/videos" className="inst-link mt-4 inline-block">
              {more > 0 ? `All ${videos.length} videos →` : 'All videos →'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
