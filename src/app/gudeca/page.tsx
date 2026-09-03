import Link from 'next/link'
import { GraduationCap, Building2, Sprout, HandCoins, Globe2, HeartHandshake, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { allChapters, foundingCount } from '@/lib/community'

export const metadata = {
  alternates: { canonical: '/gudeca' },
  title: 'GUDECA — Guneku Cultural & Development Association',
  description: 'Mission, vision, and projects of GUDECA — uniting Guneku indigenes across three continents.',
}

/* One register for every chapter, home and abroad, shared with /diaspora and the
   chapter pages: `src/data/community/chapters.json`. This list previously said the
   Germany chapter was "Essen — Ruhr Valley" while /diaspora said "Essen / Ruhr" —
   two hand-kept lists, the same error twice. GUDECA Europe meets in BONN, where the
   Fon lives and where the 28 March 2026 meeting was held.

   Home chapters are shown alongside the diaspora rather than below it. A son of
   Guneku in Douala is a member on the same terms as one in Bonn, and the register
   should not imply otherwise. */
const BRANCHES = [
  {
    region:   'Cameroon — home',
    flag:     '🇨🇲',
    chapters: allChapters().filter(c => c.scope === 'home'),
  },
  ...Object.values(
    allChapters()
      .filter(c => c.scope === 'diaspora')
      .reduce<Record<string, { region: string; flag: string; chapters: ReturnType<typeof allChapters> }>>(
        (acc, c) => {
          acc[c.country] ??= { region: c.country, flag: c.flag, chapters: [] }
          acc[c.country].chapters.push(c)
          return acc
        },
        {},
      ),
  ),
]

export default function GudecaPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="relative border-b border-border pt-10 pb-10 md:pt-14 md:pb-14">
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="section-label">EST. BY THE DIASPORA · BLESSED BY THE FON</div>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.4vw,2.7rem)] font-bold leading-[1.14] text-foreground">GUDECA</h1>
          <p className="mt-1 text-[1.02rem] font-semibold text-muted-foreground">Guneku Development &amp; Cultural Association</p>
          <p className="mx-auto mt-4 max-w-2xl text-[0.94rem] leading-relaxed text-muted-foreground">
            Where the kingdom invests in itself. Where culture and progress are not enemies.
            Where every Guneku son and daughter, no matter the continent, builds something at home.
          </p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link href="/gudeca/gudeca-exco" className="btn-royal inline-flex">Meet the EXCO</Link>
            <Link href="/gudeca/guyodeca"    className="btn-royal-outline inline-flex">GUYODECA (Youth)</Link>
          </div>
        </div>
      </section>

      {/* ── 6 INITIATIVES ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { i:GraduationCap, t:'Afor Scholarship',      d:'1,000,000 FCFA awarded annually to the kingdom\'s top scholar.', tag:'EDUCATION', href:'/notables/roland-teboh-forbang' },
              { i:Building2,     t:'GUNECCUL',              d:'Community credit union with 4 branches across the kingdom.',      tag:'FINANCE',   href:'/guneccul' },
              { i:Sprout,        t:'Agro CIG',              d:'Launched April 2026 with 12.5M FCFA — agriculture for tomorrow.',  tag:'ENTERPRISE',href:'/agro-cig' },
              { i:HandCoins,     t:'Diaspora Levy',         d:'Sons and daughters across 3 continents fund the kingdom monthly.', tag:'UNITY',     href:null },
              { i:HeartHandshake,t:'Health Outposts',       d:'Medical missions led by the Fon himself in remote quarters.',      tag:'HEALTH',    href:null },
              { i:Globe2,        t:'Cultural Festivals',    d:'Mɨchi Əbeŋ revived as the great annual return.',                  tag:'HERITAGE',  href:null },
            ].map((p, i) => (
              <div key={i} className="group relative overflow-hidden rounded-3xl card-royal p-8">
                <div className="relative">
                  <div className="section-label text-[0.6rem] mb-3">{p.tag}</div>
                  <p.i className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-cinzel text-2xl text-foreground">{p.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
                  {p.href && (
                    <Link href={p.href} className="mt-4 inline-flex items-center gap-1 text-primary text-xs tracking-[0.06em]">
                      Learn more <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── GUDECA EU MEETING — BONN MARCH 2026 ── */}
      <Reveal>
        <section className="bg-card/20 py-20 border-y border-border/30">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-10">
              <div className="section-label mb-4">LATEST MEETING</div>
              <h2 className="font-cinzel text-4xl text-foreground mb-2">GUDECA EU — Bonn, 28 March 2026</h2>
              <p className="text-muted-foreground text-sm">Fon&apos;s Palace, Bonn · President: Ndenge Constantine · Secretary: Muyang Ela</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon:'☀️', t:'Solar Phase II',       s:'ONGOING', sc:'oklch(0.700 0.115 78)', d:'€800 raised. Members encouraged to increase contributions.' },
                { icon:'🌾', t:'Agro CIG',             s:'ACTIVE',  sc:'oklch(0.55 0.18 145)',d:'Presented by Mr. Fabian. 2,000 FCFA/share. Members encouraged to subscribe.' },
                { icon:'🏥', t:'Medical Centre',       s:'PROPOSED',sc:'oklch(0.560 0.016 150)', d:'Plans to establish a reference healthcare centre in Guneku.' },
                { icon:'🧼', t:'Soap Production',      s:'PROPOSED',sc:'oklch(0.560 0.016 150)', d:'Income-generating soap production for Guneku community.' },
                { icon:'📡', t:'Satellite Internet',   s:'PROPOSED',sc:'oklch(0.560 0.016 150)', d:'Install satellite internet at Guneku Palace. Proposed by Ni Sam.' },
                { icon:'💻', t:'Digital Empowerment',  s:'PROPOSED',sc:'oklch(0.560 0.016 150)', d:'Training adults in content creation & online income generation.' },
              ].map(item => (
                <div key={item.t} className="card-royal p-5" style={{ borderTopColor: item.sc, borderTopWidth: '3px' }}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[10px] tracking-[0.06em] px-2 py-0.5 rounded-[2px] border"
                          style={{ color: item.sc, background: `${item.sc.replace(')','')} / 0.1)`, border: `1px solid ${item.sc.replace(')','')} / 0.3)` }}>
                      {item.s}
                    </span>
                  </div>
                  <h3 className="font-cinzel text-base text-foreground mb-2">{item.t}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-[var(--ink-400)] text-xs mt-6 tracking-[0.06em]">
              Next GUDECA EU Meeting · <strong className="text-muted-foreground/60">Saturday 24 July 2027 · United Kingdom</strong>
            </p>
          </div>
        </section>
      </Reveal>

      {/* ── BRANCHES ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center mb-12">
            <div className="section-label mb-4">EIGHT CONSTITUTED CHAPTERS · FIVE COUNTRIES · THREE CONTINENTS</div>
            <h3 className="font-cinzel text-5xl text-foreground">A Kingdom Without Borders</h3>
            {/* Constituted chapters are not the same measure as meeting attendance.
                Bonn 2026 drew members from nine countries, five of which have no
                chapter of their own. Both numbers are true; they count different things. */}
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed">
              These are the <strong>constituted chapters</strong>. Attendance is a different
              measure: members travelled from <strong>nine countries</strong> to the GUDECA EU
              meeting in Bonn on 28 March 2026 — including Norway, Denmark, Luxembourg, France
              and Austria, which have no chapter of their own. Guneku people are known to live
              in <strong>twelve to thirteen</strong> locations worldwide.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BRANCHES.map(b => (
              <div key={b.region} className="card-royal p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{b.flag}</span>
                  <div className="font-cinzel text-xl text-foreground">{b.region}</div>
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {b.chapters.map(c => (
                    <li key={c.id} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
                      <Link href={`/gudeca/chapters/${c.id}`} className="no-underline hover:text-primary">
                        {c.city}
                        <span className="text-xs text-muted-foreground/70">
                          {' '}· {foundingCount(c.id) || 'add a name'}
                          {foundingCount(c.id) ? ' on record' : ''}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="card-royal mt-10 grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center md:p-8">
            <div>
              <div className="section-label">THE REGISTER IS OPEN</div>
              <h4 className="mt-2 font-cinzel text-2xl text-foreground">
                Every chapter takes names — at home and abroad
              </h4>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Put a name forward and the Palace checks it, then the person completes
                their own profile and chooses what it shows. If the directory already
                carries your name, claim it and it becomes yours.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/indigenes/submit?intent=add" className="btn-royal inline-flex">Add a name</Link>
              <Link href="/indigenes" className="btn-royal-outline inline-flex">The directory</Link>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  )
}
