# Guneku — search and indexing observation

| Field | Value |
|-------|-------|
| Document tier | 1 — standing observation ledger |
| Owner (DRI) | Marcel / Maxpromo Digital |
| Opened | 2026-09-20 |
| Covers | the first weeks after the search-engine launch of 2026-09-18/20 |
| Launch record | `docs/search-engine-launch.md` |
| Tooling | `npm run observe` (`src/scripts/observe.ts`) |

This is a log, not a project. Nothing in it authorises a change to the site.

> **The rule this whole document exists to enforce.** A search engine's report describes
> what it saw when it last looked, which may be weeks ago. Production describes what is true
> now. When the two disagree, production wins and the engine catches up. Two findings during
> the Bing closure — a canonical flag and a meta-description error — were both stale
> snapshots of a site that no longer existed, and both would have provoked a pointless code
> change if taken at face value. Check production first, every time.

---

## 1. How to take a snapshot

1. Run `npm run observe`. It reads robots.txt, the sitemap, the 22 priority pages and all
   113 register entries directly from production. Takes about a minute; exits non-zero if
   anything is wrong.
2. Open Search Console and Bing Webmaster Tools and read the figures in §6's template.
3. Append a dated entry to §7. Do not edit an earlier entry — a ledger that gets rewritten
   is not a ledger.
4. Classify anything unusual using §3. Most things are **OBSERVE**.

`npm run observe -- --quick` skips the register when only the hubs matter.
`npm run observe -- --json` prints a machine-readable snapshot.

The script touches no search engine, holds no credential and submits nothing. Everything it
reads is a public URL on our own host.

---

## 2. What is being measured, and what is not

Four states, often confused, never the same thing:

| State | Means |
|---|---|
| **Submitted** | we told an engine the URL exists |
| **Discovered** | the engine has the URL on its list |
| **Crawled** | the engine has fetched it |
| **Indexed** | the engine will consider showing it |

A URL can sit between any two of these for weeks. Movement between them is not a project
milestone and stalling between them is not, by itself, a defect.

**"No data yet" is not zero.** An empty report from a property four days old means the
pipeline has not produced numbers. A zero means it produced a number and the number was
nought. The snapshots below say which.

---

## 3. Intervention rules

### OBSERVE — record it, do nothing

- A URL that is submitted or discovered but not yet indexed.
- Search Console or Bing reports with no data, or partial data, in the first weeks.
- The two engines disagreeing with each other.
- **An engine's cached metadata, canonical or SEO finding that contradicts live production.**
  Verify production; if production is right, the finding is stale and will clear on re-crawl.
- Bing advisory heuristics that differ from Google's guidance — for example a meta
  description Bing calls too long and Google accepts.
- "Discovered — currently not indexed" on a young page.
- Impressions and clicks that stay near nothing. A site whose modern content is days old has
  to be crawled before it can rank.

### INVESTIGATE — find out why, before deciding anything

- A URL disappears from the sitemap.
- `npm run observe` reports any problem at all.
- Repeated crawl failure on the same URL across two snapshots.
- A `noindex` nobody intended.
- A **live** canonical pointing somewhere wrong — confirmed against production, not inferred
  from a report.
- A 5xx, or a route that has started redirecting when it should not.
- "Discovered — currently not indexed" that persists for a section rather than a page, and
  across several weeks.
- Structured data that stops validating, or an Enhancements report that turns red.
- A legitimate public register entry that leaves the sitemap or stops being indexable. All
  113 are eligible by ADR-097, and a silent departure is the failure worth catching.
- A Core Web Vitals regression once field data exists.

### REMEDIATE — only after a current production defect is proven

A defect is proven when it can be reproduced against live production today. A screenshot of
a search engine's opinion is evidence that the engine holds that opinion, not that the site
has the fault.

Not grounds for changing production, on their own: a stale snapshot, an unindexed new page,
an empty report, or a vendor heuristic we have deliberately decided against.

---

## 4. Priority watchlist

### Core — inspected by hand in search engines

