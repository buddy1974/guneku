# Known Risks — `guneku`

> Source of truth (Tier 1). Risks and debt are recorded here, not carried in memory. A
> temporary solution is only permitted when recorded with a removal plan. Surfaced at handover
> so nothing is inherited blind.

| Field | Value |
|-------|-------|
| Document tier | 1 — repository charter |
| Owner (DRI) | Marcel / Maxpromo Digital |
| Repository class | Client |
| Lifecycle stage | Live production |
| Review cadence | Per release |
| Last reviewed | 2026-09-02 |
| Status | Draft — opened 2026-09-02 from the September 2026 content pass |

---

## Risk Register

| ID | Risk | Type | Severity | Likelihood | Mitigation | Owner | Status |
|----|------|------|----------|-----------|------------|-------|--------|
| R-001 | `/guneccul` publishes `wa.me/237675994599`. Those digits match the personal mobile recorded against the National Publicity Secretary in `src/data/pages/gudeca-exco2.json` — the number this pass deliberately withholds is already public elsewhere on the site. | Privacy | High | Certain — live now | Not changed in this pass; predates it. Confirm with the holder whether the number may stand as a public GUNECCUL contact, or replace it with an institutional line. | Marcel | Open |
| R-002 | The `docs/` governance set required by `CLAUDE.md` is incomplete. `repository-map.md`, `data-ownership.md` and `production-readiness.md` are absent; `product-brief.md`, `architecture.md`, `workflow-map.md`, `release-checklist.md` and `security-checklist.md` exist at 0 bytes. | Debt | Medium | Certain | Only the three records the memory rule requires were opened (this file, `decision-log.md`, `change-log.md`). The rest need a deliberate documentation decision, not invented content. | Marcel | Open |
| R-003 | The Agro CIG certificate number is an OCR read that has never been checked against the original. | Bug | Medium | Certain | Held: `certificateNumber` is `null` and the certificate image is unpublished. Verify digit by digit before publishing either. | Marcel | Open — mitigated |
| R-004 | The relationship between Guneku Medical Center and the proposed Reference Healthcare Centre is unestablished, and the March 2026 Medical Doctor vacancy has not been re-checked since. | Bug | Medium | Certain | The facility record publishes at its supported status only; neither identity nor separation is asserted; the vacancy is not advertised. | Marcel | Open |
| R-005 | The Traditional Council roster is five years old. | Debt | Low | Likely | Published only as "as recorded in 2021", with an explicit note that it is not a claim about the present. Supersede when the Palace confirms current holders. | Marcel | Open — mitigated |
| R-006 | `_shortlist/fon-portrait-formal.jpg` in the legacy archive may show the late Fon Fomuki Patrick Nji rather than the reigning Fon. | Bug | High if used | — | Not used. The GUDECA-US 2023 image of known provenance was used instead (ADR-006). | Marcel | Open — mitigated |
| R-007 | 14 `.mp4` files and roughly 180 photographs under `public/images/gallery/` are tracked, deployed and publicly retrievable at guessable paths. Nine of the videos are the Bonn 28 March 2026 footage held pending consent. | Privacy | High | Certain — live now | Not linked from any page and not linked by this pass. Leave, link or remove is Marcel's decision. Predates this changeset. | Marcel | Open |
| R-008 | Mobile performance is unverified. Lighthouse is not installed locally and no run was performed. A large share of the audience is on a mid-range Android in Cameroon on a throttled connection. | Scaling | Medium | Certain | Responsive layout was checked at six widths. Run Lighthouse against the Vercel preview before release. | Marcel | Open |
| R-009 | 44 of the 46 video records carry no verified YouTube title. | Debt | Low | Certain | **CLOSED 2026-09-06.** All 46 verified against the live channel; see the R-009 section below. | — | Closed |
| R-010 | `_shortlist/guneku-map.jpg` in the legacy archive is a Google Maps screenshot carrying the Google logo. Re-hosting it on the site is a third-party licensing question, not a content question. | Security / Legal | Medium | Certain if used | **Mitigated 2026-09-03, not resolved.** Not ingested, not traced. `/explore` now renders a licensing-safe map (MapLibre GL JS, BSD-3-Clause, over OpenStreetMap raster tiles with ODbL attribution) and no Google imagery is used anywhere. But it carries **one** marker, because one coordinate exists in the whole repository — see R-029. `/kingdom/map-of-guneku` is still a stub. A map of Guneku's quarters needs coordinates the archive does not have. | Marcel | Open — mitigated |
| R-011 | `src/data/pages/gudeca-exco.json` contains Joomla sample data — four fictitious names that are not Guneku people. | Bug | Medium if rendered | Low | Unrouted, unsearched and verified absent from all rendered output. Delete once nothing references it. | — | Open — mitigated |
| R-012 | `src/data/about/` is nine dead files duplicating records in `kingdom/` and `palace/`. No reader reads that directory. | Debt | Low | Certain | Harmless but misleading to a future editor. Remove in a housekeeping pass. | — | Open |

---

## 1. Technical Debt

- ESLint reports 49 `@typescript-eslint/no-explicit-any` errors across `src/`, the pre-existing
  house idiom. Files added in this pass are clean. `npm run lint` is not part of the
  `CLAUDE.md` verification rule and the build does not run it.
- `tsconfig.tsbuildinfo`, a build artifact, is tracked in git and churns on every build.
- The `.jpg` + `-web.webp` + `-thumb.webp` variant pattern exists in one folder only
  (`public/images/education/`). Adopting or dropping it is an open performance decision (ADR-009).

## 2. Temporary Solutions

- **The Business Directory hold** (ADR-005) is a `publicVisibility` flag, not a deletion.
  Removal plan: a consent review of the four listed businesses, then either publish or delete.
- **The Fringyeng Integrated Health Centre status** is recorded as contradictory in the source
  material — the assessment says built but never opened, while the Fon's September 2022 letter
  refers to a newly established healthcare centre there. Both are recorded; neither is chosen.

## 3. Unresolved Source Conflicts

Recorded so they are not silently settled by a later editor:

- **"Fomumbod Derick" vs "Derrick".** Both archive sources give one `r`; the execution brief
  gives two. The source spelling is retained.
