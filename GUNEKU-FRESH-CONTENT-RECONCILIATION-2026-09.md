# GUNEKU — FRESH CONTENT RECONCILIATION
**September 2026 · content intelligence package for Marcel + ChatGPT review**
Rev. 4 (repo-reconciled) · 2 September 2026 · No implementation code · No CC brief · No design proposals

> **REPO RECONCILIATION: COMPLETE**
> The canonical repo `C:\Users\loneb\Documents\ai-software-dev\projects\guneku`
> was read directly on 2 September 2026. All six outstanding repo checks are done
> and their results are in **§0 — REPO RECONCILIATION** below. Every *pending repo
> check* qualifier in this document has been discharged; where the repo contradicted
> a Rev. 3 classification, the classification has been corrected in place and the
> change is listed in §0.7.
> **Rev. 2 resolved seven items by investigation. Rev. 3 normalised the document.
> Rev. 4 reconciles it against the canonical repository. The Rev. 3 normalisation
> was not redone.**

---

## METHOD AND ITS LIMITS — read first

**What I could inspect:** the live production site `https://www.guneku.org`, crawled
page by page on 2 September 2026 (39 URLs mapped, 20+ pages scraped, all 24 published
news records enumerated), and the incoming Guneku source folder.

**What I inspected in Rev. 4:** the canonical repository
`C:\Users\loneb\Documents\ai-software-dev\projects\guneku`, read directly — `src/data`
(90 JSON records), `src/app` (27 routes), `src/lib/content.ts`, `public/`, the legacy
`images/` and `media/` trees, `migration/` including the 8.6 MB Joomla SQL dump, `content/`,
`docs/`, and git history. **The repo, not the live crawl, is now authoritative for
existence.** Rev. 3's warning that unpublished drafts would be misclassified as missing
was correct and is now discharged: the repo holds several substantial records that no
route renders. They are enumerated in §0.3.

**Correction to my own prior output.** My earlier pass produced an 85-slot image
inventory and a phased build spec that assumed a greenfield rebuild against
`~/Downloads/guneku-a-kingdom-reimagined-main`, proposed a new IA, and reopened the
quarter count. That was wrong on the repo, wrong on the premise, and wrong to reopen
settled SOF. The site is considerably more built than that spec assumed — it already
carries a 24-record news archive, a 22-entry development register, a 15-album gallery
index, a projects status vocabulary, and the 27 quarters published in full. Treat that
earlier `_BUILD` package as superseded for architecture; only its extracted **source
material** (`data/videos.json`, the Bonn minutes text, the two content packs, the image
manifest) carries forward.

**Guneku SOF applied throughout, not questioned:** ~15,000 people · **27 quarters** ·
largest Meta clan village by area · MENEMO · Mbengwi Subdivision, Momo Division, North
West Region, Cameroon.

---

# 0. REPO RECONCILIATION — RESULTS

Read-only pass over the canonical repository, 2 September 2026. No production code,
content, architecture or design was changed. Six checks, all closed.

## 0.1 The 338 gallery photographs — **FOUND. All 338 are in the repo.**

The count is exact, not approximate. `src/data/gallery/image-gallery.json` — the file
`getImageGallery()` actually reads — declares **15 albums totalling 338 images**, each with
a filename, pixel dimensions and a declared `publicPath`. `files-by-album.json` carries the
same 338. Resolving every one of those 338 against the filesystem:

| | |
|---|---|
| Resolve at their declared `publicPath` under `public/` | **38** (the Mɨchi Əbeŋ album, less one file) |
| Present in the repo but at `images/eventgallery/<album>/` — **repo root, not served** | **299** |
| Present but elsewhere (`images/blog/prof-njoh.jpg`) | **1** |
| Genuinely absent | **0** |

Four of the five album counts Rev. 3 quoted from the live index match the folders on disk
exactly: Return of HRH Fomuki **41**, Installation of the Traditional Council **42**,
Tonmukom–Windik Road **38**, Coronation of HRH Fon Fomuki Walters **29**.

**Two independent causes, both confirmed:**

1. **Placement.** Next.js serves only `public/`. The 299 files sit in the repo-root
   `images/eventgallery/` tree — the Joomla layout, carried over verbatim by the migration
   and never moved. Verified live: `GET /images/gallery/developmentprojects/1479364…n.jpg`
   → **404**.
2. **The components never ask for them.** `src/app/gallery/images/page.tsx` renders
   `<ImagePlaceholder label={album.title}>` and never references `album.coverImage`;
   `src/app/gallery/images/[album]/page.tsx` renders `<ImagePlaceholder label={img.filename}>`
   and never references `img.src` or `img.publicPath`. **Even with the files in `public/`,
   the current pages would still render placeholder boxes.**

So R9 is closed: **nothing was lost, nothing needs sourcing from Marcel.** This is a
placement-plus-wiring matter, entirely inside the repo.

## 0.2 Fondom Studios — **BOTH: already present (thin) AND an unpublished standalone record**

- **Published, thin.** `src/data/updates/mefu-mecuda-joint-meeting-guneku-palace.json`
  carries the "Guneku honoured" passage and ends: *"Fondom Studios was recognised among
  those making a real difference for Meta."* Rev. 3's R7 reading of the MEFU-MECUDA
  material was right.
- **Unpublished, and richer than assumed.** `src/data/institutions/fondom-studios.json`
  **already exists** — a full 938-byte institution record: name, status, category, role
  ("Media partner of MEFU and MECUDA"), the media-and-cultural-production description,
  *"one of the first legally registered media companies in Momo Division"*, three stated
  plans (training programmes; a new Mbengwi branch with Ministry of Vocational Training
  approval; further Meta branches), a `relatedUpdates` link to the MEFU-MECUDA article,
  and a source note.
- It appears a third time inside `src/data/institutions/business-directory.json`.
- **No route renders any of it.** `getAllInstitutions()` and `getInstitution()` are
  defined in `src/lib/content.ts` and **called by nothing**; only `agro-cig.json` and
  `education-scholarship-day-2026.json` reach a page, by direct import.

**Classification: ALREADY PRESENT (thin, in prose) + UNPUBLISHED (standalone record exists).**
Do not author a Fondom Studios record — one is written. R7's instruction not to create it
was correct.

## 0.3 Unpublished / draft material — **substantial, and larger than Rev. 3 assumed**

Records that exist in `src/data` and that **no route renders**:

| Record | Size | What it holds |
|---|---|---|
| `pages/gudeca-exco2.json` | 5.1 KB | **The full 12-member GUDECA national EXCO roster** — *fon thadeaus* National President, Grace Forze 1st VP, Ticha Elias M 2nd VP, Ngati Bah G 3rd VP, Tah Eric Teke SG, Ndikum Humphrey Vice-SG, Asukwa Victor Treasurer, Mbakwa Jonathan Fin. Sec, **Fah Elvis Tayong** Nat. Pub. Sec, Tifuh Triphania Vice Pub. Sec, Acho N Pascal Cultural Sec, Chick Timoh Edmond Youth President. **Carries 11 personal mobile numbers** — see §16. |
| `pages/indegenes.json` | 6.3 KB | Legacy "Sons & Daughters of Guneku Worldwide": Sam Fongho (UK, property auction), Victor Samkoh (Cameroon Cancer Foundation), Dr Joyce Akwe (MD, Decatur GA), Dr Roland Teboh, **Mr Thaddeus Fon — GM @ Tefon Human Resources**. |
| `institutions/business-directory.json` | 2.0 KB | Four businesses with services, and an explicit consent policy: *"Contact details withheld pending each owner's written consent."* Vicky and Son's; Vitalis Integrated Fish Reproduction and Breeding Centre (Ngwa Vitalis, Wumfi-Ku); Fondom Studios; local pork supply. |
| `institutions/` — 10 of 12 records | — | afor-foundation · business-directory · fondom-studios · gudeca-branches · gudeca-eu · guneccul · guyodeca · medphisatg · michi-ebeng-festival · palace-renovation. Several have equivalent prose hardcoded in page components; the structured records themselves are unrendered. |
| `pages/privacy-policy.json` · `pages/terms.json` | 34.9 KB · 21.0 KB | Full legal texts. **The site has no `/privacy-policy` or `/terms` route at all.** |
| `pages/exhibitions.json` · `pages/video.json` · `pages/notables.json` · `pages/tributes.json` · `pages/about-template.json` · `pages/home-page.json` | — | Reachable only through the search API, never as pages. |
| `src/data/about/` — all 9 files | — | **Dead duplicates.** No reader function reads the `about` directory. Byte-for-byte counterparts of files in `kingdom/` (6) and `palace/` (3). Nothing unique is stranded there. |

**The one that matters most:** Rev. 3 §4.1 and §4.2 record **Thadeus Fon, General President**
as a new fact from the Bonn minutes, "not named anywhere on the site". The repo already holds
him **twice** — as National President in `gudeca-exco2.json` and as a named son of Guneku in
`indegenes.json`. The Bonn minutes **corroborate** an existing repo record rather than
introducing a new person. §4.2's merge is therefore an *unpublishing fix*, not a research gain.

Also confirmed: `/gudeca/gudeca-exco` renders the literal line *"Full EXCO roster will be
published here."* The placeholder names Rev. 3 saw on the live roster trace to
`pages/gudeca-exco.json`, which contains **Joomla sample data** — "Martin Brandon",
"Sarah Clarke", "Henry Collins", "Robert Bush". Not Guneku people. Do not publish that file.

## 0.4 Every §3 MISSING classification — **re-tested against the repo, all hold**

Searched `src/`, `content/`, `docs/` and `migration/content/` for each item:

| §3 item | Repo verdict |
|---|---|
| 3.1 Ifuh Itah / Fringyeng Yam Festival | **MISSING — confirmed.** "Itah" 0 hits, "Yam Festival" 0 hits repo-wide. (The one "Ifuh" hit is *Tifuh Triphania*, a person.) |
| 3.2 Guneku Medical Center | **MISSING — confirmed.** "Medical Center" 0 hits. The register carries only *"Medical unit — Proposed"*. |
| 3.3 Health estate (Open Door · Munam · Mbengeghang/Fringyeng) | **MISSING as records — confirmed.** Named only in passing prose and one register card; no facility record, no `Integrated Health Centre` string anywhere. |
| 3.4 The Fon's Fringyeng arson letter | **MISSING — confirmed.** "arson" appears only as the register's status note on the burnt plant. |
| 3.5 45 unpublished videos | **MISSING — confirmed, and corroborated by the legacy DB.** `video-gallery.json` holds `dbVideos: 2`, `allVideos: []`, `youtubeApiStatus: "pending"`. The Joomla table `gune_allvideoshare_videos` contains **exactly 2 rows** — a channel link and the 2024 New Year speech. The 47-video archive has never been in any Guneku system. |
| 3.6 Eighteen 2018–2025 community records | **MISSING — confirmed.** Tobho · SHESA · MEDA · piggery · Rainbow Radio · Wumnembug bridge: 0 hits each. |
| 3.7 F.H.E.D | **MISSING — confirmed.** "F.H.E.D", "FHED", "Fons for Health": 0 hits. |
| 3.7 Fondom Studios | **RECLASSIFIED — see §0.2.** |
| 3.8 Sport and church records | **MISSING — confirmed.** "Ekole" 0 hits; the "Mujang" hits are unrelated legacy references, not the 2026 tournament. |
| §4 merge facts | **New — confirmed.** "Sango Della", "Ngam-Fon", "Kasi" (Rhex Ndeh / Dr Elvis): 0 hits each. |

