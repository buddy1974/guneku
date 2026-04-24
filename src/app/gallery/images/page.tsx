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
    <main style={{ backgroundColor: '#0F0F0F', minHeight: '100vh' }}>
      <PageHero
        label="IMAGE GALLERY"
        title="GUNEKU IN PICTURES"
        subtitle={`${albums.length} event albums · ${totalPhotos} photographs`}
      />
      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'5rem 1.5rem' }}>
        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
                      gap:'1.5rem' }}>
          {albums.map((album: any) => (
            <Link key={album.id} href={`/gallery/images/${album.id}`}
                  style={{ textDecoration:'none', display:'block',
                           backgroundColor:'#0C0C14',
                           border:'1px solid rgba(255,255,255,0.05)',
                           overflow:'hidden' }}
                  className="hover:border-[rgba(242,169,11,0.25)] transition-colors">
              <div style={{ position:'relative' }}>
                <ImagePlaceholder label={album.title} aspectRatio="16/9" />
                <div style={{ position:'absolute', top:'0.75rem', right:'0.75rem',
                              backgroundColor:'rgba(15,15,15,0.8)',
                              color:'#f2a90b', fontFamily:'Syne, sans-serif',
                              fontSize:'0.7rem', letterSpacing:'0.1em',
                              padding:'0.25rem 0.6rem', textTransform:'uppercase' }}>
                  {album.imageCount} photos
                </div>
              </div>
              <div style={{ padding:'1.25rem' }}>
                <h3 style={{ fontFamily:'Syne, sans-serif', fontWeight:700,
                             color:'#F5F2E9', fontSize:'1rem',
                             margin:'0 0 0.35rem', lineHeight:1.3 }}>
                  {album.title}
                </h3>
                <p style={{ color:'rgba(245,242,233,0.35)',
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
