# Change Log

## 2026-09-02 — September 2026 content, media-wiring and factual-correction pass

Candidate implementation, reviewed and corrected. Not yet committed or deployed.
Authority: `GUNEKU-FRESH-CONTENT-RECONCILIATION-2026-09.md` Rev. 4 and
`CC-EXECUTION-BRIEF-2026-09.md` Rev. 2. Decisions in `decision-log.md`; risks in `known-risks.md`.

### Added

- **23 public records.** 15 news records (`/updates`) covering 2019–2026, 3 Palace records
  (the Fon's letter after the Fringyeng fire · the Palace household and its titles · the
  Traditional Council as recorded in 2021) and 5 institution records (Guneku Medical Center ·
  the Guneku Integrated Health Centres · Open Door Medical Clinic · F.H.E.D · Ifuh Itah).
  All written fresh from the source packs and attributed; no text or photograph of Mbengwi
  Online's is reproduced.
- **`/institutions` and `/institutions/[slug]`**, built on `getAllInstitutions()` /
  `getInstitution()`, which existed in `src/lib/content.ts` and had never been called.
- **`/notables`**, fixing a navigation item that pointed at `/palace/notables` — a route that
  has never existed.
- **44 videos** attached to the records they document, taking the archive from 2 to 46.
- **6 register entries**, including Guneku Medical Center and the Wumnembug–Njinebai bridge.
- **3 photographs** from the legacy archive: the reigning Fon's portrait, Prof. Dr. Roland
  Teboh Forbang, and the Ngam-Fon. EXIF and GPS stripped on ingest.
- `src/lib/quarters.ts` — the 27 quarters as one list.

### Changed

- **The succession chronology.** The five evidenced ceremonial stages replace a single
  "coronation date" (ADR-001).
- **The development register** carries a `class` on every entry, and `/projects` now reads it
  instead of its own hard-coded array (ADR-003).
- **The GUDECA EXCO page** publishes the real 12-member national roster recovered from
  `src/data/pages/gudeca-exco2.json`, replacing eight empty placeholder slots and the line
  "Full EXCO roster will be published here." Names and offices only.
- **Merges into existing records:** Bonn 2026 (Ma Rose, Mr. Fonjong, Festus Tanwi, the
  15-item agenda, the 31 March 2026 re-registration deadline) · Agro CIG (registered name,
  place of issue, issuing authority, legal basis) · Fringyeng plant (Kasi Rhex Ndeh,
  Dr. Kasi Elvis, the Oko plant) · Royal Community Library (Sango Della, 2021) ·
  Mɨchi Ǝbeŋ (organising committee, 2023, and six films).
- **`/kingdom/about-guneku`** presents ~10,000 as a historical figure only; ~15,000 is the
  Fondom's current figure and population leaves the unresolved list.
- **The three diaspora metrics** are labelled as what they are: 8 constituted chapters ·
  9 countries at Bonn · 12–13 known locations.

### Fixed

- **The gallery rendered 338 photographs as empty boxes.** Both components hard-coded a
  placeholder and never read the image paths; 299 files also sat outside `public/`. All 338
  now resolve case-exactly and render. The same unconditional-placeholder defect was fixed on
  the notable detail page and the Fon's profile.
- **The Palace telephone.** `+237 681 19 46 46` had no source anywhere; the contact card now
  reads `site-config.json` (ADR-002).
- **The `/indigenes` quarter filter** offered 16 of 27 quarters; it now offers all 27 (ADR-008).
- **`migration/scripts/build-fon-profile.js`** carried the literals `2016-01-17` and
  `1965–2014`; both corrected so a re-run cannot reintroduce them.

### Security

- Withheld from all rendered output and verified absent: the 11 personal mobile numbers in the
  EXCO source · the Guneku Medical Center vacancy contacts · the OCR-only Agro CIG certificate
  number · the private YouTube video `2jS-ael4Ccg` · the four Joomla sample names.
- The Guneku Business Directory is held from public surfacing pending consent review (ADR-005).
- No held Bonn media was newly linked. No identity was guessed. The Fon's own public letter is
  published; the dispute behind it is not.
- `_shortlist/guneku-map.jpg` was **not** ingested — it is a Google Maps screenshot and a
  third-party licensing question (R-010).

### Notes

- Read-only with respect to the external legacy archive; 3 files ingested of 632, selectively.
- No three-variant image set was generated for the 338 canonical photographs (ADR-009).
- Build: 115 static pages, `npm run build` and `npx tsc --noEmit` clean.
- Lighthouse was not run — not installed locally, and no score was fabricated (R-008).

## 2026-09-02 — Homepage review-prep correction pass (uncommitted)

Narrow corrections ahead of Marcel's visual review. No commit, no deploy.

- **Homepage duplication removed.** The full 28-row development register listing was
  deleted from the homepage; `CurrentProjects` is now its single principal representation
  and `/projects` remains the complete register. Sections renumbered 1–18.
- **Response promises removed.** "a representative will come back to you" / "will get back
  to you" / "someone will come back to you" replaced site-wide with what is actually true —
  the message or offer is sent to the Palace for review and a representative may make
  contact. Six locations: `support/page.tsx`, `support/SupportForm.tsx` (×2),
  `PalaceMessageModal.tsx` (×2), `TalkToPalace.tsx`, `SupportBand.tsx`,
  `village-facts.json`, `palace-knowledge.ts`.
- **BCC moved to configuration.** ADR-010. `EMAIL_BCC` only; `server-only` guard added;
  `.env.example` documents the variable.
