import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

/* Hit areas for the things a reader taps.
 *
 * ── What was wrong ───────────────────────────────────────────────────────────────────────
 *
 * Measured on production at 390px: 39 links and buttons in the main content drew a box under
 * 24px tall. Most were the standing call-to-action link — "View project →", "News archive →",
 * "Read the record →", "Support this project →" — set at 0.83rem, which makes a box about
 * 20px high. WCAG 2.5.8 asks for 24 unless the target is a link inside a sentence, and these
 * are not: they stand alone at the foot of a card or beside a heading. On a phone they were
 * easy to miss and easy to mis-tap.
 *
 * ── The fix, and why it is shaped this way ───────────────────────────────────────────────
 *
 * Padding expands the hit area and an equal negative margin returns the space, so the target
 * grows and nothing moves. Verified by A/B on one build, toggling the rule on the live page:
 * page height 11622 both ways, zero sections shifted by more than 2px, zero horizontal
 * overflow either way, and `.inst-link` elements under 24px went from 36 to 0.
 *
 * Where the link genuinely is inline in a sentence, vertical padding never affected the line
 * box, so that prose is untouched and merely became easier to hit.
 *
 * ── Why this test reads CSS ──────────────────────────────────────────────────────────────
 *
 * This suite runs in node with no layout engine, so it cannot measure a box. What it can do
 * is hold the rule in place: the pairing is the whole trick, and padding left without its
 * margin would silently push every card in the site apart. */

const CSS = readFileSync('src/app/globals.css', 'utf-8')

/** Every rule body written against a selector, joined.
 *
 *  Joined rather than taken first: this stylesheet is organised by concern, so a selector
 *  legitimately appears more than once — `.biz-card:focus-within` states its elevation in
 *  one place and its outline in another. Reading only the first found the elevation and
 *  reported the outline missing. */
function rule(selector: string): string {
  const bodies: string[] = []
  let at = CSS.indexOf(`${selector} {`)
  while (at >= 0) {
    bodies.push(CSS.slice(at, CSS.indexOf('}', at)))
    at = CSS.indexOf(`${selector} {`, at + 1)
  }
  if (!bodies.length) throw new Error(`no rule for ${selector}`)
  return bodies.join('\n')
}

describe('the standing call-to-action link is big enough to hit', () => {
  const instLink = rule('.inst-link')

  it('expands its hit area vertically', () => {
    expect(instLink).toMatch(/padding-block:\s*0\.3rem/)
  })

  it('gives the space straight back, so no layout moves', () => {
    expect(instLink).toMatch(/margin-block:\s*-0\.3rem/)
  })

  it('keeps the two in step', () => {
    /* Padding without the matching negative margin would push every card apart; margin
       without the padding would shrink the target below where it started. They are one
       change and they have to stay one change. */
    const pad = instLink.match(/padding-block:\s*(-?[\d.]+)rem/)
    const mar = instLink.match(/margin-block:\s*(-?[\d.]+)rem/)
    expect(pad, 'padding-block missing').not.toBeNull()
    expect(mar, 'margin-block missing').not.toBeNull()
    expect(Number(pad![1]) + Number(mar![1])).toBeCloseTo(0, 5)
    /* 0.83rem text in a box padded 0.3rem top and bottom clears 24px comfortably. */
    expect(Number(pad![1])).toBeGreaterThanOrEqual(0.25)
  })
})

describe('a business card is tappable across its whole face', () => {
  it('overlays the card with the title link', () => {
    /* The card title measures 22px, which would fail the rule above — but the link carries a
       full-card overlay, so the target is the card and not the words. That is why the three
       remaining under-24px elements on the homepage are not defects. */
    const overlay = rule('.biz-card-link::after')
    expect(overlay).toMatch(/position:\s*absolute/)
    expect(overlay).toMatch(/inset:\s*0/)
  })

  it('shows focus on the card rather than on the invisible overlay', () => {
    expect(rule('.biz-card:focus-within')).toMatch(/outline:/)
  })
})
