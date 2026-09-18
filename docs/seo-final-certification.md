# GUNEKU — SEO final certification before search-engine launch

| Field | Value |
|-------|-------|
| Document tier | 1 — certification |
| Owner (DRI) | Marcel / Maxpromo Digital |
| Written | 2026-09-18 |
| Baseline | `35df727` (the accepted SEO build) |
| Production | https://www.guneku.org |
| Builds on | `docs/seo-2026-build-report.md`, `docs/seo-entity-map.md`, `docs/seo-query-architecture.md` |
| **Submission status** | **NOT SUBMITTED** |

> Nothing has been submitted to Google, Bing, IndexNow or anywhere else. No property was
> created, no sitemap submitted, no indexing requested, no URL pinged. §6 is what needs
> doing, and it needs Marcel first.

This pass closed the two gaps the build report named as outstanding: a real performance
measurement, and the indigenes indexability decision.

---

## 1. Core Web Vitals — measured, not inferred

Lighthouse 12.8.2 against production, fifteen representative routes, mobile (simulated
throttling, 4× CPU, 412 px viewport) and desktop. R-008 had been open since the start of the
project because this had never been run.

### The defect it found

`images: { unoptimized: true }` had been in `next.config.ts` since the initial commit,
uncommented. It is the switch that turns every `<Image>` back into a plain `<img>` serving
the original file. `/palace` was shipping a 1600×1200 hero at 342 KB to a 412 px phone.

**Re-encoding the JPEGs was tried first, before touching anything else, and measured at 3 %.**
They are already compressed about as well as JPEG compresses, and no file in the repository
is wider than 1600 px. The waste was never the encoder and never the source dimensions. It
was sending fifteen times the pixels a phone can draw. The same photograph at 640 px in WebP
is 51 KB; in AVIF, 42. Production now returns **28 KB** for it.

The fix is ADR-098: optimizer on, four device widths rather than eight, 31-day cache,
`unoptimized` kept only on the brand logos and the remote YouTube thumbnails. **No file in
`public/` was touched.** No photograph was resized, re-cropped, re-encoded or replaced.

### Mobile, after

| Route | Perf | FCP | LCP | CLS | TBT | Transfer |
|---|---|---|---|---|---|---|
| `/` | 87 | 2.0 s | 3.70 s | 0.000 | 81 ms | 657 KB |
| `/fondom` | 91 | 1.3 s | 3.40 s | 0.000 | 89 ms | 616 KB |
| `/palace` | 90 | 1.3 s | 3.44 s | 0.000 | 119 ms | 616 KB |
| `/indigenes` | 88 | 1.3 s | 3.52 s | 0.000 | 112 ms | 530 KB |
| `/indigenes/founding/ndingwan-primus` (rich) | 95 | 1.1 s | 2.64 s | 0.000 | 148 ms | 466 KB |
| `/indigenes/founding/grace-forze` (thin) | 96 | 1.0 s | 2.61 s | 0.000 | 113 ms | 466 KB |
| `/businesses` | 90 | 1.3 s | 3.38 s | 0.000 | 144 ms | 479 KB |
| `/businesses/fondom-studios` | 93 | 0.9 s | 3.18 s | 0.000 | 90 ms | 493 KB |
| `/guneccul` | 96 | 1.0 s | 2.70 s | 0.000 | 53 ms | 460 KB |
| `/institutions` | 90 | 1.5 s | 3.40 s | 0.000 | 94 ms | 581 KB |
| `/institutions/fhed` | 95 | 0.9 s | 2.79 s | 0.000 | 107 ms | 460 KB |
| `/explore` | 87 | 1.0 s | 2.90 s | 0.000 | 326 ms | 979 KB |
| `/palace/the-coronation` | 95 | 1.0 s | 2.93 s | 0.000 | 62 ms | 489 KB |
| `/gallery/images` | 88 | 1.3 s | 3.66 s | 0.000 | 129 ms | 794 KB |
| `/contact` | 99 | 1.2 s | 1.61 s | 0.003 | 65 ms | 1030 KB |

