export function BuiltBySection() {
  return (
    <section style={{
      backgroundColor: '#070709',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      padding: '5rem 1.5rem',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <p style={{
          color: 'rgba(245,242,233,0.2)', fontFamily: 'Syne, sans-serif',
          fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase',
          marginBottom: '1.5rem',
        }}>
          THIS PLATFORM WAS BUILT BY
        </p>

        <a href="https://maxpromo.digital" target="_blank" rel="noopener noreferrer"
           style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
          <h3 style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: '#f2a90b', letterSpacing: '0.1em', margin: 0,
          }}>
            MAXPROMO DIGITAL
          </h3>
        </a>

        <p style={{
          color: 'rgba(245,242,233,0.3)', fontFamily: 'Inter, sans-serif',
          fontSize: '0.9rem', lineHeight: 1.8, margin: '0 0 0.75rem',
        }}>
          AI-powered web platforms · Workflow automation · Digital transformation
        </p>
        <p style={{
          color: 'rgba(245,242,233,0.15)', fontFamily: 'Inter, sans-serif',
          fontSize: '0.82rem', margin: '0 0 2.5rem',
        }}>
          Essen, Germany — Built by Marcel Tabit Akwe, son of Guneku
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://maxpromo.digital" target="_blank" rel="noopener noreferrer"
             style={{
               backgroundColor: '#f2a90b', color: '#0F0F0F',
               fontFamily: 'Syne, sans-serif', fontWeight: 700,
               padding: '0.85rem 2rem', fontSize: '0.75rem',
               letterSpacing: '0.12em', textTransform: 'uppercase',
               textDecoration: 'none', display: 'inline-block',
             }}>
            Want This For Your Community?
          </a>
          <a href="https://maxpromo.digital/automation-audit" target="_blank" rel="noopener noreferrer"
             style={{
               border: '1px solid rgba(245,242,233,0.15)',
               color: 'rgba(245,242,233,0.4)',
               fontFamily: 'Syne, sans-serif', fontWeight: 700,
               padding: '0.85rem 2rem', fontSize: '0.75rem',
               letterSpacing: '0.12em', textTransform: 'uppercase',
               textDecoration: 'none', display: 'inline-block',
             }}>
            Free Automation Audit
          </a>
        </div>

        <p style={{
          color: 'rgba(245,242,233,0.08)', fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem', marginTop: '2rem', lineHeight: 1.7,
        }}>
          The first AI-powered digital platform for an African Fondom.
          A prototype for communities across Cameroon, Nigeria, Ghana, and beyond.
        </p>
      </div>
    </section>
  )
}
