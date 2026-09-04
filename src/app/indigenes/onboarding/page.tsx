import { redirect } from 'next/navigation'
import { optionalUser } from '@/lib/auth'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { profileExists } from '@/lib/db/queries'
import { OnboardingForm } from './OnboardingForm'

/* One person's own journey, decided per request. Never prerendered into the public build. */
export const dynamic = 'force-dynamic'

const SIGN_IN = '/sign-in?redirect_url=%2Findigenes%2Fonboarding'

/* Creating your entry in the indigenes directory.
 *
 * Until 2026-09-04 this page was public while the write behind it required a session, so a
 * signed-out villager could fill in five steps and press "Publish my profile" to no effect
 * whatsoever — the POST answered 401 and the form had no branch for it. The gate now sits at
 * the front of the journey, in two places: the middleware matcher redirects before the page
 * renders, and this check runs again on the server in case the matcher is ever edited by
 * mistake. A matcher is configuration; this is the lock.
 *
 * The second question this page answers is whether the member already has a profile. The
 * UNIQUE constraint on clerk_user_id would catch a second create either way, but a database
 * constraint is a last line, not a user experience: someone who already has a profile should
 * be taken to it, not walked through five steps to be refused at the end. */
export default async function OnboardingPage() {
  if (!clerkConfigured()) return <MemberAreaNotice title="Profile registration is not open yet" />

  const user = await optionalUser()
  if (!user) redirect(SIGN_IN)

  /* If this throws, the database is unconfigured or unmigrated. The form is still shown: the
     POST it makes has its own honest 503 for that case, and refusing to render the page would
     tell the member less than letting them try and be told why. */
  let hasProfile = false
  try {
    hasProfile = await profileExists(user.userId)
  } catch (err) {
    console.error('Onboarding could not check for an existing profile:', err)
  }

  if (hasProfile) redirect('/indigenes/profile')

  return <OnboardingForm />
}
