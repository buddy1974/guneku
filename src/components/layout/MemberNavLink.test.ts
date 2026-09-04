import { describe, it, expect } from 'vitest'
import { signedInFromCookie } from './MemberNavLink'

/* The navigation label, and only the label. A wrong answer here costs a redirect, never
   access: /my-guneku is protected by the middleware and again by the page itself. */

describe('the member navigation entry', () => {
  it('offers sign-in when there is no Clerk cookie at all', () => {
    expect(signedInFromCookie('')).toBe(false)
    expect(signedInFromCookie('theme=dark; other=1')).toBe(false)
  })

  it('offers sign-in when Clerk says nobody is signed in', () => {
    expect(signedInFromCookie('__client_uat=0')).toBe(false)
  })

  it('offers My Guneku when Clerk records a session', () => {
    expect(signedInFromCookie('__client_uat=1757000000')).toBe(true)
    expect(signedInFromCookie('theme=dark; __client_uat=1757000000; x=1')).toBe(true)
  })

  it('is not fooled by a cookie whose name merely ends the same way', () => {
    expect(signedInFromCookie('not__client_uat=1757000000')).toBe(false)
  })

  it('treats an unreadable value as signed out rather than guessing', () => {
    expect(signedInFromCookie('__client_uat=abc')).toBe(false)
    expect(signedInFromCookie('__client_uat=')).toBe(false)
  })
})
