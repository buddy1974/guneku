# Decision Log — `guneku`

> The repository's decision record (source-of-truth Tier 2). Decisions are recorded, not
> remembered. An accepted decision is immutable; it is changed only by a new decision that
> supersedes it.

| Field | Value |
|-------|-------|
| Document tier | 2 — decision record |
| Owner (DRI) | Marcel / Maxpromo Digital |
| Repository class | Client |
| Lifecycle stage | Live production |
| Review cadence | Per release |
| Last reviewed | 2026-09-02 |
| Status | Draft — opened 2026-09-02 with the decisions of the September 2026 content pass |

Opened 2026-09-02. Earlier decisions (the 2026 migration, the institutional facelift) predate
this log and are not backfilled here; they are recorded in the handover reports at the repo root.

---

## ADR Index

| ADR | Date | Title | Status | Supersedes |
|-----|------|-------|--------|------------|
| ADR-001 | 2026-09-02 | Publish the evidenced succession stages; withdraw "17 January 2016" | Accepted | — |
| ADR-002 | 2026-09-02 | `+237 681 19 46 64` is the Palace telephone of record | Accepted | — |
| ADR-003 | 2026-09-02 | One development register; `/projects` reads it | Accepted | — |
| ADR-004 | 2026-09-02 | Surface institution records through the existing content API | Accepted | — |
| ADR-005 | 2026-09-02 | Hold the Guneku Business Directory from public surfacing | Accepted | — |
| ADR-006 | 2026-09-02 | Use the GUDECA-US 2023 image for the reigning Fon's portrait | Accepted | — |
| ADR-007 | 2026-09-02 | Assert no YouTube title this archive has not verified | Accepted | — |
| ADR-008 | 2026-09-02 | One canonical 27-quarter list | Accepted | — |
| ADR-009 | 2026-09-02 | Do not impose a three-variant image convention site-wide | Accepted | — |

---

## ADR-001 — Publish the evidenced succession stages; withdraw "17 January 2016"

**Context.** The site published "Coronation, 17 January 2016" on the home page and the Fon's
profile. A search of the retired Joomla database — which holds the original Palace records —
returns zero occurrences of that date, and no source examined records an event on that day.
Its only origin in the corpus is a hand-authored literal in `migration/scripts/build-fon-profile.js`.

**Decision.** Publish the succession as the distinct stages the evidence supports: 1965
accession · 28 January 2015 passing · 27 February 2015 Transfiguration Ceremony and public
anointing · November 2015 launching gala · 30 December 2016 public presentation to Meta.
Remove "17 January 2016" from all public rendered output, including from any public
withdrawal notice. Retain the provenance in non-rendering editorial fields only.

**Consequences.** `coronationDate` is `null`; `ceremonialStages` carries the five stages. The
migration script literal was corrected so a re-run cannot reintroduce it. If the Palace later
supplies the meaning of that date, it can be restored as a labelled event.

---

## ADR-002 — `+237 681 19 46 64` is the Palace telephone of record

**Context.** `/contact` showed two numbers on one page: `681 19 46 46` in the contact card and
`681 19 46 64` in the footer. The legacy Joomla `contact_details` row for "Guneku Palace" gives
`681 19 46 64` for both phone and mobile; it occurs 14 times across the 8.6 MB dump, against
zero occurrences of `681 19 46 46`. The latter existed at exactly one place in the corpus — a
hand-typed JSX literal introduced in commit `fb58e9b` with no telephone source attached.

**Decision.** `+237 681 19 46 64` is the number of record. The contact card now reads
`site-config.json` rather than carrying its own literal.

**Consequences.** One source for the Palace number. On a site whose own archive warns about
impostors asking for money, a wrong Palace number is a safety matter, not a typo.

---

## ADR-003 — One development register; `/projects` reads it

**Context.** The home page read `src/data/current-notices.json` (22 entries) while `/projects`
carried its own hard-coded array of 11 cards and never read the register. The subtitle
"11 active · 4 proposed" described neither view.

