'use client'

import React, { useState } from 'react'
import { ButtonSpinner } from '@/components/ui/ButtonSpinner'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { redeemLicenseCodeAction } from '@/actions/accountActions'

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
      const res = await redeemLicenseCodeAction(cleanCode)
      setMessage({
        text: res.message,
        isError: !res.success,
      })
      if (res.success) {
        setCode('')
      }
    } catch (err) {
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
        <div className="space-y-1">
          <label className="text-[12px] font-semibold text-zinc-300 block">
            Code or Serial Key
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="PROMO20 / XXXX-XXXX-XXXX"
            className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white font-mono text-[13px] rounded-md px-3.5 outline-none transition-colors uppercase tracking-widest shadow-sm"
          />
        </div>

        {message && (
          <div
            className={`px-4 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-md ${
              message.isError
                ? 'bg-[#ff4053] text-black'
                : 'bg-[#00df81] text-black'
            }`}
          >
            {message.isError ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-black" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-black" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <ButtonSpinner size={16} variant="dark" /> : <span>Redeem Code</span>}
        </button>
      </form>
    </div>
  )
}
