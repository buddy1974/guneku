import { NextRequest, NextResponse } from 'next/server'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'
import { sendDirectorySubmission } from '@/lib/email/send'
import { getChapter, getFoundingName, isIntent, placeLabel } from '@/lib/community'

/* One route for the three directory motions: claim an entry, add a name, ask for
   a name to come down. Nothing is written to the database and nothing is published
   here — the submission reaches the Palace and a person decides. */

const MAX = { name: 120, text: 2000, short: 160 } as const

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

export async function POST(req: NextRequest) {
  try {
    if (rateLimited('community-register', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const body = await req.json()

    /* Bots fill in every field they are given. A human never sees this one. */
    if (clean(body.website, 200)) {
      return NextResponse.json({ success: true })
    }

    const intent = body.intent
    if (!isIntent(intent)) {
      return NextResponse.json({ error: 'Unknown request type' }, { status: 400 })
    }

    const personName = clean(body.personName, MAX.name)
    const senderName = clean(body.senderName, MAX.name)
    if (!personName || !senderName) {
      return NextResponse.json(
        { error: 'The name concerned and your own name are both required' },
        { status: 400 },
      )
    }

    const senderEmail = clean(body.senderEmail, MAX.short)
    const senderPhone = clean(body.senderPhone, MAX.short)
    if (!senderEmail && !senderPhone) {
      return NextResponse.json(
        { error: 'Leave either an email address or a telephone number so the Palace can reply' },
        { status: 400 },
      )
    }
    if (senderEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(senderEmail)) {
      return NextResponse.json({ error: 'That email address does not look right' }, { status: 400 })
    }

    /* Chapter and entry are echoed back from our own data, never from the
       client's string — a submission cannot invent a chapter that does not exist. */
    const chapter = getChapter(clean(body.chapter, MAX.short))
    const entry   = getFoundingName(clean(body.entrySlug, MAX.short))

    await sendDirectorySubmission({
      intent,
      personName,
      senderName,
      senderEmail:  senderEmail  || undefined,
      senderPhone:  senderPhone  || undefined,
      relationship: clean(body.relationship, MAX.short) || undefined,
      quarter:      clean(body.quarter, MAX.short)      || undefined,
      chapterLabel: chapter ? `${chapter.org} — ${placeLabel(chapter)}` : undefined,
      entrySlug:    entry?.slug,
      message:      clean(body.message, MAX.text) || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
  /* The mailer sanitises its own failures before throwing, but anything else that lands
     here — malformed JSON, a bad field, a bug — arrives with an internal message. Log the
     real cause for us and tell the visitor one fixed, useful thing. */
    console.error('Directory submission route failed:', err)
    return NextResponse.json(
      { error: 'Failed to send your request. Please try again.' },
      { status: 500 },
    )
  }
}
