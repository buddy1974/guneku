import 'server-only'

/* One limiter for every public form route.
 *
 * All four forms — contact, the Palace message, the support offer and a directory
 * submission — deliver to the same Palace inbox. Limiting each route on its own
 * therefore misses the actual risk: a sender who is stopped on one form simply moves
 * to the next and keeps writing. So there are two buckets.
 *
 *   per route   5 in 10 minutes — normal use never reaches it; a single form being
 *               hammered stops there.
 *   per sender 12 in 10 minutes — across all four routes together, so rotating
 *               between forms does not multiply the budget by four.
 *
 * It is in-memory and per-instance: it resets on redeploy and a serverless fleet keeps
 * one counter per running instance. That is a real limit on its strength and it is why
 * this blunts casual abuse rather than defeating a determined flood. It is deliberately
 * not a dependency, a database round-trip or a CAPTCHA — the honest trade for a village
 * website is the cheap defence that costs a legitimate sender nothing. If the Palace
 * inbox is ever actually flooded, this is the thing to replace, not to tune. */

const WINDOW_MS = 10 * 60 * 1000
const PER_ROUTE = 5
const PER_SENDER = 12

/** Keyed "route|ip" for the route bucket and "*|ip" for the sender bucket. */
const hits = new Map<string, number[]>()

/* Bounded so a long-lived instance cannot grow the map without limit. Clearing wholesale
   is the forgiving failure: an abuser gets a fresh budget, an ordinary sender is never
   wrongly blocked, and the map cannot become the denial of service it exists to prevent. */
const MAX_KEYS = 5000

function record(key: string, now: number, max: number) {
  const recent = (hits.get(key) || []).filter(t => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > MAX_KEYS) hits.clear()
  return recent.length > max
}

/** The sender's address, as far as the platform will tell us. Behind Vercel the first
 *  entry of x-forwarded-for is the client; everything after it is proxy hops. An absent
 *  header collapses every such caller into one bucket, which is the safe direction. */
export function senderKey(req: { headers: { get(name: string): string | null } }) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')?.trim()
    || 'unknown'
}

/** True when this request should be refused. Call once per request, before any work:
 *  it records the attempt as well as reading it. */
export function rateLimited(route: string, ip: string) {
  const now = Date.now()
  /* Both are recorded on every call, so a request refused by the route bucket still
     counts against the sender's overall budget. */
  const overRoute  = record(`${route}|${ip}`, now, PER_ROUTE)
  const overSender = record(`*|${ip}`, now, PER_SENDER)
  return overRoute || overSender
}

/** The one message every form route returns, so a sender is told the same thing
 *  whichever form they are on. */
export const RATE_LIMIT_MESSAGE =
  'Too many messages from this connection. Please try again later.'