Noisy routes were run twice; the figures above are the second run where they differed.

### Before and after, same tool, same routes

| Route | Perf | LCP | Transfer |
|---|---|---|---|
| `/palace` | 81 → **90** | 4.95 s → **3.44 s** | 992 → **616 KB** |
| `/fondom` | 86 → **91** | 4.24 s → **3.40 s** | 984 → **616 KB** |
| `/gallery/images` | 82 → **88** | 4.68 s → **3.66 s** | 1174 → **794 KB** |
| `/` | 82 → **87** | 4.25 s → **3.70 s** | 787 → **657 KB** |
| `/contact` | 94 → **99** | 2.71 s → **1.61 s** | — |

**No route now exceeds 4 s LCP on throttled mobile.** Before, four did.

### Desktop

99–100 on every route. LCP 0.55–0.85 s, TBT 0–8 ms, CLS 0.000 except `/palace` 0.013 and
`/indigenes` 0.052 — both inside the 0.1 "good" threshold, and both 0.000 on mobile.

### What was deliberately not chased

- **Fonts are now the largest asset class: 216 KB on every page**, four self-hosted faces
  (Source Serif 4 and Source Sans 3, each normal and italic). Dropping a face would save
  ~54 KB per first visit — and would make browsers synthesise a slanted version in its
  place, which is a visible typographic change on a site whose design has been accepted and
  frozen. That is the owner's call, not a performance fix. The fonts are immutable-cached, so
  this is a first-visit cost only, and it is already down from the 276 KB third-party Google
  Fonts load it replaced.
- **`/explore` TBT 291–326 ms** is MapLibre, which already loads behind an
  IntersectionObserver and only on that route. 979 KB on one page, by design.
- **24 KB of unused JavaScript and 13 KB of legacy JavaScript** are framework chunks.
- **A 19 KB render-blocking stylesheet** is Tailwind's page CSS under Next's default setup.

None of these is worth a change that risks the accepted design for single-digit score points.

---

## 2. Indigenes indexability — the decision changed

ADR-097, superseding ADR-093 one day later.

Every legitimate public record in the register is now offered for indexing.
`PERSON_INDEX_THRESHOLD` is 0.

| | |
|---|---|
| Public legitimate records | **113** |
| Indexable | **113** |
| `noindex` | **0** |
| `noindex` due to thinness | **0** |
| Sitemap members | **113** |

Eligibility was decoupled from richness, not weakened. `personIndexBar()` now names the
reason a page would be withheld; the only one that can occur is `not-a-record`, and the
reviewed register is still the gate. A held, ambiguous or unconfirmed name is not in
`founding-names.json` — it lives in the business directory as `heldName`, or in Neon behind
a claim, or nowhere.

**Nothing was invented to justify the change.** No biography, no inferred occupation, no
guessed location, no padding. A sparse entry's description is short, and a test reconstructs
every word of it from recorded fields, so a sentence added to fill space fails the suite. The
one addition is the chapter, which the entry's own table and hero already print — written
with `placeLabel`, so the Europe chapter reads "GUDECA Europe" rather than "Meetings rotate
across Europe", a true sentence about a chapter and a poor answer to where a person is. All
113 descriptions remain distinct.

Sitemap: 226 → **258** URLs.

---

## 3. Production crawl — every gate

291 URLs fetched, following every internal link and every sitemap entry.

| Gate | Result |
|---|---|
| HTML 200 pages | 282 |
| Sitemap URLs | 258 |
| Broken internal links | **0** |
| Canonical errors | **0** |
| Sitemap non-200 | **0** |
| `noindex` in sitemap | **0** |
| Held sitemap URLs | **0** |
| Private sitemap URLs | **0** |
| Indexable pages absent from sitemap | **0** |
| Accidental `noindex` | **0** |
| Malformed JSON-LD | **0** |
| Pages with no JSON-LD | **0** |
| JSON-LD blocks | 598 |
| Duplicate titles | **0** |
| Duplicate descriptions | **0** |
| Titles over 60 characters | **0** |
| Descriptions over 160 characters | **0** |
| Pages without exactly one `<h1>` | **0** |
| Orphan indexable pages | **0** |
| **All 113 indigenes: 200 · index · self-canonical · in sitemap** | **113 / 113** |

