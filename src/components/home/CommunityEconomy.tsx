import Link from 'next/link'
import guneccul from '@/data/institutions/guneccul.json'

type Branch = { name: string; location: string; status?: string; launched?: string }

/* GUNECCUL on the front page as what it is — a community-owned institution, not a
   product advert. Everything shown is from the existing record.

   The record also carries a WhatsApp contact number. It is deliberately not rendered:
   those digits match a personal mobile recorded against a named officer (risk R-001),
   and nothing on this page should widen its circulation. */
export function CommunityEconomy() {
  const branches = (guneccul.branches || []) as Branch[]
  const products = (guneccul.products || []) as string[]
  const operational = branches.filter(b => b.status === 'operational').length

  return (
    <section className="inst-alt inst-rule border-b border-[var(--rule)]" aria-labelledby="economy-heading">
      <div className="inst-wrap inst-sec">
        <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          <div>
            <p className="inst-eyebrow">Community economy</p>
            <h2 id="economy-heading" className="inst-h2 mt-1.5">{guneccul.name}</h2>
            <div className="mt-3 flex items-center gap-2" aria-hidden>
              <span className="block h-0.5 w-9 bg-[var(--royal-green)]" />
              <span className="block h-0.5 w-4 bg-[var(--oxblood)]" />
            </div>
            <p className="inst-body mt-4 max-w-2xl">{guneccul.communityRole || guneccul.description}</p>
            {guneccul.patron && (
              <p className="inst-meta mt-3">
                {guneccul.patronRole || 'Patron'}: {guneccul.patron}
              </p>
            )}
            <Link href="/guneccul" className="inst-btn inst-btn-quiet mt-5">About GUNECCUL</Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 lg:justify-self-end">
            <div className="inst-card p-5">
              <p className="inst-tag">What it offers</p>
              <ul className="mt-2 list-none space-y-1.5 p-0">
                {products.map(p => (
                  <li key={p} className="inst-body !text-[0.88rem] relative pl-4">
                    <span className="absolute left-0 top-[0.62rem] block h-1 w-1 rounded-full bg-[var(--royal-green)]" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {branches.length > 0 && (
              <div className="inst-card p-5">
                <p className="inst-tag">Where it operates</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-[1.7rem] font-bold leading-none text-[var(--oxblood)]">
                  {operational || branches.length}
                </p>
                <p className="inst-meta mt-1.5">
                  {operational ? 'operational branches' : 'recorded branches'}
                </p>
                <ul className="mt-3 list-none space-y-1 p-0">
                  {branches.map(b => (
                    <li key={b.name} className="inst-meta">
                      {b.name} — {b.location}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
