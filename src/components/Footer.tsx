'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronUp, Facebook, Twitter, Youtube, Disc } from 'lucide-react'

export function Footer() {
  const pathname = usePathname()

  // Hide footer completely on Auth page
  if (pathname === '/auth' || pathname?.startsWith('/auth')) {
    return null
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="w-full bg-[#141414] text-white border-t border-[#202020] mt-24 select-none">
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 pt-12 pb-16">
        
        {/* Top Section: Producer Toy Logo + Social Media Icons */}
        <div className="flex items-center justify-between pb-8 border-b border-[#26262b]">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <img
              src="/footer-logo.png"
              alt="Producer Toy"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </Link>

          {/* Epic Style Minimal Social Icons */}
          <div className="flex items-center gap-6 text-zinc-400">
            <a href="#" className="hover:text-white transition-colors" title="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors" title="X (Twitter)">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors" title="YouTube">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors" title="Discord">
              <Disc className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* 6-Column Navigation Grid (Exact Epic Games Store Layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 py-10 border-b border-[#26262b]">
          
          {/* Column 1: Games / Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-tight">Categories</h4>
            <ul className="space-y-2 text-xs text-[#a0a0a5]">
              <li><Link href="/store/plugins" className="hover:text-white transition-colors">VST & AU Plugins</Link></li>
              <li><Link href="/store/sample-packs" className="hover:text-white transition-colors">Sample Packs</Link></li>
              <li><Link href="/store/presets" className="hover:text-white transition-colors">Synth Presets</Link></li>
              <li><Link href="/store/templates" className="hover:text-white transition-colors">DAW Templates</Link></li>
              <li><Link href="/store?on_sale=true" className="hover:text-white transition-colors">On Sale Deals</Link></li>
              <li><Link href="/store?free=true" className="hover:text-white transition-colors">Free Downloads</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Rent to Own</Link></li>
            </ul>
          </div>

          {/* Column 2: Marketplaces */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-tight">Marketplaces</h4>
            <ul className="space-y-2 text-xs text-[#a0a0a5]">
              <li><Link href="/store" className="hover:text-white transition-colors">Producer Toy Store</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Sound Vault</Link></li>
              <li><Link href="/store/presets" className="hover:text-white transition-colors">Serum Preset Hub</Link></li>
              <li><Link href="/manufacturers" className="hover:text-white transition-colors">Featured Brands</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Store Refund Policy</Link></li>
              <li><Link href="/licensing" className="hover:text-white transition-colors">Store EULA</Link></li>
            </ul>
          </div>

          {/* Column 3: Tools */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-tight">Tools & DAWs</h4>
            <ul className="space-y-2 text-xs text-[#a0a0a5]">
              <li><Link href="/store" className="hover:text-white transition-colors">FL Studio Packs</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Ableton Racks</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Logic Pro Projects</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Cubase Templates</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Serum Banks</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Vital Presets</Link></li>
            </ul>
          </div>

          {/* Column 4: Online Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-tight">Online Services</h4>
            <ul className="space-y-2 text-xs text-[#a0a0a5]">
              <li><Link href="/my-purchases" className="hover:text-white transition-colors">Cloud Key Vault</Link></li>
              <li><Link href="/my-purchases" className="hover:text-white transition-colors">License Manager</Link></li>
              <li><Link href="/my-purchases" className="hover:text-white transition-colors">Instant Downloads</Link></li>
              <li><Link href="/licensing" className="hover:text-[#FC6301] transition-colors">100% Royalty Free</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Trust Statement</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Verified Creators</Link></li>
            </ul>
          </div>

          {/* Column 5: Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-tight">Company</h4>
            <ul className="space-y-2 text-xs text-[#a0a0a5]">
              <li><Link href="/store" className="hover:text-white transition-colors">About Producer Toy</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Newsroom</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Creator Portal</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">UX Research</Link></li>
            </ul>
          </div>

          {/* Column 6: Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-tight">Resources</h4>
            <ul className="space-y-2 text-xs text-[#a0a0a5]">
              <li><Link href="/store" className="hover:text-white transition-colors">Producer Community</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Distribute on Producer Toy</Link></li>
              <li><Link href="/licensing" className="hover:text-white transition-colors">Creator Agreement</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Community Rules</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Help & Support</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Legal Disclaimer (Epic Games Store Style) */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="text-[11px] text-[#808085] leading-relaxed max-w-4xl space-y-1">
            <p>
              © {new Date().getFullYear()}, Producer Toy, Inc. All rights reserved. Producer Toy, the Producer Toy logo, Sound Vault, and VST Hub are trademarks or registered trademarks of Producer Toy, Inc. in the United States of America and elsewhere.
            </p>
            <p>
              Other brands or product names are the trademarks of their respective owners. Non-US transactions conducted through Producer Toy International, S.à r.l.
            </p>
          </div>

          {/* Back to Top Button */}
          <button
            onClick={scrollToTop}
            className="flex-shrink-0 p-3 rounded-md bg-[#202025] hover:bg-[#2a2a30] text-zinc-400 hover:text-white transition-colors cursor-pointer border border-[#2a2a30]"
            title="Back to Top"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>

      </div>
    </footer>
  )
}
