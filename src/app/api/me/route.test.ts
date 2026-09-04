import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { AuthError } from '@/lib/auth'

/* The member's own platform record. Same boundary as the indigene profile, different table —
   and the one extra thing worth proving here is that a role cannot be granted by asking. */

const requireUser = vi.fn()
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth')
  return { ...actual, requireUser: () => requireUser() }
})

const getMember  = vi.fn()
const saveMember = vi.fn()
vi.mock('@/lib/db/members', () => ({
  getMember:  (...a: unknown[]) => getMember(...a),
  saveMember: (...a: unknown[]) => saveMember(...a),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimited: () => false,
  senderKey: () => 'test',
  RATE_LIMIT_MESSAGE: 'Too many requests.',
}))

const { GET, PUT } = await import('./route')

const SESSION = { userId: 'user_owner', role: 'member' as const }
const MEMBER  = { id: 'm1', clerk_user_id: 'user_owner', display_name: 'A Name' }

const put = (body: unknown) => new NextRequest('https://www.guneku.org/api/me', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

beforeEach(() => {
  vi.clearAllMocks()
  requireUser.mockResolvedValue(SESSION)
  getMember.mockResolvedValue(MEMBER)
  saveMember.mockResolvedValue(MEMBER)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('signed out', () => {
  /* A block body, not an expression: returning the rejected promise from the hook
     would make Vitest await it and fail the hook itself. */
  beforeEach(() => { requireUser.mockRejectedValue(new AuthError('Sign in to continue.', 401)) })

  it('refuses to read', async () => {
    const res = await GET()
    expect(res.status).toBe(401)
    expect(getMember).not.toHaveBeenCalled()
  })

  it('refuses to write', async () => {
    const res = await PUT(put({ displayName: 'Intruder' }))
    expect(res.status).toBe(401)
    expect(saveMember).not.toHaveBeenCalled()
  })
})

describe('ownership', () => {
  it('reads only the session holder’s own record', async () => {
    await GET()
    expect(getMember).toHaveBeenCalledWith('user_owner')
  })

  it('writes only to the session holder’s own record', async () => {
    await PUT(put({ displayName: 'A Name', clerk_user_id: 'user_victim' }))
    expect(saveMember.mock.calls[0][0]).toBe('user_owner')
  })
})

describe('the field allow-list', () => {
  /* Role elevation is server-side only. A member who posts their own promotion changes
     nothing, because `role` is simply not one of the fields this handler copies. */
  it('discards a role supplied in the body', async () => {
    await PUT(put({ displayName: 'A Name', role: 'palace-admin' }))
    const input = saveMember.mock.calls[0][1]
    expect(input).not.toHaveProperty('role')
    expect(JSON.stringify(input)).not.toContain('palace-admin')
  })

  it('discards anything else it was not asked for', async () => {
    await PUT(put({ displayName: 'A Name', isVerified: true, id: 'm_victim' }))
    const input = saveMember.mock.calls[0][1]
    expect(input).not.toHaveProperty('isVerified')
    expect(input).not.toHaveProperty('id')
  })

  /* Free text cannot invent a place in Guneku that does not exist. */
  it('drops a quarter that is not one of the twenty-seven', async () => {
    await PUT(put({ quarter: 'Atlantis' }))
    expect(saveMember.mock.calls[0][1].quarter).toBeNull()
  })

  it('keeps a quarter that is', async () => {
    const { GUNEKU_QUARTERS_27 } = await import('@/lib/quarters')
    await PUT(put({ quarter: GUNEKU_QUARTERS_27[0] }))
    expect(saveMember.mock.calls[0][1].quarter).toBe(GUNEKU_QUARTERS_27[0])
  })

  it('reports the role it read from the session, without letting it be written', async () => {
    const res = await GET()
    await expect(res.json()).resolves.toEqual({ member: MEMBER, role: 'member' })
  })
})
