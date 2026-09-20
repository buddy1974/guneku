# Guneku — community launch preparation

| Field | Value |
|-------|-------|
| Document tier | 1 — launch operations |
| Owner (DRI) | Marcel / Maxpromo Digital |
| Written | 2026-09-20 |
| Product baseline | `d4a7a4e` · production healthy · 258 sitemap URLs · 113/113 register entries |
| Companion | `docs/search-observation.md` (runs quietly in parallel) |
| Status | **audit and preparation only — nothing published, nothing changed** |

## 1. What this launch is for

Search engines have been told the site exists. This is the other half: telling **Gunekuans**,
and doing it in a way that leads somewhere they can act.

The site is not a brochure. Its two live participation surfaces are the **register** — 113
names waiting to be claimed by the people they belong to — and the **business directory**,
open to Gunekuans the Palace has verified. A launch that produces readers and no claims has
missed the point.

Nothing in this document should be read as a reason to add a feature. The product is what
it is; this is about pointing people at the parts of it that already work.

---

## 2. First-time visitor journey

**Status: no blockers.**

Walked production as somebody who has just been sent the link and knows nothing.

| Journey | Result |
|---|---|
| What is Guneku? | Answered in the first paragraph of the homepage: a village of the Meta clan, twenty-seven quarters, led by HRH Fon Fomuki Walters Ticha IX, and what the site is for |
| The Fondom, Palace, Fon | Reachable from the top nav and from the homepage hero; all resolve |
| History and culture | Under The Fondom and The Palace; articles load |
| Indigenes | Top nav → Our People; the register is the page's subject |
| Businesses | Its own top-level tab, one destination, no submenu |
| Institutions, GUNECCUL | Under Development; both load |
| Archive, updates | Media → Image Gallery, Guneku TV, Village Square |
| Ask Guneku | Works — see below |
| Signing in | Clear, and explicitly optional |

All 22 priority pages return 200 with a self-referencing canonical and `index, follow`
(`npm run observe`). No dead ends, no misleading calls to action, no broken images across
the pages tested.

**Ask Guneku Palace works and is a genuine asset.** Asked "Who is the reigning Fon?" it
answered from the record — the succession, the date of the previous Fon's passing, the
anointing at the Transfiguration Ceremony on 27 February 2015 — listed its **sources**, and
offered *"Not what you needed? Send this question to the Palace →"*. Five suggested
questions sit under the box, so a visitor who does not know what to ask still has a way in.

### One thing worth knowing before the link is shared

**Not a blocker, and not a bug.** `/indigenes` opens with the heading **"NO PROFILES CREATED
YET"**. The paragraph directly beneath explains it properly — nobody has yet created a
profile through My Guneku, and the 113 founding names below come from the Fondom's own
records — and the names themselves follow under "The founding names", each with *This is me
— claim it*.

But in a WhatsApp group people scan rather than read. The first large heading on the page
that matters most for participation currently says the word "NO", and a fast scroller could
take it to mean the directory is empty and leave. Two options, both cheap, neither taken
here because both change visible copy and that is the Fondom's to decide:

- leave it, and let the launch message do the work — §6 below points people at the names
  rather than at the empty-profiles notice; or
- reword the heading later so it leads with the 113 that exist rather than the nought that
  does not.

The launch messages in §6 are written on the first assumption.

---

## 3. Community participation journeys

**Status: no blockers. Nothing was submitted and no test data was created.**

