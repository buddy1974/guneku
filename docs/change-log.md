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
