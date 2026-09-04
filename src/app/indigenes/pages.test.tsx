import { describe, it, expect, vi, beforeEach } from 'vitest'

/* The two member-owned pages under /indigenes, tested for the one thing that matters before
 * anything renders: who is allowed to be here, and where the wrong person is sent.
 *
 * These are server components, so they are called as plain async functions. `redirect` is
 * mocked to throw the way Next's real one does — it never returns — which is also what makes
 * "the page stopped here" observable. */

class Redirected extends Error {
  constructor(readonly to: string) { super(`redirect:${to}`) }
}

vi.mock('next/navigation', () => ({
  redirect: (to: string) => { throw new Redirected(to) },
}))

const optionalUser    = vi.fn()
const clerkConfigured = vi.fn()
const profileExists   = vi.fn()
const getProfileByClerkId = vi.fn()

vi.mock('@/lib/auth', () => ({ optionalUser: () => optionalUser() }))
vi.mock('@/lib/clerk-config', () => ({ clerkConfigured: () => clerkConfigured() }))
vi.mock('@/lib/db/queries', () => ({
  profileExists:       (...a: unknown[]) => profileExists(...a),
  getProfileByClerkId: (...a: unknown[]) => getProfileByClerkId(...a),
}))

const OnboardingPage = (await import('./onboarding/page')).default
const ProfilePage    = (await import('./profile/page')).default

const SESSION = { userId: 'user_owner', role: 'member' as const }

beforeEach(() => {
  vi.clearAllMocks()
  clerkConfigured.mockReturnValue(true)
  optionalUser.mockResolvedValue(SESSION)
  profileExists.mockResolvedValue(false)
  getProfileByClerkId.mockResolvedValue(null)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

async function redirectFrom(run: () => Promise<unknown>): Promise<string | null> {
  try { await run(); return null } catch (err) {
    if (err instanceof Redirected) return err.to
    throw err
  }
}

describe('/indigenes/onboarding', () => {
  it('sends a signed-out visitor to sign in before they fill in anything', async () => {
    optionalUser.mockResolvedValue(null)
    const to = await redirectFrom(() => OnboardingPage())
    expect(to).toBe('/sign-in?redirect_url=%2Findigenes%2Fonboarding')
  })

  it('brings them back to onboarding afterwards, not to a generic landing', async () => {
    optionalUser.mockResolvedValue(null)
    const to = await redirectFrom(() => OnboardingPage())
    expect(decodeURIComponent(String(to))).toContain('redirect_url=/indigenes/onboarding')
  })

  it('never asks the database anything about a signed-out visitor', async () => {
    optionalUser.mockResolvedValue(null)
    await redirectFrom(() => OnboardingPage())
    expect(profileExists).not.toHaveBeenCalled()
  })

  it('checks for an existing profile under the session id', async () => {
    await OnboardingPage()
    expect(profileExists).toHaveBeenCalledWith('user_owner')
  })

  it('sends a member who already has a profile to it, instead of five wasted steps', async () => {
    profileExists.mockResolvedValue(true)
    const to = await redirectFrom(() => OnboardingPage())
    expect(to).toBe('/indigenes/profile')
  })

  it('still renders the form when the profile check itself fails', async () => {
    profileExists.mockRejectedValue(Object.assign(new Error('no table'), { code: '42P01' }))
    await expect(OnboardingPage()).resolves.toBeTruthy()
  })

  it('shows the honest notice rather than throwing when Clerk is unconfigured', async () => {
    clerkConfigured.mockReturnValue(false)
    await expect(OnboardingPage()).resolves.toBeTruthy()
    expect(optionalUser).not.toHaveBeenCalled()
  })
})

describe('/indigenes/profile', () => {
  const search = async (created?: string) => ({ created })

  it('sends a signed-out visitor to sign in', async () => {
    optionalUser.mockResolvedValue(null)
    const to = await redirectFrom(() => ProfilePage({ searchParams: search() }))
    expect(to).toBe('/sign-in?redirect_url=%2Findigenes%2Fprofile')
  })

  it('never reads a profile for a signed-out visitor', async () => {
    optionalUser.mockResolvedValue(null)
    await redirectFrom(() => ProfilePage({ searchParams: search() }))
    expect(getProfileByClerkId).not.toHaveBeenCalled()
  })

  /* There is no id in the route and no id in the query string. The only identity this page
     can use is the session's, which is the whole of the ownership guarantee. */
  it('reads only the session holder’s own profile', async () => {
    await ProfilePage({ searchParams: search() })
    expect(getProfileByClerkId).toHaveBeenCalledWith('user_owner')
  })

  it('renders rather than failing when the member has no profile yet', async () => {
    await expect(ProfilePage({ searchParams: search() })).resolves.toBeTruthy()
  })

  it('renders rather than failing when the directory is unreachable', async () => {
    getProfileByClerkId.mockRejectedValue(new Error('unreachable'))
    await expect(ProfilePage({ searchParams: search() })).resolves.toBeTruthy()
  })
})
