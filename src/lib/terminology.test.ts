import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import sitemap from '@/app/sitemap'
import { search } from './search-index'
import { ask } from './palace-knowledge'
import { aiSources } from './ai-sources'

/* Guneku is a Fondom, led by a Fon.
 *
 * "Kingdom" was the migrated site's word and never the institution's own. The owner settled
 * it on 2026-09-07: **Fondom** is the current institutional term everywhere the site speaks
 * in its own voice.
 *
 * The exception matters as much as the rule. Where "kingdom" is somebody else's word — a
 * tribute written by a mourning Fon, a country's name, a title YouTube gave a video — it
 * stays exactly as recorded. Editing evidence to match current terminology is falsifying it,
 * and this archive has spent a lot of effort not doing that. */

const READ = (p: string) => readFileSync(p, 'utf-8')

/* Every file the site renders from, minus the ones that hold somebody else's words. */
const VERBATIM = [
  'src/data/palace/tributes.json',      // tributes from North West Fons, quoted
  'src/data/pages/tributes.json',       // the legacy copy of the same
  'src/data/gallery/video-discovered.json', // YouTube's own titles
]

function sourceFiles(): string[] {
  const out: string[] = []
  const stack = ['src']
  while (stack.length) {
    const dir = stack.pop()!
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = `${dir}/${e.name}`
      if (e.isDirectory()) { stack.push(full); continue }
      if (!/\.(ts|tsx|json)$/.test(e.name)) continue
      if (/\.test\.tsx?$/.test(e.name)) continue
      if (VERBATIM.includes(full)) continue
      out.push(full)
    }
  }
  return out
}

describe('the current institution is the Fondom', () => {
  it('says Kingdom nowhere the site speaks in its own voice', () => {
    const offenders: string[] = []
    for (const f of sourceFiles()) {
      let text = READ(f)
      /* Comments stripped from code. Several files explain in prose what the old word was
         and why an exception exists, and a check that matched that prose would fail on the
         very sentence documenting the rule. JSON has no comments and is read whole. */
      if (/\.tsx?$/.test(f)) {
        text = text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
      }
      text = text
        /* The country, which is not the institution. */
        .replace(/United Kingdom/gi, ' ')
        /* An image filename. Renaming a public asset changes a URL and no terminology. */
        .replace(/kingdom-hills\.jpg/g, ' ')
        /* A search keyword, matched and never displayed — see the test below. */
        .replace(/'kingdom'/g, ' ')
      for (const m of text.match(/kingdom/gi) ?? []) offenders.push(`${f}: ${m}`)
    }
    expect(offenders).toEqual([])
  })

  it('keeps the tributes exactly as they were written', () => {
    /* "a smooth transition in the kingdom of Guneku" and "admit you into his kingdom of
       everlasting glory" — one about Guneku, one about heaven, both other people's words
       at a funeral. Neither is ours to edit. */
    const t = READ('src/data/palace/tributes.json')
    expect(t).toContain('a smooth transition in the kingdom of Guneku')
    expect(t).toContain('his kingdom of everlasting glory')
  })

  it('keeps the country and the provider title as recorded', () => {
    expect(READ('src/data/institutions/gudeca-eu.json')).toContain('United Kingdom')
    expect(READ('src/data/gallery/video-discovered.json')).toContain('A Living Kingdom')
  })
})

describe('the route is /fondom', () => {
  it('serves the section from src/app/fondom, and no longer from src/app/kingdom', () => {
    expect(existsSync('src/app/fondom/page.tsx')).toBe(true)
    expect(existsSync('src/app/kingdom')).toBe(false)
    expect(existsSync('src/data/fondom')).toBe(true)
    expect(existsSync('src/data/kingdom')).toBe(false)
  })

  it('redirects the old path permanently, parent and children', () => {
    const cfg = READ('next.config.ts')
    for (const rule of [
      "{ source: '/kingdom',",
      "{ source: '/kingdom/:slug*',",
      "{ source: '/index.php/kingdom',",
    ]) {
      expect(cfg).toContain(rule)
    }
    /* Permanent, so a search engine moves its ranking across rather than starting again. */
    const block = cfg.slice(cfg.indexOf("source: '/kingdom'"))
    expect(block.slice(0, 600)).toContain('permanent: true')
  })

  it('sweeps no unrelated retired route into /fondom to dodge a 404', () => {
    const cfg = READ('next.config.ts')
    expect(cfg).not.toMatch(/source: '\/:path\*'[\s\S]{0,120}destination: '\/fondom/)
  })

  it('lists /fondom in the sitemap and /kingdom nowhere', () => {
    const urls = sitemap().map(e => String(e.url))
    expect(urls).toContain('https://www.guneku.org/fondom')
    expect(urls.filter(u => /\/kingdom(\/|$)/.test(u))).toEqual([])
    /* And the article children moved with it. */
    expect(urls.some(u => u.startsWith('https://www.guneku.org/fondom/'))).toBe(true)
  })

  it('canonicalises the section on /fondom', () => {
    expect(READ('src/app/fondom/page.tsx')).toContain("canonical: '/fondom'")
    expect(READ('src/app/fondom/[slug]/page.tsx')).toContain('`/fondom/${slug}`')
  })
})

describe('every surface uses the current word', () => {
  it('navigates to the Fondom', () => {
    for (const f of ['src/components/layout/Header.tsx',
                     'src/components/layout/Footer.tsx',
                     'src/data/navigation.json']) {
      const t = READ(f)
      expect(t).toContain('The Fondom')
      expect(t).toContain('/fondom')
    }
  })

  it('answers with Fondom in Ask Guneku', () => {
    const r = ask('How many quarters does Guneku have?')
    expect(r.answered).toBe(true)
    expect(r.answer).toContain('Fondom page')
    expect(r.answer).not.toMatch(/kingdom/i)
    expect(JSON.stringify(r.links)).not.toMatch(/\/kingdom/)
  })

  it('cites /fondom rather than /kingdom in the AI source boundary', () => {
    const urls = aiSources().map(s => s.url)
    expect(urls.filter(u => u.startsWith('/kingdom'))).toEqual([])
    expect(urls.some(u => u.startsWith('/fondom'))).toBe(true)
  })

  it('indexes the section under /fondom, and still finds it by the old word', () => {
    const hrefs = search('guneku', 200).groups.flatMap(g => g.results.map(r => r.href))
    expect(hrefs.filter(h => h.startsWith('/kingdom'))).toEqual([])

    /* "kingdom" is deliberately kept as a *search keyword* and nowhere else. Somebody who
       knew the old site will type it, and a village record that cannot find itself under the
       word its own readers use has chosen purity over being useful. Keywords are matched,
       never displayed. */
    const idx = READ('src/lib/search-index.ts')
    expect(idx).toMatch(/keywords: \[[^\]]*'kingdom'/)
    expect(search('kingdom').total).toBeGreaterThan(0)
  })
})
