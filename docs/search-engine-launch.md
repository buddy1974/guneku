# Guneku — search-engine launch

| Field | Value |
|-------|-------|
| Document tier | 1 — launch record |
| Owner (DRI) | Marcel / Maxpromo Digital |
| Launched | 2026-09-18 |
| Bing attempt 2 | 2026-09-18, same day — see §3 |
| Bing completed | 2026-09-20 — property imported, sitemap Success at 258 URLs; see §3 |
| Certified SHA | `0b7a72b` |
| Production deployment | `guneku-46v4qxyvz` (`dpl` promoted after `INDEXNOW_KEY` was set) |
| Canonical domain | `https://www.guneku.org` |
| Canonical sitemap | `https://www.guneku.org/sitemap.xml` |

The day Guneku was formally presented to the search engines. What follows is what was
actually done, by whom, and what is still waiting.

> **Submitted is not indexed.** Submission, discovery, crawling and indexing are four
> separate states, and a URL can sit between any two of them for weeks. Where this document
> says a page *is* indexed, that is Bing's own words on its own report — four of the seven
> inspected pages. Everywhere else it records what was asked of a search engine, not what
> the search engine has done about it.

---

## 1. Preflight

Run against live production before anything was submitted.

| Check | Result |
|---|---|
| `HEAD` == `origin/main` | `0b7a72b` == `0b7a72b` |
| Working tree | clean |
| `/` | 200 |
| `/robots.txt` | 200, 298 bytes |
| `/sitemap.xml` | 200, 258 URLs |
| Canonical host | `https://www.guneku.org` |
| `https://guneku.org/` → | 308 → `https://www.guneku.org/` |
| `http://www.guneku.org/` → | 308 → `https://www.guneku.org/` |
| Full certification crawl | all gates pass, 113/113 indigenes |

No regression since certification, so nothing was rebuilt.

---

## 2. Google Search Console

| Field | Value |
|---|---|
| Account | Marcel's own Google account |
| Property | **`sc-domain:guneku.org`** — a **Domain** property |
| Verification | **Auto-verified**, method: *Domain name provider* |
| Human action needed | **None** |
| Sitemap submitted | `https://www.guneku.org/sitemap.xml` |
| Sitemap status | **Success** · 258 discovered pages · read same day |

The Domain property is the strongest type available: it covers every subdomain and both
protocols, so `guneku.org`, `www.guneku.org`, http and https are one property rather than
four.

**No DNS record had to be created.** Google verified ownership through the domain's existing
DNS provider (Cloudflare) without a TXT challenge, so nothing in DNS was touched — Resend
DKIM, SPF, MX, Clerk and Vercel records are all exactly as they were.

### A second, older sitemap is listed

`http://www.guneku.org/sitemap.xml` appears alongside it: submitted 28 June 2023, last read
12 October 2023, 72 pages. That is the legacy Joomla site, inherited with the domain's crawl
history. It was **left alone** — removing it changes nothing about indexing, and it is useful
evidence of what Google knew about this domain before the rebuild. The `http://` host
redirects 308 to the canonical one, so nothing it lists can compete.

### Priority indexing requests

Seven, by hand, through URL Inspection. Each returned *"URL was added to a priority crawl
queue."*

| URL | State when requested |
|---|---|
| `https://www.guneku.org/` | already indexed — requested a re-crawl of the rebuilt page |
| `https://www.guneku.org/fondom` | discovered, not yet indexed |
| `https://www.guneku.org/palace` | already indexed |
| `https://www.guneku.org/indigenes` | already indexed |
| `https://www.guneku.org/businesses` | discovered, not yet indexed |
| `https://www.guneku.org/institutions` | already indexed |
| `https://www.guneku.org/guneccul` | discovered, not yet indexed |

Seven and no more. The sitemap is how the other 251 URLs get found; asking Google by hand
for hundreds of pages does not make them arrive faster and is not what the feature is for.

