'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CATEGORY_LABEL, STATUS_LABEL, RESPONSE_ATTRIBUTION, MAX,
  type CorrespondenceCategory, type CorrespondenceStatus,
  replyRecipient, DELIVERY_NOTE, type ReplyDelivery,
} from '@/lib/correspondence'

/* The Palace's working surface for correspondence.
 *
 * Two things it deliberately does not do:
 *
 *   It composes nothing. There is no suggested reply, no template that fills the box, no
 *   text generated on a status change. A response is written by a person, every time — an
 *   empty box is refused rather than helpfully completed.
 *
 *   It signs nothing with a name. A reply goes out as the Guneku Palace. Where the person
 *   writing wants to identify themselves, they do it in their own words inside the text.
 *   Nothing here writes on behalf of the Fon.
 *
 * The internal note is shown here and nowhere else. It is Palace working material, private
 * from the person who wrote in — and the type that carries a letter to a sender has no field
 * for it at all, so it cannot travel there by accident. */

export type PalaceLetter = {
  id: string
  category: CorrespondenceCategory
  subject: string
  message: string
  status: CorrespondenceStatus
  response: string | null
  internalNote: string | null
  createdAt: string
  sender: {
    name: string
    email: string | null
    phone: string | null
    isMember: boolean
    memberName: string | null
    memberQuarter: string | null
  }
}

