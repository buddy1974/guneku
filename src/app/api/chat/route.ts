import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  getSiteConfig,
  getAllKingdomArticles,
  getAllPalaceArticles,
  getAllUpdates,
  getFonProfile,
} from '@/lib/content'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildKnowledgeBase(): string {
  const fon     = getFonProfile()
  const kingdom = getAllKingdomArticles()
  const palace  = getAllPalaceArticles()
  const updates = getAllUpdates().slice(0, 10)

  const fonSection = fon
    ? `THE REIGNING FON:
${fon.fullName} — ${fon.title}
Enthroned: ${fon.enthronementDate}. Coronation: ${fon.coronationDate}.
Based in ${fon.residenceCountry}.
Practice: ${fon.practiceWebsite}.`
    : 'Fon data unavailable.'

  return `
ABOUT GUNEKU FONDOM:
Guneku is a Fondom (kingdom) in Momo Division, Northwest Cameroon.
Population: ~15,000. Largest village in Meta clan by land area.
27 quarters. Language: MENEMO dialect.

${fonSection}

PALACE ARTICLES:
${palace.map(a => `${a.title}: ${stripHtml(a.body ?? '').substring(0, 300)}...`).join('\n\n')}

KINGDOM:
${kingdom.map(a => `${a.title}: ${stripHtml(a.body ?? '').substring(0, 200)}...`).join('\n\n')}

RECENT UPDATES:
${updates.map(u => `${u.title} (${u.publishedAt?.substring(0, 10) ?? 'n/a'}): ${u.excerpt}`).join('\n\n')}
`.trim()
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const message: unknown = body?.message
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    const config    = getSiteConfig()
    const knowledge = buildKnowledgeBase()

    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 500,
      system: `${config.aiPersonality}

KNOWLEDGE BASE:
${knowledge}

RULES:
- Answer only about Guneku Fondom
- Be warm, dignified, and proud
- Keep answers concise (2-4 sentences)
- If asked something outside Guneku, say: "I can only speak about Guneku Fondom. Is there something about our village, the Fon, or our community I can help you with?"`,
      messages: [{ role: 'user', content: message }],
    })

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')

    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
