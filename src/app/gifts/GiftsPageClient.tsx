'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Gift,
  CheckCircle2,
  Clock,
  Mail,
  ExternalLink,
  Sparkles,
  Download,
  Key
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'

export interface UserGift {
  id: string
  productId: string
  productName: string
  productSlug: string
  coverImage: string
  senderEmail: string
  recipientEmail: string
  message: string
  sendDate: string
  priceUsd: number | string
  priceInr?: number | string
  createdAt: string
  status: 'unopened' | 'received' | 'sent'
  claimCode: string
}

type GiftTab = 'all' | 'unopened' | 'received' | 'sent'

const TABS: { id: GiftTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unopened', label: 'Unopened' },
  { id: 'received', label: 'Received' },
  { id: 'sent', label: 'Sent' },
]

export function GiftsPageClient() {
  const { user } = useAuth()
  const { formatPrice } = useCurrency()
  const [activeTab, setActiveTab] = useState<GiftTab>('all')
  const [gifts, setGifts] = useState<UserGift[]>([])
  const [claimedSuccessId, setClaimedSuccessId] = useState<string | null>(null)

  // Load user gifts from localStorage on mount
  useEffect(() => {
    try {
      const storedGifts: UserGift[] = JSON.parse(localStorage.getItem('pt_user_gifts') || '[]')
      setGifts(storedGifts)
    } catch {
      setGifts([])
    }
  }, [])

  // Listen for storage events (e.g. after checkout completion in another tab/modal)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedGifts: UserGift[] = JSON.parse(localStorage.getItem('pt_user_gifts') || '[]')
        setGifts(storedGifts)
      } catch {}
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Filter gifts based on active tab
  const currentUserEmail = user?.email?.toLowerCase() || ''
  
  const filteredGifts = gifts.filter((gift) => {
    const isSentByMe = currentUserEmail
      ? gift.senderEmail.toLowerCase() === currentUserEmail
      : gift.status === 'sent'

    const isReceivedByMe = currentUserEmail
      ? gift.recipientEmail.toLowerCase() === currentUserEmail
      : gift.status !== 'sent'

    if (activeTab === 'sent') {
      return isSentByMe || gift.status === 'sent'
    }
    if (activeTab === 'unopened') {
      return (isReceivedByMe || gift.status === 'unopened') && gift.status === 'unopened'
    }
    if (activeTab === 'received') {
      return (isReceivedByMe || gift.status === 'received') && gift.status === 'received'
    }
    return true // 'all' tab
  })

  // Claim/Open Gift Action
  const handleClaimGift = (gift: UserGift) => {
    try {
      // 1. Update gift status to received
      const updatedGifts = gifts.map((g) =>
        g.id === gift.id ? { ...g, status: 'received' as const } : g
      )
      setGifts(updatedGifts)
      localStorage.setItem('pt_user_gifts', JSON.stringify(updatedGifts))

      // 2. Add product to library in localStorage
      const library = JSON.parse(localStorage.getItem('pt_purchased_products') || '[]')
      if (!library.some((item: any) => item.id === gift.productId)) {
        library.push({
          id: gift.productId,
          name: gift.productName,
          slug: gift.productSlug,
          cover_image: gift.coverImage,
          claimed_at: new Date().toISOString(),
          is_gift: true,
          gift_sender: gift.senderEmail,
        })
        localStorage.setItem('pt_purchased_products', JSON.stringify(library))
      }

      setClaimedSuccessId(gift.id)
      setTimeout(() => setClaimedSuccessId(null), 3000)
    } catch (err) {
      console.error('Failed to claim gift:', err)
    }
  }

  const getEmptyHeading = () => {
    switch (activeTab) {
      case 'unopened':
        return 'No Unopened Gifts'
      case 'received':
        return 'No Received Gifts'
      case 'sent':
        return 'No Sent Gifts'
      default:
        return 'No Received or Sent Gifts'
    }
  }

  const getEmptySubtitle = () => {
    switch (activeTab) {
      case 'unopened':
        return 'Unclaimed sound kits and plugins gifted to you will appear here.'
      case 'received':
        return 'Plugins and sound packs gifted to you will show up here.'
      case 'sent':
        return 'Gifts you have sent to fellow producers will appear here.'
      default:
        return 'Sound kits and plugins gifted to you will show up here.'
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans select-none pb-28">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        
        {/* ========================================================================= */}
        {/* 1. TOP TITLE HEADER & TABS (Exact 1:1 Match)                              */}
        {/* ========================================================================= */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
              Gifts
            </h1>

            {/* Quick gift summary count pill if gifts exist */}
            {gifts.length > 0 && (
              <div className="bg-[#1c1c1c] border border-[#2c2c2c] px-3.5 py-1.5 rounded-full text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-[#FA742B]" />
                <span>{gifts.length} Total Gift{gifts.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Filter Tabs: All, Unopened, Received, Sent */}
          <div className="border-b border-[#202020]">
            <div className="flex items-center gap-6 sm:gap-8 text-sm font-semibold overflow-x-auto custom-scrollbar">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id
                const tabCount = gifts.filter((g) => {
                  if (tab.id === 'sent') return g.status === 'sent'
                  if (tab.id === 'unopened') return g.status === 'unopened'
                  if (tab.id === 'received') return g.status === 'received'
                  return true
                }).length

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3.5 relative transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base flex items-center gap-2 ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-zinc-400 hover:text-white font-normal'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tabCount > 0 && (
                      <span className="text-[11px] font-bold bg-[#242424] text-zinc-300 px-2 py-0.5 rounded-full">
                        {tabCount}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW A: GIFTS LIST (When user has gifts)                                  */}
        {/* ========================================================================= */}
        {filteredGifts.length > 0 ? (
          <div className="mt-6 sm:mt-8 space-y-4">
            {filteredGifts.map((gift) => (
              <div
                key={gift.id}
                className="bg-[#181818] border border-[#242424] hover:border-[#2e2e2e] rounded-2xl p-5 sm:p-6 transition-all shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
              >
                {/* Left: Artwork + Details */}
                <div className="flex items-start gap-4">
                  {/* Cover */}
                  <div className="relative w-16 h-22 sm:w-20 sm:h-26 rounded-xl overflow-hidden bg-[#121212] border border-[#282828] shrink-0 shadow-md">
                    <Image
                      src={gift.coverImage || '/placeholder.jpg'}
                      alt={gift.productName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          gift.status === 'unopened'
                            ? 'bg-[#FA742B]/15 border-[#FA742B]/40 text-[#FA742B]'
                            : gift.status === 'received'
                            ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {gift.status === 'unopened'
                          ? 'Unopened Gift'
                          : gift.status === 'received'
                          ? 'Claimed & In Library'
                          : 'Sent to Friend'}
                      </span>

                      <span className="text-xs text-zinc-500 font-mono">
                        {gift.claimCode}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {gift.productName}
                    </h3>

                    {/* Sender / Recipient Info */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
                      {gift.status === 'sent' ? (
                        <span>To: <strong className="text-zinc-200">{gift.recipientEmail}</strong></span>
                      ) : (
                        <span>From: <strong className="text-zinc-200">{gift.senderEmail}</strong></span>
                      )}
                      <span>•</span>
                      <span>{new Date(gift.sendDate || gift.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Message Note */}
                    {gift.message && (
                      <p className="text-xs text-zinc-300 italic bg-[#141414] border border-[#242424] px-3 py-1.5 rounded-lg w-fit mt-1">
                        &ldquo;{gift.message}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="w-full sm:w-auto flex items-center justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#222222]">
                  {gift.status === 'unopened' ? (
                    <button
                      type="button"
                      onClick={() => handleClaimGift(gift)}
                      className="w-full sm:w-auto bg-[#FA742B] hover:bg-[#E05A18] text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#FA742B]/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{claimedSuccessId === gift.id ? 'Claimed!' : 'Claim to Library'}</span>
                    </button>
                  ) : gift.status === 'received' ? (
                    <Link
                      href="/library"
                      prefetch={true}
                      className="w-full sm:w-auto bg-[#202020] hover:bg-[#282828] text-zinc-200 hover:text-white border border-[#2c2c2c] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-zinc-400" />
                      <span>View in Library</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-800/30 px-3.5 py-2 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Delivered</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW B: EMPTY STATE CONTAINER (Exact Screenshot 1 & 2 1:1 Match)          */
          /* ========================================================================= */
          <div className="mt-6 sm:mt-8 bg-[#181818] border border-[#242424] rounded-2xl sm:rounded-3xl min-h-[380px] sm:min-h-[480px] p-8 sm:p-14 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
            
            {/* Subtle Starburst Sparkle Background Glow Effect */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
              <div className="w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-[#FA742B]/15 rounded-full blur-[90px]" />
            </div>

            {/* Stylized Neon Gift Icon with ProducerToy Orange Glow */}
            <div className="relative z-10 flex flex-col items-center">
              
              {/* Gift Icon Box */}
              <div className="relative mb-5 flex items-center justify-center">
                <svg
                  className="w-20 h-20 sm:w-24 sm:h-24 text-[#FA742B] transition-transform duration-300 hover:scale-105"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Gift Box Top Lid / Ribbon Bow */}
                  <path
                    d="M24 16C24 12.6863 26.6863 10 30 10C32.5 10 32 18 32 18C32 18 31.5 10 34 10C37.3137 10 40 12.6863 40 16C40 19.3137 32 19 32 19C32 19 24 19.3137 24 16Z"
                    stroke="#FA742B"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Box Top Lid */}
                  <rect
                    x="14"
                    y="19"
                    width="36"
                    height="8"
                    rx="3"
                    stroke="#FA742B"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Box Body Bottom */}
                  <path
                    d="M18 27V48C18 50.2091 19.7909 52 22 52H42C44.2091 52 46 50.2091 46 48V27"
                    stroke="#FA742B"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Center Vertical Ribbon */}
                  <line
                    x1="32"
                    y1="19"
                    x2="32"
                    y2="52"
                    stroke="#FA742B"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  {/* Accent Ribbon Stripe */}
                  <line
                    x1="26"
                    y1="27"
                    x2="26"
                    y2="52"
                    stroke="#FA742B"
                    strokeWidth="1.5"
                    strokeDasharray="2 3"
                    strokeOpacity="0.4"
                  />
                  <line
                    x1="38"
                    y1="27"
                    x2="38"
                    y2="52"
                    stroke="#FA742B"
                    strokeWidth="1.5"
                    strokeDasharray="2 3"
                    strokeOpacity="0.4"
                  />
                </svg>

                {/* Surrounding Accent Dots / Sparkles */}
                <div className="absolute -top-2 -left-3 w-1.5 h-1.5 rounded-full bg-[#FA742B]/70" />
                <div className="absolute top-2 -right-4 w-2 h-2 rounded-full bg-[#FA742B]/80" />
                <div className="absolute -bottom-2 -right-2 w-1.5 h-1.5 rounded-full bg-[#FA742B]/60" />
                <div className="absolute bottom-1 -left-4 w-2 h-2 rounded-full bg-[#FA742B]/70" />
              </div>

              {/* Empty Heading */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                {getEmptyHeading()}
              </h2>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-sm">
                {getEmptySubtitle()}
              </p>

              {/* Orange CTA Button (Exact Screenshot Match: Browse Sounds / Browse Tools) */}
              <Link
                href="/store"
                prefetch={true}
                className="mt-6 sm:mt-7 bg-[#FA742B] hover:bg-[#E05A18] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#FA742B]/20 active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>Browse Sound Kits & Plugins</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>

          </div>
        )}

      </div>
    </div>
  )
}
