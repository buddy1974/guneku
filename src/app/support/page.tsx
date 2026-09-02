import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { pageMetadata } from '@/lib/seo'
import current from '@/data/current-notices.json'
import { SupportForm } from './SupportForm'

export const metadata = pageMetadata({
  title: 'Support a Guneku project',
  description: 'Offer funds, materials, professional expertise, volunteering or partnership towards a Guneku Fondom project. No payment is taken on this site — your offer is sent to the Guneku Palace for review.',
  path: '/support',
})

/* No payment is taken here. This repository holds no approved donation or payment
   mechanism, so this is an offer-of-support form rather than a checkout. Nothing about
   Stripe, PayPal, a bank or mobile money is invented. */
export default async function SupportPage({
  searchParams,
}: { searchParams: Promise<{ project?: string }> }) {
  const { project } = await searchParams

  const projects = (current.development as Array<{ name: string; class?: string }>)
    .filter(d => ['PROJECT', 'PROGRAMME', 'PROPOSED INITIATIVE', 'INSTITUTION'].includes(String(d.class)))
    .map(d => d.name)

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label="SUPPORT GUNEKU"
        title="Offer support to a Guneku project"
        subtitle="Tell the Palace which project interests you and how you would like to help. Your offer will be sent to the Guneku Palace for review."
      />

      <section className="inst-wrap inst-sec">
        <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <SupportForm projects={projects} initialProject={project} />

          <aside>
            <h2 className="inst-h3">Before you send</h2>
            <ul className="mt-3 list-none space-y-3 p-0">
              <li className="inst-body !text-[0.88rem]">
                <strong className="text-[var(--ink-900)]">No money is taken on this site.</strong>{' '}
                This form records an offer of support and nothing more. Your offer is sent
                to the Guneku Palace for review, and a representative may contact you
                using the details you provide.
              </li>
              <li className="inst-body !text-[0.88rem]">
                The Fondom publishes a notice on how official announcements are made, and
                how to check a request before sending anyone money.{' '}
                <Link href="/updates/how-guneku-communicates-verify-requests-2026" className="inst-link">
                  Read the notice →
                </Link>
              </li>
              <li className="inst-body !text-[0.88rem]">
                Every project in the list is published at the stage its own sources
                establish.{' '}
                <Link href="/projects" className="inst-link">See the development register →</Link>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  )
}