- **Ngon / Ngong / Batmuki.** Verified as three distinct things, not spelling variants:
  Ngon is the market day, Ngong is one of the 27 quarters with its own market and stream,
  the Batmuki is the river. Nothing was normalised. Recorded in `nameNote`.
- **At-a-glance reduced 9 → 6.** ADR-011.
- **Information-desk coverage guard.** ADR-012.

Verification: `npx tsc --noEmit` clean; `npm run build` clean, 120 static pages; homepage
measured at 390 / 768 / 1280 / 1440 with no horizontal overflow and no blank band; assistant
regression-tested on four questions that must be refused and eight that must be answered.

## 2026-09-02 — Village Square card imagery: archive fallback (branch, not deployed)

Product Owner task: update cards were rendering an empty "Guneku" plate where a record has
no photograph of its own; fill them rather than leave them blank. ADR-013 records why the
fill is constrained rather than arbitrary.

- **New `src/lib/archiveFallback.ts`.** `cardImageFor(record)` returns the record's own
  `featuredImage` when it has one, otherwise a topic-matched, deterministic, labelled
  photograph from the archive. Topic by word-boundary keyword rules over slug + title
  (prefix-tolerant, never raw substring — an early substring version matched `road` inside
  "broadcast" and put road works above a story on support for people with disabilities).
  Pool index by FNV-1a over the slug, so the pick is stable across renders and builds.
- **New `src/components/ui/UpdateCardMedia.tsx`.** The card's image half. Fallbacks render
  with a visible "Archive photo" mark, empty `alt`, and the provenance sentence in `title`.
- **No new image asset.** The six pools reference 19 photographs the site already
  publishes — `/images/site`, `/images/palace`, `/images/updates` and four public gallery
  albums, 24–172 KB each. Nothing was added to the repository and no consent surface
  changed: an image not publishable before is not publishable here either.
- **`src/app/page.tsx`.** The "Latest from Guneku" grid uses `UpdateCardMedia`; the beige
  "Guneku" plate is gone.
- **`src/app/updates/page.tsx`.** The featured lead uses the same component, so the two-column
  lead can no longer collapse to one column when the newest record has no photograph.
- **Unchanged:** `/updates/[slug]` and `EditorialLead` — the article page still states that
  the archive holds no photograph for the record. Records with their own photograph render
  exactly as before.

Coverage: 39 records — 6 own photograph, 33 fallback (culture 6, village 10, palace 5,
education 5, diaspora 4, projects 3).

Verification: `npx tsc --noEmit` clean; `npx eslint` clean on the four touched files;
`npm run build` clean, 120 static pages; every resolved path asserted to exist on disk;
determinism asserted by resolving each record twice; homepage grid measured at 390 and 1440.
Not merged and not deployed — release approval is the Product Owner's (CLAUDE.md).

## 2026-09-03 — Indigenes Directory: founding names, claim, and one chapter register (branch, not deployed)

Product Owner task: seed the directory from the GUDECA EU names, let people claim their
entry, open every chapter — home and diaspora — to new names, correct the Germany chapter
from Essen to Bonn, and move Thadeus Fon to the home-based Douala chapter. ADR-014,
ADR-015 and ADR-016 record the decisions; R-019 and R-013 record what is carried.

**New data**

- `src/data/community/chapters.json` — 16 chapters, 5 home and 11 diaspora, each with
  scope, place and whether it takes names. The single source `/diaspora`, `/gudeca` and
  the chapter pages read.
- `src/data/community/founding-names.json` — the 11 founding names, each with role,
  chapter and the source it came from. Carries the publication rule and the objection
  route in its own metadata so a later editor sees them before adding a field.

**New code**

- `src/lib/community.ts` — chapter and name lookups, and `CardSafe`, the four-field shape
  a seed stub is allowed to render.
- `src/components/community/FoundingNames.tsx` — the stub cards, each with claim and
  take-it-down.
- `src/components/community/DirectoryForm.tsx` — one form, three intents.
- `src/app/indigenes/submit/page.tsx` — claim / add / remove, `noindex`, pre-filled from
  the entry or chapter it was reached from.
- `src/app/indigenes/founding/[slug]/page.tsx` — 11 unclaimed-entry pages.
- `src/app/gudeca/chapters/[id]/page.tsx` — 16 chapter pages, each with its register and
  its own Add-a-name.
- `src/app/api/community/register/route.ts` + `sendDirectorySubmission` in
  `src/lib/email/send.ts` — validation, honeypot, server-side resolution of chapter and
  entry, delivery to the Palace. No database write, no auto-publication.

**Changed**

- `src/app/diaspora/page.tsx` — reads the register; **Essen / Ruhr → Bonn**; every country
  card links to its chapter and shows how many names are on record; an Add-a-name band.
- `src/app/gudeca/page.tsx` — reads the register; **Essen — Ruhr Valley → Bonn**; home
  chapters shown alongside the diaspora; chapters link through; a claim/add band.
- `src/app/indigenes/page.tsx` — founding-names section, Add-a-name beside Create Profile
  in both calls to action, hero count includes the unclaimed entries, "From Essen to New
  Jersey" → "From Bonn to New Jersey".

**Deliberately unchanged.** Marcel Tabit Akwe's profile, `/contact`, and the 2023
reception gallery still say Essen — that reception happened in Essen. The Essen→Bonn
correction is a chapter fact, not a search-and-replace.

