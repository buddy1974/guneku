# GUNEKU 2026 — SEO / entity / discovery build report

| Field | Value |
|-------|-------|
| Document tier | 1 — acceptance report |
| Owner (DRI) | Marcel / Maxpromo Digital |
| Written | 2026-09-17 |
| Baseline | `32232b5` |
| Head at acceptance | `35df727` |
| Production | https://www.guneku.org |
| Deployment verified | `guneku-7eeu5dkbj` · Ready · 2026-09-17 |
| **Submission status** | **NOT SUBMITTED — awaiting Marcel's approval** |

> **Nothing has been submitted to any search engine.** No sitemap was submitted in Search
> Console, no indexing was requested, no URL was sent to IndexNow, no Bing sitemap was
> submitted, and no broad crawl was triggered. The build stops here by instruction. §9 is
> the list of things that need Marcel's approval before anyone does any of them.

---

## 1. What was wrong, measured before anything was changed

A crawl of production on the baseline commit — 290 pages, following every internal link from
the homepage and every sitemap URL.

| Finding | Count |
|---|---|
| Titles over 60 characters | **50** |
| Descriptions over 160 characters | **46** |
| Indexable pages absent from the sitemap | **137** |
| Orphaned pages (zero inbound links anywhere on the site) | **1** |
| Structured-data node types on the whole site | **2** |
| Pages with a `WebPage` node | **0** |
| Pages with a breadcrumb | **0** |
| Register entries with a boilerplate description | **113** |

The 137 absent pages were the 113 register entries (a deliberate exclusion, never revisited),
the 17 GUDECA chapters, the 5 governing bodies, `/people` and `/support` — the last four groups
simply never added after their routes were built.

The orphan was `/sons-and-daughters`. `/notables` described it in a sentence and then linked to
`/diaspora`. One wrong `href`, and the only remaining way in was a header dropdown — which is a
real way in for a person and **no way in at all** for a crawler, because the submenu renders
only while it is open, so the markup the server sends carries the nine top-level tabs and
nothing beneath them. The existing orphan test passed it, because that test counted a menu
entry as a way in.

---

## 2. Indexability policy

`src/lib/seo-policy.ts` · ADR-093 · `docs/seo-entity-map.md` §5

An entry in the indigenes register is offered for indexing when it carries **at least two facts
beyond the name**, each already on the page and each traceable to a record.

| Signals | Entries |
|---|---|
| 1 | 32 |
| 2 | 44 |
| 3 | 15 |
| 4 | 17 |
| 5 | 3 |
| 6 | 1 |
| 7 | 1 |

**81 indexable · 32 `noindex, follow` · threshold 2.**

The 32 stay public, linked, crawlable and claimable. `follow` rather than `nofollow`, because
they lead outward to bodies, chapters and businesses that are worth indexing.

All 113 descriptions were the same sentence with a name substituted, and some ran past 220
characters. They are now built from what each entry actually holds, longest fact first, and all
113 are different.

**This changes what is submitted. It changes nothing about what is published.**

---

## 3. Sitemap

Rebuilt from the policy rather than from the route list.

| | Before | After |
|---|---|---|
| URLs | 121 | **226** |
| Register entries | 0 | 81 |
| GUDECA chapters | 0 | 17 |
| Governing bodies | 0 | 5 + `/people` |
| `/support` | absent | present |
| `noindex` pages listed | 0 | **0** |
| Indexable pages omitted | 137 | **0** |

---

## 4. Entity graph

`src/lib/schema.ts`, `src/components/seo/PageGraph.tsx` · ADR-094 · `docs/seo-entity-map.md`

Node types in production, counted across all 282 crawled HTML pages:

| Type | Count |
|---|---|
| Organization | 287 |
| WebSite | 282 |
| Place | 282 |
| WebPage | 255 |
| BreadcrumbList | 253 |
| Person | 115 |
| NewsArticle | 39 |
| Article | 18 |
| ImageGallery | 15 |
| Event | 5 |
| LocalBusiness | 5 |
| DiagnosticLab | 2 |
| FAQPage | 1 |
| BankOrCreditUnion | 1 |
| MedicalBusiness | 1 |
| Store | 1 |
| VideoObject | 1 |

