import { PageHero } from '@/components/layout/PageHero'
import guneccul from '@/data/institutions/guneccul.json'
import { pageMetadata } from '@/lib/seo'
import { PageGraph } from '@/components/seo/PageGraph'
import { GUNECCUL_ID, guneccullNode } from '@/lib/schema'

/* The branch list is read from the record rather than typed into this page.
 *
 * It used to be four branches written out here, and the description below said "four
 * branches" in words. When the record gained Mutengene and Bonaberi on 2026-09-16 this page
 * would have gone on publishing four of six, and the sentence would have gone on being
 * wrong — in a way nobody would notice until a villager in Mutengene came looking for their
 * own branch and concluded the Fondom did not know it existed. A count typed into prose goes
 * stale; this one is counted. */
type Branch = {
  name: string
  location: string
  status: string
  launched?: string
}

const BRANCHES = guneccul.branches as Branch[]

/** "September 17, 2022" from "2022-09-17", "January 2025" from "2025-01". A branch whose
 *  launch the record does not hold shows no date at all, rather than a month somebody
 *  reasoned their way to. */
function established(launched?: string): string {
  if (!launched) return ''
  const [year, month, day] = launched.split('-')
  if (!month) return year
  const name = new Date(Date.UTC(Number(year), Number(month) - 1, 1))
    .toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' })
  return day ? `${name} ${Number(day)}, ${year}` : `${name} ${year}`
}

/* Through pageMetadata like every other page. Hand-written, this one had a canonical and a
   description and no social card at all, so a link to the Fondom's credit union shared into
   a WhatsApp group — which is how most of this audience shares anything — arrived bare. */
export const metadata = pageMetadata({
  title: 'GUNECCUL — Community Credit Union',
  description:
    'GUNECCUL, the Guneku Cooperative Credit Union Limited — savings, loans and solidarity '
    + `shares for Guneku indigenes, across ${BRANCHES.length} branches.`,
  path: '/guneccul',
})

export default function GuneccullPage() {
  return (
    <main style={{ backgroundColor: 'oklch(0.965 0.012 85)', minHeight: '100vh' }}>
      {/* A credit union is where an invented fact would do real harm, so the node carries
          the name, what the record says it does, and the branches it records. No rate, no
          registration number, no opening hour, no telephone. */}
      <PageGraph
        path="/guneccul"
        name="GUNECCUL — Community Credit Union"
        description={guneccul.description}
        primaryEntity={GUNECCUL_ID}
        trail={[{ name: 'Development', path: '/projects' }]}
        nodes={[guneccullNode()]}
      />
      <PageHero
        label="COMMUNITY FINANCE"
        title="GUNECCUL"
        subtitle="Guneku Cooperative Credit Union Limited — banking on our own future."
      />
      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'3.5rem 1.5rem' }}>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p style={{ color:'oklch(0.470 0.018 150)', fontFamily:'Inter, sans-serif',
                        fontSize:'1rem', lineHeight:1.85, margin:'0 0 2rem' }}>
              GUNECCUL is a community-owned credit union serving Guneku indigenes
              at home and across the diaspora. Members save, borrow, and build wealth
              collectively — rooted in Guneku values of solidarity and mutual support.
            </p>

            <h2 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                         color:'oklch(0.245 0.022 150)', letterSpacing:'0.05em', margin:'0 0 1rem' }}>
              PRODUCTS
            </h2>
            {['Savings Accounts','Loans','Solidarity Fund Shares',
              'Membership (5,000 FCFA registration)'].map(p => (
              <div key={p} style={{
                display:'flex', alignItems:'center', gap:'12px',
                padding:'0.75rem 0',
                borderBottom:'1px solid oklch(0.878 0.010 90)',
              }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%',
                               backgroundColor:'oklch(0.320 0.060 158)', flexShrink:0 }} />
                <span style={{ color:'oklch(0.470 0.018 150)',
                               fontFamily:'Inter, sans-serif', fontSize:'0.95rem' }}>
                  {p}
                </span>
              </div>
            ))}

            <div style={{ marginTop:'2rem' }}>
              <a href="https://wa.me/237675994599"
                 target="_blank" rel="noopener noreferrer"
                 style={{ backgroundColor:'oklch(0.320 0.060 158)', color:'oklch(0.965 0.012 85)',
                           fontFamily:'var(--font-sans)', fontWeight:700,
                           padding:'0.85rem 2rem', fontSize:'0.78rem',
                           letterSpacing:'0.12em', textTransform:'uppercase',
                           textDecoration:'none', display:'inline-block' }}>
                Contact on WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h2 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                         color:'oklch(0.245 0.022 150)', letterSpacing:'0.05em', margin:'0 0 1.5rem' }}>
              BRANCHES
            </h2>
            {BRANCHES.map(b => (
              <div key={b.name} style={{
                padding:'1.25rem', backgroundColor:'oklch(0.985 0.008 85)',
                borderLeft:'3px solid oklch(0.320 0.060 158)',
                marginBottom:'0.75rem',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                              alignItems:'center', marginBottom:'0.3rem' }}>
                  <span style={{ fontFamily:'var(--font-sans)', fontWeight:700,
                                 color:'oklch(0.245 0.022 150)', fontSize:'0.95rem' }}>
                    {b.name}
                  </span>
                  <span style={{ backgroundColor:'oklch(0.320 0.060 158 / 0.10)',
                                 color:'oklch(0.320 0.060 158)', fontSize:'0.65rem',
                                 fontFamily:'var(--font-sans)',
                                 letterSpacing:'0.1em', textTransform:'uppercase',
                                 padding:'0.2rem 0.5rem' }}>
                    {b.status}
                  </span>
                </div>
                <div style={{ color:'oklch(0.560 0.016 150)',
                              fontFamily:'Inter, sans-serif', fontSize:'0.8rem' }}>
                  {b.location}{established(b.launched) ? ` · Est. ${established(b.launched)}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
