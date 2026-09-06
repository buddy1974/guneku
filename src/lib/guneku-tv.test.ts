import { describe, it, expect } from 'vitest'
import {
  allFilms, approvedFilms, heldFilms, isDenied, deniedCount, featuredFilm,
  heldNote, queryFilms, getFilm, channel,
} from './guneku-tv'
import provider from '@/data/gallery/video-provider-metadata.json'
import discovered from '@/data/gallery/video-discovered.json'
import { readFileSync, readdirSync } from 'node:fs'

const PRIVATE_ID = '2jS-ael4Ccg'

describe('the film record', () => {
  it('holds 46 films, every one approved', () => {
    expect(allFilms()).toHaveLength(46)
    expect(approvedFilms()).toHaveLength(46)
    expect(heldFilms()).toHaveLength(0)
  })

  it('gives every approved film an id and a title', () => {
    for (const f of approvedFilms()) {
      expect(f.youtubeId).toMatch(/^[\w-]{6,}$/)
      expect(f.displayTitle.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('the private upload is unreachable by every route', () => {
  it('is deny-listed', () => {
    expect(isDenied(PRIVATE_ID)).toBe(true)
    expect(deniedCount()).toBeGreaterThan(0)
  })

  it('is in no film list, no query, no lookup', () => {
    expect(allFilms().some(f => f.youtubeId === PRIVATE_ID)).toBe(false)
    expect(approvedFilms().some(f => f.youtubeId === PRIVATE_ID)).toBe(false)
    expect(getFilm(PRIVATE_ID)).toBeNull()
    expect(queryFilms({ q: PRIVATE_ID }).films).toHaveLength(0)
    expect(featuredFilm()?.youtubeId).not.toBe(PRIVATE_ID)
  })

  it('is not named in the note the hub renders', () => {
    /* The source note names it. Publishing the identifier of something deliberately not
       surfaced hands a reader the one thing the decision withheld. */
    expect(heldNote() ?? '').not.toContain(PRIVATE_ID)
  })

  it('was not returned as a publishable item by the live channel read', () => {
    expect(Object.keys(provider.videos)).not.toContain(PRIVATE_ID)
    expect(discovered.discovered.map(d => d.youtubeId)).not.toContain(PRIVATE_ID)
  })
})

describe('verified provider metadata — R-009 closed 2026-09-06', () => {
  const films = allFilms()

  it('verifies all 46 titles against the channel, not 2 of 46', () => {
    expect(Object.keys(provider.videos)).toHaveLength(46)
    expect(films.every(f => f.titleVerified)).toBe(true)
    expect(films.every(f => (f.publishedTitle ?? '').length > 0)).toBe(true)
  })

  it('publishes the channel title as the channel title, and the archive title as its own', () => {
    for (const f of films) {
      const p = (provider.videos as Record<string, { providerTitle: string }>)[f.youtubeId]
      expect(f.publishedTitle).toBe(p.providerTitle)
    }
  })

  it('never lets a provider title become the title the site shows', () => {
    /* All 46 differ, and they differ in kind: the channel writes for YouTube search, the
       archive writes for the Fondom. A sync that overwrote one with the other would replace
       the Fondom's editorial voice with a provider's keywords, silently, on every run. */
    const overwritten = films.filter(f => f.displayTitle === f.publishedTitle)
    expect(overwritten).toHaveLength(0)
  })

  it('records the upload timestamp and exposes it as no kind of date', () => {
    /* publishedAt is when a file reached YouTube. It is not when an occasion happened, and
       the Film type has nowhere to put it precisely so that nothing can render it as one. */
    const values = Object.values(provider.videos) as Array<{ publishedAt: string }>
    expect(values.every(v => typeof v.publishedAt === 'string')).toBe(true)
    for (const f of films) {
      expect(f).not.toHaveProperty('publishedAt')
      expect(f).not.toHaveProperty('date')
    }
    expect(JSON.stringify(provider.meta)).toMatch(/NOT the date of the occasion filmed/i)
  })
})

describe('discovered uploads are a queue, not content', () => {
  it('holds the 62 channel uploads the record does not carry', () => {
    expect(discovered.discovered).toHaveLength(62)
    expect(discovered.meta.countAtDiscovery).toBe(62)
  })

  it('overlaps the record nowhere', () => {
    const known = new Set(allFilms().map(f => f.youtubeId))
    for (const d of discovered.discovered) expect(known.has(d.youtubeId)).toBe(false)
  })

  it('is imported by no module — nothing can render it', () => {
    /* The guarantee that matters. A file that is merely unused today becomes content the
       first time somebody wires it up; this fails if anybody does. */
    const importers: string[] = []
    const stack = ['src', 'app'].filter(d => { try { readdirSync(d); return true } catch { return false } })
    while (stack.length) {
      const dir = stack.pop()!
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${e.name}`
        if (e.isDirectory()) { stack.push(full); continue }
        if (!/\.(ts|tsx|js|jsx)$/.test(e.name)) continue
        /* Tests are excluded, and only tests. A test cannot render anything — the two that
           read this file read it precisely to assert that none of its 62 ids reaches the
           film record or the search index. Everything else that could import it is in
           scope, which is the whole point. */
        if (/\.test\.tsx?$/.test(e.name)) continue
        if (readFileSync(full, 'utf-8').includes('video-discovered')) importers.push(full)
      }
    }
    expect(importers).toEqual([])
  })
})

describe('the channel link is a channel link', () => {
  it('points at the public channel and never at Studio or an admin surface', () => {
    const c = channel()
    expect(c.url).toMatch(/^https:\/\/(www\.)?youtube\.com\//)
    expect(c.url).not.toMatch(/studio|admin|manage/i)
    expect(c.id).toBe(provider.meta.channelId)
  })
})
