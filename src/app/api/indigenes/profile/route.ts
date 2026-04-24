import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import {
  getProfileByClerkId,
  createProfile,
  updateProfile,
} from '@/lib/db/queries'
import { sendWelcomeEmail, sendNewIndigeneAlert } from '@/lib/email/send'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const profile = await getProfileByClerkId(userId)
    return NextResponse.json({ profile })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body    = await req.json()
    const profile = await createProfile(userId, body)

    // Get email from Clerk — fire emails non-blocking
    currentUser().then(clerkUser => {
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress
      if (email) {
        sendWelcomeEmail({
          toEmail:  email,
          name:     profile.full_name,
          quarter:  profile.quarter || undefined,
          location: profile.current_city && profile.current_country
            ? `${profile.current_city}, ${profile.current_country}`
            : undefined,
        }).catch(console.error)
      }

      sendNewIndigeneAlert({
        name:       profile.full_name,
        profession: profile.profession  || 'Not specified',
        location:   profile.current_city && profile.current_country
          ? `${profile.current_city}, ${profile.current_country}`
          : 'Not specified',
        quarter:    profile.quarter     || 'Not specified',
        profileUrl: 'https://guneku.org/indigenes/profile',
      }).catch(console.error)
    }).catch(console.error)

    return NextResponse.json({ profile }, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body    = await req.json()
    const profile = await updateProfile(userId, body)
    return NextResponse.json({ profile })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
