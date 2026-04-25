import Link           from 'next/link'
import Image          from 'next/image'
import { Crown, Heart, Stethoscope, Scroll, ArrowRight } from 'lucide-react'
import { getFonProfile, getAllPalaceArticles } from '@/lib/content'
import { GoldParticles } from '@/components/ui/GoldParticles'
import { Reveal }        from '@/components/ui/Reveal'

export const metadata = {
  title: 'The Palace — HRH Dr. Fomuki Walters Ticha IX',
  description: 'Inside the palace of Guneku — home of the ninth Fon, physician, and visionary leader of his kingdom.',
}

const TIMELINE = [
  { date: 'January 2015',     title: 'The Journey Begins',    desc: 'HRH Fon Patrick Nji travels to the ancestral mountains. Walters Ticha returns from Germany.',                                      color: 'rgba(245,242,233,0.2)' },
  { date: '27 February 2015', title: 'The Enthronement',      desc: 'Sons and daughters assemble at the palace. Olive oil anointing by HRH Fon Fominyen of Nyen. 50-year rift resolved.',               color: 'oklch(0.42 0.22 25)'   },
  { date: 'November 2015',    title: 'Launching Gala',        desc: 'Grand gala at the Mbengwi Council Hall. All 29 Meta villages invited personally by the new Fon.',                                   color: 'oklch(0.82 0.17 80)'   },
  { date: '30 December 2016', title: 'The Public Coronation', desc: 'Historic coronation before all Meta. First Fon in Meta history to visit all 28 other Fondoms personally.',                         color: 'oklch(0.82 0.17 80)'   },
  { date: '2021 – Present',   title: 'The Kingdom Grows',     desc: 'Democratic reforms, GUNECCUL, Agro CIG, solar lights, Mɨchi Əbeŋ — a kingdom in full renaissance.',                               color: 'oklch(0.82 0.17 80)'   },
]

