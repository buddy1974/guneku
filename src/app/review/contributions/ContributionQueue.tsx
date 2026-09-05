'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TYPE_LABEL, type ContributionType, type TargetType } from '@/lib/contributions'

/* The reviewer's working surface for contributions.
 *
 * The wording throughout is "Accept for editorial action", never "Publish" and never
 * "Approve and apply". Accepting writes a status to one row; it changes no page, no register
 * and no JSON file, and a button that implied otherwise would be inviting a reviewer to
 * believe they had updated the record when they had not.
 *
 * The buttons are a convenience. Every rule they appear to enforce — the reviewer role, a
 * contributor not deciding their own submission, the row still being pending — is enforced
 * again in PATCH /api/contributions/[id] against the Clerk session. */

export type PendingContribution = {
  id: string
  type: ContributionType
  content: string
  source_note: string | null
  created_at: string
  isOwn: boolean
  target: { label: string; href: string | null; type: TargetType }
  contributor: {
    name: string | null
    email: string | null
    country: string | null
    quarter: string | null
  }
}

function when(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ContributionQueue({
  contributions,
}: { contributions: PendingContribution[] }) {
  const router = useRouter()
  const [busy, setBusy]   = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone]   = useState<Record<string, 'accepted' | 'rejected'>>({})

  async function decide(id: string, action: 'accept' | 'reject') {
    setError(null)
    setBusy(id)
    try {
      const res  = await fetch(`/api/contributions/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.status === 401) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberate: the session is gone, so the server must decide again who this is
        window.location.href = '/sign-in?redirect_url=%2Freview%2Fcontributions'
        return
      }
      if (!res.ok) {
        setError(data.error || 'That decision could not be recorded. Please try again.')
        return
      }
      setDone(prev => ({ ...prev, [id]: action === 'accept' ? 'accepted' : 'rejected' }))
      router.refresh()
    } catch {
      setError('That decision could not be recorded. Please check your connection.')
    } finally {
      setBusy(null)
    }
  }

  if (contributions.length === 0) {
    return (
      <div className="inst-card max-w-[38rem] p-6">
        <h2 className="inst-h3">Nothing waiting</h2>
        <p className="inst-body mt-2">
          There are no contributions awaiting review. They appear here as members send them.
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="inst-body">
        {contributions.length} {contributions.length === 1 ? 'contribution' : 'contributions'}{' '}
        awaiting a decision, oldest first.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-[0.88rem] text-[var(--oxblood)]">{error}</p>
      )}

      <div className="mt-6 grid gap-5">
        {contributions.map(c => {
          const decided  = done[c.id]
          const disabled = busy === c.id || Boolean(decided) || c.isOwn

          return (
            <article key={c.id} className="inst-card p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="inst-tag">{TYPE_LABEL[c.type]}</p>
                  <h2 className="inst-h3 mt-1">
                    {c.target.href ? (
                      <Link href={c.target.href} className="no-underline hover:text-[var(--royal-green)]" target="_blank">
                        {c.target.label} →
                      </Link>
                    ) : (
                      /* A `page` target is rendered as text on purpose: the value came from
                         a request, and a value from a request that becomes an href is how an
                         open redirect starts. */
                      c.target.label
                    )}
                  </h2>
                </div>
                <p className="inst-meta shrink-0">Sent {when(c.created_at)}</p>
              </div>

              {/* ── What they wrote ── */}
              <div className="mt-4 border-t border-[var(--rule)] pt-4">
                <p className="inst-tag">What they sent</p>
                <p className="inst-body mt-1.5 whitespace-pre-wrap !text-[0.92rem]">
                  {c.content}
                </p>
              </div>

              {c.source_note && (
                <div className="mt-4 border-t border-[var(--rule)] pt-4">
                  <p className="inst-tag">How they know it</p>
                  <p className="inst-body mt-1.5 whitespace-pre-wrap !text-[0.9rem]">
                    {c.source_note}
                  </p>
                </div>
              )}

              {/* ── Who sent it, as they described themselves ── */}
              <div className="mt-4 border-t border-[var(--rule)] pt-4">
                <p className="inst-tag">The member</p>
                <dl className="mt-1.5 grid gap-1 text-[0.88rem] text-[var(--ink-600)] sm:grid-cols-2">
                  <div><dt className="inline font-semibold">Name: </dt><dd className="m-0 inline">{c.contributor.name ?? 'Not given'}</dd></div>
                  <div><dt className="inline font-semibold">Email: </dt><dd className="m-0 inline">{c.contributor.email ?? 'Not given'}</dd></div>
                  <div><dt className="inline font-semibold">Country: </dt><dd className="m-0 inline">{c.contributor.country ?? 'Not given'}</dd></div>
                  <div><dt className="inline font-semibold">Says quarter: </dt><dd className="m-0 inline">{c.contributor.quarter ?? 'Not given'}</dd></div>
                </dl>
                <p className="inst-meta mt-2">
                  What the member entered themselves. Unverified, and not a Fondom record.
                </p>
              </div>

              {c.isOwn && (
                <p className="mt-4 border-l-2 border-[var(--oxblood)] pl-3 text-[0.87rem] leading-[1.55] text-[var(--ink-600)]">
                  This is your own contribution. Another reviewer must decide it.
                </p>
              )}

              {decided ? (
                <p className="mt-4 text-[0.88rem] font-semibold text-[var(--royal-green)]">
                  {decided === 'accepted' ? 'Accepted for editorial action.' : 'Not taken up.'}
                </p>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button" onClick={() => decide(c.id, 'accept')} disabled={disabled}
                    className="inst-btn inst-btn-primary disabled:opacity-40"
                  >
                    {busy === c.id ? 'Saving…' : 'Accept for editorial action'}
                  </button>
                  <button
                    type="button" onClick={() => decide(c.id, 'reject')} disabled={disabled}
                    className="inst-btn inst-btn-quiet disabled:opacity-40"
                  >
                    Do not take up
                  </button>
                </div>
              )}

              <p className="inst-meta mt-4">
                Accepting records that Guneku has taken this up. It does not change any page,
                register or roster &mdash; that is a separate editorial step.
              </p>
            </article>
          )
        })}
      </div>
    </>
  )
}
