import 'server-only'
import facts from '@/data/home/village-facts.json'
import {
  getAllUpdates, getAllPalaceArticles, getAllKingdomArticles,
  getAllInstitutions, getAllNotables, getFonProfile,
} from '@/lib/content'
import current from '@/data/current-notices.json'
import { getImageGallery } from '@/lib/content'
import { approvedFilms } from '@/lib/guneku-tv'

/* The knowledge behind "Ask Guneku Palace".

   This is a retrieval layer over records that already exist on this site. It does not
   generate prose and it has no model behind it, so it cannot invent a fact about
   somebody's Fondom. Every answer it returns was written into a record by a person, and
   every answer carries the link to the page that holds it.

   When nothing scores well enough, it says so and offers the Palace form. That is the
   correct behaviour, not a failure. */

export type Entry = {
  id: string
  /** Words and phrases that should pull this entry up. */
  keys: string[]
  question: string
  answer: string
  href?: string
  hrefLabel?: string
}

const strip = (h: unknown) =>
  String(h || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()

const firstSentences = (t: string, n = 2) => {
  const parts = t.split(/(?<=\.)\s+/).filter(Boolean)
  return parts.slice(0, n).join(' ').slice(0, 420)
}

/* Hand-written intents for the questions people actually ask. These outrank anything
   derived automatically, because the wording has been checked. */
function intentEntries(): Entry[] {
  /* Counted from the record itself, every time. */
  const albums = getImageGallery()?.albums ?? []
  const albumCount = albums.length
  const photoCount = albums.reduce(
    (n, a: { images?: unknown[] }) => n + (a.images?.length ?? 0), 0)
  const filmCount = approvedFilms().length

  const fon = getFonProfile()
  const reg = current.development as Array<{ name: string; class?: string; status: string; description: string; href: string }>
  const running = reg.filter(d => ['PROJECT', 'PROGRAMME'].includes(String(d.class)))

  const out: Entry[] = facts.faq.map((f, i) => ({
    id: 'faq-' + i,
    keys: [f.q, ...f.q.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)],
    question: f.q,
    answer: f.a,
    href: f.href,
    hrefLabel: f.hrefLabel,
  }))

  out.push(
    {
      id: 'fon-name',
      keys: ['who is the fon', 'current fon', 'reigning fon', 'chief', 'king', 'ruler', 'monarch', 'hrh', 'fomuki'],
      question: 'Who is the reigning Fon of Guneku?',
      answer: fon
        ? `${fon.title}. He was anointed in public at the Transfiguration Ceremony on 27 February 2015 and presented himself to the people of Meta on 30 December 2016. His predecessor, HRH Fon Fomuki Patrick Nji, reigned from 1965 until his passing on 28 January 2015.`
        : 'The reigning Fon is HRH Fon Fomuki Walters Ticha IX.',
      href: '/palace/fon-walters-profile', hrefLabel: 'The reigning Fon',
    },
    {
      id: 'succession',
      keys: ['succession', 'coronation', 'enthronement', 'anointing', 'transfiguration', 'when was he crowned', 'became fon'],
      question: 'How did the succession happen?',
      answer: 'The succession ran as distinct stages: HRH Fon Fomuki Patrick Nji acceded in 1965 and passed on 28 January 2015; the Transfiguration Ceremony and public anointing of HRH Fomuki Walters Ticha followed on 27 February 2015; a launching gala was held at the Mbengwi Council Hall in November 2015; and the public presentation to the people of Meta took place on 30 December 2016.',
      href: '/palace/the-coronation', hrefLabel: 'The Coronation record',
    },
    {
      id: 'population',
      keys: ['population', 'how many people', 'inhabitants', 'residents', 'how big'],
      question: 'How many people live in Guneku?',
      answer: "The Fondom's current figure is approximately 15,000. An older village account, written years earlier, recorded approximately 10,000 at the time of writing; that is a historical figure, not a competing estimate.",
      href: '/kingdom/about-guneku', hrefLabel: 'About Guneku',
    },
    {
      id: 'quarters',
      keys: ['quarters', 'how many quarters', 'twenty seven', '27', 'villages within', 'wards'],
      question: 'How many quarters does Guneku have?',
      answer: 'Twenty-seven. The full list is published on the Kingdom page, and the indigenes directory lets sons and daughters record which quarter they come from.',
      href: '/kingdom', hrefLabel: 'The 27 quarters',
    },
    {
      id: 'projects',
      keys: ['projects', 'development', 'what is being built', 'current work', 'ongoing'],
      question: 'What development work is under way?',
      answer: `The development register holds ${reg.length} entries. Work currently recorded as running includes ${running.slice(0, 4).map(d => d.name).join(', ')}. Every entry is published at the stage its own sources establish — a proposal is recorded as a proposal.`,
      href: '/projects', hrefLabel: 'The development register',
    },
    {
      id: 'support',
      keys: ['support', 'donate', 'donation', 'help', 'contribute', 'give money', 'fund', 'sponsor', 'volunteer'],
      question: 'How can I support a Guneku project?',
      answer: 'Tell the Palace which project interests you and how you would like to help — funds, materials, professional expertise, volunteering or partnership. No payment is taken on this site; your offer is sent to the Palace for review.',
      href: '/support', hrefLabel: 'Offer support',
    },
    {
      id: 'scam',
      keys: ['scam', 'fraud', 'impostor', 'is this real', 'asking for money', 'verify', 'whatsapp'],
      question: 'Someone asked me for money in the name of Guneku. Is it genuine?',
      answer: 'The Fondom publishes a notice on how official announcements are made and how to check a request before sending anyone money. Members have had WhatsApp accounts compromised and used to ask others for money. Please read the notice and, if in doubt, ask the Palace directly.',
      href: '/updates/how-guneku-communicates-verify-requests-2026', hrefLabel: 'How Guneku communicates',
    },
    {
      id: 'festivals',
      keys: ['festival', 'michi', 'mchi', 'ebeng', 'ifuh', 'itah', 'yam', 'mukonge', 'dance', 'culture', 'celebration'],
      question: 'Which festivals does Guneku hold?',
      answer: 'Mɨchi Ǝbeŋ, the festival of return, revived in 2023 at the Palace after a six-year break; and Ifuh Itah, the yam harvest festival of the people of Fringyeng, revived in the same year and held each December. Musongong is the dance of the Guneku people, and the Mukonge dance groups compete at Mɨchi Ǝbeŋ.',
      href: '/institutions/michi-ebeng-festival', hrefLabel: 'Mɨchi Ǝbeŋ',
    },
    {
      id: 'photos',
      keys: ['photos', 'photographs', 'pictures', 'images', 'gallery', 'videos', 'films', 'archive', 'watch'],
      question: 'Where can I see photographs and films of Guneku?',
      /* Counted, not typed. A hard-coded 338 went stale the day a photograph was
         reconciled in from staging, and a checked answer that quietly becomes wrong is
         worse than one that admits it does not know. */
      answer: `The archive holds ${albumCount} event albums totalling ${photoCount} photographs, and ${filmCount} films from the Fondom’s own channel, each attached to the record it documents.`,
      href: '/gallery/images', hrefLabel: 'The image gallery',
    },
    {
      id: 'contact',
      keys: ['contact', 'reach', 'phone', 'telephone', 'email', 'address', 'get in touch', 'appointment', 'visit the palace'],
      question: 'How do I contact the Palace?',
      answer: 'Through the message form on this site, by email at info@guneku.org, or by telephone on +237 681 19 46 64. For an appointment or a visit, use the message form and choose that topic so it reaches the right person.',
      href: '/contact', hrefLabel: 'Contact',
    },
    {
      id: 'where',
      keys: ['where', 'location', 'directions', 'how to get there', 'map', 'mbengwi', 'momo', 'cameroon'],
      question: 'Where is Guneku?',
      answer: 'Guneku is in Mbengwi Subdivision, Momo Division, in the North West Region of Cameroon, reachable by road from Mbengwi and from Bamenda. It shares boundaries with Mbemi, Nyen, Tugi, Zang-Tembeng, Oshie, Mundum and Bafut. The Fondom has not published a map of the village.',
      href: '/kingdom/about-guneku', hrefLabel: 'About Guneku',
    },
    {
      id: 'language',
      keys: ['language', 'dialect', 'menemo', 'speak', 'meta language'],
      question: 'What language is spoken in Guneku?',
      answer: 'The people of Guneku speak MENEMO, a Meta dialect. The village record notes that some Meta people call the dialect “Meta”, which it says is not correct.',
      href: '/kingdom/about-guneku', hrefLabel: 'About Guneku',
    },
    {
      id: 'market',
      keys: ['market', 'ngon', 'market day', 'trade', 'buy', 'eight day week'],
      question: 'When is market day in Guneku?',
      answer: 'Guneku keeps an eight-day market cycle. The eighth day, Ngon, is the market day held in Guneku itself. The other days fall in the surrounding quarters — Tan in Ngamunghe, Mbon in Mbengeghang, Eje’e in Ngamunam, and Kwe in Fringyeng.',
      href: '/kingdom/about-guneku', hrefLabel: 'About Guneku',
    },
    {
      id: 'farming',
      keys: ['farming', 'agriculture', 'crops', 'cattle', 'grazing', 'coffee', 'palm', 'maize', 'food'],
      question: 'What does Guneku farm?',
      answer: 'The cash crops include oil palm, raffia palm, coffee, maize and groundnuts, with plantains and cocoyam coming mainly from upper Guneku. Guneku has the highest grazing surface area in Meta; cattle are reared by the Mbororo, and by many natives too.',
      href: '/kingdom/about-guneku', hrefLabel: 'About Guneku',
    },
    {
      id: 'health',
      keys: ['health', 'hospital', 'clinic', 'medical', 'doctor', 'nurse', 'health centre'],
      question: 'What health facilities does Guneku have?',
      answer: 'The village record states there are three medical facilities in Guneku. The archive separately records three Integrated Health Centres — at Munam, Mbengeghang and Fringyeng — and the Open Door Medical Clinic in Njinebai.',
      href: '/institutions/guneku-health-estate', hrefLabel: 'The health centres',
    },
    {
      id: 'schools',
      keys: ['school', 'schools', 'education', 'scholarship', 'study', 'pupils', 'students', 'university'],
      question: 'What schools and scholarships are there?',
      answer: 'Guneku has two government secondary institutions — G.S.S. Guneku and G.S.S. Ngamungeh — and seven government primary schools. Guneku Education & Scholarship Day 2026 targets 50 scholarships, full and partial, with registration through the Royal Community Library.',
      href: '/education', hrefLabel: 'Education & scholarships',
    },
    {
      id: 'diaspora',
      keys: ['diaspora', 'abroad', 'overseas', 'chapters', 'branches', 'gudeca europe', 'usa', 'germany'],
      question: 'How is the Guneku diaspora organised?',
      answer: 'GUDECA has eight constituted chapters across five countries and three continents. Nine countries were represented at the GUDECA Europe meeting in Bonn in March 2026 — attendance, which is a different measure from chapters. Guneku people are known to live in twelve to thirteen locations worldwide.',
      href: '/diaspora', hrefLabel: 'The diaspora',
    },
  )
  return out
}

