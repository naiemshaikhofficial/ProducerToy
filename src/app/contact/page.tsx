'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Send, CheckCircle2, ArrowLeft } from 'lucide-react'
import { submitContactFormAction } from '@/actions/contactActions'

export default function ContactSupportPage() {
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
    <div className="min-h-screen bg-[#121212] text-white py-14 px-6 sm:px-10 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-10 font-sans">
        
        {/* Back Link & Minimal Header */}
        <div className="space-y-4 pb-6 border-b border-zinc-800/60">
          <Link
            href="/"
            prefetch={true}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Store
          </Link>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Help, Support & Statutory Grievance
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Customer Care Desk • Statutory Compliance under Indian IT Rules 2021 & E-Commerce Rules 2020
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-2">
          
          {/* Minimalist Form (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Submit a Support Request
            </h2>

            {submitted ? (
              <div className="py-8 text-left space-y-3">
                <CheckCircle2 className="w-8 h-8 text-[#FC6301]" />
                <h3 className="text-lg font-bold text-white">Support Ticket Submitted!</h3>
                <p className="text-xs text-zinc-400">
                  Thank you, <strong className="text-white">{formData.name}</strong>. Our support team has received your ticket and will respond to <span className="text-[#FC6301]">{formData.email}</span> within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs bg-[#202020] hover:bg-[#2c2c2c] text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#181818] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-[#FC6301] transition-colors outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="producer@example.com"
                      className="w-full bg-[#181818] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-[#FC6301] transition-colors outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Order ID (Optional)</label>
                    <input
                      type="text"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      placeholder="e.g. ORD-8921"
                      className="w-full bg-[#181818] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-[#FC6301] transition-colors outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Inquiry Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#181818] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-[#FC6301] transition-colors cursor-pointer outline-none"
                  >
                    <option value="Order & Download Support">Order & Instant Download Support</option>
                    <option value="License Activation Key Help">License Activation Key Help</option>
                    <option value="Technical VST Compatibility">Technical VST Incompatibility</option>
                    <option value="Creator / Distribution Inquiry">Distribute Sounds on Producer Toy</option>
                    <option value="Grievance Redressal">Statutory Grievance Redressal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Your Message / Problem Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your question or issue in detail..."
                    className="w-full bg-[#181818] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-[#FC6301] transition-colors outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FC6301] hover:bg-[#E05800] text-white font-extrabold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Ticket</span>
                </button>
              </form>
            )}
          </div>

          {/* Minimalist Info Side (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Direct Support */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white tracking-tight">
                Direct Contact Emails
              </h3>
              <div className="space-y-2 text-xs text-zinc-400">
                <p><strong className="text-zinc-200">Customer Support:</strong> <a href="mailto:support@producertoy.com" className="text-[#FC6301] hover:underline">support@producertoy.com</a></p>
                <p><strong className="text-zinc-200">Creators & Distribution:</strong> <a href="mailto:creators@producertoy.com" className="text-[#FC6301] hover:underline">creators@producertoy.com</a></p>
              </div>
            </div>

            {/* Indian Statutory Grievance Officer */}
            <div className="space-y-3 pt-6 border-t border-zinc-800/60">
              <h3 className="text-base font-bold text-white tracking-tight">
                Statutory Grievance Officer (India)
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pursuant to Rule 3(2) of the IT (Intermediary Guidelines) Rules, 2021 and Consumer Protection (E-Commerce) Rules, 2020:
              </p>
              
              <div className="space-y-1.5 text-xs text-zinc-400 pt-1 leading-relaxed">
                <p><strong className="text-zinc-200">Officer Name:</strong> Nodal Grievance Officer</p>
                <p><strong className="text-zinc-200">Entity:</strong> Producer Toy Pvt. Ltd.</p>
                <p><strong className="text-zinc-200">Address:</strong> Producer Toy Studios, Sangamner, Maharashtra - 422605, India</p>
                <p><strong className="text-zinc-200">Grievance Email:</strong> <a href="mailto:grievance@producertoy.com" className="text-[#FC6301] hover:underline font-bold">grievance@producertoy.com</a></p>
                <p><strong className="text-zinc-200">Acknowledgement:</strong> Within 24 hours</p>
                <p><strong className="text-zinc-200">Resolution Window:</strong> Max 15 business days</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
