import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { AuthError, atLeast, type Role } from '@/lib/auth'
import { allFoundingNames } from '@/lib/community'
import { GUNEKU_QUARTERS_27 } from '@/lib/quarters'

/* Submitting and deciding contributions. Clerk and Neon are mocked; the canonical records
   are real, so target validation is tested against what the site actually publishes.

   `requireRole` is reimplemented over the real `atLeast`, so a change that made `member`
   outrank `reviewer` would fail these tests rather than pass them. */

let SESSION_ROLE: Role = 'member'
const SESSION_ID = { current: 'user_contributor' }

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

const listMyContributions     = vi.fn()
const createContribution      = vi.fn()
const withdrawOwnContribution = vi.fn()
const getContributionForReview = vi.fn()
const decideContribution      = vi.fn()
vi.mock('@/lib/db/contributions', async () => {
  const actual = await vi.importActual<typeof import('@/lib/db/contributions')>('@/lib/db/contributions')
  return {
    ...actual,
    listMyContributions:      (...a: unknown[]) => listMyContributions(...a),
    createContribution:       (...a: unknown[]) => createContribution(...a),
    withdrawOwnContribution:  (...a: unknown[]) => withdrawOwnContribution(...a),
    getContributionForReview: (...a: unknown[]) => getContributionForReview(...a),
    decideContribution:       (...a: unknown[]) => decideContribution(...a),
  }
})

vi.mock('@/lib/rate-limit', () => ({
  rateLimited: () => false, senderKey: () => 'test', RATE_LIMIT_MESSAGE: 'Too many requests.',
}))

const { GET, POST } = await import('./route')
const { PATCH }     = await import('./[id]/route')

const PERSON  = allFoundingNames().find(n => n.deceased !== true)!
const QUARTER = GUNEKU_QUARTERS_27[0]
const ID  = 'contrib-1'
const ctx = { params: Promise.resolve({ id: ID }) }

const ROW = {
  id: ID, clerk_user_id: 'user_contributor', type: 'correction' as const,
  target_type: 'quarter' as const, target_id: QUARTER,
  content: 'text', source_note: null, status: 'pending' as const,
  created_at: 'x', updated_at: 'x', reviewed_at: null, reviewed_by: null,
}

const post = (body: unknown) => new NextRequest('https://www.guneku.org/api/contributions', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})
const patch = (body: unknown) => new NextRequest(`https://www.guneku.org/api/contributions/${ID}`, {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})

const valid = {
  type: 'quarter-information', targetType: 'quarter', targetId: QUARTER,
  content: 'The council meets on the first Saturday.',
}

function signInAs(role: Role, id = 'user_reviewer') { SESSION_ROLE = role; SESSION_ID.current = id }

