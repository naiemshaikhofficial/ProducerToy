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
    return existingImageUrl
  }

  // Generate an ultra-modern synth / audio workstation / music studio aesthetic banner
  const prompt = `sleek futuristic music production synthesizer daw studio vst plugin neon amber and dark cyan lighting high resolution 8k render, professional audio technology article header for ${title.slice(0, 80)}`

  const encoded = encodeURIComponent(prompt)
  return `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${Math.floor(
    Math.random() * 99999
  )}`
}