Verification: `npx tsc --noEmit` clean; `npx eslint` clean on every new and touched file
(one pre-existing `set-state-in-effect` error in `/indigenes/page.tsx`, present on the
baseline, untouched); `npm run build` clean, **149 static pages, up from 120**; all 11
founding pages, all 16 chapter pages and the three form intents return 200; API validation
exercised for unknown intent, missing names, missing contact, malformed email, honeypot and
a forged chapter id — all rejected or neutralised; Thadeus Fon asserted present on the
Douala chapter and absent from Europe; grid measured at 390 and 1440.

Not merged and not deployed — release approval is the Product Owner's (CLAUDE.md).

## 2026-09-03 — Chapter model correction and directory membership fixes (branch, not deployed)

Product Owner corrections to the same day's directory build, applied as a second pass.
ADR-017 and ADR-018 record the decisions; R-014 records what was left for the Palace.

- **GUDECA EU is a Europe-wide chapter, not a Bonn one.** `chapters.json` now separates a
  constituted `chapter` from a `location`, and a chapter carries `place` rather than a
  city — so "Meetings rotate across Europe" is expressible and the third repetition of the
  Essen→Bonn error is structurally prevented. Bonn is recorded for what it is: the official
  residence of H.R.H. the Fon, where the March 2026 meeting happened to be held.
- **Germany, Belgium, UK, Italy and Sweden** became locations under `gudeca-europe`. Their
  cards point at the chapter's register rather than each showing the same count as if they
  held ten names apiece. `/gudeca` groups by chapter, with a "Members without a chapter"
  group for Qatar, Nigeria, China and Japan.
- **Fonjong removed** — named in the minutes as delivering a goodwill message, but an
  attendee, not a member. The removal and its reason are recorded in `founding-names.json`
  so the same minutes cannot re-seed him, alongside a general `membership_rule`.
- **Marcel Tabit Akwe added** to the EU chapter at his own request. `profileUrl` is the one
  field added to `CardSafe` since ADR-014: where a seeded person already has a published
  profile here, the stub links to it and restates nothing from it.
- **Thadeus Fon** stays with Douala, confirmed correct.

Founding names: 11 → 11 (one out, one in). EU chapter 10, Douala 1.

Verification: `npx tsc --noEmit` clean; `npx eslint` clean on new and touched files (the one
pre-existing `set-state-in-effect` error in `/indigenes/page.tsx` is untouched);
`npm run build` clean, **150 static pages**; `/indigenes/founding/fonjong` returns 404;
`/gudeca/chapters/gudeca-europe` lists exactly the ten EU names including Marcel;
`/gudeca/chapters/gudeca-douala` lists Thadeus Fon alone; `/gudeca/chapters/germany` shows
the EU chapter's register and says so; the string "GUDECA Europe" no longer appears on
`/diaspora`, `/gudeca`, the EU chapter page or `/indigenes`.

## 2026-09-03 — The bodies of Guneku: governing body, executives, committee, household (branch, not deployed)

Product Owner task: extract every name and role in the repository, then publish the people
who hold office as claimable registers — the Traditional Council with a card on the front
page, the GUDECA executives, the festival committee — and match the loose names to their
chapters. ADR-019, ADR-020 and ADR-021 record the decisions; R-015 to R-017 record what is
carried.

**Extraction.** 72 people found across 23 files, delivered to the Product Owner as
`guneku-people-register.xlsx`. 43 are now published in the register.

**New data**
- `src/data/community/bodies.json` — five bodies: the Traditional Council (the governing
  body), GUDECA National EXCO, GUDECA EU Executive, the Mɨchi Əbeŋ organising committee,
  and the Palace household. Each carries the year its roster describes and its source note.
- `founding-names.json` — 11 → 43 names, each with `body` and/or `chapter`, plus
  `deceased`, `profileUrl` and aliases. Publication, membership, deceased, body and
  relationship rules are all carried in the file's own metadata.

**New surfaces**
- `/people` — the index of bodies.
- `/people/[body]` — five rosters, in office order, each claimable.
- Front page — a governing-body section with the council and every body beside it.
- `Our People` nav gains "Who holds office" and "Traditional Council".
- `/gudeca/gudeca-exco` and `/institutions/michi-ebeng-festival` link to their registers.

**Matching, as directed**
- Sam Fongho (legacy UK listing) merged into Sam Fongoh with "Ni Sam" — ADR-021.
- Dr. Joyce Akwe, Prof. Dr. Roland Teboh Forbang and Ephraim Toh → GUDECA US chapter.
- Victor Samkoh → home; the legacy listing gives an organisation and no place.
- Every Fomuki name → the Palace household, per the Product Owner.
- Fah Elvis Tayong: one man, three offices — National Publicity Secretary, Ngam-Fon, and
  Delegate of the Agro CIG — in one record.
- Armstrong Tinyih upgraded from "Member" to Financial Secretary, per the EXCO roster.
- Fonjong stays out (ADR-018); `institutions/gudeca-eu.json` still names him — R-015.

Registers: Traditional Council 8 · GUDECA National 12 · GUDECA EU Executive 5 · festival
committee 3 · Palace household 6 · unaffiliated chapter members 9. Two entries are recorded
as deceased and carry no claim action.

Verification: `npx tsc --noEmit` clean; `npx eslint` clean on every new and touched file
(the one pre-existing `no-explicit-any` in `institutions/[slug]` and the pre-existing
`set-state-in-effect` in `/indigenes` are untouched); `npm run build` clean, **188 static
pages, up from 150**; every body page, every entry page and the cross-linked institution and
EXCO pages return 200; asserted that the two deceased entries offer no claim or removal link
and do show the memorial notice, and that living entries offer both.

Not merged and not deployed — release approval is the Product Owner's (CLAUDE.md).

