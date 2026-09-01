# GUNEKU — PROJECT HANDOVER REPORT
Generated: 2026-06-04 | Mode: READ-ONLY EXTRACTION | Source of truth for ChatGPT (PM layer) coordinating Opus + Sonnet

> GOVERNANCE NOTE: CLAUDE.md requires reading `C:\Users\loneb\Documents\AI-OPERATING-SYSTEM\MASTER-AI-OPERATING-SYSTEM.md` before work. That file is OUTSIDE the mounted folder and was not accessible this session. Additionally, all 8 files in `docs/` (architecture.md, change-log.md, decision-log.md, known-risks.md, product-brief.md, release-checklist.md, security-checklist.md, workflow-map.md) are EMPTY (0 bytes), and 3 required docs are missing entirely (repository-map.md, data-ownership.md, production-readiness.md). This report is derived 100% from code, git history, and live Vercel API data.

---

## PROJECT NAME
**Guneku Fondom Platform** (`guneku-next` v0.1.0) — GitHub: `buddy1974/guneku` (main) — Vercel project: `guneku` (team `buddy1974s-projects`)

## PROJECT PURPOSE
Official digital home of Guneku Fondom (Mbengwi, Momo Division, NW Cameroon — ~15,000 people, 27 quarters, Meta clan). Legacy 2014 Joomla site migrated to a modern Next.js platform. Serves: cultural/royal content (Fon HRH Fomuki Walters Ticha IX), diaspora community, GUDECA institutions, and a worldwide **Indigenes Directory**. Doubles as a MaxPromo Digital portfolio reference (legacy → modern transformation showcase).

## CURRENT PHASE
Post-"Royal cinematic overhaul" (commit a0efa7e). Public content site live in demo mode. **Authentication suspended** (commit ce3de4c "Suspend Clerk auth for demo — site fully public"). Indigenes backend live but running on a hardcoded `demo-user`.

## PROJECT HEALTH
**WARNING — borderline CRITICAL.** Site runs and looks finished, but: live database credentials are committed to a PUBLIC GitHub repo, all write APIs are unauthenticated, docs are empty, and the custom domain is not attached. Not safe for real users yet.

---

## ARCHITECTURE

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router, Turbopack), React 19.2.4, TypeScript 5 |
| Styling | Tailwind CSS 4, Radix UI, framer-motion, custom oklch design system (Cinzel/Cormorant) |
| Backend | Next.js API Routes (5 endpoints), Node 24.x serverless on Vercel |
| Database | Neon PostgreSQL via `@neondatabase/serverless` raw tagged SQL. **Drizzle ORM installed + schema.ts defined but NOT used at runtime** — queries.ts uses raw SQL; migrations via ad-hoc `migrate.ts` script, no drizzle-kit migrations folder |
| Hosting | Vercel (production = `guneku.vercel.app`), GitHub integration on `main`, bundler Turbopack |
| Storage | Vercel Blob (`access: 'public'`) for profile/avatar uploads |
| Auth | **NONE ACTIVE.** Clerk removed; `next-auth` v5 beta + `@auth/pg-adapter` installed but never wired (no auth.ts, `middleware.ts` is an empty function with `matcher: []`). All indigene routes use `const userId = 'demo-user'` |
| AI | Anthropic SDK — `claude-sonnet-4-6`, max 500 tokens, system prompt built per-request from JSON content files (`/api/chat`) |
| Email | Resend — welcome email, contact form → `info@guneku.org`, new-indigene admin alert |
| Analytics | Vercel Analytics + Speed Insights |
| CMS | File-based JSON in `src/data/` (~140 files: pages, palace, kingdom, updates, gallery, institutions, notables, site-config, navigation), read server-side via `src/lib/content.ts` (`server-only`) |
| Legacy artifacts in repo | `configuration.php` (Joomla), `images/` 71MB, `media/` 60MB, `migration/` 8.7MB, `automation/` (video workflow + SRT script) — all tracked in git (5,012 tracked files) |

---

## COMPLETED FEATURES

### Module: Public Content Site
- Purpose: cultural/royal presentation
- Status: ✅ Complete, deployed
- Key files: `src/app/page.tsx`, `palace/`, `kingdom/`, `gudeca/`, `guneccul/`, `agro-cig/`, `diaspora/`, `updates/`, `notables/`, `projects/`, `gallery/` (images/videos/albums), `contact/`, `not-found.tsx`
- Notes: Ken Burns hero, gold particles, coronation timeline, 27-quarters grid, diaspora globe. Royal design system in `globals.css`.

### Module: JSON Content Layer
- Purpose: file-based CMS
- Status: ✅ Complete
- Key files: `src/lib/content.ts`, `src/data/**`
- Notes: typed readers (SiteConfig, Update, PalaceArticle, KingdomArticle, Notable, Page). No admin UI — editing requires commits (couples content changes to Vercel builds).

### Module: AI Assistant
- Purpose: site-scoped Q&A chatbot
- Status: ✅ Working
- Key files: `src/app/api/chat/route.ts`, `src/components/home/AIAssistant.tsx`, `site-config.json` (aiPersonality)
- Notes: input validated (string check), graceful 503 if no API key. **No rate limiting, no auth, no conversation history, knowledge base rebuilt from disk every request.**

### Module: Search
- Purpose: full-text search across updates/palace/kingdom/notables
- Status: ✅ Working
- Key files: `src/app/api/search/route.ts`, Header search overlay
- Notes: in-memory substring scan of all JSON per request; capped at 8 results; min 2 chars.

### Module: Contact + Email System
- Purpose: contact form → admin inbox; transactional emails
- Status: ✅ Working
- Key files: `src/app/api/contact/route.ts`, `src/lib/email/send.ts`, `src/lib/email/templates.ts`
- Notes: Resend wired. Validation is minimal (`email.includes('@')`). User message interpolated into HTML email **unescaped**.

### Module: Indigenes Directory (read side)
- Purpose: public directory of Guneku people worldwide
- Status: ✅ Working
- Key files: `src/app/api/indigenes/all/route.ts`, `src/lib/db/queries.ts` (`listProfiles`), `src/app/indigenes/page.tsx`
- Notes: search/quarter/country filters, pagination (24/page), `is_public = true` filter, parameterized SQL (injection-safe), `COUNT(*) OVER()` for totals.

### Module: Database Layer
- Purpose: Neon Postgres access
- Status: ✅ Working
- Key files: `src/lib/db/client.ts` (lazy proxy client), `queries.ts`, `schema.ts`, `migrate.ts`
- Notes: single table `indigene_profiles`, 3 indexes. Lazy init avoids build-time env failures — good pattern.

