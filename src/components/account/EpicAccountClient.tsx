'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { AccountSidebar, AccountTab } from './AccountSidebar'
import { AccountInfoSection } from './AccountInfoSection'
import { PersonalDetailsSection } from './PersonalDetailsSection'
import { CompanyDetailsSection } from './CompanyDetailsSection'
import { DataPrivacySection } from './DataPrivacySection'
import { LinkedAccountsTab } from './LinkedAccountsTab'
import { CommunicationTab } from './CommunicationTab'
import { SecurityTab } from './SecurityTab'
import { RedeemCodeTab } from './RedeemCodeTab'

export default function EpicAccountClient() {
  const [activeTab, setActiveTab] = useState<AccountTab>('settings')
  const [user, setUser] = useState<any>(null)
  const [displayName, setDisplayName] = useState('Naiem Shaikh')
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = getSupabaseBrowserClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.display_name ||
            (user.email ? user.email.split('@')[0] : 'Naiem Shaikh')
          setDisplayName(name)
        }
      } catch (err) {
        console.warn('Error loading account user:', err)
      }
    }
    loadUser()
  }, [])

  const handleSaveSuccess = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // Masked email representation e.g. n***l@gmail.com
  const emailRaw = user?.email || 'naiemshaikh@gmail.com'
  const maskedEmail = (() => {
    const parts = emailRaw.split('@')
    if (parts.length < 2) return emailRaw
    const name = parts[0]
    const domain = parts[1]
    if (name.length <= 2) return `${name[0]}***@${domain}`
    return `${name[0]}***${name[name.length - 1]}@${domain}`
  })()

  // Account ID (deterministic or user ID)
  const accountId = user?.id?.replace(/-/g, '') || 'aaa2e39926844d188fc5f27e8bc39912'

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* 1. MODULAR LEFT SIDEBAR COMPONENT                                          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 xl:col-span-3">
            <AccountSidebar
              activeTab={activeTab}
              onSelectTab={(tab) => setActiveTab(tab)}
            />
          </div>

          {/* ========================================================================= */}
          {/* 2. MODULAR MAIN VIEW CONTENT                                              */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 xl:col-span-9 max-w-3xl">
            
            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-12">
                {/* Header Title */}
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-sans">
                    Settings
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Manage your account's details.
                  </p>
                </div>

                {saveSuccess && (
                  <div className="bg-[#1e281e] border border-[#2e442e] text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your account details have been successfully updated.</span>
                  </div>
                )}

                {/* Sub-component: Account Information (ID, Display Name, Locked Email) */}
                <AccountInfoSection
                  accountId={accountId}
                  displayName={displayName}
                  maskedEmail={maskedEmail}
                  onSaveDisplayName={(name) => {
                    setDisplayName(name)
                    handleSaveSuccess()
                  }}
                />

                {/* Sub-component: Personal Details (First Name, Last Name, Address, Country) */}
                <PersonalDetailsSection onSaveSuccess={handleSaveSuccess} />

                {/* Sub-component: Company Details (Company Name, VAT, Address) */}
                <CompanyDetailsSection onSaveSuccess={handleSaveSuccess} />

                {/* Sub-component: Data & Privacy (Download Data, Delete Account) */}
                <DataPrivacySection />
              </div>
            )}

            {/* TAB: LINKED ACCOUNTS */}
            {activeTab === 'linked_accounts' && <LinkedAccountsTab />}

            {/* TAB: COMMUNICATION PREFERENCES */}
            {activeTab === 'communication' && (
              <CommunicationTab maskedEmail={maskedEmail} />
            )}

            {/* TAB: PASSWORD AND SECURITY */}
            {activeTab === 'security' && <SecurityTab />}

            {/* TAB: REDEEM CODE */}
            {activeTab === 'redeem' && <RedeemCodeTab />}

            {/* TAB: PLACEHOLDER FOR REMAINING TABS */}
            {(activeTab === 'transactions' ||
              activeTab === 'payment' ||
              activeTab === 'currency' ||
              activeTab === 'rewards' ||
              activeTab === 'subscriptions' ||
              activeTab === 'legal' ||
              activeTab === 'parental' ||
              activeTab === 'programs' ||
              activeTab === 'publisher') && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight capitalize">
                    {activeTab.replace('_', ' ')}
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Manage your {activeTab.replace('_', ' ')} on ProducerToy.
                  </p>
                </div>

                <div className="bg-[#181818] border border-[#242424] p-8 rounded-2xl text-center space-y-3">
                  <p className="text-sm text-zinc-300">
                    No records found for this section yet.
                  </p>
                  <Link
                    href="/store"
                    className="inline-block bg-[#242424] hover:bg-[#303030] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
                  >
                    Explore Store Catalog
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}
