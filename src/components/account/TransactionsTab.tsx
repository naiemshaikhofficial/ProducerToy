'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { History, Package, Download, ExternalLink, ChevronRight, Gift } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface TransactionsTabProps {
  user: any
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ user }) => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setOrders(data)
        }
      } catch (err) {
        console.warn('Error loading orders:', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-[#202020] rounded-lg" />
        <div className="h-24 bg-[#181818] rounded-2xl" />
        <div className="h-24 bg-[#181818] rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Transactions
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          View your order history, invoices, and purchase receipts.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#181818] border border-[#242424] p-8 rounded-2xl text-center space-y-3">
          <History className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">
            No purchases or transactions found.
          </p>
          <Link
            href="/store"
            className="inline-block bg-[#242424] hover:bg-[#303030] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            Explore Store Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : []
            const hasGifts = items.some((i: any) => i.is_gift || i.gift_recipient_email)
            const isGiftOnly = hasGifts && items.every((i: any) => i.is_gift || i.gift_recipient_email)
            const dateFormatted = new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })

            return (
              <div
                key={order.id}
                className="bg-[#181818] border border-[#242424] p-5 rounded-2xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242424] pb-3">
                  <div>
                    <span className="text-xs font-mono text-zinc-400 block">
                      Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-500">{dateFormatted}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">
                      {order.currency === 'INR' ? '₹' : '$'}
                      {Number(order.total_amount || 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-[#1e281e] text-green-400 border border-[#2e442e]">
                      {order.payment_status || 'Paid'}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-1.5 pt-1">
                  {items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-zinc-300">
                      <span className="font-medium truncate max-w-sm flex items-center gap-1.5">
                        <span>{item.name || item.title || 'Digital Sound Product'}</span>
                        {(item.is_gift || item.gift_recipient_email) && (
                          <span className="text-[10px] text-[#FA742B] font-bold inline-flex items-center gap-0.5">
                            <Gift className="w-3 h-3" />
                            <span>Gift {item.gift_recipient_email ? `to ${item.gift_recipient_email}` : ''}</span>
                          </span>
                        )}
                      </span>
                      <span className="text-zinc-400">
                        {order.currency === 'INR' ? '₹' : '$'}
                        {Number(item.price || item.price_inr || item.price_usd || item.unit_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-[#242424]">
                  {isGiftOnly ? (
                    <Link
                      href="/gifts"
                      className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5 text-[#FA742B]" />
                      <span>View in Gifts</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href="/library"
                      className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>View in Library</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
