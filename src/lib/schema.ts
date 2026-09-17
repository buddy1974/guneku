import config from '@/data/site-config.json'
import { PALACE_PHONE } from './palace-contact'
import { SITE_URL, SITE_NAME } from './seo'
import { getBody, type FoundingName } from './community'
import guneccul from '@/data/institutions/guneccul.json'
import type { Business, BusinessCategory, BusinessLocation } from './businesses'

/* The entity graph — what this site says it is, in a form a machine can read.
 *
 * ── The one rule ─────────────────────────────────────────────────────────────────────────
 *
 * Every value in every node below comes from a record this site already publishes on a page
 * a reader can open. Nothing here is asserted because a schema has a slot for it. There are
 * no coordinates that were looked up, no founding dates that were reasoned out, no opening
 * hours, no ratings, no reviews, no financial products beyond the three GUNECCUL's own
 * record names, and no telephone number that is not the institutional one already printed in
 * the footer of every page. Where a record is silent the property is simply absent, which is
 * what `prune` is for: an empty node is better than a furnished guess.
 *
 * ── Why one graph and not a dozen scripts ────────────────────────────────────────────────
 *
 * The site had two nodes — an Organization and a WebSite — emitted from the root layout, and
 * nothing else. Every page therefore looked to a machine like an untitled document belonging
 * to an organisation, with no indication of what it was about. The nodes here give each page
 * a WebPage with a trail, and attach it to the thing it describes: the village, a person, a
 * business, the credit union.
 *
 * They share `@id`s, which is the whole point of a graph. `#organization` is declared once in
 * the layout and referred to by every page after it; a person's page and the business page
 * that names them point at each other by id rather than each describing the other from one
 * side. Duplicated descriptions are how a graph starts contradicting itself. */

export type Node = Record<string, unknown>

/** An absolute URL for a site-root-relative path. */
export const abs = (path: string): string =>
  path === '/' ? SITE_URL : `${SITE_URL}${path}`

export const ORG_ID = `${SITE_URL}#organization`
export const WEBSITE_ID = `${SITE_URL}#website`
/** Guneku the place, as distinct from the Fondom the institution. */
export const PLACE_ID = `${SITE_URL}#guneku`
export const GUNECCUL_ID = `${SITE_URL}/guneccul#organization`

export const pageId = (path: string) => `${abs(path)}#webpage`
export const crumbId = (path: string) => `${abs(path)}#breadcrumb`
export const personId = (slug: string) => `${abs(`/indigenes/founding/${slug}`)}#person`
export const businessId = (slug: string) => `${abs(`/businesses/${slug}`)}#organization`
export const bodyId = (id: string) => `${abs(`/people/${id}`)}#organization`

/** A reference to another node, by id. */
const ref = (id: string) => ({ '@id': id })

/** Drops every empty value, recursively. A property the record does not hold is not emitted
 *  as null, as '' or as [] — it is not emitted. */
export function prune<T>(value: T): T {
  if (Array.isArray(value)) {
    const out = value.map(prune).filter(v => v !== undefined)
    return (out.length ? out : undefined) as T
  }
  if (value && typeof value === 'object') {
    const out: Node = {}
    for (const [k, v] of Object.entries(value as Node)) {
      const p = prune(v)
      if (p !== undefined) out[k] = p
    }
    return (Object.keys(out).length ? out : undefined) as T
  }
  if (value === null || value === '' || value === undefined) return undefined as T
  return value
}

/** Wraps nodes in the document every page emits. */
export function graph(...nodes: Array<Node | undefined | null>): Node {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean).map(n => prune(n as Node)).filter(Boolean),
  }
}

/* ── The two nodes the whole site hangs from ────────────────────────────────────────────── */

