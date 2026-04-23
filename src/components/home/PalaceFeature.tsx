import Image from 'next/image'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { RoyalButton } from '@/components/ui/RoyalButton'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { getFonProfile } from '@/lib/content'

export function PalaceFeature() {
  const fon = getFonProfile()
  if (!fon) return null

  return (
    <section className="bg-[#080808] py-24 overflow-hidden">
      {/* Heritage-red top accent */}
      <div className="h-0.5 bg-heritage-red opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid lg:grid-cols-[55fr_45fr] gap-12 lg:gap-20 items-center">

          {/* ── Left: Content ── */}
          <div>
            <ScrollReveal delay={0}>
              <SectionLabel>The Reigning Fon</SectionLabel>
              <span className="heritage-rule mt-3 mb-6" />
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2
                className="font-royal text-ivory leading-tight"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
              >
                HRH Dr. Fomuki<br />
                <span className="text-palace-gold">Walters Ticha IX</span>
              </h2>
              <p className="mt-3 text-ivory/60 font-heading text-sm tracking-wide">
                Fon of Guneku Fondom · Physician · Visionary
              </p>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p className="mt-6 text-ivory/70 font-body text-base leading-relaxed max-w-lg">
                A physician, a leader, and a son of Guneku —
                HRH Dr. Fomuki Walters Ticha IX has led his kingdom
                with compassion, cultural pride, and a vision for
                a modern Guneku since his enthronement in 2015.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="mt-8 flex gap-8 items-start">
                <div>
                  <p className="text-palace-gold font-display-title text-2xl font-bold">
                    Since 2015
                  </p>
                  <p className="text-ivory/40 text-xs font-heading tracking-widest uppercase mt-1">
                    Enthroned
                  </p>
                </div>
                <div className="w-px bg-heritage-red/30 self-stretch" />
                <div>
                  <p className="text-palace-gold font-display-title text-2xl font-bold">
                    Fomuki IX
                  </p>
                  <p className="text-ivory/40 text-xs font-heading tracking-widest uppercase mt-1">
                    Royal Line
                  </p>
                </div>
                <div className="w-px bg-heritage-red/30 self-stretch" />
                <div>
                  <p className="text-palace-gold font-display-title text-2xl font-bold">
                    27
                  </p>
                  <p className="text-ivory/40 text-xs font-heading tracking-widest uppercase mt-1">
                    Quarters
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="mt-10 flex flex-wrap gap-4">
                <RoyalButton variant="gold" href="/palace/fon-walters-profile">
                  Meet the Fon
                </RoyalButton>
                <a
                  href="/palace/fomuki-appears-from-the-bavarian-woods"
                  className="inline-flex items-center
                             border border-heritage-red text-heritage-red
                             text-[11px] font-heading font-bold tracking-widest uppercase
                             px-5 py-3 hover:bg-heritage-red hover:text-ivory
                             transition-colors duration-200"
                >
                  The Coronation
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* ── Right: Image ── */}
          <ScrollReveal delay={150} className="relative">
            <div className="relative aspect-[3/4] max-w-sm mx-auto lg:max-w-none overflow-hidden group">
              {/* Atoghu-red pattern frame */}
              <div className="absolute inset-0 pattern-atoghu-red opacity-40" />

              <Image
                src="/chieff-logo.png"
                alt="HRH Dr. Fomuki Walters Ticha IX — Fon of Guneku"
                fill
                className="object-cover object-top relative z-10
                           transition-all duration-700
                           group-hover:sepia group-hover:saturate-150"
                unoptimized
              />

              {/* Heritage-red left accent border */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-heritage-red z-20" />

              {/* Gold corner decoration */}
              <div className="absolute top-0 right-0 w-8 h-8
                              border-t-2 border-r-2 border-palace-gold z-20" />

              {/* Heritage-red bottom accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-heritage-red z-20" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
