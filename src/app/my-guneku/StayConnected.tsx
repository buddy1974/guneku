'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FOLLOW_TOPICS, MY_QUARTER, type FollowChoice } from '@/lib/follow-topics'

/* What the member wants to hear about.
 *
 * Not notification settings. There is no channel here, no frequency, no digest and no
 * "email me" switch, because none of those things exist yet and offering them would be
 * promising delivery the Fondom has not built. The honest framing is the one used: these are
 * the parts of village life you want to follow. When Guneku can actually send something,
 * that will arrive with its own controls and its own consent.
 *
 * The switches are plain checkboxes in the institutional vocabulary rather than toggles in a
 * settings panel. This is a village record, not a product with a preferences screen. */

const ROW = 'inst-row flex items-start gap-3 py-3.5'

export type FollowState = {
  topics: string[]
  quarter: string | null
}

export function StayConnected({
  initial, memberQuarter,
}: {
  initial: FollowState
  /** The member's own recorded quarter, or null. Read server-side from their details; this
   *  component only reports it, and never guesses when it is absent. */
  memberQuarter: string | null
}) {
  const [state, setState] = useState<FollowState>(initial)
  const [busy, setBusy]   = useState<FollowChoice | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<FollowChoice | null>(null)

  const following = (choice: FollowChoice) =>
    choice === MY_QUARTER ? state.quarter !== null : state.topics.includes(choice)

  function toSignIn() {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberate: the session is gone, so the server must decide again who this is
    window.location.href = '/sign-in?redirect_url=%2Fmy-guneku'
  }

  async function toggle(choice: FollowChoice) {
    const on = following(choice)
    setError(null)
    setSaved(null)
    setBusy(choice)

    try {
      const res = await fetch('/api/follows', {
        method:  on ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ topic: choice }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.status === 401) return toSignIn()
      if (!res.ok) {
        /* Notably the "you have not told us your quarter" case, which is not a fault and
           whose message says exactly what to do about it. */
        setError(data.error || 'That could not be saved. Please try again.')
        return
      }

      /* The server returns the whole set, so the UI adopts what was actually stored rather
         than what it hoped happened. A follow that quietly failed cannot leave a switch on. */
      setState({ topics: data.topics ?? [], quarter: data.quarter ?? null })
      setSaved(choice)
    } catch {
      setError('That could not be saved. Please check your connection and try again.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mt-3">
      <p className="inst-body !text-[0.88rem]">
        Choose what you want to hear about. Nothing is sent yet — this records what matters to
        you, so the Fondom knows who to tell when there is something to say.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-[0.85rem] leading-[1.5] text-[var(--oxblood)]">
          {error}
        </p>
      )}

      <ul className="m-0 mt-3 list-none p-0">
        {FOLLOW_TOPICS.map(t => (
          <li key={t.id} className={ROW}>
            <input
              type="checkbox"
              id={`follow-${t.id}`}
              className="mt-1 shrink-0"
              checked={following(t.id)}
              disabled={busy === t.id}
              onChange={() => toggle(t.id)}
            />
            <div className="min-w-0">
              <label htmlFor={`follow-${t.id}`} className="block text-[0.92rem] font-semibold text-[var(--ink-900)]">
                {t.label}
                {busy === t.id && <span className="inst-meta"> · saving…</span>}
                {saved === t.id && busy !== t.id && (
                  <span className="text-[0.75rem] font-normal text-[var(--royal-green)]"> · saved</span>
                )}
              </label>
              <p className="inst-meta mt-0.5">
                {t.blurb}
                {t.route && (
                  <>
                    {' '}
                    <Link href={t.route} className="inst-link">Read it →</Link>
                  </>
                )}
              </p>
            </div>
          </li>
        ))}

        {/* ── My quarter ── */}
        <li className={ROW}>
          <input
            type="checkbox"
            id="follow-my-quarter"
            className="mt-1 shrink-0"
            checked={following(MY_QUARTER)}
            disabled={busy === MY_QUARTER || !memberQuarter}
            onChange={() => toggle(MY_QUARTER)}
          />
          <div className="min-w-0">
            <label htmlFor="follow-my-quarter" className="block text-[0.92rem] font-semibold text-[var(--ink-900)]">
              My quarter
              {busy === MY_QUARTER && <span className="inst-meta"> · saving…</span>}
              {saved === MY_QUARTER && busy !== MY_QUARTER && (
                <span className="text-[0.75rem] font-normal text-[var(--royal-green)]"> · saved</span>
              )}
            </label>
            <p className="inst-meta mt-0.5">
              {memberQuarter
                ? <>News from <strong className="text-[var(--ink-600)]">{memberQuarter}</strong>, the quarter on your details.</>
                : <>Add your quarter in <em>Your details</em> above, and you can follow it from here.</>}
            </p>
          </div>
        </li>
      </ul>

      <p className="inst-meta mt-4">
        What you follow is yours alone. It is never shown on the site, and no one is told who
        follows what.
      </p>
    </div>
  )
}
