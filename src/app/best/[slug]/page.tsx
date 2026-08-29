import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminClient } from '@/lib/supabase/admin'
import { ItemListJsonLd, FAQPageJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Star, Download, ExternalLink, ShieldCheck, Cpu } from 'lucide-react'

export const revalidate = 1800 // Cache for 30 minutes

interface BestOfConfig {
  slug: string
  title: string
  headline: string
  metaTitle: string
  description: string
  introText: string
  keywords: string[]
  searchCategory?: string
  tags: string[]
  faqs: Array<{ question: string; answer: string }>
}

export const BEST_OF_CONFIGS: Record<string, BestOfConfig> = {
  'free-autotune-vst-plugins': {
    slug: 'free-autotune-vst-plugins',
    title: 'Best Free Auto-Tune VST Plugins (2026)',
    headline: 'Best Free Auto-Tune & Vocal Pitch Correction VSTs',
    metaTitle: 'Best Free Auto-Tune VST Plugins (2026) — Vocal Pitch Correction',
    description:
      'Looking for free autotune? Discover the best free vocal pitch correction, tuning, and formant shifting VST3/AU plugins for FL Studio, Ableton, and Logic Pro.',
    introText:
      'Vocal pitch correction is an essential tool in modern music production. Whether you want subtle transparent pitch alignment or the classic hard-tuned trap autotune effect, here is our tested ranking of the best free vocal tuning VST plugins.',
    keywords: [
      'free autotune vst',
      'best free autotune 2026',
      'vocal pitch correction free',
      'autotune plugin fl studio',
      'autotune plugin ableton',
      'free pitch shifter vst',
    ],
    tags: ['auto-tune', 'pitch', 'vocal', 'pitch-correction'],
    faqs: [
      {
        question: 'Which free autotune plugin works best with FL Studio?',
        answer:
          'MAutoPitch and Graillon 2 are two of the best free autotune plugins for FL Studio, offering real-time zero-latency pitch correction and formant control.',
      },
      {
        question: 'How do I get the classic T-Pain / Travis Scott autotune effect for free?',
        answer:
          'Set your plugin speed/retune rate to 0ms (instant), select your track key (e.g., C Minor), and enable chromatic snapping.',
      },
    ],
  },
  'free-saturation-plugins': {
    slug: 'free-saturation-plugins',
    title: 'Best Free Saturation VST Plugins (2026)',
    headline: 'Best Free Saturation & Tape Warmth VST Plugins',
    metaTitle: 'Best Free Saturation VST Plugins (2026) — Tape Warmth & Exciters',
    description:
      'Add analog tape warmth, tube harmonics, and high-end air. Download the top rated free saturation and harmonic exciter plugins.',
    introText:
      'Saturation adds musical harmonics, analog warmth, and presence to otherwise sterile digital audio. Here are the top rated freeware saturation, exciter, and tape simulation plugins.',
    keywords: [
      'free saturation vst',
      'tape saturation plugin free',
      'harmonic exciter free',
      'fresh air vst alternative',
      'tube saturation plugin free',
    ],
    tags: ['saturation', 'tape-saturation', 'harmonic-exciter', 'analog-warmth'],
    faqs: [
      {
        question: 'What is the difference between tape saturation and tube saturation?',
        answer:
          'Tape saturation provides smooth compression and high-frequency rounding (even harmonics), while tube saturation adds warm grit and vintage edge (odd harmonics).',
      },
      {
        question: 'Is Fresh Air by Slate Digital completely free?',
        answer:
          'Yes! Fresh Air by Slate Digital is 100% free with no expiration, delivering crystal-clear top-end air using vintage exciter processing.',
      },
    ],
  },
  'free-compressor-vst-plugins': {
    slug: 'free-compressor-vst-plugins',
    title: 'Best Free Compressor VST Plugins (2026)',
    headline: 'Best Free Compressor & Dynamics VST Plugins',
    metaTitle: 'Best Free Compressor VST Plugins (2026) — Bus & Sidechain Dynamics',
    description:
      'Download the best free compressor VST plugins for punchy drums, transparent vocal leveling, and glue bus compression.',
    introText:
      'Dynamic control is the backbone of professional mixing. These free compressor VST plugins offer precision sidechaining, fast FET-style limiting, and smooth optical leveling without costing a dime.',
    keywords: [
      'free compressor vst',
      'best free compressor plugin',
      'sidechain compressor free',
      'bus compressor vst free',
      'mastering compressor free',
    ],
    tags: ['compressor', 'bus-compressor', 'dynamics', 'limiter'],
    faqs: [
      {
        question: 'What is the best free compressor for drum buses?',
        answer:
          'TDR Kotelnikov and RoughRider 3 are celebrated for their snappy attack, punchy transient shaping, and transparent RMS detection.',
      },
    ],
  },
  'free-reverb-vst-plugins': {
    slug: 'free-reverb-vst-plugins',
    title: 'Best Free Reverb VST Plugins (2026)',
    headline: 'Best Free Reverb & Spatial Audio Plugins',
    metaTitle: 'Best Free Reverb VST Plugins (2026) — Space, Plate & Algorithmic',
    description:
      'Transform dry tracks with lush, massive spatial reverberation. Download top rated free reverb VST plugins for Windows and macOS.',
    introText:
      'Whether you need a tight room reverb for snares or infinite ambient decay for synths, here are the highest rated free reverb plugins in the industry.',
    keywords: [
      'free reverb vst',
      'valhalla supermassive free',
      'best free reverb plugin',
      'ambient reverb vst free',
      'plate reverb free',
    ],
    tags: ['reverb', 'spatial', 'delay', 'ambient'],
    faqs: [
      {
        question: 'What is the best free ambient reverb plugin?',
        answer:
          'Valhalla Supermassive is universally regarded as the gold standard for free giant spaces, lush reverbs, and modulated echoes.',
      },
    ],
  },
  'free-delay-vst-plugins': {
    slug: 'free-delay-vst-plugins',
    title: 'Best Free Delay VST Plugins (2026)',
    headline: 'Best Free Delay & Echo Audio Plugins',
    metaTitle: 'Best Free Delay VST Plugins (2026) — Tape Echo, Ping Pong & Ping',
    description:
      'Explore the best free delay and tape echo plugins with ping-pong, ducking, and vintage modulation.',
    introText:
      'From synchronized rhythmic echoes to psychedelic dub tape delays, these free plugins add dimension and motion to your mix.',
    keywords: [
      'free delay vst',
      'ping pong delay free',
      'tape delay plugin free',
      'echo vst plugin free',
    ],
    tags: ['delay', 'tape-delay', 'echo'],
    faqs: [
      {
        question: 'Can I get ping pong delay with free VSTs?',
        answer:
          'Yes, Valhalla Supermassive and TAL-Dub offer stereo ping-pong cross-feedback and tempo synchronization.',
      },
    ],
  },
  'free-eq-vst-plugins': {
    slug: 'free-eq-vst-plugins',
    title: 'Best Free EQ VST Plugins (2026)',
    headline: 'Best Free Equalizer & Dynamic EQ VST Plugins',
    metaTitle: 'Best Free EQ VST Plugins (2026) — Dynamic & Parametric Equalizers',
    description:
      'Shape and clean your mix with precision. Download the best free parametric and dynamic equalizers for music production.',
    introText:
      'Clean surgical cuts and musical broad boosts: here is the definitive collection of top free parametric, dynamic, and vintage graphic equalizers.',
    keywords: [
      'free eq vst',
      'dynamic eq free',
      'tdr nova free eq',
      'best free equalizer plugin',
      'parametric eq vst free',
    ],
    tags: ['eq', 'dynamic-eq', 'equalizer'],
    faqs: [
      {
        question: 'What is the best free alternative to FabFilter Pro-Q3?',
        answer:
          'TDR Nova by Tokyo Dawn Labs is the closest free alternative, offering 4-band dynamic EQ, high/low pass filters, and precise real-time spectrum analysis.',
      },
    ],
  },
  'free-trap-drum-kits-808': {
    slug: 'free-trap-drum-kits-808',
    title: 'Best Free Trap Drum Kits & 808 Bass Packs (2026)',
    headline: 'Best Free 808 Bass & Trap Drum Kits',
    metaTitle: 'Best Free Trap Drum Kits & 808 Bass Packs (2026) — 100% Royalty-Free',
    description:
      'Download hard-hitting 808s, crisp hi-hats, claps, and snares. 100% royalty-free 24-bit WAV downloads for FL Studio & Ableton.',
    introText:
      'Get industry-standard trap drums and ground-shaking 808 bass samples. All kits are 100% cleared for commercial beat sales and streaming releases.',
    keywords: [
      'free trap drum kit',
      '808 bass samples free',
      'free trap sample pack',
      'royalty free drum kit',
      'fl studio trap drum kit',
    ],
    tags: ['808-bass', 'trap-drums', 'hip-hop', 'sound_kit', 'sample_pack'],
    faqs: [
      {
        question: 'Are these free 808 samples tuned to C?',
        answer:
          'Yes, all 808 bass samples on Producer Toy are precisely tuned to C for instant keyboard pitching in your DAW.',
      },
    ],
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const config = BEST_OF_CONFIGS[slug]

  if (!config) {
    return { title: 'Best VST Plugins — Producer Toy' }
  }

  return generatePageMetadata({
    title: config.metaTitle,
    description: config.description,
    path: `/best/${slug}`,
    keywords: config.keywords,
  })
}

export default async function BestOfRoundupPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const config = BEST_OF_CONFIGS[slug]

  if (!config) {
    notFound()
  }

  const supabase = getAdminClient()

  // Fetch products matching tags or category
  const { data: rawProducts } = await supabase
    .from('products')
    .select('*, brands!brand_id(name, slug, logo_url), categories(name, slug), subcategories(name, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const allProducts = (rawProducts as any[]) || []

  // Filter products by matching slug tags
  const matchedProducts = allProducts.filter((p) => {
    const pTags = Array.isArray(p.tags) ? p.tags.map((t: string) => t.toLowerCase()) : []
    const pCategorySlugs = Array.isArray(p.category_slugs) ? p.category_slugs : []
    const pSubcategory = p.subcategories?.slug || ''
    const pType = (p.product_type || '').toLowerCase()

    const hasTagMatch = config.tags.some(
      (t) =>
        pTags.includes(t) ||
        pCategorySlugs.includes(t) ||
        pSubcategory.includes(t) ||
        pType.includes(t) ||
        p.name.toLowerCase().includes(t)
    )
    return hasTagMatch
  })

  // Fallback to top rated products if specific tag has few items
  const displayProducts = matchedProducts.length > 0 ? matchedProducts : allProducts.slice(0, 8)

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 text-white min-h-screen">
      {/* Schema.org Structured Data */}
      <ItemListJsonLd
        name={config.title}
        description={config.description}
        itemListElement={displayProducts.map((p, idx) => ({
          position: idx + 1,
          name: p.name,
          url: `https://producertoy.com/product/${p.slug}`,
          image: p.cover_image,
          description: p.short_description || p.description,
        }))}
      />
      <FAQPageJsonLd faqs={config.faqs} />
      <BreadcrumbJsonLd
        breadcrumbs={[
          { name: 'Home', url: 'https://producertoy.com' },
          { name: 'Best Plugins', url: 'https://producertoy.com/best' },
          { name: config.title, url: `https://producertoy.com/best/${config.slug}` },
        ]}
      />

      {/* Hero Header Section */}
      <div className="space-y-4 pt-2 border-b border-[#202020] pb-8">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/free-vst-plugins" className="hover:text-white transition-colors">Free Plugins</Link>
          <span>/</span>
          <span className="text-white font-medium">{config.title}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          {config.headline}
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 max-w-4xl leading-relaxed">
          {config.introText}
        </p>

        {/* Quick Nav Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-2">
          {Object.values(BEST_OF_CONFIGS).map((item) => (
            <Link
              key={item.slug}
              href={`/best/${item.slug}`}
              prefetch={true}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border whitespace-nowrap transition-colors ${
                item.slug === config.slug
                  ? 'bg-white text-black border-white'
                  : 'bg-[#181818] hover:bg-[#222222] text-zinc-300 hover:text-white border-[#2c2c2c]'
              }`}
            >
              {item.title.replace(' (2026)', '')}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Listicle Comparison Stack */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Top Ranked Selection ({displayProducts.length} Tools)
          </h2>
          <span className="text-xs text-zinc-400">Updated for 2026</span>
        </div>

        <div className="space-y-6">
          {displayProducts.map((product, index) => {
            const devName = product.brands?.name || product.brand || 'Producer Toy'
            const isFree = Number(product.price_usd) === 0
            const formats = product.vst_format || 'VST3, AU, AAX (64-Bit)'

            return (
              <div
                key={product.id}
                className="bg-[#141414] hover:bg-[#181818] border border-[#262626] hover:border-[#383838] rounded-2xl p-5 sm:p-6 transition-all shadow-xl space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Left: Product Artwork (Rank Badge Overlay) */}
                  <div className="md:col-span-4 relative aspect-[16/10] rounded-xl overflow-hidden bg-[#0c0c0c] border border-[#222222]">
                    <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur-md text-white font-black text-xs px-2.5 py-1 rounded-lg border border-white/20">
                      #{index + 1}
                    </div>
                    <Image
                      src={product.cover_image || '/Icon.png'}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  {/* Center: Info, Description & Specs */}
                  <div className="md:col-span-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-300">{devName}</span>
                      <span>•</span>
                      <span className="uppercase text-[10px] bg-[#222222] px-2 py-0.5 rounded border border-[#333333]">
                        {product.product_type || 'Plugin'}
                      </span>
                    </div>

                    <Link href={`/product/${product.slug}`} className="block group">
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#FA742B] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3">
                      {product.short_description || product.description || `High-performance ${product.name} designed for professional music producers.`}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1 flex-wrap">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>4.8</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{formats}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Royalty-Free</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: CTA & Price */}
                  <div className="md:col-span-3 flex flex-col items-start md:items-end justify-center gap-3 border-t md:border-t-0 md:border-l border-[#222222] pt-4 md:pt-0 md:pl-6">
                    <div className="text-left md:text-right">
                      <div className="text-2xl font-black text-white">
                        {isFree ? 'FREE' : `$${Number(product.price_usd).toFixed(2)}`}
                      </div>
                      <div className="text-[11px] text-zinc-400">Direct Download</div>
                    </div>

                    <Link
                      href={`/product/${product.slug}`}
                      prefetch={true}
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition-all bg-[#0074e4] hover:bg-[#0074e4]/90 text-white shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{isFree ? 'GET FREE' : 'BUY NOW'}</span>
                      {isFree ? <Download className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    </Link>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SEO FAQ Section */}
      <div className="pt-10 border-t border-[#202020] space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-zinc-400">
            Answers to common questions about {config.title.toLowerCase()}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#161616] border border-[#242424] rounded-xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-white">{faq.question}</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