598 `ld+json` blocks, **0 parse failures**, **0 pages with no structured data**.

The 27 pages without a `WebPage` node are top-level hubs, which already carry a title, a
description and a self-referencing canonical; a breadcrumb of "Home → this page" adds nothing
there. Every page more than one level deep has one.

The one `FAQPage` is generated from the same array that renders the visible questions on the
homepage. No question-and-answer text was invented to obtain it.

### What is deliberately absent

Enumerated in full in `docs/seo-entity-map.md` §4 and asserted by `src/lib/schema.test.ts`.
In short: no rating, review, price, opening hour, founding date or employee count on any
business; no street address for Fondom Studios, whose sources disagree; nothing at all for the
held business; for GUNECCUL no rate, registration number, LEI, product offer, hours or
telephone; for a register entry no photograph, birth date, town or contact detail; for a
published profile not the email and telephone the record holds; for a migrated article no
invented byline and no date on an undated record. Ownership is never asserted, because the
directory distinguishes an owner from an associate and schema.org has no property that does.

---

## 5. Titles, descriptions and social cards

ADR-095.

`pageMetadata` now fits a title rather than letting it run: one that no longer fits beside
" | Guneku Fondom" takes the whole sixty characters for itself and drops the brand. `shortTitle`
cuts at a boundary the text already has and never adds a word, so the shown title is always a
prefix of what the record says. Descriptions end on a sentence, at 158 characters.

Thirteen pages wrote their own metadata object and therefore had no Open Graph card at all —
`/guneccul`, `/fondom`, `/palace`, `/projects`, `/updates`, `/education`, `/gallery`,
`/gallery/images`, `/institutions`, `/diaspora`, `/agro-cig`, `/gudeca`, and both GUDECA
sub-pages. All now go through the helper.

Measured on production:

| | Before | After |
|---|---|---|
| Titles over 60 | 50 | **0** |
| Descriptions over 160 | 46 | **0** |
| Missing title | 0 | **0** |
| Missing description | 0 | **0** |
| Duplicate titles | 0 | **0** |
| Duplicate descriptions | 0 | **0** |
| Pages without exactly one `<h1>` | 0 | **0** |
| Missing or off-host canonical | 0 | **0** |
| Canonical not self-referencing | 0 | **0** |
| Pages with no `og:title` / `og:image` | 0 / 0 | **0 / 0** |

---

## 6. Internal linking

`/notables` now links to `/sons-and-daughters` where its own sentence said it did. The orphan
test was rewritten to look for a link in what the **server** sends rather than in the menu
definition, and it fails on the exact `href` that caused the defect — verified by reverting the
fix and watching it fail.

| | Before | After |
|---|---|---|
| Pages with zero inbound links | 1 | **0** |
| Sitemap URLs the crawl never reached | 1 | **0** |

---

## 7. robots.txt and IndexNow

`/robots.txt` unchanged except for one addition: `Disallow: /search?`. The search page itself
stays open and in the sitemap; its results are not a page of the record and there is no end to
them.

IndexNow is built and deliberately hard to misuse — ADR-096. No call submits the whole site, no
flag means "all of it", and a cap of 25 URLs means the site cannot fit through. `INDEXNOW_KEY`
is **not set**; with no key the verification file is a 404 rather than a placeholder, and every
path declines. **Nothing has been submitted.**

---

## 8. Two defects found along the way, and fixed

**An image that arrived from Joomla without its file.**
`/palace/the-return-of-fon-fomuki-of-guneku` opened with `<p><img alt="" src=""></p>`. `src=""`
is worse than an absent attribute: it is a URL resolving to the page itself, so some browsers
fetch the document a second time trying to draw it. `ArticleBody` already demoted a stray `<h1>`
for the same class of reason; it now drops a sourceless image too, just as narrowly, and both
rules have tests for the first time.

**A quarter described twice.** `/quarters/[slug]` computed its description inside
`generateMetadata` only, so the page and its snippet could have drifted. It is one function now.

---

## 9. What needs Marcel's approval before anyone does it

