import {
  pgTable, uuid, text, boolean,
  integer, timestamp, index
} from 'drizzle-orm/pg-core'

export const indigeneProfiles = pgTable('indigene_profiles', {
  id:              uuid('id').defaultRandom().primaryKey(),
  clerkUserId:     text('clerk_user_id').notNull().unique(),
  createdAt:       timestamp('created_at').defaultNow(),
  updatedAt:       timestamp('updated_at').defaultNow(),

  fullName:        text('full_name').notNull(),
  displayName:     text('display_name'),
  photoUrl:        text('photo_url'),
  coverPhotoUrl:   text('cover_photo_url'),

  currentCity:     text('current_city'),
  currentCountry:  text('current_country'),
  countryFlag:     text('country_flag'),

  profession:      text('profession'),
  employer:        text('employer'),
  bio:             text('bio'),

  quarter:         text('quarter'),
  familyLineage:   text('family_lineage'),
  familyHome:      text('family_home'),
  generation:      text('generation'),
  yearLeftGuneku:  integer('year_left_guneku'),

  websiteUrl:      text('website_url'),
  facebookUrl:     text('facebook_url'),
  instagramUrl:    text('instagram_url'),
  linkedinUrl:     text('linkedin_url'),
  twitterUrl:      text('twitter_url'),
  youtubeUrl:      text('youtube_url'),

  isVerified:      boolean('is_verified').default(false),
  isPublic:        boolean('is_public').default(true),
  willingToMentor: boolean('willing_to_mentor').default(false),
  openToConnect:   boolean('open_to_connect').default(true),

  skillsText:      text('skills_text'),
},
(table) => ({
  clerkIdx:   index('clerk_user_id_idx').on(table.clerkUserId),
  countryIdx: index('country_idx').on(table.currentCountry),
  quarterIdx: index('quarter_idx').on(table.quarter),
}))
