import { SITE_URL } from './seo'

/* Telling a search engine that one page changed.
 *
 * ── What this is for ─────────────────────────────────────────────────────────────────────
 *
 * The Fondom publishes an update, and the useful thing to do is say so — once, about that
 * page. IndexNow is the protocol for that: an HTTP POST naming the URLs that changed, which
 * Bing, Yandex, Seznam and Naver share between them.
 *
 * ── What it is emphatically not for ──────────────────────────────────────────────────────
 *
 * Pinging all three hundred pages on every deploy. A deploy changes a stylesheet, and the
 * register's hundred and thirteen entries have not changed since the last one; submitting
 * them anyway is a false claim repeated automatically, and the protocol's own guidance is
 * that it is grounds for the host being ignored. So `MAX_URLS` is deliberately small enough
 * that the whole site will not fit through here, and there is no "submit everything" call in
 * this module for somebody to reach for at four in the morning.
 *
 * ── The key ──────────────────────────────────────────────────────────────────────────────
 *
 * Ownership is proved by hosting a file containing a key that the submission also names. The
 * key is a secret in the sense that nobody else should be able to submit on this host's
 * behalf; it is not a secret in the sense of a password, since the file is public by design.
 * It lives in INDEXNOW_KEY and nowhere in the repository, and everything here declines
 * quietly rather than half-working when it is absent. Nothing fakes verification. */

/** Hex, 8–128 characters, as the protocol requires. */
const KEY_SHAPE = /^[a-f0-9]{8,128}$/i

/** Where the key file is served. Named in every submission as `keyLocation`, so the file
 *  does not have to sit at the root under the key's own name. */
export const KEY_PATH = '/indexnow-key.txt'

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/* Small on purpose. A change worth announcing is a handful of pages; anything larger is a
   rebuild, and a rebuild is what the sitemap is for. */
export const MAX_URLS = 25

export function indexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim()
  return key && KEY_SHAPE.test(key) ? key : null
}

/** The body of the key file, or null when no valid key is configured. */
export function keyFileBody(): string | null {
  return indexNowKey()
}

export type SubmitResult =
  | { ok: true; submitted: string[]; status: number }
  | { ok: false; reason: string }

/** Every URL must be on this host and must be a path this site serves. */
export function normaliseUrls(input: string[]): { urls: string[]; rejected: string[] } {
  const urls: string[] = []
  const rejected: string[] = []
  for (const raw of input) {
    const value = String(raw ?? '').trim()
    const url = value.startsWith('/') ? `${SITE_URL}${value}` : value
    if (!url.startsWith(`${SITE_URL}/`) && url !== SITE_URL) { rejected.push(value); continue }
    if (urls.includes(url)) continue
    urls.push(url)
  }
  return { urls, rejected }
}

/** Announce that these URLs changed. Submits nothing it was not given. */
export async function submitUrls(
  input: string[],
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResult> {
  const key = indexNowKey()
  if (!key) return { ok: false, reason: 'INDEXNOW_KEY is not set' }

  const { urls, rejected } = normaliseUrls(input)
  if (rejected.length) return { ok: false, reason: `not on ${SITE_URL}: ${rejected.join(', ')}` }
  if (urls.length === 0) return { ok: false, reason: 'nothing to submit' }
  if (urls.length > MAX_URLS) {
    return { ok: false, reason: `${urls.length} URLs is more than ${MAX_URLS}; use the sitemap` }
  }

  const res = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key,
      keyLocation: `${SITE_URL}${KEY_PATH}`,
      urlList: urls,
    }),
  })

  return res.ok
    ? { ok: true, submitted: urls, status: res.status }
    : { ok: false, reason: `endpoint returned ${res.status}` }
}
