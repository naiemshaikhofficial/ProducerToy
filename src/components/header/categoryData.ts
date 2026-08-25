export type CategoryKey = 'effects' | 'instruments' | 'sounds' | 'studio_tools' | 'bundles'

export const categoryData: Record<CategoryKey, { label: string; items: string[] }> = {
  effects: {
    label: 'Effects',
    items: [
      'Show All', 'Amp Simulator', 'Bit Crusher', 'Channel Strip', 'Chorus',
      'Compressor', 'De-Esser', 'Delay', 'Distortion', 'DJ Tools',
      'Drum FX', 'Dynamics Processor', 'Echo', 'Enhancer', 'Envelope Shaper',
      'EQ', 'Exciter', 'Expander', 'Expansion Packs', 'Filter',
      'Flanger', 'Frequency Shifter', 'Gate', 'Granular FX', 'Harmonizer',
      'Limiter', 'Mastering', 'Mastering Suite', 'MIDI Arp', 'Modulator',
      'Multi-Effect', 'Phaser', 'Pitch Shifter', 'Preamp', 'Randomiser',
      'Reverb', 'Saturation', 'Sequencer', 'Spectral Analysis', 'Stereo Width',
      'Surround Tools', 'Tape Emulation', 'Transient Shaper', 'Tremolo', 'Vibrato',
      'Vocal Processing', 'Vocoder'
    ]
  },
  instruments: {
    label: 'Instruments',
    items: [
      'Show All', 'Synthesizers', 'Samplers', 'Drum Machines', 'Acoustic Pianos',
      'Electric Pianos', 'Guitars & Bass', 'Strings & Orchestral', 'Vocal Synths',
      'Brass & Woodwinds', 'Organ & Keys', 'Cinematic Soundscapes', 'Retro Synths'
    ]
  },
  sounds: {
    label: 'Sounds',
    items: [
      'Show All', 'Sample Packs', 'Drum Kits', 'Serum Presets', 'Massive Presets',
      'Vital Presets', 'MIDI Loops', 'Vocal Acapellas', '808 & Bass Shots',
      'Melodic Loops', 'FX & Risers', 'Synth Presets'
    ]
  },
  studio_tools: {
    label: 'Studio Tools',
    items: [
      'Show All', 'FL Studio Templates', 'Ableton Live Templates', 'Logic Pro Templates',
      'Cubase Templates', 'Mix & Master Chains', 'Utility VSTs', 'Analyzer & Metering',
      'DAW Project Files'
    ]
  },
  bundles: {
    label: 'Bundles',
    items: [
      'Show All', 'Producer Toolkits', 'All-In-One VST Bundles', 'Genre Expansion Packs',
      'Preset Mega Bundles', 'Complete Studio Collection'
    ]
  }
}
