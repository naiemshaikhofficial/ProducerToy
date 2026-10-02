/**
 * Detailed Master Knowledge Base for Support Bot:
 * - All Pages & Sitemap Navigation
 * - Complete Product Catalog & Categories
 * - Audio Tech News & Deals Desk
 * - Step-by-Step Installation Guides (VST3, AU, AAX, Sample Packs, Serum/Vital Presets, MIDI, Serial Activation)
 */
export function getSiteKnowledgeRules(): string {
  return `MASTER SITE KNOWLEDGE & TECHNICAL INSTALLATION MANUAL:

1. COMPLETE SITEMAP & ALL PAGES ROUTING GUIDE:
   - Storefront & Discovery:
     - /store: Main catalog browsing, multi-faceted filtering (price, categories, manufacturer, on sale, format).
     - /categories/instruments: Virtual instruments, synthesizers (wavetable, analog modeled, FM), samplers, and romplers.
     - /categories/effects: Audio FX, mixing and mastering plugins (EQ, compression, reverb, delay, saturation, vocal pitch correction).
     - /store/sounds & /categories/sounds: Royalty-free sample packs, drum kits, 808s, vocal chops, and melody loops.
     - /categories/studio-tools: Utility plugins, loudness meters (LUFS), spectrum analyzers, and audio routers.
     - /categories/bundles: Discounted bundles, developer suites, and mega collection deals (up to 80% off).
     - /free-vst-plugins & /free: 100% free VST software plugins and complimentary sound packs.
     - /gifts: Complimentary gifts and bonus plugins claimable on eligible checkout purchases.
     - /manufacturers & /brands: Directory of 200+ world-class audio plugin manufacturers (FabFilter, Arturia, Universal Audio, Native Instruments, Slate Digital, etc.).
   - Editorial, News & Guides:
     - /news: Breaking audio plugin news, flash deal alerts, time-limited discount expiry countdowns, and developer giveaways.
     - /blog: Music production tutorials, mixing masterclasses, 808 bass tuning guides, and sound design articles.
   - User Account & Personal Fulfillment:
     - /library: The creator's personal digital locker containing all purchased software, instant serial keys, direct cloud CDN download mirrors, and version updates.
     - /wishlist: Bookmarked items with automatic price drop alerts when products go on sale.
     - /cart & /checkout: Multi-currency checkout processing USD, EUR, GBP, and INR (via Razorpay, Stripe, PayPal, Cashfree).
     - /auth & /reset-password: User authentication, magic link sign-in, and password recovery.
   - Creator Distribution & Business:
     - /distribute: Developer publishing portal where audio developers and sound designers distribute products with 70% to 88% revenue share.
     - /licensing & /eula: Commercial rights, 100% royalty-free terms, and end-user license agreements.
   - Company & Support:
     - /about: Producer Toy story, founded by music producer & creative director Naiem Shaikh, company mission, core pillars, and sister company SamplesWala (sampleswala.com).
     - /faq: Frequently Asked Questions covering selling, orders, wishlist, free gifts, licenses, refunds, and DAW troubleshooting.
     - /support: Official 24/7 help desk, raise support ticket (/support?tab=raise-ticket), and track ticket status (/support?tab=track-ticket).
     - /contact: Official inquiry and grievance officer contact.
     - /terms, /privacy, /refund-policy, /purchase-policy: Legal and buyer protection policies.

2. STEP-BY-STEP INSTALLATION & ACTIVATION GUIDES (HOW TO INSTALL):
   Producers frequently ask how to install plugins, samples, and presets. Always provide clear, numbered step-by-step instructions:

   A. HOW TO INSTALL VST3 & VST2 PLUGINS ON WINDOWS (PC):
      1. Download the installer archive (.zip, .exe, or .msi) from your Producer Toy Library (/library).
      2. If inside a .zip file, right-click and select "Extract All".
      3. Run the installer (.exe) as Administrator.
      4. Standard Default Installation Folders (DO NOT CHANGE THESE):
         - VST3 Plugins: C:\\Program Files\\Common Files\\VST3\\ (Official VST3 standard directory).
         - 64-bit VST2 Plugins: C:\\Program Files\\VSTPlugins\\ or C:\\Program Files\\Steinberg\\VstPlugins\\
      5. Open your DAW (FL Studio, Ableton Live, Studio One, Reaper, Cubase) and run a plugin rescan.
      6. Enter your license serial key from /library upon launching the plugin.

   B. HOW TO INSTALL VST3 & AU (AUDIO UNITS) ON macOS (APPLE SILICON & INTEL):
      1. Download the macOS installer (.dmg or .pkg) from your Library (/library).
      2. Double-click the .dmg or .pkg and follow the onscreen installer prompts.
      3. If provided with standalone plugin files:
         - Move .vst3 files to: /Library/Audio/Plug-Ins/VST3/
         - Move .component (AU) files to: /Library/Audio/Plug-Ins/Components/
      4. Bypassing macOS Gatekeeper Security ("Developer cannot be verified" or "Blocked from opening"):
         - Step 1: Open macOS System Settings > Privacy & Security.
         - Step 2: Scroll down to the "Security" section.
         - Step 3: Look for the notification stating the plugin was blocked, and click "Open Anyway".
         - Step 4: Reopen your DAW and re-scan plugins.

   C. HOW TO INSTALL & LOAD SAMPLE PACKS, DRUM KITS & WAV LOOPS:
      1. Download the sample pack .zip from /library.
      2. Extract the .zip file to your dedicated audio samples hard drive (e.g. D:\\Samples\\ or ~/Music/Samples/).
      3. Adding to DAW Browser:
         - In FL Studio: Go to Options > File Settings. In "Browser extra search folders", click an empty folder icon, select your sample pack folder, and click OK. The pack will instantly appear in the left browser tree!
         - In Ableton Live: In the left sidebar under "Places", click "Add Folder..." and select your unzipped sample folder.
         - In Logic Pro: Open the File Browser (press F) or drag WAV audio files directly into the timeline.
         - In Studio One / Cubase: Open the right Browser panel, go to Files, and drag the sample folder into your favorites.

   D. HOW TO INSTALL SYNTH PRESETS (SERUM, VITAL, MASSIVE, SYLENTH1):
      1. Xfer Serum Presets (.fxp, .wav tables, .wav noises):
         - Step 1: Open Serum inside your DAW.
         - Step 2: Click the "Menu" button (top right) and choose "Show Serum Presets Folder".
         - Step 3: Open the "Presets" folder (or "Tables" / "Noises").
         - Step 4: Paste your unzipped preset pack into the "User" subfolder.
         - Step 5: In Serum, click Menu > "Rescan folders on disk". Your new presets appear instantly in the preset browser!
      2. Matt Tytel Vital Presets (.vital, .vitalbank):
         - Step 1: Open Vital.
         - Step 2: Click the three-line hamburger menu (top right) and click "Import Bank" (if .vitalbank) or "Open User Folder".
         - Step 3: Place .vital preset files into the "Presets" directory.
      3. Native Instruments Massive:
         - Copy presets into Documents\\Native Instruments\\Massive\\Sounds\\.
         - In Massive, go to File > Options > Browser > click "Rebuild DB".
      4. LennarDigital Sylenth1:
         - Open Sylenth1 > Click "Menu" > "Load Bank" (.fxb) or "Load Preset" (.fxp).

   E. HOW TO INSTALL MIDI KITS & CHORD PACKS (.mid):
      1. Unzip the MIDI package.
      2. Drag and drop any .mid file directly onto an Instrument track, Piano Roll, or MIDI channel in any DAW. All notes, velocities, and chords render immediately.

   F. HOW TO ACTIVATE SERIAL KEYS:
      1. Go to your personal Library (/library) on Producer Toy and copy your unique Serial Key.
      2. Load the plugin on an audio or MIDI track in your DAW.
      3. Click the "Activate", "Register", or Gear/Key icon in the plugin interface.
      4. Paste your Serial Key and associated account email address. Click "Authorize" or "Activate".
      5. If the product uses a developer license manager (iLok, Native Access, Arturia Software Center, Waves Central, Universal Audio Connect): open that manager, click "Add Serial" or "Register Product", paste the key, and install.

3. PRODUCT CATALOG EXPERTISE:
   - Formats available: VST, VST3, AU (Audio Units for Mac), AAX (Pro Tools), CLAP, Standalone software, WAV (24-bit / 44.1kHz - 96kHz lossless), MIDI, and Synth Presets.
   - Compatibility: 100% royalty-free for commercial music releases, Spotify streaming, TV, film, radio, and gaming sync.
   - Pricing: All digital store prices in USD ($) with automatic INR (₹) conversion for Indian producers via UPI, NetBanking, and RuPay.

4. AUDIO PLUGIN NEWS & DEALS DESK KNOWLEDGE (/news):
   - Daily Coverage: Real-time reporting on audio plugin sales, flash discounts, developer promotions, freebie alerts, hardware announcements, and DAW updates.
   - Real-time Expiry Status: Articles feature live countdowns with "Active", "Ending Soon", and "Expired" deal badges.
   - Verified Hot Deals: Direct links to featured deals, developer sales (e.g. Slate Digital MetaTune, Analog Legends GROOVE, Aubit Sound Awake, Moog Moogerfooger giveaways), and instant checkout perks.`
}
