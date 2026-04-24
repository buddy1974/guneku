import Link from 'next/link'

export default function SignUpPage() {
  return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh',
                   display:'flex', alignItems:'center',
                   justifyContent:'center', textAlign:'center', padding:'2rem' }}>
      <div>
        <h1 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'3rem',
                     color:'#f2a90b', letterSpacing:'0.05em', margin:'0 0 1rem' }}>
          JOIN THE DIRECTORY
        </h1>
        <p style={{ color:'rgba(245,242,233,0.4)', fontFamily:'Inter, sans-serif', fontSize:'1rem' }}>
          Member registration coming soon.
        </p>
        <Link href="/indigenes" style={{ color:'#f2a90b', fontFamily:'Syne, sans-serif',
                                          fontSize:'0.8rem', letterSpacing:'0.1em',
                                          textTransform:'uppercase', textDecoration:'none',
                                          display:'block', marginTop:'1.5rem' }}>
          ← Indigenes Directory
        </Link>
      </div>
    </main>
  )
}