| Path | Why |
|---|---|
| `/` | the front door |
| `/fondom` | the village as an entity |
| `/palace` | the institution |
| `/indigenes` | the register's front door |
| `/businesses` | the directory |
| `/institutions` | the standing bodies |
| `/guneccul` | the credit union |

### Also watched — automated only

`/palace/fon-walters-profile` · `/people` · `/notables` · `/sons-and-daughters` ·
`/diaspora` · `/gudeca` · `/projects` · `/quarters` · `/explore` · `/updates` · `/gallery` ·
`/gallery/images` · `/watch` · `/contact` · `/support`

That is the 22 in `PRIORITY` in `src/scripts/observe.ts`, which is the list to edit.

### The 113 register entries

Checked in full by `npm run observe` on every snapshot, and **not** inspected by hand in
search engines. Four questions per entry, all answerable from production:

- still in the sitemap?
- HTTP 200?
- `index, follow`?
- self-referencing canonical?

Manual search-engine inspection uses a representative sample only: one entry with a rich
record, one with a sparse one. Inspecting 113 by hand would burn a daily quota to learn what
the script already knows.

### Entity groups to watch as the index fills

Businesses (9 public) · institutions with their own page (8) · GUDECA chapters (17) ·
governing bodies (5) · the cultural and history hubs under `/fondom` and `/palace`.

---

## 5. Query watchlist

An observation taxonomy. **No page is to be created, renamed or rewritten to chase anything
in this list.** If a query has no page, that is a finding about the record, not a brief to
invent one.

**The village** — Guneku · Guneku Cameroon · Guneku Fondom · Guneku village ·
Guneku Mbengwi · Guneku Momo · Guneku North West Cameroon · Meta clan Guneku

**The Palace** — Guneku Palace · Guneku Fon · Fon of Guneku · Fomuki Ticha IX ·
Fon Fomuki Walters Ticha · HRH Fomuki

**People** — Guneku Indigenes · sons and daughters of Guneku · Guneku Notables ·
Guneku Traditional Council · plus individual names from the register as they are indexed

**Institutions** — GUNECCUL · Guneku Credit Union · Guneku Cooperative Credit Union ·
GUDECA · GUYODECA · Guneku Agro CIG · Guneku institutions

**Businesses** — Guneku businesses · Guneku business directory · plus each public business
by name

**Culture and history** — Michi Ebeng festival · Guneku coronation · Guneku quarters ·
Guneku diaspora

The queries worth the most attention are **names of people**. All 113 register entries are
indexable precisely so that a son or daughter searching their own name can find themselves
in the Fondom record (ADR-097). That is the thing to watch for, and the thing the register
was opened for.

---

## 6. Snapshot template

```
### YYYY-MM-DD

GOOGLE
  sitemap            <url> · <status> · discovered <n> · last read <date>
  page indexing      indexed <n> / not indexed <n> · report last updated <date>
  reasons            <reason>: <n> …
  performance        clicks <n> · impressions <n> · CTR <n>% · avg position <n> · window <dates>
  top queries        …
  top pages          …
  core web vitals    <state>
  manual actions     <state>
  security           <state>
  enhancements       <state>

BING
  sitemap            <url> · <status> · discovered <n> · last crawl <date>
  site explorer      <state>
  search performance <state>
  indexnow           <state>
  priority URLs      <per-URL state>
  crawl / security   <state>

PRODUCTION  (npm run observe)
  robots.txt         <status>
  sitemap            <n> URLs
  priority pages     <n>/<n> healthy
  register           <n>/<n> healthy · <n>/113 in sitemap
  problems           <list or none>

DECISIONS
  observe / investigate / remediate — with the reason
```

---

## 7. Snapshots

### 2026-09-20 — Day 0

Taken two days after the Google launch and the same day Bing was closed. Production commit
`1c1cdc6`.

**GOOGLE**

