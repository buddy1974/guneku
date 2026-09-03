import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { clerkConfigured } from '@/lib/clerk-config'

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
  '/api/indigenes/upload(.*)',
])

/* When Clerk is not configured, the middleware must not mount it. `clerkMiddleware` throws on
   any matched request without a key, which is how /sign-in, /sign-up and /my-guneku returned
   500 in production on 2026-09-03 while every public page was fine.

   BOTH keys are required, and checking only the publishable one was the second mistake in the
   same hour: in this project the publishable key carries a value and the secret key is empty,
   so a publishable-only check said "configured", mounted Clerk, and threw on the secret. The
   pair is the condition, not either half of it. */
const configured = clerkConfigured()

export default configured
  ? clerkMiddleware(async (auth, req) => {
      if (!isProtected(req)) return

      const { userId } = await auth()
      if (userId) return

      /* `auth.protect()` was used here and was wrong for both kinds of protected route. For a
         signed-out caller it performs a "protect-rewrite" to a 404 — so /api/me answered 404
         with an HTML body instead of the JSON 401 its own handler produces, and /my-guneku
         told a villager the page did not exist rather than inviting them to sign in.

         An API route answers for itself. `requireUser()` in the handler returns
         {"error":"Sign in to continue."} with a 401, which is the correct and useful answer,
         and the middleware must not pre-empt it with an HTML page. */
      if (req.nextUrl.pathname.startsWith('/api/')) return

      /* A page sends the visitor to sign in and brings them back to where they were going. */
      const signIn = new URL('/sign-in', req.url)
      signIn.searchParams.set('redirect_url', req.nextUrl.pathname + req.nextUrl.search)
      return NextResponse.redirect(signIn)
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
    /* Every route whose handler calls auth() must be matched here, or Clerk throws
       "auth() was called but Clerk can't detect usage of clerkMiddleware()" and the handler's
       own 401 never runs. The upload route was hardened in Phase 2 and missed from this list;
       it stayed hidden until Clerk went live, because until then the configuration guard
       returned before auth() was ever reached. */
    '/api/indigenes/upload/:path*',
  ],
}