## 2026-09-03 — Shared rate limiter across the four form routes (R-013)

On `feat/village-square-archive-fallback`, after the four patch commits.

- **New** `src/lib/rate-limit.ts` (ADR-022): 5 per route and 12 per sender per 10 minutes.
- **Wired** into `/api/contact`, `/api/palace-message`, `/api/support-interest` and
  `/api/community/register`. The first and last had no limit at all before this.
- **Removed** the two duplicated in-route limiters.
- R-013 closed, with its residual weakness recorded rather than papered over.

Verified against a running production build: 6th post to one route → 429; 13th post from
one sender → 429 on every route, including routes still under their own limit; an unrelated
sender unaffected; the honeypot still answers with a success shape; the 429 body carries no
internal detail. `npx tsc --noEmit` clean; `npm run build` clean at 188 static pages;
eslint clean on every changed file.

## 2026-09-03 — Risk-register renumber and error-message hygiene

Documentation and four catch blocks. No behaviour change a visitor would notice beyond a
steadier error message.

- **Renumbered** the two risk sections appended in `3456435` that reused numbers already
  held by the baseline table: they become **R-018** (MEFU-MECUDA archive photograph) and
  **R-019** (three names from a private WhatsApp group). References updated in ADR-014 and
  in the 2026-09-03 indigenes change-log entry. The register now holds R-001 to R-019, each
  exactly once, and `src/` refers to none of them.
- **Stopped four routes leaking internal errors** (ADR-023) — `/api/contact`,
  `/api/palace-message`, `/api/support-interest`, `/api/community/register`. Malformed JSON
  had been returning the parser's own message to the browser from all four.
- **R-020** opened: the same defect stands in `/api/indigenes/all` and
  `/api/indigenes/profile`, which are database-backed and more sensitive.
- **R-021** opened: the limiter's `x-forwarded-for` key is correct only while guneku.org is
  DNS-only through Cloudflare. Verified DNS-only on 2026-09-03.

## 2026-09-03 — Phase 0: safety baseline and framework upgrade

- **R-020 closed** (commit `c219a32`): `/api/indigenes/all` and the three handlers in
  `/api/indigenes/profile` no longer return the caught message. No route under
  `src/app/api` echoes internal error text now.
- **Next.js 16.2.3 → 16.3.3**, with `eslint-config-next` to match, both pinned exactly
  (ADR-025). React and react-dom unchanged at 19.2.4 — 16.3.3 accepts `^19.0.0`, so no
  React bump and no codemod was required. `next` itself carries no advisory.
- **`next-auth` and `@auth/pg-adapter` removed** (ADR-024): unused, and the source of all
  three critical advisories. Audit 18 → 15, criticals 3 → 0.
- **R-022 and R-023 opened**: there is no Clerk integration, and the indigene profile route
  is an unauthenticated write endpoint keyed to a hardcoded `demo-user`.

Verified on the upgraded tree: `npx tsc --noEmit` clean; `npm run build` clean at **188
static pages**, identical to the pre-upgrade baseline; 28 routes 200 and the one expected
404; sitemap still 95 URLs; per-page canonicals intact; rate limiter still returns 429 on
the 6th post; deceased entries still carry no claim action; archive-photo marking intact;
privacy sweep clean (BCC absent from HTML and bundles, no GUDECA personal mobile, no
"17 January 2016", Business Directory still 404).

## 2026-09-03 — Phase 1.5: Next.js 16.3.4

`16.3.4` is npm's `latest` tag and the only stable release above `16.3.3`; nothing newer
exists outside the canary and preview tags. Confirmed in Phase 1 before bumping rather than
folded into the audit.

- `next` and `eslint-config-next` → **16.3.4**, both pinned exactly (ADR-025 stands).
- React and react-dom unchanged at 19.2.4. No codemod required.
- Advisories unchanged at 15, no critical, and `next` itself carries none.

Verified: `tsc` clean; build clean at **188 static pages**; 20 routes 200 plus the expected
404; sitemap still 95 URLs; rate limiter still 429 on the sixth post; deceased-entry rule,
archive-photo marking, the R-020 safe error and the BCC privacy sweep all unchanged.

## 2026-09-03 — Phase 2: real Clerk authentication

Closes R-022 (no Clerk integration), R-023 (`demo-user`) and R-027 (the open upload route).

**Auth.** `@clerk/nextjs@7.9.0`, whose peer range `^16.1.0-0` covers Next 16.3.4 and
`~19.2.3` covers React 19.2.4. `ClerkScope` mounts the provider in three subtrees only
(ADR-026). `middleware.ts` replaces the empty stub with `clerkMiddleware` matching only
`/my-guneku`, `/sign-in`, `/sign-up` and the personal API routes. `src/lib/auth.ts` provides
`optionalUser`, `requireUser`, `requireRole`, `atLeast` and an `AuthError` that carries its
own status, so a protected route never leaks why it failed (ADR-027).

**Pages.** `/sign-in` and `/sign-up` replace the "coming soon" placeholders with Clerk's
components in the institutional palette, both `noindex`, both saying plainly that reading
Guneku needs no account. `/my-guneku` is the new dashboard — details, claims, following,
contributions, account — `force-dynamic`, `noindex`, built from the existing `inst-*`
vocabulary. It renders and explains itself when the database is unavailable rather than
erroring.

**Data.** `0001_my_guneku.sql` adds `community_members` and `follows`. **Not applied.**
Migration runner and `db:migrate` / `db:status` scripts added (ADR-028), with `0000` holding
the recovered original DDL. `tsx` added as a devDependency to run them.

