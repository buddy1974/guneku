import { NextRequest, NextResponse } from 'next/server'
import { sendPalaceMessage } from '@/lib/email/send'

const TOPICS = [
  'Palace / traditional matters', 'Community development', 'Project support', 'GUDECA',
  'Education', 'Culture', 'Diaspora', 'Business / partnership',
  'Visit / appointment request', 'General enquiry', 'Other',
]

/* A very small in-memory limiter. It is per-instance and resets on redeploy, which is
   enough to blunt casual abuse without adding a dependency or a CAPTCHA. */
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

    /* Honeypot: a field no human sees. Anything in it is a bot, and it is answered with
       a success shape so the sender learns nothing. */
    if (typeof b.website === 'string' && b.website.trim() !== '') {
      return NextResponse.json({ success: true })
    }

    const name = String(b.name || '').trim()
    const topic = String(b.topic || '').trim()
    const message = String(b.message || '').trim()
    const preferredContact = b.preferredContact === 'phone' ? 'phone' : 'email'
    const email = String(b.email || '').trim()
    const phone = String(b.phone || '').trim()
    const location = String(b.location || '').trim()

    if (!name || name.length < 2)         return NextResponse.json({ error: 'Please give your name.' }, { status: 400 })
    if (!TOPICS.includes(topic))          return NextResponse.json({ error: 'Please choose a topic.' }, { status: 400 })
    if (message.length < 10)              return NextResponse.json({ error: 'Please write a little more so the Palace can help.' }, { status: 400 })
    if (message.length > 4000)            return NextResponse.json({ error: 'Please keep the message under 4000 characters.' }, { status: 400 })
    if (b.consent !== true)               return NextResponse.json({ error: 'Please confirm we may use your details to reply.' }, { status: 400 })

    if (preferredContact === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return NextResponse.json({ error: 'Please give a valid email address.' }, { status: 400 })
      }
    } else if (phone.replace(/[^\d]/g, '').length < 7) {
      return NextResponse.json({ error: 'Please give a callback number we can reach.' }, { status: 400 })
    }

    await sendPalaceMessage({ name, topic, message, preferredContact, email, phone, location })

    /* The response carries nothing about who was copied. */
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || 'Failed to send message.' }, { status: 500 })
  }
}