---

## 3. Bing Webmaster Tools

**COMPLETE, 2026-09-20.** Marcel gave the Google consent; everything after it was finished
in this pass.

Two earlier attempts stopped inside Google's OAuth flow — on 18 September its consent button
refused programmatic input, on 20 September the account chooser did too. That is a control
working as designed, not a defect, and it is the reason this took a human click. The account
was always authenticated and the method was always the right one; only the consent was
missing.

### Property

| Field | Observed |
|---|---|
| Property | **`https://guneku.org/`** |
| Method | **Imported from Google Search Console** |
| Verification | inherited from the verified `sc-domain:guneku.org` property — no file, no meta tag, no DNS record |
| Duplicate sites | none created |
| Other properties in the account | untouched |

The property is registered against the **apex**, `guneku.org`, because that is how the
Google Domain property is named. The canonical host is `www.guneku.org`, and Bing accepted a
`www` sitemap and `www` URL inspections under it without complaint — apex and `www` are one
site to Bing here, and the apex 308-redirects to the canonical host anyway. Nothing needs a
second property.

### Sitemap

**The import did not bring the sitemap across.** Bing's own description of the feature says
it imports sitemaps; the Sitemaps page was empty — *Known sitemaps: –*, zero rows — so the
canonical sitemap was submitted by hand. The historical `http://` sitemap was **not**
submitted.

| Field | Observed |
|---|---|
| Sitemap | `https://www.guneku.org/sitemap.xml` |
| Known sitemaps | **1** |
| Status | **Success** |
| Sitemaps with errors | **0** |
| Sitemaps with warnings | **0** |
| Total URLs discovered | **258** |
| Last submit / last crawl | 20 Sept 2026 / 20 Sept 2026 |

258 is the certified sitemap count exactly. Bing fetched and parsed it on the same day,
first attempt, no errors and no warnings.

### URL Inspection — the seven agreed URLs

| URL | Bing index state | Indexed | Detail |
|---|---|---|---|
| `/` | Indexed successfully | **yes** | 2 SEO/GEO advisories, 2 markup types |
| `/fondom` | Indexed successfully | **yes** | no issues, 1 markup type |
| `/palace` | Discovered but not crawled | no | discovered 2 Sept; **indexing requested** |
| `/indigenes` | Alternate of a canonical page | no | crawled 2 Sept; **indexing requested** — see below |
| `/businesses` | Indexed successfully | **yes** | no issues, 1 markup type |
| `/institutions` | Indexed successfully | **yes** | no issues, 1 markup type |
| `/guneccul` | Alternate of a canonical page | no | crawled 2 Sept; **indexing requested** — see below |

Where Bing reported crawl detail it was clean throughout: **Crawl allowed: Yes · Page fetch:
Successful · Indexing allowed: Yes.** Nothing is blocked.

Three indexing requests were used, one for each URL not yet indexed. Daily quota is 100; 97
remained afterwards. No other URL was submitted.

### The canonical flag on /indigenes and /guneccul is stale, and here is the proof

Bing says both are "an alternate version of a canonical page" whose canonical is
`https://www.guneku.org/` — the homepage. That would be a serious defect if it were current.
It is not.

**Both were last crawled on 2 September 2026 at 10:19**, sixteen days before the canonical
work shipped. And the fault Bing is describing is one this project already found and fixed:
`alternates.canonical` set on the root layout is inherited by every child route in the App
Router, which made every page canonicalise to the homepage. The comment recording that fix
is still in `src/app/layout.tsx`.

Verified against live production on 2026-09-20, all seven:

```
/              canonical=https://www.guneku.org              robots=index, follow  SELF
/fondom        canonical=https://www.guneku.org/fondom       robots=index, follow  SELF
/palace        canonical=https://www.guneku.org/palace       robots=index, follow  SELF
/indigenes     canonical=https://www.guneku.org/indigenes    robots=index, follow  SELF
/businesses    canonical=https://www.guneku.org/businesses   robots=index, follow  SELF
/institutions  canonical=https://www.guneku.org/institutions robots=index, follow  SELF
/guneccul      canonical=https://www.guneku.org/guneccul     robots=index, follow  SELF
```

