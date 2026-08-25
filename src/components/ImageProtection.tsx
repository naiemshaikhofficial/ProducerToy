'use client'

import { useEffect } from 'react'

export function ImageProtection() {
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement
      if (!target) return

      const isImage = target.tagName === 'IMG' || target.tagName === 'SVG' || target.closest('img') || target.closest('picture')
      
      if (isImage) {
        // Find if image is inside a product link or anchor tag
        const anchor = target.closest('a') as HTMLAnchorElement | null
        if (anchor && anchor.href) {
          // Transfer the product URL link instead of the raw image file
          if (e.dataTransfer) {
            e.dataTransfer.setData('text/uri-list', anchor.href)
            e.dataTransfer.setData('text/plain', anchor.href)
            e.dataTransfer.effectAllowed = 'copyLink'
          }
        } else {
          // Prevent raw image dragging when not in a link
          e.preventDefault()
        }
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'IMG' || target.tagName === 'SVG' || target.closest('img') || target.closest('picture'))) {
        e.preventDefault()
      }
    }

    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  return null
}
