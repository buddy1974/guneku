import Link           from 'next/link'
import Image          from 'next/image'
import { ArrowRight, Crown, Users, Sparkles, Building2, Sprout, GraduationCap, Globe2, Quote, Landmark } from 'lucide-react'
import { getFonProfile, getAllUpdates } from '@/lib/content'
import { Reveal }          from '@/components/ui/Reveal'
import { BuiltBySection }  from '@/components/home/BuiltBySection'

export const revalidate = 3600

const FLAGS = ['🇨🇲','🇩🇪','🇺🇸','🇧🇪','🇬🇧','🇮🇹','🇸🇪','🇦🇪','🇶🇦','🇳🇬','🇨🇳','🇯🇵']

export default function HomePage() {
  const fon     = getFonProfile()
  const updates = getAllUpdates().slice(0, 3)

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/hero-1.jpg" alt="Guneku Fondom" fill className="object-cover animate-ken-burns" priority unoptimized />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, oklch(0.10 0.02 30 / 0.55) 0%, oklch(0.10 0.02 30 / 0.25) 35%, oklch(0.10 0.02 30 / 0.85) 85%, oklch(0.10 0.02 30) 100%)' }} />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background/70 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background/70 to-transparent" />
        </div>

        {/* Floating royal seal */}
        <div className="pointer-events-none absolute right-[-6%] top-[-6%] z-0 h-[55vh] w-[55vh] opacity-20 animate-spin-slow">
          <Image src="/royal-seal.png" alt="" fill className="object-contain" unoptimized />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-6 pb-24 pt-40">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 animate-fade-up">
              <span className="h-px w-10 bg-gold-gradient" />
              <span className="text-[11px] tracking-[0.5em] text-primary">GUNEKU FONDOM · MBENGWI · NW CAMEROON</span>
            </div>

            <h1 className="mt-6 font-cinzel text-[clamp(3rem,9vw,8.5rem)] font-bold uppercase leading-[0.85] text-gold-gradient animate-fade-up" style={{ animationDelay: '0.15s' }}>
              A Kingdom<br />
              <span className="font-cormorant italic font-medium normal-case text-foreground/95"> that never </span>
              sleeps
            </h1>

            <p className="mt-8 max-w-2xl font-cormorant text-xl leading-relaxed text-foreground/90 md:text-2xl animate-fade-up" style={{ animationDelay: '0.3s' }}>
              For five hundred years, the people of Guneku have kept one fire alight.
              Today, that fire burns across three continents —{' '}
              <span className="text-primary">and this is its home on the web.</span>
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up" style={{ animationDelay: '0.45s' }}>
              <Link href="/palace" className="group inline-flex items-center gap-3 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold tracking-widest text-gold-foreground shadow-royal transition-transform hover:scale-[1.04]">
                MEET THE FON
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/kingdom" className="inline-flex items-center gap-3 rounded-full border-gold-strong bg-background/40 px-7 py-3.5 text-sm font-semibold tracking-widest text-foreground backdrop-blur-md transition-colors hover:bg-background/70">
                ENTER THE KINGDOM
              </Link>
            </div>

            <div className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-8 animate-fade-up" style={{ animationDelay: '0.6s' }}>
              {[
                { n: '27',  l: 'QUARTERS'   },
                { n: '15K+',l: 'INDIGENES'  },
                { n: '3',   l: 'CONTINENTS' },
              ].map(s => (
                <div key={s.l}>
                  <div className="font-cinzel text-3xl text-gold-gradient md:text-4xl">{s.n}</div>
                  <div className="mt-1 text-[10px] tracking-[0.3em] text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center text-[10px] tracking-[0.4em] text-primary animate-pulse-gold">
          <div>SCROLL TO ENTER</div>
          <div className="mx-auto mt-2 h-8 w-px bg-gold-gradient" />
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="relative overflow-hidden border-y border-border bg-card/40 py-6">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, rep) => (
            ['FONDOM','MBENGWI','META CLAN','GUDECA','27 QUARTERS','MƗCHI ƏBEŊ','GUNECCUL','AGRO CIG','NW CAMEROON','DIASPORA','FOMUKI IX','MMXXVI'].map((t, i) => (
              <span key={`${rep}-${i}`} className="mx-8 font-cinzel text-2xl tracking-[0.3em] text-foreground/40">
                {t}<span className="mx-8 text-primary">✦</span>
              </span>
            ))
          ))}
        </div>
      </div>

      {/* ── THREE PILLARS ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 py-28">
          <div className="grid gap-12 md:grid-cols-2 md:gap-20">
            <div>
              <div className="section-label">THE THREE PILLARS</div>
              <h2 className="mt-4 font-cinzel text-5xl uppercase leading-tight text-foreground md:text-6xl">
                Heritage. Unity.<br /><span className="text-gold-gradient">Vision.</span>
              </h2>
              <div className="royal-divider my-8 w-32" />
              <p className="font-cormorant text-xl leading-relaxed text-muted-foreground">
                Three vows the kingdom renews each generation. Three reasons Guneku endures
                while empires fall.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { i: Crown,    t: 'Heritage', d: 'Five hundred years of unbroken royal lineage in the Meta clan.' },
                { i: Users,    t: 'Unity',    d: 'Twenty-seven quarters bound by one Fon, one stool, one fire.' },
                { i: Sparkles, t: 'Vision',   d: 'A modern kingdom — schools, scholarships, credit unions, agriculture.' },
              ].map((p, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl card-royal p-6">
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold-gradient opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25" />
                  <div className="relative flex items-start gap-5">
                    <div className="rounded-full bg-gold-gradient p-3">
                      <p.i className="h-5 w-5 text-gold-foreground" />
                    </div>
                    <div>
                      <div className="font-cinzel text-2xl text-foreground">{p.t}</div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── FON SPOTLIGHT ── */}
      <Reveal>
        <section className="relative overflow-hidden bg-card/30 py-28">
          <div className="pattern-royal absolute inset-0 opacity-20" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2">
            <div className="relative">
              <Image src="/regalia.jpg" alt="Royal regalia of the Fon of Guneku" width={600} height={700} loading="lazy" className="w-full rounded-3xl object-cover shadow-royal" unoptimized />
              <div className="absolute -bottom-6 -left-6 hidden md:flex flex-col items-center justify-center bg-gold-gradient px-6 py-5 rounded-2xl text-gold-foreground shadow-royal">
                <div className="font-cinzel text-3xl">IX</div>
                <div className="text-[10px] tracking-[0.3em]">FOMUKI</div>
              </div>
              <div className="absolute -right-4 top-8 hidden md:block rounded-full border-gold-strong bg-background/80 px-4 py-2 text-[10px] tracking-[0.3em] text-primary backdrop-blur-md">
                ENTHRONED 2015
              </div>
            </div>
            <div>
              <div className="section-label">THE REIGNING FON</div>
              <h2 className="mt-4 font-cinzel text-5xl uppercase leading-[0.95] text-gold-gradient md:text-6xl">
                HRH Dr. Fomuki<br />Walters Ticha IX
              </h2>
              <p className="mt-4 font-cormorant text-2xl italic text-foreground/95">Physician. Father. Fon.</p>
              <div className="royal-divider my-6 w-24" />
              <p className="text-base leading-relaxed text-muted-foreground">
                {fon?.governanceStyle?.substring(0, 280) || 'Trained as a physician in Bavaria, returned home as a king. Since 2015 he has led Guneku with the same hands that heal — uniting the diaspora, reviving the Mɨchi Əbeŋ festival, and authoring a new chapter of the kingdom.'}
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { n: '9th',   l: 'OF HIS NAME' },
                  { n: '2015',  l: 'ENTHRONED'   },
                  { n: '27',    l: 'QUARTERS LED' },
                ].map(s => (
                  <div key={s.l} className="rounded-xl border-gold bg-background p-4 text-center">
                    <div className="font-cinzel text-2xl text-gold-gradient">{s.n}</div>
                    <div className="mt-1 text-[9px] tracking-widest text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
              <Link href="/palace" className="mt-10 btn-royal inline-flex items-center gap-3">
                ENTER THE PALACE <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── KINGDOM FULLSCREEN ── */}
      <section className="relative h-[90vh] overflow-hidden">
        <Image src="/kingdom-aerial.jpg" alt="Aerial of the Guneku kingdom" fill loading="lazy" className="absolute object-cover animate-ken-burns" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
          <div className="max-w-xl">
            <div className="section-label">THE LAND</div>
            <h2 className="mt-4 font-cinzel text-5xl uppercase leading-tight text-gold-gradient md:text-7xl">
              Volcanic hills.<br />Sacred earth.
            </h2>
            <p className="mt-6 font-cormorant text-xl leading-relaxed text-foreground/90">
              Cradled in the green folds of Momo Division, the kingdom rises a thousand metres
              above the sea. Twenty-seven quarters. One sky. One ancient covenant.
            </p>
            <Link href="/kingdom" className="mt-8 inline-flex items-center gap-2 border-b-2 border-primary pb-1 font-cinzel text-sm tracking-widest text-primary transition-all hover:gap-4">
              EXPLORE ALL 27 QUARTERS →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FESTIVAL CTA ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 py-28">
          <div className="relative overflow-hidden rounded-3xl border-gold-strong shadow-royal">
            <Image src="/festival.jpg" alt="Mɨchi Əbeŋ festival masquerade" fill loading="lazy" className="absolute object-cover" unoptimized />
            <div className="relative min-h-[70vh]" style={{ background: 'linear-gradient(to top, oklch(0.10 0.02 30) 0%, oklch(0.10 0.02 30 / 0.4) 60%, transparent 100%)' }}>
              <div className="absolute inset-0 flex items-end p-10 md:p-16">
                <div className="max-w-2xl">
                  <Quote className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-cinzel text-4xl uppercase text-gold-gradient md:text-6xl">Mɨchi Əbeŋ</h3>
                  <p className="mt-4 font-cormorant text-2xl italic text-foreground/95">
                    The Festival of Return — when the masquerades rise, the diaspora comes home,
                    and the kingdom remembers itself.
                  </p>
                  <Link href="/gallery" className="mt-6 inline-flex items-center gap-2 text-sm tracking-widest text-primary hover:gap-3 transition-all">
                    SEE THE GALLERY <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── INITIATIVES ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <div className="section-label">BUILDING GUNEKU</div>
            <h2 className="mt-4 font-cinzel text-5xl uppercase text-foreground md:text-6xl">
              Where Culture Meets <span className="text-gold-gradient">Development</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              From Europe to the Americas, Guneku sons and daughters are united under GUDECA —
              building schools, funding scholarships, keeping the culture alive.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { i: Building2,    tag: 'FINANCE',    t: 'GUNECCUL',        d: 'The kingdom\'s community credit union — four branches funding tomorrow.', stat: '4 Branches',  href: '/guneccul' },
              { i: Sprout,       tag: 'ENTERPRISE', t: 'Agro CIG',        d: 'Just launched April 2026 — 12.5 million FCFA into Guneku\'s soil.',        stat: '12.5M FCFA', href: '/agro-cig' },
              { i: GraduationCap,tag: 'EDUCATION',  t: 'Afor Scholarship',d: 'One million FCFA awarded each year to the kingdom\'s best minds.',          stat: '1M FCFA/yr', href: '/notables/roland-teboh-forbang' },
            ].map((it, i) => (
              <Link key={i} href={it.href} className="group relative overflow-hidden rounded-3xl card-royal p-8 block no-underline transition-all hover:-translate-y-2">
                <div className="absolute right-6 top-6 rounded-full border-gold px-3 py-1 text-[10px] tracking-[0.3em] text-primary">{it.tag}</div>
                <div className="inline-flex rounded-full bg-gold-gradient p-3">
                  <it.i className="h-5 w-5 text-gold-foreground" />
                </div>
                <h3 className="mt-6 font-cinzel text-3xl text-foreground">{it.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{it.d}</p>
                <div className="royal-divider my-5" />
                <div className="text-xs tracking-widest text-primary">{it.stat}</div>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/gudeca" className="btn-royal inline-flex items-center gap-3">
              EXPLORE GUDECA <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </Reveal>

      {/* ── LATEST UPDATES ── */}
      {updates.length > 0 && (
        <Reveal>
          <section className="mx-auto max-w-7xl px-6 pb-24">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="section-label mb-2">THE VILLAGE SQUARE</div>
                <h2 className="font-cinzel text-4xl text-foreground">Latest from Guneku</h2>
              </div>
              <Link href="/updates" className="text-primary text-sm tracking-widest hover:gap-3 transition-all flex items-center gap-2">
                All Updates <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {updates.map((u, i) => (
                <Link key={u.slug} href={`/updates/${u.slug}`}
                      className="group card-royal overflow-hidden block no-underline">
                  <div className="relative h-48 bg-card/50 overflow-hidden border-b border-gold/10">
                    {u.featuredImage ? (
                      <Image src={u.featuredImage} alt={u.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                    ) : (
                      <div className="h-full flex items-center justify-center pattern-royal">
                        <span className="font-cinzel text-6xl text-foreground/10">{String(i+1).padStart(2,'0')}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gold-gradient" />
                    {u.publishedAt && (
                      <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm px-2 py-1 text-[10px] tracking-widest text-primary font-cinzel">
                        {new Date(u.publishedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-foreground font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{u.title}</h3>
                    <p className="mt-2 text-muted-foreground text-sm line-clamp-2 leading-relaxed">{u.excerpt}</p>
                    <p className="mt-4 text-primary text-sm tracking-wide">Read more →</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ── DIASPORA TEASER ── */}
      <Reveal>
        <section className="relative overflow-hidden py-28">
          <div className="pattern-royal absolute inset-0 opacity-30" />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <Globe2 className="mx-auto h-10 w-10 text-primary" />
            <div className="mt-4 section-label">OUR PEOPLE, EVERYWHERE</div>
            <h2 className="mt-4 font-cinzel text-5xl uppercase text-foreground md:text-7xl">
              Guneku <span className="text-gold-gradient font-cormorant italic normal-case">is</span> Everywhere
            </h2>
            <p className="mx-auto mt-6 max-w-2xl font-cormorant text-xl italic text-foreground/90">
              From the Ruhr Valley to New Jersey, from Dubai to Tokyo — fifteen thousand sons and
              daughters across three continents. One heritage. One kingdom.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              {FLAGS.map((f, i) => (
                <div key={i} className="flex h-14 w-14 items-center justify-center rounded-full border-gold bg-card text-2xl shadow-card-royal animate-float"
                     style={{ animationDelay: `${i * 0.4}s` }}>
                  {f}
                </div>
              ))}
            </div>
            <Link href="/diaspora" className="mt-12 btn-royal-outline inline-flex items-center gap-3">
              MEET THE DIASPORA <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </Reveal>

      {/* ── FINAL CTA ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-28">
          <div className="relative overflow-hidden rounded-3xl bg-royal-gradient p-12 shadow-royal md:p-20">
            <div className="pattern-royal absolute inset-0 opacity-20" />
            <div className="absolute -right-20 -top-20 h-80 w-80 animate-spin-slow opacity-20">
              <Image src="/royal-seal.png" alt="" fill className="object-contain" unoptimized />
            </div>
            <div className="relative max-w-2xl">
              <Landmark className="h-9 w-9 text-primary" />
              <h2 className="mt-4 font-cinzel text-5xl uppercase leading-tight text-gold-gradient md:text-6xl">
                Step into the kingdom
              </h2>
              <p className="mt-6 font-cormorant text-xl italic text-foreground/95">
                Whether you are a son of Guneku, a daughter of the diaspora, or a friend of the
                kingdom from across the world — the palace doors are open.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/contact" className="btn-royal inline-flex items-center gap-2">
                  REQUEST AN AUDIENCE <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/gudeca" className="btn-royal-outline inline-flex items-center gap-2">
                  JOIN GUDECA
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <BuiltBySection />
    </div>
  )
}
