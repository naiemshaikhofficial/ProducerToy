import React from 'react'
import Image from 'next/image'

interface ToywardsIconProps {
  size?: number
  className?: string
}

export function ToywardsIcon({ size = 16, className = '' }: ToywardsIconProps) {
  return (
    <Image
      src="/toywards.png"
      alt="Toywards"
      width={size}
      height={size}
      className={`inline-block object-contain flex-shrink-0 ${className}`}
      unoptimized
    />
  )
}
