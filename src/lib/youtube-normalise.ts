import { allFilms, isDenied, type FilmState } from './guneku-tv'

/* The pure half of YouTube synchronisation: normalisation and classification.
 *
 * Deliberately NOT `server-only`. It touches no key, makes no request and reads no
 * environment — and keeping it out from behind that guard is what makes it testable in a
 * plain script against a fixture. The impure half, which does hold the key, lives in
 * `youtube-sync.ts` and is `server-only`.
 *
 * That split is the point rather than a convenience: the logic that decides whether a video
 * becomes visible on the Fondom's site is the part that most needs to be tested, and a guard
 * that made it untestable would have bought no safety at all — the key is not in here.
 *
 * ── What classification is allowed to conclude ───────────────────────────────────────────
 *
 * It reports. It never publishes. A video on the channel is not the Fondom asserting
 * something about Guneku's history, and the gap between those two is where a sync script can
 * do real damage: captioning a funeral as a celebration, surfacing a family's footage, dating
 * an event wrongly. So the strongest verdict available here is `discovered`, and only a
 * person moves anything past it.
 */

export type YouTubeItem = {
  /** From `snippet.resourceId.videoId` on a playlistItems response. */
  videoId: string
  title: string
  publishedAt: string | null
  thumb: string | null
  description: string | null
}

export type SyncReport = {
  ranAt: string
  /** True only when a live API call actually happened. */
  live: boolean
  channelId: string | null
  fetched: number
  unchanged: YouTubeItem[]
  newlyDiscovered: Array<YouTubeItem & { state: FilmState }>
  missingFromChannel: string[]
  denied: string[]
  notes: string[]
}

/* Only fields YouTube actually returns are kept, and an absent field stays `null` rather than
   becoming an empty string that later reads as "known to be blank". Nothing is derived: no
   duration guessed from a title, no date inferred from a filename. */
export function normaliseItem(raw: unknown): YouTubeItem | null {
  const r = raw as {
    snippet?: {
      resourceId?: { videoId?: string }
      title?: string
      publishedAt?: string
      description?: string
      thumbnails?: Record<string, { url?: string }>
    }
  }
  const videoId = r?.snippet?.resourceId?.videoId
  const title = r?.snippet?.title
  if (!videoId || !title) return null

  /* YouTube returns these placeholder titles for videos the caller may not see. Treating them
     as real titles would put "Private video" into the Fondom's archive as though it were the
     name of something. */
  if (title === 'Private video' || title === 'Deleted video') return null

  const t = r.snippet?.thumbnails || {}
  const thumb =
    t.maxres?.url || t.standard?.url || t.high?.url || t.medium?.url || t.default?.url || null

  return {
    videoId,
    title,
    publishedAt: r.snippet?.publishedAt || null,
    thumb: thumb || null,
    description: r.snippet?.description || null,
  }
}

export function normaliseItems(items: unknown[]): YouTubeItem[] {
  return items.map(normaliseItem).filter((i): i is YouTubeItem => i !== null)
}

/** Compares a normalised channel listing against the canonical record. Pure: no network, no
 *  writes, no environment. Everything a sync would do to the public site follows from what
 *  this returns, and it returns nothing publishable. */
export function classify(
  items: YouTubeItem[], channelId: string | null, live: boolean,
): SyncReport {
  const known = new Map(allFilms().map(f => [f.youtubeId, f]))
  const seen = new Set<string>()

  const unchanged: YouTubeItem[] = []
  const newlyDiscovered: Array<YouTubeItem & { state: FilmState }> = []
  const denied: string[] = []

  for (const item of items) {
    seen.add(item.videoId)

    if (isDenied(item.videoId)) {
      denied.push(item.videoId)
      continue
    }
    if (known.has(item.videoId)) {
      unchanged.push(item)
      continue
    }
    /* Discovered, and that is all it means. Not reviewed, not approved, not public. */
    newlyDiscovered.push({ ...item, state: 'discovered' })
  }

  const missingFromChannel = [...known.keys()].filter(id => !seen.has(id) && !isDenied(id))

  const notes: string[] = []
  if (!live) {
    notes.push('Not a live run. Classified from fixture data; the API was not called.')
  }
  if (newlyDiscovered.length > 0) {
    notes.push(
      `${newlyDiscovered.length} upload(s) are on the channel and not in the record. They are ` +
      'discovered only. A person must review each one and write it to the canonical record ' +
      'or to video-overrides.json before it can appear anywhere on the site.',
    )
  }
  if (missingFromChannel.length > 0) {
    notes.push(
      `${missingFromChannel.length} film(s) in the record were not returned by the channel. ` +
      'Reported, not removed: a film going private or a failed page must never delete part ' +
      'of the Fondom’s record.',
    )
  }
  if (denied.length > 0) {
    notes.push(`${denied.length} deny-listed id(s) were returned by the channel and skipped.`)
  }

  return {
    ranAt: new Date().toISOString(),
    live,
    channelId,
    fetched: items.length,
    unchanged,
    newlyDiscovered,
    missingFromChannel,
    denied,
    notes,
  }
}
