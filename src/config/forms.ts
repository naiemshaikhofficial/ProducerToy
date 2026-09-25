/**
 * FormSubmit Configuration for Producer Toy
 * Centralized email endpoints and templates for Contact and Support forms.
 */
export const FORMS_CONFIG = {
  // Contact desk receives general inquiries, partnerships, billing questions
  CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@producertoy.com',

  // Technical support desk receives bug reports, ticket requests, DAW issues
  SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@producertoy.com',

  // Fallback production base URL
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://producertoy.com',
} as const
