import { PageHero } from '@/components/layout/PageHero'
import Link from 'next/link'

export const metadata = { title: 'GUYODECA — Youth Wing' }

export default function GuyodecaPage() {
  return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh' }}>
      <PageHero
        label="YOUTH WING"
        title="GUYODECA"
        subtitle="Youth Development Association of Guneku — building the next generation."
      />
      <section style={{ maxWidth:'900px', margin:'0 auto', padding:'5rem 1.5rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
                      gap:'2rem', marginBottom:'3rem' }}
             className="grid-cols-1 md:grid-cols-2">
          {[
            { icon:'🌉', title:'Bridge Construction',
              desc:'Infrastructure project completed for Guneku village, 2025.' },
            { icon:'⚽', title:'Sports & Community',
              desc:'GUYODECA vs GUDECA veterans football match — annual event.' },
            { icon:'🎁', title:'Women Appreciation',
              desc:'Gift-giving to Guneku women over 50: rice, Maggi, soap, clothes and flowers.' },
            { icon:'🔨', title:'Village Projects',
              desc:'Active participation in all community development initiatives.' },
          ].map(item => (
            <div key={item.title} style={{
              backgroundColor:'#0C0C14',
              border:'1px solid rgba(255,255,255,0.05)',
              padding:'2rem',
              borderTop:'3px solid #f2a90b',
            }}>
              <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>
                {item.icon}
              </div>
              <h3 style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                           color:'#F5F2E9', fontSize:'1.1rem',
                           margin:'0 0 0.75rem' }}>
                {item.title}
              </h3>
              <p style={{ color:'rgba(245,242,233,0.5)',
                          fontFamily:'Inter, sans-serif', fontSize:'0.9rem',
                          lineHeight:1.7, margin:0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        <Link href="/gudeca" style={{
          color:'#f2a90b', fontFamily:'Syne, sans-serif',
          fontSize:'0.8rem', letterSpacing:'0.1em',
          textTransform:'uppercase', textDecoration:'none',
        }}>
          ← Back to GUDECA
        </Link>
      </section>
    </main>
  )
}
