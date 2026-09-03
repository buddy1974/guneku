/* Is Clerk actually configured in this environment?
 *
 * Written after the production deployment of 2026-09-03 returned 500 on `/sign-in`,
 * `/sign-up` and `/my-guneku` with "@clerk/nextjs: Missing secretKey". The variables exist in
 * Vercel by name but carry no value, so Clerk threw at request time on the three routes that
 * mount it.
 *
 * The lesson, and the reason this file exists rather than a try/catch at each call site: an
 * unconfigured dependency should degrade to an honest message, never to a 500. A villager who
 * follows a "sign in" link deserves to be told the member area is not open yet — which is
 * true, and is exactly what those pages said before Clerk was wired in. A stack trace tells
 * them the site is broken, which is not true: everything they came to read is working.
 *
 * The public site never depended on this and still does not. It was proved before release by
 * building with no Clerk keys at all: 38 public routes returned 200 and zero Clerk JavaScript
 * reached any page. This only stops the three authenticated routes from being the exception.
 *
 * Both keys are required. The publishable key is inlined at build time and the secret key is
 * read at runtime, so a build can carry one without the other, and Clerk fails on whichever
 * is missing at the moment it is needed. */
export function clerkConfigured(): boolean {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
  const sk = process.env.CLERK_SECRET_KEY?.trim()
  return Boolean(pk && sk)
}

/** The publishable key alone. Used by the middleware, which needs to know whether to run at
 *  all before any request reaches a page. */
export function clerkPublishableKeyPresent(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim())
}
