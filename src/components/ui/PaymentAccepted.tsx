'use client'

import React, { useState } from 'react'

interface PaymentAcceptedProps {
  className?: string
  isIndia?: boolean
}

export function PaymentAccepted({ className = '', isIndia = true }: PaymentAcceptedProps) {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)

  const indiaLogos = [
    { name: 'UPI', file: 'upi' },
    { name: 'Google Pay', file: 'gpay' },
    { name: 'PhonePe', file: 'phonepe' },
    { name: 'Paytm', file: 'paytm' },
    { name: 'RuPay', file: 'rupay' },
    { name: 'Visa', file: 'visa' },
    { name: 'Mastercard', file: 'mastercard' },
  ]

  const globalLogos = [
    { name: 'PayPal', file: 'paypal' },
    { name: 'Visa', file: 'visa' },
    { name: 'Mastercard', file: 'mastercard' },
    { name: 'American Express', file: 'amex' },
  ]

  const activeLogos = isIndia ? indiaLogos : globalLogos

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3.5 sm:gap-5 ${className}`}>
      {activeLogos.map((logo) => {
        const isHovered = hoveredFile === logo.file
        return (
          <div
            key={logo.file}
            title={logo.name}
            onMouseEnter={() => setHoveredFile(logo.file)}
            onMouseLeave={() => setHoveredFile(null)}
            className="relative flex items-center justify-center w-[38px] h-[22px] sm:w-[44px] sm:h-[26px] select-none transition-transform duration-200 hover:scale-110 cursor-pointer"
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
