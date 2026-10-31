import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  UserCheck,
  EyeOff,
  Cookie,
  Megaphone,
  Scale,
  Building2,
  FileText,
  Mail,
  ExternalLink,
} from 'lucide-react'

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
              <ShieldCheck size={14} className="text-zinc-300" />
              <span>Data Privacy &amp; Security Compliance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Privacy Policy &amp; Data Protection
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              Compliant with the Digital Personal Data Protection Act, 2023 (India), Information Technology Act, 2000 (SPDI Rules), and global GDPR regulations.
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
            <Lock size={19} className="text-zinc-300 flex-shrink-0" />
            <span>Zero Payment Credential Storage Guarantee</span>
          </div>
          <p className="leading-relaxed text-xs sm:text-sm text-zinc-400">
            Producer Toy does <strong className="text-zinc-200">NOT</strong> collect, store, or view customer payment card credentials (including 16-digit card numbers, CVVs, expiry dates, or PINs). All card processing and card saving is facilitated directly by licensed PCI-DSS Level 1 compliant Payment Aggregators (Razorpay Payments Private Limited) through consent-driven tokenisation (TokenHQ).
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CONTENT SECTIONS                                                          */}
        {/* ========================================================================= */}
        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          
          {/* Section 1: Information We Collect */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <UserCheck size={18} className="text-zinc-300" />
              <span>1. Information We Collect &amp; Process</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              We collect and process only the minimal personal information necessary to deliver digital licenses, provide order fulfillment, and prevent unauthorized chargeback fraud:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-400 pt-1">
              <li>
                <strong className="text-zinc-200">Account &amp; Contact Data:</strong> Full name, permanent verified email address, phone number (for billing verification), and encrypted user passwords.
              </li>
              <li>
                <strong className="text-zinc-200">Transaction &amp; Invoicing Details:</strong> Billing country, state, postal code, order reference IDs, purchased software titles, and serial license keys issued.
              </li>
              <li>
                <strong className="text-zinc-200">Technical &amp; Log Data:</strong> IP address, device operating system, browser type, and download audit timestamps to confirm digital file delivery.
              </li>
            </ul>
          </section>

          {/* Section 2: Financial Data & TokenHQ Tokenisation */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-zinc-300" />
              <span>2. Financial Data Security &amp; Tokenisation Compliance</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              In accordance with Reserve Bank of India (RBI) circulars on card tokenisation:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-400 pt-1">
              <li>
                When you opt to save a card for faster checkout, your card details are tokenized by authorized Token Service Providers (Visa, Mastercard, RuPay) and issuing banks.
              </li>
              <li>
                Producer Toy only receives an anonymised, encrypted cryptographic token and masked card digits (e.g. <code className="bg-[#202024] px-1.5 py-0.5 rounded text-zinc-300 font-mono text-xs">•••• 4242</code>) for display.
              </li>
              <li>
                All API communication between Producer Toy and payment gateways is secured with 256-bit TLS/SSL encryption and server-to-server cryptographic hashing.
              </li>
            </ul>
          </section>

          {/* Section 3: Purpose of Processing & Strict Non-Sale of Data */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <EyeOff size={18} className="text-zinc-300" />
              <span>3. Purpose of Processing &amp; Strict Non-Sale of Data</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              We process your personal data strictly for:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-400 pt-1">
              <li>Issuing software serial keys, generating downloadable archive mirrors, and synchronizing your user library.</li>
              <li>Generating statutory B2C/B2B GST tax invoices and accounting records (retained for statutory periods as mandated by Indian Law).</li>
              <li>Providing 24/7 technical customer support and resolving license recovery requests.</li>
              <li>Preventing financial fraud, bot attacks, and chargeback abuse.</li>
            </ul>
            <div className="bg-[#202024] border border-[#2e2e34] rounded-xl p-3.5 text-xs text-zinc-300 font-medium flex items-center gap-2">
              <EyeOff size={16} className="text-zinc-300 flex-shrink-0" />
              <span>We will NEVER sell, lease, or rent customer personal data or email lists to any third-party advertisers.</span>
            </div>
          </section>

          {/* Section 3.1: Third-Party Audio Developer & Seller Data Sharing */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-zinc-300" />
              <span>3.1 Third-Party Audio Developer &amp; Seller Data Sharing Controls</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Producer Toy enforces a strict <strong className="text-zinc-200">privacy-first default</strong>: customer personal contact details are never shared globally or indiscriminately with third-party sellers, sound designers, or creators on our marketplace.
            </p>
            <div className="space-y-3.5 text-xs sm:text-sm text-zinc-400 pt-1">
              <div className="bg-[#1b1b1e] border border-[#2a2a30] rounded-xl p-4 space-y-1">
                <strong className="text-zinc-200 block text-xs uppercase tracking-wider">1. Default Policy (No Sharing)</strong>
                <p>For standard sample archives, presets, DAW templates, and soundware delivered directly via Producer Toy infrastructure, sellers receive aggregate financial and units data only. Sellers never receive raw customer email addresses, phone numbers, or billing addresses.</p>
              </div>

              <div className="bg-[#1b1b1e] border border-[#2a2a30] rounded-xl p-4 space-y-1">
                <strong className="text-zinc-200 block text-xs uppercase tracking-wider">2. Documented Activation &amp; Licensing Requirements</strong>
                <p>Certain complex audio software products (such as dedicated DSP plugins requiring machine seat assignment or license server registration by verified third-party developers, including FORGE Multimedia Group LLC for Groove Console and BarkerBox) legitimately require buyer details to issue genuine activation keys and deliver technical product support.</p>
              </div>

              <div className="bg-[#1b1b1e] border border-[#2a2a30] rounded-xl p-4 space-y-1">
                <strong className="text-zinc-200 block text-xs uppercase tracking-wider">3. Transparent Pre-Purchase Disclosure &amp; Explicit Consent</strong>
                <p>Whenever a product requires seller-side data sharing:</p>
                <ul className="list-disc pl-5 space-y-1 pt-1.5 text-zinc-400">
                  <li>Producer Toy displays a prominent, product-specific <strong className="text-zinc-200">Seller Data Sharing Notice</strong> before payment on the checkout screen.</li>
                  <li>The notice clearly identifies the receiving verified developer, the specific fields shared (e.g. verified email address and order number), and the approved technical purpose.</li>
                  <li>Where required, an <strong className="text-zinc-200">unchecked consent checkbox</strong> must be affirmatively selected by the buyer. Consent is never pre-checked or assumed. If consent is withheld, order completion for that product is securely blocked.</li>
                </ul>
              </div>

              <div className="bg-[#1b1b1e] border border-[#2a2a30] rounded-xl p-4 space-y-1">
                <strong className="text-zinc-200 block text-xs uppercase tracking-wider">4. Seller Contractual Safeguards &amp; Non-Marketing Covenants</strong>
                <p>Under the Producer Toy Seller Agreement, any developer receiving customer information is legally and contractually obligated to:</p>
                <ul className="list-disc pl-5 space-y-1 pt-1.5 text-zinc-400">
                  <li>Use customer information solely for genuine product licensing, machine seat registration, or product-specific support.</li>
                  <li>Implement industry-standard security and access controls to prevent unauthorized data leaks.</li>
                  <li>Refrain from enrolling buyers in unsolicited marketing newsletters or promotional campaigns without separate, independent buyer consent.</li>
                  <li>Never resell, broker, or onward-transfer customer personal information.</li>
                </ul>
              </div>

              <div className="bg-[#1b1b1e] border border-[#2a2a30] rounded-xl p-4 space-y-1">
                <strong className="text-zinc-200 block text-xs uppercase tracking-wider">5. Data Rectification &amp; Erasure</strong>
                <p>Customers may request access, correction, or deletion of their shared profile details at any time by contacting our Privacy Desk at <a href="mailto:legal@producertoy.com" className="text-zinc-200 hover:text-white underline underline-offset-2">legal@producertoy.com</a>, subject to necessary statutory tax records and active software license verification records.</p>
              </div>
            </div>
          </section>

          {/* Section 4: Cookies & Tracking Technologies */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <Cookie size={18} className="text-zinc-300" />
              <span>4. Cookies &amp; Session Management</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              We use strictly necessary session cookies to maintain your shopping cart, user session tokens, and currency preferences. You can configure or disable non-essential cookies via your browser settings at any time.
            </p>
          </section>

          {/* Section 5: Google AdSense & Third-Party Advertising */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <Megaphone size={18} className="text-zinc-300" />
              <span>5. Google AdSense &amp; Third-Party Advertising Disclosures</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              We partner with third-party advertising vendors, including <strong className="text-zinc-200">Google Inc.</strong> (Google AdSense), to display ads when you browse our website.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-400 pt-1">
              <li>
                <strong className="text-zinc-200">Advertising Cookies:</strong> Third-party vendors, including Google, use cookies (such as the DoubleClick cookie) to serve ads based on your prior visits to Producer Toy and other websites across the Internet.
              </li>
              <li>
                <strong className="text-zinc-200">Personalized Ads:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve relevant advertisements to users based on their navigation history across the web.
              </li>
              <li>
                <strong className="text-zinc-200">Opt-Out Rights:</strong> You may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-200 hover:text-white underline underline-offset-2 font-semibold"
                >
                  Google Ads Settings
                </a>
                {' '}or by visiting{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-200 hover:text-white underline underline-offset-2 font-semibold"
                >
                  aboutads.info
                </a>
                .
              </li>
            </ul>
          </section>

          {/* Section 6: Affiliate Partnerships & Commercial Transparency */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <Scale size={18} className="text-zinc-300" />
              <span>6. Affiliate Partnerships &amp; Commercial Transparency</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              In full compliance with Federal Trade Commission (FTC) guidelines and global consumer transparency rules, Producer Toy participates in affiliate marketing programs (including Plugin Boutique, Impact.com, and partner audio developers). When you click on an external link to an offering developer or merchant and complete a transaction, Producer Toy may receive an affiliate referral fee at zero additional charge to you. Our editorial coverage, product news, and curation remain completely independent.
            </p>
          </section>

          {/* Section 7: Data Subject Rights (DPDP Act & GDPR) */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <FileText size={18} className="text-zinc-300" />
              <span>7. Your Rights as a Data Principal</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">Under the DPDP Act 2023 and GDPR, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-400 pt-1">
              <li>Request a copy of your stored personal information and order history.</li>
              <li>Request correction or updating of outdated profile information.</li>
              <li>Request complete erasure of your account data (subject to statutory tax retention requirements).</li>
              <li>Unsubscribe from promotional newsletters at any time via the 1-click unsubscribe link in every email.</li>
            </ul>
          </section>

          {/* Section 8: Statutory Grievance Redressal & Nodal Officer */}
          <section className="bg-[#161618] border border-[#26262b] rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <Building2 size={18} className="text-zinc-300" />
              <span>8. Statutory Grievance Redressal &amp; Nodal Officer (India)</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              In accordance with Section 5 of the DPDP Act, 2023 and Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, you may contact our designated Grievance Officer:
            </p>
            <div className="bg-[#1b1b1e] border border-[#2a2a30] rounded-xl p-4 sm:p-5 space-y-2 text-xs text-zinc-400 mt-2">
              <p><strong className="text-zinc-200">Designation:</strong> Data Protection &amp; Grievance Officer</p>
              <p><strong className="text-zinc-200">Entity:</strong> Producer Toy Store (India)</p>
              <p><strong className="text-zinc-200">Address:</strong> Producer Toy Studios, Sangamner, Maharashtra - 422605, India</p>
              <p><strong className="text-zinc-200">Grievance Email:</strong> <a href="mailto:legal@producertoy.com" className="text-zinc-200 hover:text-white underline underline-offset-2 font-semibold">legal@producertoy.com</a></p>
              <p><strong className="text-zinc-200">Support Desk:</strong> <a href="mailto:support@producertoy.com" className="text-zinc-200 hover:text-white underline underline-offset-2 font-semibold">support@producertoy.com</a></p>
              <p><strong className="text-zinc-200">Response Timeline:</strong> Acknowledgment within 24 hours, resolution within D+4 business days.</p>
            </div>
          </section>

        </div>

        {/* ========================================================================= */}
        {/* RELATED POLICIES FOOTER NAVIGATION                                       */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-[#26262b] flex flex-wrap gap-4 text-xs text-zinc-400 font-medium">
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <span className="text-zinc-600">•</span>
          <Link href="/refund-policy" className="hover:text-white transition-colors">Refund &amp; Cancellation</Link>
          <span className="text-zinc-600">•</span>
          <Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping &amp; Delivery</Link>
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
