# Guneku — controlled community release

| Field | Value |
|-------|-------|
| Document tier | 1 — release operations |
| Owner (DRI) | Marcel / Maxpromo Digital |
| Written | 2026-09-20 |
| Product baseline | `82b178f` · production healthy · no launch blockers |
| Companions | `docs/community-launch.md` (audience routes, message pack), `docs/search-observation.md` |
| Stage | **controlled release — first cohort only** |
| Status | prepared · **nothing sent, nothing published, no production change** |

## 1. Purpose

To put Guneku in front of a small number of real Gunekuans and find out what happens, while
the number of people is still small enough that anything wrong can be put right quietly.

The measure of success is **not** praise. It is whether the core journeys work for people
who were not in the room while it was built: can they tell what the site is, can they find a
person, and does someone who is in the register understand that they can claim their own
entry.

A person's preference is not a defect. Ten people being confused in the same place is.

---

## 2. Release stage

| Stage | Audience | Status |
|---|---|---|
| Internal acceptance | the build | complete |
| Search-engine launch | Google, Bing, IndexNow | complete, observation running |
| **Controlled release** | **10–20 named Gunekuans** | **this document** |
| Wider community release | chapters, groups, Facebook | gated on §10 |
| Open promotion | anyone | not scheduled |

---

## 3. Operating model — where things actually arrive

Traced from the code, not assumed. Every route below exists today.

### Roles

`member` → `contributor` → `reviewer` → `palace-admin`. The role lives in Clerk public
metadata; nothing about it can be set from a request. `reviewer` decides what the public
record says; `palace-admin` answers correspondence and holds the notification controls.

**Who currently holds `reviewer` and `palace-admin` in Clerk cannot be read from this
repository. → OWNER TO CONFIRM before the first message goes out.** A claim that nobody can
approve is worse than no claim at all.

### The eight intake paths

| Event | Where it arrives | Who reviews | Verify before acting | Never auto-approved |
|---|---|---|---|---|
| **Identity claim** | `POST /api/claims` → Neon; queue at `/review/claims` | `reviewer` or `palace-admin` — **OWNER TO CONFIRM who** | that the claimant is the person the entry names. The reviewer sees only display name and email, deliberately | **every claim.** Approval connects an account to a named person permanently |
| **Remove / correct an Indigene record** | `/indigenes/submit?intent=remove` → `POST /api/community/register` → **email to `EMAIL_ADMIN`**. Nothing is written to the database and nothing is published | a person at the Palace inbox | nothing. The page promises it comes down, *no reason required, no argument made* — honour that | the takedown is honoured on request; the edit to `founding-names.json` is a commit by a maintainer |
| **New-name submission** | same route, `intent=add` → email | Palace inbox | that the person is a son or daughter of Guneku | the name is never published from the form. The person is invited to fill their own entry in |
| **Business registration** | `POST /api/businesses`, gated by `requireVerifiedGunekuan()` | the gate itself, then the owner manages their own record | the account holds an **approved profile claim** — the same confirmation as the register | a business from an unverified account. The gate refuses server-side, not just in the UI |
| **Contact form message** | `POST /api/contact` → `sendContactEmail` → `EMAIL_ADMIN` (`EMAIL_BCC` also set) | Palace inbox | — | — |
| **Palace escalation from Ask Guneku** | `POST /api/palace-message` → `createCorrespondence` in Neon **and** an email | `palace-admin` at `/review/correspondence` | — | the response is written by a person; nothing is generated |
| **Support offer** | `POST /api/support-interest` → `sendSupportInterest` → `EMAIL_ADMIN` | Palace inbox | which project, and what is being offered | any commitment on the Fondom's behalf |
| **Contribution** | `POST /api/contributions` → Neon; `/review/contributions` | `reviewer` | the source of the contributed fact | every contribution |
| **Technical problem** | `/contact`, subject **Website** | maintainer | reproduce it on production first | — |

### Response targets — proposed, for the owner to accept or change

These are suggestions, not commitments the product makes. Nothing on the site promises a
time.

| Event | Target | Why |
|---|---|---|
| Removal request | **same day** | The page says it comes down. Slowness here is a broken promise, not a delay |
| Identity claim | **3 working days** | A person is waiting to be recognised in their own village's record |
| New-name submission | 5 working days | |
| Contact / technical | 3 working days | |
| Palace escalation | 5 working days | |
| Support offer | 7 working days | Usually needs a real decision |
| Business registration | n/a — automatic once verified | The gate is the review |

**OWNER TO CONFIRM:** whether these targets are acceptable, and who is accountable for each.

### Protections already live

Every public intake carries a rate limit and a honeypot. Turnstile is **armed in
Production** — both `TURNSTILE_SECRET_KEY` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are set —
and fails closed. `RESEND_API_KEY`, `EMAIL_ADMIN`, `EMAIL_BCC` and `DATABASE_URL` are all
configured. No action needed before release.

---

## 4. First cohort design

