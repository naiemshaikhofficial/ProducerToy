'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/supabase/server'

export interface SupportTicket {
  id: string
  ticket_number: string
  user_id: string | null
  name: string
  email: string
  category: string
  priority: string
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'RESOLVED' | 'CLOSED'
  order_id: string | null
  os_platform: string | null
  daw: string | null
  subject: string
  description: string
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_type: 'CUSTOMER' | 'SUPPORT'
  sender_name: string
  message: string
  created_at: string
}

export interface TicketSubmissionData {
  name: string
  email: string
  category: string
  priority?: string
  orderId?: string
  osPlatform?: string
  daw?: string
  subject: string
  description: string
}

/**
 * Generate a clean, professional ticket code (e.g. PT-TK-82419)
 */
function generateTicketNumber(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `PT-TK-${randomNum}`
}

/**
 * Create and submit a new Support Ticket
 */
export async function createSupportTicketAction(data: TicketSubmissionData) {
  const { name, email, category, priority = 'NORMAL', orderId, osPlatform, daw, subject, description } = data

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !description?.trim()) {
    return { success: false, error: 'Please fill in all required fields.' }
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  try {
    const admin = getAdminClient()
    const { data: authData } = await getUser()
    const userId = authData?.user?.id || null

    let ticketNumber = generateTicketNumber()
    let isUnique = false
    let attempts = 0

    // Ensure uniqueness
    while (!isUnique && attempts < 5) {
      const { data: existing } = await admin
        .from('support_tickets')
        .select('id')
        .eq('ticket_number', ticketNumber)
        .maybeSingle()

      if (!existing) {
        isUnique = true
      } else {
        ticketNumber = generateTicketNumber()
        attempts++
      }
    }

    const { data: ticket, error: ticketError } = await admin
      .from('support_tickets')
      .insert({
        ticket_number: ticketNumber,
        user_id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        category: category || 'General Inquiry',
        priority: priority.toUpperCase(),
        status: 'OPEN',
        order_id: orderId?.trim() || null,
        os_platform: osPlatform?.trim() || null,
        daw: daw?.trim() || null,
        subject: subject.trim(),
        description: description.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (ticketError || !ticket) {
      console.error('[createSupportTicketAction] Error creating ticket:', ticketError)
      return { success: false, error: 'Could not create support ticket. Please try again.' }
    }

    // Insert initial customer message in thread
    await admin.from('ticket_messages').insert({
      ticket_id: ticket.id,
      sender_type: 'CUSTOMER',
      sender_name: name.trim(),
      message: description.trim(),
      created_at: new Date().toISOString(),
    })

    return {
      success: true,
      ticketNumber: ticket.ticket_number,
      ticket: ticket as SupportTicket,
      message: `Ticket ${ticket.ticket_number} created successfully! Our support engineering team will respond shortly.`,
    }
  } catch (err: any) {
    console.error('[createSupportTicketAction] Exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

/**
 * Lookup ticket details and its message history by Ticket Number + Email
 */
export async function getTicketDetailsAction(ticketNumber: string, email: string) {
  if (!ticketNumber?.trim() || !email?.trim()) {
    return { success: false, error: 'Please enter both Ticket Number and Email Address.' }
  }

  try {
    const admin = getAdminClient()
    const cleanTicketNum = ticketNumber.trim().toUpperCase()
    const cleanEmail = email.trim().toLowerCase()

    const { data: ticket, error: ticketErr } = await admin
      .from('support_tickets')
      .select('*')
      .eq('ticket_number', cleanTicketNum)
      .eq('email', cleanEmail)
      .maybeSingle()

    if (ticketErr || !ticket) {
      return {
        success: false,
        error: 'No ticket found with this Ticket Number and Email combination. Please check your reference code and try again.',
      }
    }

    const { data: messages, error: msgErr } = await admin
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true })

    if (msgErr) {
      console.error('[getTicketDetailsAction] Messages fetch error:', msgErr)
    }

    return {
      success: true,
      ticket: ticket as SupportTicket,
      messages: (messages || []) as TicketMessage[],
    }
  } catch (err: any) {
    console.error('[getTicketDetailsAction] Exception:', err)
    return { success: false, error: err.message || 'Failed to retrieve ticket details.' }
  }
}

/**
 * Add a follow-up reply to an existing ticket
 */
export async function addTicketReplyAction(
  ticketNumber: string,
  email: string,
  messageText: string,
  senderName?: string
) {
  if (!ticketNumber?.trim() || !email?.trim() || !messageText?.trim()) {
    return { success: false, error: 'Message content and ticket identification are required.' }
  }

  try {
    const admin = getAdminClient()
    const cleanTicketNum = ticketNumber.trim().toUpperCase()
    const cleanEmail = email.trim().toLowerCase()

    const { data: ticket, error: ticketErr } = await admin
      .from('support_tickets')
      .select('id, name, status')
      .eq('ticket_number', cleanTicketNum)
      .eq('email', cleanEmail)
      .maybeSingle()

    if (ticketErr || !ticket) {
      return { success: false, error: 'Invalid ticket or email authorization.' }
    }

    const nameToUse = senderName?.trim() || ticket.name || 'Customer'

    const { data: newMsg, error: insertErr } = await admin
      .from('ticket_messages')
      .insert({
        ticket_id: ticket.id,
        sender_type: 'CUSTOMER',
        sender_name: nameToUse,
        message: messageText.trim(),
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (insertErr) {
      return { success: false, error: 'Failed to post reply. Please try again.' }
    }

    // If ticket was closed or resolved, reopen it to IN_PROGRESS or OPEN
    const newStatus = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED' ? 'OPEN' : ticket.status

    await admin
      .from('support_tickets')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticket.id)

    return {
      success: true,
      message: 'Reply posted successfully.',
      newMessage: newMsg as TicketMessage,
    }
  } catch (err: any) {
    console.error('[addTicketReplyAction] Exception:', err)
    return { success: false, error: err.message || 'Failed to add reply.' }
  }
}

/**
 * Get all tickets for the currently logged-in user
 */
export async function getUserTicketsAction() {
  try {
    const { data: authData } = await getUser()
    if (!authData?.user) {
      return { success: true, tickets: [] }
    }

    const admin = getAdminClient()
    const userId = authData.user.id
    const userEmail = authData.user.email?.toLowerCase()

    let query = admin.from('support_tickets').select('*')
    if (userEmail) {
      query = query.or(`user_id.eq.${userId},email.eq.${userEmail}`)
    } else {
      query = query.eq('user_id', userId)
    }

    const { data: tickets, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('[getUserTicketsAction] Error:', error)
      return { success: false, error: 'Failed to fetch user tickets.', tickets: [] }
    }

    return { success: true, tickets: (tickets || []) as SupportTicket[] }
  } catch (err: any) {
    console.error('[getUserTicketsAction] Exception:', err)
    return { success: false, error: err.message || 'Failed to fetch tickets.', tickets: [] }
  }
}
