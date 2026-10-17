import doc from '@/data/events/michi-ebeng-2027.json'
import { publicUpdates } from './visibility'
import { approvedFilms } from './guneku-tv'
import type { Update } from './content'

/* Michi Ebeng 2027 — one festival, one record.
 *
 * ── Where the facts live ─────────────────────────────────────────────────────────────────
 *
 * `data/events/michi-ebeng-2027.json` is the festival: dates, venue, what is agreed, what is
 * only proposed, the committees, the questions it can honestly answer. The homepage feature
 * and the festival page both read it, so a correction is made once.
 *
 * Planning news is NOT kept here. It is an ordinary update in `data/updates/`, carrying
 * `"campaign": "michi-ebeng-2027"`, so it appears in the Village Square, the sitemap and
 * search exactly as every other update does — and the festival surfaces simply ask the news
 * archive for the updates that carry the tag. A new announcement is a new update record;
 * nothing else has to change.
 *
 * ── Agreed and proposed are different words ──────────────────────────────────────────────
 *
 * The planning minutes record a handful of decisions and a longer list of ideas. The two
 * are kept in separate arrays and every surface labels them separately. A proposal shown as
 * a programme item would be a promise the committee has not made. */

export type FestivalItem = { title: string; detail: string }
export type FestivalImage = { src: string; width: number; height: number; alt: string; caption: string }

export const FESTIVAL = doc
export const FESTIVAL_ID = doc.id
export const FESTIVAL_PATH = doc.path
export const GALLERY: FestivalImage[] = doc.gallery
export const HERO_IMAGE: FestivalImage = doc.gallery[0]

export { OPENS_AT, CLOSES_AT, festivalCountdown, type Countdown, type FestivalPhase } from './festival-time'
import { festivalCountdown } from './festival-time'

/** The moment a page is rendered. Festival pages regenerate hourly (`revalidate`), so this
 *  is the time of the last regeneration: the server-side starting point the countdown ticks
 *  on from in the browser, and the clock `onHomepage` is read against. */
export function renderedAt(): number {
  return Date.now()
}

/** Whether the homepage still leads with the festival. A month after it closes it gives the
 *  space back; the festival page itself stays, as the record of the edition. */
export function onHomepage(now: number): boolean {
  return festivalCountdown(now).phase !== 'past'
    || now < Date.parse(`${doc.homepageUntil}T00:00:00${doc.dates.utcOffset}`)
}

/* ── News ─────────────────────────────────────────────────────────────────────────────── */

type CampaignUpdate = Update & { campaign?: string }

/** Published updates tagged for this festival, newest first. */
export function festivalUpdates(): Update[] {
  return publicUpdates().filter(u => (u as CampaignUpdate).campaign === FESTIVAL_ID)
}

/** Updates about earlier editions, from the festival's own institution record. */
export const HISTORY_UPDATES = [
  'michi-ben-clash-of-mukonge-dance-groups-in-the-offing',
  'meta-people-start-going-back-to-their-roots',
  'festival-in-april-2024',
]

/* ── Films ────────────────────────────────────────────────────────────────────────────
 *
 * Only films the library has approved. A film held tomorrow disappears from this page at
 * the same moment it disappears from Guneku TV. */

export function festivalFilms(): Array<{ videoId: string; title: string }> {
  const approved = new Set(approvedFilms().map(f => f.youtubeId))
  return doc.films
    .filter(f => approved.has(f.youtubeId))
    .map(f => ({ videoId: f.youtubeId, title: f.title }))
}

export function kemFilm(): { videoId: string; title: string } | null {
  const f = approvedFilms().find(x => x.youtubeId === doc.kem.film)
  return f ? { videoId: f.youtubeId, title: f.displayTitle } : null
}

/** "8 Oct 2026" — the house style for dates in lists. */
export function shortDate(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  })
}