**Design only. No names, no contacts, nobody approached. Marcel chooses the people.**

Target **12–18**. Small enough that every reply can be read properly; large enough that a
repeated confusion is visible as a pattern rather than one person's taste.

| # | Perspective | Why they are in the cohort | What we most want to learn |
|---|---|---|---|
| 1–2 | Guneku resident | The village itself is the primary audience | Does it describe the place they live accurately? |
| 3–4 | Diaspora member, Europe or US | The largest group likely to arrive by link | Does the diaspora page reflect their chapter? |
| 5 | Older user, low technical confidence | Most likely to be defeated by an interface | Can they get anywhere at all without help? |
| 6–7 | Younger, mobile-only | How most people will actually see it | Navigation, and whether they reach the register |
| 8–9 | **Already in the register** | The single most important journey | Do they realise the entry is theirs, and that they can claim it? |
| 10–11 | **Not yet in the register** | The second most important | Do they understand they can be added? |
| 12–13 | Business owner | Directory participation | Do they understand who may register, and why? |
| 14–15 | Institution or GUDECA officer | Institutional accuracy | Is their body recorded correctly? |
| 16 | Someone who knows the history well | Factual accuracy | Is anything actually wrong? |
| 17–18 | Someone sceptical of the whole idea | Honest friction | Where does it fail to justify itself? |

Two guidance notes for choosing:

- Include at least two people who will say something unwelcome. A cohort of friends produces
  a launch that fails later, in public.
- Include at least one person whose entry is **thin** — a name and an office and nothing
  else. Their reaction to seeing themselves described that sparsely is worth more than any
  other single piece of feedback.

---

## 5. First-use exercise

Testers get the site the way anyone would — a link and a sentence. **No checklist, no
script, no walkthrough.** Their confusion is the evidence; coaching destroys it.

Only step in when somebody is genuinely stuck and about to give up, and when you do, **write
down where they got stuck before you help.** That is the finding.

### What to watch for, without asking leading questions

| Question we need answered | How to tell |
|---|---|
| Did they understand what Guneku.org is? | Ask afterwards: "What is it?" in their own words |
| Could they find a person? | Did they reach `/indigenes` unprompted? |
| Could they find Palace and Fondom information? | Where did they go first? |
| Did they find businesses and institutions? | Did they ever reach them? |
| Did they discover Ask Guneku? | Unprompted, or never? |
| Did mobile navigation make sense? | Watch the menu, not the pages |
| Did anything look wrong? | Let them say it unprompted |
| Did anything confuse them? | Note the exact screen |
| Did they want to participate? | Did they try to claim, add or register anything? |
| Did an eligible person understand claiming? | Did they find *This is me*, and did they know what it would do? |
| Did a business owner understand registration? | Did they understand **why** verification is required? |

### Three known places to watch particularly

1. **`/indigenes` opens with the heading "NO PROFILES CREATED YET."** It is explained
   directly beneath and the 113 names follow — but if testers bounce there, that is the
   finding the launch most needs. Do not warn them about it in advance.
2. **The claim button sends a signed-out visitor to sign-in.** Watch whether they come back.
3. **Business registration requires a verified Gunekuan.** Watch whether the reason lands,
   or reads as a closed door.

---

## 6. Feedback capture

Use the product's own routes where they fit — a real removal request should go through
`/indigenes/submit?intent=remove`, because that also tests the route.

For launch feedback that fits nowhere, use the sheet below. **No new production feedback
system is to be built.**

### Feedback sheet

Copy one block per finding into a reply to Marcel, or into a note.

```
WHO      cohort perspective (e.g. diaspora, mobile-only) — not a name in the repo
DEVICE   phone / tablet / desktop, and roughly which
PAGE     the URL, or what they were looking at
CATEGORY factual correction | missing person | identity claim | business |
         navigation/usability | mobile | broken functionality | privacy |
         suggestion | positive
WHAT     what they did, and what happened
WORDS    what they actually said, quoted
SEVERITY blocker | high | medium | low | observation
```

### Classification, and what each means

| Severity | Meaning | Response |
|---|---|---|
| **BLOCKER** | a core journey cannot be completed, or something private is exposed | stop the release, fix, verify |
| **HIGH** | a real fault that most people will hit, with a workaround | fix before widening |
| **MEDIUM** | a real fault affecting some people, or a repeated confusion | queue, fix in the next pass |
| **LOW** | small, real, not urgent | queue |
| **OBSERVATION** | one person's preference, a cosmetic opinion, a feature idea, or a search-engine delay | record, do nothing |

Two rules that keep this honest:

- **A preference is not a defect.** "I would have made it blue" is an observation. Three
  people failing to find the register is HIGH.
- **Count before you act.** One report is a data point. The same thing from three people in
  a cohort of fifteen is a pattern.

---

## 7. Controlled release message — DRAFT, DO NOT SEND

One message, adapted from draft D in `docs/community-launch.md`, for Marcel to send
**personally and individually**. Not to a group.

