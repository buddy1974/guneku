import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import {
  abs, prune, graph, organizationNode, websiteNode, gunekuPlaceNode,
  breadcrumbNode, webPageNode, personNode, profileNode, bodyNode,
  businessNode, guneccullNode, articleNode,
  ORG_ID, WEBSITE_ID, PLACE_ID, GUNECCUL_ID, personId, businessId,
} from './schema'
import { SITE_URL } from './seo'
import { allFoundingNames, allBodies } from './community'
import { publicCuratedBusinesses, curatedBusinesses } from './businesses'

/* The entity graph, and the one rule it has to keep.
 *
 * Every value in it must come from a record the site already publishes. That is not a thing a
 * unit test can prove in general, so these tests go after the specific ways it would be
 * broken: a schema slot filled to satisfy the schema, a held record leaking, a contact detail
 * given for one purpose republished for another, a number nobody supplied. */

const ALL_NODES = graph(
  organizationNode(), websiteNode(), gunekuPlaceNode(),
  ...allFoundingNames().slice(0, 30).map(n => personNode(n)),
  ...publicCuratedBusinesses().map(b => businessNode(b)),
  guneccullNode(),
)
const AS_TEXT = JSON.stringify(ALL_NODES)

describe('a node carries what a record holds, and stops', () => {
  it('emits no empty property at all', () => {
    /* `prune` exists so that a missing field is absent rather than null, '' or []. An empty
       value in structured data is a claim that the thing has no value, which is different
       from not knowing. */
    expect(AS_TEXT).not.toMatch(/:(null|""|\[\])/)
  })

  it('drops an object that turns out to be empty', () => {
    expect(prune({ a: undefined, b: { c: null } })).toBeUndefined()
    expect(prune({ a: 1, b: '' })).toEqual({ a: 1 })
    expect(prune([1, undefined, ''])).toEqual([1])
    /* Zero and false are values, not absences. */
    expect(prune({ n: 0, f: false })).toEqual({ n: 0, f: false })
  })

  it('states every URL on the canonical host', () => {
    for (const u of AS_TEXT.match(/https?:\/\/[^"]+/g) ?? []) {
      if (u.startsWith(SITE_URL)) continue
      /* The only outside URLs are ones a record publishes: a business's own site, the
         Fondom's own social channels. Never a preview host. */
      expect(u).not.toMatch(/vercel\.app|localhost|127\.0\.0\.1|guneku\.org/)
    }
    expect(abs('/')).toBe(SITE_URL)
    expect(abs('/palace')).toBe(`${SITE_URL}/palace`)
  })
})

describe('the three nodes everything else hangs from', () => {
  it('keeps the institution, the site and the village as three things', () => {
    const ids = [ORG_ID, WEBSITE_ID, PLACE_ID]
    expect(new Set(ids).size).toBe(3)
    expect(organizationNode()['@id']).toBe(ORG_ID)
    expect(websiteNode()['@id']).toBe(WEBSITE_ID)
    expect(gunekuPlaceNode()['@id']).toBe(PLACE_ID)
    expect(gunekuPlaceNode()['@type']).toBe('Place')
  })

  it('takes the village from the Fondom’s own record, not from a lookup', () => {
    const config = JSON.parse(readFileSync('src/data/site-config.json', 'utf-8'))
    const place = gunekuPlaceNode() as Record<string, any>
    expect(place.geo.latitude).toBe(config.coordinates.lat)
    expect(place.geo.longitude).toBe(config.coordinates.lng)
    expect(place.description).toContain(String(config.gunekuSOF.quarters))
    expect(place.description).toContain(config.gunekuSOF.location.division)
  })

  it('says nothing about Njindom, which is a different village', () => {
    expect(AS_TEXT).not.toContain('Njindom')
  })

  it('publishes the Palace number and not the Palace address', () => {
    /* The institutional email is published once, on /contact. The root layout renders on
       every page, so an `email` here would publish it three hundred times. */
    const org = organizationNode() as Record<string, any>
    expect(org.telephone).toBe('+237 681 19 46 64')
    expect(org.email).toBeUndefined()
  })
})

describe('a breadcrumb describes a path that exists', () => {
  const crumbs = breadcrumbNode('/indigenes/founding/x', [
    { name: 'Our People', path: '/indigenes' },
  ]) as Record<string, any>

  it('starts at Home and numbers from one', () => {
    expect(crumbs.itemListElement[0].name).toBe('Home')
    expect(crumbs.itemListElement[0].item).toBe(SITE_URL)
    expect(crumbs.itemListElement.map((x: any) => x.position)).toEqual([1, 2])
  })

  it('is linked from the page it belongs to, by id', () => {
    const page = webPageNode({
      path: '/indigenes/founding/x', name: 'X',
      trail: [{ name: 'Our People', path: '/indigenes' }],
    }) as Record<string, any>
    expect(page.breadcrumb['@id']).toBe(crumbs['@id'])
    expect(page.isPartOf['@id']).toBe(WEBSITE_ID)
  })

  it('carries no breadcrumb where a page declares no trail', () => {
    expect((webPageNode({ path: '/x', name: 'X' }) as Record<string, any>).breadcrumb)
      .toBeUndefined()
  })
})

describe('a person is described the way the register describes them', () => {
  const names = allFoundingNames()

  it('says only what the entry holds', () => {
    for (const n of names) {
      const p = personNode(n) as Record<string, any>
      expect(p.name).toBe(n.display)
      expect(p['@id']).toBe(personId(n.slug))
      if (!n.profession) expect(p.jobTitle).toBeUndefined()
      if (!n.residence) expect(p.homeLocation).toBeUndefined()
      if (!n.body) expect(p.memberOf).toBeUndefined()
      /* The register publishes no photograph, no date of birth and no contact detail. */
      for (const forbidden of ['image', 'birthDate', 'email', 'telephone', 'address']) {
        expect(p[forbidden], `${n.slug}.${forbidden}`).toBeUndefined()
      }
    }
  })

  it('never turns an association into ownership', () => {
    /* The directory distinguishes an owner from someone merely associated; schema.org has
       no property that draws that line, so the graph draws none. */
    const withBusiness = personNode(names[0], ['maxpromo-digital']) as Record<string, any>
    expect(withBusiness.affiliation).toEqual([{ '@id': businessId('maxpromo-digital') }])
    expect(withBusiness.owns).toBeUndefined()
    expect(withBusiness.founder).toBeUndefined()
  })

  it('leaves a published profile’s email and telephone out', () => {
    /* Both are in the record. They were given so the Fondom could make contact. */
    const p = profileNode({
      slug: 'marcel-tabit-akwe', name: 'Marcel Tabit Akwe',
      jobTitle: 'Software Developer', location: 'Essen, Germany',
      company: 'MaxPromo Digital', companyUrl: 'https://maxpromo.digital',
    }) as Record<string, any>
    expect(p.email).toBeUndefined()
    expect(p.telephone).toBeUndefined()
    expect(p.worksFor.name).toBe('MaxPromo Digital')
  })

  it('gives every body a node under its own route', () => {
    for (const b of allBodies()) {
      const node = bodyNode(b.id, b.name, b.standfirst) as Record<string, any>
      expect(node.url).toBe(abs(`/people/${b.id}`))
      expect(node.parentOrganization['@id']).toBe(ORG_ID)
    }
  })
})

describe('a business is described without a claim the directory cannot support', () => {
  const nodes = publicCuratedBusinesses().map(b => businessNode(b))

  it('invents no rating, review, price or opening hour', () => {
    const text = JSON.stringify(nodes)
    for (const invented of ['aggregateRating', 'review', 'priceRange', 'openingHours',
                            'foundingDate', 'numberOfEmployees', 'makesOffer']) {
      expect(text, invented).not.toContain(invented)
    }
  })

  it('publishes a telephone or an email only where the owner published one', () => {
    for (const b of publicCuratedBusinesses()) {
      const n = businessNode(b) as Record<string, any>
      expect(n.telephone ?? undefined).toBe(b.contact?.phone ?? undefined)
      expect(n.email ?? undefined).toBe(b.contact?.email ?? undefined)
    }
  })

  it('keeps a held business out entirely', () => {
    const held = curatedBusinesses().filter(b => b.status !== 'public')
    expect(held.length).toBeGreaterThan(0)
    const text = JSON.stringify(nodes)
    for (const b of held) {
      expect(text, b.slug).not.toContain(b.slug)
      expect(text, b.name).not.toContain(b.name)
    }
  })

  it('never resolves the Fondom Studios location conflict on a machine’s behalf', () => {
    /* The sources disagree — a street in Guneku, a listing in Bamenda — and the record says
       so rather than choosing. The node carries the Fondom's own town and no street. */
    const b = publicCuratedBusinesses().find(x => x.slug === 'fondom-studios')!
    const n = businessNode(b) as Record<string, any>
    expect(n.address.addressLocality).toBe('Guneku')
    expect(n.address.streetAddress).toBeUndefined()
    expect(JSON.stringify(n)).not.toContain('Bamenda')
  })

  it('links only people the directory has reconciled', () => {
    for (const b of publicCuratedBusinesses()) {
      const reconciled = (b.people ?? []).filter(p => p.personSlug).map(p => p.personSlug!)
      const n = businessNode(b, reconciled) as Record<string, any>
      expect((n.member ?? []).length).toBe(reconciled.length)
      /* A held name is a name nobody has matched to anybody. It is not an identity. */
      for (const p of b.people ?? []) {
        if (!p.personSlug && p.heldName) {
          expect(JSON.stringify(n)).not.toContain(p.heldName)
        }
      }
    }
  })
})

describe('the credit union is the thinnest node in the file', () => {
  const n = guneccullNode() as Record<string, any>

  it('is a credit union with the name its own record carries', () => {
    expect(n['@type']).toBe('BankOrCreditUnion')
    expect(n['@id']).toBe(GUNECCUL_ID)
    const rec = JSON.parse(readFileSync('src/data/institutions/guneccul.json', 'utf-8'))
    expect(n.name).toBe(rec.name)
    expect(n.alternateName).toBe(rec.abbreviation)
    expect(n.location.length).toBe(rec.branches.length)
  })

  it('states no rate, identifier, product, hour or telephone', () => {
    const text = JSON.stringify(n)
    for (const invented of ['interestRate', 'leiCode', 'identifier', 'feesAndCommissions',
                            'openingHours', 'telephone', 'makesOffer', 'currenciesAccepted',
                            'amount', 'loanTerm']) {
      expect(text, invented).not.toContain(invented)
    }
    /* The WhatsApp number in the record is a chat channel, not a line to ring. */
    expect(text).not.toContain('675994599')
  })
})

describe('an article carries no byline nobody wrote', () => {
  it('omits the author where the record holds none', () => {
    const a = articleNode({ path: '/palace/x', headline: 'X' }) as Record<string, any>
    expect(a.author).toBeUndefined()
    expect(a.publisher['@id']).toBe(ORG_ID)
    expect(a.datePublished).toBeUndefined()
  })

  it('does not date an undated record to today', () => {
    const a = articleNode({ path: '/palace/x', headline: 'X' }) as Record<string, any>
    expect(a.dateModified).toBeUndefined()
  })
})

describe('every page that declares a graph declares the same URL twice', () => {
  it('passes PageGraph the path its canonical uses', () => {
    /* The canonical and the `@id` of the page node must be the same string. They are written
       in two places in a page, which is exactly the kind of pair that drifts. */
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = `${dir}/${e.name}`
        if (e.isDirectory()) { walk(p); continue }
        if (e.name !== 'page.tsx') continue
        const src = readFileSync(p, 'utf-8')
        if (!src.includes('<PageGraph')) continue
        const canonical = src.match(/path: ?(`[^`]+`|'[^']+')/)?.[1]
        const declared = src.match(/<PageGraph[\s\S]*?path=\{?(`[^`]+`|"[^"]+"|'[^']+')/)?.[1]
        if (!canonical || !declared) { offenders.push(`${p}: could not read both`); continue }
        if (canonical.replace(/['"`]/g, '') !== declared.replace(/['"`]/g, '')) {
          offenders.push(`${p}: ${canonical} vs ${declared}`)
        }
      }
    }
    walk('src/app')
    expect(offenders).toEqual([])
  })
})
