import { notFound, redirect } from 'next/navigation'
import { optionalUser } from '@/lib/auth'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { optionalVerifiedGunekuan } from '@/lib/business-auth'
import { getMyBusiness } from '@/lib/db/businesses'
import { BusinessForm, type BusinessFormValues } from '../../BusinessForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit a business',
  robots: { index: false, follow: false },
}

/* Editing a business you own.
 *
 * `getMyBusiness` is scoped by the session's own id as well as by the business id, so putting
 * somebody else's id in this URL finds nothing and the page is a 404 — the same answer a
 * business that does not exist gets. There is no separate ownership check to forget. */
export default async function EditBusinessPage({
  params,
}: { params: Promise<{ id: string }> }) {
  if (!clerkConfigured()) return <MemberAreaNotice title="The member area is not open yet" />

  const { id } = await params

  const user = await optionalUser()
  if (!user) redirect(`/sign-in?redirect_url=/my-guneku/businesses/${id}/edit`)

  const verified = await optionalVerifiedGunekuan()
  if (!verified) redirect('/my-guneku/businesses')

  const found = await getMyBusiness(verified.userId, id).catch(() => null)
  if (!found) notFound()

  const { row, videos } = found

  const initial: BusinessFormValues = {
    name: row.name,
    tagline: row.tagline ?? '',
    description: row.description ?? '',
    category: row.category,
    relationship: row.relationship,
    tags: (row.tags ?? []).join(', '),
    services: (row.services ?? []).join('\n'),
    serviceAreas: (row.service_areas ?? []).join(', '),
    country: row.country ?? '',
    city: row.city ?? '',
    address: row.address ?? '',
    website: row.website ?? '',
    facebook: row.facebook ?? '',
    instagram: row.instagram ?? '',
    linkedin: row.linkedin ?? '',
    youtube: row.youtube ?? '',
    publishContact: row.publish_contact,
    contactPhone: row.contact_phone ?? '',
    contactEmail: row.contact_email ?? '',
    logoUrl: row.logo_url ?? '',
    coverUrl: row.cover_url ?? '',
    videos: videos
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(v => `https://youtu.be/${v.video_id}`)
      .join('\n'),
  }

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <section className="inst-wrap inst-sec">
        <p className="inst-eyebrow">My Guneku</p>
        <h1 className="inst-h1 mt-2">{row.name}</h1>
        <p className="inst-body mt-3 max-w-2xl">
          Changing the name changes the heading on the page and nothing else &mdash; the
          address stays as it is, so a link somebody wrote down keeps working.
        </p>

        <div className="mt-8 max-w-[44rem]">
          <BusinessForm initial={initial} businessId={row.id} />
        </div>
      </section>
    </main>
  )
}
