import { NextRequest, NextResponse } from 'next/server'
import { askPalace } from '@/lib/palace-ai'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'

/* The public assistant.
 *
 * No account is required and none is read: this route calls no auth helper, touches no
 * database, and is not in the middleware's protected list. A visitor asking who the Fon is
 * should not have to sign in to their own Fondom's website.
 *
 * The answer is deterministic where a checked one exists, synthesised from published
 * evidence where it does not, and an honest refusal where neither applies. See
 * src/lib/palace-ai.ts for the order and why it is that order. */

export async function POST(req: NextRequest) {
  try {
    /* Its own bucket, and a tighter one than the forms. An AI call costs money and time in
       a way a static lookup does not, so the assistant gets less headroom than a villager
       writing to the Palace — while still sharing the per-sender aggregate, so somebody
       cannot rotate between surfaces to multiply their budget. */
    if (rateLimited('ask', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const body = await req.json().catch(() => ({}))
    const question = String((body as { question?: unknown }).question ?? '').slice(0, 500)

    if (question.trim().length < 3) {
      return NextResponse.json({ error: 'Please write a little more.' }, { status: 400 })
    }

    return NextResponse.json(await askPalace(question))
  } catch (err) {
    /* Never the caught message. A provider failure can carry a key fragment, a quota or an
       account id, and a database or filesystem error can carry a path. */
    console.error('Ask route failed:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' }, { status: 500 },
    )
  }
}
