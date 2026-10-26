'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export interface FAQItem {
  id: string
  category: 'selling' | 'orders' | 'licenses' | 'refunds' | 'account' | 'daw'
  question: string
  answer: string
  details?: string[]
  tags: string[]
  linkUrl?: string
  linkText?: string
}

const FAQ_ITEMS: FAQItem[] = [
  // 1. Working with Producer Toy & Selling
  {
    id: 'sell-1',
    category: 'selling',
    question: 'How do I sell my VST plugins, sample packs, or synth presets on Producer Toy?',
    answer:
      'We welcome established audio developers, independent DSP engineers, sound designers, and sample label creators. You can distribute your virtual instruments, audio effects, soundbanks, and DAW templates to thousands of music creators worldwide.',
    details: [
      'Creators retain a guaranteed 70% net revenue split on digital sales with monthly itemized settlements.',
      'Settlements are issued by the 15th calendar day of the following month with no minimum payout threshold.',
      'We provide automated license key generation, cloud CDN hosting, and copy-protection delivery.',
      'To get started, submit your developer profile and product catalog on our Distribution portal.',
    ],
    tags: ['selling', 'distribute', 'developer', 'vendor', 'sample pack creator'],
    linkUrl: 'https://creators.producertoy.com',
    linkText: 'Apply to Distribute With Us',
  },
  {
    id: 'sell-pricing',
    category: 'selling',
    question: 'What is the commission split, deduction calculation order, and an example $19 sale?',
    answer:
      'Producer Toy operates on a transparent 70% Developer / 30% Platform Fee model on eligible net proceeds. Deductions are calculated in a clear, standardized order without hidden markups.',
    details: [
      '1. Start with the actual product price paid after any applicable discount.',
      '2. Exclude separately collected transaction taxes from the revenue-sharing calculation.',
      '3. Deduct the actual payment-processing fee (e.g. PayPal international 4.40% + $0.30 fixed fee) and any transaction-specific currency conversion charges.',
      '4. Split the remaining net sale proceeds: 70% to the Developer and 30% to Producer Toy.',
      '5. Deduct actual outbound bank transfer fees from the developer payout share, itemized separately without markup.',
      'Illustrative $19.00 Sale Example: Customer pays $19.00 → Payment processing fee (−$1.14) → Net proceeds before payout fee = $17.86 → Developer 70% share = $12.50 | Producer Toy 30% share = $5.36.',
      'For refunds or chargebacks, the relevant sale and commission are reversed or adjusted according to provider rules.',
    ],
    tags: ['commission', 'pricing structure', 'deductions', '70/30 split', 'revenue share', 'fees', 'example sale'],
    linkUrl: 'https://creators.producertoy.com',
    linkText: 'View Distribution Terms',
  },
  {
    id: 'sell-payout-methods',
    category: 'selling',
    question: 'When and how are developer payouts and settlements processed?',
    answer:
      'Settlements are processed on a regular monthly schedule rather than automated biweekly cycles, ensuring full itemization and reconciliation.',
    details: [
      'Settlements are manual, fully itemized monthly disbursements payable by the 15th calendar day of the following month.',
      'Zero minimum payout threshold — developers receive their exact earnings regardless of transaction volume.',
      'Payout methods include international bank wire / SWIFT transfer to your nominated corporate business account.',
      'Detailed monthly CSV accounting statements are provided showing every order, gross amount, processing deduction, and net developer retain.',
    ],
    tags: ['payout schedule', 'monthly payouts', 'wire transfer', 'swift', 'bank transfer', 'threshold'],
    linkUrl: 'https://creators.producertoy.com',
    linkText: 'Partner Settlement Details',
  },
  {
    id: 'sell-eula-hierarchy',
    category: 'selling',
    question: 'How do developer product licenses work with Producer Toy\'s terms (Order of Precedence)?',
    answer:
      'We protect both creators and buyers through a defined legal order of precedence where product-specific developer terms govern the software.',
    details: [
      '1. Producer Toy EULA & Platform Terms: Govern user accounts, marketplace access, checkout security, and platform operations.',
      '2. Developer Product-Specific License (EULA): Directly governs the permitted use of the specific audio plugin, machine activations, computer seats, and developer restrictions, explicitly taking precedence on those product matters.',
      '3. Mandatory Applicable Law: Takes precedence where required by governing statute.',
      'Buyers are presented with and accept the developer\'s specific product license and seat activation terms before purchase.',
    ],
    tags: ['eula', 'product license', 'order of precedence', 'terms', 'machine seats', 'activations'],
    linkUrl: '/eula',
    linkText: 'Read Full EULA Agreement',
  },
  {
    id: 'sell-support-model',
    category: 'selling',
    question: 'Who handles customer support: Producer Toy or the independent software/soundware seller?',
    answer:
      'Customer support is structured under a clear Universal Multi-Vendor Responsibility Model that clearly divides platform infrastructure from product-specific software support.',
    details: [
      'Producer Toy Platform Responsibilities: Customer accounts, authentication, checkout billing, order receipts, download library infrastructure, platform CDN delivery, and gateway refund/chargeback coordination.',
      'Seller / Brand Responsibilities: Product descriptions, system compatibility (OS/DAW), installation guides, license activation/serial keys, audio DSP glitches, software bug fixes, and product-specific troubleshooting.',
      'Joint Cooperation: Both parties cooperate on failed digital delivery, license key investigations, refund triage, and security incident response.',
      'Cause-Based Allocation: Issues are investigated based on cause: Producer Toy resolves platform/delivery failures, while the seller resolves software bugs and activation rules.',
    ],
    tags: ['support responsibility', 'multi-vendor', 'customer support', 'troubleshooting', 'developer role', 'platform role'],
    linkUrl: '/support',
    linkText: 'Visit Customer Support Desk',
  },
  {
    id: 'sell-2',
    category: 'selling',
    question: 'Do you have an affiliate program for producers, YouTubers, and educators?',
    answer:
      'Yes! The Producer Toy Affiliate Partner Program allows producers, music tech reviewers, and audio communities to earn generous commissions on all referred sales.',
    details: [
      'Earn competitive commission rates on all eligible VST plugin and sound library purchases.',
      'Access real-time conversion dashboards, custom tracking links, and official high-resolution banners.',
      'Transparent 30-day cookie window and reliable monthly payouts via PayPal or Bank Transfer.',
    ],
    tags: ['affiliate', 'earn money', 'partner', 'referral', 'commissions'],
    linkUrl: '/contact',
    linkText: 'Inquire About Affiliate Program',
  },
  {
    id: 'sell-3',
    category: 'selling',
    question: 'What marketing and promotion does Producer Toy provide for seller releases?',
    answer:
      'Every approved release on Producer Toy is featured across our curated storefront, weekly newsletter blasts, dedicated news articles, social media channels, and eligible free gift promotions to give your audio brand maximum visibility.',
    tags: ['promotion', 'marketing', 'newsletter', 'developer spotlight'],
    linkUrl: 'https://creators.producertoy.com',
    linkText: 'Learn About Creator Promotion',
  },

  // 2. Orders, Wishlist & Free Gifts
  {
    id: 'ord-1',
    category: 'orders',
    question: 'Where is my wishlist and how do I save products for later?',
    answer:
      'Your Wishlist is always easily accessible from the bookmark icon in the top header bar or directly at producertoy.com/wishlist. You can save any VST plugin, effect, or sample pack by clicking the bookmark/heart icon on any product card.',
    details: [
      'Wishlists sync across devices when you are logged into your Producer Toy account.',
      'You will receive automatic deal alert notifications whenever your saved items go on sale or receive a discount.',
      'Easily transfer single items or your entire wishlist straight to your cart with one click.',
    ],
    tags: ['wishlist', 'save items', 'bookmark', 'deals notification'],
    linkUrl: '/wishlist',
    linkText: 'Go to My Wishlist',
  },
  {
    id: 'ord-2',
    category: 'orders',
    question: 'How do complimentary Free Gifts work with my purchase?',
    answer:
      'Every eligible purchase on Producer Toy qualifies for exclusive bonus software or sound libraries. On qualifying promotional periods, you can choose from premium VST plugins, vocal effects, Serum presets, or curated sample kits at zero extra cost during checkout.',
    details: [
      'Eligible gifts appear directly in your cart drawer as selectable options before completing payment.',
      'Once checkout is complete, your chosen gift license and download mirror are instantly added to your Library.',
      'Free gifts receive the same full developer license, authorization, and updates as retail purchases.',
    ],
    tags: ['free gift', 'bonus plugin', 'promotion', 'checkout reward'],
    linkUrl: '/gifts',
    linkText: 'Discover Current Free Gifts',
  },
  {
    id: 'ord-3',
    category: 'orders',
    question: 'How quickly will I receive my serial keys and download links after checkout?',
    answer:
      'All digital orders are fulfilled instantaneously. Once payment processing completes (via Card, UPI, PayPal, or Net Banking), your unique serial keys, direct cloud downloads, and official receipt are immediately generated in your Producer Toy Library and emailed to your registered address.',
    tags: ['instant delivery', 'serial key', 'order confirmation', 'download speed'],
    linkUrl: '/library',
    linkText: 'View My Library',
  },
  {
    id: 'ord-4',
    category: 'orders',
    question: 'Where can I download my official tax invoice or purchase receipt?',
    answer:
      'Official GST / VAT compliant invoices can be downloaded anytime. Log in and navigate to "Account Settings" > "Transactions & Invoices", then click "Download PDF" next to the corresponding order number.',
    tags: ['tax invoice', 'gst', 'receipt', 'business expense', 'vat'],
    linkUrl: '/account',
    linkText: 'Go to Account Settings',
  },

  // 3. Licenses, Activations & Downloads
  {
    id: 'lic-1',
    category: 'licenses',
    question: 'How do I retrieve or view my purchased license keys?',
    answer:
      'Visit your "My Library" page (/library) while logged in. Every purchased VST, instrument, or sound expansion displays its license code with a convenient one-click "Copy Key" button, developer authorization link, and step-by-step setup guide.',
    tags: ['license key', 'retrieve', 'my library', 'serial number'],
    linkUrl: '/library',
    linkText: 'Open Creator Library',
  },
  {
    id: 'lic-2',
    category: 'licenses',
    question: 'On how many computers can I install and activate my plugin?',
    answer:
      'Most developer licenses (such as Universal Audio, Waves, FabFilter, Arturia, Soundtoys, and Native Instruments) permit installation on 2 to 3 personal computers (for example, your studio desktop and travel laptop) for single-user operation. Specific machine activation limits are always listed under the Specifications tab on each product page.',
    tags: ['multiple computers', 'activations', 'mac and pc', 'eula', 'seats'],
  },
  {
    id: 'lic-3',
    category: 'licenses',
    question: 'Do I need a physical iLok USB dongle for plugin activations?',
    answer:
      'No physical dongle is needed for virtually all modern audio plugins. Unless explicitly stated in the product requirements, authorization is handled via iLok Cloud, host computer machine authorization, or direct developer account activation.',
    tags: ['ilok', 'usb dongle', 'cloud authorization', 'activation'],
  },
  {
    id: 'lic-4',
    category: 'licenses',
    question: 'My download was interrupted or is running slowly. How do I resume?',
    answer:
      'Producer Toy hosts high-speed Google Cloud CDN mirrors for all product installers. If your network connection drops, simply click "Download" again in your Library to resume. For large sample libraries (10GB+), we recommend using a stable broadband connection or a modern browser with download resuming.',
    tags: ['download resume', 'slow download', 'google cloud cdn', 'installer'],
  },

  // 4. Refunds & Buyer Protection
  {
    id: 'ref-1',
    category: 'refunds',
    question: 'What is your refund policy for software plugins and sample packs?',
    answer:
      'Due to the digital nature of software licenses and audio sample packs, unlocked serial keys and downloaded sound libraries are generally non-refundable once registered or unsealed. However, we offer complete buyer protection under our Technical Support Guarantee.',
    details: [
      'If you encounter a confirmed technical defect, crash, or licensing failure that our engineering team and the developer cannot resolve within 14 days, a full refund or store replacement will be issued.',
      'Trial versions and audio demos are provided on product pages so you can verify DAW compatibility before purchase.',
      'Accidental duplicate purchases of the same product under the same account are refunded promptly.',
    ],
    tags: ['refund policy', 'money back guarantee', 'technical defect', 'returns'],
    linkUrl: '/refund-policy',
    linkText: 'Read Full Refund Policy',
  },
  {
    id: 'ref-2',
    category: 'refunds',
    question: 'What is the Third-Party Manufacturer Refund Policy?',
    answer:
      'Producer Toy is an authorized reseller for world-class audio developers. In certain cases involving manufacturer-specific licensing or cloud subscriptions, refund requests are reviewed in conjunction with the original developer to ensure fair resolution for both the creator and the customer.',
    tags: ['manufacturer policy', 'third party', 'developer terms', 'authorized dealer'],
    linkUrl: '/support?tab=raise-ticket',
    linkText: 'Submit Refund or Support Inquiry',
  },

  // 5. Account, Verification & Login
  {
    id: 'acc-1',
    category: 'account',
    question: "I can't log into my account. How do I regain access?",
    answer:
      'If you forgot your password, click "Forgot Password" on the sign-in page to receive a secure one-click reset link via email. If you originally signed in with Google or Magic Link, ensure you are using the exact same email address associated with your license purchases.',
    tags: ['login issue', 'forgot password', 'reset password', 'account access'],
    linkUrl: '/reset-password',
    linkText: 'Reset Account Password',
  },
  {
    id: 'acc-2',
    category: 'account',
    question: 'Why does my order say "Verification Needed"?',
    answer:
      'To safeguard both creators and customers against credit card fraud, our automated risk engine occasionally flags first-time international orders for brief identity verification. Once verified (usually within 15–30 minutes), your license keys and downloads release automatically.',
    tags: ['order verification', 'fraud prevention', 'pending order', 'security'],
    linkUrl: '/support?tab=track-ticket',
    linkText: 'Check Order Verification Status',
  },
  {
    id: 'acc-3',
    category: 'account',
    question: 'How can I download the trial version of a plugin before buying?',
    answer:
      'Many virtual instruments and mixing effects feature free trials or demo versions. Check the product specifications tab on the product page for the official trial download link, allowing you to test sound quality and CPU performance inside your DAW with zero obligation.',
    tags: ['trial version', 'plugin demo', 'free trial', 'try before buy'],
    linkUrl: '/free-vst-plugins',
    linkText: 'Explore Free VSTs & Trials',
  },

  // 6. DAW Setup & Technical Troubleshooting
  {
    id: 'daw-1',
    category: 'daw',
    question: 'My new VST3 plugin is not showing up in FL Studio. What should I do?',
    answer:
      'In FL Studio, go to Options > Manage Plugins. Check "Rescan previously verified plugins" and "Verify plugins". Ensure "C:\\Program Files\\Common Files\\VST3" (Windows) or "/Library/Audio/Plug-Ins/VST3" (macOS) is in your search folders list, then click "Find installed plugins".',
    details: [
      'Verify that the plugin format (64-bit VST3) matches your FL Studio installation.',
      'Check if authorization software (iLok License Manager or developer portal) has completed the activation.',
      'Restart FL Studio after scanning to allow the plugin browser tree to refresh.',
    ],
    tags: ['fl studio', 'vst scan', 'plugin missing', 'rescan fl', 'image line'],
  },
  {
    id: 'daw-2',
    category: 'daw',
    question: 'How do I scan and locate plugins in Ableton Live on macOS & Windows?',
    answer:
      'In Ableton Live, open Preferences (Cmd+, or Ctrl+,) > Plug-Ins tab. Ensure "Use VST3 Plug-In System Folders" is turned ON. Hold down the Alt/Option key while clicking "Rescan" to force Ableton to execute a complete deep rescan of all audio plugins.',
    tags: ['ableton live', 'rescan ableton', 'vst3 folder', 'au', 'preferences'],
  },
  {
    id: 'daw-3',
    category: 'daw',
    question: 'Are Producer Toy plugins compatible with Apple Silicon (M1/M2/M3/M4) & macOS Sequoia?',
    answer:
      'Yes! All software listed on Producer Toy displays Native Apple Silicon ARM64 and macOS Sequoia/Sonoma compatibility in the System Requirements tab. Most plugins run natively with ultra-low CPU latency, while older legacy builds run effortlessly via Apple Rosetta 2.',
    tags: ['apple silicon', 'm1', 'm2', 'm3', 'm4', 'macos sequoia', 'arm64'],
  },
  {
    id: 'daw-4',
    category: 'daw',
    question: 'Logic Pro displays "Audio Unit plugin could not be opened". How to fix?',
    answer:
      'In Logic Pro, navigate to Settings > Plug-in Manager. Search for the affected plugin, select it, and click "Reset & Rescan Selection". If macOS Gatekeeper blocks the component, navigate to Apple System Settings > Privacy & Security and click "Open Anyway".',
    tags: ['logic pro', 'audio unit', 'gatekeeper', 'apple', 'plugin manager'],
  },
]

