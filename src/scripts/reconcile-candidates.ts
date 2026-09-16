import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { classifyPool, type Classification, type PoolEntry } from '../lib/identity-index'

/* Run every name the Fondom has collected past every identity the repository already holds,
 * and print what the rules say about each one.
 *
 * Run with:  npm run reconcile:candidates
 *
 * It reads. It never writes. Adding a name to the register is a deliberate edit of
 * founding-names.json by a person who has read this output and agreed with it — the whole
 * point is that the machine narrows the question and a human answers it.
 *
 * ── Where the names come from ────────────────────────────────────────────────────────────
 *
 *   1. The author names on the community record in content/source/. Display names only; not
 *      one line of message text, not one number, not one handle is read by this script.
 *   2. The people named inside records this site already publishes — the 2021 zonal council
 *      installation, the quarter elections, the GUDECA branch record. Listed below rather
 *      than scraped, because a name pulled out of prose by a regular expression is a name
 *      nobody checked, and every one of these was read in its own sentence first.
 *
 * No telephone number, address, handle, photograph or private detail appears in this file or
 * in anything it prints. */

const REPO = join(import.meta.dirname, '..', '..')

/** Display names carried on the community record. Read from the export so the list cannot
 *  drift from the source; nothing else in that file is touched. */
function communityRecordNames(): string[] {
  const path = join(REPO, 'content', 'source', 'guneku-whatsapp-export.json')
  const doc = JSON.parse(readFileSync(path, 'utf-8')) as {
    messages: Array<{ author: string }>
  }
  /* A few rows credit two people at once — "Constantine Ndenge / Sam Fongoh". That is two
     authors, not a person with a slash in his name, so it is split before classifying. */
  const authors = doc.messages.flatMap(m => m.author.split('/').map(a => a.trim()))
  return [...new Set(authors.filter(Boolean))].sort()
}

/** People named in records this site already publishes, each read in its own sentence.
 *  The comment against each group is the record that establishes it. */
