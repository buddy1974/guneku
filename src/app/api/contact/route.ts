import { NextRequest, NextResponse } from 'next/server'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import { sendContactEmail } from '@/lib/email/send'

export async function POST(req: NextRequest) {
  try {
    if (rateLimited('contact', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const body = await req.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    await sendContactEmail({
      senderName:  name,
      senderEmail: email,
      subject,
      message,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to send message' },
      { status: 500 }
    )
  }
}
