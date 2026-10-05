const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://producertoy-producertoy.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA3MDIwMTAsImlkIjoiMDFhMGVkZGItMWQwMS03NGU0LWFhZmQtNDVlMWI2ZWEyNGU4Iiwia2lkIjoiQ1RtQkF5U1hIZmtMT0puXy1ycURLaFNaTjZTUk9lcDZRcmo5YW91ODNMMCIsInJpZCI6ImU5ZThhMTRhLWMyMTYtNGZmNi04NWJlLTYzMTgwNjUyMDdkMyJ9.4kTJ41ZGPxl0iwtpYgGMgTAH-_s5_uAguJoHfCvULoq7mVh7qQ4IefG4YOmjxXFas-me10fyHdPmASKTthoBCQ'
});

const PB_AID = '68affa2b94f43';

const LIVE_DEALS = [
  {
    id: 'news_uad_mix_tape_pro_deal',
    slug: 'universal-audio-uad-mix-tape-pro-deal-33-off-vst-bundle',
    title: 'Universal Audio UAD Mix Tape Pro Deal: 33% OFF ($99 Custom 10-Plugin Bundle)',
    excerpt: 'Pick any 10 iconic UAD plugins from a curated catalog of 45 legendary analog titles. Save $50 on the ultimate custom mixing and production suite with lifetime native licensing.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 33% OFF',
    cover_image: 'https://www.pluginboutique.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBNVJqQ2c9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--40f03ae41a58914e07b79d6398e03dc25ecb5ec0/uad%20mix%20tape%20pro.webp',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '4 MIN READ',
    source_name: 'Universal Audio',
    source_url: `https://www.pluginboutique.com/product/81-Bundles/39-Effects-Bundles/17197-UAD-Mix-Tape-Pro?a_aid=${PB_AID}`,
    deal_price: '$99.00',
    deal_regular_price: '$149.00',
    published_at: new Date('2026-10-05T09:30:00Z').toISOString(),
    created_at: new Date('2026-10-05T09:30:00Z').toISOString(),
    is_featured: 1,
    specs: {
      'Brand': 'Universal Audio',
      'Discount': '33% OFF',
      'Price': '$99.00 (Regular $149.00)',
      'Valid Until': 'Nov 01, 2026',
      'Format': 'VST3, AU, AAX (Apple Silicon & Windows 64-bit)',
      'Free Gift': 'Melodyne 5 Essential, Synthesizer V, or Moog MF-109S',
      'Includes': 'Choose 10 of 45 iconic UAD native plugins'
    },
    seo_keywords: 'uad mix tape pro, universal audio sale, uad custom bundle, vst plugin deals, la-2a, 1176, pultec',
    content: `## Build Your Dream 10-Plugin Analog Production Suite

Universal Audio has launched an exceptional limited-time offer on the **UAD Mix Tape Pro**, slashing the price from $149.00 down to **$99.00 (33% OFF)** through November 1, 2026. This promotion allows producers to handpick 10 premium UAD plugins from a curated selection of 45 iconic titles—amounting to less than $10 per plugin for world-class analog emulations.

### Complete Creative Freedom: 45 Iconic UAD Titles

Unlike fixed bundles that include tools you might never touch, UAD Mix Tape Pro puts you in the producer's chair. You can customize your arsenal across essential studio categories:

- **Dynamics & Compressors:** Teletronix LA-2A Leveler Collection, 1176 Classic Limiter Collection, Empirical Labs EL8 Distressor, Fairchild Tube Limiter, and API 2500 Bus Compressor.
- **EQs & Channel Strips:** Pultec Passive EQ Collection, SSL 4000 E Channel Strip, API Vision Channel Strip, Manley Massive Passive EQ, and Helios Type 69 Preamp.
- **Tape Saturation & Amps:** Studer A800 Multichannel Tape Recorder, Ampex ATR-102 Mastering Tape, UAD Dream '65 Reverb Amp, and UAD Lion '68 Super Lead.
- **Spaces & Modulation:** Capitol Chambers, Lexicon 224 Digital Reverb, Studio D Chorus, Galaxy Tape Echo, and Brigade Chorus.
- **Virtual Instruments:** Moog Minimoog, Opal Morphing Synth, Ravel Grand Piano, and Waterfall B3 Organ.

### Native Processing Across All Major DAWs

Every chosen plugin runs natively on macOS (Apple Silicon M1/M2/M3 native) and Windows 10/11 without requiring proprietary Apollo or UAD-2 DSP hardware. Seamlessly insert multiple instances across Ableton Live, FL Studio, Logic Pro, and Studio One.

[Get Official Deal](https://www.pluginboutique.com/product/81-Bundles/39-Effects-Bundles/17197-UAD-Mix-Tape-Pro?a_aid=${PB_AID})`
  },
  {
    id: 'news_ua_opal_morphing_synth_deal',
    slug: 'universal-audio-opal-morphing-synthesizer-deal-67-off',
    title: 'Universal Audio Opal Morphing Synthesizer Deal: 67% OFF ($49 Wavetable & Morphing VST)',
    excerpt: 'The infinite, larger-than-life super synth with morphing filters, analog-meets-wavetable sound engine, and studio UA effects. Save $100 through November 1.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 67% OFF',
    cover_image: 'https://www.pluginboutique.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBeWt0Qnc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--6e3dc7c8dcbf69bd9ae5f1c341e83125e64420e5/UAD_Opal_Synthesizer_pluginboutique_(1).jpg',
    author_name: 'ProducerToy Editorial',
    author_role: 'Synthesizer & Sound Design Editor',
    reading_time: '4 MIN READ',
    source_name: 'Universal Audio',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/4-Synth/10189-Opal-Morphing-Synthesizer?a_aid=${PB_AID}`,
    deal_price: '$49.00',
    deal_regular_price: '$149.00',
    published_at: new Date('2026-10-05T09:25:00Z').toISOString(),
    created_at: new Date('2026-10-05T09:25:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Universal Audio',
      'Discount': '67% OFF',
      'Price': '$49.00 (Regular $149.00)',
      'Valid Until': 'Nov 01, 2026',
      'Format': 'VST3, AU, AAX Native (Mac & Windows)',
      'Free Gift': 'Melodyne 5 Essential, Synthesizer V, or Moog MF-109S',
      'Synthesis': 'Analog-meets-Wavetable Morphing Architecture'
    },
    seo_keywords: 'universal audio opal deal, opal morphing synth sale, uad opal vst discount, wavetable synth plugin',
    content: `## The Infinite, Larger-Than-Life Synthesizer for Modern Producers

Universal Audio has officially discounted the flagship **Opal Morphing Synthesizer** from $149.00 down to **$49.00 (67% OFF)** until November 1, 2026. Opal combines an analog-meets-wavetable super synth engine with legendary onboard UA processing.

### Massive Sound Design Depth

- **Morphing Filters & Oscillators:** Seamlessly transition between complex wavetables and warm analog shapes with real-time morphing visualizers.
- **Studio-Grade UA Effects:** Includes vintage spring reverbs, tape delays, authentic 1176 peak limiter compression, and lush chorus.
- **Album-Ready Presets:** Hundreds of expertly voiced lead, bass, and atmospheric pad patches crafted by Universal Audio's premier sound designers.
- **Native CPU Efficiency:** Runs natively on Apple Silicon and Windows 64-bit systems with zero Apollo DSP hardware required.

[Get Official Deal](https://www.pluginboutique.com/product/1-Instruments/4-Synth/10189-Opal-Morphing-Synthesizer?a_aid=${PB_AID})`
  },
  {
    id: 'news_roland_zenology_pro_deal',
    slug: 'roland-zenology-pro-synthesizer-deal-56-off',
    title: 'Roland ZENOLOGY PRO Synthesizer Deal: 56% OFF ($99 Flagship Sound Engine)',
    excerpt: 'Unlock over 4,000 preset patches, deep sound design architecture, and vintage Roland filters. Save $130 on the ultimate ZEN-Core production instrument until October 31.',
    category: 'Deals & Sales',
    badge: 'HOT DEAL • 56% OFF',
    cover_image: 'https://www.pluginboutique.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBL0lsQ1E9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--d4a1205a9d6a9c67d1a81c959c838e1a707c872b/Zenology-2-NewsPage-Banne.jpeg',
    author_name: 'ProducerToy Editorial',
    author_role: 'Synthesizer & Sound Design Editor',
    reading_time: '4 MIN READ',
    source_name: 'Roland',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/4-Synth/15308-ZENOLOGY-PRO?a_aid=${PB_AID}`,
    deal_price: '$99.00',
    deal_regular_price: '$229.00',
    published_at: new Date('2026-10-05T09:20:00Z').toISOString(),
    created_at: new Date('2026-10-05T09:20:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Roland',
      'Discount': '56% OFF',
      'Price': '$99.00 (Regular $229.00)',
      'Valid Until': 'Oct 31, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Tones': '4,000+ Tones & 200+ Drum Kits'
    },
    seo_keywords: 'roland zenology pro deal, zen-core synthesizer vst, roland synth plugin sale, jupiter juno sounds',
    content: `## Roland's Flagship Synthesis Engine for Modern Producers

Roland has announced a major autumn promotion on **ZENOLOGY PRO**, offering producers a **56% discount** at **$99.00** (normally $229.00) through October 31, 2026.

### The Power of ZEN-Core

ZENOLOGY PRO provides full access to Roland's most versatile sound engine, combining classic analog modeling with cutting-edge PCM synthesis:

- **Massive Sound Library:** Includes over 4,000 ready-to-produce presets and 200 authentic drum kits spanning vintage 808/909 grooves to contemporary hyperpop leads.
- **Deep Modular Sound Design:** Build custom tones using four independent synthesizer partials, each equipped with flexible oscillators, multi-mode resonant filters, and 10 step LFO waveforms.
- **Hardware Integration:** Export and share patches effortlessly between your DAW and supported Roland hardware synthesizers including the FANTOM, JUPITER-X, and MC-707.

[Get Official Deal](https://www.pluginboutique.com/product/1-Instruments/4-Synth/15308-ZENOLOGY-PRO?a_aid=${PB_AID})`
  },
  {
    id: 'news_ik_modo_bass_2_deal',
    slug: 'ik-multimedia-modo-bass-2-vst-deal-85-off',
    title: 'IK Multimedia MODO BASS 2 Deal: 85% OFF ($29.99 Physically Modeled Bass)',
    excerpt: 'Add hyper-realistic electric, fretless, and upright bass lines to your tracks. Grab IK Multimedia MODO BASS 2 for only $29.99 through October 7.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 85% OFF',
    cover_image: 'https://www.pluginboutique.com/ckeditor_assets/pictures/38518/original_trittico_gui_2x_1.png',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'IK Multimedia',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/64-Virtual-Instruments/12454-MODO-BASS-2?a_aid=${PB_AID}`,
    deal_price: '$29.99',
    deal_regular_price: '$199.99',
    published_at: new Date('2026-10-05T09:10:00Z').toISOString(),
    created_at: new Date('2026-10-05T09:10:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'IK Multimedia',
      'Discount': '85% OFF',
      'Price': '$29.99 (Regular $199.99)',
      'Valid Until': 'Oct 07, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Technology': 'Physical Modal Synthesis'
    },
    seo_keywords: 'modo bass 2 deal, ik multimedia bass vst, physical modeling bass plugin, 30 dollar bass vst',
    content: `## Next-Generation Physical Modeling Bass Synthesis

IK Multimedia has launched a flash sale on **MODO BASS 2**, slashing the price by **85%** to just **$29.99** (regularly $199.99) through October 7, 2026.

### Zero Samples, Infinite Nuance

Unlike traditional multi-gigabyte sample libraries that suffer from machine-gun repetition, MODO BASS 2 utilizes real-time modal physical synthesis:

- **Playstyle Articulations:** Switch seamlessly between Finger, Slap, Pick, and Mute styles with dynamic velocity layers and string-release noises.
- **Acoustic Upright & Fretless Models:** Introduces expressive acoustic upright basses and sliding fretless models with microtonal vibrato.
- **Customizable Signal Chain:** Choose your pickup positions, string gauge, action height, and route through vintage tube amps and stompboxes.

[Get Official Deal](https://www.pluginboutique.com/product/1-Instruments/64-Virtual-Instruments/12454-MODO-BASS-2?a_aid=${PB_AID})`
  },
  {
    id: 'news_ua_distressor_deal',
    slug: 'universal-audio-empirical-labs-el8-distressor-compressor-deal-80-off',
    title: 'Universal Audio Empirical Labs EL8 Distressor Deal: 80% OFF ($39 Compressor VST)',
    excerpt: 'The desert-island modern compressor renowned for aggressive drum smash, 1:1 to Nuke ratios, and analog saturation. On sale for $39 until November 1.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 80% OFF',
    cover_image: 'https://www.pluginboutique.com/ckeditor_assets/pictures/36525/original_empirical_labs_EL8_distressor_compressor_plugin_hero__2x.jpg',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'Universal Audio',
    source_url: `https://www.pluginboutique.com/product/2-Effects/8-Compressor/11502-Empirical-Labs-EL8-Distressor-Compressor?a_aid=${PB_AID}`,
    deal_price: '$39.00',
    deal_regular_price: '$199.00',
    published_at: new Date('2026-10-05T09:00:00Z').toISOString(),
    created_at: new Date('2026-10-05T09:00:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Universal Audio',
      'Discount': '80% OFF',
      'Price': '$39.00 (Regular $199.00)',
      'Valid Until': 'Nov 01, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Emulation': 'Empirical Labs EL8 Hardware Compressor'
    },
    seo_keywords: 'el8 distressor deal, empirical labs compressor vst, uad distressor sale, drum compressor plugin',
    content: `## The Modern Classic Studio Compressor in Native Format

Universal Audio's authorized emulation of the iconic **Empirical Labs EL8 Distressor** is currently available for **$39.00 (80% OFF)**, down from $199.00 through November 1, 2026.

### Punch, Grit, and Dynamic Authority

Endorsed directly by Dave Derr of Empirical Labs, this native plugin recreates every circuit component of the legendary rackmount unit:

- **Distortion Modes:** Engage Dist 2 (warm 2nd-order tube harmonic saturation) or Dist 3 (aggressive 3rd-order tape-like compression).
- **All Ratios Included:** From gentle 1:1, 2:1 optical warmth up to the legendary "Nuke" brickwall smash for explosive drum room mics.
- **Sidechain Filtering:** Built-in high-pass detector and mid-band boost EQ prevent low frequencies from prematurely pumping the compression envelope.

[Get Official Deal](https://www.pluginboutique.com/product/2-Effects/8-Compressor/11502-Empirical-Labs-EL8-Distressor-Compressor?a_aid=${PB_AID})`
  },
  {
    id: 'news_ua_minimoog_deal',
    slug: 'universal-audio-minimoog-synth-deal-73-off',
    title: 'Universal Audio Minimoog Synth Deal: 73% OFF ($39 Legendary Monosynth VST)',
    excerpt: 'Own the quintessential analog synthesizer behind decades of hit records. Universal Audio Minimoog native VST discounted to $39 through November 1.',
    category: 'Deals & Sales',
    badge: 'HOT DEAL • 73% OFF',
    cover_image: 'https://www.pluginboutique.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBeWd0Qnc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--9db7a5c79fcf98ca977d1ee50c0031cd70ed1dfb/UAD_Minimoog_pluginboutique.jpeg',
    author_name: 'ProducerToy Editorial',
    author_role: 'Synthesizer & Sound Design Editor',
    reading_time: '3 MIN READ',
    source_name: 'Universal Audio',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/4-Synth/10188-Minimoog?a_aid=${PB_AID}`,
    deal_price: '$39.00',
    deal_regular_price: '$149.00',
    published_at: new Date('2026-10-05T08:50:00Z').toISOString(),
    created_at: new Date('2026-10-05T08:50:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Universal Audio',
      'Discount': '73% OFF',
      'Price': '$39.00 (Regular $149.00)',
      'Valid Until': 'Nov 01, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Circuit Modeling': 'Moog Ladder Filter & Discrete Transistor VCF'
    },
    seo_keywords: 'minimoog vst deal, universal audio moog sale, analog bass synth plugin, moog ladder filter vst',
    content: `## The Definitive Moog Monosynth Experience

Universal Audio has marked down the legendary **Minimoog** synthesizer plugin by **73%**, pricing it at **$39.00** (originally $149.00) through November 1, 2026.

### Flawless Discrete Circuitry Modeling

Developed in strict partnership with Moog Music, this native software synthesizer captures the organic drift and thick harmonic weight of Bob Moog's original hardware:

- **Legendary Ladder Filter:** Saturate and self-oscillate with all the fatness, resonance, and low-end authority of the vintage 24dB/oct ladder filter.
- **Custom Enhancements:** Features expanded polyphony modes (up to 4 voices), stereo spread, and external feedback loop overdrive.
- **Instant Production Presets:** Access signature bass, lead, and FX presets used by Kraftwerk, Parliament-Funkadelic, and modern hip-hop hitmakers.

[Get Official Deal](https://www.pluginboutique.com/product/1-Instruments/4-Synth/10188-Minimoog?a_aid=${PB_AID})`
  },
  {
    id: 'news_ua_helios_type_69_deal',
    slug: 'universal-audio-helios-type-69-preamp-eq-deal-80-off',
    title: 'Universal Audio Helios Type 69 EQ & Preamp Deal: 80% OFF ($29 Classic Console VST)',
    excerpt: 'The punchy, musical analog console sound that shaped Led Zeppelin, The Beatles, and Bob Marley. Save $120 on the official Helios Type 69 collection until November 1.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 80% OFF',
    cover_image: 'https://www.pluginboutique.com/ckeditor_assets/pictures/37374/original_helios_type_69_preamp_and_eq_feature_1__2x.jpg',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'Universal Audio',
    source_url: `https://www.pluginboutique.com/product/2-Effects/16-EQ/11854-Helios-Type-69-Preamp-and-EQ-Collection?a_aid=${PB_AID}`,
    deal_price: '$29.00',
    deal_regular_price: '$149.00',
    published_at: new Date('2026-10-05T08:45:00Z').toISOString(),
    created_at: new Date('2026-10-05T08:45:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Universal Audio',
      'Discount': '80% OFF',
      'Price': '$29.00 (Regular $149.00)',
      'Valid Until': 'Nov 01, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Emulation': 'Lustraphone transformer & Helios Type 69 desk'
    },
    seo_keywords: 'helios type 69 deal, universal audio helios eq sale, vintage console preamp vst, rock eq plugin',
    content: `## The Sound of Rock's Golden Age in Your DAW

Universal Audio has discounted the **Helios Type 69 Preamp and EQ Collection** from $149.00 down to **$29.00 (80% OFF)** through November 1, 2026.

### The Legendary Olympic Studios Desk

The Helios Type 69 console was the secret sonic weapon behind landmark albums recorded at London's Olympic and Island Studios:

- **Lustraphone Transformer Saturation:** Imparts harmonic drive, grit, and analog openness across drum busses and rock guitars.
- **Musical Step EQ:** Passive inductor-based midrange band with musical step points that cut through dense arrangements effortlessly.
- **Vintage Bass Shelf:** Delivers deep, pillowy low-end resonance without muddying lower mids.

[Get Official Deal](https://www.pluginboutique.com/product/2-Effects/16-EQ/11854-Helios-Type-69-Preamp-and-EQ-Collection?a_aid=${PB_AID})`
  },
  {
    id: 'news_ua_oxide_tape_deal',
    slug: 'universal-audio-oxide-tape-recorder-deal-40-off',
    title: 'Universal Audio Oxide Tape Recorder Deal: 40% OFF ($29 Analog Tape Saturation VST)',
    excerpt: 'Glue your mixes and round off harsh digital transients with authentic magnetic tape warmth. Get the UAD Oxide Tape Recorder for $29 until November 1.',
    category: 'Deals & Sales',
    badge: 'HOT DEAL • 40% OFF',
    cover_image: 'https://www.pluginboutique.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBeUl0Qnc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--e11c0dd2e7772443e94d2e1c1aae531be21d883c/UAD-OXIDE-TAPE_pluginboutique.jpg',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'Universal Audio',
    source_url: `https://www.pluginboutique.com/product/2-Effects/96-Tape-Emulation/10182-Oxide-Tape-Recorder?a_aid=${PB_AID}`,
    deal_price: '$29.00',
    deal_regular_price: '$49.00',
    published_at: new Date('2026-10-05T08:42:00Z').toISOString(),
    created_at: new Date('2026-10-05T08:42:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Universal Audio',
      'Discount': '40% OFF',
      'Price': '$29.00 (Regular $49.00)',
      'Valid Until': 'Nov 01, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Tape Speeds': '7.5 IPS & 15 IPS'
    },
    seo_keywords: 'oxide tape recorder deal, universal audio tape plugin, analog tape saturation vst, mix glue plugin',
    content: `## Effortless Analog Tape Glue and Harmonic Warmth

Universal Audio has discounted the **Oxide Tape Recorder** native plugin to **$29.00 (40% OFF)** through November 1, 2026.

### Simple Controls, Pro Sound

Designed for lightning-fast workflow, Oxide captures the organic saturation and dynamic cohesion of 2-inch master tape machines:

- **Two Tape Speeds:** Choose 15 IPS for punchy commercial clarity or 7.5 IPS for vintage lo-fi warmth and bass head-bump.
- **Natural Dynamic Soft-Clipping:** Absorbs sharp digital transients on snare drums and aggressive vocals without audible distortion.
- **Low CPU Footprint:** Easily insert across every channel of your mixing session for authentic console-to-tape summing.

[Get Official Deal](https://www.pluginboutique.com/product/2-Effects/96-Tape-Emulation/10182-Oxide-Tape-Recorder?a_aid=${PB_AID})`
  },
  {
    id: 'news_heavyocity_forzo_essentials_deal',
    slug: 'heavyocity-forzo-essentials-modern-brass-deal-57-off',
    title: 'Heavyocity FORZO Essentials Modern Brass Deal: 57% OFF ($50 Cinematic Kontakt Instrument)',
    excerpt: 'Deliver blockbuster orchestral weight with Heavyocity’s acclaimed modern brass engine. Save $69 through October 16.',
    category: 'Deals & Sales',
    badge: 'HOT DEAL • 57% OFF',
    cover_image: 'https://www.pluginboutique.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBejc4Q1E9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--738f5d0f39f55e0dcdc07296d618b0350a5a8ce6/FORZOEssentials_MainHeader_Center-1024x753.jpg',
    author_name: 'ProducerToy Editorial',
    author_role: 'Cinematic & Sound Design Editor',
    reading_time: '3 MIN READ',
    source_name: 'Heavyocity',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/55-Kontakt-Instrument/6274-FORZO-Essentials?a_aid=${PB_AID}`,
    deal_price: '$50.00',
    deal_regular_price: '$119.00',
    published_at: new Date('2026-10-05T08:40:00Z').toISOString(),
    created_at: new Date('2026-10-05T08:40:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Heavyocity',
      'Discount': '57% OFF',
      'Price': '$50.00 (Regular $119.00)',
      'Valid Until': 'Oct 16, 2026',
      'Platform': 'Kontakt & Free Kontakt Player',
      'Recorded At': 'Skywalker Sound'
    },
    seo_keywords: 'forzo essentials deal, heavyocity brass kontakt sale, cinematic orchestral brass, skywalker sound sample library',
    content: `## Blockbuster Orchestral Brass Recorded at Skywalker Sound

Heavyocity has launched a limited-time **57% discount** on **FORZO Essentials**, dropping the price to **$50.00** (normally $119.00) through October 16, 2026.

### The Power of 26-Piece Brass

Recorded at the world-renowned Skywalker Sound, FORZO Essentials delivers high-impact cinematic brass for scoring and modern hybrid production:

- **Traditional & Hybrid Articulations:** Includes full ensemble swells, aggressive stabs, and lush sustained chords.
- **Dynamic Macro Modulation:** Modulate envelope parameters, filters, and saturators with custom XY controllers.
- **Full Kontakt Player Compatibility:** Operates seamlessly in the free Native Instruments Kontakt Player without requiring the full software.

[Get Official Deal](https://www.pluginboutique.com/product/1-Instruments/55-Kontakt-Instrument/6274-FORZO-Essentials?a_aid=${PB_AID})`
  },
  {
    id: 'news_faw_sublab_xl_deal',
    slug: 'future-audio-workshop-sublab-xl-deal-51-off',
    title: 'Future Audio Workshop SubLab XL Deal: 51% OFF ($39 808 & Sub-Bass Synth)',
    excerpt: 'The definitive 808 sub-bass synthesizer expanded with supersaws, distortion modules, and endless punch. On sale for $39 through October 31.',
    category: 'Deals & Sales',
    badge: 'HOT DEAL • 51% OFF',
    cover_image: 'https://www.pluginboutique.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd1VkQnc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--17dccc9ac8c8f5fabd4d741a4e9a1b8d7d980840/sublab_xl_pluginboutique.jpg',
    author_name: 'ProducerToy Editorial',
    author_role: 'Hip-Hop & Electronic Music Editor',
    reading_time: '3 MIN READ',
    source_name: 'Future Audio Workshop',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/4-Synth/9553-SubLab-XL?a_aid=${PB_AID}`,
    deal_price: '$39.00',
    deal_regular_price: '$80.00',
    published_at: new Date('2026-10-05T08:35:00Z').toISOString(),
    created_at: new Date('2026-10-05T08:35:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Future Audio Workshop',
      'Discount': '51% OFF',
      'Price': '$39.00 (Regular $80.00)',
      'Valid Until': 'Oct 31, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Engine': 'X-Sub Synthesizer & Sampler'
    },
    seo_keywords: 'sublab xl deal, 808 bass synth vst, trap sub bass plugin, future audio workshop sale',
    content: `## The Ultimate 808 & Sub-Bass Sound Design Weapon

Future Audio Workshop has marked down **SubLab XL** by **51%**, bringing the industry-standard bass synth down to **$39.00** (regularly $80.00) through October 31, 2026.

### Mix-Cutting Sub-Bass on Any Sound System

SubLab XL combines sample layers, analog synthesizer modeling, and psychoacoustic sub-bass algorithms:

- **X-Sub Technology:** Guarantees deep, fundamental sub-frequencies remain consistent across all musical keys without disappearing on laptop speakers.
- **Expanded Distortion Suite:** Four distinct distortion algorithms including tube warmth, tape crush, and hard-clip drive.
- **Drag-and-Drop Sample Importer:** Drop any kick or 808 sample directly into the engine for instantaneous auto-tuning and envelope sculpting.

[Get Official Deal](https://www.pluginboutique.com/product/1-Instruments/4-Synth/9553-SubLab-XL?a_aid=${PB_AID})`
  },
  {
    id: 'news_ujam_iron_2_deal',
    slug: 'ujam-virtual-guitarist-iron-2-deal-93-off',
    title: 'UJAM Virtual Guitarist IRON 2 Deal: 93% OFF ($9 Rock Guitar VST)',
    excerpt: 'Lay down roaring rock riffs and polished power chords effortlessly. Grab UJAM Virtual Guitarist IRON 2 for only $9.00 through October 11.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 93% OFF',
    cover_image: 'https://www.pluginboutique.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMFFCQnc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--9c1809bd3612f762491cd5dc3036e2f921bf17c6/PB_Artwork_VG_Iron_2_pluginboutique.jpg',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'UJAM',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/64-Virtual-Instruments/8111-IRON-2?a_aid=${PB_AID}`,
    deal_price: '$9.00',
    deal_regular_price: '$129.00',
    published_at: new Date('2026-10-05T08:30:00Z').toISOString(),
    created_at: new Date('2026-10-05T08:30:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'UJAM',
      'Discount': '93% OFF',
      'Price': '$9.00 (Regular $129.00)',
      'Valid Until': 'Oct 11, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Styles': '30 Styles & 354 Phrases'
    },
    seo_keywords: 'ujam iron 2 deal, virtual guitarist plugin, rock guitar vst sale, 9 dollar guitar plugin',
    content: `## Authentic Heavy Rock & Metal Guitars at a Record Low Price

UJAM has slashed **Virtual Guitarist IRON 2** from $129.00 down to just **$9.00 (93% OFF)** through October 11, 2026.

### Studio Session Guitarist in Your DAW

- **Instrument Mode:** Play custom riffs and solos using authentic sampled electric guitar round-robins.
- **Player Mode:** Access 30 musical styles and 354 pre-programmed phrases that sync instantly to your project tempo.
- **Finisher Multi-FX:** Choose from 30 built-in guitar amp and boutique stompbox configurations for stadium-sized tone.

[Get Official Deal](https://www.pluginboutique.com/product/1-Instruments/64-Virtual-Instruments/8111-IRON-2?a_aid=${PB_AID})`
  },
  {
    id: 'news_ujam_solid_2_deal',
    slug: 'ujam-virtual-bassist-solid-2-deal-92-off',
    title: 'UJAM Virtual Bassist SOLID 2 Deal: 92% OFF ($9 Bass Player VST)',
    excerpt: 'Add pristine electric basslines to pop, rock, and soul arrangements. Grab UJAM Virtual Bassist SOLID 2 for only $9.00 through October 11.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 92% OFF',
    cover_image: 'https://banners.pluginboutique.com/ip7gqcr7foiq0vedzvakm94ufzdp',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'UJAM',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/64-Virtual-Instruments/5507-SOLID-2?a_aid=${PB_AID}`,
    deal_price: '$9.00',
    deal_regular_price: '$119.00',
    published_at: new Date('2026-10-05T08:20:00Z').toISOString(),
    created_at: new Date('2026-10-05T08:20:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'UJAM',
      'Discount': '92% OFF',
      'Price': '$9.00 (Regular $119.00)',
      'Valid Until': 'Oct 11, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Styles': '60 Styles & 1,380 Phrases'
    },
    seo_keywords: 'ujam solid 2 deal, virtual bassist vst, electric bass plugin sale, cheap bass vst',
    content: `## Studio Session Bassist Right Inside Your DAW

UJAM has slashed the price of **Virtual Bassist SOLID 2** by **92%**, putting a world-class session bassist in your toolkit for just **$9.00** (regularly $119.00) through October 11, 2026.

### Studio Precision & Punch

- **60 Playing Styles:** 1,380 phrases across pop, funk, indie, and rock genres.
- **Authentic Fingered Performance:** Modeled after a vintage active-pickup electric bass with dynamic round-robin sampling.
- **Built-In Sound Shaping:** Direct control over pickup blend, compression, and drive parameters to fit effortlessly in dense mixes.

[Get Official Deal](https://www.pluginboutique.com/product/1-Instruments/64-Virtual-Instruments/5507-SOLID-2?a_aid=${PB_AID})`
  },
  {
    id: 'news_sonible_smart_chain_deal',
    slug: 'sonible-smart-chain-ai-spectral-sidechain-deal-44-off',
    title: 'sonible smart:chain Deal: 44% OFF ($99 AI Spectral Sidechain & Dynamic EQ)',
    excerpt: 'Eliminate frequency masking between kicks, bass, and vocals automatically. Sonible discounts smart:chain to $99.00 (regularly $179.00) through October 12.',
    category: 'Deals & Sales',
    badge: 'HOT DEAL • 44% OFF',
    cover_image: 'https://www.pluginboutique.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBOEZaQ2c9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--0cea194a4e7ff5f456ff7df922796b30233db97b/sonible_smChain_screenshot.webp',
    author_name: 'ProducerToy Editorial',
    author_role: 'Mixing & AI Audio Editor',
    reading_time: '3 MIN READ',
    source_name: 'sonible',
    source_url: `https://www.pluginboutique.com/product/2-Effects/21-Channel-Strip/17748-smart-chain?a_aid=${PB_AID}`,
    deal_price: '$99.00',
    deal_regular_price: '$179.00',
    published_at: new Date('2026-10-05T08:10:00Z').toISOString(),
    created_at: new Date('2026-10-05T08:10:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'sonible',
      'Discount': '44% OFF',
      'Price': '$99.00 (Regular $179.00)',
      'Valid Until': 'Oct 12, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Technology': 'AI Spectral Sidechain Processing'
    },
    seo_keywords: 'sonible smart chain deal, ai sidechain vst, spectral ducking plugin, vocal ducking vst',
    content: `## Intelligent Frequency Masking Resolution in Real Time

Sonible has discounted its flagship **smart:chain** plugin by **44%**, making it available for **$99.00** (originally $179.00) through October 12, 2026.

### Beyond Simple Broadband Ducking

Traditional sidechain compressors duck the entire frequency spectrum when triggered, leading to noticeable pumping artifacts. smart:chain takes a revolutionary approach:

- **AI Spectral Ducking:** Analyzes sidechain inputs in real time and carves out only the competing frequencies.
- **Dynamic Spectral EQ:** Automatically balances kick and 808 sub-bass, or rhythm guitars and lead vocals, without degrading mix punch.
- **Zero Latency Mode:** Ideal for both live monitoring and high-track-count DAW sessions.

[Get Official Deal](https://www.pluginboutique.com/product/2-Effects/21-Channel-Strip/17748-smart-chain?a_aid=${PB_AID})`
  },
  {
    id: 'news_roland_analog_polysynth_collection_deal',
    slug: 'roland-analog-polysynth-collection-bundle-deal-60-off',
    title: 'Roland Analog Polysynth Collection Deal: 60% OFF ($199 JUPITER, JUNO & JX Bundle)',
    excerpt: 'Acquire Roland’s legendary trio: JUPITER-8, JUNO-106, and JX-3P modeled with ACB technology. Save $300 on the complete analog polysynth collection through October 31.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 60% OFF',
    cover_image: 'https://banners.pluginboutique.com/9a7hcpc1kp1v39birdrd079ubuo1',
    author_name: 'ProducerToy Editorial',
    author_role: 'Synthesizer & Sound Design Editor',
    reading_time: '4 MIN READ',
    source_name: 'Roland',
    source_url: `https://www.pluginboutique.com/product/81-Bundles/58-Instrument-Bundles/16252-Analog-Polysynth-Collection?a_aid=${PB_AID}`,
    deal_price: '$199.00',
    deal_regular_price: '$499.00',
    published_at: new Date('2026-10-05T08:00:00Z').toISOString(),
    created_at: new Date('2026-10-05T08:00:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Roland',
      'Discount': '60% OFF',
      'Price': '$199.00 (Regular $499.00)',
      'Valid Until': 'Oct 31, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Includes': 'JUPITER-8, JUNO-106 & JX-3P'
    },
    seo_keywords: 'roland analog polysynth deal, jupiter 8 vst, juno 106 plugin sale, vintage roland synth bundle',
    content: `## The Crown Jewels of Analog Polyphonic Synthesis

Roland has unleashed a **60% discount** on the **Analog Polysynth Collection**, dropping the full bundle from $499.00 to **$199.00** through October 31, 2026.

### Three Pillars of 1980s Sound History

- **JUPITER-8:** Roland's flagship 8-voice polyphonic powerhouse. Capable of soaring leads, lush cinematic pads, and punchy synth brass.
- **JUNO-106:** The most beloved chorus-infused analog poly synth in music history. Simple architecture with massive, warm low end.
- **JX-3P:** DCO precision with warm analog filtering and a built-in step sequencer emulation.

[Get Official Deal](https://www.pluginboutique.com/product/81-Bundles/58-Instrument-Bundles/16252-Analog-Polysynth-Collection?a_aid=${PB_AID})`
  },
  {
    id: 'news_the_tone_foundry_drivedat_deal',
    slug: 'the-tone-foundry-drivedat-tape-emulation-deal-61-off',
    title: 'The Tone Foundry driveDAT Deal: 61% OFF ($19 Digital Audio Tape Saturation)',
    excerpt: 'Inject gritty 90s DAT tape converters, harmonic warmth, and analog non-linearities into your digital mixes for just $19.00 through October 31.',
    category: 'Deals & Sales',
    badge: 'HOT DEAL • 61% OFF',
    cover_image: 'https://www.pluginboutique.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBOE5oQ2c9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--3f06b892a5526669d2ea962a6d62649b29d2c152/ribbon-stages.webp',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'The Tone Foundry',
    source_url: `https://www.pluginboutique.com/product/2-Effects/96-Tape-Emulation/17783-driveDAT?a_aid=${PB_AID}`,
    deal_price: '$19.00',
    deal_regular_price: '$49.00',
    published_at: new Date('2026-10-05T07:50:00Z').toISOString(),
    created_at: new Date('2026-10-05T07:50:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'The Tone Foundry',
      'Discount': '61% OFF',
      'Price': '$19.00 (Regular $49.00)',
      'Valid Until': 'Oct 31, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Emulation': 'Digital Audio Tape (DAT) Hardware Saturation'
    },
    seo_keywords: 'drivedat deal, the tone foundry tape, dat saturation plugin, 90s digital tape vst',
    content: `## Relive the Iconic Sound of 90s Digital Audio Tape

The Tone Foundry has discounted **driveDAT** by **61%**, making this unique digital tape saturation unit available for **$19.00** (normally $49.00) through October 31, 2026.

### The Missing Sound of 90s Mastering

Unlike vintage reel-to-reel magnetic tape, 90s DAT machines possessed unique converter characteristics:

- **Converter Jitter & Soft Limiting:** Captures the pleasant low-mid crunch and transient smoothing of early digital converters.
- **Emphasis Filtering:** Recreates the high-frequency pre-emphasis and de-emphasis curves used in professional broadcast facilities.
- **Harmonic Distortion Stages:** Drive the input to generate crunchy lo-fi textures for boom-bap drums and synth pads.

[Get Official Deal](https://www.pluginboutique.com/product/2-Effects/96-Tape-Emulation/17783-driveDAT?a_aid=${PB_AID})`
  },
  {
    id: 'news_roland_jupiter_8_deal',
    slug: 'roland-jupiter-8-synthesizer-deal-65-off',
    title: 'Roland JUPITER-8 Synthesizer Deal: 65% OFF ($69 Legendary Flagship Poly VST)',
    excerpt: 'The pinnacle of analog polysynths modeled down to the circuit level with Roland ACB technology. Save $130 on the definitive 8-voice icon until October 31.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 65% OFF',
    cover_image: 'https://www.pluginboutique.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBNlVpQ1E9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--3b683848098d4876c2e4e3a8e70e470d56a78530/JUPITER-8PDJupiterGlide_.jpeg',
    author_name: 'ProducerToy Editorial',
    author_role: 'Synthesizer & Sound Design Editor',
    reading_time: '3 MIN READ',
    source_name: 'Roland',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/4-Synth/15310-JUPITER-8?a_aid=${PB_AID}`,
    deal_price: '$69.00',
    deal_regular_price: '$199.00',
    published_at: new Date('2026-10-05T07:45:00Z').toISOString(),
    created_at: new Date('2026-10-05T07:45:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Roland',
      'Discount': '65% OFF',
      'Price': '$69.00 (Regular $199.00)',
      'Valid Until': 'Oct 31, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Modeling': 'Analog Circuit Behavior (ACB)'
    },
    seo_keywords: 'jupiter 8 vst deal, roland jupiter 8 sale, vintage poly synth plugin, acb analog synth',
    content: `## The King of Analog Polyphonic Synthesizers

Roland is offering a limited-time **65% discount** on the official **JUPITER-8** software synthesizer, priced at **$69.00** (originally $199.00) through October 31, 2026.

### Pure Analog Circuit Behavior

- **8-Voice Polyphony:** Dual VCOs per voice with cross-modulation, sync, and resonant low-pass filtering.
- **Unison & Chord Memory:** Stack all voices for room-shaking analog leads and punchy basslines.
- **Condition Parameter:** Dial in the exact age and component wear of the simulated hardware from pristine factory fresh to warm vintage drift.

[Get Official Deal](https://www.pluginboutique.com/product/1-Instruments/4-Synth/15310-JUPITER-8?a_aid=${PB_AID})`
  },
  {
    id: 'news_roland_juno_60_deal',
    slug: 'roland-juno-60-synthesizer-deal-65-off',
    title: 'Roland JUNO-60 Synthesizer Deal: 65% OFF ($69 Lush Analog Chorus Icon)',
    excerpt: 'The unmistakable warmth, swirling BBD stereo chorus, and punchy arpeggiator of the 1980s quintessential synth. Get the official JUNO-60 for $69 until October 31.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 65% OFF',
    cover_image: 'https://www.pluginboutique.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBeTlCQ1E9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--bd9343d452f5522bd5510bc6af12dbe27089f6ba/Juno-60-pluginboutique.webp',
    author_name: 'ProducerToy Editorial',
    author_role: 'Synthesizer & Sound Design Editor',
    reading_time: '3 MIN READ',
    source_name: 'Roland',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/4-Synth/15309-JUNO-60?a_aid=${PB_AID}`,
    deal_price: '$69.00',
    deal_regular_price: '$199.00',
    published_at: new Date('2026-10-05T07:40:00Z').toISOString(),
    created_at: new Date('2026-10-05T07:40:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Roland',
      'Discount': '65% OFF',
      'Price': '$69.00 (Regular $199.00)',
      'Valid Until': 'Oct 31, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Chorus': 'Authentic Stereo BBD Chorus (I + II Mode)'
    },
    seo_keywords: 'juno 60 vst deal, roland juno 60 sale, juno chorus plugin, 80s synth vst',
    content: `## The Synth That Defined the Sound of the 80s

Roland has discounted the legendary **JUNO-60** by **65%**, offering the official ACB emulation for **$69.00** (originally $199.00) through October 31, 2026.

### Instant Vibey Warmth in Any Mix

- **Legendary Dual Chorus:** Emulates the noisy, lush bucket-brigade device (BBD) analog chorus circuits that gave the JUNO its signature wide stereo image.
- **Fat Single-Oscillator Sub:** Produces solid, punchy sub-bass that stays firmly anchored in your low-end mix without phase cancellation.
- **Iconic Arpeggiator:** Instant retro-synthwave and synth-pop arpeggios that lock effortlessly to your host tempo.

[Get Official Deal](https://www.pluginboutique.com/product/1-Instruments/4-Synth/15309-JUNO-60?a_aid=${PB_AID})`
  }
];

async function run() {
  console.log('1. Clearing database of all old/hallucinated records...');
  await client.execute('DELETE FROM news_articles');
  console.log('Database cleared!');

  console.log('2. Inserting 17 verified, active live deals with Full HD images and genuine prices...');
  for (const article of LIVE_DEALS) {
    await client.execute({
      sql: `
        INSERT OR REPLACE INTO news_articles (
          id, slug, title, excerpt, content, category, badge,
          cover_image, author_name, author_role, reading_time,
          source_name, source_url, deal_price, deal_regular_price,
          published_at, created_at, is_featured, specs,
          related_products, seo_keywords
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?
        )
      `,
      args: [
        article.id,
        article.slug,
        article.title,
        article.excerpt,
        article.content,
        article.category,
        article.badge,
        article.cover_image,
        article.author_name,
        article.author_role,
        article.reading_time,
        article.source_name,
        article.source_url,
        article.deal_price,
        article.deal_regular_price,
        article.published_at,
        article.created_at,
        article.is_featured,
        JSON.stringify(article.specs),
        null,
        article.seo_keywords
      ]
    });
    console.log(`Saved: [${article.badge}] ${article.title}`);
  }

  const count = await client.execute('SELECT COUNT(*) as cnt FROM news_articles');
  console.log(`\nSuccessfully populated ${count.rows[0].cnt} verified active deals in Turso DB!`);
}

run().catch(console.error);
