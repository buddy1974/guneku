import Link from 'next/link'
import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { allBodies, memberCount, recordedLabel, allFoundingNames } from '@/lib/community'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'The people of Guneku',
  description:
    'The bodies of Guneku — the Traditional Council that governs the village, the GUDECA executives at home and abroad, the festival committee and the Palace household. Every office holder, with the record that names them.',
  path: '/people',
})

/* The index of the bodies.
 *
 * A Fondom is not one man, and a village is not one list. /indigenes answers "who are
 * the sons and daughters"; this answers "who holds office". They are different
 * questions, they have different registers, and one person can appear in both. */
export default function PeopleIndexPage() {
  const bodies = allBodies()
  const total  = allFoundingNames().length

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label="WHO HOLDS OFFICE"
        title="The people of Guneku"
        subtitle={`His Royal Highness is the king. These are the bodies through whom the village is governed, funded, celebrated and kept — ${total} people on record, each traceable to the document that names them.`}
      />

      <section className="inst-wrap inst-sec">
        <div className="grid gap-5 md:grid-cols-2">
          {bodies.map(b => (
            <article key={b.id} className="inst-card flex flex-col p-5">
              <p className="inst-tag">
                {b.kind === 'governing' ? 'The governing body'
                  : b.kind === 'committee' ? 'Committee'
                  : b.kind === 'household' ? 'The Palace'
                  : 'Association'}
              </p>
              <h2 className="inst-h2 mt-1.5 !text-[1.32rem]">
                <Link href={`/people/${b.id}`} className="no-underline hover:text-[var(--burgundy-i)]">
                  {b.name}
                </Link>
              </h2>
              <p className="inst-body mt-2 grow">{b.standfirst}</p>
              <p className="inst-meta mt-3 border-t border-[var(--rule)] pt-3">
                {memberCount(b.id)} on record · {recordedLabel(b)}
              </p>
              <div className="mt-2">
                <Link href={`/people/${b.id}`} className="inst-link">See who holds office →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="inst-alt inst-rule">
        <div className="inst-wrap inst-sec grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div>
            <h2 className="inst-h2">Every one of these can be claimed</h2>
            <p className="inst-body mt-3 max-w-2xl">
              Each entry publishes four things and no more: the name, the office, the body,
              and the record it came from. Nothing else &mdash; no photograph, no city, no
              contact. That is not an oversight. The rest of a person&rsquo;s profile belongs
              to them, and it appears when they claim the entry and write it themselves.
            </p>
            <p className="inst-body mt-3 max-w-2xl">
              Someone missing? Put the name forward. Someone here who should not be? Say so,
              and it comes down without argument.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/indigenes/submit?intent=add" className="inst-btn inst-btn-primary">Add a name</Link>
              <Link href="/indigenes" className="inst-btn inst-btn-quiet">Sons &amp; daughters</Link>
            </div>
          </div>
          <aside className="inst-card self-start p-5">
            <p className="inst-tag">Also on this site</p>
            <ul className="mt-3 list-none p-0">
              {[
                ['/indigenes', 'The Indigenes Directory', 'Sons and daughters worldwide, by quarter and by chapter'],
                ['/gudeca', 'GUDECA', 'The association, its chapters and its projects'],
                ['/palace', 'The Palace', 'The throne, the reigns and the record'],
                ['/diaspora', 'The diaspora', 'Where Guneku people are, country by country'],
              ].map(([href, label, blurb]) => (
                <li key={href} className="inst-row py-2.5">
                  <Link href={href} className="no-underline">
                    <span className="inst-h3 block !text-[0.98rem] hover:text-[var(--burgundy-i)]">{label}</span>
                    <span className="inst-meta">{blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </main>
  )
}
