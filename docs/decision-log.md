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

## ADR-030 - Search is an allow-list, and one term missing means no result

**Context.** Phase 7 asked for one deterministic search across the whole record, with
nothing held in the index. The route that existed substring-matched four content types
straight out of the unfiltered content loaders.

**Two decisions worth recording.**

**The index is an allow-list, not a sweep.** Search is the one surface that can expose
anything: a held record that no page links is still exposed the moment a search finds it.
So every source is reached through a named loader and filtered before it is added, and the
searchable text of each entry is assembled field by field - which means a field added to a
record later cannot become searchable by accident. Excluded: `publicVisibility: 'hold'` (the
Business Directory), `noindex: true` (the six empty Kingdom stubs), records with no
`publishedAt` (the loaders do not filter these themselves - the defect R-026 was about),
`pages/gudeca-exco.json` (R-011, fictitious names), `src/data/about/` (R-012), and
`articles-index.json` (would duplicate every update). No phone number, email or private note
enters an entry.

**Every term must land, or the entry is not a result.** A proportional penalty was tried
first and was not enough: "map of guneku" returned 159 rows, because "guneku" alone matches
most of the archive. A query is a sentence the reader means, not a bag of words to be
partially satisfied. With strict coverage it returns one row - the map page. "traditional
council" fell from 30 to 15, and "purple elephant council" correctly returns nothing.

**Also decided:** the site's own eleven main pages are indexed. Without them a reader who
types what they want to *reach* - "map", "photographs", "guneku tv", "donate" - finds records
that mention it and never the page that is it.

Search runs on the server behind a plain GET form, so it works with no JavaScript, a result
page is linkable and shareable, and the back button behaves. No model is involved: the same
query always returns the same results in the same order.

## ADR-031 - Guneku TV: one approval predicate, and a sync that only ever reports

**Context.** Phase 6. Forty-six curated films exist in the record; the YouTube API is
configured in Vercel and called by nothing. The task was a real media hub that does not
depend on the API, and an architecture ready for synchronisation later.

**One predicate.** `approvedFilms()` in `src/lib/guneku-tv.ts` is the only way a film becomes
public. The watch hub, the homepage selection, the search index, the sitemap and the
structured data all go through it. There is deliberately no second path, because the moment
there are two, one of them forgets an exclusion - which is exactly what was found while
building this: the search index had been reading `dbVideos` directly, so a held film would
have vanished from the hub and stayed in search.

Proved end to end rather than asserted. Holding one film in `video-overrides.json` and
rebuilding removed it from `/watch` across all four pages, from the homepage, from the
featured slot, from the category facets, and dropped the search index's Films count from 47
to 46. Restoring it brought all of them back.

**Four states, not a boolean.** `discovered | reviewed | approved | held`. A video appearing
on the channel is not the Fondom asserting something about Guneku's history, and the gap
between those two is where a sync script does real damage - captioning a funeral as a
celebration, surfacing a family's footage, dating an event wrongly. So the strongest verdict
`classify()` can reach is `discovered`, and only a person moves anything past it.

**The sync reports; it never writes.** `missingFromChannel` is reported and never acted on: a
film going private, or one failed page, must not delete part of the Fondom's record. The
archive is not a mirror of YouTube's current state.

**Split for testability.** The pure half - normalisation and classification - lives in
`youtube-normalise.ts` and is deliberately NOT `server-only`, so it can be exercised against a
fixture in a plain script. The half that holds the key is `server-only`. A guard over the
pure logic would have bought no safety, since the key is not in it, and would have made the
part that most needs testing untestable.

## ADR-032 - Categories come from the record, and no film is moved to fill a gap

The brief named six groups: Palace, Culture, Development, GUDECA, Community, Archive. The
record carries nine of its own labels, and they do not map cleanly onto six.

`resolveGroup()` is deterministic and ordered: an explicit override, then GUDECA, then
Palace, then Culture, then an exact Community, then **null**. GUDECA precedes Palace on
purpose - "GUDECA Europe, Bonn 2026" is a chapter's meeting, not a Palace occasion, even
where the Fon attends.

