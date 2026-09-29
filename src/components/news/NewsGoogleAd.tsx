'use client'

import React, { useEffect, useRef } from 'react'
import Script from 'next/script'

interface NewsGoogleAdProps {
  slot?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal'
  responsive?: boolean
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>
  }
}

export const NewsGoogleAd: React.FC<NewsGoogleAdProps> = ({
  slot = 'news_content_ad',
  format = 'auto',
  responsive = true,
  className = '',
}) => {
  const adRef = useRef<HTMLModElement | null>(null)
  const isLoaded = useRef(false)

  const publisherId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || ''

  useEffect(() => {
    // Only attempt to load live AdSense if publisher ID is configured
    if (!publisherId) return

    try {
      if (typeof window !== 'undefined' && !isLoaded.current) {
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
        isLoaded.current = true
      }
    } catch (err) {
      console.error('AdSense display error:', err)
    }
  }, [publisherId])

  // If publisherId is not configured, don't show empty placeholder clutter
  if (!publisherId) {
    return null
  }

  return (
    <>
      <Script
        id="google-adsense"
        async
        strategy="lazyOnload"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        crossOrigin="anonymous"
      />
      <div
        className={`w-full my-6 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-[#151518] border border-white/5 p-4 text-center ${className}`}
        aria-label="Advertisement"
      >
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 select-none">
          Advertisement
        </div>

        <ins
          ref={adRef}
          className="adsbygoogle block w-full"
          style={{ display: 'block' }}
          data-ad-client={publisherId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </>
  )
}
