'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sliders,
  Disc3,
  DownloadCloud,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'

const BRAND_FAQS = [
  {
    q: 'What is Producer Toy?',
    a: 'Producer Toy (producertoy.com) is the premier digital audio marketplace engineered for modern music producers, beatmakers, audio engineers, and sound designers. We provide studio-grade VST plugins, 100% royalty-free sample packs, synthesizer presets for Serum and Vital, and DAW project templates.',
  },
  {
    q: 'Is Producer Toy a physical toy store or toy manufacturer?',
    a: 'No. Producer Toy does not manufacture or sell physical children’s toys, dolls, or games. In music production culture, musicians and audio engineers affectionately refer to synthesizers, audio plugins, drum machines, and sample libraries as their creative "studio toys." Producer Toy is strictly a digital audio software and sound design platform.',
  },
  {
    q: 'Which Digital Audio Workstations (DAWs) are supported?',
    a: 'All software and sound products on Producer Toy are universally compatible with major DAWs including FL Studio, Ableton Live, Logic Pro, Cubase, Studio One, Reaper, Pro Tools, and Bitwig Studio on both Windows and macOS.',
  },
  {
    q: 'Are sample packs and sounds on Producer Toy 100% royalty-free?',
    a: 'Yes. Every sample pack, loop kit, drum kit, and one-shot library available on Producer Toy is 100% royalty-free for commercial music releases, beat leasing, YouTube monetization, Spotify streaming, and sync licensing without recurring splits.',
  },
  {
    q: 'How does digital delivery and licensing work on Producer Toy?',
    a: 'Immediately upon checkout or free claiming, you receive instant high-speed download links and official license serial keys. Your downloads are also stored permanently in your Producer Toy Library vault for unlimited future access.',
  },
]

export function HomeBrandSeoSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index))
  }

  // Schema.org FAQPage for Google Knowledge Graph & AI Overview
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: BRAND_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  return (
    <section className="w-full pt-10 sm:pt-14 pb-8 border-t border-[#222226]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Brand Mission & Semantic Authority Card */}
      <div className="bg-[#161618] border border-white/5 rounded-3xl p-6 sm:p-10 lg:p-12 mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FC6301]/10 border border-[#FC6301]/25 text-[#FC6301] text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Official Digital Marketplace
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Producer Toy — Premier Music Production VST Plugins, Samples &amp; Sounds
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal mb-6">
              Producer Toy (<span className="text-zinc-200 font-semibold">producertoy.com</span>) is the modern creative headquarters for music producers, beatmakers, and audio engineers. We offer industry-standard virtual instruments (VSTs), analog audio effects, 100% royalty-free sample packs, synth presets, and DAW project templates.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/categories/plugins"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
              >
                Browse VST Plugins
              </Link>
              <Link
                href="/categories/sounds"
                className="px-5 py-2.5 rounded-xl bg-[#222226] hover:bg-[#2c2c32] text-white font-bold text-xs sm:text-sm border border-white/5 transition-all cursor-pointer"
              >
                Explore Sample Packs
              </Link>
              <Link
                href="/free-vst-plugins"
                className="px-5 py-2.5 rounded-xl bg-[#FC6301]/15 hover:bg-[#FC6301]/25 text-[#FC6301] border border-[#FC6301]/30 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Free VST Plugins
              </Link>
            </div>
          </div>

          {/* Key Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 w-full lg:w-80 shrink-0">
            <div className="p-4 rounded-2xl bg-[#1c1c20] border border-white/5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FC6301]/10 border border-[#FC6301]/25 flex items-center justify-center text-[#FC6301] shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white mb-0.5">Studio-Grade VSTs</div>
                <div className="text-xs text-zinc-400 leading-snug">Analog saturators, surgical EQs, reverbs &amp; synths.</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1c1c20] border border-white/5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                <Disc3 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white mb-0.5">100% Royalty-Free</div>
                <div className="text-xs text-zinc-400 leading-snug">Commercial clearance for Spotify, YouTube &amp; sync.</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1c1c20] border border-white/5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <DownloadCloud className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white mb-0.5">Instant Digital Vault</div>
                <div className="text-xs text-zinc-400 leading-snug">Instant direct high-speed download &amp; license retrieval.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand FAQ Section for Google Entity Disambiguation */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            Frequently Asked Questions About Producer Toy
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Learn more about our digital audio workstation plugins, sounds, and licensing.
          </p>
        </div>

        <div className="space-y-3">
          {BRAND_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#161618] border border-white/5 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-zinc-100">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#FC6301]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
