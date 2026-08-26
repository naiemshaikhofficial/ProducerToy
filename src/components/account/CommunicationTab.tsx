'use client'

import React, { useState } from 'react'

interface CommunicationTabProps {
  maskedEmail: string
}

export const CommunicationTab: React.FC<CommunicationTabProps> = ({
  maskedEmail,
}) => {
  const [promoEmails, setPromoEmails] = useState(true)
  const [orderEmails, setOrderEmails] = useState(true)
  const [rewardEmails, setRewardEmails] = useState(true)

  return (
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
            onChange={(e) => setOrderEmails(e.target.checked)}
            className="mt-1 w-4 h-4 accent-zinc-200 rounded"
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
            onChange={(e) => setRewardEmails(e.target.checked)}
            className="mt-1 w-4 h-4 accent-zinc-200 rounded"
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
