import 'server-only'
import { Resend } from 'resend'
import {
  welcomeEmailHtml,
  contactFormEmailHtml,
  newIndigeneAlertHtml,
} from './templates'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM  = process.env.EMAIL_FROM  || 'Guneku Fondom <onboarding@resend.dev>'
const ADMIN = process.env.EMAIL_ADMIN || 'info@guneku.org'

export async function sendWelcomeEmail(params: {
  toEmail:   string
  name:      string
  quarter?:  string
  location?: string
}) {
  const profileUrl   = 'https://guneku.org/indigenes/profile'
  const directoryUrl = 'https://guneku.org/indigenes'

  const { error } = await resend.emails.send({
    from:    FROM,
    to:      params.toEmail,
    subject: `Bongob ${params.name.split(' ')[0]}! Welcome to the Guneku Indigenes Directory`,
    html:    welcomeEmailHtml({
      name:         params.name,
      profileUrl,
      directoryUrl,
      quarter:      params.quarter,
      location:     params.location,
    }),
  })

  if (error) console.error('Welcome email failed:', error)
}

export async function sendContactEmail(params: {
  senderName:  string
  senderEmail: string
  subject:     string
  message:     string
}) {
  const { error } = await resend.emails.send({
    from:    FROM,
    to:      ADMIN,
    replyTo: params.senderEmail,
    subject: `[Guneku Contact] ${params.subject} — from ${params.senderName}`,
    html:    contactFormEmailHtml(params),
  })

  if (error) {
    console.error('Contact email failed:', error)
    throw new Error('Failed to send message. Please try again.')
  }
}

export async function sendNewIndigeneAlert(params: {
  name:       string
  profession: string
  location:   string
  quarter:    string
  profileUrl: string
}) {
  const { error } = await resend.emails.send({
    from:    FROM,
    to:      ADMIN,
    subject: `New Indigene: ${params.name} joined from ${params.location}`,
    html:    newIndigeneAlertHtml(params),
  })

  if (error) console.error('Admin alert email failed:', error)
}

/* ── Palace enquiries and support interest ──────────────────────────────────
   Both go to the Fondom address. A silent copy can also be sent, configured only
   through the server-side EMAIL_BCC environment variable — no address is committed to
   source. If EMAIL_BCC is unset the message still goes to the Fondom address and the
   copy is simply omitted; a missing variable never fails a visitor's submission.

   EMAIL_BCC is server-side only. Never rename it to NEXT_PUBLIC_*, and never log or
   surface its value. */
const BCC = process.env.EMAIL_BCC?.trim() || undefined

export type PalaceMessage = {
  name: string
  topic: string
  message: string
  preferredContact: 'email' | 'phone'
  email?: string
  phone?: string
  location?: string
}

export async function sendPalaceMessage(p: PalaceMessage) {
  const rows: Array<[string, string]> = [
    ['Name', p.name],
    ['Topic', p.topic],
    ['Preferred contact', p.preferredContact === 'email' ? 'Email' : 'Telephone'],
    ['Email', p.email || '—'],
    ['Callback number', p.phone || '—'],
    ['Location', p.location || '—'],
  ]

  const { error } = await resend.emails.send({
    from:    FROM,
    to:      ADMIN,
    ...(BCC ? { bcc: BCC } : {}),
    ...(p.preferredContact === 'email' && p.email ? { replyTo: p.email } : {}),
    subject: `[Guneku Palace] ${p.topic} — from ${p.name}`,
    html:    enquiryHtml('Message to the Palace', rows, p.message),
  })

  if (error) {
    console.error('Palace message failed:', error)
    throw new Error('Failed to send your message. Please try again.')
  }
}

export type SupportInterest = {
  name: string
  project: string
  supportType: string
  message?: string
  email?: string
  phone?: string
  organisation?: string
  location?: string
}

