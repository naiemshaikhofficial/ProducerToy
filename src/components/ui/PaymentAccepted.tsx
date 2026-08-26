'use client'

import React, { useState } from 'react'

interface PaymentAcceptedProps {
  className?: string
  variant?: 'compact' | 'full'
}

export function PaymentAccepted({ className = '', variant = 'compact' }: PaymentAcceptedProps) {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)

  const logos = [
    { name: 'UPI', file: 'upi' },
    { name: 'RuPay', file: 'rupay' },
    { name: 'Visa', file: 'visa' },
    { name: 'Mastercard', file: 'mastercard' },
    { name: 'American Express', file: 'amex' },
    { name: 'PayPal', file: 'paypal' },
  ]

  const activeLogos = variant === 'compact'
    ? logos.filter((l) => ['upi', 'rupay', 'visa', 'mastercard', 'amex', 'paypal'].includes(l.file))
    : logos

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3.5 sm:gap-4.5 ${className}`}>
      {activeLogos.map((logo) => {
        const isHovered = hoveredFile === logo.file
        return (
          <div
            key={logo.file}
            title={logo.name}
            onMouseEnter={() => setHoveredFile(logo.file)}
            onMouseLeave={() => setHoveredFile(null)}
            className="relative flex items-center justify-center w-[36px] h-[20px] sm:w-[42px] sm:h-[24px] select-none transition-transform duration-200 hover:scale-110 cursor-pointer"
          >
            <img
              src={`/payment-logos/${logo.file}.svg`}
              alt={logo.name}
              className="w-full h-full object-contain transition-all duration-300"
              style={{
                filter: isHovered
                  ? 'brightness(1) invert(0) opacity(1)'
                  : 'brightness(0) invert(1) opacity(0.4)',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
