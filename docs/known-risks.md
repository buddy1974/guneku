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
| R-010 | `_shortlist/guneku-map.jpg` in the legacy archive is a Google Maps screenshot carrying the Google logo. Re-hosting it on the site is a third-party licensing question, not a content question. | Security / Legal | Medium | Certain if used | Not ingested. `/kingdom/map-of-guneku` remains a stub. Use a Google Maps embed with proper attribution, an OpenStreetMap-based render, or a commissioned map. | Marcel | Open |
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
