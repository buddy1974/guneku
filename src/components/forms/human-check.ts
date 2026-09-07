/* What a visitor is told when the human check has not passed, as plain decisions.
 *
 * Pure and free of React on purpose: this is the part worth testing hardest, and a state
 * machine that needs a browser to exercise is a state machine nobody exercises. `useTurnstile`
 * is a thin wrapper over these three functions.
 *
 * ── The defect they close ────────────────────────────────────────────────────────────────
 *
 * Acceptance found `/contact` failing silently: the check was enforced, the server answered
 * 400, and the page showed nothing. The submit handler ended in `alert('Failed to send')`,
 * which discarded the server's own message, and the only text beside the widget still read
 * "A quick check that you are a person" — in a polite live region that had not changed. A
 * visitor could press send repeatedly and never learn why nothing happened.
 *
 * The other three forms did show the message, but each in its own way and all four posted
 * first and asked afterwards. One behaviour now, decided here. */

/** One sentence, in every failing case. An instruction rather than a description, no provider
 *  name, no status code — Cloudflare's error codes describe our configuration, not the
 *  visitor's problem, and one of them names the site key. */
export const HUMAN_CHECK_MESSAGE = 'Please complete the human check before sending.'

/** Sent by the server with its 400 so the browser can recognise *this* refusal among other
 *  400s without matching on prose. */
export const HUMAN_CHECK_CODE = 'human-check'

/**
 * Whether to refuse before the network.
 *
 * An unsolved check would be refused by the server anyway; refusing here tells the visitor
 * immediately instead of after a round trip, and spends no rate-limit slot on a request that
 * was always going to fail. When the check is not armed this is always false, which is how
 * the forms behave until the owner sets the keys.
 */
export function needsHumanCheck(required: boolean, token: string): boolean {
  return required && token.trim() === ''
}

type ServerBody = { code?: unknown; error?: unknown }

/**
 * Whether a failed response is the human check refusing, and what to say if so.
 *
 * Returns null for every other failure, which the caller shows through its ordinary error
 * path. Matching the code rather than the sentence means the wording can change without the
 * browser quietly stopping recognising it.
 */
export function humanCheckRejection(body: unknown): string | null {
  const b = (body ?? {}) as ServerBody
  if (b.code !== HUMAN_CHECK_CODE) return null
  /* The server's sentence when it sent one, ours when it did not. Never a provider string:
     the routes send only `TURNSTILE_MESSAGE`, and this is the last place that could leak one
     if that ever changed. */
  const said = typeof b.error === 'string' ? b.error.trim() : ''
  return said && !looksLikeProviderDetail(said) ? said : HUMAN_CHECK_MESSAGE
}

/** Anything that reads like plumbing rather than like a sentence for a person. */
function looksLikeProviderDetail(text: string): boolean {
  return /cloudflare|turnstile|sitekey|site key|secret|siteverify|invalid-input|timeout-or-duplicate|\bhttp\b|\b[45]\d\d\b/i
    .test(text)
}

/* ── The lifecycle, as one value ─────────────────────────────────────────────────────────
 *
 * Written as a reducer so the whole of it can be walked in a test: solved, expired,
 * submitted, refused, re-solved, sent. The states a visitor actually moves through. */

export type HumanCheckState = {
  token: string
  error: string | null
  /** Bumped to hand the visitor a fresh challenge. A token is single-use, so a refused
   *  submission has spent the one they had. */
  resetKey: number
}

export const initialHumanCheck: HumanCheckState = { token: '', error: null, resetKey: 0 }

export type HumanCheckEvent =
  /** The widget produced a token, or cleared it on expiry or error. */
  | { type: 'token'; token: string }
  /** The visitor pressed send while the check was armed and unsolved. */
  | { type: 'blocked' }
  /** The server refused the check. */
  | { type: 'rejected'; message?: string }
  /** Sent, or the visitor is starting again. */
  | { type: 'cleared' }

export function humanCheckReducer(
  state: HumanCheckState, event: HumanCheckEvent,
): HumanCheckState {
  switch (event.type) {
    case 'token':
      return {
        ...state,
        token: event.token,
        /* Solving it takes the complaint away without the visitor pressing anything.
           Losing it — expiry, or the challenge erroring — leaves whatever was said. */
        error: event.token ? null : state.error,
      }
    case 'blocked':
      return { ...state, error: HUMAN_CHECK_MESSAGE }
    case 'rejected':
      return {
        token: '',
        error: event.message || HUMAN_CHECK_MESSAGE,
        resetKey: state.resetKey + 1,
      }
    case 'cleared':
      return { ...state, error: null }
  }
}
