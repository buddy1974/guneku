import notes from '@/data/gallery/image-notes.json'

/* Descriptions of what a photograph shows — and the wall between that and what Guneku knows.
 *
 * ── The distinction this module exists to hold ───────────────────────────────────────────
 *
 *   FACTUAL METADATA   who is in a photograph, when it was taken, what event it records,
 *                      where it was, who supplied it. Facts about Guneku. They live in the
 *                      canonical archive record, they are written by people, and nothing
 *                      here can create one.
 *
 *   DESCRIPTION        what is visible in the frame. An observation about an image. It lives
 *                      here, it is marked with its source, and it is never evidence for a
 *                      claim about the Fondom.
 *
 * Blurring those two is the failure this whole phase is about. "Members of the Traditional
 * Council at the 2019 festival" asserts an identity, a body, an event and a year that no
 * photograph can establish. "Several people seated outdoors beneath a canopy" asserts what
 * is in the picture. Only the second kind may be generated.
 *
 * ── The same pattern as the film record ──────────────────────────────────────────────────
 *
 * `video-overrides.json` already solved this shape for Guneku TV: the source record stays as
 * evidence, an editorial layer wins over it, and a `held` state removes anything from every
 * public surface. This is that pattern applied to photographs, deliberately — a second,
 * different mechanism for the same problem would be one more thing to keep in step.
 *
 * ── Nothing is public by default ─────────────────────────────────────────────────────────
 *
 * A note is `draft` until a person approves it in a commit. A draft appears on no page and in
 * no index. A photograph with no note shows no description at all, which is the honest state
 * for the great majority of the archive and is not a gap to be filled by guessing. */

export type NoteStatus = 'draft' | 'approved'
export type NoteSource = 'ai' | 'human'

export type ImageNote = {
  description: string
  status: NoteStatus
  source: NoteSource
  reviewedOn?: string
}

type NotesFile = { notes: Record<string, ImageNote> }

const NOTES = (notes as unknown as NotesFile).notes ?? {}

/** The note for an image, whatever its state. For tooling and tests, never for a page. */
export function rawNote(imageId: string): ImageNote | null {
  return NOTES[imageId] ?? null
}

/** The description a visitor may see: approved only, and never where the archive already
 *  holds a caption of its own — a person's words outrank a generated observation. */
export function publicDescription(image: {
  id: string
  caption?: string | null
  title?: string | null
}): { text: string; source: NoteSource } | null {
  const note = NOTES[image.id]
  if (!note || note.status !== 'approved') return null
  if (!note.description?.trim()) return null

  /* The canonical record wins. If the Fondom captioned this photograph, that caption is what
     the page shows, and the note is not needed. */
  if (typeof image.caption === 'string' && image.caption.trim()) return null

  return { text: note.description.trim(), source: note.source }
}

/** Counted for the archive's own honesty, and for the report. */
export function noteCoverage(): {
  total: number; approved: number; draft: number
} {
  const all = Object.values(NOTES)
  return {
    total:    all.length,
    approved: all.filter(n => n.status === 'approved').length,
    draft:    all.filter(n => n.status === 'draft').length,
  }
}

/* ── What the archive does not record ────────────────────────────────────────────────────
 *
 * Stated per photograph rather than hidden, and stated as an absence rather than filled in.
 * The wording is deliberately about the *record*, not about the picture: "not yet identified
 * in the published Guneku record" is true and complete, where "unknown people" would imply
 * that identifying them is this system's job. It is not — it is the community's, through
 * Contributions.
 *
 * Nothing here ever says a person is unidentified *because a model could not identify them*.
 * No model is asked. */
export const UNIDENTIFIED_PEOPLE =
  'People in this photograph have not yet been identified in the published Guneku record.'

export const UNKNOWN_DATE =
  'The date of this photograph is not recorded beyond the album it belongs to.'

/** Where a member goes to supply what the archive is missing about an album. Reuses the
 *  Contributions workflow — there is no second submission system, and a submission is
 *  reviewed rather than published. */
export function contributeAlbumHref(albumTitle: string): string {
  const target = encodeURIComponent('/gallery/images')
  return '/my-guneku/contribute/new'
    + '?type=photo-archive'
    + `&targetType=page&targetId=${target}`
    + `&about=${encodeURIComponent(albumTitle)}`
}
