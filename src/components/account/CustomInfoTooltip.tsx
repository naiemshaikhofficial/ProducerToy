'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Info } from 'lucide-react'

interface CustomInfoTooltipProps {
  content: string
  className?: string
  align?: 'right' | 'center' | 'left'
}

export const CustomInfoTooltip: React.FC<CustomInfoTooltipProps> = ({
  content,
  className = '',
  align = 'right',
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false)
      }
    }
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible])

  return (
    <div
      ref={tooltipRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="text-zinc-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer focus:outline-none"
        aria-label="More information"
      >
        <Info className="w-4 h-4" />
      </button>

      {isVisible && (
        <div
          className={`absolute bottom-full mb-2.5 z-50 w-72 sm:w-80 p-3.5 bg-[#262626] border border-[#383838] rounded-xl shadow-2xl text-xs text-white leading-relaxed font-normal animate-in fade-in zoom-in-95 duration-100 select-none ${
            align === 'right'
              ? 'right-0'
              : align === 'center'
              ? 'left-1/2 -translate-x-1/2'
              : 'left-0'
          }`}
        >
          {content}

          {/* Pointing caret arrow */}
          <div
            className={`absolute top-full -mt-[1px] border-4 border-transparent border-t-[#262626] ${
              align === 'right'
                ? 'right-3'
                : align === 'center'
                ? 'left-1/2 -translate-x-1/2'
                : 'left-3'
            }`}
          />
          <div
            className={`absolute top-full border-4 border-transparent border-t-[#383838] -z-10 ${
              align === 'right'
                ? 'right-3'
                : align === 'center'
                ? 'left-1/2 -translate-x-1/2'
                : 'left-3'
            }`}
          />
        </div>
      )}
    </div>
  )
}
