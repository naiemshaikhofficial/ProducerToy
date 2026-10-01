'use client'

import React from 'react'

interface BlogContentRendererProps {
  content: string
}

const PB_AFFILIATE_ID = '68affa2b94f43'

function sanitizeLinkUrl(url: string): string {
  if (!url || url === '#' || url.startsWith('javascript:')) return '#'
  let clean = url.trim()

  // Ensure Plugin Boutique URLs always use Producer Toy's affiliate referral tag
  if (clean.toLowerCase().includes('pluginboutique.com')) {
    try {
      const parsed = new URL(clean)
      parsed.searchParams.set('a_aid', PB_AFFILIATE_ID)
      return parsed.toString()
    } catch {
      if (clean.includes('a_aid=')) {
        return clean.replace(/a_aid=[a-zA-Z0-9_-]+/g, `a_aid=${PB_AFFILIATE_ID}`)
      }
      return clean.includes('?') ? `${clean}&a_aid=${PB_AFFILIATE_ID}` : `${clean}?a_aid=${PB_AFFILIATE_ID}`
    }
  }

  return clean
}

function formatInline(text: string): string {
  return text
    // **bold**
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // *italic*
    .replace(/\*([^*]+)\*/g, '<em class="text-zinc-200 italic">$1</em>')
    // [text](url) - Convert markdown links and style CTA deal buttons
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, rawUrl) => {
      const url = sanitizeLinkUrl(rawUrl)
      if (url === '#') return linkText

      const isCtaButton =
        /^(get|claim|grab|download|buy|save|view)\b/i.test(linkText) ||
        linkText.toLowerCase().includes('deal') ||
        linkText.toLowerCase().includes('% off') ||
        linkText.toLowerCase().includes('€') ||
        linkText.toLowerCase().includes('$')

      if (isCtaButton) {
        return `<span class="inline-block my-2.5 mr-2"><a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FC6301] hover:bg-[#e05800] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-[#FC6301]/25 active:scale-95 no-underline"><span>${linkText}</span><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></span>`
      }

      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#FC6301] hover:underline font-semibold inline-flex items-center gap-1">${linkText}</a>`
    })
    // `code`
    .replace(/`([^`]+)`/g, '<code class="bg-[#242424] text-[#ffb182] px-1.5 py-0.5 rounded border border-[#333] text-sm font-mono">$1</code>')
}

export function parseMarkdownToHtml(raw: string): string {
  if (!raw) return ''

  // If already full HTML with paragraphs and no raw hashes, return as is
  if (/<p[\s>]/i.test(raw) && !raw.includes('###') && !raw.includes('##')) {
    return raw
  }

  let text = raw
    // 1. Decode common HTML entities
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#228;/g, 'ä')
    .replace(/&#246;/g, 'ö')
    .replace(/&#252;/g, 'ü')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // 2. Strip scraper boilerplate but preserve deal links
    .replace(/\[\.\.\.?\]/gi, '')
    .replace(/\[\.\.\./gi, '')
    .replace(/\.\.\./gi, '')
    .replace(/###?\s*Key Highlights\s*&?\s*Features[\s\S]*?(?=###?|##|$)/gi, '')
    .replace(/###?\s*How to Get It[\s\S]*?(?=###?|##|$)/gi, '')
    .trim()

  // 3. Ensure headings have clean block separation before and after
  text = text
    .replace(/([^\n])\s*(#{2,4}\s+)/g, '$1\n\n$2')
    .replace(/(#{2,4}[^\n]+)\n([^\n#])/g, '$1\n\n$2')

  // 4. Split into blocks
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean)
  const htmlBlocks: string[] = []

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    const firstLine = lines[0] || ''
    const remainingLines = lines.slice(1).join(' ')

    // Heading 2 (## Heading)
    if (/^##\s+/.test(firstLine)) {
      const title = firstLine.replace(/^##\s+/, '').trim()
      if (!/^overview$/i.test(title)) {
        htmlBlocks.push(`<h2>${formatInline(title)}</h2>`)
      }
      if (remainingLines) {
        htmlBlocks.push(`<p>${formatInline(remainingLines)}</p>`)
      }
      continue
    }

    // Heading 3 (### Heading)
    if (/^###\s+/.test(firstLine)) {
      const title = firstLine.replace(/^###\s+/, '').trim()
      htmlBlocks.push(`<h3>${formatInline(title)}</h3>`)
      if (remainingLines) {
        htmlBlocks.push(`<p>${formatInline(remainingLines)}</p>`)
      }
      continue
    }

    // Heading 4 (#### Heading)
    if (/^####\s+/.test(firstLine)) {
      const title = firstLine.replace(/^####\s+/, '').trim()
      htmlBlocks.push(`<h4>${formatInline(title)}</h4>`)
      if (remainingLines) {
        htmlBlocks.push(`<p>${formatInline(remainingLines)}</p>`)
      }
      continue
    }

    // Markdown Images ![alt](url)
    const imgMatch = firstLine.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/)
    if (imgMatch) {
      const alt = imgMatch[1] || 'Audio Plugin Software'
      const imgUrl = imgMatch[2]
      htmlBlocks.push(`
        <figure class="my-8 rounded-2xl overflow-hidden bg-[#181818] border border-white/10 shadow-2xl">
          <img src="${imgUrl}" alt="${alt}" loading="lazy" class="w-full h-auto object-cover max-h-[520px]" />
          ${alt ? `<figcaption class="text-center text-xs text-zinc-400 py-2.5 px-4 bg-[#141416] border-t border-white/5">${alt}</figcaption>` : ''}
        </figure>
      `)
      if (remainingLines) {
        htmlBlocks.push(`<p>${formatInline(remainingLines)}</p>`)
      }
      continue
    }

    // YouTube Video Embed (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)
    const ytMatch = block.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s)]*)?$/)
    if (ytMatch) {
      const videoId = ytMatch[1]
      htmlBlocks.push(`
        <div class="my-8 aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
          <iframe src="https://www.youtube-nocookie.com/embed/${videoId}" title="YouTube video player" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
      `)
      continue
    }

    // Ordered list (1. item)
    if (/^\d+\.\s+/.test(firstLine)) {
      const listItems = lines.map(line => {
        const itemText = line.replace(/^\d+\.\s+/, '').trim()
        return `<li>${formatInline(itemText)}</li>`
      }).join('')
      htmlBlocks.push(`<ol class="list-decimal pl-6 my-4 space-y-2 text-zinc-300">${listItems}</ol>`)
      continue
    }

    // Unordered List (- item or * item)
    if (/^[-*•]\s+/.test(firstLine)) {
      const listItems = lines.map(line => {
        const itemText = line.replace(/^[-*•]\s+/, '').trim()
        return `<li>${formatInline(itemText)}</li>`
      }).join('')
      htmlBlocks.push(`<ul>${listItems}</ul>`)
      continue
    }

    // Regular Paragraph with inline formatting and image check
    let paragraphContent = block.replace(/\n/g, ' ')
    // If inline markdown image exists inside a paragraph
    paragraphContent = paragraphContent.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, (m, alt, url) => {
      return `<figure class="my-6 rounded-2xl overflow-hidden bg-[#181818] border border-white/10 shadow-2xl"><img src="${url}" alt="${alt || 'Audio Plugin Software'}" loading="lazy" class="w-full h-auto object-cover max-h-[500px]" />${alt ? `<figcaption class="text-center text-xs text-zinc-400 py-2 px-4 bg-[#141416] border-t border-white/5">${alt}</figcaption>` : ''}</figure>`
    })

    htmlBlocks.push(`<p>${formatInline(paragraphContent)}</p>`)
  }

  return htmlBlocks.join('\n')
}

export function BlogContentRenderer({ content }: BlogContentRendererProps) {
  if (!content) return null
  const htmlContent = parseMarkdownToHtml(content)

  return (
    <div className="blog-content prose prose-invert max-w-none">
      <style jsx global>{`
        .blog-content {
          color: #d4d4d8; /* zinc-300 */
          font-size: 1.0625rem; /* 17px */
          line-height: 1.8;
          font-family: var(--font-sans, inherit);
        }

        .blog-content h2 {
          color: #ffffff;
          font-size: 1.65rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-top: 2.75rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #262626;
          line-height: 1.3;
        }

        @media (min-width: 640px) {
          .blog-content h2 {
            font-size: 1.85rem;
          }
        }

        .blog-content h3 {
          color: #ffffff;
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -0.015em;
          margin-top: 2.25rem;
          margin-bottom: 1rem;
          line-height: 1.35;
        }

        .blog-content h4 {
          color: #f4f4f5;
          font-size: 1.15rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
        }

        .blog-content p {
          margin-bottom: 1.5rem;
          color: #d4d4d8;
        }

        .blog-content strong {
          color: #ffffff;
          font-weight: 700;
        }

        .blog-content a {
          color: #FA742B;
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 600;
          transition: color 0.15s ease;
        }

        .blog-content a:hover {
          color: #ff9153;
        }

        .blog-content ul {
          list-style-type: none;
          padding-left: 0.5rem;
          margin-top: 1rem;
          margin-bottom: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .blog-content ul li {
          position: relative;
          padding-left: 1.75rem;
          color: #d4d4d8;
        }

        .blog-content ul li::before {
          content: '•';
          position: absolute;
          left: 0.25rem;
          top: 0;
          color: #FA742B;
          font-weight: bold;
          font-size: 1.35rem;
          line-height: 1;
        }

        .blog-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-top: 1rem;
          margin-bottom: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          color: #d4d4d8;
        }

        .blog-content ol li::marker {
          color: #FA742B;
          font-weight: bold;
        }

        .blog-content blockquote {
          position: relative;
          margin: 2rem 0;
          padding: 1.25rem 1.5rem;
          background: #181818;
          border-left: 4px solid #FA742B;
          border-radius: 0 12px 12px 0;
          color: #e4e4e7;
          font-style: normal;
        }

        .blog-content blockquote p {
          margin-bottom: 0;
          font-size: 1.05rem;
          line-height: 1.7;
        }

        .blog-content code {
          background-color: #242424;
          color: #ffb182;
          padding: 0.2rem 0.45rem;
          border-radius: 6px;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          border: 1px solid #333333;
        }

        .blog-content pre {
          background-color: #141414;
          border: 1px solid #282828;
          border-radius: 12px;
          padding: 1.25rem;
          overflow-x: auto;
          margin: 1.75rem 0;
        }

        .blog-content pre code {
          background: transparent;
          border: none;
          padding: 0;
          color: #e4e4e7;
          font-size: 0.9rem;
        }

        .blog-content img {
          border-radius: 14px;
          border: 1px solid #262626;
          margin: 2.25rem auto;
          width: 100%;
          max-height: 520px;
          object-fit: cover;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
        }

        /* 16:9 Responsive Video Container */
        .blog-content .video-container {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
          margin: 2rem 0;
          border-radius: 14px;
          overflow: hidden;
          background: #000000;
          border: 1px solid #262626;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
        }

        .blog-content .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        /* Product & Download CTA Box */
        .blog-content .cta-box {
          background: linear-gradient(135deg, #1c1c1c 0%, #151515 100%);
          border: 1px solid #2a2a2a;
          border-left: 4px solid #FA742B;
          border-radius: 14px;
          padding: 1.5rem 1.75rem;
          margin: 2.25rem 0;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .blog-content .cta-box h4 {
          color: #ffffff;
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }

        .blog-content .cta-box p {
          margin-bottom: 1rem;
          font-size: 0.95rem;
          color: #a1a1aa;
        }

        .blog-content .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #FA742B;
          color: #ffffff !important;
          font-weight: 700;
          text-decoration: none !important;
          padding: 0.65rem 1.25rem;
          border-radius: 10px;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.15s ease;
          box-shadow: 0 4px 14px rgba(250, 116, 43, 0.3);
        }

        .blog-content .cta-btn:hover {
          background: #e05a18;
          transform: translateY(-1px);
        }

        /* Responsive Comparison Table */
        .blog-content .comparison-table-wrapper {
          width: 100%;
          overflow-x: auto;
          margin: 2rem 0;
          border-radius: 12px;
          border: 1px solid #282828;
        }

        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
          background-color: #161616;
        }

        .blog-content th {
          background-color: #202020;
          color: #ffffff;
          padding: 0.85rem 1rem;
          font-weight: 700;
          border-bottom: 1px solid #2e2e2e;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
        }

        .blog-content td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #242424;
          color: #d4d4d8;
        }

        .blog-content tr:last-child td {
          border-bottom: none;
        }

        .blog-content tr:hover td {
          background-color: #1a1a1a;
        }

        /* FAQ Box for PAA Snippets */
        .blog-content .faq-item {
          background: #181818;
          border: 1px solid #262626;
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }

        .blog-content .faq-item h4 {
          color: #ffffff;
          font-size: 1.05rem;
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .blog-content .faq-item p {
          margin-bottom: 0;
          font-size: 0.95rem;
          color: #a1a1aa;
        }

        .blog-content hr {
          border: 0;
          border-top: 1px solid #282828;
          margin: 3rem 0;
        }
      `}</style>
      
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  )
}

export default BlogContentRenderer
