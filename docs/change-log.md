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
