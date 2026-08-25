import Link from 'next/link'
import { AlertCircle, ArrowLeft, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center px-4 sm:px-6 py-16">
      <div className="max-w-md w-full bg-[#161616] border border-[#262626] rounded-2xl p-8 sm:p-10 text-center shadow-2xl flex flex-col items-center">
        
        {/* Sleek Dark Icon Container */}
        <div className="w-16 h-16 rounded-full bg-[#202020] border border-[#2e2e2e] flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-zinc-400" />
        </div>

        {/* 404 Header */}
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Error 404</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Page Not Found
        </h1>

        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          The page or product you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>

        {/* Epic Store CTA Buttons */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/store"
            className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Search className="w-4 h-4" />
            Browse Storefront
          </Link>

          <Link
            href="/"
            className="w-full bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full border border-[#2e2e2e] transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  )
}
