import { PageHero } from '@/components/layout/PageHero'
import { Reveal }   from '@/components/ui/Reveal'
import Link         from 'next/link'

export const metadata = { title: 'Projects — Guneku Development' }

const PROJECTS: { id:string; status:string; statusColor:string; title:string; desc:string; year:number; href:string|null }[] = [
  { id:'agro-cig',         status:'LIVE',          statusColor:'oklch(0.82 0.17 80)', title:'Guneku Agro CIG',             desc:'Community-owned agricultural enterprise. 12.5M FCFA raised. Poultry, turkeys, catfish, ostrich planned.',   year:2026, href:'/agro-cig' },
  { id:'guneccul',         status:'ACTIVE',         statusColor:'oklch(0.55 0.18 145)',title:'GUNECCUL Credit Union',       desc:'Cooperative credit union with 4 branches across Cameroon.',                                              year:2022, href:'/guneccul' },
  { id:'library',          status:'ACTIVE',         statusColor:'oklch(0.55 0.18 145)',title:'Guneku Royal Community Library',desc:'Solar-powered library. Computers, training programs, holiday classes.',                               year:2021, href:null },
  { id:'hospital',         status:'ACTIVE',         statusColor:'oklch(0.55 0.18 145)',title:'Open Door Hospital Eye Unit', desc:'Fully operational eye unit serving Guneku and surrounding communities.',                                 year:2021, href:null },
  { id:'road',             status:'COMPLETED',      statusColor:'oklch(0.72 0.04 70)', title:'Tonmukom–Windik Road',        desc:'Infrastructure project improving road access within Guneku village.',                                    year:2021, href:null },
  { id:'fringyeng',        status:'REBUILD NEEDED', statusColor:'oklch(0.42 0.22 25)', title:'Fringyeng Hydroelectric Plant',desc:'Community power plant — burned by arson September 2022. Awaiting reconstruction.',                      year:2022, href:null },
  { id:'scholarship',      status:'ANNUAL',         statusColor:'oklch(0.82 0.17 80)', title:'Afor Foundation Scholarship', desc:'Annual competitive scholarship. 1,000,000 FCFA prize. Prof. Roland Forbang.',                           year:2022, href:'/notables/roland-teboh-forbang' },
  { id:'medical-reference',status:'PROPOSED',       statusColor:'oklch(0.42 0.22 25)', title:'Medical Reference Centre',   desc:'Proposed at GUDECA EU March 2026. Plans to establish a dedicated reference healthcare centre in Guneku.',  year:2026, href:null },
  { id:'soap-production',  status:'PROPOSED',       statusColor:'oklch(0.42 0.22 25)', title:'Soap Production Initiative', desc:'Community income-generating soap production. Proposed by GUDECA EU as economic empowerment.',               year:2026, href:null },
  { id:'satellite-internet',status:'PROPOSED',      statusColor:'oklch(0.42 0.22 25)', title:'Satellite Internet — Palace',desc:'Install satellite internet at the Guneku Palace. Proposed by Ni Sam (GUDECA EU).',                       year:2026, href:null },
  { id:'digital-training', status:'PROPOSED',       statusColor:'oklch(0.42 0.22 25)', title:'Digital Empowerment Training',desc:'Adult training in content creation, virtual work, and online income generation. Proposed by Ni Sam.',     year:2026, href:null },
]

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-background">
      <PageHero label="DEVELOPMENT" title="GUNEKU PROJECTS"
                subtitle="Community-driven development — from cooperative farming to digital transformation. 11 active · 4 proposed." />
      <Reveal>
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid gap-4 md:grid-cols-3">
            {PROJECTS.map(p => {
              const card = (
                <div className="card-royal p-6 flex flex-col h-full"
                     style={{ borderTopWidth:'3px', borderTopColor: p.statusColor }}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-cinzel text-foreground text-lg leading-snug flex-1 pr-3">{p.title}</h3>
                    <span className="text-[10px] tracking-widest font-cinzel px-2 py-0.5 shrink-0 rounded-full"
                          style={{ color: p.statusColor, background: `${p.statusColor.replace(')','')} / 0.1)` }}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">{p.desc}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-muted-foreground/40 text-xs tracking-widest">Est. {p.year}</span>
                    {p.href && <span className="text-primary text-xs tracking-widest">Learn more →</span>}
                  </div>
                </div>
              )
              return p.href ? (
                <Link key={p.id} href={p.href} className="block no-underline hover:scale-[1.01] transition-transform">{card}</Link>
              ) : (
                <div key={p.id}>{card}</div>
              )
            })}
          </div>
        </section>
      </Reveal>
    </main>
  )
}