/* Everything else on the site, indexed so a question about a specific record can find
   it even when no hand-written intent covers the subject. */
function recordEntries(): Entry[] {
  const out: Entry[] = []

  for (const u of getAllUpdates().slice(0, 40)) {
    const text = strip((u as { excerpt?: string }).excerpt || u.body)
    if (text.length < 40) continue
    out.push({
      id: 'update-' + u.slug,
      keys: [u.title, ...u.title.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)],
      question: u.title,
      answer: firstSentences(text),
      href: `/updates/${u.slug}`, hrefLabel: 'Read the record',
    })
  }
  for (const a of [...getAllPalaceArticles(), ...getAllKingdomArticles()]) {
    const text = strip(a.body)
    if (text.length < 60) continue
    const section = (a as { section?: string }).section === 'palace' ? 'palace' : 'kingdom'
    out.push({
      id: section + '-' + a.slug,
      keys: [a.title, ...a.title.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)],
      question: a.title,
      answer: firstSentences(text),
      href: `/${section}/${a.slug}`, hrefLabel: 'Read the record',
    })
  }
  for (const i of getAllInstitutions()) {
    const d = strip((i as { description?: string }).description)
    if (d.length < 40) continue
    if ((i as { publicVisibility?: string }).publicVisibility === 'hold') continue
    const href = (i as { route?: string }).route || `/institutions/${i.id}`
    out.push({
      id: 'inst-' + i.id,
      keys: [i.name, (i as { abbreviation?: string }).abbreviation || '', ...i.name.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)].filter(Boolean),
      question: i.name,
      answer: firstSentences(d),
      href, hrefLabel: 'Read the record',
    })
  }
  for (const n of getAllNotables()) {
    const bio = strip((n as { bio?: string }).bio)
    if (bio.length < 40) continue
    out.push({
      id: 'notable-' + n.slug,
      keys: [n.name, ...n.name.toLowerCase().split(/\s+/)],
      question: n.name,
      answer: firstSentences(bio),
      href: `/notables/${n.slug}`, hrefLabel: 'Full profile',
    })
  }
  return out
}

