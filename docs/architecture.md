# Guneku — platform architecture record

Written 2026-09-03 as Phase 1 of the digital village platform programme, against
`feat/village-square-archive-fallback` at `64dedd7` (Next.js 16.3.3).

This is a record of what **is**, not what is planned. Where a capability is provisioned but
unused, that is stated. Where something could not be verified from this environment, that is
stated too rather than guessed.

---

## 1 · Environment variables

Names only. No value has been read into this record, and the temporary file `vercel env pull`
wrote was deleted immediately after inspection.

| Variable | Production | Preview | Development (Vercel) |
|---|---|---|---|
| `DATABASE_URL` | SET | SET | UNSET |
| `CLERK_SECRET_KEY` | SET | SET | UNSET |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | SET | SET | UNSET |
| `ANTHROPIC_API_KEY` | SET | SET | UNSET |
| `RESEND_API_KEY` | SET | SET | UNSET |
| `YOUTUBE_API_KEY` | SET | SET | UNSET |
| `YOUTUBE_CHANNEL_ID` | SET | SET | UNSET |
| `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` | SET | SET | UNSET |
| `EMAIL_ADMIN` | **SET** | UNSET | UNSET |
| `EMAIL_BCC` | **SET** | UNSET | UNSET |
| `EMAIL_FROM` | UNSET | UNSET | UNSET |

`EMAIL_ADMIN` and `EMAIL_BCC` were set in Production by the owner between the morning and
afternoon of 2026-09-03. `EMAIL_FROM` remains unset everywhere, so mail sends from the
`send.ts` fallback `Guneku Fondom <onboarding@resend.dev>`.

**Local `.env.local`** holds: a real-shaped `ANTHROPIC_API_KEY`, a 16-character
`RESEND_API_KEY` placeholder, `EMAIL_FROM`, `EMAIL_ADMIN`, an **empty** `DATABASE_URL`, an
empty `BLOB_READ_WRITE_TOKEN`, and six leftover `AUTH_*` variables from the abandoned
next-auth attempt. It holds **no Clerk keys**.

### Why the keys could not be validated

`vercel env pull` returns every secret as an empty string — the values are write-only to the
CLI in this project. They are not in `.env.local` either. So **no key was validated**: not
Clerk, not Neon, not Resend, not YouTube. Their presence in Vercel is established; their
correctness is not. See R-024.

---

## 2 · Neon

**One table exists.** `indigene_profiles`, declared twice — as Drizzle schema in
`src/lib/db/schema.ts` and as raw DDL in `src/lib/db/migrate.ts`.

- **PK** `id uuid default gen_random_uuid()`
- **Unique** `clerk_user_id text not null` — the column the Clerk integration was designed
  around, populated today only by the string `demo-user`
- **Indexes** `clerk_user_id_idx`, `country_idx`, `quarter_idx`
- **No foreign keys**, because there is no second table
- ~30 profile columns: name, photo, city/country, profession, bio, quarter, family lineage,
  six social URLs, and four booleans (`is_verified`, `is_public`, `willing_to_mentor`,
  `open_to_connect`)

**Absent:** users, claims, submissions, projects, subscriptions, follows, correspondence,
locations, roles. Every table the programme needs beyond profiles has to be created.

**Migration process is ad hoc.** `src/lib/db/migrate.ts` is a hand-written script of
`CREATE TABLE IF NOT EXISTS` executed by running the file. There is **no `drizzle.config.*`**,
no migrations directory, no version table, and **no npm script** to run it — `package.json`
has only `dev`, `build`, `start`, `lint`. `drizzle-orm` and `drizzle-kit` are installed but
unwired. A programme that adds a dozen tables needs a real migration path first. See R-025.

**Preview vs Production isolation is unknown.** Both have `DATABASE_URL` set; the values are
unreadable from here, so whether they point at the same Neon branch cannot be determined
without the Neon dashboard. This is the whole of Phase 15 and it is blocked on owner access.

---

## 3 · Clerk

Provisioned in Vercel, absent from the codebase. Recorded as R-022. In detail:

- `@clerk/nextjs` is **not** a dependency; no file imports it
- `middleware.ts` is `export function middleware() {}` with `matcher: []` — it matches
  nothing and does nothing
