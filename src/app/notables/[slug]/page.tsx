import { getAllNotables, getNotable } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  return getAllNotables().map((n: any) => ({ slug: n.slug }))
}

export default async function NotablePage({
  params
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const notable = getNotable(slug)
  if (!notable) notFound()

  const n = notable as any
  const isMarcel = n.id === 'marcel-tabit-akwe'

  return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh' }}>
      <PageHero
        label="NOTABLE GUNEKU SON"
        title={n.name.toUpperCase()}
        subtitle={`${n.title} · ${n.location}`}
      />
      <section style={{ maxWidth:'1200px', margin:'0 auto',
                        padding:'5rem 1.5rem',
                        display:'grid', gridTemplateColumns:'2fr 1fr',
                        gap:'4rem', alignItems:'start' }}
               className="grid-cols-1 md:grid-cols-[2fr_1fr]">
        <div>
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1.05rem',
                      color:'rgba(245,242,233,0.7)', lineHeight:1.85,
                      margin:'0 0 2.5rem' }}>
            {n.bio}
          </p>

          {/* Marcel — services */}
          {isMarcel && n.services && (
            <>
              <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                           color:'#F5F2E9', letterSpacing:'0.05em', margin:'0 0 1.25rem' }}>
                SERVICES
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
                            gap:'0.75rem', marginBottom:'2.5rem' }}
                   className="grid-cols-1 sm:grid-cols-2">
                {n.services.map((s: string) => (
                  <div key={s} style={{ display:'flex', alignItems:'center',
                                        gap:'10px', padding:'0.75rem 1rem',
                                        backgroundColor:'#0C0C14',
                                        borderLeft:'2px solid #f2a90b' }}>
                    <span style={{ width:'4px', height:'4px', borderRadius:'50%',
                                   backgroundColor:'#f2a90b', flexShrink:0 }} />
                    <span style={{ color:'rgba(245,242,233,0.7)',
                                   fontFamily:'Inter, sans-serif', fontSize:'0.85rem' }}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>

              {/* Results */}
              <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                           color:'#F5F2E9', letterSpacing:'0.05em', margin:'0 0 1.25rem' }}>
                PROVEN RESULTS
              </h3>
              <div style={{ display:'grid',
                            gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',
                            gap:'1rem', marginBottom:'2.5rem' }}>
                {(n.results || []).map((r: string) => (
                  <div key={r} style={{ padding:'1.25rem', backgroundColor:'#0C0C14',
                                        borderTop:'2px solid #8B1E2D' }}>
                    <p style={{ color:'rgba(245,242,233,0.7)',
                                fontFamily:'Inter, sans-serif', fontSize:'0.85rem',
                                lineHeight:1.6, margin:0 }}>
                      {r}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Roland — initiative */}
          {n.initiative && (
            <>
              <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                           color:'#F5F2E9', letterSpacing:'0.05em', margin:'0 0 1.25rem' }}>
                AFOR FOUNDATION SCHOLARSHIP
              </h3>
              <div style={{ padding:'1.5rem', backgroundColor:'#0C0C14',
                            border:'1px solid rgba(242,169,11,0.15)',
                            marginBottom:'2rem' }}>
                <p style={{ color:'rgba(245,242,233,0.6)',
                            fontFamily:'Inter, sans-serif', fontSize:'0.95rem',
                            lineHeight:1.8, margin:'0 0 1rem' }}>
                  {n.initiative.type} · Annual prize:{' '}
                  <strong style={{ color:'#f2a90b' }}>
                    {n.initiative.prize}
                  </strong>
                </p>
                <p style={{ color:'rgba(245,242,233,0.4)',
                            fontFamily:'Inter, sans-serif', fontSize:'0.85rem',
                            margin:0 }}>
                  Venue: {n.initiative.venue}
                </p>
              </div>
            </>
          )}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          <ImagePlaceholder label={n.name} aspectRatio="3/4" />

          <div style={{ backgroundColor:'#0C0C14',
                        border:'1px solid rgba(242,169,11,0.15)',
                        padding:'1.5rem' }}>
            {[
              { label:'Origin',   value: n.origin },
              { label:'Location', value: n.location },
              { label:'Title',    value: n.title },
              ...(n.companyWebsite ? [{ label:'Website', value: n.companyWebsite }] : []),
              ...(n.institution   ? [{ label:'Institution', value: n.institution }] : []),
            ].map((f: { label: string; value: string }) => (
              <div key={f.label} style={{
                display:'flex', justifyContent:'space-between',
                padding:'0.5rem 0',
                borderBottom:'1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ color:'rgba(245,242,233,0.3)',
                               fontFamily:'Syne, sans-serif', fontSize:'0.72rem',
                               textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  {f.label}
                </span>
                <span style={{ color:'rgba(245,242,233,0.7)',
                               fontFamily:'Inter, sans-serif', fontSize:'0.82rem',
                               textAlign:'right', maxWidth:'55%' }}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          {n.companyWebsite && (
            <a href={n.companyWebsite} target="_blank" rel="noopener noreferrer"
               style={{ backgroundColor:'#f2a90b', color:'#0F0F0F',
                         fontFamily:'Syne, sans-serif', fontWeight:700,
                         padding:'0.85rem 2rem', fontSize:'0.78rem',
                         letterSpacing:'0.12em', textTransform:'uppercase',
                         textDecoration:'none', display:'block', textAlign:'center' }}>
              Visit Website
            </a>
          )}
        </div>
      </section>

      {/* ── MaxPromo Digital showcase — only on Marcel's page ── */}
      {isMarcel && (
        <section style={{
          backgroundColor: '#0A0A0A',
          borderTop: '1px solid rgba(242,169,11,0.15)',
          padding: '5rem 1.5rem',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ textAlign:'center', marginBottom:'4rem' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                            gap:'12px', marginBottom:'1.5rem' }}>
                <span style={{ width:'28px', height:'2px', backgroundColor:'#8B1E2D' }} />
                <span className="section-label">THE ARCHITECT BEHIND THIS PLATFORM</span>
                <span style={{ width:'28px', height:'2px', backgroundColor:'#8B1E2D' }} />
              </div>
              <h2 style={{ fontFamily:'"Bebas Neue", sans-serif',
                           fontSize:'clamp(2rem, 5vw, 4rem)',
                           color:'#F5F2E9', letterSpacing:'0.05em',
                           margin:'0 0 1rem', lineHeight:1 }}>
                MAXPROMO DIGITAL
              </h2>
              <p style={{ color:'rgba(245,242,233,0.5)', fontFamily:'Inter, sans-serif',
                          fontSize:'1rem', maxWidth:'640px', margin:'0 auto',
                          lineHeight:1.8 }}>
                {n.company_description}
              </p>
            </div>

            {/* Services grid */}
            {n.services && (
              <div style={{ marginBottom:'4rem' }}>
                <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                             color:'#F5F2E9', letterSpacing:'0.05em',
                             margin:'0 0 1.5rem', textAlign:'center' }}>
                  SERVICES
                </h3>
                <div style={{ display:'grid',
                              gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',
                              gap:'1px', backgroundColor:'rgba(242,169,11,0.08)',
                              border:'1px solid rgba(242,169,11,0.08)' }}>
                  {n.services.map((svc: string, i: number) => (
                    <div key={i} style={{ backgroundColor:'#0C0C14', padding:'1.5rem',
                                          display:'flex', alignItems:'flex-start', gap:'1rem' }}>
                      <span style={{ color:'#f2a90b', fontFamily:'"Bebas Neue", sans-serif',
                                     fontSize:'1.4rem', flexShrink:0, lineHeight:1,
                                     marginTop:'0.1rem' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ color:'rgba(245,242,233,0.7)',
                                     fontFamily:'Inter, sans-serif', fontSize:'0.9rem',
                                     lineHeight:1.5 }}>
                        {svc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {n.results && (
              <div style={{ marginBottom:'4rem' }}>
                <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                             color:'#F5F2E9', letterSpacing:'0.05em',
                             margin:'0 0 1.5rem', textAlign:'center' }}>
                  PROVEN RESULTS
                </h3>
                <div style={{ display:'grid',
                              gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',
                              gap:'1rem' }}>
                  {n.results.map((r: string, i: number) => (
                    <div key={i} style={{ backgroundColor:'#0C0C14',
                                          borderTop:'3px solid #8B1E2D',
                                          padding:'1.5rem' }}>
                      <p style={{ color:'rgba(245,242,233,0.7)',
                                  fontFamily:'Inter, sans-serif', fontSize:'0.9rem',
                                  lineHeight:1.6, margin:0 }}>
                        {r}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech stack */}
            {n.stack && (
              <div style={{ marginBottom:'4rem', textAlign:'center' }}>
                <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                             color:'rgba(245,242,233,0.4)', letterSpacing:'0.05em',
                             margin:'0 0 1.5rem' }}>
                  TECH STACK
                </h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px',
                              justifyContent:'center' }}>
                  {n.stack.map((tech: string) => (
                    <span key={tech} style={{
                      backgroundColor: 'rgba(242,169,11,0.06)',
                      border: '1px solid rgba(242,169,11,0.15)',
                      color: 'rgba(242,169,11,0.6)',
                      fontFamily: 'Syne, sans-serif', fontSize: '0.7rem',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      padding: '0.3rem 0.75rem',
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={{
              textAlign: 'center',
              backgroundColor: '#0C0C14',
              border: '1px solid rgba(242,169,11,0.2)',
              padding: '3rem 2rem',
            }}>
              <h3 style={{ fontFamily:'"Bebas Neue", sans-serif',
                           fontSize:'clamp(1.5rem, 3vw, 2.5rem)',
                           color:'#F5F2E9', letterSpacing:'0.05em',
                           margin:'0 0 1rem' }}>
                READY TO BUILD YOUR OWN?
              </h3>
              <p style={{ color:'rgba(245,242,233,0.4)', fontFamily:'Inter, sans-serif',
                          fontSize:'0.95rem', lineHeight:1.7, margin:'0 0 2rem' }}>
                This Guneku platform is a live demonstration of what MaxPromo Digital builds.
                Book a free automation audit and find out what&apos;s possible for your community or business.
              </p>
              <a href={n.freeAudit || 'https://maxpromo.digital/automation-audit'}
                 target="_blank" rel="noopener noreferrer"
                 style={{
                   backgroundColor: '#f2a90b', color: '#0F0F0F',
                   fontFamily: 'Syne, sans-serif', fontWeight: 700,
                   padding: '1rem 3rem', fontSize: '0.85rem',
                   letterSpacing: '0.15em', textTransform: 'uppercase',
                   textDecoration: 'none', display: 'inline-block',
                   marginRight: '1rem',
                 }}>
                Free Automation Audit →
              </a>
              <a href="https://maxpromo.digital"
                 target="_blank" rel="noopener noreferrer"
                 style={{
                   border: '1px solid rgba(245,242,233,0.15)',
                   color: 'rgba(245,242,233,0.5)',
                   fontFamily: 'Syne, sans-serif', fontWeight: 700,
                   padding: '1rem 2rem', fontSize: '0.85rem',
                   letterSpacing: '0.15em', textTransform: 'uppercase',
                   textDecoration: 'none', display: 'inline-block',
                 }}>
                maxpromo.digital
              </a>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
