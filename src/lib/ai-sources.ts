import 'server-only'
import {
  publicUpdates, publicPalaceArticles, publicKingdomArticles, publicInstitutions,
} from './visibility'
import { getAllNotables, getFonProfile } from './content'
import { allProjects } from './projects'
import { allQuarters } from './quarter-pages'
import { allFoundingNames, allChapters, getBody } from './community'
import { GUNEKU_QUARTERS_27 } from './quarters'

/* THE PUBLIC AI SOURCE BOUNDARY.
 *
 * One place decides what the assistant may read. Not the route, not the retriever, not a
 * filter somebody adds later next to a `for` loop — here, once, in a form that can be
 * enumerated and tested.
 *
 * ── The rule ─────────────────────────────────────────────────────────────────────────────
 *
 *   A record is AI-visible only if it is already published on a page a visitor can open
 *   without an account.
 *
 * Uncertain visibility is NOT visible. Every source below is built from an existing public
 * surface — `visibility.ts` for the editorial records, the reviewed community JSON for
 * people and places, the development register for projects — so a record that is held,
 * unpublished or noindexed is excluded here because it was already excluded there. This
 * module adds no new way to become public.
 *
 * ── What can never be reached from here ──────────────────────────────────────────────────
 *
 * Nothing in this file imports, or can transitively reach:
 *
 *   palace_correspondence   private letters to the Palace
 *   contributions           what a member wrote and how they know it
 *   profile_claims          claim notes and reviewer decisions
 *   community_members       member names, emails, quarters
 *   indigene_profiles       member-published directory profiles
 *   follows                 what a member subscribes to
 *
 * That is structural: `src/lib/db/*` is not imported and there is no database call anywhere
 * in the assistant's path. A test asserts it over the module's own source. The held Business
 * Directory and the six noindexed Kingdom stubs are excluded by `visibility.ts`, which is
 * the same predicate the sitemap and the search index use — so the assistant can never see
 * something the sitemap would not list.
 *
 * ── Personal contact details ─────────────────────────────────────────────────────────────
 *
 * The Fondom's own published address and telephone number are AI-visible: they are printed
 * on the contact page for exactly this purpose. No individual's mobile number, personal
 * email or address is, and none is carried in any source below. */

export type SourceType =
  | 'palace' | 'kingdom' | 'update' | 'institution' | 'person'
  | 'project' | 'quarter' | 'chapter' | 'contact'

/** One piece of evidence the assistant may use, and may cite. */
export type Source = {
  /** Stable within a build. Used to deduplicate; never shown to a visitor. */
  id: string
  type: SourceType
  /** What a citation calls it. The record's own name. */
  title: string
  /** The page a visitor can actually open. Always a site-relative path. */
  url: string
  /** The evidence itself — plain text, already stripped of markup, already truncated. */
  text: string
  /** Where the record dates itself, when it says so. Never inferred. */
  date?: string
  /** Extra words that should pull this source up, beyond those in the title and text. */
  keys?: string[]
}

