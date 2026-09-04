'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STATUS_LABEL, STATUS_NOTE, type ClaimStatus } from '@/lib/claims'

/* The member's own claims, and the one action they have over them.
 *
 * Everything rendered here came from `listMyClaims`, which is scoped to the session's own id
 * and mapped through `toClaimantView`. There is no reviewer identity in the data, no
 * moderation note, and no way to ask for anybody else's claims — not because this component
 * declines to render them, but because nothing ever sends them. */

export type ClaimView = {
  id: string
  person_slug: string
  person_name: string
  status: ClaimStatus
  created_at: string
}

const TONE: Record<ClaimStatus, string> = {
  pending:   'border-[var(--rule)] text-[var(--ink-600)]',
  approved:  'border-[var(--royal-green)]/40 text-[var(--royal-green)]',
  rejected:  'border-[var(--rule)] text-[var(--ink-400)]',
  withdrawn: 'border-[var(--rule)] text-[var(--ink-400)]',
}

function when(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function MyClaims({ claims }: { claims: ClaimView[] }) {
  const router = useRouter()
  const [busy, setBusy]   = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  /* Withdrawn claims are kept but moved out of the way: the member asked for them to be
     gone, and a list that keeps presenting them has not really honoured that. They are
     shown under a quiet disclosure rather than deleted, because the record of what was
     asked is worth keeping. */
  const active   = claims.filter(c => c.status !== 'withdrawn')
  const archived = claims.filter(c => c.status === 'withdrawn')

  async function withdraw(id: string) {
    setError(null)
    setBusy(id)
    try {
      const res  = await fetch(`/api/claims/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'withdraw' }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.status === 401) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberate: the session is gone, so the server must decide again who this is
        window.location.href = '/sign-in?redirect_url=%2Fmy-guneku'
        return
      }
      if (!res.ok) {
        setError(data.error || 'That request could not be withdrawn. Please try again.')
        return
      }
      router.refresh()
    } catch {
      setError('That request could not be withdrawn. Please check your connection.')
    } finally {
      setBusy(null)
    }
  }

  if (claims.length === 0) {
    return (
      <p className="inst-meta mt-3">
        Nothing claimed yet.{' '}
        <Link href="/indigenes" className="inst-link">Browse the register →</Link>
      </p>
    )
  }

  return (
    <div className="mt-3">
      {error && (
        <p role="alert" className="mb-3 text-[0.85rem] text-[var(--oxblood)]">{error}</p>
      )}

      <ul className="m-0 grid list-none gap-0 p-0">
        {active.map(c => (
          <li key={c.id} className="inst-row py-3.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Link href={`/indigenes/founding/${c.person_slug}`} className="inst-link !text-[0.95rem] font-semibold">
                {c.person_name}
              </Link>
              <span className={`shrink-0 rounded-[3px] border px-2 py-0.5 text-[0.64rem] font-bold uppercase tracking-[0.08em] ${TONE[c.status]}`}>
                {STATUS_LABEL[c.status]}
              </span>
            </div>
            <p className="inst-meta mt-1">Sent {when(c.created_at)}</p>
            <p className="inst-body mt-1.5 !text-[0.85rem]">{STATUS_NOTE[c.status]}</p>

            {c.status === 'pending' && (
              <button
                type="button"
                onClick={() => withdraw(c.id)}
                disabled={busy === c.id}
                className="mt-2 text-[0.8rem] font-semibold text-[var(--ink-400)] underline underline-offset-4 hover:text-[var(--oxblood)] disabled:opacity-55"
              >
                {busy === c.id ? 'Withdrawing…' : 'Withdraw this request'}
              </button>
            )}
          </li>
        ))}
      </ul>

      {archived.length > 0 && (
        <details className="mt-4">
          <summary className="inst-meta cursor-pointer">
            {archived.length} withdrawn {archived.length === 1 ? 'request' : 'requests'}
          </summary>
          <ul className="m-0 mt-2 grid list-none gap-0 p-0">
            {archived.map(c => (
              <li key={c.id} className="inst-row py-2.5">
                <span className="inst-body !text-[0.86rem] text-[var(--ink-400)]">
                  {c.person_name}
                </span>
                <span className="inst-meta"> · withdrawn</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
