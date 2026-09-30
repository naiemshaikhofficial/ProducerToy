/**
 * Provides high-res cover images for news articles.
 * 1. Uses the extracted RSS / OpenGraph image if available.
 * 2. Fallbacks to Pollinations AI generation (100% free, unlimited, no API key required).
 */
export function getArticleCoverImage(
  title: string,
  category: string,
  existingImageUrl?: string
): string {
  if (existingImageUrl && existingImageUrl.startsWith('http')) {
    // Strip WordPress and CDN dimensions (-128x71, -150x150, -300x169, -768x432, etc.) to get original Full HD master
    return existingImageUrl.replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
  }

  // Generate an ultra-modern synth / audio workstation / music studio aesthetic banner (1920x1080 Full HD)
  const cleanTitle = title.replace(/&#?[a-z0-9]+;/gi, ' ').slice(0, 80)
  const prompt = `sleek futuristic music production synthesizer daw studio vst plugin neon amber and dark cyan lighting high resolution 8k render, professional audio technology article header for ${cleanTitle}`

  const encoded = encodeURIComponent(prompt)
  return `https://image.pollinations.ai/prompt/${encoded}?width=1920&height=1080&nologo=true&seed=${Math.floor(
    Math.random() * 99999
  )}`
}
