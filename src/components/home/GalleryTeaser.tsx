import Image from 'next/image'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { RoyalButton } from '@/components/ui/RoyalButton'
import { getImageGallery } from '@/lib/content'

export function GalleryTeaser() {
  const gallery = getImageGallery()
  const firstAlbum = gallery.albums[0]
  const images = firstAlbum?.images.slice(0, 6) ?? []

  if (images.length === 0) return null

  return (
    <section className="bg-[#07070E] py-24 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-10">
          <SectionLabel>From the Gallery</SectionLabel>
        </div>

        {/* 6-image grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden group"
            >
              <Image
                src={img.publicPath}
                alt={img.caption ?? `Gallery image ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500
                           group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-palace-gold/0
                              group-hover:bg-palace-gold/10
                              transition-colors duration-300" />
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <RoyalButton variant="outline" href="/gallery/images">
            View Full Gallery
          </RoyalButton>
        </div>
      </div>
    </section>
  )
}