| | |
|---|---|
| Sitemap | `https://www.guneku.org/sitemap.xml` · **Success** · submitted 18 Sept, last read **19 Sept** · **258 discovered** |
| Legacy sitemap | `http://www.guneku.org/sitemap.xml` · Success · Jun 2023 · 72 pages — the Joomla site, left in place |
| Page indexing | **24 indexed · 9 not indexed** — but the report says *last updated 6/30/26* |
| Not-indexed reasons | Page with redirect 3 · Redirect error 2 · Duplicate without user-selected canonical 2 · Crawled – currently not indexed 2 |
| Performance window | 18 Jun – 17 Sept 2026 |
| Clicks | **5** |
| Impressions | **114** |
| CTR | **4.4 %** |
| Average position | **4.9** |
| Top queries | `fomuki` 6 impressions · `fondjomekwet` 1 impression — 2 rows only |
| Top pages | 33 rows, led by `/` (38 impressions), `guneku.org/updates` (37), and legacy Joomla paths |
| Core Web Vitals | **No data** — "not enough usage data in the last 90 days", mobile and desktop |
| Manual actions | **No issues detected** |
| Security issues | **No issues detected** |
| Enhancements → Breadcrumbs | **17 valid · 0 invalid** · no issues in 90 days |

Two things about this data matter more than the numbers.

**The indexing report is a June snapshot.** It is dated 30 June 2026 and describes the
legacy Joomla site, not the rebuild. 24 indexed and 9 not indexed are last summer's figures,
carried into the Domain property when it was verified on 18 September. The four non-indexed
reasons — redirects, duplicates without a canonical — are exactly what the old site looked
like, and exactly the faults this project fixed. **None of them is evidence about the site
as it stands.**

**The performance data is mostly pre-launch.** The window closes on 17 September, a day
before the launch, and the top pages are legacy URLs: `/guneku-palace/…`,
`/index.php/about/about-guneku`, `/updates/44-gudeca-us-chapter-…`, `/gallery/video-gallery`.
Five clicks and 114 impressions are the residue of the old site, not a reading of the new
one. The apex `guneku.org/updates` also appears, which is the Domain property doing its job
of counting both hosts.

The one genuinely new signal is **Breadcrumbs: 17 valid, 0 invalid**. Google is reading the
`BreadcrumbList` nodes added on 17 September and finding them well-formed.

**BING**

| | |
|---|---|
| Sitemap | `https://www.guneku.org/sitemap.xml` · **Success** · submitted and crawled 20 Sept · **258 discovered** · 0 errors · 0 warnings |
| Site Explorer | **No data available** |
| Search Performance | **Data for the selected range is not available** |
| Indexed count | not published for this property |
| Clicks / impressions | **no data** |
| IndexNow | onboarding page only — no submission history surfaced |
| Crawl errors | none |
| Security | none — Security & Privacy holds only Copyright Removal Notices |
| Site Scan | never run |

Priority URLs as Bing has them:

| URL | Discovered | Crawled | Indexed | Canonical per Bing |
|---|---|---|---|---|
| `/` | yes | yes | **indexed** | — |
| `/fondom` | yes | yes | **indexed** | — |
| `/palace` | 02 Sept | not yet | no | n/a |
| `/indigenes` | 02 Sept | 02 Sept | no | `https://www.guneku.org/` — **stale** |
| `/businesses` | yes | yes | **indexed** | — |
| `/institutions` | yes | yes | **indexed** | — |
| `/guneccul` | 02 Sept | 02 Sept | no | `https://www.guneku.org/` — **stale** |

`/palace`, `/indigenes` and `/guneccul` each received one indexing request on 20 September,
before this baseline was defined. Their state is post-nudge. Nothing has been requested
since, and nothing should be.

**PRODUCTION** — `npm run observe`, 2026-09-20T13:09Z

| | |
|---|---|
| robots.txt | 200 · 298 bytes |
| sitemap.xml | 200 · **258 URLs** |
| Priority pages | **22 / 22 healthy** |
| Register entries | **113 / 113 healthy** |
| Register in sitemap | **113 / 113** |
| Canonical errors | 0 |
| Unintended `noindex` | 0 |
| Broken routes | 0 |
| Problems | **none** |

