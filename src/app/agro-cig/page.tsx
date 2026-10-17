import Link               from 'next/link'
import { PageHero }       from '@/components/layout/PageHero'
import { Reveal }         from '@/components/ui/Reveal'
import cig               from '@/data/institutions/agro-cig.json'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Agro CIG — Guneku Agricultural Initiative 2026',
  description:
    'Guneku Agro CIG — registered 12 March 2026, launched 5 April at Ngong Quarter. '
    + 'Chickens, chicks, ducks, pigs and manure on offer; layers expected around December 2026.',
  path: '/agro-cig',
})

/* What the farm has, read from the record and dated by it. The labels say what the source
   establishes: something the CIG advertised on a date, something it expects, something an
   older record counted, or something only planned. None of them is a stock count. */
const ICONS: Record<string, string> = {
  Chickens: '🐔', 'Young chicks': '🐣', Layers: '🥚', Ducks: '🦆',
  Pigs: '🐖', Manure: '🌱', Turkeys: '🦃', Ostriches: '🦩',
}
const STATUS_LABEL: Record<string, string> = {
  advertised: 'ON OFFER', expected: 'EXPECTED', recorded: 'REPORTED', planned: 'PLANNED',
}

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
          <div className="font-cinzel text-foreground tracking-wide mb-1">MEMBERSHIP &amp; SHARES</div>
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
              { val:'500',   suf:'',     label:'Chicks recorded, April 2026' },
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

            {/* How the CIG is run. Offices, because the CIG's own communiques name the
                offices; the Delegate is the one holder the record names, and no other seat
                is filled with a name to make the list look complete. */}
            <h2 className="font-cinzel text-2xl text-foreground mb-4">HOW IT IS RUN</h2>
            <div className="card-royal p-5 mb-8">
              <p className="text-muted-foreground text-sm leading-relaxed">{cig.governance.note}</p>
              <div className="mt-4 space-y-3">
                {cig.governance.offices.map(o => (
                  <div key={o.office} className="border-t border-border/30 pt-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-cinzel text-foreground text-sm">{o.office}</span>
                      <span className="text-foreground text-sm font-medium">
                        {'holder' in o && o.holder ? o.holder : 'To be announced'}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{o.note}</p>
                  </div>
                ))}
                {cig.governance.bodies.map(b => (
                  <div key={b.name} className="border-t border-border/30 pt-3">
                    <span className="font-cinzel text-foreground text-sm">{b.name}</span>
                    <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{b.note}</p>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-xs mt-4 border-t border-border/30 pt-3">
                {cig.governance.rosterNote}
              </p>
            </div>

            {/* What the CIG announced it did, on the dates it announced it. Never a balance
                and never a present position — see the note the record carries. */}
            <h2 className="font-cinzel text-2xl text-foreground mb-4">WHAT HAS BEEN ANNOUNCED</h2>
            <div className="card-royal p-5 mb-8">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {cig.commercialActivity.note}
              </p>
              <div className="mt-4 space-y-3">
                {cig.commercialActivity.recorded.map(r => (
                  <div key={r.date} className="border-t border-border/30 pt-3">
                    <div className="text-muted-foreground text-xs tracking-widest">
                      {r.displayDate}
                    </div>
                    <p className="text-foreground text-sm mt-1 leading-relaxed">{r.activity}</p>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-xs mt-4 border-t border-border/30 pt-3">
                {cig.milestonesNote}
              </p>
            </div>

            {/* Livestock */}
            <h2 className="font-cinzel text-2xl text-foreground mb-4">LIVESTOCK</h2>
            <p className="text-muted-foreground text-xs mb-3 leading-relaxed">{cig.livestockNote}</p>
            {cig.livestock.map(p => {
              const live = p.status === 'advertised' || p.status === 'expected'
              return (
                <div key={p.animal} className="flex gap-3 items-start card-royal p-4 mb-2"
                     style={{ borderLeftWidth:'3px', borderLeftColor: live ? 'oklch(0.700 0.115 78)' : 'oklch(0.560 0.016 150)' }}>
                  <span className="text-xl shrink-0" aria-hidden="true">{ICONS[p.animal] ?? '•'}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className="font-cinzel text-foreground">{p.animal}</span>
                      <span className="text-[10px] tracking-widest font-cinzel"
                            style={{ color: live ? 'oklch(0.620 0.130 62)' : 'oklch(0.52 0.03 70)' }}>
                        {STATUS_LABEL[p.status] ?? p.status.toUpperCase()} · {p.asOf.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">{p.note}</p>
                  </div>
                </div>
              )
            })}

            {/* Farm progress */}
            <h2 className="font-cinzel text-2xl text-foreground mt-8 mb-1">FARM DEVELOPMENT</h2>
            <p className="text-muted-foreground text-xs mb-3">As reported at the launch in April 2026.</p>
            {PROGRESS.map(f => (
              <div key={f.item} className="flex gap-3 items-center py-2 border-b border-border/20">
                <span className="shrink-0">{f.icon}</span>
                <span className="text-muted-foreground text-sm">{f.item}</span>
              </div>
            ))}
          </div>

          {/* The latest from the farm: what the CIG itself put out most recently, with the
              order line it published and a link to the video it was published in. No
              photograph is shown because none has been supplied to the archive. */}
          <aside className="md:sticky md:top-28 self-start space-y-4">
            <div className="card-royal p-6 border-l-4" style={{ borderLeftColor: 'oklch(0.700 0.115 78)' }}>
              <div className="section-label">LATEST FROM THE FARM · 16 OCTOBER 2026</div>
              <p className="text-foreground text-sm mt-3 leading-relaxed">
                Our farm now offers chickens for occasions, young chicks, ducks, pigs and manure,
                as the CIG&rsquo;s manager, a professional veterinarian, showed on 16 October. Layers
                are expected to start laying around December 2026.
              </p>
              <div className="mt-5 border-t border-border/30 pt-4">
                <div className="text-muted-foreground text-xs tracking-widest">ENQUIRIES AND ORDERS</div>
                <a href={`tel:${cig.orders.tel}`}
                   className="mt-1 inline-block font-cinzel text-2xl text-foreground no-underline hover:underline">
                  {cig.orders.display}
                </a>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{cig.orders.source}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link href="/updates/guneku-agro-cig-offerings-october-2026" className="text-primary no-underline hover:underline py-1">
                  Read the update →
                </Link>
                {cig.videos.map(v => (
                  <a key={v.url} href={v.url} target="_blank" rel="noopener noreferrer"
                     className="text-primary no-underline hover:underline py-1">
                    Watch on Facebook ({v.publisher}) ↗
                  </a>
                ))}
              </div>
            </div>
            <div className="card-royal p-5 text-center pattern-royal">
              <div className="text-4xl mb-1" aria-hidden="true">🌾</div>
              <div className="section-label">LAUNCHED 5 APRIL 2026 · NGONG QUARTER</div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
