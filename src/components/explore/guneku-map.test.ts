import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { mappableLocations, unmappedLocations } from '@/lib/explore'

/* The map on /explore, and the progressive enhancement it is supposed to be.
 *
 * ── The false alarm this exists to prevent ───────────────────────────────────────────────
 *
 * This map was reported as broken: /explore sat at "The map loads when you scroll to it" for
 * ever, on production and on a clean local build, with the holder fully inside the viewport
 * and `prefers-reduced-motion` false. It looked like a dead IntersectionObserver.
 *
 * It was not. The measurements were taken through CDP in a tab whose
 * `document.visibilityState` was `hidden`, and Chrome does not deliver IntersectionObserver
 * records — or run rAF — for a hidden document. An observer attached by hand to the very same
 * element did not fire either, which is what proved it: the page was fine, the instrument was
 * not. The moment a frame was forced, the observer fired, MapLibre loaded, and the map went to
 * `ready` with its single marker.
 *
 * So nothing here was changed. What follows pins the contract instead, because the next person
 * to measure this in a headless or backgrounded tab will see exactly the same thing and should
 * find this note before they start editing a component that works.
 *
 * ── Why it reads the source ──────────────────────────────────────────────────────────────
 *
 * The behaviour worth protecting lives in an effect, and this suite runs in node with no DOM
 * and no jsdom installed. Adding a DOM environment to assert on an effect that is already
 * verified against production would be a large dependency for a small gain, so the contract is
 * held at the source and the live behaviour is recorded in the commit that accompanies it. */

const MAP = readFileSync('src/components/explore/GunekuMap.tsx', 'utf-8')
const PAGE = readFileSync('src/app/explore/page.tsx', 'utf-8')

describe('the list is the page, and the map is an enhancement', () => {
  it('renders every place on the server, with no map involved', () => {
    /* The authoritative view. `mappableLocations` are the ones with a coordinate; the rest are
       listed rather than drawn, and both come from the server component. */
    const mapped = mappableLocations()
    const unmapped = unmappedLocations()
    expect(mapped.length + unmapped.length).toBeGreaterThan(10)
    /* The page lists places outside the map component. */
    expect(PAGE).toContain('locationsByType')
    expect(PAGE).toContain('unmappedLocations')
  })

  it('draws only places that actually have a position', () => {
    /* No invented coordinates: every mappable location carries one, and the count of markers
       the map can draw is exactly that. */
    for (const l of mappableLocations()) {
      expect(l.coordinate, l.name).toBeTruthy()
      expect(typeof l.coordinate!.lat).toBe('number')
      expect(typeof l.coordinate!.lng).toBe('number')
    }
    expect(unmappedLocations().every(l => !l.coordinate)).toBe(true)
  })

  it('renders nothing at all rather than an empty frame', () => {
    expect(MAP).toMatch(/if \(locations\.length === 0\) return null/)
  })
})

describe('the map loads when it is approached, and not before', () => {
  it('waits for the container to come near the viewport', () => {
    expect(MAP).toContain('new IntersectionObserver')
    expect(MAP).toMatch(/rootMargin:\s*'200px'/)
    expect(MAP).toMatch(/isIntersecting/)
  })

  it('stops observing once it has fired, so it loads once', () => {
    expect(MAP).toMatch(/io\.disconnect\(\);\s*void load\(\)/)
  })

  it('keeps the library out of the page bundle', () => {
    /* Dynamic, inside the load path. A static import would put a few hundred kilobytes of
       MapLibre in front of every reader of /explore, most of whom are on a throttled
       connection (R-008). */
    expect(MAP).toMatch(/await import\('maplibre-gl'\)/)
    expect(MAP).not.toMatch(/^import .*from 'maplibre-gl'/m)
  })

  it('tears the observer and the map down together', () => {
    expect(MAP).toMatch(/return \(\) => \{[^}]*io\.disconnect\(\)/)
    expect(MAP).toMatch(/map\?\.remove\(\)/)
  })
})

describe('every state the reader can end up in says something true', () => {
  it('shows that it is loading', () => {
    expect(MAP).toMatch(/setState\('loading'\)/)
    expect(MAP).toContain('Loading the map…')
  })

  it('reaches ready, and only then stops hiding itself from a screen reader', () => {
    expect(MAP).toMatch(/setState\('ready'\)/)
    expect(MAP).toMatch(/aria-hidden=\{state !== 'ready'\}/)
  })

  it('fails without taking the page with it', () => {
    expect(MAP).toMatch(/catch \{/)
    expect(MAP).toMatch(/setState\('failed'\)/)
    expect(MAP).toContain('The map could not load. Everything on it is in the list below.')
  })

  it('honours reduced motion deliberately, and says so to the reader', () => {
    expect(MAP).toMatch(/prefers-reduced-motion: reduce/)
    expect(MAP).toMatch(/setState\('skipped'\)/)
    expect(MAP).toContain('reduced motion')
  })
})

describe('the map cannot shift the layout when it arrives', () => {
  it('reserves its height before it loads', () => {
    /* The holder is sized by class, not by the map, so mounting MapLibre swaps a placeholder
       for a canvas inside a box that was already the right size. Measured on production at
       320/390/768/1024/1440/1920 with the map mounted: zero page-level overflow at each. */
    expect(MAP).toMatch(/h-\[22rem\]/)
    expect(MAP).toMatch(/sm:h-\[28rem\]/)
    expect(MAP).toMatch(/overflow-hidden/)
  })
})
