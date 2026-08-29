'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Gift,
  Clock,
  Download,
  Sparkles,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Ban
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useGifts } from '@/context/GiftContext'
import {
  getUserGiftsAction,
  claimUserGiftAction,
  rejectUserGiftAction,
  GiftRecord,
} from '@/actions/giftActions'

type GiftTab = 'all' | 'unopened' | 'received' | 'sent'

const TABS: { id: GiftTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unopened', label: 'Unopened' },
  { id: 'received', label: 'Received' },
  { id: 'sent', label: 'Sent' },
]

export function GiftsPageClient({ initialGifts = [] }: { initialGifts?: GiftRecord[] }) {
  const { user } = useAuth()
  const { formatPrice } = useCurrency()
  const { refreshGifts: refreshGlobalGifts } = useGifts()
  const [activeTab, setActiveTab] = useState<GiftTab>('all')
  const [gifts, setGifts] = useState<GiftRecord[]>(initialGifts)
  const [claimedSuccessId, setClaimedSuccessId] = useState<string | null>(null)
  const [claimLoadingId, setClaimLoadingId] = useState<string | null>(null)
  const [rejectLoadingId, setRejectLoadingId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchGifts = useCallback(async () => {
    try {
      const res = await getUserGiftsAction()
      if (res.success && res.gifts) {
        setGifts(res.gifts)
      }
    } catch (e) {
      console.error('Error fetching gifts:', e)
    }
  }, [])

  // Fetch gifts on auth change or mount
  useEffect(() => {
    fetchGifts()
  }, [user?.id, fetchGifts])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchGifts()
    setIsRefreshing(false)
  }

  // Filter gifts based on active tab & current user
  const currentUserEmail = (user?.email || '').toLowerCase()

  const filteredGifts = gifts.filter((gift) => {
    const isSentByMe = currentUserEmail
      ? gift.sender_email?.toLowerCase() === currentUserEmail || gift.sender_id === user?.id
      : false

    const isReceivedByMe = currentUserEmail
      ? gift.recipient_email?.toLowerCase() === currentUserEmail || gift.recipient_id === user?.id
      : true

    if (activeTab === 'sent') {
      return isSentByMe
    }
    if (activeTab === 'unopened') {
      return isReceivedByMe && gift.status === 'unopened'
    }
    if (activeTab === 'received') {
      return isReceivedByMe && gift.status === 'claimed'
    }
    return isSentByMe || isReceivedByMe
  })

  // Claim/Open Gift Action
  const handleClaimGift = async (gift: GiftRecord) => {
    setClaimLoadingId(gift.id)
    try {
      const res = await claimUserGiftAction(gift.id)
      if (res.success) {
        setGifts((prev) =>
          prev.map((g) => (g.id === gift.id ? { ...g, status: 'claimed' } : g))
        )
        setClaimedSuccessId(gift.id)
        refreshGlobalGifts()
        setTimeout(() => setClaimedSuccessId(null), 3500)
      } else {
        alert(res.error || 'Failed to claim gift.')
      }
    } catch (err: any) {
      console.error('Failed to claim gift:', err)
      alert(err.message || 'Failed to claim gift.')
    } finally {
      setClaimLoadingId(null)
    }
  }

  // Decline/Reject Gift Action
  const handleRejectGift = async (gift: GiftRecord) => {
    if (!confirm(`Are you sure you want to decline this gift of "${gift.product_name}"?`)) {
      return
    }
    setRejectLoadingId(gift.id)
    try {
      const res = await rejectUserGiftAction(gift.id)
      if (res.success) {
        setGifts((prev) =>
          prev.map((g) => (g.id === gift.id ? { ...g, status: 'rejected' } : g))
        )
        refreshGlobalGifts()
      } else {
        alert(res.error || 'Failed to decline gift.')
      }
    } catch (err: any) {
      console.error('Failed to decline gift:', err)
      alert(err.message || 'Failed to decline gift.')
    } finally {
      setRejectLoadingId(null)
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
        {/* 1. TOP TITLE HEADER & TABS                                                */}
        {/* ========================================================================= */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
                Gifts
              </h1>
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh Gifts"
                className={`p-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-[#2c2c2c] text-zinc-400 hover:text-white transition-all cursor-pointer ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

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
                  const isSentByMe = currentUserEmail
                    ? g.sender_email?.toLowerCase() === currentUserEmail || g.sender_id === user?.id
                    : false
                  const isReceivedByMe = currentUserEmail
                    ? g.recipient_email?.toLowerCase() === currentUserEmail || g.recipient_id === user?.id
                    : true

                  if (tab.id === 'sent') return isSentByMe
                  if (tab.id === 'unopened') return isReceivedByMe && g.status === 'unopened'
                  if (tab.id === 'received') return isReceivedByMe && g.status === 'claimed'
                  return isSentByMe || isReceivedByMe
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
            {filteredGifts.map((gift) => {
              const isSentByMe = currentUserEmail
                ? gift.sender_email?.toLowerCase() === currentUserEmail || gift.sender_id === user?.id
                : false
              const isReceivedByMe = currentUserEmail
                ? gift.recipient_email?.toLowerCase() === currentUserEmail || gift.recipient_id === user?.id
                : true

              return (
                <div
                  key={gift.id}
                  className="bg-[#181818] border border-[#242424] hover:border-[#2e2e2e] rounded-2xl p-5 sm:p-6 transition-all shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                >
                  {/* Left: Artwork + Details */}
                  <div className="flex items-start gap-4">
                    {/* Cover */}
                    <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-[#121212] border border-[#282828] shrink-0 shadow-md">
                      <Image
                        src={gift.cover_image || '/placeholder.jpg'}
                        alt={gift.product_name || 'Gift'}
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
                              ? isSentByMe && !isReceivedByMe
                                ? 'bg-amber-950/40 border-amber-600/40 text-amber-400'
                                : 'bg-[#FA742B]/15 border-[#FA742B]/40 text-[#FA742B]'
                              : gift.status === 'claimed'
                              ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-400'
                              : 'bg-rose-950/40 border-rose-600/40 text-rose-400'
                          }`}
                        >
                          {gift.status === 'unopened'
                            ? isSentByMe && !isReceivedByMe
                              ? 'Sent to Friend (Unclaimed)'
                              : 'Unopened Gift'
                            : gift.status === 'claimed'
                            ? isSentByMe && !isReceivedByMe
                              ? 'Claimed by Friend'
                              : 'Claimed & In Library'
                            : 'Declined'}
                        </span>

                        <span className="text-xs text-zinc-500 font-mono">
                          {gift.claim_code}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                        {gift.product_name}
                      </h3>

                      {/* Sender / Recipient Info */}
                      <div className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
                        {isSentByMe ? (
                          <span>To: <strong className="text-zinc-200">{gift.recipient_email}</strong></span>
                        ) : (
                          <span>From: <strong className="text-zinc-200">{gift.sender_email}</strong></span>
                        )}
                        <span>•</span>
                        <span>{new Date(gift.created_at).toLocaleDateString()}</span>
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
                    {isReceivedByMe && gift.status === 'unopened' ? (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleClaimGift(gift)}
                          disabled={claimLoadingId === gift.id || rejectLoadingId === gift.id}
                          className="flex-1 sm:flex-none bg-[#FA742B] hover:bg-[#E05A18] text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#FA742B]/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>
                            {claimedSuccessId === gift.id
                              ? 'Claimed!'
                              : claimLoadingId === gift.id
                              ? 'Claiming...'
                              : 'Claim to Library'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRejectGift(gift)}
                          disabled={claimLoadingId === gift.id || rejectLoadingId === gift.id}
                          className="bg-[#202020] hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-700/50 text-zinc-400 border border-[#2c2c2c] font-bold text-xs px-3.5 py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          title="Decline Gift"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    ) : gift.status === 'claimed' ? (
                      <Link
                        href="/library"
                        prefetch={true}
                        className="w-full sm:w-auto bg-[#202020] hover:bg-[#282828] text-zinc-200 hover:text-white border border-[#2c2c2c] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>View in Library</span>
                      </Link>
                    ) : gift.status === 'rejected' ? (
                      <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-950/30 border border-rose-800/30 px-3.5 py-2 rounded-xl">
                        <XCircle className="w-4 h-4" />
                        <span>Declined</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-950/30 border border-amber-800/30 px-3.5 py-2 rounded-xl">
                        <Clock className="w-4 h-4" />
                        <span>Sent (Awaiting Claim)</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW B: EMPTY STATE CONTAINER                                             */
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
                  <path
                    d="M32 19V52"
                    stroke="#FA742B"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Headings */}
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {getEmptyHeading()}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                {getEmptySubtitle()}
              </p>

              {/* Call-to-action button to explore and send gifts */}
              <div className="mt-7">
                <Link
                  href="/"
                  className="bg-[#FA742B] hover:bg-[#E05A18] text-white font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#FA742B]/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>Browse Sound Kits &amp; Plugins</span>
                </Link>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
