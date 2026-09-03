import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { clerkPublishableKeyPresent } from '@/lib/clerk-config'

/* Guneku is a public village record first. Reading it must never require an account, and
 * that is enforced here by construction rather than by configuration: the matcher below
 * lists the only paths Clerk is allowed to see. Every other route — the homepage, the
 * registers, the gallery, the updates, all 188 static pages — never enters this middleware,
 * so no session is read, no Clerk cookie is needed and no Clerk JavaScript is required to
 * read about Guneku. That also keeps the public site light for a reader on a mid-range
 * Android on a throttled connection, which is most of the audience.
 *
 * Authorisation itself is NOT done here. The matcher decides where a session is available;
 * `requireUser` and `requireRole` in src/lib/auth.ts decide what may happen, server-side, in
 * the page or handler that does the work. A middleware that merely redirects is a locked
 * front door on a building with open windows. */

const isProtected = createRouteMatcher([
  '/my-guneku(.*)',
  '/api/me(.*)',
  '/api/claims(.*)',
  '/api/contributions(.*)',
  '/api/indigenes/profile(.*)',
])

/* When Clerk is not configured, the middleware must not mount it. `clerkMiddleware` throws
   on any matched request without a key, which is how /sign-in, /sign-up and /my-guneku
   returned 500 in production on 2026-09-03 while every public page was fine. An unconfigured
   dependency degrades to an honest page; it does not take routes down. */
const configured = clerkPublishableKeyPresent()

export default configured
  ? clerkMiddleware(async (auth, req) => {
      if (isProtected(req)) {
        /* Sends a signed-out visitor to sign-in and brings them back afterwards. The pages
           and handlers behind this still check for themselves. */
        await auth.protect()
      }
    })
  : () => NextResponse.next()

export const config = {
  matcher: [
    '/my-guneku/:path*',
    '/sign-in/:path*',
    '/sign-up/:path*',
    '/api/me/:path*',
    '/api/claims/:path*',
    '/api/contributions/:path*',
    '/api/indigenes/profile/:path*',
  ],
}