let cache: { intents: Entry[]; records: Entry[] } | null = null
function index() {
  if (!cache) cache = { intents: intentEntries(), records: recordEntries() }
  return cache
}

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'of', 'in', 'on', 'at', 'to', 'for',
  'and', 'or', 'do', 'does', 'did', 'i', 'you', 'we', 'they', 'it', 'how', 'what', 'when', 'where',
  'who', 'why', 'can', 'could', 'please', 'me', 'my', 'about', 'there', 'any', 'have', 'has', 'guneku'])

function tokens(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2 && !STOP.has(t))
}

/* ── How much a word tells you ──────────────────────────────────────────────────────────
 *
 * "Fomuki" appears in dozens of records; "crowned" appears in one or two. Scoring both the
 * same is how a question about a date gets answered by whichever article mentions the Fon
 * most often, and on 2026-09-06 that is exactly what happened: *"When exactly was HRH Fon
 * Fomuki Walters Ticha crowned?"* returned the 2024 New Year speech, which says nothing
 * about a coronation and opens with the date 1 January 2024. Cited, verbatim, and an answer
 * to a different question — the worst kind of wrong answer this archive can give, because
 * the one date it withdrew was a coronation date.
 *
 * So a token is weighted by how rare it is across the whole index. Ordinary inverse document
 * frequency, and it fixes the class rather than the instance: naming a person no longer
 * outweighs naming the subject. */
