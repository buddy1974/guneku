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

const listPendingContributions = vi.fn()
vi.mock('@/lib/db/contributions', () => ({
  listPendingContributions: (...a: unknown[]) => listPendingContributions(...a),
}))

const listForPalace = vi.fn()
vi.mock('@/lib/db/correspondence', () => ({
  listForPalace: (...a: unknown[]) => listForPalace(...a),
}))
vi.mock('@/lib/db/members', () => ({ getMember: vi.fn().mockResolvedValue(null) }))

const NewClaimPage    = (await import('./my-guneku/claims/new/page')).default
const ReviewClaimsPage = (await import('./review/claims/page')).default
const ReviewContributionsPage = (await import('./review/contributions/page')).default
const ContributePage = (await import('./my-guneku/contribute/new/page')).default
const PalaceCorrespondencePage = (await import('./review/correspondence/page')).default

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
  listPendingContributions.mockResolvedValue([])
  listForPalace.mockResolvedValue([])
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

describe('/review/contributions', () => {
  it('sends a signed-out visitor to sign in', async () => {
    optionalUser.mockResolvedValue(null)
    const to = await redirectFrom(() => ReviewContributionsPage())

    expect(to).toBe('/sign-in?redirect_url=%2Freview%2Fcontributions')
    expect(listPendingContributions).not.toHaveBeenCalled()
  })

  /* Being able to submit a contribution is not being able to decide one. */
  it.each(['member', 'contributor'] as const)('turns a %s away without reading the queue', async role => {
    optionalUser.mockResolvedValue(session(role))
    const to = await redirectFrom(() => ReviewContributionsPage())

    expect(to).toBe('/my-guneku')
    expect(listPendingContributions).not.toHaveBeenCalled()
  })

  it.each(['reviewer', 'palace-admin'] as const)('lets a %s in', async role => {
    optionalUser.mockResolvedValue(session(role))
    await expect(ReviewContributionsPage()).resolves.toBeTruthy()
    expect(listPendingContributions).toHaveBeenCalled()
  })

  it('still renders when the queue cannot be read', async () => {
    optionalUser.mockResolvedValue(session('reviewer'))
    listPendingContributions.mockRejectedValue(new Error('unreachable'))
    await expect(ReviewContributionsPage()).resolves.toBeTruthy()
  })
})

describe('/my-guneku/contribute/new', () => {
  const sp = (q: Record<string, string> = {}) => Promise.resolve(q)

  it('sends a signed-out visitor to sign in, keeping the whole context', async () => {
    optionalUser.mockResolvedValue(null)
    const to = await redirectFrom(() => ContributePage({
      searchParams: sp({ type: 'quarter-information', targetType: 'quarter', targetId: 'Fun' }),
    }))

    const decoded = decodeURIComponent(String(to))
    expect(decoded).toContain('/my-guneku/contribute/new')
    expect(decoded).toContain('targetId=Fun')
    expect(decoded).toContain('type=quarter-information')
  })

  it('renders the form for a signed-in member', async () => {
    await expect(ContributePage({ searchParams: sp() })).resolves.toBeTruthy()
  })

  /* A crafted query string must not produce a contribution about a place that does not
     exist — it falls back to the general record rather than erroring at the villager. */
  it('falls back to the general record for an invented target', async () => {
    await expect(ContributePage({
      searchParams: sp({ targetType: 'quarter', targetId: 'Atlantis' }),
    })).resolves.toBeTruthy()
  })

  it('accepts a canonical quarter target', async () => {
    await expect(ContributePage({
      searchParams: sp({ targetType: 'quarter', targetId: 'Fun' }),
    })).resolves.toBeTruthy()
  })
})

describe('/review/correspondence — Palace business, not record review', () => {
  it('sends a signed-out visitor to sign in', async () => {
    optionalUser.mockResolvedValue(null)
    const to = await redirectFrom(() => PalaceCorrespondencePage())

    expect(to).toBe('/sign-in?redirect_url=%2Freview%2Fcorrespondence')
    expect(listForPalace).not.toHaveBeenCalled()
  })

  /* The distinction this phase turns on. Deciding what the register says is not authority
     to answer a villager's private letter on the Fondom's behalf. */
  it.each(['member', 'contributor', 'reviewer'] as const)(
    'turns a %s away without reading the queue', async role => {
      optionalUser.mockResolvedValue(session(role))
      const to = await redirectFrom(() => PalaceCorrespondencePage())

      expect(to).toBe('/my-guneku')
      expect(listForPalace).not.toHaveBeenCalled()
    },
  )

  it('lets a palace-admin in', async () => {
    optionalUser.mockResolvedValue(session('palace-admin'))
    await expect(PalaceCorrespondencePage()).resolves.toBeTruthy()
    expect(listForPalace).toHaveBeenCalled()
  })

  it('still renders when correspondence cannot be read', async () => {
    optionalUser.mockResolvedValue(session('palace-admin'))
    listForPalace.mockRejectedValue(new Error('unreachable'))
    await expect(PalaceCorrespondencePage()).resolves.toBeTruthy()
  })
})
