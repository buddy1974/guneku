import Link from 'next/link'
import { publicBusinessesForDisplay } from '@/lib/business-directory'
import { BusinessCard } from '@/components/business/BusinessCard'

/* The Business Directory, on the front page.
 *
 * It was built, accepted and then effectively invisible: the homepage carried no link to it
 * at all, and the only way in was a nested item called "Business Directory" inside the
 * Initiatives dropdown. A directory nobody can find sends no work to anybody, which is the
 * whole reason it exists.
 *
 * Three real businesses rather than a bare button. A CTA on its own asks a visitor to take
 * the village's word for it; three cards show them what is actually there, and the cards are
 * the directory's own — same component, same placeholder handling — so the homepage cannot
 * drift into a second, prettier version of a business.
 *
 * The source is `publicBusinessesForDisplay()`, the same call `/businesses` makes. That is
 * deliberate and it is the whole safety argument: a held business cannot reach this section
 * without first becoming public in the directory, because there is no second dataset here to
 * get out of step. Nothing is hardcoded, so the preview follows the directory by itself.
 *
 * The count is read, not written down. Nine today; it moves when somebody registers.
 */

/** How many to show. Three fills the row at every breakpoint the directory grid uses. */
const PREVIEW = 3

export async function GunekuansInBusiness() {
  const businesses = await publicBusinessesForDisplay()

  /* No published business, no section. An empty showcase asking a visitor to explore
     nothing is worse than not raising the subject — and this is the state the directory
     opened in, so it is not hypothetical. */
  if (businesses.length === 0) return null

  const preview = businesses.slice(0, PREVIEW)

  return (
    <section
      className="inst-rule border-b border-[var(--rule)]"
      aria-labelledby="businesses-heading"
    >
      <div className="inst-wrap inst-sec">
        <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_auto] lg:gap-12">
          <div>
            <p className="inst-eyebrow">Gunekuans in business</p>
            <h2 id="businesses-heading" className="inst-h2 mt-1.5">
              Discover. Support. Connect.
            </h2>
            <div className="mt-3 flex items-center gap-2" aria-hidden>
              <span className="block h-0.5 w-9 bg-[var(--royal-green)]" />
              <span className="block h-0.5 w-4 bg-[var(--oxblood)]" />
            </div>
            {/* What the record supports and no more. Not every listing is in Guneku, and not
                every one is owned by the person named on it — some are led, operated or
                practised in — so the sentence says owned, led or operated. Nothing here
                claims a number of jobs or a sum of money, because the directory holds
                neither. */}
            <p className="inst-body mt-4 max-w-2xl">
              From the village itself to the towns and countries its people have settled in,
              sons and daughters of Guneku are running businesses, practices and ventures.
              The directory records the ones the Fondom has confirmed &mdash; owned, led or
              operated by Gunekuans &mdash; so that you can find them and put work their way,
              wherever in the world you are.
            </p>
          </div>

          <div className="lg:justify-self-end lg:pt-8">
            <Link href="/businesses" className="inst-btn inst-btn-primary">
              Explore Gunekuan businesses
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map(b => (
            <BusinessCard key={b.slug} business={b} />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-[var(--rule)] pt-4">
          <p className="inst-meta">
            {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} in the
            directory. Are you a Gunekuan business owner?{' '}
            {/* The existing registration route. It is not open to anybody with an account:
                the flow behind it requires an approved claim on a name in the register, and
                nothing here relaxes that — this is a link to the door, not a key. */}
            <Link href="/my-guneku/businesses/new" className="inst-link">
              Add your business
            </Link>
            .
          </p>
          <Link href="/businesses" className="inst-link">
            View all businesses &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
