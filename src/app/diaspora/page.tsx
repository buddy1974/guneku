import Link  from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'

export const metadata = {
  title: 'Diaspora — Guneku Across Three Continents',
  description: 'Guneku sons and daughters across the world — GUDECA chapters in Cameroon, Europe and North America.',
}

/* Countries where Guneku people are organised. The community's own record
   (legacy "About Guneku") states GUDECA has branches in Europe, Canada and
   America; the Europe chapter meets in Bonn and the US chapter in the DMV.
   Per-country population counts previously shown here were not supported by
   any source in the repository and have been removed rather than guessed. */
const PLACES = [
  { flag:'🇨🇲', country:'Cameroon',     city:'Mbengwi', org:'Home community'              },
  { flag:'🇩🇪', country:'Germany',      city:'Essen / Ruhr',    org:"GUDECA Europe · Fon's home"  },
  { flag:'🇺🇸', country:'USA',          city:'DMV · NJ',    org:'GUDECA US Chapter'           },
  { flag:'🇧🇪', country:'Belgium',      city:'Brussels',    org:'GUDECA Europe'               },
  { flag:'🇬🇧', country:'UK',           city:'London',    org:'Active members'              },
  { flag:'🇮🇹', country:'Italy',        city:'Milan',    org:'Active members'              },
  { flag:'🇸🇪', country:'Sweden',       city:'Stockholm',     org:'Active members'              },
  { flag:'🇦🇪', country:'UAE',          city:'Dubai',    org:'GUDECA UAE — 2023'           },
  { flag:'🇶🇦', country:'Qatar',        city:'Doha',     org:'Active members'              },
  { flag:'🇳🇬', country:'Nigeria',      city:'Lagos',    org:'Active members'              },
  { flag:'🇨🇳', country:'China',        city:'Shanghai',     org:'Active members'              },
  { flag:'🇯🇵', country:'Japan',        city:'Tokyo',     org:'Active members'              },
]

export default function DiasporaPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="relative pt-40 pb-20 text-center">
        
        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <div className="section-label animate-fade-up">ONE PEOPLE · MANY HORIZONS</div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.4vw,2.7rem)] font-bold leading-[1.14] text-[var(--foreground)]" style={{ animationDelay: '0.15s' }}>
            The Diaspora
          </h1>
          <p className="mt-6 font-cormorant text-2xl italic text-foreground/90 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            From the volcanic hills of Mbengwi to the skylines of Tokyo —<br className="hidden md:block" />
            the kingdom travels with us.
          </p>
        </div>
      </section>

      {/* ── CSS GLOBE ── */}
      <Reveal>
        <section className="relative mx-auto max-w-7xl px-6 pb-24">
          {/* Inset on small screens so the orbiting country pills, which sit at
              96% of the circle, stay inside the viewport instead of overflowing. */}
          <div className="px-9 sm:px-4 md:px-0">
          <div className="relative mx-auto aspect-square max-w-2xl">
            {/* Circle — kept as the diaspora's information design. Institutional
                treatment only: beige ground, deep green rings, no glow, no spin. */}
            <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)]/35 bg-[oklch(0.940_0.014_85)]" />
            <div className="absolute inset-[12%] rounded-full border border-[var(--primary)]/25" />
            <div className="absolute inset-[26%] rounded-full border border-[var(--primary)]/15" />

            {/* Center stats */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-8">
                <div className="font-[family-name:var(--font-display)] text-5xl font-bold text-[var(--primary)]">3</div>
                <div className="mt-2 section-label">CONTINENTS</div>
                <div className="mt-3 text-xs text-muted-foreground">GUDECA chapters in Cameroon,<br />Europe and North America</div>
              </div>
            </div>

            {/* Orbiting flags */}
            {PLACES.slice(0, 8).map((p, i) => {
              const angle = (i / 8) * Math.PI * 2
              const r = 46
              const x = 50 + r * Math.cos(angle)
              const y = 50 + r * Math.sin(angle)
              return (
                <div key={p.country}
                     className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-[var(--primary)]/30 bg-[var(--primary)] px-2.5 py-1 text-[0.7rem] text-[oklch(0.975_0.010_85)] sm:px-3 sm:py-1.5 sm:text-xs"
                     style={{ left: `${x}%`, top: `${y}%` }}>
                  <span className="mr-1.5">{p.flag}</span>
                  <span className="font-medium">{p.country}</span>
                </div>
              )
            })}
          </div>
          </div>
        </section>
      </Reveal>

      {/* ── COUNTRY GRID ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {PLACES.map(p => (
              <div key={p.country} className="group card-royal p-5 transition-all">
                <div className="mb-3">
                  <span className="text-4xl">{p.flag}</span>
                </div>
                <div className="font-cinzel text-lg text-foreground">{p.country}</div>
                <div className="text-xs text-muted-foreground">{p.city}</div>
                <div className="mt-1 text-xs text-primary/60">{p.org}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── NOTABLES ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="text-center mb-10">
            <div className="section-label mb-4">NOTABLE SONS &amp; DAUGHTERS</div>
            <h2 className="font-cinzel text-4xl text-foreground">Guneku Excellence Worldwide</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name:'Prof. Dr. Roland Teboh Forbang', role:'Associate Professor & Cancer Specialist', location:'New Jersey, USA', link:'/notables/roland-teboh-forbang' },
              { name:'Marcel Tabit Akwe', role:'Software Developer & AI Automation', location:'Essen, Germany', link:'/notables/marcel-tabit-akwe' },
            ].map(n => (
              <Link key={n.name} href={n.link} className="card-royal p-6 block no-underline group">
                <div className="h-0.5 w-6 bg-gold-gradient mb-4" />
                <h3 className="font-cinzel text-xl text-foreground group-hover:text-primary transition-colors">{n.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">{n.role}</p>
                <p className="text-primary/50 text-xs mt-2 tracking-widest">{n.location}</p>
                <div className="mt-4 flex items-center gap-2 text-primary text-xs tracking-widest">
                  Full profile <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  )
}
