import Anthropic from '@anthropic-ai/sdk'
import * as dotenv from 'dotenv'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

dotenv.config({ path: '.env.local' })

/* Draft neutral descriptions for a small, named sample of archive photographs.
 *
 * ── This is a script, not a route ────────────────────────────────────────────────────────
 *
 * Deliberately. There is no endpoint that describes an image on request: that would be an
 * unauthenticated way to spend money, and it would let a description reach a page without a
 * person having read it. Descriptions are drafted here, by hand, and become public only when
 * somebody approves them in a commit.
 *
 * ── Never in bulk ────────────────────────────────────────────────────────────────────────
 *
 * The script refuses to run without an explicit list of image ids. There is no --all, and
 * adding one would be the wrong shape: 338 generated descriptions arriving at once is 338
 * things nobody has read, and the review that makes this safe would become a formality.
 *
 *   npm run archive:describe -- developmentprojects-001 developmentprojects-002
 *
 * Images are read from disk and sent as base64. They are already public files served from
 * guneku.org, ~59 KB each; nothing private is on the filesystem path this reads.
 *
 * ── What the model is asked for, and what it is forbidden ────────────────────────────────
 *
 * See PROMPT. It describes what is visible. It is told, in the strongest terms the prompt can
 * carry, not to name anybody, not to date anything, not to name an event or a place, and not
 * to guess at a relationship or a title. Where it cannot describe without speculating, it is
 * told to say less rather than more. */

const ROOT = process.cwd()
const NOTES_PATH = join(ROOT, 'src', 'data', 'gallery', 'image-notes.json')
const GALLERY_PATH = join(ROOT, 'src', 'data', 'gallery', 'image-gallery.json')

/** Never sent to the model as an instruction it could be talked out of — this is the whole
 *  content of the request, and the image is the only other thing in it. */
const PROMPT = `Describe what is visible in this photograph, for an archive catalogue.

Write ONE sentence, at most twenty-five words, in plain British English.

Describe only what is in the frame: how many people (approximately), what they appear to be
doing, the setting, and obvious objects. For example: "Several people seated outdoors beneath
a canopy, with a drummer standing at the left."

You must NOT:
- name any person, or say who anyone is
- say that two people are related, or married, or family
- give anyone a title, office, rank or role
- name an event, ceremony, festival or occasion
- name a place, village, town, country or building
- give a date, year, decade or period
- say what anyone is celebrating, mourning, or attending
- say who owns anything
- guess at anyone's age, status, health, wealth or importance
- describe anyone's appearance beyond what is needed to say what is happening

If you cannot describe the scene without breaking one of those rules, describe less. A short,
plain description is correct. A rich one that guesses is not.

Return the sentence and nothing else — no preamble, no quotation marks, no explanation.`

type GalleryImage = {
  id: string
  filename: string
  publicPath?: string
  caption?: string | null
  title?: string | null
}

function loadImages(): Map<string, GalleryImage> {
  const g = JSON.parse(readFileSync(GALLERY_PATH, 'utf-8')) as {
    albums: Array<{ images?: GalleryImage[] }>
  }
  const map = new Map<string, GalleryImage>()
  for (const album of g.albums ?? []) {
    for (const img of album.images ?? []) map.set(img.id, img)
  }
  return map
}

const MEDIA: Record<string, 'image/jpeg' | 'image/png' | 'image/webp'> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
}

async function describe(client: Anthropic, img: GalleryImage): Promise<string | null> {
  if (!img.publicPath) return null

  const ext = img.filename.split('.').pop()?.toLowerCase() ?? ''
  const media = MEDIA[ext]
  if (!media) {
    console.error(`  ${img.id}: unsupported file type .${ext}, skipped.`)
    return null
  }

  const bytes = readFileSync(join(ROOT, 'public', img.publicPath))

  const res = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 200,
    output_config: { effort: 'low' },
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: media, data: bytes.toString('base64') } },
        { type: 'text', text: PROMPT },
      ],
    }],
  })

  if (res.stop_reason === 'refusal') {
    console.error(`  ${img.id}: the model declined to describe this image.`)
    return null
  }

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text).join(' ').trim()

  return text || null
}

async function main() {
  const ids = process.argv.slice(2).filter(Boolean)

  if (ids.length === 0) {
    console.error(
      'Name the images to describe. There is no bulk mode, on purpose:\n' +
      '  npm run archive:describe -- developmentprojects-001 developmentprojects-002\n',
    )
    process.exit(1)
  }
  if (ids.length > 12) {
    console.error(`Refusing ${ids.length} images in one run. Describe a sample, review it, then continue.`)
    process.exit(1)
  }
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    console.error('ANTHROPIC_API_KEY is not set in .env.local. Nothing was sent and nothing changed.')
    process.exit(1)
  }

  const images = loadImages()
  const file = JSON.parse(readFileSync(NOTES_PATH, 'utf-8')) as {
    notes: Record<string, unknown>
  }

  const client = new Anthropic()
  let written = 0

  for (const id of ids) {
    const img = images.get(id)
    if (!img) { console.error(`  ${id}: not in the archive record, skipped.`); continue }

    /* A caption the Fondom wrote already answers this. Spending a request to second-guess it
       would be both wasteful and wrong. */
    if (typeof img.caption === 'string' && img.caption.trim()) {
      console.log(`  ${id}: the archive already captions this one, skipped.`)
      continue
    }

    const text = await describe(client, img)
    if (!text) continue

    file.notes[id] = { description: text, status: 'draft', source: 'ai' }
    written++
    console.log(`  ${id}: ${text}`)
  }

  writeFileSync(NOTES_PATH, JSON.stringify(file, null, 2) + '\n', 'utf-8')

  console.log(
    `\n${written} draft${written === 1 ? '' : 's'} written to image-notes.json.\n` +
    'Every one is status "draft" and appears nowhere on the site.\n' +
    'Read each against its photograph, then change status to "approved" in a commit.',
  )
}

main().catch(err => {
  /* Never the provider's message: it can carry a key fragment, an account id or a quota. */
  console.error('Description run failed. Nothing further was written.')
  if (process.env.NODE_ENV !== 'production') console.error(err)
  process.exit(1)
})
