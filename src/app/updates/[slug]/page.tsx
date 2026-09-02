import { getAllUpdates, getUpdate } from '@/lib/content'
import { pageMetadata, excerptFrom } from '@/lib/seo'
import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { ArticleBody } from '@/components/layout/ArticleBody'
import { EditorialLead } from '@/components/layout/EditorialLead'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE_URL, SITE_NAME } from '@/lib/seo'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const u = getUpdate(slug) as Record<string, any> | null
  if (!u) return {}
  return pageMetadata({
    title: String(u.title),
    description: excerptFrom(u.excerpt || u.body),
    path: `/updates/${slug}`,
    image: typeof u.featuredImage === 'string' ? u.featuredImage : null,
    imageAlt: String(u.title),
    type: 'article',
    publishedTime: typeof u.publishedAt === 'string' ? u.publishedAt : null,
  })
}

export async function generateStaticParams() {
  return getAllUpdates().map((u: any) => ({ slug: u.slug }))
}

export default async function UpdatePage({
  params
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const update = getUpdate(slug)
  if (!update) notFound()

  return (
    <main style={{ backgroundColor:'oklch(0.965 0.012 85)', minHeight:'100vh' }}>
      {/* NewsArticle from the record's own fields. No author or byline is invented,
          and no date is asserted that the record does not carry. */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: update.title,
        mainEntityOfPage: `${SITE_URL}/updates/${slug}`,
        ...(update.publishedAt ? { datePublished: update.publishedAt } : {}),
        ...((update as any).excerpt ? { description: (update as any).excerpt } : {}),
        ...((update as any).leadImage ? { image: [`${SITE_URL}${(update as any).leadImage}`] } : {}),
        publisher: { '@type': 'Organization', name: SITE_NAME, '@id': `${SITE_URL}#organization` },
        isPartOf: { '@id': `${SITE_URL}#website` },
        inLanguage: 'en-GB',
      }} />
      {/* Event only where the record establishes a named occasion with a start date and
          a place. Records without those fields carry no Event markup. */}
      {(update as any).event && (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: (update as any).event.name,
          startDate: (update as any).event.startDate,
          ...((update as any).event.endDate ? { endDate: (update as any).event.endDate } : {}),
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          location: {
            '@type': 'Place',
            name: (update as any).event.place,
            address: {
              '@type': 'PostalAddress',
              addressLocality: (update as any).event.locality,
              addressCountry: (update as any).event.country || 'CM',
            },
          },
          organizer: { '@type': 'Organization', name: SITE_NAME, '@id': `${SITE_URL}#organization` },
          url: `${SITE_URL}/updates/${slug}`,
        }} />
      )}
      <PageHero
        label="THE VILLAGE SQUARE"
        title={update.title.toUpperCase()}
        subtitle={update.publishedAt
          ? new Date(update.publishedAt).toLocaleDateString('en-GB',
              { day:'numeric', month:'long', year:'numeric' })
          : ''}
      />

      <section style={{ maxWidth:'900px', margin:'0 auto', padding:'4rem 1.5rem' }}>

        {/* One lead treatment for every record: the approved photograph where the
            record carries one, otherwise the deliberate institutional plate. */}
        <EditorialLead
          src={(update as any).leadImage ?? null}
          alt={(update as any).leadImageAlt ?? null}
          caption={(update as any).leadImageCaption ?? null}
          category="The Village Square"
        />

        {/* YouTube embeds if any */}
        {(update as any).youtubeEmbeds?.length > 0 && (
          <div style={{ marginBottom:'2.5rem' }}>
            {(update as any).youtubeEmbeds.map((v: any) => (
              <div key={v.videoId}
                   style={{ position:'relative', paddingBottom:'56.25%',
                            height:0, overflow:'hidden', marginBottom:'1rem' }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${v.videoId}`}
                  title={v.title || 'Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  style={{ position:'absolute', top:0, left:0,
                           width:'100%', height:'100%', border:'none' }}
                />
              </div>
            ))}
          </div>
        )}

        <ArticleBody body={update.body} />

        <div style={{ marginTop:'4rem', paddingTop:'2rem',
                      borderTop:'1px solid oklch(0.878 0.010 90)' }}>
          <Link href="/updates" style={{
            color:'oklch(0.320 0.060 158)', fontFamily:'var(--font-sans)',
            fontSize:'0.8rem', letterSpacing:'0.1em',
            textTransform:'uppercase', textDecoration:'none',
          }}>
            ← Back to Village Square
          </Link>
        </div>
      </section>
    </main>
  )
}
