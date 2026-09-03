import { NextRequest, NextResponse } from 'next/server'
import {
  getProfileByClerkId,
  createProfile,
  updateProfile,
} from '@/lib/db/queries'
import { sendNewIndigeneAlert } from '@/lib/email/send'

/* These routes talk to Neon, and a driver error can carry connection or schema detail, so
   none of them returns the caught message. The cause is logged server-side and the caller
   gets one fixed sentence. Closes R-020. */

const userId = 'demo-user'

export async function GET() {
  try {
    const profile = await getProfileByClerkId(userId)
    return NextResponse.json({ profile })
  } catch (err) {
    console.error('Indigene profile GET failed:', err)
    return NextResponse.json({ error: 'Could not load your profile. Please try again.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body    = await req.json()
    const profile = await createProfile(userId, body)

    sendNewIndigeneAlert({
      name:       profile.full_name,
      profession: profile.profession  || 'Not specified',
      location:   profile.current_city && profile.current_country
        ? `${profile.current_city}, ${profile.current_country}`
        : 'Not specified',
      quarter:    profile.quarter     || 'Not specified',
      profileUrl: 'https://guneku.org/indigenes/profile',
    }).catch(console.error)

    return NextResponse.json({ profile }, { status: 201 })
  } catch (err) {
    console.error('Indigene profile POST failed:', err)
    return NextResponse.json({ error: 'Could not save your profile. Please try again.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body    = await req.json()
    const profile = await updateProfile(userId, body)
    return NextResponse.json({ profile })
  } catch (err) {
    console.error('Indigene profile PUT failed:', err)
    return NextResponse.json({ error: 'Could not update your profile. Please try again.' }, { status: 500 })
  }
}
