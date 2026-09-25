'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Headphones,
  Bot,
  Send,
  Loader2,
  MoreHorizontal,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react'
import {
  KNOWLEDGE_BASE,
  KnowledgeArticle,
} from './supportKnowledgeData'
import { createSupportTicketAction } from '@/actions/supportActions'

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  timestamp: string
  content?: string
  article?: KnowledgeArticle
  isSourcesOpen?: boolean
  feedback?: 'yes' | 'no'
  needsTicket?: boolean
  ticketNumber?: string
  isThinking?: boolean
}

interface EpicSupportAssistantProps {
  initialTab?: string
  initialTicketNumber?: string
  initialEmail?: string
}

export function EpicSupportAssistant({
  initialTab,
  initialTicketNumber = '',
  initialEmail = '',
}: EpicSupportAssistantProps) {
  // Screen state: false = Hero Search (Screen 1), true = Chat Assistant (Screen 2)
  const [isChatStarted, setIsChatStarted] = useState(false)

  // Search input on Screen 1
  const [heroInput, setHeroInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [isHeroLoading, setIsHeroLoading] = useState(false)

  // Chat message input on Screen 2
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Ticket creation inline state
  const [ticketName, setTicketName] = useState('')
  const [ticketEmail, setTicketEmail] = useState(initialEmail)
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)
  const [ticketError, setTicketError] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  const formatCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const formatCurrentDate = () => {
    const now = new Date()
    return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Chat history for Screen 2
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isChatStarted) {
      scrollToBottom()
    }
  }, [messages, isTyping, isChatStarted])

  // Knowledge matching algorithm
  const findBestAnswer = (query: string): KnowledgeArticle | null => {
    const raw = query.trim().toLowerCase()
    if (!raw) return null

    const tokens = raw.split(/\s+/).filter(Boolean)
    let bestArticle: KnowledgeArticle | null = null
    let highestScore = 0

    for (const article of KNOWLEDGE_BASE) {
      let score = 0
      const qLower = article.question.toLowerCase()
      const aLower = article.shortAnswer.toLowerCase()
      const tagString = article.tags.join(' ').toLowerCase()

      if (qLower.includes(raw)) score += 100
      if (tagString.includes(raw)) score += 80
      if (aLower.includes(raw)) score += 40

      tokens.forEach((token) => {
        if (qLower.includes(token)) score += 20
        if (tagString.includes(token)) score += 15
        if (aLower.includes(token)) score += 5
      })

      if (score > highestScore) {
        highestScore = score
        bestArticle = article
      }
    }

    return highestScore >= 15 ? bestArticle : null
  }

  // Validation & Submit from Screen 1 (Hero Landing)
  const handleHeroSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const query = heroInput.trim()

    // Validation: Exactly as in user screenshot 2 (e.g. if too short like "sd")
    if (!query || query.length < 5 || query.split(/\s+/).length < 2) {
      setInputError('Describe the problem in more detail.')
      return
    }

    setInputError('')
    setIsHeroLoading(true)

    const time = formatCurrentTime()

    // Spinner spins for 700ms then smoothly transitions to Screen 2
    setTimeout(() => {
      setIsHeroLoading(false)
      setIsChatStarted(true)

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        timestamp: time,
        content: query,
      }

      const introMsg: ChatMessage = {
        id: `intro-${Date.now()}`,
        sender: 'assistant',
        timestamp: time,
        content:
          "Hey 👋 I'm the Producer Toy Support Assistant. I'm AI-powered and here to help you with your Producer Toy questions and issues.",
      }

      // Thinking placeholder message (as shown in user screenshot 3)
      const thinkingMsgId = `thinking-${Date.now()}`
      const thinkingMsg: ChatMessage = {
        id: thinkingMsgId,
        sender: 'assistant',
        timestamp: time,
        isThinking: true,
      }

      setMessages([userMsg, introMsg, thinkingMsg])

      // After thinking completes, replace with actual answer (Screenshot 4)
      setTimeout(() => {
        const match = findBestAnswer(query)

        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === thinkingMsgId) {
              if (match) {
                return {
                  id: `asst-${Date.now()}`,
                  sender: 'assistant',
                  timestamp: formatCurrentTime(),
                  article: match,
                  isSourcesOpen: false,
                  isThinking: false,
                }
              }
              return {
                id: `asst-${Date.now()}`,
                sender: 'assistant',
                timestamp: formatCurrentTime(),
                content: `I couldn't find an exact automated solution for "${query}". Would you like me to connect you with our senior audio engineers?`,
                needsTicket: true,
                isThinking: false,
              }
            }
            return m
          })
        )
      }, 1000)
    }, 700)
  }

  // Submit from bottom input bar on Screen 2 (Chat)
  const handleChatSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const text = chatInput.trim()
    if (!text || isTyping) return

    const time = formatCurrentTime()
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: time,
      content: text,
    }

    const thinkingMsgId = `thinking-${Date.now()}`
    const thinkingMsg: ChatMessage = {
      id: thinkingMsgId,
      sender: 'assistant',
      timestamp: time,
      isThinking: true,
    }

    setMessages((prev) => [...prev, userMsg, thinkingMsg])
    setChatInput('')
    setIsTyping(true)

    setTimeout(() => {
      const match = findBestAnswer(text)
      setIsTyping(false)

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === thinkingMsgId) {
            if (match) {
              return {
                id: `asst-${Date.now()}`,
                sender: 'assistant',
                timestamp: formatCurrentTime(),
                article: match,
                isSourcesOpen: false,
                isThinking: false,
              }
            }
            return {
              id: `asst-${Date.now()}`,
              sender: 'assistant',
              timestamp: formatCurrentTime(),
              content: `I couldn't find an automated solution for "${text}". Would you like to raise a support ticket with our audio technicians?`,
              needsTicket: true,
              isThinking: false,
            }
          }
          return m
        })
      )
    }, 1000)
  }

  const toggleSources = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, isSourcesOpen: !m.isSourcesOpen } : m
      )
    )
  }

  const handleFeedback = (msgId: string, helpful: boolean) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          return {
            ...m,
            feedback: helpful ? 'yes' : 'no',
            needsTicket: !helpful,
          }
        }
        return m
      })
    )
  }

  const handleCreateTicket = async (msgId: string, subjectQuery?: string) => {
    if (!ticketEmail.trim()) {
      setTicketError('Please provide your email address.')
      return
    }

    setIsSubmittingTicket(true)
    setTicketError('')

    try {
      const res = await createSupportTicketAction({
        name: ticketName.trim() || 'Producer',
        email: ticketEmail.trim(),
        category: 'Support Assistant Inquiry',
        priority: 'NORMAL',
        subject: subjectQuery || 'Technical Support Inquiry',
        description: `Customer submitted via Producer Toy Support Assistant regarding: "${subjectQuery}".\n\nDirect audio technician assistance requested.`,
      })

      if (res && res.success && res.ticketNumber) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? { ...m, needsTicket: false, ticketNumber: res.ticketNumber }
              : m
          )
        )
      } else {
        setTicketError(res?.error || 'Unable to submit ticket. Please try again.')
      }
    } catch (e: any) {
      setTicketError(e?.message || 'Failed to submit ticket. Please try again.')
    } finally {
      setIsSubmittingTicket(false)
    }
  }

  const handleResetToHero = () => {
    setIsChatStarted(false)
    setHeroInput('')
    setInputError('')
    setChatInput('')
    setMessages([])
    setIsTyping(false)
    setIsHeroLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#070605] text-white font-sans selection:bg-[#FC6301] selection:text-white flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Ambience: Cinematic Orangish Glowing Lights & Geometric Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1440px] h-[550px] bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,_rgba(252,99,1,0.25),_rgba(234,88,12,0.10)_45%,_rgba(7,6,5,0)_80%)] blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/4 left-1/4 w-[380px] h-[380px] bg-[#FC6301]/10 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute top-1/3 right-1/4 w-[420px] h-[420px] bg-amber-600/8 rounded-full blur-[150px] pointer-events-none -z-0" />

      {/* Abstract Glowing Angular Lines / Geometric Objects in Background (As requested by user in audio) */}
      <svg
        className="absolute inset-0 w-full h-[600px] pointer-events-none opacity-20 -z-0 overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ptGlowLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FC6301" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M -100 200 L 400 50 L 900 350 L 1600 100" fill="none" stroke="url(#ptGlowLine)" strokeWidth="1.5" />
        <path d="M 100 450 L 600 180 L 1100 380 L 1700 250" fill="none" stroke="url(#ptGlowLine)" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="350" cy="180" r="120" fill="none" stroke="rgba(252,99,1,0.15)" strokeWidth="1" />
        <circle cx="1100" cy="220" r="160" fill="none" stroke="rgba(252,99,1,0.12)" strokeWidth="1" strokeDasharray="8 8" />
      </svg>

      {/* ========================================================================= */}
      {/* SCREEN 1: HERO LANDING STATE (Exact Match with Screenshot 1 & 2)          */}
      {/* ========================================================================= */}
      {!isChatStarted ? (
        <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full py-16 sm:py-24 flex-grow flex flex-col justify-center">
          
          {/* Floating Server Status Pill (Top Right, matching Screenshot 1 & 2) */}
          <div className="w-full flex justify-end mb-6 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#110d0a]/90 border border-white/[0.08] text-xs text-zinc-300 shadow-sm backdrop-blur-sm">
              <span className="text-zinc-400">Server status:</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] sm:text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                All systems operational
              </span>
            </div>
          </div>

          {/* Center Hero Heading */}
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-semibold tracking-wider text-zinc-400 uppercase">
                Producer Toy Support
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
                How can we help?
              </h1>
            </div>

            {/* Problem Input Pill + Circle Arrow Button (Exact Screenshot Layout) */}
            <form onSubmit={handleHeroSubmit} className="max-w-xl mx-auto w-full">
              <div className="flex items-center justify-center gap-3 w-full">
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => {
                    setHeroInput(e.target.value)
                    if (inputError) setInputError('')
                  }}
                  placeholder="Describe your problem here"
                  className={`w-full bg-[#130f0c]/90 hover:bg-[#181310] focus:bg-[#181310] border rounded-full px-6 py-3.5 sm:py-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-xl shadow-black/40 backdrop-blur-md ${
                    inputError
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-[#291c14] focus:border-[#FC6301]/70'
                  }`}
                />

                <button
                  type="submit"
                  disabled={isHeroLoading}
                  aria-label="Submit problem"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#18120e] hover:bg-[#FC6301] border border-[#2b1c14] hover:border-[#FC6301] text-zinc-300 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer flex-shrink-0"
                >
                  {isHeroLoading ? (
                    /* Spinning Loader when user clicks submit, as requested in audio */
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Exact Validation Error (Screenshot 2: ▲ Describe the problem in more detail.) */}
              {inputError && (
                <div className="text-left pt-2.5 px-4 flex items-center gap-1.5 text-xs text-rose-400 font-medium animate-in fade-in">
                  <AlertTriangle size={13} className="text-rose-500 flex-shrink-0" />
                  <span>{inputError}</span>
                </div>
              )}
            </form>

            {/* Disclaimer Note */}
            <p className="text-[11px] text-zinc-400/80">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-zinc-300 hover:text-[#FC6301] underline underline-offset-2">
                Terms
              </Link>{' '}
              and acknowledge our{' '}
              <Link href="/privacy" className="text-zinc-300 hover:text-[#FC6301] underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </main>
      ) : (
        /* ========================================================================= */
        /* SCREEN 2: CHAT ASSISTANT INTERACTION (Exact Match with Screenshot 3 & 4) */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          
          {/* Header Title: YOUR CHAT WITH / Producer Toy Support Assistant (Exact Screenshot 3) */}
          <div className="text-center pt-8 pb-4 relative">
            <button
              onClick={handleResetToHero}
              className="absolute left-4 sm:left-8 top-8 text-zinc-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Start over</span>
            </button>

            <div className="space-y-1">
              <p className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-zinc-400 font-mono">
                Your Chat With
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Producer Toy Support Assistant
              </h2>
            </div>

            {/* Date Pill (Sep 25, 2026, matching screenshot 3) */}
            <div className="pt-4">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#181310] border border-[#2b1d15] text-[11px] text-zinc-400 font-medium">
                {formatCurrentDate()}
              </span>
            </div>
          </div>

          {/* Main Chat Feed */}
          <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 overflow-y-auto space-y-6">
            
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  /* User Bubble (Right-aligned, with "You 10:03 PM" & warm gradient from screenshot 3 & 4) */
                  <div key={msg.id} className="flex flex-col items-end space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="text-xs text-zinc-400 pr-1 flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-200">You</span>
                      <span className="text-[11px] text-zinc-400">{msg.timestamp}</span>
                    </div>

                    <div className="bg-gradient-to-r from-amber-300 via-orange-400 to-[#FC6301] text-zinc-950 font-medium px-5 py-3 rounded-2xl rounded-tr-sm max-w-lg shadow-lg text-sm sm:text-[15px] leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                )
              }

              /* Assistant Bubble (Left-aligned, exact card style from screenshot 3 & 4) */
              return (
                <div key={msg.id} className="flex flex-col items-start space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-2xl">
                  
                  {/* Assistant Header: Bot Icon + Name + Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 px-1">
                    <div className="w-5 h-5 rounded-md bg-[#251811] border border-[#3d251a] flex items-center justify-center text-[#FC6301]">
                      <Bot size={13} />
                    </div>
                    <span className="font-semibold text-zinc-200 text-xs">Producer Toy Support Assistant</span>
                    <span className="text-[11px] text-zinc-400">{msg.timestamp}</span>
                  </div>

                  {/* Case 1: Thinking Spinner Card (Exact Screenshot 3: ○ Thinking...) */}
                  {msg.isThinking ? (
                    <div className="bg-[#181412] border border-[#2d1e16] text-zinc-200 rounded-2xl rounded-tl-sm px-5 py-3 text-xs sm:text-sm flex items-center gap-2.5 shadow-xl animate-pulse">
                      <Loader2 size={14} className="animate-spin text-[#FC6301]" />
                      <span className="text-zinc-300 font-medium">Thinking...</span>
                    </div>
                  ) : (
                    /* Case 2: Full Assistant Card (Exact Screenshot 4) */
                    <div className="bg-[#181412] border border-[#2d1e16] text-zinc-200 rounded-2xl rounded-tl-sm p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-3.5 shadow-xl w-full">
                      
                      {/* Introductory greeting or fallback text */}
                      {msg.content && (
                        <p className="text-zinc-200">{msg.content}</p>
                      )}

                      {/* Structured Resolution Steps (Exact Screenshot 4 Layout) */}
                      {msg.article && (
                        <div className="space-y-3.5">
                          <p className="font-semibold text-white">
                            To {msg.article.question.toLowerCase().replace('how do i ', '').replace('how to ', '')}:
                          </p>

                          <ol className="space-y-2 list-decimal list-inside text-zinc-300 text-xs sm:text-[13px] leading-relaxed">
                            {msg.article.detailedSteps.map((step, sIdx) => (
                              <li key={sIdx} className="pl-1">
                                <span className="text-zinc-200">{step}</span>
                              </li>
                            ))}
                          </ol>

                          <p className="text-xs text-zinc-400 pt-1">
                            Are you downloading on a PC or Mac, or need help with a DAW (FL Studio, Ableton, Logic)?
                          </p>

                          {/* Answer Sources Dropdown (Exact accordion pill from screenshot 4) */}
                          <div className="pt-2">
                            <button
                              onClick={() => toggleSources(msg.id)}
                              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#201814] hover:bg-[#281d18] border border-[#33221a] text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <span className="font-medium">Answer sources</span>
                              {msg.isSourcesOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>

                            {msg.isSourcesOpen && (
                              <div className="mt-2 p-3 rounded-xl bg-[#140e0b] border border-[#2b1b13] space-y-2 text-xs animate-in fade-in">
                                <div className="flex items-center justify-between text-zinc-300">
                                  <span>Producer Toy Knowledge Base: {msg.article.categoryLabel}</span>
                                  {msg.article.actionCta && (
                                    <Link
                                      href={msg.article.actionCta.href}
                                      className="inline-flex items-center gap-1 text-[#FC6301] hover:underline"
                                    >
                                      <span>{msg.article.actionCta.label}</span>
                                      <ExternalLink size={11} />
                                    </Link>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Helpful feedback toggle */}
                          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
                            <span>Did this solve your problem?</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleFeedback(msg.id, true)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                                  msg.feedback === 'yes'
                                    ? 'bg-emerald-600 text-white border-emerald-500'
                                    : 'bg-[#221812] text-zinc-300 hover:text-white border-[#332218]'
                                }`}
                              >
                                <ThumbsUp size={12} />
                                <span>Yes</span>
                              </button>
                              <button
                                onClick={() => handleFeedback(msg.id, false)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                                  msg.feedback === 'no'
                                    ? 'bg-rose-900/80 text-white border-rose-600'
                                    : 'bg-[#221812] text-zinc-300 hover:text-white border-[#332218]'
                                }`}
                              >
                                <ThumbsDown size={12} />
                                <span>No</span>
                              </button>
                            </div>
                          </div>

                          {msg.feedback === 'yes' && (
                            <p className="text-xs text-emerald-400 flex items-center gap-1 pt-1">
                              <CheckCircle2 size={13} />
                              Glad that helped! Happy producing!
                            </p>
                          )}
                        </div>
                      )}

                      {/* Inline Ticket Escalation Form (If answer didn't help or no match found) */}
                      {msg.needsTicket && (
                        <div className="mt-3 p-4 rounded-xl bg-[#140e0b] border border-[#3b2318] space-y-3 animate-in fade-in">
                          <p className="text-xs text-zinc-200 font-medium">
                            Submit this request directly to our senior audio engineering desk:
                          </p>

                          {ticketError && (
                            <p className="text-xs text-rose-400">{ticketError}</p>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <input
                              type="text"
                              value={ticketName}
                              onChange={(e) => setTicketName(e.target.value)}
                              placeholder="Your Name (Optional)"
                              className="bg-[#1e1510] border border-[#332218] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FC6301]"
                            />
                            <input
                              type="email"
                              required
                              value={ticketEmail}
                              onChange={(e) => setTicketEmail(e.target.value)}
                              placeholder="Your Email *"
                              className="bg-[#1e1510] border border-[#332218] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FC6301]"
                            />
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleCreateTicket(msg.id, msg.article?.question || 'General Inquiry')}
                              disabled={isSubmittingTicket}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FC6301] hover:bg-[#ea580c] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                            >
                              {isSubmittingTicket ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Submitting...</span>
                                </>
                              ) : (
                                <>
                                  <Send size={13} />
                                  <span>Submit to Audio Desk</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Ticket Confirmation */}
                      {msg.ticketNumber && (
                        <div className="p-3.5 rounded-xl bg-[#0f1f14] border border-emerald-500/40 space-y-2 text-xs text-emerald-300 animate-in fade-in">
                          <p className="font-semibold flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 size={14} />
                            Ticket #{msg.ticketNumber} created!
                          </p>
                          <p className="text-zinc-300">
                            Our audio engineers have received your inquiry. A confirmation was sent to {ticketEmail}.
                          </p>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )
            })}

            <div ref={messagesEndRef} />
          </main>

          {/* Bottom Fixed Chat Bar (Exact Match with Screenshot 3 & 4) */}
          <footer className="relative z-20 w-full border-t border-white/[0.06] bg-[#070605]/95 backdrop-blur-md px-4 sm:px-6 py-3.5">
            <form
              onSubmit={handleChatSubmit}
              className="max-w-3xl mx-auto flex items-center gap-3"
            >
              {/* 3 Dots / Menu Button */}
              <button
                type="button"
                onClick={() => handleChatSubmit()}
                title="Options"
                className="w-10 h-10 rounded-full bg-[#140f0c] hover:bg-[#1e1510] border border-[#2b1d15] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
              >
                <MoreHorizontal size={18} />
              </button>

              {/* Input Pill */}
              <div className="relative flex-1">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Write a message..."
                  className="w-full bg-[#120e0b] hover:bg-[#18120e] focus:bg-[#18120e] border border-[#2b1d15] focus:border-[#FC6301]/70 rounded-full pl-5 pr-12 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                />

                {/* Circle Arrow Submit Button */}
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  aria-label="Send message"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1e1510] hover:bg-[#FC6301] disabled:opacity-30 disabled:hover:bg-[#1e1510] text-zinc-400 hover:text-white disabled:text-zinc-600 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </footer>

        </div>
      )}

      {/* Sub-Footer on Hero landing */}
      {!isChatStarted && (
        <footer className="relative z-10 w-full border-t border-white/[0.06] py-4 px-4 text-center text-xs text-zinc-500">
          <p>Producer Toy Support Desk &bull; 24/7 Automated Assistance</p>
        </footer>
      )}

    </div>
  )
}