**One §18 line was wrong and is corrected:** Rev. 3 proposed merging *Mbengeghang water
(COMPLETED 2025)* and *FUN electricity (ONGOING)* into the register. **Both are already in it**
— entries 15 and 16 of `current-notices.json`, both classed `Historical`. See §0.7.

## 0.5 The `/contact` phone number — **provenance settles it. The correct number is +237 681 19 46 64.**

| Evidence | Number |
|---|---|
| Legacy Joomla DB dump, `gune_contact_details` row *"Guneku Palace"* — both the phone and the mobile field | `+237 681 19 46 64` |
| Same dump, the Fondom Communication Office press-contact block published in article body text | `+237 681 19 46 64` |
| Occurrences of `681 19 46 64` across the 8.6 MB dump | **14** |
| Occurrences of `681 19 46 46` across the 8.6 MB dump | **0** |
| `migration/scripts/build-site-config.js` — machine-derived from the dump | `+237 681 19 46 64` |
| `src/data/site-config.json` → rendered in `Footer.tsx` on every page | `+237 681 19 46 64` |
| `src/app/contact/page.tsx:63` — a **hand-typed string literal** in the contact-card array | `+237 681 19 46 46` |

`+237 681 19 46 46` exists at **exactly one place in the entire corpus**: that one line of
JSX. Git blame puts its introduction in commit `fb58e9b` *"Phase indigenes — Clerk auth +
Supabase indigenes directory + all inner pages"*, a page-building commit with no telephone
source attached. It has no record behind it anywhere.

That also explains Rev. 3 §5.3's "two numbers on the same page": the contact **card** prints
the typo, the site **footer** prints the sourced number, on the same rendered page.

**Finding: `681 19 46 46` is a transcription error with no provenance. `681 19 46 64` is the
Palace number of record.** Not a guess — the only sourced number is the one the legacy Palace
contact record, the migration script and the site config all agree on. On a site whose own
news archive warns about impostors, this is the highest-value single-character correction in
the package.

## 0.6 Hidden / unused source data — **two finds, one of them a media-governance matter**

**(a) The legacy migration is clean.** All **37** Joomla articles in
`migration/content/articles-raw.json` were `state = 1` (published) and **all 37** have a
counterpart in `src/data`. There are **no unmigrated and no legacy-unpublished articles**.
`gune_bagallery_items` is empty. `migration/logs/duplicates.txt` records one skip
(`about-template` as a duplicate of `about-guneku`) and `uncategorised-articles.txt` lists the
six that became `src/data/pages/*`. Nothing is hiding in `migration/`.

**(b) 180 photographs and 14 video files sit under `public/` that no page references.**
`public/images/gallery/` holds six folders. One (`mchibe-mta-event-guneku2023`) serves the
manifest. The other five are referenced by **nothing in `src/`**:

| Folder | Contents |
|---|---|
| `coronation` | 58 photographs, 15 MB |
| `enthronement` | 40 photographs, 4.6 MB |
| `guneku-dmv-welcomefomuki` | 28 photographs, 12 MB |
| `prince-tibahs-bornhouse-bonn` | 37 photographs, 5.9 MB |
| `visit-to-fons-palace-by-eu-residents` | 3 photographs + **14 `.mp4` video files**, 84 MB |

These are **not** the 338 — different filenames, more recent Facebook-era IDs. They are an
additional, newer, unindexed body of Palace photography already inside the repo.

**The governance finding.** Nine of those fourteen videos are named
`WhatsApp Video 2026-03-28 at 22.38.*` and `2026-04-02 at 12.5*/13.0*` — the **Bonn,
28 March 2026 footage**, the same material §6.2 and §16 hold under consent review. All 17
files are **tracked in git**, deployed, and live. Verified this pass:

```
GET https://www.guneku.org/images/gallery/visit-to-fons-palace-by-eu-residents/222.mp4
  → 200  video/mp4
GET https://www.guneku.org/images/gallery/coronation/510730280_…_n.jpg
  → 200
```

Unlinked, but publicly retrievable at a guessable path. **This does not change what should
be *published*; it changes what is true today.** The reconciliation cannot describe the Bonn
footage as withheld while it is being served. Recorded in §16 as a fact to put in front of
Marcel — not proposed as a deletion, which is his decision and not a content matter.

## 0.7 Rev. 3 classifications corrected by direct repo evidence

Five, all narrow, all evidenced. Nothing else in the document was reopened.

1. **§5.6 / §6.4 / R9 — the 338.** Was: *"a media-file gap … PENDING REPO CHECK."*
   Now: **all 338 files are in the repo**; 299 are in an unserved directory and both gallery
   components hard-code `ImagePlaceholder` and never read the image paths. Two causes, both internal.
2. **§5.7 — the Forbang portrait.** Was: *"a media gap … request a portrait from Prof. Forbang."*
   Now: `src/app/notables/[slug]/page.tsx:116` renders `<ImagePlaceholder>` unconditionally —
   the same component defect as the gallery. A portrait would not display if supplied. It is a
   wiring defect first, a media gap second.
3. **§5.2 / R6 — the register.** Was: *"one register rendered through two unlabelled filters."*
   Now: **two independent sources.** `src/data/current-notices.json` holds the 22-entry register
   (rendered on the home page); `src/app/projects/page.tsx` holds its **own hardcoded array of
   11 project cards** and does not read the register at all. *"11 active · 4 proposed"* is a
   hardcoded subtitle string. The register also already carries seven entries §12 does not list —
   Solar street lights Phase 1, FUN electricity, Mbengeghang water, StarLink, Guneku History
   Committee, Palace caretaker post, outdoor table tennis courts. R6's classification stands;
   its diagnosis was one source too few, and the real risk is silent divergence between the two.
4. **§18 — Mbengeghang water and FUN electricity.** Was: *"MERGE into the development register."*
   Now: **already there**, entries 15 and 16, both `Historical`. Withdraw the merge.
5. **§4.1 / §4.2 — Thadeus Fon.** Was: *"not named anywhere on the site."* Correct about the
   *site*, wrong about the *repo* — he is in `pages/gudeca-exco2.json` as National President and
   in `pages/indegenes.json` as GM @ Tefon Human Resources, both unrouted. The Bonn minutes
   corroborate rather than introduce.

**Additionally noted, one line, not expanded:** `src/data/palace/fon-walters-profile.json`
carries `"predecessorReign": "1965–2014"`, which R1's evidence puts at **1965–2015** (the passing
is 28 January 2015). Same file, same provenance as the 17 January 2016 date — see §0.8.

## 0.8 The unsupported "17 January 2016" — its origin is now known

Not an answer to Q2, but it removes one possibility. **`2016-01-17` appears zero times in the
8.6 MB legacy Joomla dump.** It did not come from the old site. Its single origin in the entire
corpus is a **hand-authored literal** in `migration/scripts/build-fon-profile.js`:

```js
"enthronementDate": "2015-02-27",
"coronationDate":   "2016-01-17",
```

— inside a `profile` object that is written out by hand, not derived from any database query.
From there it flows into `src/data/palace/fon-walters-profile.json`, its
`enthronementNarrative`, and three hardcoded strings in `src/app/page.tsx`,
`src/app/gallery/page.tsx` and `src/app/palace/fon-walters-profile/page.tsx`.

Meanwhile the repo's own legacy record `src/data/palace/the-coronation.json` — the recovered
Joomla announcement — gives the evidenced sequence and **no January 2016 date**.

**Consequence for Q2:** no legacy source supports it. The question stays open for Marcel, and
§5.1's correction proceeds regardless, exactly as Rev. 3 states.

---

# REV. 2 — INVESTIGATION RESULTS

Seven items Rev. 1 raised as questions were resolved from evidence. What follows
replaces the corresponding Rev. 1 text.

## R1 · Coronation chronology — RESOLVED from the Transfiguration video
Rev. 1 asked "which coronation date is canonical". Wrong question — the ceremonial
stages are distinct and all real. The 2h12m video `D8AnAlI9src` and its YouTube
metadata settle the sequence:

| Date | Event | Evidence |
|---|---|---|
| **1965** | HRH Fon Fomuki Patrick Nji crowned successor at age 27, by his father's will | biography read aloud in the video |
| **28 January 2015** | The passing of HRH Fon Fomuki Patrick Nji — "left the palace on an emergency call to a long journey" | video description; family tribute in the video: *"January 28th 2015 is a day we will never forget. This is the day that Papa rested."* |
| **27 February 2015** | **Transfiguration Ceremony** — mourning, the hill ritual, the biography, and the **public anointing** of HRH Fomuki Walters Ticha by the Fon of Nyen: *"I am directed by instructions from the almighty God to anoint you in public… I anoint you and I make you the Fon."* Speech in the video: *"50 years ago… people were here in this Palace on Fon Fomuki Patrick. 50 years after, that is today, we are witnessing the arrival of Fon Fomuki Walters."* 1965 + 50 = 2015. | the video is this ceremony; site's `/palace` timeline gives the date and the officiant |
| **November 2015** | Launching gala, Mbengwi Council Hall, all 29 Meta villages | site `/palace` |
| **30 December 2016** | **Public presentation to the people of Meta** — the promised return address | video description, written to promote it: *"he promised to present himself to the people to tell them what news he brought back… That time is the 30TH of December 2016."* |

**Consequence:** the 2h12m video is **not** a coronation film — it is the late Fon's
transfiguration and the successor's anointing, uploaded to YouTube 4 Feb 2016, roughly
a year after the event. Labelling it correctly matters.

**What remains unexplained: 17 January 2016.** It appears only on the site's home page
and `/palace/fon-walters-profile`, labelled "coronation", and matches no event in any
source. On the evidence it is either a fourth ceremony nobody recorded, or an error.
That narrow question stays in §17 — the rest of the chronology does not.

**Bonus facts recovered from the video** (all from speeches on the record): Fon Fomuki
Patrick Nji **born 2 January 1938**, first of a set of twins; Roman Catholic Mission
School Gom, early 1950s; trained as a tailor; father **Fon Fomuki William Tabot**,
mother **Mama Ngum Fomuki**; acceded 1965 at 27. GUDECA's president credits his reign
with pipe-borne water, electricity, health centres at Mbengeghang and elsewhere, and
the two secondary schools G.S.S. Guneku and G.S.S. Ngamungeh. Guneku is described from
the podium as *"the largest village in Meta"* — corroborating current SOF.
**Naming note:** the video description calls the late Fon *"Fon Patrick Fomuki the II"*
while the site numbers the reigning Fon **IX**. Two different regnal lines are probably
being counted. Worth a footnote, not a question.