Health, Governance and Education reach the null case: 8 of the 46 films. Nothing was invented
to place them. "Development" would be a claim about what a health documentary is, and
"Archive" would say something false about when it was made. They keep their sourced label,
which is more useful to a reader anyway. **Development and Archive therefore show zero films,
and the page says so** rather than quietly redistributing films to make six full buckets.

No model classifies anything. A misfiled film is a small error; a model deciding a funeral is
a festival is a different kind, and on a village's own record it is not recoverable by an
apology.

## ADR-033 - No iframe until someone asks, and the private id is not printed

**Performance.** Forty-six embedded players would each pull player code and set cookies before
a reader had chosen to watch anything. Most of this audience is on a mid-range Android over a
throttled connection. So a card is a poster frame and a button; the iframe is created in
place, once, for the one film the reader picked. Verified as **zero `<iframe>` in the HTML of
`/watch` and the homepage**. Embeds use `youtube-nocookie.com`, and nothing is requested from
YouTube at all until play is pressed.

**A privacy finding fixed on the way.** The record's held-material note names the private
channel upload by id, and the retired `/gallery/videos` page published that id verbatim.
Printing the identifier of something deliberately not surfaced hands a reader the one thing
the decision meant to withhold. `heldNote()` now redacts any deny-listed id, taking the
surrounding punctuation with it so the sentence still reads. The transparency is kept - "one
video on the channel is private and is deliberately not surfaced" - and the id is not. The
deny list remains the enforcement; redaction only stops it being published.

## ADR-034 - One film library, and the old route redirects

`/gallery/videos` was linked from the header, the gallery landing page, the sitemap and two
legacy Joomla routes. Leaving it beside `/watch` would have created two competing indexable
libraries of the same 46 films. It now 308s to `/watch`, its page is removed, and the sitemap
carries `/watch` in its place. The image gallery under `/gallery/images` is untouched and
verified still serving, including an album page.

`VideoObject` structured data is emitted for the featured film only, from fields actually
known: name, abstract, thumbnail, embedUrl, publisher. **No `uploadDate`, no `duration`, no
`description`** - YouTube knows those and this record does not, and filling them to satisfy a
schema validator would be inventing facts about Guneku.

## ADR-035 - One visibility predicate, asked rather than remembered

**Context.** The architecture record named this as the single most useful hardening left: the
exclusion list - held institutions, noindex stubs, unpublished dated records, the R-011 sample
names, the R-012 dead directory - had been written out by hand in every surface that needed
it, and re-applied from memory at each new phase. Phase 6 then found the predictable result:
the search index read `dbVideos` directly, so a film held in the override file would have
vanished from the watch hub and stayed searchable.

**Decision.** `src/lib/visibility.ts` holds the rules. The search index and the sitemap ask it
instead of restating them, and a new public surface inherits every exclusion by calling one
function rather than recalling seven.

**Conservative, but deliberately not blunt.** "Uncertain means not public" is the rule, and an
early draft applied it by requiring `publishedAt` on everything under `palace/`. That would
have dropped the reigning Fon's own profile page from the sitemap - it carries no publication
date because it is not a dated article. So the predicate is type-aware: a dated article must
be dated; a profile, a register or an institution is judged on its own terms. Being careful
and being strict are not the same thing, and confusing them hides real content.

**Two latent divergences closed on the way.** The sitemap read the raw loaders for updates and
Palace articles with no published check at all - harmless today because every update carries a
date, but exactly the drift the shared predicate exists to remove. And routed institutions are
now handled in one place: included in search, pointed at the page that holds them, and kept
out of the sitemap, rather than each surface deciding again.

**Proved to change nothing.** The sitemap is byte-identical before and after - 108 URLs, zero
added, zero removed - and the search index is unchanged across all nine groups at 270 entries.
A refactor of visibility rules that quietly altered what is visible would be the worst possible
outcome, so the comparison was the point of the exercise rather than a formality.

**Films stay separate.** `approvedFilms()` keeps its own predicate, because a film carries a
lifecycle - discovered, reviewed, approved, held - that no other record has. Neither is a
fallback for the other.

