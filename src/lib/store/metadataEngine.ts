/**
 * Dynamic Store Metadata Engine
 * Handles automatic title & description synthesis for all current and future
 * products, categories, subcategories, brands, and filter combinations.
 */

// Music terminology & acronym capitalization map
const ACRONYMS_AND_PROPER_NAMES: Record<string, string> = {
  'vst': 'VST',
  'vst3': 'VST3',
  'au': 'AU',
  'aax': 'AAX',
  'eq': 'EQ',
  'daw': 'DAW',
  '808': '808',
  '808s': '808s',
  'midi': 'MIDI',
  'ai': 'AI',
  'fm': 'FM',
  'edm': 'EDM',
  'fx': 'FX',
  'wav': 'WAV',
  'mp3': 'MP3',
  'dsp': 'DSP',
  'lfo': 'LFO',
  'adsr': 'ADSR',
  'fl': 'FL',
  'fl-studio': 'FL Studio',
  'ableton': 'Ableton',
  'ableton-live': 'Ableton Live',
  'logic': 'Logic',
  'logic-pro': 'Logic Pro',
  'pro-tools': 'Pro Tools',
  'cubase': 'Cubase',
  'studio-one': 'Studio One',
  'reaper': 'Reaper',
  'bitwig': 'Bitwig',
  'serum': 'Xfer Serum',
  'vital': 'Vital',
  'massive': 'Massive',
  'phase-plant': 'Phase Plant',
  'sylenth1': 'Sylenth1',
  'nexus': 'Nexus',
  'omnisphere': 'Omnisphere',
  'kontakt': 'Kontakt',
  'izotope': 'iZotope',
  'fabfilter': 'FabFilter',
  'slate-digital': 'Slate Digital',
  'valhalla': 'Valhalla',
  'soundtoys': 'Soundtoys',
  'arturia': 'Arturia',
  'uad': 'Universal Audio (UAD)',
  'waves': 'Waves',
  'lofi': 'Lo-Fi',
  'lo-fi': 'Lo-Fi',
  'hip-hop': 'Hip Hop',
  'hiphop': 'Hip Hop',
}

/**
 * Format any raw slug or name into proper music production casing
 * Examples:
 *   "granular-synthesis" -> "Granular Synthesis"
 *   "eq-and-dynamics" -> "EQ & Dynamics"
 *   "808-bass" -> "808 Bass"
 *   "fl-studio-templates" -> "FL Studio Templates"
 */
export function formatAudioTitle(raw: string): string {
  if (!raw) return ''
  const trimmed = raw.trim()
  const lower = trimmed.toLowerCase()

  if (ACRONYMS_AND_PROPER_NAMES[lower]) {
    return ACRONYMS_AND_PROPER_NAMES[lower]
  }

  // Split by hyphens, underscores, or spaces
  const parts = trimmed.split(/[-_\s]+/).filter(Boolean)
  const formattedParts = parts.map((part) => {
    const partLower = part.toLowerCase()
    if (ACRONYMS_AND_PROPER_NAMES[partLower]) {
      return ACRONYMS_AND_PROPER_NAMES[partLower]
    }
    if (partLower === 'and') return '&'
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  })

  return formattedParts.join(' ')
}

export interface StoreHeaderMeta {
  title: string
  description: string
}

