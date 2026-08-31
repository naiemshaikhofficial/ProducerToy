'use client'

import React, { useState } from 'react'
import { Share2, Check, Link as LinkIcon, Twitter, Facebook, Linkedin } from 'lucide-react'

interface BlogShareButtonsProps {
  url: string
  title: string
}

export const BlogShareButtons: React.FC<BlogShareButtonsProps> = ({ url, title }) => {
  const [copied, setCopied] = useState(false)

  const shareLinks = [
    {
      name: 'X (Twitter)',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
  ]

  const handleCopy = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-1 flex items-center gap-1.5">
        <Share2 className="w-3.5 h-3.5" />
        <span>Share:</span>
      </span>

      {shareLinks.map((item) => {
        const IconComponent = item.icon
        return (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Share on ${item.name}`}
            className="p-2 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-zinc-400 hover:text-white border border-[#2a2a2a] hover:border-[#383838] transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
          >
            <IconComponent className="w-4 h-4" />
          </a>
        )
      })}

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopy}
        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
          copied
            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
            : 'bg-[#1c1c1c] hover:bg-[#282828] text-zinc-300 hover:text-white border-[#2a2a2a] hover:border-[#383838]'
        }`}
        title="Copy article link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Link Copied!</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  )
}
