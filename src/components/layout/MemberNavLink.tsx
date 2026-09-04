'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'

/* The one way into the member area from the public site.
 *
 * Until 2026-09-04 there was none: My Guneku existed, was protected, worked — and appeared in
 * no header, no drawer and no footer. The only way to reach it was to know the URL and type
 * it. That is not a member area, it is a secret.
 *
 * ── Why this does not use Clerk ──────────────────────────────────────────────────────────
 *
 * Clerk's <SignedIn> / <SignedOut> would be the obvious way to label this link, and both are
 * unusable here for the same deliberate reason: ClerkProvider is scoped to the three member
 * subtrees and is NOT in the root layout, so that Guneku's 188 public pages carry no Clerk
 * runtime at all (see ClerkScope). Mounting the provider globally to decide one word in the
 * navigation would put an authentication SDK on every page of a village record that anybody
 * may read without an account — on a mid-range Android over a throttled connection, for a
 * link most readers will never use.
 *
 * Reading the session server-side is closed for a second reason: the root layout renders this
 * header, and touching `cookies()` there would make all 228 pages dynamic and end the static
 * build.
 *
 * So this reads `__client_uat`, the small non-HttpOnly cookie Clerk maintains for exactly
 * this purpose: 0 when signed out, a timestamp when signed in. It is a display hint and
 * nothing else. It decides a label, never access — /my-guneku is protected by the middleware
 * and again by the page itself, so a stale cookie costs a signed-out visitor one redirect to
 * sign in, and a missing cookie costs a signed-in member one extra click. Neither can show
 * anybody another person's anything.
 *
 * The first render is always the signed-out label, on the server and on the client alike, so
 * hydration matches; the effect then corrects it. */
/** Pure, and exported so it can be tested without a browser: given a `document.cookie`
 *  string, is there a Clerk session? A missing cookie and `__client_uat=0` both mean no. */
export function signedInFromCookie(cookie: string): boolean {
  const match = cookie.match(/(?:^|;\s*)__client_uat=([^;]*)/)
  if (!match) return false
  const value = Number(decodeURIComponent(match[1]))
  return Number.isFinite(value) && value > 0
}

/* Read through `useSyncExternalStore` rather than an effect that calls setState. The cookie
   is exactly what that hook is for — a value owned outside React — and it is also what keeps
   hydration honest: `serverSnapshot` is used for the server render and the first client
   render, so the two always agree, and the real value is read immediately afterwards. */
const subscribe = () => () => {}
const clientSnapshot = () => (typeof document === 'undefined' ? false : signedInFromCookie(document.cookie))
const serverSnapshot = () => false

export function MemberNavLink({
  className, onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  const signedIn = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)

  return (
    <Link
      href={signedIn ? '/my-guneku' : '/sign-in'}
      onClick={onNavigate}
      className={className}
      /* The label changes after hydration, so it is announced rather than silently swapped
         for anyone reading with a screen reader. */
      aria-live="polite"
    >
      {signedIn ? 'My Guneku' : 'Sign in'}
    </Link>
  )
}
