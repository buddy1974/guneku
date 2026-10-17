import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { FramedImage } from './FramedImage'
import {
  type Business, CATEGORY_LABEL, locationLabel, businessInitials, placeholderHue,
  resolveBusinessPeople,
} from '@/lib/businesses'

/* A business as it appears in the directory.
 *
 * The card has to survive four states and look deliberate in all of them: cover and logo,
 * logo only, cover only, neither. Every curated business now has a supplied cover, but a
 * registered one may arrive with nothing, and a cover URL its owner typed may stop working —
 * so the no-image state is still designed, and a failed image falls back to it rather than
 * to a broken-image icon.
 *
 * The stand-in is a generated placeholder: a warm wash in a hue derived from the business's
 * own slug, the village's hairline grid over it, and the initials set in the display face. It
 * is the same every time it renders, different from the card beside it, and it reads as a
 * choice rather than as a gap. Nothing is scraped to avoid it. */

function Placeholder({ business }: { business: Business }) {
  /* Decorative: the name is the heading beside it, so announcing the initials again would
     only make a screen reader say the name twice. */
  return (
    <div
      className="biz-placeholder"
      style={{ ['--biz-hue' as string]: String(placeholderHue(business.slug)) }}
      aria-hidden="true"
    >
      <span className="biz-placeholder-mark">{businessInitials(business.name)}</span>
    </div>
  )
}

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
  const inner = business.cover ? (
    /* Decorative here: the business name is the card's heading, and the cover only shows
       what the name already says. */
    <FramedImage
      src={business.cover}
      alt=""
      sizes={bare ? '(max-width: 72rem) 100vw, 72rem' : '(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 26rem'}
      priority={priority}
      fit={business.imagery?.coverFit}
      position={business.imagery?.coverPosition}
      fallback={<Placeholder business={business} />}
    />
  ) : (
    <Placeholder business={business} />
  )

  return bare ? inner : <div className="biz-cover">{inner}</div>
}

/** The logo plate.
 *
 *  It renders NOTHING when the business has neither a logo nor a cover. With no cover the
 *  placeholder behind it is already showing the initials, and a plate repeating them an inch
 *  lower reads as a mistake rather than as a mark. With a real cover the plate earns its
 *  place: the initials stand in for a logo against a photograph.
 *
 *  The plate takes the logo's own proportions — a wordmark gets a wide plate, a square mark
 *  a square one — within limits, so no logo is shrunk into a postage stamp or clipped.
 */
export function BusinessLogo({ business, size = 'card' }: {
  business: Business
  size?: 'card' | 'hero'
}) {
  if (!business.logo && !business.cover) return null
  const fill = business.imagery?.logoFit === 'cover'
  const aspect = fill ? 1 : (business.imagery?.logoAspect ?? 1)
  const className = [
    size === 'hero' ? 'biz-hero-logo' : 'biz-logo',
    fill ? 'biz-logo-fill' : '',
  ].join(' ').trim()

  const mark = (
    <span className="biz-logo-mark" aria-hidden="true">
      {businessInitials(business.name)}
    </span>
  )

  return (
    <div className={className} style={{ ['--logo-ar' as string]: String(aspect) }}>
      {business.logo ? (
        <FramedImage
          src={business.logo}
          alt={`${business.name} logo`}
          sizes="256px"
          fit={fill ? undefined : 'contain'}
          backdrop={false}
          className="biz-logo-img"
          fallback={mark}
        />
      ) : mark}
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
     into a line where it would read as established. */
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

        <h3 className="inst-h3 biz-card-title">
          <Link href={`/businesses/${business.slug}`} className="biz-card-link">
            {business.name}
          </Link>
        </h3>

        {place && (
          <p className="biz-card-place">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{place}</span>
          </p>
        )}

        {business.tagline && (
          <p className="biz-card-tagline">{business.tagline}</p>
        )}

        <div className="biz-card-foot">
          <div className="min-w-0">
            {confirmed ? (
              <>
                <p className="biz-card-person">{confirmed.display}</p>
                <p className="inst-meta">{confirmed.relationshipLabel}</p>
              </>
            ) : (
              <p className="inst-meta">A Guneku business</p>
            )}
          </div>
          {/* The card's one link is the name above; this is its visible cue, not a second
              link, so a keyboard user tabs through one stop per business. */}
          <span className="biz-card-action" aria-hidden="true">
            View business <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  )
}
