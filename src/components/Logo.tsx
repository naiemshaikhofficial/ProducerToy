'use client'

import React from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export function Logo({ size = 36, className = '', showText = true }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon */}
      <picture className="flex-shrink-0">
        <source srcSet="/Icon.webp" type="image/webp" />
        <img
          src="/Icon.png"
          alt="Producer Toy Logo"
          style={{ height: `${size}px`, width: 'auto' }}
          className="object-contain filter drop-shadow-sm flex-shrink-0"
        />
      </picture>

      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-base uppercase tracking-tight leading-none">
            <span className="text-white">PRODUCER</span>{' '}
            <span className="text-[#0084FF]">TOY</span>
          </span>
          <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase leading-none mt-0.5">
            AUDIO MARKETPLACE
          </span>
        </div>
      )}
    </div>
  )
}

export function LogoIcon({ size = 48, className = '' }: Omit<LogoProps, 'showText'>) {
  return (
    <picture className={`flex-shrink-0 ${className}`}>
      <source srcSet="/Icon.webp" type="image/webp" />
      <img
        src="/Icon.png"
        alt="Producer Toy Emblem"
        style={{ height: `${size}px`, width: 'auto' }}
        className="object-contain filter drop-shadow-sm flex-shrink-0"
      />
    </picture>
  )
}
