'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Coins,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react'
import { ToywardsIcon } from '@/components/ui/ToywardsIcon'
import { getToywardsDataAction } from '@/actions/accountActions'
import { useCurrency } from '@/context/CurrencyContext'

interface RewardsAndWalletTabProps {
  type: 'rewards' | 'currency'
  profile: any
}

export const RewardsAndWalletTab: React.FC<RewardsAndWalletTabProps> = ({
  type,
  profile,
}) => {
  const isRewards = type === 'rewards'
  const { currency, exchangeRate, formatPrice } = useCurrency()

  const [loading, setLoading] = useState(false)
  const [toywardsData, setToywardsData] = useState<{
    rewardBalance: number
    totalEarned: number
    totalRedeemed: number
    maxCap: number
    transactions: any[]
  }>({
    rewardBalance: Number(profile?.reward_balance || 0),
    totalEarned: Number(profile?.reward_balance || 0),
    totalRedeemed: 0,
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
              rewardBalance: res.rewardBalance,
              totalEarned: res.totalEarned,
              totalRedeemed: res.totalRedeemed,
              maxCap: res.maxCap || 500,
              transactions: res.transactions || [],
            })
          }
        })
        .catch((err) => console.warn('Could not load toywards data:', err))
        .finally(() => setLoading(false))
    }
  }, [isRewards, profile?.id])

  const balanceUsd = isRewards
    ? toywardsData.rewardBalance
    : Number(profile?.wallet_balance || 0)

  const balanceInr = Math.round(balanceUsd * (exchangeRate || 95.0))
  const maxCapUsd = toywardsData.maxCap || 500
  const capPercentage = Math.min(100, Math.round((balanceUsd / maxCapUsd) * 100))

  return (
    <div className="space-y-8 animate-in fade-in duration-150 font-sans">
      
      {/* Header Title */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          {isRewards && <ToywardsIcon size={32} />}
          <span>{isRewards ? 'Toywards' : 'Account Balance / Wallet'}</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-1.5 leading-relaxed max-w-2xl">
          {isRewards
            ? 'Earn 5% (up to 20%) back on every Producer Toy Store purchase. Spend your balance directly at checkout on plugins, sample packs, and sound kits.'
            : 'Your available store credits for instant 1-click checkout and license fulfillment.'}
        </p>
      </div>

      {/* Main Balance Hero Card */}
      <div className="bg-gradient-to-br from-[#1c1c1c] to-[#141414] border border-[#282828] p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FA742B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#242424] border border-[#383838] flex items-center justify-center flex-shrink-0 shadow-lg">
              {isRewards ? (
                <ToywardsIcon size={32} />
              ) : (
                <Coins className="w-8 h-8 text-white" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  {isRewards ? 'Active Rewards Balance' : 'Current Wallet Credit'}
                </span>
                {isRewards && (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold bg-[#26150b] text-[#FA742B] border border-[#4a2412] px-2.5 py-0.5 rounded-full">
                    5% - 20% Back
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  ${balanceUsd.toFixed(2)} <span className="text-xl sm:text-2xl text-zinc-400 font-bold">USD</span>
                </span>
                {currency === 'INR' && (
                  <span className="text-base sm:text-lg font-bold text-[#FA742B]">
                    ≈ ₹{balanceInr.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/store"
              prefetch={true}
              className="bg-white hover:bg-zinc-200 text-black font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              <span>Spend in Store</span>
            </Link>

            {isRewards && (
              <Link
                href="/features/toywards"
                prefetch={true}
                className="bg-[#242424] hover:bg-[#2e2e2e] text-zinc-200 hover:text-white border border-[#333333] font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span>Program Details</span>
                <ExternalLink size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* EULA Cap Progress Meter (Only for Toywards per EULA Section 11.2) */}
        {isRewards && (
          <div className="mt-8 pt-6 border-t border-[#262626] space-y-3 relative z-10">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="text-zinc-300 flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#FA742B]" />
                <span>Program Maximum Cap ($500.00 USD Limit)</span>
              </span>
              <span className="text-zinc-400">
                <strong className="text-white font-bold">${balanceUsd.toFixed(2)}</strong> / ${maxCapUsd.toFixed(2)}
              </span>
            </div>

            {/* Visual Cap Bar */}
            <div className="w-full h-2.5 bg-[#121212] rounded-full overflow-hidden border border-[#2b2b2b] relative">
              <div
                className="h-full bg-gradient-to-r from-[#FA742B] to-[#ff9960] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, capPercentage)}%` }}
              />
            </div>
            
            <p className="text-[11.5px] text-zinc-400 leading-relaxed">
              Per EULA Section 11.2, your Toywards balance is capped at $500 USD (or local currency equivalent). Earned rewards above this limit are saved when you spend your balance.
            </p>
          </div>
        )}
      </div>

      {/* Program Terms & Benefits Grid */}
      {isRewards && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: 25-Month Validity */}
          <div className="bg-[#161616] border border-[#242424] p-5 rounded-2xl space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#222222] border border-[#303030] flex items-center justify-center text-[#FA742B]">
                <Clock size={18} />
              </div>
              <span className="text-sm font-bold text-white block">
                25-Month Validity
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Toywards expire 25 months from the grant date, giving you over 2 full years to build rewards for big plugin bundles.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-zinc-500 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>First-in, first-out redemption</span>
            </div>
          </div>

          {/* Card 2: 5% - 20% Earning Rate */}
          <div className="bg-[#161616] border border-[#242424] p-5 rounded-2xl space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#222222] border border-[#303030] flex items-center justify-center text-[#FA742B]">
                <Percent size={18} />
              </div>
              <span className="text-sm font-bold text-white block">
                5% to 20% Cash Back
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Earn a guaranteed 5% back on all catalog items, and up to 20% back during special featured releases and originals.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-zinc-500 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>Automatic instant enrollment</span>
            </div>
          </div>

          {/* Card 3: Combined with Coupons */}
          <div className="bg-[#161616] border border-[#242424] p-5 rounded-2xl space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#222222] border border-[#303030] flex items-center justify-center text-[#FA742B]">
                <TrendingUp size={18} />
              </div>
              <span className="text-sm font-bold text-white block">
                Stack with Store Sales
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Apply your Toywards together with seasonal sales, creator coupons, and bundle deals for maximum savings at checkout.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-zinc-500 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>1-Click checkout apply</span>
            </div>
          </div>

        </div>
      )}

      {/* Toywards Activity History Section */}
      {isRewards && (
        <div className="bg-[#161616] border border-[#242424] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Receipt size={18} className="text-[#FA742B]" />
                <span>Rewards Activity History</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Track your recent Toywards earnings, checkout redemptions, and expiration dates.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-6 h-6 border-2 border-zinc-600 border-t-[#FA742B] rounded-full animate-spin" />
              <span className="text-xs text-zinc-400">Loading Toywards activity...</span>
            </div>
          ) : toywardsData.transactions.length === 0 ? (
            /* Clean Empty State */
            <div className="py-10 px-4 bg-[#1a1a1a] border border-[#262626] rounded-xl flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#222222] border border-[#303030] flex items-center justify-center text-zinc-400">
                <ToywardsIcon size={22} />
              </div>
              <div className="space-y-1 max-w-sm">
                <span className="text-sm font-bold text-white block">
                  No Toywards activity yet
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Whenever you make a purchase on Producer Toy Store, your 5% to 20% cashback will appear right here automatically.
                </p>
              </div>
              <Link
                href="/store"
                className="mt-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs px-5 py-2.5 rounded-lg transition-colors"
              >
                Browse Store &amp; Earn
              </Link>
            </div>
          ) : (
            /* Transactions Table / List */
            <div className="divide-y divide-[#242424] border-t border-b border-[#242424]">
              {toywardsData.transactions.map((tx: any) => {
                const isEarned = tx.type === 'earned' || tx.type === 'bonus'
                const isRedeemed = tx.type === 'redeemed'
                const amountFormatted = Number(tx.amount || 0).toFixed(2)
                const dateFormatted = tx.created_at
                  ? new Date(tx.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recent'

                return (
                  <div key={tx.id || Math.random()} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isEarned ? 'bg-[#26150b] text-[#FA742B]' : 'bg-[#242424] text-zinc-400'
                      }`}>
                        <ToywardsIcon size={16} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                          {tx.description || (isEarned ? 'Earned from Store Purchase' : 'Redeemed at Checkout')}
                        </span>
                        <span className="text-[11px] text-zinc-500 block">
                          {dateFormatted} {tx.order_number ? `• Order ${tx.order_number}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs sm:text-sm font-bold block ${
                        isEarned ? 'text-emerald-400' : 'text-zinc-300'
                      }`}>
                        {isEarned ? `+${amountFormatted}` : `-${amountFormatted}`} USD
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                        {tx.status || (isEarned ? 'Active' : 'Completed')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Program Legal & FAQ Link Card */}
      <div className="bg-[#161616] border border-[#222222] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle size={16} className="text-[#FA742B]" />
            <span>Producer Toy Rewards Terms &amp; End User Agreement</span>
          </span>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Review the complete loyalty program governance in Section 11 of our End User License Agreement (EULA).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/eula"
            target="_blank"
            className="text-xs font-bold text-zinc-300 hover:text-white bg-[#222222] hover:bg-[#2a2a2a] border border-[#303030] px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <span>View EULA</span>
            <ExternalLink size={12} />
          </Link>
          <Link
            href="/features/toywards"
            prefetch={true}
            className="text-xs font-bold text-[#FA742B] hover:text-white bg-[#26150b] hover:bg-[#3d1e10] border border-[#4a2412] px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <span>FAQ &amp; Rules</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

    </div>
  )
}

