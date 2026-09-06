'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X } from 'lucide-react'

export const PALACE_TOPICS = [
  'Palace / traditional matters', 'Community development', 'Project support', 'GUDECA',
  'Education', 'Culture', 'Diaspora', 'Business / partnership',
  'Visit / appointment request', 'General enquiry', 'Other',
] as const

type Props = {
  open: boolean
  onClose: () => void
  /** Pre-fills the message, used when a question is handed over from the assistant. */
  prefillMessage?: string
  prefillTopic?: string
}

/* The Palace message form. It never claims the Fon answers personally: the confirmation
   promises a reply; it says only where the message goes.

   Where the copy goes is decided entirely on the server. Nothing in this component,
   its props, or the request body names a second recipient. */
export function PalaceMessageModal({ open, onClose, prefillMessage, prefillTopic }: Props) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preferred, setPreferred] = useState<'email' | 'phone'>('email')

  const dialogRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreFocusTo = useRef<Element | null>(null)

  /* Focus management: remember what had focus, move into the dialog, put it back on close. */
  useEffect(() => {
    if (!open) return
    restoreFocusTo.current = document.activeElement
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 30)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(t)
      document.body.style.overflow = prevOverflow
      ;(restoreFocusTo.current as HTMLElement | null)?.focus?.()
    }
  }, [open])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key !== 'Tab') return
    const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!nodes || nodes.length === 0) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }, [onClose])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSending(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/palace-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          topic: fd.get('topic'),
          message: fd.get('message'),
          preferredContact: fd.get('preferredContact'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          location: fd.get('location'),
          consent: fd.get('consent') === 'on',
          website: fd.get('website'),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send message.')
      setSent(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  const label = 'block text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[var(--ink-600)]'
  const field = 'mt-1.5 w-full rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5 text-[0.92rem] text-[var(--ink-900)] focus:border-[var(--royal-green)] focus:outline-none'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[oklch(0.215_0.045_158_/_0.55)] p-0 sm:items-center sm:p-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={onKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="palace-modal-title"
        className="max-h-[92dvh] w-full max-w-[34rem] overflow-y-auto rounded-t-[6px] border border-[var(--rule)] bg-[var(--paper)] sm:rounded-[4px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--rule)] px-5 py-4 sm:px-6">
          <div>
            <p className="inst-eyebrow">Guneku Palace</p>
            <h2 id="palace-modal-title" className="inst-h2 mt-1">
              {sent ? 'Message received' : 'Send a message to the Palace'}
            </h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close"
                  className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--ink-600)] hover:bg-[var(--stone)]">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {sent ? (
          <div className="px-5 py-8 sm:px-6">
            <div className="mb-4 flex items-center gap-2" aria-hidden>
              <span className="block h-0.5 w-8 bg-[var(--royal-green)]" />
              <span className="block h-0.5 w-4 bg-[var(--oxblood)]" />
            </div>
            <p className="inst-body">
              Thank you. Your message has been sent to the Guneku Palace. A
              representative may contact you using the details you provided.
            </p>
            <button type="button" onClick={onClose} className="inst-btn inst-btn-primary mt-6">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
            {/* Honeypot — visually and programmatically hidden from people. */}
            <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
              <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>

            <div className="grid gap-4">
              <div>
                <label className={label} htmlFor="pm-name">Your name <span className="text-[var(--oxblood)]">*</span></label>
                <input ref={firstFieldRef} id="pm-name" name="name" required className={field} autoComplete="name" />
              </div>

              <div>
                <label className={label} htmlFor="pm-topic">What is it about? <span className="text-[var(--oxblood)]">*</span></label>
                <select id="pm-topic" name="topic" required defaultValue={prefillTopic || ''} className={field}>
                  <option value="" disabled>Choose a topic</option>
                  {PALACE_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className={label} htmlFor="pm-message">Your message <span className="text-[var(--oxblood)]">*</span></label>
                <textarea id="pm-message" name="message" required rows={5} defaultValue={prefillMessage || ''}
                          minLength={10} maxLength={4000} className={`${field} resize-y`} />
              </div>

              <fieldset className="border-0 p-0">
                <legend className={label}>How should the Palace reply? <span className="text-[var(--oxblood)]">*</span></legend>
                <div className="mt-2 flex gap-4">
                  {(['email', 'phone'] as const).map(v => (
                    <label key={v} className="flex items-center gap-2 text-[0.9rem] text-[var(--ink-900)]">
                      <input type="radio" name="preferredContact" value={v}
                             checked={preferred === v} onChange={() => setPreferred(v)} />
                      {v === 'email' ? 'Email' : 'Telephone'}
                    </label>
                  ))}
                </div>
              </fieldset>

              {preferred === 'email' ? (
                <div>
                  <label className={label} htmlFor="pm-email">Email address <span className="text-[var(--oxblood)]">*</span></label>
                  <input id="pm-email" name="email" type="email" required className={field} autoComplete="email" />
                </div>
              ) : (
                <div>
                  <label className={label} htmlFor="pm-phone">Callback number <span className="text-[var(--oxblood)]">*</span></label>
                  <input id="pm-phone" name="phone" type="tel" required className={field} autoComplete="tel" />
                </div>
              )}

              <div>
                <label className={label} htmlFor="pm-location">Where are you writing from? <span className="font-normal normal-case tracking-normal text-[var(--ink-400)]">(optional)</span></label>
                <input id="pm-location" name="location" className={field} autoComplete="country-name" />
              </div>

              <label className="flex items-start gap-2.5 text-[0.84rem] leading-[1.55] text-[var(--ink-600)]">
                <input type="checkbox" name="consent" required className="mt-1 shrink-0" />
                <span>
                  I agree that the Palace may use the contact details above to reply to this
                  message. <span className="text-[var(--oxblood)]">*</span>
                </span>
              </label>

              {/* Said because it is true, and said without a timetable because there is not
                  one. The Palace has not set a retention policy, so promising a period here
                  would invent one — and a village record that quietly deletes a villager's
                  letter on a schedule nobody decided is worse than one that keeps it. */}
              <p className="text-[0.8rem] leading-[1.55] text-[var(--ink-400)]">
                Your message is kept privately by the Palace so that it can be answered and
                referred back to. It is never published on Guneku.org, and it is not shared
                outside the Fondom.
              </p>

              {error && (
                <p role="alert" className="text-[0.86rem] text-[var(--oxblood)]">{error}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button type="submit" disabled={sending} className="inst-btn inst-btn-primary disabled:opacity-60">
                  {sending ? 'Sending…' : 'Send message'}
                </button>
                <button type="button" onClick={onClose} className="inst-btn inst-btn-quiet">Cancel</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