export function organizationNode(): Node {
  const social = Object.values(config.socialLinks ?? {}).filter(Boolean)
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-512.png`,
    description: config.siteDescription,
    /* The Palace number of record, already printed in the footer of every page. The
       institutional email is deliberately absent: it is published once, on /contact, and
       putting it in the root layout would publish it three hundred times. */
    telephone: PALACE_PHONE,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Mbengwi',
      addressRegion: 'North West Region',
      addressCountry: 'CM',
    },
    /* The Fondom's own public channels, and nothing else. */
    sameAs: social,
    /* The institution is of the place; they are not the same entity and are not merged. */
    areaServed: ref(PLACE_ID),
  }
}

export function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: ref(ORG_ID),
    inLanguage: 'en-GB',
  }
}

/* ── Guneku, the village ──────────────────────────────────────────────────────────────────
 *
 * Every figure below is from `gunekuSOF` in site-config.json — the Fondom's own source of
 * fact, recorded 2026-09-01 and already published on /fondom. The coordinates are the ones
 * the record carries and the map draws; none was looked up. Njindom is a separate village and
 * appears nowhere in this node. */
export function gunekuPlaceNode(): Node {
  const sof = config.gunekuSOF
  const geo = config.coordinates
  return {
    '@type': 'Place',
    '@id': PLACE_ID,
    name: 'Guneku',
    alternateName: 'Guneku Fondom',
    description:
      `A village of ${sof.quarters} quarters in ${sof.location.subdivision}, `
      + `${sof.location.division}, ${sof.location.region}, Cameroon — `
      + `${sof.standing} of the ${sof.clan} clan.`,
    url: `${SITE_URL}/fondom`,
    geo: geo ? { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng } : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: sof.location.subdivision,
      addressRegion: sof.location.region,
      addressCountry: 'CM',
    },
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: sof.location.division,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: sof.location.region,
        containedInPlace: { '@type': 'Country', name: 'Cameroon' },
      },
    },
  }
}

/* ── Per-page nodes ─────────────────────────────────────────────────────────────────────── */

export type Crumb = { name: string; path: string }

/** The trail a reader walked to reach a page. Home is added here so no caller repeats it. */
export function breadcrumbNode(path: string, trail: Crumb[]): Node {
  const all: Crumb[] = [{ name: 'Home', path: '/' }, ...trail]
  return {
    '@type': 'BreadcrumbList',
    '@id': crumbId(path),
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  }
}

type PageInput = {
  path: string
  name: string
  description?: string
  /** The entity this page is about, by id — a person, a business, the village. */
  about?: string
  /** The entity this page is the primary description of, when it is one. */
  primaryEntity?: string
  image?: string
  datePublished?: string | null
  dateModified?: string | null
  trail?: Crumb[]
}

export function webPageNode(p: PageInput): Node {
  return {
    '@type': 'WebPage',
    '@id': pageId(p.path),
    url: abs(p.path),
    name: p.name,
    description: p.description,
    isPartOf: ref(WEBSITE_ID),
    inLanguage: 'en-GB',
    about: p.about ? ref(p.about) : undefined,
    mainEntity: p.primaryEntity ? ref(p.primaryEntity) : undefined,
    primaryImageOfPage: p.image ? { '@type': 'ImageObject', url: abs(p.image) } : undefined,
    datePublished: p.datePublished || undefined,
    dateModified: p.dateModified || undefined,
    breadcrumb: p.trail ? ref(crumbId(p.path)) : undefined,
  }
}

/** A page and its trail together, which is how every page uses them. */
export function pageNodes(p: PageInput): Node[] {
  const nodes: Node[] = [webPageNode(p)]
  if (p.trail) nodes.push(breadcrumbNode(p.path, p.trail))
  return nodes
}

/* ── People ───────────────────────────────────────────────────────────────────────────────
 *
 * A register entry holds a name, an office, and sometimes a profession, a residence country
 * and a body. That is the whole of what goes in. No photograph, no birth date, no town, no
 * employer, no contact details — the page says none of that has been offered, and a machine
 * reading gets exactly the same answer a reader does.
 *
 * `affiliation` carries the link to a business rather than `owner` or `founder`. The record
 * distinguishes an owner from someone merely associated with a business, schema.org has no
 * property that draws that line, and the wrong side of it would be an invention. So the graph
 * records that the two entities are connected and leaves the nature of the connection to the
 * page, which states it in words and shows the evidence. */
export function personNode(n: FoundingName, businessSlugs: string[] = []): Node {
  const body = n.body ? getBody(n.body) : null
  return {
    '@type': 'Person',
    '@id': personId(n.slug),
    name: n.display,
    alternateName: n.aliases?.length ? n.aliases : undefined,
    url: abs(`/indigenes/founding/${n.slug}`),
    /* The traditional office, which is what the register records. It is not a job. */
    description: n.role || undefined,
    jobTitle: n.profession || undefined,
    /* A country, never a town. The register publishes no personal address (ADR-082). */
    homeLocation: n.residence ? { '@type': 'Place', name: n.residence } : undefined,
    memberOf: body ? ref(bodyId(body.id)) : undefined,
    affiliation: businessSlugs.length ? businessSlugs.map(s => ref(businessId(s))) : undefined,
  }
}

/* A published profile under /sons-and-daughters.
 *
 * Different from a register entry and treated differently. This is a profile the person gave
 * the Fondom for publication, so it carries a photograph, a city and a trade, and all three
 * are already on the page. What it does not carry is the email address and telephone number
 * the record also holds: those were given so the Fondom could reach them, and a machine-
 * readable copy on every crawl is not what was agreed to. The page publishes what the person
 * chose to publish; the graph publishes less. */
export function profileNode(p: {
  slug: string
  name: string
  jobTitle?: string
  description?: string
  image?: string | null
  location?: string
  company?: string
  companyUrl?: string
  businessSlugs?: string[]
}): Node {
  return {
    '@type': 'Person',
    '@id': `${abs(`/sons-and-daughters/${p.slug}`)}#person`,
    name: p.name,
    url: abs(`/sons-and-daughters/${p.slug}`),
    jobTitle: p.jobTitle,
    description: p.description,
    image: p.image ? abs(p.image) : undefined,
    homeLocation: p.location ? { '@type': 'Place', name: p.location } : undefined,
    worksFor: p.company
      ? { '@type': 'Organization', name: p.company, url: p.companyUrl }
      : undefined,
    affiliation: p.businessSlugs?.length
      ? p.businessSlugs.map(s => ref(businessId(s)))
      : undefined,
  }
}

