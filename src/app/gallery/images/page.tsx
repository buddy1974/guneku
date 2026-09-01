import { getImageGallery } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import Link from 'next/link'

export const metadata = { title: 'Image Gallery' }

export default function ImageGalleryPage() {
  const gallery = getImageGallery()
  const albums = gallery?.albums || []
  const totalPhotos = albums.reduce((a: number, b: any) => a + (b.imageCount || 0), 0)

  return (
    <main style={{ backgroundColor: 'oklch(0.965 0.012 85)', minHeight: '100vh' }}>
      <PageHero
        label="IMAGE GALLERY"
        title="GUNEKU IN PICTURES"
        subtitle={`${albums.length} event albums · ${totalPhotos} photographs`}
      />
      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem' }}>
        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(min(300px,100%), 1fr))',
                      gap:'1.5rem' }}>
          {albums.map((album: any) => (
            <Link key={album.id} href={`/gallery/images/${album.id}`}
                  style={{ textDecoration:'none', display:'block',
                           backgroundColor:'oklch(0.985 0.008 85)',
                           border:'1px solid oklch(0.878 0.010 90)',
                           overflow:'hidden' }}
                  className="hover:border-[rgba(242,169,11,0.25)] transition-colors">
              <div style={{ position:'relative' }}>
                <ImagePlaceholder label={album.title} aspectRatio="16/9" />
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
