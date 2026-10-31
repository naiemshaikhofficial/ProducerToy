'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Send, CheckCircle2, ArrowLeft, Building2, ShieldCheck, Mail, Clock, MapPin, Headphones, ArrowRight, Search, Loader2, ChevronDown, FileText } from 'lucide-react'
import { submitContactFormAction } from '@/actions/contactActions'
import { FORMS_CONFIG } from '@/config/forms'

export function ContactClient() {
  const searchParams = useSearchParams()
  const isSubmittedFromUrl = searchParams?.get('submitted') === 'true'

  const [submitted, setSubmitted] = useState(isSubmittedFromUrl)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nextUrl, setNextUrl] = useState(`${FORMS_CONFIG.SITE_URL}/contact?submitted=true`)

  const subjectQuery = (searchParams?.get('subject') || searchParams?.get('category') || '').toLowerCase()
  const isNewsQuery = subjectQuery.includes('news') || subjectQuery.includes('editorial')
  const articleParam = searchParams?.get('article')
  const urlParam = searchParams?.get('url')

  const cleanArticleName = articleParam
    ? articleParam.replace(/\s*[-–—]\s*(?:Producer\s*Toy|100%\s*Free.*).*$/i, '').trim() || articleParam
    : ''

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderId: '',
    subject: isNewsQuery ? 'News & Editorial Correction' : 'Order & Download Support',
    message: isNewsQuery && cleanArticleName
      ? `Regarding: ${cleanArticleName}\n\nSuggested Correction / Details:\n`
      : '',
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNextUrl(`${window.location.origin}/contact?submitted=true`)
    }
  }, [])

  useEffect(() => {
    if (searchParams?.get('submitted') === 'true') {
      setSubmitted(true)
    }

    const currentSubjectParam = (searchParams?.get('subject') || searchParams?.get('category') || '').toLowerCase()
    const currentArticle = searchParams?.get('article')
    const currentCleanArticle = currentArticle
      ? currentArticle.replace(/\s*[-–—]\s*(?:Producer\s*Toy|100%\s*Free.*).*$/i, '').trim() || currentArticle
      : ''

    if (currentSubjectParam.includes('news') || currentSubjectParam.includes('editorial')) {
      setFormData((prev) => ({
        ...prev,
        subject: 'News & Editorial Correction',
        message:
          prev.message ||
          (currentCleanArticle
            ? `Regarding: ${currentCleanArticle}\n\nSuggested Correction / Details:\n`
            : ''),
      }))
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    setIsSubmitting(true)
    // Non-blocking server action logging for internal audit
    try {
      const payload = new FormData()
      payload.append('name', formData.name)
      payload.append('email', formData.email)
      payload.append('subject', formData.subject)
      payload.append('message', formData.message)
      submitContactFormAction(payload).catch(() => {})
    } catch {
      // Ignored
    }
    // FormSubmit native POST proceeds to https://formsubmit.co/contact@producertoy.com
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
            <span className="text-xs font-bold text-zinc-200 tracking-wider uppercase">
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
          <div className="bg-[#181818] border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-2xl animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-[#251b14] border border-[#34363d]/30 rounded-full flex items-center justify-center mx-auto text-zinc-200">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Message Received</h2>
            <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
              Thank you for reaching out! A confirmation has been sent to your email. Our support team typically responds within 2–6 hours.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-3 px-5 rounded-full uppercase transition-all"
              >
                Send Another Message
              </button>
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
          <form
            action={`https://formsubmit.co/${FORMS_CONFIG.CONTACT_EMAIL}`}
            method="POST"
            onSubmit={handleSubmit}
            className="bg-[#181818] border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-6 shadow-2xl"
          >
            {/* FormSubmit Configuration Directives */}
            <input
              type="hidden"
              name="_subject"
              value={`[Producer Toy Contact] ${formData.subject} - ${formData.name || 'Inquiry'}`}
            />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_replyto" value={formData.email} />
            <input
              type="hidden"
              name="_autoresponse"
              value={`Thank you for contacting Producer Toy!\n\nWe have received your message regarding "${formData.subject}". A member of our support team will review your inquiry and reply to you directly within 2–6 hours.\n\nWarm regards,\nProducer Toy Support Team\nhttps://producertoy.com`}
            />
            <input type="hidden" name="_next" value={nextUrl} />
            {articleParam && <input type="hidden" name="article_reference" value={articleParam} />}
            {urlParam && <input type="hidden" name="article_url" value={urlParam} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Full Name <span className="text-zinc-200">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#111113] border border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Email Address <span className="text-zinc-200">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. producer@gmail.com"
                  className="w-full bg-[#111113] border border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600"
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
                  name="order_id"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  placeholder="e.g. PT-M82..."
                  className="w-full bg-[#111113] border border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Subject Category <span className="text-zinc-200">*</span>
                </label>
                <div className="relative">
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full appearance-none bg-[#111113] border border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Order & Download Support" className="bg-[#18181c] text-white">Order & Download Support</option>
                    <option value="Toywards Loyalty Points" className="bg-[#18181c] text-white">Toywards Loyalty Points Inquiry</option>
                    <option value="Serial Key Issue" className="bg-[#18181c] text-white">Serial / License Key Issue</option>
                    <option value="Creator & Partnership" className="bg-[#18181c] text-white">Creator & Sound Designer Partnership</option>
                    <option value="Billing & Refund" className="bg-[#18181c] text-white">Billing or Refund Request</option>
                    <option value="News & Editorial Correction" className="bg-[#18181c] text-white">News Article Correction / Editorial Report</option>
                    <option value="Other" className="bg-[#18181c] text-white">Other Inquiry</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {articleParam && (
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#141416] border border-white/[0.06] text-xs">
                <FileText size={14} className="text-zinc-400 shrink-0" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0">Reference:</span>
                <span className="text-zinc-200 font-medium truncate flex-1">{cleanArticleName || articleParam}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Message & Details <span className="text-zinc-200">*</span>
              </label>
              <textarea
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe your query or report in detail..."
                className="w-full bg-[#111113] border border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all resize-none placeholder:text-zinc-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-white hover:bg-zinc-200 disabled:opacity-60 text-black font-extrabold text-xs py-3.5 px-8 rounded-xl uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin text-black" /> : <Send size={16} className="text-black" />}
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        )}

        {/* Merchant Statutory & Grievance Information Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/60 text-xs text-zinc-300">
          
          {/* Box 1: Registered Merchant Entity */}
          <div className="bg-[#181818] border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Building2 size={16} className="text-zinc-200" />
              <span>Registered Business Details</span>
            </div>
            <div className="space-y-2 text-zinc-400">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
                <span><strong>Address:</strong> Producer Toy Studios, Sangamner, Maharashtra - 422605, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-zinc-500 flex-shrink-0" />
                <span><strong>Support Email:</strong> <a href="mailto:support@producertoy.com" className="text-zinc-200 hover:underline">support@producertoy.com</a></span>
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
              <ShieldCheck size={16} className="text-zinc-200" />
              <span>Grievance Redressal (RBI &amp; IT Act)</span>
            </div>
            <div className="space-y-2 text-zinc-400">
              <p>
                <strong>Grievance / Nodal Officer:</strong> Compliance Officer, Producer Toy
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-zinc-500 flex-shrink-0" />
                <span><strong>Grievance Email:</strong> <a href="mailto:legal@producertoy.com" className="text-zinc-200 hover:underline">legal@producertoy.com</a></span>
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
