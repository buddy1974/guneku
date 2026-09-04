import { describe, it, expect, vi, beforeEach } from 'vitest'
import { allFoundingNames } from '@/lib/community'
import type { Role } from '@/lib/auth'

/* The two claim pages, tested for who is allowed to be there. Server components, so they are
   called as plain async functions with `redirect` mocked to throw the way Next's does. */

class Redirected extends Error {
  constructor(readonly to: string) { super(`redirect:${to}`) }
}
vi.mock('next/navigation', () => ({ redirect: (to: string) => { throw new Redirected(to) } }))

const optionalUser    = vi.fn()
const clerkConfigured = vi.fn()
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth')
  return { ...actual, optionalUser: () => optionalUser() }
})
vi.mock('@/lib/clerk-config', () => ({ clerkConfigured: () => clerkConfigured() }))

const findLiveClaim        = vi.fn()
const listPendingForReview = vi.fn()
vi.mock('@/lib/db/claims', () => ({
  findLiveClaim:        (...a: unknown[]) => findLiveClaim(...a),
  listPendingForReview: (...a: unknown[]) => listPendingForReview(...a),
}))
vi.mock('@/lib/db/members', () => ({ getMember: vi.fn().mockResolvedValue(null) }))

const NewClaimPage    = (await import('./my-guneku/claims/new/page')).default
const ReviewClaimsPage = (await import('./review/claims/page')).default

const NAMES    = allFoundingNames()
const LIVING   = NAMES.find(n => n.deceased !== true)!
const DECEASED = NAMES.find(n => n.deceased === true)!

const session = (role: Role, userId = 'user_1') => ({ userId, role })

beforeEach(() => {
  vi.clearAllMocks()
  clerkConfigured.mockReturnValue(true)
  optionalUser.mockResolvedValue(session('member'))
  findLiveClaim.mockResolvedValue(null)
  listPendingForReview.mockResolvedValue([])
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

async function redirectFrom(run: () => Promise<unknown>): Promise<string | null> {
  try { await run(); return null } catch (err) {
    if (err instanceof Redirected) return err.to
    throw err
  }
}

describe('/my-guneku/claims/new', () => {
  const sp = (person?: string) => Promise.resolve({ person })

  it('sends a signed-out visitor to sign in, keeping the record they meant to claim', async () => {
    optionalUser.mockResolvedValue(null)
    const to = await redirectFrom(() => NewClaimPage({ searchParams: sp(LIVING.slug) }))

    expect(to).toContain('/sign-in?redirect_url=')
    expect(decodeURIComponent(String(to))).toContain(`/my-guneku/claims/new?person=${LIVING.slug}`)
  })

  it('never touches the database for a signed-out visitor', async () => {
    optionalUser.mockResolvedValue(null)
    await redirectFrom(() => NewClaimPage({ searchParams: sp(LIVING.slug) }))
    expect(findLiveClaim).not.toHaveBeenCalled()
  })

  it('renders the request for a signed-in member and an eligible record', async () => {
    await expect(NewClaimPage({ searchParams: sp(LIVING.slug) })).resolves.toBeTruthy()
    expect(findLiveClaim).toHaveBeenCalledWith('user_1', LIVING.slug)
  })

  /* The page must refuse a deceased record even to a signed-in member who typed the URL. */
  it('refuses a deceased record and never asks the database about it', async () => {
    await expect(NewClaimPage({ searchParams: sp(DECEASED.slug) })).resolves.toBeTruthy()
    expect(findLiveClaim).not.toHaveBeenCalled()
  })

  it('refuses a record that is not in the register', async () => {
    await expect(NewClaimPage({ searchParams: sp('no-such-person') })).resolves.toBeTruthy()
    expect(findLiveClaim).not.toHaveBeenCalled()
  })

  it('refuses when no record was named at all', async () => {
    await expect(NewClaimPage({ searchParams: sp() })).resolves.toBeTruthy()
    expect(findLiveClaim).not.toHaveBeenCalled()
  })

  it('still renders when the claim table cannot be read', async () => {
    findLiveClaim.mockRejectedValue(Object.assign(new Error('no table'), { code: '42P01' }))
    await expect(NewClaimPage({ searchParams: sp(LIVING.slug) })).resolves.toBeTruthy()
  })
})

describe('/review/claims', () => {
  it('sends a signed-out visitor to sign in', async () => {
    optionalUser.mockResolvedValue(null)
    const to = await redirectFrom(() => ReviewClaimsPage())

    expect(to).toBe('/sign-in?redirect_url=%2Freview%2Fclaims')
    expect(listPendingForReview).not.toHaveBeenCalled()
  })

  /* A member and a contributor are sent away rather than shown an empty queue: an empty
     queue says "there is nothing here", and the truth is that it is not theirs to see. */
  it.each(['member', 'contributor'] as const)('turns a %s away without reading the queue', async role => {
    optionalUser.mockResolvedValue(session(role))
    const to = await redirectFrom(() => ReviewClaimsPage())

    expect(to).toBe('/my-guneku')
    expect(listPendingForReview).not.toHaveBeenCalled()
  })

  it.each(['reviewer', 'palace-admin'] as const)('lets a %s in', async role => {
    optionalUser.mockResolvedValue(session(role))
    await expect(ReviewClaimsPage()).resolves.toBeTruthy()
    expect(listPendingForReview).toHaveBeenCalled()
  })

  it('still renders when the queue cannot be read', async () => {
    optionalUser.mockResolvedValue(session('reviewer'))
    listPendingForReview.mockRejectedValue(new Error('unreachable'))
    await expect(ReviewClaimsPage()).resolves.toBeTruthy()
  })

  it('shows the honest notice rather than throwing when Clerk is unconfigured', async () => {
    clerkConfigured.mockReturnValue(false)
    await expect(ReviewClaimsPage()).resolves.toBeTruthy()
    expect(optionalUser).not.toHaveBeenCalled()
  })
})