| Journey | Result |
|---|---|
| Find a person in the register | `/indigenes` lists all 113 with search by name, profession or city, and a quarter filter |
| Understand how claiming works | Every entry carries a "What claiming does" panel: you ask, a person at the Palace reviews, nothing on the page changes until they do |
| Claim an entry | "This is me — claim this entry" → `/my-guneku/claims/new?person=<slug>`; a signed-out visitor is sent to sign-in and returned |
| Correct or remove an entry | "Not me, or take it down" on every entry → `/indigenes/submit?intent=remove` |
| Discover a business | `/businesses` — 9 listed, 4 countries, 8 categories, with search and category filter |
| Understand who may add one | Stated on the page: *"Registration is open to Gunekuans the Palace has verified — the same confirmation that connects your account to your name in the register"* |
| Begin adding a business | "Register your business" → sign-in → the verified-Gunekuan check |
| Browse institutions | `/institutions` — 8 with their own page |
| Browse archive and history | `/gallery/images` (15 albums, 339 photographs), `/watch`, `/updates` |
| Ask Guneku | Answers with sources and an escalation route |
| Sign in / sign out | Clerk, with Google or email |

**The sign-in page does the most important thing right.** It says *"Sign in to claim your
entry, follow a project, or see what you have put forward for the village record"*, and
underneath: *"You do not need an account to read anything on Guneku.org."* A visitor who
does not want an account is told so plainly rather than being nudged.

An entry recorded as deceased carries no claim action and no "not me" link, which is correct
and deliberate.

---

## 4. Shareability

**Status: no blockers.**

| URL | og:title | og:description | og:image | og:url | Card |
|---|---|---|---|---|---|
| `/` | Guneku Fondom \| Official Community Website | 94 chars | ✓ | ✓ | summary_large_image |
| `/fondom` | The Fondom of Guneku | 130 | ✓ | ✓ | ✓ |
| `/palace` | The Palace of Guneku | 121 | ✓ | ✓ | ✓ |
| `/indigenes` | Indigenes Directory | 116 | ✓ | ✓ | ✓ |
| `/businesses` | Guneku Business Directory | 145 | ✓ | ✓ | ✓ |
| `/institutions` | Institutions — Guneku | 153 | ✓ | ✓ | ✓ |
| `/guneccul` | GUNECCUL — Community Credit Union | 133 | ✓ | ✓ | ✓ |

Share image: `/images/site/og-guneku.jpg` — **200, 1200×630, 166 KB**, the standard ratio.
Canonical on all seven is self-referencing. No broken share presentation found, so no
metadata was touched.

**Observation, not a defect:** all seven share the same image. A link to the business
directory and a link to the Palace arrive in a WhatsApp group looking identical. Giving the
main hubs their own image would help people tell them apart — a design task for later, not
a launch blocker, and not something to invent artwork for under time pressure.

---

## 5. Audience routes

Built only from pages that exist.

| Audience | Landing URL | What they can actually do there | Natural next action |
|---|---|---|---|
| General Guneku community | `/` | See what the village is, what is being built, the latest records | Ask Guneku a question, or open the register |
| **People looking for family or community members** | `/indigenes` | Search 113 names by name, profession or city; filter by quarter | **Claim their own entry, or add a name** |
| Diaspora | `/diaspora` | See the 8 constituted GUDECA chapters across three continents, and where Guneku people live | Open their own chapter, then the register |
| Business owners | `/businesses` | See the 9 businesses already listed and the eligibility rule | Register their business (verified Gunekuans) |
| Institutions and their members | `/institutions` | The standing bodies, each at the stage its sources establish | Open GUNECCUL, GUDECA or Agro CIG |
| Palace, Fondom and history | `/palace` and `/fondom` | The reigning Fon, the coronation, the legacy, the 27 quarters | Read an article, then the archive |
| Younger and mobile-first | `/watch` and `/gallery/images` | 46 films and 339 photographs | Village Square, then the register |
| People who want to help | `/support` | Offer support to a named project — 14 real projects listed | The Palace reviews the offer |

The register is the route that matters most. It is the only page where a visitor can find
**themselves**.

---

## 6. Launch message pack — DRAFTS, NOT PUBLISHED

Written as Guneku speaking to Gunekuans. No hype, no claim that the site is finished, and
nothing promised that the product does not do.

### A · General WhatsApp / community group

