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

/**
 * Links recognized SEO keywords within a plain text string.
 */
function linkSeoKeywords(
  plainText: string,
  linkedKeywordsCount: Map<string, number>,
  keyPrefix: string
): React.ReactNode[] {
  if (!plainText) return []

  const sortedKeywords = [...SEO_KEYWORD_MAP].sort((a, b) => b.phrase.length - a.phrase.length)
  const escapedPhrases = sortedKeywords.map((k) => k.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`\\b(${escapedPhrases.join('|')})\\b`, 'gi')

  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(plainText)) !== null) {
    const matchedText = match[0]
    const matchedLower = matchedText.toLowerCase()
    const matchIndex = match.index

    if (matchIndex > lastIndex) {
      nodes.push(plainText.slice(lastIndex, matchIndex))
    }

    const count = linkedKeywordsCount.get(matchedLower) || 0
    const targetLink = sortedKeywords.find((k) => k.phrase.toLowerCase() === matchedLower)

    if (count < 2 && targetLink) {
      linkedKeywordsCount.set(matchedLower, count + 1)
      nodes.push(
        <Link
          key={`${keyPrefix}-kw-${matchIndex}-${matchedText}`}
          href={targetLink.url}
          prefetch={true}
          className="text-zinc-200 hover:text-white underline underline-offset-2 hover:decoration-white transition-colors"
        >
          {matchedText}
        </Link>
      )
    } else {
      nodes.push(matchedText)
    }

    lastIndex = matchIndex + matchedText.length
  }

  if (lastIndex < plainText.length) {
    nodes.push(plainText.slice(lastIndex))
  }

  return nodes
}

/**
 * Parses inline markdown: **bold**, *italic*, [label](url), and auto-links SEO keywords.
 */
function renderInlineMarkdown(
  text: string,
  linkedKeywordsCount: Map<string, number>,
  keyPrefix: string
): React.ReactNode[] {
  if (!text) return []

  // Tokenize bold (**...**), markdown links ([...](...)), and italic (*...*)
  const tokenRegex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g
  const parts = text.split(tokenRegex)
  const elements: React.ReactNode[] = []

  parts.forEach((part, idx) => {
    if (!part) return
    const subKey = `${keyPrefix}-p${idx}`

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2)
      elements.push(
        <strong key={subKey} className="font-bold text-white">
          {renderInlineMarkdown(inner, linkedKeywordsCount, `${subKey}-b`)}
        </strong>
      )
    } else if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1)
      elements.push(
        <em key={subKey} className="italic text-zinc-200">
          {renderInlineMarkdown(inner, linkedKeywordsCount, `${subKey}-i`)}
        </em>
      )
    } else if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (match) {
        const [, label, url] = match
        elements.push(
          <Link
            key={subKey}
            href={url}
            className="text-zinc-200 hover:text-white underline underline-offset-2 hover:decoration-white transition-colors font-medium"
          >
            {label}
          </Link>
        )
      } else {
        elements.push(part)
      }
    } else {
      // Plain text: auto-link SEO keywords
      elements.push(...linkSeoKeywords(part, linkedKeywordsCount, subKey))
    }
  })

  return elements
}

interface Block {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'hr' | 'ul' | 'ol' | 'p'
  content?: string
  items?: string[]
}

/**
 * Parses multiline markdown into structured HTML blocks.
 */
function parseMarkdownBlocks(rawText: string): Block[] {
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n')
  const blocks: Block[] = []

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null
  let currentParagraphLines: string[] = []

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join(' ').trim()
      if (text) {
        blocks.push({ type: 'p', content: text })
      }
      currentParagraphLines = []
    }
  }

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push({ type: currentList.type, items: currentList.items })
      currentList = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // 1. Empty line
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    // 2. Horizontal divider: --- or *** or ___
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'hr' })
      continue
    }

    // 3. Headings
    if (line.startsWith('#### ')) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'h4', content: line.slice(5).trim() })
      continue
    }
    if (line.startsWith('### ')) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'h3', content: line.slice(4).trim() })
      continue
    }
    if (line.startsWith('## ')) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'h2', content: line.slice(3).trim() })
      continue
    }
    if (line.startsWith('# ')) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'h1', content: line.slice(2).trim() })
      continue
    }

    // 4. Unordered list: - item or * item
    const ulMatch = line.match(/^[-*]\s+(.*)$/)
    if (ulMatch) {
      flushParagraph()
      if (!currentList || currentList.type !== 'ul') {
        flushList()
        currentList = { type: 'ul', items: [] }
      }
      currentList.items.push(ulMatch[1])
      continue
    }

    // 5. Ordered list: 1. item
    const olMatch = line.match(/^\d+\.\s+(.*)$/)
    if (olMatch) {
      flushParagraph()
      if (!currentList || currentList.type !== 'ol') {
        flushList()
        currentList = { type: 'ol', items: [] }
      }
      currentList.items.push(olMatch[1])
      continue
    }

    // 6. Regular text line (accumulates into paragraph)
    flushList()
    currentParagraphLines.push(line)
  }

  flushParagraph()
  flushList()

  return blocks
}

export function AutoLinkText({
  text,
  className = 'text-zinc-300 leading-relaxed text-sm space-y-4',
}: {
  text: string
  className?: string
}) {
  if (!text) return null

  const blocks = parseMarkdownBlocks(text)
  const linkedKeywordsCount = new Map<string, number>()

  return (
    <div className={className}>
      {blocks.map((block, idx) => {
        const key = `blk-${idx}`

        switch (block.type) {
          case 'h1':
            return (
              <h1 key={key} className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-7 mb-3">
                {renderInlineMarkdown(block.content || '', linkedKeywordsCount, key)}
              </h1>
            )
          case 'h2':
            return (
              <h2 key={key} className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-6 mb-2.5">
                {renderInlineMarkdown(block.content || '', linkedKeywordsCount, key)}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={key} className="text-lg sm:text-xl font-bold text-white tracking-tight mt-6 mb-2">
                {renderInlineMarkdown(block.content || '', linkedKeywordsCount, key)}
              </h3>
            )
          case 'h4':
            return (
              <h4 key={key} className="text-base sm:text-lg font-semibold text-zinc-100 tracking-tight mt-4 mb-1.5">
                {renderInlineMarkdown(block.content || '', linkedKeywordsCount, key)}
              </h4>
            )
          case 'hr':
            return <hr key={key} className="border-[#262626] my-6" />
          case 'ul':
            return (
              <ul key={key} className="space-y-2 my-3 pl-5 list-disc list-outside text-zinc-300">
                {block.items?.map((item, itemIdx) => (
                  <li key={`${key}-li-${itemIdx}`} className="leading-relaxed">
                    {renderInlineMarkdown(item, linkedKeywordsCount, `${key}-li-${itemIdx}`)}
                  </li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={key} className="space-y-2 my-3 pl-5 list-decimal list-outside text-zinc-300">
                {block.items?.map((item, itemIdx) => (
                  <li key={`${key}-li-${itemIdx}`} className="leading-relaxed">
                    {renderInlineMarkdown(item, linkedKeywordsCount, `${key}-li-${itemIdx}`)}
                  </li>
                ))}
              </ol>
            )
          case 'p':
          default:
            return (
              <p key={key} className="leading-relaxed text-zinc-300">
                {renderInlineMarkdown(block.content || '', linkedKeywordsCount, key)}
              </p>
            )
        }
      })}
    </div>
  )
}
