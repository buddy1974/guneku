'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Chapter, SubmissionIntent } from '@/lib/community'

const LABEL = 'block text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[var(--ink-600)]'
const FIELD = 'mt-1.5 w-full rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5 text-[0.92rem] text-[var(--ink-900)] focus:border-[var(--royal-green)] focus:outline-none'

type Props = {
  intent:      SubmissionIntent
  cta:         string
  chapters:    Chapter[]
  /** Pre-filled when arriving from a chapter card or a seed stub. */
  initialChapter?: string
  initialPerson?:  string
  entrySlug?:      string
  quarters:    string[]
}

export function DirectoryForm({
  intent, cta, chapters, initialChapter, initialPerson, entrySlug, quarters,
}: Props) {
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  if (sent) {
    return (
      <div className="inst-card p-6 md:p-8">
        <div className="mb-4 flex items-center gap-2" aria-hidden>
          <span className="block h-0.5 w-8 bg-[var(--royal-green)]" />
          <span className="block h-0.5 w-4 bg-[var(--oxblood)]" />
        </div>
        <h2 className="inst-h2">
          {intent === 'remove' ? 'Request received' : 'Sent to the Palace'}
        </h2>
        <p className="inst-body mt-3">
          {intent === 'claim' &&
            'Your claim has been sent to the Palace. Once it is confirmed that the entry is yours, you will be sent the link to complete your profile — what it says, and what stays private, will then be yours to decide.'}
          {intent === 'add' &&
            'Thank you. The name has been sent to the Palace for review. If it is confirmed, the person is invited to complete their own profile — nobody fills it in on their behalf.'}
          {intent === 'remove' &&
            'The request has been sent and will be honoured. The entry comes down; no reason is required and none will be asked for.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/indigenes" className="inst-btn inst-btn-quiet">Back to the directory</Link>
          {intent !== 'remove' && (
            <Link href="/indigenes/submit?intent=add" className="inst-link self-center">
              Put forward another name →
            </Link>
          )}
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSending(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/community/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          intent,
          entrySlug,
          personName:   fd.get('personName'),
          senderName:   fd.get('senderName'),
          senderEmail:  fd.get('senderEmail'),
          senderPhone:  fd.get('senderPhone'),
          relationship: fd.get('relationship'),
          chapter:      fd.get('chapter'),
          quarter:      fd.get('quarter'),
          message:      fd.get('message'),
          website:      fd.get('website'),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send your request.')
      setSent(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  const selfClaim = intent === 'claim'

  return (
    <form onSubmit={handleSubmit} className="inst-card grid gap-4 p-6 md:p-8">
      {/* Honeypot — hidden from people, catches automated posts. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div>
        <label className={LABEL} htmlFor="dir-person">
          {intent === 'remove' ? 'Name to be removed' : 'Full name'}{' '}
          <span className="text-[var(--oxblood)]">*</span>
        </label>
        <input
          id="dir-person" name="personName" required maxLength={120}
          defaultValue={initialPerson || ''}
          readOnly={Boolean(initialPerson)}
          className={`${FIELD} ${initialPerson ? 'bg-[var(--paper-alt,#f2efe9)] text-[var(--ink-600)]' : ''}`}
          placeholder="e.g. Ngwa Emmanuel"
        />
      </div>

      {intent !== 'remove' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="dir-chapter">Chapter or community</label>
            <select
              id="dir-chapter" name="chapter" defaultValue={initialChapter || ''}
              className={FIELD}
            >
              <option value="">Not sure / not listed</option>
              <optgroup label="Home — Cameroon">
                {chapters.filter(c => c.scope === 'home').map(c => (
                  <option key={c.id} value={c.id}>{c.place} — {c.org}</option>
                ))}
              </optgroup>
              <optgroup label="Diaspora">
                {chapters.filter(c => c.scope === 'diaspora').map(c => (
                  <option key={c.id} value={c.id}>{c.flag} {c.short} — {c.org}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="dir-quarter">Quarter of origin in Guneku</label>
            <select id="dir-quarter" name="quarter" defaultValue="" className={FIELD}>
              <option value="">Not sure</option>
              {quarters.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="dir-sender">
            {selfClaim ? 'Your name' : 'Your name (who is writing)'}{' '}
            <span className="text-[var(--oxblood)]">*</span>
          </label>
          <input id="dir-sender" name="senderName" required maxLength={120} autoComplete="name" className={FIELD} />
        </div>
        {intent === 'add' && (
          <div>
            <label className={LABEL} htmlFor="dir-rel">
              How do you know them?{' '}
              <span className="font-normal normal-case tracking-normal text-[var(--ink-400)]">(optional)</span>
            </label>
            <input id="dir-rel" name="relationship" maxLength={160} className={FIELD} placeholder="e.g. my brother · same quarter" />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="dir-email">Email</label>
          <input id="dir-email" name="senderEmail" type="email" autoComplete="email" className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="dir-phone">Telephone / WhatsApp</label>
          <input id="dir-phone" name="senderPhone" type="tel" autoComplete="tel" className={FIELD} />
        </div>
      </div>
      <p className="inst-meta -mt-1">
        Leave at least one of the two, so the Palace can come back to you.
      </p>

      <div>
        <label className={LABEL} htmlFor="dir-message">
          {intent === 'claim'
            ? 'Anything that helps confirm this is you'
            : intent === 'remove'
              ? 'Anything you would like to add'
              : 'Anything the Palace should know'}{' '}
          <span className="font-normal normal-case tracking-normal text-[var(--ink-400)]">(optional)</span>
        </label>
        <textarea id="dir-message" name="message" rows={4} maxLength={2000} className={`${FIELD} resize-y`} />
      </div>

      <p className="inst-meta">
        What you send goes to the Guneku Palace and is used only to check this entry.
        Nothing you write here is published. A profile only ever shows what its own
        owner has chosen to show.
      </p>

      {error && (
        <p className="text-[0.86rem] text-[var(--oxblood)]" role="alert">{error}</p>
      )}

      <div>
        <button type="submit" disabled={sending} className="inst-btn inst-btn-primary disabled:opacity-60">
          {sending ? 'Sending…' : cta}
        </button>
      </div>
    </form>
  )
}
