'use client'

import React, { useState } from 'react'

export const RedeemCodeTab: React.FC = () => {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setMessage('Code validated! Reward or discount applied to your account.')
    setCode('')
    setTimeout(() => setMessage(null), 4000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Redeem code
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Enter a product activation key, gift card code, or discount voucher.
        </p>
      </div>

      <form
        onSubmit={handleRedeem}
        className="bg-[#181818] border border-[#242424] p-6 rounded-2xl space-y-4 max-w-md"
      >
        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            Code or Serial Key
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="w-full bg-[#202020] border border-[#333333] focus:border-zinc-400 text-white font-mono text-sm rounded-xl px-4 py-3 focus:outline-none uppercase tracking-widest"
          />
        </div>

        {message && (
          <p className="text-xs font-semibold text-green-400">{message}</p>
        )}

        <button
          type="submit"
          className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Redeem Code
        </button>
      </form>
    </div>
  )
}
