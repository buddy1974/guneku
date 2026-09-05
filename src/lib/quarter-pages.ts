import registry from '@/data/quarters/quarter-registry.json'
import { GUNEKU_QUARTERS_27 } from './quarters'

/* The quarter pages read from one curated registry, and the registry is checked against the
 * canonical list at module load. If the two ever drift — a quarter added to `quarters.ts`
 * without a page, or a page for a name not on the list — the build fails here rather than
 * quietly publishing a quarter the Fondom does not recognise, or quietly dropping one it
 * does. That is the whole reason this file exists rather than the pages reading the JSON
 * directly. */

export type QuarterLink = {
  href: string
  label: string
  kind: 'person' | 'people' | 'institution' | 'project' | 'update' | 'kingdom' | 'gallery'
  /** The sentence in the record that justifies the link. Rendered, not hidden: a reader can
   *  see why a record is attached to this quarter. */
  evidence: string
}

export type Quarter = {
  slug: string
  name: string
  note?: string
  links: QuarterLink[]
}

const QUARTERS = registry.quarters as Quarter[]

/* Load-time invariants. */
{
  /* Widened to string[]: the canonical list is `as const`, so its literal type would
     reject a comparison against the registry's plain strings. */
  const canonical: string[] = [...GUNEKU_QUARTERS_27]
  const registered = QUARTERS.map(q => q.name)

  const missing = canonical.filter(n => !registered.includes(n))
  const extra   = registered.filter(n => !canonical.includes(n))

  if (missing.length || extra.length) {
    throw new Error(
      'quarter-registry.json is out of step with GUNEKU_QUARTERS_27. ' +
      (missing.length ? `Missing pages for: ${missing.join(', ')}. ` : '') +
      (extra.length ? `Pages for names not on the canonical list: ${extra.join(', ')}. ` : '') +
      'Fix the registry, or change the canonical list only with a Palace source.',
    )
  }
  if (new Set(QUARTERS.map(q => q.slug)).size !== QUARTERS.length) {
    throw new Error('quarter-registry.json contains a duplicate slug.')
  }
}

/** All 27, in the canonical order of `GUNEKU_QUARTERS_27` rather than alphabetically —
 *  the list's own order is how the Fondom publishes it. */
export function allQuarters(): Quarter[] {
  const order = new Map<string, number>(([...GUNEKU_QUARTERS_27] as string[]).map((n, i) => [n, i]))
  return [...QUARTERS].sort((a, b) => (order.get(a.name) ?? 0) - (order.get(b.name) ?? 0))
}

export function getQuarter(slug: string): Quarter | null {
  return QUARTERS.find(q => q.slug === slug) ?? null
}

/** Quarters the archive actually says something about. Used for the index's ordering and to
 *  decide what belongs in the sitemap: a page with no content should not be offered to a
 *  search engine as though it had some. */
/** Find a quarter by its slug or by its canonical name. Contributions store the canonical
 *  name (which is what `GUNEKU_QUARTERS_27` holds and what the register validates against),
 *  while the pages are addressed by slug — this is the one place that bridges the two. */
export function getQuarterBySlugOrName(value: string): Quarter | null {
  const v = value.trim()
  return QUARTERS.find(q => q.slug === v)
    ?? QUARTERS.find(q => q.name.toLowerCase() === v.toLowerCase())
    ?? null
}

export function recordedQuarters(): Quarter[] {
  return allQuarters().filter(q => q.links.length > 0)
}

export function quarterMeta() {
  return registry.meta as {
    purpose: string
    updated: string
    canonicalSource: string
    linkRule: string
    emptyRule: string
  }
}
