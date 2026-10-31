import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'
import {
  ArrowLeft,
  Zap,
  Globe,
  Clock,
  ShieldCheck,
  Mail,
  DownloadCloud,
  KeyRound,
  FileCheck,
} from 'lucide-react'

export const metadata: Metadata = generatePageMetadata({
  title: 'Shipping & Delivery Policy (Digital Products) — Producer Toy',
  description:
    'Instant digital delivery policy for Producer Toy VST plugins, audio software, and sound kits. 0-day handling time, 0-day transit time, and free worldwide electronic fulfillment.',
  path: '/shipping-policy',
  keywords: [
    'Producer Toy shipping policy',
    'Digital delivery policy',
    'Instant download software',
    'VST plugin license delivery',
    'Zero shipping fee digital goods',
  ],
})

export default function ShippingPolicyPage() {
  return (
    <div className="w-full min-h-screen bg-[#121212] text-white py-12 sm:py-16 px-4 sm:px-8 lg:px-12 font-sans selection:bg-white/20">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* ========================================================================= */}
        {/* TOP BAR & BACK NAVIGATION                                                 */}
        {/* ========================================================================= */}
        <div className="space-y-4 pb-6 border-b border-[#26262b]">
          <Link
            href="/"
            prefetch={true}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Store</span>
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 bg-[#202024] border border-[#34363d] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm mb-3 text-zinc-200">
              <DownloadCloud size={14} className="text-zinc-300" />
              <span>Fulfillment &amp; Electronic Dispatch</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Shipping &amp; Delivery Policy
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              Transparent terms regarding order fulfillment, delivery timeframes, zero shipping costs, and 24/7 digital software access.
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Last updated: October 2026 • Producer Toy Store (India Operations &amp; Global Distribution)
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HIGHLIGHT ALERT BOX                                                       */}
        {/* ========================================================================= */}
        <div className="bg-[#161618] border border-[#2a2a2e] border-l-4 border-l-[#34363d] rounded-2xl p-6 sm:p-7 space-y-3 shadow-xl">
          <div className="flex items-center gap-2.5 text-zinc-100 font-bold text-sm sm:text-base">
            <Zap size={19} className="text-zinc-300 flex-shrink-0" />
            <span>100% Instant Digital Delivery — Free Worldwide Fulfillment ($0.00 Shipping Cost)</span>
          </div>
          <p className="leading-relaxed text-xs sm:text-sm text-zinc-400">
            Producer Toy exclusively sells digital software products (VST/AU audio plugins, virtual instruments, and sound kits). We do not ship physical packages or boxed discs. Delivery is completed electronically and immediately upon payment confirmation.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CONTENT SECTIONS                                                          */}
        {/* ========================================================================= */}
        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          
          {/* Section 1: Delivery Coverage & Costs Table */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <Globe size={18} className="text-zinc-300" />
              <span>1. Delivery Coverage &amp; Shipping Specifications</span>
            </h2>
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-xs text-left border border-[#26262b] rounded-xl overflow-hidden">
                <thead className="bg-[#1c1d22] text-zinc-200 border-b border-[#26262b]">
                  <tr>
                    <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Attribute</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Specification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26262b] text-zinc-400">
                  <tr className="hover:bg-[#1a1b20] transition-colors">
                    <td className="p-3.5 font-semibold text-zinc-200">Delivery Method</td>
                    <td className="p-3.5">Electronic Dispatch (High-Speed Cloud CDN Download &amp; Serial Key Licensing)</td>
                  </tr>
                  <tr className="hover:bg-[#1a1b20] transition-colors">
                    <td className="p-3.5 font-semibold text-zinc-200">Shipping Cost</td>
                    <td className="p-3.5 font-bold text-white">$0.00 USD / Free Worldwide</td>
                  </tr>
                  <tr className="hover:bg-[#1a1b20] transition-colors">
                    <td className="p-3.5 font-semibold text-zinc-200">Delivery Coverage</td>
                    <td className="p-3.5">Worldwide (United States, India, United Kingdom, Canada, Australia, European Union, and international regions)</td>
                  </tr>
                  <tr className="hover:bg-[#1a1b20] transition-colors">
                    <td className="p-3.5 font-semibold text-zinc-200">Handling Time</td>
                    <td className="p-3.5 font-semibold text-zinc-200">0 Business Days (Instant automated 24/7 delivery)</td>
                  </tr>
                  <tr className="hover:bg-[#1a1b20] transition-colors">
                    <td className="p-3.5 font-semibold text-zinc-200">Transit / Download Time</td>
                    <td className="p-3.5 font-semibold text-zinc-200">0 Business Days (Instant access immediately after payment)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: How You Receive Your Purchase */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <Clock size={18} className="text-zinc-300" />
              <span>2. How Delivery Works (Step-by-Step)</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Upon successful payment via our secure payment gateway (Razorpay or PayPal):
            </p>
            <div className="space-y-3 pt-1">
              <div className="bg-[#1b1b1e] border border-[#2a2a30] rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs uppercase tracking-wider">
                  <DownloadCloud size={14} className="text-zinc-300" />
                  <span>1. Immediate On-Screen Download</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400">You are instantly redirected to the Order Success page where direct installer download links and software license keys are displayed on screen.</p>
              </div>

              <div className="bg-[#1b1b1e] border border-[#2a2a30] rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs uppercase tracking-wider">
                  <KeyRound size={14} className="text-zinc-300" />
                  <span>2. 24/7 Account User Library</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400">All purchased plugins and soundware are permanently bound to your Producer Toy account. You can re-download files, check version updates, and retrieve activation licenses at any time from your <Link href="/library" className="text-zinc-200 hover:text-white underline underline-offset-2">User Library</Link>.</p>
              </div>

              <div className="bg-[#1b1b1e] border border-[#2a2a30] rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs uppercase tracking-wider">
                  <FileCheck size={14} className="text-zinc-300" />
                  <span>3. Automated Email Confirmation</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400">A tax receipt containing your complete order details, serial keys, and download mirrors is simultaneously dispatched to your registered billing email address within 1–5 minutes.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Pre-Orders & Coming Soon Products */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-zinc-300" />
              <span>3. Pre-Orders &amp; Coming Soon Products</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              For products designated as <strong className="text-zinc-200">Pre-Order</strong> or <strong className="text-zinc-200">Coming Soon</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-400 pt-1">
              <li>
                The scheduled release date is clearly displayed on the product page and embedded in feed metadata.
              </li>
              <li>
                Upon official release, the full installation packages and perpetual license keys are immediately unlocked in your User Library and emailed to your registered address.
              </li>
            </ul>
          </section>

          {/* Section 4: Support & Missing Delivery */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <Mail size={18} className="text-zinc-300" />
              <span>4. Support &amp; Delivery Assistance</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              If your confirmation email was delayed or redirected by your email provider&apos;s spam filter, you can retrieve your order at any time:
            </p>
            <div className="bg-[#1b1b1e] border border-[#2a2a30] rounded-xl p-4 sm:p-5 space-y-2 text-xs text-zinc-400 mt-2">
              <p><strong className="text-zinc-200">Direct Library Access:</strong> <Link href="/library" className="text-zinc-200 hover:text-white underline underline-offset-2">producertoy.com/library</Link></p>
              <p><strong className="text-zinc-200">Email Support:</strong> <a href="mailto:support@producertoy.com" className="text-zinc-200 hover:text-white underline underline-offset-2 font-semibold">support@producertoy.com</a></p>
              <p><strong className="text-zinc-200">Help Desk &amp; Tickets:</strong> <Link href="/support?tab=raise-ticket" className="text-zinc-200 hover:text-white underline underline-offset-2">Raise Support Ticket</Link></p>
              <p><strong className="text-zinc-200">Support SLA:</strong> All delivery inquiries are acknowledged within 24 hours and resolved within 24–48 business hours.</p>
            </div>
          </section>

        </div>

        {/* ========================================================================= */}
        {/* RELATED POLICIES FOOTER NAVIGATION                                       */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-[#26262b] flex flex-wrap gap-4 text-xs text-zinc-400 font-medium">
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <span className="text-zinc-600">•</span>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span className="text-zinc-600">•</span>
          <Link href="/refund-policy" className="hover:text-white transition-colors">Refund &amp; Cancellation</Link>
          <span className="text-zinc-600">•</span>
          <Link href="/eula" className="hover:text-white transition-colors">EULA Agreement</Link>
          <span className="text-zinc-600">•</span>
          <Link href="/purchase-policy" className="hover:text-white transition-colors">Purchase Policy</Link>
          <span className="text-zinc-600">•</span>
          <Link href="/contact" className="hover:text-white transition-colors">Contact &amp; Grievance</Link>
        </div>

      </div>
    </div>
  )
}
