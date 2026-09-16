import Link from 'next/link'
import { redirect } from 'next/navigation'
import { optionalUser } from '@/lib/auth'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { optionalVerifiedGunekuan } from '@/lib/business-auth'
import { BusinessForm } from '../BusinessForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Register a business',
  robots: { index: false, follow: false },
}

/* Registering a business.
 *
 * The page checks verification so a person is told plainly rather than shown a form that
 * refuses them at the end. The API checks it again and is the one that decides — this check
 * exists to be kind, that one exists to be true. */
export default async function NewBusinessPage() {
  if (!clerkConfigured()) return <MemberAreaNotice title="The member area is not open yet" />

  const user = await optionalUser()
  if (!user) redirect('/sign-in?redirect_url=/my-guneku/businesses/new')

  const verified = await optionalVerifiedGunekuan()

  if (!verified) {
    return (
      <main className="min-h-screen bg-[var(--paper)]">
        <section className="inst-wrap inst-sec">
          <div className="inst-card max-w-[38rem] p-6">
            <p className="inst-tag">Not open to this account yet</p>
            <h1 className="inst-h2 mt-2">
              Business registration is available to verified Gunekuans
            </h1>
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
              <Link href="/businesses" className="inst-btn inst-btn-quiet">
                Browse the directory
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <section className="inst-wrap inst-sec">
        <p className="inst-eyebrow">My Guneku</p>
        <h1 className="inst-h1 mt-2">Register your business</h1>
        <p className="inst-body mt-3 max-w-2xl">
          Let Guneku sons and daughters know what you do. You are registering as{' '}
          <strong className="text-[var(--ink-900)]">{verified.personDisplay}</strong>, which is
          the name the directory will show beside the business.
        </p>
        <p className="inst-meta mt-2">
          Only the name and the category are required. Everything else makes the page better
          and none of it holds up the save.
        </p>

        <div className="mt-8 max-w-[44rem]">
          <BusinessForm />
        </div>
      </section>
    </main>
  )
}
