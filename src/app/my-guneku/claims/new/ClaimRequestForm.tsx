'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/* The claim request itself.
 *
 * There is no claimant field, because there must not be one: the POST carries a record slug
 * and an optional note, and the server takes who is asking from the Clerk session. A form
 * that could name its own claimant would be the vulnerability, not the feature.
 *
 * Nothing here asks for an identity document, a passport, a national ID or an upload of any
 * kind. No such verification has been approved for Guneku, and a form that requested one
 * would be collecting sensitive documents with nowhere legitimate to put them. */

const MAX_NOTE = 1200

export function ClaimRequestForm({
  personSlug, personName,
}: { personSlug: string; personName: string }) {
  const router = useRouter()
  const [note, setNote]       = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  function toSignIn() {
    const back = `/my-guneku/claims/new?person=${encodeURIComponent(personSlug)}`
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberate: the session is gone, so the server must decide again who this is
    window.location.href = `/sign-in?redirect_url=${encodeURIComponent(back)}`
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSending(true)

    try {
      const res  = await fetch('/api/claims', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ personSlug, note }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        router.push('/my-guneku?claim=sent')
        return
      }

      if (res.status === 401) return toSignIn()

      /* Already asked, in this tab or another. Not an error to argue with — send them to
         where the request they already have is shown. */
      if (res.status === 409) {
        router.replace(typeof data.claimsUrl === 'string' ? data.claimsUrl : '/my-guneku')
        return
      }

      setError(data.error || 'Your request could not be sent. Please try again.')
    } catch {
      setError('Your request could not be sent. Please check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="inst-card p-5 md:p-6">
      <h2 className="inst-h3">Send your request</h2>
      <p className="inst-body mt-2 !text-[0.9rem]">
        You are asking the Palace to connect your member account to the record for{' '}
        <strong className="text-[var(--ink-900)]">{personName}</strong>.
      </p>

      <div className="mt-5">
        <label
          className="block text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[var(--ink-600)]"
          htmlFor="claim-note"
        >
          Why is this record yours? (optional)
        </label>
        <textarea
          id="claim-note"
          rows={5}
          maxLength={MAX_NOTE}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="For example: your family connection, the quarter you come from, or who in the Fondom knows you."
          className="mt-1.5 w-full rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5 text-[0.92rem] text-[var(--ink-900)] focus:border-[var(--royal-green)] focus:outline-none"
        />
        <p className="inst-meta mt-1.5">
          {note.length}/{MAX_NOTE} · Seen only by you and the Palace. Never published.
        </p>
      </div>

      <p className="inst-body mt-4 !text-[0.86rem]">
        Sending this changes nothing on the public record. A person at the Palace will review
        it.
      </p>

      {error && (
        <p role="alert" className="mt-4 text-[0.86rem] leading-[1.55] text-[var(--oxblood)]">
          {error}
        </p>
      )}

      <div className="mt-5">
        <button
          type="submit"
          disabled={sending}
          className="inst-btn inst-btn-primary disabled:opacity-55"
        >
          {sending ? 'Sending…' : 'Send my request for review'}
        </button>
      </div>
    </form>
  )
}
