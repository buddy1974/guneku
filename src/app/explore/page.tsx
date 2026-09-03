import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { pageMetadata } from '@/lib/seo'
import { GunekuMap } from '@/components/explore/GunekuMap'
import {
  mappableLocations, locationsByType, omittedLayers, unmappedLocations,
  TYPE_LABEL, exploreMeta,
} from '@/lib/explore'

export const metadata = pageMetadata({
  title: 'Explore Guneku',
  description:
    'The places of Guneku — the village, the Palace, the health centres, the markets, the rivers and the work under way — mapped where a position is recorded and listed where it is not.',
  path: '/explore',
})

export default function ExplorePage() {
  const mapped   = mappableLocations()
  const unmapped = unmappedLocations()
  const groups   = locationsByType()
  const omitted  = omittedLayers()
  const meta     = exploreMeta()

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label="EXPLORE"
        title="The places of Guneku"
        subtitle="Where the village is, and where the things in its record stand — as far as the record actually says."
      />

      {/* ── The map, and an honest account of what it can show ── */}
      <section className="inst-wrap inst-sec">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <GunekuMap locations={mapped} />

          <aside className="self-start">
            <h2 className="inst-h3">Why there is one marker</h2>
            <p className="inst-body mt-2 !text-[0.9rem]">
              {meta.state}
            </p>
            <p className="inst-body mt-3 !text-[0.9rem]">
              An approximate pin is not a rougher version of the truth about where a health
              centre stands &mdash; it is a different claim, and a wrong one. So nothing is
              estimated. The {unmapped.length} places below have no recorded position and are
              listed rather than drawn.
            </p>
            <div className="mt-4 border-t border-[var(--rule)] pt-4">
              <p className="inst-eyebrow">Know where something is?</p>
              <p className="inst-body mt-1.5 !text-[0.88rem]">
                If you can give the position of the Palace, a health centre, a market or a
                school, the map can grow from the record rather than from guesswork.
              </p>
              <Link href="/indigenes/submit?intent=add" className="inst-link mt-2 inline-block">
                Contribute a location →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ── The list. This is the authoritative view, not a fallback. ── */}
      <section className="inst-alt border-y border-[var(--rule)]">
        <div className="inst-wrap inst-sec">
          <h2 className="inst-h2">Every place in the record</h2>
          <p className="inst-body mt-2 max-w-2xl">
            The full list, whether or not it can be drawn. Each entry says where its position
            came from, or why there is none.
          </p>

          <div className="mt-8 grid gap-10 md:grid-cols-2">
            {groups.map(group => (
              <section key={group.type} aria-labelledby={`grp-${group.type}`}>
                <h3 id={`grp-${group.type}`} className="inst-eyebrow">
                  {TYPE_LABEL[group.type]}
                </h3>
                <ul className="mt-2.5 list-none p-0">
                  {group.items.map(l => (
                    <li key={l.id} className="inst-row">
                      <div className="py-3.5">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <Link href={l.publicUrl}
                                className="inst-h3 !text-[1.02rem] no-underline hover:text-[var(--royal-green)]">
                            {l.name}
                          </Link>
                          {l.coordinate ? (
                            <span className="inst-status st-active">On the map</span>
                          ) : (
                            <span className="inst-meta">No position recorded</span>
                          )}
                        </div>
                        <p className="inst-body mt-1.5 !text-[0.86rem]">{l.description}</p>
                        {l.quarter && (
                          <p className="inst-meta mt-1">
                            Quarter:{' '}
                            <Link href={`/quarters/${l.quarter.toLowerCase().replace(/\s+/g, '-')}`}
                                  className="inst-link">{l.quarter}</Link>
                          </p>
                        )}
                        <p className="inst-meta mt-1">
                          {l.coordinate ? l.precisionNote : l.reason}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* ── What is deliberately not a layer ── */}
      <section className="inst-wrap inst-sec">
        <h2 className="inst-h2">Layers that are not here, and why</h2>
        <p className="inst-body mt-2 max-w-2xl">
          A map invites you to believe it is complete. These are the things a reader might
          expect to find and will not, with the reason in each case.
        </p>
        <ul className="mt-6 list-none p-0">
          {omitted.map(o => (
            <li key={o.what} className="inst-row">
              <div className="py-3.5">
                <p className="inst-h3 !text-[1rem]">{o.what}</p>
                <p className="inst-body mt-1.5 max-w-3xl !text-[0.88rem]">{o.why}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-[var(--rule)] pt-6">
          <p className="inst-meta">{meta.attribution}</p>
        </div>
      </section>
    </main>
  )
}
