'use client'

import { useEffect, useRef, useState } from 'react'
import type { GunekuLocation } from '@/lib/explore'

/* The map. Everything about how it loads is shaped by who reads this site: a large share of
 * the audience is on a mid-range Android in Cameroon on a throttled connection, and MapLibre
 * is a few hundred kilobytes of JavaScript.
 *
 * So the map is not the page. The page is the list, rendered on the server, complete and
 * usable with no JavaScript at all. The map is an enhancement that arrives afterwards:
 *   - the library is imported dynamically, so it is not in the /explore bundle;
 *   - it loads only when the container scrolls into view;
 *   - it does not load at all if the reader prefers reduced motion — a panning, animating
 *     map is exactly what that preference is about — and they get the list, which was
 *     always the authoritative view anyway.
 *
 * Tiles are OpenStreetMap raster tiles with the required attribution. No Google imagery is
 * used, re-hosted or traced (R-010). */

type Props = { locations: GunekuLocation[] }

export function GunekuMap({ locations }: Props) {
  const holder = useRef<HTMLDivElement | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'skipped' | 'failed'>('idle')

  useEffect(() => {
    const el = holder.current
    if (!el || locations.length === 0) return

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setState('skipped')
      return
    }

    let cancelled = false
    let map: { remove(): void } | null = null

    const load = async () => {
      setState('loading')
      try {
        const maplibre = await import('maplibre-gl')
        if (cancelled) return

        const first = locations[0].coordinate!
        const instance = new maplibre.Map({
          container: el,
          /* Style defined inline rather than fetched from a provider, so the page needs no
             API key and no third-party style endpoint. */
          style: {
            version: 8,
            sources: {
              osm: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 19,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              },
            },
            layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
          },
          center: [first.lng, first.lat],
          zoom: 10,
          /* Keyboard panning and zooming stay on; this is a navigable control, not a picture. */
          attributionControl: { compact: false },
        })

        instance.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right')
        instance.addControl(new maplibre.ScaleControl({ unit: 'metric' }), 'bottom-left')

        for (const loc of locations) {
          const c = loc.coordinate
          if (!c) continue

          const pin = document.createElement('button')
          pin.type = 'button'
          pin.setAttribute('aria-label', `${loc.name} — open the record`)
          pin.style.cssText =
            'width:18px;height:18px;border-radius:50%;border:2.5px solid #fff;' +
            'background:oklch(0.320 0.060 158);cursor:pointer;padding:0;' +
            'box-shadow:0 1px 4px rgba(0,0,0,.4)'
          pin.onclick = () => { window.location.href = loc.publicUrl }

          new maplibre.Marker({ element: pin })
            .setLngLat([c.lng, c.lat])
            .setPopup(
              new maplibre.Popup({ offset: 14, closeButton: true }).setHTML(
                `<strong style="font-size:.92rem">${loc.name}</strong>` +
                (loc.precisionNote ? `<br><span style="font-size:.78rem;opacity:.8">${loc.precisionNote}</span>` : ''),
              ),
            )
            .addTo(instance)
        }

        map = instance
        setState('ready')
      } catch {
        /* A failed map is not a failed page. The list above it is the record. */
        if (!cancelled) setState('failed')
      }
    }

    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); void load() }
    }, { rootMargin: '200px' })
    io.observe(el)

    return () => { cancelled = true; io.disconnect(); map?.remove() }
  }, [locations])

  if (locations.length === 0) return null

  return (
    <div>
      <div
        ref={holder}
        /* Not a live region and not focusable: the map is supplementary, and the list is
           what a screen reader should read. */
        aria-hidden={state !== 'ready'}
        className="relative h-[22rem] w-full overflow-hidden border border-[var(--rule)] bg-[var(--stone)] sm:h-[28rem]"
      >
        {state !== 'ready' && (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-[0.86rem] text-[var(--ink-600)]">
            {state === 'loading' ? 'Loading the map…'
              : state === 'skipped' ? 'The map is not shown because your device asks for reduced motion. Everything on it is in the list below.'
              : state === 'failed'  ? 'The map could not load. Everything on it is in the list below.'
              : 'The map loads when you scroll to it.'}
          </p>
        )}
      </div>
      <p className="inst-meta mt-2">
        Base map © OpenStreetMap contributors, ODbL. One marker: Guneku itself. No other
        place in the record has a position to draw.
      </p>
    </div>
  )
}
