# Query architecture — what each page is the answer to

| Field | Value |
|-------|-------|
| Document tier | 2 — operational reference |
| Owner (DRI) | Marcel / Maxpromo Digital |
| Written | 2026-09-17 |
| Companion to | `docs/seo-entity-map.md`, `docs/seo-launch-handoff.md` |

---

## 0. What this document is not

It is not a keyword plan. No search-volume figure appears here, because none was measured:
there is no Search Console property on this domain yet, no third-party keyword tool was
used, and inventing numbers to fill a table would be exactly the kind of made-up SEO fact
this build was told not to produce.

What it *is*: a statement of which page is the site's best answer to which kind of question,
written from the content that actually exists. That is the thing that has to be settled
before submission, because two pages answering the same question is how a site competes with
itself — and it is checkable today, without any external data.

---

## 1. The four kinds of question this site can answer

Everything the Fondom has published falls into four groups. A page belongs to exactly one.

**Who is Guneku?** — the village, its geography, its size, its clan, its quarters.
**Who runs Guneku?** — the Fon, the Palace, the Traditional Council, the bodies.
**Who is from Guneku?** — the register, the profiles, the diaspora chapters, the businesses.
**What is happening in Guneku?** — updates, projects, education, the credit union, the archive.

## 2. The canonical answer to each

One page per question. Where two pages could both answer, the table says which one is the
answer and what the other is instead — that distinction is the entire point of the table.

| Question shape | The page | Not this page, and why |
|---|---|---|
| Guneku, the village — where, how big, what clan | `/fondom` | `/` introduces; `/fondom` is the record |
| The map, the places | `/explore` | `/quarters` is the list; `/explore` is the geography |
| A named quarter | `/quarters/[slug]` | 11 of 27 have content; the rest are `noindex` |
| The Fon | `/palace/fon-walters-profile` | `/palace` is the institution, not the person |
| The Palace and its history | `/palace` | |
| Traditional governance, the Notables | `/notables` | **Not** distinguished sons and daughters — see below |
| Who holds office, all bodies | `/people` | |
| One governing body and its roster | `/people/[body]` | |
| A named son or daughter, thin record | `/indigenes/founding/[slug]` | 81 of 113 offered — see the entity map |
| A named son or daughter, full profile | `/sons-and-daughters/[slug]` | |
| Distinguished sons and daughters, as a list | `/sons-and-daughters` | |
| The diaspora, as a whole | `/diaspora` | |
| One GUDECA / diaspora chapter | `/gudeca/chapters/[id]` | |
| GUDECA the association | `/gudeca` | |
| A Guneku-run business | `/businesses/[slug]` | |
| The directory | `/businesses` | |
| The credit union | `/guneccul` | `/institutions` lists it; `/guneccul` is it |
| Development work | `/projects` | |
| Scholarships | `/education` | |
| News, by date | `/updates` and `/updates/[slug]` | |
| Photographs | `/gallery/images` and its albums | `/gallery` is the front door to both media |
| Film | `/watch` | `/gallery/videos` redirects here — one film library |

### The one distinction the site had wrong, and now states

A **Notable of Guneku** holds a place in the traditional governance of the village around
the Fon. It is not a word for a distinguished son or daughter, and a career — however
distinguished — confers nothing traditional. `/notables` said the opposite until
2026-09-03.

Both pages now say what they are and link to the other, in prose, in the first paragraph.
That is the only reliable way to keep two pages from competing for the same query: not
canonical tags, but each one saying plainly what it is *not*.

---

## 3. Where the site competed with itself, and what was done

| Overlap | Resolution |
|---|---|
| `/notables` vs `/sons-and-daughters` | Both rewritten to state the distinction and cross-link. `/notables` had linked to `/diaspora` instead of `/sons-and-daughters` — one wrong `href`, and the sons-and-daughters index had **zero inbound links** on the whole site |
| `/gallery` vs `/gallery/images` | `/gallery` is the front door to images *and* film; `/gallery/images` is the album index |
| `/gallery/videos` vs `/watch` | `/gallery/videos` redirects; only one film library is indexable |
| `/indigenes/founding/[slug]` vs `/sons-and-daughters/[slug]` | Different records with different authority. A thin entry says so on its face and links to the profile where one exists |
| `/institutions/[id]` vs the page an institution owns | An institution whose content lives elsewhere is searchable but has no URL of its own in the sitemap |
| `/quarters/[slug]` × 27 | Only the 11 with content are indexable; the rest carry `robots: noindex` and say plainly that nothing is recorded yet |

---

## 4. Internal linking, measured

A production crawl of 290 pages before this work found:

- **1 orphan**: `/sons-and-daughters`, in the sitemap, reachable from nothing. Its only
  inbound link was a header dropdown — which is a real way in for a person and *no way in
  at all* for a crawler, because the submenu is rendered only while it is open, so the
  markup the server sends carries the nine top-level tabs and nothing beneath them.
- **137 indexable pages absent from the sitemap**: the 113 register entries, 17 chapters,
  the 5 governing bodies and `/people`, plus `/support`.
- **98 pages with two or fewer inbound links**, almost all register entries and gallery
  albums — which is expected for leaves of a directory, and is the reason the sitemap
  matters more here than the menu does.

After: **0 orphans**, sitemap 121 → 226 URLs.

The orphan test in `src/components/layout/navigation.test.ts` now looks for a link in what
the **server** actually sends, not in the menu definition. It fails on the exact `href` that
caused the defect.

---

## 5. What a person should do with this before submission

1. Read §2 and disagree with it where the Fondom disagrees. The table is a product
   judgment, not a technical one.
2. Anything in §3 that still feels like two pages doing one job is a content decision for
   Marcel, not a redirect for an engineer to add quietly.
3. §4 is the part that is now measured rather than asserted, and it stays measured: both
   numbers have tests.
