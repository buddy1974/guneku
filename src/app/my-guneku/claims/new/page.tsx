import Link from 'next/link'
import { redirect } from 'next/navigation'
import { optionalUser } from '@/lib/auth'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { claimEligibility, INELIGIBLE_MESSAGE, STATUS_LABEL } from '@/lib/claims'
import { findLiveClaim } from '@/lib/db/claims'
import { getChapter, getBody, recordedLabel } from '@/lib/community'
import { ClaimRequestForm } from './ClaimRequestForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Claim a record',
  robots: { index: false, follow: false },
}

/* Asking the Palace to associate your member account with an existing Guneku record.
 *
 * The page states plainly, before anything is typed, what a claim does and does not do. That
 * is not decoration: a villager who presses "This is me" on the register may reasonably
 * expect the page to change, and it will not. Saying so first is the difference between a
 * moderated workflow and a form that appears to have failed.
 *
 * Eligibility is decided here against the reviewed record, and again in the POST handler. A
 * deceased entry never reaches this page, and would be refused if it did. */
export default async function NewClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string }>
}) {
  if (!clerkConfigured()) return <MemberAreaNotice title="Claiming is not open yet" />

  const { person: slug } = await searchParams

  const user = await optionalUser()
  if (!user) {
    /* Carry the record through the sign-in so they come back to the claim they meant to
       make, not to a generic landing page. */
    const back = `/my-guneku/claims/new${slug ? `?person=${encodeURIComponent(slug)}` : ''}`
    redirect(`/sign-in?redirect_url=${encodeURIComponent(back)}`)
  }

  const eligibility = claimEligibility(slug)

  if (!eligibility.ok) {
    return (
      <main className="min-h-screen bg-[var(--paper)]">
        <section className="inst-wrap inst-sec">
          <div className="inst-card max-w-[38rem] p-6">
            <p className="inst-tag">Not open for claiming</p>
            <h1 className="inst-h2 mt-2">This record cannot be claimed</h1>
            <p className="inst-body mt-3">{INELIGIBLE_MESSAGE[eligibility.reason]}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/indigenes" className="inst-btn inst-btn-quiet">The register</Link>
              <Link href="/contact" className="inst-btn inst-btn-quiet">Write to the Palace</Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const person  = eligibility.person
  const chapter = person.chapter ? getChapter(person.chapter) : null
  const body    = person.body    ? getBody(person.body)       : null

  /* If they already have a live request for this record, show it rather than letting them
     fill in a second one and meet a 409 at the end. */
  let existing = null
  let dataUnavailable = false
  try {
    existing = await findLiveClaim(user.userId, person.slug)
  } catch (err) {
    console.error('Claim page could not check for an existing request:', err)
    dataUnavailable = true
  }

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <section className="inst-dark border-b border-[var(--rule)]">
        <div className="inst-wrap py-8">
          <p className="inst-eyebrow !text-white/60">Guneku Register</p>
          <h1 className="inst-h1 mt-1.5 !text-[2.1rem] !text-white">Is this you?</h1>
          <p className="mt-2 max-w-xl text-[0.92rem] leading-[1.65] text-white/70">
            Ask the Palace to connect your Guneku member account to an existing record in the
            register.
          </p>
        </div>
      </section>

      <div className="inst-wrap inst-sec grid items-start gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
        <div>
          {/* ── The record, exactly as the register holds it ── */}
          <div className="inst-card p-6">
            <p className="inst-tag">The record you are claiming</p>
            <h2 className="inst-h2 mt-2">{person.display}</h2>
            <dl className="mt-4 grid gap-0 text-[0.92rem]">
              {([
                ['Office or role', person.role],
                ...(body ? [['Body', `${body.name} — ${recordedLabel(body)}`]] : []),
                ['Chapter', chapter ? `${chapter.flag} ${chapter.org} — ${chapter.place}` : 'Not recorded'],
                ['Source', person.sourceLabel],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="inst-row grid gap-1 py-3 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
                  <dt className="inst-tag">{k}</dt>
                  <dd className="m-0 text-[var(--ink-900)]">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="inst-meta mt-4">
              <Link href={`/indigenes/founding/${person.slug}`} className="inst-link">
                See the full entry →
              </Link>
            </p>
          </div>

          {dataUnavailable ? (
            /* The claim workflow needs migration 0002. Until it is applied, this page must
               not become a dead end: the Palace route that has always worked is still here,
               and a villager who came to say "this is me" can still say it. */
            <div className="inst-card mt-6 p-6">
              <p className="inst-tag">Not yet</p>
              <h2 className="inst-h3 mt-2">Claiming through your account is not open yet</h2>
              <p className="inst-body mt-2">
                You can still tell the Palace that this entry is yours, the way the register
                has always allowed. It reaches the same people and is reviewed the same way.
              </p>
              <Link
                href={`/indigenes/submit?intent=claim&entry=${person.slug}`}
                className="inst-btn inst-btn-primary mt-4"
              >
                Write to the Palace about this entry
              </Link>
            </div>
          ) : existing ? (
            <div className="inst-card mt-6 p-6">
              <p className="inst-tag">{STATUS_LABEL[existing.status]}</p>
              <h2 className="inst-h3 mt-2">
                {existing.status === 'approved'
                  ? 'This record is already connected to your account'
                  : 'You have already asked about this record'}
              </h2>
              <p className="inst-body mt-2">
                {existing.status === 'approved'
                  ? 'Nothing further is needed. The record itself is unchanged — its history, office and sources stay as the Fondom holds them.'
                  : 'Your request is with the Palace. You can see it, and withdraw it if you change your mind, in My Guneku.'}
              </p>
              <Link href="/my-guneku" className="inst-btn inst-btn-quiet mt-4">
                Go to My Guneku
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              <ClaimRequestForm personSlug={person.slug} personName={person.display} />
            </div>
          )}
        </div>

        {/* ── What a claim is. Stated before it is made, not after. ── */}
        <aside className="inst-card self-start p-5">
          <p className="inst-tag">What claiming does, and does not do</p>
          <ul className="mt-3 grid list-none gap-3 p-0 text-[0.89rem] leading-[1.6] text-[var(--ink-600)]">
            <li>
              <strong className="text-[var(--ink-900)]">Nothing changes now.</strong> Sending
              this request does not alter the public record in any way.
            </li>
            <li>
              <strong className="text-[var(--ink-900)]">A person reviews it.</strong> The
              Palace reads your request and decides. That may take a little time.
            </li>
            <li>
              <strong className="text-[var(--ink-900)]">We may come back to you.</strong> The
              Fondom may need to ask you something before it can be confirmed.
            </li>
            <li>
              <strong className="text-[var(--ink-900)]">The history stays the
              Fondom&rsquo;s.</strong> If your claim is confirmed, your member account is
              associated with this record. The office, the sources and everything written
              about the record remain subject to Guneku&rsquo;s own review.
            </li>
          </ul>

          <div className="mt-5 border-t border-[var(--rule)] pt-4">
            <p className="inst-body !text-[0.86rem]">
              We do not ask for an identity document of any kind, and never will through this
              form. Tell us in your own words why the record is yours.
            </p>
          </div>

          <div className="mt-5 border-t border-[var(--rule)] pt-4">
            <p className="inst-body !text-[0.86rem]">
              If the entry is not you and you would rather it were not published,{' '}
              <Link href={`/indigenes/submit?intent=remove&entry=${person.slug}`} className="inst-link">
                ask for it to be taken down
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