export default function PalacePage() {
  const fon      = getFonProfile()
  const articles = getAllPalaceArticles()
  const current  = articles.filter((a: any) => a.era === 'current')
  const legacy   = articles.filter((a: any) => a.era === 'legacy')

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO WITH PARTICLES ── */}
      <section className="relative min-h-screen overflow-hidden" style={{ minHeight: 'clamp(500px, 85vh, 100vh)' }}>
        <Image src="/palace.jpg" alt="Guneku Palace" fill className="object-cover animate-ken-burns" priority unoptimized />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, oklch(0.14 0.02 30 / 0.4) 0%, transparent 40%, oklch(0.14 0.02 30 / 0.95) 100%)' }} />
        <GoldParticles />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-royal" />
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-royal" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-end px-6 pb-24">
          <div className="max-w-2xl animate-fade-up">
            <div className="section-label mb-4">REIGNING SINCE 2015</div>
            <h1 className="font-cinzel text-5xl font-bold uppercase leading-[0.95] text-gold-gradient md:text-7xl">
              HRH Dr. Fomuki<br />Walters Ticha IX
            </h1>
            <p className="mt-6 font-cormorant text-2xl italic text-foreground/95">Fon of Guneku · Physician · Visionary</p>
          </div>
        </div>
      </section>

      {/* ── A HEALER CROWNED A KING ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 md:grid-cols-2 md:gap-20 items-center">
            <div>
              <div className="section-label mb-4">A LIFE OF SERVICE</div>
              <h2 className="font-cinzel text-5xl text-foreground">A Healer Crowned a King</h2>
              <div className="royal-divider my-8 w-24" />
              <p className="font-cormorant text-xl leading-relaxed text-foreground/90">
                {fon?.enthronementNarrative || 'Trained in medicine in Bavaria, Germany, HRH Dr. Fomuki Walters Ticha IX returned to Guneku not only as a healer of bodies but as the keeper of a five-hundred-year throne.'}
              </p>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                {fon?.governanceStyle?.substring(0, 300) || 'Since his enthronement in 2015, the Fon has united the kingdom across three continents, founded GUDECA, blessed the launch of GUNECCUL credit unions, and revived the sacred Mɨchi Əbeŋ festival as a beacon of cultural renewal.'}
              </p>
              <Link href="/palace/fon-walters-profile" className="mt-8 btn-royal inline-flex items-center gap-3">
                FULL PROFILE <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <Image src="/regalia.jpg" alt="Royal regalia" width={600} height={700} loading="lazy" className="w-full rounded-2xl shadow-royal object-cover" unoptimized />
              <div className="absolute -bottom-6 -right-6 hidden md:block bg-gold-gradient px-8 py-4 rounded-xl text-gold-foreground shadow-royal">
                <div className="font-cinzel text-3xl">FOMUKI IX</div>
                <div className="text-xs tracking-widest">NINTH OF HIS NAME</div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── FOUR SACRED CHARGES ── */}
      <Reveal>
        <section className="bg-card/30 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <div className="section-label mb-4">PILLARS OF THE REIGN</div>
              <h3 className="font-cinzel text-5xl text-foreground">Four Sacred Charges</h3>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-4">
              {[
                { i: Crown,       t: 'Custodian', d: 'Of throne, stool, and the ancient Meta covenants.' },
                { i: Heart,       t: 'Father',    d: 'To 27 quarters and 15,000 sons and daughters.' },
                { i: Stethoscope, t: 'Healer',    d: 'Physician by training, by heart, by daily duty.' },
                { i: Scroll,      t: 'Visionary', d: 'Author of a modern Guneku rooted in heritage.' },
              ].map((p, i) => (
                <div key={i} className="group rounded-2xl card-royal p-8 text-center">
                  <div className="mb-4 inline-flex rounded-full bg-gold-gradient p-3">
                    <p.i className="h-5 w-5 text-gold-foreground" />
                  </div>
                  <div className="font-cinzel text-2xl text-foreground">{p.t}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── CORONATION TIMELINE ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-12">
            <div className="section-label mb-4">THE ROYAL STORY</div>
            <h2 className="font-cinzel text-5xl text-foreground">From Bavaria to the Throne</h2>
          </div>
          <div className="space-y-6 max-w-3xl mx-auto">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-4 w-4 rounded-full border-2 border-current shrink-0" style={{ color: item.color, backgroundColor: item.color, borderColor: item.color, boxShadow: `0 0 12px ${item.color}` }} />
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 min-h-[40px] mt-2" style={{ background: `linear-gradient(to bottom, ${item.color}, transparent)` }} />}
                </div>
                <div className="card-royal p-5 flex-1 mb-4">
                  <div className="font-cinzel text-xs tracking-widest mb-1" style={{ color: item.color }}>{item.date}</div>
                  <h3 className="font-cinzel text-xl text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── PALACE QUOTE ── */}
      <section className="relative h-[70vh] overflow-hidden">
        <Image src="/hero-fon.jpg" alt="Palace courtyard" fill loading="lazy" className="absolute object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-4xl items-center justify-center px-6 text-center">
          <div>
            <div className="font-cormorant text-3xl italic text-foreground/95 md:text-5xl">
              &ldquo;I do not rule Guneku. I serve her, with the same hands that heal.&rdquo;
            </div>
            <div className="mt-6 section-label">— THE FON</div>
            <Link href="/contact" className="mt-10 btn-royal inline-flex items-center gap-2">
              REQUEST AN AUDIENCE
            </Link>
          </div>
        </div>
      </section>

      {/* ── PALACE ARTICLES ── */}
      {current.length > 0 && (
        <Reveal>
          <section className="mx-auto max-w-7xl px-6 py-20">
            <h3 className="font-cinzel text-3xl text-primary mb-8">THE REIGN OF FOMUKI IX</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {current.map((a: any) => (
                <Link key={a.id} href={`/palace/${a.slug}`} className="card-royal p-6 block no-underline group">
                  <div className="h-0.5 w-6 bg-gold-gradient mb-4" />
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">{a.title}</h4>
                  <span className="mt-4 block text-primary text-xs tracking-widest">Read →</span>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ── LEGACY ── */}
      {legacy.length > 0 && (
        <Reveal>
          <section className="mx-auto max-w-7xl px-6 pb-24">
            <div className="rounded-2xl border border-border/30 bg-card/20 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-0.5 w-8 bg-royal" />
                <div className="section-label">IN MEMORY</div>
              </div>
              <h3 className="font-cinzel text-2xl text-foreground/40 mb-1">HRH FON FOMUKI PATRICK NJI</h3>
              <p className="text-muted-foreground/50 text-sm mb-6">1938 – 2015 · 50 Years on the Throne of Guneku</p>
              <div className="grid gap-3 md:grid-cols-3">
                {legacy.map((a: any) => (
                  <Link key={a.id} href={`/palace/${a.slug}`} className="bg-card/30 border border-border/20 p-4 rounded-xl block no-underline">
                    <h4 className="text-foreground/50 text-sm font-medium leading-snug">{a.title}</h4>
                    <span className="text-muted-foreground/30 text-xs mt-2 block">Read →</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      )}
    </div>
  )
}
