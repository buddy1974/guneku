import {
  getAllUpdates, getAllPalaceArticles, getAllKingdomArticles, getAllInstitutions,
  type Update, type PalaceArticle, type KingdomArticle,
} from '@/lib/content'

/* The one place that decides whether a record may be shown to the public.
 *
 * Before this, the same exclusions were written out by hand in every surface that needed
 * them — the search index, the sitemap, and each new page — and the list had to be
 * remembered again every time. That is a losing arrangement: search is the surface that can
 * expose anything, and a held record no page links is still exposed the moment one surface
 * forgets. So the rules live here, each surface asks, and a new surface inherits every
 * exclusion by calling one function instead of recalling seven.
 *
 * ── Conservative, but not blunt ───────────────────────────────────────────────────────────
 *
 * "Uncertain means not public" is the rule. But a rule applied without regard to what a
 * record *is* causes its own damage: an early draft of this module required `publishedAt` on
 * everything under `palace/`, which would have dropped the reigning Fon's own profile page
 * from the sitemap — it carries no publication date because it is not a dated article.
 *
 * So the predicate is type-aware. A dated article must be dated. A profile, a register or an
 * institution is judged on its own terms. Being careful and being strict are not the same
 * thing, and confusing them hides real content.
 *
 * ── What is excluded, and by what evidence ────────────────────────────────────────────────
 *
 *   publicVisibility: 'hold'   the Business Directory, held pending separate owner approval
 *   noindex: true              the six empty Kingdom stubs — a result leading nowhere is
 *                              worse than no result
 *   a dated record with no publishedAt   not published; the content loaders do NOT filter
 *                              these themselves, which is the gap R-026 was about
 *   articles-index.json                  a legacy index that duplicates every update
 *
 * The last is excluded by never being loaded: no function here reads it, and no loader in
 * `content.ts` exposes it. It is listed so that a future contributor who finds the file knows
 * it was considered and rejected, not overlooked.
 *
 * Two more used to be on that list and are now deleted rather than excluded, on 2026-09-06.
 * `src/data/pages/gudeca-exco.json` held Joomla sample data — four fictitious names that are
 * not Guneku people (R-011) — and `src/data/about/` held nine dead duplicates of records that
 * live in `kingdom/` and `palace/` (R-012). Nothing read either, which is exactly why they
 * were dangerous: an unread file with four invented people in it is one careless import away
 * from publishing them. Both remain in git history if anybody ever needs to look.
 *
 * Films are NOT here. They have their own predicate, `approvedFilms()` in `guneku-tv.ts`,
 * because a film carries a lifecycle (discovered / reviewed / approved / held) that no other
 * record has. The two are deliberately separate and neither is a fallback for the other. */

/** A record that asserts a date, and must therefore have one to be public. */
type Dated = { publishedAt?: string | null }

/** A record that can be marked out of the index at the source. */
type Indexable = { noindex?: boolean }

/** An institution record. `route` means its content lives on another page. */
type InstitutionLike = {
  id: string
  publicVisibility?: string
  route?: unknown
}

/** True when a dated record carries a publication date. */
export function isPublished(record: Dated): boolean {
  return typeof record.publishedAt === 'string' && record.publishedAt.length > 0
}

/** True when a record has not been marked out of the index at the source. */
export function isIndexable(record: Indexable): boolean {
  return record.noindex !== true
}

/** True when an institution is not held. */
export function isHeldInstitution(i: InstitutionLike): boolean {
  return i.publicVisibility === 'hold'
}

/** True when an institution's content lives on another page rather than its own. Such a
 *  record is still public — it is searchable and should link to where it actually lives —
 *  but it must not be given a page of its own in the sitemap. */
export function isRoutedInstitution(i: InstitutionLike): boolean {
  return typeof i.route === 'string' && i.route.length > 0
}

/** Where an institution should be linked. */
export function institutionHref(i: InstitutionLike): string {
  return isRoutedInstitution(i) ? (i.route as string) : `/institutions/${i.id}`
}

/* ── The public collections ───────────────────────────────────────────────────────────────
 * Every public surface should read these rather than the raw loaders. */

/** Updates that are published. Sorted newest first by the loader. */
export function publicUpdates(): Update[] {
  return getAllUpdates().filter(isPublished)
}

/** Palace articles that are published. `getAllPalaceArticles()` already narrows to
 *  `type === 'PalaceArticle'`, so the Fon's profile does not reach this and is not judged by
 *  an article's rules. */
export function publicPalaceArticles(): PalaceArticle[] {
  return getAllPalaceArticles().filter(isPublished)
}

/** Kingdom articles that are not empty stubs. These carry no publication date by design, so
 *  `noindex` is the only signal — and requiring a date here would empty the section. */
export function publicKingdomArticles(): KingdomArticle[] {
  /* `noindex` is set in the JSON but is not on the KingdomArticle interface, so the cast is
     the honest way to read it rather than widening the published type for one flag. */
  return getAllKingdomArticles().filter(a => isIndexable(a as unknown as Indexable))
}

/** Institutions that are not held. Includes the routed ones: they are real institutions
 *  people search by name, and excluding them once meant searching "Afor Foundation" returned
 *  nothing at all. Use `isRoutedInstitution` to decide whether to give one its own URL. */
export function publicInstitutions() {
  return getAllInstitutions().filter(i => !isHeldInstitution(i as InstitutionLike))
}

/** Institutions that own a page of their own. This is the sitemap's set. */
export function sitemapInstitutions() {
  return publicInstitutions().filter(i => !isRoutedInstitution(i as InstitutionLike))
}

/** A count of what each rule removed, for the record and for a sweep to assert against. */
export function visibilityReport() {
  const institutions = getAllInstitutions() as InstitutionLike[]
  return {
    updates: {
      total: getAllUpdates().length,
      public: publicUpdates().length,
      excludedUnpublished: getAllUpdates().length - publicUpdates().length,
    },
    palace: {
      total: getAllPalaceArticles().length,
      public: publicPalaceArticles().length,
      excludedUnpublished: getAllPalaceArticles().length - publicPalaceArticles().length,
    },
    kingdom: {
      total: getAllKingdomArticles().length,
      public: publicKingdomArticles().length,
      excludedNoindex: getAllKingdomArticles().length - publicKingdomArticles().length,
    },
    institutions: {
      total: institutions.length,
      public: publicInstitutions().length,
      excludedHeld: institutions.filter(isHeldInstitution).length,
      routed: institutions.filter(isRoutedInstitution).length,
      withOwnPage: sitemapInstitutions().length,
    },
  }
}
