import Link from 'next/link'
import { getSiteConfig } from '@/lib/content'

const config = getSiteConfig()

const NAV_LINKS = [
  { label: 'Home',           href: '/' },
  { label: 'The Kingdom',    href: '/kingdom' },
  { label: 'The Palace',     href: '/palace' },
  { label: 'GUDECA',         href: '/gudeca' },
  { label: 'Village Square', href: '/updates' },
  { label: 'Gallery',        href: '/gallery' },
  { label: 'Diaspora',       href: '/diaspora' },
  { label: 'Contact',        href: '/contact' },
]

const INITIATIVE_LINKS = [
  { label: 'Agro CIG',         href: '/agro-cig' },
  { label: 'GUNECCUL',         href: '/guneccul' },
  { label: 'Afor Scholarship', href: '/notables/roland-teboh-forbang' },
  { label: 'Projects',         href: '/projects' },
]

const SOCIAL_LINKS = [
  { label: 'Facebook',  href: config.socialLinks.facebook },
  { label: 'Twitter',   href: config.socialLinks.twitter },
  { label: 'Instagram', href: config.socialLinks.instagram },
  { label: 'YouTube',   href: config.socialLinks.youtube },
]

export function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-heritage-red/30">
      {/* Heritage-red top accent */}
      <div className="h-0.5 bg-heritage-red" />

      {/* ── Marquee statement bar ── */}
      <div style={{
        borderBottom: '1px solid rgba(242,169,11,0.1)',
        padding: '3rem 1.5rem', textAlign: 'center',
        background: 'linear-gradient(to right, transparent, rgba(139,30,45,0.1), transparent)',
      }}>
        <p style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: 'clamp(1.5rem, 4vw, 3rem)',
          color: 'rgba(245,242,233,0.15)', letterSpacing: '0.05em',
          margin: 0, textTransform: 'uppercase',
        }}>
          FONDOM · HERITAGE · UNITY · VISION · DEVELOPMENT · CULTURE ·
          DIASPORA · PRIDE · PROGRESS · GUNEKU
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* ── 4-column grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1 — Brand */}
          <div>
            <p
              className="text-palace-gold font-heading font-bold text-base
                         tracking-[0.15em] uppercase mb-1"
            >
              Guneku Fondom
            </p>
            <p className="text-ivory/40 text-xs tracking-wide font-body mb-6">
              Mbengwi · Momo Division · Northwest Cameroon
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              {SOCIAL_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ivory/30 hover:text-heritage-red text-xs
                             font-heading tracking-wide transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Navigate */}
          <div>
            <p className="section-label mb-5">Navigate</p>
            <ul className="space-y-3">
              {NAV_LINKS.map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-ivory/50 hover:text-ivory text-sm font-body
                               transition-colors duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Initiatives */}
          <div>
            <p className="section-label mb-5">Initiatives</p>
            <ul className="space-y-3">
              {INITIATIVE_LINKS.map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-ivory/50 hover:text-ivory text-sm font-body
                               transition-colors duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Connect */}
          <div>
            <p className="section-label mb-5">Contact</p>
            <ul className="space-y-3 text-sm font-body">
              <li>
                <a
                  href={`mailto:${config.contactEmail}`}
                  className="text-ivory/50 hover:text-ivory transition-colors"
                >
                  {config.contactEmail}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${config.palacePhone.replace(/\s/g, '')}`}
                  className="text-ivory/50 hover:text-ivory transition-colors"
                >
                  {config.palacePhone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${config.fonEmail}`}
                  className="text-ivory/50 hover:text-ivory transition-colors"
                >
                  {config.fonEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="mt-12 pt-6 border-t border-heritage-red/20
                     flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="text-ivory/30 text-xs font-body">
            {config.copyright.text}
          </p>
          <div>
            <div style={{ marginBottom: '0.25rem' }}>
              <span style={{ color: 'rgba(245,242,233,0.15)', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem' }}>
                Designed &amp; built by{' '}
              </span>
              <a href="https://maxpromo.digital" target="_blank" rel="noopener noreferrer"
                 style={{ color: '#f2a90b', fontFamily: 'Syne, sans-serif', fontWeight: 700,
                           fontSize: '0.75rem', letterSpacing: '0.05em', textDecoration: 'none' }}>
                MaxPromo Digital
              </a>
              <span style={{ color: 'rgba(245,242,233,0.1)', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem' }}>
                {' '}· Essen, Germany
              </span>
            </div>
            <div style={{ color: 'rgba(245,242,233,0.08)', fontFamily: 'Inter, sans-serif',
                          fontSize: '0.68rem', lineHeight: 1.6 }}>
              The first AI-powered community platform for a Northwest Cameroon Fondom.
              Want this for your community?{' '}
              <a href="https://maxpromo.digital" target="_blank" rel="noopener noreferrer"
                 style={{ color: 'rgba(242,169,11,0.4)', textDecoration: 'none' }}>
                Contact us →
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
