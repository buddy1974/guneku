/* Card imagery for records the archive holds no photograph for.
 *
 * Thirty-three of the thirty-nine Village Square records carry neither a
 * featured image nor an inline one. On a card grid that left a beige plate
 * with the word "Guneku" in it, four times over.
 *
 * The rule this file enforces: a card may carry a photograph from the Guneku
 * archive, but it must never be presentable as coverage of the record it sits
 * above. Three things keep that true.
 *
 *   1. The pool is curated and topic-matched — a cultural record gets a
 *      cultural scene, a road record gets road work — so the image is
 *      contextually honest even though it is not documentary.
 *   2. The pick is DETERMINISTIC on the slug, never Math.random(). The same
 *      record shows the same image on the server, on the client, and across
 *      every future build. A per-render random pick would both flicker under
 *      hydration and quietly rewrite the site's visual record on each deploy.
 *   3. Every fallback card is labelled "Archive photo" and its alt text is
 *      empty (decorative). Nothing about it asserts that it shows the event.
 *
 * The pools reference photographs the site already publishes — no new asset enters
 * the repository, so nothing here widens what the Fondom has made public.
 */

export type FallbackTopic =
  | 'palace'
  | 'culture'
  | 'diaspora'
  | 'education'
  | 'projects'
  | 'village'

const GALLERY = '/images/gallery'

/* Every path below is a photograph ALREADY published on this site — six of them on
   pages, the rest in the public galleries. Nothing new was introduced, no file was
   added to the repository, and no consent surface changed: an image that was not
   publishable before is not publishable here either. Each is 24–172 KB, so a card
   grid of four costs about as much as the one photograph it used to show. */
const POOL: Record<FallbackTopic, readonly string[]> = {
  palace: [
    '/images/palace/palace-front.webp',
    '/images/site/coronation-crowd.jpg',
    `${GALLERY}/revisitingtheinstallationofthe-guneku-traditional-council-friday-july302021/310819366_5744161102294772_4825958242619750671_n.jpg`,
    '/images/updates/web1.webp',
  ],
  culture: [
    '/images/updates/mukonge-dance.webp',
    '/images/updates/BARAKWE.webp',
    `${GALLERY}/mchibe-mta-event-guneku2023/11.jpeg`,
    `${GALLERY}/mukonge-dance-groupsin-meta/324594235_843623983391822_4827131840824151125_n.jpg`,
    `${GALLERY}/mukonge-dance-groupsin-meta/325852475_2050581091807437_5906399563550472450_n.jpg`,
  ],
  diaspora: [
    `${GALLERY}/gudeca-usa/358693208_784488843678968_5072328797716473942_n.jpg`,
    `${GALLERY}/gudeca-usa/363356586_784488777012308_3038868152591392589_n.jpg`,
    `${GALLERY}/gudeca-usa/358110662_784488613678991_4406787161102179036_n.jpg`,
  ],
  education: [
    `${GALLERY}/guneku-royal-community-library/306915385_5675589412485275_1704855586036343452_n.jpg`,
    `${GALLERY}/guneku-royal-community-library/307029915_5675589422485274_8481593825647352727_n.jpg`,
    `${GALLERY}/guneku-royal-community-library/307177174_5675589545818595_4941897146023036065_n.jpg`,
  ],
  projects: [
    `${GALLERY}/thetonmukom-windikroadwork/33304086_1891058904271697_2396186551068393472_n.jpg`,
    `${GALLERY}/thetonmukom-windikroadwork/33347209_1891058880938366_6465267987824771072_n.jpg`,
    `${GALLERY}/thetonmukom-windikroadwork/34063323_1898468886864032_3722916882404081664_n.jpg`,
    `${GALLERY}/thetonmukom-windikroadwork/34087912_1898468770197377_7776270767397797888_n.jpg`,
    `${GALLERY}/thetonmukom-windikroadwork/34140959_1898468720197382_1256358834083987456_n.jpg`,
  ],
  village: [
    '/images/updates/meta-ppl.webp',
    '/images/palace/palace-front.webp',
    `${GALLERY}/developmentprojects/147500989_3905126386198262_6536326892747619990_n.jpg`,
    '/images/updates/web1.webp',
    `${GALLERY}/developmentprojects/147733429_3905126229531611_1459798980830843941_n.jpg`,
  ],
}

