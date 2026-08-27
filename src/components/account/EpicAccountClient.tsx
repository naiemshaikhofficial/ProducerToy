'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { AccountSidebar, AccountTab } from './AccountSidebar'
import { MobileAccountBar } from './MobileAccountBar'
import { AccountInfoSection } from './AccountInfoSection'
import { PersonalDetailsSection } from './PersonalDetailsSection'
import { CompanyDetailsSection } from './CompanyDetailsSection'
import { DataPrivacySection } from './DataPrivacySection'
import { LinkedAccountsTab } from './LinkedAccountsTab'
import { CommunicationTab } from './CommunicationTab'
import { SecurityTab } from './SecurityTab'
import { RedeemCodeTab } from './RedeemCodeTab'
import { TransactionsTab } from './TransactionsTab'
import { RewardsAndWalletTab } from './RewardsAndWalletTab'
import { updatePersonalDetailsAction } from '@/actions/accountActions'

export default function EpicAccountClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const validTabs: AccountTab[] = [
    'settings',
    'linked_accounts',
    'communication',
    'security',
    'legal',
    'payment',
    'transactions',
    'subscriptions',
    'currency',
    'rewards',
    'redeem',
    'parental',
    'programs',
    'publisher',
  ]

  const tabQuery = searchParams.get('tab') as AccountTab
  const initialTab: AccountTab = (tabQuery && validTabs.includes(tabQuery)) ? tabQuery : 'settings'

  const [activeTab, setActiveTabState] = useState<AccountTab>(initialTab)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [displayName, setDisplayName] = useState('Naiem Shaikh')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  // Keep activeTab in sync if URL query changes (e.g. browser back/forward or navigation from navbar)
  useEffect(() => {
    if (tabQuery && validTabs.includes(tabQuery) && tabQuery !== activeTab) {
      setActiveTabState(tabQuery)
    }
  }, [tabQuery])

  const setActiveTab = (tab: AccountTab) => {
    setActiveTabState(tab)
    if (tab === 'settings') {
      router.replace('/account', { scroll: false })
    } else {
      router.replace(`/account?tab=${tab}`, { scroll: false })
    }
  }

  const loadUserData = React.useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        // Fetch full profile from Supabase
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (prof) {
          setProfile(prof)
          const name =
            prof.display_name ||
            prof.full_name ||
            user.user_metadata?.full_name ||
            (user.email ? user.email.split('@')[0] : 'Naiem Shaikh')
          setDisplayName(name)
        } else {
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.display_name ||
            (user.email ? user.email.split('@')[0] : 'Naiem Shaikh')
          setDisplayName(name)
        }
      }
    } catch (err) {
      console.warn('Error loading account user:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  const handleSaveDisplayName = async (name: string) => {
    setDisplayName(name)
    if (!user) return
    try {
      const supabase = getSupabaseBrowserClient()
      await updatePersonalDetailsAction(user.id, {
        display_name: name,
      })
      await supabase.auth.updateUser({
        data: { display_name: name, full_name: name },
      })
      handleSaveSuccess()
    } catch (err) {
      console.warn('Error saving display name:', err)
    }
  }

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
      
      {/* ========================================================================= */}
      {/* 1. MOBILE EDGE-TO-EDGE ACCOUNT SELECTOR BAR (< lg) (Exact Match)          */}
      {/* ========================================================================= */}
      <MobileAccountBar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ========================================================================= */}
          {/* 2. DESKTOP PERMANENT LEFT SIDEBAR (>= lg)                                  */}
          {/* ========================================================================= */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <AccountSidebar
              activeTab={activeTab}
              onSelectTab={(tab) => setActiveTab(tab)}
            />
          </div>

          {/* ========================================================================= */}
          {/* 3. MAIN VIEW CONTENT AREA                                                 */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 xl:col-span-9 max-w-3xl">
            
            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-12">
                {/* Header Title (Exact Screenshot Match) */}
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
                  onSaveDisplayName={handleSaveDisplayName}
                />

                {/* Sub-component: Personal Details (First Name, Last Name, Address, Country) */}
                <PersonalDetailsSection
                  user={user}
                  profile={profile}
                  onSaveSuccess={handleSaveSuccess}
                />

                {/* Sub-component: Company Details (Company Name, VAT, Address) */}
                <CompanyDetailsSection
                  user={user}
                  profile={profile}
                  onSaveSuccess={handleSaveSuccess}
                />

                {/* Sub-component: Data & Privacy (Download Data, Delete Account) */}
                <DataPrivacySection />
              </div>
            )}

            {/* TAB: LINKED ACCOUNTS */}
            {activeTab === 'linked_accounts' && (
              <LinkedAccountsTab
                user={user}
                profile={profile}
                onProfileUpdate={loadUserData}
              />
            )}

            {/* TAB: COMMUNICATION PREFERENCES */}
            {activeTab === 'communication' && (
              <CommunicationTab
                user={user}
                profile={profile}
                maskedEmail={maskedEmail}
              />
            )}

            {/* TAB: PASSWORD AND SECURITY */}
            {activeTab === 'security' && <SecurityTab />}

            {/* TAB: REDEEM CODE */}
            {activeTab === 'redeem' && <RedeemCodeTab />}

            {/* TAB: TRANSACTIONS */}
            {activeTab === 'transactions' && <TransactionsTab user={user} />}

            {/* TAB: EPIC REWARDS */}
            {activeTab === 'rewards' && (
              <RewardsAndWalletTab type="rewards" profile={profile} />
            )}

            {/* TAB: IN-GAME CURRENCY / WALLET */}
            {activeTab === 'currency' && (
              <RewardsAndWalletTab type="currency" profile={profile} />
            )}

            {/* TAB: LEGAL HISTORY & AGREEMENTS */}
            {activeTab === 'legal' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    Legal History & Agreements
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Review official End User License Agreements, commercial sound licenses, and store policies accepted on your account.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-[#181818] border border-[#242424] p-5 rounded-2xl flex items-center justify-between hover:border-[#FA742B]/30 transition-colors">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-white block">
                        Producer Toy End User License Agreement (EULA)
                      </span>
                      <p className="text-xs text-zinc-400">
                        Accepted on account creation • Governs software, digital sounds, commercial music rights, and Toywards rewards.
                      </p>
                    </div>
                    <Link
                      href="/eula"
                      target="_blank"
                      className="bg-[#242424] hover:bg-[#303030] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex-shrink-0 ml-4"
                    >
                      View EULA
                    </Link>
                  </div>

                  <div className="bg-[#181818] border border-[#242424] p-5 rounded-2xl flex items-center justify-between hover:border-[#FA742B]/30 transition-colors">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-white block">
                        100% Royalty-Free Commercial Audio Licensing
                      </span>
                      <p className="text-xs text-zinc-400">
                        Details your global rights to monetize songs on Spotify, Apple Music, YouTube, and commercial film sync.
                      </p>
                    </div>
                    <Link
                      href="/licensing"
                      target="_blank"
                      className="bg-[#242424] hover:bg-[#303030] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex-shrink-0 ml-4"
                    >
                      View Terms
                    </Link>
                  </div>

                  <div className="bg-[#181818] border border-[#242424] p-5 rounded-2xl flex items-center justify-between hover:border-[#FA742B]/30 transition-colors">
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-white block">
                        Terms of Service & Purchase Policy
                      </span>
                      <p className="text-xs text-zinc-400">
                        Store operating terms, order processing, digital goods delivery, and GST taxation policies.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <Link
                        href="/terms"
                        target="_blank"
                        className="bg-[#242424] hover:bg-[#303030] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                      >
                        Terms
                      </Link>
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="bg-[#242424] hover:bg-[#303030] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                      >
                        Privacy
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PLACEHOLDER FOR REMAINING TABS */}
            {(activeTab === 'payment' ||
              activeTab === 'subscriptions' ||
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
                    No active {activeTab.replace('_', ' ')} found for this account.
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
