import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { AuthError } from '@/lib/auth'
import { FOLLOW_TOPICS, MY_QUARTER } from '@/lib/follow-topics'
import { GUNEKU_QUARTERS_27 } from '@/lib/quarters'

/* The preference API. Clerk and Neon are mocked; the taxonomy is real. */

const requireUser = vi.fn()
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth')
  return { ...actual, requireUser: () => requireUser() }
})

const listFollows  = vi.fn()
const addFollow    = vi.fn()
const removeFollow = vi.fn()
const getMember    = vi.fn()
vi.mock('@/lib/db/members', () => ({
  listFollows:  (...a: unknown[]) => listFollows(...a),
  addFollow:    (...a: unknown[]) => addFollow(...a),
  removeFollow: (...a: unknown[]) => removeFollow(...a),
  getMember:    (...a: unknown[]) => getMember(...a),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimited: () => false, senderKey: () => 'test', RATE_LIMIT_MESSAGE: 'Too many requests.',
}))

const { GET, POST, DELETE } = await import('./route')

const SESSION = { userId: 'user_owner', role: 'member' as const }
const QUARTER = GUNEKU_QUARTERS_27[0]

const req = (method: string, body?: unknown) =>
  new NextRequest('https://www.guneku.org/api/follows', {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

/** A follows row as the table stores it. */
const row = (subject_type: string, subject_id: string) => ({
  id: `f-${subject_id}`, subject_type, subject_id, created_at: '2026-09-05',
})

beforeEach(() => {
  vi.clearAllMocks()
  requireUser.mockResolvedValue(SESSION)
  listFollows.mockResolvedValue([])
  addFollow.mockResolvedValue(undefined)
  removeFollow.mockResolvedValue(undefined)
  getMember.mockResolvedValue({ clerk_user_id: 'user_owner', quarter: QUARTER })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('signed out', () => {
  beforeEach(() => { requireUser.mockRejectedValue(new AuthError('Sign in to continue.', 401)) })

  it('cannot list follows', async () => {
    const res = await GET()
    expect(res.status).toBe(401)
    expect(listFollows).not.toHaveBeenCalled()
  })

  it('cannot follow, and never reaches the database', async () => {
    const res = await POST(req('POST', { topic: 'projects' }))
    expect(res.status).toBe(401)
    expect(addFollow).not.toHaveBeenCalled()
  })

  it('cannot unfollow', async () => {
    const res = await DELETE(req('DELETE', { topic: 'projects' }))
    expect(res.status).toBe(401)
    expect(removeFollow).not.toHaveBeenCalled()
  })
})

describe('the member is always the session', () => {
  it('lists only the session holder’s own follows', async () => {
    await GET()
    expect(listFollows).toHaveBeenCalledWith('user_owner')
  })

  /* The defect this boundary exists to prevent. */
  it('ignores a member named in the body when following', async () => {
    await POST(req('POST', {
      topic: 'projects',
      clerk_user_id: 'user_victim', clerkUserId: 'user_victim', userId: 'user_victim',
    }))
    expect(addFollow).toHaveBeenCalledWith('user_owner', 'topic', 'projects')
    expect(JSON.stringify(addFollow.mock.calls)).not.toContain('user_victim')
  })

  it('ignores a member named in the body when unfollowing', async () => {
    await DELETE(req('DELETE', { topic: 'projects', clerk_user_id: 'user_victim' }))
    expect(removeFollow).toHaveBeenCalledWith('user_owner', 'topic', 'projects')
    expect(JSON.stringify(removeFollow.mock.calls)).not.toContain('user_victim')
  })

  it('reads the quarter from the session holder’s own record', async () => {
    await POST(req('POST', { topic: MY_QUARTER }))
    expect(getMember).toHaveBeenCalledWith('user_owner')
  })
})

describe('validation — only the approved taxonomy becomes a subscription', () => {
  it.each(FOLLOW_TOPICS.map(t => t.id))('accepts %s', async id => {
    const res = await POST(req('POST', { topic: id }))
    expect(res.status).toBe(200)
    expect(addFollow).toHaveBeenCalledWith('user_owner', 'topic', id)
  })

  it.each([
    'sport', 'politics', 'Palace', 'PROJECTS', '', 'topic', '*',
    'projects; DROP TABLE follows', '../../etc/passwd',
  ])('refuses %j with 400 and never writes', async v => {
    const res = await POST(req('POST', { topic: v }))
    expect(res.status).toBe(400)
    expect(addFollow).not.toHaveBeenCalled()
  })

  it.each([null, undefined, 7, {}, []])('refuses the non-string %j', async v => {
    expect((await POST(req('POST', { topic: v }))).status).toBe(400)
    expect(addFollow).not.toHaveBeenCalled()
  })

  it('refuses a body that is not JSON at all', async () => {
    const bad = new NextRequest('https://www.guneku.org/api/follows', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'not json',
    })
    expect((await POST(bad)).status).toBe(400)
    expect(addFollow).not.toHaveBeenCalled()
  })

  it('refuses an unapproved topic on DELETE too', async () => {
    const res = await DELETE(req('DELETE', { topic: 'sport' }))
    expect(res.status).toBe(400)
    expect(removeFollow).not.toHaveBeenCalled()
  })
})

describe('My quarter is never guessed', () => {
  it('stores the member’s own recorded quarter, as a quarter not a topic', async () => {
    await POST(req('POST', { topic: MY_QUARTER }))
    expect(addFollow).toHaveBeenCalledWith('user_owner', 'quarter', QUARTER)
  })

  /* A member who has not told us their quarter is asked, not guessed at. */
  it('refuses with 409 and instructions when the member has no quarter', async () => {
    getMember.mockResolvedValue({ clerk_user_id: 'user_owner', quarter: null })
    const res  = await POST(req('POST', { topic: MY_QUARTER }))
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(addFollow).not.toHaveBeenCalled()
    expect(body.error).toMatch(/Add your quarter in My Guneku/i)
    expect(body.settingsUrl).toBe('/my-guneku')
  })

  it('refuses with 409 when the member has no record at all', async () => {
    getMember.mockResolvedValue(null)
    expect((await POST(req('POST', { topic: MY_QUARTER }))).status).toBe(409)
    expect(addFollow).not.toHaveBeenCalled()
  })

  /* A stored value could predate the constraint that now limits what /api/me accepts. */
  it('refuses a stored quarter that is not one the Fondom publishes', async () => {
    getMember.mockResolvedValue({ clerk_user_id: 'user_owner', quarter: 'Atlantis' })
    const res = await POST(req('POST', { topic: MY_QUARTER }))

    expect(res.status).toBe(409)
    expect(addFollow).not.toHaveBeenCalled()
    expect((await res.json()).error).toMatch(/not one the Fondom publishes/i)
  })

  it('never takes a quarter from the request body', async () => {
    getMember.mockResolvedValue({ clerk_user_id: 'user_owner', quarter: null })
    await POST(req('POST', { topic: MY_QUARTER, quarter: 'Ngong', subject_id: 'Ngong' }))
    expect(addFollow).not.toHaveBeenCalled()
  })
})

describe('idempotency', () => {
  /* addFollow is ON CONFLICT DO NOTHING against the UNIQUE constraint from migration 0001,
     so following twice is following once — enforced by the database, not by a handler
     remembering to check. */
  it('following twice succeeds both times and writes the same row', async () => {
    listFollows.mockResolvedValue([row('topic', 'projects')])

    const first  = await POST(req('POST', { topic: 'projects' }))
    const second = await POST(req('POST', { topic: 'projects' }))

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(addFollow).toHaveBeenNthCalledWith(1, 'user_owner', 'topic', 'projects')
    expect(addFollow).toHaveBeenNthCalledWith(2, 'user_owner', 'topic', 'projects')
    await expect(second.json()).resolves.toEqual({ topics: ['projects'], quarter: null })
  })

  it('unfollowing something never followed is safe, not an error', async () => {
    listFollows.mockResolvedValue([])
    const res = await DELETE(req('DELETE', { topic: 'projects' }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ topics: [], quarter: null })
  })

  it('unfollowing twice remains safe', async () => {
    listFollows.mockResolvedValue([])
    expect((await DELETE(req('DELETE', { topic: 'education' }))).status).toBe(200)
    expect((await DELETE(req('DELETE', { topic: 'education' }))).status).toBe(200)
  })

  /* If the member changed their quarter after following it, the stored row would no longer
     match what their details now say — and unfollowing must still be able to remove it. */
  it('removes the quarter row that exists, not the one the details resolve to now', async () => {
    listFollows.mockResolvedValue([row('quarter', 'Ngong')])
    getMember.mockResolvedValue({ clerk_user_id: 'user_owner', quarter: 'Njinigom' })

    await DELETE(req('DELETE', { topic: MY_QUARTER }))
    expect(removeFollow).toHaveBeenCalledWith('user_owner', 'quarter', 'Ngong')
  })

  it('unfollowing a quarter that is not followed touches nothing', async () => {
    listFollows.mockResolvedValue([])
    const res = await DELETE(req('DELETE', { topic: MY_QUARTER }))
    expect(res.status).toBe(200)
    expect(removeFollow).not.toHaveBeenCalled()
  })
})

describe('what comes back', () => {
  it('is the taxonomy’s terms, not the table’s rows', async () => {
    listFollows.mockResolvedValue([
      row('topic', 'projects'), row('topic', 'education'), row('quarter', QUARTER),
    ])
    const body = await (await GET()).json()

    expect(body).toEqual({ topics: ['projects', 'education'], quarter: QUARTER })
    /* No row id, no subject_type, no timestamp — the client draws switches and needs none
       of the table's shape. */
    expect(JSON.stringify(body)).not.toContain('subject_type')
    expect(JSON.stringify(body)).not.toContain('created_at')
    expect(JSON.stringify(body)).not.toContain('f-projects')
  })

  it('never carries a Clerk id or an email', async () => {
    listFollows.mockResolvedValue([row('topic', 'palace')])
    const text = JSON.stringify(await (await GET()).json())

    expect(text).not.toContain('clerk_user_id')
    expect(text).not.toContain('user_owner')
    expect(text).not.toContain('@')
  })

  it('reflects the stored state after a change, not the hoped-for one', async () => {
    listFollows.mockResolvedValue([row('topic', 'gudeca')])
    const body = await (await POST(req('POST', { topic: 'gudeca' }))).json()
    expect(body.topics).toEqual(['gudeca'])
  })
})

describe('failure', () => {
  it('answers 503 for an unprovisioned table without naming the schema', async () => {
    listFollows.mockRejectedValue(Object.assign(new Error('relation "follows" does not exist'), { code: '42P01' }))
    const res  = await GET()
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(JSON.stringify(body)).not.toContain('follows')
  })

  it('never returns a driver message', async () => {
    listFollows.mockRejectedValue(new Error('password authentication failed at ep-host.neon.tech'))
    const res  = await GET()
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(JSON.stringify(body)).not.toContain('neon.tech')
    expect(JSON.stringify(body)).not.toContain('password')
  })
})

describe('this route sends nothing', () => {
  /* Phase 4 establishes preferences. It does not authorise mass email, and a route that
     could send is a route that eventually will — so the mailer is not imported at all. */
  it('does not import the mailer', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync(new URL('./route.ts', import.meta.url), 'utf-8')

    expect(src).not.toContain('@/lib/email')
    expect(src).not.toContain('resend')
    expect(src).not.toMatch(/\bsend[A-Z]\w*\(/)
  })
})
