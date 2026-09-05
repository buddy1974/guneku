import { NextRequest, NextResponse } from 'next/server'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import { sendPalaceMessage } from '@/lib/email/send'
import { optionalUser } from '@/lib/auth'
import { categoryForTopic, MAX } from '@/lib/correspondence'
import { createCorrespondence } from '@/lib/db/correspondence'

const TOPICS = [
  'Palace / traditional matters', 'Community development', 'Project support', 'GUDECA',
  'Education', 'Culture', 'Diaspora', 'Business / partnership',
  'Visit / appointment request', 'General enquiry', 'Other',
]


export async function POST(req: NextRequest) {
  try {
    if (rateLimited('palace-message', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
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

    /* The email goes first, and it is what the visitor's success depends on. This route has
       been the Palace's working contact channel; adding a database behind it must not create
       a new way for it to fail. If Resend accepts the message the Palace has it, whatever
       happens next. */
    await sendPalaceMessage({ name, topic, message, preferredContact, email, phone, location })

    /* Then the letter is recorded, so it has a life beyond an inbox: a status the sender can
       see, and a place for the Palace to answer it. Best effort by design — a database that
       is unreachable, or a migration not yet applied, must not turn a delivered message into
       an error for someone who has already been heard. The failure is logged for us. */
    try {
      /* Identity comes from the session if there is one, and is otherwise absent. A visitor
         is never given a manufactured id, and `optionalUser()` returns null rather than
         throwing when nobody is signed in. */
      const user = await optionalUser()

      await createCorrespondence({
        clerkUserId: user?.userId ?? null,
        senderName:  name.slice(0, MAX.name),
        senderEmail: email ? email.slice(0, MAX.email) : null,
        senderPhone: phone ? phone.slice(0, MAX.phone) : null,
        category:    categoryForTopic(topic),
        /* The visitor's own topic, kept verbatim. The category is a filing decision made
           here; the subject is what they actually said it was about. */
        subject:     topic.slice(0, MAX.subject),
        message:     message.slice(0, MAX.message),
      })
    } catch (err) {
      console.error('Palace correspondence could not be recorded (message was sent):', err)
    }

    /* The response carries nothing about who was copied, and nothing about whether the
       letter was recorded — neither is the sender's business, and both would leak
       operational detail from a public form. */
    return NextResponse.json({ success: true })
  } catch (err) {
  /* The mailer sanitises its own failures before throwing, but anything else that lands
     here — malformed JSON, a bad field, a bug — arrives with an internal message. Log the
     real cause for us and tell the visitor one fixed, useful thing. */
    console.error('Palace message route failed:', err)
    return NextResponse.json({ error: 'Failed to send your message. Please try again.' }, { status: 500 })
  }
}
