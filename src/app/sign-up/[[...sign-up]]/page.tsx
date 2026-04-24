import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <span className="section-label" style={{ marginBottom:'0.5rem', display:'block' }}>GUNEKU FONDOM</span>
          <h1 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2.5rem', color:'#F5F2E9', letterSpacing:'0.05em', margin:0 }}>JOIN THE DIRECTORY</h1>
          <p style={{ color:'rgba(245,242,233,0.4)', fontFamily:'Inter, sans-serif', fontSize:'0.9rem', marginTop:'0.5rem' }}>Sign up with Google to create your indigene profile.</p>
        </div>
        <SignUp />
      </div>
    </main>
  )
}
