import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { AuthError } from '@/lib/auth'

/* The authorisation boundary of a member's own profile, tested at the handler.
 *
 * Clerk and Neon are both mocked: what is under test is whether the handler asks the session
 * who the caller is, whether it lets anything in the request body answer that question
 * instead, and what it says when things go wrong. */

const requireUser = vi.fn()
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth')
  return { ...actual, requireUser: () => requireUser() }
})

const getProfileByClerkId = vi.fn()
const profileExists       = vi.fn()
const createProfile       = vi.fn()
const updateProfile       = vi.fn()
vi.mock('@/lib/db/queries', async () => {
  const actual = await vi.importActual<typeof import('@/lib/db/queries')>('@/lib/db/queries')
  return {
    ...actual,
    getProfileByClerkId: (...a: unknown[]) => getProfileByClerkId(...a),
    profileExists:       (...a: unknown[]) => profileExists(...a),
    createProfile:       (...a: unknown[]) => createProfile(...a),
    updateProfile:       (...a: unknown[]) => updateProfile(...a),
  }
})

vi.mock('@/lib/rate-limit', () => ({
  rateLimited: () => false,
  senderKey: () => 'test',
  RATE_LIMIT_MESSAGE: 'Too many requests.',
}))

vi.mock('@/lib/email/send', () => ({ sendNewIndigeneAlert: vi.fn().mockResolvedValue(undefined) }))

const { GET, POST, PUT } = await import('./route')

const SESSION = { userId: 'user_owner', role: 'member' as const }
const PROFILE = { id: 'p1', full_name: 'A Name', profession: 'Teacher', quarter: 'Ntoh' }

function post(body: unknown) {
  return new NextRequest('https://www.guneku.org/api/indigenes/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
function put(body: unknown) {
  return new NextRequest('https://www.guneku.org/api/indigenes/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  requireUser.mockResolvedValue(SESSION)
  profileExists.mockResolvedValue(false)
  createProfile.mockResolvedValue(PROFILE)
  updateProfile.mockResolvedValue(PROFILE)
  getProfileByClerkId.mockResolvedValue(PROFILE)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('signed out', () => {
  /* A block body, not an expression: returning the rejected promise from the hook
     would make Vitest await it and fail the hook itself. */
  beforeEach(() => { requireUser.mockRejectedValue(new AuthError('Sign in to continue.', 401)) })

  it('refuses to read a profile', async () => {
    const res = await GET()
    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({ error: 'Sign in to continue.' })
  })

  it('refuses to create one, and never reaches the database', async () => {
    const res = await POST(post({ full_name: 'Intruder' }))
    expect(res.status).toBe(401)
    expect(createProfile).not.toHaveBeenCalled()
    expect(profileExists).not.toHaveBeenCalled()
  })

  it('refuses to update one, and never reaches the database', async () => {
    const res = await PUT(put({ bio: 'Intruder' }))
    expect(res.status).toBe(401)
    expect(updateProfile).not.toHaveBeenCalled()
  })
})

describe('ownership', () => {
  it('reads only the session holder’s own profile', async () => {
    await GET()
    expect(getProfileByClerkId).toHaveBeenCalledWith('user_owner')
  })

  /* The defect this whole boundary exists to prevent: a body that names its own user. */
  it('ignores an identity supplied in the body when creating', async () => {
    await POST(post({ full_name: 'A Name', clerk_user_id: 'user_victim', userId: 'user_victim' }))
    expect(createProfile).toHaveBeenCalledTimes(1)
    expect(createProfile.mock.calls[0][0]).toBe('user_owner')
  })

  it('ignores an identity supplied in the body when updating', async () => {
    await PUT(put({ bio: 'edited', clerk_user_id: 'user_victim', id: 'p_victim' }))
    expect(updateProfile).toHaveBeenCalledTimes(1)
    expect(updateProfile.mock.calls[0][0]).toBe('user_owner')
  })

  it('checks for an existing profile under the session id, not a supplied one', async () => {
    await POST(post({ full_name: 'A Name', clerk_user_id: 'user_victim' }))
    expect(profileExists).toHaveBeenCalledWith('user_owner')
  })
})

describe('creating a profile', () => {
  it('creates the first one and answers 201', async () => {
    const res = await POST(post({ full_name: 'A Name' }))
    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toEqual({ profile: PROFILE })
  })

  it('refuses a second one and sends the member to the profile they have', async () => {
    profileExists.mockResolvedValue(true)
    const res = await POST(post({ full_name: 'A Name' }))

    expect(res.status).toBe(409)
    expect(createProfile).not.toHaveBeenCalled()
    await expect(res.json()).resolves.toEqual({
      error: 'You already have a profile.',
      profileUrl: '/indigenes/profile',
    })
  })

  /* Two tabs, two submits, one lost race: the existence check passed and the insert still
     hit the UNIQUE constraint. The member must get the same useful answer, not a 500. */
  it('turns a lost race on the unique constraint into the same 409', async () => {
    const violation = Object.assign(new Error('duplicate key value'), { code: '23505' })
    createProfile.mockRejectedValue(violation)

    const res  = await POST(post({ full_name: 'A Name' }))
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.profileUrl).toBe('/indigenes/profile')
    expect(JSON.stringify(body)).not.toContain('duplicate key')
  })
})

describe('updating a profile', () => {
  it('saves and returns the updated profile', async () => {
    const res = await PUT(put({ bio: 'Hello' }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ profile: PROFILE })
  })

  it('answers 404 with a way forward when there is no profile to update', async () => {
    updateProfile.mockResolvedValue(null)
    const res = await PUT(put({ bio: 'Hello' }))

    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toEqual({
      error: 'You do not have a profile yet.',
      createUrl: '/indigenes/onboarding',
    })
  })
})

describe('what a caller is told when something fails', () => {
  it('answers 503 for an unprovisioned table, without naming the schema', async () => {
    getProfileByClerkId.mockRejectedValue(Object.assign(new Error('relation … does not exist'), { code: '42P01' }))
    const res  = await GET()
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.error).toBe('This part of Guneku is not available yet.')
  })

  it('never returns the driver’s own message for an unexpected fault', async () => {
    getProfileByClerkId.mockRejectedValue(
      new Error('connect ECONNREFUSED ep-secret-host.eu-central-1.aws.neon.tech:5432'),
    )
    const res  = await GET()
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body).toEqual({ error: 'Something went wrong. Please try again.' })
    expect(JSON.stringify(body)).not.toContain('neon.tech')
    expect(JSON.stringify(body)).not.toContain('ECONNREFUSED')
  })
})
