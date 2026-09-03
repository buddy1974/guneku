import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { allFoundingNames, getFoundingName, getChapter, foundingNamesFor, toCardSafe, placeLabel } from '@/lib/community'
import { FoundingNameCard } from '@/components/community/FoundingNames'
import { pageMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  return allFoundingNames().map(n => ({ slug: n.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const n = getFoundingName(slug)
  if (!n) return {}
  const chapter = getChapter(n.chapter)
  return pageMetadata({
    title: n.display,
    description: `${n.display} — ${n.role}${chapter ? `, ${chapter.org}` : ''}. An unclaimed entry in the Guneku Indigenes Directory, open to be claimed by its owner.`,
    path: `/indigenes/founding/${slug}`,
  })
}

/* An unclaimed entry.
 *
 * This page is deliberately thin, and says so. It exists to be recognised and
 * claimed, not to stand as a profile. Everything it shows is traceable to the
 * record named at the bottom; everything it does not show is not ours to write. */
export default async function FoundingNamePage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const n = getFoundingName(slug)
  if (!n) notFound()

  const chapter = getChapter(n.chapter)
  const siblings = foundingNamesFor(n.chapter)
    .filter(x => x.slug !== n.slug)
    .map(toCardSafe)

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label="INDIGENES DIRECTORY · UNCLAIMED ENTRY"
        title={n.display}
        /* The role usually already names the chapter ("President, GUDECA EU
           Chapter"), so the subtitle adds where that body sits, not the
           organisation a second time. */
        subtitle={`${n.role}${chapter ? ` · ${chapter.flag} ${chapter.place}` : ''}`}
      />

      <section className="inst-wrap inst-sec grid items-start gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
        <div>
          <div className="inst-card p-6">
            <p className="inst-tag">What this entry holds</p>
            <dl className="mt-3 grid gap-0 text-[0.92rem]">
              {[
                ['Name', n.display],
                ['Role', n.role],
                ['Chapter', chapter ? `${chapter.flag} ${chapter.org} — ${chapter.place}` : '—'],
                ['Source', n.sourceLabel],
              ].map(([k, v]) => (
                <div key={k} className="inst-row grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
                  <dt className="inst-tag">{k}</dt>
                  <dd className="m-0 text-[var(--ink-900)]">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="inst-body mt-5">
              That is the whole of it. No photograph, no city, no employer, no contact
              details &mdash; none of that has been offered by
              {' '}{n.display.split(' ')[0]}, so none of it is published here.
            </p>
            {n.profileUrl && (
              <p className="inst-body mt-3 !text-[0.9rem]">
                {n.display.split(' ')[0]} already has a published profile on this site:{' '}
                <Link href={n.profileUrl} className="inst-link">see it here</Link>. This entry
                stays thin all the same — the two are separate records until it is claimed.
              </p>
            )}
            {n.note && <p className="inst-meta mt-3">{n.note}</p>}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href={`/indigenes/submit?intent=claim&entry=${n.slug}`} className="inst-btn inst-btn-primary">
              This is me — claim this entry
            </Link>
            <Link href={`/indigenes/submit?intent=remove&entry=${n.slug}`} className="inst-link">
              Not me, or take it down
            </Link>
          </div>
        </div>

        <aside className="inst-card self-start p-5">
          <p className="inst-tag">What claiming does</p>
          <p className="inst-body mt-2 !text-[0.9rem]">
            The entry becomes yours. You say where you are, what you do, which quarter
            you come from, and which of the Fondom&rsquo;s projects you want to stand
            behind &mdash; and you choose, field by field, what the public sees.
          </p>
          <p className="inst-body mt-3 !text-[0.9rem]">
            Until then it stays as it is: a name from a record, waiting for the person
            it belongs to.
          </p>

          {chapter && (
            <div className="mt-5 border-t border-[var(--rule)] pt-4">
              <p className="inst-tag">Chapter</p>
              <Link href={`/gudeca/chapters/${chapter.id}`} className="inst-link mt-2 inline-block">
                {chapter.flag} {chapter.org} — {chapter.place} →
              </Link>
            </div>
          )}
        </aside>
      </section>

      {siblings.length > 0 && chapter && (
        <section className="inst-alt inst-rule">
          <div className="inst-wrap inst-sec">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="inst-h2">Others in the {chapter.short} register</h2>
              <Link href={`/indigenes/submit?intent=add&chapter=${chapter.id}`} className="inst-link">
                Add a name →
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {siblings.map(s => <FoundingNameCard key={s.slug} n={s} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
