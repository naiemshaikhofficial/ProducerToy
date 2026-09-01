'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Send,
  MessageSquare,
  User,
  Headphones,
  Laptop,
  Music2,
  Calendar,
  Layers,
} from 'lucide-react'
import {
  getTicketDetailsAction,
  addTicketReplyAction,
  SupportTicket,
  TicketMessage,
} from '@/actions/supportActions'

interface TrackTicketViewProps {
  initialTicketNumber?: string
  initialEmail?: string
}

export function TrackTicketView({ initialTicketNumber = '', initialEmail = '' }: TrackTicketViewProps) {
  const [ticketNumber, setTicketNumber] = useState(initialTicketNumber)
  const [email, setEmail] = useState(initialEmail)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])

  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [replySuccess, setReplySuccess] = useState('')

  // Auto-search if initial parameters provided
  useEffect(() => {
    if (initialTicketNumber && initialEmail) {
      handleLookup(initialTicketNumber, initialEmail)
    }
  }, [initialTicketNumber, initialEmail])

  const handleLookup = async (numToSearch = ticketNumber, emailToSearch = email) => {
    if (!numToSearch?.trim() || !emailToSearch?.trim()) {
      setErrorMessage('Please provide both Ticket Number and Email Address.')
      return
    }

    setLoading(true)
    setErrorMessage('')
    setReplySuccess('')

    try {
      const res = await getTicketDetailsAction(numToSearch, emailToSearch)
      if (res.success && res.ticket) {
        setTicket(res.ticket)
        setMessages(res.messages || [])
      } else {
        setTicket(null)
        setMessages([])
        setErrorMessage(res.error || 'No matching ticket found.')
      }
    } catch (err: any) {
      setTicket(null)
      setMessages([])
      setErrorMessage(err.message || 'An error occurred while fetching your ticket.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticket || !replyText.trim()) return

    setReplying(true)
    setReplySuccess('')

    try {
      const res = await addTicketReplyAction(ticket.ticket_number, ticket.email, replyText, ticket.name)
      if (res.success && res.newMessage) {
        setMessages((prev) => [...prev, res.newMessage!])
        setReplyText('')
        setReplySuccess('Your reply has been posted successfully.')
        setTimeout(() => setReplySuccess(''), 4000)
      } else {
        setErrorMessage(res.error || 'Failed to post reply.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while posting reply.')
    } finally {
      setReplying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            OPEN
          </span>
        )
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            IN PROGRESS
          </span>
        )
      case 'WAITING_ON_CUSTOMER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Clock size={12} />
            ACTION REQUIRED
          </span>
        )
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={12} />
            RESOLVED
          </span>
        )
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-700/40 text-zinc-400 border border-zinc-700">
            CLOSED
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300">
            {status}
          </span>
        )
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-[10px] font-bold uppercase text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">Urgent</span>
      case 'HIGH':
        return <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">High</span>
      case 'LOW':
        return <span className="text-[10px] font-bold uppercase text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">Low</span>
      default:
        return <span className="text-[10px] font-bold uppercase text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded">Normal</span>
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Lookup Card */}
      <div className="bg-[#181818] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Lookup Support Ticket</h3>
          <p className="text-xs text-zinc-400">
            Enter your Ticket Reference ID (e.g. <span className="text-[#FA742B] font-mono font-bold">PT-TK-XXXXX</span>) and registered email.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleLookup()
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-4"
        >
          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Ticket Number
            </label>
            <input
              type="text"
              required
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
              placeholder="PT-TK-XXXXX"
              className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-[#FA742B] transition-colors uppercase"
            />
          </div>

          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. producer@domain.com"
              className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FA742B] transition-colors"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FA742B] hover:bg-[#E05A18] disabled:opacity-50 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer h-[46px]"
            >
              {loading ? (
                <span>...</span>
              ) : (
                <>
                  <Search size={15} />
                  <span>Check</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex items-center gap-3 text-xs sm:text-sm text-rose-200">
            <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Ticket Details & Timeline */}
      {ticket && (
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-[#181818] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#FA742B] font-bold">{ticket.ticket_number}</span>
                  {getPriorityBadge(ticket.priority)}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{ticket.subject}</h2>
              </div>
              <div className="flex-shrink-0">{getStatusBadge(ticket.status)}</div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-[#121212] border border-zinc-800/80 rounded-xl p-3 space-y-1">
                <span className="text-zinc-500 font-bold uppercase flex items-center gap-1.5">
                  <Layers size={12} className="text-[#FA742B]" /> Category
                </span>
                <p className="text-white font-medium truncate">{ticket.category}</p>
              </div>

              <div className="bg-[#121212] border border-zinc-800/80 rounded-xl p-3 space-y-1">
                <span className="text-zinc-500 font-bold uppercase flex items-center gap-1.5">
                  <Music2 size={12} className="text-[#FA742B]" /> DAW
                </span>
                <p className="text-white font-medium truncate">{ticket.daw || 'N/A'}</p>
              </div>

              <div className="bg-[#121212] border border-zinc-800/80 rounded-xl p-3 space-y-1">
                <span className="text-zinc-500 font-bold uppercase flex items-center gap-1.5">
                  <Laptop size={12} className="text-[#FA742B]" /> Platform
                </span>
                <p className="text-white font-medium truncate">{ticket.os_platform || 'N/A'}</p>
              </div>

              <div className="bg-[#121212] border border-zinc-800/80 rounded-xl p-3 space-y-1">
                <span className="text-zinc-500 font-bold uppercase flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#FA742B]" /> Created
                </span>
                <p className="text-white font-medium">
                  {new Date(ticket.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Messages & Conversation Thread */}
          <div className="bg-[#181818] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-800/60">
              <MessageSquare size={18} className="text-[#FA742B]" />
              <h3 className="text-base sm:text-lg font-bold text-white">Conversation Thread</h3>
            </div>

            <div className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No messages found in this thread.</p>
              ) : (
                messages.map((msg) => {
                  const isSupport = msg.sender_type === 'SUPPORT'
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 sm:p-5 rounded-2xl space-y-2 border ${
                        isSupport
                          ? 'bg-[#1b2333] border-blue-900/60 ml-0 sm:mr-8'
                          : 'bg-[#141414] border-zinc-800/80 mr-0 sm:ml-8'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSupport ? 'bg-blue-600 text-white' : 'bg-[#FA742B] text-white'
                            }`}
                          >
                            {isSupport ? <Headphones size={13} /> : <User size={13} />}
                          </div>
                          <span className="font-bold text-white">
                            {isSupport ? 'Producer Toy Audio Desk' : msg.sender_name || 'Customer'}
                          </span>
                          {isSupport && (
                            <span className="bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                              Official Support
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed pl-8">
                        {msg.message}
                      </p>
                    </div>
                  )
                })
              )}
            </div>

            {/* Reply Box */}
            {ticket.status !== 'CLOSED' ? (
              <form onSubmit={handleSendReply} className="pt-4 border-t border-zinc-800/80 space-y-3">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Post a Follow-Up Reply
                </label>
                <textarea
                  required
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Provide additional details, system specs, or answer technician questions..."
                  className="w-full bg-[#121212] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FA742B] transition-colors resize-none"
                />

                {replySuccess && (
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>{replySuccess}</span>
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={replying || !replyText.trim()}
                    className="bg-[#FA742B] hover:bg-[#E05A18] disabled:opacity-50 text-white font-bold text-xs py-2.5 px-6 rounded-xl uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    {replying ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Send Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-center text-xs text-zinc-400">
                This ticket has been marked as closed. If you have new questions, please raise a new ticket.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
