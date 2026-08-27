'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  Info,
  ChevronRight,
  ExternalLink,
  ShoppingBag,
  Coins,
  History
} from 'lucide-react'
import { getToywardsDataAction } from '@/actions/accountActions'
import { useCurrency } from '@/context/CurrencyContext'

// 1:1 Epic Games 8-point sparkle circle icon
export const EpicRewardsIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-4 h-4',
  size = 16,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9.5" />
    <path
      d="M12 6.5L13.4 10.6L17.5 12L13.4 13.4L12 17.5L10.6 13.4L6.5 12L10.6 10.6Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
)

interface RewardsAndWalletTabProps {
  type: 'rewards' | 'currency'
  profile: any
}

export const RewardsAndWalletTab: React.FC<RewardsAndWalletTabProps> = ({
  type,
  profile,
}) => {
  const isRewards = type === 'rewards'
  const { currency, exchangeRate } = useCurrency()

  const [loading, setLoading] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [toywardsData, setToywardsData] = useState<{
    rewardBalance: number
    totalEarned: number
    totalRedeemed: number
    pendingBalance: number
    expiringBalance: number
    maxCap: number
    transactions: any[]
  }>({
    rewardBalance: Number(profile?.reward_balance || 0),
    totalEarned: Number(profile?.reward_balance || 0),
    totalRedeemed: 0,
    pendingBalance: 0,
    expiringBalance: 0,
    maxCap: 500,
    transactions: [],
  })

  // Load live reward activity data for authenticated profile
  useEffect(() => {
    if (isRewards && profile?.id) {
      setLoading(true)
      getToywardsDataAction(profile.id)
        .then((res) => {
          if (res.success) {
            setToywardsData({
              rewardBalance: res.rewardBalance || 0,
              totalEarned: res.totalEarned || 0,
              totalRedeemed: res.totalRedeemed || 0,
              pendingBalance: 0,
              expiringBalance: 0,
              maxCap: res.maxCap || 500,
              transactions: res.transactions || [],
            })
          }
        })
        .catch((err) => console.warn('Could not load rewards data:', err))
        .finally(() => setLoading(false))
    }
  }, [isRewards, profile?.id])

  const balanceUsd = isRewards
    ? toywardsData.rewardBalance
    : Number(profile?.wallet_balance || 0)

  const balanceInr = Math.round(balanceUsd * (exchangeRate || 95.0))
  const currencySymbol = currency === 'INR' ? '₹' : '$'
  const displayAmount =
    currency === 'INR'
      ? `${balanceInr.toFixed(2)}`
      : `${balanceUsd.toFixed(2)}`

  const pendingFormatted = `${currencySymbol}0.00`
  const expiringFormatted = `${currencySymbol}0.00`

  return (
    <div className="space-y-8 animate-in fade-in duration-150 font-sans select-none max-w-4xl">
      
      {/* 1. Header Section (Exact Screenshot Typography & Spacing) */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          {isRewards ? 'Epic rewards' : 'In-game currency / Wallet'}
        </h1>
        <p className="text-sm sm:text-[15px] text-zinc-400 mt-2 leading-relaxed max-w-3xl">
          {isRewards ? (
            <>
              Earn up to 20% back on purchases using Epic's payment system. Plus, enjoy instant rewards
              for virtual currency and subscriptions.{' '}
              <Link
                href="/features/toywards"
                className="text-white underline hover:text-[#FA742B] transition-colors inline-block"
              >
                Learn More.
              </Link>
            </>
          ) : (
            'Store balance and wallet credits available for instant digital purchases and subscription billing.'
          )}
        </p>
      </div>

      {/* 2. Balance Section */}
      <div className="pt-2">
        <h2 className="text-xl font-bold text-white tracking-tight">
          {isRewards ? 'Epic Rewards Balance' : 'Current Balance'}
        </h2>

        {/* Large Clean Balance Display */}
        <div className="mt-3">
          <span className="text-5xl sm:text-6xl font-bold text-white tracking-tight font-sans">
            {currencySymbol}
            {displayAmount}
          </span>
        </div>

        {/* Pending & Expiring Badges / Status Pills (Exact Match) */}
        <div className="flex items-center gap-3 flex-wrap mt-5">
          
          {/* Pending Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveTooltip(activeTooltip === 'pending' ? null : 'pending')
              }
              onMouseEnter={() => setActiveTooltip('pending')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="inline-flex items-center gap-1.5 bg-[#181818] hover:bg-[#202020] border border-[#282828] hover:border-[#383838] px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>
                +{pendingFormatted} pending
              </span>
            </button>

            {activeTooltip === 'pending' && (
              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-[#242424] border border-[#383838] rounded-xl text-xs text-zinc-200 shadow-2xl z-20 animate-in fade-in zoom-in-95">
                Pending rewards are credited to your account balance 14 days after purchase completion.
              </div>
            )}
          </div>

          {/* Expiring Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveTooltip(activeTooltip === 'expiring' ? null : 'expiring')
              }
              onMouseEnter={() => setActiveTooltip('expiring')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="inline-flex items-center gap-1.5 bg-[#181818] hover:bg-[#202020] border border-[#282828] hover:border-[#383838] px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>
                {expiringFormatted} expiring
              </span>
            </button>

            {activeTooltip === 'expiring' && (
              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-[#242424] border border-[#383838] rounded-xl text-xs text-zinc-200 shadow-2xl z-20 animate-in fade-in zoom-in-95">
                Rewards expire 25 months after the date they were granted if left unused.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3. Empty State / Activity History Section (Exact Screenshot Match) */}
      <div className="pt-2">
        {loading ? (
          <div className="bg-[#181818] border border-[#242424] rounded-2xl min-h-[260px] flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-7 h-7 border-2 border-zinc-600 border-t-[#FA742B] rounded-full animate-spin" />
            <span className="text-xs text-zinc-400">Loading rewards history...</span>
          </div>
        ) : toywardsData.transactions.length === 0 ? (
          /* Exact 1:1 Empty State Box From Screenshot */
          <div className="bg-[#181818] border border-[#242424] rounded-2xl min-h-[260px] sm:min-h-[300px] flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-3">
            <div className="w-12 h-12 flex items-center justify-center text-zinc-400">
              <AlertCircle className="w-10 h-10 stroke-[1.5] text-zinc-400" />
            </div>
            <p className="text-sm sm:text-[15px] font-semibold text-zinc-400 max-w-lg leading-normal">
              {isRewards
                ? 'No transactions have been completed that are eligible for Epic Rewards'
                : 'No transactions have been completed for wallet currency'}
            </p>
          </div>
        ) : (
          /* Completed Transactions Table */
          <div className="bg-[#181818] border border-[#242424] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <h3 className="text-base font-bold text-white">
                Rewards Activity History
              </h3>
              <Link
                href="/store"
                className="text-xs font-bold text-[#FA742B] hover:text-[#ff9960] flex items-center gap-1 transition-colors"
              >
                <span>Browse Store</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-[#242424]">
              {toywardsData.transactions.map((tx: any) => {
                const isEarned = tx.type === 'earned' || tx.type === 'bonus'
                const amountFormatted = Number(tx.amount || 0).toFixed(2)
                const dateFormatted = tx.created_at
                  ? new Date(tx.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recent'

                return (
                  <div
                    key={tx.id || Math.random()}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-[#FA742B] shrink-0">
                        <EpicRewardsIcon size={16} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                          {tx.description || (isEarned ? 'Earned from Store Purchase' : 'Redeemed at Checkout')}
                        </span>
                        <span className="text-[11px] text-zinc-500 block">
                          {dateFormatted} {tx.order_number ? `• Order #${tx.order_number}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs sm:text-sm font-bold block ${
                          isEarned ? 'text-emerald-400' : 'text-zinc-300'
                        }`}
                      >
                        {isEarned ? `+${currencySymbol}${amountFormatted}` : `-${currencySymbol}${amountFormatted}`}
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                        {tx.status || 'Completed'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
