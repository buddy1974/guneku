import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { AuthError, atLeast, type Role } from '@/lib/auth'

/* Who may move a claim, and where it may move to.
 *
 * `requireRole` is not stubbed with a hand-written rule — it is reimplemented here over the
 * real `atLeast`, so the test exercises the actual privilege ordering. A change that made
 * `member` outrank `reviewer` would fail these tests rather than pass them. */

let SESSION_ROLE: Role = 'member'
const SESSION_ID = { current: 'user_claimant' }

const requireUser = vi.fn()
const requireRole = vi.fn()

vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth')
  return {
    ...actual,
    requireUser: () => requireUser(),
    requireRole: (min: Role) => requireRole(min),
  }
})

const withdrawOwnClaim  = vi.fn()
const getClaimForReview = vi.fn()
const decideClaim       = vi.fn()
vi.mock('@/lib/db/claims', async () => {
  const actual = await vi.importActual<typeof import('@/lib/db/claims')>('@/lib/db/claims')
  return {
    ...actual,
    withdrawOwnClaim:  (...a: unknown[]) => withdrawOwnClaim(...a),
    getClaimForReview: (...a: unknown[]) => getClaimForReview(...a),
    decideClaim:       (...a: unknown[]) => decideClaim(...a),
  }
})

vi.mock('@/lib/rate-limit', () => ({
  rateLimited: () => false, senderKey: () => 'test', RATE_LIMIT_MESSAGE: 'Too many requests.',
}))

const { PATCH } = await import('./route')

const CLAIM_ID = 'claim-1'
const ctx = { params: Promise.resolve({ id: CLAIM_ID }) }

const PENDING_ROW = {
  id: CLAIM_ID, clerk_user_id: 'user_claimant', person_slug: 'some-name',
  status: 'pending' as const, note: 'mine', created_at: 'x', updated_at: 'x',
  reviewed_at: null, reviewed_by: null,
}

const patch = (body: unknown) => new NextRequest(`https://www.guneku.org/api/claims/${CLAIM_ID}`, {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})

/* One place that decides what the session is, so each test just sets a role. */
function signInAs(role: Role, id = 'user_reviewer') {
  SESSION_ROLE = role
  SESSION_ID.current = id
}

