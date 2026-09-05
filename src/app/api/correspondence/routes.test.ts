import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { AuthError, atLeast, type Role } from '@/lib/auth'

/* Correspondence: who may read a letter, and who may answer one.
 *
 * `requireRole` is reimplemented over the real `atLeast`, so the privilege ordering under
 * test is the application's own — a change that let a reviewer speak for the Palace would
 * fail here rather than pass. */

let ROLE: Role = 'member'
const ID_OF = { current: 'user_sender' }

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

const listMyCorrespondence = vi.fn()
const getMyCorrespondence  = vi.fn()
const getForPalace         = vi.fn()
const setStatus            = vi.fn()
const recordResponse       = vi.fn()
const recordInternalNote   = vi.fn()
vi.mock('@/lib/db/correspondence', async () => {
  const actual = await vi.importActual<typeof import('@/lib/db/correspondence')>('@/lib/db/correspondence')
  return {
    ...actual,
    listMyCorrespondence: (...a: unknown[]) => listMyCorrespondence(...a),
    getMyCorrespondence:  (...a: unknown[]) => getMyCorrespondence(...a),
    getForPalace:         (...a: unknown[]) => getForPalace(...a),
    setStatus:            (...a: unknown[]) => setStatus(...a),
    recordResponse:       (...a: unknown[]) => recordResponse(...a),
    recordInternalNote:   (...a: unknown[]) => recordInternalNote(...a),
  }
})

vi.mock('@/lib/rate-limit', () => ({
  rateLimited: () => false, senderKey: () => 'test', RATE_LIMIT_MESSAGE: 'Too many requests.',
}))

const { GET: LIST }        = await import('./route')
const { GET, PATCH }       = await import('./[id]/route')

const ID  = 'letter-1'
const ctx = { params: Promise.resolve({ id: ID }) }

const ROW = {
  id: ID, clerk_user_id: 'user_sender', sender_name: 'A Villager',
  sender_email: 'someone@example.com', sender_phone: null,
  category: 'palace-matter' as const, subject: 'A matter', message: 'The message body',
  status: 'received' as const, response: null, responded_at: null,
  internal_note: 'PALACE ONLY working note', handled_by: 'user_palace',
  created_at: 'x', updated_at: 'x',
}

const req = (body: unknown) => new NextRequest(`https://www.guneku.org/api/correspondence/${ID}`, {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})
const plain = new NextRequest(`https://www.guneku.org/api/correspondence/${ID}`)

function signInAs(role: Role, id = 'user_palace') { ROLE = role; ID_OF.current = id }

