import 'server-only'
import {
  type Business, publicCuratedBusinesses, getCuratedBusiness, mergeBusinesses,
} from './businesses'
import { listPublicBusinesses, getPublicBusiness } from './db/businesses'
import { DbConfigError } from './db/client'

/* Where the two halves of the directory meet.
 *
 * The curated businesses are in git and always available. The registered ones are in Neon,
 * which may be unconfigured, unreachable, or — as it is on the day this ships — missing the
 * table entirely, because applying a migration needs a credential that does not exist in the
 * environment this was built in (R-031).
 *
 * So every read here is wrapped. A database that cannot answer produces an empty list and the
 * page renders the curated half, which is exactly how `/indigenes` behaves when
 * `/api/indigenes/all` answers 503: the register still shows, and nothing on the page claims
 * that nobody has registered. A directory that 500s because a table is missing would take the
 * whole section down for the sake of a half of it that is empty anyway.
 *
 * The failure is logged server-side and never surfaced. A reader does not need to know which
 * half of a directory is asleep. */

/* A database that is not configured is an expected state here, not a fault: it is what every
   build outside Vercel looks like, and what production looks like until migration 0005 runs.
   It gets one line. Anything else gets the whole error, because anything else is a fault. */
function note(what: string, err: unknown): void {
  if (err instanceof DbConfigError) {
    console.info(`${what}: no database configured; showing the curated records only.`)
    return
  }
  console.error(`${what}:`, err)
}

async function registered(): Promise<Business[]> {
  try {
    return await listPublicBusinesses()
  } catch (err) {
    note('Registered businesses unavailable', err)
    return []
  }
}

/** Every business a stranger may see, curated first. */
export async function publicBusinessesForDisplay(): Promise<Business[]> {
  return mergeBusinesses(publicCuratedBusinesses(), await registeredMemo())
}

/** One public business by slug, from whichever half holds it. Curated wins a collision: it
 *  is the reviewed record, and a registered business can never take a curated slug because
 *  `createBusiness` is given the curated slugs as reserved. */
export async function publicBusinessForDisplay(slug: string): Promise<Business | null> {
  const curated = getCuratedBusiness(slug)
  if (curated && curated.status === 'public') return curated
  if (curated) return null

  try {
    return await getPublicBusiness(slug)
  } catch (err) {
    note('Registered business unavailable', err)
    return null
  }
}

/** The slugs a newly created business must not take. Curated records are statically routed,
 *  so a registered business sharing one would be unreachable behind it. */
export function reservedBusinessSlugs(): string[] {
  return publicCuratedBusinesses().map(b => b.slug)
}

/* ── The other direction ──────────────────────────────────────────────────────────────────
 *
 * A business page names the son or daughter of Guneku behind it. Until the Fondom resolved
 * the last held relationships on 2026-09-17 the reverse was not worth rendering, because most
 * links were held and a register entry would have had nothing to show. Now that every
 * published business resolves to somebody, a person's own entry can say what they run.
 *
 * The register pages are statically generated — a hundred and thirteen of them — so the
 * database read is memoised for the life of the process. Without that, a build with no
 * database attempts one connection per page and writes a hundred and thirteen identical lines
 * saying so. */
let registeredOnce: Promise<Business[]> | null = null

function registeredMemo(): Promise<Business[]> {
  registeredOnce ??= registered()
  return registeredOnce
}

/** Every published business this person is recorded against, curated and registered. */
export async function businessesForPerson(personSlug: string): Promise<Business[]> {
  const all = mergeBusinesses(publicCuratedBusinesses(), await registeredMemo())
  return all.filter(b => (b.people ?? []).some(p => p.personSlug === personSlug))
}
