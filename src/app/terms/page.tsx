import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms and Conditions | Producer Toy Store',
  description: 'Complete Terms and Conditions, Rent to Own, Disposable Email Ban, Brand Disclaimer, and Acceptable Use Policy for Producer Toy.',
}

export default function TermsAndConditionsPage() {
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
              Terms and Conditions
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Last updated: February 25, 2026 • Producer Toy Store (India Operations & Global Distribution)
            </p>
          </div>
        </div>

        {/* Minimalist Content Body */}
        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              1. Introduction
            </h2>
            <p className="text-zinc-400">
              These terms and conditions govern your use of the website <strong>producertoy.com</strong>; by using our website, you accept these terms and conditions in full. If you disagree with any part of these terms and conditions, do not use our website.
            </p>
            <p className="text-zinc-400">
              Producer Toy is an Indian registered entity operating a premier digital audio marketplace, providing VST/AU plugins, sample packs, synth presets, and DAW templates to music producers globally.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              2. Payment Methods & Currency
            </h2>
            <p className="text-zinc-400">
              Producer Toy currently accepts Visa, Mastercard, American Express, Apple Pay, Google Pay, UPI, Net Banking, and PayPal. We do not accept cash, bank checks, or unauthorized third-party gift cards. The customer agrees to pay all applicable unit prices, taxes, and transaction fees.
            </p>
            <p className="text-zinc-400">
              All core prices on Producer Toy are listed in <strong>United States Dollars (USD)</strong>. For customers in India or other regions, local currency displays are for approximation; the actual exchange rate applied by your issuing bank or payment gateway at the time of purchase may vary.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Account Registration & Email Requirements (Strict Disposable Email Ban)
            </h2>
            <p className="text-zinc-400">
              To register for an account, you must use a valid and permanent personal or professional email address. <strong>The use of disposable, temporary, or &apos;alias&apos; email services (e.g. TempMail, 10MinuteMail, GuerillaMail) designed to anonymise the user or circumvent registration limits is strictly prohibited.</strong>
            </p>
            <p className="text-zinc-400">
              We reserve the right, in our sole discretion, to refuse registration, revoke software license keys, or permanently block access if we detect the use of a prohibited email domain. You represent and warrant that all registration information provided is truthful and accurate.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              4. Rent to Own Payment Plans
            </h2>
            <p className="text-zinc-400">
              If you choose to purchase a product through a Rent to Own payment plan, you will be purchasing a month-to-month license for the duration of the plan. Upon completion of the plan, if all installment payments have been made without any refund, chargeback, or payment issue, your monthly license will be converted into a perpetual license once your final payment has been processed.
            </p>
            <p className="text-zinc-400">
              If you cancel or pause your Rent to Own payment plan, you will forfeit your month-to-month license to the relevant product, and access to the product will be suspended until payments resume. Aside from any free trial, one payment is required every 30 days. You authorize Producer Toy to charge your payment method on file each month until the full price is completed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Termination of Distribution Rights
            </h2>
            <p className="text-zinc-400">
              Producer Toy may at any time lose the right to distribute and sell selected third-party products. Should such a case occur, you will no longer be able to access or download such products from your account, and they will no longer be listed in the Producer Toy catalogue.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              6. Limitation on Sales & Reseller Restrictions
            </h2>
            <p className="text-zinc-400">
              The Producer Toy online shop sells products to end customers only. Music dealers, distributors, wholesalers, and any other businesses purchasing products in the Producer Toy store with the intent to resell or sub-license them will be refused access and sales. Coupon codes cannot be stacked or applied to sale items unless explicitly stated.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              7. Brand Names & Trademarks Disclaimer
            </h2>
            <p className="text-zinc-400">
              Any references to third-party brands on this site (e.g. FL Studio, Ableton Live, Logic Pro, Cubase, Xfer Serum, Native Instruments, Roland, Moog) are provided for descriptive compatibility purposes only (to describe the sound of an instrument or host DAW compatibility). Producer Toy does not claim any official association with or endorsement by these brand owners. All goodwill attached to those trademarks rests with their respective owners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              8. Acceptable Use Policy & Anti-Piracy
            </h2>
            <p className="text-zinc-400">You agree and undertake that you will not post, employ, or transmit content or engage in activity that:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li>Is unlawful, fraudulent, or gives rise to civil or criminal liability under Indian IT Act 2000.</li>
              <li>Infringes the intellectual property or copyright of Producer Toy or sound designers.</li>
              <li>Employs third-party bots, automated scrapers, scripts, or takes advantage of bugs to access restricted parts of our website or download vaults.</li>
              <li>Uploads or transmits computer viruses, malware, trojans, or logic bombs.</li>
              <li>Attempts to crack, reverse-engineer, or decompile VST/AU plugin binaries or serial key generators.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              9. Right to Challenge a Transaction
            </h2>
            <p className="text-zinc-400">
              Producer Toy reserves the right to challenge the legal standing of a transaction under suspicious or high-risk circumstances. In such cases, the user will be contacted individually to verify their identity. Failure to verify identity will result in order cancellation and account suspension within 30 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              10. Limitations of Liability
            </h2>
            <p className="text-zinc-400">
              To the full extent permissible by applicable law, Producer Toy disclaims all warranties, express or implied. Producer Toy will not be liable for any direct, indirect, incidental, or consequential damages arising from the use of this site or downloaded audio assets.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-zinc-800/60">
            <h2 className="text-lg font-bold text-white tracking-tight">
              11. Governing Law & Jurisdiction (India)
            </h2>
            <p className="text-zinc-400">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of <strong>India</strong> (including the Information Technology Act, 2000 and Consumer Protection Act). Any disputes relating to this notice shall be subject to the exclusive jurisdiction of the competent courts in Sangamner / Ahmednagar, Maharashtra, India.
            </p>
            <div className="space-y-1 text-xs text-zinc-400 pt-2 leading-relaxed">
              <p><strong className="text-zinc-200">Entity Name:</strong> Producer Toy Pvt. Ltd.</p>
              <p><strong className="text-zinc-200">Headquarters:</strong> Producer Toy Studios, Sangamner, Maharashtra - 422605, India</p>
              <p><strong className="text-zinc-200">Contact Email:</strong> <a href="mailto:support@producertoy.com" className="text-[#FC6301] hover:underline">support@producertoy.com</a></p>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
