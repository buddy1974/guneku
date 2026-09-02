import { NextRequest, NextResponse } from 'next/server'
import { sendSupportInterest } from '@/lib/email/send'

const SUPPORT_TYPES = [
  'Financial support', 'Materials', 'Professional expertise', 'Volunteer support', 'Partnership',
]

const hits = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

function rateLimited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (rateLimited(ip)) {
      return NextResponse.json({ error: 'Too many messages from this connection. Please try again later.' }, { status: 429 })
    }

    const b = await req.json()
    if (typeof b.website === 'string' && b.website.trim() !== '') {
      return NextResponse.json({ success: true })
    }

    const name = String(b.name || '').trim()
    const project = String(b.project || '').trim()
    const supportType = String(b.supportType || '').trim()
    const email = String(b.email || '').trim()
    const phone = String(b.phone || '').trim()
    const message = String(b.message || '').trim()
    const organisation = String(b.organisation || '').trim()
    const location = String(b.location || '').trim()

    if (!name || name.length < 2)              return NextResponse.json({ error: 'Please give your name.' }, { status: 400 })
    if (!project)                              return NextResponse.json({ error: 'Please choose a project.' }, { status: 400 })
    if (!SUPPORT_TYPES.includes(supportType))  return NextResponse.json({ error: 'Please choose how you would like to help.' }, { status: 400 })
    if (message.length > 4000)                 return NextResponse.json({ error: 'Please keep the message under 4000 characters.' }, { status: 400 })
    if (b.consent !== true)                    return NextResponse.json({ error: 'Please confirm we may use your details to reply.' }, { status: 400 })
    if (!email && !phone)                      return NextResponse.json({ error: 'Please leave an email address or a telephone number.' }, { status: 400 })
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'Please give a valid email address.' }, { status: 400 })
    }

    await sendSupportInterest({ name, project, supportType, message, email, phone, organisation, location })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || 'Failed to send message.' }, { status: 500 })
  }
}
