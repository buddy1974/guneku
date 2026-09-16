import Link from 'next/link'
import { redirect } from 'next/navigation'
import { optionalUser } from '@/lib/auth'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { optionalVerifiedGunekuan } from '@/lib/business-auth'
import { listMyBusinesses } from '@/lib/db/businesses'
import { CATEGORY_LABEL, locationLabel } from '@/lib/businesses'
import type { BusinessRow } from '@/lib/db/businesses'
import { ArchiveBusinessButton } from './ArchiveBusinessButton'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My businesses',
  robots: { index: false, follow: false },
}

const STATUS_LABEL: Record<string, string> = {
  draft:    'Draft',
  pending:  'Waiting for the Palace',
  public:   'On the directory',
  held:     'Held',
  archived: 'Withdrawn',
}

const STATUS_NOTE: Record<string, string> = {
  draft:    'Not yet submitted.',
  pending:  'Registered. It appears on the public directory once somebody at the Palace has looked at it. You can keep editing it in the meantime.',
  public:   'Anybody can find this on the directory.',
  held:     'Kept, but not shown on the directory. The Palace can say why.',
  archived: 'Withdrawn from the directory.',
}

/* Where somebody manages the businesses they have registered.
 *
 * Deliberately separate from browsing. A person here is doing administration on their own
 * records, and mixing that into the public directory is how a reader ends up looking at
 * somebody's draft. */
export default async function MyBusinessesPage() {
  if (!clerkConfigured()) return <MemberAreaNotice title="The member area is not open yet" />

  const user = await optionalUser()
  if (!user) redirect('/sign-in?redirect_url=/my-guneku/businesses')

  const verified = await optionalVerifiedGunekuan()

  let businesses: BusinessRow[] = []
  let unavailable = false
  if (verified) {
    try {
      businesses = await listMyBusinesses(verified.userId)
    } catch (err) {
      /* The directory's own table may not exist yet. Say the honest thing rather than a
         fault — nothing the member did is wrong, and nothing they typed was lost. */
      console.error('My businesses unavailable:', err)
      unavailable = true
    }
  }

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <section className="inst-wrap inst-sec">
        <p className="inst-eyebrow">My Guneku</p>
        <h1 className="inst-h1 mt-2">My businesses</h1>
        <p className="inst-body mt-3 max-w-2xl">
          The businesses you have put on the Guneku Business Directory, and their state.
          Anything here is yours &mdash; you can change it or withdraw it whenever you like.
        </p>

        {!verified ? (
          /* No moderation state is revealed: not whether they have a claim, not whether one
             is pending. A refusal is not a place to describe somebody's identity review. */
          <div className="inst-card mt-8 max-w-[38rem] p-6">
            <p className="inst-tag">Not open to this account yet</p>
            <h2 className="inst-h2 mt-2 !text-[1.35rem]">
              Business registration is available to verified Gunekuans
            </h2>
            <p className="inst-body mt-3">
              The directory says, on every card, that these are the businesses of sons and
              daughters of Guneku. So it asks for one thing first: that the Palace has
              confirmed which son or daughter you are, by reviewing your claim to an entry in
              the Indigenes register.
            </p>
            <p className="inst-body mt-3">
              If your name is in the register, claim it and the Palace will review it. If it
              is not there yet, put it forward &mdash; anybody may.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/indigenes" className="inst-btn inst-btn-primary">
                Find your name in the register
              </Link>
              <Link href="/indigenes/submit?intent=add" className="inst-btn inst-btn-quiet">
                Put a name forward
              </Link>
            </div>
            <p className="inst-meta mt-5">
              Browsing the directory needs no account at all &mdash;{' '}
              <Link href="/businesses" className="inst-link">it is open to everyone</Link>.
            </p>
          </div>
        ) : unavailable ? (
          <div className="inst-card mt-8 max-w-[38rem] p-6">
            <p className="inst-tag">Not open yet</p>
            <h2 className="inst-h2 mt-2 !text-[1.35rem]">Registration opens shortly</h2>
            <p className="inst-body mt-3">
              Your identity is confirmed and this page is yours. Registering a business is not
              switched on yet; the directory itself is already open to read.
            </p>
            <Link href="/businesses" className="inst-btn inst-btn-quiet mt-5">
              Browse the directory
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/my-guneku/businesses/new" className="inst-btn inst-btn-primary">
                {businesses.length > 0 ? 'Register another business' : 'Register your business'}
              </Link>
              <Link href="/businesses" className="inst-link">The public directory →</Link>
            </div>

            {businesses.length === 0 ? (
              <div className="inst-card mt-7 max-w-[38rem] p-6">
                <p className="inst-h3">Nothing here yet</p>
                <p className="inst-body mt-2">
                  You are verified as {verified.personDisplay}, so you can add a business
                  whenever you are ready. Let Guneku sons and daughters know what you do.
                </p>
              </div>
            ) : (
              <ul className="mt-7 grid list-none gap-4 p-0 sm:grid-cols-2">
                {businesses.map(b => (
                  <li key={b.id} className="inst-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="inst-tag">{CATEGORY_LABEL[b.category]}</p>
                      <span className="biz-chip">{STATUS_LABEL[b.status] ?? b.status}</span>
                    </div>
                    <h2 className="inst-h3 mt-1.5">{b.name}</h2>
                    {b.tagline && <p className="inst-body mt-1 !text-[0.88rem]">{b.tagline}</p>}
                    {locationLabel({ country: b.country ?? '', city: b.city ?? undefined }) && (
                      <p className="inst-meta mt-1.5">
                        {locationLabel({ country: b.country ?? '', city: b.city ?? undefined })}
                      </p>
                    )}
                    <p className="inst-meta mt-3">{STATUS_NOTE[b.status]}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[var(--rule)] pt-3">
                      <Link href={`/my-guneku/businesses/${b.id}/edit`} className="inst-link text-[0.85rem]">
                        Edit
                      </Link>
                      {b.status === 'public' && (
                        <Link href={`/businesses/${b.slug}`} className="inst-link text-[0.85rem]">
                          View
                        </Link>
                      )}
                      <ArchiveBusinessButton id={b.id} name={b.name} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  )
}
