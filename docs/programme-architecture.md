# Guneku — forward architecture for the credential-blocked phases

Written 2026-09-03, read-only, against `feat/village-square-archive-fallback`. Phases 0, 1,
1.5, 2, 7, 9 and 10 are built and pushed. Phases 3, 4, 5, 6, 8, 11, 12, 13, 14 and 15 need
either a Clerk session or a `DATABASE_URL`, neither of which is readable in this environment
(R-024).

This is the design, decided and written down now so that when the credentials arrive the work
is implementation rather than discovery. Nothing here has been applied. Every table, column
and route below is a proposal; the reasoning is the part worth keeping.

---

## 1 · Neon: the exact schema the programme needs

**What exists:** one table, `indigene_profiles`, ~30 columns, unique on `clerk_user_id`, no
foreign keys because there is no second table. Created by an unversioned script.

**What was added in Phase 2 but not applied:** `community_members`, `follows`, and
`schema_migrations` — in `src/lib/db/migrations/0001_my_guneku.sql`.

### The governing rule for every table below

Authoritative Guneku facts are **not** moved into the database. A person's quarter, chapter,
body, office, family relationship and history stay in the reviewed JSON records, where they
carry a source and can be corrected by a human. The database holds only **what a user did**:
who they are on the platform, what they asked for, what they follow, what they submitted.

A row never overwrites the record. It asks a person to consider changing it. This is why
`claims` carries `source_type` + `source_id` rather than a foreign key — the thing being
claimed lives in JSON, and pointing at it by stable id keeps the record authoritative.

### `0002_claims.sql` — Phase 3

```sql
CREATE TABLE claims (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  source_type   TEXT NOT NULL CHECK (source_type IN ('founding-name','body-member','notable')),
  source_id     TEXT NOT NULL,              -- the record's slug, e.g. 'ndingwan-primus'
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','rejected','withdrawn')),
  note          TEXT,                        -- what the claimant says establishes it
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  reviewed_by   TEXT,                        -- the reviewer's clerk id
  review_note   TEXT,                        -- why, for the trail
  withdrawn_at  TIMESTAMPTZ,
  UNIQUE (clerk_user_id, source_type, source_id)
);
CREATE INDEX claims_user_idx   ON claims (clerk_user_id);
CREATE INDEX claims_source_idx ON claims (source_type, source_id);
CREATE INDEX claims_status_idx ON claims (status) WHERE status = 'pending';
```

Three rules the code must enforce, not the schema:

1. **A deceased entry can never be claimed.** `founding-names.json` carries `deceased: true`
   on two people. The check belongs in the claim handler *and* in the UI, and there is
   already a verified test for it: no page anywhere offers a claim or removal action for
   `akwe-thadeus-acho` or `mama-ngum-fomuki`.
2. **An approved claim grants no editing right over history.** It marks the entry as claimed
   and unlocks *submitting a correction* — which goes through Phase 11's moderation like any
   other contribution.
3. **No auto-approval, ever.** `status` starts `pending` and only a `reviewer` or
   `palace-admin` may move it. `reviewed_by` is written from the session, never from input.

**One open question for the owner, not for me:** what evidence should a claim require? A
name alone is weak — two people in a village can share one. The register's own
`sourceLabel` per person is the natural anchor, but the Palace should say what satisfies it.

### `0003_subscriptions.sql` — Phase 4

```sql
CREATE TABLE subscribers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL UNIQUE,
  clerk_user_id  TEXT,                       -- null for an anonymous subscriber
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','confirmed','unsubscribed','bounced','complained')),
  confirm_token  TEXT,                        -- single-use, hashed
  confirmed_at   TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscription_topics (
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  topic         TEXT NOT NULL CHECK (topic IN
                  ('palace','projects','education','gudeca','culture','events',
                   'quarter','diaspora','tv')),
  quarter       TEXT,                         -- only when topic = 'quarter'
  PRIMARY KEY (subscriber_id, topic, COALESCE(quarter, ''))
);
```