let idfCache: Map<string, number> | null = null

function idf(): Map<string, number> {
  if (idfCache) return idfCache
  const { intents, records } = index()
  const all = [...intents, ...records]
  const seen = new Map<string, number>()
  for (const e of all) {
    const inThis = new Set([
      ...tokens(e.keys.join(' ')),
      ...tokens(e.question),
    ])
    for (const t of inThis) seen.set(t, (seen.get(t) ?? 0) + 1)
  }
  const n = Math.max(all.length, 1)
  idfCache = new Map(
    [...seen].map(([t, c]) => [t, Math.log((n + 1) / (c + 1)) / Math.log(n + 1)]),
  )
  return idfCache
}

/** How much weight one matching word deserves. A word the index has never seen is as
 *  distinguishing as it gets; a word in half the entries is nearly worthless. */
function weight(token: string): number {
  const w = idf().get(token)
  /* Unknown to the index, but present in an answer — treated as distinguishing, because a
     word nothing was keyed on is not a word everything shares. */
  if (w === undefined) return 1
  /* Floored so a common word still counts for something: a question made only of common
     words must still reach its entry. */
  return Math.max(0.25, w)
}

function score(entry: Entry, qTokens: string[], raw: string) {
  let hits = 0
  const keys = entry.keys.map(k => k.toLowerCase())
  /* Every key, and every word inside a key. A multi-word key like "when was he crowned" is
     the author's most specific anticipation of a question, and until 2026-09-06 it was the
     weakest signal in this function: only whole-phrase keys reached `keySet`, so the words
     the author actually wrote counted for nothing unless the visitor typed the phrase. */
  const keySet = new Set([...keys, ...tokens(keys.join(' '))])
  const hay = (keys.join(' ') + ' ' + entry.question).toLowerCase()

  /* Scored strongest-first, with each further match worth less than the one before.
   *
   * Without that, matching five words of one long title beats matching the single word the
   * question is actually about — which is how *"When exactly was HRH Fon Fomuki Walters Ticha
   * crowned?"* reached an article whose title repeats the Fon's name and whose subject is a
   * New Year speech. Five weak signals are not stronger than one strong one; they are one
   * signal, seen five times.
   *
   * Saturation, in the sense every retrieval system means it. The first match carries its
   * full weight, the second half, the third a third. */
  const contributions: Array<{ v: number; h: number }> = []
  for (const t of qTokens) {
    const w = weight(t)
    /* A token that *is* one of the author's keywords is a strong signal — "donate"
       should reach the support entry even when it is the only real word in the query. */
    if (keySet.has(t)) contributions.push({ v: 4 * w, h: 1 })
    else if (hay.includes(t)) contributions.push({ v: 2 * w, h: 1 })
    else if (entry.answer.toLowerCase().includes(t)) contributions.push({ v: 0.5 * w, h: 0.5 })
  }
  contributions.sort((a, b) => b.v - a.v)
  let s = 0
  contributions.forEach((c, i) => { s += c.v / (i + 1); hits += c.h })
  /* A phrase the author anticipated verbatim is worth more than scattered words. */
  for (const k of keys) {
    if (k.length > 6 && raw.includes(k)) s += 3
  }
  /* `hits` is how much of the question this entry actually accounts for. Score alone is
     not enough: one strong keyword inside a long question about something else clears any
     fixed bar, which is how a private question can be answered with a public statistic. */
  return { s, hits }
}

