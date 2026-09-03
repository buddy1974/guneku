import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { pageMetadata } from '@/lib/seo'
import {
  allNotables, allBodies, membersOf, getBody, recordedLabel, type FoundingName,
} from '@/lib/community'

export const metadata = pageMetadata({
  title: 'The Notables of Guneku',
  description:
    'The traditional governance of Guneku around the Fon — the Guneku Traditional Council, the quarter councils, and those the Fondom records as Notables.',
  path: '/notables',
})

/* This page was wrong until 2026-09-03, and the correction is the point of it.
 *
 * It read "Sons and daughters of Guneku whose work is recorded by the Fondom" and showed two
 * cards: a software developer and a professor. That inverted the meaning of the word. A
 * Guneku Notable holds a place in the traditional governance of the village around the Fon.
 * It is not a term for a distinguished son or daughter, and a career — however
 * distinguished — confers nothing traditional.
 *
 * So this page now shows the Traditional Council and the quarter councils, and the
 * professional profiles live under the sons and daughters instead. Nobody appears here
 * because of their profession, and nobody is inferred into it for turning up in a record as
 * an election official, a witness, a clergyman or a participant. */
export default function NotablesPage() {
  const council = getBody('traditional-council')
  const councillors = membersOf('traditional-council')

  /* Quarter-level traditional governance, taken from the roles the record itself states —
     "quarter head of Fun", "President, Fun Quarter Traditional Council" — rather than
     assembled by guessing which quarter anyone belongs to. */
  const quarterCouncil = councillors.filter(n =>
    /quarter head of|quarter traditional council|represents .* on the/i.test(n.role || ''))

  /* Notables the Fondom confirms who are not on the Traditional Council. */
  const otherNotables = allNotables().filter(n => n.body !== 'traditional-council')

  const otherBodies = allBodies().filter(b =>
    b.id !== 'traditional-council' && b.kind !== 'royal')

  const Person = ({ n, showChapter = false }: { n: FoundingName; showChapter?: boolean }) => (
    <li className="inst-row">
      <div className="py-3.5">
        <p className="inst-h3 !text-[1.02rem]">{n.display}</p>
        {n.role && <p className="inst-body mt-1 !text-[0.88rem]">{n.role}</p>}
        {showChapter && n.profession && (
          <p className="inst-meta mt-1">{n.profession}</p>
        )}
        {n.profileUrl && (
          <Link href={n.profileUrl} className="inst-link mt-1.5 inline-block">
            Full profile →
          </Link>
        )}
      </div>
    </li>
  )

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label="TRADITIONAL GOVERNANCE"
        title="The Notables of Guneku"
        subtitle="The people who hold a place in the traditional governance of the village around the Fon."
      />

      {/* ── What the word means, said plainly, because the site had it wrong ── */}
      <section className="inst-wrap inst-sec">
        <div className="max-w-3xl">
          <p className="inst-body">
            A Guneku Notable holds a place in the traditional governance of the village around
            His Royal Highness. The standing comes from that place, and from nothing else
            &mdash; not from a profession, not from prominence, not from education, and not
            from what a son or daughter of Guneku has achieved abroad.
          </p>
          <p className="inst-body mt-3">
            Sons and daughters of Guneku whose work the Fondom records have{' '}
            <Link href="/diaspora" className="inst-link">their own place</Link> on this site.
            That is a different thing, and the two are deliberately not mixed.
          </p>
        </div>
      </section>

      {/* ── The Traditional Council ── */}
      {council && (
        <section className="inst-alt border-y border-[var(--rule)]">
          <div className="inst-wrap inst-sec">
            <p className="inst-eyebrow">The Fon&rsquo;s immediate traditional governing council</p>
            <h2 className="inst-h2 mt-1.5">{council.name}</h2>
            <p className="inst-body mt-3 max-w-3xl">{council.standfirst}</p>
            <p className="inst-meta mt-2">{recordedLabel(council)}</p>

            <ul className="mt-6 grid list-none gap-x-10 p-0 md:grid-cols-2">
              {councillors.map(n => <Person key={n.slug} n={n} />)}
            </ul>

            {council.route && (
              <Link href={council.route} className="inst-link mt-6 inline-block">
                {council.routeLabel || 'The council record'} →
              </Link>
            )}
            <div className="mt-2">
              <Link href="/people/traditional-council" className="inst-link">
                The council register →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Quarter councils ── */}
      <section className="inst-wrap inst-sec">
        <h2 className="inst-h2">The quarter councils</h2>
        <p className="inst-body mt-2 max-w-3xl">
          Guneku&rsquo;s quarters have their own traditional councils, and the people who lead
          them sit in the village&rsquo;s governance as well. Only those the record actually
          names in that capacity appear here.
        </p>

        {quarterCouncil.length > 0 ? (
          <ul className="mt-5 grid list-none gap-x-10 p-0 md:grid-cols-2">
            {quarterCouncil.map(n => <Person key={n.slug} n={n} />)}
          </ul>
        ) : (
          <p className="inst-meta mt-4">Nothing recorded yet.</p>
        )}

        <p className="inst-body mt-6 max-w-3xl !text-[0.9rem]">
          The archive names quarter heads for only a few of the twenty-seven quarters. The rest
          hold their councils without the Fondom&rsquo;s record naming who sits on them, and no
          name is supplied here by guesswork.{' '}
          <Link href="/quarters" className="inst-link">See the quarters →</Link>
        </p>
      </section>

      {/* ── Other confirmed Notables ── */}
      {otherNotables.length > 0 && (
        <section className="inst-alt border-y border-[var(--rule)]">
          <div className="inst-wrap inst-sec">
            <h2 className="inst-h2">Other Notables of Guneku</h2>
            <p className="inst-body mt-2 max-w-3xl">
              Confirmed by the Fondom. Where a Notable also has a professional record, it is
              shown as a separate fact about them &mdash; it is not the reason they are here.
            </p>
            <ul className="mt-5 grid list-none gap-x-10 p-0 md:grid-cols-2">
              {otherNotables.map(n => <Person key={n.slug} n={n} showChapter />)}
            </ul>
          </div>
        </section>
      )}

      {/* ── Where the other bodies live ── */}
      <section className="inst-wrap inst-sec">
        <h2 className="inst-h3">Elsewhere in the record</h2>
        <ul className="mt-3 list-none space-y-2 p-0">
          {otherBodies.map(b => (
            <li key={b.id}>
              <Link href={`/people/${b.id}`} className="inst-link">{b.name} →</Link>
            </li>
          ))}
          <li><Link href="/people/palace-household" className="inst-link">The Royal Family of Guneku →</Link></li>
          <li><Link href="/diaspora" className="inst-link">Guneku people abroad →</Link></li>
        </ul>
      </section>
    </main>
  )
}
