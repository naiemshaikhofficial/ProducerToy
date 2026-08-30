'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Twitter, Facebook, Youtube, Instagram, ArrowRight, ChevronUp } from 'lucide-react'

export function Footer() {
  const pathname = usePathname()

  // Hide footer completely on Auth and Checkout pages (exact Epic Games screen lock)
  if (
    pathname === '/auth' ||
    pathname?.startsWith('/auth') ||
    pathname === '/checkout' ||
    pathname?.startsWith('/checkout')
  ) {
    return null
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="w-full bg-[#141414] text-white border-none mt-28 sm:mt-36 select-none font-sans">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-28">
        
        {/* Main Grid with Vertical Dividers matching Plugin Boutique Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 pb-14 sm:pb-18 border-b border-[#26262b]">
          
          {/* Column 1: Discover (Dual Sub-Columns) - Spans 5 cols */}
          <div className="md:col-span-5 md:pr-8 md:border-r md:border-[#26262b] space-y-4">
            <h4 className="text-base font-bold text-white tracking-tight mb-4">Discover</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-zinc-400">
              {/* Left Sub-column */}
              <div className="space-y-2.5">
                <div><Link href="/free-vst-plugins" prefetch={true} className="text-[#FA742B] font-semibold hover:underline">Free VST Plugins</Link></div>
                <div><Link href="/best/free-autotune-vst-plugins" prefetch={true} className="hover:text-white transition-colors">Best Free Auto-Tune</Link></div>
                <div><Link href="/best/free-saturation-plugins" prefetch={true} className="hover:text-white transition-colors">Best Saturation VSTs</Link></div>
                <div><Link href="/best/free-compressor-vst-plugins" prefetch={true} className="hover:text-white transition-colors">Best Compressors</Link></div>
                <div><Link href="/best/free-reverb-vst-plugins" prefetch={true} className="hover:text-white transition-colors">Best Reverb Plugins</Link></div>
                <div><Link href="/categories/instruments" prefetch={true} className="hover:text-white transition-colors">Virtual Instruments</Link></div>
                <div><Link href="/categories/sounds" prefetch={true} className="hover:text-white transition-colors">Sample Packs</Link></div>
                <div><Link href="/manufacturers" prefetch={true} className="hover:text-white transition-colors">Brands & Developers</Link></div>
              </div>

              {/* Right Sub-column */}
              <div className="space-y-2.5">
                <div><Link href="/daw/fl-studio" prefetch={true} className="hover:text-white transition-colors">FL Studio Plugins</Link></div>
                <div><Link href="/daw/ableton-live" prefetch={true} className="hover:text-white transition-colors">Ableton Live Plugins</Link></div>
                <div><Link href="/daw/logic-pro" prefetch={true} className="hover:text-white transition-colors">Logic Pro AU Plugins</Link></div>
                <div><Link href="/best/free-trap-drum-kits-808" prefetch={true} className="hover:text-white transition-colors">Free Trap 808 Kits</Link></div>
                <div><Link href="/store?on_sale=true" prefetch={true} className="hover:text-white transition-colors">Deals & Discounts</Link></div>
                <div><Link href="/features/toywards" prefetch={true} className="hover:text-white transition-colors">Toywards Rewards</Link></div>
                <div><Link href="/contact" prefetch={true} className="hover:text-white transition-colors">Developer Portal</Link></div>
              </div>
            </div>
          </div>

          {/* Column 2: Legal - Spans 2 cols */}
          <div className="md:col-span-2 md:px-4 md:border-r md:border-[#26262b] space-y-4">
            <h4 className="text-base font-bold text-white tracking-tight mb-4">Legal</h4>
            <div className="space-y-2.5 text-xs text-zinc-400">
              <div><Link href="/terms" prefetch={true} className="hover:text-white transition-colors">Terms and Conditions</Link></div>
              <div><Link href="/privacy" prefetch={true} className="hover:text-white transition-colors">Privacy Policy</Link></div>
              <div><Link href="/refund-policy" prefetch={true} className="hover:text-white transition-colors">Refund Policy</Link></div>
              <div><Link href="/eula" prefetch={true} className="hover:text-white transition-colors">EULA Agreement</Link></div>
              <div><Link href="/purchase-policy" prefetch={true} className="hover:text-white transition-colors">Purchase Policy</Link></div>
            </div>
          </div>

          {/* Column 3: Help - Spans 2 cols */}
          <div className="md:col-span-2 md:px-4 md:border-r md:border-[#26262b] space-y-4">
            <h4 className="text-base font-bold text-white tracking-tight mb-4">Help</h4>
            <div className="space-y-2.5 text-xs text-zinc-400">
              <div><Link href="/contact" prefetch={true} className="hover:text-white transition-colors">Contact Us</Link></div>
              <div><Link href="/contact" prefetch={true} className="hover:text-white transition-colors">About Us</Link></div>
            </div>
          </div>

          {/* Column 4: Producer Toy Rewards & Social - Spans 3 cols */}
          <div className="md:col-span-3 md:pl-4 space-y-6 flex flex-col justify-between">
            
            {/* Follow Us Social Icons (Top Right) */}
            <div className="flex items-center justify-between md:justify-start gap-4">
              <span className="text-xs font-bold text-white tracking-tight">Follow us:</span>
              <div className="flex items-center gap-4 text-zinc-400">
                <a
                  href="https://x.com/producertoy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  title="X (Twitter) @producertoy"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com/producertoy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  title="Facebook @producertoy"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com/@producertoy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  title="YouTube @producertoy"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com/producertoy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  title="Instagram @producertoy"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Producer Toy Rewards Section */}
            <div className="space-y-3">
              <h4 className="text-base font-bold text-white tracking-tight">Producer Toy Rewards</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Discover the most rewarding loyalty programme among all plugin retailers.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#FC6301] font-bold">•</span> Free Loopmasters & Exclusive Samplepacks
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#FC6301] font-bold">•</span> Discounts on products and courses
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#FC6301] font-bold">•</span> Extra Virtual Cash claimed immediately at checkout
                </li>
              </ul>

              <div className="pt-1">
                <Link
                  href="/features/toywards"
                  prefetch={true}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#FC6301] transition-colors group"
                >
                  <span>Find out more</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Section: Logo + Copyright + Back To Top */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo on Bottom Left */}
          <Link href="/" prefetch={true} className="inline-block hover:opacity-90 transition-opacity">
            <img
              src="/footer-logo.png"
              alt="Producer Toy"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </Link>

          {/* Copyright Text on Bottom Right */}
          <div className="flex items-center gap-6 text-right">
            <p className="text-xs text-zinc-500 font-normal">
              Producer Toy Limited, Registered in Sangamner, Maharashtra. Copyright © 2011-2026 Producer Toy. All rights reserved.
            </p>

            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-md bg-[#202025] hover:bg-[#2a2a30] text-zinc-400 hover:text-white transition-colors cursor-pointer border border-[#2a2a30] flex-shrink-0"
              title="Back to Top"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  )
}
