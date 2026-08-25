export type CategoryKey = 'effects' | 'instruments' | 'sounds' | 'studio-tools' | 'bundles'

export interface CategoryDataEntry {
  id?: string
  label: string
  slug: string
  items: Array<{ name: string; slug: string }>
}

export const categoryData: Record<string, CategoryDataEntry> = {
  effects: {
    label: 'Effects',
    slug: 'effects',
    items: [
      { name: 'Show All', slug: '' },
      { name: 'Amp Simulator', slug: 'amp-simulator' },
      { name: 'Auto Tune', slug: 'auto-tune' },
      { name: 'Bit Crusher', slug: 'bit-crusher' },
      { name: 'Channel Strip', slug: 'channel-strip' },
      { name: 'Chorus', slug: 'chorus' },
      { name: 'Compressor', slug: 'compressor' },
      { name: 'De-Esser', slug: 'de-esser' },
      { name: 'Delay', slug: 'delay' },
      { name: 'Distortion', slug: 'distortion' },
      { name: 'DJ Tools', slug: 'dj-tools' },
      { name: 'Drum FX', slug: 'drum-fx' },
      { name: 'Dynamics Processor', slug: 'dynamics-processor' },
      { name: 'Echo', slug: 'echo' },
      { name: 'Enhancer', slug: 'enhancer' },
      { name: 'EQ', slug: 'EQ' },
      { name: 'Filter', slug: 'filter' },
      { name: 'Flanger', slug: 'flanger' },
      { name: 'Limiter', slug: 'limiter' },
      { name: 'Mastering', slug: 'mastering' },
      { name: 'Pitch Shifter', slug: 'pitch-shifter' },
      { name: 'Reverb', slug: 'reverb' },
      { name: 'Saturation', slug: 'saturation' },
      { name: 'Vocal Processing', slug: 'vocal-processing' },
    ]
  },
  instruments: {
    label: 'Instruments',
    slug: 'instruments',
    items: [
      { name: 'Show All', slug: '' },
      { name: 'Synthesizers', slug: 'synthesizers' },
      { name: 'Samplers', slug: 'samplers' },
      { name: 'Drum Machines', slug: 'drum-machines' },
      { name: 'Acoustic Pianos', slug: 'acoustic-pianos' },
      { name: 'Electric Pianos', slug: 'electric-pianos' },
      { name: 'Guitars & Bass', slug: 'guitars-bass' },
      { name: 'Strings & Orchestral', slug: 'strings-orchestral' },
      { name: 'Vocal Synths', slug: 'vocal-synths' },
    ]
  },
  sounds: {
    label: 'Sounds',
    slug: 'sounds',
    items: [
      { name: 'Show All', slug: '' },
      { name: 'Sample Packs', slug: 'sample-packs' },
      { name: 'Drum Kits', slug: 'drum-kits' },
      { name: 'Serum Presets', slug: 'serum-presets' },
      { name: 'Massive Presets', slug: 'massive-presets' },
      { name: 'Vital Presets', slug: 'vital-presets' },
      { name: 'MIDI Loops', slug: 'midi-loops' },
      { name: 'Vocal Acapellas', slug: 'vocal-acapellas' },
      { name: 'Melodic Loops', slug: 'melodic-loops' },
    ]
  },
  'studio-tools': {
    label: 'Studio Tools',
    slug: 'studio-tools',
    items: [
      { name: 'Show All', slug: '' },
      { name: 'FL Studio Templates', slug: 'fl-studio-templates' },
      { name: 'Ableton Live Templates', slug: 'ableton-templates' },
      { name: 'Logic Pro Templates', slug: 'logic-templates' },
      { name: 'Mix & Master Chains', slug: 'mix-chains' },
      { name: 'Analyzer & Metering', slug: 'analyzer-metering' },
    ]
  },
  bundles: {
    label: 'Bundles',
    slug: 'bundles',
    items: [
      { name: 'Show All', slug: '' },
      { name: 'Producer Toolkits', slug: 'producer-toolkits' },
      { name: 'All-In-One VST Bundles', slug: 'all-in-one-vst-bundles' },
      { name: 'Preset Mega Bundles', slug: 'preset-mega-bundles' },
    ]
  }
}
