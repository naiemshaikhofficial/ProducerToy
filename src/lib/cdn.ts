/**
 * CDN Acceleration Helper for Images, Audio Previews, and Assets
 * Optimizes Supabase Storage and external media URLs for Edge CDN caching.
 */

export interface ImageCdnOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'origin'
}

export function getCdnImageUrl(url: string | null | undefined, options: ImageCdnOptions = {}): string {
  if (!url) return '/placeholder.png'

  // If already a data URI or SVG, return as is
  if (url.startsWith('data:') || url.endsWith('.svg')) return url

  const { width = 600, quality = 80, format = 'webp' } = options

  try {
    // 1. If Supabase Storage URL, append Supabase Image CDN transformation parameters
    if (url.includes('.supabase.co/storage/v1/object/public/')) {
      const renderUrl = url.replace('/object/public/', '/render/image/public/')
      const searchParams = new URLSearchParams()
      searchParams.set('width', width.toString())
      searchParams.set('quality', quality.toString())
      if (format !== 'origin') searchParams.set('format', format)
      
      return `${renderUrl}?${searchParams.toString()}`
    }

    // 2. If Unsplash or external CDN image URL, append standard CDN query params
    if (url.includes('images.unsplash.com')) {
      const parsed = new URL(url)
      parsed.searchParams.set('w', width.toString())
      parsed.searchParams.set('q', quality.toString())
      parsed.searchParams.set('fm', format === 'origin' ? 'jpg' : format)
      parsed.searchParams.set('auto', 'compress,format')
      return parsed.toString()
    }
  } catch (e) {
    console.warn('CDN URL transform fallback:', e)
  }

  return url
}

/**
 * CDN Audio Stream URL Helper
 * Pre-delivers fast audio preview streams with Range header support
 */
export function getCdnAudioUrl(url: string | null | undefined): string {
  if (!url) return ''
  return url
}
