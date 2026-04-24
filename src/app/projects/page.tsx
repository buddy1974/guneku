import { PageHero } from '@/components/layout/PageHero'
import Link from 'next/link'

export const metadata = { title: 'Projects — Guneku Development' }

const PROJECTS: {
  id: string; status: string; statusColor: string;
  title: string; desc: string; year: number; href: string | null;
}[] = [
  {
    id: 'agro-cig',
    status: 'LIVE',
    statusColor: '#f2a90b',
    title: 'Guneku Agro CIG',
    desc: 'Community-owned agricultural enterprise. 12.5M FCFA raised. Poultry, catfish, ostrich.',
    year: 2026,
    href: '/agro-cig',
  },
  {
    id: 'guneccul',
    status: 'ACTIVE',
    statusColor: '#8B1E2D',
    title: 'GUNECCUL Credit Union',
    desc: 'Cooperative credit union with 4 branches across Cameroon.',
    year: 2022,
    href: '/guneccul',
  },
  {
    id: 'library',
    status: 'ACTIVE',
    statusColor: '#8B1E2D',
    title: 'Guneku Royal Community Library',
    desc: 'Solar-powered library. Computers, training programs, holiday classes.',
    year: 2021,
    href: null,
  },
  {
    id: 'hospital',
    status: 'ACTIVE',
    statusColor: '#8B1E2D',
    title: 'Open Door Hospital Eye Unit',
    desc: 'Fully operational eye unit serving Guneku and surrounding communities.',
    year: 2021,
    href: null,
  },
  {
    id: 'road',
    status: 'COMPLETED',
    statusColor: 'rgba(245,242,233,0.3)',
    title: 'Tonmukom–Windik Road',
    desc: 'Infrastructure project improving road access within Guneku village.',
    year: 2021,
    href: null,
  },
  {
    id: 'fringyeng',
    status: 'REBUILD NEEDED',
    statusColor: '#8B1E2D',
    title: 'Fringyeng Hydroelectric Plant',
    desc: 'Community power plant — burned by arson September 2022. Awaiting reconstruction.',
    year: 2022,
    href: null,
  },
  {
    id: 'scholarship',
    status: 'ANNUAL',
    statusColor: '#f2a90b',
    title: 'Afor Foundation Scholarship',
    desc: 'Annual competitive scholarship. 1,000,000 FCFA prize. Prof. Roland Forbang.',
    year: 2022,
    href: '/notables/roland-teboh-forbang',
  },
  {
    id: 'medical-reference',
    status: 'PROPOSED',
    statusColor: '#8B1E2D',
    title: 'Medical Reference Centre',
    desc: 'Proposed at GUDECA EU meeting March 2026. Plans to establish a dedicated reference healthcare centre in Guneku, independent of existing facilities.',
    year: 2026,
    href: null,
  },
  {
    id: 'soap-production',
    status: 'PROPOSED',
    statusColor: '#8B1E2D',
    title: 'Soap Production Initiative',
    desc: 'Community income-generating soap production. Proposed by GUDECA EU March 2026 as economic empowerment for Guneku residents.',
    year: 2026,
    href: null,
  },
  {
    id: 'satellite-internet',
    status: 'PROPOSED',
    statusColor: '#8B1E2D',
    title: 'Satellite Internet — Palace',
    desc: 'Install satellite internet at the Guneku Palace. Proposed by Ni Sam (GUDECA EU) to enable digital services and connectivity for the entire community.',
    year: 2026,
    href: null,
  },
  {
    id: 'digital-training',
    status: 'PROPOSED',
    statusColor: '#8B1E2D',
    title: 'Digital Empowerment Training',
    desc: 'Adult training programs in content creation, virtual work, and online income generation. Proposed by Ni Sam, GUDECA EU Digital Lead.',
    year: 2026,
    href: null,
  },
]

export default function ProjectsPage() {
  return (
    <main style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}>
      <PageHero
        label="DEVELOPMENT"
        title="GUNEKU PROJECTS"
        subtitle="Community-driven development — from cooperative farming to digital transformation. 11 active or completed · 4 proposed."
      />
      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem' }}>
        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))',
                      gap:'1.5rem' }}>
          {PROJECTS.map(p => {
            const card = (
              <div style={{
                backgroundColor:'#0C0C14',
                border:'1px solid rgba(255,255,255,0.05)',
                padding:'2rem', height:'100%',
                borderTop:`3px solid ${p.statusColor}`,
                display:'flex', flexDirection:'column',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                              alignItems:'flex-start', marginBottom:'1.25rem' }}>
                  <span style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                                 color:'#F5F2E9', fontSize:'1.05rem',
                                 lineHeight:1.3, flex:1, paddingRight:'1rem' }}>
                    {p.title}
                  </span>
                  <span style={{ backgroundColor:`${p.statusColor}20`,
                                 color: p.statusColor,
                                 fontSize:'0.6rem', fontFamily:'Syne, sans-serif',
                                 letterSpacing:'0.12em', textTransform:'uppercase',
                                 padding:'0.25rem 0.6rem', flexShrink:0,
                                 border:`1px solid ${p.statusColor}40` }}>
                    {p.status}
                  </span>
                </div>
                <p style={{ color:'rgba(245,242,233,0.45)',
                            fontFamily:'Inter, sans-serif', fontSize:'0.875rem',
                            lineHeight:1.7, margin:'0 0 auto' }}>
                  {p.desc}
                </p>
                <div style={{ marginTop:'1.5rem',
                              color:'rgba(245,242,233,0.2)',
                              fontFamily:'Syne, sans-serif', fontSize:'0.7rem',
                              letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  Est. {p.year}
                  {p.href && (
                    <span style={{ marginLeft:'1rem', color:'#f2a90b' }}>
                      Learn more →
                    </span>
                  )}
                </div>
              </div>
            )

            return p.href ? (
              <Link key={p.id} href={p.href}
                    style={{ textDecoration:'none', display:'block' }}
                    className="hover:scale-[1.01] transition-transform">
                {card}
              </Link>
            ) : (
              <div key={p.id}>
                {card}
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
