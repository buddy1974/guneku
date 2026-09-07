'use client'

import { useState } from 'react'
import { TurnstileField } from '@/components/forms/TurnstileField'
import { useTurnstile } from '@/components/forms/useTurnstile'
import Image from 'next/image'
import Link  from 'next/link'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
/* The Palace telephone and address of record. Imported as two named constants rather than
   as the whole of site-config.json, and that is the point rather than tidiness: this is a
   client component, so a whole-record import ships every field of that record to every
   browser that opens this page. It did. `site-config.json` carried `fonEmail` — the Fon's
   personal address — and it was downloadable from a public chunk on /contact until
   2026-09-07, invisible on the page and trivially harvestable. The field is gone; so is the
   import that would have carried the next one. */
import { PALACE_PHONE, PALACE_EMAIL } from '@/lib/palace-contact'

export default function ContactPage() {
  const [sent, setSent]       = useState(false)
  const [sending, setSending] = useState(false)
  const human = useTurnstile('contact')
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'', website:'' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) return
    /* Refuse before the network. An unsolved check would be refused by the server anyway;
       telling the visitor now saves them a round trip and saves a rate-limit slot on a
       request that was always going to fail. Nothing here touches what they typed. */
    if (!human.ready()) return
    setError(null)
    setSending(true)
    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, turnstileToken: human.token }),
      })
      const data = await res.json()
      if (!res.ok) {
        /* The check specifically. A token is single-use, so the one just spent is gone:
           `rejected` clears it and hands the visitor a fresh challenge rather than a button
           that keeps failing for a reason they cannot see. */
        if (human.rejected(data)) return
        throw new Error(data.error || 'That could not be sent. Please try again.')
      }
      human.clear()
      setSent(true)
    } catch (err) {
      /* Shown in a role="alert" beside the button, not thrown into an alert() box that
         discarded the server's own words and told a visitor nothing they could act on. */
      setError((err as Error).message || 'That could not be sent. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const inputCls = "w-full rounded-[3px] border border-input bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="relative pt-40 pb-12 text-center">
        <div className="pattern-royal absolute inset-0 opacity-15" />
        <div className="relative z-10">
          <div className="mx-auto relative h-24 w-24">
            <Image src="/brand/logo-128.png" alt="Guneku Fondom" fill sizes="96px" className="object-contain" unoptimized />
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
            {/* The form above is the way to reach the Palace, and these are the details
                behind it. Both are published deliberately: the telephone is the Palace
                number of record and the address is the Fondom's own, never an officer's.

                They live here and, apart from the telephone in the footer, nowhere else.
                The email used to be a `mailto:` in the footer of all 207 pages, which is a
                harvesting surface rather than transparency — one address published two
                hundred times is not more contactable than one address published once. */}
            {[
              { i: MapPin, t: 'The Palace',   d: 'Guneku Centre, Mbengwi\nMomo Division, NW Cameroon', href: null },
              { i: Mail,   t: 'Email',        d: PALACE_EMAIL, href: `mailto:${PALACE_EMAIL}` },
              { i: Phone,  t: 'Telephone',    d: PALACE_PHONE, href: `tel:${PALACE_PHONE.replace(/\s/g, '')}` },
            ].map((c, i) => (
              <div key={i} className="flex gap-4 card-royal p-5">
                <div className="rounded-[3px] bg-[var(--accent)] p-2.5 h-fit">
                  <c.i className="h-4 w-4 text-gold-foreground" />
                </div>
                <div>
                  <div className="font-cinzel text-lg text-foreground">{c.t}</div>
                  {/* Readable, selectable and clickable. No character-shuffling, no base64,
                      no image: each of those costs a screen-reader user real access and
                      costs a scraper about a second, which is the wrong trade. */}
                  <div className="whitespace-pre-line text-sm text-muted-foreground mt-1">
                    {c.href
                      ? <a href={c.href} className="text-inherit no-underline hover:underline">{c.d}</a>
                      : c.d}
                  </div>
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
                {/* Every field is bound to its label by id. The labels were always here;
                    they were not attached to anything, so a screen reader announced four
                    fields whose only description was placeholder text — which disappears
                    the moment somebody starts typing. A visible label is not the same as
                    an associated one. */}
                {/* Honeypot — visually and programmatically hidden from people, and
                    the one anonymous form on this site that did not have one. */}
                <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                  <label>Website<input name="website" tabIndex={-1} autoComplete="off"
                    value={form.website} onChange={handleChange} /></label>
                </div>

                <div className="section-label mb-2">A LETTER TO THE COURT</div>
                <h2 className="font-cinzel text-3xl text-foreground mb-6">Address the Fondom</h2>
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  <div>
                    <label htmlFor="contact-name" className="section-label text-[0.6rem] block mb-2">Your Name</label>
                    <input id="contact-name" name="name" required autoComplete="name" value={form.name} onChange={handleChange} placeholder="Full name" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="section-label text-[0.6rem] block mb-2">Email</label>
                    <input id="contact-email" name="email" required type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className={inputCls} />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="contact-subject" className="section-label text-[0.6rem] block mb-2">Subject</label>
                  <select id="contact-subject" name="subject" value={form.subject} onChange={handleChange} className={`${inputCls} appearance-none`}>
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
                  <label htmlFor="contact-message" className="section-label text-[0.6rem] block mb-2">Message</label>
                  <textarea id="contact-message" name="message" required rows={5} value={form.message} onChange={handleChange}
                            placeholder="Your message to the palace..." className={`${inputCls} resize-none`} />
                </div>
                {/* Renders nothing until the Cloudflare keys exist, so the form is unchanged
                    until the owner arms it. */}
                <TurnstileField {...human.field} />

                {/* Everything else that can go wrong, said where the visitor is looking and
                    announced when it appears. This page previously ended in
                    `alert('Failed to send')`, which discarded the server's own words and
                    told nobody anything they could act on. */}
                {error && (
                  <p role="alert" className="mt-3 text-[0.86rem] leading-[1.5] text-[var(--oxblood)]">
                    {error}
                  </p>
                )}

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
