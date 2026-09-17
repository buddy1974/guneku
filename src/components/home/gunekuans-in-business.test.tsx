import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import type { ReactElement } from 'react'
import { GunekuansInBusiness } from './GunekuansInBusiness'
import { publicBusinessesForDisplay } from '@/lib/business-directory'
import { curatedBusinesses, getCuratedBusiness } from '@/lib/businesses'

/* The Business Directory on the front page.
 *
 * ── Why this exists ──────────────────────────────────────────────────────────────────────
 *
 * The directory was built, production-accepted, and invisible. The homepage linked to it
 * nowhere, and the header did not carry it at all, so the only way a visitor reached it was
 * by already knowing it was there. Every test in the directory's own suite passed throughout.
 * That is the failure worth guarding: not that a feature was broken, but that a finished one
 * could not be found.
 *
 * ── Why it renders the real component against the real records ───────────────────────────
 *
 * With no database configured — which is every run of this suite — `publicBusinessesForDisplay`
 * catches the connection failure and returns the curated half alone. So this exercises the
 * real source the real page uses, and the held business is held for the real reason rather
 * than because a fixture said so.
 *
 * The suite has no DOM. React elements are plain objects, so the returned tree is walked
 * directly; nothing here needs rendering to HTML to answer the questions being asked. */

type Node = ReactElement<Record<string, unknown>> | string | number | null | undefined | Node[]

function walk(node: Node, visit: (el: ReactElement<Record<string, unknown>>) => void): void {
  if (node === null || node === undefined || typeof node === 'boolean') return
  if (Array.isArray(node)) { node.forEach(n => walk(n, visit)); return }
  if (typeof node !== 'object') return
  const el = node as ReactElement<Record<string, unknown>>
  visit(el)
  walk((el.props?.children ?? null) as Node, visit)
}

/** Every `href` in the tree, in document order. */
function hrefs(tree: Node): string[] {
  const out: string[] = []
  walk(tree, el => { if (typeof el.props?.href === 'string') out.push(el.props.href) })
  return out
}

/** All the literal text in the tree, flattened. */
function text(tree: Node): string {
  let out = ''
  walk(tree, el => {
    const kids = el.props?.children
    const push = (c: unknown) => { if (typeof c === 'string' || typeof c === 'number') out += ' ' + c }
    if (Array.isArray(kids)) kids.forEach(push)
    else push(kids)
  })
  return out.replace(/\s+/g, ' ').trim()
}

const SOURCE = readFileSync('src/components/home/GunekuansInBusiness.tsx', 'utf-8')
const HOMEPAGE = readFileSync('src/app/page.tsx', 'utf-8')
const HEADER = readFileSync('src/components/layout/Header.tsx', 'utf-8')

const tree = (await GunekuansInBusiness()) as Node
const published = await publicBusinessesForDisplay()

/** The slugs actually handed to a card in the preview. */
const previewed: string[] = (() => {
  const out: string[] = []
  walk(tree, el => {
    const b = el.props?.business as { slug?: unknown } | undefined
    if (b && typeof b.slug === 'string') out.push(b.slug)
  })
  return out
})()

/** Everything the section renders or hands onward, for absence checks. */
const rendered = JSON.stringify(hrefs(tree)) + ' ' + previewed.join(' ') + ' ' + text(tree)

describe('the homepage says the Business Directory exists', () => {
  it('renders a section at all', () => {
    expect(tree).not.toBeNull()
  })

  it('is on the homepage, above the half-way mark of its narrative', () => {
    expect(HOMEPAGE).toContain('<GunekuansInBusiness />')
    /* Placement is the whole point of the fix, so it is asserted rather than left to a
       reviewer's memory: it comes before the sections it was in danger of being buried
       under. Community economy sits at 50% of a 10,776px page; below that is not found. */
    const here = HOMEPAGE.indexOf('<GunekuansInBusiness />')
    for (const later of ['<CommunityEconomy />', '<ThingsToKnow />', '<DiscoverGuneku />']) {
      expect(HOMEPAGE.indexOf(later), later).toBeGreaterThan(here)
    }
  })

  it('carries the primary call to action, resolving to the directory', () => {
    expect(text(tree)).toContain('Explore Gunekuan businesses')
    expect(hrefs(tree)).toContain('/businesses')
  })

  it('offers a way to see all of them, not only the preview', () => {
    expect(text(tree)).toContain('View all businesses')
    /* Two distinct routes into the directory: the button and the tail link. */
    expect(hrefs(tree).filter(h => h === '/businesses').length).toBeGreaterThanOrEqual(2)
  })
})

