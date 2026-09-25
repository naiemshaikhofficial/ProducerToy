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
import { FORMS_CONFIG } from '@/config/forms'

interface RaiseTicketFormProps {
  initialEmail?: string
  initialName?: string
  initialSubject?: string
  initialDescription?: string
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

export function RaiseTicketForm({
  initialEmail = '',
  initialName = '',
  initialSubject = '',
  initialDescription = '',
  onTicketCreated,
}: RaiseTicketFormProps) {
  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    category: 'Order & Payment Support',
    priority: 'NORMAL',
    orderId: '',
    osPlatform: 'Windows 11 (64-bit)',
    daw: 'FL Studio 21 / 24',
    subject: initialSubject,
    description: initialDescription,
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
      // 1. Create ticket in Supabase database & get ticket number
      const res = await createSupportTicketAction(formData)
      if (res.success && res.ticketNumber) {
        const ticketNum = res.ticketNumber
        setCreatedTicket({
          ticketNumber: ticketNum,
          email: formData.email.trim(),
        })

        if (onTicketCreated) {
          onTicketCreated(ticketNum, formData.email.trim())
        }

        // 2. Programmatically dispatch to FormSubmit endpoint to deliver email to support@producertoy.com and autoresponse copy to customer
        try {
          const origin = typeof window !== 'undefined' ? window.location.origin : FORMS_CONFIG.SITE_URL
          const nextUrl = `${origin}/support?tab=track&ticket=${encodeURIComponent(ticketNum)}&email=${encodeURIComponent(formData.email.trim())}`

          const fsForm = document.createElement('form')
          fsForm.action = `https://formsubmit.co/${FORMS_CONFIG.SUPPORT_EMAIL}`
          fsForm.method = 'POST'
          fsForm.style.display = 'none'

          const fields: Record<string, string> = {
            'Ticket Number': ticketNum,
            'Customer Name': formData.name.trim(),
            'email': formData.email.trim(),
            '_replyto': formData.email.trim(),
            'Category': formData.category,
            'Priority': formData.priority,
            'Order ID': formData.orderId?.trim() || 'N/A',
            'OS Platform': formData.osPlatform,
            'DAW': formData.daw,
            'Subject': formData.subject.trim(),
            'Description': formData.description.trim(),
            '_subject': `[Producer Toy Support] Ticket ${ticketNum}: ${formData.subject.trim()}`,
            '_template': 'table',
            '_captcha': 'false',
            '_autoresponse': `Hello ${formData.name.trim()},\n\nYour support ticket has been received!\n\nTicket Code: ${ticketNum}\nSubject: ${formData.subject.trim()}\nCategory: ${formData.category}\n\nOur audio engineering team is reviewing your ticket and will respond within 2–4 hours.\nYou can track real-time ticket progress at:\n${nextUrl}\n\nProducer Toy Support Desk\nhttps://producertoy.com/support`,
            '_next': nextUrl,
          }

          Object.entries(fields).forEach(([key, val]) => {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = val
            fsForm.appendChild(input)
          })

          document.body.appendChild(fsForm)
          fsForm.submit()
          return
        } catch (fsErr) {
          console.warn('[RaiseTicketForm] FormSubmit submission notice:', fsErr)
        }
      } else {
        setErrorMessage(res.error || 'Failed to submit ticket. Please check your details.')
        setLoading(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected network error occurred.')
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
      <div className="bg-[#161618] border border-zinc-800 rounded-2xl p-8 sm:p-10 text-center space-y-5 shadow-xl max-w-xl mx-auto">
        <div className="w-12 h-12 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center mx-auto text-zinc-200">
          <CheckCircle2 size={28} />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ticket Submitted</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">We&apos;ve Received Your Request</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Your inquiry has been assigned to our audio support desk. Average resolution turnaround is within <strong>2–4 hours</strong>.
          </p>
        </div>

        {/* Ticket Reference Code Badge */}
        <div className="bg-[#111113] border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-sm mx-auto">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">Ticket Reference ID</span>
            <span className="text-base font-mono font-bold text-white tracking-wider">
              {createdTicket.ticketNumber}
            </span>
          </div>
          <button
            onClick={handleCopyTicket}
            className="flex items-center gap-1.5 bg-[#202023] hover:bg-[#28282c] text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-zinc-700/60"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          {onTicketCreated && (
            <button
              onClick={() => onTicketCreated(createdTicket.ticketNumber, createdTicket.email)}
              className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-bold text-xs py-2.5 px-5 rounded-xl uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search size={13} />
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
            className="w-full sm:w-auto bg-[#202023] hover:bg-[#28282c] text-zinc-300 hover:text-white font-semibold text-xs py-2.5 px-5 rounded-xl uppercase tracking-wider transition-all border border-zinc-700/70 cursor-pointer"
          >
            Submit Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#161618] border border-zinc-800/90 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
          <FileText size={16} />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Open a Support Ticket</h3>
          <p className="text-xs text-zinc-400">
            Provide technical details for prompt diagnosis.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-950/30 border border-rose-900/60 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Row 1: Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className="w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="producer@example.com"
            className="w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      {/* Row 2: Category & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={12} className="text-zinc-400" />
            <span>Category</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
          >
            {ISSUE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#161618] text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert size={12} className="text-zinc-400" />
            <span>Priority</span>
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
          >
            <option value="LOW" className="bg-[#161618] text-white">Low — General inquiry</option>
            <option value="NORMAL" className="bg-[#161618] text-white">Normal — Standard request</option>
            <option value="HIGH" className="bg-[#161618] text-white">High — Activation/download blocked</option>
            <option value="URGENT" className="bg-[#161618] text-white">Urgent — Live session blocker</option>
          </select>
        </div>
      </div>

      {/* Row 3: OS & DAW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Laptop size={12} className="text-zinc-400" />
            <span>Operating System</span>
          </label>
          <select
            name="os_platform"
            value={formData.osPlatform}
            onChange={(e) => setFormData({ ...formData, osPlatform: e.target.value })}
            className="w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
          >
            {OS_OPTIONS.map((os) => (
              <option key={os} value={os} className="bg-[#161618] text-white">
                {os}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Music2 size={12} className="text-zinc-400" />
            <span>DAW</span>
          </label>
          <select
            name="daw"
            value={formData.daw}
            onChange={(e) => setFormData({ ...formData, daw: e.target.value })}
            className="w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
          >
            {DAW_OPTIONS.map((daw) => (
              <option key={daw} value={daw} className="bg-[#161618] text-white">
                {daw}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: Order ID & Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Order ID (Optional)
          </label>
          <input
            type="text"
            name="order_id"
            value={formData.orderId}
            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
            placeholder="PT-ORD-XXXXX"
            className="w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Brief summary of the issue..."
            className="w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      {/* Row 5: Detailed Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Details &amp; Error Description
        </label>
        <textarea
          name="description"
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what occurred, steps to reproduce, or link error screenshots..."
          className="w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-zinc-500">
          Our support desk will reply directly to your email.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-extrabold text-xs py-3 px-6 rounded-xl uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          {loading ? (
            <span>Submitting...</span>
          ) : (
            <>
              <Send size={13} />
              <span>Submit Ticket</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
