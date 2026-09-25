'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { EpicSupportAssistant } from '@/components/support/EpicSupportAssistant'

function SupportClientInner() {
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get('tab') || ''
  const ticketParam = searchParams?.get('ticket') || ''
  const emailParam = searchParams?.get('email') || ''

  const initialTab =
    tabParam === 'raise' || tabParam === 'raise-ticket'
      ? 'raise'
      : tabParam === 'track' || tabParam === 'track-ticket' || ticketParam
      ? 'track'
      : 'assistant'

  return (
    <EpicSupportAssistant
      initialTab={initialTab}
      initialTicketNumber={ticketParam}
      initialEmail={emailParam}
    />
  )
}

export function SupportClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0e071c] flex items-center justify-center text-purple-400 text-xs uppercase tracking-widest font-bold">
          Loading Support Center...
        </div>
      }
    >
      <SupportClientInner />
    </Suspense>
  )
}
