# Held archive material — not served, not published

Everything under this directory is Guneku Fondom material that the record classifies as
**held**. It is kept because it is part of the archive, and it is here rather than in
`public/` because `public/` is served unconditionally by Next.js.

**Nothing in this directory is reachable over HTTP.** That is the entire point of the
location. Moving a directory in here is how a `held` classification stops being a statement
in a comment and becomes a fact about what the server will hand out.

---

## Why this directory exists

The film record has had a `held` state since Guneku TV was built, and
`src/lib/guneku-tv.ts` documents it as the kill switch honoured by every public surface —
the watch hub, the homepage, the search index, the sitemap and the structured data.

That was true of the **catalogue**, and only of the catalogue. Material can be absent from
every album, every index and every page, and still be fetched by anyone who knows the URL,
because a file inside `public/` is served whether or not anything links to it.

On 2026-09-06 a verification sweep confirmed exactly that: a held file returned
`200 image/jpeg`, 269 KB, on a direct request. The classification and the behaviour
disagreed, and the behaviour was what mattered.

---

## What is here

### `visit-to-fons-palace-by-eu-residents/` — 17 files, 83.2 MB

The Bonn originals. `src/lib/guneku-tv.ts` records why they are held:

> their speakers and subjects are unconfirmed (R-007)

They are WhatsApp-era files, images and video together, and nobody has established who is
speaking in them or who appears in them. Publishing material in which people cannot be
identified — or, worse, captioning it by guesswork — is the failure the whole archive
policy exists to prevent.

Moved out of `public/images/gallery/` on 2026-09-06, byte-for-byte, filenames and grouping
unchanged. Every file verified by SHA-256 before and after: identical.

---

## Rules for anything in here

- **Do not move it back into `public/`** to make a page work. If a page needs it, the
  material needs a classification decision first, from the owner.
- **Do not describe it.** No file here has been sent to any model, and none should be. The
  archive description pipeline (`src/scripts/describe-archive.ts`) reads only from
  `image-gallery.json`, which does not reference this directory.
- **Do not catalogue it.** It is in no album, no search index, no sitemap and no Cited
  Palace AI source. Keeping that true is the point.
- **Do not delete it.** Held is not deleted. The record of a Fondom includes the material it
  has not yet been able to publish, and a decision to remove archive material belongs to the
  owner, not to a cleanup.

Unholding something is a deliberate act: the owner confirms the subjects, the material is
catalogued properly, and only then does it move.
