import type { ReactNode } from 'react'
import { PageHero } from '@/components/layout/PageHero'

/* The shared frame for the Fondom's two legal pages.
 *
 * One frame rather than two, because /privacy and /terms are the same kind of document and
 * the pair of them going out of visual step would be the first thing anybody noticed. It is
 * the ordinary institutional page furniture — the same `PageHero` every other section uses,
 * the same `inst-` type scale — so a legal page reads as part of the Fondom's record rather
 * than as something bolted on to satisfy a form.
 *
 * ── Why the measure is narrow ────────────────────────────────────────────────────────────
 *
 * `max-w-[46rem]` on the article, against the 76rem the site's wrappers allow. These are the
 * only two pages on the site that are continuous prose a person is expected to read rather
 * than scan, and a 76rem line of body text on a laptop is unreadable. The wrapper still
 * carries the site's own responsive gutter, so nothing changes on a phone.
 *
 * ── The headings are landmarks ───────────────────────────────────────────────────────────
 *
 * Every section is a `<section aria-labelledby>` bound to its own `<h2 id>`, so somebody
 * moving by landmark or heading gets the document's structure rather than one long wall.
 * That is also what makes the in-page links at the top of each document work. */

export function LegalDocument({
  label, title, subtitle, updated, children,
}: {
  label: string
  title: string
  subtitle: string
  /** Written out, e.g. "16 September 2026". Not a timestamp: this is the date the Fondom
   *  last changed the text, which is not the date the file was last touched. */
  updated: string
  children: ReactNode
}) {
  return (
    <main className="bg-[var(--paper)]">
      <PageHero label={label} title={title} subtitle={subtitle} />
      <div className="inst-wrap inst-sec">
        <article className="max-w-[46rem]">
          <p className="inst-meta">Last updated {updated}</p>
          {children}
        </article>
      </div>
    </main>
  )
}

export function LegalSection({
  id, heading, children,
}: {
  id: string
  heading: string
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="inst-h2">{heading}</h2>
      <div className="inst-body mt-3 space-y-3">{children}</div>
    </section>
  )
}

/** A plain list inside a section. Bulleted, because these are genuinely enumerations —
 *  fields, providers, choices — and prose would hide them. */
export function LegalList({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-[var(--accent)]">{children}</ul>
  )
}
