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
  Sparkles,
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
        <div className="text-center space-y-5 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FA742B]/10 border border-[#FA742B]/30 text-[#FA742B] text-xs font-extrabold uppercase tracking-wider">
            <Headphones size={14} />
            <span>Producer Toy Support Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Search our instant knowledge base for VST activation, DAW setup, order retrieval, or open a direct ticket with our audio engineering team.
          </p>

          {/* Interactive Search Bar */}
          <div className="max-w-2xl mx-auto relative pt-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-zinc-500 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (activeTab !== 'faq') {
                    setActiveTab('faq')
                  }
                }}
                placeholder="Search solutions (e.g. FL Studio VST3 rescan, missing serial, invoice, refund)..."
                className="w-full bg-[#181818] border border-zinc-700/80 rounded-2xl pl-12 pr-4 py-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FA742B] focus:ring-1 focus:ring-[#FA742B] transition-all shadow-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs text-zinc-400 hover:text-white bg-zinc-800 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Topic Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-[11px] text-zinc-400">
              <span className="text-zinc-500 font-bold uppercase">Popular:</span>
              <button
                onClick={() => {
                  setSearchQuery('serial key')
                  setActiveTab('faq')
                }}
                className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                Serial Key Retrieval
              </button>
              <span className="text-zinc-700">•</span>
              <button
                onClick={() => {
                  setSearchQuery('FL Studio')
                  setActiveTab('faq')
                }}
                className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                FL Studio VST3
              </button>
              <span className="text-zinc-700">•</span>
              <button
                onClick={() => {
                  setSearchQuery('invoice')
                  setActiveTab('faq')
                }}
                className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                GST / Tax Invoices
              </button>
              <span className="text-zinc-700">•</span>
              <button
                onClick={() => {
                  setSearchQuery('apple silicon')
                  setActiveTab('faq')
                }}
                className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                Apple Silicon (M1-M4)
              </button>
            </div>
          </div>
        </div>

        {/* Quick Self-Service Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/library"
            prefetch={true}
            className="group bg-[#181818] hover:bg-[#202025] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 transition-all space-y-3 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-[#251b14] border border-[#FA742B]/30 flex items-center justify-center text-[#FA742B] group-hover:scale-110 transition-transform">
              <Key size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#FA742B] transition-colors flex items-center gap-1.5">
                <span>My Library &amp; Serials</span>
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-[11px] text-zinc-400 mt-1">
                Instant access to serial numbers, downloads &amp; authorization guides.
              </p>
            </div>
          </Link>

          <Link
            href="/account?tab=transactions"
            prefetch={true}
            className="group bg-[#181818] hover:bg-[#202025] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 transition-all space-y-3 shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-[#251b14] border border-[#FA742B]/30 flex items-center justify-center text-[#FA742B] group-hover:scale-110 transition-transform">
              <Receipt size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#FA742B] transition-colors flex items-center gap-1.5">
                <span>Orders &amp; Invoices</span>
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-[11px] text-zinc-400 mt-1">
                View order history, payment receipts, and download GST tax invoices.
              </p>
            </div>
          </Link>

          <button
            onClick={() => setActiveTab('raise')}
            className={`group text-left border rounded-2xl p-5 transition-all space-y-3 shadow-lg cursor-pointer ${
              activeTab === 'raise'
                ? 'bg-[#202025] border-[#FA742B]'
                : 'bg-[#181818] hover:bg-[#202025] border-zinc-800/80 hover:border-zinc-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#251b14] border border-[#FA742B]/30 flex items-center justify-center text-[#FA742B] group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#FA742B] transition-colors flex items-center gap-1.5">
                <span>Raise a Ticket</span>
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-[11px] text-zinc-400 mt-1">
                Open a dedicated technical inquiry for audio desk engineering support.
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`group text-left border rounded-2xl p-5 transition-all space-y-3 shadow-lg cursor-pointer ${
              activeTab === 'track'
                ? 'bg-[#202025] border-[#FA742B]'
                : 'bg-[#181818] hover:bg-[#202025] border-zinc-800/80 hover:border-zinc-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#251b14] border border-[#FA742B]/30 flex items-center justify-center text-[#FA742B] group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#FA742B] transition-colors flex items-center gap-1.5">
                <span>Track Active Ticket</span>
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-[11px] text-zinc-400 mt-1">
                Check status &amp; post follow-up replies to existing tickets.
              </p>
            </div>
          </button>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center justify-center border-b border-zinc-800/80 pb-px">
          <div className="inline-flex bg-[#181818] border border-zinc-800/80 p-1.5 rounded-2xl gap-2">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-[#FA742B] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <HelpCircle size={15} />
              <span>Knowledge Base &amp; FAQs</span>
            </button>

            <button
              onClick={() => setActiveTab('raise')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'raise'
                  ? 'bg-[#FA742B] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <FileText size={15} />
              <span>Raise a Ticket</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-[#FA742B] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Clock size={15} />
              <span>Track Ticket</span>
            </button>
          </div>
        </div>

        {/* Active Tab View */}
        <div className="pt-2">
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

        {/* Statutory Merchant & Grievance Redressal Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-zinc-800/80 text-xs text-zinc-400">
          
          <div className="bg-[#181818] border border-zinc-800/80 rounded-2xl p-6 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Building2 size={16} className="text-[#FA742B]" />
              <span>Customer Care &amp; Studio Office</span>
            </div>
            <div className="space-y-2 text-zinc-400">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
                <span>Producer Toy Studios, Sangamner, Maharashtra - 422605, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-zinc-500 flex-shrink-0" />
                <span><strong>Direct Support:</strong> <a href="mailto:support@producertoy.com" className="text-[#FA742B] hover:underline">support@producertoy.com</a></span>
              </p>
              <p className="flex items-center gap-2">
                <Clock size={14} className="text-zinc-500 flex-shrink-0" />
                <span><strong>Support Operating Hours:</strong> 24/7 Priority Desk (Standard response &lt; 4 hours)</span>
              </p>
            </div>
          </div>

          <div className="bg-[#181818] border border-zinc-800/80 rounded-2xl p-6 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck size={16} className="text-[#FA742B]" />
              <span>Statutory Grievance Redressal (IT Act &amp; RBI)</span>
            </div>
            <div className="space-y-2 text-zinc-400">
              <p>
                <strong>Grievance &amp; Compliance Officer:</strong> Producer Toy Legal &amp; Compliance
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-zinc-500 flex-shrink-0" />
                <span><strong>Grievance Desk:</strong> <a href="mailto:grievance@producertoy.com" className="text-[#FA742B] hover:underline">grievance@producertoy.com</a></span>
              </p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                In adherence to the Consumer Protection (E-Commerce) Rules 2020, all tickets are acknowledged instantaneously and grievances escalated to senior technical staff.
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