## ADR-036 - Phase 15 cancelled: the owner accepts shared production infrastructure

**Decision, made by Marcel on 2026-09-03 and recorded here at his instruction.** Guneku will
not have an isolated Preview database. Production and Preview stay connected to the same
infrastructure.

**Reason, in his words rather than mine.** Guneku is his personal project; he chose
operational simplicity and direct production execution over the isolation this programme had
been treating as a prerequisite. He understands the risk and accepts it.

**Residual risk, stated plainly so it is not lost in the acceptance.** A preview deployment of
any branch writes to the same database as the live site. Once claims, subscriptions and
contributions exist, a test run and a villager's real submission share one store. A migration
applied against "preview" is applied against production.

**Mitigations that therefore carry more weight than they otherwise would:**

- migrations are versioned, recorded in `schema_migrations`, and additive only
- no destructive migration runs without an explicit owner decision
- every mutation is authenticated and scoped to the session's own user id
- Neon's own restore capability is the backstop
- release testing happens against a local production build before anything reaches main

**Phase 15: CLOSED - owner accepted risk, isolation declined.** R-021's preview-isolation
element is reclassified from open to owner-accepted. This is not to be raised again unless the
owner reopens it.

## ADR-037 - What this release contains, and what it does not

The launch authorised on 2026-09-03 carries the accepted checkpoint at
`5087e5204e003826a633b3b0bb146ad91003b6f9`: Phases 0, 1, 1.5, 2 (code), 6, 7, 9, 10, the
shared visibility predicate, the legacy AI removal, and the R-020 / R-023 / R-026 / R-027
remediations.

It does **not** carry Phases 3, 4, 5, 8, 11, 12, 13 or 14. Those were blocked before a line
of them could be written, and the reason is worth recording precisely rather than as "pending":

**Every secret in this Vercel project is marked Sensitive**, which makes it write-only to the
CLI. `vercel env pull` returns an empty string for each one, in all three environments, and
`.env.local` holds no Clerk keys and an empty `DATABASE_URL`. `npx clerk@latest env pull`
reports `not_linked` and linking requires an interactive browser session.

So there was no way to obtain a database connection or a Clerk session without either
inventing a credential or asking for one to be pasted into a chat transcript. Neither was
acceptable. The phases that need them are written up in full in
`docs/programme-architecture.md` - schema, migrations, routes and rules - so that when a
credential arrives the work is implementation rather than discovery.

**One consequence of shipping Phase 2's code without being able to exercise it:** the Clerk
keys in Vercel were created 132 days ago and are used by nothing. If they are stale,
`/sign-in`, `/sign-up` and `/my-guneku` will fail in production. The public site cannot be
affected - that was proved by running the whole build with no Clerk keys at all, where 38
public routes returned 200 and zero Clerk JavaScript reached any page - so the blast radius
is three routes, two of which are currently placeholder pages. Verified immediately after
deployment, with rollback available if it fails.

## ADR-038 - The people model has independent dimensions, and Notable is not one of them by achievement

**Owner correction, 3 September 2026.** The site had been treating professional prominence as
though it conferred traditional standing. `/notables` read "Sons and daughters of Guneku whose
work is recorded by the Fondom" and showed two cards - a software developer and a professor.
That inverted the meaning of the word.

**A Guneku Notable holds a place in the traditional governance of the village around the Fon.**
It is not a term for a distinguished son or daughter. A career confers nothing traditional,
and appearing in a record as an election official, a witness, a clergyman or a participant
confers nothing either.

**Decision: the dimensions are independent, explicit, and never inferred from one another.**

| Dimension | How it is set |
|---|---|
| `notable` | Explicit in the record. Every Traditional Council member holds it, because that is what the council is. Nothing else derives it. |
| `royalRole` | Explicit. `'queen'` for a Queen of the Palace. |
| `body` / `chapter` | As before. |
| `residence` | A country, where the record establishes one. |
| Diaspora | **Derived, never stored** - a chapter of scope `diaspora`, or a residence outside Cameroon. |
| `profession` | A fact about a person. Never an office, never a reason for standing. |

