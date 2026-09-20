import { allFoundingNames } from '@/lib/community'
import { SITE_URL } from '@/lib/seo'

/* A dated health reading of production, taken from outside it.
 *
 * ── What this is for ─────────────────────────────────────────────────────────────────────
 *
 * The test suite checks the source: that the sitemap is built from the policy, that a page
 * declares the canonical it should. This checks the thing the source is supposed to produce,
 * on the live host, which is the only place a stale CDN copy, a bad deploy or a redirect
 * introduced by the platform can be seen at all.
 *
 * It exists because the weeks after a search-engine launch are exactly when somebody will
 * look at a Search Console report, see a page missing, and start changing production to
 * chase it. The answer to "is this a real defect?" has to be cheap to get and the same every
 * time. That answer is here, and it is about our server rather than about Google's opinion
 * of it.
 *
 * ── What it deliberately does not do ─────────────────────────────────────────────────────
 *
 * It does not touch Google, Bing or IndexNow. No API keys, no scraping, no submissions,
 * nothing that could breach a service limit or need a credential. Everything it reads is a
 * public URL on this site, fetched the way any visitor would fetch it. There is nothing here
 * to leak and nothing to rate-limit.
 *
 *   npm run observe              the seven priority pages and every register entry
 *   npm run observe -- --quick   the priority pages only
 *   npm run observe -- --json    machine-readable, for pasting a snapshot into the ledger
 */

/** The pages whose health matters most, and which a search engine sees first. */
const PRIORITY = [
  '/', '/fondom', '/palace', '/indigenes', '/businesses', '/institutions', '/guneccul',
  '/palace/fon-walters-profile', '/people', '/notables', '/sons-and-daughters',
  '/diaspora', '/gudeca', '/projects', '/quarters', '/explore', '/updates',
  '/gallery', '/gallery/images', '/watch', '/contact', '/support',
]

type Reading = {
  path: string
  status: number
  location: string | null
  canonical: string | null
  robots: string | null
  selfCanonical: boolean
  indexable: boolean
  ok: boolean
  note: string | null
}

const dec = (s: string) => s
  .replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))

/** One page, read the way a crawler reads it: no redirect following. */
async function read(path: string): Promise<Reading> {
  const url = path === '/' ? SITE_URL : `${SITE_URL}${path}`
  const base: Reading = {
    path, status: 0, location: null, canonical: null, robots: null,
    selfCanonical: false, indexable: false, ok: false, note: null,
  }

  let res: Response
  try {
    res = await fetch(url, { redirect: 'manual' })
  } catch (e) {
    return { ...base, note: `fetch failed: ${(e as Error).message}` }
  }

  const status = res.status
  const location = res.headers.get('location')
  if (status !== 200) {
    return { ...base, status, location, note: `expected 200, got ${status}` }
  }

  const html = await res.text()
  const canonical = dec((html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] ?? '') || null
  const robots = dec((html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] ?? '') || null

  const expected = path === '/' ? SITE_URL : `${SITE_URL}${path}`
  const selfCanonical = canonical === expected
  const indexable = !/noindex/i.test(robots ?? '')

  const problems: string[] = []
  if (!canonical) problems.push('no canonical')
  else if (!selfCanonical) problems.push(`canonical points at ${canonical}`)
  if (!indexable) problems.push(`robots ${robots}`)

  return {
    ...base,
    status, location, canonical, robots, selfCanonical, indexable,
    ok: problems.length === 0,
    note: problems.length ? problems.join('; ') : null,
  }
}

/** Fetched a few at a time: this is somebody's production site, not a load test. */
async function readAll(paths: string[], concurrency = 6): Promise<Reading[]> {
  const out: Reading[] = []
  for (let i = 0; i < paths.length; i += concurrency) {
    out.push(...await Promise.all(paths.slice(i, i + concurrency).map(read)))
  }
  return out
}

async function main() {
  const quick = process.argv.includes('--quick')
  const asJson = process.argv.includes('--json')
  const taken = new Date().toISOString()

  /* robots.txt and the sitemap, which are the two documents a crawler reads first. */
  const robotsRes = await fetch(`${SITE_URL}/robots.txt`)
  const robotsTxt = await robotsRes.text()
  const sitemapRes = await fetch(`${SITE_URL}/sitemap.xml`)
  const sitemapXml = await sitemapRes.text()
  const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => m[1].replace(SITE_URL, '') || '/')
  const sitemapSet = new Set(sitemapUrls)

  const register = allFoundingNames()
  const peoplePaths = register.map(n => `/indigenes/founding/${n.slug}`)

  const priority = await readAll(PRIORITY)
  const people = quick ? [] : await readAll(peoplePaths)

  /* A register entry must be in the sitemap as well as healthy — the policy says every
     confirmed public record is offered, and a silent disappearance is the failure mode
     worth catching (ADR-097). */
  const missingFromSitemap = peoplePaths.filter(p => !sitemapSet.has(p))
  const peopleBad = people.filter(r => !r.ok)
  const priorityBad = priority.filter(r => !r.ok)

  const snapshot = {
    taken,
    robots: { status: robotsRes.status, bytes: robotsTxt.length },
    sitemap: { status: sitemapRes.status, urls: sitemapUrls.length },
    register: {
      total: register.length,
      checked: people.length,
      healthy: people.length - peopleBad.length,
      missingFromSitemap: missingFromSitemap.length,
    },
    priority: { checked: priority.length, healthy: priority.length - priorityBad.length },
    problems: [...priorityBad, ...peopleBad].map(r => ({ path: r.path, note: r.note })),
  }

  if (asJson) {
    console.log(JSON.stringify(snapshot, null, 2))
    process.exit(snapshot.problems.length || missingFromSitemap.length ? 1 : 0)
  }

  console.log(`GUNEKU production observation — ${taken}`)
  console.log(`  ${SITE_URL}\n`)
  console.log(`robots.txt            ${robotsRes.status}  ${robotsTxt.length} bytes`)
  console.log(`sitemap.xml           ${sitemapRes.status}  ${sitemapUrls.length} URLs`)
  console.log(`priority pages        ${priority.length - priorityBad.length}/${priority.length} healthy`)
  if (quick) {
    console.log('register              skipped (--quick)')
  } else {
    console.log(`register entries      ${people.length - peopleBad.length}/${people.length} healthy`)
    console.log(`  in sitemap          ${register.length - missingFromSitemap.length}/${register.length}`)
  }

  if (snapshot.problems.length === 0 && missingFromSitemap.length === 0) {
    console.log('\nno problems found')
  } else {
    console.log('\nPROBLEMS')
    for (const p of snapshot.problems) console.log(`  ${p.path}  ${p.note}`)
    for (const p of missingFromSitemap) console.log(`  ${p}  absent from sitemap`)
  }

  process.exit(snapshot.problems.length || missingFromSitemap.length ? 1 : 0)
}

main().catch(err => { console.error(err); process.exit(1) })
