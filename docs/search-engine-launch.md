# Guneku — search-engine launch

| Field | Value |
|-------|-------|
| Document tier | 1 — launch record |
| Owner (DRI) | Marcel / Maxpromo Digital |
| Launched | 2026-09-18 |
| Certified SHA | `0b7a72b` |
| Production deployment | `guneku-46v4qxyvz` (`dpl` promoted after `INDEXNOW_KEY` was set) |
| Canonical domain | `https://www.guneku.org` |
| Canonical sitemap | `https://www.guneku.org/sitemap.xml` |

The day Guneku was formally presented to the search engines. What follows is what was
actually done, by whom, and what is still waiting.

> **Submitted is not indexed.** Submission, discovery, crawling and indexing are four
> separate states, and a URL can sit between any two of them for weeks. Nothing in this
> document claims a page is in Google's or Bing's index. It records what was asked of them.

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

**BLOCKED — human action required.**

`bing.com` is not in the browser automation's allowed-domain list, so Bing Webmaster Tools
could not be reached from this session. This is an access limit, not a site problem.

**What Marcel needs to do** — about five minutes:

1. Go to `https://www.bing.com/webmasters` and sign in.
2. Choose **Import from Google Search Console**. The GSC property now exists and is
   verified, so the import carries the verification and the sitemap across in one step.
3. If the import is not offered, add the site manually as `https://www.guneku.org`, verify
   by the XML-file or meta-tag method Bing provides, then submit
   `https://www.guneku.org/sitemap.xml`.

**Bing is not waiting on this to discover the site.** IndexNow (§4) is Microsoft's own
protocol and notifies Bing directly; 24 URLs have already been accepted. The Webmaster Tools
property is for reporting, coverage data and manual controls — worth having, not a
prerequisite for being crawled.

Bing's old anonymous sitemap-ping endpoint was retired in 2023 in favour of IndexNow, so
there is no unauthenticated route that would have avoided this step.

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
| Bing property | **BLOCKED** — human action |
| Bing sitemap | **BLOCKED** — follows the property |
| IndexNow | **ARMED** — key configured and serving |
| IndexNow launch submission | **COMPLETE** — 24 URLs, HTTP 202 |

---

## 7. Still required from a person

1. **Bing Webmaster Tools** — §3. Five minutes, and the GSC import does most of it.

That is the only one. Everything else on the pre-launch list was either done here or is an
improvement rather than a blocker: R-042's archive dimensions, the font weight question, and
a Google Business Profile all remain open in `docs/seo-final-certification.md` §6 and none of
them stands between Guneku and being crawled.

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
