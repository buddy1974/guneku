import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  console.log('Running migration...')

  await sql`
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
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS clerk_user_id_idx ON indigene_profiles(clerk_user_id)`
  await sql`CREATE INDEX IF NOT EXISTS country_idx ON indigene_profiles(current_country)`
  await sql`CREATE INDEX IF NOT EXISTS quarter_idx ON indigene_profiles(quarter)`

  console.log('Migration complete.')
  process.exit(0)
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
