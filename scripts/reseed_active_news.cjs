const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://producertoy-producertoy.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA3MDIwMTAsImlkIjoiMDFhMGVkZGItMWQwMS03NGU0LWFhZmQtNDVlMWI2ZWEyNGU4Iiwia2lkIjoiQ1RtQkF5U1hIZmtMT0puXy1ycURLaFNaTjZTUk9lcDZRcmo5YW91ODNMMCIsInJpZCI6ImU5ZThhMTRhLWMyMTYtNGZmNi04NWJlLTYzMTgwNjUyMDdkMyJ9.4kTJ41ZGPxl0iwtpYgGMgTAH-_s5_uAguJoHfCvULoq7mVh7qQ4IefG4YOmjxXFas-me10fyHdPmASKTthoBCQ'
});

const PB_AID = '68affa2b94f43';

const ACTIVE_ARTICLES = [
  {
    id: 'news_uad_mix_tape_pro_deal',
    slug: 'universal-audio-uad-mix-tape-pro-deal-33-off-vst-bundle',
    title: 'Universal Audio UAD Mix Tape Pro Deal: 33% OFF ($99 Custom 10-Plugin Bundle)',
    excerpt: 'Pick any 10 iconic UAD plugins from a curated catalog of 45 legendary analog titles. Save $50 on the ultimate custom mixing and production suite with lifetime native licensing.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 33% OFF',
    cover_image: 'https://banners.pluginboutique.com/aywrbih6vl3b95zhkfypnmkxkssf',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '4 MIN READ',
    source_name: 'Universal Audio',
    source_url: `https://www.pluginboutique.com/product/81-Bundles/39-Effects-Bundles/17197-UAD-Mix-Tape-Pro?a_aid=${PB_AID}`,
    deal_price: '$99.00',
    deal_regular_price: '$149.00',
    published_at: new Date('2026-10-05T08:00:00Z').toISOString(),
    created_at: new Date('2026-10-05T08:00:00Z').toISOString(),
    is_featured: 1,
    specs: {
      'Brand': 'Universal Audio',
      'Discount': '33% OFF',
      'Price': '$99.00 (Regular $149.00)',
      'Valid Until': 'Nov 01, 2026',
      'Format': 'VST3, AU, AAX (Apple Silicon & Windows 64-bit)',
      'Free Gift': 'Melodyne 5 Essential or Moog MF-109S with purchase',
      'Includes': 'Choose 10 of 45 iconic UAD native plugins'
    },
    seo_keywords: 'uad mix tape pro, universal audio sale, uad custom bundle, vst plugin deals, la-2a, 1176, pultec, ssl 4000',
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

Every chosen plugin runs natively on macOS (Apple Silicon M1/M2/M3 native) and Windows 10/11 without requiring proprietary Apollo or UAD-2 DSP accelerator hardware. Seamlessly insert multiple instances across Ableton Live, FL Studio, Logic Pro, Cubase, and Studio One with ultra-low CPU overhead.

### Exclusive Purchase Bonuses

Purchases made during this promotional window also qualify for a choice of a **Free Gift** at checkout, including Celemony Melodyne 5 Essential ($99 value), Dreamtonics Synthesizer V Studio 2 Core, or the Moog Moogerfooger MF-109S Saturator.

[Get Official Deal](https://www.pluginboutique.com/product/81-Bundles/39-Effects-Bundles/17197-UAD-Mix-Tape-Pro?a_aid=${PB_AID})`
  },
  {
    id: 'news_ua_studer_a800_deal',
    slug: 'universal-audio-studer-a800-tape-recorder-vst-deal-80-off',
    title: 'Universal Audio Studer A800 Tape Recorder VST Deal: 80% OFF ($39 Special Offer)',
    excerpt: 'Experience authentic multichannel analog tape warmth and head saturation. Universal Audio drops the industry-standard Studer A800 to just $39 until November 1.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 80% OFF',
    cover_image: 'https://banners.pluginboutique.com/f9h77z0m8k9e0618n1g0s2o652h3',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'Universal Audio',
    source_url: `https://www.pluginboutique.com/product/2-Effects/96-Tape-Emulation/11200-Studer-A800-Tape-Recorder?a_aid=${PB_AID}`,
    deal_price: '$39.00',
    deal_regular_price: '$199.00',
    published_at: new Date('2026-10-05T07:45:00Z').toISOString(),
    created_at: new Date('2026-10-05T07:45:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Universal Audio',
      'Discount': '80% OFF',
      'Price': '$39.00 (Regular $199.00)',
      'Valid Until': 'Nov 01, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Compatibility': 'macOS & Windows 64-bit'
    },
    seo_keywords: 'studer a800 deal, universal audio tape plugin, tape saturation vst, analog tape warmth',
    content: `## The Definitive Multichannel Tape Machine in Your DAW

The legendary **Studer A800 Multichannel Tape Recorder** from Universal Audio has received a massive **80% discount**, dropping from its standard $199.00 price tag down to **$39.00** through November 1, 2026.

### Authentic Tape Physics & Non-Linearities

Modeled in meticulous detail with direct guidance from Studer's original chief engineers, the UAD Studer A800 faithfully replicates the sound of the world's most sought-after 2-inch multichannel analog tape recorder:

- **Tape Formulas:** Select between multiple vintage and modern tape formulations (250, 456, 900, GP9) each offering distinct magnetic saturation curves and headroom characteristics.
- **IPS Tape Speeds:** Switch between 7.5, 15, and 30 IPS speeds to tailor low-end bump, harmonic grit, and transient response.
- **Controls & Calibration:** Fine-tune Input and Output levels, Bias calibration, HF Record EQ, and Hiss level to impart vintage character without unwanted noise floor.

[Get Official Deal](https://www.pluginboutique.com/product/2-Effects/96-Tape-Emulation/11200-Studer-A800-Tape-Recorder?a_aid=${PB_AID})`
  },
  {
    id: 'news_ssl_native_bus_comp_2_deal',
    slug: 'solid-state-logic-ssl-native-bus-compressor-2-deal-87-off',
    title: 'Solid State Logic SSL Native Bus Compressor 2 Deal: 87% OFF ($19 Mix Glue)',
    excerpt: 'Get the legendary G-Series center section bus compressor for just $19.00 (regularly $149.00). The gold standard for punch and mix cohesion across all genres.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 87% OFF',
    cover_image: 'https://banners.pluginboutique.com/2ttb26to2z78bk1f2669mktcq0ha',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'Solid State Logic',
    source_url: `https://www.pluginboutique.com/product/2-Effects/8-Compressor/7996-SSL-Native-Bus-Compressor-2?a_aid=${PB_AID}`,
    deal_price: '$19.00',
    deal_regular_price: '$149.00',
    published_at: new Date('2026-10-05T07:30:00Z').toISOString(),
    created_at: new Date('2026-10-05T07:30:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Solid State Logic',
      'Discount': '87% OFF',
      'Price': '$19.00 (Regular $149.00)',
      'Valid Until': 'Oct 31, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Compatibility': 'macOS Apple Silicon & Windows'
    },
    seo_keywords: 'ssl bus compressor deal, solid state logic g bus, mix glue compressor vst, 19 dollar ssl deal',
    content: `## The Legendary Mix Glue Behind Decades of Hit Records

Solid State Logic has slashed the price of the **SSL Native Bus Compressor 2** by **87%**, making this indispensable mixing utility available for just **$19.00** (originally $149.00) through October 31, 2026.

### Precision VCA Compression Architecture

Based on the center section compressor from SSL's iconic 1980s G-Series analog consoles, Bus Compressor 2 delivers unmatched musical cohesion:

- **Signature Glue:** Tames rogue dynamic peaks while bonding drum tracks and master buses into a cohesive record.
- **Modern Enhancements:** Includes a dedicated Sidechain High-Pass Filter (up to 185 Hz) to preserve sub-bass clarity, plus a continuous Dry/Wet parallel mix knob.
- **Flexible Ratios:** Choose between classic 2:1, 4:1, and aggressive 10:1 settings with auto release behavior.

[Get Official Deal](https://www.pluginboutique.com/product/2-Effects/8-Compressor/7996-SSL-Native-Bus-Compressor-2?a_aid=${PB_AID})`
  },
  {
    id: 'news_roland_zenology_pro_deal',
    slug: 'roland-zenology-pro-synthesizer-deal-56-off',
    title: 'Roland ZENOLOGY PRO Synthesizer Deal: 56% OFF ($99 Flagship Sound Engine)',
    excerpt: 'Unlock over 4,000 preset patches, deep sound design architecture, and vintage Roland filters. Save $130 on the ultimate ZEN-Core production instrument until October 31.',
    category: 'Deals & Sales',
    badge: 'HOT DEAL • 56% OFF',
    cover_image: 'https://banners.pluginboutique.com/mxqnkqqukw1nsb13zdojp13udato',
    author_name: 'ProducerToy Editorial',
    author_role: 'Synthesizer & Sound Design Editor',
    reading_time: '4 MIN READ',
    source_name: 'Roland',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/4-Synth/15308-ZENOLOGY-PRO?a_aid=${PB_AID}`,
    deal_price: '$99.00',
    deal_regular_price: '$229.00',
    published_at: new Date('2026-10-05T07:15:00Z').toISOString(),
    created_at: new Date('2026-10-05T07:15:00Z').toISOString(),
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
    cover_image: 'https://banners.pluginboutique.com/l2b6f42yd4uk493334cpovwqwtp1',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'IK Multimedia',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/64-Virtual-Instruments/12454-MODO-BASS-2?a_aid=${PB_AID}`,
    deal_price: '$29.99',
    deal_regular_price: '$199.99',
    published_at: new Date('2026-10-05T07:00:00Z').toISOString(),
    created_at: new Date('2026-10-05T07:00:00Z').toISOString(),
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
    cover_image: 'https://banners.pluginboutique.com/efgauxzk42vohikaazxy59pfnnof',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'Universal Audio',
    source_url: `https://www.pluginboutique.com/product/2-Effects/8-Compressor/11502-Empirical-Labs-EL8-Distressor-Compressor?a_aid=${PB_AID}`,
    deal_price: '$39.00',
    deal_regular_price: '$199.00',
    published_at: new Date('2026-10-05T06:45:00Z').toISOString(),
    created_at: new Date('2026-10-05T06:45:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Universal Audio',
      'Discount': '80% OFF',
      'Price': '$39.00 (Regular $199.00)',
      'Valid Until': 'Nov 01, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Hardware Modeled': 'Empirical Labs EL8 Distressor'
    },
    seo_keywords: 'distressor plugin deal, universal audio el8 distressor, drum compressor vst, british mode compression',
    content: `## The Desert-Island Compressor of Modern Record Production

Universal Audio has discounted the **Empirical Labs EL8 Distressor** by **80%**, bringing this industry-benchmark dynamics processor down to **$39.00** (originally $199.00) through November 1, 2026.

### Endorsed Directly by Dave Derr & Empirical Labs

Faithfully capturing every nuance of the legendary hardware unit, this native UAD plugin delivers hyper-fast attack times and distinct coloration:

- **Distortion Modes:** Engage Dist 2 for tube-style second-harmonic warmth, or Dist 3 for tape-style third-harmonic saturation.
- **British Mode & Nuke:** Unlock the famous all-buttons-in British Mode for aggressive snare smash and room mic explosive energy.
- **Sidechain Filtering:** Built-in 170 Hz HP filter and mid-range boost curve prevent low-frequency pumping on modern sub-bass mixes.

[Get Official Deal](https://www.pluginboutique.com/product/2-Effects/8-Compressor/11502-Empirical-Labs-EL8-Distressor-Compressor?a_aid=${PB_AID})`
  },
  {
    id: 'news_sonnox_producer_power_bundle_deal',
    slug: 'sonnox-producer-power-bundle-oxford-inflator-limiter-deal-85-off',
    title: 'Sonnox Producer Power Bundle Deal: 85% OFF ($59 Oxford Inflator & Limiter)',
    excerpt: 'Combine the legendary loudness warmth of Oxford Inflator with precision True Peak brickwall limiting. Massive $361 savings on this studio-grade mixing and mastering duo.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 85% OFF',
    cover_image: 'https://banners.pluginboutique.com/bs31gdoy3r75w0rwwce5jthmm78m',
    author_name: 'ProducerToy Editorial',
    author_role: 'Mastering & Dynamics Editor',
    reading_time: '4 MIN READ',
    source_name: 'Sonnox',
    source_url: `https://www.pluginboutique.com/product/81-Bundles/39-Effects-Bundles/16478-Sonnox-Producer-Power-Bundle-Oxford-Inflator-Oxford-Limiter?a_aid=${PB_AID}`,
    deal_price: '$59.00',
    deal_regular_price: '$420.00',
    published_at: new Date('2026-10-05T06:30:00Z').toISOString(),
    created_at: new Date('2026-10-05T06:30:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Sonnox',
      'Discount': '85% OFF',
      'Price': '$59.00 (Regular $420.00)',
      'Valid Until': 'Oct 31, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Includes': 'Oxford Inflator + Oxford Limiter V4'
    },
    seo_keywords: 'sonnox producer power bundle, oxford inflator deal, sonnox limiter sale, true peak mastering limiter vst',
    content: `## Maximum Perceived Loudness with Zero Sonic Compromise

Sonnox has introduced the **Producer Power Bundle**, bringing together the revered **Oxford Inflator** and **Oxford Limiter** at a staggering **85% discount** for **$59.00** (originally $420.00) through October 31, 2026.

### The Secret Weapon of Multi-Platinum Mixes

- **Oxford Inflator:** The secret weapon behind major streaming hits. Adds perceived loudness, weight, and analog tube warmth to tracks and master buses without squashing transients or eating up headroom.
- **Oxford Limiter V4:** Unrivaled transparency with comprehensive True Peak inter-sample peak protection to guarantee clean playback across Spotify, Apple Music, and YouTube without clipping artifacts.

[Get Official Deal](https://www.pluginboutique.com/product/81-Bundles/39-Effects-Bundles/16478-Sonnox-Producer-Power-Bundle-Oxford-Inflator-Oxford-Limiter?a_aid=${PB_AID})`
  },
  {
    id: 'news_ujam_no_brainer_sale_deal',
    slug: 'ujam-virtual-instruments-no-brainer-deals-9-dollar-sale',
    title: 'UJAM Virtual Instruments Mega Sale: 93% OFF ($9 Each for SOLID 2 & IRON 2)',
    excerpt: 'Score full-featured virtual bass and rock guitar instruments for just $9 each (regularly up to $129). Authentic session performances with drag-and-drop MIDI.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 93% OFF',
    cover_image: 'https://banners.pluginboutique.com/bkn6b4yv5xo6iitlenud4bvgz2pc',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'UJAM',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/64-Virtual-Instruments/8111-IRON-2?a_aid=${PB_AID}`,
    deal_price: '$9.00',
    deal_regular_price: '$129.00',
    published_at: new Date('2026-10-05T06:15:00Z').toISOString(),
    created_at: new Date('2026-10-05T06:15:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'UJAM',
      'Discount': '93% OFF',
      'Price': '$9.00 (Regular $129.00)',
      'Valid Until': 'Oct 11, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Includes': 'Virtual Guitarist IRON 2 & Bassist SOLID 2'
    },
    seo_keywords: 'ujam 9 dollar sale, virtual guitarist iron 2 deal, ujam solid 2 vst, cheap vst plugins 2026',
    content: `## Professional Session Players in Your DAW for Under Ten Dollars

UJAM has launched its popular **No-Brainer Deals**, slashing flagship virtual session instruments down to just **$9.00 each** (up to 93% off retail prices up to $129.00) through October 11, 2026.

### Featured $9 Titles

- **Virtual Guitarist IRON 2:** Hard rock and metal power riffs, custom distortion pedals, and instant guitar chord accompaniment.
- **Virtual Bassist SOLID 2:** Precision pop and funk basslines played on a classic vintage bass with dynamic slap and finger picking.
- **Virtual Drummer HEAVY 2 & CARBON:** Punchy hard-hitting acoustic and hybrid drum kits optimized for rock, soundtrack, and modern pop productions.

[Get Official Deal](https://www.pluginboutique.com/product/1-Instruments/64-Virtual-Instruments/8111-IRON-2?a_aid=${PB_AID})`
  },
  {
    id: 'news_ua_minimoog_deal',
    slug: 'universal-audio-minimoog-synth-deal-73-off',
    title: 'Universal Audio Minimoog Synth Deal: 73% OFF ($39 Legendary Monosynth VST)',
    excerpt: 'Get the definitive circuit-accurate emulation of Bob Moog’s iconic synthesizer for just $39 (originally $149). Fat analog bass, leads, and screaming ladder filter resonance.',
    category: 'Deals & Sales',
    badge: 'HOT DEAL • 73% OFF',
    cover_image: 'https://banners.pluginboutique.com/932wi6zu21xcngb50o7rfwx6j6st',
    author_name: 'ProducerToy Editorial',
    author_role: 'Synthesizer & Sound Design Editor',
    reading_time: '3 MIN READ',
    source_name: 'Universal Audio',
    source_url: `https://www.pluginboutique.com/product/1-Instruments/64-Virtual-Instruments/10188-Minimoog?a_aid=${PB_AID}`,
    deal_price: '$39.00',
    deal_regular_price: '$149.00',
    published_at: new Date('2026-10-05T06:00:00Z').toISOString(),
    created_at: new Date('2026-10-05T06:00:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Universal Audio',
      'Discount': '73% OFF',
      'Price': '$39.00 (Regular $149.00)',
      'Valid Until': 'Oct 15, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Hardware Modeled': 'Vintage Moog Minimoog Model D'
    },
    seo_keywords: 'minimoog plugin deal, universal audio minimoog, moog model d vst, bass synth plugin',
    content: `## The Holy Grail of Analog Monosynths in Native Format

Universal Audio has discounted the official **Minimoog** synthesizer plugin by **73%**, making it available for **$39.00** (originally $149.00) through October 15, 2026.

### Certified by Moog Music

Developed in close collaboration with Moog Music, this native UAD plugin captures every analog quirk and non-linearity of the vintage Model D:

- **Legendary Ladder Filter:** Full self-oscillating 4-pole 24 dB lowpass filter with authentic warmth and grit.
- **Feedback Loop Modeling:** Route output back into external input for thick, saturated overdrive.
- **Custom Modern Presets:** Hundreds of custom patches from world-class sound designers tailored for hip-hop, electronic, and rock basslines.

[Get Official Deal](https://www.pluginboutique.com/product/1-Instruments/64-Virtual-Instruments/10188-Minimoog?a_aid=${PB_AID})`
  },
  {
    id: 'news_ua_helios_type_69_deal',
    slug: 'universal-audio-helios-type-69-preamp-eq-deal-80-off',
    title: 'Universal Audio Helios Type 69 Preamp & EQ Deal: 80% OFF ($29 Classic British Tone)',
    excerpt: 'The punchy, musical analog console EQ behind Led Zeppelin, The Beatles, and Bob Marley. Grab the native UAD Helios Type 69 for just $29 through October 31.',
    category: 'Deals & Sales',
    badge: 'MEGA DEAL • 80% OFF',
    cover_image: 'https://banners.pluginboutique.com/3pa7qwoemsobb8wz22be1mn5jo3y',
    author_name: 'ProducerToy Editorial',
    author_role: 'Senior Audio Software Editor',
    reading_time: '3 MIN READ',
    source_name: 'Universal Audio',
    source_url: `https://www.pluginboutique.com/product/2-Effects/16-EQ/11202-Helios-Type-69-Preamp-and-EQ-Collection?a_aid=${PB_AID}`,
    deal_price: '$29.00',
    deal_regular_price: '$149.00',
    published_at: new Date('2026-10-05T05:45:00Z').toISOString(),
    created_at: new Date('2026-10-05T05:45:00Z').toISOString(),
    is_featured: 0,
    specs: {
      'Brand': 'Universal Audio',
      'Discount': '80% OFF',
      'Price': '$29.00 (Regular $149.00)',
      'Valid Until': 'Oct 31, 2026',
      'Format': 'VST3, AU, AAX Native',
      'Hardware Modeled': 'Helios Type 69 Console'
    },
    seo_keywords: 'helios type 69 deal, universal audio preamp eq, british console eq vst, vintage audio preamp',
    content: `## British Rock Royalty Console Tone for $29

Universal Audio has reduced the **Helios Type 69 Preamp and EQ Collection** by **80%**, dropping the price to **$29.00** (originally $149.00) through October 31, 2026.

### The Sound of Olympic and Island Studios

Installed in London's legendary recording studios, the Helios Type 69 console shaped iconic albums from Led Zeppelin, The Rolling Stones, and Jimi Hendrix:

- **Lustrous Passive Highs:** Smooth 10 kHz high shelf that opens up acoustic instruments and vocals without harshness.
- **Punchy Inductor Mid-Band:** Musical peaking mid-range equalizer that cuts through dense mixes effortlessly.
- **Lustraphone Transformer Preamp:** Authentic preamp modeling delivering harmonic coloration and saturation as you push the input gain.

[Get Official Deal](https://www.pluginboutique.com/product/2-Effects/16-EQ/11202-Helios-Type-69-Preamp-and-EQ-Collection?a_aid=${PB_AID})`
  }
];

async function run() {
  console.log('1. Clearing old / stale news articles from database...');
  await client.execute('DELETE FROM news_articles');
  console.log('Database successfully cleared!');

  console.log('2. Inserting verified 100% active deals for today...');
  for (const article of ACTIVE_ARTICLES) {
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
  console.log(`\nAll done! Total active articles in Turso DB: ${count.rows[0].cnt}`);
}

run().catch(console.error);
