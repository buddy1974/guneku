import { getAllKingdomArticles } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import Link from 'next/link'

export const metadata = {
  title: 'The Kingdom',
  description: 'About Guneku Fondom — geography, culture, heritage, and people.',
}

export default function KingdomPage() {
  const articles = getAllKingdomArticles()

  return (
    <main style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}>
      <PageHero
        label="THE KINGDOM"
        title="GUNEKU FONDOM"
        subtitle="A rural community in Momo Division, Northwest Cameroon —
                  15,000 people, 27 quarters, one heritage."
      />

      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem' }}>

        {/* Intro stat row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)',
                      gap:'1px', backgroundColor:'rgba(242,169,11,0.1)',
                      marginBottom:'4rem', border:'1px solid rgba(242,169,11,0.1)' }}
             className="grid-cols-2 md:grid-cols-4">
          {[
            { val:'15,000+', label:'Inhabitants' },
            { val:'27',      label:'Quarters' },
            { val:'1',       label:'Meta Clan' },
            { val:'3',       label:'Continents' },
          ].map(s => (
            <div key={s.label} style={{
              padding:'2rem', textAlign:'center',
              backgroundColor:'#0C0C14',
            }}>
              <div style={{ fontFamily:'"Bebas Neue", sans-serif',
                            fontSize:'2.5rem', color:'#f2a90b',
                            letterSpacing:'0.05em' }}>
                {s.val}
              </div>
              <div className="section-label" style={{ marginTop:'0.5rem' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Articles grid */}
        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))',
                      gap:'1.5rem' }}>
          {articles.map((a: any) => (
            <Link key={a.id} href={`/kingdom/${a.slug}`}
                  style={{ textDecoration:'none', display:'block',
                           backgroundColor:'#0C0C14',
                           border:'1px solid rgba(255,255,255,0.05)',
                           overflow:'hidden' }}
                  className="hover:border-[rgba(242,169,11,0.25)] transition-colors">

              {/* Top accent */}
              <div style={{ height:'3px', backgroundColor:'#8B1E2D' }} />
              <div style={{ padding:'2rem' }}>
                <h3 style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                             color:'#F5F2E9', fontSize:'1.2rem',
                             margin:'0 0 0.75rem', lineHeight:1.3 }}>
                  {a.title}
                </h3>
                <p style={{ color:'rgba(245,242,233,0.4)',
                            fontFamily:'Inter, sans-serif', fontSize:'0.85rem',
                            lineHeight:1.6, margin:'0 0 1.5rem' }}>
                  {a.body?.replace(/<[^>]+>/g, '').substring(0, 140)}...
                </p>
                <span style={{ color:'#f2a90b', fontSize:'0.75rem',
                               fontFamily:'Syne, sans-serif',
                               letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
