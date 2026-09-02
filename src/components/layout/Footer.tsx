import Link from 'next/link'
import { getSiteConfig } from '@/lib/content'
import videoGallery from '@/data/gallery/video-gallery.json'

const config = getSiteConfig()

const EXPLORE = [
  { label: 'The Kingdom',  href: '/kingdom'   },
  { label: 'The Palace',   href: '/palace'    },
  { label: 'Development',  href: '/projects'  },
  { label: 'Education',    href: '/education' },
  { label: 'Our People',   href: '/indigenes' },
  { label: 'Diaspora',     href: '/diaspora'  },
  { label: 'News',         href: '/updates'   },
  { label: 'Media',        href: '/gallery'   },
]

/* Public channel only — a YouTube Studio or admin URL must never be published. */
const SOCIAL = [
  { label: 'YouTube',   href: videoGallery.channelUrl },
  { label: 'Facebook',  href: config.socialLinks?.facebook  },
  { label: 'Instagram', href: config.socialLinks?.instagram },
  { label: 'X',         href: config.socialLinks?.twitter   },
].filter((s): s is { label: string; href: string } => Boolean(s.href))

export function Footer() {
  return (
    <footer className="inst-dark">
      <div className="inst-wrap py-12" style={{ paddingBottom: 'calc(var(--bottom-nav-total) + 2rem)' }}>

        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">

          <div>
            <p className="font-[family-name:var(--font-display)] text-[1.15rem] font-bold text-white">
              Guneku Fondom
            </p>
            <address className="mt-3 text-[0.86rem] not-italic leading-relaxed text-white/60">
              The Palace, Guneku<br />
              Mbengwi, Momo Division<br />
              North West Region, Cameroon
            </address>
            <p className="mt-4 text-[0.86rem] leading-relaxed text-white/60">
              <a href={`mailto:${config.contactEmail}`} className="inline-block py-1 text-white/80 no-underline hover:underline">
                {config.contactEmail}
              </a><br />
              <a href={`tel:${config.palacePhone?.replace(/\s/g, '')}`} className="inline-block py-1 text-white/80 no-underline hover:underline">
                {config.palacePhone}
              </a>
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-white/55">Explore</h2>
            <ul className="mt-3 list-none space-y-1.5 p-0">
              {EXPLORE.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[0.86rem] text-white/70 no-underline hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-white/55">Follow Guneku</h2>
            <ul className="mt-3 list-none space-y-1.5 p-0">
              {SOCIAL.map(s => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer"
                     className="text-[0.86rem] text-white/70 no-underline hover:text-white hover:underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/contact" className="mt-4 inline-block text-[0.86rem] font-semibold text-white no-underline hover:underline">
              Contact the Palace →
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/12 pt-5 text-[0.78rem] text-white/55 md:flex-row md:items-center md:justify-between">
          <p className="m-0">© {new Date().getFullYear()} Guneku Fondom. All rights reserved.</p>
          <p className="m-0">
            Website by{' '}
            <a href="https://maxpromo.digital" target="_blank" rel="noopener noreferrer"
               className="text-white/60 no-underline hover:underline">
              MaxPromo Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