function when(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const FIELD = 'mt-1.5 w-full rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5 text-[0.9rem] text-[var(--ink-900)] focus:border-[var(--royal-green)] focus:outline-none'

export function CorrespondenceQueue({ letters }: { letters: PalaceLetter[] }) {
  const router = useRouter()
  const [busy, setBusy]     = useState<string | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [reply, setReply]   = useState<Record<string, string>>({})
  const [note, setNote]     = useState<Record<string, string>>({})
  const [sent, setSent]     = useState<Record<string, ReplyDelivery>>({})

  async function act(id: string, action: string, payload: Record<string, unknown> = {}) {
    setError(null)
    setBusy(id)
    try {
      const res  = await fetch(`/api/correspondence/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action, ...payload }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.status === 401) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberate: the session is gone, so the server must decide again who this is
        window.location.href = '/sign-in?redirect_url=%2Freview%2Fcorrespondence'
        return
      }
      if (!res.ok) {
        setError(data.error || 'That could not be saved. Please try again.')
        return
      }
      /* What actually happened to the email, in the Palace's own words. Reported here and
         never to the sender: a letter with no address is answered just as truly as one that
         was posted, and the sender's view says only that the Palace has answered. */
      if (data.delivery) setSent(p => ({ ...p, [id]: data.delivery as ReplyDelivery }))
      router.refresh()
    } catch {
      setError('That could not be saved. Please check your connection.')
    } finally {
      setBusy(null)
    }
  }

  if (letters.length === 0) {
    return (
      <div className="inst-card max-w-[38rem] p-6">
        <h2 className="inst-h3">Nothing waiting</h2>
        <p className="inst-body mt-2">
          There is no open correspondence. Messages appear here as they are sent, and closed
          ones drop out of this view.
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="inst-body">
        {letters.length} open {letters.length === 1 ? 'message' : 'messages'}, oldest first.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-[0.88rem] text-[var(--oxblood)]">{error}</p>
      )}

      <div className="mt-6 grid gap-5">
        {letters.map(l => (
          <article key={l.id} className="inst-card p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="inst-tag">{CATEGORY_LABEL[l.category]}</p>
                <h2 className="inst-h3 mt-1">{l.subject}</h2>
              </div>
              <div className="shrink-0 text-right">
                <span className="rounded-[3px] border border-[var(--rule)] px-2 py-0.5 text-[0.64rem] font-bold uppercase tracking-[0.08em] text-[var(--ink-600)]">
                  {STATUS_LABEL[l.status]}
                </span>
                <p className="inst-meta mt-1">{when(l.createdAt)}</p>
              </div>
            </div>

            {/* ── Who wrote ── */}
            <div className="mt-4 border-t border-[var(--rule)] pt-4">
              <p className="inst-tag">From</p>
              <dl className="mt-1.5 grid gap-1 text-[0.88rem] text-[var(--ink-600)] sm:grid-cols-2">
                <div><dt className="inline font-semibold">Name: </dt><dd className="m-0 inline">{l.sender.name}</dd></div>
                <div><dt className="inline font-semibold">Email: </dt><dd className="m-0 inline">{l.sender.email ?? 'Not given'}</dd></div>
                <div><dt className="inline font-semibold">Telephone: </dt><dd className="m-0 inline">{l.sender.phone ?? 'Not given'}</dd></div>
                <div>
                  <dt className="inline font-semibold">Account: </dt>
                  <dd className="m-0 inline">
                    {l.sender.isMember
                      ? `Signed-in member${l.sender.memberName ? ` — ${l.sender.memberName}` : ''}`
                      : 'Wrote in without an account'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* ── What they wrote ── */}
            <div className="mt-4 border-t border-[var(--rule)] pt-4">
              <p className="inst-tag">Their message</p>
              <p className="inst-body mt-1.5 whitespace-pre-wrap !text-[0.92rem]">{l.message}</p>
            </div>

            {l.response && (
              <div className="mt-4 border-t border-[var(--rule)] pt-4">
                <p className="inst-tag">Already answered · {RESPONSE_ATTRIBUTION}</p>
                <p className="inst-body mt-1.5 whitespace-pre-wrap !text-[0.9rem]">{l.response}</p>
              </div>
            )}

            {/* ── Palace working note. Never shown to the sender. ── */}
            <div className="mt-4 border-t border-[var(--rule)] pt-4">
              <p className="inst-tag">Palace note — not shown to the sender</p>
              {l.internalNote && (
                <p className="inst-body mt-1.5 whitespace-pre-wrap !text-[0.88rem] text-[var(--ink-600)]">
                  {l.internalNote}
                </p>
              )}
              <textarea
                rows={2} maxLength={MAX.note} className={FIELD}
                placeholder="A note for the Palace's own record."
                value={note[l.id] ?? ''}
                onChange={e => setNote(p => ({ ...p, [l.id]: e.target.value }))}
              />
              <button
                type="button" disabled={busy === l.id || !(note[l.id] ?? '').trim()}
                onClick={() => act(l.id, 'note', { note: note[l.id] })}
                className="inst-btn inst-btn-quiet mt-2 !py-1.5 !text-[0.75rem] disabled:opacity-40"
              >
                Save note
              </button>
            </div>

            {/* ── The reply ── */}
            {l.status !== 'closed' && (
              <div className="mt-4 border-t border-[var(--rule)] pt-4">
                <p className="inst-tag">Reply as {RESPONSE_ATTRIBUTION}</p>
                <p className="inst-meta mt-1">
                  Written by you, sent only when you press send. Nothing is composed
                  automatically, and no reply is signed with a name — if you wish to identify
                  yourself, say so in your own words.
                </p>
                {/* Said before the button is pressed, not after. Whether the sender can be
                    emailed is a fact about their letter, and the Palace should know which
                    kind of answer this is going to be while writing it. */}
                <p className="inst-meta mt-1">
                  {replyRecipient(l.sender.email)
                    ? `This will be emailed to ${l.sender.email}.`
                    : l.sender.phone
                      ? `No email address was given. The reply will be recorded here, and `
                        + `${l.sender.phone} is the callback number.`
                      : 'No email address was given, so the reply will be recorded here only.'}
                </p>
                <textarea
                  rows={5} maxLength={MAX.response} className={FIELD}
                  placeholder="Write the Palace's reply."
                  value={reply[l.id] ?? ''}
                  onChange={e => setReply(p => ({ ...p, [l.id]: e.target.value }))}
                />

                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button" disabled={busy === l.id || !(reply[l.id] ?? '').trim()}
                    onClick={() => act(l.id, 'respond', { response: reply[l.id] })}
                    className="inst-btn inst-btn-primary disabled:opacity-40"
                  >
                    {busy === l.id
                      ? 'Sending…'
                      : replyRecipient(l.sender.email)
                        ? 'Send the Palace’s reply'
                        : 'Record this reply'}
                  </button>

                  {l.status === 'received' && (
                    <button
                      type="button" disabled={busy === l.id}
                      onClick={() => act(l.id, 'begin-review')}
                      className="inst-btn inst-btn-quiet disabled:opacity-40"
                    >
                      Mark as with the Palace
                    </button>
                  )}

                  <button
                    type="button" disabled={busy === l.id}
                    onClick={() => act(l.id, 'close')}
                    className="inst-btn inst-btn-quiet disabled:opacity-40"
                  >
                    Close
                  </button>
                </div>

                {/* What happened, said plainly — including when it did not work. A Palace
                    clerk who believes a villager has been answered when the email bounced is
                    worse off than one who is told. The reply is saved in every case. */}
                {sent[l.id] && (
                  <p
                    className="inst-meta mt-3"
                    style={sent[l.id] === 'failed'
                      ? { color: 'oklch(0.480 0.150 25)' }
                      : undefined}
                  >
                    {DELIVERY_NOTE[sent[l.id]]}
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  )
}
