import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { FAQPageJsonLd } from '@/components/JsonLd'
import { ToywardsFaqAccordion } from './ToywardsFaqAccordion'

const FAQ_ITEMS = [
  {
    question: 'What is the Toywards Program?',
    answer:
      'Toywards is a loyalty rewards program where you earn rewards on any Producer Toy Store purchase—including sample packs, sound kits, synth presets, DAW templates, and audio plugins. You can spend your accumulated Toywards at checkout for direct discounts on your next orders.',
  },
  {
    question: 'How do I join the Toywards program?',
    answer:
      'All Producer Toy account holders are automatically enrolled in the Toywards program as soon as they create an account and accept our End User License Agreement and Terms of Service. There are no extra sign-up fees or subscriptions required.',
  },
  {
    question: 'How do I earn Toywards?',
    answer:
      'When you make a purchase on exclusive Producer Toy originals and featured sound collections, you can earn up to 20% back in Toywards. For all other store catalog purchases, you will automatically get 5% back. The exact amount of Toywards you earn is displayed right in your checkout order summary and on every product page before you buy.',
  },
  {
    question: 'When do I receive my Toywards after purchase?',
    answer:
      'Toywards are granted depending on the type of content purchased:\n• For instant digital downloads and non-refundable sound kits, your rewards are granted instantly to your Rewards Balance.\n• For other purchases, rewards are deposited in full alignment with our standard purchase policy.',
  },
  {
    question: 'Where can I check my Toywards balance?',
    answer:
      'You can check your current Toywards balance anytime in your Account Settings under the Rewards & Wallet tab. There, you will find additional information including your active balance, pending rewards, and full redemption history.',
  },
  {
    question: 'How do I redeem Toywards at checkout?',
    answer:
      'You can easily apply your available Toywards directly during the checkout flow on desktop, tablet, and mobile. The selected reward amount is deducted directly from your order total before payment.',
  },
  {
    question: 'Do Toywards expire?',
    answer:
      'Yes, Toywards expire 25 months from the date on which they were granted to your Rewards Balance, giving you more than 2 full years to spend them on new sounds and plugins.',
  },
  {
    question: 'Is there a maximum cap on Toywards balance?',
    answer:
      'Yes. Your Toywards balance is capped at USD $500 (or equivalent in your local currency, such as INR). If a purchase would push you over the limit, you will receive the portion of the rewards that keeps you within the cap.',
  },
  {
    question: 'Can Toywards be combined with sales and coupons?',
    answer:
      'Yes! Toywards can be combined together with ongoing store sale discounts, bundle promotions, and creator coupon codes for maximum savings.',
  },
  {
    question: 'What happens to Toywards if I request a refund?',
    answer:
      'If your purchase is eligible for a refund under our Refund Policy, any Toywards earned from that purchase will be deducted from your balance. If you used Toywards to pay for a refunded purchase, those Toywards will be returned to your Rewards Balance.',
  },
  {
    question: 'Can Toywards be transferred between accounts or cashed out?',
    answer:
      'No. Transferring Toywards between different accounts is not permitted. Toywards have no cash value outside of Producer Toy Store and cannot be traded, transferred, or exchanged for physical currency.',
  },
]

export const metadata: Metadata = generatePageMetadata({
  title: 'Toywards Loyalty Program — Earn 5% to 20% Back on Every Purchase',
  description:
    'Join the Producer Toy Toywards loyalty program. Earn 5% to 20% cashback in Toywards on audio plugins, sample packs, presets, and DAW templates. Redeemable 1:1 at checkout.',
  path: '/features/toywards',
  keywords: [
    'Toywards loyalty program',
    'Producer Toy rewards',
    'VST plugin cashback',
    'Sample pack rewards',
    'Music producer rewards program',
    'Audio plugin discount program',
  ],
})

export default function ToywardsFeaturePage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white select-none pb-24 font-sans">
      <FAQPageJsonLd faqs={FAQ_ITEMS} />
      
      {/* Container wrapper */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-16 sm:space-y-24">
        
        {/* HERO SECTION */}
        <section className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#141414] shadow-2xl min-h-[440px] sm:min-h-[480px] lg:h-[500px] flex items-center">
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <Image
              src="/images/toywards/hero_full.png"
              alt="Earn from 5% to 20% with Toywards"
              fill
              priority
              className="object-cover object-left lg:object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent lg:hidden" />
          </div>

          <div className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-12 items-center px-6 sm:px-10 lg:px-16 py-10 sm:py-12">
            <div className="hidden lg:block lg:col-span-6 xl:col-span-7 h-full" />

            <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-start space-y-5 sm:space-y-6 text-left mt-auto lg:mt-0">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-white leading-[1.12] drop-shadow-md">
                Earn from 5% to 20% with Toywards
              </h1>

              <Link
                href="/store"
                prefetch={true}
                className="bg-white hover:bg-zinc-100 text-black font-black text-xs sm:text-sm px-8 sm:px-9 py-3.5 rounded-md uppercase tracking-wider transition-all active:scale-95 shadow-xl inline-flex items-center justify-center"
              >
                Shop Now
              </Link>

              <p className="text-sm sm:text-base text-white/95 font-medium leading-relaxed max-w-md drop-shadow-sm">
                Whenever you buy something on the Producer Toy Store, earn from 5% to 20% back with Toywards.
              </p>

              <Link
                href="/eula"
                prefetch={true}
                className="text-xs text-white/80 hover:text-white underline transition-colors drop-shadow-xs"
              >
                Terms and Conditions Apply
              </Link>
            </div>
          </div>
        </section>

        {/* 3 STEPS CARDS */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center shadow-lg">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-6 flex items-center justify-center">
                <Image
                  src="/images/toywards/shop.png"
                  alt="Shop sound kits and plugins"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Shop</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">
                Buy plugins, sound kits, sample packs, presets, and DAW templates across PC, Mac, and the web.
              </p>
            </div>

            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center shadow-lg">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-6 flex items-center justify-center">
                <Image
                  src="/images/toywards/earn.png"
                  alt="Earn from 5% to 20% back"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Earn</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">
                Earn from 5% to 20% back with Toywards when you make purchases using Producer Toy’s payment system.
              </p>
            </div>

            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center shadow-lg">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-6 flex items-center justify-center">
                <Image
                  src="/images/toywards/redeem.png"
                  alt="Redeem Toywards at checkout"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Redeem</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">
                Spend rewards on your next sounds, plugins, and expansions on the Producer Toy Store when you checkout.
              </p>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="max-w-3xl mx-auto space-y-10 pt-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center tracking-tight">
            Frequently Asked Questions
          </h2>

          <ToywardsFaqAccordion items={FAQ_ITEMS} />

          <div className="text-center pt-6 space-y-3">
            <p className="text-xs text-zinc-400">
              Have more questions about your Toywards rewards or balance?
            </p>
            <Link
              href="/contact"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-zinc-300 bg-[#202020] hover:bg-[#282828] border border-[#2e2e2e] px-4 py-2 rounded-lg transition-colors"
            >
              <span>Contact Support</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </section>

      </div>
    </main>
  )
}
