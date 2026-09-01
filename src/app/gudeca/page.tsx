import Link from 'next/link'
import { GraduationCap, Building2, Sprout, HandCoins, Globe2, HeartHandshake, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'

export const metadata = {
  title: 'GUDECA — Guneku Cultural & Development Association',
  description: 'Mission, vision, and projects of GUDECA — uniting Guneku indigenes across three continents.',
}

const BRANCHES = [
  { region:'Cameroon',       chapters:['Yaoundé','Douala','Bamenda'],       flag:'🇨🇲' },
  { region:'Germany',        chapters:['Essen — Ruhr Valley'],               flag:'🇩🇪' },
  { region:'United States',  chapters:['DMV','New Jersey'],                  flag:'🇺🇸' },
  { region:'Belgium',        chapters:['Brussels'],                          flag:'🇧🇪' },
  { region:'United Kingdom', chapters:['London'],                            flag:'🇬🇧' },
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
            <p className="text-center text-muted-foreground/40 text-xs mt-6 tracking-[0.06em]">
              Next GUDECA EU Meeting · <strong className="text-muted-foreground/60">Saturday 24 July 2027 · United Kingdom</strong>
            </p>
          </div>
        </section>
      </Reveal>

      {/* ── BRANCHES ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center mb-12">
            <div className="section-label mb-4">EIGHT CHAPTERS · THREE CONTINENTS</div>
            <h3 className="font-cinzel text-5xl text-foreground">A Kingdom Without Borders</h3>
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
                    <li key={c} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  )
}
