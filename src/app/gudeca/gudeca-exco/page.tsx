import { PageHero } from '@/components/layout/PageHero'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import Link from 'next/link'

export const metadata = { title: 'GUDECA EXCO' }

export default function GudecaExcoPage() {
  return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh' }}>
      <PageHero
        label="GUDECA"
        title="EXECUTIVE COMMITTEE"
        subtitle="The elected leadership of the Guneku Cultural & Development Association."
      />
      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem' }}>
        <p style={{ color:'rgba(245,242,233,0.5)', fontFamily:'Inter, sans-serif',
                    fontSize:'1rem', lineHeight:1.8, maxWidth:'680px',
                    marginBottom:'3rem' }}>
          GUDECA&apos;s Executive Committee is elected every 4 years with a mandate
          requiring at least 60% youth and female representation.
          Full EXCO roster will be published here.
        </p>
        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))',
                      gap:'1.5rem' }}>
          {['President','Vice President','Secretary General',
            'Financial Secretary','PRO','Youth Rep','Women Rep',
            'Diaspora Rep'].map(role => (
            <div key={role} style={{
              backgroundColor:'#0C0C14',
              border:'1px solid rgba(255,255,255,0.05)',
              padding:'1.5rem', textAlign:'center',
            }}>
              <ImagePlaceholder label={role} aspectRatio="1/1" />
              <div style={{ marginTop:'1rem',
                            color:'rgba(245,242,233,0.3)',
                            fontFamily:'Syne, sans-serif', fontSize:'0.75rem',
                            letterSpacing:'0.15em', textTransform:'uppercase' }}>
                {role}
              </div>
            </div>
          ))}
        </div>
        {/* GUDECA EU confirmed leadership */}
        <div style={{ marginTop:'4rem', paddingTop:'3rem',
                      borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2rem',
                       color:'#F5F2E9', letterSpacing:'0.05em', margin:'0 0 2rem' }}>
            GUDECA EUROPE — CONFIRMED LEADERSHIP
          </h3>
          <div style={{ display:'grid',
                        gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',
                        gap:'1rem' }}>
            {[
              { role:'President',           name:'Ndenge Constantine' },
              { role:'Vice President',      name:'Festus Tanwi'       },
              { role:'Secretary General',   name:'Muyang Ela'         },
              { role:'Financial Secretary', name:'Armstrong Tinyih'   },
              { role:'Digital Lead',        name:'Ni Sam'             },
            ].map(m => (
              <div key={m.role} style={{
                backgroundColor:'#0C0C14',
                border:'1px solid rgba(255,255,255,0.05)',
                borderLeft:'3px solid #8B1E2D',
                padding:'1.25rem',
              }}>
                <div style={{ color:'rgba(245,242,233,0.3)',
                              fontFamily:'Syne, sans-serif', fontSize:'0.65rem',
                              letterSpacing:'0.15em', textTransform:'uppercase',
                              marginBottom:'0.4rem' }}>
                  {m.role}
                </div>
                <div style={{ color:'#F5F2E9', fontFamily:'Syne, sans-serif',
                              fontWeight:700, fontSize:'1rem' }}>
                  {m.name}
                </div>
                <div style={{ color:'rgba(245,242,233,0.25)', fontFamily:'Inter, sans-serif',
                              fontSize:'0.75rem', marginTop:'0.25rem' }}>
                  GUDECA Europe
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:'3rem' }}>
          <Link href="/gudeca" style={{
            color:'#f2a90b', fontFamily:'Syne, sans-serif',
            fontSize:'0.8rem', letterSpacing:'0.1em',
            textTransform:'uppercase', textDecoration:'none',
          }}>
            ← Back to GUDECA
          </Link>
        </div>
      </section>
    </main>
  )
}