> Hello [name],
>
> The Guneku Fondom now has its own website, and before we share it more widely I would like
> a few people from Guneku to look at it properly first. You are one of them.
>
> **https://www.guneku.org**
>
> Please just look around it the way you normally would — there is nothing you need to do in
> any particular order.
>
> One thing I would ask you to open is the register of Guneku sons and daughters:
> **https://www.guneku.org/indigenes**
>
> It starts with 113 names taken from the Fondom's own records. If your name is there, you
> can claim it and then fill in the rest yourself. If it is not there, it can be added.
>
> There is also a question box on the front page — "Ask Guneku Palace" — that answers from
> the records and shows you where each answer came from. Try it with anything you are curious
> about.
>
> Then tell me honestly: what is wrong, what is missing, and what confused you. If a date or
> a name is incorrect, I want to know. If you could not find something, that is useful too —
> it means other people will not find it either.
>
> You do not need to be polite about it. The site is new and it is still growing, and it only
> gets better from what people tell us.
>
> Thank you,
> Marcel

**Notes for sending**

- Send **one at a time**, not as a broadcast. A personal message gets a real answer; a group
  blast gets silence or applause, and neither is useful.
- Do **not** tell them what to look for. Do not mention the register heading, the claim flow
  or anything else in §5.
- Space them out — three or four a day. Fifteen replies arriving at once cannot be answered
  within the targets in §3.
- If someone asks whether it is finished: it is not, and saying so invites better feedback.

---

## 8. Monitoring during the release

### Product — genuine faults only

- [ ] Errors on any page a tester reports reaching
- [ ] A form that fails to submit (contact, support, register submission, palace message)
- [ ] Authentication failure — sign-in, sign-up, or the return after sign-in
- [ ] A claim that cannot be filed, or does not appear in `/review/claims`
- [ ] Broken links or images
- [ ] A mobile blocker: unreachable navigation, hidden action, trapped form
- [ ] Run `npm run observe` on release morning and again at the end of the first week

### Community — the real signal

- [ ] Claims received, and how long each waited
- [ ] Corrections offered
- [ ] Removal requests — **and whether each was honoured same day**
- [ ] New-name submissions
- [ ] Business registrations attempted, and whether the verification gate was understood
- [ ] Factual disputes, and their source
- [ ] **Recurring confusion — the same place, three or more people**

### Search

Continues separately in `docs/search-observation.md`. **Do not mix it in.** A page that is
not yet indexed is not a community-release defect, and a tester who cannot find Guneku by
searching Google in week one has found nothing except that indexing takes time.

---

## 9. Change rule during the release

The default is **do not change production.**

### FIX NOW

- Security or privacy exposure
- Risk of data loss
- A broken core journey: find a person · claim an entry · request removal · contact the
  Palace · sign in
- A public fact that is objectively wrong, where a reliable correction exists
- A core action that cannot be reached at all on a common device
- A serious mobile blocker

### QUEUE

- Usability confusion reported by three or more people
- A legitimate enhancement
- Wording that repeatedly misleads
- A missing correction affordance — including the known gap for business, institution and
  article records
- Share-preview improvements, including the single shared Open Graph image

### OBSERVE

- One person's preference
- A cosmetic opinion
- A speculative feature request
- Search-engine delay, or anything an engine reports that production contradicts
- Disagreement without evidence

**Nothing was changed in production during this pass, and nothing should be changed in
response to feedback that has not yet arrived.**

---

## 10. Stop conditions

Halt the release — send no further links — if any of these appear:

- Private information is reachable by a person who should not see it
- An identity claim connects an account to the **wrong** person
- A removal request is not honoured, or a name reappears after removal
- Sign-in fails for more than one tester
- A form silently loses what somebody wrote
- A public fact is wrong in a way that could embarrass a named living person
- The site is materially unusable on a common phone
- Two or more testers independently report a privacy concern

If the release is halted: fix, verify against production, record it, then resume with the
**remaining** cohort — not with a wider one.

## 11. Widening criteria

**Do not widen because time has passed.** Widen when the cohort has demonstrated the product
works for people who did not build it.

All of the following, together:

1. At least **10** cohort members have actually used the site and replied.
2. At least **3** reached the register without being told to.
3. At least **2** people who appear in the register understood, unprompted, that the entry
   was theirs and could be claimed.
4. At least **1** identity claim has been filed, reviewed and resolved end to end — the
   whole loop, not just the form.
5. At least **1** correction or removal request has been received and honoured within target.
6. **Zero** unresolved BLOCKER findings.
7. **Zero** unresolved HIGH findings.
8. `npm run observe` clean at the end of the period.
9. Marcel has read every reply, and can name the three things people found hardest.

Points 3 and 4 are the ones that matter. Everything else can be true of a site nobody
participates in.

When all nine hold, the next stage is the wider community release using drafts A, B, C, E
and F in `docs/community-launch.md`.
