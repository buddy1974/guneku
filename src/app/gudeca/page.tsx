import { PageHero } from '@/components/layout/PageHero'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import Link from 'next/link'

export const metadata = {
  title: 'GUDECA — Guneku Cultural & Development Association',
  description: 'Mission, vision, and projects of GUDECA — uniting Guneku indigenes across three continents.',
}

export default function GudecaPage() {
  return (
    <main style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}>
      <PageHero
        label="GUDECA"
        title="GUNEKU CULTURAL & DEVELOPMENT ASSOCIATION"
        subtitle="Uniting Guneku indigenes across three continents in culture, development, and heritage."
      />

      {/* Mission */}
      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem',
                        display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem',
                        alignItems:'center' }}
               className="grid-cols-1 md:grid-cols-2">
        <div>
          <span className="section-label" style={{ marginBottom:'1rem', display:'block' }}>
            OUR MISSION
          </span>
          <div style={{ width:'40px', height:'3px',
                        backgroundColor:'#f2a90b', marginBottom:'1.5rem' }} />
          <h2 style={{ fontFamily:'"Bebas Neue", sans-serif',
                       fontSize:'2.5rem', color:'#F5F2E9',
                       letterSpacing:'0.05em', lineHeight:1.1,
                       margin:'0 0 1.5rem' }}>
            BUILDING GUNEKU — ONE PROJECT AT A TIME
          </h2>
          <p style={{ color:'rgba(245,242,233,0.6)', fontFamily:'Inter, sans-serif',
                      fontSize:'1rem', lineHeight:1.8, margin:'0 0 1.5rem' }}>
            GUDECA — the Guneku Cultural &amp; Development Association — is an
            elected committee with a 4-year mandate, ensuring at least 60%
            youth and female representation. It designs, plans, and implements
            community-based projects while preserving Guneku culture worldwide.
          </p>
          <p style={{ color:'rgba(245,242,233,0.5)', fontFamily:'Inter, sans-serif',
                      fontSize:'0.95rem', lineHeight:1.8, margin:'0 0 2rem' }}>
            At year&apos;s end, the committee produces an annual report presented
            to the community — the supreme decision-making body on all
            development matters in Guneku.
          </p>
          <Link href="/gudeca/gudeca-exco" style={{
            backgroundColor:'#f2a90b', color:'#0F0F0F',
            fontFamily:'Syne, sans-serif', fontWeight:700,
            padding:'0.85rem 2rem', fontSize:'0.78rem',
            letterSpacing:'0.12em', textTransform:'uppercase',
            textDecoration:'none', display:'inline-block',
            marginRight:'1rem',
          }}>
            Meet the EXCO
          </Link>
          <Link href="/gudeca/guyodeca" style={{
            border:'1px solid rgba(245,242,233,0.2)',
            color:'#F5F2E9', fontFamily:'Syne, sans-serif', fontWeight:700,
            padding:'0.85rem 2rem', fontSize:'0.78rem',
            letterSpacing:'0.12em', textTransform:'uppercase',
            textDecoration:'none', display:'inline-block',
          }}>
            GUYODECA (Youth)
          </Link>
        </div>
        <ImagePlaceholder label="GUDECA Assembly" aspectRatio="4/3" />
      </section>

      {/* ── GUDECA EU Meeting Intelligence ── */}
      <section style={{ backgroundColor:'#08080F',
                        borderTop:'1px solid rgba(255,255,255,0.05)',
                        padding:'5rem 1.5rem' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <span className="section-label" style={{ marginBottom:'0.5rem', display:'block' }}>
              LATEST MEETING
            </span>
            <h2 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2.5rem',
                         color:'#F5F2E9', letterSpacing:'0.05em', margin:'0 0 0.5rem' }}>
              GUDECA EU — BONN, 28 MARCH 2026
            </h2>
            <p style={{ color:'rgba(245,242,233,0.4)', fontFamily:'Inter, sans-serif',
                        fontSize:'0.9rem' }}>
              Fon&apos;s Palace, Bonn, Germany &middot;
              President: Ndenge Constantine &middot;
              Secretary General: Muyang Ela
            </p>
          </div>

          <div style={{ display:'grid',
                        gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',
                        gap:'1.5rem' }}>
            {[
              { icon:'☀️', title:'Solar Phase II', status:'ONGOING', statusColor:'#f2a90b',
                desc:'€800 raised so far. Members encouraged to increase contributions for full village electrification.' },
              { icon:'🌾', title:'Agro CIG', status:'ACTIVE', statusColor:'#4a7c59',
                desc:'Presented by Mr. Fabian. Share purchase at 2,000 FCFA. Members encouraged to subscribe.' },
              { icon:'🏥', title:'Medical Reference Centre', status:'PROPOSED', statusColor:'#8B1E2D',
                desc:'Plans to establish a reference healthcare centre in Guneku — independent of existing clinic.' },
              { icon:'🧼', title:'Soap Production', status:'PROPOSED', statusColor:'#8B1E2D',
                desc:'Income-generating soap production initiative for the Guneku community.' },
              { icon:'📡', title:'Satellite Internet — Palace', status:'PROPOSED', statusColor:'#8B1E2D',
                desc:'Install satellite internet at Guneku Palace for connectivity and digital services. Proposed by Ni Sam.' },
              { icon:'💻', title:'Digital Empowerment', status:'PROPOSED', statusColor:'#8B1E2D',
                desc:'Training for adults in content creation, virtual work, and online income generation.' },
            ].map(item => (
              <div key={item.title} style={{
                backgroundColor:'#0C0C14',
                border:'1px solid rgba(255,255,255,0.05)',
                borderTop:`3px solid ${item.statusColor}`,
                padding:'1.75rem',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                              alignItems:'flex-start', marginBottom:'0.75rem' }}>
                  <span style={{ fontSize:'1.75rem' }}>{item.icon}</span>
                  <span style={{
                    backgroundColor:`${item.statusColor}20`,
                    color: item.statusColor,
                    fontFamily:'Syne, sans-serif', fontSize:'0.6rem',
                    letterSpacing:'0.12em', textTransform:'uppercase',
                    padding:'0.2rem 0.6rem',
                    border:`1px solid ${item.statusColor}40`,
                  }}>
                    {item.status}
                  </span>
                </div>
                <h3 style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                             color:'#F5F2E9', fontSize:'1rem', margin:'0 0 0.6rem' }}>
                  {item.title}
                </h3>
                <p style={{ color:'rgba(245,242,233,0.45)', fontFamily:'Inter, sans-serif',
                            fontSize:'0.85rem', lineHeight:1.7, margin:0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop:'2.5rem', textAlign:'center',
                        color:'rgba(245,242,233,0.2)', fontFamily:'Inter, sans-serif',
                        fontSize:'0.82rem' }}>
            Next GUDECA EU Meeting &middot;
            <strong style={{ color:'rgba(245,242,233,0.4)' }}>
              {' '}Saturday 24 July 2027 &middot; United Kingdom
            </strong>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section style={{ backgroundColor:'#0A0A0A',
                        borderTop:'1px solid rgba(139,30,45,0.2)',
                        padding:'4rem 1.5rem' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <span className="section-label" style={{ marginBottom:'0.5rem', display:'block' }}>
              GLOBAL REACH
            </span>
            <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2.5rem',
                         color:'#F5F2E9', letterSpacing:'0.05em', margin:0 }}>
              GUDECA BRANCHES WORLDWIDE
            </h3>
          </div>
          <div style={{ display:'grid',
                        gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',
                        gap:'1rem' }}>
            {[
              { name:'GUDECA Europe',     location:'Belgium, Germany & beyond' },
              { name:'GUDECA USA',        location:'United States — Chapter active' },
              { name:'GUDECA UAE',        location:'Launched March 2023, Limbe' },
              { name:'GUDECA Worldwide',  location:'Global umbrella organisation' },
              { name:'GUDECA Douala',     location:'Launched September 2022' },
              { name:'GUDECA Bamenda',    location:'Operational from January 2025' },
              { name:'GUDECA Yaoundé',    location:'Active — fundraising events' },
              { name:'GUDECA West',       location:'Active branch' },
            ].map(b => (
              <div key={b.name} style={{
                backgroundColor:'#0C0C14',
                border:'1px solid rgba(255,255,255,0.05)',
                padding:'1.5rem',
                borderTop:'2px solid #8B1E2D',
              }}>
                <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                              color:'#F5F2E9', fontSize:'0.95rem',
                              marginBottom:'0.35rem' }}>
                  {b.name}
                </div>
                <div style={{ color:'rgba(245,242,233,0.35)',
                              fontFamily:'Inter, sans-serif', fontSize:'0.8rem' }}>
                  {b.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
