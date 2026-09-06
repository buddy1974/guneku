import { getImageGallery, albumCoverSrc } from '@/lib/content'
import { pageMetadata, shortTitle } from '@/lib/seo'
import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import {
  publicDescription, contributeAlbumHref, UNIDENTIFIED_PEOPLE,
} from '@/lib/archive-notes'
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
    /* Two albums carry a full sentence where a name would go, because that is what the
       migrated record says. The record is not rewritten; the tab gets something that fits,
       and the full text is on the page. */
    title: shortTitle(String(album.title)),
    description: `${String(album.title).replace(/\s+/g, ' ').trim()} — ${album.imageCount} photographs from the Guneku Fondom archive${when ? ', ' + when : ''}.`,
    path: `/gallery/images/${albumId}`,
    image: albumCoverSrc(album),
    imageAlt: String(album.title),
  })
}

/* The shapes this page actually reads. The record has more fields than these; naming the
   ones used is what lets a missing `publicPath` or a renamed `imageCount` fail here rather
   than render as blank. */
type AlbumImage = {
  id: string
  filename: string
  publicPath?: string | null
  caption?: string | null
  title?: string | null
}

export async function generateStaticParams() {
  const gallery = getImageGallery()
  return (gallery?.albums || []).map((a: { id: string }) => ({ album: a.id }))
}

export default async function AlbumPage({
  params
}: { params: Promise<{ album: string }> }) {
  const { album: albumId } = await params
  const gallery = getImageGallery()
  const album = gallery?.albums?.find((a: { id: string }) => a.id === albumId)
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
        /* Set in capitals, a 160-character record title is a wall on a phone. The whole of
           it is shown below, in the album's own record card. */
        title={shortTitle(String(album.title), 64).toUpperCase()}
        subtitle={`${album.imageCount} photographs${dateStr ? ' · ' + dateStr : ''}`}
      />
      <section style={{ maxWidth:'1400px', margin:'0 auto', padding:'4rem 1.5rem' }}>
        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(min(240px,100%), 1fr))',
                      gap:'4px' }}>
          {((album.images || []) as AlbumImage[]).map(img => (
            <div key={img.id} style={{ aspectRatio:'1', overflow:'hidden',
                                       position:'relative', backgroundColor:'oklch(0.940 0.014 85)' }}>
              {/* img.publicPath has always been in this record; the page simply never
                  read it. Captions are whatever the archive holds — none is invented. */}
              {img.publicPath ? (
                <Image src={img.publicPath}
                       /* Alt text, in order of authority: a caption the Fondom wrote, the
                          record's own title, an APPROVED neutral description of what is
                          visible, and otherwise the album this photograph belongs to. A
                          description reaches this line only after a person approved it —
                          a draft is invisible here as everywhere else. Never a filename,
                          never a raw record object, and never an inferred identity. */
                       alt={
                         [img.caption, img.title].find(x => typeof x === 'string' && x.trim() && !x.trim().startsWith('{'))
                         || publicDescription(img)?.text
                         || `${album.title} — photograph from the Guneku Fondom archive`
                       }
                       fill unoptimized loading="lazy"
                       sizes="(max-width: 768px) 50vw, 240px"
                       style={{ objectFit:'cover' }} />
              ) : (
                <ImagePlaceholder label={img.filename} aspectRatio="1/1" />
              )}
            </div>
          ))}
        </div>
        {/* ── What this record does and does not hold ────────────────────────────────
            The standing principle applied to the archive: the structure is shown, what
            is known is published, and the gap is named as a gap rather than filled.
            Nobody in these photographs is identified by guesswork, and no date, event or
            place is inferred from an image. */}
        <div className="inst-card" style={{ marginTop:'3rem', padding:'1.5rem', maxWidth:'44rem' }}>
          <p className="inst-tag">About this album&rsquo;s record</p>
          <p className="inst-body" style={{ marginTop:'0.5rem', fontSize:'0.9rem' }}>
            {album.description && album.description !== album.title
              ? album.description
              : `${album.imageCount} photographs kept in the Guneku Fondom archive.`}
          </p>
          <p className="inst-body" style={{ marginTop:'0.75rem', fontSize:'0.88rem' }}>
            {UNIDENTIFIED_PEOPLE}
          </p>
          <p className="inst-meta" style={{ marginTop:'0.75rem' }}>
            If you know who is in one of these photographs, when it was taken, or what it
            records, the Palace would like to hear it. Nothing is published until a person
            has reviewed it.
          </p>
          <Link href={contributeAlbumHref(String(album.title))}
                className="inst-btn inst-btn-quiet" style={{ marginTop:'1rem' }}>
            Add information about this album
          </Link>
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
