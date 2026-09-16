import Link from 'next/link'
import Image from 'next/image'
import {
  type Business, CATEGORY_LABEL, locationLabel, businessInitials, placeholderHue,
  resolveBusinessPeople,
} from '@/lib/businesses'

/* A business as it appears in the directory.
 *
 * The card has to survive four states and look deliberate in all of them: cover and logo,
 * logo only, cover only, neither. That is not an edge case to tidy up later — most of the
 * businesses the Fondom has recorded have no imagery at all yet, so the no-image state is the
 * ORDINARY state and was designed first.
 *
 * The answer is a generated placeholder: a warm wash in a hue derived from the business's own
 * slug, the village's hairline grid over it, and the initials set in the display face. It is
 * the same every time it renders, different from the card beside it, and it reads as a choice
 * rather than as a gap. Nothing is scraped to avoid it. */

/** The cover, or the designed stand-in for one.
 *
 *  `bare` renders the image and the placeholder WITHOUT the card's own 16:9 box. The detail
 *  hero supplies its own, wider box, and nesting two aspect-ratio containers made the inner
 *  one overflow the outer — which put the placeholder mark near the foot of the visible area
 *  instead of its middle, right where the business name sits.
 */
export function BusinessCover({ business, priority = false, bare = false }: {
  business: Business
  priority?: boolean
  bare?: boolean
}) {
  const hue = placeholderHue(business.slug)

  const inner = business.cover ? (
    <Image
      src={business.cover}
      alt=""
      fill
      sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw"
      priority={priority}
      className="object-cover"
    />
  ) : (
    /* Decorative: the name is the heading beside it, so announcing the initials again
       would only make a screen reader say the name twice. */
    <div
      className="biz-placeholder"
      style={{ ['--biz-hue' as string]: String(hue) }}
      aria-hidden="true"
    >
      <span className="biz-placeholder-mark">{businessInitials(business.name)}</span>
    </div>
  )

  return bare ? inner : <div className="biz-cover">{inner}</div>
}

/** The logo plate.
 *
 *  It renders NOTHING when the business has neither a logo nor a cover. With no cover the
 *  placeholder behind it is already showing the initials, and a plate repeating them an inch
 *  lower reads as a mistake rather than as a mark. With a real cover the plate earns its
 *  place: the initials stand in for a logo against a photograph.
 */
export function BusinessLogo({ business, size = 'card' }: {
  business: Business
  size?: 'card' | 'hero'
}) {
  if (!business.logo && !business.cover) return null
  const className = size === 'hero' ? 'biz-hero-logo' : 'biz-logo'

  return (
    <div className={className}>
      {business.logo ? (
        <Image
          src={business.logo}
          alt={`${business.name} logo`}
          width={size === 'hero' ? 176 : 112}
          height={size === 'hero' ? 176 : 112}
        />
      ) : (
        <span className="biz-logo-mark" aria-hidden="true">
          {businessInitials(business.name)}
        </span>
      )}
    </div>
  )
}

export function BusinessCard({ business, priority = false }: {
  business: Business
  priority?: boolean
}) {
  const place = locationLabel(business.location)
  const people = resolveBusinessPeople(business)
  /* Only a confirmed person is named on a card. A held relationship is real information and
     it belongs on the business's own page beside the sentence explaining it — not compressed
     into a chip where it would read as established. */
  const confirmed = people.find(p => !p.held)
  /* The body reserves room for the logo plate only when there is one to reserve it for. */
  const hasLogoPlate = Boolean(business.logo || business.cover)

  return (
    <article className="biz-card">
      <div className="relative">
        <BusinessCover business={business} priority={priority} />
        <BusinessLogo business={business} />
      </div>

      <div className={hasLogoPlate ? 'biz-body' : 'biz-body biz-body-flat'}>
        <p className="inst-tag">{CATEGORY_LABEL[business.category]}</p>

        <h3 className="inst-h3 mt-1.5 leading-snug">
          <Link
            href={`/businesses/${business.slug}`}
            className="biz-card-link no-underline hover:text-[var(--royal-green)]"
          >
            {business.name}
          </Link>
        </h3>

        {business.tagline && (
          <p className="inst-body mt-1.5 !text-[0.88rem] line-clamp-2">{business.tagline}</p>
        )}

        {/* Two chips at most. A card covered in tags is a card nobody reads. */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {place && <span className="biz-chip">{place}</span>}
          {confirmed && (
            <span className="biz-chip biz-chip-accent">{confirmed.relationshipLabel}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--rule)] pt-3 mt-4">
          {confirmed ? (
            <p className="inst-meta truncate">{confirmed.display}</p>
          ) : (
            <p className="inst-meta">A Guneku business</p>
          )}
          <span className="inst-link shrink-0 text-[0.8rem]">View business →</span>
        </div>
      </div>
    </article>
  )
}
