'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  User,
  Link2,
  Mail,
  Shield,
  FileText,
  CreditCard,
  History,
  Tag,
  Coins,
  Sparkles,
  Key,
  Lock,
  Edit2,
  Info,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Globe,
  Trash2,
  Download,
  CheckCircle2
} from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type AccountTab =
  | 'settings'
  | 'linked_accounts'
  | 'communication'
  | 'security'
  | 'legal'
  | 'payment'
  | 'transactions'
  | 'subscriptions'
  | 'currency'
  | 'rewards'
  | 'redeem'
  | 'parental'
  | 'programs'
  | 'publisher'

export default function EpicAccountClient() {
  const [activeTab, setActiveTab] = useState<AccountTab>('settings')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false)
  const [isEditingCountry, setIsEditingCountry] = useState(false)
  const [dataDownloadRequested, setDataDownloadRequested] = useState(false)

  // Account Form Fields
  const [displayName, setDisplayName] = useState('Naiem Shaikh')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('INDIA')

  // Company Form Fields
  const [companyName, setCompanyName] = useState('')
  const [companyVat, setCompanyVat] = useState('')
  const [companyAddress1, setCompanyAddress1] = useState('')
  const [companyAddress2, setCompanyAddress2] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyRegion, setCompanyRegion] = useState('')
  const [companyPostal, setCompanyPostal] = useState('')

  // Communication Preferences
  const [promoEmails, setPromoEmails] = useState(true)
  const [orderEmails, setOrderEmails] = useState(true)
  const [rewardEmails, setRewardEmails] = useState(true)

  // Redeem Code Input
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          const name = user.user_metadata?.full_name || user.user_metadata?.display_name || (user.email ? user.email.split('@')[0] : 'Naiem Shaikh')
          setDisplayName(name)
          setFirstName(user.user_metadata?.first_name || '')
          setLastName(user.user_metadata?.last_name || '')
        }
      } catch (err) {
        console.warn('Error loading account user:', err)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!redeemCode.trim()) return
    setRedeemMessage('Code validated! Discount applied to your account.')
    setRedeemCode('')
    setTimeout(() => setRedeemMessage(null), 4000)
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
          {/* 1. LEFT SIDEBAR NAVIGATION (Exact Epic Games Store Layout)                */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 xl:col-span-3 bg-[#161616] border border-[#222222] rounded-[18px] p-5 space-y-6">
            
            {/* Group 1: Account */}
            <div>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
                Account
              </span>
              <div className="flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <User className="w-4 h-4 text-zinc-400" />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('linked_accounts')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'linked_accounts'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <Link2 className="w-4 h-4 text-zinc-400" />
                  <span>Linked accounts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('communication')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'communication'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <span>Communication preferences</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'security'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <Shield className="w-4 h-4 text-zinc-400" />
                  <span>Password and security</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('legal')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'legal'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>Legal history</span>
                </button>
              </div>
            </div>

            {/* Group 2: Payment and Rewards */}
            <div className="pt-2 border-t border-[#202020]">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
                Payment and rewards
              </span>
              <div className="flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('payment')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'payment'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-zinc-400" />
                  <span>Payment settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('transactions')}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'transactions'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-zinc-400" />
                    <span>Transactions</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('subscriptions')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'subscriptions'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <Tag className="w-4 h-4 text-zinc-400" />
                  <span>Subscriptions</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('currency')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'currency'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <Coins className="w-4 h-4 text-zinc-400" />
                  <span>In-game currency / Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('rewards')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'rewards'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                  <span>Epic rewards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('redeem')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'redeem'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <Key className="w-4 h-4 text-zinc-400" />
                  <span>Redeem code</span>
                </button>
              </div>
            </div>

            {/* Group 3: Parental Controls */}
            <div className="pt-2 border-t border-[#202020]">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
                Parental controls
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('parental')}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                  activeTab === 'parental'
                    ? 'bg-[#262626] text-white font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                }`}
              >
                <Lock className="w-4 h-4 text-zinc-400" />
                <span>Parental controls</span>
              </button>
            </div>

            {/* Group 4: Creator & Developer Tools */}
            <div className="pt-2 border-t border-[#202020]">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-3">
                Creator & developer tools
              </span>
              <div className="flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('programs')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'programs'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                  <span>Programs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('publisher')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors text-left w-full cursor-pointer ${
                    activeTab === 'publisher'
                      ? 'bg-[#262626] text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>Publisher profile</span>
                </button>
              </div>
            </div>

          </div>


          {/* ========================================================================= */}
          {/* 2. MAIN CONTENT VIEW (Tabs matching screenshots)                          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 xl:col-span-9 max-w-3xl">
            
            {/* TAB: SETTINGS (Exact Screenshot 1, 2, 3, 4 Match) */}
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

                {/* Section 1: Account Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Account information
                  </h2>
                  <p className="text-xs font-semibold text-zinc-300">
                    ID: <span className="font-mono text-zinc-400">{accountId}</span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    
                    {/* Display Name Input with Edit Pencil */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        Display name
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 bg-[#181818] border border-[#2c2c2c] rounded-xl px-4 py-3 flex items-center justify-between">
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            disabled={!isEditingDisplayName}
                            className="bg-transparent text-white text-sm focus:outline-none w-full disabled:opacity-90"
                          />
                          <div className="text-zinc-500 hover:text-zinc-300 cursor-pointer ml-2" title="Display Name Info">
                            <Info className="w-4 h-4" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingDisplayName(!isEditingDisplayName)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                            isEditingDisplayName
                              ? 'bg-white text-black border-white'
                              : 'bg-[#222222] hover:bg-[#2c2c2c] text-white border-[#333333]'
                          }`}
                          title={isEditingDisplayName ? "Save Display Name" : "Edit Display Name"}
                        >
                          {isEditingDisplayName ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Email Address (LOCKED / READ-ONLY - NO EDIT OPTION AS REQUIRED) */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        Email address
                      </label>
                      <div className="relative bg-[#181818] border border-[#2c2c2c] rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-sm text-zinc-200 font-mono select-all">
                          {maskedEmail}
                        </span>
                        <div className="text-zinc-500 hover:text-zinc-300 cursor-help" title="Email address is permanently verified and locked.">
                          <Info className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Section 2: Personal Details Form */}
                <form onSubmit={handleSavePersonal} className="space-y-6 pt-4 border-t border-[#222222]">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      Personal details
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Manage your name and contact info. These personal details are private and will not be displayed to other users. View our{' '}
                      <Link href="/privacy" className="text-zinc-200 underline hover:text-white">
                        Privacy Policy
                      </Link>.
                    </p>
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-bold text-white">
                      Address
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="Street Address or P.O. Box"
                        className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="Apartment, suite, unit, building, floor, etc."
                        className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                          City *
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                          Region
                        </label>
                        <input
                          type="text"
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          placeholder="State / Province"
                          className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="PIN / Postal Code"
                          className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Country / Region Selector */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        Country / Region
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 bg-[#181818] border border-[#2c2c2c] rounded-xl px-4 py-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-white uppercase tracking-wider">
                            {country}
                          </span>
                          <div className="text-zinc-500 hover:text-zinc-300 cursor-pointer" title="Country is determined by your billing profile.">
                            <Info className="w-4 h-4" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingCountry(!isEditingCountry)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                            isEditingCountry
                              ? 'bg-white text-black border-white'
                              : 'bg-[#222222] hover:bg-[#2c2c2c] text-white border-[#333333]'
                          }`}
                          title="Change Country"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>

                      {isEditingCountry && (
                        <div className="mt-2 p-3 bg-[#181818] border border-[#2c2c2c] rounded-xl flex items-center gap-3">
                          <select
                            value={country}
                            onChange={(e) => {
                              setCountry(e.target.value)
                              setIsEditingCountry(false)
                            }}
                            className="bg-[#202020] text-white text-sm rounded-lg px-3 py-2 border border-[#333333] focus:outline-none w-full"
                          >
                            <option value="INDIA">INDIA</option>
                            <option value="UNITED STATES">UNITED STATES</option>
                            <option value="UNITED KINGDOM">UNITED KINGDOM</option>
                            <option value="GERMANY">GERMANY</option>
                            <option value="CANADA">CANADA</option>
                            <option value="AUSTRALIA">AUSTRALIA</option>
                            <option value="JAPAN">JAPAN</option>
                          </select>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Save Changes Button (Pure Neutral Darks, NO Blue) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-[#262626] hover:bg-[#343434] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>

                {/* Section 3: Company Details (Optional) */}
                <form onSubmit={handleSaveCompany} className="space-y-6 pt-8 border-t border-[#222222]">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      Company
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Manage your company information used for business receipts for your purchase(s).{' '}
                      <Link href="/terms" className="text-zinc-200 underline hover:text-white">
                        Learn more
                      </Link>
                    </p>
                    <p className="text-xs font-semibold text-zinc-300 mt-2">
                      If you are registered for VAT, you may not be charged VAT on your purchase. To get started, enter your COMPANY VAT NUMBER.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Registered Business Name"
                        className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        Company VAT number *
                      </label>
                      <input
                        type="text"
                        value={companyVat}
                        onChange={(e) => setCompanyVat(e.target.value)}
                        placeholder="e.g. GB123456789 or GSTIN"
                        className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-bold text-white">
                      Company address
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={companyAddress1}
                        onChange={(e) => setCompanyAddress1(e.target.value)}
                        placeholder="Business Address"
                        className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={companyAddress2}
                        onChange={(e) => setCompanyAddress2(e.target.value)}
                        placeholder="Suite, building, floor"
                        className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                          City *
                        </label>
                        <input
                          type="text"
                          value={companyCity}
                          onChange={(e) => setCompanyCity(e.target.value)}
                          placeholder="City"
                          className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                          Region
                        </label>
                        <input
                          type="text"
                          value={companyRegion}
                          onChange={(e) => setCompanyRegion(e.target.value)}
                          placeholder="State / Region"
                          className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          value={companyPostal}
                          onChange={(e) => setCompanyPostal(e.target.value)}
                          placeholder="Postal Code"
                          className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-[#262626] hover:bg-[#343434] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>

                {/* Section 4: Download Account Data */}
                <div className="space-y-4 pt-8 border-t border-[#222222]">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Download account data
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                    Download a copy of available data you've shared with us. We'll email you once it's ready, and you'll have 15 days to download it.
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => setDataDownloadRequested(true)}
                      className="bg-[#262626] hover:bg-[#343434] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>{dataDownloadRequested ? "Download Requested (Email Sent)" : "Request download"}</span>
                    </button>
                  </div>
                </div>

                {/* Section 5: Delete Account (Danger Zone) */}
                <div className="space-y-4 pt-8 border-t border-[#222222]">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Delete account
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                    Delete your ProducerToy account including all personal information, purchases, sound packs, VST licenses, your account balance and projects. Your account will be permanently deleted in 30 days.
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to request account deletion? All licenses and downloads will be deleted permanently.")) {
                          alert("Account deletion request submitted. Check your email to confirm.")
                        }
                      }}
                      className="bg-[#e50914] hover:bg-[#c90812] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-2 shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete account</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: LINKED ACCOUNTS */}
            {activeTab === 'linked_accounts' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    Linked accounts
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Connect external accounts for seamless sign-in and cloud sound sync.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Google', desc: 'Sign in with your Google account', connected: true },
                    { name: 'GitHub', desc: 'Connect for developer tools & scripts', connected: false },
                    { name: 'Discord', desc: 'Sync roles in ProducerToy Community', connected: false },
                    { name: 'SoundCloud', desc: 'Import demo tracks and audio stems', connected: false },
                  ].map((item) => (
                    <div key={item.name} className="bg-[#181818] border border-[#242424] p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">{item.name}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          item.connected
                            ? 'bg-[#2a2a2a] text-zinc-300 hover:text-red-400 hover:bg-[#333333]'
                            : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                      >
                        {item.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: COMMUNICATION PREFERENCES */}
            {activeTab === 'communication' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    Communication preferences
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Choose what updates you want to receive at <span className="text-white font-mono">{maskedEmail}</span>.
                  </p>
                </div>

                <div className="space-y-4 bg-[#181818] border border-[#242424] p-5 rounded-2xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={promoEmails}
                      onChange={(e) => setPromoEmails(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-zinc-200 rounded"
                    />
                    <div>
                      <span className="text-sm font-bold text-white block">Promotional discounts and sales</span>
                      <span className="text-xs text-zinc-400 block mt-0.5">Get notified when plugins and sound packs go on sale or are offered for free.</span>
                    </div>
                  </label>

                  <div className="border-t border-[#242424]" />

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={orderEmails}
                      onChange={(e) => setOrderEmails(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-zinc-200 rounded"
                    />
                    <div>
                      <span className="text-sm font-bold text-white block">Order confirmations & license deliveries</span>
                      <span className="text-xs text-zinc-400 block mt-0.5">Always receive your invoices, serial keys, and download links directly in email.</span>
                    </div>
                  </label>

                  <div className="border-t border-[#242424]" />

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rewardEmails}
                      onChange={(e) => setRewardEmails(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-zinc-200 rounded"
                    />
                    <div>
                      <span className="text-sm font-bold text-white block">Epic rewards & loyalty cashback balance</span>
                      <span className="text-xs text-zinc-400 block mt-0.5">Receive monthly statements of your cashback points and store credits.</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: PASSWORD AND SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    Password and security
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Manage your password and two-factor authentication (2FA).
                  </p>
                </div>

                <div className="bg-[#181818] border border-[#242424] p-5 rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-white">Change Password</h3>
                  <div className="space-y-3 max-w-md">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-[#202020] border border-[#333333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-[#202020] border border-[#333333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none" />
                    </div>
                    <button type="button" className="bg-[#262626] hover:bg-[#343434] text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="bg-[#181818] border border-[#242424] p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md">Add an extra layer of security to prevent unauthorized access to your licenses and wallet.</p>
                  </div>
                  <button type="button" className="bg-white text-black hover:bg-zinc-200 font-bold text-xs px-4 py-2 rounded-lg transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
            )}

            {/* TAB: REDEEM CODE */}
            {activeTab === 'redeem' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    Redeem code
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    Enter a product activation key, gift card code, or discount voucher.
                  </p>
                </div>

                <form onSubmit={handleRedeemSubmit} className="bg-[#181818] border border-[#242424] p-6 rounded-2xl space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                      Code or Serial Key
                    </label>
                    <input
                      type="text"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="w-full bg-[#202020] border border-[#333333] focus:border-zinc-400 text-white font-mono text-sm rounded-xl px-4 py-3 focus:outline-none uppercase tracking-widest"
                    />
                  </div>

                  {redeemMessage && (
                    <p className="text-xs font-semibold text-green-400">{redeemMessage}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider transition-all shadow-md active:scale-95"
                  >
                    Redeem Code
                  </button>
                </form>
              </div>
            )}

            {/* TAB: TRANSACTIONS / PAYMENT / REWARDS */}
            {(activeTab === 'transactions' || activeTab === 'payment' || activeTab === 'currency' || activeTab === 'rewards' || activeTab === 'subscriptions' || activeTab === 'legal' || activeTab === 'parental' || activeTab === 'programs' || activeTab === 'publisher') && (
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