**Decision.** `current-notices.json` is the single register. Every entry carries a `class` from
a fixed vocabulary — PROJECT · INSTITUTION · PROGRAMME · PROPOSED INITIATIVE · HISTORICAL
RECORD · OPEN ISSUE. `/projects` reads that file, groups by class, and computes its counts.

**Consequences.** The two views can no longer diverge silently. No CMS and no data layer were
introduced; the change is one JSON field and one page component.

---

## ADR-004 — Surface institution records through the existing content API

**Context.** `getAllInstitutions()` and `getInstitution()` had been written in `src/lib/content.ts`
and were called by nothing. Twelve institution records sat unread, among them the complete
Fondom Studios record the reconciliation had been told not to recreate.

**Decision.** Add `/institutions` and `/institutions/[slug]` using those existing functions. A
record that already has a page carries a `route` and the index links there instead of
generating a second presentation — one subject, one page. MEDPHISATG and the Afor Foundation
route to `/education`.

**Consequences.** No new data store, no new components, no duplicate content architecture.

---

## ADR-005 — Hold the Guneku Business Directory from public surfacing

**Context.** The record lists four businesses and already withholds every contact detail behind
its own consent policy. Publishing the listing itself is a separate consent question that has
not been put to the owners.

**Decision.** Mark the record `publicVisibility: "hold"`. It is excluded from the institutions
index, from page generation and from the development register. The source record is retained
in full; this is a visibility decision, not a deletion.

**Consequences.** Revisit once the entries and their consent basis have been deliberately reviewed.

---

## ADR-006 — Use the GUDECA-US 2023 image for the reigning Fon's portrait

**Context.** Two candidates. `fon-portrait-formal.jpg` is the better photograph but its subject
is unconfirmed — it may be the late Fon Fomuki Patrick Nji rather than the reigning Fon.
`fon-standing-regalia-usa-2023.jpg` is 2048×2048 from the GUDECA-US 2023 gathering, an event
already published on this site, so its provenance is known.

**Decision.** Use the GUDECA-US 2023 image, cropped to 3:4 and delivered at 1000×1333. Do not
use the identity-uncertain candidate.

**Consequences.** The wrong Fon on the reigning Fon's page is not a small error. The formal
portrait stays on hold until Marcel confirms the subject.

---

## ADR-007 — Assert no YouTube title this archive has not verified

**Context.** 44 videos were attached to the records they document, but this archive has
verified the published YouTube title of only two of them.

**Decision.** Those 44 carry `title: null` and `titleVerified: false`. The page shows the
subject the record establishes and suppresses the "Published on YouTube as…" line; the embedded
player carries the channel's own title. No speaker is named who is not named in a source.

---

## ADR-008 — One canonical 27-quarter list

**Context.** `/kingdom` published 27 quarters from a local array while the `/indigenes`
directory filter offered 16 plus "Other / Unknown", forcing sons and daughters of eleven
quarters to file themselves under Other.

**Decision.** `src/lib/quarters.ts` holds the 27 as the single list; both consumers read it.

---

## ADR-009 — Do not impose a three-variant image convention site-wide

**Context.** The site's `.jpg` + `-web.webp` + `-thumb.webp` pattern exists in exactly one
folder, `public/images/education/`. The 338 gallery photographs do not follow it.

**Decision.** A convention of one example is not authority to generate 1,014 files. The
canonical images are served as they are. Revisit as a deliberate performance decision.

## ADR-010 — The silent copy address is configuration, never source

**Context.** Palace and support messages go to the Fondom address with a silent copy to
the maintainer. The copy address had been written into `src/lib/email/send.ts` as a
fallback, which would have committed a personal address to a public repository.

**Decision.** The copy recipient is read only from `EMAIL_BCC`, server-side. No address is
committed. When `EMAIL_BCC` is unset the message still delivers to `EMAIL_ADMIN` and the
copy is simply omitted — a missing variable never fails a visitor's submission.
`src/lib/email/send.ts` carries `import 'server-only'`, so the value cannot reach a client
bundle even by accident. Production must set `EMAIL_BCC` privately in Vercel.

## ADR-011 — Withdraw a statistic rather than publish a false precision

