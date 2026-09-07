'use client'
import { useCallback, useReducer } from 'react'
import {
  HUMAN_CHECK_MESSAGE, HUMAN_CHECK_CODE,
  humanCheckReducer, humanCheckRejection, initialHumanCheck, needsHumanCheck,
} from './human-check'

/* The human check as a form sees it. A thin wrapper: every decision lives in
 * `human-check.ts`, which is pure and is where the behaviour is tested.
 *
 * All four anonymous forms use this, so they cannot drift apart about what a visitor is told
 * — which is how one of them ended up saying nothing at all. */

export { HUMAN_CHECK_MESSAGE, HUMAN_CHECK_CODE }

export type TurnstileAction =
  | 'palace-message' | 'contact' | 'support-interest' | 'community-register'

export type UseTurnstile = {
  /** The current token. Post it with the form. */
  token: string
  /** The sentence to show, or null. */
  error: string | null
  /** True when the check is armed. False means the widget renders nothing and `ready()`
   *  always passes, which is how the forms behave until the owner sets the keys. */
  required: boolean
  /** Call before posting. False means: do not post — the visitor has been told why. */
  ready: () => boolean
  /** A failed response. Returns true when it was the check refusing and has been handled;
   *  false when it was something else for the caller's ordinary error path. */
  rejected: (body: unknown) => boolean
  /** Clear the message — on success, or when the visitor starts again. */
  clear: () => void
  /** Spread onto `<TurnstileField />`. */
  field: {
    action: TurnstileAction
    error: string | null
    resetKey: number
    onToken: (token: string) => void
  }
}

export function useTurnstile(action: TurnstileAction): UseTurnstile {
  const [state, dispatch] = useReducer(humanCheckReducer, initialHumanCheck)

  /* `NEXT_PUBLIC_*` is inlined at build time, so this is a constant in the bundle. */
  const required = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

  const ready = useCallback(() => {
    if (needsHumanCheck(required, state.token)) {
      dispatch({ type: 'blocked' })
      return false
    }
    return true
  }, [required, state.token])

  const rejected = useCallback((body: unknown) => {
    const message = humanCheckRejection(body)
    if (message === null) return false
    dispatch({ type: 'rejected', message })
    return true
  }, [])

  const clear = useCallback(() => dispatch({ type: 'cleared' }), [])
  const onToken = useCallback((token: string) => dispatch({ type: 'token', token }), [])

  return {
    token: state.token,
    error: state.error,
    required,
    ready,
    rejected,
    clear,
    field: { action, error: state.error, resetKey: state.resetKey, onToken },
  }
}
