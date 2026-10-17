import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import {
  FESTIVAL, FESTIVAL_PATH, GALLERY, festivalUpdates, festivalFilms, kemFilm, onHomepage,
} from './festival'
import { OPENS_AT, CLOSES_AT, festivalCountdown } from './festival-time'
import { approvedFilms } from './guneku-tv'
import { getUpdate } from './content'

/* Michi Ebeng 2027.
 *
 * What can go wrong with a festival campaign is mostly quiet: a countdown an hour out
 * because somebody wrote the date in UTC, a proposal that drifts into the programme, a
 * photograph of 2023 captioned as if it were 2027, a ticket price or a meeting point
 * nobody announced. Each is checked against the real record. */

const RAW = readFileSync('src/data/events/michi-ebeng-2027.json', 'utf-8')
const UPDATE_RAW = readFileSync('src/data/updates/michi-ebeng-2027-planning-begins.json', 'utf-8')

describe('the facts the planning record establishes', () => {
  it('holds the dates and venue from the minutes', () => {
    expect(FESTIVAL.dates.start).toBe('2027-03-19')
    expect(FESTIVAL.dates.end).toBe('2027-03-20')
    expect(FESTIVAL.dates.display).toBe('19–20 March 2027')
    expect(FESTIVAL.venue.display).toBe('Mile 4, Limbe Handicraft Centre')
    expect(FESTIVAL.venue.locality).toBe('Limbe')
  })

  it('names the Kem dance as the competition', () => {
    expect(FESTIVAL.established.map(e => e.title)).toContain('The Kem dance competition')
  })

  it('records all nine committees, in the order of the minutes', () => {
    expect(FESTIVAL.committees.map(c => c.name)).toEqual([
      'Organising', 'Transport and logistics', 'Entertainment, food and beverages',
      'Decorations', 'Health', 'Fundraising', 'Cultural activities and protocol',
      'Communication and advertising', 'Finance, evaluation and prizes',
    ])
  })

  it('uses the corrected terms-of-reference names and the corrected proposer', () => {
    expect(FESTIVAL.termsOfReference.members).toEqual([
      'Tah Eric Teke', 'Moris Forkam', 'Ni Samba Jonathan',
      'Mbakwa Bernard, Regent of Guneku', 'Fah Elvis Tayong, Ngamfon',
    ])
    expect(FESTIVAL.proposalSource).toContain('Ticha Elias Mbekwa')
    expect(RAW).not.toMatch(/Tekewas/)
    expect(UPDATE_RAW).not.toMatch(/Tekewas/)
  })
})

describe('agreed and proposed stay apart', () => {
  it('never lists a proposal among the agreed items', () => {
    const agreed = FESTIVAL.established.map(e => e.title.toLowerCase()).join(' ')
    for (const p of ['mister', 'miss', 'tug of war', 'wear competition', 'sawa', 'documentary', 'sketch']) {
      expect(agreed, p).not.toContain(p)
    }
  })

  it('records every proposal the corrected minutes list', () => {
    const titles = FESTIVAL.proposals.map(p => p.title)
    expect(titles).toEqual([
      'Mister and Miss Michi Ebeng', 'Traditional dishes', 'A Meta marriage sketch',
      'Documentary on giant screens', 'SAWA cultural participation',
      'Traditional wear competition', 'Inter-village tug of war',
    ])
  })

  it('labels the homepage and the page by the same two words', () => {
    for (const f of ['src/components/festival/FestivalFeature.tsx', 'src/app/events/michi-ebeng-2027/page.tsx']) {
      const src = readFileSync(f, 'utf-8')
      expect(src, f).toContain('fest-label-agreed')
      expect(src, f).toContain('fest-label-proposed')
    }
  })
})

describe('nothing is invented', () => {
  it('publishes no telephone number, price, account or map position', () => {
    for (const raw of [RAW, UPDATE_RAW]) {
      const text = raw.replace(/"src": "[^"]+"/g, '')
      const numbers = (text.match(/\+?\d[\d ()-]{8,}\d/g) ?? [])
        .filter(s => !/^\d{4}-\d{2}-\d{2}/.test(s.trim()))
      expect(numbers).toEqual([])
      expect(raw).not.toMatch(/FCFA|XAF|€|\$|IBAN|account number|mobile money|MoMo/i)
      expect(raw).not.toMatch(/"(lat|lng|latitude|longitude|geo)"/)
    }
  })

  it('emits no ticket offer or performer in the event schema', () => {
    const page = readFileSync('src/app/events/michi-ebeng-2027/page.tsx', 'utf-8')
    expect(page).toContain("'@type': 'Event'")
    expect(page).toContain('EventScheduled')
    expect(page).not.toMatch(/offers:|performer:/)
  })

  it('does not count editions it cannot confirm', () => {
    expect(UPDATE_RAW).not.toMatch(/fourth/i)
  })
})

