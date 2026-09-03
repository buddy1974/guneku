import data from '@/data/explore/locations.json'

/* The places of Guneku, and the discipline around them.
 *
 * The single rule this module enforces: a location reaches the map only if it has a
 * coordinate from a source. Everything else reaches the list. There is deliberately no
 * function that "estimates", "centres" or "falls back to the village" — an approximate pin
 * is not a rougher truth about where a health centre is, it is a false statement about it,
 * and on a village map read by the people who live there it would be obvious and insulting. */

export type Coordinate = { lat: number; lng: number }

export type LocationType =
  | 'village' | 'palace' | 'health' | 'market' | 'river'
  | 'institution' | 'project' | 'school' | 'church'

export type GunekuLocation = {
  id: string
  name: string
  type: LocationType
  coordinate: Coordinate | null
  /** Only meaningful when a coordinate exists. */
  precision?: string
  precisionNote?: string
  source?: string
  /** Why there is no coordinate. Rendered to the reader. */
  reason?: string
  publicUrl: string
  description: string
  quarter?: string | null
}

export type OmittedLayer = { what: string; why: string }

const LOCATIONS = data.locations as GunekuLocation[]

export const TYPE_LABEL: Record<LocationType, string> = {
  village:     'The village',
  palace:      'Palace',
  health:      'Health',
  market:      'Market',
  river:       'River and water',
  institution: 'Institution',
  project:     'Development',
  school:      'School',
  church:      'Church',
}

/** Everything, in the order the record lists it. */
export function allLocations(): GunekuLocation[] {
  return LOCATIONS
}

/** The only locations that may be drawn. A coordinate must be a finite pair inside
 *  plausible bounds for the North West Region — a guard against a transposed lat/lng or a
 *  stray zero silently placing Guneku in the Gulf of Guinea. */
export function mappableLocations(): GunekuLocation[] {
  return LOCATIONS.filter(l => {
    const c = l.coordinate
    if (!c) return false
    const ok = Number.isFinite(c.lat) && Number.isFinite(c.lng)
      && c.lat > 3 && c.lat < 14 && c.lng > 8 && c.lng < 17
    if (!ok) {
      console.error(`explore: ${l.id} has a coordinate outside Cameroon; not drawn.`)
      return false
    }
    return true
  })
}

/** Locations with no recorded position. These are the list, and the list is not a
 *  second-class view — for most of Guneku it is the only honest one. */
export function unmappedLocations(): GunekuLocation[] {
  return LOCATIONS.filter(l => !l.coordinate)
}

export function locationsByType(): Array<{ type: LocationType; items: GunekuLocation[] }> {
  const order: LocationType[] = [
    'village', 'palace', 'health', 'market', 'river', 'institution', 'project', 'school', 'church',
  ]
  return order
    .map(type => ({ type, items: LOCATIONS.filter(l => l.type === type) }))
    .filter(g => g.items.length > 0)
}

export function omittedLayers(): OmittedLayer[] {
  return data.omitted as OmittedLayer[]
}

export function exploreMeta() {
  return data.meta as {
    purpose: string
    updated: string
    coordinateRule: string
    state: string
    attribution: string
  }
}
