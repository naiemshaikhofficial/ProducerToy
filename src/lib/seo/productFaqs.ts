export interface ProductFaqData {
  question: string
  answer: string
}

export interface ProductFaqInput {
  name: string
  brand?: string
  brands?: { name: string }
  price_usd?: number
  product_type?: string
  vst_format?: string
  supported_daws?: string
  operating_system?: string
}

export function generateProductFaqs(product: ProductFaqInput): ProductFaqData[] {
  const brandName = product.brands?.name || product.brand || 'Producer Toy'
  const isFree = Number(product.price_usd) === 0
  const type = (product.product_type || 'plugin').toLowerCase()
  const formats = product.vst_format || (type === 'sample_pack' ? '24-Bit WAV / STEMS' : 'VST3, AU, AAX (64-Bit)')
  const daws = product.supported_daws || 'FL Studio, Ableton Live, Logic Pro, Pro Tools, Cubase, Studio One, Reaper, and Bitwig Studio'
  const os = product.operating_system || 'Windows 10/11 (64-bit) and macOS 10.15+ (Apple Silicon M1/M2/M3/M4 & Intel)'

  return [
    {
      question: `Is ${product.name} free to download?`,
      answer: isFree
        ? `Yes, ${product.name} by ${brandName} is 100% free to download on Producer Toy Store with direct instant access and zero subscription required.`
        : `${product.name} is available for purchase on Producer Toy Store with instant digital delivery and lifetime access.`,
    },
    {
      question: `Which DAWs and music software are compatible with ${product.name}?`,
      answer: `${product.name} is fully tested and compatible with all major DAWs including ${daws}.`,
    },
    {
      question: `What formats and operating systems are supported?`,
      answer: `${product.name} is delivered in ${formats} format for ${os}.`,
    },
    {
      question: `Can I use ${product.name} in commercial music releases and client projects?`,
      answer: `Yes, all downloads on Producer Toy include a 100% royalty-free commercial license for music streaming (Spotify, Apple Music), sync licensing, YouTube, and commercial beat sales with zero hidden royalties.`,
    },
    {
      question: `How do I install and access ${product.name} after downloading?`,
      answer: `Once acquired, you can find direct download links and license keys in your Producer Toy Library. Run the installer or drag the sound assets directly into your DAW browser.`,
    },
  ]
}
