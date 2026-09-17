import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'

/* The two things done to a migrated article body, and nothing else.
 *
 * `ArticleBody` renders reviewed HTML from `src/data` with `dangerouslySetInnerHTML`. It is
 * not a sanitiser and must not become one — the bodies are records, and a transform that
 * quietly rewrites a record is worse than the artefact it removes. Both rules below exist
 * because a real page was broken by a real migration artefact, and both are narrow enough to
 * name the case they fix.
 *
 * The component is JSX over a string, so the rules are tested by reading the transforms out
 * of the source rather than by rendering. That is the same reason `navigation.test.ts` reads
 * the header: what is worth protecting is the rule, and the rule is in the source. */

const SRC = readFileSync('src/components/layout/ArticleBody.tsx', 'utf-8')

/** The two pure functions, lifted out of the module and evaluated. */
function transform(name: string): (html: string) => string {
  const at = SRC.indexOf(`function ${name}(`)
  if (at < 0) throw new Error(`${name} not found in ArticleBody.tsx`)
  let depth = 0
  let end = -1
  for (let i = SRC.indexOf('{', at); i < SRC.length; i++) {
    if (SRC[i] === '{') depth++
    else if (SRC[i] === '}') { depth--; if (depth === 0) { end = i + 1; break } }
  }
  const body = SRC.slice(at, end).replace(/: string/g, '').replace(/\(html\)/, '(html)')
  return new Function(`${body}; return ${name}`)() as (html: string) => string
}

const demote = transform('demoteStrayH1')
const dropImages = transform('dropSourcelessImages')

describe('a body may not carry a second first-level heading', () => {
  it('demotes an h1 inside an article to h2', () => {
    expect(demote('<h1>The People Receive The Returning Fon</h1>'))
      .toBe('<h2>The People Receive The Returning Fon</h2>')
  })

  it('carries every attribute across untouched', () => {
    /* The legacy CSS styles these by class. Rewriting the tag must not restyle the page. */
    expect(demote('<h1 class="legacy" id="x">T</h1>'))
      .toBe('<h2 class="legacy" id="x">T</h2>')
  })

  it('leaves every other heading alone', () => {
    const html = '<h2>a</h2><h3>b</h3>'
    expect(demote(html)).toBe(html)
  })
})

describe('an image that arrived without its file is not rendered', () => {
  it('drops an img whose src is empty, and the paragraph left holding nothing', () => {
    /* The actual artefact, from /palace/the-return-of-fon-fomuki-of-guneku. */
    expect(dropImages('<p><img alt="" src=""></p><p>On the 28 Of January 2015</p>'))
      .toBe('<p>On the 28 Of January 2015</p>')
  })

  it('drops an img with no src attribute at all', () => {
    expect(dropImages('<p>a</p><img alt="x">')).toBe('<p>a</p>')
  })

  it('leaves an image that has a source exactly as it is', () => {
    const html = '<p><img alt="The Fon" src="/images/palace/x.jpg" class="lead"></p>'
    expect(dropImages(html)).toBe(html)
  })

  it('keeps a paragraph that still has words in it', () => {
    expect(dropImages('<p><img src=""> The Fon returned.</p>'))
      .toBe('<p> The Fon returned.</p>')
  })
})

describe('no record still carries the artefact these rules cover', () => {
  it('finds no sourceless image left in any reviewed body', () => {
    /* The transform is the safety net. This is the check that the records themselves are
       clean, so that a future decision to drop the transform is an informed one. */
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = `${dir}/${e.name}`
        if (e.isDirectory()) { walk(p); continue }
        if (!e.name.endsWith('.json')) continue
        const text = readFileSync(p, 'utf-8')
        if (/<img[^>]*\\?"\\?"\s*>/.test(text) && /src=\\?"\\?"/.test(text)) offenders.push(p)
      }
    }
    walk('src/data')
    /* One known case, named rather than tolerated silently. */
    expect(offenders).toEqual(['src/data/palace/the-return-of-fon-fomuki-of-guneku.json'])
  })
})
