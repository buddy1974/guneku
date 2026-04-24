import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{
      backgroundColor: '#0F0F0F', minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '2rem',
      background: 'radial-gradient(ellipse at center, rgba(139,30,45,0.15) 0%, #0F0F0F 70%)',
    }}>
      <div style={{ maxWidth: '600px' }}>
        <div style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: '10rem', lineHeight: 0.85,
          color: 'rgba(242,169,11,0.1)', letterSpacing: '0.05em',
          marginBottom: '2rem',
        }}>
          404
        </div>
        <div style={{ width: '40px', height: '3px',
                      backgroundColor: '#8B1E2D', margin: '0 auto 1.5rem' }} />
        <span className="section-label" style={{ display: 'block', marginBottom: '1rem' }}>
          LOST IN THE KINGDOM
        </span>
        <h1 style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: '3rem', color: '#F5F2E9',
          letterSpacing: '0.05em', margin: '0 0 1rem',
        }}>
          THIS PATH DOES NOT EXIST
        </h1>
        <p style={{
          color: 'rgba(245,242,233,0.4)', fontFamily: 'Inter, sans-serif',
          fontSize: '1rem', lineHeight: 1.7, margin: '0 0 3rem',
        }}>
          The page you are looking for has moved, been removed,
          or never existed in the Kingdom of Guneku.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            backgroundColor: '#f2a90b', color: '#0F0F0F',
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            padding: '0.9rem 2.5rem', fontSize: '0.8rem',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            textDecoration: 'none', display: 'inline-block',
          }}>
            Return Home
          </Link>
          <Link href="/updates" style={{
            border: '1px solid rgba(245,242,233,0.2)', color: '#F5F2E9',
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            padding: '0.9rem 2.5rem', fontSize: '0.8rem',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            textDecoration: 'none', display: 'inline-block',
          }}>
            Village Square
          </Link>
        </div>
      </div>
    </main>
  )
}
