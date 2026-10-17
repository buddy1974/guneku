import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { BusinessDirectory } from '@/components/business/BusinessDirectory'
import { pageMetadata } from '@/lib/seo'
import { publicBusinessesForDisplay } from '@/lib/business-directory'
import { categoriesPresent, countriesPresent } from '@/lib/businesses'

export const metadata = pageMetadata({
  title: 'Guneku Business Directory',
  description:
    'Businesses, practices and ventures run by sons and daughters of Guneku — at home in '
    + 'Cameroon and across the world. Browse them, and add your own.',
  path: '/businesses',
})

/* The directory.
 *
 * Rendered on the server from two places at once: the businesses the Fondom has recorded, in
 * reviewed JSON, and the ones people have registered about themselves, in Neon. A reader sees
 * one directory. If the database is unreachable the curated half still renders and the page
 * says nothing about it — which is the behaviour `/indigenes` already has, and the reason
 * this section works on the day it ships rather than on the day a migration runs. */
export const revalidate = 300

export default async function BusinessesPage() {
  const businesses = await publicBusinessesForDisplay()

  const categories = categoriesPresent(businesses)
  const countries = countriesPresent(businesses)

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label="THE GUNEKU BUSINESS DIRECTORY"
        title="What Guneku sons and daughters are building"
        subtitle="From a fish farm at Wumfi-Ku to a care company in Hertfordshire — the businesses, practices and ventures of Guneku people, at home and across the world."
      />

      <section className="inst-wrap inst-sec">
        {/* The counts are counted. Nothing here claims a number the directory does not
            hold — a directory that opens by inflating itself has told you what it is. */}
        <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <div>
            <p className="inst-body max-w-2xl">
              Guneku people build things. Some of it is in the village &mdash; a breeding
              centre, a studio, a shop on the road. Much of it is far away, in cities where a
              son or daughter of Guneku went to work and ended up building something of their
              own. Until now none of it was written down in one place.
            </p>
            <p className="inst-body mt-3 max-w-2xl">
              This is that place. Browse it, and where you can, use it &mdash; the point of a
              village knowing what its own people do is that it can send work their way.
            </p>
          </div>

          <aside className="inst-card p-5">
            <p className="inst-tag">Is one of these yours?</p>
            <p className="inst-body mt-2 !text-[0.9rem]">
              Let Guneku sons and daughters know what you do. Registration is open to
              Gunekuans the Palace has verified &mdash; the same confirmation that connects
              your account to your name in the register.
            </p>
            <Link href="/my-guneku/businesses/new" className="inst-btn inst-btn-primary mt-4">
              Register your business
            </Link>
            <p className="inst-meta mt-3">
              {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} listed
              {countries.length > 1 ? ` in ${countries.length} countries` : ''}
              {categories.length > 0 ? ` · ${categories.length} categories` : ''}
            </p>
          </aside>
        </div>

        <div className="mt-10">
          {businesses.length > 0 ? (
            <BusinessDirectory businesses={businesses} />
          ) : (
            <div className="inst-card p-8 text-center">
              <p className="inst-h3">The directory opens with whoever adds the first name</p>
              <p className="inst-body mx-auto mt-2 max-w-md">
                No business has been published here yet. If you are a son or daughter of
                Guneku with a business, yours can be the one it opens with.
              </p>
              <Link href="/my-guneku/businesses/new" className="inst-btn inst-btn-primary mt-5">
                Register your business
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="inst-alt inst-rule">
        <div className="inst-wrap inst-sec">
          <h2 className="inst-h2">How our directory works</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <div>
              <p className="inst-tag">Our people, not advertisers</p>
              <p className="inst-body mt-2 !text-[0.9rem]">
                Nothing here is ranked, promoted or paid for. Every business is listed because a
                son or daughter of Guneku runs it, and none carries ratings or reviews.
              </p>
            </div>
            <div>
              <p className="inst-tag">Who is behind it</p>
              <p className="inst-body mt-2 !text-[0.9rem]">
                Each business names the son or daughter of Guneku behind it and links to their
                entry among our indigenes. Where that connection is still being confirmed, the
                page says so.
              </p>
            </div>
            <div>
              <p className="inst-tag">Business details, not private ones</p>
              <p className="inst-body mt-2 !text-[0.9rem]">
                A business shows its own address and the channels its owner chooses to share.
                Nobody&rsquo;s private telephone, email or home address appears here.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
