import { getImageGallery } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh' }}>
      <PageHero
        label="IMAGE GALLERY"
        title={album.title.toUpperCase()}
        subtitle={`${album.imageCount} photographs${dateStr ? ' · ' + dateStr : ''}`}
      />
      <section style={{ maxWidth:'1400px', margin:'0 auto', padding:'4rem 1.5rem' }}>
        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))',
                      gap:'4px' }}>
          {(album.images || []).map((img: any) => (
            <div key={img.id} style={{ aspectRatio:'1', overflow:'hidden',
                                       position:'relative', backgroundColor:'#0A0A10' }}>
              <ImagePlaceholder label={img.filename} aspectRatio="1/1" />
            </div>
          ))}
        </div>
        <div style={{ marginTop:'3rem' }}>
          <Link href="/gallery/images" style={{
            color:'#f2a90b', fontFamily:'Syne, sans-serif',
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
