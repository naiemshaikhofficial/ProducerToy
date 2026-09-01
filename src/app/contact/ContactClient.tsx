'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Send, CheckCircle2, ArrowLeft, Building2, ShieldCheck, Mail, Clock, MapPin, Headphones, ArrowRight, Search } from 'lucide-react'
import { submitContactFormAction } from '@/actions/contactActions'

export function ContactClient() {
  const [submitted, setSubmitted] = useState(false)
  const [serverMsg, setServerMsg] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderId: '',
    subject: 'Order & Download Support',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = new FormData()
    payload.append('name', formData.name)
    payload.append('email', formData.email)
    payload.append('subject', formData.subject)
    payload.append('message', formData.message)

    const res = await submitContactFormAction(payload)
    if (res.success) {
      setServerMsg(res.message)
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white py-14 px-6 sm:px-10 lg:px-16 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back Link & Minimal Header */}
        <div className="space-y-4 pb-6 border-b border-zinc-800/60">
          <Link
            href="/"
            prefetch={true}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FA742B] tracking-wider uppercase">
              Customer Support &amp; Grievance Redressal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Customer Care &amp; Technical Support
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Need assistance with license keys, downloads, billing, or DAW troubleshooting? We are here to help.
            </p>
          </div>
        </div>

        {/* Support Center Quick Banner */}
        <div className="bg-[#161618] border border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0">
              <Headphones size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Looking for faster resolution?</h3>
              <p className="text-xs text-zinc-400">
                Browse our instant FAQs or raise &amp; track a formal engineering ticket.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
            <Link
              href="/support"
              prefetch={true}
              className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Search size={13} />
              <span>Help Center</span>
            </Link>
            <Link
              href="/support?tab=track"
              prefetch={true}
              className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
            >
              <span>Track Ticket</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {submitted ? (
          <div className="bg-[#181818] border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-[#251b14] border border-[#fa742b]/30 rounded-full flex items-center justify-center mx-auto text-[#fa742b]">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Message Received</h2>
            <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
              {serverMsg || 'Thank you for reaching out! Our support team typically responds within 2–6 hours.'}
            </p>
            <div className="pt-4">
              <Link
                href="/store"
                prefetch={true}
                className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3 px-6 rounded-full uppercase transition-all shadow-lg inline-block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#181818] border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-6 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Full Name <span className="text-[#fa742b]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#fa742b] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Email Address <span className="text-[#fa742b]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. producer@gmail.com"
                  className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#fa742b] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Order / Invoice Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  placeholder="e.g. PT-M82..."
                  className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#fa742b] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Subject Category <span className="text-[#fa742b]">*</span>
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#fa742b] transition-colors cursor-pointer"
                >
                  <option value="Order & Download Support">Order & Download Support</option>
                  <option value="Toywards Loyalty Points">Toywards Loyalty Points Inquiry</option>
                  <option value="Serial Key Issue">Serial / License Key Issue</option>
                  <option value="Creator & Partnership">Creator & Sound Designer Partnership</option>
                  <option value="Billing & Refund">Billing or Refund Request</option>
                  <option value="Other">Other Inquiry</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Message & Details <span className="text-[#fa742b]">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe your query or issue in detail..."
                className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#fa742b] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-[#fa742b] hover:bg-[#e05800] text-white font-extrabold text-xs py-3.5 px-8 rounded-xl uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={16} />
              <span>Send Message</span>
            </button>
          </form>
        )}

        {/* Merchant Statutory & Grievance Information Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/60 text-xs text-zinc-300">
          
          {/* Box 1: Registered Merchant Entity */}
          <div className="bg-[#181818] border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Building2 size={16} className="text-[#fa742b]" />
              <span>Registered Business Details</span>
            </div>
            <div className="space-y-2 text-zinc-400">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
                <span><strong>Address:</strong> Producer Toy Studios, Sangamner, Maharashtra - 422605, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-zinc-500 flex-shrink-0" />
                <span><strong>Support Email:</strong> <a href="mailto:support@producertoy.com" className="text-[#fa742b] hover:underline">support@producertoy.com</a></span>
              </p>
              <p className="flex items-center gap-2">
                <Clock size={14} className="text-zinc-500 flex-shrink-0" />
                <span><strong>Support Hours:</strong> Mon–Sat (9:00 AM – 8:00 PM IST)</span>
              </p>
            </div>
          </div>

          {/* Box 2: Statutory Grievance & Nodal Officer */}
          <div className="bg-[#181818] border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck size={16} className="text-[#fa742b]" />
              <span>Grievance Redressal (RBI &amp; IT Act)</span>
            </div>
            <div className="space-y-2 text-zinc-400">
              <p>
                <strong>Grievance / Nodal Officer:</strong> Compliance Officer, Producer Toy
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-zinc-500 flex-shrink-0" />
                <span><strong>Grievance Email:</strong> <a href="mailto:grievance@producertoy.com" className="text-[#fa742b] hover:underline">grievance@producertoy.com</a></span>
              </p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                In compliance with Consumer Protection Rules 2020 and RBI Payment Aggregator Directions, grievances are acknowledged within 24 hours and resolved within <strong>D+4 business days</strong>.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
