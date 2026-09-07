import { NextRequest, NextResponse } from 'next/server'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import { verifyTurnstile, TURNSTILE_MESSAGE } from '@/lib/turnstile'
import { sendContactEmail } from '@/lib/email/send'

export async function POST(req: NextRequest) {
  try {
    if (rateLimited('contact', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const body = await req.json()

    /* The honeypot the other three anonymous forms already had and this one did not.
       A field no person can see and no person fills in; a script fills in everything.
       Answered with success rather than an error, so a bot learns nothing about why
       nothing arrived. */
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ success: true })
    }

    /* The challenge, verified server-side. A layer over the honeypot and the rate limit,
       never instead of them: it stops a cheap script and says nothing about whether the body
       is well-formed or how often this sender has posted.

       Inert until the owner arms it — with no Cloudflare keys set this returns ok and the
       form behaves exactly as it did. Once armed it fails closed, including when Cloudflare
       itself cannot be reached: a control that stops checking whenever a third party has a
       bad afternoon is not a control. */
    const check = await verifyTurnstile(
      (body as { turnstileToken?: unknown })?.turnstileToken,
      'contact',
      senderKey(req),
    )
    if (!check.ok) {
      return NextResponse.json({ error: TURNSTILE_MESSAGE }, { status: 400 })
    }
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
  } catch (err) {
  /* The mailer sanitises its own failures before throwing, but anything else that lands
     here — malformed JSON, a bad field, a bug — arrives with an internal message. Log the
     real cause for us and tell the visitor one fixed, useful thing. */
    console.error('Contact route failed:', err)
    return NextResponse.json(
      { error: 'Failed to send your message. Please try again.' },
      { status: 500 }
    )
  }
}
