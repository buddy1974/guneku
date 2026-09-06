interface Props {
  body: string
  className?: string
}

/* Legacy article HTML, rendered under a page that already has its heading.
 *
 * Every page that uses this puts the article's title in a `PageHero`, which renders the
 * `<h1>`. Some of the migrated bodies carry an `<h1>` of their own — Joomla and WordPress
 * both allowed one inside the content — and the result was two first-level headings on the
 * same page. `/kingdom/exhibitions` had "EXHIBITIONS" in the hero and "The People Receive
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

export function ArticleBody({ body, className }: Props) {
  return (
    <div
      className={`article-body ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: demoteStrayH1(body || '') }}
    />
  )
}