**Context.** Three of the nine at-a-glance figures could not be proved from a single
unambiguous source: churches (the same record says both "as many churches as there are
quarters" and enumerates 19), schools (the record's own editor note flags an unresolved
conflict), and medical facilities (the record says three; the archive names four).

**Decision.** Those three are withdrawn from the front page, with the reason recorded in
`glanceOmitted` in `src/data/home/village-facts.json`. The six that remain — population,
quarters, GUDECA chapters, development records, photographs, films — each trace to one
source or to a count performed against the repository. An ambiguous count is worse than an
absent one on a page that represents a real community.

## ADR-012 — The information desk must refuse rather than approximate

**Context.** A private question ("What was the Fon's private medical diagnosis?") was
answered with the public health-facilities statistic. One strong keyword inside a long
question about something else cleared the score threshold.

**Decision.** `ask()` now also requires coverage: for a question of four or more content
words, the matched entry must account for at least half of them. Score alone ranks; coverage
decides whether anything is said at all. There is no model behind this route, so a wrong
match cannot be smoothed over by generation — it is simply a wrong answer, and refusing is
the correct output.

## ADR-013 — A card may carry archive photography, but never as evidence

**Context.** Thirty-three of the thirty-nine Village Square records carry no photograph of
their own. On the homepage card grid that produced three beige plates carrying the word
"Guneku" beside one real photograph — read by the Product Owner as an unfinished page.
The obvious fix, dropping any photograph into the empty slot, is the same defect the image
pipeline spec already recorded once: a 2016 coronation crowd standing in as the card image
for an August 2026 MEFU-MECUDA meeting. A photograph placed above a headline is read as
coverage of that headline.

**Decision.** Village Square cards without their own photograph now carry a photograph from
the Guneku archive under three constraints, none of which is optional:

1. **Topic-matched.** Six curated pools — palace, culture, diaspora, education, projects,
   village — selected by keyword rules over the record's slug and title. A road record gets
   road work; a scholarship record gets the community library. The image is contextually
   truthful even though it is not documentary.
2. **Deterministic, never random.** The pool index is FNV-1a over the slug. The same record
   resolves to the same photograph on the server, on the client, and across every future
   build. A per-render `Math.random()` would flicker under hydration and would silently
   rewrite the site's visual record on each deploy.
3. **Labelled, and decorative to assistive technology.** Every fallback card carries a
   visible "Archive photo" mark and empty `alt`, with the provenance sentence in `title`.
   Nothing on the card asserts that the photograph shows the event.

The article page is unchanged: `EditorialLead` continues to state plainly that the archive
holds no photograph for the record (the institutional plate). The card is a wayfinding
surface; the article is the record. They are allowed to differ, and the labelling is what
keeps the difference honest.

**Rejected.** Unlabelled topic-matched photography (indistinguishable from coverage);
generated pattern cards (no editorial risk, but the Product Owner asked for photographs);
leaving the plates (the reason this was raised).

**Consequence.** `/public/images/fallback/` is now a governed asset set: 27 files, 720×450,
cropped from photographs already published on the site or in the public galleries. Adding a
record's real photograph to its JSON automatically retires its fallback — no code change.

## ADR-014 — Seed the directory from the record, but a stub is not a profile

**Context.** `/indigenes` opened empty for every visitor. An empty "register here" form
converts badly; a page that already carries your name converts well. The Fondom's own
records name people — the GUDECA EU minutes of 28 March 2026 name eight, and the
`gudeca-eu` group names three more — so the directory can open with eleven entries
instead of nothing.

**Decision.** Seeded entries are published, and are constrained to four fields:
display name, role, chapter, and the source the name came from. `CardSafe` in
`src/lib/community.ts` is that constraint in the type system — a stub component cannot
render anything else, and widening it is a publication decision, not a refactor.
Everything further — photograph, city, employer, contact, biography — arrives only from
the person, after they claim the entry.

Every stub carries two actions, and both are load-bearing: **claim**, which hands the
entry to its owner, and **not me / take it down**, which removes it. A directory that
publishes a name the person did not personally submit must make leaving as easy as
joining; `founding-names.json` records that the removal route is not to be taken out.

