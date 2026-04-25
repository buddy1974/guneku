'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link  from 'next/link'
import { Mail, MapPin, Phone, Send } from 'lucide-react'

export default function ContactPage() {
  const [sent, setSent]       = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) return
    setSending(true)
    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSent(true)
    } catch {
      alert('Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const inputCls = "w-full rounded-lg border border-input bg-background/60 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors backdrop-blur-sm"

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="relative pt-40 pb-12 text-center">
        <div className="pattern-royal absolute inset-0 opacity-15" />
        <div className="relative z-10">
          <div className="mx-auto relative h-24 w-24">
            <Image src="/royal-seal.png" alt="Royal seal" fill className="object-contain animate-spin-slow" unoptimized />
          </div>
          <div className="mt-6 section-label">SEND WORD TO THE PALACE</div>
          <h1 className="mt-4 font-cinzel text-6xl uppercase leading-none text-gold-gradient md:text-7xl">Contact</h1>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-10 md:grid-cols-5">

          {/* Contact cards */}
          <div className="space-y-4 md:col-span-2">
            {[
              { i: MapPin, t: 'The Palace',   d: 'Guneku Centre, Mbengwi\nMomo Division, NW Cameroon' },
              { i: Mail,   t: 'Email',        d: 'info@guneku.org' },
              { i: Phone,  t: 'Telephone',    d: '+237 681 19 46 46' },
            ].map((c, i) => (
              <div key={i} className="flex gap-4 card-royal p-5">
                <div className="rounded-full bg-gold-gradient p-2.5 h-fit">
                  <c.i className="h-4 w-4 text-gold-foreground" />
                </div>
                <div>
                  <div className="font-cinzel text-lg text-foreground">{c.t}</div>
                  <div className="whitespace-pre-line text-sm text-muted-foreground mt-1">{c.d}</div>
                </div>
              </div>
            ))}

            {/* MaxPromo card */}
            <div className="card-royal p-5">
              <div className="font-cinzel text-sm text-primary mb-2 tracking-widest">BUILT BY</div>
              <a href="https://maxpromo.digital" target="_blank" rel="noopener noreferrer"
                 className="font-cinzel text-lg text-gold-gradient hover:opacity-80 transition-opacity">
                MaxPromo Digital
              </a>
              <p className="text-xs text-muted-foreground mt-1">Essen, Germany · AI automation & web</p>
              <a href="https://maxpromo.digital/automation-audit" target="_blank" rel="noopener noreferrer"
                 className="mt-3 inline-flex text-xs text-primary tracking-widest hover:underline">
                Free Audit →
              </a>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 card-royal p-8 shadow-royal">
            {sent ? (
              <div className="text-center py-12">
                <div className="font-cinzel text-4xl text-gold-gradient mb-4">✓ DELIVERED</div>
                <p className="text-muted-foreground font-cormorant text-xl italic">
                  Your letter has reached the palace. We will be in touch shortly.
                </p>
                <Link href="/" className="mt-8 btn-royal inline-flex">Return Home</Link>
              </div>
            ) : (
              <>
                <div className="section-label mb-2">A LETTER TO THE COURT</div>
                <h3 className="font-cinzel text-3xl text-foreground mb-6">Address the Kingdom</h3>
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  <div>
                    <label className="section-label text-[0.6rem] block mb-2">Your Name</label>
                    <input name="name" required value={form.name} onChange={handleChange} placeholder="Full name" className={inputCls} />
                  </div>
                  <div>
                    <label className="section-label text-[0.6rem] block mb-2">Email</label>
                    <input name="email" required type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className={inputCls} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="section-label text-[0.6rem] block mb-2">Subject</label>
                  <select name="subject" value={form.subject} onChange={handleChange} className={`${inputCls} appearance-none`}>
                    <option value="">Select a subject</option>
                    <option>Audience · Palace Visit</option>
                    <option>GUDECA / Development</option>
                    <option>Agro CIG</option>
                    <option>GUNECCUL</option>
                    <option>Cultural Event</option>
                    <option>Media / Press</option>
                    <option>Website</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="section-label text-[0.6rem] block mb-2">Message</label>
                  <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
                            placeholder="Your message to the palace..." className={`${inputCls} resize-none`} />
                </div>
                <button type="submit" disabled={sending}
                        className="btn-royal inline-flex items-center gap-2 w-full justify-center"
                        style={{ opacity: sending ? 0.6 : 1, cursor: sending ? 'not-allowed' : 'pointer' }}>
                  <Send className="h-4 w-4" />
                  {sending ? 'SENDING...' : 'SEND WITH HONOR'}
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* ── MaxPromo CTA ── */}
      <section className="border-t border-border/30 bg-card/20 py-16 text-center px-6">
        <div className="max-w-2xl mx-auto">
          <p className="section-label mb-4">THIS PLATFORM WAS BUILT BY</p>
          <a href="https://maxpromo.digital" target="_blank" rel="noopener noreferrer"
             className="font-cinzel text-4xl text-gold-gradient hover:opacity-80 transition-opacity block mb-4">
            MAXPROMO DIGITAL
          </a>
          <p className="text-muted-foreground font-cormorant text-lg italic mb-6">
            Is your community ready for its own digital palace?<br />
            Contact us to bring your community to the world.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="https://maxpromo.digital/automation-audit" target="_blank" rel="noopener noreferrer" className="btn-royal inline-flex">
              Get a Free Audit →
            </a>
            <a href="https://maxpromo.digital" target="_blank" rel="noopener noreferrer" className="btn-royal-outline inline-flex">
              maxpromo.digital
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
