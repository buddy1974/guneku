'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/* The reviewer's working surface.
 *
 * It shows what a decision needs and nothing more: the record as the register holds it, the
 * claimant as the claimant described themselves, and their own words. No Clerk id, no
 * session data, no provider identifier reaches this component — the server page did not send
 * any, which is a stronger guarantee than a component choosing not to render them.
 *
 * The buttons are a convenience. Every rule they appear to enforce — the reviewer role, the
 * claimant not deciding their own case, the claim still being pending — is enforced again in
 * PATCH /api/claims/[id] against the Clerk session, because a disabled button is a suggestion
 * and an authorisation check is not. */

export type PendingClaim = {
  id: string
  note: string | null
  created_at: string
  isOwnClaim: boolean
  person: {
    slug: string
    display: string
    role: string | null
    place: string | null
    body: string | null
    source: string | null
    missing: boolean
    deceased: boolean
  }
  claimant: {
    name: string | null
    email: string | null
    country: string | null
    quarter: string | null
    chapter: string | null
  }
}

function when(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ReviewQueue({ claims }: { claims: PendingClaim[] }) {
  const router = useRouter()
  const [busy, setBusy]     = useState<string | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [done, setDone]     = useState<Record<string, 'approved' | 'rejected'>>({})

  async function decide(id: string, action: 'approve' | 'reject') {
    setError(null)
    setBusy(id)
    try {
      const res  = await fetch(`/api/claims/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.status === 401) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberate: the session is gone, so the server must decide again who this is
        window.location.href = '/sign-in?redirect_url=%2Freview%2Fclaims'
        return
      }
      if (!res.ok) {
        setError(data.error || 'That decision could not be recorded. Please try again.')
        return
      }
      setDone(prev => ({ ...prev, [id]: action === 'approve' ? 'approved' : 'rejected' }))
      router.refresh()
    } catch {
      setError('That decision could not be recorded. Please check your connection.')
    } finally {
      setBusy(null)
    }
  }

  if (claims.length === 0) {
    return (
      <div className="inst-card max-w-[38rem] p-6">
        <h2 className="inst-h3">Nothing waiting</h2>
        <p className="inst-body mt-2">
          There are no claims awaiting review. Requests appear here as members send them.
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="inst-body">
        {claims.length} {claims.length === 1 ? 'request' : 'requests'} awaiting a decision,
        oldest first.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-[0.88rem] text-[var(--oxblood)]">{error}</p>
      )}

      <div className="mt-6 grid gap-5">
        {claims.map(c => {
          const decided  = done[c.id]
          /* A record that has been marked deceased, or removed from the register, since the
             request was made. It must not be approvable from a stale queue. */
          const blocked  = c.person.missing || c.person.deceased
          const disabled = busy === c.id || Boolean(decided) || c.isOwnClaim || blocked

          return (
            <article key={c.id} className="inst-card p-5 md:p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* ── The record ── */}
                <div>
                  <p className="inst-tag">The record claimed</p>
                  <h2 className="inst-h3 mt-1.5">{c.person.display}</h2>
                  <dl className="mt-2 grid gap-1 text-[0.88rem] text-[var(--ink-600)]">
                    {c.person.role   && <div><dt className="inline font-semibold">Role: </dt><dd className="m-0 inline">{c.person.role}</dd></div>}
                    {c.person.body   && <div><dt className="inline font-semibold">Body: </dt><dd className="m-0 inline">{c.person.body}</dd></div>}
                    {c.person.place  && <div><dt className="inline font-semibold">Chapter: </dt><dd className="m-0 inline">{c.person.place}</dd></div>}
                    {c.person.source && <div><dt className="inline font-semibold">Source: </dt><dd className="m-0 inline">{c.person.source}</dd></div>}
                  </dl>
                  {!c.person.missing && (
                    <p className="inst-meta mt-2">
                      <Link href={`/indigenes/founding/${c.person.slug}`} className="inst-link" target="_blank">
                        Open the public entry →
                      </Link>
                    </p>
                  )}
                </div>

                {/* ── The claimant, in their own words ── */}
                <div className="border-t border-[var(--rule)] pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  <p className="inst-tag">The member asking</p>
                  <dl className="mt-1.5 grid gap-1 text-[0.88rem] text-[var(--ink-600)]">
                    <div><dt className="inline font-semibold">Name: </dt><dd className="m-0 inline">{c.claimant.name ?? 'Not given'}</dd></div>
                    <div><dt className="inline font-semibold">Email: </dt><dd className="m-0 inline">{c.claimant.email ?? 'Not given'}</dd></div>
                    <div><dt className="inline font-semibold">Country: </dt><dd className="m-0 inline">{c.claimant.country ?? 'Not given'}</dd></div>
                    <div><dt className="inline font-semibold">Says quarter: </dt><dd className="m-0 inline">{c.claimant.quarter ?? 'Not given'}</dd></div>
                    <div><dt className="inline font-semibold">Says chapter: </dt><dd className="m-0 inline">{c.claimant.chapter ?? 'Not given'}</dd></div>
                  </dl>
                  <p className="inst-meta mt-2">
                    What the member entered themselves. Unverified, and not a Fondom record.
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-[var(--rule)] pt-4">
                <p className="inst-tag">Their note</p>
                <p className="inst-body mt-1.5 whitespace-pre-wrap !text-[0.9rem]">
                  {c.note?.trim() || 'No note given.'}
                </p>
                <p className="inst-meta mt-2">Sent {when(c.created_at)}</p>
              </div>

              {blocked && (
                <p className="mt-4 border-l-2 border-[var(--oxblood)] pl-3 text-[0.87rem] leading-[1.55] text-[var(--ink-600)]">
                  {c.person.missing
                    ? 'This record is no longer in the register. It cannot be confirmed — reject the request, or restore the record first.'
                    : 'This record is now marked deceased and is not open to claiming. It cannot be confirmed.'}
                </p>
              )}

              {c.isOwnClaim && (
                <p className="mt-4 border-l-2 border-[var(--oxblood)] pl-3 text-[0.87rem] leading-[1.55] text-[var(--ink-600)]">
                  This is your own request. Another reviewer must decide it.
                </p>
              )}

              {decided ? (
                <p className="mt-4 text-[0.88rem] font-semibold text-[var(--royal-green)]">
                  {decided === 'approved' ? 'Confirmed.' : 'Not confirmed.'}
                </p>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => decide(c.id, 'approve')}
                    disabled={disabled}
                    className="inst-btn inst-btn-primary disabled:opacity-40"
                  >
                    {busy === c.id ? 'Saving…' : 'Confirm this claim'}
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(c.id, 'reject')}
                    disabled={busy === c.id || Boolean(decided) || c.isOwnClaim}
                    className="inst-btn inst-btn-quiet disabled:opacity-40"
                  >
                    Do not confirm
                  </button>
                </div>
              )}

              <p className="inst-meta mt-4">
                Confirming connects this member&rsquo;s account to the record. It does not
                change the record, its office, its standing or its sources, and it grants no
                permission to edit anything.
              </p>
            </article>
          )
        })}
      </div>
    </>
  )
}
