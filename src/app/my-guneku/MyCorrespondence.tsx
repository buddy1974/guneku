'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  STATUS_LABEL, STATUS_NOTE, CATEGORY_LABEL, RESPONSE_ATTRIBUTION,
  type CorrespondenceStatus, type CorrespondenceCategory,
} from '@/lib/correspondence'

/* The member's own letters to the Palace.
 *
 * Everything here came from `listMyCorrespondence`, scoped to the session's own id and mapped
 * through `toSenderView` — a type that has no `internal_note` and no `handled_by` field at
 * all. The Palace's working notes are private from the person who wrote in, and this
 * component could not render one if it tried. */

export type CorrespondenceView = {
  id: string
  category: CorrespondenceCategory
  subject: string
  message: string
  status: CorrespondenceStatus
  response: string | null
  responded_at: string | null
  created_at: string
}

const TONE: Record<CorrespondenceStatus, string> = {
  'received':  'border-[var(--rule)] text-[var(--ink-600)]',
  'in-review': 'border-[var(--rule)] text-[var(--ink-600)]',
  'responded': 'border-[var(--royal-green)]/40 text-[var(--royal-green)]',
  'closed':    'border-[var(--rule)] text-[var(--ink-400)]',
}

function when(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function MyCorrespondence({ items }: { items: CorrespondenceView[] }) {
  const [open, setOpen] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <p className="inst-meta mt-3">
        You have not written to the Palace from this account.{' '}
        <Link href="/" className="inst-link">Talk to the Palace →</Link>
      </p>
    )
  }

  return (
    <ul className="m-0 mt-3 grid list-none gap-0 p-0">
      {items.map(c => {
        const isOpen = open === c.id
        return (
          <li key={c.id} className="inst-row py-3.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="inst-tag">{CATEGORY_LABEL[c.category]}</p>
                <p className="text-[0.95rem] font-semibold text-[var(--ink-900)]">{c.subject}</p>
              </div>
              <span className={`shrink-0 rounded-[3px] border px-2 py-0.5 text-[0.64rem] font-bold uppercase tracking-[0.08em] ${TONE[c.status]}`}>
                {STATUS_LABEL[c.status]}
              </span>
            </div>

            <p className="inst-meta mt-1">Sent {when(c.created_at)}</p>
            <p className="inst-body mt-1.5 !text-[0.85rem]">{STATUS_NOTE[c.status]}</p>

            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : c.id)}
              aria-expanded={isOpen}
              className="mt-2 text-[0.8rem] font-semibold text-[var(--ink-400)] underline underline-offset-4 hover:text-[var(--royal-green)]"
            >
              {isOpen ? 'Hide' : c.response ? 'Read the reply' : 'See what I wrote'}
            </button>

            {isOpen && (
              <div className="mt-3 border-l-2 border-[var(--rule)] pl-3">
                <p className="inst-tag">What you wrote</p>
                <p className="inst-body mt-1 whitespace-pre-wrap !text-[0.88rem]">{c.message}</p>

                {c.response && (
                  <div className="mt-4 border-t border-[var(--rule)] pt-3">
                    <p className="inst-tag">{RESPONSE_ATTRIBUTION}</p>
                    <p className="inst-body mt-1 whitespace-pre-wrap !text-[0.88rem]">
                      {c.response}
                    </p>
                    {c.responded_at && (
                      <p className="inst-meta mt-1.5">Answered {when(c.responded_at)}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
