import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EpicAccountClient from '@/components/account/EpicAccountClient'

export const metadata: Metadata = {
  title: 'Account Settings | ProducerToy',
  description: 'Manage your ProducerToy account, personal details, communication preferences, and security settings.',
  robots: {
    index: false,
    follow: false,
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AccountPage() {
  const supabase = await createClient()
  let user = null
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch (err) {
    console.warn('SSR auth check note on account page:', err)
  }

  if (!user) {
    redirect('/auth?next=/account')
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212]" />}>
      <EpicAccountClient initialUser={user} />
    </Suspense>
  )
}