## R2 · Agro CIG certificate — OCR COMPLETE
Rendered at 300dpi, rotated, thresholded and OCR'd. The scan is a **MINADER
registration certificate**:

- **Issued to:** GUNEKU AGRO COMMON INITIATIVE GROUP
- **Certificate No.:** `26/873/CMR/NW/39/208/GP/002004/002004001` *(OCR — verify digit by digit against the original before any use)*
- **Head office:** Guneku · **Sub-division:** Mbengwi
- **Registered:** **12/03/2026** — matches the site's "Registered 12 Mar 2026" ✓
- **Done at:** Bamenda, 12/03/2026
- **Issuing authority:** Ministry of Agriculture and Rural Development, Regional Delegation North West, Regional Service of the Registry (COOP/CIG); signed by the Regional Chief of Service for the Registry
- **Legal basis:** Law No. 92/006 of 14 August 1992 on cooperative societies and common initiative groups, and application decree No. 92/455/PM of 23 November 1992
- **A telephone number appears on the certificate.** Extracted, not reproduced here as a publishable field — whether the CIG's registered line goes on the website is a separate decision, and the site's own anti-impostor notice is a reason to be deliberate about it.

**Against the current record:** the registration date corroborates. The **full legal
name**, the **certificate number**, the **issuing authority** and the **legal basis**
are new and none is on the site. Nothing contradicts.

## R3 · Ifuh Itah spelling — RESOLVED, no ambiguity
Every occurrence across the Facebook records, the blog pack and the derived content
files renders it **"Ifuh Itah"** — 16 hits, **zero variant spellings**. Consistently
glossed as *"the Fringyeng Yam Festival, otherwise known as Ifuh Itah"*.
Belongs to the **people of Fringyeng, Upper Guneku**. **Abandoned for years, revived in
2023**, annual each December.
**Editions with video, none on the Guneku channel:**
2023 — `youtu.be/mV-2jCdPwYU` · 2024 — `youtu.be/89xoGotS15s` ·
2025 — Tuesday **16 December 2025**, with an agriculture show (farming tools as prizes),
a horse display by the Mbororo community, the Kwem of Guneku, a guest artist, and
representatives of the Fons of Zang Tabi, Chup and Guneku.
**Residual:** only whether Meta orthography would add diacritics, as with *Mɨchi Əbeŋ*.
Not a blocker — publish as "Ifuh Itah" and correct later if the Palace prefers otherwise.

## R4 · The bridges — RESOLVED as two different projects
| | Wumnembug–Njinebai | GUYODECA bridge |
|---|---|---|
| Built by | **Mbengwi Council** | **GUYODECA** (Guneku youth) |
| Handed over | around the April 2025 WUCUDA AGM | completed 2025 |
| Links | Wumnembug ↔ Njinebai (a Guneku quarter) — a boundary link | a village project |
| Present at handover | Mayor **Ndangsa Kennedy Akam**, deputy **Amadu Kadiri** | — |
| Source | blog, 4 May 2025 | live site `/gudeca/guyodeca` |

Different builders, different framings, one on the Guneku boundary and one inside the
village. **Treat as two projects.** Withdrawn from §17.
*Note:* the council built **two** bridges that April — Wumnembug↔Njindom and
Wumnembug↔Njinebai. Only the second touches Guneku.

## R5 · Chapters vs countries — RESOLVED as three separate metrics
Rev. 1 called this an inconsistency. It is three different measurements, each
internally coherent; the site's fault is only that it does not label them.

- **A · Constituted GUDECA chapters — 8, across 5 countries, 3 continents.** Cameroon (Yaoundé, Douala, Bamenda) · Germany (Essen–Ruhr) · USA (DMV, New Jersey) · Belgium (Brussels) · UK (London). Historic branch structure in the blog sources is coarser — **Home, U.S.A., European Union** — so the 8 are local chapters within that older three-branch frame.
- **B · Countries represented at Bonn, 28 March 2026 — 9.** Germany, UK, Belgium, Norway, Denmark, Luxembourg, Italy, France, Austria. **Attendance, not chapters.** Five of these (Norway, Denmark, Luxembourg, France, Austria) have no chapter listed.
- **C · Where Guneku people are known to live — 12–13.** Mbengwi, Essen/Ruhr, DMV, New Jersey, Brussels, London, Milan, Stockholm, Dubai, Doha, Lagos, Shanghai, Tokyo, plus a UAE chapter dated 2023.

**Recommendation:** publish all three, labelled as what they are. Three honest numbers
beat one flattened one, and B is the more persuasive diaspora fact. Withdrawn from §17.

## R6 · Development register counts — RESOLVED semantically
22 vs "11 active · 4 proposed" vs 11 cards is not a conflict; it is one register
rendered through two unlabelled filters. Classifying the published entries:

| Class | Entries |
|---|---|
| **PROJECT — active** | Agro CIG · Solar Phase II · Tonmukom–Windik Road (completed) |
| **INSTITUTION** | GUNECCUL · Royal Community Library · Open Door Hospital eye unit · the health centres |
| **PROGRAMME** | Afor Foundation Scholarship (annual) · Digital Empowerment Training |
| **PROPOSED INITIATIVE** | Medical Reference Centre · Soap Production · Satellite Internet · (4th per the site's own count) |
| **HISTORICAL RECORD** | Fringyeng (Oko) hydro plant — burned 2022 |
| **OPEN ISSUE** | Water supply / Ngong |

The home page renders **all classes** (22). `/projects` renders **projects and
proposals only** (11 cards), while its label counts something else again — "11 active"
is not 11 active, since the 11 cards include HISTORICAL, COMPLETED and PROPOSED entries.

**Recommendation:** one register record, `class` as a field, filtered views, and labels
that state which filter is applied. **The only real defect is the label arithmetic.**
Withdrawn from §17 as a decision; it is a data-modelling correction.

## R7 · Fondom Studios — RECLASSIFIED, likely ALREADY PRESENT
Rev. 1 listed it as an institution the site lacks. The sources show it inside the
**MEFU-MECUDA record, which the site publishes**: *"…sat under HRH Dr Fomuki's roof to
discuss the future of the entire Meta Fondom; **captured by Fondom Studios – Guneku**"*,
and, in the honours passage, *"Fomuki, honoured for medical education achievements with
the MEDPHISATG Medical School in Guneku; **Fondom Studios also recognised**."*
The live `/updates/mefu-mecuda-joint-meeting-guneku-palace` article carries a
**"Guneku honoured"** section, which is where both belong.
**Classification — CLOSED BY REPO (§0.2): ALREADY PRESENT (thin, in the published
MEFU-MECUDA article) *and* UNPUBLISHED (a full standalone record,
`src/data/institutions/fondom-studios.json`, exists and no route renders it).**
Do not author a Fondom Studios record — one is already written, with role, description,
three plans and a link to the MEFU-MECUDA article. It appears a third time inside
`institutions/business-directory.json`.

## R8 · The medical picture — NARROWED, still one open decision
Investigating every source for *Guneku Medical Center · Medical Reference Centre ·
MEDPHISATG · St Thierry · laboratory · surgical theatre · medical training* yields
**three distinct things**, not two:

1. **MEDPHISATG** — *Momo Educational Development Program in Health Sciences and Technology*, a **learning facility hosted inside the Guneku Palace** in space provided by the Fon. The Fon of Mbemi addressed its students there: *"We thank the Fon of Guneku most especially for making this learning facility available to us to serve this zone."* One source calls it the **"MEDPHISATG Medical School"**. **Education, not a clinic.** Already on the site via `/education` and the St Thierry video. *Spelling varies in sources: MEDPHISATG / MEDPIHSATG / Medphisatag — confirm the official form.*
2. **Guneku Medical Center, Mbengwi** — the **25 March 2026** requisition: an existing facility with laboratory and surgical theatre, recruiting a Medical Doctor.
3. **Medical Reference Centre** — proposed at Bonn, **28 March 2026**: *"Medical Unit: Plans to establish a reference healthcare centre in Guneku."*

**The dating is the finding.** The requisition predates the Bonn proposal by **three
days**. So the proposal was made while the Center was already recruiting — which
argues against "same thing, different name". In Cameroonian health-system terms a
*reference* (referral) centre is a tier above a health centre, so the likeliest reading
is **(C): the proposal is an upgrade path for an existing facility**, with **(B)
separate institutions** still open.
Evidence cannot close it. **Stays in §17**, sharpened. And the March vacancy is **not**
published as open until confirmed.

## R9 · The 338 gallery photographs — **CLOSED BY REPO. All 338 found.**
Rev. 1 asked Marcel where they are. **Do not ask him.** The forensic search is done
(§0.1): 338 declared, **338 present in the repo** — 38 at their declared `publicPath`,
299 in the unserved repo-root `images/eventgallery/` tree, 1 in `images/blog/`. None is
lost. Four album counts match the live index exactly (41 · 42 · 38 · 29). Two internal
causes, both confirmed: the 299 sit outside `public/`, and both gallery components
hard-code `ImagePlaceholder` and never read `coverImage`, `src` or `publicPath` — so the
boxes would stay empty even after the files moved.

## R10 · Traditional Council 2021 — UNBLOCKED
Publishable now as datestamped historical content — *"as recorded in 2021"* — for
Ndingwan Primus (Chairman), Fodom Calvin ((Financial) Secretary, quarter head of Fun),
Amamuki Jonathan (Treasurer, quarter head of Njinebai), Mbakwa Bernard (2021 electoral
commission), Ngwa Vitalis (its secretary, the Fon's representative).
**Only a claim that these are *current* office holders needs confirmation.** Withdrawn
from §17.

---

# 1. EXECUTIVE SUMMARY

Six findings are genuinely new and materially useful. Everything else in the fresh
scrape is either already published, a duplicate, or private.

1. **Ifuh Itah — the Fringyeng Yam Festival.** A second, distinct Guneku festival with
   at least a 2025 edition and three years of video. The site publishes Mɨchi Əbeŋ and
   makes no mention of this one. The single largest content gap found.

2. **Guneku Medical Center exists and is recruiting.** A March 2026 requisition on
   Guneku Medical Center letterhead advertises a Medical Doctor post, describing a
   facility with a fully equipped laboratory and surgical theatre, offering
   accommodation and 15% commission on surgeries. The site lists a **Medical Reference
   Centre as PROPOSED (2026)** and nothing else. Either these are two different things,
   or the register understates a facility that is already operating. **This is the most
   consequential open question in the package.**

3. **The health estate is undocumented on the site.** Three named health facilities —
   Open Door Medical Clinic (Njinebai), Munam Integrated Health Centre, Mbengeghang /
   Fringyeng Integrated Health Centres — with dated status information and **five
   long-form YouTube documentaries** already published on the Fondom's own channel. The
   site carries a single HISTORICAL card for the Open Door eye unit.

4. **The video archive is 96% unpublished.** `/gallery/videos` publishes **2** videos.
   The channel holds **47 curated, verified, uniquely-titled public videos** (all
   resolve, all embeddable, all have maxres thumbnails), including a 2h12m recording of
   the Transfiguration Ceremony of HRH Fon Fomuki Patrick Nji.

5. **Eighteen dated community records from 2018–2025** exist in the blog research and
   are absent from the 24-record news archive — the archive is thin between 2016 and
   2021 and has a single 2024 entry.

6. **Six live-site defects, all evidenced, all fixable without new sourcing.** Chief
   among them: one date — "coronation, 17 January 2016" — is published on two pages and
   supported by **no source**, while the real ceremonial sequence (28 Jan 2015 passing ·
   27 Feb 2015 transfiguration and anointing · Nov 2015 gala · 30 Dec 2016 public
   presentation) is fully evidenced and largely unpublished. The register's label
   arithmetic is also wrong: "11 active · 4 proposed" describes neither of the two views
   the site renders.

7. **The Agro CIG certificate is now OCR-extracted** — full legal name, certificate
   number, issuing authority and legal basis, none of which is on the site, and a
   registration date that corroborates the published one.

**What is NOT new:** Bonn 2026, MEFU-MECUDA, the Holiday Workshop, Agro CIG and its
three communiqués, GUNECCUL's four branches, the Education & Scholarship Day 2026, the
GUDECA EU President's address, the Afor Foundation, GUYODECA, the 27 quarters, the
comms/scam notice. All published, several in more detail than the fresh sources hold.
Section 15 lists these explicitly so the check is visible.

---

# 2. SOURCES AUDITED

| Source | Extent | Trust |
|---|---|---|
| **Live site** `www.guneku.org` | 39 URLs mapped; 20+ pages scraped; all 24 news records enumerated; crawled 2 Sep 2026 | Current state (proxy for repo) |
| **YouTube** — channel `UCEmIEHRMg3UTzb1wpxLZOAw` "Guneku Village" | 142 items; 109 published; 47 curated and verified; ~33 drafts; 74 subscribers | First-party |
| **WhatsApp** — 4 groups | GUDECA EUROPE (327 rows / 184 substantive, Dec 2025–Aug 2026); Guneku Agro CIG (1033 / 354, Mar–Aug 2026); Bo'n mi' Guneku Sig jim (938 / 405, Jun–Sep 2026); website design (11 / 0). **Text only — media rows were excluded at harvest.** | Private channel |
| **Facebook** — *Mbengwi Online* group (admin Fongoh P. Ayeh) | 10 structured records, all Guneku-related | Community record |
| **Blog** — `mbengwionline.blogspot.com` | 230 posts indexed; 26 Guneku articles 2018–2025 scraped; distilled into 5 data files (people 23, quarters, institutions, events, sources) | Community record |
| **PDFs** | GUDECA EU Bonn minutes 28 Mar 2026 (full text extracted, 2 identical copies); Guneku Medical Center requisition 25 Mar 2026 (text layer mangled; content established, re-render before quoting verbatim); Guneku Agro CIG certificate (**scan — OCR-extracted, see R2**) | Official |
| **Video files** | 10 files in `guneku-vidz`, **6 unique** (2=7=8, 3=9, 6=the dated WhatsApp file); all 720p; all the same event — Bonn, 28 Mar 2026 | Derived |
| **Images** | Scholarship flyer (JPEG + PNG, 1054×1492); 14 labelled stills extracted from the Bonn videos with manifest; 48-frame sample set | Derived |

---

# 3. GENUINELY NEW CONTENT

### 3.1 Ifuh Itah — the Fringyeng Yam Festival
- **DATE:** 2025 edition documented 16 Dec 2025; tradition described as revived
- **SOURCE:** Facebook — Mbengwi Online
- **LOCATION:** `facebook-pack/content/culture/fringyeng-yam-festival-ifuh-itah.md`, `2025-12-16-fringyeng-yam-festival-2025-edition.md`
- **TYPE:** Cultural record + festival series
- **WHY IT MATTERS:** A second named Guneku festival, tied to a specific quarter, absent from the site entirely. Three years of video reportedly exist.
- **STATUS:** Not published
- **RECOMMENDED HOME:** the existing culture area alongside Mɨchi Əbeŋ; a `/updates` record for the 2025 edition
- **SPELLING SETTLED (R3):** *Ifuh Itah* — 16 occurrences across all sources, zero variants. Publishable under that spelling; a later Palace orthographic preference (diacritics, as with *Mɨchi Əbeŋ*) is a future correction, not a blocker.
- **EDITIONS:** 2023 `youtu.be/mV-2jCdPwYU` · 2024 `youtu.be/89xoGotS15s` · 2025 on Tuesday 16 December.

### 3.2 Guneku Medical Center — vacancy and facility
- **DATE:** 25 March 2026
- **SOURCE:** PDF `DOC-20260325-WA0072..pdf`, Guneku Medical Center letterhead
- **TYPE:** Institution record + recruitment notice
- **CONTENT:** Medical Doctor post. Facility described as having a fully equipped laboratory and surgical theatre. Terms: competitive salary, free accommodation, 15% commission on surgeries performed. Preference stated for interest in surgical practice. Contacts on the document: `cmcguneku@gmail.com`, +237 671 398 624, +237 671 913 642.
- **WHY IT MATTERS:** The site's register lists **Medical Reference Centre — PROPOSED (2026)**. This document describes an operating facility recruiting staff. Also a natural anchor for a recruitment/opportunities surface the site does not have.
- **STATUS:** Not published
- **RECOMMENDED HOME:** the development/institutions register, as a **facility record in its own right**. Publish it at its independently supported status: *documented as existing on 25 March 2026, with laboratory and surgical theatre.* The facility record is **not** blocked by the vacancy or by Q1.
- **HOLD — the vacancy only:** do **not** advertise the March post as currently open until its status is verified.
- **DO NOT** state that it is the same as the proposed Reference Healthcare Centre, and **do not** state that it is definitely a separate institution. Both remain unestablished (R8, §17 Q1).
- Re-render the PDF before quoting its wording verbatim; the content is established.

### 3.3 The health estate — three facilities
- **DATE:** assessments 2020–2023
- **SOURCE:** Facebook pack (`health-projects/guneku-health-facilities-assessment.md`, `gudeca-usa-nurse-munam.md`); blog pack `data/institutions.json`; five YouTube documentaries
- **TYPE:** Institution records
- **CONTENT:** **Open Door Medical Clinic**, Njinebai — founded by American missionaries Dr John and Omelda Hibbert; trained and graduated physicians and nurses; closed over a year after a robbery during the crisis; reopened on the Fon's order with Palace funding; received an echography machine presented publicly 30 Jul 2021. **Munam Integrated Health Centre** — 25m44s documentary. **Mbengeghang / Fringyeng Integrated Health Centres** — 11m39s documentary. Plus a GUDECA USA-funded nurse posting at Munam (2020).
- **WHY IT MATTERS:** Concrete, dated, filmed. The strongest diaspora fundraising material in the whole corpus, and the site currently carries one HISTORICAL card.
- **STATUS:** Not published
- **RECOMMENDED HOME:** the development/institutions register, plus per-facility records

### 3.4 The Fon's letter following the Fringyeng arson
- **DATE:** 8 September 2022
- **SOURCE:** Facebook pack `news/2022-09-08-fon-guneku-speaks-out-fringyeng-arson.md`
- **TYPE:** Palace communication
- **WHY IT MATTERS:** The Fon's own words on development and on how grievances should properly reach the Palace. The site records the burnt Fringyeng plant as REBUILD NEEDED but not what the Fon said about it.
- **STATUS:** Not published
- **RECOMMENDED HOME:** Palace section
- **CLEARED FOR PUBLICATION:** the letter is the Fon's own public statement and may be included. **The underlying dispute remains `[SENSITIVE]` and stays out** (see §16).

### 3.5 45 unpublished videos
- **DATE:** 2015–2026
- **SOURCE:** the Fondom's own YouTube channel
- **WHY IT MATTERS:** `/gallery/videos` publishes 2. Forty-five verified, categorised, uniquely-titled public videos are not surfaced anywhere on the site. Full inventory in §7.
- **STATUS:** Not published
- **RECOMMENDED HOME:** the existing `/gallery/videos` surface and the topic pages each video documents

### 3.6 Eighteen community records, 2018–2025
Present in the blog research, absent from the 24-record archive. Ranked in §14.
Notable: Wumnembug–Njinebai bridge (2025); Tobho piggery (2024); MEDA home at Mukonge
(2022); FHED benches and PWD donations (2021–2022); PS Guneku common entrance results
(2021); GUDECA Easter AGM (2019); the Fon's PWD support and the Rainbow Radio
microphone donation (2019); MECUDA renaissance (2020); SHESA Silver Jubilee class
orphanage donation (2021, also filmed).

### 3.7 New institution records
- **F.H.E.D — Fons for Health, Education and Development.** Coordinator Fomumbod Derrick; Legal Adviser Barrister Tamon Olivia; **headquartered in the Guneku Palace**. Founding link: the late HRH Fon Fomuki Patrick Nji was founding president of *Fons Against AIDS* (2003). Source: blog pack. Not on the site.
- **Fondom Studios (Guneku Branch)** — **reclassified, see R7 and §0.2.** Not a new institution to create. It is thin-but-present in the published MEFU-MECUDA article, **and** a complete standalone record already exists at `src/data/institutions/fondom-studios.json`, unrendered by any route. **ALREADY PRESENT + UNPUBLISHED — closed by repo.**
- **Also unpublished, found in the repo (§0.3):** the full **12-member GUDECA national EXCO roster** (`pages/gudeca-exco2.json`), the legacy **Sons & Daughters** listing (`pages/indegenes.json`), and a consent-aware **Guneku Business Directory** of four businesses (`institutions/business-directory.json`). None of these needs writing — only routing, and in the EXCO case a privacy pass (§16).

### 3.8 Sport and church records
- **Mujang Berto Prince tournament final**, 15 Aug 2026 — Facebook pack. New; the site has no sport content.
- **Rev. Ekole Alexander Netunda send-off**, P.C. Guneku, 23 Jun 2024, and the **Njindom parish priest exchange**, 5 Jul 2026 — Facebook pack. New; the site names 19 churches in aggregate but records no church events.

---

# 4. EXISTING CONTENT WITH NEW FACTS — MERGE

### 4.1 GUDECA Europe / Bonn 28 March 2026
**Existing:** `/updates/gudeca-eu-meeting-bonn-28-march-2026` and the `/gudeca` "latest meeting" block. Already carries: €800 solar Phase II, 2,000 FCFA share, 9 countries, minutes circulated 6 Apr 2026, next meeting 24 Jul 2027 UK, Sam Fongoh's StarLink proposal, President Ndenge Constantine, Secretary Muyang Ela, Mr Fabian on the CIG.
**New source:** the minutes themselves (full text).
**New facts not on the site:**
- **Mr. Thadeus Fon, General President (GUDECA)** — welcomed members and gave the projects recap. Not named anywhere on the site, and he sits above the EU chapter.
- **2026 re-registration deadline: 31 March 2026.**
- Opening prayer by **Ma Rose**; goodwill message by **Mr. Fonjong**, described as titled by the Fons of Meta.
- Vice President **Festus Tanwi** presented the 2025–2026 projects overview (site lists him as VP but not this).
- Agenda structure: 15 numbered items including *Member Introductions*, at which members stated their names and **their respective areas of origin within Guneku**.
- Closing: refreshments, appreciation from the Fon and his wife, dancing.
**Action: MERGE** into the existing Bonn record and the EXCO page. **Do not create a second Bonn page.**

### 4.2 GUDECA EXCO roster
**Existing:** `/gudeca/gudeca-exco` — the main roster is **8 empty placeholder slots**; GUDECA Europe is filled (President Ndenge Constantine, VP Festus Tanwi, SG Muyang Ela, Fin. Sec Armstrong Tinyih, Digital Lead Ni Sam).
**New facts:** Thadeus Fon as General President; the minutes are signed by Muyang Ela (SG) and Ndenge Constantine (President), which corroborates the EU entries.
**Action: MERGE** one confirmed name into the general roster; the remaining slots stay open.

### 4.3 Guneku Agro CIG
**Existing:** `/agro-cig` is the most detailed page on the site — three communiqués, GUNECCUL account 200637, 12.5M FCFA Phase 1, 500 chicks, turkeys from Nigeria, pigs and ostriches planned, land bulldozed, stones gathered.
**New source:** the CIG registration certificate — **OCR-extracted (R2).**
**New facts, none of them on the site:** full legal name **GUNEKU AGRO COMMON INITIATIVE GROUP** · certificate no. `26/873/CMR/NW/39/208/GP/002004/002004001` · head office Guneku, Mbengwi sub-division · issued at Bamenda by MINADER, Regional Delegation North West, Regional Service of the Registry (COOP/CIG) · legal basis Law 92/006 of 14 Aug 1992 and decree 92/455/PM of 23 Nov 1992. Registration date **12/03/2026 corroborates** the published date.
**Action: MERGE.** One handling note: **verify the certificate number digit by digit against the original before public use** — it is an OCR read.

### 4.4 Fringyeng Hydroelectric Plant
**Existing:** register card — REBUILD NEEDED, burned by arson Sep 2022.
**New facts:** built by **Kasi Rhex Ndeh**, funded by **Dr. Kasi Elvis**; known locally as the **Oko** micro-hydroelectric plant. Source: blog pack.
**Action: MERGE** attribution. The arson dispute stays out.

### 4.5 Guneku Royal Community Library
**Existing:** register card ACTIVE (2021); the education page routes scholarship registration through the Library on 670 949 503.
**New fact:** **Sango Della** is in charge of the Palace library (blog pack, as of 2021 — verify still current).
**Action: MERGE** if confirmed.

### 4.6 The Traditional Council
**Existing:** two 2023 news records on the councillor installation and the administrative reorganisation; a 42-photograph gallery album dated 30 Jul 2021; two YouTube films.
**New facts:** named office holders — Chairman **Ndingwan Primus**; (Financial) Secretary **Fodom Calvin**, also quarter head of Fun; Treasurer **Amamuki Jonathan**, also quarter head of Njinebai; **Mbakwa Bernard** headed the 2021 palace electoral commission; **Ngwa Vitalis** was its secretary and the Fon's representative. All as of 2021.
**Action: MERGE** as a dated roster — "as recorded in 2021" — not as current office holders, unless the Palace confirms.

### 4.7 The Palace household and titles
**New facts:** **Fomuki Carine**, Queen of the Palace, a disability expert formerly with the SEEPD Programme, CBC Health Service. **Tayong Fah Elvis** holds the traditional title **Ngam-Fon** (the Fon's mouthpiece), conferred 30 Jul 2021 — the same person the site names as Agro CIG Delegate. **Alhaji Hassan Djibo**, Ardo of Guneku, the highest Mbororo authority in the village.
**Action: MERGE.** The Ngam-Fon title connects two site records that currently look like unrelated people.

### 4.8 Mɨchi Əbeŋ
**Existing:** several records, a 39-photograph album, the festival is well covered.
**New facts:** organising committee named — **Fongoh P. Ayeh** (head, and publisher of Mbengwi Online), **Tebo Julius**, **Bandeh Godwill** (2023). Plus five festival videos not surfaced.
**Action: MERGE** committee attribution; attach videos.

### 4.9 Diaspora chapters
**Existing:** `/diaspora` lists 12 locations plus a UAE chapter dated 2023; `/gudeca` says "eight chapters, three continents" and names five countries; the Bonn record says members came from **9 countries** (Germany, UK, Belgium, Norway, Denmark, Luxembourg, Italy, France, Austria).
**New facts:** Norway, Denmark, Luxembourg, France and Austria appear in the minutes but not in the site's chapter list. The 2025 GUDECA EU annual gathering was held in **Duisburg**; the 2024 conclave in **Heilbronn** (two videos, one in French).
**Action: MERGE.** The three counts are **not** in conflict (R5) — they are three metrics: **8 constituted chapters** · **9 countries represented at Bonn** · **12–13 known diaspora locations**. Publish all three, each labelled as what it is.

---

# 5. CORRECTIONS TO CURRENT WEBSITE CONTENT

Only internal contradictions and evidenced errors. **No settled SOF is reopened.**

### 5.1 The ceremonial chronology — publish the evidenced stages, drop the unsupported date
**RESOLVED (R1).** The stages are distinct and must not be collapsed into one
"coronation date". Publish as:

- **1965** — HRH Fon Fomuki Patrick Nji acceded
- **28 January 2015** — the passing of HRH Fon Fomuki Patrick Nji
- **27 February 2015** — Transfiguration Ceremony and the public anointing of HRH Fomuki Walters Ticha
- **November 2015** — launching gala, Mbengwi Council Hall
- **30 December 2016** — public presentation to the people of Meta

- **SITE CLAIM TO CORRECT:** "coronation, **17 January 2016**", on the home page and
  `/palace/fon-walters-profile`. Internally: **`[VERIFY — no supporting source found]`**.
  It matches no event in any source examined.
- **RECOMMENDATION:** remove or correct it in public summaries and use the evidenced
  stages above. If Marcel later supplies its meaning, restore it as a labelled event.
  **Correcting the chronology is not blocked by that.**

### 5.2 The development register's label arithmetic is wrong
**RESOLVED as a classification/labelling matter (R6) — not a Marcel decision.**
**Sharpened by the repo (§0.7 item 3): they are not two views of one register, they are
two independent sources.** `src/data/current-notices.json` holds the 22-entry register the
home page renders; `src/app/projects/page.tsx` holds its **own hardcoded array of 11
project cards** and never reads the register. "**11 active · 4 proposed**" is a hardcoded
subtitle string describing neither. The 11 cards include HISTORICAL, COMPLETED and
PROPOSED entries. The standing risk is silent divergence between the two lists.
- **RECOMMENDATION:** add a `class` field (PROJECT · INSTITUTION · PROGRAMME · PROPOSED
  INITIATIVE · HISTORICAL RECORD · OPEN ISSUE), keep one source record, and state which
  filter each view applies. Classification of the current entries is in R6.

### 5.3 Contact page shows two different phone numbers — **RESOLVED BY PROVENANCE (§0.5)**
- **Why both appear on one page:** the contact **card** is a hand-typed literal at
  `src/app/contact/page.tsx:63`; the site **footer**, on the same rendered page, prints
  `palacePhone` from `src/data/site-config.json`.
- **The evidence:** the legacy Joomla `gune_contact_details` row *"Guneku Palace"* gives
  `+237 681 19 46 64` for **both** phone and mobile; the Fondom Communication Office
  press-contact block in the article bodies gives the same; `681 19 46 64` occurs **14
  times** in the 8.6 MB dump and `681 19 46 46` occurs **zero** times;
  `migration/scripts/build-site-config.js` derived `+237 681 19 46 64` from that dump.
- `+237 681 19 46 46` exists at **exactly one place in the whole corpus** — that one line
  of JSX, introduced in commit `fb58e9b` with no telephone source attached.
- **FINDING — not a guess:** `+237 681 19 46 64` is the Palace number of record;
  `681 19 46 46` is a transcription error. On a site whose own news archive warns about
  impostors asking for money, this is the single highest-value correction in the package.

### 5.4 Three chapter/country metrics are published without labels
**RESOLVED (R5) — the numbers are not in conflict.** Label them:
- **8 constituted GUDECA chapters** — 5 countries, 3 continents
- **9 countries represented at Bonn, 28 March 2026** — attendance, not chapters
- **12–13 known diaspora locations** — where Guneku people live
- **RECOMMENDATION:** publish all three as distinct measures. No reconciliation needed.

### 5.5 Indigenes quarter filter offers 17 options; the Kingdom publishes 27 quarters
- `/indigenes` filter: 16 quarters + Other/Unknown
- `/kingdom`: all 27 quarters listed
- **RECOMMENDATION:** the directory filter must offer all 27. A son of an unlisted quarter currently has to file himself under "Other".

### 5.6 The gallery index promises 338 photographs and renders placeholder boxes
- `/gallery/images`: "15 event albums · 338 photographs", every album listed with a count; thumbnails render as `◻`.
- **RESOLVED BY REPO (§0.1) — it is not a media gap. All 338 files are in the repository.**
  38 sit at their declared `publicPath`; 299 sit in the unserved repo-root
  `images/eventgallery/` tree; 1 in `images/blog/`. Two internal causes: placement outside
  `public/`, and both gallery components hard-coding `ImagePlaceholder` instead of reading
  `coverImage` / `src` / `publicPath`. The published counts are honest — the images are real
  and held. Nothing to source from Marcel.

### 5.7 Notable portrait renders as a placeholder — **RECLASSIFIED BY REPO (§0.7 item 2)**
- `/notables/roland-teboh-forbang` — placeholder box where the portrait belongs.
- **Cause found:** `src/app/notables/[slug]/page.tsx:116` renders `<ImagePlaceholder>`
  unconditionally — the same component defect as the gallery pages. **A portrait supplied
  today would still not display.** Wiring defect first; media gap second. Requesting the
  portrait from Prof. Forbang remains worth doing, but it is not what is causing the box.

### 5.8 Self-flagged inconsistencies on `/kingdom/about-guneku`
The page already flags ~10,000 (legacy) vs ~15,000 (current) and 31 vs 29 Meta
communities in an editor's note. **Current SOF settles the population at ~15,000** —
the legacy figure should be presented as historical, not as a live inconsistency. On
Meta communities, the blog sources say **29 villages**; `/kingdom` says 31. Worth
resolving, but it is a Meta-clan fact, not a Guneku one.

---

# 6. MEDIA INVENTORY

### 6.1 Images produced from the Bonn videos — 14, available now
Extracted, labelled, three variants each (`.jpg` + `-web.webp` + `-thumb.webp`), EXIF
stripped, manifest included. All depict **GUDECA Europe, Bonn, 28 March 2026**:
hero/assembly under the marquee, evening procession in Meta regalia, elder in
ceremonial gown, buffet line, catering, four speakers addressing the meeting, floor
discussion.
- **Resolution 1280×720** (848×480 for the catering shot). Adequate for cards and
  in-article use; **not adequate for a full-bleed hero.**
- **5 stills — ELIGIBLE NOW** (`public_event`): assembly, procession, buffet line, catering, and the wide marquee frame. These may be attached to the Bonn record immediately.
- **9 stills — HELD FOR FUTURE MEDIA REVIEW** (`consent_flag: review`): an individual is recognisable and prominent. **These nine do not block the Bonn content, nor the ten Bonn videos already public on the official Guneku channel.**
- **No one is named in the alt text.** The site's own `/gallery/videos` page states the
  Bonn footage is held pending **speaker confirmation** — the same caution, already
  applied by the Fondom.

### 6.2 Video files
6 unique files (of 10; four were byte-identical duplicates), all 720p, all the Bonn
gathering. Source: WhatsApp. Same consent position as the stills.

### 6.3 YouTube — 47 verified videos with usable thumbnails
All 47 have `maxresdefault` and `hqdefault` available. **Do not hotlink** — cache
locally. One video, **`2jS-ael4Ccg`** ("Cultural Moments & Community Unity | GUDECA EU
Bonn 2026"), is **Private** and belongs to the Bonn series.

### 6.4 The 338 gallery photographs — **FOUND IN THE REPO. ALL 338.** (§0.1)
15 albums, 338 images, every one with a filename and pixel dimensions in
`src/data/gallery/image-gallery.json`. **338 of 338 are physically present**: 38 under
`public/`, 299 in the unserved repo-root `images/eventgallery/`, 1 in `images/blog/`.
Album counts match the live index exactly — **Return of HRH Fomuki 27 Feb 2015 (41)**,
**Installation of the Traditional Council 30 Jul 2021 (42)**, **Tonmukom–Windik Road
Work (38)**, **Mɨchi Əbeŋ 2023 (39)**, **Coronation of HRH Fon Fomuki Walters (29)**.
**They fill most of the site's photographic gaps at once, and they were never missing.**

### 6.4b An additional 180 photographs and 14 videos, already served, referenced by nothing (§0.6b)
`public/images/gallery/` carries five further folders that no page links to —
`coronation` (58), `enthronement` (40), `guneku-dmv-welcomefomuki` (28),
`prince-tibahs-bornhouse-bonn` (37), `visit-to-fons-palace-by-eu-residents` (3 photographs
+ **14 `.mp4` files**, 84 MB). Different, newer files than the 338. All tracked in git and
deployed; nine of the videos are the **Bonn 28 March 2026** WhatsApp files. Verified live:
`/images/gallery/visit-to-fons-palace-by-eu-residents/222.mp4` → **200 `video/mp4`**.
See §16.

### 6.5 Documents
- Bonn minutes 28 Mar 2026 — text extracted, publishable as an archive document
- Agro CIG certificate — **OCR-extracted (R2)**; publishing the certificate image itself is a later decision
- Guneku Medical Center requisition 25 Mar 2026 — content established; re-render before quoting verbatim
- Scholarship flyer 2026 — already published on `/education`

### 6.6 What is still missing, in priority order
1. A **portrait of HRH Dr. Fomuki Walters Ticha IX** — the Palace profile has no photograph of the reigning Fon
2. A **hero photograph** at 1600px+ — nothing we hold qualifies
3. **2026 event photography** — Agro CIG launch, Holiday Workshop, MEFU-MECUDA, the scholarship days. All four are written up; none is illustrated.
5. Portrait of Prof. Forbang *(and note §0.7 item 2 — the page would not display it today)*

**Removed from this list:** the 338 gallery files. They are in the repo (§0.1), together
with a further 180 photographs and 14 videos already under `public/` (§6.4b). The site's
photographic problem is placement and wiring, not supply.

---

# 7. VIDEO / YOUTUBE — MAPPED TO EXISTING TOPICS

47 verified. The site publishes 2. Below, each video group is tied to the **existing**
site record it documents — no new gallery structure is proposed.

| Existing site record | Videos available | Notes |
|---|---|---|
| `/education` (Scholarship Day 2026) | `UfpBzWOEDZM` | **already embedded** |
| `/palace` (New Year address) | `11pAXbEfPgc` | **already published** |
| Health estate (§3.3) | `0FoAKZk54kw` Open Door 19m15s · `7vHYQenDfIU` Munam 25m44s · `l5vSEOGEfrQ` Mbengeghang/Fringyeng 11m39s | the evidence base for the health records |
| The Fon / prostate cancer advocacy | `qmW0Y8C6nqA` · `ILYKYengny8` (Jacqueville, Côte d'Ivoire) · `ETYKk79POT4` (CRTV) | ties to the "Healer" charge on `/palace` |
| Traditional Council & reorganisation | `ut5d36xYF48` 13m19s · `qryDlSaDXvU` 7m36s · `YG41uOn8mTU` 8m29s | matches the two 2023 news records + the 42-photo album |
| Mɨchi Əbeŋ | `3NrHXqm1zPc` · `gBro0ZC-JqM` · `GtKFg4e6XNQ` · `TswnPNtU2nU` · `OjSdjO_FOC4` · `aAw_1B10vZM` | six films across editions |
| Culture & dance | `XNM9kqGrO9w` · `d0lvYtNu8PQ` · `JgPTIc_Fo0Q` · `4f80GiCLaYE` · `KhgIX-rvKgE` (Nkwem group from Buea) · `PII6BSDMeQI` | |
| Bonn 2026 record | `CBM7cylT0Qs` opening · `1dPsLILCbKU` welcome · `BXxF8j2Vvok` financial report · `aGZop6G66u4` StarLink/Ni Sam · `Y2HZoq5c8Zo` digital empowerment · `3MQ9uUcm-xE` CIG poultry · `uBHkP4gJssg` solar update · `dVctUptioc0` · `YynKWsRpC9g` · `S7XBmkSzYgY` | ten films for one already-published record |
| GUDECA chapters | `O_vcMHqYbeY` · `sYkdlM_7Cqk` (US) · `82Qpfay8X2c` · `Lz89ZThNNQg` · `E9nRhMDJftM` (Yaoundé) · `zHEb96lklMA` · `kuwrnSOJwmk` (Heilbronn 2024) · `V5ldRqWDXy4` · `7lmRAVBWyhg` | Yaoundé hall fundraiser is otherwise unrecorded |
| Palace renovation | `I9LZc0Su3Ok` | matches the existing renovation record |
| Late Fon Fomuki Patrick Nji | **`D8AnAlI9src` — Transfiguration Ceremony, 2h12m19s** | the archive's most significant single object |
| SHESA orphanage donation | `z48zhoRWC8g` | matches the blog record |
| Scholarship | `D3mqdfN7AsI` (2024) | |

**Channel hygiene, separate from the website:** ~60 published clips carry generic
titles (`25. March 2024` ×30, `Mɨchi Əbeŋ event Guneku Palace` ×20, `23. March 2024`
×4). Real footage, unusable as-is, and it damages the channel's own discoverability.
A titling pass is worth doing on YouTube regardless of what the site does.

---

# 8. FACEBOOK CONTENT

Source: *Mbengwi Online* group, admin **Fongoh P. Ayeh** — who is also head of the
Mɨchi Əbeŋ organising committee, i.e. a community insider, not an outside outlet.

**Missing from the site, worth publishing (detail in §3):** Ifuh Itah / Fringyeng Yam
Festival and its 2025 edition · the health facilities assessment · the Fon's letter
after the Fringyeng arson · GUDECA USA nurse at Munam · Mujang Berto Prince tournament
final (15 Aug 2026) · Rev. Ekole send-off (Jun 2024) · Njindom parish priest exchange
(Jul 2026) · GUDECA and Palace projects through the crisis years.

**Reference, not a page:** the Meta clan associations sheet — it establishes that
**GUDECA is Guneku's member association inside MECUDA**, the Meta clan umbrella,
alongside MEDA (Mbengwi), BACUDA (Barakwe), NJICUDA (Njindom). Useful as a wording
check across the site rather than as published content.

**Licensing:** this is other people's journalism and photography. Facts are free,
sentences are not — anything published must be newly written, with the source
attributed. Their images must be licensed or replaced.

---

# 9. WHATSAPP CONTENT

Four groups, 60 substantive messages retained, each already carrying a
`publishable: true | review | false` flag from the harvest. **The harvest is text-only
by construction** — media rows were excluded, which is why no 2026 event photography
came out of it.

**PUBLIC — facts usable, mostly already published:** the Agro CIG communiqués and share
pricing; the solar Phase II drive; the GUNECCUL branch news; the scholarship
announcements; the scam/impostor warning; the business directory idea; the water supply
problem; the holiday workshop; MEFU-MECUDA. The site has published essentially all of
this, in several cases more fully than the group did.

**REVIEW — real but needs a decision:** Starlink at the Palace (published as PROPOSED);
the Guneku history committee; Fondom Studios' activity; the diaspora business
directory; palace upkeep discussions.

**PRIVATE — not for publication:** individual member names harvested from the groups
(see §16); internal financial discussion; member personal news; anything flagged
`publishable: false`; and all four groups' membership lists.

**One thing worth noting:** the Bonn minutes record that at *Member Introductions*,
members stated their names **and their areas of origin within Guneku**. That is exactly
the data the `/indigenes` directory is built to hold — but it was said in a meeting, not
volunteered to a website. It should be collected again, from the person, not
transcribed from the minutes.

---

# 10. INSTITUTIONS / ORGANISATIONS

| Institution | On the site? | Fresh information |
|---|---|---|
| **The Palace** | Yes, extensively | Queen **Fomuki Carine**; **Ngam-Fon** title held by Tayong Fah Elvis (conferred 30 Jul 2021); **Alhaji Hassan Djibo**, Ardo of Guneku; the late Fon founded *Fons Against AIDS* (2003) |
| **GUDECA** | Yes | **Thadeus Fon, General President** (new); 31 Mar 2026 re-registration deadline; Duisburg 2025 gathering; sits inside **MECUDA** |
| **GUNECCUL** | Yes — 4 branches, all dated | No new facts. Account 200637 already published |
| **Guneku Agro CIG** | Yes — most detailed page on the site | Certificate **OCR'd (R2)**: legal name, certificate number, issuing authority, legal basis — all new |
| **Guneku Royal Community Library** | Yes | **Sango Della** in charge (2021) |
| **Guneku Medical Center** | **No** | §3.2 — documented as existing 25 Mar 2026 with laboratory and surgical theatre. **Publishable as a facility record now**; the vacancy is held pending status check |
| **Open Door Medical Clinic** | Partially — one HISTORICAL card | Founders, closure, reopening, echography machine, documentary |
| **Munam / Mbengeghang / Fringyeng health centres** | **No** | Documented and filmed |
| **F.H.E.D** | **No** | HQ in the Guneku Palace; coordinator and legal adviser named |
| **MEDPHISATG / St Thierry University** | Yes — video embedded on `/education` | Nothing new |
| **MEFU / MECUDA** | Yes — 29 Aug 2026 record, well detailed | GUDECA's position inside MECUDA is a wording check, not new content |
| **Schools** | Yes, in aggregate | PS Guneku common entrance results (2021); GS Guneku donation drive already published |
| **Fondom Studios** | **Yes, twice — thin in the published MEFU-MECUDA record, and a full unrouted record in the repo** | R7 + §0.2. The published article ends *"Fondom Studios was recognised among those making a real difference for Meta."* `src/data/institutions/fondom-studios.json` already holds the complete record; no route renders it. **Do not create one — route the one that exists** |
| **Rainbow Radio, Mbengwi** | No | Station manager **Moris Tagyen**; the Fon donated microphones (2019). External body — a mention, not a profile |

**No speculative profiles created.** Rainbow Radio is a lead, not a record. Fondom
Studios is not a new record at all — see R7.

---

# 11. CULTURE / HERITAGE

New and sourced only:

- **Ifuh Itah / Fringyeng Yam Festival** — §3.1. A second festival tradition, quarter-tied, revived, filmed.
- **Mɨchi Əbeŋ organising committee** — Fongoh P. Ayeh (head), Tebo Julius, Bandeh Godwill (2023).
- **Dance forms named in the sources beyond Musongong:** **Mukonge** (the site already carries a 2023 record on the clash of Mukonge dance groups, and a 6-photo album), **Kwem**, **Nkwem** (a Buea-based group performed at the Palace, filmed).
- **Masangon** — appears in the Bonn material as the dance performed at the diaspora gathering.
- **Ngon** — the 8-day-cycle market day, already published on the home page.

Terminology preserved exactly as sourced: **MENEMO** · **Mɨchi Əbeŋ** · **Masangon** ·
**Musongong** · **Mukonge** · **Kwem** · **Nkwem** · **Ngon** · **Ifuh Itah**
(spelling settled, R3). No cultural description has been expanded, interpreted or
generated — where a source gives one line, one line is what is recorded.

---

# 12. DEVELOPMENT / PROJECTS — STATUS FROM THE NEW SOURCES

| Project | Site status | Fresh evidence | Recommended status |
|---|---|---|---|
| Guneku Agro CIG | LIVE (2026) | Minutes confirm launch, share offer, poultry as first project | **ACTIVE** — unchanged |
| Solar electrification Phase II | ONGOING, €800 | Minutes: contributions continuing, no target stated | **ACTIVE** — do not publish a progress bar; no target exists in any source |
| GUNECCUL | ACTIVE (2022) | 4 branches all dated and operational | unchanged |
| Royal Community Library | ACTIVE (2021) | Custodian named; used for scholarship registration | unchanged |
| Tonmukom–Windik Road | COMPLETED (2021) | 38-photo album exists | unchanged |
| Fringyeng (Oko) hydro plant | REBUILD NEEDED | Builder and funder named; **no rebuilding plan in any source** | **STATUS UNKNOWN on rebuild** — say so plainly |
| Open Door eye unit | HISTORICAL (2021) | Clinic reopened with Palace funding; echography machine 30 Jul 2021 | **REVIEW** — the clinic is more active than "historical" implies |
| Afor Foundation Scholarship | ANNUAL, 1,000,000 FCFA | 2022 award 470,000 FCFA; 2025 exam drew 200 pupils | unchanged, both already published |
| Medical Reference Centre | PROPOSED (2026) | Minuted at Bonn, 28 Mar 2026 | **PROPOSED** — unchanged. Publish at its own supported status; do not equate with, or distinguish from, Guneku Medical Center |
| Guneku Medical Center | Not a register entry | Requisition, 25 Mar 2026 — laboratory and surgical theatre, recruiting | **NEW — DOCUMENTED AS EXISTING (25 Mar 2026)**. Facility record publishable; vacancy held |
| Soap production | PROPOSED (2026) | Minutes confirm as proposed | unchanged |
| Satellite internet at the Palace | PROPOSED (2026) | Minutes: Ni Sam; adult training in content creation, digital work, online income | unchanged; training detail can merge |
| Digital empowerment training | PROPOSED (2026) | as above | unchanged |
| Mbengeghang water project | Not a register entry | Delivered 2025 per the GUDECA EU President's address (**already published on the site**) | consider promoting to the register — **COMPLETED 2025** |
| FUN electricity project | Not a register entry | Contributed to in 2025, same source | consider adding — **ONGOING** |
| Wumnembug–Njinebai bridge | Not on the site | Blog, 4 May 2025 — built by **Mbengwi Council**, handed over at the April 2025 WUCUDA AGM | **NEW — COMPLETED 2025.** A **separate** project from the GUYODECA bridge (R4) |
| GUYODECA bridge | On `/gudeca/guyodeca`, completed 2025 | Guneku youth project | unchanged — **separate project** (R4) |
| Water supply / Ngong | Recorded as an open issue | Published 5 Jun 2026 | unchanged — good practice, keep it |

---

# 13. EDUCATION

Checked against the live `/education` page first, which is current and detailed
(Information Day 29 Aug 2026; Selection Examination 19 Sep 2026; 50 scholarships;
registration on 670 949 503 via the Library; six opportunity categories; explicit
outreach to Muslim and underserved communities and to families displaced by the
crisis; the St Thierry / MEDPHISATG video embedded).

**Already covered — no action:** Scholarship Day 2026, the corrected flyer, the St
Thierry visit, MEDPHISATG, the Afor Foundation (2022 and 2025 records), the Holiday
Workshop 2026, the GS Guneku ex-pupils donation drive.

**New:**
- **PS Guneku common entrance results, 2021** (blog) — archive-grade
- **Guneku Scholarship Offer, 2024** — video `D3mqdfN7AsI`, unpublished
- **Holiday Workshop convener** — **Vitalis Ngwa (Epenghefon)**; fee 3,000 FCFA; 2nd edition, 11–21 Aug 2026 — *already on the site*, listed here only to confirm the check
- **Two government secondary schools** (G.S.S. Guneku, G.S.S. Ngamungeh) and **seven government primary schools** — already on `/kingdom/about-guneku`; no per-school records exist anywhere yet

---

# 14. NEWS CANDIDATES — RANKED

**HIGH — current, sourced, and materially missing**
1. Ifuh Itah / Fringyeng Yam Festival, 2025 edition
2. The health estate — three facilities, with the documentaries
3. Guneku Medical Center — **the facility record publishes now**; the doctor vacancy is held pending status verification
4. Mujang Berto Prince tournament final, 15 Aug 2026
5. Njindom parish priest exchange, 5 Jul 2026

**MEDIUM — recent, worth a record**
6. Wumnembug–Njinebai bridge, 2025
7. Tobho piggery, 2024
8. Rev. Ekole Alexander Netunda send-off, 23 Jun 2024
9. MEDA home at Mukonge, 2022
10. The Fon's letter after the Fringyeng arson, 8 Sep 2022 *(letter only)*

**ARCHIVE ONLY — fills the 2018–2021 gap in the record**
11. GUDECA Easter AGM, 2019
12. The Fon's PWD support and the Rainbow Radio microphones, 2019
13. Christmas with persons with disabilities, 2019
14. MECUDA renaissance, 2020
15. GUDECA-funded nurse at Munam, 2020
16. PS Guneku common entrance results, 2021
17. SHESA Silver Jubilee class orphanage donation, 2021 *(filmed)*
18. F.H.E.D benches and PWD donations, 2021–2022

---

# 15. ALREADY PUBLISHED — NO ACTION

Checked and confirmed present on the live site. Listed so the check is visible and so
nothing here gets rebuilt:

Bonn 28 Mar 2026 (with €800, 2,000 FCFA share, 9 countries, next meeting UK 24 Jul
2027, Sam Fongoh's StarLink proposal) · MEFU-MECUDA 29 Aug 2026 (19 Fons, 14 MECUDA
executives, 7 resolutions, Tomfon Isaac Fomunjong, HRH Prof. Fon Fombo) · Guneku Holiday
Workshop 2026 (2nd edition, 11–21 Aug, 3,000 FCFA, all five modules, convener named) ·
GS Guneku ex-pupils donation drive 1 Aug 2026 · the communications and anti-scam notice
15 Aug 2026 · Ngong stream rescue and the water shortage 5 Jun 2026 · GUDECA EU
President's address 31 Dec 2025 (Duisburg, solar lights, FUN electricity, Mbengeghang
water) · Afor Foundation scholarship examination 2025 (200 pupils) and award 2022
(470,000 FCFA) · Education & Scholarship Day 2026 in full, with the flyer and the St
Thierry video · Agro CIG with all three communiqués, GUNECCUL account 200637, 12.5M
FCFA Phase 1, livestock detail and farm development status · GUNECCUL with four dated
branches · GUDECA six pillars, six project cards, the EU officers · GUYODECA (bridge,
football, women-over-50 gifts) · the **27 quarters**, listed in full · ~15,000
population · MENEMO · Ngon market day and the 8-day cycle · Musongong · MEDIG /
Central Meta · the Palace timeline and the four charges · HRH Fon Fomuki Patrick Nji,
1938–2015, 50 years on the throne · Prof. Dr. Roland Teboh Forbang and Marcel Tabit
Akwe on `/diaspora` · the 15-album gallery index · Mɨchi Əbeŋ across several records ·
the 2016 Palace records (village council, minutes of meeting, public announcement,
GUDECA AGM Mutegene proposals) · the 2023 cluster (councillors installed, democracy in
Guneku, the Fon's North America visit, Meta cultural festival, MECUDA appreciation,
Mukonge clash) · Palace Renovation.

---

# 16. PRIVATE / DO NOT PUBLISH

| Withheld | Why |
|---|---|
| **Member names harvested from the four WhatsApp groups** | A private group is not a publication. Members gave their names to their group, not to the internet. ~12 names appear in no public source and must not be published, listed, indexed or made searchable. |
| **9 of the 14 Bonn stills** (`consent_flag: review`) — **HELD FOR FUTURE MEDIA REVIEW, not a publication blocker** | An individual is recognisable and prominent. Needs that person's agreement. The other 5 stills, the Bonn record and the public Bonn videos proceed without them. |
| **Any name attached to a face in the Bonn material** | Nobody in the room has confirmed the identifications. |
| **The Fringyeng arson dispute** | `[SENSITIVE]`. The Fon's own letter is publishable; the dispute is not. |
| **Touembeng attack (2018); Sang "pseudo-village" / Munam–Sang autonomy; farmer–grazier friction; crisis-era security incidents** | `[SENSITIVE]`. Land, autonomy and security are politically live. Palace clearance only. |
| **Internal GUDECA financial discussion from the groups** | Members' internal business. |
| **Personal mobile-money collection numbers** | The site already declines to publish these on the GS Guneku record — correct, and it should stay policy. |
| **Private video `2jS-ael4Ccg`** | Private on YouTube. Not ours to surface. |
| **The 11 personal mobile numbers in `src/data/pages/gudeca-exco2.json`** | The unrouted national EXCO roster carries a mobile number against each of eleven named officers. The site's own policy is not to publish personal collection numbers, and `institutions/business-directory.json` states the standard: *"Contact details withheld pending each owner's written consent."* **Publish the roster's names and offices; withhold every number until each officer consents.** (§0.3) |
| **`src/data/pages/gudeca-exco.json`** | Joomla sample data — "Martin Brandon", "Sarah Clarke", "Henry Collins", "Robert Bush". Not Guneku people. Never publish. (§0.3) |

**Not a withholding decision — a statement of current fact (§0.6b).** Fourteen `.mp4`
files, nine of them the **Bonn 28 March 2026** WhatsApp footage, plus ~180 photographs,
are tracked in git, deployed, and **publicly retrievable today** at
`/images/gallery/visit-to-fons-palace-by-eu-residents/` and four sibling folders
(verified: `222.mp4` → `200 video/mp4`). No page links to them. This document cannot
describe that footage as withheld while it is being served. **Marcel decides what happens
to it** — leave, link, or remove. It is recorded here so the decision is made knowingly.
| **Individual members' areas of origin as stated at the Bonn introductions** | Said in a meeting, not volunteered to a website. Collect again from the person. |

---

# 17. REAL OPEN QUESTIONS FOR MARCEL  *(Rev. 4 — repo-reconciled)*

Rev. 1 listed twelve. Rev. 2 resolved seven. Rev. 3 closed two more by applying the
brief's own directions. **Rev. 4 closes the entire "pending repo access" list by reading
the repository.** One genuine question remains, one optional factual follow-up, and one
new item that is a decision for Marcel rather than a question — the served Bonn media in
§16. **None of the three blocks the content work.**

## The question

**Q1 — Does the proposed Reference Healthcare Centre refer to an upgrade or expansion of
Guneku Medical Center, or is it an entirely separate future facility?**

Evidence narrows it and cannot close it. The requisition showing Guneku Medical Center
operating and recruiting is dated **25 March 2026**; the reference-centre proposal is
minuted at Bonn **28 March 2026**, three days later. MEDPHISATG is a third, separate
thing — a training programme hosted in the Palace.

Until Marcel answers: publish all three records at their **independently supported
status**, and assert neither identity nor separation between the Center and the proposed
Centre. **This does not block either record.**

## Optional factual follow-up

**Q2 — If Marcel knows what the "17 January 2016" date refers to, record it.**
It appears only on the home page and the Fon's profile and matches no source
(`[VERIFY — no supporting source found]`). **Correcting the public chronology to the
evidenced stages proceeds regardless** — this is a recovery of a possibly-real event,
not a gate.

## Not questions — reclassified

- **Bonn stills, nine flagged** → **HOLD / FUTURE MEDIA REVIEW.** A media-permissions
  matter, not a product decision. The other five stills, the Bonn record and the ten
  public Bonn videos proceed without them. No speaker is named on a guess.
- **The Fon's Fringyeng letter** → **cleared.** His own public statement; Marcel has
  directed that useful sourced Guneku content goes online. The underlying dispute stays
  excluded.
- **Vacancy status** → a verification task, not a decision. The **facility record**
  publishes now; the **advertisement** waits.
- **The served Bonn media (§0.6b, §16)** → **a decision for Marcel, not a question for the
  content gate.** Fourteen `.mp4` files — nine of them the Bonn 28 March 2026 WhatsApp
  footage — and ~180 photographs are tracked, deployed and publicly retrievable today at
  `/images/gallery/visit-to-fons-palace-by-eu-residents/` and four sibling folders. Leave,
  link or remove is his call. Recorded so the decision is made knowingly. It blocks nothing.
- **The eleven EXCO mobile numbers (§0.3, §16)** → a privacy rule already settled by the
  site's own policy: publish names and offices, withhold the numbers until each officer
  consents. Not a question.

## Closed by investigation (R1–R10), listed so nothing is re-asked

Ceremonial chronology (R1) · CIG certificate, OCR complete (R2) · Ifuh Itah spelling,
no variants (R3) · the two bridges, separate projects (R4) · chapters vs countries,
three metrics (R5) · register counts, a labelling defect (R6) · Fondom Studios,
reclassified (R7) · the medical picture, narrowed to Q1 (R8) · the 2021 Council roster,
publishable as dated history (R10).

## Repo access — **COMPLETE. This list is closed.**

All six items are answered in §0 and none of them needs Marcel:

- **338 gallery assets (R9)** → all 338 found in the repo (§0.1)
- **Fondom Studios (R7)** → already present, thin, *and* a full unrouted record exists (§0.2)
- **Unpublished / draft records** → found and enumerated, incl. the national EXCO roster,
  the Sons & Daughters listing and the business directory (§0.3)
- **Hidden / unused source data** → migration is clean; 180 photographs and 14 videos sit
  unreferenced under `public/` (§0.6)
- **The `/contact` number** → provenance settles it: `+237 681 19 46 64` (§0.5)
- **Every §3 MISSING call** → re-tested against the repo; all hold (§0.4)

**One new item goes to Marcel as a fact, not a question** (§16): the Bonn video files and
~180 photographs are deployed and publicly retrievable today. Leave, link or remove is his
call. It blocks no content work.

**The condition on an implementation brief is now satisfied** — canonical repo access
succeeded. No brief is produced here; that gate is ChatGPT's, then Marcel's.

---

# 18. PROPOSED CONTENT-ONLY CHANGESET

No code. No routes. No design. No implementation sequencing.

**MERGE INTO EXISTING**
- Bonn 2026 record ← 31 Mar 2026 re-registration deadline; Ma Rose; Mr. Fonjong; Festus Tanwi's report; the member-introductions detail. **Thadeus Fon is not new (§0.3)** — the minutes corroborate a repo record that is simply unrouted
- GUDECA EXCO ← **route `pages/gudeca-exco2.json`**, which already holds the full 12-member national roster including Thadeus Fon as National President. **Names and offices only — withhold the eleven mobile numbers (§16).** Never publish `pages/gudeca-exco.json`, which is Joomla sample data
- Fringyeng plant ← built by Kasi Rhex Ndeh, funded by Dr. Kasi Elvis, known as the Oko plant
- Royal Community Library ← Sango Della, as recorded in 2021
- Mɨchi Əbeŋ ← organising committee (Fongoh P. Ayeh, Tebo Julius, Bandeh Godwill) + six films
- Palace ← Queen Fomuki Carine; the Ngam-Fon title; Ardo Alhaji Hassan Djibo; Fons Against AIDS (2003)
- Traditional Council ← the 2021 roster, published as dated history — "as recorded in 2021". No claim that it is the current roster (R10)
- ~~Development register ← Mbengeghang water and FUN electricity~~ — **WITHDRAWN (§0.7 item 4): both are already in the register**, entries 15 and 16 of `current-notices.json`, classed `Historical`. If anything is wanted here it is a status review, not a merge
- Agro CIG ← full legal name, certificate number, issuing authority, legal basis, registration place (R2)
- The late Fon's biography ← born 2 Jan 1938, twin, R.C. Mission School Gom, tailor, acceded 1965 at 27, parents named (R1)
- Every existing topic page ← its videos, per §7

**NEW RECORDS**
- Ifuh Itah / Fringyeng Yam Festival, and its 2025 edition — spelling confirmed, three editions with video (R3)
- Three health facility records + the GUDECA USA nurse posting
- F.H.E.D institution record
- Mujang Berto Prince tournament final, 15 Aug 2026
- Njindom parish priest exchange, 5 Jul 2026; Rev. Ekole send-off, 23 Jun 2024
- The Fon's letter after the Fringyeng arson — **cleared**; the dispute stays excluded
- Wumnembug–Njinebai bridge — confirmed a **separate** project from the GUYODECA bridge (R4)
- Guneku Medical Center — **facility record publishable now** at its supported status; the **vacancy** is held pending status verification. Neither equate it with, nor separate it from, the proposed Reference Healthcare Centre (Q1). MEDPHISATG is a third, distinct thing — training, already represented via `/education`
- The 2018–2021 archive records in §14

**CORRECT**
- Publish the evidenced ceremonial stages (1965 · 28 Jan 2015 · 27 Feb 2015 · Nov 2015 · 30 Dec 2016) and remove or correct the unsupported "17 January 2016 coronation" — `[VERIFY — no supporting source found]` (R1)
- The register label arithmetic — add a `class` field and state which filter each view applies (R6). Not a Marcel decision. **And note §0.7 item 3: the home page and `/projects` read two different sources, so the register must become the single source before the labels mean anything**
- The `/contact` telephone — **RESOLVED (§0.5): the Palace number of record is `+237 681 19 46 64`.** The card literal `681 19 46 46` has no source anywhere in the corpus. No longer pending anything
- Label the three chapter/country metrics as what they are: 8 chapters · 9 countries at Bonn · 12–13 locations (R5)
- The `/indigenes` quarter filter: 17 options → 27
- `/kingdom/about-guneku`: present ~10,000 as historical, not as a live inconsistency; resolve 31 vs 29 Meta communities
- Open Door: reconsider HISTORICAL

**MEDIA TO ATTACH**
- 5 cleared Bonn stills → the existing Bonn record **now**; 9 held for future media review, blocking nothing
- 45 videos → their existing topic records
- The 338 gallery photographs → the 15 existing albums. **NOT PENDING — all 338 are in the repo (§0.1).** Two internal causes to note for whoever implements: 299 files sit outside `public/`, and both gallery components render `ImagePlaceholder` without reading the image paths
- A further **180 photographs and 14 videos** already under `public/` and referenced by nothing (§6.4b) — an unindexed body of Palace photography, and a media-governance fact in §16

**DO NOT TOUCH**
- The 27 quarters, ~15,000 population, MENEMO, MEDIG, Ngon, Musongong — settled SOF
- `/education` — current, detailed and correct
- `/agro-cig` — the most complete page on the site
- The Village Square voice and structure — it works
- The visual direction — decided separately, and out of scope for this pass
- The evidence discipline in the register (PROPOSED stays PROPOSED) — it is the site's best quality
- The policy of not publishing personal collection numbers

---

**END OF REV. 4. Repo reconciliation COMPLETE — all six checks closed in §0, read-only,
no production code, content, architecture or design touched. No build instructions
produced and no CC brief. Awaiting the ChatGPT content gate, then Marcel's answer to Q1
and his decision on the served Bonn media in §16.**
