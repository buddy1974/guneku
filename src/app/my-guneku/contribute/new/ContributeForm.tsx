'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CONTRIBUTION_TYPES, TYPE_LABEL, TYPE_HINT, MAX_CONTENT, MAX_SOURCE,
  type ContributionType, type TargetType,
} from '@/lib/contributions'

/* The contribution itself.
 *
 * There is no contributor field, because there must not be one: the POST carries a type, a
 * target and text, and the server takes who is submitting from the Clerk session.
 *
 * There is no file input either, and that is a decision rather than an omission — see the
 * photo-archive hint below. Nothing here asks for an identity document, a passport or a
 * national ID, and no such verification has been approved for Guneku. */

const LABEL = 'block text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[var(--ink-600)]'
const FIELD = 'mt-1.5 w-full rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5 text-[0.92rem] text-[var(--ink-900)] focus:border-[var(--royal-green)] focus:outline-none'

export function ContributeForm({
  initialType, targetType, targetId, targetLabel,
}: {
  initialType: ContributionType | null
  targetType: TargetType
  targetId: string | null
  targetLabel: string
}) {
  const router = useRouter()
  const [type, setType]       = useState<ContributionType | ''>(initialType ?? '')
  const [content, setContent] = useState('')
  const [source, setSource]   = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  function toSignIn() {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberate: the session is gone, so the server must decide again who this is
    window.location.href = '/sign-in?redirect_url=%2Fmy-guneku%2Fcontribute%2Fnew'
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSending(true)

    try {
      const res = await fetch('/api/contributions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type, targetType, targetId, content, sourceNote: source }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        router.push('/my-guneku?contribution=sent')
        return
      }
      if (res.status === 401) return toSignIn()

      setError(data.error || 'Your contribution could not be sent. Please try again.')
    } catch {
      setError('Your contribution could not be sent. Please check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="inst-card p-5 md:p-6">
      {/* What it concerns — established server-side, shown here, not editable. A form that
          let the browser retype the target would be the place a canonical id got invented. */}
      <div className="border-b border-[var(--rule)] pb-4">
        <p className="inst-tag">This contribution is about</p>
        <p className="inst-h3 mt-1">{targetLabel}</p>
      </div>

      <div className="mt-5">
        <label className={LABEL} htmlFor="c-type">What kind of contribution is this?</label>
        <select
          id="c-type" required className={FIELD}
          value={type} onChange={e => setType(e.target.value as ContributionType)}
        >
          <option value="">Choose one</option>
          {CONTRIBUTION_TYPES.map(t => (
            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
          ))}
        </select>
        {type && <p className="inst-meta mt-1.5">{TYPE_HINT[type]}</p>}
      </div>

      {/* Photographs are described rather than uploaded. Guneku's blob store serves files
          publicly once written, so accepting an image here would put unreviewed material on
          the Fondom's own hosting before a person had looked at it. The Palace asks for it
          directly instead. */}
      {type === 'photo-archive' && (
        <p className="mt-3 border-l-2 border-[var(--ochre)] pl-3 text-[0.86rem] leading-[1.55] text-[var(--ink-600)]">
          Please describe what you hold — what it shows, roughly when, and who is in it if you
          know. Do not attach anything yet: the Palace will come back to you about how to send
          it, so that nothing is published before somebody has looked at it.
        </p>
      )}

      <div className="mt-5">
        <label className={LABEL} htmlFor="c-content">
          What would you like to add or correct?
        </label>
        <textarea
          id="c-content" required rows={8} maxLength={MAX_CONTENT} className={FIELD}
          value={content} onChange={e => setContent(e.target.value)}
          placeholder="Write it in your own words. Names, offices, dates, places — whatever you know."
        />
        <p className="inst-meta mt-1.5">{content.length}/{MAX_CONTENT}</p>
      </div>

      <div className="mt-4">
        <label className={LABEL} htmlFor="c-source">
          How do you know this? (optional)
        </label>
        <textarea
          id="c-source" rows={3} maxLength={MAX_SOURCE} className={FIELD}
          value={source} onChange={e => setSource(e.target.value)}
          placeholder="A document, a meeting, your own family, someone who would confirm it."
        />
        <p className="inst-meta mt-1.5">
          Not required. It helps the Palace check what you have sent, and nothing is refused
          for want of it.
        </p>
      </div>

      <p className="inst-body mt-4 !text-[0.86rem]">
        Sending this changes nothing on the public record. A person at the Palace will read it.
      </p>

      {error && (
        <p role="alert" className="mt-4 text-[0.86rem] leading-[1.55] text-[var(--oxblood)]">
          {error}
        </p>
      )}

      <div className="mt-5">
        <button
          type="submit" disabled={sending || !type || !content.trim()}
          className="inst-btn inst-btn-primary disabled:opacity-55"
        >
          {sending ? 'Sending…' : 'Send to the Palace'}
        </button>
      </div>
    </form>
  )
}
