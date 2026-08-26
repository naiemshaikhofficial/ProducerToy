'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, Coins, Gift, ArrowUpRight } from 'lucide-react'
import { ToywardsIcon } from '@/components/ui/ToywardsIcon'

interface RewardsAndWalletTabProps {
  type: 'rewards' | 'currency'
  profile: any
}

export const RewardsAndWalletTab: React.FC<RewardsAndWalletTabProps> = ({
  type,
  profile,
}) => {
  const isRewards = type === 'rewards'
  const balance = isRewards
    ? Number(profile?.reward_balance || 0).toFixed(2)
    : Number(profile?.wallet_balance || 0).toFixed(2)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          {isRewards && <ToywardsIcon size={28} />}
          <span>{isRewards ? 'Toywards' : 'Account Balance / Wallet'}</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          {isRewards
            ? 'Earn 5% back on every eligible purchase to spend on your next plugin or sound kit.'
            : 'Your available store credits for instant checkout.'}
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-[#181818] border border-[#242424] p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#242424] flex items-center justify-center border border-[#333333]">
            {isRewards ? (
              <ToywardsIcon size={24} />
            ) : (
              <Coins className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
              {isRewards ? 'Available Rewards Balance' : 'Current Wallet Credit'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white">
              ${balance} USD
            </span>
          </div>
        </div>

        <Link
          href="/store"
          className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-5 py-3 rounded-xl uppercase tracking-wider transition-all shadow-md active:scale-95 text-center"
        >
          Use in Store
        </Link>
      </div>

      {/* Info Perks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#161616] border border-[#222222] p-4 rounded-xl space-y-1.5">
          <span className="text-sm font-bold text-white block">
            {isRewards ? '5% Cashback on Every Order' : 'Instant 1-Click Checkout'}
          </span>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {isRewards
              ? 'Rewards are automatically credited to your account 14 days after purchase.'
              : 'Apply your wallet balance at checkout for instant order completion.'}
          </p>
        </div>

        <div className="bg-[#161616] border border-[#222222] p-4 rounded-xl space-y-1.5">
          <span className="text-sm font-bold text-white block">
            No Expiration
          </span>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your earned credits and loyalty points never expire as long as your account remains active.
          </p>
        </div>
      </div>
    </div>
  )
}
