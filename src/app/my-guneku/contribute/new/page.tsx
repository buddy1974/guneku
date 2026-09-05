import Link from 'next/link'
import { redirect } from 'next/navigation'
import { optionalUser } from '@/lib/auth'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { resolveTarget, isContributionType, type ContributionType } from '@/lib/contributions'
import { ContributeForm } from './ContributeForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Contribute to the record',
  robots: { index: false, follow: false },
}

/* Supplying what the record is missing.
 *
 * The page says plainly, before anything is typed, that a contribution is reviewed and does
 * not change the site by itself. A villager who has just pressed "Help complete this record"
 * on their quarter's page will reasonably expect the page to change, and it will not — saying
 * so first is the difference between a moderated workflow and a form that seems to have done
 * nothing.
 *
 * The target arrives in the query string and is resolved here against the reviewed records,
 * and again in the POST handler. A crafted `?targetType=quarter&targetId=Atlantis` produces
 * the general form, not a contribution about a place that does not exist. */
export default async function ContributePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; targetType?: string; targetId?: string }>
}) {
  if (!clerkConfigured()) return <MemberAreaNotice title="Contributing is not open yet" />

  const sp = await searchParams

  const user = await optionalUser()
  if (!user) {
    /* Carry the whole context through sign-in, so somebody who came from a quarter page
       lands back on the form for that quarter rather than on a blank one. */
    const qs = new URLSearchParams()
    if (sp.type)       qs.set('type', sp.type)
    if (sp.targetType) qs.set('targetType', sp.targetType)
    if (sp.targetId)   qs.set('targetId', sp.targetId)
    const back = `/my-guneku/contribute/new${qs.size ? `?${qs}` : ''}`
    redirect(`/sign-in?redirect_url=${encodeURIComponent(back)}`)
  }

  /* An unrecognised target silently becomes the general form rather than an error page: the
     person came here to tell Guneku something, and a validation complaint about a query
     string they never typed would be the site's problem presented as theirs. */
  const resolved = sp.targetType ? resolveTarget(sp.targetType, sp.targetId) : null
  const target = resolved?.ok
    ? { targetType: resolved.targetType, targetId: resolved.targetId, label: resolved.label }
    : { targetType: 'general' as const, targetId: null, label: 'The Guneku record in general' }

  const initialType: ContributionType | null =
    isContributionType(sp.type) ? sp.type : null

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <section className="inst-dark border-b border-[var(--rule)]">
        <div className="inst-wrap py-8">
          <p className="inst-eyebrow !text-white/60">Guneku Fondom</p>
          <h1 className="inst-h1 mt-1.5 !text-[2.1rem] !text-white">Contribute to the record</h1>
          <p className="mt-2 max-w-2xl text-[0.92rem] leading-[1.65] text-white/70">
            The Guneku record is written by the people of Guneku. If you know something it is
            missing, or something it has wrong, tell the Palace here.
          </p>
          <p className="mt-4">
            <Link href="/my-guneku" className="text-[0.82rem] font-semibold text-white/75 underline underline-offset-4 hover:text-white">
              ← Back to My Guneku
            </Link>
          </p>
        </div>
      </section>

      <div className="inst-wrap inst-sec grid items-start gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
        <ContributeForm
          initialType={initialType}
          targetType={target.targetType}
          targetId={target.targetId}
          targetLabel={target.label}
        />

        <aside className="inst-card self-start p-5">
          <p className="inst-tag">What happens to what you send</p>
          <ul className="mt-3 grid list-none gap-3 p-0 text-[0.89rem] leading-[1.6] text-[var(--ink-600)]">
            <li>
              <strong className="text-[var(--ink-900)]">Nothing is published now.</strong>{' '}
              Sending this does not change any page on Guneku.org.
            </li>
            <li>
              <strong className="text-[var(--ink-900)]">A person reads it.</strong> The Palace
              reviews what you send and decides what to do with it.
            </li>
            <li>
              <strong className="text-[var(--ink-900)]">Accepted is not the same as
              published.</strong> If Guneku takes your contribution up, updating the record is
              a separate step, made deliberately by a person.
            </li>
            <li>
              <strong className="text-[var(--ink-900)]">What you write stays
              private.</strong> It is seen by you and by the Palace, and it is never shown on
              the site.
            </li>
          </ul>

          <div className="mt-5 border-t border-[var(--rule)] pt-4">
            <p className="inst-body !text-[0.86rem]">
              We do not ask for an identity document of any kind. Tell us what you know, and
              where you know it from if you can.
            </p>
          </div>

          <div className="mt-5 border-t border-[var(--rule)] pt-4">
            <p className="inst-tag">If it is about you</p>
            <p className="inst-body mt-2 !text-[0.86rem]">
              To say that an entry in the register <em>is</em> you, that is a claim rather than
              a contribution.{' '}
              <Link href="/indigenes" className="inst-link">Find your entry →</Link>
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
