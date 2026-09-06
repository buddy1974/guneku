import { PageHero }       from '@/components/layout/PageHero'
import { Reveal }         from '@/components/ui/Reveal'
import cig               from '@/data/institutions/agro-cig.json'

export const metadata = {
  alternates: { canonical: '/agro-cig' },
  title:       'Agro CIG — Guneku Agricultural Initiative 2026',
  description: 'Guneku Agro CIG — registered 12 March 2026, launched 5 April at Ngong Quarter. 12.5M FCFA raised in Phase 1, 500 chicks, turkeys from Nigeria.',
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
                subtitle="Launched 5 April 2026 — Ngong Quarter, Guneku. Registered 12 March 2026." />

      <section className="max-w-7xl mx-auto px-6 py-20">

        {/* Membership pricing — the full documented record, in the order issued */}
        <div className="card-royal border-l-4 p-5 mb-8" style={{ borderLeftColor: 'oklch(0.700 0.115 78)' }}>
          <div className="font-cinzel text-foreground tracking-wide mb-1">MEMBERSHIP &amp; SHARES — THE RECORD</div>
          <p className="text-muted-foreground text-sm">{cig.membershipPricing.note}</p>
          <div className="mt-4 space-y-3">
            {cig.membershipPricing.timeline.map(t => (
              <div key={t.ref} className="border-t border-border/30 pt-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-cinzel text-foreground text-sm">{t.ref}</span>
                  <span className="text-muted-foreground text-xs tracking-widest">{t.displayDate}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span className="text-foreground">Registration: <strong>{t.registrationFee}</strong></span>
                  <span className="text-foreground">Shares: <strong>{t.sharePrice}</strong></span>
                  <span className="text-muted-foreground">{t.shares}</span>
                </div>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{t.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs mt-4 border-t border-border/30 pt-3">
            {cig.membershipPricing.paymentRoute} {cig.membershipPricing.confirmation}
          </p>
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
            <h2 className="font-cinzel text-2xl text-foreground mb-6">THE ENTERPRISE</h2>
            <div className="space-y-2 mb-8">
              {[
                { l:'Registered name', v:cig.registration.registeredName },
                { l:'Registered',      v:'12 March 2026' },
                { l:'Registered at',   v:'Bamenda' },
                { l:'Launched',        v:'5 April 2026' },
                { l:'Location',        v:'Ngong Quarter, Guneku' },
                { l:'Raised in Phase 1',v:'12.5 million FCFA' },
                { l:'Minimum shares',  v:'5 shares' },
                { l:'Maximum shares',  v:'100 shares' },
                { l:'Payments',        v:'GUNECCUL account 200637' },
                { l:'Delegate',        v:'Fah Elvis Tayong' },
              ].map(f => (
                <div key={f.l} className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground text-sm tracking-wide">{f.l}</span>
                  <span className="text-foreground text-sm font-medium">{f.v}</span>
                </div>
              ))}
            </div>

            {/* Registration detail read from the certificate itself. The certificate
                number and the certificate image are withheld until the digits have
                been checked against the original. */}
            <div className="card-royal p-5 mb-8">
              <div className="section-label mb-3">REGISTRATION</div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Registered as <strong className="text-foreground">{cig.registration.registeredName}</strong>,
                head office {cig.registration.location}, on {cig.registration.displayDate} at {cig.registration.issuedAt}.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mt-3">
                Issued by the {cig.registration.issuingAuthority}, under {cig.registration.legalBasis}.
              </p>
            </div>

            {/* Livestock */}
            <h2 className="font-cinzel text-2xl text-foreground mb-4">LIVESTOCK</h2>
            {LIVESTOCK.map(p => (
              <div key={p.name} className="flex gap-3 items-start card-royal p-4 mb-2"
                   style={{ borderLeftWidth:'3px', borderLeftColor: p.status === 'ACTIVE' ? 'oklch(0.700 0.115 78)' : 'oklch(0.560 0.016 150)' }}>
                <span className="text-xl shrink-0">{p.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-cinzel text-foreground">{p.name}</span>
                    <span className="text-[10px] tracking-widest font-cinzel"
                          style={{ color: p.status === 'ACTIVE' ? 'oklch(0.700 0.115 78)' : 'oklch(0.72 0.04 70)' }}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">{p.desc}</p>
                </div>
              </div>
            ))}

            {/* Farm progress */}
            <h2 className="font-cinzel text-2xl text-foreground mt-8 mb-4">FARM DEVELOPMENT</h2>
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
