import Link               from 'next/link'
import Image              from 'next/image'
import { Landmark, Users, Mountain, Sparkles } from 'lucide-react'
import { getAllKingdomArticles } from '@/lib/content'
import { Reveal }             from '@/components/ui/Reveal'

export const metadata = {
  title: 'The Kingdom — Guneku Fondom',
  description: '27 quarters, 15,000 people, one ancient kingdom in the volcanic hills of Mbengwi, Northwest Cameroon.',
}

const QUARTERS = [
  'Njinigom','Ngong','Fun','Fringyeng','Wumfi-Ku','Windig',
  'Keuhchah','Munam','Ngamunghe','Mbengeghang','Ndobo','Tonenge',
  'Nyang','Upper Guneku','Lower Guneku','Central Guneku',
  'Akwen','Bali-Dingi','Bessi','Boa','Egock','Eku-Bessi',
  'Eshie','Esimbi','Etwii','Guneku Centre','Kai',
]

export default function KingdomPage() {
  const articles = getAllKingdomArticles()

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="relative h-[80vh] overflow-hidden">
        <Image src="/kingdom-aerial.jpg" alt="Aerial view of Guneku kingdom" fill className="object-cover animate-ken-burns" priority unoptimized />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-6 text-center">
          <div className="section-label animate-fade-up">EST. ANCIENT · LIVING TODAY</div>
          <h1 className="mt-6 font-cinzel text-6xl font-bold uppercase leading-none text-gold-gradient md:text-8xl animate-fade-up" style={{ animationDelay: '0.15s' }}>
            The Kingdom
          </h1>
          <p className="mt-6 max-w-2xl font-cormorant text-xl italic text-foreground/90 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            Twenty-seven quarters. Fifteen thousand souls. One sacred fire kept alight in the volcanic
            hills of Mbengwi.
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { icon: Landmark, n: '27',    l: 'Royal Quarters' },
              { icon: Users,    n: '15,000+',l: 'Indigenes' },
              { icon: Mountain, n: '1,200m', l: 'Above Sea Level' },
              { icon: Sparkles, n: '9th',   l: 'Reigning Fon' },
            ].map((s, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl card-royal p-8">
                <s.icon className="h-7 w-7 text-primary" />
                <div className="mt-6 font-cinzel text-4xl text-gold-gradient">{s.n}</div>
                <div className="mt-1 text-sm tracking-widest text-muted-foreground">{s.l.toUpperCase()}</div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gold-gradient opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── 27 QUARTERS GRID ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="text-center mb-12">
            <div className="section-label mb-4">THE 27 QUARTERS</div>
            <h2 className="font-cinzel text-5xl text-foreground">A Tapestry of Villages</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
            {QUARTERS.map((q, i) => (
              <div key={q} className="group relative cursor-default overflow-hidden rounded-xl border border-border bg-card/50 px-4 py-5 text-center transition-all hover:-translate-y-1 hover:border-primary/60 hover:bg-card hover:glow-gold">
                <div className="text-[10px] tracking-widest text-muted-foreground">N° {String(i+1).padStart(2,'0')}</div>
                <div className="mt-1 font-cinzel text-base text-foreground group-hover:text-primary">{q}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── FESTIVAL SECTION ── */}
      <section className="relative h-[60vh] overflow-hidden">
        <Image src="/festival.jpg" alt="Michi Ebeng festival" fill loading="lazy" className="absolute object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
          <div className="max-w-xl">
            <div className="section-label mb-4">MƗCHI ƏBEŊ</div>
            <h3 className="font-cinzel text-5xl text-gold-gradient">The Festival of Return</h3>
            <p className="mt-6 font-cormorant text-lg leading-relaxed text-foreground/90">
              Once a year, the masquerades rise. Drums summon the diaspora home. The kingdom remembers
              itself in dance, in raffia, in the language of the ancestors.
            </p>
            <Link href="/gallery" className="mt-8 inline-flex items-center gap-2 border-b-2 border-primary pb-1 font-cinzel text-sm tracking-widest text-primary hover:gap-3 transition-all">
              ENTER THE GALLERY →
            </Link>
          </div>
        </div>
      </section>

      {/* ── KINGDOM ARTICLES ── */}
      {articles.length > 0 && (
        <Reveal>
          <section className="mx-auto max-w-7xl px-6 py-20">
            <h3 className="font-cinzel text-3xl text-foreground mb-8">ABOUT THE KINGDOM</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {articles.map((a: any) => (
                <Link key={a.id} href={`/kingdom/${a.slug}`} className="card-royal p-6 block no-underline group">
                  <div className="h-0.5 w-6 bg-royal mb-4" />
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{a.title}</h4>
                  <p className="mt-2 text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                    {a.body?.replace(/<[^>]+>/g,'').substring(0,120)}...
                  </p>
                  <span className="mt-4 block text-primary text-xs tracking-widest">Read more →</span>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      )}
    </div>
  )
}
