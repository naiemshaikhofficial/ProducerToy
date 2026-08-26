import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft, ShieldCheck, Scale, FileText, CheckCircle2, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'End User License Agreement (EULA) | Producer Toy',
  description: 'Official End User License Agreement (EULA) governing software, VST/AU plugins, sample packs, synth presets, and DAW templates on Producer Toy.',
}

export default function EulaPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white py-14 px-6 sm:px-10 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-10 font-sans">
        
        {/* Back Link & Header */}
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
            <div className="flex items-center gap-2 text-[#2ed8a7] text-xs font-bold uppercase tracking-wider mb-2">
              <Scale className="w-4 h-4" />
              <span>Legal Document</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              End User License Agreement (EULA)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Last updated: February 2026 • Producer Toy Marketplace (Global Distribution)
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          
          <div className="p-4 bg-[#18181c] border border-[#2a2a2e] rounded-xl text-xs text-zinc-300 leading-relaxed">
            <p className="font-semibold text-white mb-1">IMPORTANT NOTICE:</p>
            Please read this End User License Agreement (&ldquo;EULA&rdquo;) carefully before purchasing, downloading, or using any digital sound libraries, VST/AU plugins, sample packs, presets, or templates from <strong>Producer Toy</strong>. By downloading or installing these assets, you agree to be bound by the terms of this license.
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>1. Grant of License</span>
            </h2>
            <p className="text-zinc-400">
              All sound assets, virtual instruments, audio plugins, sample packs, synthesizer soundbanks, and digital audio workstation (DAW) project files purchased or claimed from Producer Toy are licensed, not sold, to you (&ldquo;Licensee&rdquo;).
            </p>
            <p className="text-zinc-400">
              Producer Toy grants you a non-exclusive, non-transferable, worldwide, perpetual commercial license to use the sounds and tools in your original musical compositions, film scores, commercial audio productions, broadcasts, video games, and multimedia projects.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>2. 100% Royalty-Free Commercial Usage</span>
            </h2>
            <p className="text-zinc-400">
              You are permitted to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>Use all purchased samples, one-shots, loops, and presets in commercial music releases (Spotify, Apple Music, YouTube, TV/Film synchronization, radio airplay) without paying additional royalties or clearance fees to Producer Toy.</li>
              <li>Modify, chop, time-stretch, pitch-shift, and process audio files for inclusion in your creative compositions.</li>
              <li>Install plugins on up to two (2) machines owned and operated solely by the primary licensee.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>3. Strict Restrictions & Prohibited Uses</span>
            </h2>
            <p className="text-zinc-400">
              You are strictly PROHIBITED from:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li><strong>Re-selling or Re-distributing:</strong> Distributing, sharing, sub-licensing, uploading to file-sharing networks, torrent trackers, Discord servers, or selling any raw samples, presets, or software code in any format.</li>
              <li><strong>Competitive Sample Libraries:</strong> Using the raw audio samples or synthesizer presets to create competitive sample libraries, virtual instruments, sound packs, or AI training datasets.</li>
              <li><strong>Reverse Engineering:</strong> Decompiling, reverse engineering, disassembling, or modifying the binary code of proprietary VST/AU plugins sold on the marketplace.</li>
              <li><strong>Account Sharing:</strong> Sharing your Producer Toy login credentials with third parties or purchasing products on disposable/temporary burner email accounts.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>4. Intellectual Property & Ownership</span>
            </h2>
            <p className="text-zinc-400">
              Producer Toy and its verified partner brands/developers retain all intellectual property rights, copyrights, patents, and trademarks associated with the software code, graphical user interfaces, presets, and audio recordings. This license does not grant you ownership of the original audio recordings.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Termination of License
            </h2>
            <p className="text-zinc-400">
              This license is effective until terminated. Your rights under this EULA will terminate automatically without notice if you fail to comply with any of its terms. Upon termination, you must cease all use of the software and destroy all copies in your possession.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              6. Contact for Commercial Clearance & Questions
            </h2>
            <p className="text-zinc-400">
              For enterprise licensing, master clearance inquiries, or custom usage rights, please contact our legal licensing desk at{' '}
              <a href="mailto:support@producertoy.com" className="text-zinc-200 hover:underline font-semibold">
                support@producertoy.com
              </a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}
