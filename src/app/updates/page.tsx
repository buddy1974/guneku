import { getAllUpdates } from '@/lib/content'
import { PageHero }      from '@/components/layout/PageHero'
import Link              from 'next/link'
import Image             from 'next/image'

export const metadata = {
  title:       'Village Square — News from Guneku Fondom',
  description: 'Latest news, events, and announcements from Guneku Fondom, Northwest Cameroon.',
}

export default function UpdatesPage() {
  const updates = getAllUpdates()

  return (
    <main className="min-h-screen bg-background">
      <PageHero label="THE VILLAGE SQUARE" title="LATEST FROM GUNEKU"
                subtitle="News, events, and announcements from the Fondom." />

      <section className="max-w-7xl mx-auto px-6 py-20">
        {/* Featured */}
        {updates[0] && (
          <Link href={`/updates/${updates[0].slug}`}
                className="group block no-underline card-royal overflow-hidden mb-10">
            <div className="grid md:grid-cols-2">
              <div className="relative h-72 md:h-auto bg-card/50 overflow-hidden">
                {updates[0].featuredImage ? (
                  <Image src={updates[0].featuredImage} alt={updates[0].title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                ) : (
                  <div className="h-full flex items-center justify-center pattern-royal">
                    <span className="font-cinzel text-[8rem] text-foreground/5">01</span>
                  </div>
                )}
                <div className="absolute inset-x-0 top-0 h-1 bg-gold-gradient" />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="section-label mb-3">
                  FEATURED ·{' '}{updates[0].publishedAt ? new Date(updates[0].publishedAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : ''}
                </div>
                <h2 className="font-cinzel text-2xl text-foreground group-hover:text-primary transition-colors leading-snug mb-4">{updates[0].title}</h2>
                <p className="text-muted-foreground font-cormorant text-lg leading-relaxed mb-6">{updates[0].excerpt}</p>
                <span className="text-primary text-sm tracking-widest">Read full story →</span>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {updates.slice(1).map((u: any, i: number) => (
            <Link key={u.id} href={`/updates/${u.slug}`}
                  className="group card-royal overflow-hidden block no-underline">
              <div className="relative h-44 bg-card/50 overflow-hidden">
                {u.featuredImage ? (
                  <Image src={u.featuredImage} alt={u.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                ) : (
                  <div className="h-full flex items-center justify-center pattern-royal">
                    <span className="font-cinzel text-5xl text-foreground/10">{String(i+2).padStart(2,'0')}</span>
                  </div>
                )}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-royal" />
              </div>
              <div className="p-5">
                {u.publishedAt && (
                  <div className="section-label text-[0.6rem] mb-2">
                    {new Date(u.publishedAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}
                  </div>
                )}
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug text-sm line-clamp-2">{u.title}</h3>
                <p className="text-muted-foreground text-xs mt-2 line-clamp-2 leading-relaxed">{u.excerpt}</p>
                <span className="block mt-3 text-primary text-xs tracking-widest">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
