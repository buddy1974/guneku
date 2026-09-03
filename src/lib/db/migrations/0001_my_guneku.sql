-- 0001_my_guneku.sql
--
-- The first versioned migration for Guneku. Everything before it was applied by running
-- src/lib/db/migrate.ts, an unversioned script (R-025); this file starts the versioned
-- path, and the runner records what it has applied so an environment can be asked what it
-- has rather than guessed at.
--
-- NOT APPLIED. No environment has run this. Applying it needs a DATABASE_URL, and the
-- local one is empty. See R-024.
--
-- Design note that governs every table here: authoritative Guneku facts are NOT moved into
-- the database. A person's quarter, their chapter, the body they sit in, their place in the
-- Palace family and their history stay in the reviewed JSON records. These tables hold only
-- what a *user* does — who they are on the platform, what they have asked for, what they
-- follow, what they have put forward. A row here never overwrites the record; it asks a
-- human to consider changing it.

CREATE TABLE IF NOT EXISTS schema_migrations (
  version     TEXT PRIMARY KEY,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Platform membership ─────────────────────────────────────────────────────────────────
-- One row per signed-in person. Clerk owns identity, session and the platform role; this is
-- the village-side record of the same person, holding only what Guneku needs and Clerk has
-- no business storing.
--
-- `quarter` and `chapter` are free text here on purpose: they are what the member *says*
-- about themselves, unverified, and the UI must present them that way. They are not a claim
-- on the register and carry no authority. Verified placement comes from an approved claim
-- against a sourced record, never from this column.

CREATE TABLE IF NOT EXISTS community_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id     TEXT NOT NULL UNIQUE,

  display_name      TEXT,
  email             TEXT,
  country           TEXT,
  quarter           TEXT,
  chapter           TEXT,

  -- Preferences. Default to the private option: a member opts in to being visible.
  profile_public     BOOLEAN NOT NULL DEFAULT FALSE,
  show_country       BOOLEAN NOT NULL DEFAULT TRUE,
  show_quarter       BOOLEAN NOT NULL DEFAULT FALSE,
  contactable         BOOLEAN NOT NULL DEFAULT FALSE,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS community_members_clerk_idx   ON community_members (clerk_user_id);
CREATE INDEX IF NOT EXISTS community_members_quarter_idx ON community_members (quarter);
CREATE INDEX IF NOT EXISTS community_members_country_idx ON community_members (country);

-- ── Follows ─────────────────────────────────────────────────────────────────────────────
-- What a member wants to hear about. `subject_type` + `subject_id` point at a record by its
-- stable source id rather than by a foreign key, because the thing being followed lives in
-- JSON, not in this database. A follow is a wish to be told, and nothing is sent from it
-- until a human presses send.

CREATE TABLE IF NOT EXISTS follows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id   TEXT NOT NULL,
  subject_type    TEXT NOT NULL CHECK (subject_type IN
                    ('project', 'topic', 'quarter', 'event', 'institution')),
  subject_id      TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (clerk_user_id, subject_type, subject_id)
);

CREATE INDEX IF NOT EXISTS follows_user_idx    ON follows (clerk_user_id);
CREATE INDEX IF NOT EXISTS follows_subject_idx ON follows (subject_type, subject_id);
