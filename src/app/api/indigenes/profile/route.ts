import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  getProfileByClerkId,
  createProfile,
  updateProfile,
} from '@/lib/db/queries'

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
