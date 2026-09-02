import Image from 'next/image'
import { cardImageFor } from '@/lib/archiveFallback'

type Props = {
  slug: string
  title: string
  featuredImage?: string | null
  /** Layout hint passed to next/image. */
  sizes?: string
  priority?: boolean
  className?: string
}

/* The image half of a Village Square card.
 *
 * With the record's own photograph: the photograph, captioned by its title
 * through alt text, exactly as before.
 *
 * Without one: a topic-matched photograph from the Guneku archive, chosen
 * deterministically from the record's slug, carrying an "Archive photo" mark
 * in the corner and empty alt text. The mark is the whole point — it is what
 * separates "a photograph on a card" from "a photograph of this event", and
 * it is why this is allowed to replace the blank plate at all. */
export function UpdateCardMedia({
  slug, title, featuredImage, sizes = '(max-width: 640px) 100vw, 25vw', priority = false, className = '',
}: Props) {
  const img = cardImageFor({ slug, title, featuredImage })

  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden bg-[var(--stone)] ${className}`}>
      <Image
        src={img.src}
        alt={img.alt}
        title={img.isFallback ? img.provenance : undefined}
        fill
        unoptimized
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      {img.isFallback && (
        <span
          className="pointer-events-none absolute bottom-0 left-0 bg-[color-mix(in_oklab,var(--ink-900)_78%,transparent)] px-2 py-[0.2rem] text-[0.58rem] font-bold uppercase tracking-[0.11em] text-white/90"
          /* Not aria-hidden: a screen-reader user needs this qualification
             more than a sighted one, since the image itself carries no alt. */
        >
          Archive photo
        </span>
      )}
    </div>
  )
}
