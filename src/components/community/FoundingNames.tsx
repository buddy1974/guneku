import Link from 'next/link'
import { allFoundingNames, foundingNamesFor, getChapter, membersOf, toCardSafe } from '@/lib/community'
import type { CardSafe } from '@/lib/community'

/* The founding names — the entries the directory opens with.
 *
 * A seed stub shows four things: the name, the role, the chapter, and the source
 * the name came from. It shows them because a Fondom or GUDECA record already
 * names the person in that role. It shows nothing else — no photograph, no city,
 * no contact — because nothing else has been offered by the person themselves.
 *
 * Two actions sit on every stub and both matter: Claim, which hands the entry to
 * its owner, and Not me / take it down, which removes it. A directory that
 * publishes a name it was given must make leaving as easy as joining. */

export function FoundingNameCard({ n }: { n: CardSafe }) {
  return (
    <article className="inst-card flex flex-col p-4">
      <p className="inst-tag">
        {/* The office comes first where there is one: on a roster of the governing
            body, "Traditional Council" tells the reader more than the village name. */}
        {n.body ? n.body.short : n.chapter ? `${n.chapter.flag} ${n.chapter.short}` : 'Guneku'}
      </p>
      <h3 className="inst-h3 mt-1.5">
        <Link href={`/indigenes/founding/${n.slug}`} className="no-underline hover:text-[var(--burgundy-i)]">
          {n.display}
        </Link>
      </h3>
      <p className="inst-body mt-1 !text-[0.86rem]">{n.role}</p>
      <p className="inst-meta mt-2">{n.sourceLabel}</p>
      {/* Only where the person already has a published profile on this site —
          the stub links to it rather than restating anything from it. */}
      {n.profileUrl && (
        <Link href={n.profileUrl} className="inst-meta mt-1 underline underline-offset-2 hover:text-[var(--burgundy-i)]">
          Has a profile on guneku.org →
        </Link>
      )}

      {/* A person recorded as deceased is never offered for claiming. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--rule)] pt-3">
        {n.deceased ? (
          <span className="inst-meta">Of blessed memory — kept as a record</span>
        ) : (
          <>
            <Link href={`/indigenes/submit?intent=claim&entry=${n.slug}`} className="inst-link">
              This is me — claim it →
            </Link>
            <Link
              href={`/indigenes/submit?intent=remove&entry=${n.slug}`}
              className="inst-meta underline underline-offset-2 hover:text-[var(--oxblood)]"
            >
              Not me / take it down
            </Link>
          </>
        )}
      </div>
    </article>
  )
}

export function FoundingNames({
  chapterId,
  bodyId,
  heading = 'The founding names',
  standfirst,
  showAddCta = true,
}: {
  /** Limit to one chapter. Omitted, every founding name is shown. */
  chapterId?: string
  /** Limit to one body — kept in office order, not sorted. */
  bodyId?: string
  heading?: string
  standfirst?: string
  showAddCta?: boolean
}) {
  const names = (
    bodyId ? membersOf(bodyId)
    : chapterId ? foundingNamesFor(chapterId)
    : allFoundingNames()
  ).map(toCardSafe)
  const chapter = chapterId ? getChapter(chapterId) : null

  if (names.length === 0) {
    return (
      <div className="inst-card p-6">
        <p className="inst-h3">No names here yet</p>
        <p className="inst-body mt-2">
          {chapter
            ? `Nobody has been recorded for ${chapter.short} yet. Be the first — the register opens with whoever puts a name forward.`
            : 'The register opens with whoever puts a name forward.'}
        </p>
        {showAddCta && (
          <Link
            href={`/indigenes/submit?intent=add${chapterId ? `&chapter=${chapterId}` : ''}`}
            className="inst-btn inst-btn-primary mt-4"
          >
            Add a name
          </Link>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="inst-h2">{heading}</h2>
        {showAddCta && (
          <Link
            href={`/indigenes/submit?intent=add${chapterId ? `&chapter=${chapterId}` : ''}`}
            className="inst-link"
          >
            Add a name →
          </Link>
        )}
      </div>
      <p className="inst-body mt-2 max-w-2xl">
        {standfirst ?? (
          <>
            These entries were opened from the Fondom&rsquo;s own records, so the register
            does not start empty. Each shows only a name, an office and where it came from.
            Everything else belongs to the person &mdash; it appears when they claim the
            entry and fill it in themselves.
          </>
        )}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {names.map(n => <FoundingNameCard key={n.slug} n={n} />)}
      </div>
    </div>
  )
}
