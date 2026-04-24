import { PageHero } from '@/components/layout/PageHero'
import { getFonProfile, getAllPalaceArticles } from '@/lib/content'
import Link from 'next/link'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'

export const metadata = {
  title: 'The Palace',
  description: 'The Royal Palace of Guneku Fondom — seat of HRH Dr. Fomuki Walters Ticha IX',
}

export default function PalacePage() {
  const fon = getFonProfile()
  const articles = getAllPalaceArticles()
  const current = articles.filter((a: any) => a.era === 'current')
  const legacy  = articles.filter((a: any) => a.era === 'legacy')

  return (
    <main style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}>
      <PageHero
        label="THE ROYAL PALACE"
        title="GUNEKU PALACE"
        subtitle="Seat of the Fon — custodian of tradition, culture, and community."
      />

      {/* ── Current Fon Feature ── */}
      <section style={{ maxWidth:'1200px', margin:'0 auto',
                        padding:'5rem 1.5rem', display:'grid',
                        gridTemplateColumns:'1fr 1fr', gap:'4rem',
                        alignItems:'center' }}
               className="grid-cols-1 md:grid-cols-2">

        <div>
          <span className="section-label" style={{ marginBottom:'1rem', display:'block' }}>
            THE REIGNING FON
          </span>
          <div style={{ width:'40px', height:'3px',
                        backgroundColor:'#8B1E2D', marginBottom:'1.5rem' }} />
          <h2 style={{ fontFamily:'"Bebas Neue", sans-serif',
                       fontSize:'3.5rem', color:'#F5F2E9',
                       letterSpacing:'0.05em', lineHeight:1,
                       margin:'0 0 0.5rem' }}>
            {fon?.fullName || 'HRH Dr. Fomuki Walters Ticha IX'}
          </h2>
          <p style={{ color:'#f2a90b', fontFamily:'Syne, sans-serif',
                      fontSize:'0.85rem', letterSpacing:'0.1em',
                      textTransform:'uppercase', margin:'0 0 1.5rem' }}>
            {fon?.title}
          </p>
          <p style={{ color:'rgba(245,242,233,0.6)', fontFamily:'Inter, sans-serif',
                      fontSize:'1rem', lineHeight:1.8, margin:'0 0 2rem' }}>
            {fon?.governanceStyle?.substring(0, 280)}...
          </p>
          <Link href="/palace/fon-walters-profile"
                style={{ backgroundColor:'#f2a90b', color:'#0F0F0F',
                          fontFamily:'Syne, sans-serif', fontWeight:700,
                          padding:'0.85rem 2rem', fontSize:'0.78rem',
                          letterSpacing:'0.12em', textTransform:'uppercase',
                          textDecoration:'none', display:'inline-block' }}>
            Full Profile
          </Link>
        </div>

        <ImagePlaceholder label="HRH Fomuki Walters Ticha IX" aspectRatio="3/4" />
      </section>

      {/* ── Gold divider ── */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 1.5rem' }}>
        <div style={{ height:'1px', backgroundColor:'rgba(242,169,11,0.15)' }} />
      </div>

      {/* ── Current Era articles ── */}
      {current.length > 0 && (
        <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'4rem 1.5rem' }}>
          <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2rem',
                       color:'#f2a90b', letterSpacing:'0.05em', margin:'0 0 2rem' }}>
            THE REIGN OF FOMUKI IX
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
                        gap:'1.5rem' }}>
            {current.map((a: any) => (
              <Link key={a.id} href={`/palace/${a.slug}`}
                    style={{ textDecoration:'none', display:'block',
                             backgroundColor:'#0C0C14',
                             border:'1px solid rgba(255,255,255,0.05)',
                             padding:'2rem',
                             transition:'border-color 0.2s' }}
                    className="hover:border-[rgba(242,169,11,0.3)]">
                <div style={{ width:'24px', height:'2px',
                              backgroundColor:'#f2a90b', marginBottom:'1rem' }} />
                <h4 style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                             color:'#F5F2E9', fontSize:'1.1rem',
                             margin:'0 0 0.75rem', lineHeight:1.3 }}>
                  {a.title}
                </h4>
                <span style={{ color:'#f2a90b', fontSize:'0.75rem',
                               fontFamily:'Syne, sans-serif',
                               letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  Read →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Legacy section ── */}
      <section style={{ backgroundColor:'#0A0A0A',
                        borderTop:'1px solid rgba(139,30,45,0.2)',
                        borderBottom:'1px solid rgba(139,30,45,0.2)',
                        padding:'4rem 1.5rem', margin:'0' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center',
                        gap:'1rem', marginBottom:'2rem' }}>
            <div style={{ width:'40px', height:'2px',
                          backgroundColor:'#8B1E2D' }} />
            <span className="section-label">IN MEMORY</span>
          </div>
          <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2rem',
                       color:'rgba(245,242,233,0.5)', letterSpacing:'0.05em',
                       margin:'0 0 0.5rem' }}>
            HRH FON FOMUKI PATRICK NJI
          </h3>
          <p style={{ color:'rgba(245,242,233,0.3)', fontFamily:'Inter, sans-serif',
                      fontSize:'0.9rem', margin:'0 0 2rem' }}>
            1938 – 2015 · 50 Years on the Throne of Guneku
          </p>
          <div style={{ display:'grid',
                        gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',
                        gap:'1.5rem' }}>
            {legacy.map((a: any) => (
              <Link key={a.id} href={`/palace/${a.slug}`}
                    style={{ textDecoration:'none', display:'block',
                             backgroundColor:'#080810',
                             border:'1px solid rgba(255,255,255,0.04)',
                             padding:'1.5rem' }}>
                <h4 style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                             color:'rgba(245,242,233,0.5)', fontSize:'1rem',
                             margin:'0 0 0.5rem' }}>
                  {a.title}
                </h4>
                <span style={{ color:'rgba(245,242,233,0.25)', fontSize:'0.75rem',
                               fontFamily:'Syne, sans-serif', letterSpacing:'0.1em' }}>
                  Read →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