Every one self-referencing, every one indexable. **No code change is needed and none was
made.** Bing is holding a photograph of a site that no longer exists; the indexing requests
ask it to take a new one.

### The two advisories on the homepage, reconciled

Neither is a defect, and the brief's untouchable list covers both anyway. Recorded because
they will reappear on every Bing report and someone should know why.

**"Meta Description too long or too short" — 1 instance, flagged as an Error.** The homepage
description is 156 characters, inside the 158-character budget this project set and inside
Google's ~160. Bing's preferred band is narrower. Two vendors, two opinions, one description
that cannot satisfy both; the site keeps the budget it certified against.

**"Alt attribute for images is missing" — 8 instances, flagged as a Notice.** The built
output was audited on 2026-09-18: **752 images, zero without an `alt` attribute.** 59 carry
`alt=""` — the repeated brand logo beside the site name, and decorative photographs whose
description sits in adjacent text. That is the correct accessibility treatment for a
decorative image; an empty `alt` tells a screen reader to skip it, and inventing descriptions
for ornament is worse than silence. Bing counts an empty `alt` as a missing one. It is a
counting difference, not a gap.

### Security, crawl errors and other warnings

| Check | Observed |
|---|---|
| Security issues | **none surfaced.** Security & Privacy holds only *Copyright Removal Notices* |
| Malware / manual action | none |
| Crawl errors | none reported; every inspected URL crawlable and fetchable |
| Top Recommendations | **none** on this property |
| Robots blocking | none — `robots.txt` allows everything the site publishes |
| Site Scan | *No scans initiated.* An optional on-demand audit, deliberately not run |

### IndexNow

Bing's IndexNow page for this property shows the **onboarding view** — the marketing
explainer and a *Get Started* button — with no submission history or statistics panel.

That is expected rather than wrong. Guneku's 24-URL submission went through the open IndexNow
API on 18 September, against the host, two days before this property existed; there was no
property for Bing to attribute it to. The key remains live and verified at
`https://www.guneku.org/indexnow-key.txt`.

**Nothing was touched here.** *Get Started* leads to key generation, and generating a second
key would invalidate the working one. No key was created, none exposed, `INDEXNOW_KEY`
unchanged, and no URL resubmitted. Bing's reporting is pending, which is not a failure.
---

## 3a. Bing baseline and homepage forensics, 2026-09-20

A second pass over the live property, recording what Bing actually reports rather than what
was inferred, and investigating the two homepage findings without changing anything.

> **One disclosure.** Earlier the same day, before the instruction to establish a pristine
> baseline, this project requested indexing for `/palace`, `/indigenes` and `/guneccul` —
> the three of the seven that were not indexed. Their state below is therefore *after* that
> nudge, not untouched. No indexing was requested in this pass, and the other four were
> never touched.

### Property

| Field | Bing shows |
|---|---|
| Property | `https://guneku.org/` |
| Import | from Google Search Console |
| Verification | inherited from `sc-domain:guneku.org` — no file, meta tag or DNS record |

### Sitemap

| Field | Bing shows |
|---|---|
| Sitemap | `https://www.guneku.org/sitemap.xml` |
| Known sitemaps | 1 |
| Status | **Success** |
| Errors / warnings | 0 / 0 |
| Total URLs discovered | **258** |
| Last submit / last crawl | 20 Sept 2026 / 20 Sept 2026 |

### Reporting surfaces, all still empty

