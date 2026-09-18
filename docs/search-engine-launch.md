# Guneku — search-engine launch

| Field | Value |
|-------|-------|
| Document tier | 1 — launch record |
| Owner (DRI) | Marcel / Maxpromo Digital |
| Launched | 2026-09-18 |
| Bing attempt 2 | 2026-09-18, same day — see §3 |
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

**BLOCKED — one human click required.** Attempted 2026-09-18, second attempt.

`bing.com` was outside the browser automation's allowed domains on the first launch attempt.
That was lifted, and Bing Webmaster Tools was driven as far as it can be driven without a
person.

### What was established

| Check | Result |
|---|---|
| Bing Webmaster Tools session | authenticated, Marcel's Microsoft account |
| Existing Guneku property | **none** — a search for "guneku" in the site list returns nothing |
| Add-site methods offered | *Import from Google Search Console*, or add manually |
| Method chosen | **Import from Google Search Console**, as instructed |
| Sites already in the account | several unrelated properties, **none touched** |

Bing's own description of the import: no site verification required, sitemaps imported
instantly, View-Only access to Search Console used to periodically revalidate verification
and update sitemaps. That is why it is the right method and why no manual verification file
was created.

### Where it stopped, and why

The import hands off to Google's OAuth flow. The account chooser accepted
`djstranger2000@gmail.com` — the same account that owns the verified
`sc-domain:guneku.org` property — and the flow reached the final consent screen:

> **Sign in with Google** · You're signing back in to bing.com · djstranger2000@gmail.com ·
> *Cancel* | **Continue**

Requested scopes, read from the OAuth request itself:

```
https://www.googleapis.com/auth/webmasters.readonly
https://www.googleapis.com/auth/userinfo.email
```

Read-only, and exactly what the import needs. **The Continue button does not respond to
programmatic input.** Clicks by element reference, keyboard Return and Space were all tried
and the page did not advance.

That is not a fault to work around. A consent screen is hardened against synthetic clicks on
purpose: the whole point of it is that a person, not a program, grants a third party standing
access to their account. So the attempt stopped there rather than looking for a way past it.

### What Marcel needs to do — one click

The flow is already open in the browser at the consent screen.

1. Click **Continue**.
2. Bing returns to the import page and lists the Google properties. Tick **only**
   `guneku.org` — the other sites in that Google account are not Guneku's.
3. Confirm. Verification and the sitemap come across with it.

If the consent screen has expired by the time it is clicked, it will show an error; restart
from Bing Webmaster Tools → site selector → **Add a site** → **Import**, and the flow resumes
from the same place.

### The alternative, if the import is ever unwanted

Bing's manual route needs a verification artifact: `BingSiteAuth.xml` in `public/`, or a meta
tag in the layout, or a DNS CNAME. All three were deliberately **not** done. The first two
put a permanent verification file in a repository that would then carry two mechanisms for
one job, and cost a production deploy; the third means touching Cloudflare DNS, which is out
of bounds. None of that is worth avoiding a single click on a path that is better anyway —
the import keeps verification and sitemaps in sync afterwards, and a static file does not.

### Bing is not waiting on any of this to find the site

IndexNow is Microsoft's own protocol. Guneku's key is live and verified at
`https://www.guneku.org/indexnow-key.txt`, and 24 principal URLs were accepted with HTTP 202
on the first launch pass. Bing has been told the site exists and what its main pages are.

The Webmaster Tools property adds reporting, coverage data, URL inspection and manual
controls. It is worth having. It is not a prerequisite for being crawled, and Bing retired
its anonymous sitemap-ping endpoint in 2023 in favour of IndexNow, so there is no
unauthenticated route that would have avoided the consent step.

### Not done, because the property does not exist yet

Sections 2–8 of the Bing brief — verifying the imported property, checking the sitemap's
status in Bing, reading Bing's IndexNow dashboard, URL Inspection on the six representative
pages, and the crawl/security/canonical problem sweep — all require the property. They are
the first things to do after the click, and nothing about them was guessed at or reported as
though it had been observed.
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
| Bing property | **BLOCKED** — one human click, at Google's OAuth consent screen (§3) |
| Bing sitemap | **BLOCKED** — comes across with the import |
| IndexNow | **ARMED** — key configured and serving |
| IndexNow launch submission | **COMPLETE** — 24 URLs, HTTP 202 |

---

## 7. Still required from a person

1. **Bing Webmaster Tools** — §3. **One click** on the Google consent screen already open in
   the browser, then tick `guneku.org` on the import list. Everything either side of that
   click is done.

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
