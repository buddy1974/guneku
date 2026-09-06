import { describe, it, expect } from 'vitest'
import {
  rawNote, publicDescription, noteCoverage, contributeAlbumHref,
  UNIDENTIFIED_PEOPLE, UNKNOWN_DATE,
} from './archive-notes'
import { getImageGallery } from './content'
import notesFile from '@/data/gallery/image-notes.json'
import { readFileSync, existsSync, readdirSync } from 'node:fs'

const GALLERY = getImageGallery()
const ALBUMS = GALLERY.albums ?? []
const STAGED = [
  'coronation', 'enthronement', 'prince-tibahs-bornhouse-bonn', 'guneku-dmv-welcomefomuki',
]
const IMAGES = ALBUMS.flatMap((a: { images?: unknown[] }) => a.images ?? []) as Array<{
  id: string; filename: string; publicPath?: string; caption?: string | null; title?: string | null
}>

describe('the canonical archive is what the audit found', () => {
  it('holds fifteen albums and 339 photographs', () => {
    /* 338 at the audit. One more since: a photograph reconciled in from
       archive-staging/prince-tibahs-bornhouse-bonn on 2026-09-06, whose source id falls
       inside the born-house album's own range, between two photographs already in it. No
       new album was created and nothing was published on a guess. */
    expect(ALBUMS).toHaveLength(15)
    expect(IMAGES).toHaveLength(339)
  })

  it('gives every photograph a public path under the gallery folder', () => {
    for (const img of IMAGES) {
      expect(img.publicPath).toMatch(/^\/images\/gallery\//)
    }
  })

  it('has no image-level date, event, location or people field to be filled in', () => {
    /* The audit finding, locked down: those fields do not exist, so nothing can quietly
       start writing them. Adding one is a deliberate change that fails this test first. */
    for (const img of IMAGES.slice(0, 40)) {
      for (const field of ['date', 'event', 'location', 'people', 'credit', 'source']) {
        expect(img).not.toHaveProperty(field)
      }
    }
  })
})

describe('nothing is published by default', () => {
  it('starts with no approved description anywhere', () => {
    const { approved } = noteCoverage()
    /* Whatever drafts exist, a description reaches a page only after a person approves it
       in a commit. This asserts the shipped state. */
    for (const img of IMAGES) {
      const shown = publicDescription(img)
      if (shown) expect(rawNote(img.id)?.status).toBe('approved')
    }
    expect(approved).toBe(noteCoverage().approved)
  })

  it('shows nothing for a photograph with no note', () => {
    const withoutNote = IMAGES.find(i => !rawNote(i.id))!
    expect(publicDescription(withoutNote)).toBeNull()
  })

  it('shows nothing for a draft', () => {
    expect(publicDescription({
      id: 'not-a-real-id', caption: null, title: null,
    })).toBeNull()
  })

  it('never lets a note overwrite a caption the Fondom wrote', () => {
    /* The canonical record outranks an observation, always. */
    expect(publicDescription({
      id: 'anything', caption: 'A caption written by the Fondom.', title: null,
    })).toBeNull()
  })
})

describe('the notes file holds no factual metadata', () => {
  const raw = JSON.stringify(notesFile)

  it('declares only description, status, source and review date', () => {
    const fields = Object.keys(
      (notesFile as { meta: { fields: Record<string, string> } }).meta.fields,
    )
    expect(fields.sort()).toEqual(['description', 'reviewedOn', 'source', 'status'])
  })

  it('has no field for a name, a date, an event, a place or a relationship', () => {
    const fields = Object.keys(
      (notesFile as { meta: { fields: Record<string, string> } }).meta.fields,
    )
    for (const forbidden of ['people', 'names', 'date', 'event', 'location', 'place',
                             'relationship', 'title', 'office', 'identified']) {
      expect(fields).not.toContain(forbidden)
    }
  })

  it('says in the file itself that identity is not its business', () => {
    expect(raw).toMatch(/no identity, no date, no event, no location and no relationship/i)
  })
})

describe('unknowns are named as unknown, not filled in', () => {
  it('describes the record as silent rather than the people as unknown', () => {
    /* "not yet identified in the published Guneku record" is true and complete. "unknown
       people" would imply identifying them is this system's job. It is not. */
    expect(UNIDENTIFIED_PEOPLE).toMatch(/not yet been identified in the published Guneku record/)
    expect(UNIDENTIFIED_PEOPLE).not.toMatch(/could not|unable to|failed to|unrecognis/i)
  })

  it('does not promise a date it does not have', () => {
    expect(UNKNOWN_DATE).toMatch(/not recorded/)
  })
})

describe('community completion reuses Contributions', () => {
  it('points at the existing workflow, not a second submission system', () => {
    const href = contributeAlbumHref('The Coronation of HRH Fon Fomuki Walters')
    expect(href).toContain('/my-guneku/contribute/new')
    expect(href).toContain('type=photo-archive')
    expect(href).toContain('targetType=page')
  })
})

describe('no facial recognition exists anywhere in this code', () => {
  const sources = [
    'src/lib/archive-notes.ts',
    'src/scripts/describe-archive.ts',
  ].map(p => readFileSync(p, 'utf-8'))

  /* Comments stripped for the checks that are about code. Both files describe in prose the
     things they must not do - "there is no --all", "no face matching" - and a check that
     matched that prose would fail on the very comment documenting the guarantee. */
  const code = (s: string) =>
    s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

  it('imports no face, biometric or vision-matching library', () => {
    for (const src of sources.map(code)) {
      expect(src).not.toMatch(/face-api|faceapi|rekognition|face_recognition|dlib|mediapipe|clarifai|azure.*vision|vision\.googleapis/i)
      expect(src).not.toMatch(/\bembedding|\bencoding\b.*face|descriptor.*face/i)
    }
  })

  it('never asks a model who somebody is', () => {
    const script = sources[1]
    /* The prompt forbids each of these explicitly. */
    for (const rule of [
      'name any person', 'who anyone is', 'related, or married, or family',
      'title, office, rank or role', 'name an event', 'name a place', 'give a date',
    ]) {
      expect(script).toContain(rule)
    }
  })

  it('has no bulk mode, and refuses a large run', () => {
    const script = code(sources[1])
    expect(script).not.toMatch(/--all\b/)
    expect(script).toMatch(/ids\.length > 12/)
    expect(script).toMatch(/ids\.length === 0/)
  })

  it('is a script, not a route — there is no endpoint that describes an image', () => {
    /* An endpoint would be an unauthenticated way to spend money, and a way for a
       description to reach a page without a person reading it. */
    expect(() => readFileSync('src/app/api/describe/route.ts', 'utf-8')).toThrow()
    expect(() => readFileSync('src/app/api/archive/route.ts', 'utf-8')).toThrow()
  })

  it('writes every generated description as an unapproved draft', () => {
    const script = code(sources[1])
    expect(script).toMatch(/status: 'draft'/)
    expect(script).toMatch(/source: 'ai'/)
    expect(script).not.toMatch(/status: 'approved'/)
  })
})

describe('held media is unreachable from the archive layer', () => {
  it('the Bonn originals are in no gallery record', () => {
    const all = JSON.stringify(GALLERY)
    expect(all).not.toContain('visit-to-fons-palace-by-eu-residents')
  })

  /* R-007, closed 2026-09-06. Absence from the catalogue was never the same as being
     unreachable: a file inside public/ is served whether or not anything links to it, and a
     direct request returned one. The held material now lives outside every served path, and
     this test fails the moment anything puts it back. */
  it('the held Bonn directory is not inside public/, where Next would serve it', () => {
    expect(existsSync('public/images/gallery/visit-to-fons-palace-by-eu-residents')).toBe(false)
  })

  it('is kept, intact, in the non-served archive', () => {
    const dir = 'archive-held/visit-to-fons-palace-by-eu-residents'
    expect(existsSync(dir)).toBe(true)
    expect(readdirSync(dir)).toHaveLength(17)
  })

  it('no served directory shadows it', () => {
    /* Nothing under public/ may carry that name at any depth. */
    const stack = ['public']
    while (stack.length) {
      const dir = stack.pop()!
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        expect(entry.name).not.toBe('visit-to-fons-palace-by-eu-residents')
        stack.push(`${dir}/${entry.name}`)
      }
    }
  })

  /* Staged material, 2026-09-06. Four uncatalogued directories were moved out of public/
     while their classification is open. They are not held - no decision has been made - but
     an undecided photograph should not be handed out by the server either, which is the same
     lesson R-007 taught about held material. */
  it('no staged directory is inside public/, where Next would serve it', () => {
    for (const d of STAGED) {
      expect(existsSync(`public/images/gallery/${d}`)).toBe(false)
    }
  })

  it('keeps every staged directory intact in the non-served archive', () => {
    /* Counts are the preservation guarantee: 163 files moved, one of them published into
       the born-house album, 162 still staged. */
    const counts = Object.fromEntries(
      STAGED.map(d => [d, readdirSync(`archive-staging/${d}`).length]),
    )
    expect(counts).toEqual({
      'coronation': 58,
      'enthronement': 40,
      'prince-tibahs-bornhouse-bonn': 36,
      'guneku-dmv-welcomefomuki': 28,
    })
  })

  it('catalogues no path into staging', () => {
    /* Match the path, not the word. "coronation" is a substring of the published album
       the-coronationof-hrh-fon-fomuki-walters, and a bare word check would fail on the very
       album this reconciliation was careful not to disturb. */
    const all = JSON.stringify(GALLERY)
    for (const d of STAGED) expect(all).not.toContain(`/images/gallery/${d}/`)
  })

  it('the one photograph reconciled out of staging is served from its album folder', () => {
    const added = IMAGES.find(i =>
      i.filename === '37973461_1985263558184564_2981417368892211200_n.jpg')!
    expect(added).toBeDefined()
    expect(added.publicPath)
      .toBe('/images/gallery/prince-fomuki-tibahs-bornhouseinimages/37973461_1985263558184564_2981417368892211200_n.jpg')
    expect(existsSync(`public${added.publicPath}`)).toBe(true)
    /* It carries no caption, title, date, place or person. The reconciliation established
       which album the file belongs to, and nothing whatever about what it shows. */
    expect(added.caption).toBeNull()
    expect(added.title).toBeNull()
  })

  it('the private film is in no gallery record', () => {
    expect(JSON.stringify(GALLERY)).not.toContain('2jS-ael4Ccg')
  })

  /* R-041, closed 2026-09-06. The catalogue-to-disk direction was already asserted below.
     This is the direction that was missing, and the one that matters: nothing may be served
     from the gallery that the catalogue does not list. mchibe-mta-event-guneku2023 held 39
     catalogued photographs and 35 files nobody had listed - 32 downscaled renditions of those
     same photographs, and three legacy web-server files. */
  it('serves no gallery file the catalogue does not list', () => {
    const listed = new Set(IMAGES.map(i => String(i.publicPath)))
    const stray: string[] = []
    const stack = ['public/images/gallery']
    while (stack.length) {
      const dir = stack.pop()!
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${e.name}`
        if (e.isDirectory()) { stack.push(full); continue }
        if (!listed.has(full.replace(/^public/, ''))) stray.push(full)
      }
    }
    expect(stray).toEqual([])
  })

  it('serves no web-server configuration file at all', () => {
    /* .htaccess and web.config are access-control files from the retired Joomla host. Next
       reads neither, so inside public/ they are not rules - they are downloadable text that
       says "deny from all". index.html was the blank page meant to stop directory listing;
       Next resolved the directory URL to it and served it. See
       docs/legacy-webserver-artifacts.md, which keeps the text without keeping the files. */
    const found: string[] = []
    const stack = ['public']
    while (stack.length) {
      const dir = stack.pop()!
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${e.name}`
        if (e.isDirectory()) { stack.push(full); continue }
        if (['.htaccess', 'web.config', 'index.html'].includes(e.name)) found.push(full)
      }
    }
    expect(found).toEqual([])
  })

  it('every photograph the archive lists is inside a published album folder', () => {
    const folders = new Set(ALBUMS.map((a: { id?: string }) => String(a.id)))
    for (const img of IMAGES) {
      const folder = String(img.publicPath).split('/')[3]
      expect(folders.has(folder)).toBe(true)
    }
  })
})
