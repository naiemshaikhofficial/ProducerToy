'use client'

import React, { useState } from 'react'
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  Laptop,
  Music2,
  FileText,
  Tag,
  ShieldAlert,
} from 'lucide-react'
import { createSupportTicketAction } from '@/actions/supportActions'

interface RaiseTicketFormProps {
  initialEmail?: string
  initialName?: string
  onTicketCreated?: (ticketNumber: string, email: string) => void
}

const ISSUE_CATEGORIES = [
  'Order & Payment Support',
  'License Key & Activation Issue',
  'Download Link Broken / Missing Files',
  'DAW Compatibility & Crash Troubleshooting',
  'Refund & Cancellation Request',
  'Account & Security Inquiry',
  'Sound Designer / Vendor Partnership',
  'General Inquiry',
]

const OS_OPTIONS = [
  'Windows 11 (64-bit)',
  'Windows 10 (64-bit)',
  'macOS Sequoia (Apple Silicon M1-M4)',
  'macOS Sonoma (Apple Silicon / Intel)',
  'macOS Ventura / Monterey',
  'macOS Intel Legacy',
  'Linux',
  'Other / Multiple Devices',
]

const DAW_OPTIONS = [
  'FL Studio 21 / 24',
  'Ableton Live 11 / 12',
  'Logic Pro (macOS)',
  'Steinberg Cubase / Nuendo',
  'PreSonus Studio One',
  'Avid Pro Tools',
  'Cockos REAPER',
  'Bitwig Studio',
  'Universal Audio LUNA',
  'Reason Studios',
  'GarageBand',
  'Other / Standalone VST',
]

