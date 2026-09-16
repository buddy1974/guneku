'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/* Withdrawing a business from the directory.
 *
 * It archives rather than deletes — the record stays, it simply stops being published — so
 * the confirmation says "withdraw" and not "delete for ever", which would be a lie about
 * what the button does. The two-step is inline rather than a dialog: one extra click on the
 * same control is enough to stop a mis-tap, and it needs no focus trap to be accessible. */
export function ArchiveBusinessButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function archive() {
    setWorking(true)
    setError(null)
    try {
      const res = await fetch(`/api/businesses/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(typeof data.error === 'string' ? data.error : 'That could not be withdrawn.')
        return
      }
      router.refresh()
    } catch {
      setError('That could not be withdrawn. Please try again.')
    } finally {
      setWorking(false)
      setConfirming(false)
    }
  }

  if (error) {
    return <span role="alert" className="inst-meta !text-[var(--destructive)]">{error}</span>
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inst-meta underline underline-offset-2 hover:text-[var(--oxblood)]"
      >
        Withdraw
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-3">
      <span className="inst-meta">Withdraw {name}?</span>
      <button type="button" onClick={archive} disabled={working}
              className="inst-meta font-semibold underline underline-offset-2 hover:text-[var(--oxblood)]">
        {working ? 'Withdrawing…' : 'Yes'}
      </button>
      <button type="button" onClick={() => setConfirming(false)} disabled={working}
              className="inst-meta underline underline-offset-2">
        No
      </button>
    </span>
  )
}
