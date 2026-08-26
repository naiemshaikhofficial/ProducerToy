import React from 'react'

interface ButtonSpinnerProps {
  /** Size in pixels (default 16) or preset */
  size?: number | 'sm' | 'md' | 'lg'
  /** Color theme: 'dark' for black/dark-gray buttons (e.g. white background), 'light' for light/white on dark, 'zinc' for muted dark */
  variant?: 'dark' | 'light' | 'zinc'
  className?: string
}

/**
 * Minimalist, high-performance rotating loader spinner for all button submits & async actions.
 * Designed with a subtle track and smooth 60fps spin.
 */
export function ButtonSpinner({
  size = 16,
  variant = 'dark',
  className = '',
}: ButtonSpinnerProps) {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 14
      : size === 'lg'
      ? 20
      : 16

  const strokeWidth = pixelSize <= 14 ? 2.5 : pixelSize <= 18 ? 2.75 : 3

  // Track & Indicator Colors
  const trackColor =
    variant === 'dark'
      ? 'rgba(0, 0, 0, 0.15)'
      : variant === 'zinc'
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(255, 255, 255, 0.25)'

  const headColor =
    variant === 'dark'
      ? '#121212'
      : variant === 'zinc'
      ? '#a1a1aa'
      : '#ffffff'

  return (
    <svg
      className={`animate-spin flex-shrink-0 ${className}`}
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="loading"
    >
      {/* Background Track Circle */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Spinning Head Arc */}
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke={headColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  )
}
