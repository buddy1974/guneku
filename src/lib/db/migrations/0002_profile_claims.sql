-- 0002_profile_claims.sql
--
-- The moderated profile-claiming workflow. Additive only: one CREATE TABLE and four
-- CREATE INDEX statements. There is no DROP, no TRUNCATE, no DELETE, no ALTER of any
-- existing table, and nothing here reads or writes a single historical person record.
--
-- ── What this table is, and what it is emphatically not ─────────────────────────────────
--
-- A claim is a REQUEST FOR REVIEW. It is a member saying "I believe this existing Guneku
-- record is me", and a human deciding. Approving one establishes exactly one fact:
--
--     this authenticated Guneku member has been reviewed and associated with this
--     existing Guneku person record
--
-- It does not transfer editorial authority over anything. It does not change a biography,
-- a traditional office, Royal Family standing, Notable standing, GUDECA membership or
-- diaspora classification. It does not merge identities, publish a new fact, or grant a
-- permission. Every one of those remains a decision a person makes in the reviewed JSON
-- records, which this database never writes to and cannot reach.
--
-- That is why `person_slug` is a plain TEXT column and not a foreign key. The thing being
-- claimed lives in src/data/community/founding-names.json — a reviewed, sourced, public
-- record — and the database deliberately holds only a pointer to it. The historical record
-- is upstream of this table and stays upstream of it.
--
-- The approved row IS the association. There is no second "ownership" table, because a
-- second table would be the same fact stored twice and two places to disagree.

CREATE TABLE IF NOT EXISTS profile_claims (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who is asking. Written from the Clerk session server-side, never from a request body.
  clerk_user_id   TEXT NOT NULL,

  -- Which record they say is them: the canonical register slug, nothing more. No copy of
  -- the person's name, office, chapter or history is made here — the record is the record.
  person_slug     TEXT NOT NULL,

  -- The four states the workflow has. Enforced by the database as well as by the code,
  -- because a status column with no constraint is a free-text field with a hopeful name.
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),

  -- The claimant's own words: why they believe this record is theirs. Private to the
  -- claimant and the reviewers, and never rendered on a public page.
  note            TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Set when a reviewer decides. `reviewed_by` holds the reviewer's Clerk id and is never
  -- returned to a claimant: who reviewed a claim is moderation information, not a fact the
  -- claimant is owed.
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     TEXT
);

CREATE INDEX IF NOT EXISTS profile_claims_user_idx   ON profile_claims (clerk_user_id);
CREATE INDEX IF NOT EXISTS profile_claims_person_idx ON profile_claims (person_slug);
-- The reviewer queue reads pending claims oldest-first.
CREATE INDEX IF NOT EXISTS profile_claims_status_idx ON profile_claims (status, created_at);

-- ── Two integrity rules the database itself keeps ───────────────────────────────────────
--
-- Partial indexes rather than plain UNIQUE constraints, because both rules are about LIVE
-- claims only. A withdrawn claim must not block a member from asking again, and a rejected
-- one must not either — someone may come back with more to say, and refusing them forever
-- on a technicality would be the database making a moderation decision.

-- One live claim per member per record. A member cannot accumulate duplicate pending
-- requests for the same person, however many times they press the button or open the form.
CREATE UNIQUE INDEX IF NOT EXISTS profile_claims_one_live_per_member_idx
  ON profile_claims (clerk_user_id, person_slug)
  WHERE status IN ('pending', 'approved');

-- One approved association per record. Two people may both ask to be the same son of
-- Guneku — that is exactly the case review exists for — but only one can be approved, and
-- the database is what makes that true rather than a reviewer remembering.
CREATE UNIQUE INDEX IF NOT EXISTS profile_claims_one_approved_per_person_idx
  ON profile_claims (person_slug)
  WHERE status = 'approved';
