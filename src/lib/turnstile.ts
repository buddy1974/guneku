import 'server-only'

/* Cloudflare Turnstile, on the four forms a stranger can post to without an account.
 *
 * ── What it is here for, and what it is not ──────────────────────────────────────────────
 *
 * A layer, never a replacement. Every route that uses this already validates its input on
 * the server, already carries a honeypot, and already rate-limits by sender. Turnstile does
 * not remove any of that and must not be allowed to: a challenge stops a cheap script, and
 * says nothing about whether the body of the request is well-formed or whether the same
 * person has posted forty times this hour.
 *
 * ── Where it is applied, and where it is deliberately not ────────────────────────────────
 *
 * Applied to the genuinely anonymous public writes: the message to the Palace, the contact
 * form, an offer of support, and a name put forward for the directory. Somebody can post to
 * each of those with no account at all, which is the property that makes them worth
 * protecting.
 *
 * Not applied to anything behind a session. Editing a profile, claiming an entry, following
 * a topic, writing to the Palace as a member, reviewing a claim, answering a letter — each
 * of those already knows who is asking, checks what they are allowed to do server-side, and
 * is rate-limited. Adding a puzzle to them would tax the villagers who signed in and stop
 * nobody. The same holds for the indigenes registration journey: it happens after a Clerk
 * sign-in, so it is protected by identity rather than by a challenge.
 *
 * Not applied to Ask Guneku either. Its 3-per-10-minutes limiter is the control, and there
 * is no evidence of abuse to justify making a villager solve a puzzle to ask their own
 * Fondom a question. If that changes, this module is here.
 *
 * ── Inert until the owner arms it ────────────────────────────────────────────────────────
 *
 * Turnstile needs two keys that only the Cloudflare account owner can create. Until both
 * exist, `configured()` is false and the forms behave exactly as they do today — honeypot
 * and rate limit, unchanged. The moment both are set, the widget renders and this verifies:
 * no code change, no deploy beyond the environment variable.
 *
 * The one thing that must never happen is a middle state where the widget renders and the
 * server does not check. That is why both keys are read here and `configured()` requires
 * both. */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/** The host the challenge must have been solved on. A token minted for another site is not
 *  a token for this one. */
const EXPECTED_HOSTNAMES = ['www.guneku.org', 'guneku.org', 'localhost']

export type TurnstileAction =
  | 'palace-message' | 'contact' | 'support-interest' | 'community-register'

/** True only when both halves exist. A public key with no secret would render a widget that
 *  nothing verifies, which is worse than no widget: it looks like protection. */
export function turnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() &&
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
  )
}

export type TurnstileResult =
  | { ok: true; skipped: boolean }
  | { ok: false; reason: 'missing-token' | 'failed' | 'wrong-host' | 'wrong-action' | 'unreachable' }

/** What a visitor is told. Never the provider's error codes — those describe our
 *  configuration, not their problem, and one of them names the site key. */
export const TURNSTILE_MESSAGE = 'Please complete the human check before sending.'

/** Sent alongside the message so the browser can recognise *this* refusal among other 400s
 *  and re-arm the challenge, rather than matching on the sentence. */
export const TURNSTILE_CODE = 'human-check'

/**
 * Verify a token with Cloudflare. Fails closed on anything unexpected **once Turnstile is
 * configured**; when it is not configured this returns `{ ok: true, skipped: true }` so the
 * public forms keep working on the existing controls rather than breaking shut.
 */
export async function verifyTurnstile(
  token: unknown, action: TurnstileAction, ip?: string | null,
): Promise<TurnstileResult> {
  if (!turnstileConfigured()) return { ok: true, skipped: true }

  const response = typeof token === 'string' ? token.trim() : ''
  if (!response || response.length > 2048) return { ok: false, reason: 'missing-token' }

  const body = new URLSearchParams({
    secret: String(process.env.TURNSTILE_SECRET_KEY),
    response,
  })
  /* Cloudflare accepts the caller's IP as corroboration. Sent when known, omitted when not
     — an absent header must not turn into the string "unknown" being verified. */
  if (ip) body.set('remoteip', ip)

  let data: { success?: boolean; hostname?: string; action?: string }
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    })
    if (!res.ok) return { ok: false, reason: 'unreachable' }
    data = await res.json()
  } catch {
    /* Cloudflare unreachable. Closed rather than open: a form that silently stops checking
       whenever a third party has a bad afternoon is not a control. The visitor is asked to
       try again, and the honeypot and rate limit are still standing behind it. */
    return { ok: false, reason: 'unreachable' }
  }

  if (!data.success) return { ok: false, reason: 'failed' }

  /* A valid token from somewhere else is still somebody else's token. */
  if (data.hostname && !EXPECTED_HOSTNAMES.includes(data.hostname)) {
    return { ok: false, reason: 'wrong-host' }
  }
  /* And a token minted for the contact form is not a token for the Palace message. */
  if (data.action && data.action !== action) {
    return { ok: false, reason: 'wrong-action' }
  }

  return { ok: true, skipped: false }
}