A person holds several at once. Roland is a Notable *and* GUDECA US *and* diaspora *and* has a
professional profile, and the first of those is not caused by the others. Marcel is GUDECA EU
and diaspora and has a profile, and is **not** a Notable.

## ADR-039 - Diaspora means living outside Cameroon, and is derived from the register

`/diaspora` carried a section headed "Notable Sons & Daughters - Guneku Excellence Worldwide"
containing exactly two hard-coded people. That was wrong twice: diaspora is not a rank, and
presenting two professionals as the worldwide community misrepresented both the word and
everyone it left out.

**Decision.** The page derives its people from the register, so it grows as the record does and
can never again be a curated pair. Seventeen people are recorded outside Cameroon today.

The rule is exactly the owner's: verified residence outside Cameroon, or verified membership of
an overseas GUDECA chapter. **Never** inferred from professional success, from GUDECA National
office, or from Yaoundé, Douala, Bamenda or Mbengwi membership - those are home chapters, and
their members live in Cameroon whatever office they hold. Verified: all five new Yaoundé
members appear zero times on `/diaspora`.

## ADR-040 - Palace household is published as the Royal Family, and the Queens are plural

The body is now "The Royal Family of Guneku", `kind: 'royal'`, across navigation, registers,
headings, cards, metadata and search. The **id stays `palace-household`** so `/people/palace-household`
does not break, and the archive `sourceLabel` "The Palace household and its titles" is left
exactly as written - it names a real document, and this is a change to how the Fondom presents
the body, not a rewriting of its own past records.

**The Queens are plural by design.** The Guneku Palace is a polygamous royal household, so the
page states that and lists Queen Esther Fomuki, Queen Fomuki Carine and Mrs. Fomuki Rebecca
together. **No seniority is expressed** - not first, senior, principal or junior. The record
establishes none, and inventing an order among the Fon's wives would be inventing royal
hierarchy. Verified as zero occurrences of each of those four words.

Queen Esther is added from the Fondom's own information, using `public/esther.png` as supplied.
Her biography is not expanded from the external references the owner mentioned. Mrs. Fomuki
Rebecca is confirmed a Queen, superseding the earlier uncertainty that arose only because the
archive named her in the 2016 council record and nowhere else.

## ADR-041 - Profiles moved to /sons-and-daughters, with redirects

The professional profiles lived at `/notables/[slug]`, which said the thing this correction
exists to stop saying. They now sit at `/sons-and-daughters/[slug]`, with permanent redirects
from the old paths so no existing link, bookmark or citation breaks - including the GUDECA
page, the Afor Foundation record, the navigation and the Njinigom quarter page, all repointed.

Sons and daughters remains a real and valuable idea. It is simply not a synonym for Notable,
and the two are now separate pages that link to each other and explain the difference.

## ADR-042 - The migration runs where the credential is, not the other way round

**Context.** Production's `DATABASE_URL` is marked Sensitive in Vercel, so `vercel env pull`
returns an empty string for it in every environment. The production runtime holds the real
value and uses it successfully - proven when Postgres answered `42P01` rather than a
connection error. So the schema could be created, but not from a developer machine.

**Rejected: reading the secret anyway.** The Sensitive flag is a deliberate control over a
value that is a password. Building something to extract it - a debug route that echoes the
environment, a build step that writes it to a file - would have defeated a security decision
in order to save the owner one click, and would have left that capability in the repository
afterwards.

**Decision.** `POST /api/admin/migrate` applies the pending versioned migrations inside the
production runtime, which already has the credential. The credential never moves.

**What keeps it from being a backdoor:**

- **Inert by default.** With `MIGRATE_TOKEN` unset - how it ships - every request returns 404,
  indistinguishable from a route that does not exist. Not 403: a 403 would confirm it is there.
- **Disabled by unsetting the variable**, with no deploy and no code change. The lifecycle is
  set it, migrate, unset it.
- **It can only apply the files in this repository.** Twelve statements, every one
  `CREATE ... IF NOT EXISTS`, no `DROP`, `TRUNCATE`, `DELETE` or `UPDATE` anywhere, recorded in
  `schema_migrations` so a second run applies nothing. It accepts no SQL from the caller and
  has no parameter that could carry any.
