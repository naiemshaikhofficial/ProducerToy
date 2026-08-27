'use client'

import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export interface FaqItem {
  question: string
  answer: string
}

export function ToywardsFaqAccordion({ items }: { items: FaqItem[] }) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  return (
    <div className="divide-y divide-[#262626] border-t border-b border-[#262626]">
      {items.map((item, idx) => {
        const isOpen = openFaqIndex === idx
        return (
          <div key={idx} className="py-5 sm:py-6">
            <button
              type="button"
              onClick={() => toggleFaq(idx)}
              className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="text-base sm:text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                {item.question}
              </span>
              <span className="text-zinc-400 group-hover:text-white transition-colors flex-shrink-0">
                {isOpen ? <Minus size={20} /> : <Plus size={20} />}
              </span>
            </button>

            {isOpen && (
              <div className="mt-4 text-sm sm:text-[15px] text-zinc-400 leading-relaxed font-normal whitespace-pre-line animate-in fade-in duration-150 pr-4">
                {item.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