- `/sign-in/[[...sign-in]]` and `/sign-up/[[...sign-up]]` render static pages reading
  "Member authentication coming soon."
- The only occurrences of "clerk" in `src/` are the column name `clerk_user_id` and its
  TypeScript mirror in `src/types/indigene.ts`
- No rows are linked to real Clerk IDs; `src/app/api/indigenes/profile/route.ts` hardcodes
  `const userId = 'demo-user'` (R-023)
- No role model of any kind exists

**Public write endpoints today:** `/api/indigenes/profile` POST and PUT. Unauthenticated,
unrate-limited, and all writes land on the same `demo-user` row.

---

## 4 · Resend

`resend@6.12.2`. Only one API surface is used anywhere: `resend.emails.send`.

Six transactional senders in `src/lib/email/send.ts`: `sendWelcomeEmail`,
`sendContactEmail`, `sendNewIndigeneAlert`, `sendPalaceMessage`, `sendSupportInterest`,
`sendDirectorySubmission`. All are `server-only`. BCC is read from `EMAIL_BCC` and omitted
when absent (ADR-010). `replyTo` is set from the sender's own address where the form
collected one.

**Not implemented at all:** audiences, broadcasts, inbound email, webhooks, suppression
lists, unsubscribe handling. Phase 4 and Phase 13 both start from zero here, and Phase 13's
inbound path additionally needs DNS records only the owner can create.

---

## 5 · Anthropic

`@anthropic-ai/sdk@0.87.0`. Two consumers:

**`src/lib/palace-knowledge.ts`** — the deterministic assistant behind `/api/ask`. No model
call. `server-only`. This is layer 1 and it is sound.

**`src/app/api/chat/route.ts`** — dormant, mounted at a live route, called only by
`src/components/home/AIAssistant.tsx`, which is **not rendered on any page or layout**. It is
not safe to reuse, for five separate reasons:

1. **It is instructed to speak as the Fondom.** `site-config.json` → `aiPersonality` begins
   *"You are the voice of Guneku Fondom"*. That is the thing the programme's AI rules forbid.
2. **It is instructed to answer from model memory** — *"You only answer based on what you
   know about Guneku"* — rather than from retrieved sources.
3. **Its corpus is unfiltered.** `buildKnowledgeBase()` calls `getAllKingdomArticles()`,
   `getAllPalaceArticles()` and `getAllUpdates()`. **None of the three filters by published
   state**; `getAllUpdates()` merely sorts records with a null `publishedAt` to the end and
   still returns them. One such record exists today. Unpublished material would enter the
   prompt.
4. **No limits.** No rate limit, no input length cap, no timeout. `max_tokens` is 500.
5. **No citations**, and the whole corpus is stuffed into every request rather than retrieved.

Its model id is `claude-sonnet-4-6`, a previous generation. Phase 8 should target a current
model and should build layer 2 fresh on top of `palace-knowledge.ts`, reusing nothing from
this route but the SDK dependency. See R-026.

---

## 6 · YouTube

**Fully static. The API is never called.** `grep` for `googleapis.com/youtube` and
`youtube/v3` across `src/` returns nothing, despite `YOUTUBE_API_KEY`,
`YOUTUBE_CHANNEL_ID` and `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` being set in both environments.

`src/data/gallery/video-gallery.json` carries `dbVideos` with **46 entries** — the approved
corpus — plus an empty `allVideos` array and a `youtubeApiStatus` field, which together
suggest an API path was designed and never built. The 46 are plain data and are preserved by
leaving that array alone; Phase 6 must add ingestion beside them, not in place of them.

No cache layer exists because there is nothing to cache yet. Quota behaviour is therefore
untested.

---

## 7 · Next.js

`16.3.3`, pinned exactly (ADR-025). `16.3.4` is npm's `latest` and the only stable release
above it; nothing newer than `16.3.4` exists outside canary and preview tags. React and
react-dom are `19.2.4`, satisfying 16.3.3's `^19.0.0` peer range, so no React change was
needed and no codemod applied.

The build reports `ƒ Proxy (Middleware)` for the empty `middleware.ts`, emits no deprecation
or rename warnings, and produces 188 static pages. Per-page canonicals, the 95-URL sitemap
and `robots.txt` all behave as before the upgrade.