/** A governing body — the Traditional Council, a GUDECA executive. */
export function bodyNode(id: string, name: string, description?: string): Node {
  return {
    '@type': 'Organization',
    '@id': bodyId(id),
    name,
    url: abs(`/people/${id}`),
    description,
    parentOrganization: ref(ORG_ID),
    areaServed: ref(PLACE_ID),
  }
}

/* ── Businesses ───────────────────────────────────────────────────────────────────────────
 *
 * The type comes from the category the record itself carries and from nothing cleverer. A
 * business with a recorded town is a LocalBusiness; the three specialised types below are the
 * schema.org names for categories this directory already uses in those words, so naming them
 * restates the record rather than adding to it. Anything else is a plain Organization, which
 * claims least.
 *
 * Deliberately absent, for every business: ratings, reviews, prices, opening hours, founding
 * dates, employee counts, and any telephone or email the owner has not published on the page.
 * A held business is not here at all — `publicCuratedBusinesses()` is the gate, the same one
 * the directory page uses. */
const SCHEMA_TYPE: Partial<Record<BusinessCategory, string>> = {
  'laboratory-diagnostics': 'DiagnosticLab',
  'medical-practice': 'MedicalBusiness',
  'retail-commerce': 'Store',
}

function postalAddress(loc?: BusinessLocation): Node | undefined {
  if (!loc) return undefined
  /* Only the structured fields. Where a record's prose notes an unresolved second location —
     Fondom Studios, whose sources disagree between Guneku and Bamenda — the conflict is left
     exactly as the page leaves it: the Fondom's own town, no street, and nothing chosen
     between on a machine's behalf. */
  return {
    '@type': 'PostalAddress',
    streetAddress: loc.address,
    addressLocality: loc.city,
    addressCountry: loc.country,
  }
}

