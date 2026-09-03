import 'server-only'
import { classify, normaliseItems, type SyncReport, type YouTubeItem } from './youtube-normalise'

/* The impure half of YouTube synchronisation: the one function that holds the key.
 *
 * Everything decidable without a credential lives in `youtube-normalise.ts`, which is
 * deliberately not `server-only` so it can be tested against a fixture. This module is
 * `server-only` because it reads `YOUTUBE_API_KEY`, and nothing here is ever imported by a
 * component.
 *
 * ── Credential state, stated rather than implied ─────────────────────────────────────────
 *
 * `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` are set in Production and Preview but are not
 * readable in this environment (R-024), so `fetchChannelUploads` has **never been run against
 * the live API**. Live verification is pending. The classification it feeds is tested;
 * the request itself is not.
 *
 * ── Why a sync and never a request-time fetch ────────────────────────────────────────────
 *
 * One `playlistItems` page costs about 3 units against a daily quota of 10,000. That is
 * nothing per scheduled run and ruinous per visitor. More importantly, the public site must
 * not depend on a third party being reachable: `/watch` renders from the canonical record and
 * would render identically if YouTube were down for a week.
 */
export type { SyncReport, YouTubeItem }

export async function fetchChannelUploads(): Promise<
  { ok: true; items: YouTubeItem[]; channelId: string } | { ok: false; reason: string }
> {
  const key = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID

  if (!key || !channelId) {
    return {
      ok: false,
      reason:
        'YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID is not available in this environment. ' +
        'No request was made. The public site does not depend on this call.',
    }
  }

  try {
    /* A channel's uploads are a playlist whose id is the channel id with UC -> UU. */
    const playlistId = channelId.replace(/^UC/, 'UU')
    const items: unknown[] = []
    let pageToken: string | undefined

    do {
      const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
      url.searchParams.set('part', 'snippet')
      url.searchParams.set('maxResults', '50')
      url.searchParams.set('playlistId', playlistId)
      url.searchParams.set('key', key)
      if (pageToken) url.searchParams.set('pageToken', pageToken)

      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) {
        /* Never echo the response body or the URL: the URL carries the key, and an API error
           message frequently repeats the request that caused it. */
        return { ok: false, reason: `YouTube API returned ${res.status}.` }
      }
      const body = (await res.json()) as { items?: unknown[]; nextPageToken?: string }
      items.push(...(body.items || []))
      pageToken = body.nextPageToken
    } while (pageToken && items.length < 500)

    return { ok: true, items: normaliseItems(items), channelId }
  } catch {
    return { ok: false, reason: 'The YouTube request failed.' }
  }
}

/** A whole sync: fetch if possible, classify either way, write nothing. Serving the canonical
 *  record unchanged is always the correct outcome of a failed sync. */
export async function runSync(): Promise<SyncReport> {
  const fetched = await fetchChannelUploads()

  if (!fetched.ok) {
    const report = classify([], process.env.YOUTUBE_CHANNEL_ID || null, false)
    report.notes.unshift(fetched.reason)
    /* With no listing, "missing from the channel" would mean only that nothing was fetched,
       which is not a finding about any film. */
    report.missingFromChannel = []
    return report
  }

  return classify(fetched.items, fetched.channelId, true)
}
