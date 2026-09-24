'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { FAQPageJsonLd } from '@/components/JsonLd'
import { generateProductFaqs, ProductFaqInput } from '@/lib/seo/productFaqs'

export { generateProductFaqs }

export interface ProductFaqProps {
  product: ProductFaqInput
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