const RECORD_NAMES: Array<{ source: string; priority: number; names: string[] }> = [
  {
    /* updates/meta-cultural-festival-holds-in-guneku-village-2 — the zonal traditional
       councils elected and installed at the Palace on 30 July 2021. */
    source: 'Zonal councils installed 30 July 2021',
    priority: 1,
    names: [
      'Fomujang David', 'Bah Andrew', 'Lydia Munyam',
      'Timothy Tembeng', 'Muki Martin', 'Evelyn Ngum',
      'Geh Humphrey', 'John Ndakwe', 'Julia Forkwen',
      'John Agwetang', 'Anya Beltus', 'Eni Julia',
    ],
  },
  {
    /* The same record — the eight members of the Guneku Water Management Committee
       installed on the same day. */
    source: 'Guneku Water Management Committee, installed 30 July 2021',
    priority: 1,
    names: [
      'Sam Ndimasong', 'Fon Joseph', 'Choo Samuel', 'Tah Rene',
      'Gah Daniel', 'Fondom Calvin', 'Gongho Onias', 'Tasi Elvis',
    ],
  },
  {
    /* updates/democracy-in-guneku-fon-fomuki-injects-new-blood-for-easy-administration */
    source: 'Quarter elections coverage, 2021',
    priority: 1,
    names: ['Madam Timkoh Florence', 'Pa Wanjeh Augustine'],
  },
  {
    /* institutions/gudeca-branches.json — the officers that record names. */
    source: 'GUDECA branch record',
    priority: 3,
    names: ['Ba Miki Tayong', 'President Constantine Ndenge'],
  },
  {
    /* Named by the Product Owner from the community record, 16 September 2026. */
    source: 'Product Owner, 16 September 2026',
    priority: 4,
    names: ['Harriet Fomuki', 'Julius Agwetang', 'Fidelis Njoh'],
  },
  {
    /* Confirmed as Guneku indigenes by the Product Owner, as data controller, on
       16 September 2026 - a second and stronger statement than the list above. Each of
       these is somebody the Fondom says belongs in the register, several with a residence,
       an occupation or an affiliation supplied alongside the name.

       Written here exactly as the Fondom wrote them, name order and courtesy forms
       included, so the classifier sees what was actually said rather than a tidied
       version of it. Where the Fondom supplied two forms of one name - a maiden name, an
       inverted order - both are listed, because the point is to see them collapse onto one
       identity rather than to assume they will. */
    source: 'Confirmed by the Fondom, 16 September 2026',
    priority: 4,
    names: [
      'Oswald Tebit', 'Kenneth Tebit',
      'Delphine Mah Nforgwei', 'Delphine Akwe',
      'Dr. Joyce Akwe',
      'Loveline Mufor', 'Loveline Akwe',
      'William Akwe', 'Goddy Akwe',
      'Emmanuel Bayere', 'Valentine Andom', 'Ma Clara Fongho',
      'Ndum Victor', 'victor ndum',
      'Samuel Ndum', 'Ndum Wilfred Tembe',
      'Tabot Humphrey', 'Humphrey Tabot',
      'Tibi Enert', 'Tibi Enerst Tibi',
      'Tibi Divine', 'Tibi Felix', 'Tibi Gladys Fri', 'Tibi Vincent',
      'Tibi Nicoline', 'Tibi Elvies',
      'Injeh Nancy Abia', 'Oliver Ngu Tembeng', 'James Mbacham',
      'Ignatius Tabi Chum', 'Tabi Ignatius Chum',
    ],
  },
  {
    /* A second confirmation on 16 September 2026, carrying a statement about Guneku rather
       than only a list of names: the Fondom confirmed that there is one Fomuki family in
       Guneku and that it is the Palace family. That settles membership for the names below
       and nothing else - an office or a title still has to be established separately.

       The Andoms and Boston Prince are in the same batch and carry no such statement. */
    source: 'Confirmed by the Fondom, 16 September 2026 (second)',
    priority: 4,
    names: [
      'Fabian Fomuki', 'Fomuki Ijang', 'Indah Fomuki', 'Fomuki Tebi',
      'Mandems Fomuki', 'Eric Fomuki', 'Humphrey Fomuki', 'Albert Fomuki',
      'Harriet Fomuki',
      'Boston Prince', 'Fidelis Njoh',
      'Andom Stanley', 'Humphrey Andom', 'Beltha Andom',
      'Andom Racheal', 'Evelyn Andom', 'Alfred Tinga Andom',
    ],
  },
]

const ORDER: Classification[] = ['EXISTING', 'NEW_SAFE', 'AMBIGUOUS', 'INSUFFICIENT']

function main() {
  const pool: PoolEntry[] = [
    ...communityRecordNames().map(name => ({ name, from: 'Community record', priority: 6 })),
    ...RECORD_NAMES.flatMap(g =>
      g.names.map(name => ({ name, from: g.source, priority: g.priority }))),
  ]

  const verdicts = classifyPool(pool)
  const counts = Object.fromEntries(ORDER.map(c => [c, 0])) as Record<Classification, number>

  for (const group of ORDER) {
    const rows = verdicts.filter(v => v.classification === group)
    counts[group] = rows.length
    if (rows.length === 0) continue

    console.log(`\n${group}  (${rows.length})`)
    console.log('─'.repeat(78))
    for (const r of rows) {
      const target = r.resolvesTo ? `  ->  ${r.resolvesTo.id}` : ''
      console.log(`  ${r.candidate}${target}`)
      console.log(`      ${r.from} · ${r.reason}`)
    }
  }

  console.log(`\n${'═'.repeat(78)}`)
  console.log(
    `  considered ${pool.length}   ` +
    ORDER.map(c => `${c.toLowerCase()} ${counts[c]}`).join('   '),
  )
  console.log(
    '  Only NEW_SAFE may be written into founding-names.json, and only by a person.\n',
  )
}

main()
