import Link  from 'next/link'
import Image from 'next/image'
import { getImageGallery, albumCoverSrc } from '@/lib/content'
import { Reveal }          from '@/components/ui/Reveal'

export const metadata = {
  alternates: { canonical: '/gallery' },
  description: "The Guneku Fondom visual archive — fifteen event albums of 338 photographs, and the video record of the Fondom's own YouTube channel.", title: 'Gallery — Faces of Guneku' }

const SHOWCASE_IMAGES = [
  /* Subtitles carry only what a source supports. The '17 January 2016 coronation'
     formerly shown here matches no record in the archive and has been withdrawn. */
  { src: '/images/site/palace-grounds.jpg',    title: 'The Palace Grounds',        year: 'Guneku Palace', span: 'md:col-span-2 md:row-span-2' },
  { src: '/images/site/fon-coronation-2016.jpg',title: 'HRH Fon Fomuki Walters Ticha IX', year: 'The reigning Fon', span: '' },
  { src: '/images/site/notable-portrait.jpg',  title: 'A Notable of Guneku',       year: 'Guneku', span: '' },
  { src: '/images/site/michi-ebeng.jpg',       title: 'Mɨchi Ɗbeŋ Festival',           year: 'Guneku, 2023',     span: '' },
  { src: '/images/site/kingdom-hills.jpg',     title: 'The Palace and the Momo Hills', year: 'Momo Division', span: 'md:col-span-2' },
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
          The Guneku archive — coronation, festival, palace and diaspora, photographed by the community.
        </p>
      </section>

      {/* ── HERO MASONRY (placeholder images) ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[220px]">
            {SHOWCASE_IMAGES.map((it, i) => (
              <figure key={i} className={`group relative overflow-hidden rounded-[3px] border border-border ${it.span}`}>
                <Image src={it.src} alt={it.title} fill loading="lazy"
                       className="object-cover" unoptimized />
                <div className="absolute inset-0" style={{ background: 'oklch(0.215 0.045 158 / 0.55)' }} />
                <figcaption className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-[0.62rem] font-bold uppercase tracking-[0.07em] mb-1" style={{ color: 'oklch(0.975 0.010 85)' }}>{it.year}</div>
                  <div className="font-[family-name:var(--font-display)] text-[1.02rem] font-semibold" style={{ color: 'oklch(0.975 0.010 85)' }}>{it.title}</div>
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
                    {albumCoverSrc(album) ? (
                      <Image src={albumCoverSrc(album)!} alt={album.title} fill unoptimized
                             loading="lazy" sizes="(max-width: 768px) 100vw, 33vw"
                             className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-cinzel text-5xl text-foreground/10">
                          {(album.imageCount || 0).toString().padStart(2,'0')}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-card border border-border px-2 py-0.5 text-[10px] tracking-widest text-primary font-cinzel">
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