**Closed blockers.** `demo-user` appears nowhere in `src/` except as a comment recording
what it was. `/api/indigenes/profile` and `/api/indigenes/upload` both require a session,
scope writes to it, and are rate limited.

Verified: `tsc` clean; `npm run build` clean at **189 static pages** (188 + `/my-guneku`);
eslint clean on every new file; **19 of 20 public routes still 200 with no Clerk keys present
at all**, and zero occurrences of "clerk" in the HTML of `/`, `/projects` or `/indigenes`;
zero secret-shaped values in client bundles (`sk_live`, `sk_test`, `sk-ant-`, Resend keys,
Postgres URLs all absent — only Clerk's own `process.env.CLERK_SECRET_KEY` reference by
name); no handler reads a user id from input; `/api/me` discards `role` from the body.

**Not verified, and cannot be here:** that a signed-in member can save their details, that a
member cannot reach an admin area, and that one user cannot update another's row. All three
need a session. See R-024 and the owner action below.

## 2026-09-03 — Phase 10: the twenty-seven quarter pages

- **New** `/quarters` (index of all 27) and `/quarters/[slug]` (one page each), plus
  `src/data/quarters/quarter-registry.json` and `src/lib/quarter-pages.ts`.
- **Every link is curated, not matched.** Each record attached to a quarter carries the
  sentence from that record which justifies it, rendered on the page so a reader can see
  why. Text matching was rejected after it attached *HRH Akam M. of Kai* — a different
  fondom's Fon — to a Guneku quarter, and matched "Fun" against the ordinary English word.
- **Ten quarters carry records.** Seventeen carry none and say so; their pages are
  `noindex` and excluded from the sitemap.
- **A load-time guard** fails the build if the registry and `GUNEKU_QUARTERS_27` ever drift,
  in either direction. Verified by deliberately removing one quarter: the build stopped with
  `Missing pages for: Kai`.
- **R-028 opened**: the canonical list and the records disagree substantially, including one
  outright contradiction about Bessi. Nothing was changed; the Palace decides.

Verified: `tsc` clean; eslint clean; build clean at **216 static pages** (188 + 27 + index);
all 27 pages and the index return 200; an unknown slug 404s; the sitemap grew to 106 URLs and
lists only the ten recorded quarters plus the index; empty pages emit
`<meta name="robots" content="noindex, follow">` and recorded ones `index, follow`.

## 2026-09-03 - Phase 9: the Guneku map

- **New** `/explore`, plus `src/data/explore/locations.json`, `src/lib/explore.ts` and
  `src/components/explore/GunekuMap.tsx`. `maplibre-gl@6.7.0` (BSD-3-Clause) added.
- **One marker, fifteen places.** The village is drawn; the Palace, three health centres, a
  clinic, two markets, two watercourses, the library, the Agro CIG, a road, the bridges and
  the FUN electricity project are listed with the reason each has no recorded position.
- **Four layers explicitly refused** on the page itself, with reasons: the 27 quarters as
  pins, schools, churches, and the caves and waterfalls the record mentions but never names.
- **R-010 -> Open, mitigated.** A licensing-safe map exists and no Google imagery is used or
  traced, but `/kingdom/map-of-guneku` is still a stub and one pin is not a map of Guneku.
- **R-029 opened**: the archive holds exactly one coordinate. Owner action recorded - a GPS
  reading taken standing at each place is better provenance than any map trace.

