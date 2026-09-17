import { getFonProfile } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import Image from 'next/image'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'HRH Dr. Fomuki Walters Ticha IX — Fon of Guneku',
  description:
    'Official profile of HRH Dr. Fomuki Walters Ticha IX, Fon of Guneku Fondom and '
    + 'urologist based in Germany.',
  path: '/palace/fon-walters-profile',
})

/* "2015-02-27" -> "27 February 2015". The record keeps the date in ISO; the page is the only
   place that has an opinion about how it reads. Anything that is not a plain ISO date is
   handed back untouched rather than guessed at. */
function longDate(iso: unknown): string | null {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December']
  return `${d} ${months[m - 1]} ${y}`
}

export default function FonProfilePage() {
  const fon = getFonProfile()

  return (
    <main style={{ backgroundColor:'oklch(0.965 0.012 85)', minHeight:'100vh' }}>
      <PageHero
        label="THE REIGNING FON"
        title="HRH DR. FOMUKI WALTERS TICHA IX"
        subtitle="Fon of Guneku Fondom · Physician · Visionary"
      />

      {/* ── Profile split ── */}
      <section style={{ maxWidth:'1200px', margin:'0 auto',
                        padding:'5rem 1.5rem', display:'grid',
                        gridTemplateColumns:'1fr', gap:'4rem' }}
               className="grid-cols-1 md:grid-cols-[2fr_1fr]">

        <div>
          {/* Quote */}
          <blockquote style={{
            borderLeft: '3px solid oklch(0.320 0.060 158)',
            paddingLeft: '1.5rem',
            margin: '0 0 3rem',
          }}>
            <p style={{ fontFamily:'Playfair Display, serif', fontStyle:'italic',
                        fontSize:'1.3rem', color:'oklch(0.320 0.060 158)', lineHeight:1.6,
                        margin:'0 0 0.5rem' }}>
              &ldquo;{fon?.quote || 'We carry Guneku in our hearts wherever we are in the world.'}&rdquo;
            </p>
          </blockquote>

          {/* Narrative */}
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1.05rem',
                      color:'oklch(0.470 0.018 150)', lineHeight:1.85,
                      margin:'0 0 2rem' }}>
            {fon?.enthronementNarrative}
          </p>

          {/* Governance style */}
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:'1rem',
                      color:'oklch(0.470 0.018 150)', lineHeight:1.8,
                      margin:'0 0 3rem' }}>
            {fon?.governanceStyle}
          </p>

          {/* Education */}
          <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                       color:'oklch(0.245 0.022 150)', letterSpacing:'0.05em',
                       margin:'0 0 1.5rem' }}>
            EDUCATION
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem',
                        marginBottom:'3rem' }}>
            {(fon?.education || []).map((e, i) => (
              <div key={i} style={{
                display:'flex', gap:'1rem', alignItems:'flex-start',
                padding:'0.75rem 1rem',
                backgroundColor:'oklch(0.985 0.008 85)',
                borderLeft:'2px solid rgba(242,169,11,0.3)',
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ color:'oklch(0.245 0.022 150)', fontFamily:'var(--font-sans)',
                                fontWeight:600, fontSize:'0.9rem' }}>
                    {e.degree}
                  </div>
                  <div style={{ color:'oklch(0.560 0.016 150)',
                                fontFamily:'Inter, sans-serif', fontSize:'0.8rem',
                                marginTop:'0.2rem' }}>
                    {e.institution} · {e.country}
                    {e.year ? ` · ${e.year}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Initiatives */}
          <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.8rem',
                       color:'oklch(0.245 0.022 150)', letterSpacing:'0.05em',
                       margin:'0 0 1.5rem' }}>
            INITIATIVES
          </h3>
          <div style={{ display:'grid',
                        gridTemplateColumns:'repeat(auto-fill, minmax(min(280px,100%), 1fr))',
                        gap:'1rem', marginBottom:'3rem' }}>
            {(fon?.initiatives || []).map((item, i) => (
              <div key={i} style={{
                backgroundColor:'oklch(0.985 0.008 85)',
                border:'1px solid oklch(0.878 0.010 90)',
                padding:'1.25rem',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                              alignItems:'flex-start', marginBottom:'0.5rem' }}>
                  <span style={{ fontFamily:'var(--font-sans)', fontWeight:700,
                                 color:'oklch(0.245 0.022 150)', fontSize:'0.95rem' }}>
                    {item.name}
                  </span>
                  <span style={{ backgroundColor:'oklch(0.320 0.060 158 / 0.10)',
                                 color:'oklch(0.320 0.060 158)', fontSize:'0.65rem',
                                 fontFamily:'var(--font-sans)',
                                 letterSpacing:'0.1em', textTransform:'uppercase',
                                 /* The badge refused to shrink, so on a 320px screen the
                                    longest role here — "Patron and Founder-sponsor" — held
                                    its full 191px beside the name and pushed the row, and
                                    the page with it, 6px past the edge. Letting it give way
                                    costs nothing at any width where it already fitted:
                                    measured identical at 390px and on the desktop, where
                                    there is room and it does not shrink. Where there is not,
                                    it takes a second line inside its own badge and stays
                                    where the design puts it, beside the name. */
                                 padding:'0.2rem 0.5rem' }}>
                    {item.role}
                  </span>
                </div>
                <p style={{ color:'oklch(0.560 0.016 150)',
                            fontFamily:'Inter, sans-serif', fontSize:'0.8rem',
                            lineHeight:1.6, margin:0 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
          {/* The Fon's portrait, and the placeholder for as long as no record holds one. */}
          {fon?.heroImage ? (
            <div style={{ position:'relative', aspectRatio:'3/4', overflow:'hidden' }}>
              <Image src={fon.heroImage}
                     alt={fon.heroImageAlt || fon?.title || 'The Fon of Guneku'}
                     fill unoptimized sizes="(max-width: 768px) 100vw, 320px"
                     style={{ objectFit:'cover' }} />
            </div>
          ) : (
            <ImagePlaceholder label="Portrait" aspectRatio="3/4" />
          )}

          {/* Quick facts */}
          <div style={{ backgroundColor:'oklch(0.985 0.008 85)',
                        border:'1px solid oklch(0.878 0.010 90)',
                        padding:'1.5rem' }}>
            <h4 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.2rem',
                         color:'oklch(0.320 0.060 158)', letterSpacing:'0.1em',
                         margin:'0 0 1rem' }}>
              QUICK FACTS
            </h4>
            {[
              /* The succession ran as distinct stages. There is no single coronation
                 date on the record: the value formerly shown here has no source. */
              { label:'Anointed', value: longDate(fon?.enthronementDate) || '27 February 2015' },
              { label:'Presented to Meta', value: '30 December 2016' },
              { label:'Title', value: fon?.fonNumber ? `Fomuki ${fon.fonNumber}` : 'Fomuki IX' },
              { label:'Predecessor', value: fon?.predecessorName || 'HRH Fomuki Patrick Nji' },
              { label:'Website', value: 'waltersfomuki.de' },
            ].map(f => (
              <div key={f.label} style={{
                display:'flex', justifyContent:'space-between',
                padding:'0.5rem 0',
                borderBottom:'1px solid oklch(0.878 0.010 90)',
              }}>
                <span style={{ color:'oklch(0.560 0.016 150)',
                               fontFamily:'var(--font-sans)', fontSize:'0.75rem',
                               textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  {f.label}
                </span>
                <span style={{ color:'oklch(0.245 0.022 150)', fontFamily:'Inter, sans-serif',
                               fontSize:'0.85rem' }}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          {/* Professional memberships */}
          <div style={{ backgroundColor:'oklch(0.985 0.008 85)',
                        border:'1px solid oklch(0.878 0.010 90)',
                        padding:'1.5rem' }}>
            <h4 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.2rem',
                         color:'oklch(0.245 0.022 150)', letterSpacing:'0.1em',
                         margin:'0 0 1rem' }}>
              MEMBERSHIPS
            </h4>
            {(fon?.professionalMemberships || []).map((m, i) => (
              <div key={i} style={{
                padding:'0.4rem 0',
                borderBottom:'1px solid oklch(0.878 0.010 90)',
                color:'oklch(0.470 0.018 150)',
                fontFamily:'Inter, sans-serif', fontSize:'0.8rem',
              }}>
                {m.name}
              </div>
            ))}
          </div>

          <Link href="/palace" style={{
            textAlign:'center', display:'block',
            border:'1px solid oklch(0.878 0.010 90)',
            color:'oklch(0.560 0.016 150)',
            fontFamily:'var(--font-sans)', fontSize:'0.75rem',
            letterSpacing:'0.15em', textTransform:'uppercase',
            textDecoration:'none', padding:'0.75rem',
          }}>
            ← Back to The Palace
          </Link>
        </div>
      </section>
    </main>
  )
}
