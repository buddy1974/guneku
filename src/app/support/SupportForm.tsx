'use client'

import { useState } from 'react'

const SUPPORT_TYPES = [
  'Financial support', 'Materials', 'Professional expertise', 'Volunteer support', 'Partnership',
] as const

const LABEL = 'block text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[var(--ink-600)]'
const FIELD = 'mt-1.5 w-full rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5 text-[0.92rem] text-[var(--ink-900)] focus:border-[var(--royal-green)] focus:outline-none'

export function SupportForm({ projects, initialProject }: { projects: string[]; initialProject?: string }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (sent) {
    return (
      <div className="inst-card p-6 md:p-8">
        <div className="mb-4 flex items-center gap-2" aria-hidden>
          <span className="block h-0.5 w-8 bg-[var(--royal-green)]" />
          <span className="block h-0.5 w-4 bg-[var(--oxblood)]" />
        </div>
        <h2 className="inst-h2">Offer received</h2>
        <p className="inst-body mt-3">
          Thank you. Your offer has been sent to the Guneku Palace for review. A
          representative may contact you using the details you provided.
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSending(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/support-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          organisation: fd.get('organisation'),
          project: fd.get('project'),
          supportType: fd.get('supportType'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          location: fd.get('location'),
          message: fd.get('message'),
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

  return (
    <form onSubmit={handleSubmit} className="inst-card grid gap-4 p-6 md:p-8">
      {/* Honeypot — hidden from people, catches automated posts. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div>
        <label className={LABEL} htmlFor="sp-project">Which project? <span className="text-[var(--oxblood)]">*</span></label>
        <select id="sp-project" name="project" required defaultValue={initialProject || ''} className={FIELD}>
          <option value="" disabled>Choose a project</option>
          {projects.map(p => <option key={p} value={p}>{p}</option>)}
          <option value="Wherever it is most needed">Wherever it is most needed</option>
        </select>
      </div>

      <fieldset className="border-0 p-0">
        <legend className={LABEL}>How would you like to help? <span className="text-[var(--oxblood)]">*</span></legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {SUPPORT_TYPES.map((t, i) => (
            <label key={t} className="flex items-center gap-2 text-[0.9rem] text-[var(--ink-900)]">
              <input type="radio" name="supportType" value={t} required defaultChecked={i === 0} />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="sp-name">Your name <span className="text-[var(--oxblood)]">*</span></label>
          <input id="sp-name" name="name" required className={FIELD} autoComplete="name" />
        </div>
        <div>
          <label className={LABEL} htmlFor="sp-org">Organisation <span className="font-normal normal-case tracking-normal text-[var(--ink-400)]">(optional)</span></label>
          <input id="sp-org" name="organisation" className={FIELD} autoComplete="organization" />
        </div>
        <div>
          <label className={LABEL} htmlFor="sp-email">Email</label>
          <input id="sp-email" name="email" type="email" className={FIELD} autoComplete="email" />
        </div>
        <div>
          <label className={LABEL} htmlFor="sp-phone">Telephone</label>
          <input id="sp-phone" name="phone" type="tel" className={FIELD} autoComplete="tel" />
        </div>
      </div>
      <p className="inst-meta -mt-1">Please leave at least one of the two so the Palace can reach you if it needs to.</p>

      <div>
        <label className={LABEL} htmlFor="sp-location">Where are you writing from? <span className="font-normal normal-case tracking-normal text-[var(--ink-400)]">(optional)</span></label>
        <input id="sp-location" name="location" className={FIELD} autoComplete="country-name" />
      </div>

      <div>
        <label className={LABEL} htmlFor="sp-message">Anything you would like to add?</label>
        <textarea id="sp-message" name="message" rows={4} maxLength={4000} className={`${FIELD} resize-y`} />
      </div>

      <label className="flex items-start gap-2.5 text-[0.84rem] leading-[1.55] text-[var(--ink-600)]">
        <input type="checkbox" name="consent" required className="mt-1 shrink-0" />
        <span>I agree that the Palace may use the contact details above to reply. <span className="text-[var(--oxblood)]">*</span></span>
      </label>

      {error && <p role="alert" className="text-[0.86rem] text-[var(--oxblood)]">{error}</p>}

      <div className="pt-1">
        <button type="submit" disabled={sending} className="inst-btn inst-btn-primary disabled:opacity-60">
          {sending ? 'Sending…' : 'Send to the Palace'}
        </button>
      </div>
    </form>
  )
}
