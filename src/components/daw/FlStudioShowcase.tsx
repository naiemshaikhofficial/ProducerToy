'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import {
  Check,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Infinity as InfinityIcon,
} from 'lucide-react'

const AFFILIATE_URL = 'https://go.image-line.com/qWL015'

interface FeatureRow {
  name: string
  description: string
  badge?: string
  fruity: boolean | string | number
  producer: boolean | string | number
  signature: boolean | string | number
  allPlugins: boolean | string | number
}

interface FeatureSection {
  title: string
  rows: FeatureRow[]
}

const FEATURE_SECTIONS: FeatureSection[] = [
  {
    title: 'Core Features',
    rows: [
      {
        name: 'Lifetime Free Updates',
        description: 'Get all future updates free! Our promise for 25+ years and going strong.',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Stem Separation',
        description: 'Splits any audio into individual instrument tracks for remixing or editing',
        fruity: false,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Audio Recording',
        description: 'Record external or internal audio sources directly into the Playlist as editable Audio Clips',
        fruity: false,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Audio Clips',
        description: 'Audio samples or recordings placed in the Playlist, supporting unique clip controls and envelopes',
        fruity: '8',
        producer: '∞',
        signature: '∞',
        allPlugins: '∞',
      },
      {
        name: 'Loop Starter',
        badge: 'UPDATED IN 2026',
        description: 'Instantly generate and arrange genre-based loops to kickstart your tracks',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'FL Studio Mobile Rack + FX',
        description: 'Access FL Studio Mobile plugins and effects within FL Studio desktop',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Audio Logger',
        badge: 'NEW IN 2026',
        description: 'Continuously records audio input in the background so you never miss a take.',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Chord Generator',
        badge: 'UPDATED IN 2026',
        description: 'Generates chords and chord progressions for creative inspiration',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Gopher AI Assistant',
        badge: 'UPDATED IN 2026',
        description: "FL Studio's AI assistant that answers questions, guides you, and controls features in FL Studio and plugins.",
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Denoising',
        description: "Remove unwanted noise from audio, typically using Edison's noise removal tool",
        fruity: false,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Sound Content & FL Cloud',
        description: 'Extensive library of royalty-free samples, loops, and presets for music production, plus free FL Cloud access.',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Piano Roll',
        description: 'Edit, draw, and manipulate MIDI notes for instruments and automation',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Mixer',
        description: 'Route, mix, and process audio with effects, volume, panning, and advanced routing',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Full Song Arrangement',
        description: 'Arrange patterns, audio, and automation clips to create complete songs',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Automation Clips',
        description: 'Hold automation shapes to control and automate parameters in the Playlist',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Time Signature Changes',
        description: 'Set different time signatures at various points in the Playlist',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'MIDI Support & Hardware Integration',
        description: 'Record, edit, and play MIDI notes from controllers, with full Piano Roll and hardware integration',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'VST2, VST3, Audio Unit & CLAP Support',
        description: 'Load and use third-party instrument and effect plugins',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'FL Studio Remote App',
        description: 'FL Studio Remote is a free app that lets you control FL Studio from your phone or tablet',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
    ],
  },
  {
    title: 'Audio Editors',
    rows: [
      {
        name: 'Edison',
        description: 'Audio editor and recorder for detailed waveform editing and sound manipulation',
        fruity: false,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Newtone',
        description: 'Pitch correct and time-align vocals and audio with precise editing tools',
        fruity: false,
        producer: false,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Newtime',
        description: 'Slice, warp, and time-correct audio for precise stretching and tempo syncing',
        fruity: false,
        producer: false,
        signature: true,
        allPlugins: true,
      },
    ],
  },
  {
    title: 'Effects',
    rows: [
      {
        name: 'Total Effects Count',
        description: 'Included native creative audio and mixing effects',
        fruity: '53',
        producer: '59',
        signature: '65',
        allPlugins: '71',
      },
      {
        name: 'Transmitter',
        badge: 'NEW IN 2026',
        description: 'Advanced transient/sustain splitter for separate processing and dynamic modulation.',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'LuxeVerb',
        description: 'High-quality reverb for spacious and natural environments',
        fruity: false,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Gross Beat',
        description: 'Time and volume effect for glitch, stutter, and gating',
        fruity: false,
        producer: false,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Pitcher',
        description: 'Real-time pitch correction and harmonization for vocals',
        fruity: false,
        producer: false,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Hardcore (11 Guitar FX)',
        description: 'Suite of 11 guitar effects for heavy and creative tones',
        fruity: false,
        producer: false,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Maximus',
        description: 'Multiband compressor and maximizer for mastering and dynamics',
        fruity: false,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Transient Processor',
        description: 'Shape the transients of your audio to enhance attack or sustain',
        fruity: false,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Vocodex',
        description: 'Advanced vocoder plugin for creating robotic and harmonized vocal effects',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Patcher',
        description: 'Modular plugin for building custom effect and instrument chains',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Soundgoodizer & Soft Clipper',
        description: 'Enhance clarity, punch and prevent digital clipping distortion',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Fruity Parametric EQ 2',
        description: 'Enhanced 7-band parametric EQ with built-in spectrum analyzer',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
    ],
  },
  {
    title: 'Instruments',
    rows: [
      {
        name: 'Total Instruments Count',
        description: 'Included native synthesizers, samplers and sound generators',
        fruity: '23',
        producer: '27',
        signature: '29',
        allPlugins: '39',
      },
      {
        name: 'Harmor',
        description: 'Advanced additive synth with resynthesis and powerful effects',
        fruity: false,
        producer: false,
        signature: false,
        allPlugins: true,
      },
      {
        name: 'Sytrus',
        description: 'FM, subtractive, and additive synth with deep modulation and flexible sound shaping',
        fruity: false,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Harmless',
        description: 'Additive synth with subtractive synthesis workflow for rich sounds',
        fruity: false,
        producer: false,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Morphine & Sakura',
        description: 'Additive morphing synthesizer & physical modeling string synth',
        fruity: false,
        producer: false,
        signature: false,
        allPlugins: true,
      },
      {
        name: 'Toxic Biohazard & Transistor Bass',
        description: 'Hybrid FM-subtractive synth & classic 303 analog acid bass emulator',
        fruity: false,
        producer: false,
        signature: false,
        allPlugins: true,
      },
      {
        name: 'DirectWave Full',
        description: 'Comprehensive sampler with advanced editing, layering, and modulation features',
        fruity: false,
        producer: false,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'Slicex',
        description: 'Slice and rearrange audio samples with advanced beat detection and editing tools',
        fruity: false,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: 'FLEX',
        description: 'Versatile preset-based instrument with powerful sound design and effects',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
      {
        name: '3x OSC, Kepler, MiniSynth & FL Keys',
        description: 'Classic analog oscillator synthesizers and virtual pianos',
        fruity: true,
        producer: true,
        signature: true,
        allPlugins: true,
      },
    ],
  },
]

const FAQS = [
  {
    question: 'Which Edition should I start with?',
    answer:
      'Most new producers choose Producer Edition because it has full audio recording and mixing features. You can upgrade anytime.',
  },
  {
    question: 'What kind of support do I get after purchasing?',
    answer:
      'Your purchase gives you access to our technical forums and support staff. You also get access to our extensive online knowledge base, video tutorials, and a massive community of producers who are always willing to help.',
  },
  {
    question: 'Can I upgrade later without losing money?',
    answer:
      'Yes. Upgrades are pro-rated - you pay only the difference between editions.',
  },
  {
    question: 'Is FL Studio a one-time purchase or a subscription?',
    answer:
      'One-time purchase. You get lifetime free updates, which means you get every new feature, plugin or bug fix released to your Edition for life - no upgrade fees ever.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) as well as PayPal for your convenience and security.',
  },
]

export function FlStudioShowcase() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({})

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  // Filter feature rows based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return FEATURE_SECTIONS
    const q = searchQuery.toLowerCase()
    return FEATURE_SECTIONS.map((sec) => ({
      ...sec,
      rows: sec.rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.badge && r.badge.toLowerCase().includes(q))
      ),
    })).filter((sec) => sec.rows.length > 0)
  }, [searchQuery])

  const renderCell = (val: boolean | string | number, isProducer = false) => {
    if (typeof val === 'boolean') {
      if (val) {
        return (
          <Check
            className={`w-5 h-5 mx-auto ${
              isProducer ? 'text-[#FA742B]' : 'text-white'
            }`}
          />
        )
      }
      return <X className="w-5 h-5 text-zinc-600 mx-auto" />
    }
    return (
      <span
        className={`text-base font-bold ${
          isProducer ? 'text-[#FA742B]' : 'text-white'
        }`}
      >
        {val}
      </span>
    )
  }

  return (
    <div className="w-full space-y-20 select-none font-sans text-white">

      {/* 1. Header / Hero Section */}
      <div className="text-center space-y-4 max-w-4xl mx-auto pt-4">
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          Buy FL Studio
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Find an Edition that fits your needs, and get up to 100+ instruments, effects and of course Lifetime Free Updates.
        </p>
      </div>

      {/* 2. Choose your FL Studio Edition - 4 Minimalist Pricing Cards */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Choose your FL Studio Edition
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Fruity Edition */}
          <div className="bg-[#121214] border border-zinc-800/90 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-colors">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">Fruity Edition</h3>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                ₹2,599
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed min-h-[48px]">
                Basic melody &amp; loop creation, step sequencer and pattern clips.
              </p>
            </div>
            <a
              href={AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#202024] hover:bg-[#2c2c32] text-white border border-zinc-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Buy Fruity Edition</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Producer Edition (Most Popular) */}
          <div className="relative bg-[#16120e] border-2 border-[#FA742B] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl shadow-[#FA742B]/10">
            <div className="absolute -top-3 left-6 bg-[#FA742B] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Most popular
            </div>
            <div className="space-y-3 pt-1">
              <h3 className="text-xl font-bold text-white">Producer Edition</h3>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                ₹7,500
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Lifetime FL Studio license + 93 instruments and effects, includes audio recording and stem separation.
              </p>
              <div className="pt-1 text-xs text-zinc-400">
                <span>Get 2 million extra sounds free for 3 months. </span>
                <a
                  href={AFFILIATE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FA742B] hover:underline font-semibold inline-flex items-center gap-0.5"
                >
                  Learn more
                </a>
              </div>
            </div>
            <a
              href={AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-[#FA742B] hover:bg-[#E05A18] text-white transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>Buy Producer Edition</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Signature Bundle */}
          <div className="bg-[#121214] border border-zinc-800/90 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-colors">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">Signature Bundle</h3>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                ₹15,000
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed min-h-[48px]">
                Producer Edition + Gross Beat, Newtone pitch editor, Harmless &amp; Hardcore guitar FX.
              </p>
            </div>
            <a
              href={AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#202024] hover:bg-[#2c2c32] text-white border border-zinc-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Buy Signature Bundle</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* All Plugins Edition */}
          <div className="bg-[#121214] border border-zinc-800/90 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-colors">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">All Plugins Edition</h3>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                ₹21,750
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed min-h-[48px]">
                The complete powerhouse with EVERY native Image-Line synthesizer and effect.
              </p>
            </div>
            <a
              href={AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#202024] hover:bg-[#2c2c32] text-white border border-zinc-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Buy All Plugins Edition</span>
              <ExternalLink size={13} />
            </a>
          </div>

        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-zinc-500">
            Some payment plans might only be available in certain regions.
          </p>
        </div>
      </div>

      {/* 3. Info Cards: Lifetime Free Updates & Upgrades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-2.5">
          <h3 className="text-lg sm:text-xl font-bold text-white">What are Free Lifetime Updates?</h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            When you buy FL Studio, you get all future updates to your Edition: <strong>Free, forever</strong>. No extra cost for new features, plugins, or improvements. Most other DAWs charge for each major update.
          </p>
        </div>

        <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-2.5">
          <h3 className="text-lg sm:text-xl font-bold text-white">How do upgrades work?</h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            You can upgrade to a higher FL Studio Edition anytime—<strong>just pay the price difference</strong>. Start with what fits your budget today, and unlock more tools whenever you’re ready. No risk, no wasted money.
          </p>
        </div>
      </div>

      {/* 4. Compare Editions (Exact 1:1 match to Screenshot 3) */}
      <div id="compare" className="space-y-6 pt-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Compare Editions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            FL Studio comes with everything you need to bring your ideas to life. Producer Edition is the best choice for beginners.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features..."
              className="w-full bg-[#121214] border border-zinc-800 text-sm text-white placeholder-zinc-500 rounded-full pl-11 pr-4 py-3 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
        </div>

        {/* Table Header Columns (Desktop Sticky Header) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <div className="col-span-6"></div>
          <div className="col-span-1.5 text-center">Fruity Edition</div>
          <div className="col-span-1.5 text-center text-[#FA742B] font-extrabold">Producer Edition</div>
          <div className="col-span-1.5 text-center">Signature Bundle</div>
          <div className="col-span-1.5 text-center">All Plugins Edition</div>
        </div>

        {/* Feature Sections & Rows */}
        <div className="space-y-8">
          {filteredSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-2">
                {section.title}
              </h3>

              <div className="space-y-2.5">
                {section.rows.map((row, rIdx) => (
                  <div
                    key={rIdx}
                    className="bg-[#141416] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-4 sm:p-5 transition-colors"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      
                      {/* Left: Feature Name + Description */}
                      <div className="lg:col-span-6 space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white">
                            {row.name}
                          </h4>
                          {row.badge && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#9333ea]/20 text-[#c084fc] border border-[#9333ea]/40">
                              {row.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {row.description}
                        </p>
                      </div>

                      {/* Right: 4 Edition Values / Checkmarks */}
                      <div className="lg:col-span-6 grid grid-cols-4 gap-2 text-center pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800/60">
                        <div>
                          <span className="text-[10px] text-zinc-500 font-bold block lg:hidden pb-1">Fruity</span>
                          {renderCell(row.fruity, false)}
                        </div>
                        <div>
                          <span className="text-[10px] text-[#FA742B] font-bold block lg:hidden pb-1">Producer</span>
                          {renderCell(row.producer, true)}
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 font-bold block lg:hidden pb-1">Signature</span>
                          {renderCell(row.signature, false)}
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 font-bold block lg:hidden pb-1">All Plugins</span>
                          {renderCell(row.allPlugins, false)}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Frequently Asked Questions (Exact 1:1 match to Screenshot 2) */}
      <div className="space-y-6 pt-4 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Find all the answers below.
          </p>
        </div>

        {/* Minimalist Accordion Container Box */}
        <div className="bg-[#121214] border border-zinc-800/90 rounded-2xl divide-y divide-zinc-800/80 overflow-hidden shadow-xl">
          {FAQS.map((faq, idx) => {
            const isOpen = !!openFaqs[idx]
            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-5 px-6 text-left flex items-center gap-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                  <span className="text-sm sm:text-base font-semibold text-zinc-200 hover:text-white">
                    {faq.question}
                  </span>
                </button>

                {isOpen && (
                  <div className="pl-14 pr-6 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 6. Start Creating Now Hero / Device Showcase (Exact 1:1 match to Screenshot 1) */}
      <div className="relative text-center space-y-6 pt-10 pb-8 max-w-5xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Start creating now
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Find an Edition that fits your needs.
          </p>
        </div>

        <div className="pt-2">
          <a
            href={AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FA742B] hover:bg-[#E05A18] text-white font-extrabold text-sm py-4 px-8 rounded-xl transition-all shadow-xl shadow-[#FA742B]/20 active:scale-95 cursor-pointer"
          >
            <span>Buy FL Studio</span>
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Laptop / Screen Frame Display with Real FL Studio WebM Demo */}
        <div className="relative mt-12 pt-4">
          <div className="absolute inset-0 bg-radial from-[#9333ea]/15 via-transparent to-transparent blur-3xl pointer-events-none" />
          
          <div className="relative mx-auto max-w-5xl bg-[#141416] border border-zinc-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-1.5 pb-3 px-2 border-b border-zinc-800/80 text-[11px] text-zinc-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
              <span className="ml-2 font-mono text-[10px] text-zinc-400">FL Studio 24 — Official Workflow &amp; Playlist Demo</span>
            </div>

            {/* Official WebM Video Demo */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-xl overflow-hidden bg-black mt-2.5 border border-zinc-800/60 shadow-inner">
              <video
                src="https://www.image-line.com/static/assets/fl-studio-screen-demo.17f534b.webm"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
