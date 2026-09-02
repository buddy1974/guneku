import { GUNEKU_QUARTERS_27 } from '@/lib/quarters'

export interface IndigeneProfile {
  id: string
  clerk_user_id: string
  created_at: string
  updated_at: string
  full_name: string
  display_name?: string
  photo_url?: string
  cover_photo_url?: string
  current_city?: string
  current_country?: string
  country_flag?: string
  profession?: string
  employer?: string
  bio?: string
  quarter?: string
  family_lineage?: string
  family_home?: string
  generation?: string
  year_left_guneku?: number
  website_url?: string
  facebook_url?: string
  instagram_url?: string
  linkedin_url?: string
  twitter_url?: string
  youtube_url?: string
  is_verified: boolean
  is_public: boolean
  skills?: string[]
  willing_to_mentor: boolean
  open_to_connect: boolean
}

/* The directory filter offers every quarter the Fondom publishes, plus a fallback
   for people who do not know theirs. It previously offered 16 of 27, which forced
   sons and daughters of eleven quarters to file themselves under "Other". */
export const GUNEKU_QUARTERS = [...GUNEKU_QUARTERS_27, 'Other / Unknown']

export const GENERATIONS = [
  'Living in Guneku',
  '1st Generation abroad',
  '2nd Generation abroad',
  'Born abroad — Guneku heritage',
]
