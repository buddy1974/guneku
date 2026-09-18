# The Guneku entity map

| Field | Value |
|-------|-------|
| Document tier | 2 — operational reference |
| Owner (DRI) | Marcel / Maxpromo Digital |
| Written | 2026-09-17 · §5 rewritten 2026-09-18 (ADR-097) |
| Implemented by | `src/lib/schema.ts`, `src/components/seo/PageGraph.tsx` |
| Held in place by | `src/lib/schema.test.ts` (24 tests) |

This is what the site tells a machine it is about, and — more usefully — what it
deliberately does not tell it.

---

## 1. The rule this whole file obeys

> Every value in every node comes from a record this site already publishes on a page a
> reader can open.

Nothing is asserted because a schema has a slot for it. Where the record is silent the
property is absent, not empty: `prune()` removes `null`, `''` and `[]` before anything is
serialised, because an empty value in structured data is a claim that the thing *has* no
value, which is a different statement from not knowing.

A machine reading this site gets the same answer a reader does. Not a richer one.

---

## 2. The three nodes everything hangs from

Declared once in `src/app/layout.tsx`, referred to by `@id` from every page after that.
They are **three different things**, and merging them is the most common way a Fondom
site's structured data goes wrong.

| `@id` | Type | What it is | Source of every field |
|---|---|---|---|
| `https://www.guneku.org#organization` | `Organization` | The Fondom as an institution | `site-config.json`, `palace-contact.ts` |
| `https://www.guneku.org#website` | `WebSite` | This website | `src/lib/seo.ts` |
| `https://www.guneku.org#guneku` | `Place` | Guneku, the village | `site-config.json` → `gunekuSOF`, `coordinates` |

The `Place` node carries the coordinates the record holds and the map draws — lat
`6.2307346`, lng `9.664737` — 27 quarters, Mbengwi Subdivision, Momo Division, North West
Region, Cameroon, and the Meta clan standing. **None of it was looked up.** Nothing in the
graph mentions Njindom, which is a separate village and not a quarter of Guneku; a test
asserts the string does not appear.

The Organization carries the Palace telephone, which is already printed in the footer of
every page. It carries **no `email`**: the institutional address is published once, on
`/contact`, and the root layout renders on all 304 pages.

---

## 3. Per-page nodes

Every page that declares a graph emits a `WebPage` and, where it has a trail, a
`BreadcrumbList`. The `@id`s are derived, never typed:

```
<url>#webpage      the page
<url>#breadcrumb   the trail to it
<url>#person       a register entry or a published profile
<url>#organization a business, a governing body, the credit union
<url>#article      an article
```

`PageGraph` takes the page's path as a prop rather than reading the router, and
`schema.test.ts` asserts that the path it is given is the same string the page's canonical
uses. Those two are written in two places in a file, which is exactly the kind of pair that
drifts.

### Which page owns which entity

| Route | Primary entity | Notes |
|---|---|---|
| `/` , `/fondom` | `#guneku` | The village; the Fondom is the publisher, not the subject |
| `/indigenes/founding/[slug]` | `Person` | 113 entries, all 113 indexable — see §5 |
| `/sons-and-daughters/[slug]` | `Person` | Published profiles, given for publication |
| `/people/[body]` | `Organization` | The five governing bodies |
| `/businesses/[slug]` | `LocalBusiness` / `Organization` | 9 public; 1 held, absent |
| `/guneccul` | `BankOrCreditUnion` | The thinnest node in the file — see §4 |
| `/updates/[slug]` | `NewsArticle` (+ `Event` where the record has one) | |
| `/palace/[slug]`, `/fondom/[slug]` | `Article` | |

---

## 4. What is deliberately absent

This section is the one to read before adding anything.

**Every business.** No `aggregateRating`, `review`, `priceRange`, `openingHours`,
`foundingDate`, `numberOfEmployees` or `makesOffer`. The directory holds none of them. A
telephone or an email appears only where the owner published one on the page.

**Ownership.** The directory distinguishes an owner from someone merely *associated* with a
business, and records the evidence for each. schema.org has no property that draws that
line. So the graph records that two entities are connected — `affiliation`, `member` — and
leaves the nature of the connection to the page, which states it in words. `owns`,
`founder` and `worksFor` are never emitted for a register entry.

**Fondom Studios' location.** Its sources disagree: a street address at Tanwi Street,
Windig Square, Guneku, and a separate public listing placing the studio in Bamenda. The
record says so and chooses neither. The node carries `addressLocality: "Guneku"` — the
Fondom's own record — and **no `streetAddress`**. "Bamenda" appears nowhere in the graph.