- **"Fodom Calvin — Secretary" vs "Financial Secretary".** No primary source supports
  "Financial". "Secretary" is retained.
- **The late Fon's school.** The repository's first-party biography says the RCM school at
  Njindom; a video transcript says Gom. The repository record is retained.
- **A fourth succession date.** A community report of 23 December 2019 states the Fon was
  "crowned on 27 January 2015" — one day before the recorded passing of his predecessor. Not
  published; recorded in that news record's own source note.
- **Meta clan size.** `/kingdom/about-guneku` says 31 communities; the blog sources say 29.
  A Meta-clan fact, not a Guneku one. Unresolved.

## R-018 — Aug 2026 MEFU-MECUDA card still carries a 2016 photograph

`src/data/updates/mefu-mecuda-joint-meeting-guneku-palace.json` sets
`featuredImage: /images/site/coronation-crowd.jpg` — a 2016 coronation crowd used as the
card image for a 29 August 2026 meeting. It is the one card in the Latest grid that is not
covered by the ADR-013 fallback, precisely because it has a `featuredImage`, and it carries
no "Archive photo" mark, so it reads as coverage of the 2026 meeting.

Two candidate resolutions, neither executed — this is a content decision for the Product
Owner: supply `mefu-mecuda-2026-fons.jpg` from the group archives (the outcome the image
pipeline spec assumes), or clear `featuredImage` on that record so it falls through to the
labelled palace-pool fallback, which is at least honest about not being the event.

Recorded 2026-09-02 alongside ADR-013. Previously noted in `guneku-image-pipeline-spec.md`.

Renumbered from R-011 on 2026-09-03: the baseline table already used R-011 and R-012 for
other risks, and the section appended in `3456435` collided with both.

## R-019 — Three directory names published from a private WhatsApp group

Armstrong Tinyih, Don Df Festoire and Forbang Noel are published as seed stubs in the
Indigenes Directory. They are sourced only from the `gudeca-eu` WhatsApp group; the other
eight founding names come from the Bonn minutes, which were circulated to the membership.

`05-member-profiles.md` holds that a private group is not a publication and that such a
name should stay an unlisted invitation. The Product Owner, as data controller, directed
on 2026-09-03 that all eleven be published (ADR-014).

Mitigations in place: the stub publishes only name, role, chapter and source label — no
photograph, city, employer or contact; every stub carries a one-click removal route
(`/indigenes/submit?intent=remove`) honoured without question; the source label on the
card says the name came from the group rather than from a published record.

Residual exposure: a GDPR objection, or a community objection, from someone who did not
expect their name on a public web page. Recommended next step, not executed: the EU exco
posts a short notice in the group naming the three and pointing at the removal link.

## R-013 — Directory submissions have no rate limit — CLOSED 2026-09-03

`POST /api/community/register` is unauthenticated by design — anyone may put a name
forward. It validates input, resolves chapter and entry from our own data, and carries a
honeypot, but it has no rate limit and no CAPTCHA, so it can be used to flood the Palace
inbox. The same is already true of `/api/contact`, `/api/palace-message` and
`/api/support-interest`; this route adds a fourth surface rather than a new class of risk.
Recorded, not executed: one shared rate limiter across all four form routes.

**Closed 2026-09-03 (ADR-022).** `src/lib/rate-limit.ts` now guards all four routes with
two buckets: 5 per route per 10 minutes, and 12 per sender per 10 minutes across the four
together, so rotating between forms no longer multiplies the budget. `/api/contact` and
`/api/community/register` had no limit at all before this; they do now. Verified against a
running production build: the sixth post to one route returns 429, the thirteenth post from
one sender returns 429 on every route including unused ones, and an unrelated sender is
unaffected.

What remains true, and is the reason this is a mitigation rather than a solution: the
counter is in memory and per-instance, so it resets on redeploy and a serverless fleet
keeps one counter per instance. It blunts casual abuse. It would not stop a distributed
flood, and no CAPTCHA was added.

## R-014 — The chapter count on /gudeca is not the register's count

`/gudeca` states "eight constituted chapters · five countries · three continents", sourced
from the community's own record. `chapters.json` currently holds six constituted chapters
(Douala, Yaoundé, Bamenda, GUDECA EU, GUDECA US, GUDECA UAE) plus eleven locations.

The two are not necessarily in conflict — the register lists what the site surfaces and
does not claim to enumerate every constituted chapter — but a reader can count the cards.
The sourced number was left alone rather than quietly changed to match a list I assembled.

Not executed: ask the Palace or the GUDECA exco for the authoritative list of constituted
chapters, then reconcile the register and the sentence in one pass.

## R-015 — The GUDECA EU record still names Fonjong and still sits in Bonn

`institutions/gudeca-eu.json` lists "Mr. Fonjong — Title Holder" in its `leadership` array
and carries `meetingVenue: "Fon's Palace, Bonn, Germany"`. Both contradict decisions
already taken: Fonjong attended the Bonn meeting but is not a GUDECA member (ADR-018), and
GUDECA EU is a Europe-wide chapter with no fixed seat (ADR-017). The same file's
`nextMeeting` — 24 July 2027, United Kingdom — is itself evidence for the second point.

The file was not changed, because changing an institution record is a content decision and
the Product Owner has not made it. Recorded so it is not lost.

## R-016 — The register's people are not the DB directory's people

`/people/*` and the founding names are static JSON; `/indigenes` reads Neon through
`/api/indigenes/all`. A person who claims a seeded entry and then registers has a record in
both, and nothing joins them. Claim-by-review keeps a human in that loop, so a duplicate is
caught by the Palace rather than by the data layer — but the join is the substance of the
DB claim work already recorded as backlog, and the longer the register grows the more it is
worth doing.

## R-017 — Two names have no chapter recorded

Eleven of the twelve GUDECA national officers have no place in any source, so they carry no
chapter and appear only on their body's roster, not in any chapter register. That is
correct — inventing a location for an officer would be worse — but it means the chapter
counts on `/diaspora` and `/gudeca` understate the register. Resolved when the officers
claim their entries and say where they are.

