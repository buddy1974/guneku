interface Props {
  body: string
  className?: string
}

/* Legacy article HTML, rendered under a page that already has its heading.
 *
 * Every page that uses this puts the article's title in a `PageHero`, which renders the
 * `<h1>`. Some of the migrated bodies carry an `<h1>` of their own — Joomla and WordPress
 * both allowed one inside the content — and the result was two first-level headings on the
 * same page. `/fondom/exhibitions` had "EXHIBITIONS" in the hero and "The People Receive
 * The Returning Fon" in the body.
 *
 * That is not a styling problem. A screen-reader user navigating by heading level hears two
 * documents where there is one, and the page's actual subject becomes ambiguous. So an `<h1>`
 * inside a body is demoted to `<h2>`, which is what it always was semantically: a heading
 * under the page's own.
 *
 * Deliberately narrow. It rewrites the tag and nothing else — the class, the id and every
 * other attribute are carried across untouched, so a body styled by the legacy CSS still
 * looks exactly as it did. It does not sanitise, and it is not a sanitiser: the bodies come
 * from the reviewed records in `src/data`, not from anything a visitor can write. */
function demoteStrayH1(html: string): string {
  return html
    .replace(/<h1(\s[^>]*)?>/gi, (_m, attrs) => `<h2${attrs ?? ''}>`)
    .replace(/<\/h1\s*>/gi, '</h2>')
}

/* An image that came across from Joomla without its file.
 *
 * `/palace/the-return-of-fon-fomuki-of-guneku` opens with `<p><img alt="" src=""></p>` — the
 * migration kept the element and lost the picture. It renders as a broken image above the
 * first sentence of the article, and `src=""` is worse than nothing: it is a URL, resolving
 * to the page itself, so some browsers fetch the document a second time to try to draw it.
 *
 * So an `<img>` with no usable `src` is dropped, and a paragraph left holding nothing is
 * dropped with it. Narrow like the rule above: an image WITH a source is untouched, whatever
 * else is wrong with it, and nothing else in the body is rewritten. This removes a hole in
 * the record's presentation, not anything the record says. */
function dropSourcelessImages(html: string): string {
  return html
    .replace(/<img\b[^>]*>/gi, tag => (/\ssrc\s*=\s*(["'])\s*\1/i.test(tag) || !/\ssrc\s*=/i.test(tag) ? '' : tag))
    .replace(/<p>(\s|&nbsp;)*<\/p>/gi, '')
}

export function ArticleBody({ body, className }: Props) {
  const html = dropSourcelessImages(demoteStrayH1(body || ''))
  return (
    <div
      className={`article-body ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
