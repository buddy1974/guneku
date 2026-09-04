import Link from 'next/link'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { optionalUser, type Role } from '@/lib/auth'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { getMember, listFollows } from '@/lib/db/members'
import { profileExists } from '@/lib/db/queries'
import { listMyClaims } from '@/lib/db/claims'
import { getFoundingName } from '@/lib/community'
import { atLeast } from '@/lib/auth'
import { MyClaims, type ClaimView } from './MyClaims'
import { GUNEKU_QUARTERS_27 } from '@/lib/quarters'
import { MemberDetailsForm } from './MemberDetailsForm'

export const metadata = {
  title: 'My Guneku',
  robots: { index: false, follow: false },
}

/* Rendered per request: it is one person's own page and must never be cached or prerendered
   into the public build. */
export const dynamic = 'force-dynamic'

const ROLE_LABEL: Record<Role, string> = {
  'member':       'Member',
  'contributor':  'Contributor',
  'reviewer':     'Reviewer',
  'palace-admin': 'Palace administrator',
}

/* The dashboard is denser than a public page, and that is allowed — but it stays in the same
   visual family: the inst-* vocabulary, deep green, oxblood, ochre, paper. No gradient, no
   glass, no stock dashboard furniture. It should read as the Fondom's own office, not as a
   SaaS product someone bolted onto a village. */
