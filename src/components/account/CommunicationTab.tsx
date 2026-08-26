'use client'

import React, { useState, useEffect } from 'react'
import { updateCommunicationPreferencesAction } from '@/actions/accountActions'

interface CommunicationTabProps {
  user: any
  profile: any
  maskedEmail: string
}

export const CommunicationTab: React.FC<CommunicationTabProps> = ({
  user,
  profile,
  maskedEmail,
}) => {
  const [promoEmails, setPromoEmails] = useState(true)
  const [orderEmails, setOrderEmails] = useState(true)
  const [rewardEmails, setRewardEmails] = useState(true)
  const [savedMsg, setSavedMsg] = useState(false)

  useEffect(() => {
    if (profile) {
      setPromoEmails(profile.promo_emails ?? true)
      setOrderEmails(profile.order_emails ?? true)
      setRewardEmails(profile.reward_emails ?? true)
    }
  }, [profile])

  const handleToggle = async (key: 'promo' | 'order' | 'reward', val: boolean) => {
    if (!user) return
    let newPromo = promoEmails
    let newOrder = orderEmails
    let newReward = rewardEmails

    if (key === 'promo') {
      setPromoEmails(val)
      newPromo = val
    }
    if (key === 'order') {
      setOrderEmails(val)
      newOrder = val
    }
    if (key === 'reward') {
      setRewardEmails(val)
      newReward = val
    }

    try {
      const res = await updateCommunicationPreferencesAction(user.id, {
        promo_emails: newPromo,
        order_emails: newOrder,
        reward_emails: newReward,
      })
      if (res.success) {
        setSavedMsg(true)
        setTimeout(() => setSavedMsg(false), 2000)
      }
    } catch (err) {
      console.warn('Error saving communication preferences:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Communication preferences
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Choose what updates you want to receive at <span className="text-white font-mono">{maskedEmail}</span>.
          </p>
        </div>
        {savedMsg && (
          <span className="text-xs font-bold text-green-400 bg-[#1e281e] px-3 py-1.5 rounded-lg border border-[#2e442e] animate-in fade-in">
            Preferences Saved
          </span>
        )}
      </div>

      <div className="space-y-4 bg-[#181818] border border-[#242424] p-5 rounded-2xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={promoEmails}
            onChange={(e) => handleToggle('promo', e.target.checked)}
            className="mt-1 w-4 h-4 accent-zinc-200 rounded cursor-pointer"
          />
          <div>
            <span className="text-sm font-bold text-white block">
              Promotional discounts and sales
            </span>
            <span className="text-xs text-zinc-400 block mt-0.5">
              Get notified when plugins and sound packs go on sale or are offered for free.
            </span>
          </div>
        </label>

        <div className="border-t border-[#242424]" />

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={orderEmails}
            onChange={(e) => handleToggle('order', e.target.checked)}
            className="mt-1 w-4 h-4 accent-zinc-200 rounded cursor-pointer"
          />
          <div>
            <span className="text-sm font-bold text-white block">
              Order confirmations & license deliveries
            </span>
            <span className="text-xs text-zinc-400 block mt-0.5">
              Always receive your invoices, serial keys, and download links directly in email.
            </span>
          </div>
        </label>

        <div className="border-t border-[#242424]" />

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={rewardEmails}
            onChange={(e) => handleToggle('reward', e.target.checked)}
            className="mt-1 w-4 h-4 accent-zinc-200 rounded cursor-pointer"
          />
          <div>
            <span className="text-sm font-bold text-white block">
              Epic rewards & loyalty cashback balance
            </span>
            <span className="text-xs text-zinc-400 block mt-0.5">
              Receive monthly statements of your cashback points and store credits.
            </span>
          </div>
        </label>
      </div>
    </div>
  )
}
