import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { BUSINESS_MEDIA, businessAsset } from './media'
import { curatedBusinesses, getCuratedBusiness, publicCuratedBusinesses } from '@/lib/businesses'

/* The pictures a business is shown with.
 *
 * What can go wrong here is quiet: a file renamed on disk leaves a card with the placeholder
 * and nobody notices, a picture filed under the wrong slug puts one company's shopfront on
 * another company's page, and a held business acquires a cover that advertises a listing the
 * Fondom has not published. Each of those is checked against the real files and the real
 * records. */

const fromUrl = (url: string) =>
  'public' + decodeURIComponent(url)

describe('every mapped picture is real', () => {
  it('maps only slugs the directory holds', () => {
    for (const slug of Object.keys(BUSINESS_MEDIA)) {
      expect(getCuratedBusiness(slug), slug).not.toBeNull()
    }
  })

  it('points every file at something that exists in its own folder', () => {
    for (const [slug, m] of Object.entries(BUSINESS_MEDIA)) {
      expect(existsSync(`public/business/${m.folder}`), `${slug}: folder ${m.folder}`).toBe(true)
      const files = [m.logo?.file, m.cover?.file, ...(m.gallery ?? []).map(g => g.file)]
        .filter((f): f is string => Boolean(f))
      for (const f of files) {
        expect(existsSync(`public/business/${m.folder}/${f}`), `${slug}: ${f}`).toBe(true)
      }
    }
  })

  it('never uses one file for two businesses, or twice for one', () => {
    const seen = new Map<string, string>()
    for (const [slug, m] of Object.entries(BUSINESS_MEDIA)) {
      const files = [m.logo?.file, m.cover?.file, ...(m.gallery ?? []).map(g => g.file)]
        .filter((f): f is string => Boolean(f))
        .map(f => `${m.folder}/${f}`)
      for (const f of files) {
        expect(seen.get(f), `${f} used by ${seen.get(f)} and ${slug}`).toBeUndefined()
        seen.set(f, slug)
      }
    }
  })

  it('serves nothing it does not show', () => {
    /* R-007: a file in public/ is reachable whether or not a page links to it. Supplied
       pictures the directory does not use wait in archive-staging/business/ instead. The one
       exception is the original Magic Gate logo, kept beside the copy derived from it. */
    const mapped = new Set<string>(['Magic Gate Enterprise/472745700_1098453385312256_8407743892378693614_n.jpg'])
    for (const m of Object.values(BUSINESS_MEDIA)) {
      for (const f of [m.logo?.file, m.cover?.file, ...(m.gallery ?? []).map(g => g.file)]) {
        if (f) mapped.add(`${m.folder}/${f}`)
      }
    }
    for (const folder of readdirSync('public/business')) {
      for (const f of readdirSync(`public/business/${folder}`)) {
        expect(mapped.has(`${folder}/${f}`), `${folder}/${f} is served but unused`).toBe(true)
      }
    }
  })

  it('records the logo dimensions the file actually has', async () => {
    const sharp = (await import('sharp')).default
    for (const [slug, m] of Object.entries(BUSINESS_MEDIA)) {
      if (!m.logo) continue
      const meta = await sharp(readFileSync(`public/business/${m.folder}/${m.logo.file}`)).metadata()
      expect([meta.width, meta.height], slug).toEqual([m.logo.width, m.logo.height])
    }
  })

  it('describes every gallery picture for somebody who cannot see it', () => {
    for (const m of Object.values(BUSINESS_MEDIA)) {
      for (const g of m.gallery ?? []) expect(g.alt.trim().length).toBeGreaterThan(10)
    }
  })
})

describe('the records carry the pictures', () => {
  it('encodes spaces and brackets once, and the URL leads back to the file', () => {
    const url = businessAsset('ARCpoint Labs', 'images (1).jpg')
    expect(url).toBe('/business/ARCpoint%20Labs/images%20(1).jpg')
    expect(url).not.toContain(' ')
    expect(existsSync(fromUrl(url))).toBe(true)
  })

  it('gives every published curated business a cover', () => {
    for (const b of publicCuratedBusinesses()) {
      expect(b.cover, b.slug).toBeTruthy()
      expect(b.cover).not.toContain(' ')
      expect(existsSync(fromUrl(b.cover!)), b.slug).toBe(true)
    }
  })

  it('puts nothing on a held business', () => {
    for (const b of curatedBusinesses().filter(x => x.status !== 'public')) {
      expect(BUSINESS_MEDIA[b.slug], b.slug).toBeUndefined()
      expect(b.cover ?? b.logo ?? b.gallery).toBeUndefined()
    }
  })

  it('leaves the reviewed JSON as the record of fact', () => {
    /* Imagery is joined on at load time. The JSON is reviewed content and gains no paths. */
    const raw = readFileSync('src/data/businesses/businesses.json', 'utf-8')
    expect(raw).not.toContain('/business/')
  })
})
