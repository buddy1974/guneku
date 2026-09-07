'use client'
import { useEffect, useId, useRef, useState } from 'react'

/* The Turnstile widget, on the four forms a stranger can post to without an account.
 *
 * Renders nothing at all until the site key exists, so the forms look and behave exactly as
 * they do today until the owner arms it. That is deliberate: a widget with no secret behind
 * it verifies nothing and only looks like protection.
 *
 * ── Accessibility ────────────────────────────────────────────────────────────────────────
 *
 * Turnstile is normally invisible — most visitors solve nothing and see a small badge. When
 * it does need interaction it renders Cloudflare's own accessible challenge. What this
 * component adds is the part Cloudflare cannot: a labelled region, a status message that is
 * announced when the check fails or expires, and a form that says *why* it will not send
 * rather than a button that quietly does nothing.
 *
 * The token is held in component state and posted with the form. It is never logged, never
 * put in a URL, and never stored. */

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

export type TurnstileAction =
  | 'palace-message' | 'contact' | 'support-interest' | 'community-register'

export function TurnstileField({
  action,
  onToken,
}: {
  action: TurnstileAction
  /** Called with the token, or with '' whenever it expires, fails, or is reset. */
  onToken: (token: string) => void
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const holder = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'ready' | 'error'>('idle')
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
          callback: (token: string) => { setStatus('ready'); onToken(token) },
          /* Expiry and failure both clear the token, so a stale one is never posted. */
          'expired-callback': () => { setStatus('idle'); onToken('') },
          'error-callback': () => { setStatus('error'); onToken('') },
        })
      })
      .catch(() => { if (!cancelled) setStatus('error') })

    return () => {
      cancelled = true
      if (widget.current && window.turnstile) {
        try { window.turnstile.remove(widget.current) } catch { /* already gone */ }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- render once; onToken is stable enough and re-rendering the widget would reset the challenge under the visitor
  }, [siteKey, action])

  /* Not configured: no widget, no placeholder, no gap. */
  if (!siteKey) return null

  return (
    <div>
      <div ref={holder} aria-describedby={`${id}-status`} />
      <p id={`${id}-status`} role="status" aria-live="polite" className="inst-meta mt-2">
        {status === 'error'
          ? 'The check could not load. Please reload the page and try again — your message has not been sent.'
          : status === 'ready'
            ? 'Check complete.'
            : 'A quick check that you are a person. Most visitors see nothing to do.'}
      </p>
    </div>
  )
}
