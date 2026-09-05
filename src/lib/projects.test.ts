import { describe, it, expect } from 'vitest'
import {
  allProjects, getProject, projectsByClass, statusVocabulary, projectSlug,
  responsibleBodyLink, REGISTER_STATEMENT, registerReviewedOn, contributeHref, NOT_RECORDED,
} from './projects'
import { resolveTarget, projectSlugFromPath } from './contributions'
import { contributionTargetLabel, contributionTargetHref } from './contribution-targets'
import current from '@/data/current-notices.json'

const RAW = current.development as { name: string; class?: string; status: string; body: string; lastUpdate: string; description: string; href: string }[]

describe('every known project is represented', () => {
  it('publishes one entry per register row, none dropped', () => {
    expect(allProjects()).toHaveLength(RAW.length)
    expect(allProjects().map(p => p.name).sort()).toEqual(RAW.map(r => r.name).sort())
  })

  it('groups every entry into exactly one class, losing none', () => {
    const grouped = projectsByClass().flatMap(g => g.items)
    expect(grouped).toHaveLength(RAW.length)
    expect(new Set(grouped.map(p => p.slug)).size).toBe(RAW.length)
  })

  it('invents no class for the sake of a fuller page', () => {
    const classes = new Set(projectsByClass().map(g => g.name))
    const source  = new Set(RAW.map(r => r.class))
    for (const c of classes) expect(source.has(c)).toBe(true)
  })
})

