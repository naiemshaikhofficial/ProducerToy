'use client'

import { useEffect } from 'react'

export function ContentProtection() {
  useEffect(() => {
    // Disable right-click context menu in production
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target) return

      // Protect images, audio players, waveforms, download links, and canvases
      const isProtected =
        target.tagName === 'IMG' ||
        target.tagName === 'AUDIO' ||
        target.tagName === 'CANVAS' ||
        target.closest('img') ||
        target.closest('audio') ||
        target.closest('canvas') ||
        target.closest('.protected-audio') ||
        target.closest('.protected-asset')

      if (isProtected || process.env.NODE_ENV === 'production') {
        e.preventDefault()
      }
    }

    // Disable dangerous keyboard shortcuts (F12, View Source, Inspect Element, Save Page)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'U' || e.key === 'S')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // Prevent drag & drop ripping of media files
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement
      if (!target) return

      const isMedia =
        target.tagName === 'IMG' ||
        target.tagName === 'AUDIO' ||
        target.tagName === 'CANVAS' ||
        target.closest('img') ||
        target.closest('audio')

      if (isMedia) {
        const anchor = target.closest('a') as HTMLAnchorElement | null
        if (anchor && anchor.href) {
          if (e.dataTransfer) {
            e.dataTransfer.setData('text/plain', anchor.href)
          }
        } else {
          e.preventDefault()
        }
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('dragstart', handleDragStart)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('dragstart', handleDragStart)
    }
  }, [])

  return null
}
