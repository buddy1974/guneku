import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BusinessCover, BusinessLogo, BusinessCard } from '@/components/business/BusinessCard'
import { BusinessVideos } from '@/components/business/BusinessVideos'
import { pageMetadata } from '@/lib/seo'
import { PageGraph } from '@/components/seo/PageGraph'
import { businessId, businessNode } from '@/lib/schema'
import { publicBusinessForDisplay, publicBusinessesForDisplay } from '@/lib/business-directory'
import {
  CATEGORY_LABEL, locationLabel, displayUrl, resolveBusinessPeople, relatedBusinesses,
  publicCuratedBusinesses,
} from '@/lib/businesses'

/* One business.
 *
 * Every section below is conditional on its data, and that is the whole layout rule: a
 * heading with nothing under it tells a reader the business is incomplete, which is a thing
 * to say about a person's livelihood only if it is true and useful. Most of these businesses
 * have three or four sections. That is a short page, and a short page that is entirely real
 * beats a long one padded with "Information not available". */

/** Only the curated businesses are pre-rendered. A registered one is rendered on demand,
 *  because it can be published at any moment by a reviewer and should not wait for a build. */
export async function generateStaticParams() {
  return publicCuratedBusinesses().map(b => ({ slug: b.slug }))
}

export const dynamicParams = true
export const revalidate = 300

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const b = await publicBusinessForDisplay(slug)
  if (!b) return {}

  const place = locationLabel(b.location)
  return pageMetadata({
    title: b.name,
    description:
      b.tagline
      ?? `${b.name} — ${CATEGORY_LABEL[b.category]}${place ? ` in ${place}` : ''}. `
         + 'In the Guneku Business Directory.',
    path: `/businesses/${slug}`,
  })
}