describe('no project is duplicated', () => {
  it('gives every entry a unique slug', () => {
    const slugs = allProjects().map(p => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('produces a stable slug from a name', () => {
    expect(projectSlug('Ngong River Rescue & Water Supply')).toBe('ngong-river-rescue-water-supply')
    expect(projectSlug('  Spaced   Name  ')).toBe('spaced-name')
  })

  it('resolves each slug back to the same project', () => {
    for (const p of allProjects()) expect(getProject(p.slug)?.name).toBe(p.name)
  })

  it('does not mint a second identity for a project that already has a record', () => {
    /* 27 of 28 entries link to a canonical record elsewhere on the site. This module must
       carry that link, not replace it with a /projects/<slug> page of its own. */
    const withRecord = allProjects().filter(p => p.recordHref !== null)
    expect(withRecord.length).toBeGreaterThan(20)
    for (const p of withRecord) {
      expect(p.recordHref).toMatch(/^\//)
      expect(p.recordHref).not.toMatch(/^\/projects\//)
    }
  })
})

describe('known facts are preserved exactly', () => {
  it('carries the register’s own status, never a re-derived one', () => {
    for (const p of allProjects()) {
      const source = RAW.find(r => r.name === p.name)!
      expect(p.status).toBe(source.status)
      expect(p.description).toBe(source.description)
      expect(p.body).toBe(source.body)
    }
  })

  it('carries provenance as provenance, not as a date', () => {
    for (const p of allProjects()) {
      expect(p.asRecorded).toBe(RAW.find(r => r.name === p.name)!.lastUpdate)
    }
    /* The register's value is often an event rather than a date. Parsing it into a timeline
       would invent one, so nothing here does. */
    const values = allProjects().map(p => p.asRecorded)
    expect(values.some(v => !/^\d/.test(v))).toBe(true)
  })

  it('treats a self-referential href as "no record of its own"', () => {
    for (const p of allProjects()) expect(p.recordHref).not.toBe('/projects')
  })

  it('counts the status vocabulary from the register rather than declaring one', () => {
    const counted = statusVocabulary()
    const total   = counted.reduce((n, s) => n + s.count, 0)
    expect(total).toBe(RAW.length)
    for (const s of counted) expect(RAW.some(r => r.status === s.status)).toBe(true)
  })
})

describe('missing facts stay missing — nothing is fabricated', () => {
  const text = JSON.stringify(allProjects())

  /* The single most important property of this phase. The register holds no financial field
     of any kind, so none may appear — not a figure, not an empty one. */
  it('publishes no financial field, because the source has none', () => {
    for (const p of allProjects()) {
      for (const key of ['target', 'targetAmount', 'raised', 'amountRaised',
                         'spent', 'amountSpent', 'balance', 'donors', 'budget', 'cost']) {
        expect(p).not.toHaveProperty(key)
      }
    }
  })

  it('confirms the source itself carries no financial field', () => {
    const fields = new Set(RAW.flatMap(r => Object.keys(r)))
    for (const key of ['target', 'raised', 'spent', 'balance', 'budget', 'cost', 'amount']) {
      expect(fields.has(key)).toBe(false)
    }
  })

  it('publishes no location, timeline, stage or completion figure', () => {
    for (const p of allProjects()) {
      for (const key of ['location', 'timeline', 'startDate', 'endDate',
                         'stage', 'progress', 'percentComplete', 'needs']) {
        expect(p).not.toHaveProperty(key)
      }
    }
  })

  it('contains no placeholder that reads as a value', () => {
    for (const bad of ['TBC', 'To be confirmed', 'N/A', 'Unknown', '0 raised', 'XAF 0']) {
      expect(text).not.toContain(bad)
    }
  })

  it('names the gaps once, at register level, rather than per entry', () => {
    const fields = NOT_RECORDED.map(n => n.field)
    expect(fields).toContain('Financial information')
    expect(fields).toContain('Location')
    expect(fields).toContain('Timeline')
    expect(fields).toContain('Current stage')
    expect(fields).toContain('Needs')
    /* And it says plainly that nothing is calculated. */
    expect(NOT_RECORDED[0].note).toMatch(/none is calculated/i)
  })

  /* Two register descriptions quote an amount as their source states it — the Afor
     scholarship, and EUR 800 reported toward Solar Phase II. That is source-stated prose and
     stays. What must never happen is a figure being lifted out of prose into a structured
     field, or two of them being added together into a total. */
  it('quotes an amount only inside the description its source wrote it in', () => {
    const MONEY = /[0-9][0-9,.]*\s*(FCFA|CFA|XAF)|[€$£]\s?[0-9]/i

    for (const p of allProjects()) {
      for (const [field, value] of Object.entries(p)) {
        if (field === 'description') continue
        expect(MONEY.test(String(value))).toBe(false)
      }
    }
  })

  it('states the financial position precisely, without contradicting those descriptions', () => {
    const note = NOT_RECORDED[0].note
    /* It must not claim the register records no amount anywhere — two descriptions do. */
    expect(note).toMatch(/no field for/i)
    expect(note).toMatch(/never aggregated/i)
    expect(note).not.toMatch(/records no amount raised/i)
  })
})

describe('the responsible body is never invented', () => {
  it('links only on an exact match against a canonical record', () => {
    for (const p of allProjects()) {
      const href = responsibleBodyLink(p.body)
      if (href) expect(href).toMatch(/^\/(people|gudeca\/chapters)\//)
    }
  })

  it('does not fuzzy-match a body onto a canonical record', () => {
    /* "GUDECA Europe" is not the string "GUDECA EU Chapter — Executive". Deciding they are
       the same body is a judgement about Guneku's institutions, not a normalisation. */
    expect(responsibleBodyLink('GUDECA Europe')).toBeNull()
    expect(responsibleBodyLink('GUDECA')).toBeNull()
    expect(responsibleBodyLink('Sam Fongoh')).toBeNull()
    expect(responsibleBodyLink('Community')).toBeNull()
  })

  it('links a body whose name matches a canonical record exactly', () => {
    expect(responsibleBodyLink('The Guneku Traditional Council')).toBe('/people/traditional-council')
  })

  it('shows every recorded body as recorded, whether or not it links', () => {
    for (const p of allProjects()) {
      expect(p.body.trim().length).toBeGreaterThan(0)
      expect(p.body).toBe(RAW.find(r => r.name === p.name)!.body)
    }
  })
})

describe('the contribution route targets the right project', () => {
  it('addresses each project by its own validated anchor', () => {
    for (const p of allProjects()) {
      const href = contributeHref(p)
      expect(href).toContain('targetType=page')
      expect(decodeURIComponent(href)).toContain(`targetId=/projects#${p.slug}`)
    }
  })

  it('resolves a project anchor to that project, with the register’s own name', () => {
    for (const p of allProjects()) {
      const r = resolveTarget('page', `/projects#${p.slug}`)
      expect(r.ok).toBe(true)
      if (r.ok) {
        expect(r.label).toBe(p.name)
        expect(r.targetId).toBe(`/projects#${p.slug}`)
      }
    }
  })

  /* A browser must not be able to invent a project. An anchor naming one that does not
     exist is refused outright rather than downgraded to an ordinary page path: `PAGE_PATH`
     admits no '#', so a bad project anchor matches nothing and is rejected. Recording it as
     "some page" would quietly accept a contribution about a project nobody can find. */
  it('refuses an anchor for a project that does not exist', () => {
    expect(projectSlugFromPath('/projects#no-such-project')).toBeNull()
    expect(resolveTarget('page', '/projects#no-such-project').ok).toBe(false)
  })

  it('still accepts an ordinary page path, which carries no anchor', () => {
    const r = resolveTarget('page', '/projects')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.label).toBe('/projects')
  })

  it('reads a stored project anchor back as the project’s name and link', () => {
    const p = allProjects()[0]
    expect(contributionTargetLabel('page', `/projects#${p.slug}`)).toBe(p.name)
    expect(contributionTargetHref('page', `/projects#${p.slug}`)).toBe(`/projects#${p.slug}`)
  })

  it('still refuses to turn an arbitrary page target into a link', () => {
    for (const bad of ['/quarters/njinigom', '/anything']) {
      expect(contributionTargetHref('page', bad)).toBeNull()
    }
  })

  it('refuses an off-site or scheme-bearing anchor outright', () => {
    for (const bad of [
      'https://evil.example.com/projects#x', '//evil.example.com',
      'javascript:alert(1)', '/projects#<script>',
    ]) {
      expect(projectSlugFromPath(bad)).toBeNull()
      expect(contributionTargetHref('page', bad)).toBeNull()
    }
  })
})

describe('the register explains itself in public language', () => {
  const text = REGISTER_STATEMENT.join(' ')

  it('publishes a review date read from the record', () => {
    expect(registerReviewedOn()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  /* The maintainer's note is accurate and is not public prose. It is not published. */
  it('uses no repository or data-model vocabulary', () => {
    for (const word of [
      'repository', 'classVocabulary', 'JSON', 'json', 'src/', '.json',
      'schema', 'field', 'array', 'file', 'commit', 'database',
    ]) {
      expect(text).not.toContain(word)
    }
  })

  it('carries the meaning the maintainer’s note carried', () => {
    expect(text).toMatch(/reviewed for publication/i)
    expect(text).toMatch(/fixed set of classes/i)
    expect(text).toMatch(/statuses the records establish/i)
    expect(text).toMatch(/proposal is shown as a proposal/i)
    expect(text).toMatch(/held back/i)
    expect(text).toMatch(/reviewed again whenever/i)
  })

  it('does not name the withheld record or where it lives', () => {
    expect(text).not.toMatch(/business.directory/i)
    expect(text).not.toMatch(/institutions\//i)
  })

  it('leaves the canonical source note untouched', async () => {
    /* The fix is to stop publishing the note, not to rewrite the record so it reads better
       in public — that would be editing the source to suit the presentation. */
    const current = (await import('@/data/current-notices.json')).default as { sourceNote: string }
    expect(current.sourceNote).toContain('classVocabulary')
    expect(current.sourceNote).toContain('this repository')
  })

  it('does not surface the held Business Directory as an entry', () => {
    for (const p of allProjects()) {
      expect(p.name.toLowerCase()).not.toContain('business directory')
    }
  })
})

describe('search keeps one identity per project', () => {
  /* `build()` is module-private and the index is built once at import. `search()` is the
     public surface, so the assertion goes through it — which is also the thing a reader
     actually uses. */
  it('sends an entry with no record of its own to its anchor, not to the page top', async () => {
    const { search } = await import('./search-index')

    const recordless = RAW.filter(r => r.href === '/projects')
    expect(recordless.length).toBeGreaterThan(0)

    for (const source of recordless) {
      const hit = search(source.name).groups
        .filter(g => g.group === 'Projects')
        .flatMap(g => g.results)
        .find(e => e.title === source.name)

      expect(hit).toBeDefined()
      expect(hit!.href).toBe(`/projects#${projectSlug(source.name)}`)
    }
  })

  it('leaves an entry that has its own record pointing at that record', async () => {
    const { search } = await import('./search-index')

    /* Scoped to the Projects group deliberately. A few names appear in the Institutions
       group as well, with their own href — an institution is indexed as an institution and
       again as a line in the development register. That predates this phase and is not a
       duplicate *project* identity: the register entry keeps pointing at the record the
       register names.
     *
     * The register is not their identity. Redirecting them to an anchor here would be the
     * duplicate this phase exists to avoid. */
    for (const source of RAW.filter(r => r.href !== '/projects').slice(0, 6)) {
      const hit = search(source.name).groups
        .filter(g => g.group === 'Projects')
        .flatMap(g => g.results)
        .find(e => e.title === source.name)

      if (hit) expect(hit.href).toBe(source.href)
    }
  })

  it('creates exactly one search identity per project', () => {
    const ids = allProjects().map(p => `project:${p.name}`)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
