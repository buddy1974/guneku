import Link from 'next/link'
import { redirect } from 'next/navigation'
import { optionalUser, atLeast } from '@/lib/auth'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { followerCounts } from '@/lib/db/notifications'
import {
  allAudiences, audienceLabel, subjectFor,
  SEND_BLOCKERS, NOT_BUILT, NEVER_ANNOUNCE,
} from '@/lib/notify'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Who is following what',
  robots: { index: false, follow: false },
}

/* Stay Connected, seen from the Palace's side — and deliberately a preflight rather than a
 * console.
 *
 * ── Why there is no send button ──────────────────────────────────────────────────────────
 *
 * Two things are missing, and neither is code:
 *
 *   A sender the Fondom owns. `EMAIL_FROM` is unset in every environment, so mail leaves as
 *   Resend's testing address. It cannot deliver to arbitrary recipients, and it would be the
 *   wrong name on a letter from the Palace even if it could. Fixing it means SPF and DKIM
 *   records on guneku.org, which only the domain's owner can create.
 *
 *   A record of what has already gone out. Without one, a second press writes to every
 *   follower twice and a bounce Resend reports afterwards cannot be honoured. That is a
 *   table, a table is a migration, and a migration is the owner's decision.
 *
 * A send button shipped before those exist would either fail silently or send twice, and
 * both are worse than a screen that says what it would do. So this page tells the Palace who
 * is waiting to hear and what stands in the way, and stops there.
 *
 * ── Why counts and not addresses ─────────────────────────────────────────────────────────
 *
 * Nobody's email appears on this page, and no member is named. What somebody follows is
 * private — the follow taxonomy says so — and a screen that listed "who follows Palace
 * announcements" would turn a private preference into a roster. The Palace needs to know how
 * many people are waiting, not which people they are. */
export default async function NotifyPreflightPage() {
  if (!clerkConfigured()) return <MemberAreaNotice title="This page is not open yet" />

  const user = await optionalUser()
  if (!user) redirect('/sign-in?redirect_url=%2Freview%2Fnotify')
  if (!atLeast(user.role, 'palace-admin')) redirect('/my-guneku')

  let rows: Awaited<ReturnType<typeof followerCounts>> = []
  let dataUnavailable = false
  try {
    rows = await followerCounts()
  } catch {
    dataUnavailable = true
  }

  const byKey = new Map(rows.map(r => [`${r.subject_type}:${r.subject_id}`, r]))
  const audiences = allAudiences().map(a => {
    const { type, id } = subjectFor(a)
    const row = byKey.get(`${type}:${id}`)
    return {
      label: audienceLabel(a),
      kind: a.kind,
      followers: row?.followers ?? 0,
      withEmail: row?.with_email ?? 0,
    }
  })

  const followed = audiences.filter(a => a.followers > 0)
  const totalFollows = audiences.reduce((n, a) => n + a.followers, 0)

  return (
    <main className="inst-page">
      <div className="inst-wrap py-10">
        <p className="inst-tag">Palace</p>
        <h1 className="inst-h1 mt-1">Who is following what</h1>
        <p className="inst-body mt-3 max-w-[42rem]">
          What members have asked to hear about. Counts only — no member is named and no
          address is shown here, because what somebody follows is private.
        </p>

        {dataUnavailable ? (
          <p className="inst-meta mt-6">
            Follows cannot be read in this environment. Following still works for members.
          </p>
        ) : totalFollows === 0 ? (
          <div className="inst-card mt-6 max-w-[38rem] p-6">
            <h2 className="inst-h3">Nobody is following anything yet</h2>
            <p className="inst-body mt-2">
              Members choose what to follow in{' '}
              <Link href="/my-guneku" className="underline">My Guneku</Link>. Every topic and
              every quarter is available to them; none has been chosen so far.
            </p>
          </div>
        ) : (
          <div className="mt-7 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-[0.9rem]">
              <caption className="sr-only">
                Follower counts by topic and quarter
              </caption>
              <thead>
                <tr className="border-b border-[var(--rule)] text-left">
                  <th scope="col" className="py-2 pr-4 font-medium">Followed</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Followers</th>
                  <th scope="col" className="py-2 font-medium">Could be emailed</th>
                </tr>
              </thead>
              <tbody>
                {followed.map(a => (
                  <tr key={`${a.kind}-${a.label}`} className="border-b border-[var(--rule)]">
                    <td className="py-2 pr-4">{a.label}</td>
                    <td className="py-2 pr-4">{a.followers}</td>
                    <td className="py-2">
                      {a.withEmail}
                      {a.withEmail < a.followers && (
                        <span className="inst-meta ml-2">
                          ({a.followers - a.withEmail} gave no address)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="inst-meta mt-3">
              A member who gave no email address can still follow. They see what they follow in
              My Guneku; they would not receive a letter.
            </p>
          </div>
        )}

        {/* ── Why nothing sends ────────────────────────────────────────────────────────── */}
        <section className="mt-10 max-w-[42rem]">
          <h2 className="inst-h3">Nothing is sent from this page</h2>
          <p className="inst-body mt-2">
            Following is a standing instruction to the Fondom, not a subscription that fires
            on its own. Two things stand between these lists and a letter, and neither is
            something the site can decide for itself.
          </p>
          <ol className="mt-4 space-y-4">
            {SEND_BLOCKERS.map((b, i) => (
              <li key={i} className="inst-card p-4">
                <p className="inst-tag">{b.what}</p>
                <p className="inst-body mt-1.5 !text-[0.88rem]">{b.why}</p>
                <p className="inst-meta mt-2">Needs: {b.needs}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-9 max-w-[42rem]">
          <h2 className="inst-h3">What would never be sent</h2>
          <p className="inst-body mt-2">
            When a letter does go out it will carry published Guneku content and nothing else.
            These are excluded by the rules themselves rather than by remembering:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.88rem] leading-[1.6] text-[var(--ink-600)]">
            {NEVER_ANNOUNCE.map(x => <li key={x}>{x}</li>)}
          </ul>
        </section>

        <section className="mt-9 max-w-[42rem]">
          <h2 className="inst-h3">What Stay Connected is not</h2>
          <p className="inst-body mt-2">
            Decisions, not omissions. None of the following is being built:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.88rem] leading-[1.6] text-[var(--ink-600)]">
            {NOT_BUILT.map(x => <li key={x}>{x}</li>)}
          </ul>
          <p className="inst-meta mt-4">
            Unfollowing is the unsubscribe, and there is no second list to fall out of step
            with it. A member who unfollows in My Guneku stops being in any of these counts,
            so nothing could be addressed to them.
          </p>
        </section>

        <p className="mt-10">
          <Link href="/my-guneku" className="inst-btn inst-btn-quiet">Back to My Guneku</Link>
        </p>
      </div>
    </main>
  )
}
