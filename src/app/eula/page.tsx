import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'End User License Agreement (EULA) | Producer Toy Store',
  description: 'Official End User License Agreement (EULA), 100% Royalty-Free Commercial Usage, and Sound Licensing Terms for Producer Toy.',
}

export default function EulaPage() {
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
              End User License Agreement (EULA)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Last updated: February 2026 • Producer Toy Store (India Operations & Global Distribution)
            </p>
          </div>
        </div>

        {/* Minimalist Content Body */}
        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              1. Grant of License
            </h2>
            <p className="text-zinc-400">
              All sound assets, virtual instruments, audio plugins, sample packs, synthesizer soundbanks, and digital audio workstation (DAW) templates available on <strong>Producer Toy</strong> (producertoy.com) are licensed, not sold, to you (&ldquo;Licensee&rdquo;).
            </p>
            <p className="text-zinc-400">
              Producer Toy grants you a non-exclusive, non-transferable, worldwide, perpetual commercial license to use the downloaded sounds and software tools in your musical compositions, film scores, commercial audio productions, broadcasts, streaming releases, video games, and multimedia productions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              2. 100% Royalty-Free Commercial Usage
            </h2>
            <p className="text-zinc-400">
              Under this license, you are entitled to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li><strong className="text-zinc-200">Commercial Music Releases:</strong> Release songs, albums, and soundtracks containing purchased samples, one-shots, loops, or synth presets on Spotify, Apple Music, YouTube, Beatport, Radio, and TV synchronization without paying additional royalties or clearance fees.</li>
              <li><strong className="text-zinc-200">Creative Manipulation:</strong> Chop, loop, pitch-shift, time-stretch, process, and layer audio files freely within your creative arrangements.</li>
              <li><strong className="text-zinc-200">Multi-Device Installation:</strong> Install software plugins and presets on up to two (2) computers owned and operated solely by you.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Strict Restrictions & Prohibited Uses
            </h2>
            <p className="text-zinc-400">
              The Licensee is strictly PROHIBITED from engaging in any of the following activities:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 pt-1">
              <li><strong className="text-zinc-200">Re-Distribution & Resale:</strong> Reselling, sub-licensing, sharing, renting, uploading to cloud file-sharing sites, torrent networks, or distributing raw audio files and presets in isolation.</li>
              <li><strong className="text-zinc-200">Competitive Sample Libraries:</strong> Using purchased samples or presets to construct competitive sample packs, loop kits, sound design bundles, virtual instruments, or AI training datasets.</li>
              <li><strong className="text-zinc-200">Reverse Engineering:</strong> Decompiling, disassembling, reverse engineering, or modifying binary files and DSP code of proprietary VST/AU plugins.</li>
              <li><strong className="text-zinc-200">Account Sharing:</strong> Transferring or sharing Producer Toy login credentials, or obtaining licenses using disposable/temporary burner email accounts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              4. Intellectual Property & Ownership
            </h2>
            <p className="text-zinc-400">
              Producer Toy and its respective developer partners retain all title, copyright, intellectual property rights, and source code ownership in the software, audio masters, and artwork. You own the copyright to the original musical works created using these licensed assets.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Termination of License
            </h2>
            <p className="text-zinc-400">
              This agreement is effective until terminated. Breach of any terms specified in this EULA will result in automatic termination of your license without prior notice, upon which all digital copies and derived standalone library assets must be permanently deleted.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              6. Licensing Inquiries & Clearance Support
            </h2>
            <p className="text-zinc-400">
              For custom enterprise licensing, film master clearances, or legal questions, contact our licensing desk at{' '}
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
