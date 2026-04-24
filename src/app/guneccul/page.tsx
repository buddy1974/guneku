import { PageHero } from '@/components/layout/PageHero'

export const metadata = { title: 'GUNECCUL — Community Credit Union' }

export default function GuneccullPage() {
  return (
    <main style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}>
      <PageHero
        label="COMMUNITY FINANCE"
        title="GUNECCUL"
        subtitle="Guneku Cooperative Credit Union Limited — banking on our own future."
      />
      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem' }}>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem' }}
             className="grid-cols-1 md:grid-cols-2">
          <div>
            <p style={{ color:'rgba(245,242,233,0.6)', fontFamily:'Inter, sans-serif',
                        fontSize:'1rem', lineHeight:1.85, margin:'0 0 2rem' }}>
              GUNECCUL is a community-owned credit union serving Guneku indigenes
              at home and across the diaspora. Members save, borrow, and build wealth
              collectively — rooted in Guneku values of solidarity and mutual support.
            </p>

            <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                         color:'#F5F2E9', letterSpacing:'0.05em', margin:'0 0 1rem' }}>
              PRODUCTS
            </h3>
            {['Savings Accounts','Loans','Solidarity Fund Shares',
              'Membership (5,000 FCFA registration)'].map(p => (
              <div key={p} style={{
                display:'flex', alignItems:'center', gap:'12px',
                padding:'0.75rem 0',
                borderBottom:'1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%',
                               backgroundColor:'#f2a90b', flexShrink:0 }} />
                <span style={{ color:'rgba(245,242,233,0.7)',
                               fontFamily:'Inter, sans-serif', fontSize:'0.95rem' }}>
                  {p}
                </span>
              </div>
            ))}

            <div style={{ marginTop:'2rem' }}>
              <a href="https://wa.me/237675994599"
                 target="_blank" rel="noopener noreferrer"
                 style={{ backgroundColor:'#f2a90b', color:'#0F0F0F',
                           fontFamily:'Syne, sans-serif', fontWeight:700,
                           padding:'0.85rem 2rem', fontSize:'0.78rem',
                           letterSpacing:'0.12em', textTransform:'uppercase',
                           textDecoration:'none', display:'inline-block' }}>
                Contact on WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                         color:'#F5F2E9', letterSpacing:'0.05em', margin:'0 0 1.5rem' }}>
              BRANCHES
            </h3>
            {[
              { name:'Head Office',    location:'Guneku Village',      status:'Operational', date:'' },
              { name:'Home Branch',    location:"Guneku Fon's Palace",  status:'Operational', date:'April 15, 2023' },
              { name:'Douala Branch',  location:'Douala, Cameroon',    status:'Operational', date:'September 17, 2022' },
              { name:'Bamenda Branch', location:'Bamenda, Cameroon',   status:'Operational', date:'January 2025' },
            ].map(b => (
              <div key={b.name} style={{
                padding:'1.25rem', backgroundColor:'#0C0C14',
                borderLeft:'3px solid #8B1E2D',
                marginBottom:'0.75rem',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                              alignItems:'center', marginBottom:'0.3rem' }}>
                  <span style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                                 color:'#F5F2E9', fontSize:'0.95rem' }}>
                    {b.name}
                  </span>
                  <span style={{ backgroundColor:'rgba(139,30,45,0.2)',
                                 color:'#f2a90b', fontSize:'0.65rem',
                                 fontFamily:'Syne, sans-serif',
                                 letterSpacing:'0.1em', textTransform:'uppercase',
                                 padding:'0.2rem 0.5rem' }}>
                    {b.status}
                  </span>
                </div>
                <div style={{ color:'rgba(245,242,233,0.4)',
                              fontFamily:'Inter, sans-serif', fontSize:'0.8rem' }}>
                  {b.location}{b.date ? ` · Est. ${b.date}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