export default async function MyGunekuPage({
  searchParams,
}: {
  searchParams: Promise<{ claim?: string }>
}) {
  const claimSent = (await searchParams).claim === 'sent'

  /* Before asking Clerk anything, check it exists. Without this the page throws rather than
     explaining itself — see src/lib/clerk-config.ts. */
  if (!clerkConfigured()) return <MemberAreaNotice />

  const user = await optionalUser()
  /* The middleware already protects this path; this is the second lock, on the page itself,
     because a matcher is configuration and configuration can be edited by mistake. */
  if (!user) redirect('/sign-in')

  /* The member row does not exist until they first save. A first visit is a normal, empty
     state rather than an error. */
  let member = null
  let follows: Awaited<ReturnType<typeof listFollows>> = []
  let hasProfile = false
  let claims: ClaimView[] = []
  let dataUnavailable = false
  try {
    member  = await getMember(user.userId)
    follows = await listFollows(user.userId)
    /* The two are separate records on purpose: `community_members` is who this person is on
       the platform, `indigene_profiles` is what they have published about themselves in the
       directory. A member may have one, both or neither. This page only asks which. */
    hasProfile = await profileExists(user.userId)
  } catch (err) {
    /* The tables arrive with migration 0001, which has not been applied anywhere yet
       (R-024/R-025). Until then this page must still render and say so honestly, rather
       than showing a stack trace or pretending the member has no data. */
    console.error('My Guneku data unavailable:', err)
    dataUnavailable = true
  }

  /* Claims are read in their own try, deliberately separate from the one above.
     `profile_claims` arrives with migration 0002, and folding this into the same block would
     mean that an environment without that table reported "your details are not saved yet"
     and disabled the member's details form — which works perfectly well. One feature being
     unprovisioned must not take another down with it.

     Only this member's own claims, already stripped of reviewer identity by
     `toClaimantView`. The person's display name is resolved here from the reviewed register
     rather than stored alongside the claim: the record is the record, and copying its name
     into the database would create a second version of it to drift. */
  let claimsUnavailable = false
  try {
    claims = (await listMyClaims(user.userId)).map(c => ({
      id:          c.id,
      person_slug: c.person_slug,
      person_name: getFoundingName(c.person_slug)?.display ?? c.person_slug,
      status:      c.status,
      created_at:  c.created_at,
    }))
  } catch (err) {
    console.error('My Guneku claims unavailable:', err)
    claimsUnavailable = true
  }

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      {/* ── Header ── */}
      <section className="inst-dark border-b border-[var(--rule)]">
        <div className="inst-wrap py-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="inst-eyebrow !text-white/60">Guneku Fondom</p>
              <h1 className="inst-h1 mt-1.5 !text-[2.2rem] !text-white">My Guneku</h1>
              <p className="mt-2 max-w-xl text-[0.92rem] leading-[1.65] text-white/70">
                Your own corner of the village record — what you have claimed, what you
                follow, and what you have put forward.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-[3px] border border-white/25 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.09em] text-white/80">
                {ROLE_LABEL[user.role]}
              </span>
              <UserButton />
            </div>
          </div>
        </div>
      </section>

      {dataUnavailable && (
        <section className="border-b border-[var(--rule)] bg-[var(--paper-alt)]">
          <div className="inst-wrap py-4">
            <p className="inst-body !text-[0.88rem]">
              <strong className="text-[var(--ink-900)]">Your details are not saved yet.</strong>{' '}
              The community tables have not been created in this environment, so nothing can
              be stored or read back for the moment. You are signed in correctly, and
              everything else on Guneku.org works as normal.
            </p>
          </div>
        </section>
      )}

      <div className="inst-wrap inst-sec grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
        {/* ── Profile ── */}
        <section aria-labelledby="mg-profile">
          <h2 id="mg-profile" className="inst-h2">Your details</h2>
          <p className="inst-body mt-2">
            This is what you tell the Fondom about yourself. It is not a claim on a name in
            the register, and it does not place you in a quarter or a chapter as a matter of
            record — that comes from a claim the Palace has reviewed.
          </p>
          <div className="mt-5">
            <MemberDetailsForm
              quarters={GUNEKU_QUARTERS_27}
              initial={member ? {
                displayName: member.display_name ?? '',
                email:       member.email ?? '',
                country:     member.country ?? '',
                quarter:     member.quarter ?? '',
                chapter:     member.chapter ?? '',
                profilePublic: member.profile_public,
                showCountry:   member.show_country,
                showQuarter:   member.show_quarter,
                contactable:   member.contactable,
              } : undefined}
              disabled={dataUnavailable}
            />
          </div>
        </section>

        {/* ── The three registers of activity ── */}
        <div className="grid gap-8 self-start">
          <section aria-labelledby="mg-directory">
            <h2 id="mg-directory" className="inst-h3">Your directory profile</h2>
            {hasProfile ? (
              <>
                <p className="inst-body mt-2 !text-[0.88rem]">
                  You have an entry in the indigenes directory. It is yours to change or take
                  down whenever you like.
                </p>
                <Link href="/indigenes/profile" className="inst-btn inst-btn-quiet mt-3">
                  View or edit my profile
                </Link>
              </>
            ) : (
              <>
                <p className="inst-body mt-2 !text-[0.88rem]">
                  You are not in the indigenes directory yet — the record of Guneku sons and
                  daughters at home and abroad. What you put on it is yours to decide.
                </p>
                <Link href="/indigenes/onboarding" className="inst-btn inst-btn-quiet mt-3">
                  Create my profile
                </Link>
              </>
            )}
          </section>

          <section aria-labelledby="mg-claims" className="border-t border-[var(--rule)] pt-7">
            <h2 id="mg-claims" className="inst-h3">Profile claims</h2>
            <p className="inst-body mt-2 !text-[0.88rem]">
              Entries in the Guneku registers that you have said are you. Each one is
              reviewed by the Palace, and nothing on the public record changes until it is.
            </p>
            {claimSent && (
              <p className="mt-3 rounded-[3px] border border-[var(--royal-green)]/35 bg-[var(--royal-green)]/[0.06] px-3 py-2 text-[0.86rem] leading-[1.55] text-[var(--ink-900)]">
                <strong>Your request has been sent.</strong> The Palace will review it.
              </p>
            )}
            {claimsUnavailable ? (
              <p className="inst-meta mt-3">
                Claims cannot be read in this environment yet. You can still{' '}
                <Link href="/indigenes/submit?intent=claim" className="inst-link">
                  write to the Palace about an entry
                </Link>
                .
              </p>
            ) : (
              <MyClaims claims={claims} />
            )}
          </section>

          <section aria-labelledby="mg-following" className="border-t border-[var(--rule)] pt-7">
            <h2 id="mg-following" className="inst-h3">Following</h2>
            {follows.length === 0 ? (
              <p className="inst-meta mt-2">
                Not following anything yet.{' '}
                <Link href="/projects" className="inst-link">See the projects →</Link>
              </p>
            ) : (
              <ul className="mt-3 list-none p-0">
                {follows.map(f => (
                  <li key={f.id} className="inst-row">
                    <span className="inst-tag">{f.subject_type}</span>{' '}
                    <span className="inst-body !text-[0.88rem]">{f.subject_id}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="mg-contrib" className="border-t border-[var(--rule)] pt-7">
            <h2 id="mg-contrib" className="inst-h3">Contributions</h2>
            <p className="inst-body mt-2 !text-[0.88rem]">
              Corrections and information you have put forward for the record, with where
              each one has reached in review.
            </p>
            <p className="inst-meta mt-3">Nothing submitted yet.</p>
          </section>

          {/* Shown only to a reviewer or palace-admin. The link is a convenience, not the
              control: /review/claims decides for itself with requireRole('reviewer'). */}
          {atLeast(user.role, 'reviewer') && (
            <section aria-labelledby="mg-review" className="border-t border-[var(--rule)] pt-7">
              <h2 id="mg-review" className="inst-h3">Palace review</h2>
              <p className="inst-body mt-2 !text-[0.88rem]">
                Claims from members waiting for a decision.
              </p>
              <Link href="/review/claims" className="inst-btn inst-btn-quiet mt-3">
                Open the review queue
              </Link>
            </section>
          )}

          <section aria-labelledby="mg-account" className="border-t border-[var(--rule)] pt-7">
            <h2 id="mg-account" className="inst-h3">Account</h2>
            <p className="inst-body mt-2 !text-[0.88rem]">
              Your sign-in, email address and password are managed in your account settings.
            </p>
            <div className="mt-3"><UserButton showName /></div>
          </section>
        </div>
      </div>
    </main>
  )
}