`unsubscribe` must work from a link with **no login** — a token in the URL, single-use for
confirmation and stable for unsubscribe. A newsletter someone cannot leave without creating
an account is not one they consented to.

### `0004_contributions.sql` — Phase 11

```sql
CREATE TABLE contributions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id  TEXT,                        -- null for an anonymous contribution
  contact_email  TEXT,                        -- required when clerk_user_id is null
  kind           TEXT NOT NULL CHECK (kind IN
                   ('correction','history','identify-person','photo-caption','date',
                    'location','institution','quarter','document','archive-suggestion')),
  subject_type   TEXT,                        -- what it is about, by stable id
  subject_id     TEXT,
  body           TEXT NOT NULL,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','under_review','approved','rejected',
                                   'needs_more_information','published')),
  UNIQUE (id)
);

-- The trail. Append-only: a row is never updated, only added.
CREATE TABLE contribution_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor           TEXT NOT NULL,              -- reviewer's clerk id, or 'system'
  from_status     TEXT,
  to_status       TEXT NOT NULL,
  note            TEXT
);
```

**`contributions.body` is immutable.** The original submission is never edited, because it is
evidence of what someone actually said. A reviewer's changes live in
`contribution_events.note` and, if published, in the JSON record with its own source line.

**Nothing publishes automatically.** `published` means a human copied the substance into the
authoritative JSON record and committed it. The database never writes to `src/data/`.

### `0005_correspondence.sql` — Phase 13

