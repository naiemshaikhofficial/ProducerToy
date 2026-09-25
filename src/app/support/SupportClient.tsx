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
        <div className="w-full min-h-[calc(100vh-76px)] bg-[#070605] flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-[#FC6301]/20 border-t-[#FC6301] animate-spin" />
        </div>
      }
    >
      <SupportClientInner />
    </Suspense>
  )
}
