import Link from 'next/link'

export default function SignInPage() {
  return (
    <main style={{ backgroundColor:'oklch(0.965 0.012 85)', minHeight:'100vh',
                   display:'flex', alignItems:'center',
                   justifyContent:'center', textAlign:'center', padding:'2rem' }}>
      <div>
        <h1 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'3rem',
                     color:'oklch(0.320 0.060 158)', letterSpacing:'0.05em', margin:'0 0 1rem' }}>
          MEMBER LOGIN
        </h1>
        <p style={{ color:'oklch(0.560 0.016 150)', fontFamily:'Inter, sans-serif', fontSize:'1rem' }}>
          Member authentication coming soon.
        </p>
        <Link href="/" style={{ color:'oklch(0.320 0.060 158)', fontFamily:'var(--font-sans)',
                                 fontSize:'0.8rem', letterSpacing:'0.1em',
                                 textTransform:'uppercase', textDecoration:'none',
                                 display:'block', marginTop:'1.5rem' }}>
          ← Return Home
        </Link>
      </div>
    </main>
  )
}