beforeEach(() => {
  vi.clearAllMocks()
  signInAs('member', 'user_contributor')
  requireUser.mockImplementation(async () => ({ userId: SESSION_ID.current, role: SESSION_ROLE }))
  requireRole.mockImplementation(async (min: Role) => {
    const u = { userId: SESSION_ID.current, role: SESSION_ROLE }
    if (!atLeast(u.role, min)) throw new AuthError('You do not have access to that.', 403)
    return u
  })
  listMyContributions.mockResolvedValue([])
  createContribution.mockResolvedValue({ id: ID, status: 'pending' })
  withdrawOwnContribution.mockResolvedValue({ id: ID, status: 'withdrawn' })
  getContributionForReview.mockResolvedValue(ROW)
  decideContribution.mockResolvedValue({ ...ROW, status: 'accepted', reviewed_by: 'user_reviewer' })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('signed out', () => {
  beforeEach(() => {
    requireUser.mockRejectedValue(new AuthError('Sign in to continue.', 401))
    requireRole.mockRejectedValue(new AuthError('Sign in to continue.', 401))
  })

  it('cannot list', async () => {
    expect((await GET()).status).toBe(401)
    expect(listMyContributions).not.toHaveBeenCalled()
  })

  it('cannot submit, and never reaches the database', async () => {
    expect((await POST(post(valid))).status).toBe(401)
    expect(createContribution).not.toHaveBeenCalled()
  })

  it.each(['withdraw', 'accept', 'reject'])('cannot %s', async action => {
    expect((await PATCH(patch({ action }), ctx)).status).toBe(401)
    expect(decideContribution).not.toHaveBeenCalled()
    expect(withdrawOwnContribution).not.toHaveBeenCalled()
  })
})

describe('the contributor is always the session', () => {
  it('lists only their own', async () => {
    await GET()
    expect(listMyContributions).toHaveBeenCalledWith('user_contributor')
  })

  it('ignores a submitter named in the body', async () => {
    await POST(post({ ...valid, clerk_user_id: 'user_victim', userId: 'user_victim' }))
    expect(createContribution.mock.calls[0][0]).toBe('user_contributor')
    expect(JSON.stringify(createContribution.mock.calls)).not.toContain('user_victim')
  })

  it('ignores a role offered by the browser', async () => {
    signInAs('member', 'user_contributor')
    const res = await PATCH(patch({ action: 'accept', role: 'palace-admin' }), ctx)
    expect(res.status).toBe(403)
    expect(decideContribution).not.toHaveBeenCalled()
  })

  it('scopes a withdrawal to their own id as well as the row id', async () => {
    await PATCH(patch({ action: 'withdraw' }), ctx)
    expect(withdrawOwnContribution).toHaveBeenCalledWith('user_contributor', ID)
  })
})

describe('validation', () => {
  it('accepts a valid submission and records it pending', async () => {
    const res = await POST(post(valid))
    expect(res.status).toBe(201)
    expect(createContribution).toHaveBeenCalledTimes(1)
    /* No status is passed — the column default is what makes it pending. */
    expect(createContribution.mock.calls[0][1]).not.toHaveProperty('status')
  })

  it.each(['fabrication', 'Correction', '', null, 7])('refuses the type %j', async t => {
    expect((await POST(post({ ...valid, type: t }))).status).toBe(400)
    expect(createContribution).not.toHaveBeenCalled()
  })

  it('refuses a quarter that is not one of the twenty-seven', async () => {
    expect((await POST(post({ ...valid, targetId: 'Atlantis' }))).status).toBe(400)
    expect(createContribution).not.toHaveBeenCalled()
  })

  it('refuses a person who is not in the register', async () => {
    const res = await POST(post({ ...valid, targetType: 'person', targetId: 'no-such-person' }))
    expect(res.status).toBe(400)
    expect(createContribution).not.toHaveBeenCalled()
  })

  it('refuses a body or chapter the Fondom does not record', async () => {
    expect((await POST(post({ ...valid, targetType: 'body', targetId: 'invented' }))).status).toBe(400)
    expect((await POST(post({ ...valid, targetType: 'chapter', targetId: 'invented' }))).status).toBe(400)
    expect(createContribution).not.toHaveBeenCalled()
  })

  it('stores the canonical id, not the caller’s string', async () => {
    await POST(post({ ...valid, targetType: 'person', targetId: ` ${PERSON.slug} ` }))
    expect(createContribution.mock.calls[0][1].targetId).toBe(PERSON.slug)
  })

  it('requires something to have been written', async () => {
    expect((await POST(post({ ...valid, content: '   ' }))).status).toBe(400)
    expect((await POST(post({ ...valid, content: undefined }))).status).toBe(400)
    expect(createContribution).not.toHaveBeenCalled()
  })

  it('caps a very long submission rather than refusing it', async () => {
    await POST(post({ ...valid, content: 'x'.repeat(9000), sourceNote: 'y'.repeat(9000) }))
    const input = createContribution.mock.calls[0][1]
    expect(input.content.length).toBe(4000)
    expect(input.sourceNote.length).toBe(1000)
  })

  it('accepts a submission with no source note', async () => {
    await POST(post(valid))
    expect(createContribution.mock.calls[0][1].sourceNote).toBeNull()
  })

  it('refuses a body that is not JSON', async () => {
    const bad = new NextRequest('https://www.guneku.org/api/contributions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'not json',
    })
    expect((await POST(bad)).status).toBe(400)
  })
})

describe('who may review', () => {
  it.each(['member', 'contributor'] as const)('a %s cannot accept', async role => {
    signInAs(role)
    const res = await PATCH(patch({ action: 'accept' }), ctx)
    expect(res.status).toBe(403)
    expect(decideContribution).not.toHaveBeenCalled()
    expect(getContributionForReview).not.toHaveBeenCalled()
  })

  it.each(['member', 'contributor'] as const)('a %s cannot reject', async role => {
    signInAs(role)
    expect((await PATCH(patch({ action: 'reject' }), ctx)).status).toBe(403)
    expect(decideContribution).not.toHaveBeenCalled()
  })

  it.each(['reviewer', 'palace-admin'] as const)('a %s can accept', async role => {
    signInAs(role)
    const res = await PATCH(patch({ action: 'accept' }), ctx)
    expect(res.status).toBe(200)
    expect(decideContribution).toHaveBeenCalledWith(ID, 'accepted', 'user_reviewer')
  })

  it.each(['reviewer', 'palace-admin'] as const)('a %s can reject', async role => {
    signInAs(role)
    expect((await PATCH(patch({ action: 'reject' }), ctx)).status).toBe(200)
    expect(decideContribution).toHaveBeenCalledWith(ID, 'rejected', 'user_reviewer')
  })
})

describe('nobody decides their own submission', () => {
  it('refuses a reviewer accepting their own contribution', async () => {
    signInAs('reviewer', 'user_contributor')
    getContributionForReview.mockResolvedValue({ ...ROW, clerk_user_id: 'user_contributor' })

    const res = await PATCH(patch({ action: 'accept' }), ctx)
    expect(res.status).toBe(403)
    expect(decideContribution).not.toHaveBeenCalled()
    expect((await res.json()).error).toMatch(/cannot review your own contribution/i)
  })

  it('refuses a palace-admin doing the same', async () => {
    signInAs('palace-admin', 'user_boss')
    getContributionForReview.mockResolvedValue({ ...ROW, clerk_user_id: 'user_boss' })
    expect((await PATCH(patch({ action: 'accept' }), ctx)).status).toBe(403)
    expect(decideContribution).not.toHaveBeenCalled()
  })
})

describe('invalid transitions', () => {
  it('refuses an unknown action before touching anything', async () => {
    signInAs('palace-admin')
    for (const action of ['publish', 'apply', 'delete', 'ACCEPT', '', null]) {
      expect((await PATCH(patch({ action }), ctx)).status).toBe(400)
    }
    expect(decideContribution).not.toHaveBeenCalled()
    expect(withdrawOwnContribution).not.toHaveBeenCalled()
  })

  it('answers 404 when a reviewer opens one that does not exist', async () => {
    signInAs('reviewer')
    getContributionForReview.mockResolvedValue(null)
    expect((await PATCH(patch({ action: 'accept' }), ctx)).status).toBe(404)
    expect(decideContribution).not.toHaveBeenCalled()
  })

  it('reports one that is no longer pending rather than re-deciding it', async () => {
    signInAs('reviewer')
    decideContribution.mockResolvedValue(null)
    const res = await PATCH(patch({ action: 'accept' }), ctx)
    expect(res.status).toBe(409)
    expect((await res.json()).error).toMatch(/already been decided/i)
  })

  it('gives one indistinguishable answer when a withdrawal matches nothing', async () => {
    withdrawOwnContribution.mockResolvedValue(null)
    const res = await PATCH(patch({ action: 'withdraw' }), ctx)
    expect(res.status).toBe(409)
    await expect(res.json()).resolves.toEqual({
      error: 'That contribution can no longer be withdrawn.',
    })
  })
})

describe('privacy', () => {
  it('never returns the reviewer’s identity or the contributor’s Clerk id', async () => {
    signInAs('reviewer')
    const text = JSON.stringify(await (await PATCH(patch({ action: 'accept' }), ctx)).json())
    expect(text).not.toContain('reviewed_by')
    expect(text).not.toContain('user_reviewer')
    expect(text).not.toContain('clerk_user_id')
    expect(text).not.toContain('user_contributor')
  })

  it('answers 503 for an unprovisioned table without naming the schema', async () => {
    listMyContributions.mockRejectedValue(
      Object.assign(new Error('relation "contributions" does not exist'), { code: '42P01' }))
    const res = await GET()
    expect(res.status).toBe(503)
    expect(JSON.stringify(await res.json())).not.toContain('contributions"')
  })

  it('never returns a driver message', async () => {
    listMyContributions.mockRejectedValue(new Error('password auth failed at ep-x.neon.tech'))
    const res = await GET()
    expect(res.status).toBe(500)
    expect(JSON.stringify(await res.json())).not.toContain('neon.tech')
  })
})

describe('the publication boundary', () => {
  /* The whole safety property of this phase. Accepting writes a status to one row; it
     cannot reach a canonical record, because neither route imports anything that could. */
  it('neither route imports a canonical record or a file writer', async () => {
    const { readFileSync } = await import('node:fs')

    /* Comments are stripped first. Both routes deliberately NAME the files they must never
       touch, in prose explaining why they do not — and a check that matched that prose would
       fail on the very comment that documents the guarantee. What matters is the code. */
    const code = (s: string) =>
      s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

    const create = code(readFileSync(new URL('./route.ts', import.meta.url), 'utf-8'))
    const decide = code(readFileSync(new URL('./[id]/route.ts', import.meta.url), 'utf-8'))

    for (const src of [create, decide]) {
      expect(src).not.toMatch(/node:fs|['"]fs['"]|writeFile|readFileSync/)
      expect(src).not.toMatch(/founding-names|bodies\.json|chapters\.json|quarter-registry/)
      expect(src).not.toMatch(/@\/data\//)
      expect(src).not.toContain('@/lib/email')
    }
  })

  it('accepting calls only the status writer, and nothing else', async () => {
    signInAs('reviewer')
    await PATCH(patch({ action: 'accept' }), ctx)
    expect(decideContribution).toHaveBeenCalledTimes(1)
    expect(decideContribution).toHaveBeenCalledWith(ID, 'accepted', 'user_reviewer')
  })
})
