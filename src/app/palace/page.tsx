import { PageHero }      from '@/components/layout/PageHero'
import { getFonProfile, getAllPalaceArticles } from '@/lib/content'
import { GoldParticles } from '@/components/ui/GoldParticles'
import { Reveal }        from '@/components/ui/Reveal'
import Link              from 'next/link'
import Image             from 'next/image'

export const metadata = {
  title: 'The Palace — Guneku Fondom',
  description: 'The Royal Palace of Guneku — seat of HRH Dr. Fomuki Walters Ticha IX.',
}

const CORONATION_TIMELINE = [
  { date: 'January 2015',    title: 'The Journey Begins',
    desc: 'HRH Fon Patrick Nji travels to the ancestral mountains. Walters Ticha returns from Germany.',
    color: 'rgba(245,242,233,0.2)' },
  { date: '27 February 2015', title: 'The Enthronement',
    desc: 'Sons and daughters assemble at the palace. Olive oil anointing by HRH Fon Fominyen of Nyen. 50-year rift resolved.',
    color: '#8B1E2D' },
  { date: 'November 2015',   title: 'Launching Gala',
    desc: 'Grand gala at the Mbengwi Council Hall. All 29 Meta villages invited personally by the new Fon.',
    color: '#f2a90b' },
  { date: '30 December 2016', title: 'The Public Coronation',
    desc: 'Historic coronation before all Meta. First Fon in Meta history to visit all 28 other Fondoms personally.',
    color: '#f2a90b' },
  { date: '2021 – Present',  title: 'The Kingdom Grows',
    desc: 'Democratic reforms, GUNECCUL, Agro CIG, solar lights, Mɨchi Əbeŋ — a kingdom in full renaissance.',
    color: '#f2a90b' },
]

