import Link from 'next/link'
import { redirect } from 'next/navigation'
import { optionalUser, atLeast } from '@/lib/auth'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { listPendingForReview } from '@/lib/db/claims'
import { getMember } from '@/lib/db/members'
import { getFoundingName, getChapter, getBody } from '@/lib/community'
import { ReviewQueue, type PendingClaim } from './ReviewQueue'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Claim review',
  robots: { index: false, follow: false },
}

/* The Palace's review queue.
 *
 * Two locks, as everywhere in this repository. The middleware matches `/review` so a session
 * exists here at all; this page then decides, from the session's own role, whether the person
 * may see a queue. A `member` and a `contributor` may not — they are redirected to My Guneku
 * rather than shown an empty page, because an empty page implies there is nothing to see and
 * the truth is that it is not theirs to see.
 *
 * What a reviewer is shown about a claimant is deliberately small: the display name and email
 * the member themselves entered in My Guneku, and their claim note. Not their Clerk id, not
 * their session, not anything Clerk holds that Guneku has no business rendering. */
export default async function ReviewClaimsPage() {
  if (!clerkConfigured()) return <MemberAreaNotice title="Review is not open yet" />

  const user = await optionalUser()
  if (!user) redirect('/sign-in?redirect_url=%2Freview%2Fclaims')

  /* The page-level authorisation. `requireRole` is used in the routes that mutate; here the
     same rule produces a redirect rather than a thrown 403, because this is a page. */
  if (!atLeast(user.role, 'reviewer')) redirect('/my-guneku')

  let pending: PendingClaim[] = []
  let dataUnavailable = false
  try {
    const rows = await listPendingForReview()

    pending = await Promise.all(rows.map(async row => {
      const person = getFoundingName(row.person_slug)
      const chapter = person?.chapter ? getChapter(person.chapter) : null
      const body    = person?.body    ? getBody(person.body)       : null

      /* The claimant, as the claimant described themselves. If they have never filled in
         their member details there is simply nothing to show, and the reviewer is told that
         rather than shown an id. */
      let member = null
      try { member = await getMember(row.clerk_user_id) } catch { /* reported below */ }

      return {
        id:          row.id,
        note:        row.note,
        created_at:  row.created_at,
        /* Whether the reviewer is the claimant. Computed here so the button can be absent
           rather than merely refused — the route checks it again regardless. */
        isOwnClaim:  row.clerk_user_id === user.userId,
        person: {
          slug:    row.person_slug,
          display: person?.display ?? row.person_slug,
          role:    person?.role ?? null,
          place:   chapter ? `${chapter.flag} ${chapter.org} — ${chapter.place}` : null,
          body:    body?.name ?? null,
          source:  person?.sourceLabel ?? null,
          /* A record that has since been marked deceased, or withdrawn from claiming, must
             not be quietly approvable from a queue built before that happened. */
          missing:  !person,
          deceased: person?.deceased === true,
        },
        claimant: {
          name:    member?.display_name ?? null,
          email:   member?.email ?? null,
          country: member?.country ?? null,
          quarter: member?.quarter ?? null,
          chapter: member?.chapter ?? null,
        },
      }
    }))
  } catch (err) {
    console.error('Claim review queue unavailable:', err)
    dataUnavailable = true
  }

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <section className="inst-dark border-b border-[var(--rule)]">
        <div className="inst-wrap py-8">
          <p className="inst-eyebrow !text-white/60">Guneku Fondom · Palace</p>
          <h1 className="inst-h1 mt-1.5 !text-[2.2rem] !text-white">Claim review</h1>
          <p className="mt-2 max-w-2xl text-[0.92rem] leading-[1.65] text-white/70">
            Members asking to be connected to a record in the register. Confirming a claim
            associates their account with the record — it does not change the record, its
            office, its sources or anything written about it.
          </p>
          <p className="mt-4">
            <Link href="/my-guneku" className="text-[0.82rem] font-semibold text-white/75 underline underline-offset-4 hover:text-white">
              ← Back to My Guneku
            </Link>
          </p>
        </div>
      </section>

      <div className="inst-wrap inst-sec">
        {dataUnavailable ? (
          <div className="inst-card max-w-[38rem] p-6">
            <h2 className="inst-h3">The queue cannot be read at the moment</h2>
            <p className="inst-body mt-2">
              Claims are not reachable in this environment. Nothing else on Guneku.org is
              affected.
            </p>
          </div>
        ) : (
          <ReviewQueue claims={pending} />
        )}
      </div>
    </main>
  )
}
