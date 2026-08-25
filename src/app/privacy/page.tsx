import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Producer Toy Store',
  description: 'Privacy Policy, Anti-Spam Policy, Cookie Policy, and DPDP Act 2023 / GDPR compliance for Producer Toy.',
}

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Last updated: February 25, 2026 • DPDP Act 2023 (India), IT Act 2000 & GDPR Compliant
            </p>
          </div>
        </div>

        {/* Minimalist Borderless Content Body */}
        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              1. Information We Collect
            </h2>
            <p className="text-zinc-400">
              We are committed to safeguarding the privacy of our website visitors and account holders. We collect, store, and process personal data strictly in accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India, the <strong>IT Act 2000</strong>, and international privacy laws including <strong>GDPR</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li><strong className="text-zinc-200">Website Visits & Metadata:</strong> IP address, geographical location, browser type, operating system, referral source, length of visit, and page views.</li>
              <li><strong className="text-zinc-200">Account Registration:</strong> Name, valid permanent email address, country of residence, and encrypted account password.</li>
              <li><strong className="text-zinc-200">Transactions & Orders:</strong> Purchase history, currency preferences (USD), invoice records, and software serial key activations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              2. Strict Anti-Spam Policy (Newsletter & SMS / WhatsApp)
            </h2>
            <p className="text-zinc-400">
              <strong>Producer Toy does NOT send spam - ever.</strong> Our email and SMS communications are strictly permission-based:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li><strong className="text-zinc-200">Newsletter Subscribers:</strong> A user is added to our newsletter database ONLY when opting in during registration. Every newsletter contains a 1-click Unsubscribe link at the top and bottom.</li>
              <li><strong className="text-zinc-200">SMS & WhatsApp Subscribers:</strong> SMS communications are sent solely based on explicit opt-in permission, which can be withdrawn at any time by replying &quot;STOP&quot;.</li>
              <li><strong className="text-zinc-200">Necessary Communications:</strong> Transactional emails (order confirmation, invoices, download key delivery, security alerts) are sent as part of our contractual obligations to fulfill your purchase.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Financial Information Security
            </h2>
            <p className="text-zinc-400">
              <strong>Producer Toy does NOT store credit/debit card numbers, CVVs, or bank account details on our servers.</strong> All monetary transactions are processed directly through PCI-DSS compliant international payment gateways (Stripe, Razorpay, PayPal). All electronic data transmissions are encrypted using 256-bit SSL/TLS encryption.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              4. Cookies & Tracking Technologies
            </h2>
            <p className="text-zinc-400">
              We use necessary session cookies to maintain your login session, shopping cart items, and security tokens. We also use analytics cookies (e.g. Google Analytics) to understand website usage and improve store performance. You can adjust your browser settings to block non-essential cookies at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Data Sharing & Third Parties
            </h2>
            <p className="text-zinc-400">
              We will never sell or rent customer email addresses or personal data to third parties for commercial gain. We share data strictly with trusted service providers required for cloud hosting, database management, and order fulfillment.
            </p>
          </section>

          {/* Statutory Grievance Redressal Officer (India) */}
          <section className="space-y-3 pt-6 border-t border-zinc-800/60">
            <h2 className="text-lg font-bold text-white tracking-tight">
              6. Statutory Grievance Redressal Officer (India)
            </h2>
            <p className="text-zinc-400">
              Under Section 5 of the DPDP Act 2023 and Rule 3(2) of the Information Technology (Intermediary Guidelines) Rules 2021, the contact details of our Grievance Officer are provided below:
            </p>
            <div className="space-y-1 text-xs text-zinc-400 pt-2 leading-relaxed">
              <p><strong className="text-zinc-200">Designation:</strong> Statutory Grievance & Nodal Officer</p>
              <p><strong className="text-zinc-200">Entity:</strong> Producer Toy Pvt. Ltd.</p>
              <p><strong className="text-zinc-200">Address:</strong> Producer Toy Studios, Sangamner, Maharashtra - 422605, India</p>
              <p><strong className="text-zinc-200">Grievance Email:</strong> <a href="mailto:grievance@producertoy.com" className="text-[#FC6301] hover:underline font-bold">grievance@producertoy.com</a></p>
              <p><strong className="text-zinc-200">Support Desk:</strong> <a href="mailto:support@producertoy.com" className="text-[#FC6301] hover:underline">support@producertoy.com</a></p>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
