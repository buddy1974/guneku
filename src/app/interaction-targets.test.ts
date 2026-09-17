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

describe('the small links on a register card are big enough too', () => {
  /* The rule is written across two lines in the stylesheet, so it is found by its first
     selector rather than by reproducing the whitespace. */
  const small = (() => {
    const at = CSS.indexOf('a.inst-meta,')
    if (at < 0) throw new Error('no rule for a.inst-meta')
    return CSS.slice(at, CSS.indexOf('}', at))
  })()

  it('covers both of them', () => {
    expect(small).toContain('a.inst-meta')
    expect(small).toContain('.inst-h3 > a')
  })

  it('expands them the same way, and returns the space the same way', () => {
    /* Measured on /indigenes: 113 cards, each with a name at 22px and "Not me / take it
       down" at 18px. Unlike a business card there is no full-card overlay, so the name is
       genuinely the only target. With all three rules off the page had 338 links under
       24px; with them on it has 0, and the page height is identical to the pixel. */
    expect(small).toMatch(/padding-block:\s*0\.3rem/)
    expect(small).toMatch(/margin-block:\s*-0\.3rem/)
  })

  it('leaves the buttons alone', () => {
    /* A button carries its own padding and a background, so growing it would change how it
       looks rather than only how big it is. */
    expect(rule('.inst-btn')).not.toMatch(/margin-block:\s*-/)
  })
})

describe('the footer is a navigation surface, not a legal afterthought', () => {
  const FOOTER = readFileSync('src/components/layout/Footer.tsx', 'utf-8')

  it('gives its link lists a real hit area', () => {
    /* Measured at 390px across 27 routes: sixteen standing links per page drew a 20px box —
       the Explore column, the social column and the legal bar, on every page of the site.
       They are navigation, not links inside a sentence, so WCAG 2.5.8 asks 24.

       Real space here rather than padding cancelled by a negative margin: these sit six
       pixels apart in a list, and hit areas that overlapped their neighbours would trade a
       small target for a wrong one. */
    /* Every link inside one of the footer's lists. The postal address wears the same colour
       class and is not a link; the builder credit is a link but lives in a sentence, and
       both are excluded on purpose — see the assertion below. */
    const creditAt = FOOTER.indexOf('Website by')
    const links = [...FOOTER.matchAll(/className="[^"]*text-white\/(?:60|70)[^"]*"/g)]
      .filter(m => {
        /* The postal address wears the same colour and is not a link. */
        const tagStart = FOOTER.lastIndexOf('<', m.index!)
        const tag = FOOTER.slice(tagStart, m.index!)
        if (!/^<(Link|a)\b/.test(tag) && !FOOTER.slice(tagStart, m.index! + 400).includes('href=')) return false
        if (!/^<(Link|a)\b/.test(tag)) return false
        /* The builder credit is a link, but it lives in a sentence — excluded on purpose,
           and asserted separately below. */
        return m.index! < creditAt || m.index! > creditAt + 320
      })
      .map(m => m[0])

    expect(links.length, 'footer links found').toBeGreaterThanOrEqual(3)
    for (const cls of links) expect(cls, cls.slice(0, 60)).toMatch(/py-1/)
  })

  it('leaves the one link that really is inside a sentence alone', () => {
    /* "Website by MaxPromo Digital" is prose, and WCAG 2.5.8 exempts a target whose size is
       constrained by the line it sits in. The audit flagged it only because the sentence is
       short enough to look like a label; padding it would put a gap in the middle of a line
       for no benefit. Asserted so the next sweep does not "fix" it. */
    const credit = FOOTER.slice(FOOTER.indexOf('Website by'), FOOTER.indexOf('Website by') + 320)
    expect(credit).toContain('maxpromo.digital')
    expect(credit).not.toMatch(/py-1/)
  })

  it('keeps a one-letter brand name tappable', () => {
    /* "X" is narrower than its own target. A list of brand names will always have a short
       one in it, so the floor belongs on the class rather than on the word. */
    expect(FOOTER).toMatch(/min-w-7/)
  })
})

describe('a standing back-link is not a link in a sentence', () => {
  /* Four article and gallery surfaces carry "← Back to …" set at 0.8rem, which drew a 19px
     box. They are inline-block with vertical padding now, which is what lets the padding
     count at all. */
  const PAGES = [
    'src/app/fondom/[slug]/page.tsx',
    'src/app/gallery/images/[album]/page.tsx',
    'src/app/gudeca/gudeca-exco/page.tsx',
    'src/app/gudeca/guyodeca/page.tsx',
  ]

  for (const page of PAGES) {
    it(`gives it room in ${page.replace('src/app/', '')}`, () => {
      const src = readFileSync(page, 'utf-8')
      expect(src).toMatch(/←\s*Back/)
      expect(src).toMatch(/display:\s*'inline-block'/)
      expect(src).toMatch(/paddingBlock:\s*'0\.35rem'/)
    })
  }
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
