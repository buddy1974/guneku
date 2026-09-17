import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

/* The words a visitor is allowed to meet.
 *
 * ── What was wrong ───────────────────────────────────────────────────────────────────────
 *
 * Reading Guneku as a visitor turned up developer language on published pages. A reader who
 * opened the Fon's own practice in the directory was told:
 *
 *     "This repository's own profile of the reigning Fon records his current work as…"
 *
 * and a reader who opened the map was told "One coordinate exists in this repository." Four
 * strings across two files, on five pages. They read as accurate to whoever wrote them,
 * because in a source file they were accurate. On the page they are a word from a different
 * trade, in the middle of a sentence about a Fon.
 *
 * ── The distinction this holds ───────────────────────────────────────────────────────────
 *
 * Provenance notes that no page renders may say "repository", and several do: that is what
 * they are for, and rewriting them would make them vaguer for the next editor without
 * helping any reader. The fields below are the ones that reach a page, so they answer to the
 * reader instead.
 *
 * `schema` is not in the list on purpose. Every page carries `https://schema.org` in its
 * JSON-LD, which is markup rather than copy, and a check that fires on all 304 pages teaches
 * a reader of this suite to ignore it. */

/* Words that only ever mean the trade. Deliberately not here:
 *
 *   endpoint    "A road is a line between two points, and neither endpoint has a recorded
 *               coordinate" — the end of a road. This list flagged that sentence, which is
 *               plain English and correct.
 *   migration   people migrate, and this Fondom's records are largely about people who did.
 *   commit      a person commits to something.
 *   schema      every page carries `https://schema.org` in its JSON-LD, which is markup and
 *               not copy; a check that fires on all 304 pages trains its reader to ignore it.
 */
const DEVELOPER_WORDS =
  /\b(repositor(y|ies)|codebase|slug|JSON|vitest|eslint|refactor|localhost|git\b)\b/i

/** Fields whose text is rendered on a page, by the file that holds them. */
const PUBLISHED_FIELDS: Record<string, string[]> = {
  'src/data/businesses/businesses.json': ['evidence', 'sourceNote', 'holdReason', 'tagline', 'description'],
  'src/data/explore/locations.json': ['state', 'reason', 'description', 'note'],
}

function stringsAt(doc: unknown, wanted: string[], trail = ''): Array<{ field: string; text: string }> {
  const out: Array<{ field: string; text: string }> = []
  const visit = (node: unknown, key: string) => {
    if (typeof node === 'string') {
      if (wanted.includes(key)) out.push({ field: key, text: node })
      return
    }
    if (Array.isArray(node)) { node.forEach(n => visit(n, key)); return }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) visit(v, k)
    }
  }
  visit(doc, trail)
  return out
}

describe('published copy is written for a reader, not for an editor', () => {
  for (const [file, fields] of Object.entries(PUBLISHED_FIELDS)) {
    it(`keeps developer words out of ${file.replace('src/data/', '')}`, () => {
      const doc = JSON.parse(readFileSync(file, 'utf-8'))
      const offenders = stringsAt(doc, fields)
        .filter(s => DEVELOPER_WORDS.test(s.text))
        .map(s => `${s.field}: "${s.text.slice(0, 80)}…"`)
      expect(offenders).toEqual([])
    })
  }

  it('found something to check, so the sweep is not passing on an empty list', () => {
    const doc = JSON.parse(readFileSync('src/data/businesses/businesses.json', 'utf-8'))
    expect(stringsAt(doc, PUBLISHED_FIELDS['src/data/businesses/businesses.json']).length)
      .toBeGreaterThan(10)
  })

  it('still lets an internal provenance note say what it means', () => {
    /* The counterpart to the rule above, asserted so nobody "fixes" these too: notes that
       document where a record came from are for the next editor and are not rendered. */
    const notices = readFileSync('src/data/current-notices.json', 'utf-8')
    expect(notices).toMatch(/repositor/i)
  })
})
