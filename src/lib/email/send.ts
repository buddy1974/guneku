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
