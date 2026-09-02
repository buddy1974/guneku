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
