import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ArrowLeft, CreditCard, Zap, FileCheck, HelpCircle } from 'lucide-react'

export const metadata: Metadata = generatePageMetadata({
  title: 'Purchase & Payment Policy — Producer Toy',
  description:
    'Complete Purchase Policy, Accepted Payment Methods (UPI, Cards, NetBanking, PayPal), Razorpay Aggregation, and Instant Digital Delivery for Producer Toy.',
  path: '/purchase-policy',
  keywords: [
    'Producer Toy purchase policy',
    'Payment methods',
    'Razorpay payment policy',
    'Instant digital delivery terms',
    'GST tax invoice digital software',
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

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#FA742B] tracking-wider uppercase">
              Billing, Payment &amp; Fulfillment
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Purchase &amp; Payment Policy
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Transparent terms governing order placement, payment processing, tax compliance, and instant digital fulfillment.
            </p>
          </div>
        </div>

        {/* Highlight Alert Box */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5 space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-[#FA742B] font-bold text-sm">
            <Zap size={18} />
            <span>100% Instant Digital Delivery — Zero Physical Shipping Fees</span>
          </div>
          <p className="leading-relaxed text-zinc-400">
            All products listed on Producer Toy are digital audio assets. No physical discs or packages are shipped. Upon successful payment verification by our payment gateway, your serial license keys and download mirrors become accessible in your User Library immediately.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed">
          
          {/* Section 1: Accepted Payment Methods */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <CreditCard size={18} className="text-[#FA742B]" />
              1. Accepted Payment Methods &amp; Gateway Partners
            </h2>
            <p className="text-zinc-400">
              We partner with licensed, PCI-DSS Level 1 compliant payment gateways to offer seamless and secure checkout:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li>
                <strong className="text-zinc-200">Domestic Payments (India / INR ₹):</strong> Processed securely via <strong>Razorpay Payments Private Limited</strong> (RBI Authorised Payment Aggregator). Supported methods include:
                <ul className="list-circle pl-6 space-y-1 pt-1.5 text-zinc-400">
                  <li><strong>Unified Payments Interface (UPI):</strong> Google Pay, PhonePe, Paytm, BHIM, CRED, and all BHIM UPI apps.</li>
                  <li><strong>Debit &amp; Credit Cards:</strong> RuPay, Visa, Mastercard, and American Express.</li>
                  <li><strong>NetBanking:</strong> Across 50+ Indian commercial and retail banks.</li>
                </ul>
              </li>
              <li>
                <strong className="text-zinc-200">International Payments (Global / USD $):</strong> Processed via <strong>PayPal</strong> and global merchant cards with automatic multi-currency conversion.
              </li>
            </ul>
          </section>

          {/* Section 2: Pricing, Currency & Taxation */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileCheck size={18} className="text-[#FA742B]" />
              2. Transparent Pricing, Currency &amp; GST Invoicing
            </h2>
            <p className="text-zinc-400">
              We believe in 100% pricing transparency with zero hidden processing surcharges:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li><strong className="text-zinc-200">Currency Display:</strong> Prices for buyers in India are settled in Indian Rupees (INR ₹) with zero cross-border markup. International transactions are processed in US Dollars (USD $).</li>
              <li><strong className="text-zinc-200">GST Compliance:</strong> All applicable Indian Goods and Services Tax (GST 18%) is itemized on the checkout screen prior to payment confirmation.</li>
              <li><strong className="text-zinc-200">Tax Invoices:</strong> An official itemized GST invoice is generated and automatically dispatched to your billing email address upon order completion.</li>
            </ul>
          </section>

          {/* Section 3: Digital Delivery Protocol */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Digital Delivery Protocol &amp; Lifetime Vault Access
            </h2>
            <p className="text-zinc-400">
              When an order is successfully completed:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li><strong className="text-zinc-200">Immediate Access:</strong> Your download links and license keys are synchronized with your account vault at <Link href="/library" className="text-[#FA742B] hover:underline font-semibold">My Library</Link>.</li>
              <li><strong className="text-zinc-200">Redownload Guarantee:</strong> You may re-download your purchased sample packs and plugins anytime by logging into your account.</li>
              <li><strong className="text-zinc-200">Toywards Loyalty Cash:</strong> Reward points earned on qualifying purchases are credited instantly to your account wallet.</li>
            </ul>
          </section>

          {/* Section 4: Failed Payments & Payment Inquiries */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              4. Payment Declines &amp; Duplicate Debits
            </h2>
            <p className="text-zinc-400">
              In rare instances where a payment is deducted from your bank or card but not recorded by the store:
            </p>
            <p className="text-zinc-400">
              Our payment aggregator initiates an automatic reconciliation. Unsettled debits are refunded to the source account within <strong>5 business days</strong> as per RBI Turnaround Time (TAT) regulations. Please view our{' '}
              <Link href="/refund-policy" className="text-[#FA742B] hover:underline font-semibold">
                Refund Policy
              </Link>{' '}
              for complete details.
            </p>
          </section>

          {/* Section 5: Billing & Support Inquiries */}
          <section className="space-y-3 pt-6 border-t border-zinc-800/60">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <HelpCircle size={18} className="text-[#FA742B]" />
              5. Billing &amp; Order Support
            </h2>
            <p className="text-zinc-400">
              For any questions regarding billing statements, invoice copies, or payment status:
            </p>
            <div className="bg-[#161616] border border-[#242424] rounded-xl p-4 space-y-1.5 text-xs text-zinc-400 mt-2">
              <p><strong className="text-zinc-200">Support Desk:</strong> <Link href="/contact" className="text-[#FA742B] hover:underline font-semibold">Contact Customer Care</Link></p>
              <p><strong className="text-zinc-200">Email:</strong> <a href="mailto:support@producertoy.com" className="text-[#FA742B] hover:underline font-semibold">support@producertoy.com</a></p>
              <p><strong className="text-zinc-200">Operational Hours:</strong> 24/7 Digital Processing • Technical Support Mon–Sat (9:00 AM – 8:00 PM IST)</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
