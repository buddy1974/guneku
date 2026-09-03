import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { clerkConfigured } from './clerk-config'

/* Server-side authorisation for Guneku.
 *
 * Every protected action asks these helpers, and they ask Clerk. Nothing here reads a user
 * id, a role, or anything else from a request body or a query string: a caller who could
 * name their own identity would not be authenticated at all, only asked politely.
 *
 * What Clerk owns is deliberately small — identity, session, and one platform role. What it
 * does NOT own, by owner decision: a person's quarter, their GUDECA chapter, the body or
 * office they hold, any Palace family relationship, their historical identity, and the state
 * of a profile claim. Those are Guneku facts. They live in Neon and in the authoritative
 * JSON records, where they can be sourced, reviewed and corrected. A role is permission to
 * use the software; it is never a statement about the village. */

/** The platform roles, narrowest first. Order is meaningful: `atLeast` walks it. */
export const ROLES = ['member', 'contributor', 'reviewer', 'palace-admin'] as const
export type Role = (typeof ROLES)[number]

/** Everyone who signs in is a member until someone with authority says otherwise. */
export const DEFAULT_ROLE: Role = 'member'

export type GunekuUser = {
  userId: string
  role: Role
}

/* The role is read from Clerk's *public* metadata, which is server-writable and
   client-readable. Private metadata is never read here and must never be surfaced: it is
   not needed for authorisation and reading it invites leaking it into a payload. */
function roleFrom(claims: unknown): Role {
  const meta = (claims as { publicMetadata?: { role?: unknown } } | null)?.publicMetadata
  const raw = typeof meta?.role === 'string' ? meta.role : ''
  return (ROLES as readonly string[]).includes(raw) ? (raw as Role) : DEFAULT_ROLE
}

/** The signed-in user, or null. Use where a page shows more to a member but still works
 *  for a visitor — the public site must keep working without an account. */
export async function optionalUser(): Promise<GunekuUser | null> {
  /* With no Clerk configured, `auth()` throws. There is no session to be had, so the honest
     answer is "nobody is signed in" — and a protected route then returns its own 401 rather
     than a 500 that tells a caller the server is broken. */
  if (!clerkConfigured()) return null

  const { userId, sessionClaims } = await auth()
  if (!userId) return null
  return { userId, role: roleFrom(sessionClaims) }
}

/** The signed-in user, or a thrown 401-shaped error. Use at the top of any handler that
 *  reads or writes something personal. */
export async function requireUser(): Promise<GunekuUser> {
  const user = await optionalUser()
  if (!user) throw new AuthError('Sign in to continue.', 401)
  return user
}

/** True when `role` is at least as privileged as `min`. */
export function atLeast(role: Role, min: Role): boolean {
  return ROLES.indexOf(role) >= ROLES.indexOf(min)
}

/** The signed-in user, if they hold at least `min`. Anything less is a 403, not a 401:
 *  they are known, they simply may not do this. */
export async function requireRole(min: Role): Promise<GunekuUser> {
  const user = await requireUser()
  if (!atLeast(user.role, min)) {
    throw new AuthError('You do not have access to that.', 403)
  }
  return user
}

/** Carries the status a route should return. The message is safe to show a visitor; it never
 *  contains provider or database detail (ADR-023). */
export class AuthError extends Error {
  constructor(message: string, readonly status: 401 | 403) {
    super(message)
    this.name = 'AuthError'
  }
}

/** Route-handler helper: turns an AuthError into its response and anything else into a
 *  fixed 500, so a protected handler never leaks why it failed. */
export function authErrorResponse(err: unknown): { body: { error: string }; status: number } {
  if (err instanceof AuthError) return { body: { error: err.message }, status: err.status }
  console.error('Protected route failed:', err)
  return { body: { error: 'Something went wrong. Please try again.' }, status: 500 }
}
