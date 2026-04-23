import { RoyalButton } from '@/components/ui/RoyalButton'
import { SectionLabel } from '@/components/ui/SectionLabel'

const INITIATIVES = [
  {
    icon: '🏦',
    title: 'GUNECCUL',
    desc: 'Community Credit Union — 4 branches',
    href: '/guneccul',
  },
  {
    icon: '🌾',
    title: 'Agro CIG',
    desc: 'Just launched April 2026 · 12.5M FCFA',
    href: '/agro-cig',
  },
  {
    icon: '🎓',
    title: 'Afor Scholarship',
    desc: '1,000,000 FCFA annual prize',
    href: '/notables/roland-teboh-forbang',
  },
]

export function GudecaStrip() {
  return (
    <section className="overflow-hidden">
      {/* Heritage-red top accent */}
      <div className="h-0.5 bg-heritage-red" />

      <div className="grid lg:grid-cols-2">

        {/* ── Left: Text ── */}
        <div className="pattern-atoghu-brown px-8 sm:px-14 py-20 flex flex-col justify-center">
          <SectionLabel>Building Guneku</SectionLabel>
          <span className="gold-rule mt-3 mb-5" />
          <h2
            className="font-display-title text-ivory leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700 }}
          >
            GUDECA — Where Culture<br />Meets Development
          </h2>
          <p className="mt-5 text-ivory/60 font-body text-base leading-relaxed max-w-md">
            From Europe to the Americas, Guneku sons and daughters
            are united under GUDECA — building schools, funding
            scholarships, and keeping the culture alive.
          </p>
          <div className="mt-8">
            <RoyalButton variant="gold" href="/gudeca">
              Explore GUDECA
            </RoyalButton>
          </div>
        </div>

        {/* ── Right: Initiatives ── */}
        <div className="bg-[#0A0A0A] px-8 sm:px-14 py-20 flex flex-col justify-center gap-4">
          {INITIATIVES.map(item => (
            <a
              key={item.title}
              href={item.href}
              className="flex items-start gap-4
                         border border-heritage-red/20 p-4
                         hover:border-palace-gold/40 hover:bg-palace-gold/5
                         transition-colors duration-200 group"
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <p className="text-ivory font-heading font-bold text-sm
                               group-hover:text-palace-gold transition-colors">
                  {item.title}
                </p>
                <p className="text-ivory/50 font-body text-sm mt-0.5">
                  {item.desc}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Heritage-red bottom accent */}
      <div className="h-0.5 bg-heritage-red" />
    </section>
  )
}
