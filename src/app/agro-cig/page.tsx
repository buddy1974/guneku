import { PageHero }       from '@/components/layout/PageHero'
import { Reveal }         from '@/components/ui/Reveal'

export const metadata = {
  title:       'Agro CIG — Guneku Agricultural Initiative 2026',
  description: 'Join the Guneku Agro CIG — 12.5M FCFA raised, 500 chicks, turkeys from Nigeria. Phase 2 open now.',
}

const LIVESTOCK = [
  { icon:'🐔', name:'Poultry',   status:'ACTIVE',  desc:'500 chicks — 300 thriving + 200 arriving. Core product.' },
  { icon:'🦃', name:'Turkeys',   status:'ACTIVE',  desc:'Successfully imported from Nigeria. Now at the farm.' },
  { icon:'🐷', name:'Pigs',      status:'PLANNED', desc:'Multi-animal farming strategy — next phase.' },
  { icon:'🦩', name:'Ostriches', status:'PLANNED', desc:'Planned for expansion, attraction, and tourism value.' },
]

const PROGRESS = [
  { icon:'✅', item:'Land bulldozed and prepared' },
  { icon:'✅', item:'Stone gathering for construction' },
  { icon:'🔄', item:'Structural and architectural planning' },
  { icon:'🔄', item:'Feed production systems development' },
  { icon:'🔄', item:'Machinery identification' },
]

export default function AgroCIGPage() {
  return (
    <main className="min-h-screen bg-background">
      <PageHero label="LIVE INITIATIVE" title="GUNEKU AGRO CIG"
                subtitle="Launched April 5, 2026 — Ngong Quarter, Guneku. Phase 2 open until April 30, 2026." />

      <section className="max-w-7xl mx-auto px-6 py-20">

        {/* Phase 3 urgency */}
        <div className="card-royal border-l-4 p-5 mb-8 flex gap-4 items-start" style={{ borderLeftColor: 'oklch(0.42 0.22 25)' }}>
          <span className="text-2xl shrink-0">⚠️</span>
          <div>
            <div className="font-cinzel text-foreground tracking-wide mb-1">PHASE 3 STARTS 1 MAY 2026 — SHARE PRICE RISES TO 5,000 FCFA</div>
            <div className="text-muted-foreground text-sm">Current price: 2,000 FCFA per share. Join Phase 2 now before the increase.</div>
          </div>
        </div>

        {/* Stats */}
        <Reveal>
          <div className="grid md:grid-cols-3 gap-px bg-border/30 rounded-2xl overflow-hidden mb-12">
            {[
              { val:'12.5M', suf:'FCFA', label:'Raised in Phase 1' },
              { val:'500',   suf:'',     label:'Chicks at the farm' },
              { val:'Apr 5', suf:'2026', label:'Launch date' },
            ].map(s => (
              <div key={s.label} className="bg-card p-8 text-center">
                <div className="font-cinzel text-gold-gradient" style={{ fontSize:'2.5rem' }}>
                  {s.val}{s.suf && <span style={{ fontSize:'1.5rem' }}> {s.suf}</span>}
                </div>
                <div className="section-label text-[0.65rem] mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            {/* Phase 2 info */}
            <h3 className="font-cinzel text-2xl text-foreground mb-6">PHASE 2 — JOIN NOW</h3>
            <div className="space-y-2 mb-8">
              {[
                { l:'Registration fee', v:'5,000 FCFA' },
                { l:'Share price',      v:'2,000 FCFA per share' },
                { l:'Minimum shares',   v:'5 shares' },
                { l:'Maximum shares',   v:'100 shares' },
                { l:'Deadline',         v:'April 30, 2026' },
                { l:'Phase 3 price',    v:'5,000 FCFA (from May 1)' },
                { l:'Location',         v:'Ngong Quarter, Guneku' },
                { l:'Contact',          v:'+237 673320716' },
              ].map(f => (
                <div key={f.l} className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground text-sm tracking-wide">{f.l}</span>
                  <span className="text-foreground text-sm font-medium">{f.v}</span>
                </div>
              ))}
            </div>

            {/* Livestock */}
            <h3 className="font-cinzel text-2xl text-foreground mb-4">LIVESTOCK</h3>
            {LIVESTOCK.map(p => (
              <div key={p.name} className="flex gap-3 items-start card-royal p-4 mb-2"
                   style={{ borderLeftWidth:'3px', borderLeftColor: p.status === 'ACTIVE' ? 'oklch(0.82 0.17 80)' : 'oklch(0.42 0.22 25)' }}>
                <span className="text-xl shrink-0">{p.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-cinzel text-foreground">{p.name}</span>
                    <span className="text-[10px] tracking-widest font-cinzel"
                          style={{ color: p.status === 'ACTIVE' ? 'oklch(0.82 0.17 80)' : 'oklch(0.72 0.04 70)' }}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">{p.desc}</p>
                </div>
              </div>
            ))}

            {/* Farm progress */}
            <h3 className="font-cinzel text-2xl text-foreground mt-8 mb-4">FARM DEVELOPMENT</h3>
            {PROGRESS.map(f => (
              <div key={f.item} className="flex gap-3 items-center py-2 border-b border-border/20">
                <span className="shrink-0">{f.icon}</span>
                <span className="text-muted-foreground text-sm">{f.item}</span>
              </div>
            ))}
          </div>

          {/* Placeholder image */}
          <div className="card-royal overflow-hidden aspect-[4/3] flex items-center justify-center pattern-royal">
            <div className="text-center">
              <div className="text-5xl mb-2">🌾</div>
              <div className="section-label">AGRO CIG LAUNCH — APRIL 5, 2026</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
