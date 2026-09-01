'use client'

import React, { useState, useMemo } from 'react'
import { ChevronDown, Sparkles, HelpCircle, Layers, Key, Download, Laptop, ShieldCheck } from 'lucide-react'

export interface FAQItem {
  id: string
  category: 'orders' | 'licenses' | 'downloads' | 'daw' | 'account'
  question: string
  answer: string
  tags: string[]
}

const FAQ_DATA: FAQItem[] = [
  // Orders & Billing
  {
    id: 'ord-1',
    category: 'orders',
    question: 'How quickly will I receive my serial keys and download links after checkout?',
    answer:
      'All digital purchases are fulfilled instantly. Once your payment succeeds, your license keys, direct download links, and invoice are immediately generated in your Producer Toy Library (/library) and sent to your registered email.',
    tags: ['instant delivery', 'order confirmation', 'checkout', 'email receipt'],
  },
  {
    id: 'ord-2',
    category: 'orders',
    question: 'Where can I download my official tax invoice for business expense?',
    answer:
      'You can download GST / VAT compliant invoices anytime by logging into your account, navigating to "Account Settings" > "Transactions & Invoices", and clicking "Download Invoice" next to the order.',
    tags: ['invoice', 'tax', 'gst', 'receipt', 'business'],
  },
  {
    id: 'ord-3',
    category: 'orders',
    question: 'What is your refund policy for software plugins and sample packs?',
    answer:
      'Due to the digital nature of software activations, unlocked serial keys and sample libraries are generally non-refundable once claimed or unsealed. However, if a plugin has a verified technical defect that our technical team cannot resolve within 7 days, we issue a prompt replacement or refund.',
    tags: ['refund', 'return', 'money back', 'policy'],
  },
  {
    id: 'ord-4',
    category: 'orders',
    question: 'What payment methods are supported on Producer Toy?',
    answer:
      'We support all major payment options: UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, MasterCard, Rupay, Amex), Net Banking across 50+ banks, International Cards, PayPal, and Producer Toy Virtual Cash Wallet.',
    tags: ['payment', 'upi', 'cards', 'paypal', 'wallet'],
  },

  // Serial Keys & Licensing
  {
    id: 'lic-1',
    category: 'licenses',
    question: 'How do I retrieve or view my purchased license keys?',
    answer:
      'Visit your "My Library" page (/library) while logged in. Every purchased VST, instrument, or sample expansion displays its unique serial number along with a one-click "Copy Key" button and developer authorization portal link.',
    tags: ['serial key', 'license', 'retrieve', 'my library'],
  },
  {
    id: 'lic-2',
    category: 'licenses',
    question: 'On how many computers can I install and activate my plugin?',
    answer:
      'Most developer licenses (such as FabFilter, Xfer, Arturia, Output, Soundtoys, iZotope) allow installation on 2 to 3 personal machines (e.g. your studio desktop and laptop) under the same user. Check the specific manufacturer EULA on the product page for precise machine activations.',
    tags: ['multiple computers', 'activation limit', 'mac and pc', 'eula'],
  },
  {
    id: 'lic-3',
    category: 'licenses',
    question: 'Do I need an iLok USB dongle for activations?',
    answer:
      'Unless explicitly stated on the product specifications tab, virtually all modern plugins support machine authorization (iLok Cloud or direct Host License) without requiring a physical USB dongle.',
    tags: ['ilok', 'usb dongle', 'authorization', 'cloud'],
  },

  // Downloads & CDN
  {
    id: 'dl-1',
    category: 'downloads',
    question: 'My download was interrupted or is running slowly. How do I resume?',
    answer:
      'Producer Toy hosts high-speed Google Cloud CDN mirrors for all products. If a connection drops, simply click "Download" again in your Library. We strongly recommend using a download manager or stable broadband connection for multi-gigabyte sample libraries.',
    tags: ['slow download', 'interrupted download', 'cdn', 'resume download'],
  },
  {
    id: 'dl-2',
    category: 'downloads',
    question: 'How do I extract .ZIP or .RAR sample packs correctly?',
    answer:
      'On Windows, use the built-in "Extract All" or free tools like 7-Zip. On macOS, double-click the archive or use The Unarchiver to avoid corrupted stems or missing folder structures.',
    tags: ['extract zip', 'rar', 'unzip', 'sample pack folders'],
  },

  // DAW & Technical Setup
  {
    id: 'daw-1',
    category: 'daw',
    question: 'My new VST3 plugin is not showing up in FL Studio. What should I do?',
    answer:
      'In FL Studio, go to Options > Manage Plugins. Enable "Rescan previously verified plugins" and "Verify plugins", ensure "C:\\Program Files\\Common Files\\VST3" is in your search paths, then click "Find installed plugins".',
    tags: ['fl studio', 'vst scan', 'plugin missing', 'rescan'],
  },
  {
    id: 'daw-2',
    category: 'daw',
    question: 'How do I scan plugins in Ableton Live on macOS / Windows?',
    answer:
      'In Ableton Live, open Preferences (Cmd+, or Ctrl+,) > Plug-Ins. Toggle "Use VST3 Plug-In System Folders" to ON. Hold Alt/Option and click "Rescan" to force Ableton to perform a fresh deep scan of all audio units and VSTs.',
    tags: ['ableton live', 'rescan ableton', 'vst3 folder', 'au'],
  },
  {
    id: 'daw-3',
    category: 'daw',
    question: 'Is this plugin compatible with Apple Silicon M1 / M2 / M3 / M4 and macOS Sequoia?',
    answer:
      'All plugins listed on Producer Toy indicate Native Apple Silicon and macOS version compatibility in the System Requirements tab. Plugins run in 64-bit Native ARM or through Rosetta 2 depending on the build.',
    tags: ['apple silicon', 'm1', 'm2', 'm3', 'macos sequoia', 'arm64'],
  },
  {
    id: 'daw-4',
    category: 'daw',
    question: 'Logic Pro says "Audio Unit plugin could not be opened". How to fix?',
    answer:
      'Open Logic Pro > Settings > Plug-in Manager. Find the plugin, select it, and click "Reset & Rescan Selection". If prompted by macOS Gatekeeper, go to System Settings > Privacy & Security and click "Open Anyway".',
    tags: ['logic pro', 'audio unit', 'gatekeeper', 'plugin manager'],
  },

  // Account & Security
  {
    id: 'acc-1',
    category: 'account',
    question: 'How do I change my registered email address or account details?',
    answer:
      'Go to "Account Settings" (/account). Under "Personal Information", you can update your name and phone number. To change your primary email address for license synchronization, please raise a ticket or email support@producertoy.com.',
    tags: ['change email', 'profile settings', 'security'],
  },
  {
    id: 'acc-2',
    category: 'account',
    question: 'How can I enable Two-Factor Authentication (2FA) on my Producer Toy account?',
    answer:
      'Navigate to Account Settings > Security Tab (/account?tab=security). You can enable 2FA using Google Authenticator, Authy, or SMS verification for enhanced library security.',
    tags: ['2fa', 'two-factor authentication', 'security', 'password'],
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All FAQs', icon: Layers },
  { id: 'orders', label: 'Orders & Billing', icon: Sparkles },
  { id: 'licenses', label: 'License Keys & Serials', icon: Key },
  { id: 'downloads', label: 'Downloads & Installation', icon: Download },
  { id: 'daw', label: 'DAW & Troubleshooting', icon: Laptop },
  { id: 'account', label: 'Account & Security', icon: ShieldCheck },
]

interface FaqSectionProps {
  searchQuery: string
  onSelectRaiseTicket?: () => void
}

export function FaqSection({ searchQuery, onSelectRaiseTicket }: FaqSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['ord-1', 'lic-1', 'daw-1']))

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      if (!matchesCategory) return false

      if (!searchQuery?.trim()) return true

      const q = searchQuery.toLowerCase().trim()
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    })
  }, [selectedCategory, searchQuery])

  return (
    <div className="space-y-8">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-[#FA742B] border-[#FA742B] text-white shadow-lg shadow-[#FA742B]/20'
                  : 'bg-[#181818] border-[#28282e] text-zinc-400 hover:text-white hover:border-zinc-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* FAQs List */}
      {filteredFaqs.length === 0 ? (
        <div className="bg-[#181818] border border-zinc-800/80 rounded-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-zinc-800/60 border border-zinc-700 flex items-center justify-center mx-auto text-zinc-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No exact matching answers found</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Can&apos;t find what you&apos;re looking for? Our dedicated technical support engineering team is ready to help.
          </p>
          {onSelectRaiseTicket && (
            <div className="pt-2">
              <button
                onClick={onSelectRaiseTicket}
                className="bg-[#FA742B] hover:bg-[#E05A18] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Raise a Support Ticket
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.has(faq.id)
            return (
              <div
                key={faq.id}
                className={`bg-[#181818] border transition-all rounded-xl overflow-hidden ${
                  isOpen ? 'border-[#FA742B]/60 shadow-lg shadow-black/40' : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <button
                  onClick={() => toggleOpen(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-white tracking-tight flex items-start gap-3">
                    <span className="text-[#FA742B] font-mono text-xs mt-1">Q.</span>
                    <span>{faq.question}</span>
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-[#202025] flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#FA742B]' : 'text-zinc-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/40">
                    <div className="pl-6 pt-2 space-y-3">
                      <p>{faq.answer}</p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {faq.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-[#202025] border border-zinc-700/50 text-[10px] text-zinc-400 px-2 py-0.5 rounded-md uppercase font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
