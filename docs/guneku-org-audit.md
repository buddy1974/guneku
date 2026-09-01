# guneku.org — stack audit

**Date:** 2026-09-01
**Purpose:** answer §3 of the Guneku/GUDECA content ingestion brief before any code is written.
**Status:** recon complete · **DECISION GATE OPEN — awaiting Marcel**

---

## Headline

**guneku.org is not running a CMS. It is running this repository.**

The brief's §3 assumes guneku.org is a legacy CMS we must audit and possibly load
content into. That was true earlier today. **It is no longer true.** The domain now
resolves to Vercel and serves the Next.js build from this repo.

The A/B question in §3 is therefore already answered by fact rather than by
preference: we are on **Path B, and it is live in production**.

---

## Evidence

### DNS and hosting

| Check | Result |
|---|---|
| `guneku.org` A record | `76.76.21.21` — Vercel |
| `guneku.org` root | `HTTP 308` redirect to `www` |
| `www.guneku.org` | `HTTP 200`, `Server: Vercel`, `text/html` |
| `guneku.org/administrator/` (Joomla admin) | `308` — no admin, just the redirect |
| Joomla `generator` meta | absent |

### It is the same deployment as our Vercel URL

| Host | Built CSS chunk |
|---|---|
| `www.guneku.org` | `/_next/static/chunks/0~hdvx2us1is..css` |
| `guneku.vercel.app` | `/_next/static/chunks/0~hdvx2us1is..css` |

Identical hash — one deployment behind both hostnames.

### It serves our content

`www.guneku.org` returns 117 KB of HTML containing "Official community website",
"What's happening in Guneku", "Guneku Video", "Afor Foundation" and the 15,000
population figure — all work committed in this session. Zero occurrences of "Joomla".

### The legacy site is gone from this domain

| Legacy route | `www.guneku.org` |
|---|---|
| `/index.php/about/about-guneku` | **404** |
| `/about/about-guneku` | 308 → not found |
| `/guneku-palace/tributes` | 308 → not found |

Earlier today the same URLs returned the full Joomla pages — that is how the
village record, the four Fon tributes and the coronation announcement were
recovered. **That recovery happened just in time.** The Joomla content is now
reachable only through what was migrated into this repository and the crawl in
`content/source/`.

---

## Answers to §3, point by point

**"What is guneku.org actually running on (CMS, version, host, PHP version, DB)?"**
No CMS, no PHP. Vercel edge → Next.js 16.2.3 App Router, TypeScript, Tailwind 4,
content from file-based JSON in `src/data/`, with Neon Postgres and Drizzle present
for the indigenes directory. 79 static pages at the current build.

**"Do we have SSH / FTP / phpMyAdmin / CMS admin, and a staging target?"**
Not applicable. Deployment is GitHub → Vercel on push to `main`. Vercel gives a
preview deployment per branch/PR, which is the staging target. No shell, no FTP, no
database admin panel is involved in publishing content — content is committed to the
repo. Note: the Vercel MCP token in this environment lacks permission on the team, so
Vercel-side settings must be checked by Marcel in the dashboard.

**"Are we (A) loading content into the existing site, or (B) rebuilding on Next.js
and migrating?"**
Neither, as written. **B is complete and in production.** Path A would mean loading
this content into a Joomla installation that no longer serves the domain.

---

## ⚠️ Unplanned state change — flagging clearly

**The DNS was cut over to Vercel during 2026-09-01, and not by me.** The facelift
brief said explicitly: *"Do not cut over guneku.org DNS unless that action has
already been explicitly approved and the production target is ready."* I did not
touch DNS at any point, and every deployment I made went through GitHub → Vercel.

Someone with domain access made the change. It should be confirmed as intentional,
because it has consequences:

1. **The Joomla site is no longer publicly reachable at guneku.org.** If anything
   still lives only there, it must be pulled from the host's filesystem/database now,
   not from the web.
2. **The old site's inbound links and search results now hit our routes.** Legacy
   Joomla URLs 404. A redirect map — already listed as outstanding in earlier
   handover sections — has moved from "nice to have" to "losing traffic today".
3. **The canonical URL in our metadata is `https://guneku.org`,** which is now
   correct rather than aspirational.
4. **The security position is now public-facing on the real domain.** Unauthenticated
   write APIs, the hardcoded `demo-user`, suspended authentication and the absence of
   a privacy policy are no longer behind a `.vercel.app` URL.

---

## What this changes about the ingestion brief

The brief remains sound; only its §3 premise and §4 are obsolete.

- **§4 (Path A)** — drop. There is no CMS to load into.
- **§5 (Path B)** — mostly already satisfied by the existing platform. The content
  model, importer and routes still need building, but not the stack.
- **§6 (validator)** — unaffected and still the first thing to build.
- **§0, §1, §2, §7, §8, §9** — unaffected.

One material adjustment for Marcel to weigh: §5 specifies Drizzle + Neon for the six
content entities. This repository currently serves **all** editorial content from
file-based JSON in `src/data/`, read server-side, with Postgres reserved for the
indigenes directory. Putting Posts/Events/Projects in Postgres would introduce a
second, divergent content system. Keeping them as versioned files matches the
existing platform, keeps provenance in git, and makes the `sourceIds` audit trail
reviewable in a pull request. **Recommendation: file-based, consistent with the
current platform.** This is a DECISION.

---

## Outstanding for Marcel

1. Confirm the DNS cut-over was intentional.
2. Confirm the Joomla host is still accessible for a final filesystem/DB pull, and
   confirm nothing is being paid for that is no longer serving.
3. Decide: file-based content (recommended) vs Drizzle/Neon for the six entities.
4. Approve proceeding past the §3 gate.