export function FaqPageClient() {
  const [openValues, setOpenValues] = useState<string[]>([])

  const expandAll = () => {
    setOpenValues(FAQ_ITEMS.map((f) => f.id))
  }

  const collapseAll = () => {
    setOpenValues([])
  }

  return (
    <div className="w-full bg-[#121212] min-h-screen text-white select-none">
      <div className="w-full max-w-[960px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 sm:pb-24 space-y-6 sm:space-y-8">
        
        {/* Sleek, Framed Mascot Banner (Black & White Hero) */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-black aspect-[3/1] max-h-[220px] sm:max-h-[280px] flex items-center justify-center shadow-2xl">
          <picture className="w-full h-full flex items-center justify-center grayscale contrast-125">
            <source srcSet="/neon-faq-mascot-banner.webp" type="image/webp" />
            <img
              src="/Neon FAQ Mascot Banner.png"
              alt="Producer Toy FAQ Banner"
              className="w-full h-full object-cover object-center grayscale contrast-125"
              loading="eager"
            />
          </picture>
        </div>

        {/* Centered Minimalist Title */}
        <div className="text-center pt-2 sm:pt-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h1>
        </div>

        {/* Expand / Collapse & Question Count */}
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1 border-b border-white/[0.06] pb-3">
          <span>
            {FAQ_ITEMS.length} questions
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={expandAll}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-zinc-600">•</span>
            <button
              onClick={collapseAll}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* FAQ Accordions */}
        <Accordion
          type="multiple"
          variant="filled"
          indicator="plus"
          value={openValues}
          onValueChange={setOpenValues}
          className="w-full space-y-2.5"
        >
          {FAQ_ITEMS.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="bg-[#16161a] hover:bg-[#1a1a20] transition-colors rounded-xl border border-white/[0.04]"
            >
              <AccordionTrigger className="px-4 sm:px-5 py-3.5 sm:py-4 text-left text-sm sm:text-base font-semibold text-white tracking-tight leading-snug hover:text-white">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 sm:px-5 pb-4 pt-1 space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/[0.04]">
                <p className="pt-2 font-normal text-zinc-300">{faq.answer}</p>

                {faq.details && faq.details.length > 0 && (
                  <ul className="space-y-1.5 pt-1 pl-1">
                    {faq.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-zinc-400 text-xs sm:text-sm">
                        <span className="text-zinc-500 mt-0.5">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {faq.linkUrl && faq.linkText && (
                  <div className="pt-1">
                    <Link
                      href={faq.linkUrl}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-zinc-300 underline underline-offset-4"
                    >
                      <span>{faq.linkText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Minimalistic Ask Our Prody Section */}
        <div className="pt-10 sm:pt-14 pb-4 border-t border-white/[0.06] text-center">
          <div className="flex flex-col items-center space-y-3 max-w-md mx-auto">
            <Image
              src="/images/support-bot-logo.webp"
              alt="Prody"
              width={48}
              height={48}
              className="w-12 h-12 object-contain filter drop-shadow-sm opacity-90"
            />
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                Have more questions? Ask Our Prody
              </h2>
              <p className="text-xs text-zinc-400 font-normal">
                Instant AI answers for licenses, orders, DAW setup, and creator support.
              </p>
            </div>
            <div className="pt-1 flex items-center justify-center gap-3">
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer"
              >
                <span>Ask Prody</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/support?tab=raise-ticket"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#18181c] hover:bg-[#202024] text-zinc-300 hover:text-white border border-white/10 text-xs sm:text-sm rounded-lg transition-colors cursor-pointer"
              >
                <span>Submit a Ticket</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
