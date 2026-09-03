'use client'

import { useState } from 'react'

const LABEL = 'block text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[var(--ink-600)]'
const FIELD = 'mt-1.5 w-full rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5 text-[0.92rem] text-[var(--ink-900)] focus:border-[var(--royal-green)] focus:outline-none disabled:opacity-55'

export type MemberDetails = {
  displayName: string
  email: string
  country: string
  quarter: string
  chapter: string
  profilePublic: boolean
  showCountry: boolean
  showQuarter: boolean
  contactable: boolean
}

const EMPTY: MemberDetails = {
  displayName: '', email: '', country: '', quarter: '', chapter: '',
  profilePublic: false, showCountry: true, showQuarter: false, contactable: false,
}

/* The form posts to /api/me, which takes the user id from the Clerk session rather than
   from anything here. There is deliberately no user id field: a form that could name whose
   record it is editing would be the vulnerability, not the feature. */
export function MemberDetailsForm({
  quarters, initial, disabled = false,
}: { quarters: readonly string[]; initial?: MemberDetails; disabled?: boolean }) {
  const [v, setV]       = useState<MemberDetails>(initial ?? EMPTY)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function set<K extends keyof MemberDetails>(k: K, value: MemberDetails[K]) {
    setV(prev => ({ ...prev, [k]: value }))
    setSaved(false)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setSaving(true)
    try {
      const res  = await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save your details.')
      setSaved(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="inst-card grid gap-4 p-5 md:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="mg-name">Name to show</label>
          <input id="mg-name" className={FIELD} disabled={disabled} maxLength={120}
                 value={v.displayName} onChange={e => set('displayName', e.target.value)} />
        </div>
        <div>
          <label className={LABEL} htmlFor="mg-email">Email for Fondom notices</label>
          <input id="mg-email" type="email" className={FIELD} disabled={disabled} maxLength={200}
                 value={v.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div>
          <label className={LABEL} htmlFor="mg-country">Country you live in</label>
          <input id="mg-country" className={FIELD} disabled={disabled} maxLength={80}
                 autoComplete="country-name"
                 value={v.country} onChange={e => set('country', e.target.value)} />
        </div>
        <div>
          <label className={LABEL} htmlFor="mg-chapter">GUDECA chapter, if you belong to one</label>
          <input id="mg-chapter" className={FIELD} disabled={disabled} maxLength={120}
                 value={v.chapter} onChange={e => set('chapter', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="mg-quarter">Your quarter</label>
        <select id="mg-quarter" className={FIELD} disabled={disabled}
                value={v.quarter} onChange={e => set('quarter', e.target.value)}>
          <option value="">Not saying</option>
          {quarters.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
        <p className="inst-meta mt-1.5">
          What you tell us, not a matter of record. The register is only changed by a claim
          the Palace has reviewed.
        </p>
      </div>

      <fieldset className="border-0 p-0">
        <legend className={LABEL}>What others may see</legend>
        <div className="mt-2.5 grid gap-2.5">
          {([
            ['profilePublic', 'Show me in the indigenes directory'],
            ['showCountry',   'Show the country I live in'],
            ['showQuarter',   'Show my quarter'],
            ['contactable',   'Let the Fondom pass on a message to me'],
          ] as const).map(([key, text]) => (
            <label key={key} className="flex items-start gap-2.5 text-[0.88rem] leading-[1.55] text-[var(--ink-600)]">
              <input type="checkbox" className="mt-1 shrink-0" disabled={disabled}
                     checked={v[key]} onChange={e => set(key, e.target.checked)} />
              <span>{text}</span>
            </label>
          ))}
        </div>
        <p className="inst-meta mt-2.5">
          Everything starts private except the country. Nothing here is shown anywhere until
          you turn it on.
        </p>
      </fieldset>

      {error && <p role="alert" className="text-[0.86rem] text-[var(--oxblood)]">{error}</p>}
      {saved && <p className="text-[0.86rem] text-[var(--royal-green)]">Saved.</p>}

      <div className="pt-1">
        <button type="submit" disabled={saving || disabled}
                className="inst-btn inst-btn-primary disabled:opacity-55">
          {saving ? 'Saving…' : 'Save my details'}
        </button>
      </div>
    </form>
  )
}