## R-020 — The indigenes routes still return internal error text

`/api/indigenes/all` and `/api/indigenes/profile` (three places) return
`(err as Error).message` straight to the client. The four form routes were corrected on
2026-09-03 (ADR-023); these were left because they are database-backed rather than form
routes and were outside that change's scope. They are the more sensitive of the two sets:
an error thrown by the Neon driver can carry connection or schema detail, and these routes
are reachable without authentication.

Not executed: give them the same treatment — log server-side, return one fixed message.

## R-021 — The rate limiter depends on guneku.org not being proxied

*(The separate preview-database-isolation concern once tracked alongside this is closed as owner-accepted — see ADR-036. What follows concerns only the Cloudflare proxy state.)*

`src/lib/rate-limit.ts` keys on `x-forwarded-for`. Verified correct on 2026-09-03.

Cloudflare **does** run the zone — the nameservers are `jobs.ns.cloudflare.com` and
`nola.ns.cloudflare.com`. That on its own proves nothing about proxying, and the two must
not be conflated: Cloudflare marks proxying per record, not per zone. The records are
answering with the origin, which a proxied record never does — a proxied record returns
Cloudflare's own anycast address (104.16–31.x, 104.21.x, 172.67.x, 188.114.x) and flattens
the CNAME. Instead, through a public resolver:

- `guneku.org` → `76.76.21.21`, Vercel's apex address
- `www.guneku.org` → CNAME `cname.vercel-dns.com`, returned unflattened
- both hostnames answer `Server: Vercel` with `X-Vercel-Id`, and **no** `cf-ray` or
  `cf-cache-status`

So the zone is on Cloudflare nameservers with the records grey-clouded, and Vercel sees the
visitor's own address.

If the record is ever switched to proxied (the orange cloud), Vercel will see Cloudflare's
edge addresses as the client, every visitor will collapse into one bucket, and twelve
messages from the whole village would lock all four forms for everyone — a self-inflicted
outage of the contact route. The fix at that point is one line: read `cf-connecting-ip`
first in `senderKey`. Do not make that change while the domain is DNS-only, because
`cf-connecting-ip` is then an attacker-settable header.

## R-022 — There is no Clerk integration, only its outline

The delivery programme's Phase 2 assumes "the existing Clerk integration". There is none.
What exists is the shape of one, left from an earlier pass:

- **No Clerk SDK.** `@clerk/nextjs` is not in `package.json` and no source file imports it.
- **`middleware.ts` is empty** — `export function middleware() {}` with `matcher: []`.
- **`/sign-in` and `/sign-up` are placeholders** reading "Member authentication coming soon."
- The only "clerk" in `src/` is the column name `clerk_user_id` in the Drizzle schema.
- `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` are set in Vercel, created
  132 days ago and used by nothing.

Adding an authentication provider is an architecture decision with a production credential
attached, so it was not started inside a framework-upgrade phase. Phases 2, 3, 11 and 13
all rest on it. Owner decision required before Phase 2.

## R-023 — The indigene profile route has no authentication and one hardcoded user

`src/app/api/indigenes/profile/route.ts` opens with `const userId = 'demo-user'` and its
GET, POST and PUT handlers all use it. There is no session check, and `middleware.ts`
matches nothing. So any caller can read, create or overwrite the single `demo-user` profile
row, unauthenticated and unrate-limited.

Live impact today is small — the row is a demo record and `/indigenes` reads the directory
through a different route — but it is a public write endpoint against Neon. It should be
closed by the identity work in Phase 2 rather than patched in isolation, since the correct
fix is the real session the route was always waiting for.

## R-024 — No credential in the stack has been validated — CLOSED 2026-09-06

The original finding stands as written: `vercel env pull` still returns every secret as an
empty string in this project, and `.env.local` still holds no Clerk keys and an empty
`DATABASE_URL`. What changed is that *not readable here* stopped meaning *not exercised*.

Each credential was exercised where it already lives, in Production:

| Credential | How it was exercised | When |
|---|---|---|
| Clerk | DNS verified end-to-end, SSL issued, sign-in and the member area served | 2026-09-04 |
| Neon `DATABASE_URL` | Four versioned migrations applied and proved idempotent | 2026-09-04 → 09-05 |
| Anthropic | Cited Palace AI synthesis answered from evidence, with citations | 2026-09-05 |
| YouTube | The channel's uploads playlist read live; 108 uploads returned | 2026-09-06 |

The pattern each time was the same: a temporary, hardened, single-purpose endpoint deployed
to Production, exercised, then removed along with its token. The YouTube one was the weakest
of them by design — GET-only, writing nothing, returning a comparison — and it is gone, as is
`TV_SYNC_TOKEN`.

**Resend is the exception and is deliberately so.** It is exercised by sending mail, and
sending mail to prove a key works means sending real mail to a real person. See ADR-076: the
delivery path is built and unit-tested, and the first live send is Marcel's acceptance test
rather than a probe.

The lesson, which outlives the risk: *a credential that cannot be read locally can still be
exercised — where it lives, through code that already exists, behind a token that is removed
afterwards.* "No key here" was never the same as "untestable".

## R-025 — There is no migration path for a programme that adds a dozen tables

The single existing table was created by running `src/lib/db/migrate.ts`, a script of
`CREATE TABLE IF NOT EXISTS` with no version tracking. There is no `drizzle.config.*`, no
migrations directory, no applied-migration table, and no npm script that runs anything.
`drizzle-kit` is installed and unwired.

Claims, submissions, subscriptions, follows, correspondence and locations are all coming.
Adding them through an unversioned script means no ordering, no rollback and no way to know
what a given environment has already had applied — and Preview may or may not share the
Production branch (R-021 territory, unresolved). A migration path is a prerequisite for
Phase 3, not a tidy-up afterwards.

## R-026 — The dormant chat route is instructed to speak as the Fondom, from memory — CLOSED 2026-09-03

`src/app/api/chat/route.ts` is live as a route and reachable, though the only component that
calls it is not rendered anywhere. Its system prompt is `site-config.json` →
`aiPersonality`, which opens *"You are the voice of Guneku Fondom"* and continues *"You only
answer based on what you know about Guneku"*. Both are direct contradictions of the
programme's AI rules: it speaks for the Palace, and it answers from model memory.