| Surface | Bing shows |
|---|---|
| Site Explorer → Indexed URLs | *No data available* |
| Search Performance | *Data for the selected range is not available* |
| IndexNow | the onboarding page — no submission history, no statistics |
| Top Recommendations | none on this property |
| Security & Privacy | only *Copyright Removal Notices*; no malware, no manual action |
| Site Scan | *No scans initiated* — optional, deliberately not run |

Empty is the expected reading for a property a few hours old. It is not evidence of a
problem and should not be read as one.

### URL Inspection — the seven, as Bing has them now

| URL | Discovered | Crawled | Indexed | Canonical per Bing | SEO/GEO | Other |
|---|---|---|---|---|---|---|
| `/` | yes | yes | **Indexed successfully** | — | 2 issues | 2 markup types |
| `/fondom` | yes | yes | **Indexed successfully** | — | none | 1 markup type |
| `/palace` | 02 Sept 2026 | **not yet** | no | n/a | n/a | indexing requested earlier today |
| `/indigenes` | 02 Sept 2026 | 02 Sept 10:19 | no | `https://www.guneku.org/` | n/a | alternate-of-canonical |
| `/businesses` | yes | yes | **Indexed successfully** | — | none | 1 markup type |
| `/institutions` | yes | yes | **Indexed successfully** | — | none | 1 markup type |
| `/guneccul` | 02 Sept 2026 | 02 Sept 10:19 | no | `https://www.guneku.org/` | n/a | alternate-of-canonical |

Where Bing reports crawl detail it is clean: **Crawl allowed Yes · Page Fetch Successful ·
Indexing allowed Yes.** Bing performs SEO/GEO and markup analysis only on indexed URLs, which
is why three rows are `n/a` rather than clean.

---

### The homepage findings, investigated

**Everything below is reported, not remediated.** No production code was changed.

#### The single most important fact

Bing's *Analyze SEO/GEO issues* panel shows the cached response it evaluated, headers and
all:

```
Date: Wed, 09 Sep 2026 08:28:19 GMT
Age: 2155
x-vercel-cache: HIT
x-nextjs-prerender: 1
```

**Bing is grading a copy of the homepage from 9 September 2026** — eight days before the SEO
build began on the 17th and nine before it finished. Both findings describe that page, not
the one on the site now.

#### Finding 1 — "Meta Description too long or too short", 1 instance, Error

**Bing is right about the page it looked at, and the fault is already gone.**

| | Description | Length |
|---|---|---|
| 9 Sept (commit `416b5bb`, what Bing cached) | "The official website of Guneku Fondom — Mbengwi, Momo Division, North West Cameroon. Twenty-seven quarters, one Fondom, **and** a community **organised** across three continents." | **170** |
| Today (live) | "The official website of Guneku Fondom — Mbengwi, Momo Division, North West Cameroon. Twenty-seven quarters, one Fondom, a community across three continents." | **156** |

170 characters is over Bing's limit and over Google's. It was shortened to 156 on 18
September as part of ADR-095, before this property existed. The description on the site today
is inside both budgets.

**Recommendation: no action.** The finding clears itself when Bing re-crawls. If it survives
a re-crawl, that is a new fact and worth reopening — Bing's preferred band is narrower than
Google's, and 156 satisfies Google.

#### Finding 2 — "Alt attribute for images is missing", 8 instances, Notice

**Bing's count is exactly right and describes the page as it is today. Nothing is missing.**

The live homepage carries **22 `<img>` elements**: **0 with no `alt` attribute**, **8 with
`alt=""`**, 14 with descriptive text. Bing counts an empty `alt` as a missing one. The eight:

| # | Image | What it is | Assessment |
|---|---|---|---|
| 1–4 | `i.ytimg.com/vi/…/hqdefault.jpg` ×4 | YouTube poster frames on the video strip | **Decorative, correct.** Each sits beside the film's visible title; describing the thumbnail would duplicate it |
| 5 | `/brand/logo-96.png` | the brand mark, second occurrence | **Decorative, correct.** The same logo appears earlier in the header with `alt="Guneku Fondom"`; naming it twice is noise |
| 6 | `…/developmentprojects/1477334…jpg` | archive fallback on a card | **Deliberate — and the one worth reviewing** |
| 7 | `/images/updates/meta-ppl.webp` | archive fallback on a card | same |
| 8 | `…/guneku-royal-community-library/307029915…jpg` | archive fallback on a card | same |

