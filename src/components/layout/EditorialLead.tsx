import Image from 'next/image'

type Props = {
  /** Site-root-relative path to an approved photograph, or null. */
  src?: string | null
  /** What the photograph actually shows. Never the record title, never a filename. */
  alt?: string | null
  /** Where the photograph comes from, and — for a contextual image — what it is not. */
  caption?: string | null
  /** Category eyebrow used by the no-photo plate. */
  category?: string | null
}

/* One lead treatment for every editorial record.

   With a photograph: the image, plus its caption and provenance where the record
   carries them.

   Without one: a deliberate institutional plate rather than an empty slot or a beige
   rectangle. It uses the approved Guneku mark on paper, a green rule and an oxblood
   rule, and it says plainly that the archive holds no photograph — so it reads as a
   design decision and never as a photograph of the event. */
export function EditorialLead({ src, alt, caption, category }: Props) {
  if (src) {
    return (
      <figure className="m-0 mb-10">
        <div className="relative aspect-[16/9] w-full overflow-hidden border border-[var(--rule)] bg-[var(--stone)]">
          <Image src={src} alt={alt || ''} fill unoptimized priority
                 sizes="(max-width: 900px) 100vw, 900px" className="object-cover" />
        </div>
        {caption && (
          <figcaption className="mt-2 text-[0.78rem] leading-[1.6] text-[var(--ink-400)]">
            {caption}
          </figcaption>
        )}
      </figure>
    )
  }

  return (
    <div className="mb-10 border border-[var(--rule)] bg-[var(--paper-alt,oklch(0.952_0.008_85))]"
         role="presentation">
      <div className="flex items-center gap-5 px-6 py-7 sm:px-8">
        <span className="relative block h-14 w-14 shrink-0 opacity-90 sm:h-16 sm:w-16">
          <Image src="/brand/logo-128.png" alt="" fill sizes="64px" className="object-contain" unoptimized />
        </span>
        <span className="min-w-0">
          {category && (
            <span className="block text-[0.68rem] font-bold uppercase tracking-[0.09em] text-[var(--royal-green)]">
              {category}
            </span>
          )}
          <span className="mt-2 flex items-center gap-2" aria-hidden>
            <span className="block h-0.5 w-8 bg-[var(--royal-green)]" />
            <span className="block h-0.5 w-4 bg-[var(--oxblood)]" />
          </span>
          <span className="mt-2 block text-[0.8rem] leading-[1.6] text-[var(--ink-400)]">
            The Fondom archive holds no photograph for this record.
          </span>
        </span>
      </div>
    </div>
  )
}
