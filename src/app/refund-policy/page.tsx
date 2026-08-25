import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Refund Policy | Producer Toy Store',
  description: 'Strict No Refund & Final Sale Policy for digital VST plugins, sample packs, presets, and DAW templates on Producer Toy.',
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white py-14 px-6 sm:px-10 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-10 font-sans">
        
        {/* Back Link & Minimal Header */}
        <div className="space-y-4 pb-6 border-b border-zinc-800/60">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Store
          </Link>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Store Refund Policy
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#FC6301] mt-2 tracking-wide uppercase">
              Strictly No Refunds • All Digital Product Sales Are 100% Final
            </p>
          </div>
        </div>

        {/* Minimalist Content Body */}
        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              1. Strict No Refund & Final Sale Policy
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Due to the non-tangible, irrevocable, and instant digital download nature of software, VST/AU plugins, sample packs, synth presets, and DAW templates sold on <strong>Producer Toy</strong>, <strong>WE DO NOT OFFER REFUNDS, CANCELLATIONS, OR MONETARY EXCHANGES UNDER ANY CIRCUMSTANCES ONCE A PURCHASE IS COMPLETED.</strong>
            </p>
            <p className="text-zinc-400">
              This policy is fully aligned with Indian e-commerce digital goods standards and international software licensing laws regarding downloadable media assets.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              2. Non-Refundable Circumstances
            </h2>
            <p className="text-zinc-400">Producer Toy will strictly NOT grant refunds in the following scenarios:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li><strong className="text-zinc-200">Change of Mind:</strong> Deciding you no longer want or need the product after placing an order or obtaining digital download access.</li>
              <li><strong className="text-zinc-200">System Incompatibility:</strong> Purchasing a product without reading minimum system requirements clearly specified on the product page (e.g. attempting to run a 64-bit VST3 plugin on a 32-bit legacy DAW or incompatible OS version).</li>
              <li><strong className="text-zinc-200">Lack of Technical Knowledge:</strong> Inability or unwillingness to operate host DAWs (FL Studio, Ableton Live, Logic Pro, Cubase) or third-party samplers (Native Instruments Kontakt, Xfer Serum).</li>
              <li><strong className="text-zinc-200">Sale & Promotional Price Changes:</strong> Purchasing an item prior to a flash sale or price drop. Discounts cannot be retroactively applied to past purchases.</li>
              <li><strong className="text-zinc-200">Bundle Purchases:</strong> Products bought as part of a bundle or collection cannot be refunded individually.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Customer Responsibility & Technical File Support
            </h2>
            <p className="text-zinc-400">
              We strongly encourage all customers to thoroughly review system specs, format compatibility (VST, VST3, AU, WAV 24-bit/44.1kHz), and trial/demo versions before purchasing.
            </p>
            <p className="text-zinc-400">
              <strong>Corrupted Download Support:</strong> If a downloaded ZIP or installer archive is corrupted during transfer, Producer Toy Customer Support will provide a replacement download link. This is a technical file re-delivery service, not a monetary refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              4. Rent to Own Installments & Fraudulent Chargebacks
            </h2>
            <p className="text-zinc-400">
              Canceling or pausing a Rent to Own plan stops future monthly billing but does NOT refund previous monthly installments paid.
            </p>
            <p className="text-zinc-400">
              <strong>Fraudulent Chargebacks:</strong> Any fraudulent credit card or gateway chargeback attempt filed against Producer Toy will result in immediate permanent account termination, revocation of all serial key licenses, and blacklisting across our distribution network under Indian anti-fraud regulations.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-zinc-800/60">
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Need Download Assistance?
            </h2>
            <p className="text-zinc-400">
              For any questions regarding file downloads, license key recovery, or technical support, please contact our support desk:
            </p>
            <div className="space-y-1 text-xs text-zinc-400 pt-2 leading-relaxed">
              <p><strong className="text-zinc-200">Support Email:</strong> <a href="mailto:support@producertoy.com" className="text-[#FC6301] hover:underline font-bold">support@producertoy.com</a></p>
              <p><strong className="text-zinc-200">Grievance Desk:</strong> <a href="mailto:grievance@producertoy.com" className="text-[#FC6301] hover:underline">grievance@producertoy.com</a></p>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
