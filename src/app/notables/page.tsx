import { getAllNotables } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import { Reveal }   from '@/components/ui/Reveal'
import Link         from 'next/link'

export const metadata = {
  title: 'Notables — Sons and Daughters of Guneku',
  description: 'Sons and daughters of Guneku whose work is recorded by the Fondom.',
}

/* The main navigation carried a "Notables" item pointing at /palace/notables, a route
   that has never existed. The profiles themselves were built and reachable only by
   direct link. This is the index that link was always meant to reach. */
export default function NotablesPage() {
  const notables = getAllNotables()

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label="NOTABLES"
        title="SONS &amp; DAUGHTERS"
        subtitle="Sons and daughters of Guneku whose work is recorded by the Fondom." />

      <Reveal>
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid gap-4 md:grid-cols-2">
            {notables.map(n => (
              <Link key={n.id} href={`/notables/${n.slug || n.id}`} className="block no-underline">
                <div className="card-royal p-6 h-full">
                  <div className="h-0.5 w-6 bg-gold-gradient mb-4" />
                  <h2 className="font-cinzel text-xl text-foreground">{n.name}</h2>
                  {n.title && <p className="text-muted-foreground text-sm mt-1">{n.title}</p>}
                  {typeof n.institution === 'string' && (
                    <p className="text-muted-foreground text-sm mt-1">{n.institution}</p>
                  )}
                  {n.location && (
                    <p className="text-primary/60 text-xs mt-2 tracking-widest">{n.location}</p>
                  )}
                  <span className="text-primary text-xs tracking-widest mt-4 inline-block">Full profile →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>
    </main>
  )
}
