import { getAllUpdates } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import Link from 'next/link'

export const metadata = {
  title: 'Village Square — News from Guneku Fondom',
  description: 'Latest news, events, and announcements from Guneku Fondom, Northwest Cameroon.',
}

export default function UpdatesPage() {
  const updates = getAllUpdates()

  return (
    <main style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}>
      <PageHero
        label="THE VILLAGE SQUARE"
        title="LATEST FROM GUNEKU"
        subtitle="News, events, and announcements from the Fondom."
      />

      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem' }}>

        {/* Featured — first article */}
        {updates[0] && (
          <Link href={`/updates/${updates[0].slug}`}
                style={{ textDecoration:'none', display:'block',
                         backgroundColor:'#0C0C14',
                         border:'1px solid rgba(242,169,11,0.15)',
                         marginBottom:'3rem', overflow:'hidden' }}
                className="hover:border-[rgba(242,169,11,0.35)] transition-colors">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}
                 className="grid-cols-1 md:grid-cols-2">
              <div style={{ height:'320px', backgroundColor:'#0A0A10',
                            borderRight:'1px solid rgba(255,255,255,0.05)',
                            position:'relative' }}>
                <div style={{ position:'absolute', inset:0, display:'flex',
                              alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'rgba(242,169,11,0.15)',
                                 fontFamily:'"Bebas Neue", sans-serif',
                                 fontSize:'8rem', letterSpacing:'0.05em' }}>
                    01
                  </span>
                </div>
                <div style={{ position:'absolute', top:0, left:0, right:0,
                              height:'3px', backgroundColor:'#f2a90b' }} />
              </div>
              <div style={{ padding:'2.5rem' }}>
                <div style={{ color:'#f2a90b', fontFamily:'Syne, sans-serif',
                              fontSize:'0.75rem', letterSpacing:'0.15em',
                              textTransform:'uppercase', marginBottom:'1rem' }}>
                  FEATURED ·&nbsp;
                  {updates[0].publishedAt
                    ? new Date(updates[0].publishedAt).toLocaleDateString('en-GB',
                        { day:'numeric', month:'long', year:'numeric' })
                    : ''}
                </div>
                <h2 style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                             color:'#F5F2E9', fontSize:'1.5rem',
                             lineHeight:1.3, margin:'0 0 1rem' }}>
                  {updates[0].title}
                </h2>
                <p style={{ color:'rgba(245,242,233,0.5)',
                            fontFamily:'Inter, sans-serif', fontSize:'0.95rem',
                            lineHeight:1.7, margin:'0 0 1.5rem' }}>
                  {updates[0].excerpt}
                </p>
                <span style={{ color:'#f2a90b', fontFamily:'Syne, sans-serif',
                               fontSize:'0.78rem', letterSpacing:'0.12em',
                               textTransform:'uppercase' }}>
                  Read full story →
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Rest of articles grid */}
        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))',
                      gap:'1.5rem' }}>
          {updates.slice(1).map((u: any, i: number) => (
            <Link key={u.id} href={`/updates/${u.slug}`}
                  style={{ textDecoration:'none', display:'block',
                           backgroundColor:'#0C0C14',
                           border:'1px solid rgba(255,255,255,0.05)',
                           overflow:'hidden' }}
                  className="hover:border-[rgba(242,169,11,0.2)] transition-colors">
              <div style={{ height:'180px', backgroundColor:'#090910',
                            position:'relative', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ position:'absolute', inset:0, display:'flex',
                              alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'rgba(242,169,11,0.08)',
                                 fontFamily:'"Bebas Neue", sans-serif',
                                 fontSize:'5rem' }}>
                    {String(i + 2).padStart(2, '0')}
                  </span>
                </div>
                <div style={{ position:'absolute', top:0, left:0,
                              right:0, height:'2px', backgroundColor:'#8B1E2D' }} />
              </div>
              <div style={{ padding:'1.5rem' }}>
                <div style={{ color:'rgba(242,169,11,0.6)',
                              fontFamily:'Syne, sans-serif', fontSize:'0.7rem',
                              letterSpacing:'0.15em', textTransform:'uppercase',
                              marginBottom:'0.75rem' }}>
                  {u.publishedAt
                    ? new Date(u.publishedAt).toLocaleDateString('en-GB',
                        { day:'numeric', month:'long', year:'numeric' })
                    : ''}
                </div>
                <h3 style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                             color:'#F5F2E9', fontSize:'1.05rem',
                             lineHeight:1.3, margin:'0 0 0.75rem' }}>
                  {u.title}
                </h3>
                <p style={{ color:'rgba(245,242,233,0.4)',
                            fontFamily:'Inter, sans-serif', fontSize:'0.85rem',
                            lineHeight:1.6, margin:0,
                            display:'-webkit-box',
                            WebkitLineClamp:3,
                            WebkitBoxOrient:'vertical',
                            overflow:'hidden' }}>
                  {u.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
