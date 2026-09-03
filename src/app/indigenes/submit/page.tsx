import Link from 'next/link'
import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { DirectoryForm } from '@/components/community/DirectoryForm'
import { GUNEKU_QUARTERS } from '@/types/indigene'
import {
  allChapters, getChapter, getFoundingName, isIntent, INTENT_COPY,
} from '@/lib/community'

export const metadata: Metadata = {
  alternates: { canonical: '/indigenes/submit' },
  title: 'Add or claim a name — Indigenes Directory',
  description:
    'Put a son or daughter of Guneku forward for the directory, claim an entry that carries your own name, or ask for a name to be taken down.',
  robots: { index: false, follow: true },
}

/* One page, three motions, chosen by ?intent=. Arriving from a seed stub
   pre-fills the name; arriving from a chapter card pre-fills the chapter. Both
   are validated against our own data server-side before anything is sent, so a
   crafted query string cannot put words in the Palace's inbox. */
export default async function DirectorySubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string; entry?: string; chapter?: string }>
}) {
  const sp     = await searchParams
  const intent = isIntent(sp.intent) ? sp.intent : 'add'
  const copy   = INTENT_COPY[intent]

  const entry   = sp.entry   ? getFoundingName(sp.entry)  : null
  const chapter = sp.chapter ? getChapter(sp.chapter)     : null
  const chapterId = entry?.chapter ?? chapter?.id

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label={copy.eyebrow}
        title={copy.heading}
        subtitle={copy.standfirst}
      />

      <section className="inst-wrap inst-sec grid items-start gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
        <div>
          {entry && (
            <div className="inst-card mb-5 p-4">
              <p className="inst-tag">The entry</p>
              <p className="inst-h3 mt-1">{entry.display}</p>
              <p className="inst-meta mt-1">
                {entry.role} · {entry.sourceLabel}
              </p>
            </div>
          )}

          <DirectoryForm
            intent={intent}
            cta={copy.cta}
            chapters={allChapters()}
            initialChapter={chapterId}
            initialPerson={entry?.display}
            entrySlug={entry?.slug}
            quarters={GUNEKU_QUARTERS}
          />
        </div>

        <aside className="inst-card self-start p-5">
          <p className="inst-tag">How this works</p>
          <ol className="mt-3 grid gap-3 pl-4 text-[0.9rem] leading-[1.6] text-[var(--ink-600)]">
            <li>A name is put forward — by the person, by a relative, or by the Palace.</li>
            <li>The Palace checks it against what the Fondom and GUDECA already hold.</li>
            <li>The person is invited to complete their own profile, and decides what it shows.</li>
          </ol>

          <div className="mt-5 border-t border-[var(--rule)] pt-4">
            <p className="inst-tag">Rather do it yourself?</p>
            <p className="inst-body mt-2 !text-[0.88rem]">
              If the entry is your own and you would sooner just build it, go straight to
              registration — you do not have to wait for anyone.
            </p>
            <Link href="/indigenes/onboarding" className="inst-btn inst-btn-quiet mt-3">
              Create my profile
            </Link>
          </div>

          {intent !== 'remove' && (
            <div className="mt-5 border-t border-[var(--rule)] pt-4">
              <p className="inst-body !text-[0.86rem]">
                If your name is already in the directory and you would rather it were not,{' '}
                <Link href="/indigenes/submit?intent=remove" className="inst-link">
                  ask for it to be taken down
                </Link>
                . It comes down without question.
              </p>
            </div>
          )}
        </aside>
      </section>
    </main>
  )
}
