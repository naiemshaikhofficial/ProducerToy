/**
 * Detailed Knowledge Base for About Us, Frequently Asked Questions (FAQ), and News & Deals Desk
 */
export function getSiteKnowledgeRules(): string {
  return `DETAILED SITE KNOWLEDGE & PLATFORM AWARENESS (ABOUT US, FAQ & NEWS DESK):

1. ABOUT PRODUCER TOY (/about):
   - What is Producer Toy: Producer Toy (producertoy.com) is a modern, creator-first digital audio marketplace where producers, beatmakers, audio engineers, and sound designers discover and purchase VST plugins, virtual instruments, sample packs, synth presets, and DAW tools.
   - Founder & Creative Director: Founded by music producer and creative director Naiem Shaikh. Naiem built Producer Toy to solve the frustration of fragmented manufacturer portals, cumbersome serial key recovery, and clunky legacy audio sites by engineering one centralized, modern library for music creators worldwide.
   - Core Mission: Built from the ground up to empower music creators of all levels—from bedroom producers crafting their first 808s to commercial mixing engineers finishing chart-topping records—with instantaneous software access and curated sound design.
   - 4 Core Pillars:
     1. Instant Digital Fulfillment: Direct, automated access to serial keys, official installer links, and tax invoices in the user's Library immediately upon checkout.
     2. Exclusive Free Gifts: Complimentary VST plugins, sound kits, and preset expansions included with eligible purchases at zero extra cost.
     3. DAW Agnostic Architecture: 100% verified compatibility across FL Studio, Ableton Live, Logic Pro, Cubase, Studio One, Reaper, and Bitwig.
     4. Centralized Creator Library: One unified account at /library so users never need to juggle dozens of separate manufacturer logins.
   - Sister Platform: SamplesWala (sampleswala.com) is Producer Toy's sister platform founded by the same team, dedicated to Indian, Bollywood, and Desi traditional instruments (Tabla, Dholak, Harmonium, Bansuri) and FL templates in INR (₹).

2. FREQUENTLY ASKED QUESTIONS & KNOWLEDGE BASE (/faq):
   - Working & Selling With Producer Toy (/distribute):
     - Audio developers, DSP programmers, sound designers, and sample labels can distribute their virtual instruments, effect plugins, and soundbanks to producers across 100+ countries.
     - Revenue Split: Creators retain 70% to 80% net revenue split on digital sales with automated bi-weekly payouts and zero upfront listing fees.
     - Features: Automated serial key generation, high-speed multi-region CDN cloud downloads, and copy-protection delivery.
     - Affiliate Partner Program: Music educators, YouTubers, and reviewers earn competitive commissions on referred sales with a 30-day cookie window and real-time conversion dashboard. Inquiries via /contact.
   - Orders, Wishlist & Free Gifts:
     - Wishlist: Accessible via the bookmark icon in the top header or directly at /wishlist. Automatically tracks saved products and alerts creators when prices drop or items go on flash sale.
     - Order Confirmation: Generated instantly upon payment; confirmation email sent with transaction ID and direct library link.
     - Tax Invoices: Official invoices including GST / VAT and seller registration details are generated upon checkout or can be retrieved by providing an order number.
     - Free Gift Promotion: Eligible purchases unlock free bonus plugins or sample packs claimable on the checkout screen or at /gifts.
   - Licenses & Cloud Downloads:
     - All digital licenses are perpetual lifetime activations unless explicitly marked as a subscription or rent-to-own.
     - Re-downloading: Users can re-download their purchased plugins, sample packs, and serial codes anytime without fees directly from their Library (/library).
   - Refunds & Buyer Protection Guarantee:
     - Because digital products, serial keys, and sound libraries are unlocked instantly and cannot be un-downloaded, standard change-of-mind refunds follow manufacturer policies.
     - Defective Key & Corrupted File Guarantee: Producer Toy provides 100% replacement or technical resolution for any verified defective serial keys, broken installers, or corrupted download archives reported within 14 days of purchase.
   - Account & Verification:
     - Account Login: Users can log in using email/password or passwordless magic link at /auth.
     - Password Recovery: Available at /reset-password.
     - Guest Order Linking: If a user checks out as a guest, their purchases automatically attach to their account once they create an account or sign in with that same email address.
   - DAW Setup & Technical Troubleshooting:
     - FL Studio Plugin Rescan:
       1. Open FL Studio and go to Options > Manage Plugins.
       2. In Plugin Scan Settings, enable both "Rescan previously verified plugins" and "Rescan plugins with errors".
       3. Verify that your VST3 search path includes C:\\Program Files\\Common Files\\VST3 (Windows) or /Library/Audio/Plug-Ins/VST3 (macOS).
       4. Click "Find installed plugins".
     - Ableton Live Plugin Rescan:
       1. Open Ableton Live Preferences (Ctrl+, on Windows, Cmd+, on macOS).
       2. Go to the "Plug-Ins" tab and ensure "Use VST3 Plug-In System Folders" is set to ON.
       3. Hold down the Alt/Option key while clicking the "Rescan" button to force a complete deep scan of all system folders.
     - Logic Pro AU Manager & Gatekeeper:
       1. In Logic Pro, navigate to Settings > Plug-in Manager.
       2. Locate the unverified plugin, select it, and click "Reset & Rescan Selection".
       3. If macOS Gatekeeper blocks the AU component ("cannot be opened because developer cannot be verified"), open macOS System Settings > Privacy & Security and click "Open Anyway".
     - Apple Silicon (M1/M2/M3/M4) & macOS Sequoia / Sonoma:
       1. All modern software on Producer Toy runs natively on Apple Silicon ARM64 architecture with ultra-low latency.
       2. Older legacy x86 VST plugins can be run in your DAW by launching the DAW with "Open using Rosetta" enabled in the Finder application info.

3. AUDIO PLUGIN NEWS & DEALS DESK (/news):
   - What the News Desk Is: The official editorial and news hub of Producer Toy (/news), delivering daily breaking audio tech news, time-limited VST discounts, developer sales, freebie alerts, hardware announcements, and mixing tutorials.
   - Real-Time Deal Tracking & Expirations:
     - Deals published on the News Desk feature live deal expiration countdowns and real-time status badges: "Active", "Ending Soon", or "Expired".
     - When a deal expires on manufacturer or partner sites, the article clearly informs producers that the deal has ended, while suggesting active alternative deals.
   - Category Coverage:
     - Deals & Discounts: Major price cuts on synthesizers, compressors, reverbs, mastering suites, and vocal processors.
     - Free VST Plugins: Verified 100% free plugin alerts, temporary giveaways, and freeware gems.
     - Sound Kits & Preset Packs: Serum presets, Vital soundbanks, 808 packs, and cinematic sample pack drops.
     - Industry & Tech Announcements: Major DAW updates (FL Studio, Ableton Live, Logic Pro), Apple OS compatibility notices, and new DSP innovations.
   - Seamless Store Integration: News articles link directly to featured plugins, discount codes, manufacturer brand pages (/manufacturers), and store deals (/store?on_sale=true).`
}
