'use client'

import React from 'react'
import Link from 'next/link'

interface KeywordLink {
  phrase: string
  url: string
}

const SEO_KEYWORD_MAP: KeywordLink[] = [
  { phrase: 'tape saturation', url: '/categories/tape-saturation' },
  { phrase: 'harmonic exciter', url: '/categories/harmonic-exciter' },
  { phrase: 'saturation', url: '/categories/saturation' },
  { phrase: 'autotune', url: '/best/free-autotune-vst-plugins' },
  { phrase: 'auto-tune', url: '/best/free-autotune-vst-plugins' },
  { phrase: 'pitch correction', url: '/best/free-autotune-vst-plugins' },
  { phrase: 'dynamic eq', url: '/categories/dynamic-eq' },
  { phrase: 'equalizer', url: '/categories/eq' },
  { phrase: 'compressor', url: '/categories/compressor' },
  { phrase: 'bus compressor', url: '/categories/bus-compressor' },
  { phrase: 'reverb', url: '/categories/reverb' },
  { phrase: 'delay', url: '/categories/delay' },
  { phrase: 'FL Studio', url: '/daw/fl-studio' },
  { phrase: 'Ableton Live', url: '/daw/ableton-live' },
  { phrase: 'Logic Pro', url: '/daw/logic-pro' },
  { phrase: '808 bass', url: '/categories/808-bass' },
  { phrase: 'trap drum kit', url: '/categories/trap-drums' },
  { phrase: 'free vst', url: '/free-vst-plugins' },
]

export function AutoLinkText({
  text,
  className = 'text-zinc-300 leading-relaxed text-sm whitespace-pre-line',
}: {
  text: string
  className?: string
}) {
  if (!text) return null

  // Sort phrases by longest first so multi-word terms like "tape saturation" match before "saturation"
  const sortedKeywords = [...SEO_KEYWORD_MAP].sort((a, b) => b.phrase.length - a.phrase.length)

  // Construct regex pattern matching any of the phrases (case insensitive, word boundary)
  const escapedPhrases = sortedKeywords.map((k) => k.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`\\b(${escapedPhrases.join('|')})\\b`, 'gi')

  const linkedPhrasesCount = new Map<string, number>()
  const parts: React.ReactNode[] = []

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const matchedText = match[0]
    const matchedLower = matchedText.toLowerCase()
    const matchIndex = match.index

    // Add preceding plain text
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex))
    }

    // Only link the first 2 occurrences of any specific phrase to maintain clean readability
    const count = linkedPhrasesCount.get(matchedLower) || 0
    const targetLink = sortedKeywords.find((k) => k.phrase.toLowerCase() === matchedLower)

    if (count < 2 && targetLink) {
      linkedPhrasesCount.set(matchedLower, count + 1)
      parts.push(
        <Link
          key={`${matchIndex}-${matchedText}`}
          href={targetLink.url}
          prefetch={true}
          className="text-zinc-200 hover:text-white underline underline-offset-2 hover:decoration-[#FA742B] transition-colors"
        >
          {matchedText}
        </Link>
      )
    } else {
      parts.push(matchedText)
    }

    lastIndex = matchIndex + matchedText.length
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <div className={className}>{parts}</div>
}