```sql
CREATE TABLE correspondence_threads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject      TEXT,
  sender_name  TEXT,
  sender_email TEXT,
  topic        TEXT,
  status       TEXT NOT NULL DEFAULT 'new'
               CHECK (status IN ('new','in_review','waiting_on_sender','answered','closed')),
  assigned_to  TEXT,                          -- clerk id of a palace-admin
  received_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE correspondence_messages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id      UUID NOT NULL REFERENCES correspondence_threads(id) ON DELETE CASCADE,
  direction      TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  provider_id    TEXT UNIQUE,                 -- Resend's message id; the idempotency key
  body_text      TEXT,
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

`provider_id UNIQUE` is the whole defence against a webhook delivered twice. Resend, like
every provider, retries; without it a retry becomes a duplicate message in the Palace's
queue.

**Correspondence is never public.** No route under `/api/correspondence` or
`/palace-admin` may be reachable without `requireRole('palace-admin')`, and none of it enters
the search index or the sitemap.

### `0006_ai_descriptions.sql` — Phase 12

```sql
CREATE TABLE archive_descriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_path   TEXT NOT NULL,                 -- e.g. public/images/gallery/...
  status       TEXT NOT NULL DEFAULT 'draft_ai_description'
               CHECK (status IN ('draft_ai_description','approved','rejected')),
  description  TEXT NOT NULL,
  keywords     TEXT[],
  model        TEXT NOT NULL,                 -- what produced it, for auditing
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by  TEXT,
  reviewed_at  TIMESTAMPTZ,
  UNIQUE (asset_path, generated_at)
);
```

`status` starts at `draft_ai_description` and **the public site must never read a row that is
not `approved`**. The model may propose a scene, objects, a setting and search keywords. It
may **not** propose an identity, a date, an event, a family relationship or an office — and
no facial recognition, at all. The 180-odd photographs under `public/images/gallery/` that
are held (R-007) must be excluded from the pipeline by path, not by hoping.

---

## 2 · Migrations: what must run, in order

| File | Phase | State |
|---|---|---|
| `0000_indigene_profiles.sql` | pre-existing | Already applied wherever the table exists. Idempotent, so recording it as applied is safe either way. |
| `0001_my_guneku.sql` | 2 | **Written, not applied.** `community_members`, `follows`, `schema_migrations`. |
| `0002_claims.sql` | 3 | Not written. |
| `0003_subscriptions.sql` | 4 | Not written. |
| `0004_contributions.sql` | 11 | Not written. |
| `0005_correspondence.sql` | 13 | Not written. |
| `0006_ai_descriptions.sql` | 12 | Not written. |

`npm run db:status` prints applied and pending and changes nothing. `npm run db:migrate`
applies pending files in filename order and records each in `schema_migrations`.

**The runner's stated limit, which shapes 0002 onward:** Neon's HTTP driver sends one
statement per request and cannot wrap a file in a transaction, so a failure can leave earlier
statements applied. Every statement above is therefore idempotent-safe to re-run — but
`0003` onward introduce `REFERENCES` and `CHECK` constraints where that gets harder. **Before
`0002` is applied, move the runner to the pooled driver (`@neondatabase/serverless` Pool, or
`pg`) and wrap each file in a real transaction.** That is the first task of Phase 3, not an
afterthought.

---

## 3 · Resend: from six senders to a subscription system

**What exists:** `resend@6.12.2`, one API surface (`emails.send`), six transactional
senders, BCC from `EMAIL_BCC` and omitted when absent, `server-only`. Audiences, broadcasts,
inbound and webhooks: none.

**Decision on the source of truth: Neon holds preferences, Resend delivers.**

Resend Audiences would be a second, divergent store of who wants what. Topic preferences are
Guneku's data — a villager choosing to hear about their own quarter — and they belong in the
same database as the rest of the member record, joinable to `follows` and `community_members`.
Resend receives a recipient list per send, not a standing copy of the community.

**Suppression is the exception, and must be respected from Resend.** Bounces and complaints
are facts Resend learns and Guneku must honour. Hence `subscribers.status` carrying `bounced`
and `complained`, populated by webhook. Sending to an address Resend has suppressed damages
the domain's reputation for every future message, including the transactional ones the forms
depend on.

**Sending sequence for any campaign (Phase 14):**

1. Resolve recipients in Neon: `status = 'confirmed'` **and** subscribed to the topic.
2. Show an admin the audience size, subject, body and affected projects. Send nothing yet.
3. A human presses send. There is no scheduled auto-send and no AI-written Palace
   announcement without human approval.
4. Batch through `emails.send`, recording per-recipient outcome.
5. Webhook updates `subscribers.status` on bounce or complaint.

**Owner actions Resend will need:** `EMAIL_FROM` is unset in every environment, so mail
currently sends from the `onboarding@resend.dev` fallback — fine for testing, wrong for the
Fondom. A verified `guneku.org` sender needs **DNS records only the owner can create**
(SPF/DKIM, and MX for inbound). Inbound correspondence for Phase 13 cannot begin before that.

---

## 4 · Palace AI: the retrieval architecture

The legacy route is gone (R-026 closed). What replaces it, in layers:

**Layer 1 — deterministic, unchanged.** `src/lib/palace-knowledge.ts` and `/api/ask`. 17
hand-written intents plus a derived record index, scored by string rules, with a coverage
guard that refuses rather than approximates (ADR-012). **Most questions must end here**, and
a question answered here costs nothing and cannot invent anything.

**Layer 2 — retrieval, new.** Only when layer 1 declines:

1. Retrieve candidate passages from **published records only**. This is the part to build
   carefully: `getAllUpdates()`, `getAllPalaceArticles()` and `getAllKingdomArticles()` do
   **not** filter by published state, which is exactly how the retired route could have put
   an unpublished record into a prompt. The retrieval layer must use its own filtered corpus
   — `src/lib/search-index.ts` already builds one, and is the right foundation.
2. If fewer than *N* passages clear a relevance floor, **stop**. Return
   *"I don't have a verified Guneku source for that yet"* and offer the Palace form. Do not
   ask the model whether it knows.
3. If they do clear it, send **only those passages and the question** to Anthropic, with a
   system prompt that says: answer only from the passages provided; cite them; if they do not
   answer the question, say so; you are an information desk, not the Fon, and you do not speak
   for the Palace.
4. Render the answer with **"Sources from Guneku.org"** and real links.

**Controls, all required before it goes live:** the shared rate limiter (`src/lib/rate-limit.ts`,
already built) keyed to a new `palace-ai` bucket at a *lower* ceiling than the forms; an input
length cap; a request timeout that falls back to layer 1's refusal; a `max_tokens` bound; and
cost logging that records tokens and latency but **not** the question text by default — a
villager's question can be personal, and logging it by habit is a privacy decision nobody
made.

**Model:** the retired route pinned `claude-sonnet-4-6`, a previous generation. Use a current
Claude model, named in one place in config rather than inline.

**On vector search:** the corpus is ~270 indexed entries and roughly 60 long-form records.
That is far too small to justify embeddings. Deterministic retrieval over it is faster,
cheaper, debuggable and reproducible. Revisit only if the corpus grows by an order of
magnitude, and then with Neon `pgvector` — never an external vector vendor.

---

## 5 · Contribution and moderation

**Routes.** `POST /api/contributions` (authenticated or anonymous-with-contact),
`GET /api/contributions/mine` (`requireUser`), and a reviewer surface at
`/palace-admin/contributions` behind `requireRole('reviewer')`.

**The four invariants:**

1. **Nothing publishes automatically.** `published` is a human act.
2. **No submission ever writes to `src/data/`.** The authoritative records change only
   through a commit a person made. This is the line that keeps the archive trustworthy.
3. **The original is immutable.** `contributions.body` is never edited; the trail lives in
   `contribution_events`.
4. **AI never touches this store.** Private submissions are not a corpus. The Palace AI's
   retrieval must be pointed at published records only, and a submission is not published.

**Anonymous contribution** is allowed with contact details, because the person who knows when
the Fringyeng health centre was built may well not want an account. The honeypot and the
shared rate limiter already exist and apply.

---

## 6 · Preview database isolation — Phase 15

**Unresolved, and unresolvable from here.** Both Production and Preview have `DATABASE_URL`
set; the values are unreadable (R-024), so whether they point at the same Neon branch cannot
be determined without the Neon dashboard.

**If they share a branch, the risk is concrete and current:** every preview deployment of
every branch writes to production data. Once Phases 3, 4 and 11 land, that means real claims,
real subscribers and real contributions mixed with whatever a test run produced.

**Target:** Production → the production branch; Preview → a Neon branch created per preview,
or one long-lived `preview` branch.

**Owner actions required, in order:**

1. In Neon, confirm the branch each `DATABASE_URL` targets.
2. If they are the same: create a `preview` branch **from schema, not from data**. Guneku's
   database will hold real names, emails and personal messages; copying them into an
   environment behind a shared SSO link is a privacy decision, not a convenience.
3. Connect Neon's Vercel integration so previews get their own connection string.
4. Seed the preview branch with fabricated data only, and document a reset.

**Do not apply any migration to production until step 1 is answered.** A migration is cheap
to run and expensive to run in the wrong place.

---

## 7 · Clerk: roles and sessions

Built in Phase 2 and recorded in ADR-026/027. Restated here as the contract every later
phase must hold to, because Phases 3, 11, 13 and 14 all authorise against it.

**What Clerk owns:** identity, session, and one platform role from
`member | contributor | reviewer | palace-admin`, defaulting to `member`.

**What Clerk must never own:** a person's quarter, GUDECA chapter, body or office, Palace
family relationship, historical identity, or the state of a profile claim. Those are Guneku
facts with sources. A role is permission to use the software; it is never a statement about
who someone is in the village.

**Where the role lives.** Clerk *public* metadata, read through `roleFrom()` in
`src/lib/auth.ts`. Private metadata is never read, so it cannot be leaked into a payload by
accident. An unrecognised value falls back to `member` rather than throwing — a corrupt
metadata field must not lock a villager out.

**The three helpers, and when to use which:**

| Helper | Returns | Use where |
|---|---|---|
| `optionalUser()` | user or `null` | A page that shows more to a member but must still work for a visitor. |
| `requireUser()` | user, or throws 401 | Any handler reading or writing something personal. |
| `requireRole(min)` | user, or throws 403 | Reviewer and admin surfaces. 403 not 401: they are known, they simply may not. |

`atLeast()` walks the `ROLES` array, so the order of that array *is* the privilege ladder.
Inserting a role in the middle changes who can do what — a comment in `auth.ts` says so.

**Role elevation is server-side only.** No route accepts a role from a request body. Verified
in Phase 2: `/api/me` writes through a field allow-list that discards `role` and
`clerk_user_id`, and a member who posts `{"role":"palace-admin"}` changes nothing. When the
Palace needs to promote someone, that is done in the Clerk dashboard or by a
`palace-admin`-only route that writes public metadata — never by a form the user controls.

**Two locks, not one.** `middleware.ts` decides where a session is *available*; the page or
handler decides what may *happen*. `/my-guneku` checks `optionalUser()` and redirects even
though the matcher already protects it, because a matcher is configuration and configuration
gets edited. A middleware that only redirects is a locked front door on a building with open
windows.

**Provider scope.** `ClerkProvider` is mounted only by `/my-guneku`, `/sign-in` and
`/sign-up`. Every later authenticated surface must be added to **both** the middleware matcher
and a subtree that mounts the provider. Proven consequence: with no Clerk keys at all, 19 of
20 public routes still return 200, and zero Clerk JavaScript reaches a public page.

---

## 8 · Inbound correspondence — the flow, not just the table

Schema is `0005_correspondence.sql` in section 1. The architecture around it:

**Two ways a message arrives.**

1. **The forms already live.** `/api/palace-message` and `/api/support-interest` send to the
   Palace inbox today. They should *also* open a thread, so the Palace has a queue rather than
   a mailbox. This half needs no DNS — only `DATABASE_URL`.
2. **Replies by email.** A villager who answers the Palace's reply is writing to an inbox, not
   to this site. Capturing that needs Resend inbound, which needs **MX records the owner must
   create**.

**Webhook contract.** `POST /api/webhooks/resend`, and it must:

- **Verify the signature** before parsing. An unverified webhook endpoint is an open write
  path into the Palace's queue for anyone who finds the URL.
- **Be idempotent.** `correspondence_messages.provider_id UNIQUE` is the whole defence:
  providers retry, and a retry must not become a second message.
- **Return 200 fast**, then work. A slow webhook gets retried, which multiplies the problem.
- **Never trust the body's sender.** Match a thread by `provider_id` or a token in the
  reply-to, not by a `From:` header, which is trivially forged.

**Status flow.** `new → in_review → waiting_on_sender → answered → closed`, with
`assigned_to` a `palace-admin` clerk id. Every transition writes a row; nothing is silently
reassigned.

**Privacy, absolute.** Correspondence never enters the search index, the sitemap, structured
data, or the Palace AI's retrieval corpus. Every route under `/api/correspondence` and every
admin page requires `requireRole('palace-admin')`. A villager writing to their Fon about a
family matter has not consented to it being searchable, and no convenience outweighs that.

**Owner action:** the MX and DKIM records for inbound on `guneku.org`. Until they exist, build
and test the thread-from-form half and leave the webhook route returning 501 with a comment
saying why.

---

## 9 · YouTube: ingestion, cache and the 46

**What exists:** nothing. `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID` and
`NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` are set in Production and Preview and **called by no code**.
`grep` for `googleapis.com/youtube` across `src/` returns nothing. The 46 approved films live
in `video-gallery.json` under `dbVideos`; `allVideos` is an empty array and `youtubeApiStatus`
is a field, which together suggest an API path designed and abandoned.

**The 46 are the floor, not the ceiling.** They are curated: each has a `displayTitle` that
differs from the raw YouTube `title` (which is `null` on 44 of them), plus `category`,
`context`, `relatedRoute` and `titleVerified`. That curation is editorial work and API
ingestion must never overwrite it.

**Therefore: three layers, merged in this order.**

1. **`dbVideos`** — the approved corpus. Always present, always wins on any field it sets.
2. **`video-overrides.json`** — a new editorial file, keyed by `youtubeId`, for corrections
   the Palace makes after ingestion. Wins over ingested data.
3. **Ingested channel data** — title, thumbnail, published date, duration. Fills gaps only.

A film appears if it is in layer 1 **or** ingested; it is never removed by ingestion, because
a video going private on YouTube should not silently delete it from the Fondom's record.

**Categories are deterministic.** `Palace | Culture | Development | GUDECA | Community |
Archive`, resolved by: the `category` field if set → the override file → a rule table matching
explicit metadata (a `relatedRoute` under `/palace` means Palace, and so on) → `Archive` as
the honest default. **No model classifies a video.** A misfiled film is a small error; a model
inventing that a funeral is a festival is a different kind.

**Cache.** Ingestion runs on a schedule or on demand, never per visitor. Quota is 10,000
units a day and a `playlistItems.list` page costs ~3 — trivial per run, ruinous per request.
Cache to a JSON file written at build time, or Next's `revalidate` with a long window. A
failed fetch **serves the last good cache and logs**; it never empties the gallery.

**Route.** One canonical route. `/gallery/videos` exists and is linked from the homepage and
the sitemap, so it stays canonical and `/watch` redirects to it — a new route would orphan
existing links for a cosmetic gain.

**Credential-independent work available now:** the merge layers, the override file, the
deterministic category resolver, pagination, filter and search over the static 46, and the
`/watch` redirect. Only the fetch itself needs the key, and it is not readable locally
(R-024).

---

## 10 · Vercel Blob: ownership and cleanup

**What exists:** `@vercel/blob` and one upload route, hardened in Phase 2. Before that it was
unauthenticated and wrote everything under `indigenes/demo-user/` (R-027).

**Ownership is encoded in the path.** `indigenes/<clerk_user_id>/<type>-<timestamp>.<ext>`,
where the id comes from the session and never from input. A caller cannot write into another
member's folder because they never get to say whose folder it is.

**Three rules that are already enforced and must stay:**

1. Extension from the **sniffed content type**, not the client filename — a `photo.html`
   cannot decide how the file is served.
2. **SVG rejected.** It can carry script and would be served from our own origin.
3. 5MB cap, and the shared rate limiter.

**Cleanup is the unbuilt half, and it matters.** Nothing deletes anything today:

- **Replacement leaks.** Each upload is a new timestamped key, so changing an avatar leaves
  the old one public forever at a guessable-ish URL. A member who removes an unflattering
  photograph would reasonably expect it gone.
- **Orphans.** A blob whose `indigene_profiles.photo_url` no longer points at it is
  unreferenced but still served.
- **Account deletion.** Deleting a Clerk user must delete their blob prefix, or the site keeps
  photographs of someone who left.

**Design:** on successful upload, delete the previous blob for that `(user, type)` after the
profile row is updated — update first, delete second, so a failure leaves an orphan rather
than a broken page. Add a reconciliation script (`npm run blob:orphans`) that lists blobs with
no referencing row and reports rather than deletes; deleting a villager's photograph is not a
thing a cron job should decide. Wire it to Clerk's `user.deleted` webhook for the account case.

`BLOB_READ_WRITE_TOKEN` is **empty in `.env.local`** and absent from the Vercel listing, so
uploads cannot be exercised locally either.

---

## 11 · The admin and Palace operating surface

One area, `/palace-admin`, behind `requireRole` — and a deliberate design constraint: it is
**not a CRM**. Everything it does is queue plus decision plus trail.

| Surface | Minimum role | What it does |
|---|---|---|
| `/palace-admin` | `reviewer` | Counts of what is waiting. Nothing else. |
| `/palace-admin/claims` | `reviewer` | Approve, reject or ask for more. Writes `reviewed_by` from the session. |
| `/palace-admin/contributions` | `reviewer` | Same, plus the immutable original beside any reviewer note. |
| `/palace-admin/correspondence` | `palace-admin` | The thread queue. Never `reviewer` — correspondence is more sensitive than a claim. |
| `/palace-admin/notifications` | `palace-admin` | Audience size, subject, body, affected projects, and one explicit send. |
| `/palace-admin/archive` | `reviewer` | Approve or reject `draft_ai_description` rows. |

**Four invariants:**

1. **Every surface is `noindex`, absent from the sitemap, and dynamic.** No admin page may be
   prerendered into the public build.
2. **Approval never writes to `src/data/`.** Publishing a contribution is a human copying the
   substance into the authoritative record and committing it. The line between "the database
   holds what people said" and "the archive holds what the Fondom asserts" is the reason the
   archive can be trusted.
3. **A reviewer cannot review their own submission.** Check `clerk_user_id != reviewer id`.
4. **Every decision writes a trail row.** Who, when, from what, to what, and why.

---

## 12 · Observability, audit and security requirements

**What is already true and must not regress:**

- No route under `src/app/api` returns a caught error message (ADR-023, R-020). Every one logs
  the real cause server-side and returns one fixed sentence.
- `src/lib/rate-limit.ts` guards every public form: 5 per route and 12 per sender per 10
  minutes, keyed on `x-forwarded-for`, which is correct **only while guneku.org stays
  DNS-only** through Cloudflare (R-021). If proxying is ever switched on, every visitor
  collapses into one bucket and all four forms lock for everyone.
- No secret value appears in any client bundle. Verified: `sk_live`, `sk_test`, `sk-ant-`,
  Resend keys and Postgres URLs all absent; the one `CLERK_SECRET_KEY` hit is Clerk's own
  `process.env` reference by name.
- `server-only` guards `auth.ts`, `members.ts`, `email/send.ts`, `palace-knowledge.ts` and
  `search-index.ts`.

**What must be added with the database phases:**

- **An audit table, or trail columns on every moderated table.** `claims`,
  `contribution_events` and the correspondence tables all carry actor and timestamp. Nothing
  moderated may change without a row saying who moved it.
- **Rate limits on authenticated routes too.** An account is not a licence to write in a
  loop; `/api/me` and both indigene routes already carry one.
- **Cost and latency logging for the Palace AI, without the question text.** Tokens, model,
  latency, whether layer 1 answered. A villager's question can be personal, and logging it by
  habit is a privacy decision nobody made.
- **A replacement for the in-memory limiter, when it stops being enough.** It resets on
  redeploy and a serverless fleet keeps one counter per instance. It blunts casual abuse and
  would not stop a distributed flood. The fix is a shared store, not a tuning pass.

**The recurring exclusion list.** Every new surface — search, AI retrieval, sitemap, structured
data, an admin export, an RSS feed — must exclude: `publicVisibility: 'hold'` (the Business
Directory), `noindex: true` records, anything without a `publishedAt`, the R-011 sample names,
the R-012 dead directory, officers' personal mobile numbers, private submissions, and
correspondence. This list has had to be re-applied at every phase. It belongs in one shared
predicate that new code calls, rather than being remembered each time — the single most useful
piece of hardening left to do.

**Two standing weaknesses worth naming:** 66 pre-existing `no-explicit-any` lint errors across
older pages (down from 69 at baseline), and 15 npm advisories, none critical, all transitive —
sharp/libvips, undici, browserslist, js-yaml, brace-expansion and dev-only esbuild paths.
Neither is a blocker; both are a deliberate pass, not a `--force`.

---

## 13 · What each remaining phase is actually waiting on

| Phase | Waiting on |
|---|---|
| 3 · Claims | `DATABASE_URL` + Clerk session. Pooled driver first. |
| 4 · Subscriptions | `DATABASE_URL`. `EMAIL_FROM` for a credible sender. |
| 5 · Project transparency + follow | `DATABASE_URL`. The verified-fields part is partly doable now. |
| 6 · Guneku TV | Nothing. `YOUTUBE_API_KEY` is set in both environments; ingestion and cache are buildable and testable. **This is the next phase that needs no owner action.** |
| 8 · Palace AI layer 2 | A readable `ANTHROPIC_API_KEY`. The retrieval half is buildable and testable now. |
| 11 · Contributions | `DATABASE_URL` + Clerk. |
| 12 · Archive intelligence | Anthropic key, and an owner decision on which held media is excluded. |
| 13 · Correspondence | `DATABASE_URL`, Clerk, **and DNS** for inbound. |
| 14 · Notifications | Phases 4 and 5 first. |
| 15 · Preview isolation | Neon dashboard access. Owner only. |
