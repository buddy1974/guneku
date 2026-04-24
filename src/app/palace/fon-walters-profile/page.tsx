import { getFonProfile } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import Link from 'next/link'

export const metadata = {
  title: 'HRH Dr. Fomuki Walters Ticha IX — Fon of Guneku',
  description: 'Official profile of HRH Dr. Fomuki Walters Ticha IX, Fon of Guneku Fondom and urologist based in Germany.',
}

export default function FonProfilePage() {
  const fon = getFonProfile()

  return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh' }}>
      <PageHero
        label="THE REIGNING FON"
        title="HRH DR. FOMUKI WALTERS TICHA IX"
        subtitle="Fon of Guneku Fondom · Physician · Visionary"
      />

      {/* ── Profile split ── */}
      <section style={{ maxWidth:'1200px', margin:'0 auto',
                        padding:'5rem 1.5rem', display:'grid',
                        gridTemplateColumns:'2fr 1fr', gap:'4rem' }}
               className="grid-cols-1 md:grid-cols-[2fr_1fr]">

        <div>
          {/* Quote */}
          <blockquote style={{
            borderLeft: '3px solid #f2a90b',
            paddingLeft: '1.5rem',
            margin: '0 0 3rem',
          }}>
            <p style={{ fontFamily:'Playfair Display, serif', fontStyle:'italic',
                        fontSize:'1.3rem', color:'#f2a90b', lineHeight:1.6,
                        margin:'0 0 0.5rem' }}>
              &ldquo;{(fon as any)?.quote || 'We carry Guneku in our hearts wherever we are in the world.'}&rdquo;
            </p>
          </blockquote>

          {/* Narrative */}
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1.05rem',
                      color:'rgba(245,242,233,0.7)', lineHeight:1.85,
                      margin:'0 0 2rem' }}>
            {fon?.enthronementNarrative}
          </p>

          {/* Governance style */}
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1rem',
                      color:'rgba(245,242,233,0.6)', lineHeight:1.8,
                      margin:'0 0 3rem' }}>
            {fon?.governanceStyle}
          </p>

          {/* Education */}
          <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                       color:'#F5F2E9', letterSpacing:'0.05em',
                       margin:'0 0 1.5rem' }}>
            EDUCATION
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem',
                        marginBottom:'3rem' }}>
            {(fon?.education || []).map((e: any, i: number) => (
              <div key={i} style={{
                display:'flex', gap:'1rem', alignItems:'flex-start',
                padding:'0.75rem 1rem',
                backgroundColor:'#0C0C14',
                borderLeft:'2px solid rgba(242,169,11,0.3)',
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#F5F2E9', fontFamily:'Syne, sans-serif',
                                fontWeight:600, fontSize:'0.9rem' }}>
                    {e.degree || e.qualification}
                  </div>
                  <div style={{ color:'rgba(245,242,233,0.4)',
                                fontFamily:'Inter, sans-serif', fontSize:'0.8rem',
                                marginTop:'0.2rem' }}>
                    {e.institution} · {e.country}
                    {e.year ? ` · ${e.year}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Initiatives */}
          <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                       color:'#F5F2E9', letterSpacing:'0.05em',
                       margin:'0 0 1.5rem' }}>
            INITIATIVES
          </h3>
          <div style={{ display:'grid',
                        gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))',
                        gap:'1rem', marginBottom:'3rem' }}>
            {(fon?.initiatives || []).map((item: any, i: number) => (
              <div key={i} style={{
                backgroundColor:'#0C0C14',
                border:'1px solid rgba(255,255,255,0.05)',
                padding:'1.25rem',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                              alignItems:'flex-start', marginBottom:'0.5rem' }}>
                  <span style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                                 color:'#F5F2E9', fontSize:'0.95rem' }}>
                    {item.name}
                  </span>
                  <span style={{ backgroundColor:'rgba(139,30,45,0.2)',
                                 color:'#8B1E2D', fontSize:'0.65rem',
                                 fontFamily:'Syne, sans-serif',
                                 letterSpacing:'0.1em', textTransform:'uppercase',
                                 padding:'0.2rem 0.5rem', flexShrink:0 }}>
                    {item.role}
                  </span>
                </div>
                <p style={{ color:'rgba(245,242,233,0.4)',
                            fontFamily:'Inter, sans-serif', fontSize:'0.8rem',
                            lineHeight:1.6, margin:0 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
          <ImagePlaceholder label="Portrait" aspectRatio="3/4" />

          {/* Quick facts */}
          <div style={{ backgroundColor:'#0C0C14',
                        border:'1px solid rgba(242,169,11,0.15)',
                        padding:'1.5rem' }}>
            <h4 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.2rem',
                         color:'#f2a90b', letterSpacing:'0.1em',
                         margin:'0 0 1rem' }}>
              QUICK FACTS
            </h4>
            {[
              { label:'Enthroned', value: (fon as any)?.enthronementDateDisplay || '27 February 2015' },
              { label:'Coronation', value: (fon as any)?.coronationDate || '17 January 2016' },
              { label:'Title', value: fon?.fonNumber ? `Fomuki ${fon.fonNumber}` : 'Fomuki IX' },
              { label:'Predecessor', value: (fon as any)?.predecessorName || 'HRH Fomuki Patrick Nji' },
              { label:'Website', value: 'waltersfomuki.de' },
            ].map(f => (
              <div key={f.label} style={{
                display:'flex', justifyContent:'space-between',
                padding:'0.5rem 0',
                borderBottom:'1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ color:'rgba(245,242,233,0.35)',
                               fontFamily:'Syne, sans-serif', fontSize:'0.75rem',
                               textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  {f.label}
                </span>
                <span style={{ color:'#F5F2E9', fontFamily:'Inter, sans-serif',
                               fontSize:'0.85rem' }}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          {/* Professional memberships */}
          <div style={{ backgroundColor:'#0C0C14',
                        border:'1px solid rgba(255,255,255,0.05)',
                        padding:'1.5rem' }}>
            <h4 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.2rem',
                         color:'#F5F2E9', letterSpacing:'0.1em',
                         margin:'0 0 1rem' }}>
              MEMBERSHIPS
            </h4>
            {((fon as any)?.professionalMemberships || []).map((m: any, i: number) => (
              <div key={i} style={{
                padding:'0.4rem 0',
                borderBottom:'1px solid rgba(255,255,255,0.04)',
                color:'rgba(245,242,233,0.5)',
                fontFamily:'Inter, sans-serif', fontSize:'0.8rem',
              }}>
                {m.name || m}
              </div>
            ))}
          </div>

          <Link href="/palace" style={{
            textAlign:'center', display:'block',
            border:'1px solid rgba(245,242,233,0.15)',
            color:'rgba(245,242,233,0.4)',
            fontFamily:'Syne, sans-serif', fontSize:'0.75rem',
            letterSpacing:'0.15em', textTransform:'uppercase',
            textDecoration:'none', padding:'0.75rem',
          }}>
            ← Back to The Palace
          </Link>
        </div>
      </section>
    </main>
  )
}
