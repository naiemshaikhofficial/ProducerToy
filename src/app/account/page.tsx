import React, { Suspense } from 'react'
import { Metadata } from 'next'
import EpicAccountClient from '@/components/account/EpicAccountClient'

export const metadata: Metadata = {
  title: 'Account Settings | ProducerToy',
  description: 'Manage your ProducerToy account, personal details, communication preferences, and security settings.',
  robots: {
    index: false,
    follow: false,
  }
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212]" />}>
      <EpicAccountClient />
    </Suspense>
  )
}

