import { PageHero } from '@/components/layout/PageHero'
import Link from 'next/link'

export const metadata = { title: 'Diaspora — Indigenes Worldwide' }

const COUNTRIES = [
  { flag:'🇨🇲', name:'Cameroon',  org:'Home community' },
  { flag:'🇩🇪', name:'Germany',   org:"GUDECA Europe · Fon's residence" },
  { flag:'🇺🇸', name:'USA',       org:'GUDECA US Chapter — NJ, MA, TX, OH' },
  { flag:'🇦🇪', name:'UAE',       org:'GUDECA UAE — launched 2023' },
  { flag:'🇧🇪', name:'Belgium',   org:'GUDECA Europe' },
  { flag:'🇬🇧', name:'UK',        org:'Active members' },
  { flag:'🇮🇹', name:'Italy',     org:'Active members' },
  { flag:'🇸🇪', name:'Sweden',    org:'Active members' },
  { flag:'🇳🇬', name:'Nigeria',   org:'Active members' },
  { flag:'🇨🇳', name:'China',     org:'Active members' },
  { flag:'🇯🇵', name:'Japan',     org:'Active members' },
  { flag:'🇶🇦', name:'Qatar',     org:'Active members' },
]

export default function DiasporaPage() {
  return (
    <main style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}>
      <PageHero
        label="DIASPORA"
        title="GUNEKU IS EVERYWHERE"
        subtitle="From the Ruhr Valley to New Jersey — one people, one heritage, no borders."
      />
      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem' }}>

        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',
                      gap:'1rem', marginBottom:'5rem' }}>
          {COUNTRIES.map(c => (
            <div key={c.name} style={{
              backgroundColor:'#0C0C14',
              border:'1px solid rgba(255,255,255,0.05)',
              padding:'1.5rem',
              display:'flex', alignItems:'center', gap:'1rem',
              borderLeft:'3px solid #8B1E2D',
            }}>
              <span style={{ fontSize:'2rem' }}>{c.flag}</span>
              <div>
                <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                              color:'#F5F2E9', fontSize:'0.95rem' }}>
                  {c.name}
                </div>
                <div style={{ color:'rgba(245,242,233,0.35)',
                              fontFamily:'Inter, sans-serif', fontSize:'0.78rem',
                              marginTop:'0.2rem' }}>
                  {c.org}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notables */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)',
                      paddingTop:'4rem' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <span className="section-label" style={{ marginBottom:'0.5rem', display:'block' }}>
              NOTABLE SONS &amp; DAUGHTERS
            </span>
            <h2 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2.5rem',
                         color:'#F5F2E9', letterSpacing:'0.05em', margin:0 }}>
              GUNEKU EXCELLENCE WORLDWIDE
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
                        gap:'1.5rem' }}
               className="grid-cols-1 md:grid-cols-2">
            {[
              { name:'Prof. Dr. Roland Teboh Forbang',
                role:'Associate Professor & Cancer Specialist',
                location:'New Jersey, USA',
                link:'/notables/roland-teboh-forbang' },
              { name:'Marcel Tabit Akwe',
                role:'Software Developer & AI Automation',
                location:'Essen, Germany',
                link:'/notables/marcel-tabit-akwe' },
            ].map(n => (
              <Link key={n.name} href={n.link}
                    style={{ textDecoration:'none', display:'block',
                             backgroundColor:'#0C0C14',
                             border:'1px solid rgba(255,255,255,0.05)',
                             padding:'2rem' }}
                    className="hover:border-[rgba(242,169,11,0.25)] transition-colors">
                <div style={{ width:'24px', height:'2px',
                              backgroundColor:'#f2a90b', marginBottom:'1rem' }} />
                <h3 style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                             color:'#F5F2E9', fontSize:'1.1rem',
                             margin:'0 0 0.5rem' }}>
                  {n.name}
                </h3>
                <p style={{ color:'rgba(245,242,233,0.4)',
                            fontFamily:'Inter, sans-serif', fontSize:'0.85rem',
                            margin:'0 0 1rem' }}>
                  {n.role}
                </p>
                <span style={{ color:'rgba(245,242,233,0.25)',
                               fontFamily:'Syne, sans-serif', fontSize:'0.7rem',
                               letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  {n.location}
                </span>
                <div style={{ marginTop:'1rem', color:'#f2a90b',
                              fontFamily:'Syne, sans-serif', fontSize:'0.75rem',
                              letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  Full profile →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
