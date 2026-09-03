import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { pageMetadata } from '@/lib/seo'
import { getAllNotables } from '@/lib/content'

export const metadata = pageMetadata({
  title: 'Sons and daughters of Guneku',
  description:
    'Professional and community profiles of Guneku sons and daughters, at home and abroad, whose work the Fondom records.',
  path: '/sons-and-daughters',
})

/* Where the professional profiles live, since 2026-09-03.
 *
 * They used to sit under /notables, which said something the Fondom does not mean: a Notable
 * of Guneku holds a place in the village's traditional governance, and a career confers no
 * such place. The profiles themselves were never the problem — only the word over them. */
export default function SonsAndDaughtersPage() {
  const profiles = getAllNotables()

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label="SONS &amp; DAUGHTERS"
        title="Sons and daughters of Guneku"
        subtitle="Profiles of Guneku people whose work the Fondom records — at home and abroad."
      />

      <section className="inst-wrap inst-sec">
        <p className="inst-body max-w-3xl">
          A profile here records what someone does. It is not a traditional title and confers
          none: the{' '}
          <Link href="/notables" className="inst-link">Notables of Guneku</Link> are the people
          who hold a place in the village&rsquo;s traditional governance around the Fon, which
          is a different thing entirely.
        </p>

        <ul className="mt-8 grid list-none gap-5 p-0 sm:grid-cols-2">
          {profiles.map(p => {
            const r = p as unknown as { name?: string; title?: string; location?: string }
            return (
              <li key={p.slug}>
                <Link href={`/sons-and-daughters/${p.slug}`}
                      className="inst-card block h-full p-5 no-underline">
                  <div className="h-0.5 w-8 bg-[var(--ochre)]" />
                  <h2 className="inst-h3 mt-3">{r.name || p.slug}</h2>
                  {r.title && <p className="inst-body mt-1.5 !text-[0.88rem]">{r.title}</p>}
                  {r.location && <p className="inst-meta mt-2">{r.location}</p>}
                  <span className="inst-link mt-3 inline-block">Full profile →</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
