import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signDownloadToken } from '@/lib/security'
import { Download, Key, Package, ShieldCheck, ArrowRight } from 'lucide-react'
import { BillingHistory } from '@/components/BillingHistory'

export const dynamic = 'force-dynamic'

export default async function MyPurchasesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch purchases with joined products
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, products(*)')
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* Header */}
      <div className="border-b border-[#24242e] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">My Purchases & Serial Keys</h1>
          <p className="text-xs text-zinc-400 font-mono">
            Account Email: {user.email}
          </p>
        </div>

        <div className="bg-[#1c1c24] text-white px-3 py-1 text-xs font-mono font-bold uppercase border border-[#2c2c3a] rounded-lg">
          {purchases?.length || 0} Products Owned
        </div>
      </div>

      {/* Purchases List */}
      {!purchases || purchases.length === 0 ? (
        <div className="text-center py-20 px-6 bg-[#161616] border border-[#262626] rounded-2xl space-y-4 max-w-xl mx-auto my-6 shadow-2xl flex flex-col items-center">
          <div className="w-14 h-14 bg-[#202020] border border-[#2e2e2e] rounded-full flex items-center justify-center mb-1">
            <Package className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">No Purchases Found</h3>
          <p className="text-xs text-zinc-400">
            You haven&apos;t purchased any VST plugins, preset banks, or sample packs yet.
          </p>
          <div className="pt-2 w-full">
            <Link href="/store" prefetch={true} className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3.5 px-6 rounded-full inline-block uppercase tracking-wider transition-all shadow-lg">
              Browse Audio Tools
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((item: any) => {
            const product = item.products
            if (!product) return null

            // Generate secure HMAC-SHA256 download token for this product
            const token = signDownloadToken({
              uid: user.id,
              pid: product.id,
              type: product.product_type,
              ip: '127.0.0.1'
            }, 600) // 10 min token

            const secureDownloadUrl = `/api/download/${product.id}?token=${token}`

            return (
              <div
                key={item.id}
                className="bg-[#141418] border border-[#24242e] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
              >
                {/* Product Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-16 h-16 bg-[#1c1c24] border border-[#2c2c3a] rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product.cover_image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#1c1c24] text-white text-[9px] font-mono px-2 py-0.5 rounded border border-[#2c2c3a] uppercase">
                        {product.product_type}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        Purchased {new Date(item.purchased_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white mt-1 line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-xs font-mono text-zinc-400">
                      {product.brand} • {product.vst_format || 'Digital Download'}
                    </p>
                  </div>
                </div>

                {/* Serial Key & Download Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  
                  {/* Serial Key Box */}
                  {item.serial_key && (
                    <div className="bg-[#1c1c24] border border-[#2c2c3a] rounded-lg p-2 flex items-center gap-2 font-mono text-xs">
                      <Key className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-400 uppercase">Serial Key</span>
                        <span className="font-bold text-white tracking-wider select-all">{item.serial_key}</span>
                      </div>
                    </div>
                  )}

                  {/* Direct Encrypted Download */}
                  <a
                    href={secureDownloadUrl}
                    download
                    className="bg-white hover:bg-zinc-200 text-black rounded-lg text-xs py-3 px-5 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </a>

                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Official Billing & EULA License Receipts Section */}
      {purchases && purchases.length > 0 && (
        <BillingHistory
          purchases={purchases as any}
          userEmail={user.email || ''}
          userName={user.user_metadata?.full_name || user.user_metadata?.name}
        />
      )}

    </div>
  )
}