describe('the preview shows real public businesses and nothing else', () => {
  it('draws on the same source the directory itself uses', () => {
    /* The safety argument is that there is no second dataset to drift. Asserted at the
       import, because a future edit that reaches for the curated list directly — or for the
       database — is exactly the change that would let a held record onto the front page. */
    expect(SOURCE).toContain("from '@/lib/business-directory'")
    expect(SOURCE).toContain('publicBusinessesForDisplay')
    expect(SOURCE).not.toMatch(/curatedBusinesses\b/)
    expect(SOURCE).not.toMatch(/from '@\/lib\/db\//)
  })

  it('hardcodes no business', () => {
    for (const b of curatedBusinesses()) {
      expect(SOURCE, b.slug).not.toContain(b.slug)
      expect(SOURCE, b.name).not.toContain(b.name)
    }
  })

  it('previews a restrained number of them, each a published business', () => {
    /* Read off the `business` handed to each card rather than off a rendered href: the card
       is the directory's own component and is not expanded here, and what it is *given* is
       the thing this section is actually responsible for. Where those records then link is
       the card's business, and the directory's suite already holds it to that. */
    expect(previewed.length).toBeGreaterThanOrEqual(3)
    expect(previewed.length).toBeLessThanOrEqual(4)
    expect(new Set(previewed).size).toBe(previewed.length)
    for (const slug of previewed) {
      expect(published.some(b => b.slug === slug), slug).toBe(true)
    }
  })

  it('cannot show a held business, because the source cannot return one', () => {
    for (const b of published) expect(b.status, b.slug).toBe('public')
    const held = curatedBusinesses().filter(b => b.status !== 'public')
    expect(held.length).toBeGreaterThan(0)
    for (const b of held) {
      expect(rendered, b.slug).not.toContain(b.slug)
      expect(rendered, b.name).not.toContain(b.name)
    }
  })

  it("keeps Vicky and Son's off the front page", () => {
    /* Named, because it is the one held record today and the one a careless "show the first
       few businesses" would surface. Its owner is unknown and nobody has been invented. */
    const vicky = getCuratedBusiness('vicky-and-sons')!
    expect(vicky.status).toBe('held')
    expect(vicky.people ?? []).toEqual([])
    const lower = rendered.toLowerCase()
    expect(lower).not.toContain('vicky')
    expect(lower).not.toContain(vicky.tagline!.toLowerCase())
  })

  it('publishes no contact detail on the front page', () => {
    for (const b of curatedBusinesses()) {
      for (const v of [b.contact?.phone, b.contact?.email].filter(Boolean) as string[]) {
        expect(rendered, `${b.slug} ${v}`).not.toContain(v)
      }
    }
    expect(rendered).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]{2,}/)
    expect(rendered).not.toMatch(/wa\.me\//i)
  })

  it('states the count rather than asserting a number of its own', () => {
    expect(SOURCE).toContain('businesses.length')
    expect(text(tree)).toContain(`${published.length} businesses`)
  })
})

describe('the owner invitation uses the door that already exists', () => {
  it('points at the established registration route', () => {
    expect(text(tree)).toContain('Are you a Gunekuan business owner?')
    expect(text(tree)).toContain('Add your business')
    expect(hrefs(tree)).toContain('/my-guneku/businesses/new')
  })

  it('builds no second submission form', () => {
    expect(SOURCE).not.toMatch(/<form|onSubmit|useState|'use client'/)
  })

  it('weakens no authorization contract', () => {
    /* The homepage links to the door; it is not a key. The route behind it still demands an
       approved claim on a name in the register, which a Clerk account alone does not give. */
    const auth = readFileSync('src/lib/business-auth.ts', 'utf-8')
    expect(auth).toContain('requireVerifiedGunekuan')
    expect(auth).toMatch(/profile_claims/)
    expect(auth).toMatch(/approved/)
    const createRoute = readFileSync('src/app/api/businesses/route.ts', 'utf-8')
    expect(createRoute).toContain('requireVerifiedGunekuan')
    /* The page checks to be kind — it tells a person plainly rather than showing them a
       form that refuses them at the end — and the API checks to be true. Both must stay. */
    const newPage = readFileSync('src/app/my-guneku/businesses/new/page.tsx', 'utf-8')
    expect(newPage).toContain('optionalVerifiedGunekuan')
    expect(newPage).toMatch(/verified Gunekuans/i)
  })
})

describe('the navigation carries Businesses as a destination of its own', () => {
  const nav = JSON.parse(readFileSync('src/data/navigation.json', 'utf-8')) as {
    mainNav: Array<{ label: string; href: string; children?: Array<{ href: string }> }>
  }

  it('is a top-level entry in the header', () => {
    /* The header renders one NAV constant for the desktop bar and the mobile drawer alike,
       so a single entry serves both. */
    expect(HEADER).toMatch(/\{\s*href:\s*'\/businesses',\s*label:\s*'Businesses'\s*\}/)
  })

  it('names it exactly once, so there is one canonical destination', () => {
    const occurrences = HEADER.split("'/businesses'").length - 1
    expect(occurrences).toBe(1)

    const top = nav.mainNav.filter(i => i.href === '/businesses')
    expect(top).toHaveLength(1)
    const nested = nav.mainNav.flatMap(i => i.children ?? []).filter(c => c.href === '/businesses')
    expect(nested).toEqual([])
  })

  it('does not invent a second business landing route', () => {
    const all = [...nav.mainNav, ...nav.mainNav.flatMap(i => i.children ?? [])]
    const businessish = all.map(i => i.href).filter(h => /business/i.test(h))
    expect([...new Set(businessish)]).toEqual(['/businesses'])
  })
})
