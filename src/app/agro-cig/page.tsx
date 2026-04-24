import { PageHero } from '@/components/layout/PageHero'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'

export const metadata = { title: 'Agro CIG — Guneku Agricultural Initiative' }

export default function AgroCIGPage() {
  return (
    <main style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}>
      <PageHero
        label="LIVE INITIATIVE"
        title="GUNEKU AGRO CIG"
        subtitle="Launched April 5, 2026 — Ngong Quarter, Guneku. Phase 2 open until April 30, 2026."
      />
      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem' }}>

        {/* Live badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px',
                      backgroundColor:'rgba(139,30,45,0.2)',
                      border:'1px solid rgba(139,30,45,0.4)',
                      padding:'0.5rem 1rem', marginBottom:'3rem' }}>
          <span style={{ width:'8px', height:'8px', borderRadius:'50%',
                         backgroundColor:'#8B1E2D' }} />
          <span style={{ color:'#F5F2E9', fontFamily:'Syne, sans-serif',
                         fontSize:'0.75rem', letterSpacing:'0.15em',
                         textTransform:'uppercase' }}>
            Phase 2 Open — Register by April 30, 2026
          </span>
        </div>

        {/* Phase 1 results */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)',
                      gap:'1px', backgroundColor:'rgba(242,169,11,0.1)',
                      marginBottom:'4rem', border:'1px solid rgba(242,169,11,0.1)' }}
             className="grid-cols-1 md:grid-cols-3">
          {[
            { val:'12.5M', suffix:'FCFA', label:'Raised in Phase 1' },
            { val:'3',     suffix:'',     label:'Product lines' },
            { val:'Apr 5', suffix:'2026', label:'Launch date' },
          ].map(s => (
            <div key={s.label} style={{ padding:'2.5rem', textAlign:'center',
                                        backgroundColor:'#0C0C14' }}>
              <div style={{ fontFamily:'"Bebas Neue", sans-serif',
                            color:'#f2a90b', letterSpacing:'0.05em',
                            lineHeight:1 }}>
                <span style={{ fontSize:'3rem' }}>{s.val}</span>
                {s.suffix && <span style={{ fontSize:'1.5rem', marginLeft:'4px' }}>{s.suffix}</span>}
              </div>
              <div className="section-label" style={{ marginTop:'0.5rem' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem' }}
             className="grid-cols-1 md:grid-cols-2">
          <div>
            <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2rem',
                         color:'#F5F2E9', letterSpacing:'0.05em', margin:'0 0 1.5rem' }}>
              PHASE 2 — JOIN NOW
            </h3>
            <div style={{ display:'flex', flexDirection:'column',
                          gap:'0.75rem', marginBottom:'2rem' }}>
              {[
                { label:'Registration fee', value:'5,000 FCFA' },
                { label:'Share price',      value:'2,000 FCFA per share' },
                { label:'Minimum shares',   value:'5 shares' },
                { label:'Maximum shares',   value:'100 shares' },
                { label:'Deadline',         value:'April 30, 2026' },
                { label:'Location',         value:'Ngong Quarter, Guneku' },
                { label:'Contact',          value:'+237 673320716' },
              ].map(f => (
                <div key={f.label} style={{
                  display:'flex', justifyContent:'space-between',
                  padding:'0.75rem 1rem', backgroundColor:'#0C0C14',
                  borderLeft:'2px solid rgba(242,169,11,0.3)',
                }}>
                  <span style={{ color:'rgba(245,242,233,0.4)',
                                 fontFamily:'Syne, sans-serif', fontSize:'0.8rem',
                                 textTransform:'uppercase', letterSpacing:'0.08em' }}>
                    {f.label}
                  </span>
                  <span style={{ color:'#F5F2E9', fontFamily:'Inter, sans-serif',
                                 fontSize:'0.9rem', fontWeight:600 }}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2rem',
                         color:'#F5F2E9', letterSpacing:'0.05em', margin:'0 0 1rem' }}>
              PRODUCTS
            </h3>
            {[
              { icon:'🐔', name:'Poultry',  desc:'Healthy chicks (3-week old) available now' },
              { icon:'🐟', name:'Catfish',  desc:'Vitalis Fish Farm, Wumfi-Ku — reproduction active' },
              { icon:'🦩', name:'Ostrich',  desc:'Planned expansion — Phase 3' },
            ].map(p => (
              <div key={p.name} style={{
                display:'flex', gap:'1rem', alignItems:'flex-start',
                padding:'1rem', backgroundColor:'#0C0C14',
                borderLeft:'3px solid #8B1E2D',
                marginBottom:'0.5rem',
              }}>
                <span style={{ fontSize:'1.5rem' }}>{p.icon}</span>
                <div>
                  <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                                color:'#F5F2E9', fontSize:'0.95rem' }}>
                    {p.name}
                  </div>
                  <div style={{ color:'rgba(245,242,233,0.4)',
                                fontFamily:'Inter, sans-serif', fontSize:'0.8rem',
                                marginTop:'0.2rem' }}>
                    {p.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ImagePlaceholder label="Agro CIG Launch — April 5, 2026" aspectRatio="4/3" />
        </div>
      </section>
    </main>
  )
}
