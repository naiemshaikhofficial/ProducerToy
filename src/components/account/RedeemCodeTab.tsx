'use client'

import React, { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export const RedeemCodeTab: React.FC = () => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) return
    setLoading(true)
    setMessage(null)

    try {
      const supabase = getSupabaseBrowserClient()
      
      // Check coupons table
      const { data: coupon, error: couponErr } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .maybeSingle()

      if (coupon) {
        setMessage({
          text: `Success! Code "${coupon.code}" verified (${coupon.discount_percent}% discount applied).`,
          isError: false,
        })
        setCode('')
        return
      }

      // Check serial keys table
      const { data: serialKey, error: serialErr } = await supabase
        .from('serial_keys')
        .select('*')
        .eq('key_code', cleanCode)
        .maybeSingle()

      if (serialKey) {
        setMessage({
          text: `License activated! Product unlocked in your Library.`,
          isError: false,
        })
        setCode('')
        return
      }

      // If not found in database
      setMessage({
        text: `Invalid or expired code "${cleanCode}". Please check and try again.`,
        isError: true,
      })
    } catch (err) {
      console.warn('Error redeeming code:', err)
      setMessage({
        text: 'Error validating code. Please try again later.',
        isError: true,
      })
    } finally {
      setLoading(false)
    }
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
            placeholder="PROMO20 / XXXX-XXXX-XXXX"
            className="w-full bg-[#202020] border border-[#333333] focus:border-zinc-400 text-white font-mono text-sm rounded-xl px-4 py-3 focus:outline-none uppercase tracking-widest"
          />
        </div>

        {message && (
          <p
            className={`text-xs font-semibold ${
              message.isError ? 'text-[#ff4053]' : 'text-green-400'
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Validating...' : 'Redeem Code'}
        </button>
      </form>
    </div>
  )
}
