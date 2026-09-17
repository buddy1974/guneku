import { JsonLd } from './JsonLd'
import { graph, pageNodes, type Crumb, type Node } from '@/lib/schema'

type Props = {
  /** Site-root-relative, and the same string the page's canonical uses. */
  path: string
  name: string
  description?: string
  /** Everything above this page, Home excluded — `breadcrumbNode` adds that. */
  trail?: Crumb[]
  about?: string
  primaryEntity?: string
  image?: string | null
  datePublished?: string | null
  dateModified?: string | null
  /** The entity this page describes, where it describes one: a person, a business. */
  nodes?: Array<Node | undefined>
}

/* One page, one script tag.
 *
 * The root layout declares the organisation, the site and the village; this adds the page
 * itself and the trail to it, and whatever entity the page is about. Split that way because
 * the first three are identical on all three hundred pages and the rest never are — and
 * because a graph works by shared `@id`s, so a page can say `about: PLACE_ID` and have said
 * something true without describing the village a second time.
 *
 * `path` is passed rather than read from the router: this renders on the server, and the
 * canonical URL a page declares in its metadata and the one it declares here must be the
 * same string. A test checks that they are. */
export function PageGraph({ path, name, description, trail, about, primaryEntity,
                            image, datePublished, dateModified, nodes = [] }: Props) {
  return (
    <JsonLd data={graph(
      ...pageNodes({
        path, name, description, trail, about, primaryEntity,
        image: image ?? undefined, datePublished, dateModified,
      }),
      ...nodes,
    )} />
  )
}