**Consent position, stated plainly.** Eight of the eleven names come from minutes
circulated to the membership. Three — Armstrong Tinyih, Don Df Festoire, Forbang Noel —
come only from the GUDECA EU WhatsApp group. `05-member-profiles.md` (the build spec)
would hold those three as unlisted invitations on the ground that a private group is not
a publication. The Product Owner, as data controller, directed on 2026-09-03 that all
eleven be published now. That instruction is recorded here with the objection route
(`/indigenes/submit?intent=remove`) as the mitigation, and R-019 tracks it.

**Rejected.** Publishing a full profile per seeded name (invents facts about people);
holding the whole list until each person replies (the directory stays empty, which is
the problem being solved).

## ADR-015 — One register for every chapter, home and diaspora on the same terms

**Context.** `/gudeca` said the Germany chapter was "Essen — Ruhr Valley"; `/diaspora`
said "Essen / Ruhr". Two hand-kept lists, the same error twice: GUDECA Europe meets in
**Bonn**, where the Fon lives, and the 28 March 2026 meeting was held at the Fon's Palace
there. Separately, Thadeus Fon — General President, home-based — was being counted as a
diaspora member because he addressed that meeting.

**Decision.** `src/data/community/chapters.json` is the single register. `/diaspora`,
`/gudeca` and `/gudeca/chapters/[id]` all read from it, so a chapter fact is corrected
once. Home chapters carry the same register, the same "Add a name" and the same claim
route as chapters abroad — a son of Guneku in Douala is a member on the same terms as one
in Bonn, and the site should not imply otherwise. Thadeus Fon is listed with Douala.

**Consequence.** The Essen correction is scoped to the two chapter listings. Marcel Tabit
Akwe's own profile, the contact page, and the 2023 reception gallery still say Essen —
that reception genuinely took place in Essen and is a record, not a chapter fact.

## ADR-016 — A name enters the public directory through a person, not an endpoint

**Context.** Claim, add-a-name and take-it-down all needed a way in. The directory is
Neon + Drizzle + Clerk, one profile per signed-in user; a seed-and-claim system in the
database means nullable `clerk_user_id`, tier and claim-token columns, and a migration
against production.

**Decision.** Ship the motion without the migration. `POST /api/community/register`
takes all three intents, validates, and sends the request to the Palace by email
(`sendDirectorySubmission`, the same Resend path the contact and support forms use).
Nothing is written to the database and nothing is auto-published: a person's name entering
— or leaving — a public directory is decided by a human. The chapter and entry are
resolved from our own data rather than trusted from the client, so a crafted query string
cannot put invented text in the Palace's inbox, and a honeypot field absorbs bots.

Token-based auto-binding remains the right end state and is recorded as backlog, not built:
it is a material architecture change and needs its own authorisation.

## ADR-017 — A chapter is not a city

**Context.** The Germany chapter was recorded as "Essen — Ruhr Valley", corrected to
"Bonn", and was still wrong. GUDECA EU is **one chapter for the whole of Europe** with no
fixed seat; meetings rotate between the countries where members live. Bonn is the official
residence of H.R.H. the Fon — the 28 March 2026 meeting was held there because that is
where the Fon lives, not because the chapter sits there. The error survived one correction
because the data model invited it: a chapter had a `city` field, so somebody always filled
it with a city.

**Decision.** The register distinguishes two kinds. A **chapter** is a constituted GUDECA
body that keeps a register of its own. A **location** is a country or city where Guneku
people live, and may sit under a chapter via `partOf`. A chapter carries `place` — free
text — so a body that moves can say "Meetings rotate across Europe" instead of naming a
city that is not its seat. Germany, Belgium, the UK, Italy and Sweden are now locations
under `gudeca-europe`; their names are recorded in that chapter's register, and their cards
point at the chapter rather than claiming a count of their own.

**Consequence.** The mistake is now hard to repeat: there is no city field on a chapter to
fill in wrongly. `placeLabel()` writes a chapter's place in prose, so a rotating chapter
never renders as a city anywhere on the site.

## ADR-018 — Attendance in the minutes is not membership