**Vicky and Son's.** Held. `publicCuratedBusinesses()` is the gate, the same one the
directory page uses, and a test asserts neither the slug nor the name reaches the graph.

**GUNECCUL.** No interest rate, no cooperative or regulatory registration number, no LEI,
no `identifier`, no opening hours, no membership terms, no `makesOffer`, no
`currenciesAccepted`, and no `telephone` — the page offers a `wa.me` link, which is a chat
channel, and `telephone` would assert a number somebody can ring. What it carries: the
name, the abbreviation, the description its own record holds, the six branches it records,
and the Fondom as parent.

**A register entry.** No photograph, no date of birth, no town, no employer, no contact
detail. The page says none of that has been offered; the graph says the same. A country of
residence may appear (`homeLocation`) because the register publishes a country and never a
town (ADR-082).

**A published profile.** `/sons-and-daughters` records carry an email address and a
telephone number. Both are left out. They were given so the Fondom could make contact, not
to be crawled. The page publishes what the person chose to publish; the graph publishes
less.

**An article.** No byline is invented. Most of this archive was migrated without one, and
putting the Fondom's name to somebody else's writing would be worse than an absent
`author`. An undated record carries no date rather than today's.

**No FAQ schema anywhere.** There is no fabricated question-and-answer text on this site,
so there is nothing to mark up.

---

## 5. Indexability — all 113

`src/lib/seo-policy.ts` · ADR-097, superseding ADR-093.

The register holds 113 sons and daughters. **Every one is offered for indexing.**

For one day — 2026-09-17 — a threshold withheld 32 of them for carrying fewer than two facts
beyond a name. Marcel reversed it on the 18th, and the argument that won is the one worth
recording here: the register exists so that a son or daughter of Guneku can recognise their
own presence in the Fondom record, and the person most likely to search a Guneku name is the
person who owns it. Withholding a confirmed record because the Palace has not yet been told
much about that person fails exactly the reader the register was built for, and fails them
silently. A thin-page penalty is a cost to the site. Being unfindable by your own name is a
cost to a person.

`PERSON_INDEX_THRESHOLD` is 0. It is kept rather than deleted: an explicit zero is harder to
reinstate by accident than a silent absence.

### Eligibility, which was never the thing that changed

`personIndexBar()` returns why a page is withheld, or null. There are two possible answers
and only one of them can currently occur:

| Bar | Meaning | Count |
|---|---|---|
| `not-a-record` | the slug resolves to nothing in the reviewed register | 0 of 113 |
| `too-thin` | below the threshold — **retired** | 0 of 113 |

The reviewed register is the gate and is the only one. A name the Fondom has recorded but not
confirmed, an ambiguous identity, a held relationship, a private detail: none of those are in
`founding-names.json`. They live in the business directory as `heldName`, or in Neon behind a
claim, or nowhere. Being in the register *is* the confirmation.

### What is still counted, and why

`personSignals` survives as reporting rather than as a gate — if it were deleted, the next
person to propose a quality filter would have no measurement to argue with.

| Signals beyond the name | Entries |
|---|---|
| 1 | 32 |
| 2 | 44 |
| 3 | 15 |
| 4 | 17 |
| 5 | 3 |
| 6 | 1 |
| 7 | 1 |

### What this does not authorise

Nothing about what a page says. No biography, no inferred occupation, no guessed location, no
padding to reach a word count, no structured-data field invented to make a node look fuller.
A sparse entry's description is short, and a test reconstructs every word of it from recorded
fields — so a sentence added to fill space fails. The one thing added on 2026-09-18 is the
chapter, which the entry's own table and hero already print.

**Nothing here changes what is published.** It changes only what is submitted.

---

## 6. Where the graph could go wrong next

- Someone adds `aggregateRating` to a business because a rich-result tester asks for it.
  There are no ratings. There is no plan to collect any.
- Someone fills `openingHours` for the credit union from a photograph of a sign.
- Someone resolves the Fondom Studios conflict by picking one. It is unresolved; that is a
  fact about the record, not a gap in it.
- Someone adds an `author` to a migrated article so it qualifies for an Article rich result.
- Someone maps `relationship: "associated"` to `owner` because the graph looks thin.

Each of those has a test. They are in `src/lib/schema.test.ts` and they name the reason,
not just the assertion.
