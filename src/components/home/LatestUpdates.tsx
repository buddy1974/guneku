import Link from 'next/link'
import { getAllUpdates } from '@/lib/content'
import { SectionLabel } from '@/components/ui/SectionLabel'

export function LatestUpdates() {
  const updates = getAllUpdates().slice(0, 3)

  return (
    <section className="bg-royal-night py-24 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>The Village Square</SectionLabel>
          <Link
            href="/updates"
            className="text-heritage-red text-xs font-heading tracking-widest
                       uppercase hover:text-palace-gold transition-colors"
          >
            See All Updates →
          </Link>
        </div>
        <span className="heritage-rule mb-10" />

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {updates.map((update, i) => (
            <Link
              key={update.slug}
              href={`/updates/${update.slug}`}
              className="group relative bg-[#0C0C0C] border-t-2 border-heritage-red
                         border-x border-b border-x-white/5 border-b-white/5
                         hover:border-t-palace-gold transition-colors duration-200
                         flex flex-col overflow-hidden"
            >
              {/* Number watermark */}
              <span
                className="absolute top-2 right-3 text-[4rem] font-display-title
                           font-bold text-heritage-red/8 leading-none pointer-events-none
                           select-none z-0"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Image or placeholder */}
              <div className="relative h-48 bg-heritage-red/5 flex-shrink-0 overflow-hidden z-10">
                {update.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={update.featuredImage}
                    alt={update.title}
                    className="w-full h-full object-cover
                               group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br
                                  from-heritage-red/8 to-earth-brown/20
                                  flex items-center justify-center">
                    <span className="text-palace-gold/20 text-5xl font-royal">G</span>
                  </div>
                )}
                {/* Date badge */}
                {update.publishedAt && (
                  <div className="absolute top-3 left-3 bg-royal-night/80
                                  text-palace-gold text-[10px] font-heading
                                  tracking-wide px-2 py-1">
                    {new Date(update.publishedAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1 relative z-10">
                <h3
                  className="text-ivory font-heading font-bold text-base
                             leading-snug line-clamp-2 group-hover:text-palace-gold
                             transition-colors"
                >
                  {update.title}
                </h3>
                <p className="mt-2 text-ivory/50 font-body text-sm leading-relaxed
                               line-clamp-3 flex-1">
                  {update.excerpt}
                </p>
                <p className="mt-4 text-heritage-red text-sm font-heading tracking-wide
                               group-hover:text-palace-gold transition-colors">
                  Read more →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