export async function sendSupportInterest(p: SupportInterest) {
  const rows: Array<[string, string]> = [
    ['Name', p.name],
    ['Organisation', p.organisation || '—'],
    ['Project', p.project],
    ['Type of support', p.supportType],
    ['Email', p.email || '—'],
    ['Telephone', p.phone || '—'],
    ['Location', p.location || '—'],
  ]

  const { error } = await resend.emails.send({
    from:    FROM,
    to:      ADMIN,
    ...(BCC ? { bcc: BCC } : {}),
    ...(p.email ? { replyTo: p.email } : {}),
    subject: `[Guneku Support] ${p.supportType} — ${p.project} — from ${p.name}`,
    html:    enquiryHtml('Offer of support', rows, p.message || '—'),
  })

  if (error) {
    console.error('Support interest failed:', error)
    throw new Error('Failed to send your message. Please try again.')
  }
}

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function enquiryHtml(heading: string, rows: Array<[string, string]>, message: string) {
  return `<!doctype html><html><body style="margin:0;background:#f9f7f3;font-family:system-ui,-apple-system,sans-serif;color:#231f1c">
<div style="max-width:640px;margin:0 auto;padding:28px 24px">
  <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#0d3b24">Guneku Fondom</p>
  <h1 style="margin:0 0 18px;font-size:20px;line-height:1.25;color:#231f1c">${esc(heading)}</h1>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    ${rows.map(([k, v]) => `<tr>
      <td style="padding:7px 12px 7px 0;color:#6f6965;white-space:nowrap;vertical-align:top;border-bottom:1px solid #e6e2da">${esc(k)}</td>
      <td style="padding:7px 0;border-bottom:1px solid #e6e2da">${esc(v)}</td></tr>`).join('')}
  </table>
  <p style="margin:20px 0 6px;font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#0d3b24">Message</p>
  <div style="white-space:pre-wrap;font-size:14px;line-height:1.6;padding:14px;background:#fff;border:1px solid #e6e2da">${esc(message)}</div>
  <p style="margin:22px 0 0;font-size:12px;color:#6f6965">Sent from the message form on guneku.org.</p>
</div></body></html>`
}

/* ── Directory submissions ──────────────────────────────────────────────────
   Claiming a seeded entry, adding a name to a chapter, and asking for a name to
   be taken down all arrive here. Deliberately no database write and no
   auto-publication: a person's name entering — or leaving — the public directory
   is a decision the Palace makes with a human in the loop. The subject line
   carries the intent so removals can be filtered and answered first. */

export type DirectorySubmission = {
  intent:      'claim' | 'add' | 'remove'
  personName:  string
  senderName:  string
  senderEmail?: string
  senderPhone?: string
  relationship?: string
  chapterLabel?: string
  quarter?:    string
  entrySlug?:  string
  message?:    string
}

const INTENT_SUBJECT = {
  claim:  'Claim',
  add:    'New name',
  remove: 'REMOVAL REQUEST',
} as const

const INTENT_HEADING = {
  claim:  'Claim of a directory entry',
  add:    'A name put forward for the directory',
  remove: 'Request to remove a name from the directory',
} as const

export async function sendDirectorySubmission(p: DirectorySubmission) {
  const rows: Array<[string, string]> = [
    ['Request', INTENT_HEADING[p.intent]],
    ['Name concerned', p.personName],
    ['Existing entry', p.entrySlug ? `/indigenes/founding/${p.entrySlug}` : '— (not a seeded entry)'],
    ['Chapter', p.chapterLabel || '—'],
    ['Quarter', p.quarter || '—'],
    ['Submitted by', p.senderName],
    ['Relationship', p.relationship || '—'],
    ['Email', p.senderEmail || '—'],
    ['Telephone', p.senderPhone || '—'],
  ]

  const { error } = await resend.emails.send({
    from:    FROM,
    to:      ADMIN,
    ...(BCC ? { bcc: BCC } : {}),
    ...(p.senderEmail ? { replyTo: p.senderEmail } : {}),
    subject: `[Guneku Directory] ${INTENT_SUBJECT[p.intent]} — ${p.personName}`,
    html:    enquiryHtml(INTENT_HEADING[p.intent], rows, p.message || '—'),
  })

  if (error) {
    console.error('Directory submission failed:', error)
    throw new Error('Failed to send your request. Please try again.')
  }
}
