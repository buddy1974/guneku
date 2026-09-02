import { PageHero } from '@/components/layout/PageHero'
import Link from 'next/link'

export const metadata = {
  alternates: { canonical: '/gudeca/guyodeca' },
  description: "GUYODECA, the youth wing of GUDECA — bridge construction, football and community giving by the young people of Guneku.", title: 'GUYODECA — Youth Wing' }

export default function GuyodecaPage() {
  return (
    <main style={{ backgroundColor:'oklch(0.965 0.012 85)', minHeight:'100vh' }}>
      <PageHero
        label="YOUTH WING"
        title="GUYODECA"
        subtitle="Youth Development Association of Guneku — building the next generation."
      />
      <section style={{ maxWidth:'900px', margin:'0 auto', padding:'5rem 1.5rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(240px,100%), 1fr))',
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
              backgroundColor:'oklch(0.985 0.008 85)',
              border:'1px solid oklch(0.878 0.010 90)',
              padding:'2rem',
              borderTop:'3px solid oklch(0.320 0.060 158)',
            }}>
              <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>
                {item.icon}
              </div>
              <h3 style={{ fontFamily:'var(--font-sans)', fontWeight:700,
                           color:'oklch(0.245 0.022 150)', fontSize:'1.1rem',
                           margin:'0 0 0.75rem' }}>
                {item.title}
              </h3>
              <p style={{ color:'oklch(0.470 0.018 150)',
                          fontFamily:'Inter, sans-serif', fontSize:'0.9rem',
                          lineHeight:1.7, margin:0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        <Link href="/gudeca" style={{
          color:'oklch(0.320 0.060 158)', fontFamily:'var(--font-sans)',
          fontSize:'0.8rem', letterSpacing:'0.1em',
          textTransform:'uppercase', textDecoration:'none',
        }}>
          ← Back to GUDECA
        </Link>
      </section>
    </main>
  )
}