- Constant-time token comparison, rate limited, and it never returns or logs the connection
  string, its host, or the token.

**It should be removed once the schema is settled.** A one-time job does not need a permanent
endpoint, and unsetting the variable is the interim guarantee rather than the final one.

## ADR-043 - A register count is not a population figure

The owner's instruction on `/diaspora`: do not present 17 as the size of the Guneku diaspora.

The page now says how many people are **recorded here so far**, and states plainly that this
is a record of who has been written down rather than a count of the community, which is very
much larger.

Worth recording as a principle and not just a wording fix, because the same trap recurs
across this site: the church count, the school count, the chapter count, the quarter list.
A number that describes the archive will be read as a number that describes Guneku unless the
sentence around it does the work. Publishing "17 people abroad" would have asserted something
about the village that nobody has established, from a figure that only describes a register.

## ADR-044 - The public directory publishes a column list, not a row

`/api/indigenes/all` selected `*` and spread the row into the response. With no profiles in
the table that published nothing; with one profile it would have published `clerk_user_id` -
the identifier the entire authorisation model is built on - and `total_count`, a window column
that belongs to the query rather than to a person.

Nothing could be done with the id. There is no route anywhere that takes a user id as input,
which is exactly the property `requireUser()` exists to preserve. So this was not an exposure
with a consequence; it was an exposure waiting for one.

The fix is a fixed list of public columns plus a mapper that builds the response field by
field. Deliberately **not** `Omit<IndigeneProfile, 'clerk_user_id'>`: an Omit keeps inheriting
every future column by default, so the next private field somebody adds is published unless
they remember. A list means a new column is private until a person decides otherwise. The
default should point towards privacy, not away from it.

## ADR-045 - The navigation reads a cookie, not a session

The member area needed an entry point in the header. The obvious implementations are both
closed here, and for reasons worth writing down before someone reopens them:

- **Clerk's `<SignedIn>` / `<SignedOut>`** need ClerkProvider, which is deliberately scoped to
  the three member subtrees so that Guneku's public pages carry no authentication runtime at
  all. Mounting it globally to decide one word in the navigation would put an SDK on every
  page of a village record anybody may read - on a mid-range Android over a throttled
  connection, for a link most readers never use.
- **Reading the session server-side** means `cookies()` in the root layout, which makes all
  226 pages dynamic and ends the static build.

So `MemberNavLink` reads `__client_uat`, the small non-HttpOnly cookie Clerk maintains for
this purpose. It is a **display hint and nothing else**: it chooses a label, never access.
`/my-guneku` is protected by the middleware and again by the page, so a stale cookie costs a
signed-out visitor one redirect and a missing one costs a member one extra click. Neither can
show anybody another person's anything. `useSyncExternalStore` reads it, so the server render
and the first client render agree and hydration stays honest.

## ADR-046 - An edit that cannot undo is not an edit

`updateProfile` was written as `COALESCE(${value}, column)` for every column. An empty string
arrived as null and COALESCE read null as "leave it alone", so a member could set a field and
change a field but could never remove one: a wrong employer, an old link or a bio they had
thought better of stayed on their public profile permanently.

The SET clause is now built from what the caller actually sent - absent means unchanged, empty
string means remove - which is the distinction the form was always trying to express. Column
names come from two fixed lists in the module and never from the request; `full_name` is set
but never cleared, because the schema says NOT NULL and the database's own rule is the one
that wins.

The property the original COALESCE was protecting is kept: a partial submission still cannot
erase what it did not mention.

## ADR-047 - A claim is a request, and the database cannot reach the record

The people of Guneku live in reviewed JSON: sourced, public, and edited by a person. The claim
workflow lives in Neon. The two are connected by one TEXT column holding a slug, and by
nothing else - no foreign key, no copied name, no cached office, no mirrored biography.

That is the whole safety property of this phase, and it is structural rather than careful.
`src/lib/db/claims.ts` issues eight statements and every one of them names `profile_claims`;
there is no code path from a claim decision to a person's record because no such path exists
to be taken by mistake. A test asserts it over every statement the module can issue.

