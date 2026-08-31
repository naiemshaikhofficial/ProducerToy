'use client'

import React from 'react'

interface BlogContentRendererProps {
  content: string
}

export function BlogContentRenderer({ content }: BlogContentRendererProps) {
  if (!content) return null

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
      
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export default BlogContentRenderer
