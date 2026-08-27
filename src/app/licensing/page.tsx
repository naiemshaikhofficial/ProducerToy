import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = generatePageMetadata({
  title: 'Royalty-Free Commercial Audio License & EULA — Producer Toy',
  description:
    '100% Royalty-Free Commercial License terms for sample packs, 808s, synth presets, sound kits, and DAW templates purchased on Producer Toy.',
  path: '/licensing',
  keywords: [
    'Royalty-free sample license',
    'Commercial clearance sound kit',
    'Music production licensing terms',
    'Producer Toy licensing',
  ],
})

export default function LicensingAgreementPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white py-14 px-6 sm:px-10 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-10 font-sans">
        
        {/* Back Link & Minimal Header */}
        <div className="space-y-4 pb-6 border-b border-zinc-800/60">
          <Link
            href="/"
            prefetch={true}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Store
          </Link>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Royalty-Free Audio License & EULA
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              100% Commercial Clearance Guaranteed • Worldwide Perpetual License
            </p>
          </div>
        </div>

        {/* Minimalist Content Body */}
        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              1. Grant of Commercial License
            </h2>
            <p className="text-zinc-400">
              When you purchase or download a sample pack, drum kit, synth preset bank, or DAW template from <strong>Producer Toy</strong>, you are granted a worldwide, non-exclusive, non-transferable, perpetual <strong>100% Royalty-Free Commercial License</strong>.
            </p>
            <p className="text-zinc-400">
              You do NOT owe any secondary royalties, clearance fees, or performance splits to Producer Toy or the original sound designer for songs produced using these sound libraries.
            </p>
          </section>

          {/* Clean Minimal Permitted vs Prohibited Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
            
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white tracking-tight">
                Permitted Commercial Uses
              </h3>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>• Releasing commercial songs on Spotify, Apple Music, YouTube, and digital platforms.</li>
                <li>• Sync placement in commercial films, TV shows, video games, radio, and advertisements.</li>
                <li>• Live DJ performances, concerts, and broadcast streaming.</li>
                <li>• Monetizing instrumental beats sold to artists for master recordings.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-white tracking-tight">
                Prohibited Uses
              </h3>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>• Re-selling, sharing, or distributing isolated samples or stems in secondary sample packs.</li>
                <li>• Uploading raw isolated audio samples to Content ID system matching platforms.</li>
                <li>• Sub-licensing or transferring your Producer Toy license key to third parties.</li>
                <li>• Claiming exclusive copyright ownership over un-altered factory presets or raw loops.</li>
              </ul>
            </div>

          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              2. VST & AU Plugin End User License Agreement (EULA)
            </h2>
            <p className="text-zinc-400">
              For virtual instrument and effect plugins (VST2, VST3, AU, AAX), the license permits activation on up to <strong>two (2) separate personal computer workstations</strong> (e.g., studio desktop + mobile laptop) owned and operated exclusively by the registered account holder.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-zinc-800/60">
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Copyright Ownership
            </h2>
            <p className="text-zinc-400">
              All sound libraries, waveforms, and code assets remain the intellectual property of Producer Toy and its sound design partners. This license grants usage rights only and does not transfer core underlying copyright ownership of sound recordings.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}
