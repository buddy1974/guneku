import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { publicNote } from './public-voice'
import { allFoundingNames } from './community'

/* Editors' notes, shown to readers.
 *
 * The helper keeps the sentences a reader wants and leaves out the editors' provenance. The
 * risk on one side is a fact disappearing; on the other, research language leaking back onto
 * a person's page. Both are checked against every real entry. */

describe('publicNote', () => {
  it('keeps the facts a reader wants', () => {
    expect(publicNote('Elected by the councillors of Zone 2 and installed at the Palace on 30 July 2021. No office, body or chapter is recorded, and none is inferred.'))
      .toBe('Elected by the councillors of Zone 2 and installed at the Palace on 30 July 2021.')
    expect(publicNote('Based in Cameroon, so not of the diaspora.')).toBe('Based in Cameroon.')
    expect(publicNote('A different person from Timothy Tembeng, with whom this entry shares a family name and nothing else.'))
      .toMatch(/A different person from Timothy Tembeng/)
  })

  it('shows nothing when a note is only provenance', () => {
    expect(publicNote('Confirmed a son or daughter of Guneku by the Fondom. No Notable standing is recorded or implied.')).toBeNull()
    expect(publicNote(null)).toBeNull()
  })

  it('lets no research language through for any entry in the register', () => {
    const LEAK = /\bnone is inferred\b|\bis recorded\b|\bthe record\b|\bthe register\b|\bnot established\b|\bsupplied\b/i
    for (const n of allFoundingNames()) {
      const shown = publicNote((n as { note?: string }).note)
      if (shown) expect(shown, n.slug).not.toMatch(LEAK)
    }
  })

  it('never changes the register itself', () => {
    /* Presentation only: the editors' note stays whole in the data. */
    expect(readFileSync('src/data/community/founding-names.json', 'utf-8')).toMatch(/none is inferred/)
  })
})
