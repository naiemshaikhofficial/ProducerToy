import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminClient } from '@/lib/supabase/admin'
import { CollectionPageJsonLd, FAQPageJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ProductCard, Product } from '@/components/ProductCard'
import { FolderCheck, Cpu, HardDrive, CheckCircle2 } from 'lucide-react'

export const revalidate = false // 🟢 Infinite edge cache

interface DawConfig {
  slug: string
  name: string
  developer: string
  metaTitle: string
  headline: string
  description: string
  supportedFormats: string
  vstFolderWindows: string
  vstFolderMac: string
  keywords: string[]
  faqs: Array<{ question: string; answer: string }>
}

const DAW_CONFIGS: Record<string, DawConfig> = {
  'fl-studio': {
    slug: 'fl-studio',
    name: 'FL Studio',
    developer: 'Image-Line',
    metaTitle: 'Best Free VST Plugins for FL Studio (2026) — 64-Bit VST3 Downloads',
    headline: 'Best Free VST Plugins for FL Studio 21 & 24',
    description:
      'Download tested 64-bit VST3 & VST plugins for Image-Line FL Studio on Windows & macOS. 100% royalty-free downloads.',
    supportedFormats: 'VST3, VST2 (64-Bit)',
    vstFolderWindows: 'C:\\Program Files\\Common Files\\VST3',
    vstFolderMac: '/Library/Audio/Plug-Ins/VST3',
    keywords: [
      'free plugins for fl studio',
      'fl studio free vst',
      'best free plugins for fl studio 21',
      'fl studio autotune free',
      'fl studio vocal chain plugins free',
    ],
    faqs: [
      {
        question: 'How do I install free VST plugins in FL Studio?',
        answer:
          '1. Download and install the VST3 installer.\n2. Open FL Studio and go to Options > Manage Plugins.\n3. Click "Find installed plugins".\n4. Your new plugin will appear under Installed > Effects or Generators.',
      },
      {
        question: 'Do all Producer Toy plugins work in FL Studio 20, 21, and 24?',
        answer:
          'Yes! All plugins on Producer Toy are native 64-bit VST3 and AU formats verified for FL Studio 20, 21, and 24 on both Windows and macOS.',
      },
    ],
  },
  'ableton-live': {
    slug: 'ableton-live',
    name: 'Ableton Live',
    developer: 'Ableton',
    metaTitle: 'Best Free Audio Plugins for Ableton Live 11 & 12 (2026) — VST3 & AU',
    headline: 'Best Free Audio Plugins for Ableton Live',
    description:
      'Supercharge Ableton Live 11 & 12 with top-rated free VST3 and AU effects, synthesizers, and mixing tools.',
    supportedFormats: 'VST3, AU (macOS)',
    vstFolderWindows: 'C:\\Program Files\\Common Files\\VST3',
    vstFolderMac: '/Library/Audio/Plug-Ins/VST3 and /Components',
    keywords: [
      'free plugins for ableton live',
      'ableton free vst3',
      'best free plugins for ableton 12',
      'ableton live vocal plugins free',
      'ableton live master chain free',
    ],
    faqs: [
      {
        question: 'How do I scan for new plugins in Ableton Live?',
        answer:
          'Go to Preferences > Plug-Ins, ensure "Use VST3 Plug-In System Folders" is turned ON, and click "Rescan".',
      },
    ],
  },
  'logic-pro': {
    slug: 'logic-pro',
    name: 'Logic Pro',
    developer: 'Apple',
    metaTitle: 'Best Free Audio Unit (AU) Plugins for Logic Pro X (Apple Silicon & Intel)',
    headline: 'Best Free AU Plugins for Logic Pro X',
    description:
      'Download 100% compatible Apple Silicon (M1/M2/M3/M4) & Intel Audio Unit (.component) plugins for Logic Pro X.',
    supportedFormats: 'AU (Audio Units / .component)',
    vstFolderWindows: 'N/A (macOS Only)',
    vstFolderMac: '/Library/Audio/Plug-Ins/Components',
    keywords: [
      'free au plugins logic pro',
      'logic pro x free vst',
      'best free plugins for logic pro',
      'apple silicon free plugins logic',
      'logic pro free autotune',
    ],
    faqs: [
      {
        question: 'Does Logic Pro support VST3 format?',
        answer:
          'Logic Pro exclusively uses Audio Units (AU / .component). All macOS installers on Producer Toy automatically include the AU version for Logic Pro.',
      },
    ],
  },
  cubase: {
    slug: 'cubase',
    name: 'Steinberg Cubase',
    developer: 'Steinberg',
    metaTitle: 'Best Free VST3 Plugins for Steinberg Cubase & Nuendo (2026)',
    headline: 'Best Free VST3 Plugins for Steinberg Cubase',
    description:
      'Enhance your Cubase mixing chain with high-performance 64-bit VST3 equalizers, compressors, and saturators.',
    supportedFormats: 'VST3 (64-Bit Native)',
    vstFolderWindows: 'C:\\Program Files\\Common Files\\VST3',
    vstFolderMac: '/Library/Audio/Plug-Ins/VST3',
    keywords: [
      'free vst3 for cubase',
      'cubase free plugins',
      'best free plugins for cubase 13',
      'steinberg cubase free vocal plugins',
    ],
    faqs: [
      {
        question: 'Why does Cubase only use VST3 now?',
        answer:
          'Steinberg developed the VST3 standard for lower CPU consumption (disabling processing when silence is detected) and dynamic sidechain routing.',
      },
    ],
  },
  'studio-one': {
    slug: 'studio-one',
    name: 'PreSonus Studio One',
    developer: 'PreSonus',
    metaTitle: 'Best Free Plugins for PreSonus Studio One 6 & 7 (2026)',
    headline: 'Best Free VST & AU Plugins for Studio One',
    description:
      'Discover top-tier free plugins for PreSonus Studio One with seamless drag-and-drop workflow.',
    supportedFormats: 'VST3, AU (macOS)',
    vstFolderWindows: 'C:\\Program Files\\Common Files\\VST3',
    vstFolderMac: '/Library/Audio/Plug-Ins/VST3',
    keywords: [
      'free plugins for studio one',
      'studio one free vst3',
      'best free plugins for presonus studio one',
    ],
    faqs: [
      {
        question: 'How do I drag and drop plugins in Studio One?',
        answer:
          'Open the Browser panel (F5), navigate to the Effects tab, and drag your desired plugin directly onto any track or channel.',
      },
    ],
  },
  reaper: {
    slug: 'reaper',
    name: 'Cockos Reaper',
    developer: 'Cockos',
    metaTitle: 'Best Free 64-Bit VST Plugins for Cockos Reaper (2026)',
    headline: 'Best Free Audio Plugins for Cockos Reaper',
    description:
      'Low-CPU, high-precision free audio plugins perfectly optimized for Cockos Reaper on Windows and macOS.',
    supportedFormats: 'VST3, VST2, AU (macOS)',
    vstFolderWindows: 'C:\\Program Files\\Common Files\\VST3',
    vstFolderMac: '/Library/Audio/Plug-Ins/VST3',
    keywords: [
      'free vst for reaper',
      'reaper free plugins',
      'best free audio plugins for reaper',
    ],
    faqs: [
      {
        question: 'How do I add custom VST paths in Reaper?',
        answer:
          'Go to Options > Preferences > Plug-ins > VST, click "Edit path list", add your folder, and click "Re-scan".',
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
  const config = DAW_CONFIGS[slug]

  if (!config) {
    return { title: 'DAW Plugins — Producer Toy' }
  }

  return generatePageMetadata({
    title: config.metaTitle,
    description: config.description,
    path: `/daw/${slug}`,
    keywords: config.keywords,
  })
}

export default async function DawLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const config = DAW_CONFIGS[slug]

  if (!config) {
    notFound()
  }

  const supabase = getAdminClient()

  // Fetch active products
  const { data: rawProducts } = await supabase
    .from('products')
    .select('*, brands!brand_id(name, slug, logo_url), categories(name, slug), subcategories(name, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const products: Product[] = (rawProducts as any[]) || []

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 text-white min-h-screen">
      {/* Schema.org Structured Data */}
      <CollectionPageJsonLd
        title={config.headline}
        description={config.description}
        url={`https://producertoy.com/daw/${config.slug}`}
        items={products.map((p) => ({
          name: p.name,
          url: `https://producertoy.com/product/${p.slug}`,
          price: Number(p.price_usd) || 0,
          image: p.cover_image,
        }))}
      />
      <FAQPageJsonLd faqs={config.faqs} />
      <BreadcrumbJsonLd
        breadcrumbs={[
          { name: 'Home', url: 'https://producertoy.com' },
          { name: 'DAW Compatibility', url: 'https://producertoy.com/store' },
          { name: config.name, url: `https://producertoy.com/daw/${config.slug}` },
        ]}
      />

      {/* Hero Header Section */}
      <div className="space-y-4 pt-2 border-b border-[#202020] pb-8">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/free-vst-plugins" className="hover:text-white transition-colors">Free Plugins</Link>
          <span>/</span>
          <span className="text-white font-medium">{config.name}</span>
        </div>

        <div className="space-y-2">
          <span className="bg-[#1f1f1f] text-[#FA742B] border border-[#FA742B]/30 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block">
            {config.developer} Compatible
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {config.headline}
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Quick DAW Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-2">
          {Object.values(DAW_CONFIGS).map((daw) => (
            <Link
              key={daw.slug}
              href={`/daw/${daw.slug}`}
              prefetch={true}
              className={`text-xs font-semibold px-4 py-2 rounded-xl border whitespace-nowrap transition-colors ${
                daw.slug === config.slug
                  ? 'bg-white text-black border-white'
                  : 'bg-[#181818] hover:bg-[#222222] text-zinc-300 hover:text-white border-[#2c2c2c]'
              }`}
            >
              {daw.name}
            </Link>
          ))}
        </div>
      </div>

      {/* DAW Quick Specs / VST Folder Guide Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#FA742B]">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Supported Formats</span>
          </div>
          <p className="text-sm font-semibold text-zinc-200">{config.supportedFormats}</p>
          <p className="text-[11px] text-zinc-400">64-bit Architecture on Windows & macOS</p>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-sky-400">
            <HardDrive className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Windows VST3 Folder</span>
          </div>
          <code className="text-xs font-mono bg-[#1c1c1c] text-zinc-300 px-2 py-1 rounded block truncate">
            {config.vstFolderWindows}
          </code>
          <p className="text-[11px] text-zinc-400">Default universal directory</p>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <FolderCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">macOS Audio Folder</span>
          </div>
          <code className="text-xs font-mono bg-[#1c1c1c] text-zinc-300 px-2 py-1 rounded block truncate">
            {config.vstFolderMac}
          </code>
          <p className="text-[11px] text-zinc-400">Apple Silicon M1/M2/M3/M4 & Intel</p>
        </div>
      </div>

      {/* Compatible Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Verified {config.name} Plugins & Sounds ({products.length})
          </h2>
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Tested & Verified</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="pt-10 border-t border-[#202020] space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {config.name} Plugin Installation FAQ
          </h2>
          <p className="text-xs text-zinc-400">
            Common questions about installing and configuring audio plugins in {config.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#161616] border border-[#242424] rounded-xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-white">{faq.question}</h3>
              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
