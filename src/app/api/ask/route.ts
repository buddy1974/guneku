import { NextRequest, NextResponse } from 'next/server'
import { ask } from '@/lib/palace-knowledge'

/* Retrieval only. There is no model behind this route, so it cannot invent a fact about
   Guneku. When nothing in the index matches well enough it says so and the caller offers
   the Palace form. */
export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()
    const q = String(question || '').slice(0, 500)
    if (q.trim().length < 3) {
      return NextResponse.json({ error: 'Please write a little more.' }, { status: 400 })
    }
    return NextResponse.json(ask(q))
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