describe('every picture is real, and says when it is from', () => {
  it('points at files that exist, at their real size', async () => {
    const sharp = (await import('sharp')).default
    for (const g of GALLERY) {
      const file = `public${g.src}`
      expect(existsSync(file), g.src).toBe(true)
      const meta = await sharp(readFileSync(file)).metadata()
      expect([meta.width, meta.height], g.src).toEqual([g.width, g.height])
    }
  })

  it('captions every picture as an earlier edition, never as 2027', () => {
    for (const g of GALLERY) {
      expect(g.caption, g.src).toMatch(/2023/)
      expect(g.caption, g.src).not.toMatch(/2027/)
      expect(g.alt.length, g.src).toBeGreaterThan(15)
    }
  })

  it('takes every picture from the Fondom’s own festival albums', () => {
    for (const g of GALLERY) {
      expect(g.src).toMatch(/^\/images\/gallery\/(mchibe-mta-event-guneku2023|mukonge-dance-groupsin-meta)\//)
    }
  })

  it('shows only films the library has approved', () => {
    const approved = new Set(approvedFilms().map(f => f.youtubeId))
    for (const f of festivalFilms()) expect(approved.has(f.videoId)).toBe(true)
    expect(kemFilm()?.videoId).toBe('KhgIX-rvKgE')
  })
})

describe('the countdown keeps Cameroon time', () => {
  it('opens at midnight in Limbe, which is 23:00 UTC the day before', () => {
    expect(new Date(OPENS_AT).toISOString()).toBe('2027-03-18T23:00:00.000Z')
    expect(new Date(CLOSES_AT).toISOString()).toBe('2027-03-20T23:00:00.000Z')
  })

  it('agrees with the record it is counting to', () => {
    expect(OPENS_AT).toBe(Date.parse(`${FESTIVAL.dates.start}T00:00:00${FESTIVAL.dates.utcOffset}`))
  })

  it('counts down, then is live, then is past', () => {
    expect(festivalCountdown(OPENS_AT - 1000)).toEqual(
      { phase: 'upcoming', days: 0, hours: 0, minutes: 0, seconds: 1 })
    expect(festivalCountdown(OPENS_AT - (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000)).toEqual(
      { phase: 'upcoming', days: 2, hours: 3, minutes: 4, seconds: 5 })
    expect(festivalCountdown(OPENS_AT).phase).toBe('live')
    expect(festivalCountdown(CLOSES_AT - 1).phase).toBe('live')
    expect(festivalCountdown(CLOSES_AT).phase).toBe('past')
  })

  it('leads the homepage until a month after, then gives the space back', () => {
    expect(onHomepage(Date.parse('2026-10-17T12:00:00Z'))).toBe(true)
    expect(onHomepage(Date.parse('2027-04-01T12:00:00Z'))).toBe(true)
    expect(onHomepage(Date.parse('2027-05-01T12:00:00Z'))).toBe(false)
  })
})

describe('it lives inside the site, not beside it', () => {
  it('reads its planning news from the ordinary news archive', () => {
    const u = festivalUpdates()
    expect(u.map(x => x.slug)).toContain('michi-ebeng-2027-planning-begins')
    expect(getUpdate('michi-ebeng-2027-planning-begins')?.body).toContain(FESTIVAL_PATH)
  })

  it('is in the sitemap, the search index, the menu and on the homepage', () => {
    expect(readFileSync('src/app/sitemap.ts', 'utf-8')).toContain(`'${FESTIVAL_PATH}'`)
    expect(readFileSync('src/lib/search-index.ts', 'utf-8')).toContain(`'${FESTIVAL_PATH}'`)
    expect(readFileSync('src/components/layout/Header.tsx', 'utf-8')).toContain(`'${FESTIVAL_PATH}'`)
    const home = readFileSync('src/app/page.tsx', 'utf-8')
    expect(home).toContain('<FestivalFeature')
    expect(home).toContain('<FestivalRibbon')
  })

  it('links the festival record to the edition in preparation', () => {
    const inst = JSON.parse(readFileSync('src/data/institutions/michi-ebeng-festival.json', 'utf-8'))
    expect(inst.currentEdition.href).toBe(FESTIVAL_PATH)
    expect(inst.relatedUpdates).toContain('michi-ebeng-2027-planning-begins')
  })
})
