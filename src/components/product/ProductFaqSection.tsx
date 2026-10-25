'use client'

import React, { useState } from 'react'
import { FAQPageJsonLd } from '@/components/JsonLd'
import { generateProductFaqs, ProductFaqInput } from '@/lib/seo/productFaqs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export { generateProductFaqs }

export interface ProductFaqProps {
  product: ProductFaqInput
}
export function ProductFaqSection({ product }: ProductFaqProps) {
  const faqs = generateProductFaqs(product)
  const [openValues, setOpenValues] = useState<string[]>([])

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

      <Accordion
        type="multiple"
        variant="filled"
        indicator="plus"
        value={openValues}
        onValueChange={setOpenValues}
        className="space-y-2.5 pt-2"
      >
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`faq-${index}`}
            className="bg-[#181818] hover:bg-[#1f1f1f] transition-colors rounded-xl border border-white/[0.04]"
          >
            <AccordionTrigger className="p-4 text-left text-sm font-semibold text-white tracking-tight hover:text-white">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-[#222222]">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

