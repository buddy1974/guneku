import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { isActivePath } from './useCurrentPath'

/* The navigation, and the one place it is defined.
 *
 * ── Why this exists ──────────────────────────────────────────────────────────────────────
 *
 * Guneku had two navigations. `src/data/navigation.json` was read by the root layout and
 * passed to the header, and the header ignored it and rendered a hardcoded NAV of its own.
 * The two had already drifted — the JSON still filed the Business Directory under an
 * "Initiatives" menu the header does not have — and because the layout handed the file to a
 * client component, it was serialised into the flight payload and shipped to every visitor
 * on every page, to be read by nobody.
 *
 * That is worse than dead code. A second definition of the menu is something a careful
 * person edits in good faith, believing it will change the site. The file is gone, the prop
 * is gone, and this suite exists so that the menu cannot quietly acquire a second home again.
 *
 * ── Why it reads the source ──────────────────────────────────────────────────────────────
 *
 * `Header.tsx` is a client component holding React state; importing it into a node suite
 * would pull in hooks and Next's router for no gain. What is worth protecting is the
 * *content* of the menu — which destinations exist, and that each resolves to a real route —
 * and that is in the source as a literal. */

const HEADER = readFileSync('src/components/layout/Header.tsx', 'utf-8')
const LAYOUT = readFileSync('src/app/layout.tsx', 'utf-8')
const CONTENT = readFileSync('src/lib/content.ts', 'utf-8')

type NavItem = { href: string; label: string; exact?: boolean; children?: Array<{ href: string; label: string }> }

/** The NAV literal, taken out of the header's source and evaluated.
 *
 *  Evaluated rather than pattern-matched: it is a nested literal with comments in it, and a
 *  regular expression that walks it is a second thing to get wrong. The array is plain data
 *  — strings and booleans — and it is this repository's own source. */
const NAV: NavItem[] = (() => {
  const marker = 'const NAV: Item[] = ['
  const from = HEADER.indexOf(marker)
  if (from < 0) throw new Error('NAV not found in Header.tsx')
  /* The opening bracket of the array, not the one in the `Item[]` annotation before it. */
  const open = from + marker.length - 1
  let depth = 0
  let close = -1
  for (let i = open; i < HEADER.length; i++) {
    if (HEADER[i] === '[') depth++
    else if (HEADER[i] === ']') { depth--; if (depth === 0) { close = i; break } }
  }
  const literal = HEADER.slice(open, close + 1)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
  return new Function(`return (${literal})`)() as NavItem[]
})()

/** Every route the application actually builds a page for, read off the app directory. */
const ROUTES = (() => {
  const out = new Set<string>()
  const walk = (dir: string, route: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      if (entry.name.startsWith('(') || entry.name.startsWith('_') || entry.name === 'api') continue
      const seg = entry.name.startsWith('[') ? null : entry.name
      const next = seg === null ? null : `${route}/${seg}`
      const child = `${dir}/${entry.name}`
      if (next !== null) {
        if (existsSync(`${child}/page.tsx`)) out.add(next)
        walk(child, next)
      }
    }
  }
  if (existsSync('src/app/page.tsx')) out.add('/')
  walk('src/app', '')
  return out
})()

describe('there is one navigation, and it lives in the header', () => {
  it('found the menu to check', () => {
    expect(NAV.length).toBeGreaterThan(5)
  })

  it('keeps no second definition anywhere', () => {
    expect(existsSync('src/data/navigation.json')).toBe(false)
    expect(CONTENT).not.toContain('getNavigation')
    expect(CONTENT).not.toContain('navigation.json')
    expect(CONTENT).not.toMatch(/interface Navigation\b/)
  })

  it('is not handed to the header as a prop that the header ignores', () => {
    expect(LAYOUT).not.toContain('getNavigation')
    expect(LAYOUT).toContain('<Header />')
    expect(HEADER).not.toMatch(/HeaderProps|nav: _nav/)
  })
})

describe('the accepted menu', () => {
  /* The nine top-level destinations, in order. Changing this list is a product decision, so
     it should take a deliberate edit here rather than happening by accident. */
  const EXPECTED = [
    ['/', 'Home'],
    ['/fondom', 'The Fondom'],
    ['/palace', 'The Palace'],
    ['/indigenes', 'Our People'],
    ['/projects', 'Development'],
    ['/businesses', 'Businesses'],
    ['/gallery', 'Media'],
    ['/diaspora', 'Diaspora'],
    ['/contact', 'Contact'],
  ] as const

  it('carries exactly these tabs, in this order', () => {
    expect(NAV.map(i => [i.href, i.label])).toEqual(EXPECTED.map(e => [e[0], e[1]]))
  })

  it('keeps Businesses top-level, with one destination and no dropdown', () => {
    const biz = NAV.find(i => i.href === '/businesses')!
    expect(biz.label).toBe('Businesses')
    expect(biz.children ?? []).toEqual([])
    /* One canonical destination: it appears nowhere else in the menu, at any depth. */
    const everywhere = NAV
      .flatMap(i => [i.href, ...(i.children ?? []).map(c => c.href)])
      .filter(h => /business/i.test(h))
    expect([...new Set(everywhere)]).toEqual(['/businesses'])
  })

  it('sends every destination to a page this application builds', () => {
    for (const item of NAV) {
      expect(ROUTES.has(item.href), `${item.label} -> ${item.href}`).toBe(true)
      for (const { href: child } of item.children ?? []) {
        /* A child may be an article under a dynamic segment; those are covered by the
           production link crawl. What is checked here is that the parent route exists. */
        const parent = '/' + child.split('/').filter(Boolean)[0]
        expect(ROUTES.has(child) || ROUTES.has(parent), `child ${child}`).toBe(true)
      }
    }
  })

  it('lights the right tab, including on a page below it', () => {
    /* The convention is prefix matching, with Home exact so it does not light everywhere. */
    expect(isActivePath('/businesses', '/businesses', false)).toBe(true)
    expect(isActivePath('/businesses/magic-gate-enterprise', '/businesses', false)).toBe(true)
    expect(isActivePath('/diaspora', '/businesses', false)).toBe(false)
    expect(isActivePath('/businesses', '/', true)).toBe(false)
    expect(isActivePath('/', '/', true)).toBe(true)
    /* Before hydration nothing is active, which is what keeps the server and client trees
       identical. */
    expect(isActivePath(null, '/businesses', false)).toBe(false)
  })
})
