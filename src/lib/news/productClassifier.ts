/**
 * Audio Product Classifier for News & Editorial Content
 * Accurately distinguishes between Software Plugins (VST/AU/AAX), Sample Packs, Drum Kits, and Presets.
 */

export type ProductKind = 'drum_kit' | 'sample_pack' | 'preset_pack' | 'template' | 'plugin'

export function detectProductKind(item: {
  title?: string | null
  category?: string | null
  specs?: any
  content?: string | null
}): ProductKind {
  const title = (item.title || '').toLowerCase()
  const content = (item.content || '').slice(0, 1500).toLowerCase()
  const specs = typeof item.specs === 'object' && item.specs ? JSON.stringify(item.specs).toLowerCase() : (typeof item.specs === 'string' ? item.specs.toLowerCase() : '')
  const category = (item.category || '').toLowerCase()

  const combined = `${title} ${category} ${specs} ${content}`

  // 1. Drum Kits & Percussion Packs
  const isDrumKit =
    title.includes('drum kit') ||
    title.includes('drum kits') ||
    title.includes('drum pack') ||
    title.includes('drum samples') ||
    title.includes('808 kit') ||
    title.includes('percussion kit') ||
    specs.includes('drum kit') ||
    specs.includes('drum samples') ||
    (combined.includes('drum kit') && !title.includes('vst') && !title.includes('plugin') && !title.includes('drum machine vst'))

  if (isDrumKit) {
    return 'drum_kit'
  }

  // 2. Preset Packs / Soundbanks (Serum, Vital, Diva, etc.)
  const isPresetPack =
    (title.includes('preset') ||
      title.includes('presets') ||
      title.includes('soundbank') ||
      title.includes('synth patches') ||
      title.includes('vital presets') ||
      title.includes('serum presets') ||
      specs.includes('preset') ||
      specs.includes('soundbank')) &&
    !title.includes('synthesizer plugin') &&
    !title.includes('synth vst') &&
    !title.includes('free vst') &&
    !title.includes('instrument plugin')

  if (isPresetPack) {
    return 'preset_pack'
  }

  // 3. Sample Packs / Loops / One-Shots / WAV Collections
  const isSamplePack =
    title.includes('sample pack') ||
    title.includes('sample packs') ||
    title.includes('sound pack') ||
    title.includes('loop pack') ||
    title.includes('loops pack') ||
    title.includes('construction kit') ||
    (title.includes('free samples') && !title.includes('sampler plugin') && !title.includes('vst')) ||
    specs.includes('sample pack') ||
    (specs.includes('wav / aiff') && !specs.includes('vst') && !specs.includes('au ') && !specs.includes('aax'))

  if (isSamplePack) {
    return 'sample_pack'
  }

  // 4. DAW Project Templates
  if (
    title.includes('daw template') ||
    title.includes('project template') ||
    title.includes('project file') ||
    title.includes('fl studio template') ||
    title.includes('ableton template')
  ) {
    return 'template'
  }

  // 5. Default is Plugin / Virtual Instrument / Audio FX
  return 'plugin'
}

/**
 * Returns the contextual action button text for deals and free downloads
 */
export function getProductCtaLabel(opts: {
  productKind: ProductKind
  isFree: boolean
  isInternalFallback?: boolean
  title?: string | null
}): string {
  const { productKind, isFree, isInternalFallback, title } = opts
  const isPlural = Boolean(title && /drum kits|sample packs|presets|loops/i.test(title))

  if (isFree) {
    if (isInternalFallback) {
      switch (productKind) {
        case 'drum_kit':
          return 'Explore Free Drum Kits'
        case 'sample_pack':
          return 'Explore Free Sample Packs'
        case 'preset_pack':
          return 'Explore Free Presets'
        case 'template':
          return 'Explore Free Templates'
        case 'plugin':
        default:
          return 'Explore Free VST Plugins'
      }
    }

    switch (productKind) {
      case 'drum_kit':
        return isPlural ? 'Download Free Drum Kits' : 'Download Free Drum Kit'
      case 'sample_pack':
        return isPlural ? 'Download Free Sample Packs' : 'Download Free Sample Pack'
      case 'preset_pack':
        return 'Download Free Presets'
      case 'template':
        return 'Download Free Template'
      case 'plugin':
      default:
        return 'Download Free Plugin'
    }
  }

  // Paid / Commercial Deals
  switch (productKind) {
    case 'drum_kit':
      return 'Get Drum Kit Deal'
    case 'sample_pack':
      return 'Get Sample Pack Deal'
    case 'preset_pack':
      return 'Get Preset Deal'
    case 'template':
      return 'Get Template Deal'
    case 'plugin':
    default:
      return 'Get Official Deal'
  }
}

/**
 * Normalizes the display category so non-plugins aren't labeled "Free VSTs"
 */
export function getDisplayCategory(category: string | null | undefined, productKind: ProductKind): string {
  const cat = category || 'News'

  if (cat === 'Free VSTs' || cat === 'Free Plugins' || cat === 'News') {
    switch (productKind) {
      case 'drum_kit':
        return 'Free Drum Kits'
      case 'sample_pack':
        return 'Free Samples'
      case 'preset_pack':
        return 'Free Presets'
      case 'template':
        return 'Free Templates'
      case 'plugin':
      default:
        return cat === 'News' ? 'Free Plugins' : cat
    }
  }

  if (cat === 'Deals & Sales') {
    switch (productKind) {
      case 'drum_kit':
        return 'Drum Kit Deals'
      case 'sample_pack':
        return 'Sample Pack Deals'
      case 'preset_pack':
        return 'Preset Deals'
      default:
        return cat
    }
  }

  return cat
}
