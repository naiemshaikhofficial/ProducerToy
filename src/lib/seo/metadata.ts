import { Metadata } from 'next'

export const BRAND_KEYWORDS = [
  'Producer Toy',
  'producertoy',
  'producertoy.com',
  'producer toys',
  'producers toy',
  'producers toys',
  'producer toy store',
  'producer toy marketplace',
  'producer toy plugins',
  'producer toy samples',
  'producer toy presets',
  'producer toy free vst',
  'producer toy official',
]

const DEFAULT_KEYWORDS = [
  ...BRAND_KEYWORDS,
  'VST plugins',
  'free VST plugins',
  'sample packs',
  'free sample packs',
  'synth presets',
  'serum presets free',
  'vital presets',
  'FL Studio plugins',
  'Ableton Live plugins',
  'Logic Pro plugins',
  'pitch correction VST',
  'autotune free download',
  'royalty free samples',
  'drum kits free',
  '808 sample pack',
  'vocal presets',
  'saturation plugin',
  'free saturator',
  'tape saturation vst',
  'dynamic equalizer',
  'space reverb vst',
  'daw templates',
  'music software download',
]

const NICHE_KEYWORDS: Record<string, string[]> = {
  saturation: [
    'saturation plugin',
    'free saturator',
    'tape saturation vst',
    'analog saturation',
    'tube saturation plugin',
    'harmonic exciter',
    'air exciter',
    'high end exciter',
    'dynamic exciter',
    'sound saturator',
    'warmth plugin',
    'analog warmth VST',
    'soft clipper vst',
    'distortion plugin',
  ],
  eq: [
    'equalizer vst',
    'free eq plugin',
    'dynamic eq',
    'parametric eq',
    'mixing eq',
    'mastering eq',
    'analog eq vst',
    'surgical eq plugin',
    'parallel equalizer',
    'air eq plugin',
  ],
  reverb: [
    'reverb plugin',
    'free reverb vst',
    'space echo plugin',
    'algorithmic reverb',
    'shimmer reverb vst',
    'hall reverb',
    'plate reverb vst',
    'lush reverb',
    'ambient space vst',
  ],
  delay: [
    'delay plugin',
    'ping pong delay vst',
    'tape delay vst',
    'stereo delay plugin',
    'analog delay vst',
    'echo plugin',
  ],
  compressor: [
    'compressor vst',
    'free compressor plugin',
    'sidechain compressor',
    'bus compressor vst',
    'mastering limiter',
    'analog compressor',
    'dynamic processor',
    'glue compressor',
  ],
  vocal: [
    'autotune VST',
    'free autotune',
    'vocal pitch correction',
    'vocal tuning plugin',
    'vocal chops',
    'vocal chain preset',
    'FL Studio vocal preset',
    'acapella loops',
    'vocal sauce',
    'vocal processor',
    'vocal air plugin',
  ],
  plugin: [
    'best VST plugins',
    'free audio plugin',
    'mixing plugins',
    'mastering VST',
    'synthesizer VST',
    'audio effect plugin',
    'VST3 AU AAX download',
    'music production software',
    'free VST download 64 bit',
  ],
  synth: [
    'Serum presets',
    'Vital synth presets',
    'Massive presets',
    'Sylenth1 presets',
    'synth patches free',
    'soundbank download',
    'synth vst',
    'polyphonic synthesizer',
    'analog synth plugin',
  ],
  drums: [
    'drum kit free download',
    '808 bass loops',
    'hihat loops',
    'snare samples',
    'hip hop drum kit',
    'trap drum kit',
    'drill drum kit',
    'boom bap samples',
    'drum loops royalty free',
  ],
  guitar: [
    'acoustic guitar vst',
    'guitar vst free',
    'electric guitar plugin',
    'acoustic guitar sample pack',
    'guitar loops',
  ],
  template: [
    'FL Studio template',
    'Ableton Live project file',
    'Logic Pro template',
    'mixing template',
    'DAW project stems',
  ],
}

/**
 * Dynamically generates high-ranking search engine keywords matching producer search intents
 */
