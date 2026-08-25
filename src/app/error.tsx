'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled App Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center px-4 sm:px-6 py-16">
      <div className="max-w-md w-full bg-[#161616] border border-[#262626] rounded-2xl p-8 sm:p-10 text-center shadow-2xl flex flex-col items-center">
        
        {/* Sleek Dark Icon Container */}
        <div className="w-16 h-16 rounded-full bg-[#202020] border border-[#2e2e2e] flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-zinc-400" />
        </div>

        {/* Error Header */}
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Something Went Wrong</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Application Error
        </h1>

        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          An unexpected error occurred while loading this section. Please try again or return to the main storefront.
        </p>

        {/* Epic Store CTA Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/store"
            className="w-full bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full border border-[#2e2e2e] transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return to Store
          </Link>
        </div>

      </div>
    </div>
  )
}
