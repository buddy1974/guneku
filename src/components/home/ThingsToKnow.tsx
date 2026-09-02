import Link from 'next/link'
import Image from 'next/image'
import facts from '@/data/home/village-facts.json'
import gallery from '@/data/gallery/image-gallery.json'

/* Photographs come from approved albums and are matched to subject, never to fill a
   slot. A card with no defensible photograph is typeset instead — the section reads as
   an editorial spread either way. */
const CARD_IMAGE: Record<string, { album: string; index: number; alt: string }> = {
  people: {
    album: 'mchibe-mta-event-guneku2023', index: 4,
    alt: 'People of Guneku in Meta regalia at the Mɨchi Ǝbeŋ festival.',
  },
  palace: {
    album: 'the-returnof-fon-fomuki', index: 12,
    alt: 'The Palace grounds at Guneku with the thatched roofs of the compound behind the assembly.',
  },
  crafts: {
    album: 'mukonge-dance-groupsin-meta', index: 1,
    alt: 'A Mukonge dance group performing in Meta dress.',
  },
}

function pictureFor(id: string) {
  const m = CARD_IMAGE[id]
  if (!m) return null
  const album = gallery.albums.find(a => a.id === m.album)
  const img = album?.images?.[m.index]
  return img ? { src: img.publicPath, alt: m.alt } : null
}

export function ThingsToKnow() {
  const cards = facts.thingsToKnow

  return (
    <section className="inst-rule border-b border-[var(--rule)]" aria-labelledby="know-heading">
      <div className="inst-wrap inst-sec">
        <p className="inst-eyebrow">The village</p>
        <h2 id="know-heading" className="inst-h2 mt-1.5">Things to know about Guneku</h2>
        <p className="inst-body mt-2 max-w-2xl">
          Drawn from the village record kept by the Fondom. Where the record is silent,
          so is this page.
        </p>

        <div className="mt-6 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(c => {
            const pic = pictureFor(c.id)
            return (
              <article key={c.id} className="inst-card flex h-full flex-col overflow-hidden">
                {pic && (
                  <div className="relative aspect-[16/10] w-full bg-[var(--stone)]">
                    <Image src={pic.src} alt={pic.alt} fill unoptimized loading="lazy"
                           sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                           className="object-cover" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="inst-h3">{c.title}</h3>
                  <p className="inst-body mt-2 flex-1 !text-[0.88rem]">{c.body}</p>
                  {c.href && (
                    <Link href={c.href} className="inst-link mt-3">Read the record →</Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
