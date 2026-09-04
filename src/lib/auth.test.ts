import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ROLES, DEFAULT_ROLE, atLeast, AuthError, authErrorResponse } from './auth'

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))

beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}) })

describe('roles', () => {
  it('starts everybody who signs in at the narrowest role', () => {
    expect(DEFAULT_ROLE).toBe('member')
    expect(ROLES[0]).toBe('member')
  })

  it('orders privilege from member up to palace-admin', () => {
    expect(atLeast('palace-admin', 'member')).toBe(true)
    expect(atLeast('member', 'palace-admin')).toBe(false)
    expect(atLeast('reviewer', 'reviewer')).toBe(true)
    expect(atLeast('contributor', 'reviewer')).toBe(false)
  })
})

describe('what a failed protected call tells the caller', () => {
  it('passes an authorisation message through, because it is safe and useful', () => {
    expect(authErrorResponse(new AuthError('Sign in to continue.', 401)))
      .toEqual({ body: { error: 'Sign in to continue.' }, status: 401 })
    expect(authErrorResponse(new AuthError('You do not have access to that.', 403)).status)
      .toBe(403)
  })

  /* ADR-023: a protected handler must never leak why it failed. A Neon or Clerk error can
     carry a host, a schema or a key fragment, and every one of them is one screenshot away
     from being a disclosure. */
  it('replaces any other failure with a fixed message that names nothing', () => {
    const leaky = new Error('CLERK_SECRET_KEY sk_live_abc123 rejected by api.clerk.com')
    const out   = authErrorResponse(leaky)

    expect(out.status).toBe(500)
    expect(out.body).toEqual({ error: 'Something went wrong. Please try again.' })
    expect(JSON.stringify(out)).not.toContain('sk_live')
    expect(JSON.stringify(out)).not.toContain('clerk.com')
  })

  it('leaks nothing from a database error either', () => {
    const out = authErrorResponse(
      Object.assign(new Error('postgres://user:pw@ep-host.neon.tech/db'), { code: '28P01' }),
    )
    expect(JSON.stringify(out)).not.toContain('neon.tech')
    expect(JSON.stringify(out)).not.toContain('postgres://')
  })
})
