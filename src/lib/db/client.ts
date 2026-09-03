import { neon, NeonQueryFunction } from '@neondatabase/serverless'

/* The Neon client, created once and lazily.
 *
 * ── The bug this file used to contain ────────────────────────────────────────────────────
 *
 * The lazy wrapper was `new Proxy({}, { apply, get })`. A Proxy's `apply` trap only ever runs
 * when the *target* is callable, and `{}` is not — so `typeof sql` was `"object"`, every
 * tagged template `sql\`SELECT …\`` threw `TypeError: sql is not a function` at the call site,
 * and the trap that was supposed to handle it never ran once.
 *
 * Property access worked, because `get` traps fine on a plain object. That is what made it
 * survive: the file looked right, `sql.query(...)` would have worked, and only the tagged
 * template form — which is the form every query in this repository actually uses — was
 * broken. It shipped in the Supabase-to-Neon swap and every database call has failed since.
 *
 * The target is now a function, so `apply` fires. Verified rather than assumed:
 *   new Proxy({},          {apply}) -> typeof "object",   calling throws TypeError
 *   new Proxy(function(){},{apply}) -> typeof "function", the trap runs
 *
 * ── Configuration is classified, not just truth-tested ───────────────────────────────────
 *
 * A missing connection string, an empty one and a malformed one are three different
 * operational problems, and collapsing them into one falsy check meant the logs could not
 * tell them apart. They are separated below and reported distinctly — server-side only.
 *
 * Nothing here ever logs the connection string, its host, or any part of it. A database URL
 * carries a password; a log line that includes "the host is X" is one screenshot away from
 * being a credential leak. The diagnostics say what *kind* of problem it is and nothing more.
 */

/** Raised when the database is not configured. Distinct from a query failure: a route can
 *  answer 503 for this and 500 for a genuine fault, and neither reveals why to the caller. */
export class DbConfigError extends Error {
  constructor(readonly reason: 'missing' | 'empty' | 'malformed') {
    super(`Database is not configured (${reason}).`)
    this.name = 'DbConfigError'
  }
}

type ConfigState =
  | { ok: true; url: string }
  | { ok: false; reason: 'missing' | 'empty' | 'malformed' }

/** Classifies `DATABASE_URL` without revealing it. Exported so a health check can ask. */
export function databaseConfigState(): ConfigState {
  const raw = process.env.DATABASE_URL

  if (raw === undefined) return { ok: false, reason: 'missing' }
  if (raw.trim() === '') return { ok: false, reason: 'empty' }

  try {
    const u = new URL(raw.trim())
    /* Neon speaks Postgres; anything else here is a copy-paste accident, not a database. */
    if (u.protocol !== 'postgres:' && u.protocol !== 'postgresql:') {
      return { ok: false, reason: 'malformed' }
    }
    if (!u.hostname) return { ok: false, reason: 'malformed' }
  } catch {
    return { ok: false, reason: 'malformed' }
  }

  return { ok: true, url: raw.trim() }
}

/** True when a query could be attempted. Cheap, and safe to call from anywhere. */
export function isDatabaseConfigured(): boolean {
  return databaseConfigState().ok
}

let _sql: NeonQueryFunction<false, false> | null = null

function getClient(): NeonQueryFunction<false, false> {
  if (_sql) return _sql

  const state = databaseConfigState()
  if (!state.ok) {
    /* One line, no value, no host. The reason is enough to act on. */
    console.error(`Database unavailable: DATABASE_URL is ${state.reason}.`)
    throw new DbConfigError(state.reason)
  }

  _sql = neon(state.url)
  return _sql
}

/* A callable target, so the `apply` trap actually fires. The cast is confined to this one
   place rather than spread across the call sites. */
const callableTarget = function neonProxyTarget() {} as unknown as NeonQueryFunction<false, false>

export const sql: NeonQueryFunction<false, false> = new Proxy(callableTarget, {
  apply(_target, thisArg, args: unknown[]) {
    const client = getClient() as unknown as (...a: unknown[]) => unknown
    return Reflect.apply(client, thisArg, args)
  },
  get(_target, prop, receiver) {
    /* `sql.query(...)`, `sql.transaction(...)`, `sql.unsafe(...)` all land here. */
    return Reflect.get(getClient() as unknown as object, prop, receiver)
  },
})