/* What each pool actually shows — used for the card's title attribute so a
   reader who hovers, and a screen reader that surfaces it, is told plainly
   that this is archive material and not the event. */
const POOL_SUBJECT: Record<FallbackTopic, string> = {
  palace:    'the Guneku Fon’s Palace and the traditional council',
  culture:   'Guneku cultural events and Mukonge dance groups',
  diaspora:  'GUDECA gatherings of Guneku people abroad',
  education: 'the Guneku Royal Community Library',
  projects:  'community work on Guneku roads and development sites',
  village:   'Guneku village and its people',
}

/* Ordered most-specific first: the first rule that matches wins, so
   "mukonge-competition-announced" lands on culture rather than village.

   Matching is on whole words with prefix tolerance, never raw substring —
   `includes('road')` was quietly matching "broadcast" and putting a road-works
   photograph on a story about support for people with disabilities. */
const RULES: ReadonlyArray<readonly [FallbackTopic, readonly string[]]> = [
  ['education', ['scholarship', 'scholar', 'school', 'schools', 'pupil', 'pupils', 'student', 'students', 'exam', 'exams', 'examination', 'library', 'workshop', 'education', 'educational', 'gs', 'ps', 'entrance']],
  ['projects',  ['road', 'roads', 'roadwork', 'bridge', 'water', 'river', 'borehole', 'electricity', 'electrification', 'construction', 'piggery', 'farm', 'farming', 'agro', 'project', 'projects', 'development', 'hydro', 'solar', 'supply']],
  ['village',   ['tournament', 'football', 'sport', 'sports', 'match', 'parish', 'priest', 'priests', 'church', 'orphanage', 'disabilities', 'disability', 'donates', 'donation', 'minutes', 'announcement']],
  ['culture',   ['festival', 'dance', 'dances', 'dancing', 'mukonge', 'cultural', 'culture', 'mchibe', 'yam', 'roots', 'masquerade', 'juju']],
  ['diaspora',  ['gudeca', 'diaspora', 'chapter', 'chapters', 'usa', 'us', 'america', 'europe', 'germany', 'bonn', 'frankfurt', 'essen', 'agm', 'abroad', 'mutegene', 'homecoming']],
  ['palace',    ['palace', 'fon', 'fons', 'fondom', 'council', 'throne', 'coronation', 'enthronement', 'notable', 'notables', 'mecuda', 'mefu', 'policy', 'democracy', 'regent', 'kwifon']],
]

/* Words, not substrings. A rule key matches a token exactly or as its stem
   ("road" matches "roads" and "roadwork", never "broadcast"). */
function tokens(input: string): string[] {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean)
}

export function topicFor(slug: string, title = ''): FallbackTopic {
  const words = tokens(`${slug} ${title}`)
  for (const [topic, keys] of RULES) {
    for (const k of keys) {
      if (words.some(w => w === k || (w.startsWith(k) && w.length - k.length <= 3))) {
        return topic
      }
    }
  }
  return 'village'
}

/* FNV-1a. Small, stable, and dependency-free — the point is only that the
   same slug always resolves to the same index, on every runtime and build. */
function hash(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

export interface CardImage {
  src: string
  /** Empty for a fallback: the photograph is decorative, not evidence. */
  alt: string
  /** True when this is archive material rather than the record's own photograph. */
  isFallback: boolean
  /** Long-form provenance for the title attribute, fallback only. */
  provenance?: string
}

/**
 * The image a Village Square card should carry.
 * Returns the record's own photograph when it has one, otherwise a
 * deterministic, topic-matched, clearly-labelled photograph from the archive.
 */
export function cardImageFor(record: {
  slug: string
  title?: string
  featuredImage?: string | null
}): CardImage {
  if (record.featuredImage) {
    return { src: record.featuredImage, alt: record.title ?? '', isFallback: false }
  }

  const topic = topicFor(record.slug, record.title ?? '')
  const pool  = POOL[topic]
  const src   = pool[hash(record.slug) % pool.length]

  return {
    src,
    alt: '',
    isFallback: true,
    provenance: `Archive photograph of ${POOL_SUBJECT[topic]}. The Fondom archive holds no photograph of this record; this image does not show the event described.`,
  }
}
