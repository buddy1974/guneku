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
| R-009 | 44 of the 46 video records carry no verified YouTube title. | Debt | Low | Certain | `titleVerified: false`; no title is asserted and the player shows the channel's own. Verify against the channel when convenient. | — | Open — mitigated |
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

## R-024 — No credential in the stack has been validated

`vercel env pull` returns every secret as an empty string in this project, and `.env.local`
holds no Clerk keys and an empty `DATABASE_URL`. So the Clerk, Neon, Resend and YouTube keys
are established as *present* in Vercel and nothing more. None was exercised.

The consequence is not cosmetic. Phases 2 to 5, 11, 13 and 14 all need a working database
and a working identity provider to be *tested*, not merely written. Code can be written
blind; "unauthenticated request is denied", "a member cannot reach the admin area" and "one
user cannot update another user's row" cannot be demonstrated without a session to hold.

Owner action: place development Clerk keys and a working `DATABASE_URL` in `.env.local`, or
make the branch preview reachable so the deployed environment can be exercised instead.

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
