export interface KnowledgeArticle {
  id: string
  category: 'free_and_licensing' | 'serial_keys' | 'daw_setup' | 'downloads' | 'billing_invoices' | 'refunds' | 'hardware_apple' | 'account'
  categoryLabel: string
  question: string
  shortAnswer: string
  detailedSteps: string[]
  tags: string[]
  actionCta?: {
    label: string
    href: string
    isExternal?: boolean
  }
}

export const KNOWLEDGE_CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'free_and_licensing', label: 'Free & Royalties' },
  { id: 'serial_keys', label: 'Serial Keys & iLok' },
  { id: 'daw_setup', label: 'DAW Troubleshooting' },
  { id: 'downloads', label: 'Downloads & CDN' },
  { id: 'billing_invoices', label: 'Orders & Invoices' },
  { id: 'refunds', label: 'Refund Policy' },
  { id: 'hardware_apple', label: 'Apple Silicon & OS' },
  { id: 'account', label: 'Account & Security' },
] as const

export const KNOWLEDGE_BASE: KnowledgeArticle[] = [
  // 1. FREE PRODUCTS & ROYALTIES
  {
    id: 'free-1',
    category: 'free_and_licensing',
    categoryLabel: 'Free & Royalties',
    question: 'Are there any free plugins or sample packs currently available on Producer Toy?',
    shortAnswer: 'Currently, Producer Toy features exclusively master-grade commercial sound libraries (such as Tabla Master\'s and upcoming Sexy Drill). All products in our live store are commercial releases; there are currently no 0-cost free tier packs or free plugins in the store database.',
    detailedSteps: [
      'All sample packs and sound libraries on Producer Toy are master-grade commercial products crafted by professional sound engineers.',
      'Every purchase includes a 100% royalty-free commercial license for lifetime use in your music.',
      'Stay subscribed to our VIP drop alerts or newsletter to be instantly notified whenever special promotional free packs or tools drop in the future.',
    ],
    tags: ['are they free', 'free', 'free plugins', 'free samples', 'cost', 'price', 'pricing', 'charge', 'money', 'free download', 'hidden fees', 'zero cost', 'free tools', 'free music production tools'],
    actionCta: {
      label: 'Browse Store Catalog',
      href: '/store',
    },
  },
  {
    id: 'free-2',
    category: 'free_and_licensing',
    categoryLabel: 'Free & Royalties',
    question: 'Are sample packs and presets 100% royalty-free for commercial music releases?',
    shortAnswer: 'Yes, 100% royalty-free. You can use every sound, loop, and preset in commercial tracks released on Spotify, Apple Music, YouTube, TV, and radio without paying additional royalties.',
    detailedSteps: [
      'Every sample pack and preset collection sold or given for free on Producer Toy comes with an unlimited commercial license.',
      'You are legally cleared to monetize your music on streaming platforms, sell beats to artists, and use audio in sync/film licensing.',
      'The only restriction: You cannot re-distribute or re-sell the raw audio samples or preset files as your own standalone sound library.',
    ],
    tags: ['royalty free', 'commercial use', 'spotify', 'monetize', 'sell beats', 'youtube copyright', 'sync licensing', 'commercial rights', 'credits', 'copyright strike'],
    actionCta: {
      label: 'Read Full EULA & Licensing Terms',
      href: '/eula',
    },
  },
  {
    id: 'free-3',
    category: 'free_and_licensing',
    categoryLabel: 'Free & Royalties',
    question: 'Do I need to give credit or tag Producer Toy when I release a song?',
    shortAnswer: 'No, crediting Producer Toy is optional. You own 100% of your master recording and publishing rights.',
    detailedSteps: [
      'You do not need to list Producer Toy in your song titles, credits, or liner notes.',
      'Your productions are completely your own intellectual property.',
      'If you love our sounds, shouting us out on social media (@producertoy) is always appreciated, but never legally required!',
    ],
    tags: ['credit', 'tag', 'attribution', 'copyright', 'publishing rights', 'master rights', 'ownership'],
  },

  // 2. SERIAL KEYS & LICENSING
  {
    id: 'lic-1',
    category: 'serial_keys',
    categoryLabel: 'Serial Keys & iLok',
    question: 'Where can I find my purchased license serial key?',
    shortAnswer: 'Your license keys are automatically stored in your personal Producer Toy Library (/library) immediately upon checkout.',
    detailedSteps: [
      'Log into your account at producertoy.com.',
      'Click on "Account" in the top navigation or go directly to /library.',
      'Under the "Purchased Software" tab, locate your product.',
      'Click the "Copy Serial" button to copy the 16-to-24 character authorization code directly to your clipboard.',
      'A backup confirmation with your serial was also delivered to your registered email address.',
    ],
    tags: ['serial key', 'license key', 'activation code', 'where is my code', 'where is my serial', 'find license', 'lost serial', 'my library', 'product key'],
    actionCta: {
      label: 'Open My Library',
      href: '/library',
    },
  },
  {
    id: 'lic-2',
    category: 'serial_keys',
    categoryLabel: 'Serial Keys & iLok',
    question: 'On how many computers can I install and activate my plugin?',
    shortAnswer: 'Most audio developers allow 2 to 3 simultaneous personal machine activations (e.g. your studio desktop and laptop).',
    detailedSteps: [
      'Standard manufacturer licenses (FabFilter, Xfer, Arturia, Soundtoys, iZotope, Cableguys) permit activation on up to 2-3 machines owned by the same user.',
      'If you purchase a new studio computer or upgrade your motherboard, you can deactivate the old machine through the plugin vendor portal or iLok License Manager.',
      'For team or school licenses with 4+ seats, please contact us for enterprise multi-seat volume licensing.',
    ],
    tags: ['multiple computers', 'how many computers', 'machines', 'studio pc', 'laptop', 'activation limit', 'transfer machine', 'two computers', 'deactivate'],
  },
  {
    id: 'lic-3',
    category: 'serial_keys',
    categoryLabel: 'Serial Keys & iLok',
    question: 'Do I need a physical iLok USB dongle to use plugins?',
    shortAnswer: 'No physical USB dongle is required for 99% of modern plugins. Most support iLok Cloud or direct Machine Authorization.',
    detailedSteps: [
      'Modern plugin developers support "iLok Cloud" or "Machine Authorization" (host-based computer lock) via the free iLok License Manager app.',
      'You only need a free iLok user ID; no physical USB hardware stick needs to be purchased.',
      'Simply install the free iLok License Manager, log into your iLok account, click "Licenses" > "Redeem Activation Code", and drag the license onto your computer icon.',
    ],
    tags: ['ilok', 'usb dongle', 'physical usb', 'ilok cloud', 'machine authorization', 'pace antipiracy', 'dongle'],
  },

  // 3. DAW TROUBLESHOOTING
  {
    id: 'daw-1',
    category: 'daw_setup',
    categoryLabel: 'DAW Troubleshooting',
    question: 'FL Studio: My new VST3 / VST plugin is not showing up. How do I fix it?',
    shortAnswer: 'Perform a deep plugin rescan in FL Studio Plugin Manager with verify options checked.',
    detailedSteps: [
      'Open FL Studio, click "Options" in the top menu, and select "Manage plugins".',
      'In the left panel under "Plugin search paths", ensure "C:\\Program Files\\Common Files\\VST3" (Windows) or "/Library/Audio/Plug-Ins/VST3" (Mac) is listed.',
      'Under the "Scan Options" tab on the left, check BOTH "Rescan previously verified plugins" and "Verify plugins".',
      'Click "Find installed plugins" at the top left and wait for the scan to finish.',
      'Once complete, search for your plugin in the list, click the Checkmark or Star icon next to it to add it to your favorite plugins menu.',
    ],
    tags: ['fl studio', 'fl studio 21', 'fl studio 24', 'vst not showing', 'missing plugin', 'plugin manager', 'rescan', 'fruity loops', 'image line', 'dll', 'vst3 fl'],
  },
  {
    id: 'daw-2',
    category: 'daw_setup',
    categoryLabel: 'DAW Troubleshooting',
    question: 'Ableton Live: Plugin not appearing in the browser after installation.',
    shortAnswer: 'Force a full deep rescan by holding the Alt/Option key while clicking Rescan in Preferences.',
    detailedSteps: [
      'Open Ableton Live and open Preferences (Ctrl+, on Windows, Cmd+, on Mac).',
      'Select the "Plug-Ins" tab on the left.',
      'Ensure "Use VST3 Plug-In System Folders" is set to ON.',
      'If on Mac, also make sure "Use Audio Units v2" and "Use Audio Units v3" are set to ON.',
      'CRITICAL TRICK: Hold down the ALT key (Windows) or OPTION key (macOS) on your keyboard, and click the "Rescan" button.',
      'Holding Alt forces Ableton to clear its plugin cache and scan every .vst3 and .component file from scratch.',
    ],
    tags: ['ableton', 'ableton live', 'live 11', 'live 12', 'rescan ableton', 'alt rescan', 'audio units', 'vst3 folder', 'ableton plugin missing'],
  },
  {
    id: 'daw-3',
    category: 'daw_setup',
    categoryLabel: 'DAW Troubleshooting',
    question: 'Logic Pro: "Audio Unit plugin could not be opened" or Gatekeeper security prompt.',
    shortAnswer: 'Reset & Rescan the plugin in Logic Plug-in Manager and permit Gatekeeper access in macOS System Settings.',
    detailedSteps: [
      'In Logic Pro, click "Logic Pro" in the top menu bar > "Settings" > "Plug-in Manager".',
      'Filter by manufacturer or search your plugin name in the top right.',
      'Select the plugin row, click "Reset & Rescan Selection" at the bottom.',
      'If macOS shows a security pop-up ("cannot verify developer"), open Apple System Settings > "Privacy & Security", scroll to Security, and click "Open Anyway".',
      'Restart Logic Pro.',
    ],
    tags: ['logic pro', 'logic', 'audio unit', 'au validation', 'gatekeeper', 'open anyway', 'plug-in manager', 'macos security'],
  },
  {
    id: 'daw-4',
    category: 'daw_setup',
    categoryLabel: 'DAW Troubleshooting',
    question: 'Standard VST3 & VST installation directory paths on Windows & Mac.',
    shortAnswer: 'Standard directories where all industry standard VST3 plugins must be installed.',
    detailedSteps: [
      'Windows VST3 (Fixed Standard): C:\\Program Files\\Common Files\\VST3',
      'Windows VST2 (64-bit): C:\\Program Files\\VstPlugins or C:\\Program Files\\Steinberg\\VstPlugins',
      'macOS VST3: /Library/Audio/Plug-Ins/VST3',
      'macOS Audio Units (AU): /Library/Audio/Plug-Ins/Components',
      'macOS AAX (Pro Tools): /Library/Application Support/Avid/Audio/Plug-Ins',
    ],
    tags: ['installation path', 'vst folder', 'where to install vst', 'vst3 directory', 'vstplugins', 'common files', 'components folder'],
  },

  // 4. DOWNLOADS & CDN
  {
    id: 'dl-1',
    category: 'downloads',
    categoryLabel: 'Downloads & CDN',
    question: 'My download failed, interrupted, or is slow. How do I resume?',
    shortAnswer: 'Producer Toy provides high-speed Google Cloud CDN mirrors with resume capability in your Library.',
    detailedSteps: [
      'Go to /library and click the "Download" button next to your product to refresh your secure high-speed CDN token.',
      'Avoid refreshing during active file streaming.',
      'For multi-gigabyte sample libraries (10GB+), we strongly recommend using a download manager such as Free Download Manager or JDownloader.',
      'Ensure you have at least 2.5x the file size available on your SSD/HDD for uncompressed extraction.',
    ],
    tags: ['download failed', 'slow download', 'interrupted', 'resume download', 'cdn', 'download link expired', 'server error', 'stuck download'],
    actionCta: {
      label: 'Go to Downloads Library',
      href: '/library',
    },
  },
  {
    id: 'dl-2',
    category: 'downloads',
    categoryLabel: 'Downloads & CDN',
    question: 'How do I extract .ZIP or .RAR sample packs without corruption?',
    shortAnswer: 'Use dedicated archive tools like 7-Zip (Windows) or The Unarchiver / Keka (Mac).',
    detailedSteps: [
      'On Windows: Right click the .zip file > choose 7-Zip or WinRAR > "Extract to [Folder Name]". Avoid Windows default zip utility for nested paths exceeding 260 characters.',
      'On macOS: Download "The Unarchiver" (free from Mac App Store) or "Keka" to avoid hidden .DS_Store file errors.',
      'Once extracted, drag and drop the folder directly into your DAW browser (FL Studio Browser, Ableton Places, or Logic Bookmark).',
    ],
    tags: ['extract zip', 'rar', 'unzip', 'corrupted archive', '7zip', 'winrar', 'the unarchiver', 'keka', 'checksum error'],
  },

  // 5. BILLING & INVOICES
  {
    id: 'bill-1',
    category: 'billing_invoices',
    categoryLabel: 'Orders & Invoices',
    question: 'How do I download my GST / VAT tax invoice for accounting?',
    shortAnswer: 'Invoices are available for instant 1-click PDF download inside Account Settings > Transactions.',
    detailedSteps: [
      'Log into Producer Toy and navigate to /account?tab=transactions.',
      'Locate your purchase order in the billing history table.',
      'Click "Download Invoice" or "View Receipt".',
      'The generated PDF includes your legal invoice number, timestamp, itemized software licenses, and registered tax details.',
    ],
    tags: ['invoice', 'tax', 'gst', 'vat', 'receipt', 'bill', 'business expense', 'download invoice', 'tax invoice'],
    actionCta: {
      label: 'View Invoices & Orders',
      href: '/account?tab=transactions',
    },
  },
  {
    id: 'bill-2',
    category: 'billing_invoices',
    categoryLabel: 'Orders & Invoices',
    question: 'What payment methods does Producer Toy support?',
    shortAnswer: 'We support all major payment networks: UPI, Credit & Debit Cards, NetBanking, International Cards, PayPal, and Virtual Cash.',
    detailedSteps: [
      'UPI: Instant QR code and intent payments via Google Pay, PhonePe, Paytm, CRED, and BHIM.',
      'Cards: Visa, MasterCard, American Express, Rupay (domestic & international).',
      'Net Banking: Over 50+ commercial banks supported.',
      'PayPal & Global: Worldwide payments processed in USD, EUR, GBP, and INR with zero conversion fees.',
      'Producer Toy Virtual Cash: Earned loyalty credits can be applied at checkout for 100% discount.',
    ],
    tags: ['payment methods', 'upi', 'gpay', 'phonepe', 'credit card', 'debit card', 'paypal', 'virtual cash', 'net banking', 'currency'],
  },
  {
    id: 'bill-3',
    category: 'billing_invoices',
    categoryLabel: 'Orders & Invoices',
    question: 'Money was deducted from my account, but my order is pending or not showing.',
    shortAnswer: 'Payment gateways occasionally take 2 to 5 minutes to send the webhook confirmation. If it does not appear, contact us with your transaction reference.',
    detailedSteps: [
      'Check your email: You will receive an automated confirmation the instant the bank webhook reconciles.',
      'Check your banking app for a transaction ID (UTR / RRN / Razorpay Payment ID).',
      'If after 10 minutes your library has not populated, submit a ticket below with your payment ID and our support desk will manually link your order within minutes.',
    ],
    tags: ['money deducted', 'order pending', 'failed payment', 'utr', 'rrn', 'bank debited', 'payment processing', 'missing order'],
  },

  // 6. REFUND POLICY
  {
    id: 'ref-1',
    category: 'refunds',
    categoryLabel: 'Refund Policy',
    question: 'What is the refund and cancellation policy on Producer Toy?',
    shortAnswer: 'Digital downloads and sample packs are non-refundable once delivered, except for unresolvable technical defects or accidental duplicate charges.',
    detailedSteps: [
      'Digital Download Nature: All sound packs, drum kits, presets, and audio software are irrevocable digital assets. Once access is provisioned, completed purchases are non-refundable.',
      'Change of Mind Excluded: Deciding you no longer want the product or subjective dissatisfaction does not qualify for a refund. Please preview the audio demos on the store page before purchasing.',
      'Defective File Guarantee: If an archive is damaged or corrupted during download and our engineering team cannot resolve it within our SLA, an alternate mirror or full refund/credit is issued.',
      'Accidental Duplicate Purchases: If you accidentally purchased the exact same item twice on the same account, contact our support team with your order number for an immediate resolution.',
    ],
    tags: ['refund', 'money back', 'return', 'cancel', 'accidental purchase', 'refund policy', 'duplicate charge', 'cancellation', 'money refund'],
    actionCta: {
      label: 'Read Full Refund Policy',
      href: '/refund-policy',
    },
  },
  {
    id: 'ref-2',
    category: 'refunds',
    categoryLabel: 'Refund Policy',
    question: 'What if I don\'t like a product after purchasing? Can I get a refund?',
    shortAnswer: 'As per our Refund Policy, digital products are non-refundable for change of mind or personal dislike. We strongly advise checking the playable audio demos before purchasing.',
    detailedSteps: [
      'Digital Media Terms: Because digital audio files, samples, and presets cannot be physically returned or revoked once delivered, completed purchases are strictly non-refundable for change of mind or personal sound preference.',
      'Always Preview Demos First: Every product on Producer Toy includes high-quality audio demos, stem previews, and detailed sample counts so you can audition the sound quality before making a purchase.',
      'Defective or Corrupted Files: If a downloaded archive is corrupted, damaged, or incomplete and our technical team cannot fix it within our SLA, a full replacement or refund is provided.',
      'Support Assistance: If you experienced an accidental duplicate purchase or need technical assistance with a sample pack, reach out to our support desk.',
    ],
    tags: [
      'dont like product',
      'dont like it',
      'what if i dont like a product',
      'not satisfied',
      'change of mind',
      'sound quality not good',
      'not what i expected',
      'doesnt fit my project',
      'dislike',
      'can i return',
      'return policy',
      'check demo',
      'preview before buying',
      'dont like sound'
    ],
    actionCta: {
      label: 'Read Refund Policy',
      href: '/refund-policy',
    },
  },

  // 7. APPLE SILICON & HARDWARE
  {
    id: 'hw-1',
    category: 'hardware_apple',
    categoryLabel: 'Apple Silicon & OS',
    question: 'Are plugins compatible with Apple Silicon M1 / M2 / M3 / M4 and macOS Sequoia?',
    shortAnswer: 'Yes, modern plugins on Producer Toy run natively on Apple Silicon ARM64 chips and macOS Sonoma / Sequoia.',
    detailedSteps: [
      'Every product page features a "System Requirements" tab displaying whether the plugin is Native Apple Silicon (ARM) or requires Rosetta 2 translation.',
      'Native ARM plugins run with exceptional CPU efficiency and low latency in modern DAWs like Logic Pro 11, Ableton Live 12, and FL Studio.',
      'If you have an older plugin build, you can right-click your DAW app icon in Finder > "Get Info" > check "Open using Rosetta" as a temporary compatibility mode.',
    ],
    tags: ['apple silicon', 'm1', 'm2', 'm3', 'm4', 'macos sequoia', 'macos sonoma', 'arm64', 'rosetta', 'mac compatibility', 'apple mac'],
  },
  {
    id: 'hw-2',
    category: 'hardware_apple',
    categoryLabel: 'Apple Silicon & OS',
    question: 'Minimum system requirements for running high-end VSTs and sample libraries.',
    shortAnswer: 'Recommended minimum: 64-bit OS (Windows 10/11 or macOS 12+), 8GB-16GB RAM, and SSD storage.',
    detailedSteps: [
      'Operating System: 64-bit Windows 10/11 or macOS 12 Monterey, 13 Ventura, 14 Sonoma, or 15 Sequoia.',
      'RAM: 8GB minimum; 16GB+ recommended for large multi-sample instruments (Kontakt, Omnisphere, Spitfire).',
      'Storage: Fast NVMe or SATA SSD is strongly recommended for seamless streaming of high-resolution 24-bit 48kHz WAV audio samples without playback stutter.',
    ],
    tags: ['system requirements', 'specs', 'ram', 'cpu', 'ssd', 'windows 11', 'hardware', 'specifications'],
  },

  // 8. ACCOUNT & SECURITY
  {
    id: 'acc-1',
    category: 'account',
    categoryLabel: 'Account & Security',
    question: 'How do I change my registered email address or update my profile?',
    shortAnswer: 'You can update your personal profile in Account Settings; for primary email sync, submit a quick support ticket.',
    detailedSteps: [
      'Navigate to Account Settings (/account).',
      'Under the "Profile" tab, you can update your display name, producer alias, and phone number.',
      'Because software licenses and developer activations are legally mapped to your primary email address, changing email requires a quick ownership verification via our support desk.',
    ],
    tags: ['change email', 'update profile', 'edit name', 'account settings', 'reset email', 'account details'],
    actionCta: {
      label: 'Open Account Settings',
      href: '/account',
    },
  },
  {
    id: 'acc-2',
    category: 'account',
    categoryLabel: 'Account & Security',
    question: 'How do I enable Two-Factor Authentication (2FA) for my Library?',
    shortAnswer: 'Enable 2FA in Account > Security to protect your library and digital licenses.',
    detailedSteps: [
      'Go to /account?tab=security.',
      'Under "Two-Factor Authentication", click "Enable 2FA".',
      'Scan the generated QR code using Google Authenticator, Authy, or 1Password.',
      'Enter the 6-digit verification code to lock your vault.',
    ],
    tags: ['2fa', 'two factor', 'security', 'authenticator', 'protect library', 'hack', 'password'],
    actionCta: {
      label: 'Security Settings',
      href: '/account?tab=security',
    },
  },
]
