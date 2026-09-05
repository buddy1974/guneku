import { describe, it, expect } from 'vitest'
import { config } from './middleware'

/* The matcher is configuration, and configuration is where this project has been bitten.
 *
 * `/api/indigenes/upload` was hardened in Phase 2 and left out of this list. It stayed hidden
 * until Clerk went live, because until then the configuration guard returned before `auth()`
 * was ever reached — and then it threw "auth() was called but Clerk can't detect usage of
 * clerkMiddleware()" in production. Every route that asks who the caller is must be here, so
 * the list is asserted rather than trusted. */

const matches = (path: string) =>
  config.matcher.some(pattern => {
    /* Next's matcher syntax, reduced to what this file actually uses: a `:name*` segment
       stands for zero or more path segments. */
    const source = '^' + pattern.replace(/\/:[A-Za-z]+\*/g, '(?:/.*)?') + '$'
    return new RegExp(source).test(path)
  })

describe('every route that reads a session is matched', () => {
  it.each([
    '/my-guneku',
    '/my-guneku/anything',
    '/sign-in',
    '/sign-up',
    '/api/me',
    '/api/indigenes/profile',
    /* Missed once already, in production. */
    '/api/indigenes/upload',
    /* Added 2026-09-04: both are server components that call optionalUser(), and being
       matched is also what produces the redirect carrying redirect_url. */
    '/indigenes/onboarding',
    '/indigenes/profile',
    /* Added 2026-09-05 with the claim workflow and Stay Connected. */
    '/review/claims',
    '/api/claims',
    '/api/claims/some-id',
    '/api/follows',
    /* Added 2026-09-05 with Palace correspondence. */
    '/review/correspondence',
    '/api/correspondence',
    '/api/correspondence/some-id',
    /* Matched so a session is AVAILABLE, and deliberately absent from `isProtected` so a
       signed-out villager can still write to the Palace — see the public-form tests. */
    '/api/palace-message',
  ])('matches %s', path => {
    expect(matches(path)).toBe(true)
  })
})

describe('the public village record stays out of it', () => {
  it.each([
    '/',
    '/indigenes',
    '/indigenes/submit',
    '/indigenes/founding/some-name',
    '/notables',
    '/palace',
    '/kingdom/about-guneku',
    '/api/indigenes/all',
    '/api/search',
    '/api/contact',
  ])('does not match %s', path => {
    expect(matches(path)).toBe(false)
  })
})

describe('the public Palace form is matched but not protected', () => {
  /* Being in the matcher only makes a Clerk session available. Whether a caller is turned
     away is `isProtected`, which /api/palace-message is deliberately absent from: a villager
     must not need an account to write to their own Fon. The route's own tests prove a
     signed-out submission succeeds. */
  it('is in the matcher', () => {
    expect(matches('/api/palace-message')).toBe(true)
  })

  it('is not listed among the protected paths in the middleware source', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync(new URL('./middleware.ts', import.meta.url), 'utf-8')

    const protectedBlock = src.slice(
      src.indexOf('const isProtected'),
      src.indexOf('])', src.indexOf('const isProtected')),
    )
    expect(protectedBlock).not.toContain('palace-message')
    /* While the member-facing correspondence API is protected. */
    expect(protectedBlock).toContain('/api/correspondence')
  })
})
