'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'

/* One image inside a frame the parent has already sized.
 *
 * Two jobs the server components cannot do on their own:
 *
 *   A picture that fails to load is replaced by `fallback` — the designed placeholder for a
 *   cover, nothing at all for a gallery tile — instead of leaving a broken-image icon on a
 *   card. Curated files are checked by a test; a registered business's cover is a URL its
 *   owner typed, and that can go away at any time.
 *
 *   `fit="contain"` shows a poster or a banner whole, over a blurred copy of itself, so the
 *   frame is filled without cutting the poster's own words in half. Both layers request the
 *   same optimised URL, so the browser fetches it once.
 *
 * A registered business's image lives on somebody else's host, which the image optimiser is
 * not configured to fetch from. Those are passed through unoptimised rather than failing. */

export function FramedImage({
  src, alt, sizes, priority = false, fit, position, className, fallback = null, backdrop = true,
}: {
  src: string
  alt: string
  sizes: string
  priority?: boolean
  fit?: 'contain'
  position?: string
  className?: string
  fallback?: ReactNode
  /** Contained images only. A logo sits on its own plate and needs no blurred copy. */
  backdrop?: boolean
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return <>{fallback}</>

  const unoptimized = /^https?:\/\//i.test(src)
  const common = { src, sizes, unoptimized, onError: () => setFailed(true) }

  if (fit === 'contain') {
    return (
      <>
        {backdrop && <Image {...common} alt="" aria-hidden="true" fill className="biz-img-backdrop" />}
        <Image {...common} alt={alt} fill priority={priority} className={`biz-img-contain ${className ?? ''}`} />
      </>
    )
  }

  return (
    <Image
      {...common}
      alt={alt}
      fill
      priority={priority}
      className={`biz-img-cover ${className ?? ''}`}
      style={position ? { objectPosition: position } : undefined}
    />
  )
}
