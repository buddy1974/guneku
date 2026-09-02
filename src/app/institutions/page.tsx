import { getAllInstitutions } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import { Reveal }   from '@/components/ui/Reveal'
import Link         from 'next/link'

/* Institution records carry an index signature, so extra fields arrive as `unknown`.
   This narrows one to a non-empty string, or to undefined. */
const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.length > 0 ? v : undefined

export const metadata = {
  title: 'Institutions — Guneku',
  description: 'The standing bodies of Guneku — cooperative, credit union, library, media, education and community organisations, each recorded at the stage its sources establish.',
}

/* These records already existed in the repository. getAllInstitutions() had been
   written and never called, so twelve institution records sat unread. This index
   links each to the page that already covers it where one exists, and to its own
   record where none does. Nothing here is newly authored. */
export default function InstitutionsPage() {
  /* A record marked `publicVisibility: "hold"` is not surfaced anywhere public — not
     listed here, not given a page, not linked. The source record stays in the repo. */
  const institutions = getAllInstitutions()
    .filter(i => i.publicVisibility !== 'hold')
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label="INSTITUTIONS"
        title="THE BODIES OF GUNEKU"
        subtitle={`${institutions.length} standing institutions, cooperatives and programmes of the Fondom.`} />

      <Reveal>
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {institutions.map(inst => {
              const href = str(inst.route) ?? `/institutions/${inst.id}`
              return (
                <Link key={inst.id} href={href} className="block no-underline">
                  <div className="card-royal p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <h2 className="font-cinzel text-foreground text-lg leading-snug flex-1">{inst.name}</h2>
                      {str(inst.category) && (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.07em] px-2 py-0.5 shrink-0 rounded-[2px] border border-border text-muted-foreground">
                          {str(inst.category)}
                        </span>
                      )}
                    </div>
                    {str(inst.description) && (
                      <p className="text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-5">
                        {str(inst.description)}
                      </p>
                    )}
                    <span className="text-primary text-xs tracking-widest mt-4">Read the record →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </Reveal>
    </main>
  )
}