An approved claim therefore establishes exactly one fact - *this authenticated member has been
reviewed and associated with this record* - and the approved row is that fact. There is no
second "ownership" table, because a second table would be the same fact stored twice and two
places for it to disagree.

## ADR-048 - Deceased is read, never inferred, and checked four times

A record marked `deceased` is never claimable. The flag has been on the register since it was
written and the entry page has never offered a claim action for one; this phase adds the same
refusal in `claimEligibility`, in the claim page, in `POST /api/claims`, and once more in the
reviewer queue for a record marked deceased *after* a request was made.

Four checks for one rule is not redundancy, it is the shape of the risk. A page that does not
render a button is not a rule - anyone can type a URL - and offering to claim the identity of
someone's dead father because a queue was built ten minutes ago is not a bug anyone wants to
explain. Nothing is inferred from a date, a photograph, a wording or an absence.

`claimable: false` is the second lever, and it exists so the Palace can withhold a record for
a reason other than death by recording it in the data. `deceased` is checked first and cannot
be overridden by it.

## ADR-049 - Holding the reviewer role is not permission to decide your own case

`requireRole('reviewer')` gates approval and rejection, and `member` and `contributor` are
refused by it. That is necessary and not sufficient: a reviewer is also a son or daughter of
Guneku and may perfectly well have a claim of their own waiting in the queue.

So the route checks, separately and explicitly, that the reviewer is not the claimant. The
button is also absent in the UI, which is a courtesy - the check that matters compares the
claim's `clerk_user_id` against the Clerk session server-side, and would refuse the request
whatever the browser sent.

The concurrency control is in the SQL rather than in TypeScript for the same reason: both
`withdrawOwnClaim` and `decideClaim` carry `AND status = 'pending'` in the UPDATE, so two
reviewers pressing approve in the same second both pass a read-then-write check and only one
passes the statement. The loser updates no rows, gets null, and is told the claim has already
been decided.

## ADR-050 - Stay Connected needed no migration, because 0001 already described it

The `follows` table was written in migration 0001 with a constrained `subject_type`, a free
`subject_id` and a UNIQUE across (member, type, id). Phase 4 needed a member-controlled set of
subscriptions with exactly-once semantics, and that is what was already there.

So the eight topics are `('topic', <id>)` and My quarter is `('quarter', <their quarter>)`,
and no schema changed. Worth recording because the temptation was real: a `subscriptions`
table with a `topic` column would have looked tidier and would have been a second way to say
the same thing, with its own constraint to keep in step and its own migration to apply against
a production database that is not reachable from here without an endpoint that should not
exist.

`subject_type` 'project' and 'event' are deliberately left unused. They are for following one
specific project or one specific event later; the *categories* "Projects" and "Events" are
topics. Storing both in the same value would make "following Projects" and "following the
water project" indistinguishable in the same column.

## ADR-051 - A closed taxonomy, and two topics with nowhere to point

What a member may follow is a fixed list of nine choices, validated server-side. An arbitrary
string must never become a subscription: it would let a caller invent parts of village life
that do not exist, and fill the table with targets nobody can ever publish to.

Culture and Events are on the list and have **no route**, because Guneku has no page for
either. The alternative was to invent `/culture` and `/events` so every row could render a
link - publishing two routes to nothing in order to make a component tidier. The type carries
`route: string | null` and the UI simply omits the link. A member can still say they want to
hear about culture; the Fondom simply has not written that page yet.

## ADR-052 - Following is not consent to be emailed

This phase establishes preferences and sends nothing. Nothing in the follow path imports the
mailer, and a test asserts it by reading the route's own source - a route that *could* send is
a route that eventually will.

The UI is worded to match what is true: "choose what you want to hear about", not "email me
about". No channel, no frequency, no digest, no unsubscribe - because none of those exist, and
offering them would be promising a delivery the Fondom has not built and claiming a consent
nobody has given. When Guneku can actually send something, it arrives with its own controls.

The honest consequence, stated rather than hidden: the follows table currently records wishes
that nothing acts on. That is the correct state for a village record that has not yet decided
how it wants to speak to people.