> The Guneku Fondom now has its own website: **https://www.guneku.org**
>
> It is the village's own record — the Fondom and the Palace, the quarters, the development
> work, the archive of photographs and films, and the register of Guneku sons and daughters
> at home and abroad.
>
> The register opens with 113 names taken from the Fondom's own records. If your name is
> there, you can claim it and the entry becomes yours to complete. If someone is missing,
> you can put their name forward.
>
> It is still growing, and it grows from what we give it. Have a look, and tell us what is
> wrong or missing.

### B · Facebook

> **The Guneku Fondom is now online — https://www.guneku.org**
>
> One place for the record of our village: the Fondom and the Palace, the twenty-seven
> quarters, the development work under way, and an archive of photographs and films going
> back years.
>
> It also carries the register of Guneku sons and daughters — 113 names so far, from the
> Fondom's own records, waiting for the people they belong to. And a directory of the
> businesses our people are building, at home and abroad.
>
> If you are a son or daughter of Guneku, come and find your name. If something is wrong,
> tell us and it will be put right.

### C · WhatsApp Status (short)

> Guneku Fondom is online. The village record, the archive, and the register of our sons and
> daughters. Find your name: https://www.guneku.org/indigenes

### D · Direct message to a Gunekuan

> The Fondom's website is live — https://www.guneku.org
>
> Have a look at the register: https://www.guneku.org/indigenes
>
> It opens with 113 names from the Fondom's own records. I think yours may be among them. If
> it is, you can claim it and fill in the rest yourself — what you do, where you are, as much
> or as little as you want. If it is not there, you can add it.
>
> If anything about your entry is wrong, there is a link on the page to say so and it comes
> down. No argument needed.

### E · Business-owner invitation

> The Fondom has opened a directory of businesses run by Guneku sons and daughters:
> **https://www.guneku.org/businesses**
>
> There are nine listed so far, in four countries — a fish farm at Wumfi-Ku, a studio, a
> shop on the road, and work our people have built abroad.
>
> If you run something, it belongs there. Registration is open to Gunekuans the Palace has
> verified — the same confirmation that connects your account to your name in the register.
>
> The point of a village knowing what its own people do is that it can send work their way.

### F · Diaspora / community-association introduction

> To the chapters and to Guneku people abroad,
>
> The Fondom now has an official digital home: **https://www.guneku.org**
>
> It carries the record of the village — the Palace, the quarters, the development work —
> and it carries us as well. The diaspora page lists the eight constituted GUDECA chapters
> across three continents: https://www.guneku.org/diaspora
>
> Two things worth doing. First, the register of Guneku sons and daughters opens with 113
> names from the Fondom's own records; members can find themselves there and claim their
> entry. Second, the projects page lists the development work that is actually under way, and
> there is a route to offer support to a named project.
>
> The record is only as good as what we put into it. Where a chapter's details are wrong or
> incomplete, please say so.

### Notes for whoever sends these

- Every link above resolves and was checked on 2026-09-20.
- Send the **register** link to people you expect to find themselves in it. Send the
  homepage to everyone else.
- Do not promise that a claim is instant. A person at the Palace reviews each one.
- Nothing here calls the site finished, and nothing should.

---

## 7. Feedback routes

**All of these exist today. None was invented for this document.**

| A community member wants to… | Route | Notes |
|---|---|---|
| Report a wrong or unwanted **person** record | `/indigenes/submit?intent=remove` | Linked from every register entry: *"Not me, or take it down."* The page says it comes down, **no reason required, no argument made** |
| Claim their own entry | `/indigenes/submit?intent=claim`, or the button on the entry | Palace reviews |
| Add a missing person | `/indigenes/submit?intent=add` | Anyone may put a name forward; the person is then invited to fill it in themselves |
| Report anything else wrong, or a technical problem | `/contact` | Form with a subject list including **Website**; the Palace email and telephone are published on the page |
| Ask a question and escalate it | Ask Guneku on the homepage | Every answer ends with *"Not what you needed? Send this question to the Palace →"* |
| Data and privacy requests | `/privacy` | The Palace email, with what it is used for |
| Reach a business directly | that business's page | Only where the owner published a contact |

