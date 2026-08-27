import { Metadata } from 'next'

const DEFAULT_KEYWORDS = [
  'Producer Toy',
  'producertoy.com',
  'VST plugins',
  'free VST plugins',
  'sample packs',
  'free sample packs',
  'synth presets',
  'serum presets free',
  'FL Studio plugins',
  'Ableton Live plugins',
  'Logic Pro plugins',
  'pitch correction VST',
  'autotune free download',
  'royalty free samples',
  'drum kits free',
  '808 sample pack',
  'vocal presets',
  'daw templates',
]

const NICHE_KEYWORDS: Record<string, string[]> = {
  vocal: [
    'autotune VST',
    'free autotune',
    'vocal pitch correction',
    'vocal tuning plugin',
    'vocal chops',
    'vocal chain preset',
    'FL Studio vocal preset',
    'acapella loops',
  ],
  plugin: [
    'best VST plugins',
    'free audio plugin',
    'mixing plugins',
    'mastering VST',
    'synthesizer VST',
    'effect plugin',
    'VST3 AU AAX download',
  ],
  synth: [
    'Serum presets',
    'Vital synth presets',
    'Massive presets',
    'Sylenth1 presets',
    'synth patches free',
    'soundbank download',
  ],
  drums: [
    'drum kit free download',
    '808 bass loops',
    'hihat loops',
    'snare samples',
    'hi hop drum kit',
    'trap drums',
  ],
}

/**
 * Dynamically generates search engine keywords matching producer search intents
 */
export function generateSmartKeywords(title: string, category: string): string[] {
  const titleClean = title.replace(/[^\w\s-]/gi, '').toLowerCase()
  const words = titleClean.split(/\s+/).filter((w) => w.length > 2 && !['pack', 'vol', 'preset', 'plugin', 'vst'].includes(w))
  const categoryClean = category.toLowerCase()

  const generated: string[] = [titleClean, `${titleClean} download`, `free ${titleClean}`]

  words.forEach((word) => {
    generated.push(`${word} VST`)
    generated.push(`${word} plugin`)
    generated.push(`${word} free download`)
    generated.push(`free ${word}`)
  })

  const combined = `${titleClean} ${categoryClean}`

  if (combined.includes('vocal') || combined.includes('pitch') || combined.includes('tune') || combined.includes('voice')) {
    generated.push(...NICHE_KEYWORDS.vocal)
  }
  if (combined.includes('plugin') || combined.includes('vst') || combined.includes('effect') || combined.includes('instrument')) {
    generated.push(...NICHE_KEYWORDS.plugin)
  }
  if (combined.includes('synth') || combined.includes('preset') || combined.includes('serum') || combined.includes('vital')) {
    generated.push(...NICHE_KEYWORDS.synth)
  }
  if (combined.includes('drum') || combined.includes('808') || combined.includes('kit') || combined.includes('sample')) {
    generated.push(...NICHE_KEYWORDS.drums)
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
  const fullTitle = title.includes('Producer Toy') ? title : `${title} | ${siteTitle}`

  const ogImageUrl = image || `${baseUrl}/api/og?title=${encodeURIComponent(title)}`

  return {
    title: fullTitle,
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
      url: path ? `${baseUrl}${path}` : baseUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
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
    alternates: path ? { canonical: `${baseUrl}${path}` } : undefined,
  }
}