**Context.** Fonjong was seeded into the EU chapter because the Bonn minutes name him
delivering a goodwill message, titled by the Fons of Meta. He attended the event; he is
not a GUDECA member. Confirmed by the Product Owner on 2026-09-03.

**Decision.** His entry is removed, and the reason is written into
`founding-names.json` under `meta.removed` so that a future pass over the same minutes does
not re-add him. The file also now carries `meta.membership_rule` stating the general form of
the error: guests, dignitaries and speakers appear in minutes, and a record naming a person
is evidence they were present, not evidence they are a member.

**Also decided.** Marcel Tabit Akwe is added to the EU chapter at his own request
(`source: self-declared`). Where a seeded person already has a published profile on this
site, the stub may carry a link to it — `profileUrl`, the only field added to `CardSafe`
since ADR-014 — but restates nothing from it. The two stay separate records until the entry
is claimed.

## ADR-019 — A body is not a place, and the governing body gets a register of its own

**Context.** The Traditional Council existed on the site as prose inside one palace
article. It is the governing body of Guneku — His Royal Highness is the king, and these
are the people through whom the village is governed — and it was less visible than a
photo gallery. The same was true of the GUDECA national executive (twelve officers,
recovered from a migrated record), the EU executive, the festival committee and the
Palace household.

**Decision.** `bodies.json` records the office-holding bodies; `chapters.json` records
places. A person carries `body`, `chapter`, both or neither — Thadeus Fon is General
President of GUDECA *and* a member of the Douala chapter, and forcing that into one field
is what produced the Essen/Bonn error a level up (ADR-017). `/people` indexes the bodies,
`/people/[body]` publishes each roster, and the governing body carries a card on the
front page.

Two rules the code enforces:

- **Office order, never alphabetical.** `membersOf` preserves the register's order. A
  roster sorted A–Z puts the Chairman wherever his initial falls and stops being a roster.
- **Every roster states the year it describes**, in the reader's line of sight. The
  council record is from 2021 and a council changes; the national EXCO is undated and says
  so. The date is the reader's warning, so it is not buried.

Claiming works exactly as it does for the indigenes seeds — one form, one route, one
inbox. The office stays as the record has it; everything else is the person's to write.

## ADR-020 — The dead are recorded, and never invited to claim

**Context.** The register carries people who have died: Mama Ngum Fomuki, mother of the
late Fon, and Akwe Thadeus Acho. A "This is me — claim it" button under either name would
be grotesque.

**Decision.** `deceased: true` removes the claim action and the "not me" link, on the card
and on the entry page, and replaces them with a line stating that the entry is kept as a
record and a route for the family to write to the Palace. The entry itself stays: the
record of a Fondom includes those who are gone. `founding-names.json` carries the rule so
it is not undone by a later editor adding a field.

**Also decided.** A family relationship stated privately to a maintainer is not published.
Where a relationship belongs on the site it comes from the Palace record or from the person
themselves — recorded as `relationship_rule` in the data file.

## ADR-021 — Three records merged into one man, on the balance of the evidence

**Context.** "Ni Sam" is Digital Lead of GUDECA EU in the roster and coordinator of the
2027 meeting in the United Kingdom. "Sam Fongoh" is a member in the WhatsApp group. "Sam
Fongho — Property Auction Expert, UK" is in the legacy Sons & Daughters listing. Three
records, one plausible man.

**Decision.** Merged into `sam-fongoh`, with the other two as aliases and the reasoning in
the record's own note, on the Product Owner's instruction to match names intelligently. The
UK coordination and the UK listing are what tip it. The note says plainly that if these are
not the same man the record splits again — the merge is reversible in one edit, and a wrong
merge is visible to the man himself the moment he sees the page.

The reverse call was made for Amamuki Jonathan and Mbakwa Jonathan, who share a forename
only: they stay two people, and each record says so.

## ADR-022 — One rate limiter for every form route, with a cross-route ceiling

**Context.** Four public forms — contact, the Palace message, the support offer and a
directory submission — all deliver to the same Palace inbox. Two carried a copy-pasted
in-memory limiter; `/api/contact` and `/api/community/register` carried none. Limiting each
route independently misses the actual risk: a sender stopped on one form moves to the next.

