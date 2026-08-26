import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft, ShoppingBag, CreditCard, ShieldAlert, CheckCircle, RefreshCcw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Purchase Policy | Producer Toy',
  description: 'Official Purchase Policy, Payment Terms, Instant Fulfillment, Taxes, and Digital Delivery Conditions for Producer Toy.',
}

export default function PurchasePolicyPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white py-14 px-6 sm:px-10 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-10 font-sans">
        
        {/* Back Link & Header */}
        <div className="space-y-4 pb-6 border-b border-zinc-800/60">
          <Link
            href="/"
            prefetch={true}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Store
          </Link>

          <div>
            <div className="flex items-center gap-2 text-[#2ed8a7] text-xs font-bold uppercase tracking-wider mb-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Purchase Terms</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Purchase Policy
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Last updated: February 2026 • Producer Toy Store (India Operations & Global Gateway)
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          
          <div className="p-4 bg-[#18181c] border border-[#2a2a2e] rounded-xl text-xs text-zinc-300 leading-relaxed">
            <p className="font-semibold text-white mb-1">DIGITAL GOODS PURCHASING AGREEMENT:</p>
            By placing an order, completing payment, or claiming free digital assets on <strong>Producer Toy</strong>, you certify that you are authorized to use the chosen payment method and agree to the policies outlined below.
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-zinc-400" />
              <span>1. Accepted Payment Methods & Security</span>
            </h2>
            <p className="text-zinc-400">
              Producer Toy accepts secure payments via authorized, PCI-DSS Level 1 compliant payment gateways:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li><strong>India & Domestic:</strong> Unified Payments Interface (UPI via Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa, Mastercard, NetBanking, and Wallets.</li>
              <li><strong>International:</strong> PayPal, Visa, Mastercard, American Express, Apple Pay, and Google Pay.</li>
            </ul>
            <p className="text-zinc-400 pt-1">
              All transactions are encrypted with 256-bit SSL technology. Producer Toy does not store or access your raw credit card numbers or banking passwords.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>2. Instant Digital Fulfillment & Delivery</span>
            </h2>
            <p className="text-zinc-400">
              Upon successful authorization of your payment:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>Your purchased digital items and license keys are instantly activated in your personal <strong>Producer Toy Account Library</strong>.</li>
              <li>An order confirmation email containing your receipt, download links, and invoice is dispatched immediately to your billing email address.</li>
              <li>No physical media (DVD, USB, Box) will be shipped. All deliveries are strictly electronic.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-zinc-400" />
              <span>3. Currency, Taxes & Pricing Transparency</span>
            </h2>
            <p className="text-zinc-400">
              Prices on Producer Toy are displayed in <strong>INR (₹)</strong> for Indian customers and <strong>USD ($)</strong> for international customers.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>Applicable Goods &amp; Services Tax (GST 18%) or local Value Added Tax (VAT) is clearly detailed in the checkout order summary.</li>
              <li>All discounts, creator codes, bundle savings, and Producer Rewards are calculated transparently before final payment authorization.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>4. Final Sale & Refund Policy Reference</span>
            </h2>
            <p className="text-zinc-400">
              Due to the irrevocable and non-returnable nature of downloadable digital soundware and software licenses, all completed digital sales are final. For full details on non-refundable scenarios, please review our official{' '}
              <Link href="/refund-policy" className="text-zinc-200 hover:underline font-semibold">
                Store Refund Policy
              </Link>.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Customer Support & Billing Assistance
            </h2>
            <p className="text-zinc-400">
              If you experience any billing discrepancies, download interruptions, or license activation questions, our support team is available 24/7 at{' '}
              <a href="mailto:support@producertoy.com" className="text-zinc-200 hover:underline font-semibold">
                support@producertoy.com
              </a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}
