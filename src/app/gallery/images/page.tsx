import { getImageGallery, albumCoverSrc, type GalleryAlbum } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  alternates: { canonical: '/gallery/images' },
  description: "Fifteen event albums and 338 photographs from the Guneku Fondom archive — the Palace, the Traditional Council, the road work, the festivals and the diaspora chapters.", title: 'Image Gallery' }

export default function ImageGalleryPage() {
  const gallery = getImageGallery()
  /* The record's own album type, so a helper that needs the whole album still gets
     one and a renamed field fails here rather than rendering a silent zero. */
  const albums: GalleryAlbum[] = gallery?.albums || []
  const totalPhotos = albums.reduce((n, a) => n + (a.imageCount || 0), 0)

  return (
    <main style={{ backgroundColor: 'oklch(0.965 0.012 85)', minHeight: '100vh' }}>
      <PageHero
        label="IMAGE GALLERY"
        title="GUNEKU IN PICTURES"
        subtitle={`${albums.length} event albums · ${totalPhotos} photographs`}
      />
      <section aria-labelledby="albums-heading"
               style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem' }}>
        {/* The album cards were the first headings after the page title, so the structure
            skipped a rank for anyone navigating by heading. Named, not shown: the page hero
            already says what this is, and a second visible heading would only repeat it. */}
        <h2 id="albums-heading" className="sr-only">Albums in the archive</h2>
        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(min(300px,100%), 1fr))',
                      gap:'1.5rem' }}>
          {albums.map(album => (
            <Link key={album.id} href={`/gallery/images/${album.id}`}
                  style={{ textDecoration:'none', display:'block',
                           backgroundColor:'oklch(0.985 0.008 85)',
                           border:'1px solid oklch(0.878 0.010 90)',
                           overflow:'hidden' }}
                  className="hover:border-[rgba(242,169,11,0.25)] transition-colors">
              {/* The photographs are real and held in the repository. This card used
                  to render a placeholder unconditionally, which is why the counts
                  above never matched anything visible. */}
              <div style={{ position:'relative' }}>
                {albumCoverSrc(album) ? (
                  <div style={{ position:'relative', aspectRatio:'16/9', overflow:'hidden' }}>
                    <Image src={albumCoverSrc(album)!} alt={album.title} fill unoptimized
                           loading="lazy" sizes="(max-width: 768px) 100vw, 33vw"
                           style={{ objectFit:'cover' }} />
                  </div>
                ) : (
                  <ImagePlaceholder label={album.title} aspectRatio="16/9" />
                )}
                <div style={{ position:'absolute', top:'0.75rem', right:'0.75rem',
                              backgroundColor:'oklch(0.215 0.045 158 / 0.78)',
                              color:'oklch(0.320 0.060 158)', fontFamily:'var(--font-sans)',
                              fontSize:'0.7rem', letterSpacing:'0.1em',
                              padding:'0.25rem 0.6rem', textTransform:'uppercase' }}>
                  {album.imageCount} photos
                </div>
              </div>
              <div style={{ padding:'1.25rem' }}>
                <h3 style={{ fontFamily:'var(--font-sans)', fontWeight:700,
                             color:'oklch(0.245 0.022 150)', fontSize:'1rem',
                             margin:'0 0 0.35rem', lineHeight:1.3 }}>
                  {album.title}
                </h3>
                <p style={{ color:'oklch(0.560 0.016 150)',
                            fontFamily:'Inter, sans-serif', fontSize:'0.8rem', margin:0 }}>
                  {album.date
                    ? new Date(album.date).toLocaleDateString('en-GB',
                        { day:'numeric', month:'long', year:'numeric' })
                    : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
