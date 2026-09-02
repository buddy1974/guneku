import 'server-only'
import facts from '@/data/home/village-facts.json'
import {
  getAllUpdates, getAllPalaceArticles, getAllKingdomArticles,
  getAllInstitutions, getAllNotables, getFonProfile,
} from '@/lib/content'
import current from '@/data/current-notices.json'

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
      answer: 'The archive holds fifteen event albums totalling 338 photographs, and forty-six films from the Fondom’s own channel, each attached to the record it documents.',
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

function score(entry: Entry, qTokens: string[], raw: string) {
  let hits = 0
  const keys = entry.keys.map(k => k.toLowerCase())
  const keySet = new Set(keys)
  const hay = (keys.join(' ') + ' ' + entry.question).toLowerCase()
  let s = 0
  for (const t of qTokens) {
    /* A token that *is* one of the author's keywords is a strong signal — "donate"
       should reach the support entry even when it is the only real word in the query. */
    if (keySet.has(t)) { s += 4; hits += 1 }
    else if (hay.includes(t)) { s += 2; hits += 1 }
    else if (entry.answer.toLowerCase().includes(t)) { s += 0.5; hits += 0.5 }
  }
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

  /* Hand-written intents are weighted above derived records. */
  const ranked = [
    ...intents.map(e => { const r = score(e, effective, raw); return { e, s: r.s * 1.35, hits: r.hits } }),
    ...records.map(e => { const r = score(e, effective, raw); return { e, s: r.s, hits: r.hits } }),
  ].sort((a, b) => b.s - a.s)

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