**Decision.** `src/lib/rate-limit.ts` is the single limiter, `server-only`, no dependency.
Two buckets per sender: 5 in 10 minutes on any one route, and 12 in 10 minutes across all
four together. The check runs before any other work, so a refused request costs nothing,
and both buckets are recorded on every call — a request refused by its route still counts
against the sender's overall budget.

**Honestly stated.** The counter is in memory and per-instance: it resets on redeploy and a
serverless fleet keeps one per instance. This blunts casual abuse; it does not defeat a
distributed flood. That is the deliberate trade — a village website should not make an
ordinary sender solve a CAPTCHA, and the map is bounded so the limiter cannot itself become
the denial of service it exists to prevent. If the inbox is ever actually flooded, this is
the component to replace, not to tune.

## ADR-023 — A form route tells the visitor one fixed thing and tells us everything

**Context.** All four form routes returned `(err as Error).message` to the client. The
mailer path was safe by accident rather than by design: `send.ts` sanitises its own Resend
failures before throwing, so only its human message reached the browser. Anything else did
not. Malformed JSON returned the parser's internal text verbatim from all four routes.

An earlier note in this session recorded the problem as `/api/contact` only, with the three
newer routes described as safe. That was wrong, and testing all four is what showed it.

**Decision.** Every form route now logs the real error server-side and returns one fixed
sentence. The visitor gets something useful and constant; we keep the whole cause in the
Vercel log. `R-020` records the same defect still standing in the indigenes routes, which
are database-backed and were outside this change.

## ADR-024 — Remove next-auth rather than carry three criticals for an unused package

**Context.** `npm audit` on the upgraded tree reported 18 advisories including three
critical, all from `next-auth@5.0.0-beta.31` and `@auth/pg-adapter`. Neither is imported
anywhere in `src/` or `middleware.ts`; `next-auth` was a beta that never got wired up. The
project's intended provider is Clerk, which is not installed either (R-022).

**Decision.** Both packages were removed. Advisories fell from 18 to 15 and **every
critical disappeared**; the build still produces the same 188 static pages, which is the
proof that nothing depended on them. Removing dead weight is the right move in a phase
whose purpose is a safety baseline — carrying a critical CVE for code that never runs is a
worse position than not having the package.

`npm audit fix --force` was **not** run. The remaining 15 are transitive (sharp/libvips,
undici, browserslist, js-yaml, brace-expansion, and dev-only esbuild paths), and forcing
breaking changes across them inside a framework upgrade would make a failure impossible to
attribute. They are a separate, deliberate pass.

## ADR-025 — Pin the framework exactly, and take 16.3.3 rather than latest

**Context.** `npm install next@16.3.3` rewrote the manifest to `^16.3.3`. The repository's
prior convention pinned `next` exactly (`16.2.3`). npm's `latest` tag is now `16.3.4`.

**Decision.** Both `next` and `eslint-config-next` are pinned to exactly `16.3.3`, the
version the owner named. A caret range would let a future `npm install` drift the framework
silently, which is precisely what a controlled upgrade phase exists to prevent. That
`16.3.4` exists is reported rather than taken unilaterally: moving further is the owner's
call, not a detail to slip into an upgrade he specified to the patch.

## ADR-026 — ClerkProvider is scoped to three subtrees, not mounted at the root

**Context.** Clerk's documented setup wraps the root layout. Guneku's root layout renders 188
public pages that are a village record anyone may read without an account.

**Decision.** The provider lives in `src/components/auth/ClerkScope.tsx` and is mounted only
by `/my-guneku`, `/sign-in` and `/sign-up`. `middleware.ts` matches only those paths plus the
personal API routes, so no other request enters Clerk at all.

**Why it matters more than tidiness.** Two things follow that a root provider would not give:

1. **Public reading stays account-free by construction.** It is not a setting someone can
   change without noticing; the public tree has no provider to read a session from.
2. **No Clerk JavaScript reaches a public page.** Verified: `/`, `/projects` and
   `/indigenes` contain zero occurrences of "clerk" in their HTML. Most of this audience
   reads on a mid-range Android over a throttled connection, and they should not download an
   authentication runtime to look at photographs of their village.

