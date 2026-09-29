import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import {
  ArrowRight,
  ShieldCheck,
  DownloadCloud,
  Headphones,
  Sliders,
  Music2,
  Cpu,
  Layers,
  Award,
  Zap,
  CheckCircle2,
  Gift
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
      {/* 1. HERO BANNER WITH DEEP BOTTOM OPACITY DISSOLVE                          */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#121212]">
        {/* Full Bleed Wide Hero Banner Graphic */}
        <div className="relative w-full flex items-center justify-center bg-black overflow-hidden">
          <img
            src="/about-us-banner.webp"
            alt="About Us - Producer Toy"
            className="w-full h-auto object-cover object-center max-h-[540px] sm:max-h-[660px] xl:max-h-[760px]"
            loading="eager"
          />

          {/* Precise Bottom Opacity Dissolve Gradient: Starts strictly BELOW the Mascot and ABOUT US text */}
          <div className="absolute inset-x-0 bottom-0 h-20 sm:h-28 md:h-36 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-10 sm:h-16 bg-gradient-to-t from-[#121212] to-transparent pointer-events-none" />

          {/* Subtle side feathering on ultra-wide screens */}
          <div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#121212]/50 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#121212]/50 to-transparent pointer-events-none" />
        </div>

        {/* Hero Narrative & Call-To-Action (Minimalistic Homepage Style) */}
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-14 sm:pb-20 relative z-10">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12] text-white">
              Open to all music creators, sound designers, and audio developers
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              Producer Toy is where the world’s best music software developers, sample crafters, and audio engineers sell their VST plugins, instruments, and studio tools to modern beatmakers and DJs worldwide.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/store"
                prefetch={true}
                className="px-7 py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-sm rounded-xl transition-colors tracking-wide active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>EXPLORE OUR PRODUCTS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/distribute"
                prefetch={true}
                className="px-7 py-3.5 bg-[#202024] hover:bg-[#28282e] text-zinc-200 hover:text-white border border-white/10 font-bold text-sm rounded-xl transition-colors tracking-wide active:scale-95 cursor-pointer"
              >
                DISTRIBUTE WITH US
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area - Aligned exactly with Homepage max-w-[1440px] */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 space-y-16 sm:space-y-20">

        {/* ========================================================================= */}
        {/* 2. THREE MINIMALISTIC FEATURE CARDS (HOMEPAGE THEME MATCH)                */}
        {/* ========================================================================= */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            
            {/* Card 1: More than just a marketplace */}
            <div className="bg-[#202020] hover:bg-[#242428] border border-white/[0.06] hover:border-white/15 rounded-2xl p-7 space-y-5 transition-colors flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-white flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">More than just a marketplace</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                  Customer ratings, industry reviews, live audio previews, and in-depth tutorials help you compare instruments and soundbanks tailored directly to your DAW and genre.
                </p>
              </div>
              <Link
                href="/store"
                prefetch={true}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-zinc-300 transition-colors pt-2"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 2: Exclusive Free Gifts with Orders */}
            <div className="bg-[#202020] hover:bg-[#242428] border border-white/[0.06] hover:border-white/15 rounded-2xl p-7 space-y-5 transition-colors flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-white flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Exclusive Free Gifts with Orders</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                  Unlock complimentary soundbanks, sample packs, and select VST software plugins on eligible orders. Expand your producer toolkit with zero extra cost.
                </p>
              </div>
              <Link
                href="/gifts"
                prefetch={true}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-zinc-300 transition-colors pt-2"
              >
                <span>Discover Free Gifts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 3: Centralized Library */}
            <div className="bg-[#202020] hover:bg-[#242428] border border-white/[0.06] hover:border-white/15 rounded-2xl p-7 space-y-5 transition-colors flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-white flex items-center justify-center">
                  <DownloadCloud className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">One Unified Creator Library</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                  Never juggle passwords across dozens of manufacturer sites. Your Producer Toy Library provides instant serial keys, direct cloud downloads, and update notices in one place.
                </p>
              </div>
              <Link
                href="/library"
                prefetch={true}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-zinc-300 transition-colors pt-2"
              >
                <span>Access Your Library</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2.5 FOUNDER SPOTLIGHT BILLBOARD (1:1 EPIC SPOTLIGHT BANNER STYLE)        */}
        {/* ========================================================================= */}
        <section className="w-full">
          <div className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#1a1a1e] flex flex-col lg:flex-row items-center justify-between select-none shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
            
            {/* Background Studio Ambience & Neon Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#18181c] to-[#141418] pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#FC6301]/10 blur-[100px] pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-80 h-80 rounded-full bg-blue-500/5 blur-[90px] pointer-events-none" />

            {/* Left Column: Founder Story & Narrative */}
            <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-2xl space-y-4 sm:space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.06] border border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                <span>FOUNDER &amp; CREATIVE DIRECTOR</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                Founded by Naiem Shaikh
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                Producer Toy was built from the ground up by music producer and creative director Naiem Shaikh with a clear vision: to give music makers a modern, creator-first destination for high-quality audio tools.
              </p>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                Frustrated by fragmented manufacturer portals and clunky licensing systems, Naiem engineered Producer Toy to streamline everything into one unified library — empowering beatmakers, audio engineers, and sound designers worldwide to stay focused on making great music.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/store"
                  prefetch={true}
                  className="inline-flex items-center justify-center min-w-[150px] sm:min-w-[175px] h-[44px] bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-lg active:scale-95 transition-colors cursor-pointer"
                >
                  Explore Our Products
                </Link>

                <Link
                  href="/distribute"
                  prefetch={true}
                  className="inline-flex items-center justify-center px-6 h-[44px] bg-[#202024] hover:bg-[#28282e] text-zinc-200 hover:text-white border border-white/10 font-bold text-sm rounded-lg active:scale-95 transition-colors cursor-pointer"
                >
                  Join as Developer
                </Link>
              </div>
            </div>

            {/* Right Column: Founder Cutout Image */}
            <div className="relative z-10 w-full lg:w-[48%] flex items-end justify-center lg:justify-end px-6 sm:px-10 lg:pr-14 pt-4 lg:pt-0">
              <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[430px] aspect-[4/5] flex items-end justify-center">
                <img
                  src="/naiem-shaikh-founder.webp"
                  alt="Naiem Shaikh - Founder of Producer Toy"
                  className="w-full h-auto object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] max-h-[460px] lg:max-h-[500px]"
                  loading="eager"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. STORY & MISSION (MINIMALISTIC HOMEPAGE ACCENT)                         */}
        {/* ========================================================================= */}
        <section>
          <div className="bg-[#202020] border border-white/[0.06] rounded-2xl p-8 sm:p-12 lg:p-14 space-y-8">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                Your next chapter in music production starts now
              </h2>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
                Whether you are an aspiring DJ, a bedroom beatmaker experimenting with your first 808s, or a seasoned producer engineering commercial records, Producer Toy is your premier launchpad. Every plugin discovery, sound design experiment, and audio exploration brings you closer to the music in your head.
              </p>
            </div>

            {/* 4 Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/[0.06]">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-white/90" />
                  <h4 className="font-bold text-white text-sm">Instant Fulfillment</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Serial keys and download links are instantly generated upon successful checkout.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-white/90" />
                  <h4 className="font-bold text-white text-sm">Free Gifts Always</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Unlock complimentary audio software, sample packs, and synth presets on select orders.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-white/90" />
                  <h4 className="font-bold text-white text-sm">DAW Agnostic</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Full compatibility verified for FL Studio, Ableton Live, Logic Pro, Cubase, and Studio One.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-white/90" />
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
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Discover the Producer Toy Catalog
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
              From analog modeled synths to pristine drum sample collections, browse everything you need to finish your next record.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <Link
              href="/categories/instruments"
              prefetch={true}
              className="p-5 rounded-xl bg-[#202020] hover:bg-[#252528] border border-white/[0.06] hover:border-white/15 transition-colors text-center space-y-2.5 group flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-zinc-300 group-hover:text-white transition-colors flex items-center justify-center">
                <Music2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Instruments</h4>
              <p className="text-[11px] text-zinc-400">Synths & Romplers</p>
            </Link>

            <Link
              href="/categories/effects"
              prefetch={true}
              className="p-5 rounded-xl bg-[#202020] hover:bg-[#252528] border border-white/[0.06] hover:border-white/15 transition-colors text-center space-y-2.5 group flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-zinc-300 group-hover:text-white transition-colors flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Effects</h4>
              <p className="text-[11px] text-zinc-400">Reverb, Delay, EQ</p>
            </Link>

            <Link
              href="/store/sounds"
              prefetch={true}
              className="p-5 rounded-xl bg-[#202020] hover:bg-[#252528] border border-white/[0.06] hover:border-white/15 transition-colors text-center space-y-2.5 group flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-zinc-300 group-hover:text-white transition-colors flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Sounds</h4>
              <p className="text-[11px] text-zinc-400">Samples & Loops</p>
            </Link>

            <Link
              href="/categories/studio-tools"
              prefetch={true}
              className="p-5 rounded-xl bg-[#202020] hover:bg-[#252528] border border-white/[0.06] hover:border-white/15 transition-colors text-center space-y-2.5 group flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-zinc-300 group-hover:text-white transition-colors flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Studio Tools</h4>
              <p className="text-[11px] text-zinc-400">Meters & Utility</p>
            </Link>

            <Link
              href="/categories/bundles"
              prefetch={true}
              className="p-5 rounded-xl bg-[#202020] hover:bg-[#252528] border border-white/[0.06] hover:border-white/15 transition-colors text-center space-y-2.5 group flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-zinc-300 group-hover:text-white transition-colors flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Bundles</h4>
              <p className="text-[11px] text-zinc-400">Save Up to 80%</p>
            </Link>

            <Link
              href="/free-vst-plugins"
              prefetch={true}
              className="p-5 rounded-xl bg-[#202020] hover:bg-[#252528] border border-white/[0.06] hover:border-white/15 transition-colors text-center space-y-2.5 group flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-white flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">100% Free</h4>
              <p className="text-[11px] text-zinc-400">Zero Cost Tools</p>
            </Link>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. BOTTOM CTA (HOMEPAGE MATCHING MINIMALISTIC BUTTONS)                     */}
        {/* ========================================================================= */}
        <section className="pt-2 pb-2 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Ready to elevate your sound?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join thousands of music makers discovering fresh tools and sample packs every day on Producer Toy.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/store"
              prefetch={true}
              className="px-8 py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-sm rounded-xl transition-colors active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All Producer Toys</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/support"
              prefetch={true}
              className="px-8 py-3.5 bg-[#202024] hover:bg-[#28282e] text-zinc-300 hover:text-white border border-white/10 font-bold text-sm rounded-xl transition-colors active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Headphones className="w-4 h-4" />
              <span>Visit Support &amp; FAQ</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