export default function PalacePage() {
  const fon      = getFonProfile()
  const articles = getAllPalaceArticles()
  const current  = articles.filter((a: any) => a.era === 'current')
  const legacy   = articles.filter((a: any) => a.era === 'legacy')

  return (
    <main style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}>

      {/* ── Palace Hero with Particles ── */}
      <div style={{
        position: 'relative', minHeight: '70vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', textAlign: 'center',
        background: 'linear-gradient(to bottom, rgba(139,30,45,0.5) 0%, #0F0F0F 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: 0.15,
          backgroundImage: "url('/chieff-logo.png')",
          backgroundSize: 'contain', backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat', filter: 'blur(2px)',
        }} />

        <GoldParticles />

        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: '4px', backgroundColor: '#8B1E2D', zIndex: 10 }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0,
                      width: '4px', backgroundColor: '#8B1E2D', zIndex: 10 }} />

        <div style={{ position: 'relative', zIndex: 20, padding: '8rem 2rem 5rem', maxWidth: '900px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '12px', marginBottom: '2rem' }}>
            <span style={{ width: '40px', height: '1px', backgroundColor: '#f2a90b' }} />
            <span className="section-label">THE ROYAL PALACE</span>
            <span style={{ width: '40px', height: '1px', backgroundColor: '#f2a90b' }} />
          </div>

          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif',
                       fontSize: 'clamp(3rem, 8vw, 7rem)',
                       color: '#F5F2E9', letterSpacing: '0.05em',
                       lineHeight: 0.95, margin: '0 0 1rem' }}>
            GUNEKU PALACE
          </h1>
          <p style={{ fontFamily: '"Bebas Neue", sans-serif',
                      fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                      color: '#f2a90b', letterSpacing: '0.1em', margin: '0 0 1.5rem' }}>
            SEAT OF HRH DR. FOMUKI WALTERS TICHA IX
          </p>
          <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
                      fontSize: '1.1rem', color: 'rgba(245,242,233,0.5)', margin: 0 }}>
            Custodian of tradition. Champion of development. Leader of 15,000.
          </p>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: '120px', zIndex: 15,
                      background: 'linear-gradient(to bottom, transparent, #0F0F0F)' }} />
      </div>

      {/* ── Current Fon Feature ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: '4rem', alignItems: 'center' }}
               className="grid-cols-1 md:grid-cols-2">
            <div>
              <div style={{ width: '40px', height: '3px',
                            backgroundColor: '#f2a90b', marginBottom: '1.5rem' }} />
              <span className="section-label" style={{ display: 'block', marginBottom: '1rem' }}>
                THE REIGNING FON
              </span>
              <h2 style={{ fontFamily: '"Bebas Neue", sans-serif',
                           fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                           color: '#F5F2E9', letterSpacing: '0.05em',
                           lineHeight: 1, margin: '0 0 0.5rem' }}>
                HRH DR. FOMUKI<br/>
                <span style={{ color: '#f2a90b' }}>WALTERS TICHA IX</span>
              </h2>
              <p style={{ color: 'rgba(245,242,233,0.4)', fontFamily: 'Syne, sans-serif',
                          fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                          margin: '0 0 2rem' }}>
                Fon of Guneku · Physician · Visionary
              </p>

              <blockquote style={{ borderLeft: '3px solid #f2a90b',
                                   paddingLeft: '1.5rem', margin: '0 0 2.5rem' }}>
                <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
                            fontSize: '1.1rem', color: '#f2a90b', lineHeight: 1.7, margin: 0 }}>
                  &ldquo;{(fon as any)?.quote || 'We carry Guneku in our hearts wherever we are. But Guneku must grow.'}&rdquo;
                </p>
              </blockquote>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                  { val: '2015',       label: 'Enthroned' },
                  { val: 'Fomuki IX',  label: 'Royal Line' },
                  { val: '27',         label: 'Quarters' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: '"Bebas Neue", sans-serif',
                                  fontSize: '1.5rem', color: '#f2a90b', letterSpacing: '0.05em' }}>
                      {s.val}
                    </div>
                    <div style={{ color: 'rgba(245,242,233,0.3)', fontFamily: 'Syne, sans-serif',
                                  fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/palace/fon-walters-profile" style={{
                backgroundColor: '#f2a90b', color: '#0F0F0F',
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                padding: '0.9rem 2.5rem', fontSize: '0.8rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                textDecoration: 'none', display: 'inline-block',
              }}>
                Full Profile →
              </Link>
            </div>

            <div style={{ position: 'relative', display: 'flex',
                          alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '60px', height: '60px',
                            borderTop: '2px solid rgba(242,169,11,0.4)',
                            borderLeft: '2px solid rgba(242,169,11,0.4)' }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '60px', height: '60px',
                            borderBottom: '2px solid rgba(242,169,11,0.4)',
                            borderRight: '2px solid rgba(242,169,11,0.4)' }} />
              <div style={{ position: 'relative', width: '320px', height: '420px', maxWidth: '100%' }}>
                <Image src="/chieff-logo.png" alt="HRH Dr. Fomuki Walters Ticha IX"
                       fill style={{ objectFit: 'contain' }} unoptimized />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Coronation Timeline ── */}
      <section style={{ backgroundColor: '#080810',
                        borderTop: '1px solid rgba(139,30,45,0.2)',
                        borderBottom: '1px solid rgba(139,30,45,0.2)',
                        padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                THE ROYAL STORY
              </span>
              <h2 style={{ fontFamily: '"Bebas Neue", sans-serif',
                           fontSize: '2.5rem', color: '#F5F2E9', letterSpacing: '0.05em', margin: 0 }}>
                FROM BAVARIA TO THE THRONE
              </h2>
            </div>
          </Reveal>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                          top: 0, bottom: 0, width: '1px',
                          backgroundColor: 'rgba(242,169,11,0.15)' }}
                 className="hidden md:block" />

            {CORONATION_TIMELINE.map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr',
                              gap: '0 2rem', marginBottom: '3rem', alignItems: 'start' }}
                     className="grid-cols-1 md:grid-cols-[1fr_40px_1fr]">

                  {/* Left — even-index items */}
                  <div className={i % 2 === 0 ? '' : 'hidden md:block'}>
                    {i % 2 === 0 && (
                      <div style={{ backgroundColor: '#0C0C14',
                                    border: `1px solid ${item.color}30`,
                                    borderRight: `3px solid ${item.color}`,
                                    padding: '1.5rem', textAlign: 'right' }}>
                        <div style={{ color: item.color, fontFamily: 'Syne, sans-serif',
                                      fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em',
                                      textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                          {item.date}
                        </div>
                        <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.3rem',
                                     color: '#F5F2E9', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>
                          {item.title}
                        </h3>
                        <p style={{ color: 'rgba(245,242,233,0.5)', fontFamily: 'Inter, sans-serif',
                                    fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
                          {item.desc}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Center dot */}
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1.5rem' }}
                       className="hidden md:flex">
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%',
                                  backgroundColor: item.color, border: '3px solid #0F0F0F',
                                  flexShrink: 0, boxShadow: `0 0 12px ${item.color}60` }} />
                  </div>

                  {/* Right — odd-index items */}
                  <div className={i % 2 === 1 ? '' : 'hidden md:block'}>
                    {i % 2 === 1 && (
                      <div style={{ backgroundColor: '#0C0C14',
                                    border: `1px solid ${item.color}30`,
                                    borderLeft: `3px solid ${item.color}`,
                                    padding: '1.5rem' }}>
                        <div style={{ color: item.color, fontFamily: 'Syne, sans-serif',
                                      fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em',
                                      textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                          {item.date}
                        </div>
                        <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.3rem',
                                     color: '#F5F2E9', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>
                          {item.title}
                        </h3>
                        <p style={{ color: 'rgba(245,242,233,0.5)', fontFamily: 'Inter, sans-serif',
                                    fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
                          {item.desc}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Palace Articles ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        {current.length > 0 && (
          <>
            <Reveal>
              <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem',
                           color: '#f2a90b', letterSpacing: '0.05em', margin: '0 0 2rem' }}>
                THE REIGN OF FOMUKI IX
              </h3>
            </Reveal>
            <div style={{ display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                          gap: '1.5rem', marginBottom: '4rem' }}>
              {current.map((a: any, i: number) => (
                <Reveal key={a.id} delay={i * 0.08}>
                  <Link href={`/palace/${a.slug}`}
                        style={{ textDecoration: 'none', display: 'block',
                                 backgroundColor: '#0C0C14',
                                 border: '1px solid rgba(255,255,255,0.05)',
                                 padding: '2rem', borderTop: '3px solid #f2a90b' }}
                        className="hover:scale-[1.02] transition-transform">
                    <div style={{ width: '24px', height: '2px',
                                  backgroundColor: '#f2a90b', marginBottom: '1rem' }} />
                    <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700,
                                 color: '#F5F2E9', fontSize: '1.05rem',
                                 margin: '0 0 1rem', lineHeight: 1.3 }}>
                      {a.title}
                    </h4>
                    <span style={{ color: '#f2a90b', fontSize: '0.78rem',
                                   fontFamily: 'Syne, sans-serif',
                                   letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Read →
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </>
        )}

        <Reveal>
          <div style={{ backgroundColor: '#0A0A0A',
                        border: '1px solid rgba(139,30,45,0.2)', padding: '3rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '2px', backgroundColor: '#8B1E2D' }} />
              <span className="section-label">IN MEMORY</span>
            </div>
            <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem',
                         color: 'rgba(245,242,233,0.4)', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>
              HRH FON FOMUKI PATRICK NJI
            </h3>
            <p style={{ color: 'rgba(245,242,233,0.2)', fontFamily: 'Inter, sans-serif',
                        fontSize: '0.9rem', margin: '0 0 2rem' }}>
              1938 – 2015 · 50 Years on the Throne of Guneku
            </p>
            <div style={{ display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                          gap: '1rem' }}>
              {legacy.map((a: any) => (
                <Link key={a.id} href={`/palace/${a.slug}`}
                      style={{ textDecoration: 'none', display: 'block',
                               backgroundColor: '#080810',
                               border: '1px solid rgba(255,255,255,0.04)', padding: '1.5rem' }}>
                  <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700,
                               color: 'rgba(245,242,233,0.45)', fontSize: '0.95rem',
                               margin: '0 0 0.5rem' }}>
                    {a.title}
                  </h4>
                  <span style={{ color: 'rgba(245,242,233,0.2)', fontSize: '0.75rem',
                                 fontFamily: 'Syne, sans-serif', letterSpacing: '0.1em' }}>
                    Read →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  )
}
