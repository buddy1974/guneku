-- 0000_indigene_profiles.sql
--
-- The original table, recovered verbatim from the unversioned src/lib/db/migrate.ts as it
-- stood at commit 61d5e00, so the history of how the live table was created is not lost
-- when that script became a versioned runner.
--
-- ALREADY APPLIED in any environment that has an indigene_profiles table. Every statement
-- is IF NOT EXISTS, so recording it as applied is safe either way. If you are bootstrapping
-- an empty database, this runs first and creates the table for real.

  CREATE TABLE IF NOT EXISTS indigene_profiles (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_user_id    TEXT UNIQUE NOT NULL,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW(),

    full_name        TEXT NOT NULL,
    display_name     TEXT,
    photo_url        TEXT,
    cover_photo_url  TEXT,

    current_city     TEXT,
    current_country  TEXT,
    country_flag     TEXT,

    profession       TEXT,
    employer         TEXT,
    bio              TEXT,

    quarter          TEXT,
    family_lineage   TEXT,
    family_home      TEXT,
    generation       TEXT,
    year_left_guneku INTEGER,

    website_url      TEXT,
    facebook_url     TEXT,
    instagram_url    TEXT,
    linkedin_url     TEXT,
    twitter_url      TEXT,
    youtube_url      TEXT,

    is_verified      BOOLEAN DEFAULT FALSE,
    is_public        BOOLEAN DEFAULT TRUE,
    willing_to_mentor BOOLEAN DEFAULT FALSE,
    open_to_connect  BOOLEAN DEFAULT TRUE,

    skills_text      TEXT
  );

CREATE INDEX IF NOT EXISTS clerk_user_id_idx ON indigene_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS country_idx ON indigene_profiles(current_country);
CREATE INDEX IF NOT EXISTS quarter_idx ON indigene_profiles(quarter);
