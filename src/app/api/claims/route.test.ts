import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { AuthError } from '@/lib/auth'
import { allFoundingNames } from '@/lib/community'

/* Opening and listing claims. Clerk and Neon are mocked; the register is real, so eligibility
   is tested against the records the site actually publishes. */

const requireUser = vi.fn()
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth')
  return { ...actual, requireUser: () => requireUser() }
})

const listMyClaims  = vi.fn()
const findLiveClaim = vi.fn()
const createClaim   = vi.fn()
vi.mock('@/lib/db/claims', () => ({
  listMyClaims:  (...a: unknown[]) => listMyClaims(...a),
  findLiveClaim: (...a: unknown[]) => findLiveClaim(...a),
  createClaim:   (...a: unknown[]) => createClaim(...a),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimited: () => false, senderKey: () => 'test', RATE_LIMIT_MESSAGE: 'Too many requests.',
}))

const { GET, POST } = await import('./route')

const NAMES    = allFoundingNames()
const LIVING   = NAMES.find(n => n.deceased !== true)!
const DECEASED = NAMES.find(n => n.deceased === true)!

const SESSION = { userId: 'user_claimant', role: 'member' as const }
const CLAIM   = { id: 'c1', person_slug: LIVING.slug, status: 'pending', note: null, created_at: 'x', reviewed_at: null }

const post = (body: unknown) => new NextRequest('https://www.guneku.org/api/claims', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})

beforeEach(() => {
  vi.clearAllMocks()
  requireUser.mockResolvedValue(SESSION)
  listMyClaims.mockResolvedValue([])
  findLiveClaim.mockResolvedValue(null)
  createClaim.mockResolvedValue(CLAIM)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('signed out', () => {
  beforeEach(() => { requireUser.mockRejectedValue(new AuthError('Sign in to continue.', 401)) })

  it('cannot list claims', async () => {
    const res = await GET()
    expect(res.status).toBe(401)
    expect(listMyClaims).not.toHaveBeenCalled()
  })

  it('cannot open a claim, and never reaches the database', async () => {
    const res = await POST(post({ personSlug: LIVING.slug }))
    expect(res.status).toBe(401)
    expect(createClaim).not.toHaveBeenCalled()
    expect(findLiveClaim).not.toHaveBeenCalled()
  })
})

describe('the claimant is always the session', () => {
  it('lists only the session holder’s own claims', async () => {
    await GET()
    expect(listMyClaims).toHaveBeenCalledWith('user_claimant')
  })

  /* The defect this boundary exists to prevent. */
  it('ignores a claimant named in the body', async () => {
    await POST(post({
      personSlug: LIVING.slug,
      clerk_user_id: 'user_victim', clerkUserId: 'user_victim', userId: 'user_victim',
    }))
    expect(createClaim.mock.calls[0][0]).toBe('user_claimant')
    expect(findLiveClaim).toHaveBeenCalledWith('user_claimant', LIVING.slug)
  })

  it('ignores a role offered by the browser', async () => {
    await POST(post({ personSlug: LIVING.slug, role: 'palace-admin' }))
    expect(createClaim).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(createClaim.mock.calls[0])).not.toContain('palace-admin')
  })
})

describe('eligibility is enforced at the handler, not only in the page', () => {
  it('refuses a deceased record with 403 and respectful wording', async () => {
    const res  = await POST(post({ personSlug: DECEASED.slug }))
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(createClaim).not.toHaveBeenCalled()
    expect(body.error).toMatch(/kept as a record/i)
  })

  it('refuses a record that does not exist with 404', async () => {
    const res = await POST(post({ personSlug: 'no-such-person' }))
    expect(res.status).toBe(404)
    expect(createClaim).not.toHaveBeenCalled()
  })

  it('refuses a missing slug entirely', async () => {
    const res = await POST(post({}))
    expect(res.status).toBe(404)
    expect(createClaim).not.toHaveBeenCalled()
  })

  it('accepts a living record and stores the canonical slug, not the caller’s string', async () => {
    const res = await POST(post({ personSlug: ` ${LIVING.slug} ` }))
    expect(res.status).toBe(201)
    expect(createClaim.mock.calls[0][1]).toBe(LIVING.slug)
  })
})

describe('the claim that is created', () => {
  it('is pending, with the claimant’s note kept', async () => {
    await POST(post({ personSlug: LIVING.slug, note: '  My father was on the council.  ' }))
    expect(createClaim.mock.calls[0][2]).toBe('My father was on the council.')
  })

  it('accepts no note at all', async () => {
    await POST(post({ personSlug: LIVING.slug }))
    expect(createClaim.mock.calls[0][2]).toBeNull()
  })

  it('caps a very long note rather than refusing it', async () => {
    await POST(post({ personSlug: LIVING.slug, note: 'x'.repeat(5000) }))
    expect(String(createClaim.mock.calls[0][2]).length).toBe(1200)
  })
})

describe('duplicates', () => {
  it('refuses a second pending request and points at the member’s claims', async () => {
    findLiveClaim.mockResolvedValue({ ...CLAIM, status: 'pending' })
    const res  = await POST(post({ personSlug: LIVING.slug }))
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(createClaim).not.toHaveBeenCalled()
    expect(body.claimsUrl).toBe('/my-guneku')
  })

  it('says so plainly when the record is already theirs', async () => {
    findLiveClaim.mockResolvedValue({ ...CLAIM, status: 'approved' })
    const res = await POST(post({ personSlug: LIVING.slug }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toMatch(/already associated with your account/i)
  })

  /* Two tabs: the check passed twice and the partial unique index caught the second. */
  it('turns a lost race on the unique index into the same 409, never a 500', async () => {
    createClaim.mockRejectedValue(Object.assign(new Error('duplicate key value violates …'), { code: '23505' }))
    const res  = await POST(post({ personSlug: LIVING.slug }))
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(JSON.stringify(body)).not.toContain('duplicate key')
  })
})

describe('what a caller is told when something fails', () => {
  it('answers 503 for an unprovisioned table without naming the schema', async () => {
    listMyClaims.mockRejectedValue(Object.assign(new Error('relation "profile_claims" does not exist'), { code: '42P01' }))
    const res  = await GET()
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(JSON.stringify(body)).not.toContain('profile_claims')
  })

  it('never returns a driver message', async () => {
    listMyClaims.mockRejectedValue(new Error('password authentication failed for user "guneku" at ep-host.neon.tech'))
    const res  = await GET()
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body).toEqual({ error: 'Something went wrong. Please try again.' })
    expect(JSON.stringify(body)).not.toContain('neon.tech')
  })
})