beforeEach(() => {
  vi.clearAllMocks()
  signInAs('member', 'user_sender')
  requireUser.mockImplementation(async () => ({ userId: ID_OF.current, role: ROLE }))
  requireRole.mockImplementation(async (min: Role) => {
    const u = { userId: ID_OF.current, role: ROLE }
    if (!atLeast(u.role, min)) throw new AuthError('You do not have access to that.', 403)
    return u
  })
  listMyCorrespondence.mockResolvedValue([])
  getMyCorrespondence.mockResolvedValue({ id: ID, subject: 'A matter', status: 'received' })
  getForPalace.mockResolvedValue(ROW)
  setStatus.mockResolvedValue({ ...ROW, status: 'in-review' })
  recordResponse.mockResolvedValue({ ...ROW, status: 'responded', response: 'Our reply' })
  recordInternalNote.mockResolvedValue({ ...ROW, internal_note: 'noted' })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('signed out', () => {
  beforeEach(() => {
    requireUser.mockRejectedValue(new AuthError('Sign in to continue.', 401))
    requireRole.mockRejectedValue(new AuthError('Sign in to continue.', 401))
  })

  it('cannot list correspondence', async () => {
    expect((await LIST()).status).toBe(401)
    expect(listMyCorrespondence).not.toHaveBeenCalled()
  })

  it('cannot read one', async () => {
    expect((await GET(plain, ctx)).status).toBe(401)
    expect(getMyCorrespondence).not.toHaveBeenCalled()
  })

  it.each(['begin-review', 'respond', 'close', 'note'])('cannot %s', async action => {
    expect((await PATCH(req({ action, response: 'x', note: 'x' }), ctx)).status).toBe(401)
    expect(setStatus).not.toHaveBeenCalled()
    expect(recordResponse).not.toHaveBeenCalled()
  })
})

describe('a member reads only their own', () => {
  it('lists by the session id', async () => {
    await LIST()
    expect(listMyCorrespondence).toHaveBeenCalledWith('user_sender')
  })

  it('reads one scoped by both the session id and the letter id', async () => {
    await GET(plain, ctx)
    expect(getMyCorrespondence).toHaveBeenCalledWith('user_sender', ID)
  })

  /* Not yours and not there are the same answer, so guessing an id cannot confirm that
     somebody else's correspondence exists. */
  it('answers 404 for a letter that is not theirs', async () => {
    getMyCorrespondence.mockResolvedValue(null)
    const res = await GET(plain, ctx)
    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toEqual({ error: 'That correspondence was not found.' })
  })

  it('never uses an id supplied by the browser', async () => {
    /* There is no parameter that selects a sender. The only id in play is the session's. */
    await GET(plain, ctx)
    expect(getMyCorrespondence.mock.calls[0][0]).toBe('user_sender')
  })
})

describe('only the Palace may act', () => {
  it.each(['member', 'contributor'] as const)('a %s is refused', async role => {
    signInAs(role)
    expect((await PATCH(req({ action: 'close' }), ctx)).status).toBe(403)
    expect(setStatus).not.toHaveBeenCalled()
  })

  /* Deciding what the register says is not authority to speak for the Palace. */
  it('a reviewer is refused — record review is not Palace authority', async () => {
    signInAs('reviewer')
    const res = await PATCH(req({ action: 'respond', response: 'Our reply' }), ctx)
    expect(res.status).toBe(403)
    expect(recordResponse).not.toHaveBeenCalled()
  })

  it('a palace-admin may act', async () => {
    signInAs('palace-admin')
    expect((await PATCH(req({ action: 'begin-review' }), ctx)).status).toBe(200)
    expect(setStatus).toHaveBeenCalled()
  })

  it('asks for palace-admin by name, not for a role from the body', async () => {
    signInAs('palace-admin')
    await PATCH(req({ action: 'close', role: 'member' }), ctx)
    expect(requireRole).toHaveBeenCalledWith('palace-admin')
  })
})

describe('acting on a letter', () => {
  beforeEach(() => signInAs('palace-admin'))

  it('records who acted', async () => {
    await PATCH(req({ action: 'begin-review' }), ctx)
    expect(setStatus.mock.calls[0][3]).toBe('user_palace')
  })

  it('refuses an unknown action before touching anything', async () => {
    for (const action of ['publish', 'assign', 'delete', 'RESPOND', '', null]) {
      expect((await PATCH(req({ action }), ctx)).status).toBe(400)
    }
    expect(setStatus).not.toHaveBeenCalled()
  })

  it('answers 404 for a letter that does not exist', async () => {
    getForPalace.mockResolvedValue(null)
    expect((await PATCH(req({ action: 'close' }), ctx)).status).toBe(404)
  })

  it('refuses an action the letter’s state does not allow', async () => {
    getForPalace.mockResolvedValue({ ...ROW, status: 'closed' })
    const res = await PATCH(req({ action: 'respond', response: 'x' }), ctx)
    expect(res.status).toBe(409)
    expect(recordResponse).not.toHaveBeenCalled()
  })

  it('reports a letter that moved on between read and write', async () => {
    setStatus.mockResolvedValue(null)
    const res = await PATCH(req({ action: 'close' }), ctx)
    expect(res.status).toBe(409)
    expect((await res.json()).error).toMatch(/already moved on/i)
  })
})

describe('a reply is an explicit human act', () => {
  beforeEach(() => signInAs('palace-admin'))

  it('refuses an empty reply rather than composing one', async () => {
    const res = await PATCH(req({ action: 'respond', response: '   ' }), ctx)
    expect(res.status).toBe(400)
    expect(recordResponse).not.toHaveBeenCalled()
    expect((await res.json()).error).toMatch(/write the reply/i)
  })

  it('records exactly what was written, and nothing generated', async () => {
    await PATCH(req({ action: 'respond', response: '  Our reply.  ' }), ctx)
    expect(recordResponse.mock.calls[0][1]).toBe('Our reply.')
  })

  it('refuses an empty note', async () => {
    expect((await PATCH(req({ action: 'note', note: '' }), ctx)).status).toBe(400)
    expect(recordInternalNote).not.toHaveBeenCalled()
  })

  /* A note is not a decision: it must not advance the letter. */
  it('records a note without changing the status', async () => {
    await PATCH(req({ action: 'note', note: 'A working note' }), ctx)
    expect(recordInternalNote).toHaveBeenCalled()
    expect(setStatus).not.toHaveBeenCalled()
    expect(recordResponse).not.toHaveBeenCalled()
  })
})

describe('privacy', () => {
  it('never returns the Palace’s internal note, even to the Palace', async () => {
    signInAs('palace-admin')
    const text = JSON.stringify(await (await PATCH(req({ action: 'begin-review' }), ctx)).json())

    expect(text).not.toContain('internal_note')
    expect(text).not.toContain('PALACE ONLY')
    expect(text).not.toContain('handled_by')
    expect(text).not.toContain('user_palace')
  })

  it('never returns a Clerk id or the sender’s email in an update', async () => {
    signInAs('palace-admin')
    const text = JSON.stringify(await (await PATCH(req({ action: 'close' }), ctx)).json())

    expect(text).not.toContain('clerk_user_id')
    expect(text).not.toContain('user_sender')
    expect(text).not.toContain('someone@example.com')
  })

  it('answers 503 for an unprovisioned table without naming the schema', async () => {
    listMyCorrespondence.mockRejectedValue(
      Object.assign(new Error('relation "palace_correspondence" does not exist'), { code: '42P01' }))
    const res = await LIST()
    expect(res.status).toBe(503)
    expect(JSON.stringify(await res.json())).not.toContain('palace_correspondence')
  })

  it('never returns a driver message', async () => {
    listMyCorrespondence.mockRejectedValue(new Error('password auth failed at ep-x.neon.tech'))
    const res = await LIST()
    expect(res.status).toBe(500)
    expect(JSON.stringify(await res.json())).not.toContain('neon.tech')
  })
})

describe('nothing here sends automatically', () => {
  it('neither route imports the mailer', async () => {
    const { readFileSync } = await import('node:fs')
    const strip = (s: string) =>
      s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

    const list = strip(readFileSync(new URL('./route.ts', import.meta.url), 'utf-8'))
    const one  = strip(readFileSync(new URL('./[id]/route.ts', import.meta.url), 'utf-8'))

    for (const src of [list, one]) {
      expect(src).not.toContain('@/lib/email')
      expect(src).not.toContain('resend')
    }
  })
})
