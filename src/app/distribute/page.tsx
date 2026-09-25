import React from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Upload, DollarSign, Globe2, ShieldCheck, Music2, Cpu } from 'lucide-react'

export const metadata = {
  title: 'Distribute on Producer Toy — Publish Your Music Software & Sound Packs',
  description: 'Join elite music producers and audio developers. Distribute your VST plugins, sound banks, and sample libraries to thousands of creators worldwide.',
}

export default function DistributePage() {
  return (
    <div className="w-full bg-[#121212] min-h-screen text-white select-none">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/[0.08] py-20 lg:py-28 px-6 sm:px-10 lg:px-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FC6301]/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-[#FC6301]" />
            <span>Producer Toy Creator & Developer Program</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white font-sans">
            Distribute Your Music Tools & Sounds on <span className="text-[#FC6301]">Producer Toy</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Reach thousands of modern beatmakers, sound designers, and mixing engineers worldwide. Keep up to 88% of your revenue with zero upfront fees.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact?topic=distribute"
              prefetch={true}
              className="px-8 py-3.5 bg-[#FC6301] hover:bg-[#e05700] text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Apply to Distribute</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contact"
              prefetch={true}
              className="px-8 py-3.5 bg-[#202020] hover:bg-[#282828] text-white border border-white/10 font-bold text-sm sm:text-base rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Contact Developer Relations
            </Link>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-8 space-y-4 hover:border-white/20 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#FC6301]/10 text-[#FC6301] flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">88% Creator Revenue Share</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We offer the industry’s most competitive revenue splits. Keep 88% of every dollar earned from your sound libraries and VST tools.
            </p>
          </div>

          <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-8 space-y-4 hover:border-white/20 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#FC6301]/10 text-[#FC6301] flex items-center justify-center">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Global Distribution</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Reach producers across 100+ countries with local currency pricing, multi-region CDN delivery, and instant payments.
            </p>
          </div>

          <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-8 space-y-4 hover:border-white/20 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#FC6301]/10 text-[#FC6301] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Full License Protection</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Automated license key generation, encrypted file hosting, and verified purchaser accounts ensure your audio software is secure.
            </p>
          </div>

        </div>
      </section>

      {/* What You Can Publish */}
      <section className="bg-[#161616] border-y border-white/[0.08] py-16 sm:py-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white">What You Can Distribute</h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              Whether you are an independent sound designer or an established audio plugin company, Producer Toy is built for you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-white/[0.06] space-y-3">
              <Music2 className="w-7 h-7 text-[#FC6301]" />
              <h4 className="font-bold text-white text-base">Sample Packs</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">One-shots, melody loops, drum stems, and royalty-free audio kits.</p>
            </div>

            <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-white/[0.06] space-y-3">
              <Cpu className="w-7 h-7 text-[#FC6301]" />
              <h4 className="font-bold text-white text-base">VST & AU Plugins</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Virtual instruments, audio effects, synthesizers, and utility tools.</p>
            </div>

            <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-white/[0.06] space-y-3">
              <Sparkles className="w-7 h-7 text-[#FC6301]" />
              <h4 className="font-bold text-white text-base">Presets & Soundbanks</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Serum, Vital, Phase Plant, Diva, Omnisphere, and FL Studio mixer presets.</p>
            </div>

            <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-white/[0.06] space-y-3">
              <Upload className="w-7 h-7 text-[#FC6301]" />
              <h4 className="font-bold text-white text-base">MIDI & Construction</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">MIDI chord packs, melody compositions, and full project stems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black text-white">Ready to distribute your sounds?</h2>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          Submit your product catalog or reach out to our creator team to get verified and start distributing.
        </p>
        <Link
          href="/contact?topic=distribute"
          prefetch={true}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-xl active:scale-95 cursor-pointer"
        >
          <span>Get in Touch with Creator Relations</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  )
}
