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
(`/indigenes/submit?intent=remove`) as the mitigation, and R-012 tracks it.

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
