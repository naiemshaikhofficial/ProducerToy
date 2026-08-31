'use client'

import React, { useState } from 'react'
import { Mail, Sparkles, Check } from 'lucide-react'

export function BlogNewsletterCard() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1c] to-[#141414] border border-[#2a2a2a] rounded-[24px] p-8 sm:p-12 shadow-2xl text-center space-y-6">
      {/* Subtle Orange Glow Accents */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#FA742B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#FA742B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#262626] border border-[#333333] text-[11px] font-bold text-[#FA742B] uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Weekly Producer Newsletter</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Get Free VSTs &amp; Mixing Guides Delivered
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
          Join 15,000+ modern music producers receiving our curated weekly sample packs, freeware alerts, and studio tutorials. No spam ever.
        </p>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {subscribed ? (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Thank you for subscribing! Check your inbox soon for free sample packs.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-[#121212] text-white text-xs sm:text-sm pl-11 pr-4 h-[44px] rounded-xl border border-[#333333] focus:border-[#FA742B] focus:outline-none placeholder:text-zinc-500 font-sans transition-colors"
              />
            </div>
            <button
              type="submit"
              className="h-[44px] px-6 rounded-xl bg-[#FA742B] hover:bg-[#e05800] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-[#FA742B]/20 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default BlogNewsletterCard