**DECISIONS**

| Item | Classification | Reason |
|---|---|---|
| Google indexing report showing 9 not-indexed | **OBSERVE** | dated 30 June; describes the legacy site |
| Google redirect errors ×2 | **OBSERVE** | same June snapshot; production has no broken redirect — all 22 priority pages and 113 entries return 200 |
| Bing canonical flags on `/indigenes`, `/guneccul` | **OBSERVE** | crawled 2 Sept, before the canonical fix; both verified self-canonical live |
| Bing meta-description error on `/` | **OBSERVE** | graded a 9 Sept copy at 170 chars; live is 156 |
| Bing "8 missing alt" on `/` | **OBSERVE** | count correct, zero attributes actually absent — see §8 |
| Empty Bing and Google reports | **OBSERVE** | no data yet, not zero |
| Production health | **nothing to do** | clean on every check |

Nothing on this list warrants a change to the site. The next snapshot is the first that can
say anything about the rebuilt site, because it will be the first taken after Google
recomputes an indexing report.

---

## 8. Open accessibility question — the three archive-fallback images

Found during the Bing closure and **not remediated**. This is a content and accessibility
decision, not an SEO one, and it should not be made to satisfy a Bing heuristic.

### What exists

`src/components/ui/UpdateCardMedia.tsx` with `cardImageFor()` in `src/lib/archiveFallback.ts`.
When a Village Square record has no photograph of its own, the card shows a deterministic,
topic-matched photograph from the archive and marks it:

- `alt=""` — deliberately decorative
- `title` — the full disclaimer: *"Archive photograph of {subject}. The Fondom archive holds
  no photograph of this record; this image does not show the event described."*
- a visible **"Archive photo"** badge, which is real text in the DOM and is **not**
  `aria-hidden`

Three such images appear on the homepage; Bing counts all three, plus four YouTube poster
frames and one repeated brand logo, as "missing alt". All eight are intentional and none is
missing the attribute.

### The actual gap, stated precisely

It is narrower than it first appears, and it is not screen-reader-specific.

Both a sighted reader and a screen-reader user receive the badge text "Archive photo". What
neither reliably receives is the **full sentence**: `title` produces a tooltip only on hover
with a mouse, so touch users never see it and screen readers generally do not announce
`title` on an image whose `alt` is empty. The `title` is close to decorative for everybody.

So the question is not "how do we tell screen-reader users?" — they are told, tersely, the
same as everyone. It is: **is "Archive photo" enough, and if not, who should get the rest?**

### Recommendation

The correct treatment, if the Fondom wants the full disclaimer to reach everyone, is to
extend the existing badge with visually-hidden text rather than to touch `alt`:

```
<span class="…badge…">
  Archive photo
  <span class="sr-only"> — {img.provenance}</span>
</span>
```

Why this shape and not the alternatives:

- **Do not put the disclaimer in `alt`.** `alt` describes what the image *shows*. Putting
  "this image does not show the event described" there makes the sentence read as the
  picture's content, and it un-marks a decorative image as meaningful — the opposite of what
  the design decided.
- **Do not make the badge text longer visibly.** That changes accepted copy and layout.
- `sr-only` is already used in this codebase (`src/app/gallery/images/page.tsx`), the string
  already exists as `img.provenance`, and nothing visible changes.

### Why it was not implemented

It is not the obvious, consequence-free correction the brief reserved for immediate action.
The trade-off is verbosity: a screen-reader user would hear a 150-character sentence on
**every** fallback card. Three on the homepage is tolerable; `/updates` can carry dozens, and
turning a one-word qualifier into a paragraph repeated forty times is a real cost to the
reader it is meant to serve. There is a defensible argument that "Archive photo" is already
the right amount of information and the `title` should simply be dropped as dead weight.

That is a judgement about how the Fondom speaks to its readers, so it belongs to Marcel.
**Deferred, with both options on the table:** extend the badge with `sr-only` provenance, or
accept "Archive photo" as sufficient and remove the `title`.