Its corpus is also unfiltered. `getAllKingdomArticles()`, `getAllPalaceArticles()` and
`getAllUpdates()` do not filter by published state — the last merely sorts null
`publishedAt` records to the end and returns them. One unpublished record exists today and
would enter the prompt. There is no rate limit, no input cap and no timeout.

**Closed 2026-09-03, owner approved.** `src/app/api/chat/route.ts` and
`src/components/home/AIAssistant.tsx` are deleted, and the `aiPersonality` and
`anthropicModel` fields are removed from `site-config.json`.

Proved unreachable before removing, five ways: `AIAssistant` was imported by nothing but its
own definition; `/api/chat` was called by nothing but `AIAssistant`; neither appeared in
`next.config.ts`, the sitemap, robots or `vercel.json`; and no rendered page referenced
either — `/`, `/palace`, `/kingdom`, `/updates` and `/contact` all returned zero matches.

Unreachable from the UI is not the same as harmless, and that is why this mattered: the route
was *live*. Anyone who guessed the path could POST to it, and in production it holds a valid
`ANTHROPIC_API_KEY`, so it would have answered — unauthenticated, unrate-limited, uncited, as
"the voice of Guneku Fondom", from an unfiltered corpus that included unpublished records.

The `aiPersonality` string was retired with it rather than left in the data, because a
future contributor could reasonably have reused it. `site-config.json` now carries an
`aiAssistantNote` recording what it said and why it may not come back.

**Kept deliberately** for the Phase 8 rebuild: `src/lib/palace-knowledge.ts`,
`/api/ask`, `AskPalace.tsx`, and the `@anthropic-ai/sdk` dependency.

## R-027 — Two public write endpoints were open, and one was worse than recorded

R-023 recorded `/api/indigenes/profile` as an unauthenticated write keyed to `demo-user`. A
second route had the same defect and more exposure: `/api/indigenes/upload` accepted a file
from **anyone**, with no session, no rate limit and no format allow-list, and wrote it to
Vercel Blob under `indigenes/demo-user/`. Storage cost was the smaller problem; serving a
stranger's uploaded content from the Fondom's own hosting was the larger one.

Both are closed as of Phase 2. Both now require a Clerk session, scope their write to that
session's own user id, and are rate limited. The upload additionally derives the file
extension from the sniffed content type rather than the client-supplied filename, and rejects
SVG, which can carry script and would have been served from our origin.

Recorded rather than folded silently into R-023 because the exposure was materially
different, and because it is a reminder that "one route has this defect" should always be
read as "grep for the pattern".

## R-028 — The canonical 27-quarter list and the records disagree, in both directions

Building the quarter pages (Phase 10) required reading every mention of every quarter. The
canonical list in `src/lib/quarters.ts` and the Fondom's own records do not match, and the
mismatch is large enough that it needs the Palace rather than a judgement from me. **Nothing
was changed**: the list is still the approved 27, and all 27 have pages.

**Seventeen of the 27 are named in no record at all.** Ten have a reference that puts their
name beside the word "quarter": Njinigom, Ngong, Fun, Fringyeng, Windig, Munam, Ngamunghe,
Mbengeghang, Nyang and Central Guneku. The other seventeen — Wumfi-Ku, Keuhchah, Ndobo,
Tonenge, Upper Guneku, Lower Guneku, Akwen, Bali-Dingi, Bessi, Boa, Egock, Eku-Bessi, Eshie,
Esimbi, Etwii, Guneku Centre, Kai — appear nowhere.

**One entry contradicts a record outright.** `updates/mujang-berto-prince-tournament-final-2026`
carries this in its own `sourceNote`, written 2026-09-02:

> whether Gunenung, Njinibi, Zem and **Bessi** are Guneku quarters is not established by the
> Fondom's own 27-quarter list

But `GUNEKU_QUARTERS_27` **contains** Bessi. One of the two is wrong: either that note was
written against a different list, or Bessi entered the list without a Palace source.

**One entry matches another fondom.** "Kai" appears in the archive only as *HRH Akam M. of
Kai*, a Fon of a different fondom, in the tributes record. Nothing connects the name to a
quarter of Guneku. This is also why the registry links records by hand: matching a quarter's
name against text would have attached another fondom's Fon to a Guneku quarter, and "Fun"
would have matched the ordinary English word.

**Two entries look like the same place twice.** "Central Guneku" and "Guneku Centre" are both
on the list. The only record that uses either treats "upper, lower and central Guneku" as
areas the electoral commission toured, not as named quarters in their own right.

**Four names the records do call quarters are missing from the list:** Njinebai, Nyeh, Toh
and Tuengyie. Toh, Nyeh and Tuengyie appear together in a zone roster — *"Zone 1 whose
quarters are Fun/Mbong, Ngong, Toh, Nyang, Nyeh and Tuengyie"* — which reads as a Fondom
listing of quarters.

**What was done instead of resolving it.** All 27 pages exist. Each carries only records that
name it, with the justifying sentence quoted beside each link. The seventeen empty pages say
plainly that the archive holds nothing about them, and are `robots: noindex` and excluded
from the sitemap — thin pages should not be offered to a search engine, and a reader arriving
from a search should not be told the Fondom knows nothing about their quarter.

**Owner action:** ask the Palace for the authoritative roster. Until then the list stands as
approved and no name was added, removed or renamed.

## R-029 - The archive holds one coordinate, so Guneku cannot yet be mapped

Building `/explore` (Phase 9) required finding every coordinate in the repository. There are
two number pairs and only one of them is a place:

- `home/village-facts.json` - `6.083333, 9.916667`, a **place-marker for the village as a
  whole**, taken from the legacy village record's own map link. Not a survey, not a boundary,
  not a centre. This is the single marker `/explore` draws.
- `site-config.json` - `6.2307346, 9.664737`, which that same record's own precision note
  identifies as **the legacy map's viewport centre, not the village**. It is not used.