Nothing in this list has been started.

1. **Google Search Console** — create the property for `https://www.guneku.org`, verify it, and
   submit `/sitemap.xml`. Verification method is Marcel's call; a DNS TXT record survives a
   platform change and an HTML file does not.
2. **Bing Webmaster Tools** — property, verification, sitemap. Bing will import from Search
   Console once that exists, which is the shorter path.
3. **IndexNow** — generate a key, set `INDEXNOW_KEY` in Vercel (Production), confirm
   `https://www.guneku.org/indexnow-key.txt` serves it, and then submit **only** newly published
   URLs. Never the archive.
4. **The indexability threshold itself.** 81 of 113 is an engineering reading of a product
   question. If the Palace would rather all 113 were offered to a search engine, that is one
   constant in `src/lib/seo-policy.ts`.
5. **The query architecture table** in `docs/seo-query-architecture.md` §2 — which page is the
   site's answer to which question. That is a product judgment, not a technical one.
6. **A Core Web Vitals measurement** on a real mid-range Android over a throttled connection,
   which has never been done (R-008) and is the largest remaining unknown. It should happen
   before submission, not after: a crawl that forms the site's first impression on a slow
   device is the one impression that is expensive to correct.
7. **A Google Business Profile** for the Fondom or the Palace — decision C3 in
   `docs/seo-launch-handoff.md`, and the owner's alone.

---

## 10. Verification

All run at `35df727`, against the deployed production build.

```
npx tsc --noEmit          clean
npx vitest run            1301 passed, 56 files   (baseline 1239 / 52)
npm run build             succeeded, 304 static pages
production crawl          291 URLs, 282 HTML 200s, 2 expected 307s to sign-in
sitemap                   226 URLs
ld+json                   598 blocks, 0 parse failures
git tree                  clean
```

New test files: `src/lib/seo-policy.test.ts` (13), `src/lib/schema.test.ts` (24),
`src/lib/indexnow.test.ts` (11), `src/components/layout/article-body.test.ts` (8).

New decisions: ADR-093, ADR-094, ADR-095, ADR-096.
New documents: `docs/seo-entity-map.md`, `docs/seo-query-architecture.md`, this report.

---

## 10a. What this build did not cover, and why

**Core Web Vitals were not measured.** No Lighthouse run against production has ever been
done on this project (R-008, open and mitigated), and this build did not do one either. The
structural checks were made — every image has an `alt`, 443 of 752 are lazy, the map chunk
still loads on `/explore` alone, nothing renders dynamically by accident — but those are
source readings, and a source reading is not a field measurement. The audience is largely on a
mid-range Android on a throttled connection in Cameroon, and that is exactly the case a
synthetic desktop score flatters. It needs a lab run or a real device, and it is listed in §9.

**Image filenames and R-042 were not settled.** The archive holds larger originals of 19
published photographs whose catalogue `width`/`height` describe the larger file. That is an
image-delivery decision the owner deferred, and it is both a quality and a Core Web Vitals
question — which makes it one to answer with the measurement above, not before it.

**No page was rewritten for search.** By instruction: Marcel's wording passes come first, and
rewriting a page for a search engine before he has said what it should say gets the order
backwards.

---

## 11. What was explicitly not done

- No search engine was contacted in any way.
- No biography, date, title, Palace office, relationship, address, coordinate, award,
  qualification, ownership, review, rating, price, telephone number, social account, founding
  date, institutional identifier or credit-union fact was invented. Every value in the graph
  comes from a record already published on a page.
- No FAQ text was written to obtain FAQ schema.
- No held or private record was exposed. Vicky and Son's remains held and is absent from the
  graph and the sitemap.
- The Fondom Studios location conflict was not resolved. The node carries the Fondom's own town
  and no street; "Bamenda" appears nowhere.
- Njindom is not described as part of Guneku anywhere.
- No consent-gated contact detail was published through JSON-LD.
- No authentication, authorisation or privacy rule was changed.
- No secret was exposed, and `INDEXNOW_KEY` is not in the repository.
- The responsive and touch work frozen in the previous pass was not touched.
