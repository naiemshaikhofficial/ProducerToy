import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ArrowLeft, Lock, ShieldCheck, UserCheck, EyeOff } from 'lucide-react'

export const metadata: Metadata = generatePageMetadata({
  title: 'Privacy Policy & Data Protection — Producer Toy',
  description:
    'Producer Toy Privacy Policy, Data Protection (DPDP Act 2023 & GDPR), PCI-DSS Compliance, and TokenHQ Tokenisation standards.',
  path: '/privacy',
  keywords: [
    'Producer Toy privacy',
    'Data protection policy',
    'DPDP Act 2023 compliance',
    'PCI DSS compliance',
    'Producer Toy security',
  ],
})

export default function PrivacyPolicyPage() {
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
              Data Privacy &amp; Security Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Privacy Policy &amp; Data Protection
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Compliant with the Digital Personal Data Protection Act, 2023 (India), Information Technology Act, 2000 (SPDI Rules), and global GDPR regulations.
            </p>
          </div>
        </div>

        {/* Highlight Alert Box */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5 space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-[#FA742B] font-bold text-sm">
            <Lock size={18} />
            <span>Zero Payment Credential Storage Guarantee</span>
          </div>
          <p className="leading-relaxed text-zinc-400">
            Producer Toy does <strong>NOT</strong> collect, store, or view customer payment card credentials (including 16-digit card numbers, CVVs, expiry dates, or PINs). All card processing and card saving is facilitated directly by licensed PCI-DSS Level 1 compliant Payment Aggregators (Razorpay Payments Private Limited) through consent-driven tokenisation (TokenHQ).
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed">
          
          {/* Section 1: Information We Collect */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <UserCheck size={18} className="text-[#FA742B]" />
              1. Information We Collect &amp; Process
            </h2>
            <p className="text-zinc-400">
              We collect and process only the minimal personal information necessary to deliver digital licenses, provide order fulfillment, and prevent unauthorized chargeback fraud:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li><strong className="text-zinc-200">Account &amp; Contact Data:</strong> Full name, permanent verified email address, phone number (for billing verification), and encrypted user passwords.</li>
              <li><strong className="text-zinc-200">Transaction &amp; Invoicing Details:</strong> Billing country, state, postal code, order reference IDs, purchased software titles, and serial license keys issued.</li>
              <li><strong className="text-zinc-200">Technical &amp; Log Data:</strong> IP address, device operating system, browser type, and download audit timestamps to confirm digital file delivery.</li>
            </ul>
          </section>

          {/* Section 2: Financial Data & TokenHQ Tokenisation */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#FA742B]" />
              2. Financial Data Security &amp; Tokenisation Compliance
            </h2>
            <p className="text-zinc-400">
              In accordance with Reserve Bank of India (RBI) circulars on card tokenisation:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li>When you opt to save a card for faster checkout, your card details are tokenized by authorized Token Service Providers (Visa, Mastercard, RuPay) and issuing banks.</li>
              <li>Producer Toy only receives an anonymised, encrypted cryptographic token and masked card digits (e.g. <code>•••• 4242</code>) for display.</li>
              <li>All API communication between Producer Toy and payment gateways is secured with 256-bit TLS/SSL encryption and server-to-server cryptographic hashing.</li>
            </ul>
          </section>

          {/* Section 3: Purpose of Processing & Data Sharing */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Purpose of Processing &amp; Strict Non-Sale of Data
            </h2>
            <p className="text-zinc-400">
              We process your personal data strictly for:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li>Issuing software serial keys, generating downloadable archive mirrors, and synchronizing your user library.</li>
              <li>Generating statutory B2C/B2B GST tax invoices and accounting records (retained for statutory periods as mandated by Indian Law).</li>
              <li>Providing 24/7 technical customer support and resolving license recovery requests.</li>
              <li>Preventing financial fraud, bot attacks, and chargeback abuse.</li>
            </ul>
            <p className="text-zinc-400 font-semibold text-white pt-1">
              <EyeOff size={16} className="inline mr-1.5 text-[#FA742B]" />
              We will NEVER sell, lease, or rent customer personal data or email lists to any third-party advertisers.
            </p>
          </section>

          {/* Section 4: Cookies & Tracking Technologies */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              4. Cookies &amp; Session Management
            </h2>
            <p className="text-zinc-400">
              We use strictly necessary session cookies to maintain your shopping cart, user session tokens, and currency preferences. We do not use intrusive third-party cross-site trackers. You can disable non-essential cookies via your browser settings at any time.
            </p>
          </section>

          {/* Section 5: Data Subject Rights (DPDP Act & GDPR) */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Your Rights as a Data Principal
            </h2>
            <p className="text-zinc-400">Under the DPDP Act 2023 and GDPR, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li>Request a copy of your stored personal information and order history.</li>
              <li>Request correction or updating of outdated profile information.</li>
              <li>Request complete erasure of your account data (subject to statutory tax retention requirements).</li>
              <li>Unsubscribe from promotional newsletters at any time via the 1-click unsubscribe link in every email.</li>
            </ul>
          </section>

          {/* Statutory Grievance & Nodal Officer Details */}
          <section className="space-y-3 pt-6 border-t border-zinc-800/60">
            <h2 className="text-lg font-bold text-white tracking-tight">
              6. Statutory Grievance Redressal &amp; Nodal Officer (India)
            </h2>
            <p className="text-zinc-400">
              In accordance with Section 5 of the DPDP Act, 2023 and Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, you may contact our designated Grievance Officer:
            </p>
            <div className="bg-[#161616] border border-[#242424] rounded-xl p-4 space-y-1.5 text-xs text-zinc-400 mt-2">
              <p><strong className="text-zinc-200">Designation:</strong> Data Protection &amp; Grievance Officer</p>
              <p><strong className="text-zinc-200">Entity:</strong> Producer Toy Store (India)</p>
              <p><strong className="text-zinc-200">Address:</strong> Producer Toy Studios, Sangamner, Maharashtra - 422605, India</p>
              <p><strong className="text-zinc-200">Grievance Email:</strong> <a href="mailto:grievance@producertoy.com" className="text-[#FA742B] hover:underline font-semibold">grievance@producertoy.com</a></p>
              <p><strong className="text-zinc-200">Support Desk:</strong> <a href="mailto:support@producertoy.com" className="text-[#FA742B] hover:underline font-semibold">support@producertoy.com</a></p>
              <p><strong className="text-zinc-200">Response Timeline:</strong> Acknowledgment within 24 hours, resolution within D+4 business days.</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
