'use client'

import React from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export function Logo({ size = 34, className = '', showText = true }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon (Favicon size logo asset) */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <Image
          src="/logo-white.png"
          alt="Producer Toy Logo"
          width={size}
          height={size}
          priority
          className="object-contain filter drop-shadow-sm"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-sm uppercase tracking-tight text-white leading-none font-mono">
            PRODUCER TOY
          </span>
          <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase leading-none mt-0.5">
            AUDIO MARKETPLACE
          </span>
        </div>
      )}
    </div>
  )
}

export function LogoIcon({ size = 34, className = '' }: Omit<LogoProps, 'showText'>) {
  return (
    <div className={`relative flex-shrink-0 flex items-center justify-center ${className}`}>
      <Image
        src="/logo-white.png"
        alt="Producer Toy Emblem"
        width={size}
        height={size}
        priority
        className="object-contain filter drop-shadow-sm"
      />
    </div>
  )
}
