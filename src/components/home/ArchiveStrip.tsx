import Link from 'next/link'
import Image from 'next/image'
import gallery from '@/data/gallery/image-gallery.json'

/* A window on the archive, not a slideshow.

   The selection is deterministic, curated, and rotates by the day — the same for every
   visitor on a given day, never re-shuffling under someone mid-read. Only the fifteen
   approved public albums are eligible; the unindexed folders held under R-007 are not
   reachable from this data at all, because it reads the album manifest rather than the
   filesystem. Every image links back to the album it belongs to, so nothing appears
   without its context. */

/* Albums whose photographs are people-heavy in ways the archive has not captioned are
   left out: this strip shows the village, not unnamed individuals. */
const ELIGIBLE = [
  'thetonmukom-windikroadwork',
  'developmentprojects',
  'guneku-royal-community-library',
  'mchibe-mta-event-guneku2023',
  'mukonge-dance-groupsin-meta',
  'the-returnof-fon-fomuki',
]

/* Seeded once per render worker rather than per call, so the component body stays pure
   and the selection cannot change while somebody is reading the page. The homepage
   revalidates hourly, so the window moves through the archive over time. */
const SEED = Math.floor(Date.now() / 86_400_000)

export function ArchiveStrip() {
  const seed = SEED

  const picks = ELIGIBLE
    .map(id => gallery.albums.find(a => a.id === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a) && a!.images.length > 0)
    .slice(0, 5)
    .map((album, i) => {
      const img = album.images[(seed + i * 7) % album.images.length]
      return { album, img }
    })

  if (picks.length === 0) return null

  return (
    <section className="inst-rule border-b border-[var(--rule)]" aria-labelledby="archive-heading">
      <div className="inst-wrap inst-sec">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inst-eyebrow">From the Guneku archive</p>
            <h2 id="archive-heading" className="inst-h2 mt-1.5">Fifteen albums, 338 photographs</h2>
          </div>
          <Link href="/gallery/images" className="inst-btn inst-btn-quiet">Open the gallery</Link>
        </div>

        <ul className="mt-6 grid list-none gap-3 p-0 grid-cols-2 md:grid-cols-5">
          {picks.map(({ album, img }) => (
            <li key={album.id}>
              <Link href={`/gallery/images/${album.id}`} className="group block no-underline">
                <div className="relative aspect-[4/5] w-full overflow-hidden border border-[var(--rule)] bg-[var(--stone)]">
                  <Image
                    src={img.publicPath}
                    alt={
                      [img.caption, img.title].find(
                        x => typeof x === 'string' && x.trim() && !x.trim().startsWith('{')
                      ) || `${album.title} — photograph from the Guneku Fondom archive`
                    }
                    fill unoptimized loading="lazy"
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover"
                  />
                </div>
                <p className="inst-meta mt-2 line-clamp-2 group-hover:text-[var(--royal-green)]">
                  {album.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
