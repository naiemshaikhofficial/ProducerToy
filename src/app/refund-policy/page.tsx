import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ArrowLeft, RefreshCw, AlertTriangle, ShieldCheck, Clock } from 'lucide-react'

export const metadata: Metadata = generatePageMetadata({
  title: 'Refund & Cancellation Policy — Producer Toy',
  description:
    'Clear Refund, Cancellation, Failed Transaction (RBI TAT), and Corrupted Download replacement policies for Producer Toy digital audio store.',
  path: '/refund-policy',
  keywords: [
    'Producer Toy refund policy',
    'Cancellation policy',
    'Failed transaction refund RBI',
    'Digital software refund terms',
    'Sound kit return policy',
  ],
})

export default function RefundPolicyPage() {
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
              Consumer Protection &amp; Settlement Standard
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Compliant with the Consumer Protection (E-Commerce) Rules, 2020 &amp; RBI Guidelines on Turnaround Time (TAT) for Failed Transactions.
            </p>
          </div>
        </div>

        {/* Highlight Alert Box */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5 space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-[#FA742B] font-bold text-sm">
            <Clock size={18} />
            <span>Resolution SLA: D+4 Business Days</span>
          </div>
          <p className="leading-relaxed text-zinc-400">
            In accordance with Indian regulatory mandates and Payment Aggregator standards, all customer complaints, transaction disputes, and file redelivery requests received on Producer Toy are acknowledged within <strong>24 hours</strong> and fully resolved within <strong>D+4 business days</strong> (where &apos;D&apos; is the date of complaint receipt).
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed">
          
          {/* Section 1: Digital Goods Nature */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#FA742B]" />
              1. Digital Download Nature &amp; Final Sale Terms
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              All items available on <strong>producertoy.com</strong>—including virtual synthesizer plugins (VST/AU), audio effect plugins, sample packs, drum kits, presets, and DAW project templates—are digital, non-tangible assets.
            </p>
            <p className="text-zinc-400">
              Upon successful payment authorization, serial activation keys and download links are instantly generated and provisioned to your account. Consequently, <strong>completed purchases of successfully delivered digital media are generally non-refundable and non-cancellable</strong>, as the intangible nature prevents physical return.
            </p>
          </section>

          {/* Section 2: Failed Transaction Auto-Refund (RBI Mandate) */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <RefreshCw size={18} className="text-[#FA742B]" />
              2. Failed Transactions &amp; Technical Glitches (Harmonisation of TAT)
            </h2>
            <p className="text-zinc-400">
              If an amount is debited from your bank account, card, or UPI app, but the transaction fails, times out, or the order is not generated due to a communication glitch between the acquiring bank and payment gateway:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li>
                <strong className="text-zinc-200">Automatic Reversal:</strong> The debited funds will be automatically credited back to your original payment method within <strong>5 business days</strong> in accordance with RBI Circular DPSS.CO.PD No.629/02.01.014/2019-20.
              </li>
              <li>
                <strong className="text-zinc-200">No Action Needed:</strong> The payment aggregator (Razorpay) and your issuing bank handle this reconciliation automatically.
              </li>
              <li>
                <strong className="text-zinc-200">Support Assistance:</strong> If the funds do not reflect after 5 business days, please email our billing team at <a href="mailto:support@producertoy.com" className="text-[#FA742B] hover:underline font-semibold">support@producertoy.com</a> with your Payment ID (e.g. <code>pay_...</code>) or UPI UTR reference.
              </li>
            </ul>
          </section>

          {/* Section 3: Defective & Corrupted File Replacement */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Defective, Incomplete or Corrupted Downloads
            </h2>
            <p className="text-zinc-400">
              We guarantee that every product archive on Producer Toy is verified, virus-free, and operational.
            </p>
            <p className="text-zinc-400">
              If a downloaded archive is incomplete, damaged during download, or a serial key fails to authenticate with the developer&apos;s registration server, Producer Toy will:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li>Provide an alternate direct high-speed download mirror immediately upon notification.</li>
              <li>Issue a verified replacement serial key or license key within <strong>24 to 48 hours</strong>.</li>
              <li>In the extremely rare circumstance where a defective product cannot be made operational by our technical engineers or the software manufacturer within 7 business days, a full store credit or monetary refund to the original payment source will be executed.</li>
            </ul>
          </section>

          {/* Section 4: Non-Refundable Scenarios */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#FA742B]" />
              4. Non-Refundable Scenarios
            </h2>
            <p className="text-zinc-400">Refunds or cancellations cannot be granted for:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li><strong className="text-zinc-200">System Incompatibility:</strong> Failure to verify minimum host requirements clearly stated on the product page (e.g. running 64-bit VST3 on a 32-bit DAW or unsupported operating system).</li>
              <li><strong className="text-zinc-200">Change of Mind:</strong> Deciding you no longer require the soundpack or VST after receiving the files.</li>
              <li><strong className="text-zinc-200">Sale &amp; Promo Price Changes:</strong> Purchasing an item prior to a promotional sale or coupon release.</li>
              <li><strong className="text-zinc-200">Third-Party Host Software:</strong> Not owning required third-party host samplers (e.g., Native Instruments Kontakt Full, Xfer Serum, Reveal Sound Spire) specified in the product description.</li>
            </ul>
          </section>

          {/* Section 5: Chargeback Handling */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Chargeback &amp; Dispute Policy
            </h2>
            <p className="text-zinc-400">
              We urge all customers to contact Producer Toy support before initiating a chargeback through their bank or card issuer. Any chargeback initiated fraudulently after successful file download will be contested with complete digital access logs, IP timestamps, and delivery records in accordance with Card Association guidelines.
            </p>
          </section>

          {/* Section 6: Dispute Submission & Nodal Desk */}
          <section className="space-y-3 pt-6 border-t border-zinc-800/60">
            <h2 className="text-lg font-bold text-white tracking-tight">
              6. How to Request Assistance or File a Grievance
            </h2>
            <p className="text-zinc-400">
              To request technical assistance, replacement keys, or submit a refund dispute:
            </p>
            <div className="bg-[#161616] border border-[#242424] rounded-xl p-4 space-y-1.5 text-xs text-zinc-400 mt-2">
              <p><strong className="text-zinc-200">Step 1:</strong> Visit our <Link href="/contact" className="text-[#FA742B] hover:underline font-semibold">Contact &amp; Support Desk</Link> or email <a href="mailto:support@producertoy.com" className="text-[#FA742B] hover:underline font-semibold">support@producertoy.com</a>.</p>
              <p><strong className="text-zinc-200">Step 2:</strong> Include your Order Number (e.g., <code>PT-M...</code>), registered email address, and specific issue details.</p>
              <p><strong className="text-zinc-200">Step 3:</strong> Our technical team will respond within 2–6 hours and guarantee resolution within <strong>D+4 business days</strong>.</p>
              <p><strong className="text-zinc-200">Grievance Escalation:</strong> <a href="mailto:grievance@producertoy.com" className="text-[#FA742B] hover:underline font-semibold">grievance@producertoy.com</a></p>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