export function RaiseTicketForm({ initialEmail = '', initialName = '', onTicketCreated }: RaiseTicketFormProps) {
  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    category: 'Order & Payment Support',
    priority: 'NORMAL',
    orderId: '',
    osPlatform: 'Windows 11 (64-bit)',
    daw: 'FL Studio 21 / 24',
    subject: '',
    description: '',
  })

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [createdTicket, setCreatedTicket] = useState<{ ticketNumber: string; email: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const res = await createSupportTicketAction(formData)
      if (res.success && res.ticketNumber) {
        setCreatedTicket({
          ticketNumber: res.ticketNumber,
          email: formData.email.trim(),
        })
      } else {
        setErrorMessage(res.error || 'Failed to submit ticket. Please check your details.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected network error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyTicket = () => {
    if (createdTicket?.ticketNumber) {
      navigator.clipboard.writeText(createdTicket.ticketNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (createdTicket) {
    return (
      <div className="bg-[#181818] border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-[#251b14] border border-[#FA742B]/40 rounded-full flex items-center justify-center mx-auto text-[#FA742B]">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#FA742B] tracking-wider uppercase">Ticket Submitted</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">We&apos;ve Received Your Request</h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto leading-relaxed">
            Your ticket has been prioritized and assigned to our technical audio engineering desk. We strive to reply within <strong>2 to 4 hours</strong>.
          </p>
        </div>

        {/* Ticket Reference Code Badge */}
        <div className="bg-[#121212] border border-zinc-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-md mx-auto">
          <div className="text-left">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold block">Your Ticket Reference ID</span>
            <span className="text-lg font-mono font-bold text-white tracking-widest text-[#FA742B]">
              {createdTicket.ticketNumber}
            </span>
          </div>
          <button
            onClick={handleCopyTicket}
            className="flex items-center gap-2 bg-[#202025] hover:bg-[#2a2a30] text-zinc-300 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-zinc-700/50"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onTicketCreated && (
            <button
              onClick={() => onTicketCreated(createdTicket.ticketNumber, createdTicket.email)}
              className="w-full sm:w-auto bg-[#FA742B] hover:bg-[#E05A18] text-white font-extrabold text-xs py-3 px-6 rounded-xl uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search size={14} />
              <span>Track Ticket Status</span>
            </button>
          )}
          <button
            onClick={() => {
              setCreatedTicket(null)
              setFormData({
                name: initialName,
                email: initialEmail,
                category: 'Order & Payment Support',
                priority: 'NORMAL',
                orderId: '',
                osPlatform: 'Windows 11 (64-bit)',
                daw: 'FL Studio 21 / 24',
                subject: '',
                description: '',
              })
            }}
            className="w-full sm:w-auto bg-[#202020] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white font-bold text-xs py-3 px-6 rounded-xl uppercase tracking-wider transition-all border border-zinc-700 cursor-pointer"
          >
            Submit Another Ticket
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#181818] border border-zinc-800/80 rounded-2xl p-6 sm:p-10 space-y-6 shadow-2xl"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
        <div className="w-10 h-10 rounded-xl bg-[#251b14] border border-[#FA742B]/30 flex items-center justify-center text-[#FA742B]">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Raise a Technical Support Ticket</h3>
          <p className="text-xs text-zinc-400">
            Submit your issue with technical specifics for faster resolution.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex items-center gap-3 text-xs sm:text-sm text-rose-200">
          <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Row 1: Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Your Full Name <span className="text-[#FA742B]">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. John Doe"
            className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FA742B] transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Registered Email Address <span className="text-[#FA742B]">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. producer@domain.com"
            className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FA742B] transition-colors"
          />
        </div>
      </div>

      {/* Row 2: Category & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={13} className="text-[#FA742B]" />
            <span>Issue Category <span className="text-[#FA742B]">*</span></span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FA742B] transition-colors cursor-pointer"
          >
            {ISSUE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#141414] text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert size={13} className="text-[#FA742B]" />
            <span>Priority Level</span>
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FA742B] transition-colors cursor-pointer"
          >
            <option value="LOW" className="bg-[#141414] text-white">Low — General question / feedback</option>
            <option value="NORMAL" className="bg-[#141414] text-white">Normal — Standard request</option>
            <option value="HIGH" className="bg-[#141414] text-white">High — Cannot download or activate</option>
            <option value="URGENT" className="bg-[#141414] text-white">Urgent — Production blocker / Live session</option>
          </select>
        </div>
      </div>

      {/* Row 3: OS & DAW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Laptop size={13} className="text-[#FA742B]" />
            <span>Operating System</span>
          </label>
          <select
            value={formData.osPlatform}
            onChange={(e) => setFormData({ ...formData, osPlatform: e.target.value })}
            className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FA742B] transition-colors cursor-pointer"
          >
            {OS_OPTIONS.map((os) => (
              <option key={os} value={os} className="bg-[#141414] text-white">
                {os}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Music2 size={13} className="text-[#FA742B]" />
            <span>Digital Audio Workstation (DAW)</span>
          </label>
          <select
            value={formData.daw}
            onChange={(e) => setFormData({ ...formData, daw: e.target.value })}
            className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FA742B] transition-colors cursor-pointer"
          >
            {DAW_OPTIONS.map((daw) => (
              <option key={daw} value={daw} className="bg-[#141414] text-white">
                {daw}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: Order ID (Optional) & Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Order / Invoice # (Optional)
          </label>
          <input
            type="text"
            value={formData.orderId}
            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
            placeholder="e.g. PT-ORD-92812"
            className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FA742B] transition-colors"
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Subject Title <span className="text-[#FA742B]">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Brief summary of the issue (e.g. Serial key failed on Arturia portal)"
            className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FA742B] transition-colors"
          />
        </div>
      </div>

      {/* Row 5: Detailed Description */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Detailed Description &amp; Error Messages <span className="text-[#FA742B]">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Please describe what happened, steps you took, any exact error message strings or screenshot links (e.g. Imgur, Drive)..."
          className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FA742B] transition-colors resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-zinc-500">
          By submitting, you consent to our support technicians reviewing your order details.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-[#FA742B] hover:bg-[#E05A18] disabled:opacity-50 text-white font-extrabold text-xs py-3.5 px-8 rounded-xl uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          {loading ? (
            <span>Submitting...</span>
          ) : (
            <>
              <Send size={15} />
              <span>Submit Support Ticket</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
