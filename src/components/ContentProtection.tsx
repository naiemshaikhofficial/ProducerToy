'use client'

import { useEffect } from 'react'

export function ContentProtection() {
  useEffect(() => {
    // Completely bypass all protections in local development / localhost
    if (
      process.env.NODE_ENV === 'development' ||
      typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.endsWith('.local')
      )
    ) {
      return
    }

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

    // Disable dangerous keyboard shortcuts in production (F12, View Source, Inspect Element, Save Page)
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

    // Prevent drag & drop ripping of media files in production
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
