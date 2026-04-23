'use client'

import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; text: string }

const SUGGESTIONS = [
  'Who is the Fon of Guneku?',
  'What is GUDECA?',
  'Tell me about the Coronation',
  'What is Mɨchi Əbeŋ?',
  'What is GUNECCUL?',
  'Where is Guneku located?',
]

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function send(text: string) {
    if (!text.trim() || loading) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text }),
      })
      const data = await res.json() as { reply?: string; error?: string }
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: data.reply ?? data.error ?? 'No response.' },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Unable to connect. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-[#0A0A0A] border-y border-heritage-red/25 py-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="heritage-rule" />
            <span className="section-label">AI-POWERED</span>
            <span className="heritage-rule" />
          </div>
          <h2
            className="font-display-title text-ivory mt-4 mb-3"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700 }}
          >
            Ask Anything About Guneku
          </h2>
          <p className="text-ivory/50 font-body text-base">
            Trained on the history, culture, and heritage of Guneku Fondom
          </p>
        </div>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs font-heading tracking-wide text-palace-gold
                           border border-heritage-red/30 px-3 py-2
                           hover:bg-heritage-red/10 hover:border-heritage-red/60
                           transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-heritage-red/20
                                  flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={14} className="text-palace-gold" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm font-body leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-heritage-red/10 text-ivory border border-heritage-red/25'
                      : 'bg-[#111111] text-ivory/80 border border-white/5'
                  }`}
                >
                  {m.text}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-ivory/10
                                  flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={14} className="text-ivory/60" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-heritage-red/20
                                flex items-center justify-center">
                  <Bot size={14} className="text-palace-gold" />
                </div>
                <div className="bg-[#111111] border border-white/5 px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-heritage-red/60 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-0 border border-heritage-red/30
                        focus-within:border-heritage-red transition-colors">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask about Guneku Fondom..."
            className="flex-1 bg-transparent px-4 py-4 text-ivory/80 text-sm
                       font-body outline-none placeholder:text-ivory/25"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="px-5 bg-heritage-red/10 hover:bg-heritage-red/25
                       border-l border-heritage-red/30 transition-colors
                       disabled:opacity-40"
          >
            <Send size={16} className="text-heritage-red" />
          </button>
        </div>

        <p className="text-center text-ivory/25 text-xs font-body mt-3">
          Powered by Claude AI · MaxPromo Digital
        </p>
      </div>
    </section>
  )
}