export function businessNode(b: Business, personSlugs: string[] = []): Node {
  const type = SCHEMA_TYPE[b.category] ?? (b.location?.city ? 'LocalBusiness' : 'Organization')
  const links = Object.values(b.links ?? {}).filter(Boolean)
  return {
    '@type': type,
    '@id': businessId(b.slug),
    name: b.name,
    alternateName: b.aliases?.length ? b.aliases : undefined,
    url: abs(`/businesses/${b.slug}`),
    description: b.description || b.tagline || undefined,
    address: postalAddress(b.location),
    areaServed: b.serviceAreas?.length
      ? b.serviceAreas.map(a => ({ '@type': 'Place', name: a }))
      : undefined,
    /* What the owner says the business does. A list of services is not an offer with a
       price, and none is stated. */
    knowsAbout: b.services?.length ? b.services : undefined,
    /* The business's own site and public channels, as the record holds them. */
    sameAs: links.length ? links : undefined,
    /* Published only where the owner published it on the page. */
    telephone: b.contact?.phone || undefined,
    email: b.contact?.email || undefined,
    logo: b.logo ? abs(b.logo) : undefined,
    member: personSlugs.length ? personSlugs.map(s => ref(personId(s))) : undefined,
  }
}

/* ── GUNECCUL ─────────────────────────────────────────────────────────────────────────────
 *
 * A credit union is the one entity on this site where an invented fact would do real harm, so
 * this node is the thinnest in the file. Name, abbreviation, what its own record says it
 * does, the branches it records, and the Fondom as its parent. No rates, no interest figures,
 * no regulatory or cooperative registration number, no LEI, no opening hours and no
 * membership terms. No `telephone` either: the page offers a wa.me link, which is a chat
 * channel, and `telephone` would assert a number somebody can ring. */
export function guneccullNode(): Node {
  return {
    '@type': 'BankOrCreditUnion',
    '@id': GUNECCUL_ID,
    name: guneccul.name,
    alternateName: guneccul.abbreviation,
    url: `${SITE_URL}/guneccul`,
    description: guneccul.description,
    parentOrganization: ref(ORG_ID),
    areaServed: ref(PLACE_ID),
    location: (guneccul.branches ?? []).map(br => ({
      '@type': 'Place',
      name: br.name,
      address: { '@type': 'PostalAddress', addressLocality: br.location, addressCountry: 'CM' },
    })),
  }
}

/* ── Articles ─────────────────────────────────────────────────────────────────────────────
 *
 * An Article needs a date and an author, and the archive does not always have either. A
 * migrated Palace article carries no byline, and inventing one — "Guneku Fondom", say — would
 * be putting a name to somebody else's writing. So the publisher is the Fondom, which is
 * true, `author` is emitted only where the record holds one, and a piece with no date carries
 * no date rather than today's. */
export function articleNode(a: {
  path: string
  headline: string
  description?: string
  image?: string | null
  datePublished?: string | null
  dateModified?: string | null
  author?: string | null
}): Node {
  return {
    '@type': 'Article',
    '@id': `${abs(a.path)}#article`,
    headline: a.headline,
    description: a.description,
    url: abs(a.path),
    mainEntityOfPage: ref(pageId(a.path)),
    image: a.image ? abs(a.image) : undefined,
    datePublished: a.datePublished || undefined,
    dateModified: a.dateModified || a.datePublished || undefined,
    author: a.author ? { '@type': 'Person', name: a.author } : undefined,
    publisher: ref(ORG_ID),
    isPartOf: ref(WEBSITE_ID),
    inLanguage: 'en-GB',
  }
}
