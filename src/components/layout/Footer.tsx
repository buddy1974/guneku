import Link          from 'next/link'
import Image         from 'next/image'
import { getSiteConfig } from '@/lib/content'

const config = getSiteConfig()

const NAV_LINKS = [
  { label: 'The Kingdom',  href: '/kingdom'  },
  { label: 'The Palace',   href: '/palace'   },
  { label: 'GUDECA',       href: '/gudeca'   },
  { label: 'Diaspora',     href: '/diaspora' },
  { label: 'Gallery',      href: '/gallery'  },
  { label: 'Village Square', href: '/updates'},
]

export function Footer() {
  return (
    <footer
      className="relative mt-32 overflow-hidden border-t border-border"
      style={{ background: 'linear-gradient(to bottom, oklch(0.14 0.02 30), oklch(0.10 0.02 30))' }}
    >
      <div className="pattern-royal absolute inset-0 opacity-25" />

      <div
        className="relative mx-auto max-w-7xl px-6 py-20"
        style={{ paddingBottom: 'calc(var(--bottom-nav-total) + 3rem)' }}
      >
        <div className="grid gap-12 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src="/royal-seal.png"
                  alt="Royal seal of Guneku"
                  fill
                  className="object-contain animate-spin-slow"
                  unoptimized
                />
              </div>
              <div>
                <div className="font-cinzel text-2xl text-gold-gradient">GUNEKU FONDOM</div>
                <div className="text-xs tracking-[0.3em] text-muted-foreground mt-1">
                  MBENGWI · NORTHWEST CAMEROON
                </div>
              </div>
            </div>

            <blockquote className="mt-6 border-l-2 border-primary pl-4">
              <p className="font-cormorant text-lg italic leading-relaxed text-muted-foreground">
                &ldquo;We carry Guneku in our hearts wherever we are in the world.
                But Guneku must grow — in the village, in the diaspora,
                and in the digital world.&rdquo;
              </p>
              <footer className="mt-2 text-xs tracking-widest text-primary">
                — HRH Dr. Fomuki Walters Ticha IX
              </footer>
            </blockquote>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-cinzel text-sm tracking-[0.3em] text-primary mb-4">EXPLORE</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              {NAV_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-cinzel text-sm tracking-[0.3em] text-primary mb-4">REACH US</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>The Palace, Guneku</li>
              <li>Mbengwi, Momo Division</li>
              <li>Northwest Region, Cameroon</li>
              <li>
                <a href={`mailto:${config.contactEmail}`} className="hover:text-primary transition-colors">
                  {config.contactEmail}
                </a>
              </li>
              <li>
                <a href={`tel:${config.palacePhone?.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                  {config.palacePhone}
                </a>
              </li>
              <li className="mt-3">
                <Link href="/contact" className="text-primary hover:underline text-xs tracking-widest">
                  Send a message →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="royal-divider mt-16" />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Guneku Fondom · All rights of the kingdom reserved.</div>
          <div className="text-center">
            <span className="tracking-[0.3em]">CRAFTED FOR THE KINGDOM · MMXXVI</span>
            <br />
            <span className="text-muted-foreground/40">
              Designed &amp; built by{' '}
              <a href="https://maxpromo.digital" target="_blank" rel="noopener noreferrer"
                 className="text-primary hover:underline">
                MaxPromo Digital
              </a>
              {' '}· Essen, Germany
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