const strip = (h: unknown) =>
  String(h ?? '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()

/** Evidence is capped hard. A long article contributes its opening, not its whole body:
 *  the model is answering from citations, not being handed the archive. */
const EVIDENCE_CHARS = 700

const clip = (s: string) =>
  s.length <= EVIDENCE_CHARS ? s : s.slice(0, EVIDENCE_CHARS).replace(/\s+\S*$/, '') + '…'

/* ── The sources ─────────────────────────────────────────────────────────────────────────
 * Each builder reads one public surface. None reads a database. */

function editorialSources(): Source[] {
  const out: Source[] = []

  for (const u of publicUpdates()) {
    const text = strip((u as { excerpt?: string }).excerpt || u.body)
    if (text.length < 40) continue
    out.push({
      id: `update:${u.slug}`, type: 'update', title: u.title,
      url: `/updates/${u.slug}`, text: clip(text),
      date: (u as { publishedAt?: string }).publishedAt?.slice(0, 10),
    })
  }

  for (const a of publicPalaceArticles()) {
    const text = strip(a.body)
    if (text.length < 60) continue
    out.push({
      id: `palace:${a.slug}`, type: 'palace', title: a.title,
      url: `/palace/${a.slug}`, text: clip(text),
      date: (a as { publishedAt?: string }).publishedAt?.slice(0, 10),
    })
  }

  for (const a of publicKingdomArticles()) {
    const text = strip(a.body)
    if (text.length < 60) continue
    out.push({
      id: `kingdom:${a.slug}`, type: 'kingdom', title: a.title,
      url: `/kingdom/${a.slug}`, text: clip(text),
    })
  }

  /* `publicInstitutions()` already drops anything held — the Business Directory among
     them — because it is the predicate the sitemap uses. */
  for (const i of publicInstitutions()) {
    const text = strip((i as { description?: string }).description)
    if (text.length < 40) continue
    const route = (i as { route?: string }).route || `/institutions/${i.id}`
    out.push({
      id: `institution:${i.id}`, type: 'institution', title: i.name,
      url: route, text: clip(text),
      keys: [(i as { abbreviation?: string }).abbreviation || ''].filter(Boolean),
    })
  }

  return out
}

function peopleSources(): Source[] {
  const out: Source[] = []

  const fon = getFonProfile()
  if (fon) {
    out.push({
      id: 'person:the-fon', type: 'person', title: fon.title,
      url: '/palace/fon-walters-profile',
      text: clip(strip((fon as { bio?: string }).bio) || fon.title),
      keys: ['fon', 'reigning fon', 'chief', 'king', 'ruler', 'hrh', 'fomuki'],
    })
  }

  /* Published profiles of sons and daughters. These are editorial records the Fondom
     wrote, not member-submitted directory profiles — those live in `indigene_profiles`,
     which this module cannot reach. */
  for (const n of getAllNotables()) {
    const bio = strip((n as { bio?: string }).bio)
    if (bio.length < 40) continue
    out.push({
      id: `person:${n.slug}`, type: 'person', title: n.name,
      url: `/sons-and-daughters/${n.slug}`, text: clip(bio),
    })
  }

  /* The register of founding names. Deceased entries are included — this is a public
     archive and the record of a Fondom includes those who are gone — but nothing here
     carries a claim, a member account, or anything about who has claimed an entry. */
  for (const p of allFoundingNames()) {
    out.push({
      id: `person:founding:${p.slug}`, type: 'person', title: p.display,
      url: `/indigenes/founding/${p.slug}`,
      text: clip([p.role, p.note, `Source: ${p.sourceLabel}.`].filter(Boolean).join(' ')),
      keys: p.aliases,
    })
  }

  return out
}

function placeAndBodySources(): Source[] {
  const out: Source[] = []

  for (const q of allQuarters()) {
    const links = q.links.map(l => l.label).join(', ')
    out.push({
      id: `quarter:${q.slug}`, type: 'quarter', title: `${q.name} quarter`,
      url: `/quarters/${q.slug}`,
      text: clip([
        `${q.name} is one of the twenty-seven quarters of Guneku.`,
        q.note ?? '',
        links ? `Records attached to it: ${links}.` : 'The archive holds no record about it yet.',
      ].filter(Boolean).join(' ')),
    })
  }

  for (const c of allChapters()) {
    out.push({
      id: `chapter:${c.id}`, type: 'chapter', title: `${c.org} — ${c.place}`,
      url: `/gudeca/chapters/${c.id}`,
      text: clip(`${c.org}, ${c.place}. Recorded as a ${c.scope === 'diaspora' ? 'diaspora' : 'home'} chapter.`),
      keys: ['gudeca', c.place],
    })
  }

  for (const id of ['traditional-council', 'gudeca-national', 'gudeca-eu-exco',
                    'michi-ebeng-committee', 'palace-household']) {
    const b = getBody(id)
    if (!b) continue
    out.push({
      id: `body:${id}`, type: 'institution', title: b.name,
      url: `/people/${id}`,
      text: clip(`${b.name}. ${b.standfirst ?? ''} ${b.sourceNote ?? ''}`),
    })
  }

  return out
}

function projectSources(): Source[] {
  return allProjects().map(p => ({
    id: `project:${p.slug}`, type: 'project' as const, title: p.name,
    url: p.recordHref ?? `/projects#${p.slug}`,
    text: clip(`${p.description} Recorded as ${p.status}. Carried by ${p.body}. As recorded: ${p.asRecorded}.`),
    keys: ['project', 'development'],
  }))
}

/* The Fondom's own published contact details, and the canonical facts a visitor most often
   asks for. These are deterministic answers rather than retrieved prose — see
   `src/lib/palace-ai.ts`, which prefers them over anything the model could say. */
function canonicalSources(): Source[] {
  return [
    {
      id: 'contact:palace', type: 'contact', title: 'Contact the Palace',
      url: '/contact',
      text: 'The Palace can be reached through the message form on Guneku.org, by email at '
          + 'info@guneku.org, or by telephone on +237 681 19 46 64.',
      keys: ['contact', 'email', 'telephone', 'phone', 'reach', 'address'],
    },
    {
      id: 'quarter:all', type: 'quarter', title: 'The twenty-seven quarters',
      url: '/kingdom',
      text: `Guneku has twenty-seven quarters: ${GUNEKU_QUARTERS_27.join(', ')}.`,
      keys: ['quarters', 'how many quarters', '27', 'twenty-seven'],
    },
  ]
}

let cache: Source[] | null = null

/** Every source the assistant may read. Built once per process. */
export function aiSources(): Source[] {
  if (!cache) {
    cache = [
      ...canonicalSources(),
      ...editorialSources(),
      ...peopleSources(),
      ...placeAndBodySources(),
      ...projectSources(),
    ]
  }
  return cache
}

/** The one predicate. A url that is not a site-relative public path is not a source, which
 *  keeps an absolute or scheme-bearing URL from ever reaching a citation. */
export function isAiVisible(s: Source): boolean {
  return typeof s.url === 'string'
    && s.url.startsWith('/')
    && !s.url.startsWith('//')
    && s.text.trim().length > 0
}

/** Counted for the report, and asserted in tests. */
export function sourceBreakdown(): Array<{ type: SourceType; count: number }> {
  const counts = new Map<SourceType, number>()
  for (const s of aiSources()) counts.set(s.type, (counts.get(s.type) ?? 0) + 1)
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}
