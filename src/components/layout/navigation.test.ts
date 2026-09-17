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

  it('leaves no principal page reachable from nowhere', () => {
    /* The Business Directory was built, accepted and unreachable: not in the header, not in
       the footer, not on the homepage. Fixing that one and looking again turned up three
       more of exactly the same shape — /explore, the map, linked from nothing at all, and
       /quarters and /institutions linked from one interior page each. All three sit in the
       sitemap at priority 0.8, which is the site declaring them important to a search engine
       while offering a reader no way in.

       So: every page the sitemap lists as a principal destination must be reachable from the
       header, the footer, or the index at the foot of the homepage. Interior and generated
       pages are not in scope here — the production link crawl covers those. */
    const sitemap = readFileSync('src/app/sitemap.ts', 'utf-8')
    const statics = [...sitemap.matchAll(/\bat\('(\/[a-z0-9/-]*)'/g)].map(m => m[1])

    const inNav = new Set(NAV.flatMap(i => [i.href, ...(i.children ?? []).map(c => c.href)]))
    const footer = readFileSync('src/components/layout/Footer.tsx', 'utf-8')
    const homepage = readFileSync('src/app/page.tsx', 'utf-8')

    /* Reached by any of: a menu entry, a footer link, the homepage index, or — for /search
       alone — the header's search box, which builds its destination as `/search?q=…`. */
    const linksTo = (source: string, route: string) =>
      source.includes(`'${route}'`) || source.includes(`"${route}"`) || source.includes(`${route}?`)

    const orphans = statics.filter(route => {
      if (route === '/') return false
      if (inNav.has(route)) return false
      if (linksTo(footer, route) || linksTo(homepage, route)) return false
      return !linksTo(HEADER, route)
    })
    expect(orphans).toEqual([])
  })

  it('opens its submenus without a mouse', () => {
    /* The submenus opened on `mouseenter` and on nothing else. The desktop bar shows from
       1280px and an iPad Pro in landscape is 1366px, so a touch visitor on a large tablet
       met a menu that could not be opened at all — tapping the parent simply navigated away
       — and a keyboard visitor was in the same position, with an `aria-expanded` on a link
       describing a state they had no way to change.

       Now: the link still goes to the section, a real button beside it opens the list, and
       hover is an enhancement for pointers that actually hover. */
    expect(HEADER).toMatch(/<button\s+type="button"/)
    expect(HEADER).toMatch(/aria-expanded=\{openMenu === item\.label\}/)
    expect(HEADER).toMatch(/aria-controls=\{`nav-/)
    expect(HEADER).toMatch(/onClick=\{\(\) => setOpenMenu\(/)
    /* aria-expanded must not be left on the link, which cannot toggle anything. */
    expect(HEADER).not.toMatch(/aria-expanded=\{item\.children \? openMenu/)
  })

  it('treats hover as an enhancement rather than the mechanism', () => {
    expect(HEADER).toContain('useCanHover')
    expect(HEADER).toMatch(/onMouseEnter=\{\(\) => canHover &&/)
    expect(HEADER).toMatch(/onMouseLeave=\{\(\) => canHover &&/)
    const hook = readFileSync('src/components/layout/useCurrentPath.ts', 'utf-8')
    expect(hook).toContain('(hover: hover) and (pointer: fine)')
    /* Server and hydrating render must agree, and "no hover" is the safe first answer
       because it is the one that renders the button. */
    expect(hook).toContain('useSyncExternalStore')
  })

  it('can be dismissed the two ways anything dismissible is dismissed', () => {
    expect(HEADER).toMatch(/e\.key === 'Escape'/)
    expect(HEADER).toContain("addEventListener('pointerdown'")
    /* Bound only while a menu is open, and removed with it. */
    expect(HEADER).toContain("removeEventListener('pointerdown'")
    expect(HEADER).toContain("removeEventListener('keydown'")
  })

  it('gives the drawer a readable measure on a tablet', () => {
    /* This drawer carries the whole menu from 768px to 1279px — every iPad, portrait and
       landscape — because the desktop bar only appears at 1280. Measured at 1022px each row
       was 990px wide, which put a section's name at the far left of the glass and the
       chevron that opens it almost a thousand pixels away.

       Constrained to 40rem and centred: phones below that are untouched (measured 397px
       rows at 390), tablets get a 640px column (measured 608px rows at 768, 1024 and
       1180). */
    expect(HEADER).toMatch(/aria-label="Mobile"/)
    const nav = HEADER.slice(HEADER.indexOf('aria-label="Mobile"') - 200, HEADER.indexOf('aria-label="Mobile"') + 40)
    expect(nav).toContain('mx-auto')
    expect(nav).toContain('max-w-[40rem]')
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
