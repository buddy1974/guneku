import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center text-center px-6"
          style={{ background: 'radial-gradient(ellipse at center, oklch(0.28 0.10 30 / 0.4) 0%, oklch(0.10 0.02 30) 70%)' }}>
      <div className="max-w-xl">
        <div className="font-cinzel leading-none text-[oklch(0.82_0.17_80/0.08)] select-none"
             style={{ fontSize: 'clamp(8rem, 20vw, 14rem)' }}>
          404
        </div>
        <div className="royal-divider max-w-xs mx-auto my-6" />
        <div className="section-label mb-4">LOST IN THE KINGDOM</div>
        <h1 className="font-cinzel text-3xl text-foreground mb-4 tracking-wide">
          THIS PATH DOES NOT EXIST
        </h1>
        <p className="font-cormorant text-xl italic text-muted-foreground mb-8">
          The page you seek has moved, been removed, or never existed in the Kingdom of Guneku.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/"        className="btn-royal inline-flex">Return Home</Link>
          <Link href="/updates" className="btn-royal-outline inline-flex">Village Square</Link>
        </div>
      </div>
    </main>
  )
}
