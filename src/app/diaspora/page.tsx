import Link  from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'

export const metadata = {
  title: 'Diaspora — Guneku Across Three Continents',
  description: 'From the Ruhr Valley to New Jersey, from Dubai to Tokyo — Guneku sons and daughters across the world.',
}

const PLACES = [
  { flag:'🇨🇲', country:'Cameroon',     city:'Mbengwi',      count:'12,400', org:'Home community'              },
  { flag:'🇩🇪', country:'Germany',      city:'Essen / Ruhr',  count:'780',    org:"GUDECA Europe · Fon's home"  },
  { flag:'🇺🇸', country:'USA',          city:'DMV · NJ',      count:'640',    org:'GUDECA US Chapter'           },
  { flag:'🇧🇪', country:'Belgium',      city:'Brussels',      count:'210',    org:'GUDECA Europe'               },
  { flag:'🇬🇧', country:'UK',           city:'London',        count:'180',    org:'Active members'              },
  { flag:'🇮🇹', country:'Italy',        city:'Milan',         count:'150',    org:'Active members'              },
  { flag:'🇸🇪', country:'Sweden',       city:'Stockholm',     count:'95',     org:'Active members'              },
  { flag:'🇦🇪', country:'UAE',          city:'Dubai',         count:'120',    org:'GUDECA UAE — 2023'           },
  { flag:'🇶🇦', country:'Qatar',        city:'Doha',          count:'70',     org:'Active members'              },
  { flag:'🇳🇬', country:'Nigeria',      city:'Lagos',         count:'230',    org:'Active members'              },
  { flag:'🇨🇳', country:'China',        city:'Shanghai',      count:'60',     org:'Active members'              },
  { flag:'🇯🇵', country:'Japan',        city:'Tokyo',         count:'45',     org:'Active members'              },
]

export default function DiasporaPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="relative pt-40 pb-20 text-center">
        <div className="pattern-royal absolute inset-0 opacity-20" />
        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <div className="section-label animate-fade-up">ONE PEOPLE · MANY HORIZONS</div>
          <h1 className="mt-6 font-cinzel text-6xl uppercase leading-none text-gold-gradient md:text-8xl animate-fade-up" style={{ animationDelay: '0.15s' }}>
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
          <div className="relative mx-auto aspect-square max-w-2xl">
            {/* Globe sphere */}
            <div className="absolute inset-0 rounded-full shadow-royal" style={{ background: 'linear-gradient(135deg, oklch(0.22 0.08 270), oklch(0.18 0.06 30), oklch(0.10 0.02 30))' }} />
            <div className="absolute inset-0 rounded-full border-gold animate-spin-slow" />
            <div className="absolute inset-6 rounded-full border border-primary/20 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '60s' }} />
            <div className="absolute inset-1/4 rounded-full pattern-royal opacity-40" />

            {/* Center stats */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="font-cinzel text-6xl text-gold-gradient">15K+</div>
                <div className="mt-2 section-label">SONS &amp; DAUGHTERS</div>
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
                     className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-card border-gold-strong px-3 py-1.5 text-xs shadow-card-royal animate-float"
                     style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.6}s` }}>
                  <span className="mr-1.5">{p.flag}</span>
                  <span className="font-medium text-foreground">{p.country}</span>
                </div>
              )
            })}
          </div>
        </section>
      </Reveal>

      {/* ── COUNTRY GRID ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {PLACES.map(p => (
              <div key={p.country} className="group card-royal p-5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">{p.flag}</span>
                  <span className="font-cinzel text-xl text-gold-gradient">{p.count}</span>
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
