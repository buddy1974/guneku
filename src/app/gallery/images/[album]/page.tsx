import { getImageGallery, albumCoverSrc } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/seo'

export async function generateMetadata(
  { params }: { params: Promise<{ album: string }> }
): Promise<Metadata> {
  const { album: albumId } = await params
  const gallery = getImageGallery()
  const album = gallery?.albums?.find(a => a.id === albumId)
  if (!album) return {}
  const when = album.date
    ? new Date(album.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : ''
  return pageMetadata({
    title: String(album.title),
    description: `${album.imageCount} photographs from the Guneku Fondom archive${when ? ', ' + when : ''}.`,
    path: `/gallery/images/${albumId}`,
    image: albumCoverSrc(album),
    imageAlt: String(album.title),
  })
}

export async function generateStaticParams() {
  const gallery = getImageGallery()
  return (gallery?.albums || []).map((a: any) => ({ album: a.id }))
}

export default async function AlbumPage({
  params
}: { params: Promise<{ album: string }> }) {
  const { album: albumId } = await params
  const gallery = getImageGallery()
  const album = gallery?.albums?.find((a: any) => a.id === albumId)
  if (!album) notFound()

  const dateStr = album.date
    ? new Date(album.date).toLocaleDateString('en-GB', { month:'long', year:'numeric' })
    : ''

  return (
    <main style={{ backgroundColor:'oklch(0.965 0.012 85)', minHeight:'100vh' }}>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        name: album.title,
        mainEntityOfPage: `${SITE_URL}/gallery/images/${albumId}`,
        ...(album.date ? { datePublished: album.date } : {}),
        numberOfItems: album.imageCount,
        isPartOf: { '@id': `${SITE_URL}#website` },
        inLanguage: 'en-GB',
      }} />
      <PageHero
        label="IMAGE GALLERY"
        title={album.title.toUpperCase()}
        subtitle={`${album.imageCount} photographs${dateStr ? ' · ' + dateStr : ''}`}
      />
      <section style={{ maxWidth:'1400px', margin:'0 auto', padding:'4rem 1.5rem' }}>
        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(min(240px,100%), 1fr))',
                      gap:'4px' }}>
          {(album.images || []).map((img: any) => (
            <div key={img.id} style={{ aspectRatio:'1', overflow:'hidden',
                                       position:'relative', backgroundColor:'oklch(0.940 0.014 85)' }}>
              {/* img.publicPath has always been in this record; the page simply never
                  read it. Captions are whatever the archive holds — none is invented. */}
              {/* Alt describes the photograph where the archive records a caption or a
                  title, and otherwise names the album it belongs to. Never a filename,
                  never a raw record object. */}
              {img.publicPath ? (
                <Image src={img.publicPath}
                       alt={[img.caption, img.title].find(x => typeof x === 'string' && x.trim() && !x.trim().startsWith('{')) || `${album.title} — photograph from the Guneku Fondom archive`}
                       fill unoptimized loading="lazy"
                       sizes="(max-width: 768px) 50vw, 240px"
                       style={{ objectFit:'cover' }} />
              ) : (
                <ImagePlaceholder label={img.filename} aspectRatio="1/1" />
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop:'3rem' }}>
          <Link href="/gallery/images" style={{
            color:'oklch(0.320 0.060 158)', fontFamily:'var(--font-sans)',
            fontSize:'0.8rem', letterSpacing:'0.1em',
            textTransform:'uppercase', textDecoration:'none',
          }}>
            ← Back to Gallery
          </Link>
        </div>
      </section>
    </main>
  )
}
