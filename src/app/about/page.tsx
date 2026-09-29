import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Gift,
  DownloadCloud,
  Headphones,
  Sliders,
  Music2,
  Cpu,
  Layers,
  Award,
  Zap,
  CheckCircle2,
  ExternalLink
} from 'lucide-react'

export const metadata: Metadata = generatePageMetadata({
  title: 'About Producer Toy — The Digital Audio Marketplace for Modern Music Creators',
  description:
    'Producer Toy is where the world’s best audio developers and sound designers sell VST plugins, sample packs, synth presets, and studio tools to music producers, sound engineers, and DJs worldwide.',
  path: '/about',
  keywords: [
    'About Producer Toy',
    'VST plugin store',
    'Sample pack marketplace',
    'Music production software',
    'Audio plugins for producers',
    'Producer Toy story',
    'Plugin Boutique alternative',
    'Digital audio tools',
  ],
})

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Producer Toy',
    description:
      'The modern digital audio marketplace for VST plugins, virtual instruments, sample packs, and music software.',
    url: 'https://producertoy.com/about',
    publisher: {
      '@type': 'Organization',
      name: 'Producer Toy',
      url: 'https://producertoy.com',
      logo: 'https://producertoy.com/Icon.png',
    },
  }

  return (
    <div className="w-full bg-[#121212] min-h-screen text-white select-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ========================================================================= */}
      {/* 1. HERO BANNER WITH BOTTOM OPACITY DISSOLVE (EPIC GAMES STYLE)            */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#121212]">
        {/* Full Bleed Wide Hero Banner Graphic */}
        <div className="relative w-full flex items-center justify-center bg-black overflow-hidden">
          <img
            src="/about-us-banner.png"
            alt="About Us - Producer Toy"
            className="w-full h-auto object-cover object-center max-h-[520px] sm:max-h-[640px] xl:max-h-[740px]"
            loading="eager"
          />

          {/* Bottom Opacity Dissolve Gradient (Melts into the #121212 page background) */}
          <div className="absolute inset-x-0 bottom-0 h-40 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-t from-[#121212] via-[#121212]/85 to-transparent pointer-events-none" />

          {/* Side Feathering on ultra-wide screens */}
          <div className="absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-[#121212]/60 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-[#121212]/60 to-transparent pointer-events-none" />

          {/* Top subtle shadow under header */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#121212]/60 to-transparent pointer-events-none" />
        </div>

        {/* Hero Narrative & Call-To-Action (Flows naturally below the dissolved banner) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pt-2 sm:pt-6 pb-12 sm:pb-16 relative z-10">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181c]/80 border border-white/10 text-xs font-semibold text-zinc-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#FC6301]" />
              <span>The Next Generation Audio Marketplace</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-white">
              Open to all music creators, sound designers, and audio developers
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              Producer Toy is where the world’s best music software developers, sample crafters, and audio engineers sell their VST plugins, instruments, and studio tools to modern beatmakers and DJs worldwide.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/store"
                prefetch={true}
                className="px-7 py-3.5 bg-[#FC6301] hover:bg-[#e05800] text-white font-bold text-sm rounded-xl transition-all shadow-[0_10px_25px_rgba(252,99,1,0.35)] active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>EXPLORE OUR PRODUCTS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/distribute"
                prefetch={true}
                className="px-7 py-3.5 bg-[#202024] hover:bg-[#28282e] text-zinc-200 hover:text-white border border-white/10 font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                DISTRIBUTE WITH US
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THREE EPIC FEATURE CARDS (EXACT SCREENSHOT LAYOUT MATCH)               */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pb-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          
          {/* Card 1: More than just a marketplace */}
          <div className="bg-[#18181c] border border-white/[0.08] hover:border-white/20 rounded-2xl p-7 space-y-4 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0078F2]/10 text-[#0078F2] flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">More than just a marketplace</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Customer ratings, industry reviews, live audio previews, and in-depth tutorials help you compare instruments and soundbanks tailored directly to your DAW and genre.
              </p>
            </div>
            <Link
              href="/store"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0078F2] hover:text-white transition-colors pt-2"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Toywards Rewards */}
          <div className="bg-[#18181c] border border-white/[0.08] hover:border-white/20 rounded-2xl p-7 space-y-4 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FC6301]/10 text-[#FC6301] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Toywards™ Virtual Cash Rewards</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Earn 5% Virtual Cash toward future purchases whenever you checkout on Producer Toy. Claim free soundbanks, sample packs, and exclusive discounts right at payment.
              </p>
            </div>
            <Link
              href="/features/toywards"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FC6301] hover:text-white transition-colors pt-2"
            >
              <span>Discover Toywards Rewards</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Centralized Library */}
          <div className="bg-[#18181c] border border-white/[0.08] hover:border-white/20 rounded-2xl p-7 space-y-4 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                <DownloadCloud className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">One Unified Creator Library</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Never juggle passwords across dozens of manufacturer sites. Your Producer Toy Library provides instant serial keys, direct cloud downloads, and update notices in one place.
              </p>
            </div>
            <Link
              href="/library"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#10B981] hover:text-white transition-colors pt-2"
            >
              <span>Access Your Library</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. "YOUR NEXT CHAPTER STARTS NOW" (STORY & MISSION)                       */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-20 sm:py-28">
        <div className="bg-gradient-to-br from-[#16161a] to-[#121214] border border-white/[0.08] rounded-3xl p-8 sm:p-14 lg:p-16 space-y-10 relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-zinc-300">
              <Zap className="w-3.5 h-3.5 text-[#FC6301]" />
              <span>Limitless Creativity</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Your next chapter in music production starts now
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
              Whether you are an aspiring DJ, a bedroom beatmaker experimenting with your first 808s, or a seasoned producer engineering commercial records, Producer Toy is your premier launchpad. Every plugin discovery, sound design experiment, and audio exploration brings you closer to the music in your head.
            </p>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-white/[0.06]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#0078F2]">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="font-bold text-white text-sm">Instant Fulfillment</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Serial keys and download links are instantly generated upon successful checkout.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#FC6301]">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="font-bold text-white text-sm">Free Gifts Always</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Unlock complimentary audio software, sample packs, and synth presets on select orders.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#10B981]">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="font-bold text-white text-sm">DAW Agnostic</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Full compatibility verified for FL Studio, Ableton Live, Logic Pro, Cubase, and Studio One.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#8B5CF6]">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="font-bold text-white text-sm">24/7 Support Desk</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Official audio engineering assistance for DAW troubleshooting, installation, and serial keys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DISCOVER WHAT'S INSIDE (CATEGORIES & CATALOG)                           */}
      {/* ========================================================================= */}
      <section className="bg-[#141416] border-y border-white/[0.08] py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Discover the Producer Toy Catalog
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
              From analog modeled synths to pristine drum sample collections, browse everything you need to finish your next record.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <Link
              href="/categories/instruments"
              prefetch={true}
              className="p-5 rounded-2xl bg-[#1a1a1e] hover:bg-[#222228] border border-white/[0.06] hover:border-white/20 transition-all text-center space-y-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0078F2]/10 text-[#0078F2] group-hover:scale-110 transition-transform mx-auto flex items-center justify-center">
                <Music2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Instruments</h4>
              <p className="text-[11px] text-zinc-400">Synths & Romplers</p>
            </Link>

            <Link
              href="/categories/effects"
              prefetch={true}
              className="p-5 rounded-2xl bg-[#1a1a1e] hover:bg-[#222228] border border-white/[0.06] hover:border-white/20 transition-all text-center space-y-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:scale-110 transition-transform mx-auto flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Effects</h4>
              <p className="text-[11px] text-zinc-400">Reverb, Delay, EQ</p>
            </Link>

            <Link
              href="/store/sounds"
              prefetch={true}
              className="p-5 rounded-2xl bg-[#1a1a1e] hover:bg-[#222228] border border-white/[0.06] hover:border-white/20 transition-all text-center space-y-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FC6301]/10 text-[#FC6301] group-hover:scale-110 transition-transform mx-auto flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Sounds</h4>
              <p className="text-[11px] text-zinc-400">Samples & Loops</p>
            </Link>

            <Link
              href="/categories/studio-tools"
              prefetch={true}
              className="p-5 rounded-2xl bg-[#1a1a1e] hover:bg-[#222228] border border-white/[0.06] hover:border-white/20 transition-all text-center space-y-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] group-hover:scale-110 transition-transform mx-auto flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Studio Tools</h4>
              <p className="text-[11px] text-zinc-400">Meters & Utility</p>
            </Link>

            <Link
              href="/categories/bundles"
              prefetch={true}
              className="p-5 rounded-2xl bg-[#1a1a1e] hover:bg-[#222228] border border-white/[0.06] hover:border-white/20 transition-all text-center space-y-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 group-hover:scale-110 transition-transform mx-auto flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Bundles</h4>
              <p className="text-[11px] text-zinc-400">Save Up to 80%</p>
            </Link>

            <Link
              href="/free-vst-plugins"
              prefetch={true}
              className="p-5 rounded-2xl bg-[#1a1a1e] hover:bg-[#222228] border border-[#FC6301]/30 hover:border-[#FC6301] transition-all text-center space-y-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FC6301]/20 text-[#FC6301] group-hover:scale-110 transition-transform mx-auto flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-[#FC6301]">100% Free</h4>
              <p className="text-[11px] text-zinc-400">Zero Cost Tools</p>
            </Link>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BOTTOM CTA (EXPLORE STORE & SUPPORT)                                   */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-8 lg:px-16 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Ready to elevate your sound?
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Join thousands of music makers discovering fresh tools and sample packs every day on Producer Toy.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/store"
            prefetch={true}
            className="px-8 py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-sm rounded-xl transition-all shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>Explore All Producer Toys</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/support"
            prefetch={true}
            className="px-8 py-3.5 bg-[#1e1e24] hover:bg-[#26262e] text-zinc-300 hover:text-white border border-white/10 font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Headphones className="w-4 h-4" />
            <span>Visit Support &amp; FAQ</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
