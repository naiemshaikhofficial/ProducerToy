import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ArrowLeft, ShieldCheck, Scale, FileText, AlertCircle } from 'lucide-react'

export const metadata: Metadata = generatePageMetadata({
  title: 'Terms of Use & Payment Terms — Producer Toy',
  description:
    'Terms of Use, Payment Aggregator compliance (RBI & Razorpay), Digital Licensing, Anti-Piracy, and Customer Due Diligence for Producer Toy.',
  path: '/terms',
  keywords: [
    'Producer Toy terms',
    'Terms and conditions',
    'Payment terms',
    'Razorpay payment aggregator terms',
    'Music store legal',
    'Producer Toy policies',
  ],
})

export default function TermsAndConditionsPage() {
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
              Legal Agreement &amp; Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Terms of Use &amp; Payment Conditions
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Published in terms of Rule 3 of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 &amp; RBI Payment Aggregator Guidelines.
            </p>
          </div>
        </div>

        {/* Regulatory Summary Alert */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5 space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-[#FA742B] font-bold text-sm">
            <ShieldCheck size={18} />
            <span>Payment Aggregation &amp; Security Notice</span>
          </div>
          <p className="leading-relaxed text-zinc-400">
            Payment aggregation services on <strong>Producer Toy</strong> are operated by <strong>Razorpay Payments Private Limited</strong> (an RBI-authorised Payment Aggregator). All monetary transactions, tokenisation protocols, and settlement flows strictly adhere to Reserve Bank of India (RBI) Master Directions and Payment Card Industry Data Security Standards (PCI-DSS Level 1).
          </p>
        </div>

        {/* Legal Body Sections */}
        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed">
          
          {/* Section 1: Introduction & Legal Status */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Scale size={18} className="text-[#FA742B]" />
              1. General Understanding &amp; Agreement
            </h2>
            <p className="text-zinc-400">
              This electronic document is published in accordance with the Information Technology Act, 2000 (as amended) and rules made thereunder. By accessing, browsing, registering for, or making a purchase on <strong>producertoy.com</strong> (&quot;Platform&quot; or &quot;Website&quot;), you (&quot;User&quot;, &quot;Customer&quot;, or &quot;Merchant&quot;) agree to be legally bound by these Terms of Use, together with our{' '}
              <Link href="/privacy" className="text-[#FA742B] hover:underline font-semibold">Privacy Policy</Link>,{' '}
              <Link href="/refund-policy" className="text-[#FA742B] hover:underline font-semibold">Refund Policy</Link>, and{' '}
              <Link href="/purchase-policy" className="text-[#FA742B] hover:underline font-semibold">Purchase Policy</Link>.
            </p>
            <p className="text-zinc-400">
              Producer Toy is an Indian registered digital media and software marketplace entity providing original virtual instruments (VST/AU), audio soundbanks, sample packs, MIDI files, and DAW production templates to creators worldwide.
            </p>
          </section>

          {/* Section 2: Payment Aggregation & Processing */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileText size={18} className="text-[#FA742B]" />
              2. Payment Aggregation &amp; Processing (Razorpay &amp; RBI Compliance)
            </h2>
            <p className="text-zinc-400">
              All domestic and supported international payment collection is facilitated via licensed Facility Providers and Payment Aggregators:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li>
                <strong className="text-zinc-200">Payment Aggregator:</strong> Payments are processed via Razorpay Payments Private Limited (RBI Authorised Payment Aggregator) and PayPal for international multi-currency processing.
              </li>
              <li>
                <strong className="text-zinc-200">Permitted Instruments:</strong> We support UPI (Google Pay, PhonePe, Paytm, BHIM, CRED), RuPay Debit/Credit Cards, Visa, Mastercard, American Express, and NetBanking across major scheduled commercial banks.
              </li>
              <li>
                <strong className="text-zinc-200">Zero Storage of Sensitive Card Credentials:</strong> In compliance with RBI Circular CO.DPSS.POLC.No.s-516/02-14-003/2021-22, Producer Toy does not store or view raw card numbers (PAN), CVVs, expiry dates, or bank passwords. All card saving is conducted via explicit consent-driven Tokenisation (TokenHQ).
              </li>
              <li>
                <strong className="text-zinc-200">Convenience &amp; Merchant Fees:</strong> Producer Toy does not levy unfair surcharge fees on domestic UPI or RuPay debit transactions.
              </li>
            </ul>
          </section>

          {/* Section 3: Digital Fulfillment & Customer Due Diligence */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Digital Delivery, License Issuance &amp; Account Security
            </h2>
            <p className="text-zinc-400">
              Upon successful payment authorization by the payment aggregator:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li>Your purchased digital audio assets, serial license keys, and downloadable archives are instantly attached to your personal account library.</li>
              <li>An itemized digital GST tax invoice and confirmation receipt are transmitted to your registered email address.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials and multi-factor security access. Disposable or temporary alias email domains (TempMail, 10MinuteMail, etc.) are strictly prohibited.</li>
            </ul>
          </section>

          {/* Section 4: Prohibited Products, Anti-Piracy & Usage Restrictions */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <AlertCircle size={18} className="text-[#FA742B]" />
              4. Prohibited Activities &amp; Anti-Piracy Governance
            </h2>
            <p className="text-zinc-400">
              In alignment with Indian Law, RBI regulations, and Payment Aggregator merchant mandates, you agree not to use the Platform to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li>Upload, distribute, crack, reverse-engineer, decompile, or tamper with VST/AU software binaries or serial key generators.</li>
              <li>Sell or distribute unauthorized copies of copyrighted audio recordings, sound libraries, or patented DSP code.</li>
              <li>Engage in any money laundering, fraudulent credit card usage, bot scraping, or unauthorized reselling of digital licenses.</li>
              <li>Engage in any activities related to unregulated virtual currencies, NFTs, or gambling as restricted under Applicable Laws.</li>
            </ul>
          </section>

          {/* Section 5: Marketplace Sellers & Sub-Merchants */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Marketplace Creators &amp; Sound Designer Obligations
            </h2>
            <p className="text-zinc-400">
              Third-party sound designers, preset creators, and audio brands onboarded as sellers on Producer Toy confirm that:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li>All uploaded audio samples, synth patches, and MIDI progressions are 100% original, cleared, and royalty-free for commercial use.</li>
              <li>Sellers have valid contractual onboarding agreements with Producer Toy and undergo mandatory Know Your Customer (KYC) verification.</li>
              <li>TDS obligations under Section 194-O of the Income Tax Act, 1961 and GST compliance are maintained as prescribed under Indian Law.</li>
            </ul>
          </section>

          {/* Section 6: Chargeback, Disputes & Failed Transactions */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              6. Chargeback Resolution &amp; Failed Transaction Turnaround (TAT)
            </h2>
            <p className="text-zinc-400">
              In the event of a banking or gateway discrepancy:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li>
                <strong className="text-zinc-200">Failed Transaction Auto-Refund:</strong> If money is deducted from your bank account but the transaction fails or times out, the funds will be automatically reversed to your source account within 5 business days pursuant to RBI Circular DPSS.CO.PD No.629/02.01.014/2019-20.
              </li>
              <li>
                <strong className="text-zinc-200">Grievance Resolution Timeline:</strong> All customer queries, license retrieval requests, or transaction clarifications will be responded to within 24 hours and fully resolved within <strong>D+4 business days</strong>.
              </li>
              <li>
                <strong className="text-zinc-200">Fraudulent Chargebacks:</strong> Filing unfounded chargebacks after downloading digital assets will lead to immediate account termination and serial key revocation.
              </li>
            </ul>
          </section>

          {/* Section 7: Limitation of Liability & Third-Party Disclaimer */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              7. Limitation of Liability &amp; Intermediary Disclaimer
            </h2>
            <p className="text-zinc-400">
              To the maximum extent permitted by Applicable Law:
            </p>
            <p className="text-zinc-400">
              Razorpay Payments Private Limited, partner acquiring banks, and card networks act solely as payment facilitators/aggregators and shall not be held liable for any product quality, digital compatibility, or after-sales technical requests pertaining to goods sold by Producer Toy. Producer Toy assumes full merchant responsibility for product delivery and license fulfillment.
            </p>
          </section>

          {/* Section 8: Governing Law & Jurisdiction */}
          <section className="space-y-3 pt-6 border-t border-zinc-800/60">
            <h2 className="text-lg font-bold text-white tracking-tight">
              8. Governing Law, Dispute Redressal &amp; Nodal Details
            </h2>
            <p className="text-zinc-400">
              These Terms shall be governed by and construed in accordance with the substantive laws of <strong>India</strong>. Any legal action or dispute arising in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Sangamner / Pune / Bengaluru, India.
            </p>
            <div className="bg-[#161616] border border-[#242424] rounded-xl p-4 space-y-1.5 text-xs text-zinc-400 mt-3">
              <p><strong className="text-zinc-200">Merchant Entity:</strong> Producer Toy Store (Operated in India)</p>
              <p><strong className="text-zinc-200">Registered Office:</strong> Producer Toy Studios, Sangamner, Maharashtra - 422605, India</p>
              <p><strong className="text-zinc-200">Compliance &amp; Legal Desk:</strong> <a href="mailto:support@producertoy.com" className="text-[#FA742B] hover:underline font-semibold">support@producertoy.com</a></p>
              <p><strong className="text-zinc-200">Statutory Nodal / Grievance Officer:</strong> <a href="mailto:grievance@producertoy.com" className="text-[#FA742B] hover:underline font-semibold">grievance@producertoy.com</a></p>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