Verified: `tsc` clean; eslint clean; build clean at **217 static pages**; `/explore` 200; the
full list renders in server HTML with no JavaScript (34 "No position recorded" strings, 2 "On
the map"); OSM attribution present; the only occurrence of "Google" is the deliberate
statement that none of its imagery is used; and zero `maplibre` references in the HTML of `/`,
`/projects`, `/quarters` or `/explore`, proving the library loads on scroll rather than
shipping with any page.

## 2026-09-03 - Phase 7: Search Guneku

- **New** `/search` (server-rendered, plain GET form, nine result groups) and
  `src/lib/search-index.ts`. `/api/search` rewritten for typeahead against the same
  filtered index.
- **270 entries**: People 52, Places 43, Palace & history 13, Projects 30, Institutions 18,
  News & records 39, Photos 16, Films 47, Questions 12. The Films and Institutions counts
  exceed the record counts (46 films, 17 institutions) because the eleven indexed site pages
  are counted in whichever group they belong to.
- **Two indexing bugs found and fixed while testing.** Films read `title`, which is null on
  44 of the 46 approved videos - 2 were indexed instead of 46; the curated field is
  `displayTitle`. And the nine institutions whose records carry a `route` were excluded, so
  searching "Afor Foundation" or "GUYODECA" found nothing at all; they are now indexed and
  point at the page that holds them.
- **Header wired.** Its dropdown expected `r.section` and `r.id`, which the new route did not
  emit - it would have rendered blank labels with undefined React keys. Both sides corrected,
  and the dropdown now offers "See all results" into `/search`.
- **Three pre-existing lint errors removed** with the old route. Repo-wide eslint went from
  76 problems / 69 errors at baseline `bf11ca5` to 72 / 66, and every file this session
  touched is clean.

Verified: `tsc` clean; build clean at **218 static pages**; `/search` 200 and rendering all
nine groups; a plain `?q=` GET works with no JavaScript; typeahead returns the exact shape
the header consumes. Privacy sweep on the index: "touristic sites" 0 results, "religion" 0,
"map of guneku" 1 (the map page), `/institutions/business-directory` still 404 and absent
from the sitemap. The one hit for "Business Directory" is a published FAQ about the
*indigenes* directory - a false positive on the word, not a leak.

## 2026-09-03 - Phase 6: Guneku TV

- **New** `/watch` - featured film, six-group and nine-category filters, search, pagination,
  the held-material note and the channel link. Plus `src/lib/guneku-tv.ts` (the approval
  predicate), `src/lib/youtube-normalise.ts` (pure sync logic), `src/lib/youtube-sync.ts`
  (the key-holding half), `src/components/watch/FilmCard.tsx`,
  `src/data/gallery/video-overrides.json` and a YouTube API fixture.
- **`/gallery/videos` removed and 308-redirected to `/watch`** (ADR-034). Header, gallery
  landing page, sitemap and two legacy Joomla routes all repointed. `/gallery/images` and its
  album pages are untouched and verified.
- **Homepage migrated to the same predicate.** It filtered `dbVideos.state === 1` inline; it
  now reads `approvedFilms()`, shows one featured film plus three, and carries no iframe.
- **Search migrated too**, which is where the bug was: it read `dbVideos` directly, so a held
  film would have disappeared from the hub and stayed searchable.
- **A privacy fix**: the private channel upload's id was published verbatim by the retired
  page. `heldNote()` now redacts it while keeping the transparency (ADR-033).

Verified: `tsc` clean; build clean at **218 static pages**; lint clean on every new and
touched file bar the pre-existing `_nav` warning; **all 46 films present across the four
pages**; every filter, search and pagination view 200. Sync classification tested against a
fixture with no key: 9 items to 5 after normalisation (Private/Deleted/malformed dropped),
3 unchanged, 1 `discovered`, the deny-listed id skipped, 43 reported missing and none
removed, and **zero discovered films reaching the public**. The hold kill switch was proved
in both directions across hub, homepage, facets and search. Privacy sweep: the private id 0
occurrences anywhere, `.mp4` and "WhatsApp Video" 0, iframes 0, no API key value in any
bundle, 25 public routes 200 with no Clerk keys and zero Clerk JavaScript.

**Runtime verification pending:** `fetchChannelUploads` has never run against the live API.
`YOUTUBE_API_KEY` is set in Vercel but not readable here (R-024), so the request itself is
untested - only the classification it feeds.

## 2026-09-03 - Shared visibility predicate

- **New** `src/lib/visibility.ts`: `isPublished`, `isIndexable`, `isHeldInstitution`,
  `isRoutedInstitution`, `institutionHref`, `publicUpdates`, `publicPalaceArticles`,
  `publicKingdomArticles`, `publicInstitutions`, `sitemapInstitutions`, `visibilityReport`.
- **Migrated** `src/lib/search-index.ts` and `src/app/sitemap.ts` to it. Neither now restates
  an exclusion; both ask.
- **Closed two latent divergences**: the sitemap had no published check on updates or Palace
  articles, and routed-institution handling was decided separately in each surface.

Proved to change nothing visible. Sitemap byte-identical at **108 URLs, zero added, zero
removed**. Search index unchanged at **270 entries** across all nine groups. Sweeps after the
change: the held Business Directory 404s and is absent from sitemap and search; none of the
six noindex Kingdom stubs appears in the sitemap or in search for any of six probe queries -
the two hits for "history" are `/kingdom/about-guneku` and `/kingdom/exhibitions`, which are
the genuinely public articles; the private film id has 0 occurrences anywhere; no secret value
in any client bundle; eight public routes 200 with no Clerk keys.

Current state by the predicate's own report: 17 institutions - 1 held, 9 routed, 7 with a page
of their own; 8 Kingdom articles - 6 noindex stubs, 2 public; 39 updates, all dated.

## 2026-09-03 - Production release: the accepted checkpoint

Merged to `main` and deployed to production under explicit owner authorisation, superseding
the previous preview-only hold.

**In this release:** Next.js 16.3.4; Clerk authentication and `/my-guneku`; Guneku TV at
`/watch` with the film approval predicate; unified search at `/search`; the licensing-safe map
at `/explore`; twenty-seven quarter pages; the shared visibility predicate; removal of the
legacy Fondom-voice AI route; and the R-020, R-023, R-026 and R-027 security remediations.
Three critical npm advisories were eliminated along the way by removing an unused `next-auth`.

**Not in this release:** Phases 3, 4, 5, 8, 11, 12, 13, 14 - blocked on credentials that
cannot be read from this environment (ADR-037). Phase 15 cancelled by owner decision
(ADR-036).

**Release audit, run against a local production build before merge:** `tsc` clean; build clean
at 218 static pages; `npm audit` 15 advisories, none critical, `next` itself clean; eslint 72
problems against a baseline of 76, none in any file this programme touched; 38 public routes
200; all 27 quarter pages 200; 404s correct on three probes; `/gallery/videos` 308s to
`/watch`; canonicals correct on eight routes; sitemap 108 URLs; 46 of 46 films accounted for.

**Privacy sweep, every check at zero:** Business Directory 404 and absent from the sitemap; the
private film id absent from every surface; the held `.mp4` originals and "WhatsApp Video"
unreferenced; the six noindex Kingdom stubs out of the sitemap; the GUDECA private mobile
absent; the BCC address absent from HTML and bundles; no secret value in any client bundle;
no unsupported 17 January 2016 chronology; no claim action on a deceased entry; no
`demo-user` in code (two remaining mentions are comments recording the fix); no raw provider
error returned by any API route; no iframe before interaction; zero Clerk JavaScript on public
pages.

## 2026-09-03 — Production live, and the two-step recovery it needed

`main` fast-forwarded from `bf11ca5` to the release and deployed. Production verified at
**https://www.guneku.org**: 27 routes 200, all 27 quarter pages, 46 of 46 films, 270 search
entries, 108 sitemap URLs, `/gallery/videos` 308 to `/watch`, 404s correct, canonicals correct,
and every privacy check at zero.

**It did not go cleanly, and the sequence is worth keeping.** The first deployment returned 500
on `/sign-in`, `/sign-up` and `/my-guneku` — the risk recorded as R-032 before release. Every
public route was unaffected, exactly as predicted.

The fix was made forward rather than by rollback: withdrawing Guneku TV, search, the map, the
quarter pages and four security remediations to repair three routes — two of which had been
placeholder pages the day before — would have been the wrong trade.

**The first fix was wrong.** It gated Clerk on the publishable key alone, and production still
returned 500. The case I had not considered: in this project the publishable key carries a
value while `CLERK_SECRET_KEY` is empty, so a publishable-only check reported "configured",
mounted Clerk in the middleware, and threw on the secret a moment later. The second fix
requires both keys and removes the half-check helper rather than leaving it to be reached for
again.

**And the error corrected a diagnosis of mine.** I had recorded the Vercel secrets as "marked
Sensitive, therefore write-only to the CLI". The runtime said *missing*, not *invalid*, and the
same pull that returned an empty string for every secret returned `VERCEL_OIDC_TOKEN` at full
length — which a redacting pull would also have redacted. The variables exist by name with no
value. Nothing was withheld from me; there is nothing there. That very likely applies to
`DATABASE_URL`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY` and `YOUTUBE_API_KEY` as well, which
would mean the contact and support forms in production have never been able to send.

## 2026-09-03 - People taxonomy correction: Notables, Diaspora and the Royal Family

Owner-supplied authoritative content correction, implemented as one coherent people-model
change rather than as separate edits.

- **`/notables` rebuilt** as traditional governance (ADR-038): the Traditional Council with all
  eight councillors, the quarter councils drawn from roles the record actually states, and
  other Fondom-confirmed Notables. The old narrative is gone.
- **Marcel Tabit Akwe removed from Notables**, profile and GUDECA EU membership and diaspora
  classification all preserved. **Prof. Dr. Roland Teboh Forbang confirmed a Notable** - and
  his professional record is shown as a separate fact, not as the reason.
- **`/diaspora` rebuilt from the register** (ADR-039). "Notable Sons & Daughters - Guneku
  Excellence Worldwide" is gone. 17 people recorded outside Cameroon, grouped by chapter.
- **Royal Family** (ADR-040): body renamed, `kind: 'royal'`, a Palace Queens section with
  Esther, Carine and Rebecca, `public/esther.png` used as supplied, no invented hierarchy.
- **Nine people added**: GUDECA EU - Humphrey Tabot, Fidelis Njoh, Ni Christopher; GUDECA
  Yaoundé - William Akwe (Medical Delegate), Humphrey Njoh Munan (businessman), Ni Charles,
  Valentine Andom, Ernest Tibi Ticha; plus Queen Esther Fomuki. **No office was invented** for
  any member the owner did not give one.
- **Ma Rose reconciled**: "Ma Rose Akwe" added as an alias on the existing `ma-rose` record.
  No duplicate. `Amamuki Jonathan` and `Mbakwa Jonathan` remain distinct people.
- **Profiles moved** to `/sons-and-daughters/[slug]` with permanent redirects (ADR-041).

Verified: `tsc` clean; build clean at **228 static pages**; repo eslint **69 problems against a
baseline of 76**, with the 8 in the moved profile route pre-existing and carried with the file.
Marcel appears **0 times** in the visible markup of `/notables` - the single string in the
response is the site-wide `meta name="creator"` inside the RSC payload. All five Yaoundé
members appear 0 times on `/diaspora`. All four GUDECA EU additions and both diaspora profiles
appear. Zero occurrences of "first/senior/principal/junior queen". Search reflects every
corrected classification, carries no stale narrative, and shows one Ma Rose.

## 2026-09-04 - My Guneku profile ownership and onboarding hardening

The directory could be joined and never revisited. This release turns a one-way form into a
profile the member owns, and closes the defects the readiness inspection found in the journey
that was already live.

- **Onboarding is gated.** `/indigenes/onboarding` and `/indigenes/profile` are now in the
  middleware matcher and in `isProtected`, so a signed-out visitor is redirected to `/sign-in`
  with `redirect_url` before the first step rather than after the fifth. Each page checks
  again server-side: a matcher is configuration, and configuration can be edited by mistake.
- **A second profile is no longer a 500.** The create handler asks `profileExists` first and
  answers **409** with the link to the profile that exists; a lost race on the UNIQUE
  constraint (23505) produces the same 409. The constraint stays as defence in depth.
- **`/indigenes/profile` is real.** It replaced a stub reading "Member authentication coming
  soon" - which had stopped being true, and which the onboarding confirmation email linked
  people to. It shows only the signed-in member's own row, fetched by the session's user id;
  there is no id in the route and none in the query string.
- **Editing that can undo.** `updateProfile` was a fixed `COALESCE(value, column)` per column,
  which could set a field but never clear one. It now builds the SET clause from what was
  actually sent: absent means unchanged, empty means remove. `full_name` is set but never
  cleared, because the column is NOT NULL.
- **No more silent failures.** Every mutation in both the onboarding form and the editor now
  has a loading, success and human-readable failure state. A 401 bounces to sign-in and back;
  a 409 routes to the existing profile. Nothing returns a driver message, a stack trace or an
  internal identifier.
- **The public directory stopped publishing `clerk_user_id`.** `/api/indigenes/all` answered
  `SELECT *` plus an object spread, so the identifier every row is owned by - and the
  `total_count` window column - went to anyone who asked. It is now an explicit column list
  and a field-by-field mapper, so a future column is private until somebody decides otherwise.
- **The member area has a door.** My Guneku existed, was protected, worked, and appeared in no
  header, drawer or footer. `MemberNavLink` adds it to both desktop and mobile navigation -
  "Sign in" to a visitor, "My Guneku" to a member - reading Clerk's `__client_uat` cookie
  rather than mounting ClerkProvider on 188 public pages or making the root layout dynamic.
- **My Guneku connects to the directory**: Create your profile, or View or edit your profile.
  Claims, contributions and follows are untouched placeholders, as instructed.

No migration. No schema change. No Clerk or Cloudflare change.

Verified: `tsc` clean; **92 focused tests** added and passing (Vitest, new to the repository);
build clean at **226 static pages** - 228 minus the two member pages that are now
per-request, which is the intended effect; repo eslint **0 errors**, 5 warnings, all
pre-existing and carried with their files.

## 2026-09-04 - Phase 3: moderated profile claiming

A signed-in member can ask to be connected to an existing record in the Guneku register, and
a person at the Palace decides. Built as a request-for-review workflow throughout: there is
no path anywhere in this release by which a claim changes a public record.

- **`profile_claims`** (migration 0002, additive: one CREATE TABLE, five CREATE INDEX, all
  `IF NOT EXISTS`). Four states - `pending`, `approved`, `rejected`, `withdrawn` - enforced by
  a CHECK constraint as well as by the code. `person_slug` is a plain TEXT pointer to
  `founding-names.json`, with no foreign key and no copy of the person's name, office or
  history: the register is upstream of this table and stays upstream of it.
- **Two partial unique indexes** do the integrity work: one live claim per member per record,
  and one approved claim per record. Both cover `pending`/`approved` only, so a withdrawn or
  rejected request never permanently blocks somebody from asking again.
- **Deceased records are never claimable.** Read from the explicit `deceased` flag that has
  been on the register since it was written - nothing is inferred. Refused in the eligibility
  function, in the claim page, in the POST handler, and again in the reviewer queue if a
  record is marked deceased after a request was made. A second lever, `claimable: false`, lets
  the Palace withhold a record from claiming as a data decision rather than a code change.
- **Review is role-gated server-side.** `member` and `contributor` cannot approve or reject -
  `requireRole('reviewer')` answers 403 from the session's own claims, never from a role in a
  request body. A claimant can never decide their own case whatever role they hold, which is
  checked explicitly and separately from the role system.
- **`/review/claims`** is the reviewer surface: pending claims oldest first, the canonical
  record, the claimant as the claimant described themselves in My Guneku, their note, and
  approve/reject. No Clerk id reaches the page.
- **My Guneku** shows the member's own claims with status, date, next action and withdrawal
  for a pending one. Reviewer identity and moderation reasoning are stripped in
  `toClaimantView` before anything leaves the database layer.
- **Approval associates and nothing more.** It writes a status, a timestamp and a reviewer id
  to one row. No biography, office, Royal Family standing, Notable standing, GUDECA membership
  or diaspora classification is touched, and no permission is granted.

Verified: `tsc` clean; **223 tests** passing (up from 92); build clean at **227 pages** with
the static and SSG counts unchanged; eslint clean on everything touched.

**The migration is NOT applied.** `DATABASE_URL` is empty locally and the temporary migration
endpoint was deliberately removed on 2026-09-04. Until Marcel applies it, every claim surface
degrades honestly and the claim page offers the Palace route that has always worked, so the
register keeps a working way to say "this is me".

## 2026-09-05 - Migration 0002 applied; the migration endpoint removed again

`profile_claims` exists in production. The Phase 3 claim workflow is live.

The endpoint was restored for one job, used twice, and deleted in the same session - which is
the lifecycle that makes it safe, and the step that would be tempting to skip.

- **Applied:** `0002_profile_claims.sql`. `0000` and `0001` were already recorded and were not
  re-run. The ledger now holds three rows.
- **Proved rather than asserted:** a second call applied **nothing** (`"applied": []`), which
  is the idempotency claim demonstrated.
- **Created:** `profile_claims`, with all five indexes plus the primary key - including both
  partial unique indexes, `profile_claims_one_live_per_member_idx` and
  `profile_claims_one_approved_per_person_idx`, which are what stop a member accumulating live
  claims and stop one record being approved to two people.
- **Existing tables untouched:** `indigene_profiles`, `community_members`, `follows` and
  `schema_migrations` all still present and answering. `/api/indigenes/all` returns 200 on both
  the plain and the filtered query, so the 42P18 parameter-typing fix still holds.
- **Removed:** `src/app/api/admin/migrate/` in full. No `MIGRATE_TOKEN` reference remains in
  any source file. `docs/known-risks.md` R-024 and R-038 are marked closed, and the standing
  instruction in R-038 to set `MIGRATE_TOKEN` - which is now wrong and would mislead - has been
  replaced with the correct note that the endpoint no longer exists.

No fake identity and no fake claim was created in production. Verification was signed-out
behaviour and catalogue reads only.

Verified on the clean deployment: `tsc` clean; 223 tests passing; build clean at 227 pages;
eslint clean across every file this work touched.
