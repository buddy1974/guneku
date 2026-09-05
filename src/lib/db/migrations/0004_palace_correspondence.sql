-- 0004_palace_correspondence.sql
--
-- Private correspondence between a person and the Palace.
--
-- Additive only. One CREATE TABLE and four CREATE INDEX, every one IF NOT EXISTS. No DROP,
-- TRUNCATE, DELETE, UPDATE or ALTER, and nothing here reads or writes a canonical record.
--
-- ── This is not Contributions ────────────────────────────────────────────────────────────
--
-- A contribution says "the public Guneku record should be changed". Correspondence says "I
-- want to speak to the Palace about something". The first is reviewed and may eventually
-- alter a page; the second is private and never appears anywhere public. They are separate
-- tables because they are separate things, and merging them would put private letters into
-- a queue whose whole purpose is editing the public record.
--
-- ── Everything here is private ───────────────────────────────────────────────────────────
--
-- No row in this table is ever rendered on a public page, indexed for search, listed in the
-- sitemap or returned by a public API. The message, the sender's email, the Palace's internal
-- note and the response are all private, and the internal note is private even from the
-- person who wrote in.
--
-- ── Why clerk_user_id is nullable ────────────────────────────────────────────────────────
--
-- A villager must not need an account to write to their own Palace. A signed-out visitor
-- submits with a name and a way to reply, and the row simply has no member attached; a
-- signed-in member's row carries their Clerk id so the letter can appear in My Guneku.
--
-- NULL means "no account", never "unknown account". No identity is manufactured for a
-- visitor, and a null here can never be filled in later by guessing who they were.

CREATE TABLE IF NOT EXISTS palace_correspondence (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Present only when the sender was signed in. Written from the Clerk session server-side.
  clerk_user_id   TEXT,

  -- How to reply. For a signed-out visitor this is all the Palace has.
  sender_name     TEXT NOT NULL,
  sender_email    TEXT,
  sender_phone    TEXT,

  category        TEXT NOT NULL CHECK (category IN (
                    'general-enquiry', 'palace-matter', 'community-matter',
                    'development-matter', 'cultural-matter', 'information-request',
                    'other')),

  subject         TEXT NOT NULL,
  message         TEXT NOT NULL,

  -- received -> in-review -> responded -> closed. Four states, no CRM pipeline.
  status          TEXT NOT NULL DEFAULT 'received'
                    CHECK (status IN ('received', 'in-review', 'responded', 'closed')),

  -- What the Palace wrote back. Shown to the sender when it exists.
  response        TEXT,
  responded_at    TIMESTAMPTZ,

  -- The Palace's own working note. NEVER returned to the sender, under any circumstance —
  -- see `toSenderView` in src/lib/db/correspondence.ts, which does not carry this column.
  internal_note   TEXT,

  -- Who at the Palace last acted. Moderation information; never returned to the sender.
  handled_by      TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A reply has to be possible. One of the two contact routes must be present, which is the
  -- same rule the existing public form already enforces — stated here so it holds however
  -- the row was written.
  CONSTRAINT palace_correspondence_contact_required CHECK (
    (sender_email IS NOT NULL AND sender_email <> '')
    OR (sender_phone IS NOT NULL AND sender_phone <> '')
  ),

  -- A response and its timestamp arrive together, or not at all.
  CONSTRAINT palace_correspondence_response_pairing CHECK (
    (response IS NULL AND responded_at IS NULL)
    OR (response IS NOT NULL AND responded_at IS NOT NULL)
  )
);

-- A member opening My Guneku reads their own letters, newest first.
CREATE INDEX IF NOT EXISTS palace_correspondence_user_idx
  ON palace_correspondence (clerk_user_id, created_at DESC);

-- The Palace queue reads what is still open, oldest first.
CREATE INDEX IF NOT EXISTS palace_correspondence_status_idx
  ON palace_correspondence (status, created_at);

CREATE INDEX IF NOT EXISTS palace_correspondence_category_idx
  ON palace_correspondence (category);

CREATE INDEX IF NOT EXISTS palace_correspondence_created_idx
  ON palace_correspondence (created_at DESC);

-- No unique constraint. A person may legitimately write to the Palace many times, about
-- many things, and refusing a second letter would be the database deciding how often
-- somebody may speak to their own Fon. Volume is the rate limiter's job.
