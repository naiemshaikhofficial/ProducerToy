'use server'

export interface ContactActionResult {
  success: boolean
  message: string
}

export async function submitContactFormAction(formData: FormData): Promise<ContactActionResult> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const subject = formData.get('subject') as string
  const message = formData.get('message') as string

  if (!name || !email || !message) {
    return { success: false, message: 'Please fill in all required fields.' }
  }

  // Log contact message or store in DB/Email service
  console.log(`[Contact Form Received] From: ${name} <${email}> | Subject: ${subject}`);

  return {
    success: true,
    message: 'Thank you! Your message has been sent successfully. We will respond within 24 hours.',
  }
}