Two non-200 responses were recorded and are correct: `307` from `/indigenes/onboarding` and
`/my-guneku/businesses/new` to `/sign-in`. Both are member-only routes, both are disallowed
in `robots.txt`, and a redirect to sign-in is what they are supposed to do.

24 pages carry `noindex`, all deliberate and none in the sitemap: 17 quarters and 6 Fondom
articles whose records are empty and which say so on the page, plus `/sign-in`.

---

## 4. R-042 — measured properly

The register entry said nineteen photographs. **It is 304 of 339.** Every image record in
`image-gallery.json` was compared against the file on disk.

| | |
|---|---|
| Catalogue records | 339 |
| Files missing | 0 |
| `width`/`height` disagree with the file served | **304** |
| Of those, a genuinely different aspect ratio | **0** |

The 38 that looked like aspect changes are integer rounding on a downscale. Every mismatch is
the same photograph at a smaller size — nothing cropped, nothing a different picture. Nothing
in the application reads those fields, so the disagreement costs no reader anything today.

**The economics that caused the 2026-09-06 deferral have changed.** That decision turned on
109 KB becoming 1.6 MB on a page load. Since ADR-098 the bytes on the wire are set by the
width the browser asks for, not by the size of the source file — so swapping in the staged
originals would make the record true and the photographs sharper, and would change what a
phone downloads by nothing at all.

This pass measured it and stopped there. Rewriting 304 archive records is an archive-content
change inside a performance certification, and there are two separable decisions —
*correct the recorded dimensions* and *swap in the larger originals* — which should not be
taken in one commit by whoever is holding the file. Both options are written up in the
R-042 addendum in `docs/known-risks.md`.

**R-042 status: still open, now quantified, and cheaper than it was.**

---

## 5. Quality gates

```
npx tsc --noEmit          clean
npx vitest run            1302 passed, 56 files
npm run build             succeeded, 304 static pages
eslint (touched files)    clean
git tree                  clean
HEAD == origin/main       yes
```

---

## 6. What still needs Marcel, and has not been started

1. **Google Search Console** — create the property for `https://www.guneku.org`, verify,
   submit `/sitemap.xml`. A DNS TXT record survives a platform change; an HTML file does not.
2. **Bing Webmaster Tools** — import from Search Console once that exists.
3. **IndexNow** — generate a key, set `INDEXNOW_KEY` in Vercel Production, confirm
   `https://www.guneku.org/indexnow-key.txt` serves it, then submit **only** newly published
   URLs. Never the archive. `npm run indexnow -- /updates/some-new-post`.
4. **R-042** — correct the 304 catalogue dimensions, or swap in the 19 staged originals and
   regenerate them. See §4.
5. **Fonts** — whether to drop a typeface to save ~54 KB per first visit, at the cost of
   synthesised italics. See §1.
6. **The query architecture table** in `docs/seo-query-architecture.md` §2 — a product
   judgment about which page answers which question.
7. **A Google Business Profile** for the Fondom or the Palace — decision C3 in
   `docs/seo-launch-handoff.md`.

---

## 7. What was explicitly not done

- No search engine was contacted in any way. No property, no sitemap, no indexing request,
  no IndexNow ping.
- No page was redesigned. No completed SEO architecture was reopened.
- No file in `public/` was modified. No photograph was resized, re-cropped, re-encoded or
  replaced.
- No biography, occupation, location, date, title, office, relationship, address, coordinate,
  qualification, ownership, review, rating, price, telephone number, social account or
  institutional identifier was invented. No text was padded to reach a length.
- No held or private record was exposed. Vicky and Son's remains held and absent.
- The Fondom Studios location conflict remains unresolved; "Bamenda" appears nowhere.
- Njindom is not described as part of Guneku anywhere.
- No authentication, authorisation or privacy rule was changed, and no secret was exposed.
