'use client'

import { useEffect } from 'react'

export function ImageProtection() {
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement
      if (!target) return

      const isImage =
        target.tagName === 'IMG' ||
        target.tagName === 'SVG' ||
        target.tagName === 'PICTURE' ||
        Boolean(target.closest('img')) ||
        Boolean(target.closest('picture'))

      if (isImage) {
        // Resolve slug URL: parent link or current page URL
        const anchor = target.closest('a') as HTMLAnchorElement | null
        const targetHref = anchor?.href || (typeof window !== 'undefined' ? window.location.href : '')

        if (targetHref && e.dataTransfer) {
          // Transfer ONLY the page/product/article slug link, never the raw image asset
          e.dataTransfer.clearData()
          e.dataTransfer.setData('text/uri-list', targetHref)
          e.dataTransfer.setData('text/plain', targetHref)
          e.dataTransfer.effectAllowed = 'copyLink'
        } else {
          e.preventDefault()
        }
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'IMG' ||
          target.tagName === 'SVG' ||
          target.tagName === 'PICTURE' ||
          Boolean(target.closest('img')) ||
          Boolean(target.closest('picture')))
      ) {
        e.preventDefault()
      }
    }

    document.addEventListener('dragstart', handleDragStart, true)
    document.addEventListener('contextmenu', handleContextMenu, true)

    return () => {
      document.removeEventListener('dragstart', handleDragStart, true)
      document.removeEventListener('contextmenu', handleContextMenu, true)
    }
  }, [])

  return null
}
