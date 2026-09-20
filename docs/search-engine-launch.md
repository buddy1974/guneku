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
| Bing indexing requests | **3 COMPLETE** — the three priority URLs not yet indexed |
| IndexNow | **ARMED** — key configured and serving |
| IndexNow launch submission | **COMPLETE** — 24 URLs, HTTP 202 |

---

## 7. Still required from a person

**Nothing.** Bing was the last item and it was completed on 2026-09-20.

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
