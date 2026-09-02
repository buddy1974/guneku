import Link  from 'next/link'
import { PlayCircle } from 'lucide-react'
import gallery from '@/data/gallery/video-gallery.json'

export const metadata = {
  title:       'Video Archive',
  description: 'The Guneku video archive — Palace messages, community events, development updates and education reports from the official Guneku Village channel.',
  alternates:  { canonical: '/gallery/videos' },
}

/* Categories follow the categories the records actually carry. Nothing is
   classified by guesswork, and no title or speaker is invented. */
export default function VideoArchivePage() {
  const videos = gallery.dbVideos.filter(v => v.state === 1)

  const categories = [...new Set(videos.map(v => v.category))]
    .map(c => ({ name: c, items: videos.filter(v => v.category === c) }))

  return (
    <main className="inst min-h-screen">

      <section className="border-b border-[var(--rule)]">
        <div className="inst-wrap py-10 md:py-12">
          <p className="inst-eyebrow">Media</p>
          <h1 className="inst-h1 mt-2">Guneku video archive</h1>
          <p className="inst-body mt-3 max-w-2xl">
            Reports, community events, development updates and Palace messages from the
            official Guneku Village channel.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={gallery.channelUrl} target="_blank" rel="noopener noreferrer" className="inst-btn inst-btn-primary">
              Guneku on YouTube
            </a>
            <Link href="/gallery/images" className="inst-btn inst-btn-quiet">Image gallery</Link>
          </div>
        </div>
      </section>

      {categories.map(cat => (
        <section key={cat.name} className="border-b border-[var(--rule)]">
          <div className="inst-wrap inst-sec">
            <h2 className="inst-h2">{cat.name}</h2>

            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cat.items.map(v => (
                <article key={v.youtubeId} className="inst-card overflow-hidden">
                  <div className="relative aspect-video w-full bg-[var(--stone)]">
                    <iframe
                      className="absolute inset-0 h-full w-full border-0"
                      src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0`}
                      title={v.displayTitle}
                      loading="lazy"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4">
                    <p className="inst-tag">{v.category}</p>
                    <h3 className="inst-h3 mt-1">{v.displayTitle}</h3>
                    {v.context && <p className="inst-body mt-1.5 !text-[0.84rem]">{v.context}</p>}
                    {/* Only assert a YouTube title where this archive has verified it.
                        For the rest the subject above is what the record establishes,
                        and the player itself carries the channel's own title. */}
                    {v.titleVerified && v.title && (
                      <p className="inst-meta mt-2">Published on YouTube as &ldquo;{v.title}&rdquo;</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      {v.relatedRoute && (
                        <Link href={v.relatedRoute} className="inst-link">Related page →</Link>
                      )}
                      <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inst-link inline-flex items-center gap-1.5">
                        <PlayCircle className="h-4 w-4" aria-hidden /> Watch on YouTube
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Material held back until it can be attributed */}
      {gallery.pendingVideos && (
        <section className="inst-alt border-b border-[var(--rule)]">
          <div className="inst-wrap inst-sec">
            <h2 className="inst-h2">Awaiting cataloguing</h2>
            <p className="inst-body mt-2 max-w-3xl">
              The Bonn films published on the Fondom&rsquo;s own channel are listed above. The
              raw footage of the same gathering held in the community archive is not
              published here: its speakers and subjects have not been confirmed, and nothing
              will be captioned by guesswork.
            </p>
            <Link href="/updates/gudeca-eu-meeting-bonn-28-march-2026" className="inst-link mt-3 inline-block">
              Read the report of the Bonn meeting →
            </Link>
          </div>
        </section>
      )}

      <section>
        <div className="inst-wrap inst-sec">
          <div className="inst-card flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h2 className="inst-h2">Follow Guneku on YouTube</h2>
              <p className="inst-body mt-1.5">
                The full video archive lives on the official Guneku Village channel.
              </p>
            </div>
            <a href={gallery.channelUrl} target="_blank" rel="noopener noreferrer" className="inst-btn inst-btn-primary">
              Subscribe to Guneku on YouTube
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
