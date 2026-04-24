'use client'

import { useState } from 'react'
import { PageHero } from '@/components/layout/PageHero'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.MouseEvent) {
    e.preventDefault()
    setSent(true)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', backgroundColor:'#0C0C14',
    border:'1px solid rgba(255,255,255,0.1)',
    color:'#F5F2E9', fontFamily:'Inter, sans-serif',
    fontSize:'0.95rem', padding:'0.875rem 1rem',
    outline:'none', boxSizing:'border-box',
  }

  return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh' }}>
      <PageHero
        label="CONTACT"
        title="GET IN TOUCH"
        subtitle="Reach the Guneku Fondom palace, GUDECA, or the website team."
      />
      <section style={{ maxWidth:'1100px', margin:'0 auto',
                        padding:'5rem 1.5rem',
                        display:'grid', gridTemplateColumns:'1fr 1.5fr',
                        gap:'4rem', alignItems:'start' }}
               className="grid-cols-1 md:grid-cols-[1fr_1.5fr]">

        {/* Contact info */}
        <div>
          {[
            { label:'Palace Contact',  value:'+237 681 19 46 46',    href:undefined },
            { label:'General Email',   value:'info@guneku.org',       href:undefined },
            { label:"Fon's Email",     value:'wfomuki@gmx.de',        href:undefined },
            { label:'Website',         value:'maxpromo.digital',       href:'https://maxpromo.digital' },
            { label:'Facebook',        value:'facebook.com/guneku',    href:'https://www.facebook.com/guneku' },
            { label:'YouTube',         value:'Guneku Fondom Channel',  href:'https://www.youtube.com/channel/UCEmIEHRMg3UTzb1wpxLZOAw' },
          ].map(c => (
            <div key={c.label} style={{
              padding:'1rem 0',
              borderBottom:'1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ color:'rgba(245,242,233,0.3)',
                            fontFamily:'Syne, sans-serif', fontSize:'0.7rem',
                            letterSpacing:'0.15em', textTransform:'uppercase',
                            marginBottom:'0.25rem' }}>
                {c.label}
              </div>
              {c.href ? (
                <a href={c.href} target="_blank" rel="noopener noreferrer"
                   style={{ color:'#f2a90b', fontFamily:'Inter, sans-serif',
                            fontSize:'0.95rem', textDecoration:'none' }}>
                  {c.value}
                </a>
              ) : (
                <span style={{ color:'#F5F2E9', fontFamily:'Inter, sans-serif',
                               fontSize:'0.95rem' }}>
                  {c.value}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        {sent ? (
          <div style={{ padding:'3rem', backgroundColor:'#0C0C14',
                        border:'1px solid rgba(242,169,11,0.2)',
                        textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>✓</div>
            <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2rem',
                         color:'#f2a90b', letterSpacing:'0.05em', margin:'0 0 1rem' }}>
              MESSAGE SENT
            </h3>
            <p style={{ color:'rgba(245,242,233,0.5)',
                        fontFamily:'Inter, sans-serif', fontSize:'1rem' }}>
              Thank you. We will be in touch shortly.
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}
                 className="grid-cols-1 sm:grid-cols-2">
              <div>
                <label style={{ color:'rgba(245,242,233,0.4)',
                                fontFamily:'Syne, sans-serif', fontSize:'0.7rem',
                                letterSpacing:'0.15em', textTransform:'uppercase',
                                display:'block', marginBottom:'0.5rem' }}>
                  Your Name
                </label>
                <input name="name" value={form.name} onChange={handleChange}
                       style={inputStyle} placeholder="Full name" />
              </div>
              <div>
                <label style={{ color:'rgba(245,242,233,0.4)',
                                fontFamily:'Syne, sans-serif', fontSize:'0.7rem',
                                letterSpacing:'0.15em', textTransform:'uppercase',
                                display:'block', marginBottom:'0.5rem' }}>
                  Email
                </label>
                <input name="email" type="email" value={form.email}
                       onChange={handleChange}
                       style={inputStyle} placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label style={{ color:'rgba(245,242,233,0.4)',
                              fontFamily:'Syne, sans-serif', fontSize:'0.7rem',
                              letterSpacing:'0.15em', textTransform:'uppercase',
                              display:'block', marginBottom:'0.5rem' }}>
                Subject
              </label>
              <select name="subject" value={form.subject} onChange={handleChange}
                      style={{ ...inputStyle, appearance:'none' }}>
                <option value="">Select a subject</option>
                <option>General Enquiry</option>
                <option>GUDECA / Development</option>
                <option>Agro CIG</option>
                <option>GUNECCUL</option>
                <option>Cultural Event</option>
                <option>Media / Press</option>
                <option>Website</option>
              </select>
            </div>
            <div>
              <label style={{ color:'rgba(245,242,233,0.4)',
                              fontFamily:'Syne, sans-serif', fontSize:'0.7rem',
                              letterSpacing:'0.15em', textTransform:'uppercase',
                              display:'block', marginBottom:'0.5rem' }}>
                Message
              </label>
              <textarea name="message" value={form.message} onChange={handleChange}
                        rows={6} style={{ ...inputStyle, resize:'vertical' }}
                        placeholder="Your message..." />
            </div>
            <button onClick={handleSubmit} style={{
              backgroundColor:'#f2a90b', color:'#0F0F0F',
              fontFamily:'Syne, sans-serif', fontWeight:700,
              padding:'1rem 2.5rem', fontSize:'0.82rem',
              letterSpacing:'0.12em', textTransform:'uppercase',
              border:'none', cursor:'pointer', alignSelf:'flex-start',
            }}>
              Send Message
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
