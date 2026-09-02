# CLAUDE CODE — EXECUTION BRIEF  (Rev. 2, aligned to Rev. 4)
**Guneku.org · September 2026 · content, media repair and approved changeset**
Repo: `C:\Users\loneb\Documents\ai-software-dev\projects\guneku` · GitHub `buddy1974/guneku` · Production `https://www.guneku.org`

> **This brief supersedes Rev. 1 entirely.** Rev. 1 was written before the canonical-repo
> reconciliation and told you to rediscover things Rev. 4 has already settled. If you are
> holding a copy that opens with a repo-discovery audit, discard it.

## 0.0 Governance — this brief does not override it

`CLAUDE.md` governs this repository under the AI Operating System. Run the required
startup procedure: read `MASTER-AI-OPERATING-SYSTEM.md`, run repository preflight,
confirm repository name / owner / lifecycle stage / class / current task, read the
`docs/` set. This brief is the **current task's content input**, not a licence to skip
preflight. Human approval is required before material changes and before deployment.

Under the memory rule — chat history is not a source of truth — durable facts from this
work go into `decision-log.md` (succession correction, contact number of record, the
`/projects` divergence fix, the portrait choice), `known-risks.md` (unconfirmed portrait
subject, OCR'd certificate number, held media), and `change-log.md` as phases land.

## 0.1 Read these, in this order

1. **`GUNEKU-FRESH-CONTENT-RECONCILIATION-2026-09.md` — Rev. 4, REPO RECONCILIATION: COMPLETE.** The authority. Where this brief and Rev. 4 disagree, **Rev. 4 wins.**
2. `GUNEKU-LEGACY-ASSET-MERGE-2026-09.md` — the external legacy archive, mapped. **Supplementary source only** (§3 below).
3. `guneku-legacy-archive-inventory.csv` — every external-archive file with dimensions.

## 1. What this is, and what it is not

An **upgrade to a running production site** you already deployed a facelift on. A
**content, media-wiring and factual-correction pass**. Not a rebuild, not an IA change,
not a redesign, not a CMS or data-layer project.

**Do not:**
- restructure routes, change the stack, or introduce a database
- redesign anything — the institutional 2026 direction (warm beige/ivory, deep Guneku
  green, restrained gold/ochre, ~3 principal colours, no gradients, no glow, no
  glassmorphism) is decided and shipped. Match it.
- reopen settled facts: **~15,000 people · 27 quarters · largest Meta clan village by
  area · MENEMO · Mbengwi Subdivision, Momo Division, North West Region, Cameroon**
- invent any fact about Guneku. No source → `[VERIFY]`, and move on.
- break a live URL. Every removal gets a redirect.
- re-audit what Rev. 4 settled (§2).

## 2. Settled by Rev. 4 — do not rediscover

Where content lives · the location of all 338 gallery assets · Fondom Studios' status ·
migration completeness · the contact-number provenance · the §3 missing/present
classifications. These are closed. Read them in Rev. 4 and act.

## 3. The 338 gallery images — canonical repo first

Rev. 4 established, in the canonical repo:

- **all 338 gallery images already exist in the repo**
- **38** are at their declared public paths
- **299** are under repo-root `images/eventgallery/`
- **1** is under `images/blog/`
- **the gallery components hard-code `ImagePlaceholder` and never consume the image paths**

**So the defect is component wiring, not missing files.** That is the whole of the
gallery problem.

**Do not ingest duplicate copies of these 338 from the external archive.** Use the
canonical repo copies.

The external archive at `C:\Users\loneb\Documents\KUNDEN-OBERDORF\guneku` is a
**supplementary legacy production archive**. It may supply: higher-resolution
replacements, missing portraits, the map, additional historic media, and assets not
already present. Before copying **any** file from it, compare hash and resolution
against the canonical repo, and **prefer the existing canonical asset** unless the
legacy file is a justified higher-quality replacement or genuinely absent. The archive
is read-only — never write into it.

**Also in the canonical repo, unindexed:** roughly **180 additional photographs and 14
MP4 files** under `public/images/gallery/`. **Do not delete them** in this pass. **Do
not newly link held material. Do not guess identities.** Nine Bonn-related media items
remain **HOLD** for new surfacing.

## 4. Phase A — governance + implementation preflight  *(read-only, short)*

Not a discovery audit. Rev. 4 did that.

1. Run the `CLAUDE.md` governance startup procedure.
2. Confirm the working tree is clean and current with `origin`.
3. Read Rev. 4.
4. **Verify that the specific paths this brief names still exist** —
   `src/data/pages/gudeca-exco2.json`, `src/data/pages/gudeca-exco.json`,
   `src/data/institutions/fondom-studios.json`, `src/data/current-notices.json`,
   `images/eventgallery/`, `images/blog/`, `public/images/gallery/`.
5. **Report any material change since Rev. 4** — moved files, new commits touching these
   paths, anything that invalidates a Rev. 4 finding.

Report, then await approval. Write no code in Phase A.

## 5. Phase B — media repair and deduplicated ingest

1. **Fix the gallery component wiring.** Replace the hard-coded `ImagePlaceholder` with
   consumption of the real image paths. This is the single highest-value change in the
   whole pass: 338 photographs are sitting in the repo and rendering as empty boxes.
2. **Resolve the path split** — 299 under `images/eventgallery/`, 1 under
   `images/blog/`, 38 at declared paths. The requirement is the **smallest
   production-safe change that makes the canonical 338 assets actually servable and
   renderable in Next.js**. If repo-root `images/eventgallery/` cannot be served by the
   current application, **moving or copying the needed assets into the existing public
   asset convention is acceptable**. Preserve filenames and mappings where practical,
   but **serving correctness wins**. Do not create duplicate logical records or
   duplicate album data.
3. **Only then**, ingest from the external archive, deduplicated by hash and resolution
   against the canonical repo. Strip all EXIF, GPS especially. Reject for hero and card
   use anything under 800px on the long edge or carrying the **"SHOT ON A56 itel DUAL
   CAMERA"** watermark — keep those flagged `documentary: true`.
4. Generate the site's existing variant set and follow its existing naming convention.
   **Do not invent a new one.**
5. Emit a manifest: source, sha256, dimensions, target, album or page, alt text,
   `documentary`, `consent`, and — for anything from the external archive — the reason
   it beat the canonical copy.

**Alt text is not optional and never a filename.** Write what the picture shows.

## 6. Phase C — gallery albums

Rev. 4 established that **the canonical repo already defines all 15 published albums**
and that **all 338 assets exist**. Wire the 15 to those assets using the existing gallery
data structure; **do not create a second one**.

**The canonical repo wins over archive ambiguity.**

- **Preserve all 15 canonical albums as the repo already defines them.**
- **Do not delete, recreate, rename or suppress an existing canonical album** because
  the external archive mapping is unclear. That includes **`Mɨchi Əbeŋ 2023` (39)** and
  **`GUDECA Worldwide` (11)** — the ambiguity is in the external archive, not in the
  repo, and it is not a reason to touch a canonical album.
- Use the external archive only for **supplementary matching, higher-resolution
  replacements, or corroboration**.
- If external filenames cannot be confidently matched to either of those two albums,
  **leave the canonical album mapping untouched** and note it in the manifest.

Where a count differs from the published figure, publish what exists and note the delta
in the manifest — do not pad or trim. Album covers: widest, best-lit frame with faces,
recorded in the manifest so a swap needs no code change.

## 7. Phase D — approved portraits and key singles

**The reigning Fon's portrait** — `/palace/fon-walters-profile`. Note Rev. 4's finding
that the placeholder is **first a component wiring defect**; fix the wiring, then set
the asset.
- **Approved for this pass:** `_shortlist/fon-standing-regalia-usa-2023.jpg`
  (2048×2048, GUDECA-US 2023), cropped to portrait. Provenance known — that event is
  already published on the site.
- **HOLD:** `_shortlist/fon-portrait-formal.jpg` — better photograph, 646×960, but the
  **subject is unconfirmed**; it may be the late Fon Fomuki Patrick Nji rather than the
  reigning Fon Fomuki Walters Ticha IX. Marcel decides. Wrong Fon on the reigning Fon's
  page is not a small error.

**Prof. Dr. Roland Teboh Forbang** — keep the portrait candidate, but the current
placeholder is **first a wiring defect** per Rev. 4. Fix the wiring first; the 380×380
asset is avatar-grade only, never a hero.

**Other singles:** the Guneku map (the site has none), `fah-elvis-tayong.jpg` (Agro CIG
Delegate, who also holds the **Ngam-Fon** title), palace grounds, elders in regalia,
Mukonge dance, youth dance group.

**Naming people:** attach a name only where it is already public on guneku.org or in a
published source. `roland` and `evis-fah` qualify. The 380×380 set — `notable1–4`,
`GUDECA-PRESI`, `SAM`, `FON`, `joyce`, `victor`, `pa-victor-asukwa`, `prof-njoh`,
`vita` — does not. Use unnamed, or not at all.

## 8. Phase E — factual corrections

1. **Succession.** Correct `predecessorReign` **1965–2014 → 1965–2015**, where it
   describes HRH Fon Fomuki Patrick Nji's reign, which ended with his passing on
   **28 January 2015**. Publish the evidenced stages: **1965** accession · **28 Jan 2015**
   passing · **27 Feb 2015** Transfiguration Ceremony and public anointing of HRH Fomuki
   Walters Ticha · **Nov 2015** launching gala, Mbengwi Council Hall · **30 Dec 2016**
   public presentation to the people of Meta.
   **"17 January 2016" remains unsupported and must not render as established fact.**
2. **Contact number.** **`+237 681 19 46 64` is the Palace number of record.**
   `+237 681 19 46 46` is an unsupported hand-typed transcription error — correct the
   bad literal, and reuse central site config where appropriate. On a site whose own
   archive warns about impostors asking for money, this matters.
3. **The `/projects` divergence.** The homepage reads `src/data/current-notices.json`;
   `/projects` carries its **own hard-coded 11-card array**. Remove that silent
   divergence with the **smallest compatible change** — have `/projects` read the same
   source. Fix the label arithmetic while you are there ("11 active · 4 proposed"
   describes neither view). **Do not turn this into a CMS or data-layer project.**
4. **Label the three diaspora metrics** instead of flattening them: **8 constituted
   chapters** (5 countries, 3 continents) · **9 countries represented at Bonn** ·
   **12–13 known diaspora locations**.
5. **`/indigenes` quarter filter: 17 options → all 27 quarters.**
6. `/kingdom/about-guneku`: present **~10,000 as historical**, not as a live
   inconsistency — ~15,000 is settled SOF.

## 9. Phase F — content merges and new records

Add to **existing** records. Create no duplicate pages, and no record Rev. 4 says exists.

- **GUDECA EXCO.** The full **12-member national EXCO, including Thadeus Fon, already
  exists** in `src/data/pages/gudeca-exco2.json`. **Do not add him as a new member.**
  Surface and reuse the real roster: publish **names and offices**, and **withhold the
  11 personal mobile numbers**. **Never use `src/data/pages/gudeca-exco.json` — it is
  Joomla sample data.**
- **Fondom Studios.** A complete record already exists at
  `src/data/institutions/fondom-studios.json`. **Do not create another.** Surface the
  existing record using current site patterns.
- **Development register.** **Mbengeghang water and FUN electricity already exist in
  `current-notices.json`** — do not add them. Review their status and classification
  **only if Rev. 4 requires it**.
- **Bonn 28 Mar 2026** ← the **31 March 2026** re-registration deadline; opening prayer
  by **Ma Rose**; goodwill message by **Mr. Fonjong** (titled by the Fons of Meta); VP
  **Festus Tanwi** presented the 2025–2026 projects report.
- **Agro CIG** ← from the OCR'd certificate: legal name **GUNEKU AGRO COMMON INITIATIVE
  GROUP** · head office Guneku, Mbengwi sub-division · issued at Bamenda by MINADER,
  Regional Delegation North West, Regional Service of the Registry (COOP/CIG) · legal
  basis Law 92/006 of 14 Aug 1992 and decree 92/455/PM of 23 Nov 1992. Registration date
  12/03/2026 corroborates what is published.
  **The certificate number `26/873/CMR/NW/39/208/GP/002004/002004001` is an OCR read.
  Verify it digit by digit against the original before it is published. Do not publish
  it merely because OCR produced it.**
- **Late Fon's biography** ← born **2 January 1938**, first of a set of twins; Roman
  Catholic Mission School Gom, early 1950s; trained as a tailor; father **Fon Fomuki
  William Tabot**, mother **Mama Ngum Fomuki**; acceded 1965 at 27.
- **Fringyeng (Oko) hydro plant** ← built by **Kasi Rhex Ndeh**, funded by **Dr. Kasi Elvis**.
- **Palace** ← Queen **Fomuki Carine**; the **Ngam-Fon** title (Tayong Fah Elvis,
  conferred 30 Jul 2021); **Alhaji Hassan Djibo**, Ardo of Guneku.
- **Traditional Council** ← the 2021 roster **as dated history — "as recorded in 2021"**:
  Ndingwan Primus (Chairman), Fodom Calvin ((Financial) Secretary, quarter head of Fun),
  Amamuki Jonathan (Treasurer, quarter head of Njinebai), Mbakwa Bernard (2021 electoral
  commission), Ngwa Vitalis (its secretary). **Never as the current roster.**
- **Royal Community Library** ← **Sango Della** in charge, as recorded in 2021.
- **Mɨchi Əbeŋ** ← organising committee: **Fongoh P. Ayeh** (head), **Tebo Julius**,
  **Bandeh Godwill** (2023).
- **F.H.E.D.** ← headquartered in the Guneku Palace; coordinator **Fomumbod Derrick**;
  legal adviser **Barrister Tamon Olivia**.

## 10. Held — do not publish

- **Nine Bonn-related media items** — HOLD for new surfacing. Do not newly link them, do
  not delete them, do not name anyone in them. The cleared Bonn stills, the Bonn record
  and the public Bonn videos proceed without them.
- **The 11 personal mobile numbers** in `gudeca-exco2.json`.
- **The Guneku Medical Center vacancy** — the **facility record publishes** at its
  supported status ("documented as existing on 25 March 2026, with laboratory and
  surgical theatre"); the **job advertisement does not**, until its status is verified.
  Assert neither identity with nor separation from the proposed Reference Healthcare Centre.
- **The certificate number**, until verified digit by digit.
- **`[SENSITIVE]`** — land disputes, Munam/Sang autonomy, farmer–grazier friction,
  crisis-era security incidents, and the Fringyeng arson dispute. The Fon's own letter
  **is** publishable; the dispute is not.
- Personal mobile-money collection numbers — existing site policy, keep it.

## 11. Working method

- **Group phases into the smallest safe set of branches and PRs that `CLAUDE.md`
  governance actually requires.** Do not manufacture six PRs because there are six
  phases. Phase B is material and stands alone; E and F may reasonably group.
- Data before components. No content hardcoded in JSX.
- Verify after each material phase: `npm run build` clean, no type errors, no console
  errors; Lighthouse ≥ 90 performance / ≥ 95 accessibility on mobile; tested at 360px on
  throttled 3G. A large share of the audience is on a mid-range Android in Cameroon.
- Nothing with `[VERIFY]` or `[SENSITIVE]` reaches a public route.
- Stop and ask rather than guess. Every guess on this site is a fact about somebody's
  Fondom.