// Pre-curated core meta dictionary for instant lightning-fast matching
export const CORE_STORE_METADATA: Record<string, StoreHeaderMeta> = {
  'free': {
    title: 'Free Producer Toys',
    description: 'Producer Toy gives you free VST plugins, sample packs, synths, and audio tools every week. Download 100% royalty-free tools to produce professional music on FL Studio, Ableton Live, Logic Pro & Cubase.',
  },
  'deals': {
    title: 'Deals & Limited-Time Discounts',
    description: 'Save big on premier VST plugins, synthesizer presets, and sound libraries. Exclusive discounts and limited-time music production sales.',
  },
  'bundles': {
    title: 'Bundles & Complete Suites',
    description: 'Massive value collection bundles, complete developer suites, and all-in-one producer packs for total creative freedom.',
  },
  'rent-to-own': {
    title: 'Rent-to-Own Plugins',
    description: 'Get industry-standard audio plugins with flexible rent-to-own plans. Pay as you produce, cancel anytime, own it forever.',
  },
  'plugins': {
    title: 'VST Plugins & Audio Effects',
    description: 'Browse premier VST audio plugins, analog tape saturators, surgical equalizers, reverb processors, and mixing dynamics crafted for professional producers.',
  },
  'effects': {
    title: 'Audio Effects & Processors',
    description: 'Explore premier audio effect plugins including reverbs, delays, compressors, saturators, and EQ processors on Producer Toy.',
  },
  'instruments': {
    title: 'Virtual Instruments & Synthesizers',
    description: 'Virtual synthesizers, sampled pianos, acoustic guitars, drum machines, and polyphonic sound engines.',
  },
  'synthesizers': {
    title: 'Synthesizers & Soft Synth VSTs',
    description: 'Polyphonic soft synths, wavetable instruments, and vintage analog modeling synthesizers.',
  },
  'sounds': {
    title: 'Sounds & Sample Packs',
    description: 'Royalty-free sample packs, 808 sub basses, trap drum kits, melody loops, and vocal stems with instant download.',
  },
  'sample-packs': {
    title: 'Royalty-Free Sample Packs',
    description: '100% royalty-free sample packs, drum one-shots, melodic loops, and sound libraries for music producers.',
  },
  'presets': {
    title: 'Synth Presets & Soundbanks',
    description: 'Xfer Serum, Vital, and Massive preset banks for modern electronic, trap, and pop music producers.',
  },
  'templates': {
    title: 'DAW Templates & Stems',
    description: 'Full DAW project templates designed to jumpstart your track creation and learn pro arrangement techniques.',
  },
  'saturation': {
    title: 'Saturation & Tape Warmth VST Plugins',
    description: 'Download top-rated analog tape saturation, tube warmth, and harmonic exciter plugins on Producer Toy.',
  },
  'tape-saturation': {
    title: 'Tape Saturation VST Plugins',
    description: 'Discover the best analog tape saturators, tube exciters, and warmth processors for drums, vocals, and master bus.',
  },
  'harmonic-exciter': {
    title: 'Harmonic & High-End Exciter Plugins',
    description: 'Add smooth high-end presence and analog harmonics with premier exciter plugins on Producer Toy.',
  },
  'eq': {
    title: 'Equalizer (EQ) & Dynamic EQ VST Plugins',
    description: 'Surgical mixing EQs, dynamic equalizers, and vintage analog curve processors for clean audio mastering.',
  },
  'dynamic-eq': {
    title: 'Dynamic Equalizer VST Plugins',
    description: 'Tame harsh resonances and balance your mix with high-precision dynamic EQ plugins.',
  },
  'reverb': {
    title: 'Reverb & Space Echo VST Plugins',
    description: 'Lush algorithmic reverbs, shimmer spaces, plate simulations, and convolution reverb plugins on Producer Toy.',
  },
  'space-reverb': {
    title: 'Space & Ambience Reverb Plugins',
    description: 'Immersive hall, chamber, and algorithmic space reverbs for expansive depth in your mix.',
  },
  'delay': {
    title: 'Delay & Echo VST Plugins',
    description: 'Ping-pong delays, vintage tape echoes, and stereo modulation delay effects for modern music production.',
  },
  'tape-delay': {
    title: 'Tape Delay & Ping Pong Delay Plugins',
    description: 'Classic tape delay, space echo, and stereo ping-pong delay plugins for atmospheric audio production.',
  },
  'compressor': {
    title: 'Compressor & Limiter VST Plugins',
    description: 'Glue compressors, bus processors, sidechain tools, and mastering limiters for punchy dynamic control.',
  },
  'bus-compressor': {
    title: 'Bus Compressor & Dynamics Plugins',
    description: 'Glue your mix together with analog bus compressors and master channel dynamic processors.',
  },
  'auto-tune': {
    title: 'Auto-Tune & Pitch Correction VST Plugins',
    description: 'Real-time pitch correction, hard-tune robotic effects, and transparent vocal tuning plugins on Producer Toy.',
  },
  'vocal-processing': {
    title: 'Vocal Processing & Chain Plugins',
    description: 'All-in-one vocal chains, pitch shifters, de-essers, and vocal compressors for pristine lead vocals.',
  },
  'drum-kits': {
    title: 'Drum Kits & Percussion Sample Packs',
    description: 'Hard-hitting 808s, punchy kicks, crisp snares, and royalty-free drum loops for modern beatmakers.',
  },
  'trap-drums': {
    title: 'Trap & Drill Drum Kits',
    description: 'Heavy 808 basses, sliding drill glides, fast hi-hat rolls, and punchy trap drums for modern producers.',
  },
  '808-bass': {
    title: '808 Sub Bass Loops & One-Shots',
    description: 'Tuned 808 sub basses, distorted glide 808s, and deep sub bass samples with instant direct download.',
  },
  'serum-presets': {
    title: 'Xfer Serum Presets & Soundbanks',
    description: 'Download premium and free Xfer Serum soundbanks for trap, hyperpop, EDM, and cinematic music.',
  },
  'vital-presets': {
    title: 'Vital Synth Presets & Wavetables',
    description: 'Custom Vital presets, custom wavetables, and patch banks for futuristic sound design.',
  },
  'fl-studio-templates': {
    title: 'FL Studio Project Templates',
    description: 'Full FL Studio mixing project files, vocal chain presets, and beat arrangement templates.',
  },
  'guitars-bass': {
    title: 'Acoustic & Electric Guitar VSTs',
    description: 'Realistic acoustic guitar instruments, sampled electric guitars, and virtual bass plugins.',
  },
  'mastering': {
    title: 'Audio Mastering Plugins & Suites',
    description: 'Precision audio mastering processors, limiters, loudness meters, and dynamic curve shapers.',
  },
  'distortion': {
    title: 'Distortion & Overdrive VST Plugins',
    description: 'Warm tube saturation, aggressive distortion, and creative waveshapers for dirty textures.',
  },
  'synth': {
    title: 'Synthesizer VST Plugins',
    description: 'Wavetable synthesizers, analog modeling soft synths, and cutting-edge polyphonic instruments.',
  },
  'vocal': {
    title: 'Vocal Processors & FX Plugins',
    description: 'Vocal tuning, pitch shifters, vocal doubles, and studio vocal chain processors.',
  },
  'guitar': {
    title: 'Guitar Plugins & Amp Simulators',
    description: 'Virtual guitar amplifiers, stompbox pedals, acoustic simulators, and guitar effects.',
  },
  'hip-hop': {
    title: 'Hip Hop & Trap Production Tools',
    description: 'Hard-hitting 808s, trap melody packs, boom-bap drum kits, and beatmaker presets.',
  },
  'edm': {
    title: 'EDM & Electronic Music Production',
    description: 'High-energy synths, drops, punchy drums, and festival sound design tools.',
  },
  'cinematic': {
    title: 'Cinematic & Ambient Sound Design',
    description: 'Atmospheric drones, cinematic orchestral textures, and soundtrack scoring tools.',
  },
}