export default async function BusinessPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await publicBusinessForDisplay(slug)
  if (!business) notFound()

  const place = locationLabel(business.location)
  const people = resolveBusinessPeople(business)
  const all = await publicBusinessesForDisplay()
  const related = relatedBusinesses(all, business)

  const links = business.links ?? {}
  const socials: Array<[string, string]> = ([
    ['Facebook', links.facebook],
    ['Instagram', links.instagram],
    ['LinkedIn', links.linkedin],
    ['YouTube', links.youtube],
  ] as Array<[string, string | undefined]>)
    .filter((x): x is [string, string] => Boolean(x[1]))

  /* Only people the directory has reconciled to the register. A held name is a name the
     Fondom recorded and has not yet matched to anybody, and a graph is the last place to
     turn that into an identity. */
  const memberSlugs = (business.people ?? [])
    .map(p => p.personSlug)
    .filter((s): s is string => Boolean(s))

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      {/* No rating, no review, no price, no opening hours: this directory holds none of
          those, and a schema slot is not a reason to produce one. What goes in is what the
          page below shows. */}
      <PageGraph
        path={`/businesses/${slug}`}
        name={business.name}
        description={business.tagline ?? business.description}
        primaryEntity={businessId(business.slug)}
        trail={[{ name: 'Businesses', path: '/businesses' }]}
        image={business.cover ?? business.logo ?? null}
        nodes={[businessNode(business, memberSlugs)]}
      />

      {/* ── Hero ── */}
      <section className="inst-wrap pt-8 md:pt-10">
        <nav aria-label="Breadcrumb" className="inst-meta">
          <Link href="/businesses" className="inst-link">The Business Directory</Link>
          <span aria-hidden="true"> · </span>
          <span>{CATEGORY_LABEL[business.category]}</span>
        </nav>

        {/* Shorter when it is a generated placeholder: a 21:9 band of nothing is a lot of
            page to give to an image that does not exist. */}
        <div className={business.cover ? 'biz-hero-cover mt-4' : 'biz-hero-cover biz-hero-cover-plain mt-4'}>
          <BusinessCover business={business} priority bare />
        </div>

        {/* Above the cover, not under it. Without the stacking context the cover paints
            over the business name and cuts the heading in half. */}
        <div className="relative z-10 mt-[-1.75rem] flex flex-wrap items-end gap-4 px-1 sm:px-4">
          <BusinessLogo business={business} size="hero" />
          <div className="min-w-0 flex-1 pb-1">
            <h1 className="inst-h1 leading-tight">{business.name}</h1>
            {business.tagline && (
              <p className="inst-body mt-2 max-w-2xl">{business.tagline}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="biz-chip biz-chip-accent">{CATEGORY_LABEL[business.category]}</span>
          {place && <span className="biz-chip">{place}</span>}
          {(business.tags ?? []).slice(0, 4).map(t => (
            <span key={t} className="biz-chip">{t}</span>
          ))}
        </div>

        {(links.website || (business.contact?.phone || business.contact?.email)) && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {links.website && (
              <a
                href={links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inst-btn inst-btn-primary"
              >
                Visit {displayUrl(links.website)}
              </a>
            )}
            {business.contact?.phone && (
              <a href={`tel:${business.contact.phone.replace(/\s+/g, '')}`} className="inst-btn inst-btn-quiet">
                {business.contact.phone}
              </a>
            )}
            {business.contact?.email && (
              <a href={`mailto:${business.contact.email}`} className="inst-btn inst-btn-quiet">
                {business.contact.email}
              </a>
            )}
          </div>
        )}
      </section>

      <section className="inst-wrap inst-sec grid items-start gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
        <div>
          {business.description && (
            <>
              <h2 className="inst-h2">About</h2>
              <p className="inst-body mt-3 max-w-2xl">{business.description}</p>
            </>
          )}

          {(business.services ?? []).length > 0 && (
            <div className="mt-8">
              <h2 className="inst-h2">What they do</h2>
              <ul className="mt-4 grid list-none gap-0 p-0 sm:grid-cols-2">
                {business.services!.map(s => (
                  <li key={s} className="inst-row py-2.5 pr-4 text-[0.92rem] text-[var(--ink-900)]">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(business.videos ?? []).length > 0 && (
            <div className="mt-9">
              <h2 className="inst-h2">Watch</h2>
              <BusinessVideos videos={business.videos!} businessName={business.name} />
            </div>
          )}

          {business.sourceNote && (
            <p className="inst-meta mt-9 border-t border-[var(--rule)] pt-4">
              {business.sourceNote}
            </p>
          )}
        </div>

        <aside className="grid gap-5">
          {people.length > 0 && (
            <div className="inst-card p-5">
              <p className="inst-tag">The Guneku connection</p>
              <ul className="mt-3 list-none space-y-4 p-0">
                {people.map((p, i) => (
                  <li key={`${p.display}-${i}`}>
                    <p className="inst-h3 !text-[1rem]">
                      {p.href ? (
                        <Link href={p.href} className="no-underline hover:text-[var(--royal-green)]">
                          {p.display}
                        </Link>
                      ) : p.display}
                    </p>
                    <p className="inst-meta mt-0.5">{p.relationshipLabel}</p>
                    <p className="inst-body mt-1.5 !text-[0.84rem]">{p.evidence}</p>
                    {p.held && (
                      <p className="inst-meta mt-1.5 border-l-2 border-[var(--ochre)] pl-2.5">
                        Not yet matched to an entry in the Indigenes register.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(business.location || (business.serviceAreas ?? []).length > 0
            || (business.otherLocations ?? []).length > 0) && (
            <div className="inst-card p-5">
              <p className="inst-tag">Where</p>
              {business.location && (
                <div className="mt-3">
                  <p className="text-[0.92rem] text-[var(--ink-900)]">
                    {business.location.address && <>{business.location.address}<br /></>}
                    {place}
                  </p>
                </div>
              )}
              {(business.otherLocations ?? []).length > 0 && (
                <div className="mt-4 border-t border-[var(--rule)] pt-3">
                  <p className="inst-tag">Also at</p>
                  <ul className="mt-2 list-none space-y-1 p-0 text-[0.9rem] text-[var(--ink-900)]">
                    {business.otherLocations!.map(l => (
                      <li key={locationLabel(l) ?? ''}>{locationLabel(l)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(business.serviceAreas ?? []).length > 0 && (
                <div className="mt-4 border-t border-[var(--rule)] pt-3">
                  <p className="inst-tag">Serves</p>
                  <p className="inst-body mt-1.5 !text-[0.9rem]">
                    {business.serviceAreas!.join(' · ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {(links.website || socials.length > 0) && (
            <div className="inst-card p-5">
              <p className="inst-tag">Online</p>
              <ul className="mt-3 list-none space-y-2 p-0">
                {links.website && (
                  <li>
                    <a href={links.website} target="_blank" rel="noopener noreferrer" className="inst-link text-[0.9rem]">
                      {displayUrl(links.website)}
                    </a>
                  </li>
                )}
                {socials.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inst-link text-[0.9rem]">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="inst-card p-5">
            <p className="inst-tag">Is a business of yours missing?</p>
            <p className="inst-body mt-2 !text-[0.88rem]">
              Let Guneku sons and daughters know what you do.
            </p>
            <Link href="/my-guneku/businesses/new" className="inst-btn inst-btn-quiet mt-3">
              Register your business
            </Link>
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="inst-alt inst-rule">
          <div className="inst-wrap inst-sec">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="inst-h2">More Guneku businesses</h2>
              <Link href="/businesses" className="inst-link">The whole directory →</Link>
            </div>
            <div className="biz-grid mt-6">
              {related.map(b => <BusinessCard key={b.slug} business={b} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
