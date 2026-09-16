-- 0005_businesses.sql
--
-- The Business Directory's user-generated half: what a verified son or daughter of Guneku
-- enters about their own business and may edit afterwards.
--
-- Additive only. Three CREATE TABLE and eight CREATE INDEX, every one IF NOT EXISTS. There is
-- no DROP, TRUNCATE, DELETE, UPDATE or ALTER, and nothing here reads or writes a canonical
-- Guneku record.
--
-- ── Why this is in the database at all ───────────────────────────────────────────────────
--
-- Almost everything else about Guneku lives in reviewed JSON, because almost everything else
-- is a fact about the village that a person should be answerable for. A business is different
-- in one way that changes the answer: its owner must be able to change it. A woman who moves
-- her shop, adds a service or replaces her logo should not need a commit, and a directory
-- that requires one will be out of date within a month of launch.
--
-- So the curated businesses the Fondom has recorded stay in
-- `src/data/businesses/businesses.json`, and these tables hold what people enter about their
-- own. The directory renders both. That is the same arrangement `/indigenes` already uses for
-- the register and the member profiles beside it.
--
-- ── Who owns a row ───────────────────────────────────────────────────────────────────────
--
-- `clerk_user_id` is who may edit it, written from the session server-side and never from a
-- request body. `person_slug` is which son or daughter of Guneku the business belongs to, and
-- it is NOT supplied by the browser either: it is read from the submitter's own approved
-- profile claim at the moment of writing. A member cannot attach their business to somebody
-- else's name, because they never get to say whose name it is.
--
-- There is deliberately no foreign key on `person_slug`. The person lives in
-- `founding-names.json`, a reviewed record this database cannot reach, exactly as with
-- `profile_claims` (ADR-047). The register is upstream and stays upstream.

CREATE TABLE IF NOT EXISTS businesses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The published URL. Allocated once and never changed by a rename: a business link is a
  -- thing somebody writes down, and a directory that breaks its own URLs when a shop is
  -- renamed has taught everybody not to link to it.
  slug            TEXT NOT NULL UNIQUE,

  -- Who may edit. From the Clerk session, always.
  clerk_user_id   TEXT NOT NULL,

  -- Whose business it is, in the register's own terms. Read from the submitter's approved
  -- claim server-side; never accepted from a request.
  person_slug     TEXT NOT NULL,

  -- The word the relationship actually deserves. A closed set, enforced here as well as in
  -- the application, because not everybody is an owner and calling them all one would
  -- misdescribe most of them.
  relationship    TEXT NOT NULL DEFAULT 'owner'
                    CHECK (relationship IN (
                      'owner', 'founder', 'co-founder', 'director', 'managing-director',
                      'operator', 'practitioner', 'physician', 'associated')),

  name            TEXT NOT NULL,
  tagline         TEXT,
  description     TEXT,

  -- One primary category from the closed list, so the directory cannot fragment into
  -- "Media", "media" and "Media & Film" holding one business each.
  category        TEXT NOT NULL
                    CHECK (category IN (
                      'technology-digital', 'property-real-estate', 'media-creative',
                      'health-care', 'medical-practice', 'laboratory-diagnostics',
                      'agriculture-aquaculture', 'retail-commerce', 'construction-trades',
                      'professional-services')),

  -- Narrow specialisms. Free text by design: a tag that is wrong is a bad filter, whereas a
  -- category that is wrong splits the directory.
  tags            TEXT[] NOT NULL DEFAULT '{}',
  services        TEXT[] NOT NULL DEFAULT '{}',
  service_areas   TEXT[] NOT NULL DEFAULT '{}',

  -- The BUSINESS's address. A business may publish a street and a town because the address
  -- is its own and already public. This is never read back as anybody's residence, and the
  -- register's rule that a person gets a country and never a town is untouched by it.
  country         TEXT,
  city            TEXT,
  address         TEXT,

  -- Stored as parsed absolute URLs or not at all. The application refuses anything that is
  -- not http or https before it reaches here.
  website         TEXT,
  facebook        TEXT,
  instagram       TEXT,
  linkedin        TEXT,
  youtube         TEXT,

  -- Contact the owner has DELIBERATELY elected to publish about the business. Nothing is
  -- ever copied here from the person's own Guneku profile: a directory that quietly
  -- republished somebody's member email as a business address would be doing the one thing
  -- the contact rules exist to prevent.
  publish_contact BOOLEAN NOT NULL DEFAULT FALSE,
  contact_phone   TEXT,
  contact_email   TEXT,

  logo_url        TEXT,
  cover_url       TEXT,

  -- draft -> pending -> public, with held and archived as the two ways out. `held` is the
  -- word this repository already uses for "kept, not shown" (ADR-005) and is kept rather
  -- than renamed to something tidier.
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'pending', 'public', 'held', 'archived')),

  -- Set when a reviewer decides. Never returned to the owner: who reviewed a submission is
  -- moderation information, the same rule claims and contributions already follow.
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     TEXT,
  review_note     TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A published business has to say what it is and where. Stated as a constraint rather than
  -- trusted to the application, so a future caller cannot publish an empty card.
  CONSTRAINT businesses_public_needs_content CHECK (
    status <> 'public'
    OR (description IS NOT NULL AND description <> '' AND country IS NOT NULL AND country <> '')
  ),

  -- Contact details exist only when their publication was chosen. This is the consent
  -- decision written into the schema: turning publication off cannot leave a stale address
  -- sitting in a column for some later query to find.
  CONSTRAINT businesses_contact_requires_consent CHECK (
    publish_contact = TRUE
    OR (contact_phone IS NULL AND contact_email IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS businesses_owner_idx  ON businesses (clerk_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS businesses_person_idx ON businesses (person_slug);
CREATE INDEX IF NOT EXISTS businesses_status_idx ON businesses (status, created_at);
CREATE INDEX IF NOT EXISTS businesses_public_idx ON businesses (category, country)
  WHERE status = 'public';

-- ── Videos ───────────────────────────────────────────────────────────────────────────────
--
-- An eleven-character YouTube id and a position. NOT a URL, and emphatically not an embed:
-- the application parses whatever was pasted, extracts the id, and stores only that, so the
-- one thing a contributor controls is which video plays. The embed is built by our own code
-- from the id.
--
-- The CHECK is the same rule the application applies, stated where it cannot be bypassed by
-- a future caller who forgot.

CREATE TABLE IF NOT EXISTS business_videos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  video_id     TEXT NOT NULL CHECK (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  title        TEXT,
  position     INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, video_id)
);

CREATE INDEX IF NOT EXISTS business_videos_business_idx
  ON business_videos (business_id, position);

-- ── Gallery ──────────────────────────────────────────────────────────────────────────────
--
-- Image references only. The files themselves live in the blob store the profile uploads
-- already use, written under a path scoped to the uploading session.

CREATE TABLE IF NOT EXISTS business_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  alt          TEXT,
  position     INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS business_images_business_idx
  ON business_images (business_id, position);

-- ── Why there is no business_people table ────────────────────────────────────────────────
--
-- The obvious next table is one joining businesses to several people, and it is deliberately
-- not here. Every business created through this path has exactly one person behind it: the
-- verified member who created it, read from their own approved claim. A second person cannot
-- be added by either of them typing a name, because that is impersonation with extra steps —
-- it needs the same review a profile claim needs.
--
-- `relationship` therefore sits on the business itself, and the curated records in JSON carry
-- a `people` array for the cases the Fondom has established by hand. When co-owner
-- verification is built, this becomes a table and the column moves into it; nothing published
-- in the meantime has to change shape, because the public type already reads a list.