export interface StoreMetaOptions {
  searchQuery?: string
  isFree?: boolean
  isDeals?: boolean
  isBundles?: boolean
  isRentToOwn?: boolean
  selectedBrand?: { name?: string; slug?: string; description?: string | null } | null
  selectedCategorySlug?: string
  selectedSubCategorySlug?: string
  selectedProductTypeSlug?: string
  selectedPriceTier?: string
  fallbackTitle?: string
  fallbackDescription?: string
}

/**
 * Main Auto-Synthesis Engine
 * Dynamically synthesizes high-converting, professional copy for ANY existing
 * or future combination of products, brands, categories, tags, and filters.
 */
export function generateStoreHeaderMeta(options: StoreMetaOptions): StoreHeaderMeta {
  const {
    searchQuery = '',
    isFree = false,
    isDeals = false,
    isBundles = false,
    isRentToOwn = false,
    selectedBrand = null,
    selectedCategorySlug = '',
    selectedSubCategorySlug = '',
    selectedProductTypeSlug = '',
    selectedPriceTier = '',
    fallbackTitle = '',
    fallbackDescription = '',
  } = options

  // 1. Search Query
  if (searchQuery.trim()) {
    const q = searchQuery.trim()
    return {
      title: `Search: "${q}"`,
      description: `Explore all matching VST plugins, sample packs, presets, and audio software for "${q}" on Producer Toy.`,
    }
  }

  // Target single subject (Subcategory > Category > Product Type)
  const activeSubjectSlug = (selectedSubCategorySlug || selectedCategorySlug || selectedProductTypeSlug || '').toLowerCase()
  const hasSubject = Boolean(activeSubjectSlug && activeSubjectSlug !== 'all' && activeSubjectSlug !== 'store')

  // 2. Brand Combinations
  if (selectedBrand?.name) {
    const bName = selectedBrand.name.trim()

    if (isFree) {
      return {
        title: `Free ${bName} Plugins & Sounds`,
        description: `Download 100% free VST plugins, presets, and sample packs created by ${bName} on Producer Toy.`,
      }
    }

    if (isDeals) {
      return {
        title: `${bName} Deals & Discounts`,
        description: `Save big on official ${bName} audio plugins, instruments, and software with limited-time sales.`,
      }
    }

    if (hasSubject) {
      return {
        title: `${bName} ${formatAudioTitle(activeSubjectSlug)}`,
        description: `Explore official ${formatAudioTitle(activeSubjectSlug)} plugins and sounds created by ${bName} on Producer Toy.`,
      }
    }

    return {
      title: `${bName} Plugins & Sounds`,
      description: selectedBrand.description?.trim() || `Explore official audio plugins, virtual instruments, and sound design tools created by ${bName} on Producer Toy.`,
    }
  }

  // 3. Free Event Combinations (with or without specific category)
  if (isFree) {
    if (hasSubject) {
      const cleanSubjectTitle = formatAudioTitle(activeSubjectSlug).replace(/plugins|sounds|vst/gi, '').trim()
      return {
        title: `Free ${cleanSubjectTitle} Plugins & Sounds`,
        description: `Download 100% free ${cleanSubjectTitle.toLowerCase()} VST plugins, presets, and royalty-free samples for FL Studio, Ableton Live & Logic Pro.`,
      }
    }

    return CORE_STORE_METADATA['free']
  }

  // 4. Deals / Discounted Combinations
  if (isDeals) {
    if (hasSubject) {
      const cleanSubjectTitle = formatAudioTitle(activeSubjectSlug).replace(/plugins|sounds|vst/gi, '').trim()
      return {
        title: `Discounted ${cleanSubjectTitle} & Special Deals`,
        description: `Save big on top-tier ${cleanSubjectTitle.toLowerCase()} audio tools and plugins with limited-time manufacturer discounts.`,
      }
    }

    return CORE_STORE_METADATA['deals']
  }

  // 5. Bundles
  if (isBundles) {
    if (hasSubject) {
      const cleanSubjectTitle = formatAudioTitle(activeSubjectSlug).replace(/plugins|sounds|vst/gi, '').trim()
      return {
        title: `${cleanSubjectTitle} Bundles & Suites`,
        description: `Complete collection bundles and discounted producer suites for ${cleanSubjectTitle.toLowerCase()}.`,
      }
    }
    return CORE_STORE_METADATA['bundles']
  }

  // 6. Rent-To-Own
  if (isRentToOwn) {
    if (hasSubject) {
      const cleanSubjectTitle = formatAudioTitle(activeSubjectSlug).replace(/plugins|sounds|vst/gi, '').trim()
      return {
        title: `Rent-to-Own ${cleanSubjectTitle} Plugins`,
        description: `Get professional ${cleanSubjectTitle.toLowerCase()} plugins with flexible rent-to-own plans. Pay as you produce, own it forever.`,
      }
    }
    return CORE_STORE_METADATA['rent-to-own']
  }

  // 7. Known or Dynamic Category / Subcategory / Genre
  if (hasSubject) {
    // If exact match exists in curated metadata
    if (CORE_STORE_METADATA[activeSubjectSlug]) {
      return CORE_STORE_METADATA[activeSubjectSlug]
    }

    // Dynamic Synthesis for any future category/tag added to database
    const formattedName = formatAudioTitle(activeSubjectSlug)
    const lower = activeSubjectSlug.toLowerCase()

    if (lower.includes('synth') || lower.includes('instrument') || lower.includes('piano') || lower.includes('guitar') || lower.includes('bass') || lower.includes('drum-machine')) {
      return {
        title: `${formattedName} Virtual Instruments`,
        description: `Discover top-rated ${formattedName.toLowerCase()} virtual instruments, sampled sound engines, and playable software plugins on Producer Toy.`,
      }
    }

    if (lower.includes('sample') || lower.includes('pack') || lower.includes('drum') || lower.includes('808') || lower.includes('loop') || lower.includes('stem') || lower.includes('vocal')) {
      return {
        title: `${formattedName} Sample Packs & Sounds`,
        description: `100% royalty-free ${formattedName.toLowerCase()} sample packs, one-shots, and audio loops ready for instant DAW drag-and-drop.`,
      }
    }

    if (lower.includes('preset') || lower.includes('bank') || lower.includes('patch')) {
      return {
        title: `${formattedName} Presets & Soundbanks`,
        description: `Professional ${formattedName.toLowerCase()} preset soundbanks and patches designed to elevate your sound design.`,
      }
    }

    if (lower.includes('template') || lower.includes('project') || lower.includes('stem')) {
      return {
        title: `${formattedName} DAW Templates`,
        description: `Full project templates and arrangements for ${formattedName.toLowerCase()} to jumpstart your music workflow.`,
      }
    }

    return {
      title: `${formattedName} Plugins & Sounds`,
      description: `Explore premier ${formattedName.toLowerCase()} audio plugins, sound libraries, and music production tools on Producer Toy.`,
    }
  }

  // 8. Price Tier Specific
  if (selectedPriceTier) {
    switch (selectedPriceTier) {
      case 'free':
        return CORE_STORE_METADATA['free']
      case 'under-10':
        return {
          title: 'Producer Toys Under $10',
          description: 'Affordable, pro-grade audio plugins and sound collections that won\'t break the bank.',
        }
      case 'under-25':
        return {
          title: 'Producer Toys Under $25',
          description: 'High-value production plugins, synth presets, and sample packs under $25.',
        }
      case 'under-50':
        return {
          title: 'Premium Producer Toys Under $50',
          description: 'Industry-standard mixing plugins and sound collections under $50.',
        }
      case '50-plus':
        return {
          title: 'Pro Suites & Flagship Software',
          description: 'Flagship music production suites, mixing bundles, and professional studio tools.',
        }
    }
  }

  // 9. SSR Fallbacks if passed
  if (fallbackTitle && fallbackTitle !== 'Store Catalog') {
    return {
      title: fallbackTitle,
      description: fallbackDescription || 'Discover the premier marketplace for VST plugins, sample packs, and synth presets.',
    }
  }

  // 10. Default Store Catalog
  return {
    title: 'Store Catalog',
    description: 'Discover the premier marketplace for VST plugins, royalty-free sample packs, synth presets, and DAW templates. Download 100% royalty-free tools to produce professional music on FL Studio, Ableton Live, Logic Pro & Cubase.',
  }
}
