'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { FAQPageJsonLd } from '@/components/JsonLd'

export interface ProductFaqProps {
  product: {
    name: string
    brand?: string
    brands?: { name: string }
    price_usd?: number
    product_type?: string
    vst_format?: string
    supported_daws?: string
    operating_system?: string
  }
}

export function generateProductFaqs(product: ProductFaqProps['product']) {
  const brandName = product.brands?.name || product.brand || 'Producer Toy'
  const isFree = Number(product.price_usd) === 0
  const type = (product.product_type || 'plugin').toLowerCase()
  const formats = product.vst_format || (type === 'sample_pack' ? '24-Bit WAV / STEMS' : 'VST3, AU, AAX (64-Bit)')
  const daws = product.supported_daws || 'FL Studio, Ableton Live, Logic Pro, Pro Tools, Cubase, Studio One, Reaper, and Bitwig Studio'
  const os = product.operating_system || 'Windows 10/11 (64-bit) and macOS 10.15+ (Apple Silicon M1/M2/M3/M4 & Intel)'

  const faqs = [
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

  return faqs
}

export function ProductFaqSection({ product }: ProductFaqProps) {
  const faqs = generateProductFaqs(product)
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1])

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  return (
    <div className="space-y-4 pt-6 select-none">
      <FAQPageJsonLd faqs={faqs} />

      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Frequently Asked Questions
        </h3>
        <p className="text-xs text-zinc-400">
          Everything you need to know about {product.name} compatibility and licensing.
        </p>
      </div>

      <div className="space-y-2.5 pt-2">
        {faqs.map((faq, index) => {
          const isOpen = openIndices.includes(index)
          return (
            <div
              key={index}
              className="bg-[#181818] border border-[#262626] rounded-xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleIndex(index)}
                className="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#1f1f1f] transition-colors"
              >
                <span className="text-sm font-semibold text-white tracking-tight">
                  {faq.question}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-[#222222] bg-[#141414]">
                  {faq.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
