import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { allFoundingNames } from '@/lib/community'

/* Two things the directory holds, and the page has to keep them apart.
 *
 *   A. the founding names the Fondom's own records already carry
 *   B. profiles people created for themselves through My Guneku
 *
 * Acceptance found the page saying both "opening with 52 names from the Fondom's own
 * records" and "BE THE FIRST — become the first Guneku indigene in the directory", with the
 * 52 names rendered further down the same page. Nobody would be first, and the directory has
 * never been empty. What was empty was B. */

/* Comments stripped for the checks about what the page says. The file explains in prose what
   the contradiction was, quoting the old wording, and a check that matched that prose would
   fail on the note recording the fix. */
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

const PAGE = strip(readFileSync('src/app/indigenes/page.tsx', 'utf-8'))

describe('the empty state says which thing is empty', () => {
  it('never claims a visitor would be the first Guneku indigene', () => {
    expect(PAGE).not.toContain('BE THE FIRST')
    expect(PAGE).not.toMatch(/first Guneku indigene/i)
    expect(PAGE).not.toMatch(/become the first/i)
  })

  it('says that no profile has been created through My Guneku', () => {
    expect(PAGE).toContain('NO PROFILES CREATED YET')
    expect(PAGE).toMatch(/No one has yet created a profile through My Guneku/)
  })

  it('points at the founding names on the same page rather than past them', () => {
    /* The count is interpolated, so the sentence cannot go stale the way a typed number
       would — and the names are described as records the Palace holds, not accounts. */
    expect(PAGE).toContain('{FOUNDING_COUNT}')
    expect(PAGE).toMatch(/founding names below come from the Fondom/)
    expect(PAGE).toMatch(/not accounts\s*\n?\s*anybody has opened|not\s+accounts anybody has opened/)
  })

  it('invites creating a profile or claiming an existing entry', () => {
    expect(PAGE).toMatch(/create your own profile/i)
    expect(PAGE).toMatch(/claim the entry the record already holds/i)
  })

  it('tells a fruitless search that the founding names are not in it', () => {
    /* A search that matches no member profile must not read as "Guneku has nobody"; the
       founding list below is unfiltered and the page now says so. */
    expect(PAGE).toContain('NO MATCHES')
    expect(PAGE).toMatch(/not filtered by this\s*\n?\s*search/)
  })
})

describe('the founding names are still there, and still counted', () => {
  it('renders the founding list', () => {
    expect(PAGE).toContain('<FoundingNames />')
  })

  it('counts them from the register rather than from a literal', () => {
    expect(PAGE).toContain('allFoundingNames().length')
    expect(allFoundingNames().length).toBeGreaterThan(0)
  })

  it('does not describe them as registered accounts', () => {
    expect(PAGE).not.toMatch(/registered (members|accounts)/i)
  })
})
