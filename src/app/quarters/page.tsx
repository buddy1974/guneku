import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { pageMetadata } from '@/lib/seo'
import { allQuarters, recordedQuarters } from '@/lib/quarter-pages'

export const metadata = pageMetadata({
  title: 'The 27 quarters of Guneku',
  description:
    'Guneku is made up of twenty-seven quarters. Each has a page carrying what the Fondom’s own records establish about it — its institutions, projects, people and market day where these are recorded.',
  path: '/quarters',
})

export default function QuartersPage() {
  const quarters = allQuarters()
  const recorded = recordedQuarters().length

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label="THE KINGDOM"
        title="The twenty-seven quarters"
        subtitle={`Guneku is made up of twenty-seven quarters. ${recorded} of them have something recorded in the Fondom’s archive so far; the rest are named here and wait to be filled by the people who know them.`}
      />

      <section className="inst-wrap inst-sec">
        <ul className="grid list-none gap-x-8 gap-y-0 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {quarters.map(q => (
            <li key={q.slug} className="inst-row">
              <Link href={`/quarters/${q.slug}`}
                    className="group flex items-baseline justify-between gap-4 py-3.5 no-underline">
                <span className="inst-h3 group-hover:text-[var(--royal-green)]">{q.name}</span>
                <span className="inst-meta shrink-0">
                  {q.links.length > 0
                    ? `${q.links.length} ${q.links.length === 1 ? 'record' : 'records'}`
                    : 'not yet recorded'}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="inst-card mt-10 p-6">
          <h2 className="inst-h3">Know something missing?</h2>
          <p className="inst-body mt-2 max-w-2xl">
            Most of these quarters have no record in the archive yet. If you know a quarter
            &mdash; its history, its institutions, who holds office there, what it is known
            for &mdash; the Fondom would rather hear it from you than guess.
          </p>
          <Link href="/indigenes/submit?intent=add" className="inst-btn inst-btn-primary mt-5">
            Contribute to the Guneku record
          </Link>
        </div>
      </section>
    </main>
  )
}