### Module: Mobile/PWA/SEO
- Purpose: mobile-first UX + discoverability
- Status: ✅ Complete
- Key files: `MobileNav.tsx`, `Header.tsx`, `manifest.json`, `layout.tsx` (OG/Twitter metadata, metadataBase `https://guneku.org`)
- Notes: bottom nav, safe areas, toast system, Analytics + SpeedInsights.

---

## IN-PROGRESS FEATURES

### 1. Member Authentication (CRITICAL GAP)
- Done: Clerk fully removed; next-auth v5 beta + pg-adapter + Google/Facebook env placeholders in `.env.example`; sign-in/sign-up routes exist
- Missing: ALL of it — no auth.ts/route handlers, empty middleware, `/sign-in` and `/indigenes/profile` are "Member authentication coming soon" placeholder pages
- Blockers: decision needed — next-auth v5 (installed) vs return to Clerk. DB column is still `clerk_user_id`.
- Dependencies: blocks profile self-management, verification, gating of write APIs

### 2. Indigenes Profile Management (write side)
- Done: full onboarding wizard UI (5 steps, photo upload, quarters/generations taxonomies); POST/PUT/GET API routes; welcome + admin alert emails
- Missing: real user identity — everything writes as `demo-user`. **Functional bug: `clerk_user_id` is UNIQUE, so the SECOND person to complete onboarding gets a DB constraint violation → 500.** `updateProfile` cannot clear fields (COALESCE pattern) and omits `open_to_connect` entirely.
- Blockers: auth (#1)

### 3. Repository Documentation / AI Operating System compliance
- Done: docs/ scaffolding exists, CLAUDE.md governance written
- Missing: all 8 docs are empty; repository-map.md, data-ownership.md, production-readiness.md absent. CLAUDE.md's own startup procedure cannot currently be followed.

---

## PLANNED FEATURES (inferred from code + .env.example — no roadmap doc exists)

**Immediate:** real auth (Google/Facebook OAuth placeholders exist), profile self-service, custom domain `guneku.org` cutover
**Short term:** member verification (`is_verified` flag exists, unused), mentor/connect matching (`willing_to_mentor`, `open_to_connect` flags exist, no UI), welcome email triggering on real signup
**Long term:** automation pipeline (`automation/workflows/video-processing-workflow.json`, SRT generation script), events/donations (festival CTA exists), admin content UI to decouple content edits from deploys

---

## DATABASE

**Tables:** 1 — `indigene_profiles` (28 columns: identity, location, heritage, profession, 6 social URLs, flags, skills_text)
**Relationships:** none (single-table design)
**Indexes:** clerk_user_id, current_country, quarter

**Current risks:**
- `clerk_user_id` column name is a lie post-Clerk-removal — naming debt that will confuse every future session
- No migrations system of record: `migrate.ts` is run-once `CREATE TABLE IF NOT EXISTS`; drizzle-kit installed but zero migration files. Schema drift between `schema.ts` (timestamp) and `migrate.ts` (TIMESTAMPTZ) already exists.
- `skills_text` comma-string instead of array/junction — fine for now, flagged
- Data quality: every row created in demo mode belongs to `demo-user`; production data may contain test rows

**Missing migrations:** rename `clerk_user_id` → `user_id`/`auth_user_id`; adopt drizzle-kit generate/migrate flow

---

## API

| Route | Methods | Auth | Validation | Status |
|---|---|---|---|---|
| `/api/chat` | POST | ❌ none | ✅ type-checked message | Working — abuse risk (paid Anthropic tokens, no rate limit) |
| `/api/contact` | POST | ❌ none | ⚠️ presence + `includes('@')` | Working — spam/HTML-injection risk |
| `/api/search` | GET | public (OK) | ✅ length check | Working |
| `/api/indigenes/all` | GET | public (OK — is_public filter) | ⚠️ parseInt unguarded (NaN page → broken OFFSET) | Working |
| `/api/indigenes/profile` | GET/POST/PUT | ❌ **hardcoded demo-user** | ❌ none — raw body straight to SQL params | Broken-by-design until auth |
| `/api/indigenes/upload` | POST | ❌ **hardcoded demo-user** | ⚠️ MIME prefix + 5MB; extension from user filename; no try/catch | Open public Blob upload — cost/abuse vector |

**Missing endpoints:** profile DELETE (GDPR-relevant — diaspora members in EU/Germany), single-profile GET by slug/id, admin verification endpoint
**Security concerns:** all error handlers return `err.message` to clients (internal leakage); zod is installed and used nowhere on the API surface

---

## SECURITY

**Authentication:** ❌ none active; write endpoints unprotected; placeholder sign-in pages
**Authorization:** ❌ n/a (no identity); `is_verified` unenforced
**Secrets handling:**
- 🚨 **`configuration.php` committed to a PUBLIC GitHub repo (`githubRepoVisibility: "public"`) containing live Hostinger MySQL credentials (`u470588398_guneku` / password) and the Joomla secret key.** This is in git history since the initial commit. The legacy DB at Hostinger must be assumed compromised.
- ✅ `.env.local` correctly gitignored and untracked (verified via `git ls-files`); env access via `process.env` only; no hardcoded API keys in `src/`
**Rate limiting:** ❌ none anywhere (chat = direct money exposure)
**CORS:** Next.js same-origin defaults (acceptable); nothing explicit
**Security headers:** ❌ none configured (`next.config.ts` has no headers(); empty middleware) — no CSP, X-Frame-Options, HSTS
**CSRF:** no tokens; JSON-only POSTs mitigate classic form CSRF, but unauthenticated endpoints make this moot for now
**File upload:** MIME-prefix check only — `image/svg+xml` passes → stored XSS via SVG on public Blob URL; extension trusted from client filename
**Input validation:** zod installed, unused; contact message interpolated unescaped into admin HTML email (phishing/HTML injection into the admin's inbox)
**Logging:** `console.error` only; no access logs, no structured logging, no alerting

---

## UI/UX REVIEW

**What works:** strong, coherent royal identity; mobile bottom nav + safe areas; gallery; AI assistant; search overlay; loading skeletons; 404 page; PWA manifest.
**What feels unfinished:** "Member authentication coming soon" dead-ends behind prominent Join/Login CTAs; onboarding wizard is reachable and submits — into the shared demo-user (second user gets an error); profile page is a placeholder.
**Developer-centric:** raw error messages (`err.message`) surfaced to users; onboarding `uploadPhoto`/`submit` have no failure UI for non-JSON 500s.
**User-centric:** quarters/generations taxonomies, country flags, warm email copy ("Bongob!") — culturally grounded, good.
**Recommended:** hide or gate Indigenes write CTAs until auth ships; friendly error states; success confirmation after contact submit (verify on live site).

---

## AI SYSTEMS

**Implemented:** site-scoped chatbot (claude-sonnet-4-6), personality from site-config, knowledge base composed from JSON content (Fon profile, palace, kingdom, last 10 updates), topic-restriction rules in system prompt.
**Partially implemented:** none.
**Missing:** rate limiting/abuse control (cost exposure), conversation memory, streaming responses, knowledge-base caching (rebuilt + fs-read per request), prompt-injection hardening (user message goes straight into messages — low blast radius given read-only scope, but rules are softly enforced).
**Future opportunities:** embeddings-based search to replace substring scan; AI-assisted content ingestion from the `migration/` corpus; n8n bridge for the video-processing workflow already sketched in `automation/`.

---

## TECHNICAL DEBT

**CRITICAL**
1. Leaked Hostinger DB credentials in public git history (`configuration.php`)
2. Hardcoded `demo-user` identity in 2 API route files
3. Empty governance docs — violates the repo's own CLAUDE.md operating system

**HIGH**
4. next-auth installed but unimplemented + dead Clerk naming (`clerk_user_id`) — two half-migrations stacked
5. No migrations system of record (drizzle-kit unused; schema.ts vs migrate.ts drift)
6. 140MB+ legacy Joomla artifacts (images/, media/, migration/, 5,012 tracked files) bloating clones and build uploads — direct Vercel Build CPU cost driver
7. zod installed, zero API validation schemas

**MEDIUM**
8. `images.unoptimized: true` with a 136MB `public/` — no next/image pipeline
9. `err.message` returned to clients across all routes
10. Drizzle ORM as dependency while runtime uses raw SQL — pick one
11. `updateProfile` cannot null-out fields; omits `open_to_connect`

**LOW**
12. `tsconfig.tsbuildinfo` committed; `as any` casts in search route and queries; duplicate JSON between `src/data/about/` and `src/data/kingdom/`

---

## KNOWN BUGS

| # | Bug | Severity |
|---|---|---|
| 1 | Second user completing onboarding → UNIQUE constraint violation on `clerk_user_id='demo-user'` → 500 | HIGH |
| 2 | `updateProfile` never updates `open_to_connect` | MEDIUM |
| 3 | COALESCE update pattern makes fields un-clearable (empty string → `null` → keeps old value) | MEDIUM |
| 4 | `page=abc` → `parseInt` NaN → invalid SQL OFFSET on `/api/indigenes/all` | LOW-MED |
| 5 | Upload route lacks try/catch → unhandled rejection on Blob failure | LOW-MED |
| 6 | SVG uploads accepted as images → potential stored XSS on public Blob | MEDIUM |

---

## DEPLOYMENT STATUS

- **Development:** local (Windows 11, Turbopack dev)
- **Staging:** none (no preview-branch workflow; everything pushes to main → production)
- **Production:** ✅ READY on Vercel — latest deploy `dpl_jQ5xX…` (commit a0efa7e), Node 24.x
- **Domains:** `guneku.vercel.app` + 2 internal aliases. **`guneku.org` is NOT attached to the Vercel project** — yet it is the metadataBase, email link target, and canonical URL throughout the code. Links in welcome/alert emails point to guneku.org (legacy host or dead).
- **Environment variables:** keys per `.env.example`: ANTHROPIC_API_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN, AUTH_SECRET/AUTH_URL, Google/Facebook OAuth (unused), RESEND_API_KEY, EMAIL_FROM/EMAIL_ADMIN
- **Deployment risks:**
  - 🚨 **Every push produces TWO production deployments** (pairs 4–13 seconds apart for the same commit — one with `actor: "claude"` CLI/redeploy + one GitHub-integration build, visible across the entire deployment history). **This roughly doubles Build CPU minutes and is the most likely root cause of the Vercel cost problem named in the project instructions.** Fix the duplicate trigger before optimizing anything else.
  - Public GitHub repo + content-in-repo model means every article edit = full production build
  - No staging gate; no rollback runbook documented

---

## NEXT RECOMMENDED ACTIONS — TOP 10 TASKS

| # | Task | Priority | Impact | Complexity | Assignee |
|---|---|---|---|---|---|
| 1 | Rotate Hostinger MySQL password + Joomla secret; remove `configuration.php` from repo and purge from git history (or make repo private) | BLOCKER | Prevents legacy DB compromise | Low | SONNET (execution) after OPUS confirms scope |
| 2 | Eliminate duplicate Vercel production builds (audit deploy hooks / CLI deploy habit vs git integration — keep exactly one trigger) | BLOCKER (cost) | ~50% build-minute reduction | Low-Med | OPUS (diagnose) → SONNET (apply) |
| 3 | Decide + implement auth (next-auth v5 already installed vs Clerk return); wire middleware, gate indigene write routes | BLOCKER | Unblocks entire Indigenes product | High | OPUS (architecture decision) → SONNET (implementation) |
| 4 | Replace `demo-user` with session identity; add zod schemas to all POST/PUT bodies; stop returning `err.message` | HIGH | Closes write-API hole | Medium | SONNET |
| 5 | Add rate limiting (Vercel WAF / upstash) to `/api/chat`, `/api/contact`, `/api/indigenes/upload` | HIGH | Stops cost abuse + spam | Medium | SONNET |
| 6 | Strip 140MB legacy assets (`images/`, `media/`, `migration/`) out of the repo (archive to Blob/R2; .vercelignore) | HIGH | Build speed + cost + clone size | Medium | SONNET (after OPUS defines what must be preserved) |
| 7 | Attach `guneku.org` to Vercel and cut over DNS; reconcile all hardcoded URLs | HIGH | Launch-critical | Low | SONNET |
| 8 | Populate `docs/` (architecture, decision-log, known-risks, production-readiness) from this report | HIGH | Restores governance; CLAUDE.md compliance | Low | OPUS (content) |
| 9 | DB cleanup migration: rename `clerk_user_id`, adopt drizzle-kit migrations, fix updateProfile bugs (#2/#3), purge demo rows | MEDIUM | Data integrity | Medium | OPUS (design) → SONNET (execute) |
| 10 | Harden uploads (allowlist jpeg/png/webp, ignore client extension, sanitize), escape HTML in email templates, add security headers in next.config | MEDIUM | Closes XSS/injection vectors | Medium | SONNET |

## OPUS VS SONNET ASSIGNMENT

| Task | Reason | Assigned To |
|---|---|---|
| Credential-leak scope assessment + history purge plan | Security audit judgment | OPUS |
| Duplicate-deployment root-cause diagnosis | Debugging unknown infra behavior | OPUS |
| Auth architecture decision (next-auth vs Clerk) + session model | Architecture | OPUS |
| DB schema redesign + migration strategy | Database design | OPUS |
| docs/ population + decision-log backfill | Planning/audit output | OPUS |
| UX review of gated CTAs and error states | UX review | OPUS |
| Execute history purge / repo privatization steps | Mechanical execution | SONNET |
| Implement auth routes, middleware, session wiring | Implementation | SONNET |
| zod validation + error-response refactor across 6 routes | Coding | SONNET |
| Rate limiting integration | Implementation | SONNET |
| Asset strip + .vercelignore + redeploy verification | Build/deploy work | SONNET |
| Domain attach + URL reconciliation | Configuration/deploy | SONNET |
| Upload hardening + email escaping + headers | Coding | SONNET |
| updateProfile bug fixes + tests | Coding/tests | SONNET |

**Batching note (Vercel cost rule):** tasks 4, 5, 7, 10 and the bug fixes should ship as ONE batched push after local lint/typecheck/build — not as individual deploys.

---

## PROJECT SCORECARD

| Dimension | Score | Rationale |
|---|---|---|
| Architecture | 7/10 | Clean App Router structure, sensible content layer, lazy DB client; held back by dual half-migrated auth stacks and Drizzle-as-decoration |
| Security | 2/10 | Live credentials public in git history; zero auth on writes; no rate limiting; no headers — content site is fine, but the platform surface is open |
| Documentation | 1/10 | Governance framework exists but every document is empty; CLAUDE.md's own procedure is currently unexecutable |
| Code Quality | 6/10 | Consistent, typed, parameterized SQL, tidy components; zod unused, `as any` spots, error-message leakage |
| Maintainability | 5/10 | JSON CMS couples content to deploys; 5,012 tracked files / 140MB legacy weight; no migration system; misleading column names |
| Production Readiness | 4/10 | Deploys are green and the public site works; but secrets leak, broken second-user flow, missing domain, and doubled build costs block real launch |
| **Overall** | **4/10** | Excellent demo, not yet a production system. One focused hardening sprint (tasks 1–7) lifts this to 7+. |

==================================================
END REPORT
==================================================

---

# FACELIFT EXECUTION — 2026-09-01

Executed by Claude Code under the Section 43 immediate-execution override.
Scope was deliberately limited to a public UI facelift; no auth, database,
CMS or architecture work was performed.

## APPROVED REFERENCE

`C:\Users\loneb\Downloads\guneku-design.png`

The reference sheet contains three concepts. **Design 1 — "Heritage Inspired"**
is the one implemented: it is the only one matching the written brief
(Sections 4–7 — split hero, news rail, ivory pathway strip, the specified
header architecture).

The reference was treated as design direction, not content truth. Its hero
imagery is conceptual/AI-generated and was **not** reproduced; the composition,
hierarchy, density and colour language were rebuilt around authentic assets.

## COMMIT

- Branch: `main`
- Facelift commit: `a5ab74e54328c6ae92731876c8f1d39a101338b7`
- Deployment path: GitHub push → Vercel GitHub integration (no manual second deploy)

## FILES CHANGED

| File | Change |
|---|---|
| `src/app/page.tsx` | Rewritten to the approved composition |
| `src/components/home/HeroEditorial.tsx` | **New** — split hero + news rail + Fon quotation |
| `src/components/home/PathwayStrip.tsx` | **New** — ivory community pathways |
| `src/components/layout/Header.tsx` | Rebuilt to approved IA; new mobile drawer |
| `src/app/globals.css` | Added editorial layer (ink/burgundy/ivory/brass + type scale); removed body wash; header offset; reduced-motion guard |
| `src/app/layout.tsx` | Genuine OG image; honest meta description; removed film-grain overlay |
| `src/components/home/BuiltBySection.tsx` | Restyled to the design language (links unchanged) |
| `src/app/gallery/page.tsx` | AI showcase replaced with genuine archive photographs |
| `src/app/kingdom/page.tsx` | 2 AI backdrops → genuine photographs |
| `src/app/palace/page.tsx` | 3 AI backdrops → genuine photographs |
| `public/images/site/*` | **New** — 8 prepared derivatives of genuine archive photographs |

## COMPONENTS RETAINED

`lib/content.ts`, `Footer`, `MobileNav`, `Reveal` (still used by other pages),
`PageTransition`, `projects/page.tsx`, search API, all content routes.

## GENUINE ASSETS USED — PROVENANCE

All derived from the repository's own photographic archive. Prepared
(resized, mildly sharpened, re-encoded); no generative editing.

| Prepared asset | Source | Subject |
|---|---|---|
| `site/fon-coronation-2016.jpg` | `gallery/coronation/511868434_….jpg` | HRH Fon Fomuki Walters Ticha IX in white ceremonial robe — hero |
| `site/palace-grounds.jpg` | `gallery/coronation/511887728_….jpg` | Palace grounds, 2016 coronation |
| `site/kingdom-hills.jpg` | `gallery/coronation/512674865_….jpg` | Palace compound and Momo hills at dusk |
| `site/coronation-crowd.jpg` | `gallery/coronation/512412531_….jpg` | Coronation gathering |
| `site/notable-portrait.jpg` | `gallery/coronation/511323787_….jpg` | Guneku notable with ceremonial beaded staff |
| `site/diaspora-us.jpg` | `gallery/guneku-dmv-welcomefomuki/486307250_….jpg` | GUDECA-US welcome event |
| `site/michi-ebeng.jpg` | `gallery/mchibe-mta-event-guneku2023/2.jpeg` | Mɨchi Əbeŋ festival, 2023 |
| `site/og-guneku.jpg` | same source as `palace-grounds` | Open Graph card, 1200×630 |

## AI-GENERATED IMAGERY REMOVED FROM THE UI — IMPORTANT

Five root images are **AI-generated, not photographs**:
`hero-fon.jpg`, `kingdom-aerial.jpg`, `palace.jpg`, `regalia.jpg`, `festival.jpg`.

They were being presented to the public as genuine dated Guneku photographs —
`/gallery` captioned them "The Fon at Sunrise · 2025", "Palace Courtyard · Dusk",
"Beaded Crown · Heritage". This breached the authenticity rule in Section 11 and
was the real problem underneath the "vibe-coded" appearance.

No UI now references them. **The files still exist in `public/`** and should be
deleted once Marcel confirms — they are referenced only by
`src/data/kingdom/exhibitions.json` legacy body HTML (a Joomla path string, not a
live image).

## CONTENT DECISIONS — VERIFIED DATA ONLY

Rendered because verified:

- **27 quarters** — legacy village record (`src/data/home/home-page.json`)
- **Ninth Fon / enthroned 2015 / crowned 17 Jan 2016** — `palace/fon-walters-profile.json`
- **3 continents** — GUDECA chapters (Cameroon, Europe, North America)
- **Solar Street Lighting Phase II (€800, fundraising)**, **Digital Empowerment
  Training (proposed, Ni Sam)**, **GUDECA EU meeting 24 July 2027, UK** — all from
  `src/data/institutions/gudeca-eu.json`
- The Fon's quotation — `fon-walters-profile.json`

Removed or withheld:

- **"For five hundred years…"** — no source anywhere in the repository. Deleted.
- **Population** — deliberately not shown. The only figure in the repository is
  *"a population of approximately 10 000 inhabitants"* (legacy demography page,
  `src/data/pages/about-template.json`), which conflicts with the 15,000 used in
  `site-config.json`, the layout metadata and this handover.
  **DECISION NEEDED FROM THE PALACE.**
- **Meta clan size** — legacy sources conflict: the home page says *29 villages*,
  the demography page says *31 communities*. Not rendered as a number.

## RESPONSIVE DECISIONS

- Hero splits at **≥1280px**; below that the photograph stacks above the editorial
  panel, so tablets get a real layout rather than a squeezed split.
- News rail: 1-up → 2-up (≥640) → 4-up (≥1280).
- Pathway strip: 2 → 3 → 7 columns.
- Hero headline holds the reference's four-line structure at every width.
- Verified at **375 / 390 / 430 / 768 / 1024 / 1440** — no horizontal overflow at
  any width; touch targets ≥44px; bottom nav and safe-area insets intact.

## DEFECTS FOUND AND FIXED DURING THE WORK

1. **Mobile header broken below 1024px** — the custom `.ed-btn` utility sets
   `display`, which beat Tailwind's `hidden`, so the gold CTA rendered on phones
   and pushed the search and menu buttons outside the viewport. The CTA is now
   wrapped in a `hidden lg:block` span.
2. **Content depended on JavaScript to become visible** — every homepage section
   was wrapped in `Reveal` (opacity 0 until IntersectionObserver fires). Removed
   from the homepage; a real risk on slow connections.
3. **Fixed header overlapped page content** — the header is now opaque, so `main`
   gets a `--header-h` offset (60px / 76px).

## VERIFICATION

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** — clean |
| `eslint` (facelift files) | **PASS** — 0 errors, 1 warning (unused `_nav` prop, pre-existing signature) |
| `npm run build` | **PASS** — 72 static pages generated |
| Route smoke test | **PASS** — 26 routes return 200 |
| Visual inspection | **PASS** — 6 breakpoints; hero, nav, images, CTAs, footer checked |

Repo-wide `npm run lint` reports many pre-existing errors (45 in `src`, including
6 `no-explicit-any` in gallery/kingdom/palace and 1 in the dead, unimported
`PalaceFeature.tsx`). **None were introduced by this work** and none were fixed —
out of scope.

## KNOWN ISSUES — VISUAL

- The best authentic photograph of the reigning Fon is **960×720**. It is adequate
  for the hero but soft on high-density displays. **A high-resolution portrait of
  HRH Fon Fomuki Walters Ticha IX is the single most valuable asset Marcel could
  supply.**
- `next.config.ts` sets `images.unoptimized: true`, so every image ships at its
  authored size. Derivatives were pre-sized to compensate; enabling the image
  optimizer later would be a real win.
- No **Education & Empowerment** page exists, so that pathway from the reference is
  not in the strip; education content currently lives under Development/GUDECA.

## KNOWN ISSUES — FUNCTIONAL (NOT INTRODUCED HERE)

- `src/data/navigation.json` still contains **unmapped Joomla paths** that 404:
  `/kingdom/about-guneku`, `/palace/the-coronation`, `/palace/notables`,
  `/palace/tributes`. The new header avoids them; the JSON needs a reconciliation
  map (see Section 12 of the crawl brief).
- `/diaspora` renders **invented per-country population counts** (12,400 / 780 /
  640 …) with no source. Not surfaced on the homepage. **Should be corrected.**
- `src/components/home/PalaceFeature.tsx` is dead code, imported nowhere.

## DEFERRED — MARCEL'S DECISION, NOT A DESIGN ONE

`BuiltBySection` carried a full agency advertisement on the Fondom's homepage: an
oversized "MAXPROMO DIGITAL" headline, "Want This For Your Community?" and "Free
Automation Audit" lead-generation buttons, and the unverifiable claim "The first
AI-powered digital platform for an African Fondom".

It was **restyled, not removed** — every link and the business intent are intact,
now in the approved editorial language, and the superlative claim was dropped.
Whether vendor lead-generation belongs on the Fondom's public homepage is
Marcel's call.

## SECURITY BLOCKERS — STILL OUTSTANDING

Unchanged by this work and still the top priority:

- Unauthenticated write APIs; all indigene routes run as a hardcoded `demo-user`.
- Authentication suspended entirely (commit `ce3de4c`).
- Credentials and legacy artifacts committed to a public repository.

## RECOMMENDED OPENCLAW NEXT ACTION

**Security containment first** — auth restoration and the write-API surface,
before any further feature or content work.

## TAKEOVER RULE

**The facelift is an approved baseline.** OpenClaw may audit and improve it, but
must not discard the approved visual direction and return Guneku to a generic
template. The forensic, security, migration and content-reconciliation missions in
Sections 1–42 and 44 remain fully in force; this facelift does not replace any of
them.

---

# CONTENT RECONCILIATION — 2026-09-01 (follow-up to the facelift)

Second controlled execution of the same day, continuing from the running
platform. No reset, no rebuild: the approved facelift was preserved and the
working architecture was left intact.

## STATE AT CLOSE

| | |
|---|---|
| Branch | `main`, in sync with `origin` |
| Facelift commit | `a5ab74e` |
| Handover commit | `5c16da5` |
| Reconciliation commit | `15d682c` |
| Live URL | https://guneku.vercel.app — verified live |
| Legacy site | https://guneku.org — still serving Joomla; **DNS not cut over** |
| Deployment | GitHub → Vercel integration; one deploy per push, no manual duplication |
| Build | 75 static pages (was 72) |

## THE CENTRAL FINDING

**The richest legacy content was already migrated but unreachable.**

`src/data/pages/*.json` holds the full village record — 5,065 characters
including the Ngon market cycle, the Musongong dance, the MENEMO dialect, the
church and school counts. **No route renders that directory.** It is read only
by the search API. The content had been migrated in Phase 2 and then stranded.

This is worth remembering for the rest of the migration: *before concluding
that legacy content is missing, check whether it is merely unrouted.*

## LEGACY AUDIT — WHAT IS ACTUALLY THERE

Fetched live from guneku.org and compared against `src/data`:

| Legacy page | Content on legacy | Status now |
|---|---|---|
| `/about/about-guneku` | 5,075 chars — substantial | **Recovered** → `/kingdom/about-guneku` |
| `/guneku-palace/tributes` | 4,304 chars — four tributes | **Recovered** → `/palace/tributes` |
| `/guneku-palace/the-coronation` | 911 chars | **Recovered** → `/palace/the-coronation` |
| `/about/religion` | **8 chars — empty** | Empty on legacy too; not a migration failure |
| `/about/the-guneku-cultural-heritage` | **28 chars — empty** | Empty on legacy too |
| `/about/touristic-sites` | **35 chars — empty** | Empty on legacy too |
| `/pages/projects` | **7 chars — empty** | Empty on legacy too |
| `/guneku-palace/notables` | 170 chars — placeholder rows | Effectively empty on legacy |
| `/pages/indigenes` | 423 chars — five named people | **Not migrated — see below** |

**Conclusion: there is no large body of un-migrated legacy prose waiting to be
recovered.** The Joomla site was itself mostly empty outside the pages above.
The gap in the new platform was routing and surfacing, not extraction.

## LEGACY CONTENT INCORPORATED

### `kingdom/about-guneku` (new)

The village record, restored and now reachable. Preserves, per the cultural
rule:

- the eighth-day market **&ldquo;Ngon&rdquo;** held in Guneku, and the rest of the cycle —
  **&ldquo;Tan&rdquo;** in Ngamunghe, **&ldquo;Mbon&rdquo;** in Mbengeghang, **&ldquo;Eje&rsquo;e&rdquo;** in Ngamunam
  (Munam), **&ldquo;Kwe&rdquo;** in Fringyeng
- **Musongong**, the dance of the Guneku people
- the **MENEMO** dialect, including the community's own correction that
  calling it &ldquo;META&rdquo; is not right
- the church count (12 Presbyterian, 2 Catholic, 1 Full Gospel, 1 Good
  Shepherd Ministry, 1 Apostolic, 1 Mount Zion, 1 Kingship Ministry)
- G.S.S. Guneku and G.S.S. Ngamungeh; the caves and their colonial-era use;
  the River Batmuki; oil palm, raffia, coffee, maize, groundnuts, plantains,
  cocoyam; the Bantou and Mbororo communities

Grammar, punctuation and structure were corrected. No name, date, figure,
place or cultural term was altered.

### `palace/tributes` (new)

Four tributes on the passing of HRH Fon Fomuki Patrick Nji, from **HRH Fon
Angwafor III of Mankon**, **HRH Akam M. of Kai**, **HRH Fon Fominyen of Nyen**
and **HRH T. Njokem of Mbengwi**. The four portraits were already in
`public/images/tributes/`; the article was never migrated, so the images sat
unused and the nav link 404'd.

Quotes are reproduced as written. Only typographic damage from the old
publishing system was repaired — spaced-out letters closed up, doubled full
stops reduced, run-together words separated. **&ldquo;Kwifor&rdquo;** is retained as the
name of the traditional regulatory society. **&ldquo;Wake Up Ets&rdquo;** appears in the
original as &ldquo;WAKE UPEts&rdquo;; the intended form is unconfirmed and is flagged in
the article itself.

### `palace/the-coronation` (new)

The succession announcement, which Joomla had mis-filed under
`kingdom/exhibitions`.

## CHRONOLOGY CORRECTED

`predecessorReign` was **1965–2014**. It is now **1965–2015**.

Three independent sources agree that HRH Fon Fomuki Patrick Nji left the
palace on **28 January 2015**:

1. the legacy coronation announcement;
2. the tributes — HRH Fon Fominyen of Nyen records the Fon speaking to him on
   **27 January 2015**, the day before;
3. the Palace memorial image (`images/about/cover.webp`): born 2/1/1938,
   departure 28/1/2015.

The interval also matches the successor's enthronement on 27 February 2015 —
&ldquo;about a month later&rdquo;, exactly as the announcement says.

**The traditional idiom matters here.** &ldquo;Left the palace on an emergency call
to a long journey&rdquo; is how the passing of a Fon is announced, and the
&ldquo;returning Fon&rdquo; is the successor. Reading it literally would merge two
different men into one person. The articles now explain the idiom rather than
erase it.

## CONFLICTS RECORDED, NOT RESOLVED

Per the rule against guessing, these are published as open questions inside
the relevant articles:

| Conflict | Source A | Source B |
|---|---|---|
| **Population** | ~10,000 (village record) | 15,000 (site-config, project docs) |
| **Meta clan size** | 29 villages (legacy home page) | 31 communities (village record) |
| **Schools** | 4 primary, 1 secondary | 7 primary, 2 secondary — *same article* |
| **Coronation date** | 17 January 2016 (Palace record) | 30 December 2016 presentation (legacy) |
| **Regnal numbering** | &ldquo;Fon Patrick Fomuki II&rdquo; | reigning Fon styled &ldquo;the ninth&rdquo; |

**All five need the Palace to rule on them.** None should be settled by a
developer.

## FABRICATED DATA REMOVED FROM LIVE PAGES

- **`/diaspora`** carried per-country population counts — 12,400 Cameroon,
  780 Germany, 640 USA, 210 Belgium, and so on — with no source anywhere in
  the repository. Counts removed; the countries and chapter organisations
  remain. The &ldquo;15K+ sons &amp; daughters&rdquo; centre stat is replaced with the
  verified three-continent chapter fact.
- **`/kingdom`** carried &ldquo;15,000+ Indigenes&rdquo;, &ldquo;Fifteen thousand souls&rdquo; and
  &ldquo;1,200m Above Sea Level&rdquo;. All unsourced; all removed and replaced with
  figures the record supports.

## NAVIGATION

The header now links only to pages that have content. The five kingdom stubs
(`history`, `religion`, `touristic-sites`, `the-guneku-cultural-heritage`,
`map-of-guneku`) are **empty on the legacy site as well**, so they are no
longer promoted; their subject matter is covered inside About Guneku. The
files remain in place and the routes still resolve.

`src/data/navigation.json` is still stale and still contains the unmapped
Joomla paths. It is passed to `Header` as a prop that the component ignores.
**It should be either rewritten or deleted** — left as is, it is a trap.

## NEWS ARCHIVE

`/updates` is rebuilt in the approved editorial language and **grouped by
year** — 2023 (9 records), 2021, 2016 — with the newest record featured above.
Earlier years no longer fall off the end of a card grid. Undated records are
kept together rather than dropped.

## BONN 2026 MATERIAL — NOT BUILT, AND WHY

`C:\Users\loneb\Downloads\guneku-vidz` holds **10 files but only 6 unique
videos**. Verified by content hash:

| Unique video | Duplicated as | Size |
|---|---|---|
| `1.mp4` | — | 7.7 MB |
| `2.mp4` | `7.mp4`, `8.mp4` | 5.7 MB |
| `3.mp4` | `9.mp4` | 0.7 MB |
| `4.mp4` | — | 28.7 MB |
| `5.mp4` | — | 6.3 MB |
| `6.mp4` | `WhatsApp Video 2026-03-28 at 22.39.43.mp4` | 5.8 MB |

The brief describes **twelve** videos (three of the Fon, two of Ni Sam Fongoh,
seven social/cultural). **Six exist.** The filenames carry no speaker
information, and attribution cannot be established without watching and
listening to them.

**No Bonn event record was built, and no video metadata was written.** Doing
so would have meant inventing who is speaking in which clip — precisely the
fabrication the brief forbids. The event *record* is already correct on the
site: the Bonn meeting of 28 March 2026, the €800 raised for Solar Street
Lighting Phase II, and the 24 July 2027 UK meeting all come from
`institutions/gudeca-eu.json` and appear on the homepage.

### 🔔 SIGNAL — MARCEL, ACTION NEEDED

```
WHAT:  YouTube URLs + speaker attribution for the 6 unique Bonn videos
WHY:   Unblocks the Bonn 2026 event archive and the Palace speech metadata
       model. Video files must not go into the repo (71 MB, no streaming);
       the YouTube channel UCEmIEHRMg3UTzb1wpxLZOAw is already integrated.
DO:    Upload the 6 unique videos, then tell me for each: speaker, role,
       topic, and whether it is a Palace address or community/cultural
       footage. Confirm whether 6 is the full set or 6 more are missing.
REPLY: "done" with the list
```

## STILL AWAITING RECONCILIATION

- **Indigenes / notables.** The legacy `/pages/indigenes` names five people
  with professional details (including one likely to be the Ni Sam Fongoh of
  the GUDECA EU material). The repository holds only two notables. **Not
  migrated deliberately** — this is personal data about living people, and the
  brief says not to expand personal-data collection in this phase. Needs
  consent, not a copy-paste.
- **Quarter names.** `/kingdom` lists 27 quarter names; only Ngamunghe,
  Mbengeghang, Munam, Fringyeng and Ngong are corroborated by any source.
  Several others look doubtful. **Not changed** — replacing place names
  without a source would be worse than leaving them. Needs the Palace.
- **FTP media forensics** — not started.
- **Redirect map** from legacy Joomla URLs — not built. The legacy footer is
  itself mis-mapped (Touristic Sites → the-coronation, GUDECA → the Fomuki
  legacy page), so the map must be built from intent, not from legacy hrefs.
- **Terms and Privacy.** The legacy site has both; the new platform has
  neither, while `/indigenes/onboarding` collects personal data. This is a
  **compliance gap**, not just a content gap.
- **Project statuses.** `Open Door Hospital Eye Unit` is marked ACTIVE from a
  dated launch announcement; the 2022 scholarship record (470,000 FCFA,
  26 August 2022, P.S. Mbengwi Annex Guneku) is a **separate** dated event
  from the Afor Scholarship and is not yet its own record.

## FUNCTIONALITY

**Working and verified:** homepage, kingdom, palace and all article routes,
updates archive, gallery, projects, GUDECA, GUNECCUL, Agro CIG, diaspora,
contact, indigenes directory and onboarding, search API, AI assistant,
YouTube integration, analytics, PWA manifest, responsive behaviour.

**Untouched by this execution:** database, authentication, uploads, AI,
search indexing, YouTube integration.

## SECURITY — UNCHANGED, STILL THE PRIORITY

Nothing in this execution touched security, and nothing in it should be read
as clearing any of it:

- write APIs unauthenticated; indigene routes run as a hardcoded `demo-user`
- authentication suspended (`ce3de4c`)
- legacy artifacts and configuration committed to a public repository
- no Terms or Privacy Policy while personal data is being collected

No credentials appear in this document, and none were copied anywhere.

## OPENCLAW TAKEOVER POINT

OpenClaw inherits a **running, deployed product** with an approved visual
baseline and a partially reconciled content layer.

**Do not rebuild.** Specifically, do not rebuild: the facelift, the header and
information architecture, the recovered articles, the updates archive, the
content layer, the database, the AI assistant or search.

**Recommended first mission: security containment.** Authentication and the
write-API surface, before any further content or feature work. The site is
public and collecting personal data with no auth and no privacy policy.

**Then, in order:** the five Palace fact rulings above; the redirect map;
Terms and Privacy; FTP media forensics; the Bonn archive once Marcel answers
the signal.

**Read before proposing anything:** this handover in full, the repository, git
history, the latest Joomla crawl, and the live site.

---

# EDUCATION & SCHOLARSHIP PROGRAMME — 2026-09-01

Third controlled execution of the day. Continued from the running platform;
the facelift and the reconciliation work were preserved.

## STATE AT CLOSE

| | |
|---|---|
| Branch | `main`, in sync with `origin` |
| Programme commit | `0ada733` |
| Live URL | https://guneku.vercel.app — verified |
| **Scholarship page route** | **`/education`** — https://guneku.vercel.app/education |
| **YouTube URL** | **https://youtu.be/UfpBzWOEDZM** |
| **Flyer path** | **none in repository — deliberately withheld, see below** |
| Build | 76 static pages (was 75) |

## STATE CORRECTION

The brief was written as a *correction* to an existing scholarship page and
flyer. **Neither existed.** There was no scholarship route, no scholarship
record, no flyer in `public/`, and no occurrence of either the contact number
or the video ID anywhere in the repository. This was net-new work, not a fix.

The flyer itself was found at `C:\Users\loneb\Downloads\guneku-scholarship.png`
and read directly; it is the approved source text for everything published.

## ⚠️ CONTACT NUMBER — DISCREPANCY CONFIRMED AND HANDLED

| | |
|---|---|
| Printed on the supplied flyer | **+237 677 46 16 09** |
| Authoritative (per Marcel) | **670 949 503** |

They do not match. Verified before publishing, exactly as instructed.

**What was done:** the website publishes **670 949 503** only. Production has
been checked and carries **zero** occurrences of the superseded number.

**The flyer was NOT published and was NOT added to the repository.** Adding it
would have put a contradicting number in front of readers on the same page as
the correct one. It is recorded in the programme record under `flyer.status:
"withheld"` with the reason. **A corrected flyer is required before any
production, print or social-media use.**

The number is displayed exactly as supplied. The `tel:` and WhatsApp links use
`+237670949503` — the country code is taken from the flyer's own `+237`
prefix, not invented.

## ⚠️ ONE DATE HAS ALREADY PASSED

Today is **1 September 2026**.

- **Information Day — Saturday 29 August 2026: already past** (three days ago).
- **Selection Examination — Saturday 19 September 2026: still ahead.**

Both dates are recorded on `/education` as the programme record, without
claiming either is upcoming. The **homepage feature deliberately surfaces the
19 September examination**, since presenting the Information Day as forthcoming
would be wrong.

**Marcel should confirm** whether the Information Day took place as planned,
and whether the campaign should now be framed around the examination alone.
Both dates were checked and do fall on Saturdays as the flyer states.

## THE PROGRAMME RECORD — ONE CONNECTED RECORD

`src/data/institutions/education-scholarship-day-2026.json` holds the whole
programme; `src/app/education/page.tsx` is a thin renderer over it. Nothing is
fragmented across unrelated pages.

Contains: the summary; both dates with venue, time, audience and their full
point lists; the 50-scholarship target with full and partial terms and the
extension conditions; the open-to-all message; the six educational pathways;
contact; the appeal lines and motto; the video; and links back to the related
historical records (2022 distribution, Afor Scholarship, Royal Community
Library).

## VIDEO INTEGRATION

Verified live through YouTube oEmbed **before** use — the video exists on the
*Guneku Village* channel.

- **Placement:** after the introductory summary, before the detailed
  scholarship information, under &ldquo;Watch the scholarship announcement&rdquo; — as
  specified. Anchor `#video`.
- Responsive 16:9, `youtube-nocookie`, `loading="lazy"`, **no autoplay**,
  accessible `title`, mobile friendly.
- Original URL preserved in structured content.
- Added to `src/data/gallery/video-gallery.json` with `relatedRoute:
  "/education"`, so the media system links back to the programme rather than
  stranding it in the generic gallery.
- **No description or transcript was written.** None was supplied, and none was
  inferred from the video.

**Note on the title.** The video's actual published title is *&ldquo;ST THIERRY
UNIVERSITY VISITS GUNEKU MEDPHISATG, His Royal Highness SCHOLARSHIPS
2026/2027&rdquo;*, which differs from the suggested metadata title. The suggested
title is used as the display title; the real published title is shown beneath
the embed as attribution rather than being overwritten. Both are kept in the
record.

## HOMEPAGE, NAVIGATION AND SOCIAL

- Homepage upcoming band now features the programme with **Learn more** and
  **Watch video**, showing the 19 September date and the Palace venue.
- **Education** added to the homepage pathway strip (now eight pathways) and to
  the Development menu. *This fills the EDUCATION pathway that the approved
  design reference asked for and that the previous handover flagged as
  missing.*
- Open Graph metadata on `/education` uses the video's YouTube thumbnail, so
  the link previews correctly when shared. The website is the canonical source;
  social copy may carry the YouTube link alongside it.

## NOT BUILT — SOURCE TEXT REQUIRED

The brief lists sections that **are not on the supplied flyer** and were not
invented. They are recorded in the programme record under `pendingSections`:

- **Laboratory Sciences section.** The flyer has *Health & Medical Programmes*
  but nothing on Laboratory Sciences. The video title mentions
  &ldquo;MEDPHISATG&rdquo;, which may be the related institution, but that is a guess and
  was not acted on.
- **Displaced-student message.** Not present on the flyer.
- **Support / partner appeal.** The flyer carries only the closing lines
  (&ldquo;Let us invest in our children&rdquo;), not a formal appeal.
- **Registration mechanism.** The flyer says register in advance but names no
  form, email or deadline beyond the Guneku Library contact.

### 🔔 SIGNAL — MARCEL, ACTION NEEDED

```
WHAT:  (1) corrected flyer showing 670 949 503
       (2) source text for the Laboratory Sciences section, the
           displaced-student message and the support/partner appeal
       (3) the registration mechanism and any deadline
       (4) confirmation of whether the 29 August Information Day took place
WHY:   (1) unblocks publishing the flyer on the page and in social assets
       (2)-(3) complete the programme record; they are named in the brief but
           absent from the flyer, and will not be written without a source
       (4) determines how the campaign is framed now that the date has passed
DO:    Send the corrected flyer and the missing section text
REPLY: "done" with the files/text
```

## FINAL VERIFICATION — PRODUCTION

| Check | Result |
|---|---|
| `/education` | **200** |
| Contact **670 949 503** present | **yes** |
| Superseded **677 46 16 09** present | **no — 0 occurrences** |
| Video **UfpBzWOEDZM** embedded | **yes** |
| **29 August 2026** — Information Day | present |
| **19 September 2026** — Selection Examination | present |
| Venue **Guneku Fon's Palace** | present |
| Target **50 scholarships** | present |
| Autoplay | none |
| Homepage Learn more / Watch video | present |
| Video gallery back-link to `/education` | present |
| Regression across key routes | all 200 |

`tsc` clean · no new lint errors · build passes at 76 pages · the Next 16
`themeColor` build warning was cleared by moving it to a `viewport` export.

## STILL OUTSTANDING (unchanged)

Everything in the previous two sections remains open, and the security position
is untouched: unauthenticated write APIs, `demo-user`, suspended
authentication, and **still no Terms or Privacy Policy** — now more pressing,
because `/education` publishes a contact number for a programme aimed at
young people and their parents.

**OpenClaw's first mission remains security containment.**
