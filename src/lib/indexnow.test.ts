import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  indexNowKey, keyFileBody, normaliseUrls, submitUrls,
  KEY_PATH, MAX_URLS, INDEXNOW_ENDPOINT,
} from './indexnow'
import { SITE_URL } from './seo'

/* What stops this from becoming a way to ping three hundred pages every deploy. */

const ORIGINAL = process.env.INDEXNOW_KEY
const KEY = 'a1b2c3d4e5f60718'

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.INDEXNOW_KEY
  else process.env.INDEXNOW_KEY = ORIGINAL
})

describe('no key, no submission, and no pretending', () => {
  beforeEach(() => { delete process.env.INDEXNOW_KEY })

  it('reports no key rather than inventing one', () => {
    expect(indexNowKey()).toBeNull()
    expect(keyFileBody()).toBeNull()
  })

  it('refuses to submit', async () => {
    const r = await submitUrls(['/updates/x'], async () => {
      throw new Error('should not have been called')
    })
    expect(r).toEqual({ ok: false, reason: 'INDEXNOW_KEY is not set' })
  })

  it('rejects a key that is not the shape the protocol requires', () => {
    process.env.INDEXNOW_KEY = 'not-a-key'
    expect(indexNowKey()).toBeNull()
    process.env.INDEXNOW_KEY = 'abc'
    expect(indexNowKey()).toBeNull()
  })

  it('serves the key file as a 404 when there is nothing to verify', async () => {
    const { GET } = await import('@/app/indexnow-key.txt/route')
    expect(GET().status).toBe(404)
  })
})

describe('with a key', () => {
  beforeEach(() => { process.env.INDEXNOW_KEY = KEY })

  it('serves exactly the key, and nothing around it', async () => {
    const { GET } = await import('@/app/indexnow-key.txt/route')
    const res = GET()
    expect(res.status).toBe(200)
    expect(await res.text()).toBe(KEY)
  })

  it('submits only the URLs it was given, on this host', async () => {
    let body: any
    const r = await submitUrls(['/updates/x', `${SITE_URL}/updates/y`], async (u, init) => {
      expect(u).toBe(INDEXNOW_ENDPOINT)
      body = JSON.parse(String((init as RequestInit).body))
      return new Response('', { status: 200 })
    })
    expect(r).toEqual({ ok: true, submitted: [
      `${SITE_URL}/updates/x`, `${SITE_URL}/updates/y`,
    ], status: 200 })
    expect(body.host).toBe('www.guneku.org')
    expect(body.key).toBe(KEY)
    expect(body.keyLocation).toBe(`${SITE_URL}${KEY_PATH}`)
    expect(body.urlList).toHaveLength(2)
  })

  it('refuses a URL that is not on this site', async () => {
    const r = await submitUrls(['https://example.com/x'], async () => {
      throw new Error('should not have been called')
    })
    expect(r.ok).toBe(false)
    expect((r as { reason: string }).reason).toContain('example.com')
  })

  it('refuses a submission large enough to be a rebuild', async () => {
    /* The guard that matters. Announcing every page on every deploy is a claim that every
       page changed, and it is not true. */
    const many = Array.from({ length: MAX_URLS + 1 }, (_, i) => `/updates/${i}`)
    const r = await submitUrls(many, async () => {
      throw new Error('should not have been called')
    })
    expect(r.ok).toBe(false)
    expect((r as { reason: string }).reason).toContain('sitemap')
  })

  it('collapses a URL given twice', () => {
    const { urls } = normaliseUrls(['/a', `${SITE_URL}/a`, '/b'])
    expect(urls).toEqual([`${SITE_URL}/a`, `${SITE_URL}/b`])
  })
})

describe('the key is nowhere in the repository', () => {
  it('is read from the environment and committed nowhere', () => {
    const src = readFileSync('src/lib/indexnow.ts', 'utf-8')
    expect(src).toContain('process.env.INDEXNOW_KEY')
    /* No default, no fallback, no example key that would ship as a real one. */
    expect(src).not.toMatch(/INDEXNOW_KEY\s*(\|\||\?\?)\s*['"]/)
  })

  it('offers no call that submits the whole site', () => {
    const src = readFileSync('src/lib/indexnow.ts', 'utf-8')
    expect(src).not.toContain('sitemap()')
    expect(src).not.toMatch(/submitAll|submitEverything|submitSitemap/)
  })
})
