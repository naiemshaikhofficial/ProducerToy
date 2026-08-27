'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Minus, ChevronRight } from 'lucide-react'

const FAQ_ITEMS = [
  {
    question: 'What is the Toywards Program?',
    answer:
      'Toywards is a loyalty rewards program where you earn rewards on any Producer Toy Store purchase—including sample packs, sound kits, synth presets, DAW templates, and audio plugins. You can spend your accumulated Toywards at checkout for direct discounts on your next orders.'
  },
  {
    question: 'How do I join the Toywards program?',
    answer:
      'All Producer Toy account holders are automatically enrolled in the Toywards program as soon as they create an account and accept our End User License Agreement and Terms of Service. There are no extra sign-up fees or subscriptions required.'
  },
  {
    question: 'How do I earn Toywards?',
    answer:
      'When you make a purchase on exclusive Producer Toy originals and featured sound collections, you can earn up to 20% back in Toywards. For all other store catalog purchases, you will automatically get 5% back. The exact amount of Toywards you earn is displayed right in your checkout order summary and on every product page before you buy.'
  },
  {
    question: 'When do I receive my Toywards after purchase?',
    answer:
      'Toywards are granted depending on the type of content purchased:\n• For instant digital downloads and non-refundable sound kits, your rewards are granted instantly to your Rewards Balance.\n• For other purchases, rewards are deposited in full alignment with our standard purchase policy.'
  },
  {
    question: 'Where can I check my Toywards balance?',
    answer:
      'You can check your current Toywards balance anytime in your Account Settings under the Rewards & Wallet tab. There, you will find additional information including your active balance, pending rewards, and full redemption history.'
  },
  {
    question: 'How do I redeem Toywards at checkout?',
    answer:
      'You can easily apply your available Toywards directly during the checkout flow on desktop, tablet, and mobile. The selected reward amount is deducted directly from your order total before payment.'
  },
  {
    question: 'Do Toywards expire?',
    answer:
      'Yes, Toywards expire 25 months from the date on which they were granted to your Rewards Balance, giving you more than 2 full years to spend them on new sounds and plugins.'
  },
  {
    question: 'Is there a maximum cap on Toywards balance?',
    answer:
      'Yes. Your Toywards balance is capped at USD $500 (or equivalent in your local currency, such as INR). If a purchase would push you over the limit, you will receive the portion of the rewards that keeps you within the cap.'
  },
  {
    question: 'Can Toywards be combined with sales and coupons?',
    answer:
      'Yes! Toywards can be combined together with ongoing store sale discounts, bundle promotions, and creator coupon codes for maximum savings.'
  },
  {
    question: 'What happens to Toywards if I request a refund?',
    answer:
      'If your purchase is eligible for a refund under our Refund Policy, any Toywards earned from that purchase will be deducted from your balance. If you used Toywards to pay for a refunded purchase, those Toywards will be returned to your Rewards Balance.'
  },
  {
    question: 'Can Toywards be transferred between accounts or cashed out?',
    answer:
      'No. Transferring Toywards between different accounts is not permitted. Toywards have no cash value outside of Producer Toy Store and cannot be traded, transferred, or exchanged for physical currency.'
  }
]

export default function ToywardsFeaturePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  return (
    <main className="min-h-screen bg-[#121212] text-white select-none pb-24 font-sans">
      
      {/* Container wrapper */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-16 sm:space-y-24">
        
        {/* ========================================================================= */}
        {/* HERO SECTION: 1:1 Epic Games Store Layout with Orange Poster Theme        */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1c1109] via-[#120b06] to-[#0a0603] border border-[#3d200f] shadow-2xl p-6 sm:p-10 lg:p-14">
          
          {/* Subtle Warm Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FA742B]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            
            {/* Left Column: 3D Illustration (Static - No hover effects) */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="relative w-full max-w-[480px] aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src="/images/toywards/hero.jpg"
                  alt="Earn from 5% to 20% with Toywards"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right Column: Title -> SHOP NOW Button -> Text -> Terms Link (Exact Screenshot 1 Match) */}
            <div className="lg:col-span-6 flex flex-col items-start space-y-6 text-left">
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
                Earn from 5% to 20% with Toywards
              </h1>

              <Link
                href="/store"
                prefetch={true}
                className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-md uppercase tracking-wider transition-colors shadow-lg active:scale-95 inline-flex items-center justify-center"
              >
                Shop Now
              </Link>

              <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed max-w-lg">
                Whenever you buy something on the Producer Toy Store, earn from 5% to 20% back with Toywards.
              </p>

              <Link
                href="/terms"
                prefetch={true}
                className="text-xs text-zinc-400 hover:text-white underline transition-colors"
              >
                Terms and Conditions Apply
              </Link>

            </div>

          </div>

        </section>


        {/* ========================================================================= */}
        {/* 3 STEPS CARDS: Shop, Earn, Redeem (Exact Screenshot 2 Match - Static)      */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* CARD 1: SHOP */}
            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center shadow-lg">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-6 rounded-2xl overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/toywards/shop.jpg"
                  alt="Shop sound kits and plugins"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                Shop
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">
                Buy games, add-ons, plugins, and sound kits across PC, Mac, and the web.
              </p>
            </div>

            {/* CARD 2: EARN */}
            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center shadow-lg">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-6 rounded-2xl overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/toywards/earn.jpg"
                  alt="Earn from 5% to 20% back"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                Earn
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">
                Earn from 5% to 20% back with Toywards when you make purchases using Producer Toy’s payment system.
              </p>
            </div>

            {/* CARD 3: REDEEM */}
            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center shadow-lg">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-6 rounded-2xl overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/toywards/redeem.jpg"
                  alt="Redeem Toywards at checkout"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                Redeem
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">
                Spend rewards on your next sounds, plugins, and expansions on the Producer Toy Store when you checkout.
              </p>
            </div>

          </div>

        </section>


        {/* ========================================================================= */}
        {/* FREQUENTLY ASKED QUESTIONS: Accordion (Exact Epic Games Match)             */}
        {/* ========================================================================= */}
        <section className="max-w-3xl mx-auto space-y-10 pt-4">
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center tracking-tight">
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-[#262626] border-t border-b border-[#262626]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div key={idx} className="py-5 sm:py-6">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                      {item.question}
                    </span>
                    <span className="text-zinc-400 group-hover:text-white transition-colors flex-shrink-0">
                      {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-4 text-sm sm:text-[15px] text-zinc-400 leading-relaxed font-normal whitespace-pre-line animate-in fade-in duration-150 pr-4">
                      {item.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Contact Support Prompt */}
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
