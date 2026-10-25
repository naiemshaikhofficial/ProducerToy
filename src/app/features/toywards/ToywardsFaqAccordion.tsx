'use client'

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export interface FaqItem {
  question: string
  answer: string
}

export function ToywardsFaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion
      type="multiple"
      variant="filled"
      indicator="plus"
      defaultValue={[]}
      className="w-full space-y-2.5"
    >
      {items.map((item, idx) => (
        <AccordionItem
          key={idx}
          value={`faq-${idx}`}
          className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors rounded-xl border border-white/[0.04]"
        >
          <AccordionTrigger className="px-5 py-4 text-left text-base sm:text-lg font-bold text-white hover:text-white">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5 text-sm sm:text-[15px] text-zinc-400 leading-relaxed font-normal whitespace-pre-line border-t border-white/[0.04] pt-2">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

