'use client'
import { useEffect, useId, useRef, useState } from 'react'
import type { TurnstileAction } from './useTurnstile'

/* The Turnstile widget and, just as importantly, what it says when the check has not passed.
 *
 * Renders nothing at all until the site key exists, so the forms look and behave exactly as
 * they do today until the owner arms it. That is deliberate: a widget with no secret behind
 * it verifies nothing and only looks like protection.
 *
 * ── Two regions, two urgencies ───────────────────────────────────────────────────────────
 *
 * The ordinary state is a `role="status"` / polite region: most visitors solve nothing, see
 * a small badge, and should not be interrupted to be told so.
 *
 * A failure is a `role="alert"` — assertive, announced the moment it appears, and visible
 * beside the widget the visitor has to act on. Until 2026-09-07 there was only the polite
 * region, and it kept saying "A quick check that you are a person" while the submission was
 * being refused. Politeness is the wrong register for "this is why nothing happened".
 *
 * Both are bound to the widget with `aria-describedby`, so a screen-reader user who moves to
 * the challenge hears its state rather than having to find the message.
 *
 * The token is held by the caller's hook, posted with the form, never logged, never put in a
 * URL and never stored. */

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      remove: (id: string) => void
      reset: (id?: string) => void
    }
    onloadTurnstileCallback?: () => void
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback'

let scriptPromise: Promise<void> | null = null

function loadTurnstile(): Promise<void> {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'))
    if (window.turnstile) return resolve()
    window.onloadTurnstileCallback = () => resolve()
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onerror = () => reject(new Error('turnstile script failed'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

export type { TurnstileAction }

export function TurnstileField({
  action,
  onToken,
  error,
  resetKey = 0,
}: {
  action: TurnstileAction
  /** Called with the token, or with '' whenever it expires, fails, or is reset. */
  onToken: (token: string) => void
  /** The sentence to announce, from `useTurnstile`. Null when there is nothing wrong. */
  error?: string | null
  /** Bumped by the caller to hand the visitor a fresh challenge after a rejection. */
  resetKey?: number
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const holder = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const id = useId()

  useEffect(() => {
    if (!siteKey || !holder.current) return
    let cancelled = false

    loadTurnstile()
      .then(() => {
        if (cancelled || !holder.current || !window.turnstile) return
        widget.current = window.turnstile.render(holder.current, {
          sitekey: siteKey,
          action,
          theme: 'light',
          callback: (token: string) => onToken(token),
          /* Expiry and failure both clear the token, so a stale one is never posted. The
             caller turns an empty token into the same one sentence. */
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken(''),
        })
      })
      .catch(() => { if (!cancelled) setLoadFailed(true) })

    return () => {
      cancelled = true
      if (widget.current && window.turnstile) {
        try { window.turnstile.remove(widget.current) } catch { /* already gone */ }
      }
      widget.current = null
    }
    /* `resetKey` is in the list on purpose: bumping it tears the widget down and renders a
       fresh challenge, which is what a spent token needs. `onToken` is stable (useCallback
       in the hook) and re-running for it would reset the challenge under the visitor. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, action, resetKey])

  /* Not configured: no widget, no placeholder, no gap, and no message about a check the
     visitor is not being asked to pass. */
  if (!siteKey) return null

  const failed = loadFailed
    ? 'The check could not load. Please reload the page and try again — nothing has been sent.'
    : error

  return (
    <div>
      <div ref={holder} aria-describedby={`${id}-state`} />

      {/* Assertive, because this is why nothing happened. */}
      {failed ? (
        <p
          id={`${id}-state`}
          role="alert"
          className="mt-2 text-[0.86rem] leading-[1.5] text-[var(--oxblood)]"
        >
          {failed}
        </p>
      ) : (
        <p id={`${id}-state`} role="status" aria-live="polite" className="inst-meta mt-2">
          A quick check that you are a person. Most visitors see nothing to do.
        </p>
      )}
    </div>
  )
}

