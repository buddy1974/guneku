# Staged archive material — preserved, not served, not yet classified

Everything under this directory is Guneku Fondom material that the archive **has** but has
not yet **placed**. It is version-controlled so it cannot be lost, and it is outside
`public/` so the server does not hand it out while its classification is still open.

**This is not `archive-held/`.** Held material has a decision behind it: the record says it
must not be published, and `archive-held/README.md` explains why. Staged material has no
decision behind it yet. The two directories look alike and mean opposite things:

| | `archive-held/` | `archive-staging/` |
|---|---|---|
| Classification | decided — **do not publish** | **not yet made** |
| Why it is out of `public/` | publishing it would be wrong | nobody has decided yet |
| Route out | the owner unholds it | the owner classifies it, then it is catalogued |

---

## Why staging exists at all

R-007 taught the archive that **absence from a catalogue is not unreachability**: a file
inside `public/` is served whether or not any page links to it. Before 2026-09-06 these four
directories were in no album, no search index, no sitemap and no page — and every one of
their 163 files answered a direct request with `200 image/jpeg`.

Nothing about that was a leak. The material is Fondom material and no page hid it from
anyone. It was simply *undecided material that the server was handing out anyway*, with no
album, no caption, no context and no way for a reader to correct it. Staging is where
undecided material waits, and the wait is now visible instead of accidental.

---

## What is here

All four directories were moved out of `public/images/gallery/` on 2026-09-06 with `git mv`,
which recorded all 163 files as pure renames. SHA-256 of every file verified identical
before and after. Filenames, grouping and byte content unchanged. Nothing was compressed,
re-encoded, renamed, described or sent to any model.

### `coronation/` — 58 files, 14.8 MB

No file-identity relationship with any published album. Not one byte-identical match, not
one shared filename across all 338 catalogued photographs. Its filenames come from a source
posting entirely distinct from the album **The Coronation of HRH Fon Fomuki Walters**, whose
photographs are catalogued and published.

The directory name is a filesystem label. It is not evidence that these photographs show a
coronation, and it is certainly not evidence of *which* stage of the succession they show —
the Palace record deliberately keeps those stages distinct.

### `enthronement/` — 40 files, 4.4 MB

Same finding: no byte match and no filename match anywhere in the catalogue.

The Fondom record already uses the word *enthronement* for a specific thing — 27 February
2015, the return and the Transfiguration anointing, recorded in
`src/data/palace/fon-walters-profile.json` as `enthronementDate`. Treating this directory as
that occasion would assert a date. Nothing in the files supports one.

### `prince-tibahs-bornhouse-bonn/` — 36 files, 5.8 MB

The one directory with real file-identity evidence. 18 of its files carry the **same source
filename** as photographs already published in
`prince-fomuki-tibahs-bornhouseinimages` — the same photographs, at roughly 1.6× the pixel
dimensions of the copies the site serves. That is not a coincidence of naming; it makes this
directory a superset of that album's source material.

One further file — `37973461_1985263558184564_…` — sat *inside* the published album's own
source-id range, between two of its catalogued photographs. That one was reconciled into the
album on 2026-09-06 and is no longer here. It is the only image this reconciliation published.

The 18 that remain divide into two groups, and the difference between them is the whole
question:

- **16 files** from a second, adjacent source posting. Their identifiers interleave with the
  album's, so the two postings were made in the same period — but they are a different
  posting, and "uploaded minutes apart" is not "photographed at the same occasion."
- **1 file** just outside the album's range, same era.
- **1 file** from an entirely different era — roughly thirteen times further along the same
  identifier sequence, matching `coronation/` and `enthronement/` rather than this album.
  Whatever it is, it is not from this set.

### `guneku-dmv-welcomefomuki/` — 28 files, 11.3 MB

Tracked in git the whole time, as `public/images/gallery/Guneku-DMV-WelcomeFomuki` — with
capitals. Windows does not distinguish the two spellings and Linux does, which is why a local
listing and the git index disagreed, and why a lowercase URL returned 404 while the
capitalised one returned 200. All 28 were deployed and publicly retrievable.

One file is the same photograph as one already published in the **GUDECA USA** album, at
2048×2048 against the 600×600 copy the site serves. The other 27 come from a much later
source posting than that album, which records an event of 29 July 2023. A later posting can
of course carry older photographs, so this neither confirms nor denies the connection — and
one shared photograph out of 28 is not enough to publish 27 more under that album's date.

---

## Rules for anything in here

- **Do not publish it by moving it back into `public/`.** A photograph becomes public by
  being catalogued in `src/data/gallery/image-gallery.json` — an album, a count, a page and
  a correction route. A file that is merely reachable is not published; that was the lesson.
- **Do not describe it.** Nothing here has been sent to any model. The description pipeline
  (`src/scripts/describe-archive.ts`) reads only from `image-gallery.json`, which does not
  reference this directory.
- **Do not date it, name it or place it from its directory name or its pixels.** Every
  classification here waits on the owner, on a source the archive can cite, or on a community
  correction through `/my-guneku/contribute/new`.
- **Do not delete it.** Staged is not discarded.

Classifying something is a deliberate act: the owner says what it is, a source supports it,
it is catalogued, and only then does it move.