## ADR-053 - Structural completeness is encouraged; factual fabrication is prohibited

Written down as a standing rule because it governs more than one page and will govern more
still.

Guneku must not hide a known institution merely because its record is incomplete. The four
cases, and what each requires:

- **known fact** - publish it accurately
- **known body, quarter, chapter or category with an incomplete record** - represent its
  proper structure, publish what is known, visibly identify what is missing, and provide a
  route by which it can be completed
- **unknown person, office or historical fact** - never invent. No plausible name, no "TBC"
  that reads as a person, no office inferred from proximity
- **owner-supplied correction or assignment** - authoritative current Guneku content, unless
  the owner explicitly marks it tentative

The failure mode this exists to prevent is subtle: a site that omits what it cannot complete
looks tidy and lies by omission, and a site that completes what it does not know looks
authoritative and lies outright. The third option - showing the structure and naming the gap -
looks unfinished, and is the only honest one.

## ADR-054 - The 27 quarter councils, and the discrepancy underneath them

Every quarter of Guneku holds a traditional council. The 2021 election reports establish it:
the Fon called elections, the commission toured the village, councillors were installed in the
Palace. The councils exist as a matter of record.

The archive names members for **one** of the twenty-seven. So each quarter page now carries the
council as a structure, names whoever the register actually names - in the register's own
words, quoted rather than paraphrased into an office - and where it is silent says so and
offers the contribution route. Attachment is by whole-word match of the canonical quarter name
in the record's own `role` string, and nothing is inferred from residence, profession or body
membership.

**A discrepancy is surfaced and deliberately not resolved.** The register names quarter
office-holders for places absent from the canonical twenty-seven - Njinebai, for one - and the
2021 reports name many more: Toh, Nyeh, Tuengyie, Benjoh, Njizam, Sang, Kimbot, Wunmenyeh,
Tonmitoh, Bighebomi, Mbengtibat. Two Fondom sources disagree about what the quarters of Guneku
are called.

It is not this code's place to decide that a quarter the archive names does not exist, nor to
add names to a canonical list that carries a "do not change without a Palace source"
instruction. `councilNamesOutsideCanonicalQuarters()` reports them, nothing public consumes it,
and the question goes to the owner. This is exactly the class of question the contribution
system was built to answer.

## ADR-055 - Photographs are described, not uploaded

`photo-archive` is a contribution type. A file input is not.

Guneku's blob store is written with `access: 'public'`: a file put there is served from the
Fondom's own hosting the moment it exists, before any person has looked at it. A contribution
is private while pending, and an upload that is public on arrival cannot be. The two cannot
both be true, and the one that must give way is the upload.

So a contributor describes what they hold - what it shows, roughly when, who is in it - and
the Palace comes back to them about how to send it. Slower, and the only version in which
"nothing is published until a person has reviewed it" is actually true.

This is not a permanent refusal of media contributions. It is a refusal to ship one before
there is a private store to put it in, which is its own piece of work.

## ADR-056 - The projects register publishes no financial figure, and no empty one either

`current-notices.json → development` contains no financial field. Not an empty one - none at
all, on any of the twenty-eight entries. No target, raised, spent, balance or donor total.

The brief for this phase listed those fields among the ones to normalise "where supported by
current records". Nothing supports them, so nothing is published - and, importantly, no empty
row is published either.

That second half is the decision worth recording. A row reading "Amount raised: information
awaiting update" looks like scrupulous honesty and is not: it asserts that Guneku keeps
project accounts, that this figure is one of them, and that it is merely stale. None of that
has been established. The same reasoning retires the progress bar, the completion percentage
and the location row.

The five absences are stated once, at register level, in `NOT_RECORDED` - naming exactly what
is not held and saying plainly that none of it is calculated. Naming a gap once is honest;
manufacturing it on every card is a different claim wearing the same clothes.

## ADR-057 - A project is addressed by its anchor, because it must not have two identities

Twenty-seven of the twenty-eight register entries already link to a canonical record - an
institution page, an update, a gallery album. Creating `/projects/<slug>` for each would give
those projects a second URL, a second title and a second thing for search to index: two
identities for one project, which is the failure a register exists to prevent.