Five of the eight are textbook decorative markup and should stay as they are.

**The three archive fallbacks deserve a decision.** Each carries a `title` reading, in full:

> *"Archive photograph of Guneku village and its people. The Fondom archive holds no
> photograph of this record; this image does not show the event described."*

The empty `alt` is deliberate and the reasoning is sound: the photograph does **not** depict
the record it illustrates, the card shows a visible "Archive photo" badge, and putting a
description in `alt` would assert that the picture shows the event — the exact false claim
this archive has spent several passes refusing to make.

The gap is who hears the disclaimer. A sighted reader sees the badge; a screen-reader user
gets `alt=""`, which means "skip this, it carries no meaning", and `title` is not reliably
announced. So the one reader who most needs to be told the image is not evidence is the one
who is not told.

That is an accessibility question rather than an SEO one, and it is a content decision.
Sketched, not chosen: the disclaimer could move from `title` into `alt`; or the visible
"Archive photo" badge could carry the qualification in text near the image. **Deferred for
Marcel and ChatGPT.**

#### Finding 3 — "2 Markup types found", informational

The two are **JSON-LD** and **OpenGraph** — markup *formats*, not schema types, and both are
expected. For the record, the live homepage carries three JSON-LD blocks and no microdata:

| Block | Types |
|---|---|
| 1 | `Organization`, `WebSite`, `Place` |
| 2 | `WebPage` |
| 3 | `FAQPage` |

Five schema.org types, zero `itemtype` attributes. Nothing to fix.

### Summary for the remediation decision

| Finding | Real today? | Action |
|---|---|---|
| Meta description length | **No** — fixed 18 Sept, Bing graded a 9 Sept copy | none; re-crawl clears it |
| 8 missing alt | Count correct, **defect no** — all 8 intentional, 0 attributes absent | none for 5; **3 archive fallbacks open for review** |
| 2 markup types | Informational | none |
---

## 4. IndexNow

| Field | Value |
|---|---|
| Key | 64 hex characters, generated with `crypto.randomBytes(32)` |
| Storage | `INDEXNOW_KEY`, Vercel **Production**, encrypted |
| In the repository | **no** — never written to source, git, docs or terminal output |
| Key file | `https://www.guneku.org/indexnow-key.txt` → 200, 64 bytes, `text/plain` |
| Key file verified | SHA-256 of the served value matches the configured value |
| Launch submission | **24 URLs · HTTP 202 Accepted** |

Setting the variable required a production redeploy, because the key-file route reads the
environment at request time inside a serverless function and functions take their
environment at deploy. The redeploy was of the same certified source — no code changed.

### What was submitted, and what was not

The 24 principal canonical public hubs:

```
/                              /gudeca                 /explore
/fondom                        /guneccul               /updates
/palace                        /businesses             /gallery
/palace/fon-walters-profile    /projects               /gallery/images
/indigenes                     /institutions           /watch
/people                        /education              /contact
/notables                      /agro-cig               /support
/sons-and-daughters            /quarters
/diaspora
```

Every one was checked first against the production crawl: 200, `index, follow`, and present
in the sitemap. Nothing held, private, `noindex` or staged was submitted, and the 113
register entries and 40 news articles were **not** — they are in the sitemap, which is the
right instrument for an archive. IndexNow is for saying *this changed*, and announcing three
hundred unchanged pages is a false claim the protocol's own guidance treats as grounds for
ignoring a host (ADR-096).

The implementation's 25-URL cap made the size of this submission a decision the code
enforces rather than one a person has to remember.

