'use client'

import { useState } from 'react'
import { PalaceMessageModal } from './PalaceMessageModal'

/* The card that opens the Palace message form. The wording is careful: a message to the
   Palace, answered by a representative — not a promise of the Fon's personal reply. */
export function TalkToPalace() {
  const [open, setOpen] = useState(false)

  return (
    <section className="inst-rule border-b border-[var(--rule)]" aria-labelledby="palace-contact-heading">
      <div className="inst-wrap inst-sec">
        <div className="inst-card grid items-center gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
          <div>
            <p className="inst-eyebrow">Guneku Palace</p>
            <h2 id="palace-contact-heading" className="inst-h2 mt-1.5">Send a message to the Palace</h2>
            <div className="mt-3 flex items-center gap-2" aria-hidden>
              <span className="block h-0.5 w-9 bg-[var(--royal-green)]" />
              <span className="block h-0.5 w-4 bg-[var(--oxblood)]" />
            </div>
            <p className="inst-body mt-4 max-w-xl">
              Questions about the Fondom, a project, an appointment, or a correction to
              something recorded here. Choose the topic, say how you would like to be
              reached. Your message is sent to the Guneku Palace for review.
            </p>
            <p className="inst-meta mt-3">
              The Fondom publishes how official announcements are made — please check any
              request for money against that notice before acting on it.
            </p>
          </div>

          <div className="md:justify-self-end">
            <button type="button" onClick={() => setOpen(true)} className="inst-btn inst-btn-primary">
              Send a message
            </button>
          </div>
        </div>
      </div>

      <PalaceMessageModal open={open} onClose={() => setOpen(false)} />
    </section>
  )
}