So there is no per-project page. Each entry has a stable anchor on `/projects`, and a
contribution about it targets `/projects#<slug>` - validated against the register, so a
browser cannot invent a project. It is the only `page` target that becomes a link anywhere in
the contribution system, and only because it is the only one checked against a canonical
record rather than accepted from a request.

The one entry with no record of its own now resolves in search to its anchor rather than to
the top of a twenty-eight entry page.

Noted while doing this, not introduced by it: a few names appear in both the Projects and
Institutions groups of the search index, with different hrefs - an institution indexed as an
institution and again as a line in the development register. That is arguably correct and is
left alone; it is not a duplicate *project* identity, since the register entry still points at
the record the register names.

## ADR-058 - The register's status vocabulary is kept, not replaced

The phase brief suggested planned / active / paused / completed. The register already uses
Active, Ongoing, Proposed, Historical, Open issue and Documented - six values the sources
establish, carried from the records rather than derived.

Replacing them would mean re-deriving each entry's status from a vocabulary the sources do not
use, and every mapping would be an inference: is "Documented" completed or active? Is
"Historical" paused? The honest answer is that the sources say what they say, and a status is
one of the easiest things to quietly get wrong.

The vocabulary is therefore published as it stands, counted from the register so the page can
never claim a distribution the data does not have.

## ADR-059 - The maintainer's note is not published; a public statement is written instead

The development register's `sourceNote` is written for whoever maintains it. Publishing it put
"this repository" and "classVocabulary" in front of villagers, and had already put a
repository file path on a public page.

Two ways to fix that, and only one is right. Rewriting the note in the canonical record so it
reads well in public would edit a source record to suit a presentation decision - exactly
backwards, and exactly what every other part of this system forbids. So the note stays as it
is, and is no longer published; `REGISTER_STATEMENT` carries the same meaning in the Fondom's
own register.

The review date is still read from the record, because it is a fact about the record rather
than prose about it.

## ADR-060 - Correspondence is not Contributions, and palace-admin is not reviewer

Two separations, both deliberate.

**The tables are separate** because the things are. A contribution says "the public Guneku
record should be changed" and is reviewed against the register. A letter says "I want to speak
to the Palace about something" and is answered. Merging them would drop private family matters
into a queue whose whole purpose is editing public content.

**The roles are separate** because the authority is. `reviewer` exists to decide claims and
contributions - questions about what the record should say. Answering a villager's private
letter is speaking *for the Palace*, and being trusted to check a register implies nothing
about that. `/review/correspondence` and every action behind it require `palace-admin`; a
reviewer gets the same 403 a member does.

The queue lives under `/review` only because that namespace is already matched by the
middleware. It deliberately does not live under `/palace`, which is public content served by
`/palace/[slug]` - a protected page there would collide with an article route and pull Clerk
onto every public Palace page.

## ADR-061 - The email is what the visitor's success depends on

`/api/palace-message` has been the Fondom's working contact channel for some time. Putting a
database behind it must not create a new way for it to fail.

So the order is: validate, send, then record. If Resend accepts the message the Palace has it,
and a recording failure - an unreachable database, a migration not yet applied - is logged and
swallowed. A villager who has already been heard must never be told their message failed
because a table was missing.

The corollary is that correspondence storage is best-effort and may be incomplete relative to
the inbox. That is the right trade: the inbox is the guarantee, the table is the improvement.

## ADR-062 - Nothing composes a reply

The Palace queue has no suggested response, no template that fills the box, and no text
generated on a status change. An empty reply is refused rather than helpfully completed, and a
"note" action deliberately does not advance the letter's status - jotting something down is
not a decision.

No reply is signed with a name, and none is ever attributed to the Fon. A response goes out as
the Guneku Palace; where the person writing wants to identify themselves they do it in their
own words, inside the text they wrote.

This is the same boundary Phase 4 drew around notifications, in a place where it would be far
easier to cross: a system that can write to villagers on the Palace's behalf is one bad default
away from doing it without a person.
