import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { FoundingNames } from '@/components/community/FoundingNames'
import { allBodies, getBody, getChapter, membersOf, memberCount, recordedLabel } from '@/lib/community'
import { pageMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  return allBodies().map(b => ({ body: b.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ body: string }> },
): Promise<Metadata> {
  const { body } = await params
  const b = getBody(body)
  if (!b) return {}
  return pageMetadata({
    title: b.name,
    description: `${b.standfirst} ${memberCount(b.id)} people, ${recordedLabel(b)}.`,
    path: `/people/${body}`,
  })
}

/* A body of Guneku, with its roster.
 *
 * The order on the page is the order of office, never alphabetical — a roster sorted
 * A-to-Z puts the Chairman wherever his initial falls and loses the thing a roster is
 * for. `membersOf` preserves the register's order for exactly this reason.
 *
 * Every roster states the year it describes, at the top, in the reader's line of
 * sight. The Traditional Council record is five years old and a council changes;
 * publishing it as history keeps a real record of the village available without
 * claiming anything about the present that no source supports. */
export default async function BodyPage({
  params,
}: { params: Promise<{ body: string }> }) {
  const { body } = await params
  const b = getBody(body)
  if (!b) notFound()

  const members    = membersOf(b.id)
  const claimable  = members.filter(m => !m.deceased).length
  const chapter    = b.chapter ? getChapter(b.chapter) : null
  const others     = allBodies().filter(x => x.id !== b.id)

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label={
          b.kind === 'governing'  ? 'THE GOVERNING BODY OF GUNEKU'
          : b.kind === 'committee' ? 'THE PEOPLE BEHIND IT'
          : b.kind === 'household' ? 'AROUND THE THRONE'
          : 'THE ASSOCIATION'
        }
        title={b.name}
        subtitle={b.standfirst}
      />

      <section className="inst-wrap inst-sec">
        <div className="inst-card grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="inst-tag">
              {members.length} {members.length === 1 ? 'person' : 'people'} · {recordedLabel(b)}
            </p>
            <p className="inst-body mt-1.5 !text-[0.9rem]">{b.sourceNote}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {b.route && (
              <Link href={b.route} className="inst-btn inst-btn-quiet">
                {b.routeLabel ?? 'The record'}
              </Link>
            )}
            <Link href="/indigenes/submit?intent=add" className="inst-btn inst-btn-primary">
              Add a name
            </Link>
          </div>
        </div>
      </section>

      <section className="inst-wrap pb-[clamp(2.25rem,4.5vw,3.5rem)]">
        <FoundingNames
          bodyId={b.id}
          heading="Who holds office"
          showAddCta={false}
          standfirst={
            claimable === 0
              ? 'These entries are kept as records of the Fondom.'
              : `Each entry shows only a name, the office the record gives, and where that record came from. ${claimable === members.length ? 'Every one' : `${claimable} of them`} can be claimed by the person it belongs to — and from that moment the profile is theirs to write, and theirs to decide what the public sees.`
          }
        />
      </section>

      <section className="inst-alt inst-rule">
        <div className="inst-wrap inst-sec grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div>
            <h2 className="inst-h2">Is one of these you?</h2>
            <p className="inst-body mt-3 max-w-2xl">
              Claim your entry and it becomes yours. The office stays as the record has it
              &mdash; that part is the Fondom&rsquo;s &mdash; but everything else is yours to
              write: where you are, what you do, which quarter you come from, and which of the
              village&rsquo;s projects you stand behind. You choose, field by field, what the
              public sees.
            </p>
            <p className="inst-body mt-3 max-w-2xl">
              If a name here is wrong, out of date, or should not be published at all, say so
              and it is put right. Nobody has to argue for their own record.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/indigenes/submit?intent=add" className="inst-btn inst-btn-primary">Add a name</Link>
              <Link href="/indigenes" className="inst-btn inst-btn-quiet">The full directory</Link>
            </div>
          </div>

          <aside className="inst-card self-start p-5">
            <p className="inst-tag">The other bodies</p>
            <ul className="mt-3 list-none p-0">
              {others.map(o => (
                <li key={o.id} className="inst-row py-2.5">
                  <Link href={`/people/${o.id}`} className="no-underline">
                    <span className="inst-h3 block !text-[0.98rem] hover:text-[var(--burgundy-i)]">
                      {o.short}
                    </span>
                    <span className="inst-meta">
                      {memberCount(o.id)} recorded · {recordedLabel(o)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {chapter && (
              <div className="mt-4 border-t border-[var(--rule)] pt-4">
                <p className="inst-tag">Chapter</p>
                <Link href={`/gudeca/chapters/${chapter.id}`} className="inst-link mt-2 inline-block">
                  {chapter.flag} {chapter.org} →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
