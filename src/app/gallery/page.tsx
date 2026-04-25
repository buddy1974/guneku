import Link  from 'next/link'
import Image from 'next/image'
import { getImageGallery } from '@/lib/content'
import { Reveal }          from '@/components/ui/Reveal'

export const metadata = { title: 'Gallery — Faces of Guneku' }

const PLACEHOLDER_IMAGES = [
  { src: '/festival.jpg',       title: 'Mɨchi Əbeŋ Masquerade',   year: '2024', span: 'md:col-span-2 md:row-span-2' },
  { src: '/hero-fon.jpg',       title: 'The Fon at Sunrise',        year: '2025', span: '' },
  { src: '/regalia.jpg',        title: 'Beaded Crown',              year: 'Heritage', span: '' },
  { src: '/palace.jpg',         title: 'Palace Courtyard',          year: 'Dusk',    span: '' },
  { src: '/kingdom-aerial.jpg', title: 'Hills of Mbengwi',          year: 'Aerial',  span: 'md:col-span-2' },
]

export default function GalleryPage() {
  const gallery = getImageGallery()
  const albums  = gallery?.albums || []

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="pt-40 pb-12 text-center">
        <div className="section-label mb-4 animate-fade-up">VISUAL ARCHIVE</div>
        <h1 className="font-cinzel text-6xl uppercase leading-none text-gold-gradient md:text-8xl animate-fade-up" style={{ animationDelay: '0.15s' }}>Gallery</h1>
        <p className="mx-auto mt-6 max-w-2xl px-6 font-cormorant text-xl italic text-foreground/90 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          A kingdom photographed in firelight, dust, and golden hour.
        </p>
      </section>

      {/* ── HERO MASONRY (placeholder images) ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[220px]">
            {PLACEHOLDER_IMAGES.map((it, i) => (
              <figure key={i} className={`group relative overflow-hidden rounded-2xl border-gold shadow-card-royal ${it.span}`}>
                <Image src={it.src} alt={it.title} fill loading="lazy"
                       className="object-cover transition-transform duration-[2500ms] ease-out group-hover:scale-110" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-90" />
                <figcaption className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="section-label text-[0.6rem] mb-1">{it.year}</div>
                  <div className="font-cinzel text-lg text-foreground">{it.title}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── ALBUM GRID ── */}
      {albums.length > 0 && (
        <Reveal>
          <section className="mx-auto max-w-7xl px-6 pb-24">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <div className="section-label mb-2">IMAGE ALBUMS</div>
                <h2 className="font-cinzel text-4xl text-foreground">{albums.length} Event Albums</h2>
              </div>
              <Link href="/gallery/images" className="text-primary text-sm tracking-widest hover:underline">
                Browse all →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {albums.slice(0, 6).map((album: any) => (
                <Link key={album.id} href={`/gallery/images/${album.id}`}
                      className="group card-royal overflow-hidden block no-underline">
                  <div className="relative h-48 bg-card/50 pattern-royal overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-cinzel text-5xl text-foreground/10">
                        {(album.imageCount || 0).toString().padStart(2,'0')}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 text-[10px] tracking-widest text-primary font-cinzel">
                      {album.imageCount} photos
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gold-gradient" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm leading-snug">{album.title}</h3>
                    {album.date && (
                      <p className="text-muted-foreground text-xs mt-1">
                        {new Date(album.date).toLocaleDateString('en-GB', { month:'long', year:'numeric' })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ── VIDEO SECTION ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="rounded-2xl border-gold bg-card/30 p-8 text-center">
            <div className="section-label mb-4">VIDEO GALLERY</div>
            <h2 className="font-cinzel text-4xl text-foreground mb-4">Guneku on Video</h2>
            <p className="text-muted-foreground font-cormorant text-xl italic mb-6">
              Speeches, cultural events, and community life — full YouTube archive.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/gallery/videos" className="btn-royal inline-flex">Browse Videos</Link>
              <Link href="/gallery/images" className="btn-royal-outline inline-flex">Image Gallery</Link>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  )
}