beforeEach(() => {
  vi.clearAllMocks()
  signInAs('member', 'user_claimant')

  requireUser.mockImplementation(async () => ({ userId: SESSION_ID.current, role: SESSION_ROLE }))
  requireRole.mockImplementation(async (min: Role) => {
    const user = { userId: SESSION_ID.current, role: SESSION_ROLE }
    if (!atLeast(user.role, min)) throw new AuthError('You do not have access to that.', 403)
    return user
  })

  withdrawOwnClaim.mockResolvedValue({ id: CLAIM_ID, person_slug: 'some-name', status: 'withdrawn', note: null, created_at: 'x', reviewed_at: null })
  getClaimForReview.mockResolvedValue(PENDING_ROW)
  decideClaim.mockResolvedValue({ ...PENDING_ROW, status: 'approved', reviewed_by: 'user_reviewer' })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('signed out', () => {
  beforeEach(() => {
    requireUser.mockRejectedValue(new AuthError('Sign in to continue.', 401))
    requireRole.mockRejectedValue(new AuthError('Sign in to continue.', 401))
  })

  it.each(['withdraw', 'approve', 'reject'])('cannot %s', async action => {
    const res = await PATCH(patch({ action }), ctx)
    expect(res.status).toBe(401)
    expect(withdrawOwnClaim).not.toHaveBeenCalled()
    expect(decideClaim).not.toHaveBeenCalled()
  })
})

describe('who may review', () => {
  it.each(['member', 'contributor'] as const)('a %s cannot approve', async role => {
    signInAs(role)
    const res = await PATCH(patch({ action: 'approve' }), ctx)

    expect(res.status).toBe(403)
    expect(decideClaim).not.toHaveBeenCalled()
    expect(getClaimForReview).not.toHaveBeenCalled()
  })

  it.each(['member', 'contributor'] as const)('a %s cannot reject', async role => {
    signInAs(role)
    const res = await PATCH(patch({ action: 'reject' }), ctx)
    expect(res.status).toBe(403)
    expect(decideClaim).not.toHaveBeenCalled()
  })

  it.each(['reviewer', 'palace-admin'] as const)('a %s can approve', async role => {
    signInAs(role)
    const res = await PATCH(patch({ action: 'approve' }), ctx)

    expect(res.status).toBe(200)
    expect(decideClaim).toHaveBeenCalledWith(CLAIM_ID, 'approved', 'user_reviewer')
  })

  it.each(['reviewer', 'palace-admin'] as const)('a %s can reject', async role => {
    signInAs(role)
    const res = await PATCH(patch({ action: 'reject' }), ctx)

    expect(res.status).toBe(200)
    expect(decideClaim).toHaveBeenCalledWith(CLAIM_ID, 'rejected', 'user_reviewer')
  })

  it('asks for the reviewer role by name, not for a role from the body', async () => {
    signInAs('reviewer')
    await PATCH(patch({ action: 'approve', role: 'palace-admin' }), ctx)
    expect(requireRole).toHaveBeenCalledWith('reviewer')
  })
})

describe('nobody decides their own case', () => {
  /* Holding the reviewer role is not permission to approve yourself. A reviewer is also a
     son or daughter of Guneku and may perfectly well have a claim of their own waiting. */
  it('refuses a reviewer approving their own claim', async () => {
    signInAs('reviewer', 'user_claimant')
    getClaimForReview.mockResolvedValue({ ...PENDING_ROW, clerk_user_id: 'user_claimant' })

    const res = await PATCH(patch({ action: 'approve' }), ctx)

    expect(res.status).toBe(403)
    expect(decideClaim).not.toHaveBeenCalled()
    expect((await res.json()).error).toMatch(/cannot review your own claim/i)
  })

  it('refuses a palace-admin approving their own claim too', async () => {
    signInAs('palace-admin', 'user_boss')
    getClaimForReview.mockResolvedValue({ ...PENDING_ROW, clerk_user_id: 'user_boss' })

    const res = await PATCH(patch({ action: 'approve' }), ctx)
    expect(res.status).toBe(403)
    expect(decideClaim).not.toHaveBeenCalled()
  })

  it('refuses them rejecting their own claim as well', async () => {
    signInAs('reviewer', 'user_claimant')
    getClaimForReview.mockResolvedValue({ ...PENDING_ROW, clerk_user_id: 'user_claimant' })

    expect((await PATCH(patch({ action: 'reject' }), ctx)).status).toBe(403)
    expect(decideClaim).not.toHaveBeenCalled()
  })
})

describe('withdrawal', () => {
  it('is scoped to the claimant’s own id as well as the claim id', async () => {
    signInAs('member', 'user_claimant')
    const res = await PATCH(patch({ action: 'withdraw' }), ctx)

    expect(res.status).toBe(200)
    expect(withdrawOwnClaim).toHaveBeenCalledWith('user_claimant', CLAIM_ID)
  })

  it('needs no role at all — it is the claimant’s own request', async () => {
    signInAs('member', 'user_claimant')
    await PATCH(patch({ action: 'withdraw' }), ctx)
    expect(requireRole).not.toHaveBeenCalled()
  })

  /* Not yours, not there, already decided — one answer for all three, so guessing an id
     cannot confirm that somebody else's claim exists. */
  it('gives one indistinguishable answer when the update matches nothing', async () => {
    withdrawOwnClaim.mockResolvedValue(null)
    const res  = await PATCH(patch({ action: 'withdraw' }), ctx)
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body).toEqual({ error: 'That request can no longer be withdrawn.' })
  })
})

describe('invalid transitions and inputs', () => {
  it('refuses an unknown action before touching anything', async () => {
    signInAs('palace-admin')
    for (const action of ['delete', 'merge', 'APPROVE', '', null, 7]) {
      const res = await PATCH(patch({ action }), ctx)
      expect(res.status).toBe(400)
    }
    expect(decideClaim).not.toHaveBeenCalled()
    expect(withdrawOwnClaim).not.toHaveBeenCalled()
  })

  it('refuses a body that is not JSON at all', async () => {
    const bad = new NextRequest(`https://www.guneku.org/api/claims/${CLAIM_ID}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: 'not json',
    })
    expect((await PATCH(bad, ctx)).status).toBe(400)
  })

  it('answers 404 when a reviewer opens a claim that does not exist', async () => {
    signInAs('reviewer')
    getClaimForReview.mockResolvedValue(null)

    const res = await PATCH(patch({ action: 'approve' }), ctx)
    expect(res.status).toBe(404)
    expect(decideClaim).not.toHaveBeenCalled()
  })

  /* The UPDATE carries `AND status = 'pending'`, so the second of two simultaneous
     approvals changes no rows and is told so instead of silently winning. */
  it('reports a claim that is no longer pending rather than re-deciding it', async () => {
    signInAs('reviewer')
    decideClaim.mockResolvedValue(null)

    const res = await PATCH(patch({ action: 'approve' }), ctx)
    expect(res.status).toBe(409)
    expect((await res.json()).error).toMatch(/already been decided/i)
  })

  it('reports the one-approved-per-record index as a conflict, not a fault', async () => {
    signInAs('reviewer')
    decideClaim.mockRejectedValue(Object.assign(new Error('duplicate key value'), { code: '23505' }))

    const res  = await PATCH(patch({ action: 'approve' }), ctx)
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.error).toMatch(/already been approved/i)
    expect(JSON.stringify(body)).not.toContain('duplicate key')
  })
})

describe('what comes back', () => {
  it('never returns the reviewer’s identity to the browser', async () => {
    signInAs('reviewer')
    decideClaim.mockResolvedValue({ ...PENDING_ROW, status: 'approved', reviewed_by: 'user_reviewer' })

    const text = JSON.stringify(await (await PATCH(patch({ action: 'approve' }), ctx)).json())

    expect(text).not.toContain('reviewed_by')
    expect(text).not.toContain('user_reviewer')
    /* Nor the claimant's own Clerk id, which the row carries and the view does not. */
    expect(text).not.toContain('clerk_user_id')
    expect(text).not.toContain('user_claimant')
  })

  it('never returns a driver message', async () => {
    signInAs('reviewer')
    decideClaim.mockRejectedValue(new Error('connect ECONNREFUSED ep-secret.neon.tech:5432'))

    const res  = await PATCH(patch({ action: 'approve' }), ctx)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(JSON.stringify(body)).not.toContain('neon.tech')
  })
})
