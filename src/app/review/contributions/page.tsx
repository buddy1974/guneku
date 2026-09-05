import Link from 'next/link'
import { redirect } from 'next/navigation'
import { optionalUser, atLeast } from '@/lib/auth'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { listPendingContributions } from '@/lib/db/contributions'
import { getMember } from '@/lib/db/members'
import { contributionTargetLabel, contributionTargetHref } from '@/lib/contribution-targets'
import { ContributionQueue, type PendingContribution } from './ContributionQueue'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Contribution review',
  robots: { index: false, follow: false },
}

/* The Palace's contribution queue.
 *
 * Two locks, as everywhere here. The middleware matches `/review` so a session exists at all;
 * this page then decides from the session's own role whether the person may see a queue. A
 * `member` and a `contributor` are redirected rather than shown an empty page — an empty
 * queue says "there is nothing here", and the truth is that it is not theirs to see.
 *
 * What a reviewer sees about a contributor is deliberately small: the name and email the
 * member entered themselves in My Guneku, and what they wrote. Not their Clerk id, not their
 * session, not anything Clerk holds that Guneku has no business rendering. */
export default async function ReviewContributionsPage() {
  if (!clerkConfigured()) return <MemberAreaNotice title="Review is not open yet" />

  const user = await optionalUser()
  if (!user) redirect('/sign-in?redirect_url=%2Freview%2Fcontributions')
  if (!atLeast(user.role, 'reviewer')) redirect('/my-guneku')

  let pending: PendingContribution[] = []
  let dataUnavailable = false
  try {
    const rows = await listPendingContributions()

    pending = await Promise.all(rows.map(async row => {
      let member = null
      try { member = await getMember(row.clerk_user_id) } catch { /* reported below */ }

      return {
        id:          row.id,
        type:        row.type,
        content:     row.content,
        source_note: row.source_note,
        created_at:  row.created_at,
        /* Computed here so the button can be absent rather than merely refused. The route
           checks it again regardless. */
        isOwn:       row.clerk_user_id === user.userId,
        target: {
          label: contributionTargetLabel(row.target_type, row.target_id),
          href:  contributionTargetHref(row.target_type, row.target_id),
          type:  row.target_type,
        },
        contributor: {
          name:    member?.display_name ?? null,
          email:   member?.email ?? null,
          country: member?.country ?? null,
          quarter: member?.quarter ?? null,
        },
      }
    }))
  } catch (err) {
    console.error('Contribution review queue unavailable:', err)
    dataUnavailable = true
  }

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <section className="inst-dark border-b border-[var(--rule)]">
        <div className="inst-wrap py-8">
          <p className="inst-eyebrow !text-white/60">Guneku Fondom · Palace</p>
          <h1 className="inst-h1 mt-1.5 !text-[2.2rem] !text-white">Contribution review</h1>
          <p className="mt-2 max-w-2xl text-[0.92rem] leading-[1.65] text-white/70">
            Information and corrections sent in by members. Accepting one takes it up for
            editorial action &mdash; it does not publish anything. Updating the record is a
            separate step, made deliberately.
          </p>
          <p className="mt-4 flex flex-wrap gap-4">
            <Link href="/my-guneku" className="text-[0.82rem] font-semibold text-white/75 underline underline-offset-4 hover:text-white">
              ← Back to My Guneku
            </Link>
            <Link href="/review/claims" className="text-[0.82rem] font-semibold text-white/75 underline underline-offset-4 hover:text-white">
              Claim review →
            </Link>
          </p>
        </div>
      </section>

      <div className="inst-wrap inst-sec">
        {dataUnavailable ? (
          <div className="inst-card max-w-[38rem] p-6">
            <h2 className="inst-h3">The queue cannot be read at the moment</h2>
            <p className="inst-body mt-2">
              Contributions are not reachable in this environment. Nothing else on Guneku.org
              is affected.
            </p>
          </div>
        ) : (
          <ContributionQueue contributions={pending} />
        )}
      </div>
    </main>
  )
}
