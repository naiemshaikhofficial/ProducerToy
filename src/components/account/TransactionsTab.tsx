'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { History, ChevronRight, RotateCw } from 'lucide-react'
import { getUserTransactionsAction } from '@/actions/accountActions'
import { BillingHistory } from '@/components/BillingHistory'

interface TransactionsTabProps {
  user: any
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ user }) => {
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await getUserTransactionsAction(user.id)
      if (res.success) {
        setPurchases(res.purchases || [])
      }
    } catch (err) {
      console.warn('Error loading transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-[#202020] rounded-lg" />
        <div className="h-32 bg-[#181818] rounded-2xl border border-[#242424]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Transactions &amp; Invoices
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            View your verified purchase history, GST tax invoices, and commercial license certificates.
          </p>
        </div>

        <button
          onClick={loadData}
          title="Refresh Transactions"
          className="p-2 rounded-xl bg-[#1c1c1e] hover:bg-[#28282b] text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {purchases.length === 0 ? (
        <div className="bg-[#181818] border border-[#242424] p-10 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#222222] border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
            <History className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Purchases or Transactions Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Any products, sample packs, or VST plugins you purchase will automatically show up here with download links and official tax invoices.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 bg-[#FC6301] hover:bg-[#e05700] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              <span>Explore Store Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <BillingHistory
          purchases={purchases}
          userEmail={user?.email}
          userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
          showHeader={false}
        />
      )}
    </div>
  )
}
