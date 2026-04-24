import { NextRequest, NextResponse } from 'next/server'
import {
  getProfileByClerkId,
  createProfile,
  updateProfile,
} from '@/lib/db/queries'
import { sendNewIndigeneAlert } from '@/lib/email/send'

const userId = 'demo-user'

export async function GET() {
  try {
    const profile = await getProfileByClerkId(userId)
    return NextResponse.json({ profile })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
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
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body    = await req.json()
    const profile = await updateProfile(userId, body)
    return NextResponse.json({ profile })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