export type AskResult = {
  answered: boolean
  answer: string
  question?: string
  links: Array<{ href: string; label: string }>
  suggestions: string[]
}

/* Identity, not a flag on the entry: the two sets come from different builders and an
   entry never moves between them. */
function isIntent(e: Entry): boolean {
  return index().intents.includes(e)
}

export function ask(qRaw: string): AskResult {
  const raw = String(qRaw || '').toLowerCase().trim()
  const qTokens = tokens(raw)
  const { intents, records } = index()

  const suggestions = ['Who is the reigning Fon?', 'How many quarters does Guneku have?',
    'How can I support a project?', 'Where can I see photographs?', 'How do I contact the Palace?']

  /* A question can be entirely stop-words — "where is Guneku?" is every one of them.
     Fall back to matching the raw phrase so those still find their entry, and never
     return an empty answer. */
  const effective = qTokens.length > 0
    ? qTokens
    : raw.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2)

  if (effective.length === 0) {
    return {
      answered: false,
      answer: "I don't have a verified Guneku source for that yet.",
      links: [], suggestions,
    }
  }

  /* Hand-written intents are weighted above derived records, and by a clear margin rather
     than a nudge. The two are different kinds of thing: an intent is an answer somebody
     checked, written to answer a question; a record is an article whose title happened to
     contain some of the words. When both match, the checked answer is the better answer
     nearly always — and when it is not, the record is still offered as a link beneath.

     1.35 was too small a thumb on the scale. *"When exactly was HRH Fon Fomuki Walters Ticha
     crowned?"* put a 2024 New Year speech first and the succession record second, because
     the article's title repeats the Fon's name five times and the question named him too.
     A question about a date was answered with a different date, cited and verbatim — and the
     one date this archive has withdrawn was a coronation date. */
  const ranked = [
    ...intents.map(e => { const r = score(e, effective, raw); return { e, s: r.s * 1.9, hits: r.hits } }),
    ...records.map(e => { const r = score(e, effective, raw); return { e, s: r.s, hits: r.hits } }),
  ].sort((a, b) => b.s - a.s)

  /* ── When a checked answer is nearly as good, it is the better answer ─────────────────
   *
   * A derived record can outscore an intent simply by repeating a person's name. The 2024
   * New Year speech scored 9.70 against the succession record's 8.59 for *"When exactly was
   * HRH Fon Fomuki Walters Ticha crowned?"* — five name tokens against the one word the
   * question was about. It answered a question about a date with a different date, quoted
   * and cited, and the one date this archive has withdrawn is a coronation date.
   *
   * Raising the global intent multiplier would have fixed that case by distorting every
   * other one. This is narrower and says what is actually meant: **within a small margin,
   * prefer the answer a person wrote and checked.** Outside that margin the record still
   * wins, which is right — "Who is Marcel Tabit Akwe?" should return Marcel's record and
   * not a topic page, and it does, by a wide margin.
   *
   * The record is not lost either way: it stays in `ranked` and appears as a link beneath
   * the answer, so a reader who wanted the article still reaches it in one click. */
  const topRecord = ranked.find(r => !isIntent(r.e))
  const topIntent = ranked.find(r => isIntent(r.e))
  if (topRecord && topIntent && topRecord.s > topIntent.s && topIntent.s >= topRecord.s * 0.85) {
    ranked.splice(ranked.indexOf(topIntent), 1)
    ranked.unshift(topIntent)
  }

  const best = ranked[0]
  /* Below this the match is coincidence rather than an answer. The bar rises with the
     length of the question, so a one-word query is not held to a five-word standard. */
  const threshold = Math.min(5.4, 3.6 + effective.length * 0.6)

  /* A longer question must also be substantially covered. Below half its content words,
     the entry is answering a different question from the one that was asked, and saying
     so plainly is better than returning a confident irrelevance. */
  const coverage = best ? best.hits / effective.length : 0
  const covered = effective.length < 4 || coverage >= 0.5

  if (!best || best.s < threshold || !covered) {
    return {
      answered: false,
      answer: "I don't have a verified Guneku source for that yet.",
      links: [],
      suggestions,
    }
  }

  const links: Array<{ href: string; label: string }> = []
  if (best.e.href) links.push({ href: best.e.href, label: best.e.hrefLabel || 'Read the record' })
  for (const r of ranked.slice(1, 4)) {
    if (r.s >= 4 && r.e.href && !links.some(l => l.href === r.e.href)) {
      links.push({ href: r.e.href, label: r.e.question.slice(0, 60) })
    }
  }

  return { answered: true, answer: best.e.answer, question: best.e.question, links, suggestions }
}
