import Link from 'next/link'
import { redirect } from 'next/navigation'
import { optionalUser, atLeast } from '@/lib/auth'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { listForPalace } from '@/lib/db/correspondence'
import { getMember } from '@/lib/db/members'
import { CorrespondenceQueue, type PalaceLetter } from './CorrespondenceQueue'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Palace correspondence',
  robots: { index: false, follow: false },
}

/* The Palace's correspondence queue.
 *
 * ── Why palace-admin, and not reviewer ───────────────────────────────────────────────────
 *
 * `reviewer` decides claims and contributions — what the public record should say. Answering
 * a villager's private letter is speaking *for the Palace*, and being trusted to check a
 * register implies no such authority. A reviewer is turned away here exactly as a member is,
 * and the API behind every button asks for `palace-admin` again.
 *
 * ── Why it lives under /review ───────────────────────────────────────────────────────────
 *
 * Because that namespace is already matched by the middleware. It deliberately does not live
 * under /palace, which is public content served by /palace/[slug]: a protected page there
 * would collide with an article route and pull Clerk onto every public Palace page. */
export default async function PalaceCorrespondencePage() {
  if (!clerkConfigured()) return <MemberAreaNotice title="Palace correspondence is not open yet" />

  const user = await optionalUser()
  if (!user) redirect('/sign-in?redirect_url=%2Freview%2Fcorrespondence')
  if (!atLeast(user.role, 'palace-admin')) redirect('/my-guneku')

  let letters: PalaceLetter[] = []
  let dataUnavailable = false
  try {
    const rows = await listForPalace()

    letters = await Promise.all(rows.map(async row => {
      /* A member's own details, where the sender had an account. A signed-out visitor has
         only what they typed, and nothing is invented to fill the gap. */
      let member = null
      if (row.clerk_user_id) {
        try { member = await getMember(row.clerk_user_id) } catch { /* reported below */ }
      }

      return {
        id:            row.id,
        category:      row.category,
        subject:       row.subject,
        message:       row.message,
        status:        row.status,
        response:      row.response,
        internalNote:  row.internal_note,
        createdAt:     row.created_at,
        sender: {
          name:     row.sender_name,
          email:    row.sender_email,
          phone:    row.sender_phone,
          /* Whether they wrote in as a signed-in member. Not their Clerk id — the queue has
             no use for it and it has no business on a page. */
          isMember: row.clerk_user_id !== null,
          memberName:    member?.display_name ?? null,
          memberQuarter: member?.quarter ?? null,
        },
      }
    }))
  } catch (err) {
    console.error('Palace correspondence queue unavailable:', err)
    dataUnavailable = true
  }

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <section className="inst-dark border-b border-[var(--rule)]">
        <div className="inst-wrap py-8">
          <p className="inst-eyebrow !text-white/60">Guneku Fondom · Palace</p>
          <h1 className="inst-h1 mt-1.5 !text-[2.2rem] !text-white">Palace correspondence</h1>
          <p className="mt-2 max-w-2xl text-[0.92rem] leading-[1.65] text-white/70">
            Private messages sent to the Palace. None of this is published anywhere on
            Guneku.org, and a reply is sent only when someone writes one.
          </p>
          <p className="mt-4 flex flex-wrap gap-4">
            <Link href="/my-guneku" className="text-[0.82rem] font-semibold text-white/75 underline underline-offset-4 hover:text-white">
              ← Back to My Guneku
            </Link>
            <Link href="/review/claims" className="text-[0.82rem] font-semibold text-white/75 underline underline-offset-4 hover:text-white">
              Claim review →
            </Link>
            <Link href="/review/contributions" className="text-[0.82rem] font-semibold text-white/75 underline underline-offset-4 hover:text-white">
              Contribution review →
            </Link>
          </p>
        </div>
      </section>

      <div className="inst-wrap inst-sec">
        {dataUnavailable ? (
          <div className="inst-card max-w-[38rem] p-6">
            <h2 className="inst-h3">Correspondence cannot be read at the moment</h2>
            <p className="inst-body mt-2">
              Messages are not reachable in this environment. The public contact form still
              delivers to the Fondom inbox, so nothing sent is lost.
            </p>
          </div>
        ) : (
          <CorrespondenceQueue letters={letters} />
        )}
      </div>
    </main>
  )
}