### Gap, reported and not filled

There is no dedicated route for **"this fact on a business, institution or article page is
wrong."** Person records have a first-class correction path; nothing else does. The
`/contact` form's *Website* subject is the catch-all, and it works, but a reader who spots a
wrong date on an article has to find `/contact`, choose a subject and describe where they
were.

Small, real, and **not built here** — it is a product decision about whether every record
type gets a "something is wrong here" link, and it should be made deliberately rather than
bolted on the week of a launch.

---

## 8. Privacy and safety verification

**Status: clean.** Run before inviting traffic, against live production.

| Check | Result |
|---|---|
| Public pages swept | **28** |
| Fon's personal email | not present |
| Any personal free-mail address | not present |
| Clerk secret keys or user ids | not present |
| Database URLs, Resend keys, Turnstile secrets, AWS keys, bearer tokens | not present |
| `INDEXNOW_KEY` in markup | not present |
| Held business (Vicky and Son's) | not present |
| Archive staging or held material | not present |
| Stack traces or Next.js error digests | not present |
| `/my-guneku`, `/my-guneku/claims/new`, `/my-guneku/businesses` | 307 → sign-in |
| `/review`, `/review/claims`, `/review/contributions` | 307 → sign-in |
| `/indigenes/profile`, `/indigenes/onboarding` | 307 → sign-in |

Existing suites re-run: `contact-exposure.test.ts`, `invariants.test.ts`,
`identity-index.test.ts` — **82 tests, all passing**. These are the permanent guard; the
sweep above was a one-off confirmation against the live host and was not kept as
infrastructure.

---

## 9. Mobile launch smoke

Not a repeat of the completed device pass. Blockers only, measured at real viewport widths.

| Page | 360 px | 390 px | Desktop |
|---|---|---|---|
| `/` | 0 overflow · 22 images, 0 broken | 0 overflow | clean |
| `/indigenes` | 0 overflow | 0 overflow | clean |
| `/businesses` | 0 overflow | 0 overflow | clean |
| `/contact` | 0 overflow · form reachable | 0 overflow | clean |
| `/guneccul` | 0 overflow | 0 overflow | clean |

Horizontal page overflow is **0 px** at both widths on every page tested. The only elements
extending past the viewport are inside the homepage's deliberate horizontal statistics
strip, which is a `snap-x` scroller and is meant to scroll. Header present, navigation
reachable, no hidden call to action, no overlay obstruction, no broken image.

**No launch blockers.**

---

## 10. Launch checklist

Before the first message goes out:

- [ ] Marcel reads §6 and rewrites anything that does not sound like Guneku
- [ ] Decide the `/indigenes` heading question in §2 — leave it, or reword later
- [ ] Agree who answers `/contact` and how quickly, before traffic arrives
- [ ] Agree who reviews claims, and roughly how long a claimant should expect to wait
- [ ] Send to one small group first — a chapter, or a family thread — and watch what they do
- [ ] Take a `npm run observe` snapshot the morning of the launch
- [ ] Log the release date in `docs/search-observation.md` so the traffic is attributable

On the day and after:

- [ ] Watch `/contact` and the submissions queue rather than the analytics
- [ ] Expect claims and corrections; they are the point, not a problem
- [ ] Do not change the site in response to the first comment — collect a week of them

## 11. Blockers and observations

**Genuine launch blockers: none.**

Non-blocking observations, in the order they are likely to matter:

1. **`/indigenes` leads with "NO PROFILES CREATED YET"** — explained immediately beneath, but
   it is the first large heading on the participation page. §2.
2. **All seven hubs share one Open Graph image** — links to different sections look identical
   when shared. §4.
3. **No "something is wrong here" route for non-person records** — `/contact` covers it, less
   directly. §7.
4. **Three archive-fallback images** — carried over from `docs/search-observation.md` §8, still
   open, still not urgent.

None of the four justifies changing production during a launch week. All four are worth
deciding calmly afterwards.
