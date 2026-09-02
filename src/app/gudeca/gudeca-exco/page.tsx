import { PageHero } from '@/components/layout/PageHero'
import Link         from 'next/link'
import roster       from '@/data/gudeca/national-exco.json'

export const metadata = { title: 'GUDECA EXCO' }

/* This page used to render eight empty placeholder slots under the line "Full EXCO
   roster will be published here." The roster was in the repository the whole time,
   in a migrated record no route read. It is published here — names and offices only.
   The eleven personal mobile numbers in that record are not carried over. */

const CARD: React.CSSProperties = {
  backgroundColor: 'oklch(0.985 0.008 85)',
  border: '1px solid oklch(0.878 0.010 90)',
  borderLeft: '3px solid oklch(0.320 0.060 158)',
  padding: '1.25rem',
}
const OFFICE: React.CSSProperties = {
  color: 'oklch(0.560 0.016 150)', fontFamily: 'var(--font-sans)', fontSize: '0.65rem',
  letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem',
}
const NAME: React.CSSProperties = {
  color: 'oklch(0.245 0.022 150)', fontFamily: 'var(--font-sans)',
  fontWeight: 700, fontSize: '1rem',
}
const GRID: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px,100%), 1fr))',
  gap: '1rem',
}

export default function GudecaExcoPage() {
  return (
    <main style={{ backgroundColor: 'oklch(0.965 0.012 85)', minHeight: '100vh' }}>
      <PageHero
        label="GUDECA"
        title="EXECUTIVE COMMITTEE"
        subtitle="The elected leadership of the Guneku Development and Cultural Association."
      />
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <p style={{ color: 'oklch(0.470 0.018 150)', fontFamily: 'Inter, sans-serif',
                    fontSize: '1rem', lineHeight: 1.8, maxWidth: '680px', marginBottom: '2rem' }}>
          GUDECA&apos;s Executive Committee is elected every four years, with a mandate
          requiring at least 60% youth and female representation.
        </p>

        <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem',
                     color: 'oklch(0.245 0.022 150)', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>
          NATIONAL EXECUTIVE
        </h3>
        <p style={{ color: 'oklch(0.560 0.016 150)', fontFamily: 'Inter, sans-serif',
                    fontSize: '0.85rem', lineHeight: 1.7, maxWidth: '680px', marginBottom: '2rem' }}>
          {roster.currencyNote}
        </p>

        <div style={GRID}>
          {roster.members.map(m => (
            <div key={m.office} style={CARD}>
              <div style={OFFICE}>{m.office}</div>
              <div style={NAME}>{m.name}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '4rem', paddingTop: '3rem',
                      borderTop: '1px solid oklch(0.878 0.010 90)' }}>
          <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem',
                       color: 'oklch(0.245 0.022 150)', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>
            {roster.europe.title.toUpperCase()}
          </h3>
          <p style={{ color: 'oklch(0.560 0.016 150)', fontFamily: 'Inter, sans-serif',
                      fontSize: '0.85rem', lineHeight: 1.7, maxWidth: '680px', marginBottom: '2rem' }}>
            {roster.europe.note}
          </p>
          <div style={GRID}>
            {roster.europe.members.map(m => (
              <div key={m.office} style={CARD}>
                <div style={OFFICE}>{m.office}</div>
                <div style={NAME}>{m.name}</div>
                <div style={{ color: 'oklch(0.560 0.016 150)', fontFamily: 'Inter, sans-serif',
                              fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  GUDECA Europe
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ marginTop: '3rem', color: 'oklch(0.560 0.016 150)',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.78rem',
                    lineHeight: 1.7, maxWidth: '680px' }}>
          {roster.contactPolicy}
        </p>
        <p style={{ marginTop: '0.75rem', color: 'oklch(0.560 0.016 150)',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.78rem',
                    lineHeight: 1.7, maxWidth: '680px' }}>
          {roster.nameNote}
        </p>

        <div style={{ marginTop: '3rem' }}>
          <Link href="/gudeca" style={{
            color: 'oklch(0.320 0.060 158)', fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            ← Back to GUDECA
          </Link>
        </div>
      </section>
    </main>
  )
}