### One thing worth recording

The first attempt was refused by the implementation's own host guard. Git Bash on Windows
rewrote the leading-slash arguments into local filesystem paths, and `submitUrls` declined
all 24 because they were not on `https://www.guneku.org`. Absolute URLs went through
cleanly. The guard did exactly what it was written to do.

---

## 5. Post-submission validation

Full crawl re-run after every submission, to confirm registration changed nothing on the
site itself.

| Gate | Result |
|---|---|
| HTML 200 pages | 282 |
| Sitemap URLs | 258 |
| Indigenes in sitemap | **113** |
| Broken internal links | 0 |
| Canonical errors | 0 |
| Sitemap non-200 | 0 |
| `noindex` in sitemap | 0 |
| Held / private sitemap URLs | 0 / 0 |
| Indexable pages absent from sitemap | 0 |
| Accidental `noindex` | 0 |
| Malformed JSON-LD | 0 of 598 blocks |
| Duplicate titles / descriptions | 0 / 0 |
| Orphans | 0 |
| 113 indigenes: 200 · index · canonical · in sitemap | **113 / 113** |

Representative pages checked directly: `/`, `/indigenes/founding/grace-forze`,
`/businesses/fondom-studios`, `/institutions/fhed` — all `index, follow` with correct
self-referencing canonicals. `robots.txt` and `sitemap.xml` unchanged.

---

## 6. Status

| | |
|---|---|
| Google property | **VERIFIED** (Domain, auto-verified via DNS provider) |
| Google sitemap | **SUBMITTED** — Success, 258 pages |
| Google priority requests | **7 COMPLETE** |
| Bing property | **VERIFIED** — `https://guneku.org/`, imported from Search Console |
| Bing sitemap | **SUBMITTED** — Success, 258 URLs discovered |
| Bing indexing requests | **3** — `/palace`, `/indigenes`, `/guneccul`; none since |
| Bing homepage findings | 2, both investigated — **remediation deferred for review** (§3a) |
| IndexNow | **ARMED** — key configured and serving |
| IndexNow launch submission | **COMPLETE** — 24 URLs, HTTP 202 |

---

## 7. Still required from a person

**Nothing blocking.** Bing was the last launch item and it was completed on 2026-09-20.

One decision is **open but not urgent**: the three archive-fallback images on the homepage
carry their "this image does not show the event described" disclaimer in a `title`, which a
screen reader does not reliably announce. §3a sets out the evidence. It is an accessibility
question, not an SEO one, and nothing about search discovery waits on it.

Three things remain open in `docs/seo-final-certification.md` §6 — R-042's archive
dimensions, whether to drop a typeface to save 54 KB, and a Google Business Profile — but
each is an improvement rather than a blocker, and none of them stands between Guneku and
being crawled.

---

## 8. What to watch, and when

Nothing below needs action now. It is what "working" will look like.

- **Days 1–3.** Search Console → Sitemaps should keep reporting Success. The seven priority
  URLs should move from *Discovered* to *Crawled*.
- **Week 1–2.** Pages → Indexing starts filling in. Expect a large *Discovered — currently
  not indexed* bucket at first; for a site of 258 URLs with no inbound links yet, that is
  normal and not a fault to chase.
- **Week 2–4.** Performance → first impressions. The queries worth watching are names:
  "Guneku", "Guneku Fondom", "GUDECA", "GUNECCUL", and individual sons and daughters, which
  is the whole reason all 113 register entries were opened to indexing (ADR-097).
- **Ongoing.** When the Fondom publishes something new, announce it:
  `npm run indexnow -- https://www.guneku.org/updates/<slug>`. One page at a time, never the
  archive.

Do not read an empty Performance report in week one as a failure. A domain whose modern
content is a day old has to be crawled before it can rank, and the legacy 2023 sitemap in
the property is a reminder that Google's picture of this domain is still mostly the old site.
