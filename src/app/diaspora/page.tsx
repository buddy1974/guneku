import Link  from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { chaptersByScope, foundingCount } from '@/lib/community'

export const metadata = {
  alternates: { canonical: '/diaspora' },
  title: 'Diaspora — Guneku Across Three Continents',
  description: 'Guneku sons and daughters across the world — GUDECA chapters in Cameroon, Europe and North America.',
}

/* The places Guneku people are organised now come from one register,
   `src/data/community/chapters.json`, shared with /gudeca and the chapter pages.
   Before this they were two hand-kept lists that disagreed: both said the Germany
   chapter sat in Essen, and both were wrong — GUDECA Europe meets in BONN, at the
   Fon's Palace there, which is where the 28 March 2026 meeting was held. A fact
   held in one place can be corrected once.

   Per-country population counts previously shown here were not supported by any
   source in the repository and have been removed rather than guessed. */
const PLACES = chaptersByScope('diaspora')

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
                <div className="mt-3 text-xs text-muted-foreground">8 constituted GUDECA chapters<br />in Cameroon, Europe and North America</div>
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

      {/* ── THE THREE MEASURES ──
          Three different things get counted in the sources, and they used to appear
          across the site as if they disagreed. They do not: a constituted chapter, a
          country that sent members to Bonn, and a place Guneku people are known to
          live are three separate measurements. Each is labelled as what it is. */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n:'8',     l:'CONSTITUTED GUDECA CHAPTERS', d:'Across five countries and three continents.' },
              { n:'9',     l:'COUNTRIES AT BONN 2026',      d:'Countries members travelled from for the GUDECA EU meeting of 28 March 2026. Attendance, not chapters.' },
              { n:'12–13', l:'KNOWN DIASPORA LOCATIONS',    d:'Places where Guneku sons and daughters are known to live.' },
            ].map(m => (
              <div key={m.l} className="card-royal p-5">
                <div className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--primary)]">{m.n}</div>
                <div className="mt-2 section-label">{m.l}</div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{m.d}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── COUNTRY GRID ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {PLACES.map(p => {
              const on = foundingCount(p.id)
              return (
                <Link key={p.id} href={`/gudeca/chapters/${p.id}`}
                      className="group card-royal block p-5 no-underline transition-all">
                  <div className="mb-3">
                    <span className="text-4xl">{p.flag}</span>
                  </div>
                  <div className="font-cinzel text-lg text-foreground">{p.country}</div>
                  <div className="text-xs text-muted-foreground">{p.city}</div>
                  <div className="mt-1 text-xs text-primary/60">{p.org}</div>
                  <div className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground">
                    {on === 0 ? 'Add the first name →' : `${on} on record →`}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </Reveal>

      {/* ── ADD A NAME ──
          The register is only as complete as the community makes it, so the way in
          sits on the page rather than behind a form somewhere else. Home chapters
          carry the same invitation on their own pages. */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="card-royal grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center md:p-8">
            <div>
              <div className="section-label">EVERY CHAPTER IS OPEN</div>
              <h2 className="mt-2 font-cinzel text-2xl text-foreground">
                Know a son or daughter of Guneku who is not here?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Put the name forward — your own, or someone you know belongs. The Palace
                checks it, then the person is invited to complete their own profile and
                decide what it shows. Nobody writes another person&rsquo;s profile for them.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/indigenes/submit?intent=add" className="btn-royal inline-flex">Add a name</Link>
              <Link href="/indigenes" className="btn-royal-outline inline-flex">The directory</Link>
            </div>
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
