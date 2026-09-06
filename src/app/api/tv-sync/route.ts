import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { runSync } from '@/lib/youtube-sync'
import { allFilms } from '@/lib/guneku-tv'

/* TEMPORARY — a read-only probe, to be removed once it has run.
 *
 * YOUTUBE_API_KEY is set in Production and Preview and is not readable in the development
 * environment (R-024). `vercel env pull` returns it redacted, so the only place the existing
 * `fetchChannelUploads` can be exercised against the live API is where the key already is.
 * That is the same reasoning as the migration endpoints of Phases 3, 5 and 13, and this one
 * is considerably weaker: it is GET-only, it writes nothing, and it returns a comparison.
 *
 * What it can do, exhaustively: read the channel's uploads playlist and compare it with the
 * canonical record. It cannot publish, cannot approve, cannot write a file and cannot change
 * a single thing the site shows. Whatever it reports is applied by a person, in a commit —
 * which is the same review queue every other editorial change goes through (ADR-068).
 *
 * Inert without the token. With TV_SYNC_TOKEN unset the route answers 404 and never touches
 * the network, so it is dormant in every deployment that does not deliberately arm it. */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function authorised(req: Request): boolean {
  const expected = process.env.TV_SYNC_TOKEN
  if (!expected) return false
  const given = req.headers.get('x-sync-token') || ''
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  /* Compare lengths separately: timingSafeEqual throws on a length mismatch. */
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(req: Request) {
  if (!process.env.TV_SYNC_TOKEN || !authorised(req)) {
    /* Not 401. An unarmed or wrongly-called diagnostic should be indistinguishable from a
       route that does not exist. */
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  const report = await runSync()
  const known = new Map(allFilms().map(f => [f.youtubeId, f]))

  /* The provider's title beside the record's own, for every film the channel returned. This
     is the whole point of the run: 44 of 46 films carry no verified title (R-009), and the
     channel is the only authority for what its own titles are. */
  const titles = report.unchanged.map(item => {
    const film = known.get(item.videoId)!
    return {
      youtubeId: item.videoId,
      displayTitle: film.displayTitle,
      providerTitle: item.title,
      same: film.displayTitle.trim() === item.title.trim(),
      alreadyVerified: film.titleVerified,
      publishedAt: item.publishedAt,
      thumb: item.thumb,
      state: film.state,
    }
  })

  return NextResponse.json({
    ranAt: report.ranAt,
    live: report.live,
    /* The channel id is public — it is already rendered on /watch — but the key is not, and
       nothing in this response is derived from it. */
    channelId: report.channelId,
    fetched: report.fetched,
    recordCount: known.size,
    matched: report.unchanged.length,
    newlyDiscovered: report.newlyDiscovered,
    missingFromChannel: report.missingFromChannel,
    denied: report.denied,
    notes: report.notes,
    titles,
  })
}