Nothing else has a position. Not the Palace. Not any of the three Integrated Health Centres,
though their quarters are recorded. Not the Open Door Medical Clinic, the market at Ngong, the
proposed market at Windig, the River Batmuki, the stream at Ngong, the library, the Agro CIG,
the Tonmukom-Windik road, the GUYODECA bridges or the FUN electricity project. Not one of the
27 quarters.

**Nothing was estimated.** An approximate pin is not a rougher version of the truth about
where a health centre stands; it is a different and false claim, and on a village map read by
the people who live there it would be both obvious and insulting. So `/explore` draws one
marker and lists the other fourteen places with the reason each has no position. The list is
rendered on the server and is the authoritative view - the map is an enhancement over it, not
the other way round.

**Owner action to make the map worth having:** positions for the Palace, the three health
centres, the markets and the schools would turn one pin into a real map. A phone's GPS
reading, taken standing at each place, is enough and is better provenance than any map trace.
Recorded through the contribution route so each arrives with a source.

**A second thing to settle with it:** `site-config.json` still carries the viewport-centre
coordinate under a `coordinates` key, where a future contributor could reasonably mistake it
for the village. It was left rather than changed, because editing a config value that
something else might read is not an audit's decision.

## R-030 - The YouTube sync has never run against the live API

`src/lib/youtube-sync.ts` is written, typed and wired, and the pure logic it feeds is tested
against a fixture. `fetchChannelUploads()` itself has **never been executed**: the key is set
in Production and Preview but is not readable in this environment (R-024), and no key was
invented to test it.

What that leaves unverified is narrow and worth naming: the playlist id derivation
(`UC` to `UU`), pagination through `nextPageToken`, the real shape of a `playlistItems`
response against the normaliser, and quota behaviour. Everything downstream - what is dropped,
what counts as discovered, what is denied, what stays out of public view - is tested.

Nothing public depends on it. `/watch` renders from the canonical record and would render
identically if YouTube were unreachable for a week.

Owner action when convenient: run a sync in an environment that has the key, and check the
report. It writes nothing, so it is safe to run.

## R-031 - Every Vercel secret is write-only, so no credentialed work can be verified locally

Not a defect in Guneku - a project setting - but it is the single thing gating Phases 3, 4, 5,
8, 11, 12, 13 and 14, so it belongs in the register rather than in a chat message.

Every environment variable in this Vercel project is marked **Sensitive**. `vercel env pull`
returns an empty string for each one in production, preview and development alike.
`.env.local` carries no Clerk keys and an empty `DATABASE_URL`. `npx clerk@latest env pull`
reports `not_linked`, and `clerk link` needs an interactive browser session.

The consequence is not that the code cannot be written - it is that it cannot be *tested*.
"An unauthenticated request is denied", "a member cannot reach the admin area" and "one user
cannot update another user's row" are claims that require a session to hold, and writing eight
phases of database-backed code that has never once run would produce something worse than
nothing: a large body of plausible, unverified work.

**Owner action, either one:**

1. In Vercel, uncheck **Sensitive** for `DATABASE_URL`, `CLERK_SECRET_KEY` and
   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, then `vercel env pull` can supply them; or
2. put development Clerk keys and a `DATABASE_URL` directly into `.env.local`, which is
   gitignored and never leaves the machine.

The second is the smaller change and keeps the production variables sensitive.

## R-032 - The production Clerk keys have never been exercised

`CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` were created in Vercel 132 days ago
and, until this release, were read by no code at all. Their validity is unknown and could not
be checked before deployment (R-031).

If they are stale, `/sign-in`, `/sign-up` and `/my-guneku` fail in production. The public site
cannot be affected: the entire build was exercised with no Clerk keys present, and 38 public
routes returned 200 with zero Clerk JavaScript on any page. Two of the three affected routes
are currently placeholder pages, so the regression risk is small and reversible by a Vercel
rollback.

Verified immediately after deployment. If the keys are stale, the fix is new keys from the
Clerk dashboard, not a code change.

## R-032 — The production Clerk keys have never been exercised — CONFIRMED AND HANDLED

**Confirmed on deployment, 2026-09-03.** `/sign-in`, `/sign-up` and `/my-guneku` returned 500
in production with `@clerk/nextjs: Missing secretKey`. Every public route was unaffected, as
predicted.

**And it corrected an earlier conclusion of mine.** I had recorded the Vercel secrets as
"marked Sensitive, therefore write-only". The runtime error says *missing*, not *invalid* —
and the pull that returned an empty string for every secret also returned
`VERCEL_OIDC_TOKEN` at full length. A redacting pull would have redacted that too. So the
variables exist **by name with no value**, and R-031's diagnosis was wrong: nothing is being
withheld from me, there is simply nothing there.

That has a wider implication worth checking: `DATABASE_URL`, `RESEND_API_KEY`,
`ANTHROPIC_API_KEY` and `YOUTUBE_API_KEY` are in the same state, which means the contact and
support forms in production may never have been able to send.

**Handled by degrading rather than rolling back.** Rolling the release back would have
withdrawn Guneku TV, search, the map, the twenty-seven quarter pages and four security fixes
to repair three routes, two of which were placeholder pages the day before. Instead
`src/lib/clerk-config.ts` gates every Clerk mount point — the middleware, the three layouts,
the three pages and `optionalUser()` — so an unconfigured Clerk produces an honest page and a
401, never a 500.

**Still open:** members cannot sign in until real Clerk keys are set. That is one owner action
in the Vercel dashboard, not a code change.

## R-033 - Every database call has thrown since the Neon migration - FIXED 2026-09-03

`GET /api/indigenes/all` returned 500 in production with `TypeError: t.sql is not a function`,
before any outgoing request. The cause was in `src/lib/db/client.ts` and predates this
programme entirely - commit `5a4ecf3`, the Supabase-to-Neon swap.

The lazy client was `new Proxy({}, { apply, get })`. A Proxy's `apply` trap only fires when
the **target is callable**, and `{}` is not. So `typeof sql` was `"object"`, every tagged
template threw at the call site, and the trap meant to handle it never ran once. Reproduced
directly rather than reasoned about:

    new Proxy({},           {apply}) -> typeof "object",   calling throws TypeError
    new Proxy(function(){}, {apply}) -> typeof "function", the trap runs

