'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  Key,
  Receipt,
  FileText,
  Clock,
  HelpCircle,
  ShieldCheck,
  Building2,
  Mail,
  MapPin,
  ArrowRight,
  Headphones,
} from 'lucide-react'
import { FaqSection } from '@/components/support/FaqSection'
import { RaiseTicketForm } from '@/components/support/RaiseTicketForm'
import { TrackTicketView } from '@/components/support/TrackTicketView'

function SupportClientInner() {
  const searchParams = useSearchParams()
  const initialTab = searchParams?.get('tab') || 'faq'
  const initialTicketParam = searchParams?.get('ticket') || ''
  const initialEmailParam = searchParams?.get('email') || ''

  const [activeTab, setActiveTab] = useState<'faq' | 'raise' | 'track'>(
    initialTab === 'raise-ticket' || initialTab === 'raise'
      ? 'raise'
      : initialTab === 'track-ticket' || initialTab === 'track' || initialTicketParam
      ? 'track'
      : 'faq'
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [trackTicketNum, setTrackTicketNum] = useState(initialTicketParam)
  const [trackEmail, setTrackEmail] = useState(initialEmailParam)

  useEffect(() => {
    const tabParam = searchParams?.get('tab')
    if (tabParam === 'raise' || tabParam === 'raise-ticket') {
      setActiveTab('raise')
    } else if (tabParam === 'track' || tabParam === 'track-ticket') {
      setActiveTab('track')
    }
  }, [searchParams])

  const handleTicketCreated = (num: string, mail: string) => {
    setTrackTicketNum(num)
    setTrackEmail(mail)
    setActiveTab('track')
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white py-10 sm:py-16 px-4 sm:px-8 lg:px-12 font-sans select-none">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Hero Header Section */}
        <div className="text-center space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold tracking-wider uppercase">
            <Headphones size={13} className="text-zinc-400" />
            <span>Support Desk</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            How can we help?
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Search answers for VST activation, DAW setup, order inquiries, or raise a ticket with our technical team.
          </p>

          {/* Minimal Search Bar */}
          <div className="max-w-2xl mx-auto relative pt-3">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-500 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (activeTab !== 'faq') {
                    setActiveTab('faq')
                  }
                }}
                placeholder="Search articles, DAW setups, serial keys, invoices..."
                className="w-full bg-[#181818] border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:bg-[#1a1a1a] transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 px-2 py-0.5 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Topic Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-[11px] text-zinc-400">
              <span className="text-zinc-600 font-medium">Quick links:</span>
              <button
                onClick={() => {
                  setSearchQuery('serial key')
                  setActiveTab('faq')
                }}
                className="hover:text-white transition-colors cursor-pointer text-zinc-400 underline underline-offset-2"
              >
                Serial Keys
              </button>
              <span className="text-zinc-800">•</span>
              <button
                onClick={() => {
                  setSearchQuery('FL Studio')
                  setActiveTab('faq')
                }}
                className="hover:text-white transition-colors cursor-pointer text-zinc-400 underline underline-offset-2"
              >
                FL Studio
              </button>
              <span className="text-zinc-800">•</span>
              <button
                onClick={() => {
                  setSearchQuery('invoice')
                  setActiveTab('faq')
                }}
                className="hover:text-white transition-colors cursor-pointer text-zinc-400 underline underline-offset-2"
              >
                Invoices
              </button>
              <span className="text-zinc-800">•</span>
              <button
                onClick={() => {
                  setSearchQuery('apple silicon')
                  setActiveTab('faq')
                }}
                className="hover:text-white transition-colors cursor-pointer text-zinc-400 underline underline-offset-2"
              >
                Apple Silicon
              </button>
            </div>
          </div>
        </div>

        {/* Minimal Self-Service Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            href="/library"
            prefetch={true}
            className="group bg-[#181818] hover:bg-[#1f1f23] border border-zinc-800/90 hover:border-zinc-700 rounded-xl p-4.5 transition-all space-y-2.5 shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-zinc-700 transition-colors">
              <Key size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-zinc-200 transition-colors flex items-center gap-1.5">
                <span>My Library &amp; Serials</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-zinc-400" />
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Access serial numbers &amp; installer downloads.
              </p>
            </div>
          </Link>

          <Link
            href="/account?tab=transactions"
            prefetch={true}
            className="group bg-[#181818] hover:bg-[#1f1f23] border border-zinc-800/90 hover:border-zinc-700 rounded-xl p-4.5 transition-all space-y-2.5 shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-zinc-700 transition-colors">
              <Receipt size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-zinc-200 transition-colors flex items-center gap-1.5">
                <span>Orders &amp; Invoices</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-zinc-400" />
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                View purchase history and tax receipts.
              </p>
            </div>
          </Link>

          <button
            onClick={() => setActiveTab('raise')}
            className={`group text-left border rounded-xl p-4.5 transition-all space-y-2.5 shadow-sm cursor-pointer ${
              activeTab === 'raise'
                ? 'bg-[#1f1f23] border-zinc-600'
                : 'bg-[#181818] hover:bg-[#1f1f23] border-zinc-800/90 hover:border-zinc-700'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-zinc-700 transition-colors">
              <FileText size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-zinc-200 transition-colors flex items-center gap-1.5">
                <span>Raise a Ticket</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-zinc-400" />
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Submit an inquiry to audio technicians.
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`group text-left border rounded-xl p-4.5 transition-all space-y-2.5 shadow-sm cursor-pointer ${
              activeTab === 'track'
                ? 'bg-[#1f1f23] border-zinc-600'
                : 'bg-[#181818] hover:bg-[#1f1f23] border-zinc-800/90 hover:border-zinc-700'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-zinc-700 transition-colors">
              <Clock size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-zinc-200 transition-colors flex items-center gap-1.5">
                <span>Track Ticket</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-zinc-400" />
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Check status &amp; reply to open tickets.
              </p>
            </div>
          </button>
        </div>

        {/* Minimal Tab Switcher */}
        <div className="flex items-center justify-center border-b border-zinc-800 pb-px">
          <div className="inline-flex bg-[#161618] border border-zinc-800/90 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <HelpCircle size={14} />
              <span>Knowledge Base &amp; FAQs</span>
            </button>

            <button
              onClick={() => setActiveTab('raise')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'raise'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <FileText size={14} />
              <span>Raise a Ticket</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Clock size={14} />
              <span>Track Ticket</span>
            </button>
          </div>
        </div>

        {/* Active Tab View */}
        <div className="pt-1">
          {activeTab === 'faq' && (
            <FaqSection
              searchQuery={searchQuery}
              onSelectRaiseTicket={() => setActiveTab('raise')}
            />
          )}

          {activeTab === 'raise' && (
            <div className="max-w-3xl mx-auto">
              <RaiseTicketForm onTicketCreated={handleTicketCreated} />
            </div>
          )}

          {activeTab === 'track' && (
            <TrackTicketView
              initialTicketNumber={trackTicketNum}
              initialEmail={trackEmail}
            />
          )}
        </div>

        {/* Minimal Merchant & Grievance Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-zinc-800/80 text-xs text-zinc-400">
          
          <div className="bg-[#161618] border border-zinc-800/80 rounded-xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Building2 size={15} className="text-zinc-400" />
              <span>Customer Care &amp; Support Office</span>
            </div>
            <div className="space-y-1.5 text-zinc-400 text-xs">
              <p className="flex items-start gap-2">
                <MapPin size={13} className="text-zinc-500 flex-shrink-0 mt-0.5" />
                <span>Producer Toy Studios, Sangamner, Maharashtra - 422605, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={13} className="text-zinc-500 flex-shrink-0" />
                <span>Email: <a href="mailto:support@producertoy.com" className="text-zinc-200 hover:underline">support@producertoy.com</a></span>
              </p>
              <p className="flex items-center gap-2">
                <Clock size={13} className="text-zinc-500 flex-shrink-0" />
                <span>Hours: 24/7 Desk (Average response &lt; 4 hours)</span>
              </p>
            </div>
          </div>

          <div className="bg-[#161618] border border-zinc-800/80 rounded-xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <ShieldCheck size={15} className="text-zinc-400" />
              <span>Statutory Grievance Redressal</span>
            </div>
            <div className="space-y-1.5 text-zinc-400 text-xs">
              <p>
                <strong>Compliance Officer:</strong> Producer Toy Legal &amp; Compliance
              </p>
              <p className="flex items-center gap-2">
                <Mail size={13} className="text-zinc-500 flex-shrink-0" />
                <span>Grievance Email: <a href="mailto:grievance@producertoy.com" className="text-zinc-200 hover:underline">grievance@producertoy.com</a></span>
              </p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                In compliance with Consumer Protection Rules 2020, tickets are processed directly by senior technical staff.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export function SupportClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212] flex items-center justify-center text-zinc-500 text-xs uppercase tracking-widest font-bold">Loading Support Center...</div>}>
      <SupportClientInner />
    </Suspense>
  )
}
