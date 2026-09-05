-- 0003_contributions.sql
--
-- Moderated contributions: how a son or daughter of Guneku supplies what the record is
-- missing, or corrects what it has wrong.
--
-- Additive only. One CREATE TABLE and four CREATE INDEX, every one IF NOT EXISTS. There is
-- no DROP, TRUNCATE, DELETE, UPDATE or ALTER, and nothing here reads or writes a single
-- canonical record.
--
-- ── Contribution is not publication ──────────────────────────────────────────────────────
--
-- Every row starts `pending` and nothing about it is public. Accepting one does NOT change
-- a page, a register, a roster or a JSON file: it records that Guneku has reviewed the
-- contribution and accepted it for editorial action. Making the change afterwards is a
-- deliberate act by a person editing the reviewed records, and there is no code path from
-- this table to those files — this migration creates no trigger, no foreign key and no
-- reference to canonical content of any kind.
--
-- That separation is the point. A system that published on approval would be a system in
-- which one click by one reviewer rewrites the record of the Fondom, and the value of a
-- village archive is precisely that somebody is answerable for every line in it.
--
-- ── What a target is ─────────────────────────────────────────────────────────────────────
--
-- `target_type` + `target_id` say what the contribution concerns: a canonical quarter, a
-- person in the register, a body, a GUDECA chapter, a page, or the record in general. The id
-- is a plain TEXT pointer, validated in the application against the reviewed data before the
-- row is written, so a browser cannot invent a quarter or a person that does not exist.
--
-- There is deliberately no foreign key. The things being pointed at live in reviewed JSON,
-- not in this database, and that is where they should stay.

CREATE TABLE IF NOT EXISTS contributions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who is contributing. Written from the Clerk session server-side, never from a body.
  clerk_user_id   TEXT NOT NULL,

  -- The kind of contribution. A closed set, enforced here as well as in the application,
  -- because a type column with no constraint is a free-text field with a hopeful name.
  type            TEXT NOT NULL CHECK (type IN (
                    'correction', 'missing-information', 'quarter-information',
                    'gudeca-information', 'person-information', 'history-culture',
                    'photo-archive', 'other')),

  -- What it concerns. 'general' carries no id; every other kind carries one that the
  -- application has already checked against the canonical records.
  target_type     TEXT NOT NULL CHECK (target_type IN (
                    'quarter', 'person', 'body', 'chapter', 'page', 'general')),
  target_id       TEXT,

  -- What the contributor is telling the Fondom, and where they know it from. Both are
  -- private to the contributor and the reviewers, and neither is ever rendered publicly.
  content         TEXT NOT NULL,
  source_note     TEXT,

  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Set when a reviewer decides. `reviewed_by` holds the reviewer's Clerk id and is never
  -- returned to a contributor: who reviewed a submission is moderation information.
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     TEXT,

  -- A 'general' contribution has no target; everything else must name one. Stated as a
  -- constraint rather than trusted to the application, so a future caller cannot write a
  -- quarter contribution that forgets to say which quarter.
  CONSTRAINT contributions_target_id_required CHECK (
    (target_type = 'general' AND target_id IS NULL)
    OR (target_type <> 'general' AND target_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS contributions_user_idx   ON contributions (clerk_user_id);
CREATE INDEX IF NOT EXISTS contributions_target_idx ON contributions (target_type, target_id);
-- The reviewer queue reads pending contributions oldest-first.
CREATE INDEX IF NOT EXISTS contributions_status_idx ON contributions (status, created_at);
CREATE INDEX IF NOT EXISTS contributions_type_idx   ON contributions (type);

-- No unique index here, and that is deliberate. Unlike a profile claim, a person may
-- legitimately contribute to the same quarter many times — a market day this month, a
-- school next month, a correction after that. Rate limiting is the right control for
-- volume; a uniqueness constraint would refuse a second genuine contribution.