Proved by the failure mode too: with no Clerk keys present at all, 19 of 20 public routes
still return 200 and only the protected routes fail. The blast radius of an auth
misconfiguration is three subtrees, not the whole site.

**Cost, stated.** Clerk's `<SignedIn>` / `<SignedOut>` components do not work outside those
subtrees, so public navigation links to `/sign-in` as a plain link. That is the better
behaviour anyway — the public header should not change shape depending on who is reading.

## ADR-027 — What Clerk owns, and what it must never own

**Decision, following the owner's instruction.** Clerk owns identity, session, and one
platform role from `member | contributor | reviewer | palace-admin`, defaulting to `member`
and read from Clerk *public* metadata. Private metadata is never read, so it cannot be
leaked into a payload by accident.

Clerk owns **nothing** about the village. Not a quarter, not a GUDECA chapter, not a body or
office, not a Palace family relationship, not a historical identity, and not the state of a
profile claim. Those are Guneku facts: they live in the reviewed JSON records and in Neon,
where they can be sourced, disputed and corrected. A role is permission to use the software.
It is never a statement about who someone is in Guneku.

Enforced in three places rather than trusted: `requireUser()` takes the id from the session
and no handler reads one from input (verified: zero occurrences of `body.userId` or
equivalent across `src/app/api`); `/api/me` writes through a field allow-list that silently
discards `role` and `clerk_user_id`; and a member's self-declared `quarter` is constrained to
the 27 canonical quarters, so a form cannot invent a place in Guneku.

## ADR-028 — Versioned migrations, and the honest limit of the runner

**Context.** R-025: the one existing table was created by an unversioned
`CREATE TABLE IF NOT EXISTS` script with no record of what any environment had applied.

**Decision.** `src/lib/db/migrations/` holds numbered SQL files, `schema_migrations` records
what has been applied, and `npm run db:migrate` / `npm run db:status` drive it. The original
DDL was recovered from commit `61d5e00` and preserved as `0000_indigene_profiles.sql` so the
history of the live table is not lost. `0001_my_guneku.sql` adds `community_members` and
`follows`. **Neither has been applied anywhere.**

**The limit, stated rather than glossed.** Neon's HTTP driver sends one statement per request
and cannot wrap a file in a transaction, so a failed migration can leave earlier statements
applied. That is survivable *only* because every statement in these files is idempotent, and
the runner's comment says so: a migration that is not idempotent must move to the pooled
driver and a real transaction first. `db:status` changes nothing and exits cleanly when
`DATABASE_URL` is absent.

## ADR-029 - A licensing-safe map that draws only what the record can place

**Context.** R-010: the legacy archive holds a Google Maps screenshot carrying the Google
logo, which cannot be re-hosted. Phase 9 asked for an interactive map on a licensing-safe
stack.

**Decision.** `/explore` uses MapLibre GL JS (BSD-3-Clause) over OpenStreetMap raster tiles
with the required ODbL attribution, and an inline style object rather than a hosted style -
so the page needs **no API key and no third-party style endpoint**, and no new credential.
The Google screenshot is neither ingested nor traced.

**The harder decision was what to draw.** One coordinate exists in the repository (R-029), so
the map carries one marker and the other fourteen places are listed with the reason each has
no position. The alternative - placing pins near where things probably are - was rejected
outright. A village map is read by the people who live in the village; a wrong pin is not an
approximation to them, it is a mistake about their own home.

**Loading, shaped by the audience.** Much of this readership is on a mid-range Android over a
throttled connection, and MapLibre is most of a megabyte. So the list is server-rendered and
complete without JavaScript, and the map is layered on top: dynamically imported so it stays
out of the `/explore` bundle, loaded only when scrolled into view, and **not loaded at all**
under `prefers-reduced-motion` - a panning, animating map is exactly what that preference is
about. Verified: zero `maplibre` references in the HTML of `/`, `/projects`, `/quarters` **or
`/explore`**; the library sits in separate chunks that load on scroll.

A coordinate is also bounds-checked before it is drawn, so a transposed lat/lng or a stray
zero cannot silently place Guneku in the Gulf of Guinea.
