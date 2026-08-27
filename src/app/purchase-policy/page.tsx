import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = generatePageMetadata({
  title: 'Purchase Policy & Digital Fulfillment — Producer Toy',
  description:
    'Complete Purchase Policy, Accepted Payment Methods, Instant Digital Delivery, Toywards Redemption, and Taxation Terms for Producer Toy Store.',
  path: '/purchase-policy',
  keywords: [
    'Producer Toy purchase policy',
    'Payment methods',
    'Instant digital delivery terms',
    'Music producer store policy',
  ],
})

export default function PurchasePolicyPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white py-14 px-6 sm:px-10 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-10 font-sans">
        
        {/* Back Link & Minimal Header */}
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Purchase Policy
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Last updated: February 2026 • Producer Toy Store (India Operations & Global Gateway)
            </p>
          </div>
        </div>

        {/* Minimalist Content Body */}
        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              1. Accepted Payment Methods & Processing
            </h2>
            <p className="text-zinc-400">
              Producer Toy partners with PCI-DSS Level 1 compliant payment gateways to provide secure, encrypted checkout for digital audio assets. We accept:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li><strong className="text-zinc-200">Domestic (India):</strong> Unified Payments Interface (UPI via Google Pay, PhonePe, Paytm, BHIM, CRED), RuPay, Visa, Mastercard, NetBanking across all major Indian banks, and approved Wallets.</li>
              <li><strong className="text-zinc-200">International:</strong> PayPal, Visa, Mastercard, American Express, Apple Pay, and Google Pay.</li>
            </ul>
            <p className="text-zinc-400">
              All payment transactions are encrypted using 256-bit SSL protocols. Producer Toy does not store, process, or view sensitive credit card numbers or banking passwords.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              2. Instant Digital Fulfillment & Delivery
            </h2>
            <p className="text-zinc-400">
              All products sold on Producer Toy are digital goods. Upon successful payment verification:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li><strong className="text-zinc-200">Instant Vault Activation:</strong> Download links and license keys are automatically attached to your personal Producer Toy Account Library.</li>
              <li><strong className="text-zinc-200">Email Confirmation:</strong> An itemized tax receipt and order confirmation containing secure direct download links will be emailed to your billing email address.</li>
              <li><strong className="text-zinc-200">No Physical Shipping:</strong> No physical discs, packaging, or USB flash drives are dispatched.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Currency & Transparent Taxation
            </h2>
            <p className="text-zinc-400">
              Prices on Producer Toy are listed in <strong>Indian Rupees (INR ₹)</strong> for Indian customers and <strong>US Dollars (USD $)</strong> for international buyers.
            </p>
            <p className="text-zinc-400">
              Applicable Goods and Services Tax (GST 18%) or international VAT is itemized clearly in the order summary before payment completion. Creator codes, store coupons, and Toywards are automatically calculated in real-time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              4. Final Sale & Refund Policy
            </h2>
            <p className="text-zinc-400">
              Due to the non-tangible, irrevocable nature of digital soundware and software licenses, all completed purchases are final. Please review our official{' '}
              <Link href="/refund-policy" className="text-zinc-200 hover:underline font-semibold">
                Store Refund Policy
              </Link>{' '}
              for full details.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Customer Support & Billing Inquiries
            </h2>
            <p className="text-zinc-400">
              For any questions regarding invoices, billing statements, or download assistance, please reach out to our support team at{' '}
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
