'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  ChevronDown,
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
  Gift,
  HelpCircle,
  Key,
  ShoppingBag,
  FileText,
  UserCheck,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Laptop,
  Check
} from 'lucide-react'

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
      'Creators retain 70% to 80% net revenue split on digital sales with automated bi-weekly payouts.',
      'We provide automated license key generation, cloud CDN hosting, and copy-protection delivery.',
      'To get started, submit your developer profile and product links on our Distribution portal.',
    ],
    tags: ['selling', 'distribute', 'developer', 'vendor', 'sample pack creator'],
    linkUrl: '/distribute',
    linkText: 'Apply to Distribute With Us',
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
    linkUrl: '/distribute',
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

const CATEGORIES = [
  { id: 'all', label: 'All FAQs', icon: Layers },
  { id: 'selling', label: 'Working & Selling', icon: Award },
  { id: 'orders', label: 'Orders & Wishlist', icon: ShoppingBag },
  { id: 'licenses', label: 'Licenses & Downloads', icon: Key },
  { id: 'refunds', label: 'Refunds & Guarantee', icon: ShieldCheck },
  { id: 'account', label: 'Account & Verification', icon: UserCheck },
  { id: 'daw', label: 'DAW & Technical Setup', icon: Sliders },
]

export function FaqPageClient() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['ord-1', 'lic-1', 'sell-1']))

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    setOpenIds(new Set(filteredFaqs.map((f) => f.id)))
  }

  const collapseAll = () => {
    setOpenIds(new Set())
  }

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory
      if (!matchesCategory) return false

      if (!q) return true

      const inQuestion = item.question.toLowerCase().includes(q)
      const inAnswer = item.answer.toLowerCase().includes(q)
      const inTags = item.tags.some((t) => t.toLowerCase().includes(q))
      const inDetails = item.details?.some((d) => d.toLowerCase().includes(q))

      return inQuestion || inAnswer || inTags || inDetails
    })
  }, [activeCategory, searchQuery])

  return (
    <div className="w-full bg-[#121212] min-h-screen text-white select-none">
      
      {/* ========================================================================= */}
      {/* 1. HERO BANNER WITH DEEP BOTTOM OPACITY DISSOLVE (EXACT 1:1 WITH ABOUT US) */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#121212]">
        {/* Full Bleed Wide Hero Banner Graphic */}
        <div className="relative w-full flex items-center justify-center bg-black overflow-hidden">
          <img
            src="/about-us-banner.webp"
            alt="Frequently Asked Questions - Producer Toy"
            className="w-full h-auto object-cover object-center max-h-[540px] sm:max-h-[660px] xl:max-h-[760px]"
            loading="eager"
          />

          {/* Precise Bottom Opacity Dissolve Gradient: Starts strictly BELOW the Mascot & Header */}
          <div className="absolute inset-x-0 bottom-0 h-20 sm:h-28 md:h-36 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-10 sm:h-16 bg-gradient-to-t from-[#121212] to-transparent pointer-events-none" />

          {/* Subtle side feathering on ultra-wide screens */}
          <div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#121212]/50 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#121212]/50 to-transparent pointer-events-none" />
        </div>

        {/* Hero Narrative & Search Area (Matching About Us Max Width & Typography) */}
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-14 sm:pb-20 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.06] border border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-300">
              <HelpCircle className="w-3.5 h-3.5 text-[#FC6301]" />
              <span>FREQUENTLY ASKED QUESTIONS &amp; KNOWLEDGE BASE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12] text-white">
              Everything you need to know about Producer Toy
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              Find instant, clear answers to common questions about digital orders, license key retrieval, DAW setup, seller distribution, free gifts, and our buyer protection guarantee.
            </p>

            {/* Interactive Real-Time Search Bar */}
            <div className="relative pt-2 max-w-2xl">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 absolute left-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions, licenses, FL Studio, Ableton, refunds, selling..."
                  className="w-full bg-[#1e1e24] hover:bg-[#23232a] focus:bg-[#23232a] border border-white/10 focus:border-[#FC6301] text-white text-sm sm:text-base rounded-xl pl-12 pr-10 py-3.5 outline-none transition-all placeholder:text-zinc-500 shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/10 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons (1:1 with About Us Hero) */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/support?tab=raise-ticket"
                prefetch={true}
                className="px-7 py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-sm rounded-xl transition-colors tracking-wide active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>SUBMIT A TICKET</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/library"
                prefetch={true}
                className="px-7 py-3.5 bg-[#202024] hover:bg-[#28282e] text-zinc-200 hover:text-white border border-white/10 font-bold text-sm rounded-xl transition-colors tracking-wide active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Key className="w-4 h-4 text-zinc-400" />
                <span>MY LIBRARY &amp; LICENSES</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area - Aligned exactly with Homepage & About Us max-w-[1440px] */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-16 sm:space-y-20">

        {/* ========================================================================= */}
        {/* 2. THREE MINIMALISTIC FEATURE CARDS (HOMEPAGE & ABOUT PAGE THEME MATCH)   */}
        {/* ========================================================================= */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            
            {/* Card 1: Instant Fulfillment */}
            <div className="bg-[#202020] hover:bg-[#242428] border border-white/[0.06] hover:border-white/15 rounded-2xl p-7 space-y-5 transition-colors flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-white flex items-center justify-center">
                  <DownloadCloud className="w-5 h-5 text-[#FC6301]" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Instant Fulfillment</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                  Zero waiting. Your serial keys, cloud download mirrors, and verified invoices are unlocked immediately in your personal library upon checkout.
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

            {/* Card 2: Developer & Affiliate Program */}
            <div className="bg-[#202020] hover:bg-[#242428] border border-white/[0.06] hover:border-white/15 rounded-2xl p-7 space-y-5 transition-colors flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-white flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Sell &amp; Distribute</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                  Are you an audio developer or sound label? Sell directly to thousands of music makers with 70–80% revenue share and automated licensing.
                </p>
              </div>
              <Link
                href="/distribute"
                prefetch={true}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-zinc-300 transition-colors pt-2"
              >
                <span>Join as Developer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 3: 24/7 Audio Engineering Support */}
            <div className="bg-[#202020] hover:bg-[#242428] border border-white/[0.06] hover:border-white/15 rounded-2xl p-7 space-y-5 transition-colors flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-white flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Audio Tech Help Desk</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                  DAW crashes, missing VST3 folders, or activation errors? Our specialized audio engineering team is ready to troubleshoot and get you producing.
                </p>
              </div>
              <Link
                href="/support"
                prefetch={true}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-zinc-300 transition-colors pt-2"
              >
                <span>Visit Help Center</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. CATEGORY PILLS & MAIN FAQ ACCORDIONS                                  */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          
          {/* Section Header with Category Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Browse Answers by Category
              </h2>
              <p className="text-sm text-zinc-400 pt-1">
                Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </p>
            </div>

            {/* Expand / Collapse Controls */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 rounded-lg bg-[#202024] hover:bg-[#28282e] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 rounded-lg bg-[#202024] hover:bg-[#28282e] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-black shadow-md'
                      : 'bg-[#1e1e24] hover:bg-[#25252c] text-zinc-300 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Accordion FAQ List */}
          {filteredFaqs.length === 0 ? (
            <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No matching answers found</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                We could not find any FAQ matching &quot;{searchQuery}&quot;. Feel free to raise a ticket with our 24/7 technical team.
              </p>
              <div className="pt-2">
                <Link
                  href="/support?tab=raise-ticket"
                  prefetch={true}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-colors"
                >
                  <span>Submit Support Ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {filteredFaqs.map((faq) => {
                const isOpen = openIds.has(faq.id)
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 ${
                      isOpen
                        ? 'bg-[#1a1a20] border-white/15 shadow-lg'
                        : 'bg-[#18181c] hover:bg-[#1e1e24] border-white/[0.06]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleOpen(faq.id)}
                      className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                        {faq.question}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                          isOpen ? 'bg-[#FC6301]/20 text-[#FC6301] rotate-180' : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-0 space-y-4 text-zinc-300 text-sm sm:text-base leading-relaxed border-t border-white/[0.06]">
                        <p className="pt-4 font-normal text-zinc-300">
                          {faq.answer}
                        </p>

                        {/* Bullet Details if any */}
                        {faq.details && faq.details.length > 0 && (
                          <ul className="space-y-2 pt-1">
                            {faq.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-400">
                                <CheckCircle2 className="w-4 h-4 text-white/90 shrink-0 mt-0.5" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Link Action */}
                        {faq.linkUrl && faq.linkText && (
                          <div className="pt-2">
                            <Link
                              href={faq.linkUrl}
                              prefetch={true}
                              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FC6301] hover:text-[#ff7824] transition-colors"
                            >
                              <span>{faq.linkText}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2">
                          {faq.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] font-medium text-zinc-500 bg-white/[0.04] px-2.5 py-0.5 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </section>

        {/* ========================================================================= */}
        {/* 4. SUPPORT SPOTLIGHT BILLBOARD (1:1 FOUNDER BILLBOARD STYLE FROM ABOUT US) */}
        {/* ========================================================================= */}
        <section className="w-full">
          <div className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#1a1a1e] flex flex-col lg:flex-row items-center justify-between select-none shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
            
            {/* Background Studio Ambience & Neon Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#18181c] to-[#141418] pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#FC6301]/10 blur-[100px] pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-80 h-80 rounded-full bg-blue-500/5 blur-[90px] pointer-events-none" />

            {/* Left Column: Support Desk Narrative */}
            <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-2xl space-y-4 sm:space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.06] border border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                <Headphones className="w-3.5 h-3.5 text-[#FC6301]" />
                <span>24/7 DEDICATED SUPPORT DESK</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                Still have questions? We’re always here to assist.
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                Whether you need help activating a serial key, troubleshooting plugin latency in your DAW, or checking order verification status, our dedicated audio support team is at your service.
              </p>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                Submit a ticket with your order ID or system details, and receive prompt, knowledgeable assistance from experienced audio engineers.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/support?tab=raise-ticket"
                  prefetch={true}
                  className="inline-flex items-center justify-center min-w-[150px] sm:min-w-[175px] h-[44px] bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-lg active:scale-95 transition-colors cursor-pointer"
                >
                  Raise Support Ticket
                </Link>

                <Link
                  href="/support?tab=track-ticket"
                  prefetch={true}
                  className="inline-flex items-center justify-center px-6 h-[44px] bg-[#202024] hover:bg-[#28282e] text-zinc-200 hover:text-white border border-white/10 font-bold text-sm rounded-lg active:scale-95 transition-colors cursor-pointer"
                >
                  Track Existing Ticket
                </Link>
              </div>
            </div>

            {/* Right Column: Founder Cutout Image / Support Visual */}
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
        {/* 5. DISCOVER WHAT'S INSIDE (CATEGORIES & CATALOG)                           */}
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
              <p className="text-[11px] text-zinc-400">Synths &amp; Romplers</p>
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
              <p className="text-[11px] text-zinc-400">Samples &amp; Loops</p>
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
              <p className="text-[11px] text-zinc-400">Meters &amp; Utility</p>
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
              className="p-5 rounded-xl bg-[#202020] hover:bg-[#252528] border border-white/[0.06] text-white flex items-center justify-center group flex-col space-y-2.5 text-center"
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
        {/* 6. BOTTOM CTA (HOMEPAGE & ABOUT PAGE MATCHING MINIMALISTIC BUTTONS)       */}
        {/* ========================================================================= */}
        <section className="pt-2 pb-2 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Ready to elevate your sound?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join thousands of music makers discovering fresh tools, free gifts, and sample packs every day on Producer Toy.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/store"
              prefetch={true}
              className="px-8 py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-sm rounded-xl transition-colors active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
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
              <span>Contact Support Desk</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
