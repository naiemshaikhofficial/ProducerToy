import React from 'react'

interface TelegramNewsBannerProps {
  className?: string
}

/**
 * Ultra-minimalist single-line Telegram news link with official logo.
 * No borders, no background box, clean white single-line text.
 */
export function TelegramNewsBanner({ className = '' }: TelegramNewsBannerProps) {
  return (
    <div className={`w-full flex items-center justify-center py-5 px-3 sm:px-4 overflow-hidden ${className}`}>
      <a
        href="https://t.me/producertoynews"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center justify-center gap-2 max-w-full text-xs sm:text-sm text-zinc-300 hover:text-white transition-colors text-center"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 text-white group-hover:text-[#229ED9] transition-colors shrink-0"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.92 9.06c-.14.65-.53.81-1.07.51l-2.95-2.17-1.42 1.37c-.16.16-.29.29-.6.29l.21-3.01 5.48-4.95c.24-.21-.05-.33-.37-.12l-6.78 4.27-2.92-.91c-.63-.2-.65-.63.13-.94l11.41-4.4c.53-.19.99.13.83.95z" />
        </svg>
        {/* Desktop Single Line */}
        <span className="hidden sm:inline">
          Join <strong className="text-white underline underline-offset-4 decoration-white/40 group-hover:decoration-white">@producertoynews</strong> on Telegram for real-time plugin deals &amp; free VST drops
        </span>
        {/* Mobile Single Line - Concise & fits perfectly without cutting off or horizontal overflow */}
        <span className="sm:hidden text-[11.5px] truncate">
          Join <strong className="text-white underline underline-offset-4 decoration-white/40 group-hover:decoration-white">@producertoynews</strong> for instant deals &amp; free VSTs
        </span>
      </a>
    </div>
  )
}
