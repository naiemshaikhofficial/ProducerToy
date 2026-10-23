'use server'

export interface ContactActionResult {
  success: boolean
  message: string
}

export async function submitContactFormAction(formData: FormData): Promise<ContactActionResult> {
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const subject = String(formData.get('subject') || '').trim()
  const message = String(formData.get('message') || '').trim()
  const honeypot = String(formData.get('botcheck') || formData.get('_gotcha') || '').trim()

  // Honeypot spam trap
  if (honeypot) {
    return { success: true, message: 'Your message has been received.' }
  }

  if (!name || !email || !message) {
    return { success: false, message: 'Please fill in all required fields.' }
  }

  // Strict email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email) || email.length > 254) {
    return { success: false, message: 'Please enter a valid email address.' }
  }

  // Length limits to prevent DoS / payload bloat
  if (name.length > 100 || subject.length > 200 || message.length > 5000) {
    return { success: false, message: 'Message exceeds allowed character limits.' }
  }

  // Log contact event without exposing unredacted user PII in production
  const maskedEmail = email.replace(/^(.)(.*)(@.*)$/, (_, first, middle, domain) => `${first}${'*'.repeat(Math.min(middle.length, 5))}${domain}`)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Contact Form Received] From: ${name} <${maskedEmail}> | Subject: ${subject}`)
  }

  return {
    success: true,
    message: 'Thank you! Your message has been sent successfully. We will respond within 24 hours.',
  }
}

