import Link from 'next/link'
import { redirect } from 'next/navigation'
import { optionalUser } from '@/lib/auth'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { getProfileByClerkId } from '@/lib/db/queries'
import { GUNEKU_QUARTERS, GENERATIONS } from '@/types/indigene'
import { ProfileEditor } from './ProfileEditor'

export const dynamic = 'force-dynamic'

const SIGN_IN = '/sign-in?redirect_url=%2Findigenes%2Fprofile'

/* A member's own entry in the indigenes directory.
 *
 * What stood here until 2026-09-04 was a placeholder reading "Member authentication coming
 * soon", which had stopped being true — authentication had been live for a day, and the
 * onboarding form's own confirmation email linked people to this page. So the directory
 * could be joined and never revisited: a villager could publish a profile about themselves
 * and then had no way to look at it, correct a typo in it, or take it down.
 *
 * This page is only ever the signed-in member's own profile. There is no id in the URL and
 * no way to ask for somebody else's: the row is fetched with the Clerk session's user id,
 * server-side, and `getProfileByClerkId` scopes its statement by that id. Whose profile this
 * is, is not a question the request gets to answer. */
export default async function MyIndigeneProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>
}) {
  if (!clerkConfigured()) return <MemberAreaNotice title="Your profile is not available yet" />

  const user = await optionalUser()
  /* The middleware already redirects here; this is the second lock, on the page itself. */
  if (!user) redirect(SIGN_IN)

  const justCreated = (await searchParams).created === '1'

  let profile = null
  let dataUnavailable = false
  try {
    profile = await getProfileByClerkId(user.userId)
  } catch (err) {
    /* Unconfigured or unmigrated database. Say so plainly rather than showing a fault. */
    console.error('Indigene profile unavailable:', err)
    dataUnavailable = true
  }

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      {/* ── Header ── */}
      <section className="inst-dark border-b border-[var(--rule)]">
        <div className="inst-wrap py-8">
          <p className="inst-eyebrow !text-white/60">Indigenes Directory</p>
          <h1 className="inst-h1 mt-1.5 !text-[2.2rem] !text-white">Your profile</h1>
          <p className="mt-2 max-w-xl text-[0.92rem] leading-[1.65] text-white/70">
            What the directory shows about you, in your own words. You decide what is on it
            and whether it is listed at all.
          </p>
          <p className="mt-4">
            <Link href="/my-guneku" className="text-[0.82rem] font-semibold text-white/75 underline underline-offset-4 hover:text-white">
              ← Back to My Guneku
            </Link>
          </p>
        </div>
      </section>

      {dataUnavailable ? (
        <section className="inst-wrap inst-sec">
          <div className="inst-card max-w-[38rem] p-6">
            <h2 className="inst-h3">Your profile cannot be loaded at the moment</h2>
            <p className="inst-body mt-2">
              The directory is not reachable in this environment, so nothing can be read back
              for the moment. You are signed in correctly, and the rest of Guneku.org works as
              normal.
            </p>
            <Link href="/indigenes" className="inst-btn inst-btn-quiet mt-4">
              Back to the directory
            </Link>
          </div>
        </section>
      ) : !profile ? (
        /* Signed in, nothing created yet. One clear way forward and no dead end. */
        <section className="inst-wrap inst-sec">
          <div className="inst-card max-w-[38rem] p-6">
            <p className="inst-tag">Not in the directory yet</p>
            <h2 className="inst-h2 mt-2">You have not created your profile</h2>
            <p className="inst-body mt-3">
              The indigenes directory is the record of Guneku sons and daughters at home and
              abroad. Creating your entry takes a few minutes, and everything on it stays
              yours to change or remove afterwards.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/indigenes/onboarding" className="inst-btn inst-btn-primary">
                Create my profile
              </Link>
              <Link href="/indigenes" className="inst-btn inst-btn-quiet">
                Browse the directory
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="inst-wrap inst-sec">
          {justCreated && (
            <p className="mb-6 max-w-[46rem] rounded-[3px] border border-[var(--royal-green)]/35 bg-[var(--royal-green)]/[0.06] px-4 py-3 text-[0.9rem] leading-[1.6] text-[var(--ink-900)]">
              <strong>Your profile has been created.</strong> It is below, and you can change
              any of it now or come back to it whenever you like.
            </p>
          )}
          <ProfileEditor
            profile={profile}
            quarters={GUNEKU_QUARTERS}
            generations={GENERATIONS}
          />
        </div>
      )}
    </main>
  )
}
