import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

/* Production's sign-in said "Sign in to My Application".
 *
 * The Clerk instance's own application name was never changed from Clerk's factory default —
 * `clerk.guneku.org/v1/environment` returns `display_config.application_name: "My
 * Application"` — and Clerk's widgets interpolate it. A villager signing in to their own
 * village record was greeted by somebody else's placeholder.
 *
 * The overrides below are the supported way to set what the widgets say. They do not reach
 * the verification emails Clerk sends or the OAuth consent screen; renaming the application
 * in the Clerk dashboard is the fix at the source and is the owner's. */

/* Comments stripped for every check about behaviour. The file explains in prose what Clerk's
   default was, quoting it, and a check that matched that prose would fail on the very
   sentence recording the fix. */
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

const SCOPE = readFileSync('src/components/auth/ClerkScope.tsx', 'utf-8')
const CODE = strip(SCOPE)

describe('Clerk speaks as the Fondom', () => {
  it('sets the sign-in and sign-up titles from configuration', () => {
    expect(SCOPE).toContain('localization={{')
    expect(SCOPE).toContain("title: 'Sign in to Guneku Fondom'")
    expect(SCOPE).toContain("titleCombined: 'Sign in to Guneku Fondom'")
    expect(SCOPE).toContain("title: 'Join Guneku Fondom'")
    expect(SCOPE).toContain("titleCombined: 'Join Guneku Fondom'")
  })

  it('names the Fondom and never the placeholder', () => {
    /* The only mention left is the comment recording what Clerk's default was. */
    expect(CODE).not.toContain('My Application')
    expect(CODE).toContain('Guneku Fondom')
  })

  it('configures Clerk rather than reaching into Clerk’s DOM', () => {
    /* An appearance and localization prop is supported configuration. Selecting Clerk's own
       generated markup and rewriting it is not, and would break on any Clerk release. */
    expect(CODE).not.toMatch(/querySelector|innerHTML|textContent\s*=|MutationObserver/)
  })

  it('still scopes the provider away from the public site', () => {
    /* Unchanged by this fix, and worth holding: the 231 public pages stay account-free. */
    expect(SCOPE).toContain('ClerkProvider')
    const roots = readFileSync('src/app/layout.tsx', 'utf-8')
    expect(roots).not.toContain('ClerkProvider')
    expect(roots).not.toContain('ClerkScope')
  })
})