What made it survive unnoticed is that **property access worked**: `get` traps fine on a plain
object, so `sql.query(...)` would have been fine. Only the tagged-template form was broken -
which is the form every query in this repository actually uses. The indigenes directory has
therefore never loaded in production, and no amount of database configuration would have
fixed it.

**Fixed** by giving the Proxy a callable target. Not by optional chaining, and not by catching
and returning an empty list: either would have hidden a permanently broken data layer behind a
plausible empty state.

## R-034 - Database configuration is classified, not truth-tested

The old client did `if (!process.env.DATABASE_URL) throw`, collapsing *unset*, *empty* and
*malformed* into one condition and one message. Those are three different operational problems
and the logs could not tell them apart.

`databaseConfigState()` now distinguishes `missing`, `empty`, `malformed` and valid - where
malformed covers a non-URL, a non-Postgres protocol, and a URL with no host. A configuration
failure raises `DbConfigError`, which `dbErrorResponse()` turns into **503 "This part of
Guneku is not available yet"** rather than a 500: nothing is broken, and retrying will not
help until a variable is set.

Nothing logs the connection string, its host, or any part of it. A database URL carries a
password, and a log line saying "the host is X" is one screenshot from being a credential
leak. The diagnostic names the *kind* of problem and nothing else - verified as
`Database unavailable: DATABASE_URL is empty.`

## R-035 - Clerk state resolved: the publishable key is present, the secret is not

Whether the member area is closed by intent or by missing credential is settled from source
and history, not inferred.