export function generateSmartKeywords(
  title: string,
  category: string = '',
  brand: string = '',
  productType: string = '',
  isFree: boolean = false
): string[] {
  const titleClean = title.replace(/[^\w\s-]/gi, '').toLowerCase().trim()
  const words = titleClean.split(/\s+/).filter((w) => w.length > 2 && !['pack', 'vol', 'preset', 'plugin', 'vst'].includes(w))
  const categoryClean = category.toLowerCase().trim()
  const brandClean = brand.toLowerCase().trim()

  const generated: string[] = [
    ...BRAND_KEYWORDS,
    titleClean,
    `${titleClean} download`,
    `${titleClean} free download`,
    `${titleClean} plugin`,
    `${titleClean} vst`,
    `${titleClean} review`,
  ]

  if (brandClean) {
    generated.push(
      `${brandClean} ${titleClean}`,
      `${titleClean} by ${brandClean}`,
      `${brandClean} plugins`,
      `${brandClean} vst download`
    )
  }

  words.forEach((word) => {
    generated.push(`${word} VST`)
    generated.push(`${word} plugin`)
    generated.push(`${word} free download`)
    generated.push(`free ${word}`)
    generated.push(`best ${word} plugin`)
  })

  const combined = `${titleClean} ${categoryClean} ${brandClean} ${productType}`.toLowerCase()

  if (combined.includes('fresh air') || combined.includes('saturat') || combined.includes('exciter') || combined.includes('warmth') || combined.includes('clip')) {
    generated.push(...NICHE_KEYWORDS.saturation)
  }
  if (combined.includes('eq') || combined.includes('equaliz') || combined.includes('nova') || combined.includes('ozone')) {
    generated.push(...NICHE_KEYWORDS.eq)
  }
  if (combined.includes('reverb') || combined.includes('space') || combined.includes('supermassive') || combined.includes('valhalla')) {
    generated.push(...NICHE_KEYWORDS.reverb)
  }
  if (combined.includes('delay') || combined.includes('echo')) {
    generated.push(...NICHE_KEYWORDS.delay)
  }
  if (combined.includes('compress') || combined.includes('limit') || combined.includes('dynamic')) {
    generated.push(...NICHE_KEYWORDS.compressor)
  }
  if (combined.includes('vocal') || combined.includes('pitch') || combined.includes('tune') || combined.includes('voice') || combined.includes('autotune')) {
    generated.push(...NICHE_KEYWORDS.vocal)
  }
  if (combined.includes('plugin') || combined.includes('vst') || combined.includes('effect') || combined.includes('instrument')) {
    generated.push(...NICHE_KEYWORDS.plugin)
  }
  if (combined.includes('synth') || combined.includes('preset') || combined.includes('serum') || combined.includes('vital')) {
    generated.push(...NICHE_KEYWORDS.synth)
  }
  if (combined.includes('drum') || combined.includes('808') || combined.includes('kit') || combined.includes('sample') || combined.includes('skull')) {
    generated.push(...NICHE_KEYWORDS.drums)
  }
  if (combined.includes('guitar') || combined.includes('ample')) {
    generated.push(...NICHE_KEYWORDS.guitar)
  }
  if (combined.includes('template') || combined.includes('fl studio') || combined.includes('project')) {
    generated.push(...NICHE_KEYWORDS.template)
  }

  if (isFree || combined.includes('free')) {
    generated.push(
      `free ${titleClean}`,
      `free ${titleClean} plugin`,
      `free ${titleClean} vst`,
      'free VST plugins',
      'free sample packs download',
      'free audio plugins 64 bit'
    )
  }

  return Array.from(new Set(generated))
}

export function generatePageMetadata({
  title,
  description,
  image,
  keywords = [],
  path = '',
}: {
  title: string
  description: string
  image?: string
  keywords?: string[]
  path?: string
}): Metadata {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
      : 'https://producertoy.com'
  const siteTitle = 'Producer Toy Store'
  const cleanTitle = title.trim()
  const fullTitle = cleanTitle.includes('Producer Toy') ? cleanTitle : `${cleanTitle} | ${siteTitle}`

  const ogImageUrl = image || `${baseUrl}/Icon.png`
  const canonicalUrl = path ? `${baseUrl}${path.startsWith('/') ? path : `/${path}`}` : baseUrl

  return {
    title: {
      absolute: fullTitle,
    },
    description,
    keywords: Array.from(new Set([...DEFAULT_KEYWORDS, ...keywords])),
    metadataBase: new URL(baseUrl),
    authors: [{ name: 'Producer Toy', url: baseUrl }],
    creator: 'Producer Toy',
    publisher: 'Producer Toy',
    category: 'Music Production',
    classification: 'VST Plugins, Audio FX, Sample Packs, Synth Presets, Music Software',
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          alt: cleanTitle,
        },
      ],
      type: 'website',
      siteName: siteTitle,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImageUrl],
      creator: '@producertoy',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}
