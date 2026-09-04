import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import {
  allFoundingNames, getFoundingName, getChapter, getBody,
  foundingNamesFor, membersOf, toCardSafe, recordedLabel,
} from '@/lib/community'
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
  const body = n.body ? getBody(n.body) : null
  return pageMetadata({
    title: n.display,
    description: n.deceased
      ? `${n.display} — ${n.role}. A record in the Guneku Fondom archive.`
      : `${n.display} — ${n.role}${body ? `, ${body.name}` : ''}. An unclaimed entry in the Guneku register, open to be claimed by its owner.`,
    path: `/indigenes/founding/${slug}`,
  })
}

/* An entry in the register.
 *
 * Deliberately thin, and it says so: it exists to be recognised and claimed, not to
 * stand as a profile. Everything shown is traceable to the record named on the page;
 * everything not shown is not ours to write.
 *
 * A person recorded as deceased is the exception that proves the rule. The entry is
 * kept — the record of a Fondom includes those who are gone — but it carries no claim
 * action and no "not me" link. There is nobody to invite, and offering to would be
 * grotesque. */
export default async function FoundingNamePage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const n = getFoundingName(slug)
  if (!n) notFound()

  const chapter = n.chapter ? getChapter(n.chapter) : null
  const body    = n.body    ? getBody(n.body)       : null

  /* Peers come from the body where there is one — a councillor's neighbours are the
     other councillors, not everyone who happens to live in the same place. */
  const peers = (body ? membersOf(body.id) : n.chapter ? foundingNamesFor(n.chapter) : [])
    .filter(x => x.slug !== n.slug)
    .map(toCardSafe)

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label={
          n.deceased
            ? 'THE FONDOM ARCHIVE · IN MEMORIAM'
            : body
              ? `${body.short.toUpperCase()} · UNCLAIMED ENTRY`
              : 'INDIGENES DIRECTORY · UNCLAIMED ENTRY'
        }
        title={n.display}
        subtitle={`${n.role}${chapter ? ` · ${chapter.flag} ${chapter.place}` : ''}`}
      />

      <section className="inst-wrap inst-sec grid items-start gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
        <div>
          <div className="inst-card p-6">
            <p className="inst-tag">What this entry holds</p>
            <dl className="mt-3 grid gap-0 text-[0.92rem]">
              {([
                ['Name', n.display],
                ['Office or role', n.role],
                ...(body ? [['Body', `${body.name} — ${recordedLabel(body)}`]] : []),
                ['Chapter', chapter ? `${chapter.flag} ${chapter.org} — ${chapter.place}` : 'Not recorded'],
                ['Source', n.sourceLabel],
                ...(n.aliases.length ? [['Also written', n.aliases.join(' · ')]] : []),
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="inst-row grid gap-1 py-3 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
                  <dt className="inst-tag">{k}</dt>
                  <dd className="m-0 text-[var(--ink-900)]">{v}</dd>
                </div>
              ))}
            </dl>

            {!n.deceased && (
              <p className="inst-body mt-5">
                That is the whole of it. No photograph, no city, no employer, no contact
                details &mdash; none of that has been offered by
                {' '}{n.display.split(' ')[0]}, so none of it is published here.
              </p>
            )}
            {n.profileUrl && (
              <p className="inst-body mt-3 !text-[0.9rem]">
                {n.display.split(' ')[0]} already has a published profile on this site:{' '}
                <Link href={n.profileUrl} className="inst-link">see it here</Link>. This entry
                stays thin all the same &mdash; the two are separate records until it is claimed.
              </p>
            )}
            {n.note && <p className="inst-meta mt-3">{n.note}</p>}
          </div>

          {n.deceased ? (
            <div className="mt-6 border-l-2 border-[var(--oxblood)] pl-4">
              <p className="inst-body !text-[0.92rem]">
                This entry is kept as a record and is not offered for claiming. The record of a
                Fondom includes those who are gone.
              </p>
              <p className="inst-meta mt-2">
                If anything here is wrong, or the family would rather it were not published,{' '}
                <Link href="/contact" className="inst-link">write to the Palace</Link>.
              </p>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {/* The claim workflow, not the Palace inbox. A signed-out visitor is sent to
                  sign in and brought straight back here by the middleware, so the register
                  itself stays a static, account-free page. Deceased entries never reach this
                  branch, and /my-guneku/claims/new refuses them again if they somehow do. */}
              <Link href={`/my-guneku/claims/new?person=${n.slug}`} className="inst-btn inst-btn-primary">
                This is me — claim this entry
              </Link>
              <Link href={`/indigenes/submit?intent=remove&entry=${n.slug}`} className="inst-link">
                Not me, or take it down
              </Link>
            </div>
          )}
        </div>

        <aside className="inst-card self-start p-5">
          {!n.deceased && (
            <>
              <p className="inst-tag">What claiming does</p>
              <p className="inst-body mt-2 !text-[0.9rem]">
                You ask the Palace to connect your member account to this entry, and a person
                reviews it. Nothing on this page changes when you ask, and nothing changes
                without that review. The office, the sources and the history stay as the
                record has them.
              </p>
            </>
          )}

          {body && (
            <div className={n.deceased ? '' : 'mt-5 border-t border-[var(--rule)] pt-4'}>
              <p className="inst-tag">Body</p>
              <Link href={`/people/${body.id}`} className="inst-link mt-2 inline-block">
                {body.name} →
              </Link>
              <p className="inst-meta mt-2">Roster {recordedLabel(body)}.</p>
            </div>
          )}

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

      {peers.length > 0 && (
        <section className="inst-alt inst-rule">
          <div className="inst-wrap inst-sec">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="inst-h2">
                {body ? `The rest of the ${body.short.toLowerCase()}` : 'Others on the same register'}
              </h2>
              {body
                ? <Link href={`/people/${body.id}`} className="inst-link">The full body →</Link>
                : chapter && (
                    <Link href={`/indigenes/submit?intent=add&chapter=${chapter.id}`} className="inst-link">
                      Add a name →
                    </Link>
                  )}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {peers.map(p => <FoundingNameCard key={p.slug} n={p} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
