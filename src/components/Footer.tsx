'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/Logo'

export function Footer() {
  const pathname = usePathname()

  // Hide footer completely on Auth page
  if (pathname === '/auth' || pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <footer className="bg-[#121212] text-white border-t border-[#202020] mt-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="inline-block">
              <Logo size={36} showText={true} />
            </Link>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              The premier marketplace for VST plugins, royalty-free sample packs, synth presets, and DAW templates. Designed for modern music producers.
            </p>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Store Catalog</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link href="/store/plugins" className="hover:text-white transition-colors">VST Plugins</Link></li>
              <li><Link href="/store/sample-packs" className="hover:text-white transition-colors">Sample Packs</Link></li>
              <li><Link href="/store/presets" className="hover:text-white transition-colors">Synth Presets</Link></li>
              <li><Link href="/store/templates" className="hover:text-white transition-colors">DAW Templates</Link></li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Account & Library</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link href="/my-purchases" className="hover:text-white transition-colors">My Library & Keys</Link></li>
              <li><Link href="/auth" className="hover:text-white transition-colors">Sign In / Register</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-[#202020] flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Producer Toy Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-zinc-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-400 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
