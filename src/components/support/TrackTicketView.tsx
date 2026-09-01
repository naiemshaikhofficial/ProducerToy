'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
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
      setErrorMessage('Please enter both Ticket Number and Email Address.')
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
        setReplySuccess('Reply posted successfully.')
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Open
          </span>
        )
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/50 text-blue-300 border border-blue-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            In Progress
          </span>
        )
      case 'WAITING_ON_CUSTOMER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
            <Clock size={11} />
            Action Required
          </span>
        )
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
            <CheckCircle2 size={11} />
            Resolved
          </span>
        )
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-500 border border-zinc-800">
            Closed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">
            {status}
          </span>
        )
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-[10px] font-semibold uppercase text-rose-300 bg-rose-950/50 border border-rose-800/50 px-1.5 py-0.5 rounded">Urgent</span>
      case 'HIGH':
        return <span className="text-[10px] font-semibold uppercase text-amber-300 bg-amber-950/50 border border-amber-800/50 px-1.5 py-0.5 rounded">High</span>
      case 'LOW':
        return <span className="text-[10px] font-semibold uppercase text-zinc-400 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">Low</span>
      default:
        return <span className="text-[10px] font-semibold uppercase text-zinc-300 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">Normal</span>
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Lookup Card */}
      <div className="bg-[#161618] border border-zinc-800/90 rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Lookup Support Ticket</h3>
          <p className="text-xs text-zinc-400">
            Enter your Ticket ID (e.g. <span className="font-mono text-zinc-300">PT-TK-XXXXX</span>) and registered email address.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleLookup()
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-5 space-y-1">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Ticket ID
            </label>
            <input
              type="text"
              required
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
              placeholder="PT-TK-XXXXX"
              className="w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-zinc-600 transition-colors uppercase"
            />
          </div>

          <div className="sm:col-span-5 space-y-1">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="producer@example.com"
              className="w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-extrabold text-xs py-2.5 px-4 rounded-xl uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer h-[42px]"
            >
              {loading ? (
                <span>...</span>
              ) : (
                <>
                  <Search size={14} />
                  <span>Check</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="bg-rose-950/30 border border-rose-900/60 rounded-xl p-3 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Ticket Details & Timeline */}
      {ticket && (
        <div className="space-y-5">
          {/* Main Info Card */}
          <div className="bg-[#161618] border border-zinc-800/90 rounded-2xl p-5 sm:p-7 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-300 font-bold">{ticket.ticket_number}</span>
                  {getPriorityBadge(ticket.priority)}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{ticket.subject}</h2>
              </div>
              <div className="flex-shrink-0">{getStatusBadge(ticket.status)}</div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-3 space-y-1">
                <span className="text-zinc-500 font-semibold uppercase flex items-center gap-1.5">
                  <Layers size={12} className="text-zinc-400" /> Category
                </span>
                <p className="text-white font-medium truncate">{ticket.category}</p>
              </div>

              <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-3 space-y-1">
                <span className="text-zinc-500 font-semibold uppercase flex items-center gap-1.5">
                  <Music2 size={12} className="text-zinc-400" /> DAW
                </span>
                <p className="text-white font-medium truncate">{ticket.daw || 'N/A'}</p>
              </div>

              <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-3 space-y-1">
                <span className="text-zinc-500 font-semibold uppercase flex items-center gap-1.5">
                  <Laptop size={12} className="text-zinc-400" /> Platform
                </span>
                <p className="text-white font-medium truncate">{ticket.os_platform || 'N/A'}</p>
              </div>

              <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-3 space-y-1">
                <span className="text-zinc-500 font-semibold uppercase flex items-center gap-1.5">
                  <Calendar size={12} className="text-zinc-400" /> Date
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
          <div className="bg-[#161618] border border-zinc-800/90 rounded-2xl p-5 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3.5 border-b border-zinc-800/60">
              <MessageSquare size={16} className="text-zinc-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">Conversation History</h3>
            </div>

            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No messages found in this thread.</p>
              ) : (
                messages.map((msg) => {
                  const isSupport = msg.sender_type === 'SUPPORT'
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl space-y-2 border ${
                        isSupport
                          ? 'bg-[#1a2130] border-blue-900/40 ml-0 sm:mr-6'
                          : 'bg-[#111113] border-zinc-800/80 mr-0 sm:ml-6'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSupport ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-200'
                            }`}
                          >
                            {isSupport ? <Headphones size={11} /> : <User size={11} />}
                          </div>
                          <span className="font-semibold text-white">
                            {isSupport ? 'Producer Toy Support' : msg.sender_name || 'Customer'}
                          </span>
                          {isSupport && (
                            <span className="bg-blue-500/10 text-blue-300 text-[10px] uppercase font-bold px-1.5 py-0.2 rounded">
                              Official
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

                      <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed pl-7">
                        {msg.message}
                      </p>
                    </div>
                  )
                })
              )}
            </div>

            {/* Reply Box */}
            {ticket.status !== 'CLOSED' ? (
              <form onSubmit={handleSendReply} className="pt-3.5 border-t border-zinc-800/80 space-y-2.5">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Post a Reply
                </label>
                <textarea
                  required
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type additional details or answer questions from the support desk..."
                  className="w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors resize-none"
                />

                {replySuccess && (
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>{replySuccess}</span>
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={replying || !replyText.trim()}
                    className="bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-bold text-xs py-2 px-5 rounded-lg uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    {replying ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>Send Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-center text-xs text-zinc-400">
                This ticket has been marked as closed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