There is **no launch flag**. `clerkConfigured()` reads exactly two variables -
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` - and requires both to be non-empty
after trimming. Nothing else can close the member area.

The decisive evidence is the failure sequence of 2026-09-03. Commit `94abd2a` gated Clerk on
the **publishable key alone**, and production still returned 500 with `Missing secretKey`.
That can only happen if the publishable check passed. So: **the publishable key carries a
value; the secret key is absent or empty at runtime.** Commit `3d671a2` then required both,
and the routes recovered.

The graceful copy a reader now sees is a fallback authored during that incident, not a
pre-launch product state. The member area is closed because the secret is missing, and it will
open when the secret is set - no code change required.

**One misclassification path worth knowing:** `NEXT_PUBLIC_*` is inlined at build time while
`CLERK_SECRET_KEY` is read at runtime. A deployment built before the publishable key existed
would bake in `undefined` and keep reporting unconfigured even after the variable is set. If
the keys are set and the member area stays closed, redeploy before investigating anything else.

## R-036 - /indigenes/onboarding is statically rendered, and that is safe

Assessed rather than assumed. `/indigenes/profile` is a static placeholder with no data and no
fetches. `/indigenes/onboarding` is a client form that embeds **no** server data at build - its
country and quarter lists are public constants - and every mutation it makes goes to
`/api/indigenes/profile` or `/api/indigenes/upload`, both of which call `requireUser()` and
scope every write to the session's own id.

So: no personal data in generated HTML, no unauthenticated mutation, no cross-user access, and
no reliance on hidden UI. Static rendering is **not** forced to dynamic, because doing so would
change nothing about the security and would cost a cached page.

**A usability note, not a defect:** a signed-out visitor can open the onboarding form and only
discovers on submit that they are not signed in. Adding the route to the middleware matcher
would redirect them - to a sign-in page that is itself closed. Left as is; worth revisiting
when Clerk is configured.

## R-037 - The production database is reachable and empty, and my "all secrets are empty" claim was wrong

With the proxy fixed (R-033) the query reached Postgres, and Postgres answered:
`relation "indigene_profiles" does not exist`, SQLSTATE **42P01**.

That single line corrects a conclusion I had drawn and reported. I had inferred from
`vercel env pull` returning an empty string for every secret that the variables themselves
were empty. For `DATABASE_URL` that is **false**: it is populated, valid, and connects — the
query travelled to Neon and came back with a schema error, which is impossible with an empty
connection string. The pull was redacting after all.

`CLERK_SECRET_KEY` is genuinely a different case: the runtime said *Missing secretKey*, which
is direct evidence of absence at that moment. So the two variables are in different states and
should not have been generalised together. The lesson is narrow and worth keeping: an
inference from tooling silence is weaker than one runtime error message, and I should have
waited for the second before reporting the first.

**What it means operationally:** the database has never had a migration applied. `0000` — which
creates `indigene_profiles` — was recorded as "already applied wherever the table exists", and
in this database it does not exist.

**Handled** by treating 42P01 as a provisioning state rather than a fault: a controlled **503
"This part of Guneku is not available yet"**, with a server-side log naming the cause and the
remedy. Not papered over — the table genuinely does not exist, and telling a visitor the
directory is not open yet is the accurate statement.

**Owner action:** run `npm run db:migrate` against the production database. It applies `0000`
and `0001`, both additive and idempotent, and creates `indigene_profiles`, `community_members`,
`follows` and `schema_migrations`. It needs a readable `DATABASE_URL`, which is R-031.

> **CLOSED 2026-09-04.** `0000` and `0001` were applied to production and recorded in
> `schema_migrations`. `0002_profile_claims.sql` followed on **2026-09-05**. All five tables
> exist and a second run applies nothing. The entry is kept for the lesson it carries about
> inferring from tooling silence, not as an open risk.

## R-038 - Two production tasks are blocked on one owner action each — BOTH CLOSED

Both are credential states, not defects, and neither has a workaround I am willing to build.

**The database schema. CLOSED - 0000 and 0001 on 2026-09-04, 0002 on 2026-09-05.** All five
tables exist in production and every migration is recorded in `schema_migrations`.

The instruction that stood here - set `MIGRATE_TOKEN` in Vercel and call the endpoint - is
**no longer actionable and must not be followed**. The endpoint has been removed from the
codebase both times it was used, and there is nothing in a deployed build for a token to
enable. `MIGRATE_TOKEN` should not exist in Vercel; if it does, delete it.

The mechanism, if a future migration needs it: restore the endpoint from git
(`git show 8cc7165:src/app/api/admin/migrate/route.ts`), set the variable, apply, verify,
then remove the endpoint and the variable again. That lifecycle - set it, migrate, unset it -
is the whole of what makes it safe, and skipping the last step is what would turn a one-time
job into a permanent door.

**Clerk.** `CLERK_SECRET_KEY` is absent from the production runtime. This was established from
the environment rather than inferred: with the guard checking only the publishable key,
production still failed with `Missing secretKey`, which can only happen if the publishable
check passed. The publishable key has a value; the secret does not.

*Smallest action:* set `CLERK_SECRET_KEY` on the **existing** Clerk application and redeploy.
No second application, and the publishable key is working and must not be rotated.

Until then `/sign-in`, `/sign-up` and `/my-guneku` render the member-area notice, the protected
API routes answer 401, and the public site is unaffected.


## R-039 - Palace correspondence retention is an unresolved owner policy

**OWNER POLICY, not an engineering gap. Closed as engineering on 2026-09-06.**

The policy as it stands, stated so that nobody has to infer it:

> Correspondence is retained until an explicit Guneku retention policy is approved. No
> automatic deletion is currently performed.

That sentence is now enforced rather than merely written. Three tests fail if any code
deletes from `palace_correspondence`, if any scheduled job of any kind appears, or if the
sender-facing text ever promises a period - "deleted after 90 days" would be a retention
policy invented by a sentence, and inventing one is exactly what this risk exists to prevent.

The sender is told what is true, on the public form and in My Guneku: the Palace keeps the
message privately so it can be answered and referred back to, it is never published on
guneku.org, it is not shared outside the Fondom, and nothing is deleted automatically. No
timetable is offered, because there is not one.

**What remains is a decision, not a defect.** Choosing a retention period is governance, and
acting on one would be a destructive operation needing explicit owner authorisation. Until
then the position above is the position, and it is safe to leave indefinitely.

**No automatic deletion exists, and none was built.**

Before 2026-09-05, a message to the Palace lived in an inbox and nowhere else. It now also
persists in `palace_correspondence`, indefinitely, including the sender's name, their email or
telephone number, what they wrote, the Palace's reply and the Palace's internal note.

That is a deliberate improvement - a letter can now be answered traceably rather than lost in a
mailbox - and it creates a question nobody has answered: **how long should Guneku keep private
correspondence?**

Nothing has been decided, so nothing has been implemented. There is no retention cron, no purge
job, no expiry column and no destructive migration. Every letter is intact.

**Practical options, for the owner to choose between - not recommendations to act on:**

1. **Keep everything indefinitely.** Simplest, and defensible for a village record. The cost is
   that personal contact details accumulate forever, including for people who wrote once about
   something small.
2. **Close and keep, delete after a period.** For example: closed correspondence is retained
   for a stated number of years, then removed. Needs a written policy first, and the deletion
   itself would be a destructive operation requiring explicit owner authorisation.
3. **Redact rather than delete.** Keep the fact of the correspondence and its outcome; remove
   the sender's contact details after a period. Preserves the record of what the Palace was
   asked while shedding what identifies the asker.
4. **Delete on request.** A person writes to ask that their correspondence be removed, and it
   is, by hand. No automation, no policy horizon.

Whichever is chosen, two things follow: it should be stated somewhere a villager can read it,
and any deletion is a destructive database operation needing Marcel's explicit authorisation at
the time - not something to schedule and forget.


## R-007 - Held Bonn material was served over HTTP - CLOSED 2026-09-06

**The classification was right; the behaviour did not match it.**

The Bonn WhatsApp originals have been classified as held since Guneku TV was built, because
their speakers and subjects are unconfirmed. `src/lib/guneku-tv.ts` documented that, and the
catalogue honoured it completely: the material appeared in no album, no search index, no
sitemap, no page and no Cited Palace AI source.

None of that stopped a direct request. The files sat in
`public/images/gallery/visit-to-fons-palace-by-eu-residents/`, and everything inside `public/`
is served by Next.js whether or not anything links to it. On 2026-09-06 a verification sweep
fetched one and got `200 image/jpeg`, 269 KB.

**Absence from a catalogue is not unreachability.** That is the lesson worth keeping: a `held`
flag governs what the site *shows*, and says nothing about what the server *hands out*.

**Closed** by moving the whole directory to `archive-held/`, outside every served path. All 17
files - images and WhatsApp video together, 83.2 MB - moved byte-for-byte with `git mv`, which
recorded every one as a pure rename. SHA-256 of all 17 verified identical before and after.
Filenames, grouping and content unchanged. Nothing deleted, nothing re-encoded, nothing sent to
any model.

Three tests now hold it closed: the directory must not exist under `public/`, it must still
exist intact in `archive-held/` with 17 files, and no directory anywhere under `public/` may
carry that name at any depth.

**What this did not settle, and what settled it.** Four other directories under
`public/images/gallery/` were in no canonical album - `coronation` (58), `enthronement` (40),
`prince-tibahs-bornhouse-bonn` (37) and `guneku-dmv-welcomefomuki` (28). They were
**unclassified**, not held: being absent from the fifteen albums is not evidence of anything.
The owner confirmed on 2026-09-06 that none of them is held, and all 163 files were moved to
`archive-staging/` pending classification - preserved in git, out of every served path. See
R-040 and the change-log.

## R-040 - A directory can be tracked, deployed and public under a name the working tree does not show - CLOSED 2026-09-06

**The inventory of 2026-09-06 reported that `guneku-dmv-welcomefomuki` was untracked by git,
had never been deployed, and was therefore not backed up by the repository. Every part of
that was wrong**, and the reconciliation the next step found out why.

Git tracked the directory as `public/images/gallery/Guneku-DMV-WelcomeFomuki`, with capitals.
Somebody had renamed it to lower case on disk. Windows does not distinguish the two spellings,
so `git status` showed the working tree as clean while the index held a name the filesystem
listing never displayed. Every check ran against the lowercase name:

- `git ls-files public/images/gallery/guneku-dmv-welcomefomuki` returned nothing -> "untracked"
- a production fetch of `/images/gallery/guneku-dmv-welcomefomuki/...` returned 404 -> "never
  deployed", because Vercel builds on Linux, where the two names are different files

The capitalised URL returned `200 image/jpeg`. All 28 files were deployed and publicly
retrievable, and the conclusion drawn from those two checks was the exact opposite of the
truth: the material was not at risk of being lost, it was being served.

**The lesson.** On a case-insensitive filesystem, the name you can see is not necessarily the
name git and the deployment target are using. A negative result from a path-based check -
"not tracked", "404" - is evidence about *that string*, not about the file. Ask git what it
holds (`git ls-tree`) before concluding anything about what exists.

**Closed** by `git mv` into `archive-staging/`, which resolved the case mismatch as a side
effect: the index and the working tree now agree on one name.

## R-041 - `mchibe-mta-event-guneku2023` serves 35 files its album does not list - CLOSED 2026-09-06

Found while reconciling the four staged directories; outside that scope, recorded rather than
acted on.

The album catalogues 39 photographs. The folder held 74 files. **None of the 35 extras was an
additional photograph**, which the full audit established and the first estimate had not:

- **32 `.jpg` files**, each sharing a stem with a catalogued `.jpeg` and each a downscale of it
  to a 600-pixel maximum edge - 600x337 against 1080x607, 450x600 against 780x1040, and so on
  in every case. Joomla renditions. Zero byte-identical to any of the 339 canonical images.
- **3 legacy web-server files**: `.htaccess`, `web.config`, `index.html`.

The first estimate said "3 further `.jpg` with no catalogued twin". That was wrong: the seven
`.jpg` files without a `.jpeg` twin are themselves catalogued, and the three remaining files
are not images at all.

The web-server files are the part worth keeping. They are Joomla's standard trio for making a
folder unreachable - an Apache deny rule, its IIS equivalent, and a blank page to defeat
directory listing - and **Next.js reads none of them**. Verified in production before removal:
`.htaccess` returned `200 application/octet-stream` with its own deny rule as the body,
`web.config` the same, and the directory URL returned the blank `index.html` as `200 text/html`.
Two files whose whole content is *deny everyone* were being handed to anyone who asked.

**Closed.** All 35 removed from the served directory, which now holds exactly its 39 catalogued
photographs. The three web-server files are preserved as text in
`docs/legacy-webserver-artifacts.md`, explicitly as history rather than configuration. The 32
renditions were removed rather than staged: every photograph they are a copy of remains
published at higher resolution, and their bytes remain in git history. See ADR-072.

Two tests now hold it closed, and they are general rather than about this album: no file may be
served from `public/images/gallery/` that the catalogue does not list, and no `.htaccess`,
`web.config` or `index.html` may exist anywhere under `public/`.

## R-042 - The archive holds better copies of 19 published photographs than the ones it serves - Open

Nineteen files in `archive-staging/` carry the same source filename as a published photograph
and are larger in every case. The catalogue's own `width`/`height` already describe the larger
file, so `image-gallery.json` disagrees with what the site serves:

| | catalogue says | file served | staged original |
|---|---|---|---|
| 18 born-house photographs | e.g. 720x960 | 450x600 | **720x960** |
| 1 GUDECA-US photograph | 2048x2048 | 600x600 | **2048x2048** |

Same source filename means the same photograph, so swapping them in asserts nothing new and
would make the record true. The owner deferred it on 2026-09-06 as an **image-delivery
decision, not an archive-classification one** - 109 KB becoming 1.6 MB on a page load matters
to a mid-range Android on a throttled connection in Cameroon (see R-008), and the right answer
is probably to serve the originals through a resizing pipeline rather than to serve them raw.

Recorded as a future image-optimization opportunity. The originals are preserved and are not
public; nothing is lost by leaving this open. Related: ADR-009, which declined to impose a
three-variant image convention site-wide.

## R-009 - 44 of 46 video records carried no verified YouTube title - CLOSED 2026-09-06

`YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` had been set in Production and Preview for 136 days
and had never been used. `src/lib/youtube-sync.ts` was written, its pure half was tested
against a fixture, and `fetchChannelUploads` had never met the live API - because the key is
redacted by `vercel env pull` and there was no way to run it from here.

There was a way. The key is readable where it lives, so a temporary GET-only probe was
deployed to Production, run once, and removed with its token. It wrote nothing and could
publish nothing; all it did was read the channel and hand back a comparison.

**The first live read.** 108 public uploads returned. All 46 films in the record matched by id,
none missing from the channel, no duplicates. The private upload was not returned as a
publishable item, and is absent from both the verified layer and the discovered queue - the
deny list and the normaliser exclude it independently.

**All 46 titles are now verified**, in `src/data/gallery/video-provider-metadata.json`. Every
one of the 46 differs from the title the site shows, and the difference is the reason the
layer is separate rather than merged: the channel writes for YouTube search - *"Guneku Cultural
Dance at the Palace in Bonn | Diaspora Celebration 2026"* - and the archive writes for the
Fondom - *"Bonn 2026 - from the gathering"*. A sync that overwrote the second with the first
would replace the Fondom's editorial voice with a provider's keywords, silently, on every run.
So `publishedTitle` is filled and `displayTitle` is not touched. A test fails if that ever
changes.

The upload timestamp is stored and rendered nowhere. It is when a file reached YouTube, not
when an occasion happened, and thirty-six of the discovered uploads share one upload day.

## R-043 - 62 channel uploads are not in the film record - Open, non-blocking

The same live read found 62 public uploads on the Fondom's channel that the site does not
carry: 4 from 2015, 21 from 2023, 36 from 2024, 1 from 2026. They are recorded in
`src/data/gallery/video-discovered.json` as a review queue and are **not public** - no page, no
search index, no sitemap, no structured data and no Cited Palace AI source reads that file, and
a test asserts no module imports it.

They were not classified, and could not be. Thirty-six of them are titled *"25. March 2024"*.
Deciding from a title what an occasion was is exactly the mistake the four-state film lifecycle
exists to prevent, and the rule it encodes has not changed: a sync may add to `discovered`;
only a person moves anything to `approved`.

Publishing any of them means a person watching it and writing it into the canonical record or
into `video-overrides.json` - the route every one of the 46 already took. Owner work, not
engineering work.
