'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PalaceMessageModal } from './PalaceMessageModal'

type Answer = {
  answered: boolean
  answer: string
  question?: string
  links: Array<{ href: string; label: string }>
  suggestions: string[]
}

const OPENERS = [
  'Who is the reigning Fon?',
  'How many quarters does Guneku have?',
  'How can I support a project?',
  'When is market day?',
  'How do I contact the Palace?',
]

/* The Palace information desk.

   It is not the Fon and it does not pretend to be a person. It answers from records that
   are already published on this site, links to them, and hands anything it cannot source
   to the Palace message form with the question carried across. */
export function AskPalace() {
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<Answer | null>(null)
  const [asked, setAsked] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function run(question: string) {
    const text = question.trim()
    if (text.length < 3) return
    setBusy(true); setAsked(text)
    try {
      const r = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      })
      setRes(await r.json())
    } catch {
      setRes({ answered: false, answer: "I couldn't reach the Guneku records just now.", links: [], suggestions: OPENERS })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="inst-alt inst-rule border-b border-[var(--rule)]" aria-labelledby="ask-heading">
      <div className="inst-wrap inst-sec">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.35fr] lg:gap-14">

          <div>
            <div className="flex items-center gap-3">
              <span className="relative block h-11 w-11 shrink-0">
                <Image src="/brand/logo-96.png" alt="" fill sizes="44px" className="object-contain" unoptimized />
              </span>
              <div>
                <p className="inst-eyebrow">Information desk</p>
                <h2 id="ask-heading" className="inst-h2 mt-0.5">Ask Guneku Palace</h2>
              </div>
            </div>
            <p className="inst-body mt-4 max-w-md">
              Answers come from the records published on this site — the village record,
              the Palace archive, the development register, the galleries and the news
              archive. If there is no source for your question, it will say so and pass
              it to the Palace.
            </p>
            <p className="inst-meta mt-3">
              This is an information desk, not the Fon. Anything personal or sensitive
              should go to the Palace directly.
            </p>
          </div>

          <div className="inst-card p-5 md:p-6">
            <form
              onSubmit={e => { e.preventDefault(); run(q) }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="ask-input" className="sr-only">Ask a question about Guneku</label>
              <input
                ref={inputRef}
                id="ask-input"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Ask about Guneku…"
                maxLength={500}
                className="w-full rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5 text-[0.94rem] text-[var(--ink-900)] focus:border-[var(--royal-green)] focus:outline-none"
              />
              <button type="submit" disabled={busy} className="inst-btn inst-btn-primary shrink-0 disabled:opacity-60">
                {busy ? 'Looking…' : 'Ask'}
              </button>
            </form>

            {!res && (
              <div className="mt-4">
                <p className="inst-meta">Try one of these</p>
                <ul className="mt-2 flex list-none flex-wrap gap-2 p-0">
                  {OPENERS.map(s => (
                    <li key={s}>
                      <button type="button" onClick={() => { setQ(s); run(s) }}
                              className="rounded-full border border-[var(--rule)] px-3 py-1.5 text-[0.8rem] text-[var(--ink-600)] hover:border-[var(--royal-green)] hover:text-[var(--royal-green)]">
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {res && (
              <div className="mt-5 border-t border-[var(--rule)] pt-4" aria-live="polite">
                {res.answered ? (
                  <>
                    {res.question && <p className="inst-tag">{res.question}</p>}
                    <p className="inst-body mt-1.5">{res.answer}</p>
                    {res.links.length > 0 && (
                      <ul className="mt-3 list-none space-y-1.5 p-0">
                        {res.links.map(l => (
                          <li key={l.href}>
                            <Link href={l.href} className="inst-link">{l.label} →</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="inst-meta mt-4">
                      Not what you needed?{' '}
                      <button type="button" onClick={() => setModalOpen(true)} className="inst-link">
                        Send this question to the Palace →
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex items-center gap-2" aria-hidden>
                      <span className="block h-0.5 w-8 bg-[var(--royal-green)]" />
                      <span className="block h-0.5 w-4 bg-[var(--oxblood)]" />
                    </div>
                    <p className="inst-body">
                      {res.answer || "I don't have a verified Guneku source for that yet."}
                    </p>
                    <button type="button" onClick={() => setModalOpen(true)} className="inst-btn inst-btn-primary mt-4">
                      Send this question to the Palace
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <PalaceMessageModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        prefillTopic="General enquiry"
        prefillMessage={asked ? `My question: ${asked}` : undefined}
      />
    </section>
  )
}
