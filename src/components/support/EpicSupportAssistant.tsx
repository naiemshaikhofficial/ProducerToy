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
  Copy,
  Check,
  MoreHorizontal,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  ShoppingBag,
  User,
  ArrowLeft,
} from 'lucide-react'
import {
  KNOWLEDGE_BASE,
  KNOWLEDGE_CATEGORIES,
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
}

interface EpicSupportAssistantProps {
  initialTab?: string
  initialTicketNumber?: string
  initialEmail?: string
}

export function EpicSupportAssistant({
  initialTicketNumber = '',
  initialEmail = '',
}: EpicSupportAssistantProps) {
  // Screen state: false = Hero Search (Screen 1), true = Interactive Chat Feed (Screen 2)
  const [isChatStarted, setIsChatStarted] = useState(false)

  // Search input on Screen 1
  const [heroInput, setHeroInput] = useState('')

  // Chat message input on Screen 2
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Navigation dropdowns
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)

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

  // Suggested prompt chips on Screen 1
  const SUGGESTED_QUESTIONS = [
    { label: 'Are they free?', query: 'are they free' },
    { label: 'Where is my serial key?', query: 'where is my serial key' },
    { label: 'FL Studio plugin missing', query: 'fl studio plugin missing' },
    { label: 'Ableton Live rescan', query: 'ableton rescan' },
    { label: 'Download tax invoice', query: 'download invoice' },
    { label: 'Refund policy', query: 'refund policy' },
    { label: 'Apple Silicon M1-M4', query: 'apple silicon' },
  ]

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

  // Triggered when user submits their problem from Hero Landing (Screen 1)
  const handleHeroSubmit = (queryToSubmit?: string) => {
    const query = (queryToSubmit || heroInput).trim()
    if (!query) return

    const time = formatCurrentTime()

    // Switch to Screen 2
    setIsChatStarted(true)
    setIsTyping(true)

    // User message (Screen 2 right bubble)
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: time,
      content: query,
    }

    // Initial greeting message (matches Epic Games screenshot)
    const introMsg: ChatMessage = {
      id: `intro-${Date.now()}`,
      sender: 'assistant',
      timestamp: time,
      content:
        "Hey 👋 I'm the Producer Toy Support Assistant. I'm AI-powered and here to help you with your Producer Toy questions and issues.",
    }

    setMessages([userMsg, introMsg])

    // Generate AI resolution
    setTimeout(() => {
      const match = findBestAnswer(query)
      setIsTyping(false)

      if (match) {
        const answerMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: formatCurrentTime(),
          article: match,
          isSourcesOpen: false,
        }
        setMessages((prev) => [...prev, answerMsg])
      } else {
        const fallbackMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: formatCurrentTime(),
          content: `I couldn't find an exact automated solution for "${query}". Would you like me to connect you with our senior audio engineers?`,
          needsTicket: true,
        }
        setMessages((prev) => [...prev, fallbackMsg])
      }
    }, 600)
  }

  // Triggered from bottom input bar inside Screen 2
  const handleChatSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const text = chatInput.trim()
    if (!text || isTyping) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: formatCurrentTime(),
      content: text,
    }

    setMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setIsTyping(true)

    setTimeout(() => {
      const match = findBestAnswer(text)
      setIsTyping(false)

      if (match) {
        const answerMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: formatCurrentTime(),
          article: match,
          isSourcesOpen: false,
        }
        setMessages((prev) => [...prev, answerMsg])
      } else {
        const fallbackMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: formatCurrentTime(),
          content: `I couldn't find an automated solution for "${text}". Would you like to raise a support ticket with our audio technicians?`,
          needsTicket: true,
        }
        setMessages((prev) => [...prev, fallbackMsg])
      }
    }, 600)
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
    setChatInput('')
    setMessages([])
    setIsTyping(false)
  }

  return (
    <div className="min-h-screen bg-[#080706] text-white font-sans selection:bg-[#FC6301] selection:text-white flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Ambient Glow (Orangish glow matching Epic Games lighting) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1440px] h-[520px] bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,_rgba(252,99,1,0.28),_rgba(234,88,12,0.12)_45%,_rgba(8,7,6,0)_80%)] blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/4 left-1/4 w-[360px] h-[360px] bg-[#FC6301]/10 rounded-full blur-[130px] pointer-events-none -z-0" />

      {/* Top Header Bar (Exact match with Epic Games Support) */}
      <header className="relative z-20 w-full border-b border-white/[0.06] bg-[#080706]/85 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        
        {/* Left: Brand Icon + Support Title + Menu Links */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button onClick={handleResetToHero} className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FC6301] to-amber-500 flex items-center justify-center text-white shadow-md shadow-[#FC6301]/30">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-[#FC6301] transition-colors">
              Support
            </span>
          </button>

          {/* Explore Topics Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsExploreOpen(!isExploreOpen)
                setIsCategoriesOpen(false)
              }}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer py-1"
            >
              <span>Explore topics</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {isExploreOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 rounded-xl bg-[#14100d] border border-[#2b1e16] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {KNOWLEDGE_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      const firstArt = KNOWLEDGE_BASE.find((a) => a.category === cat.id)
                      if (firstArt) handleHeroSubmit(firstArt.question)
                      setIsExploreOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-[#FC6301]/15 transition-colors cursor-pointer"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsCategoriesOpen(!isCategoriesOpen)
                setIsExploreOpen(false)
              }}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer py-1"
            >
              <span>Categories</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {isCategoriesOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 rounded-xl bg-[#14100d] border border-[#2b1e16] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <Link
                  href="/free-vst-plugins"
                  className="block px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-[#FC6301]/15 transition-colors"
                >
                  Free VST Plugins
                </Link>
                <Link
                  href="/categories/instruments"
                  className="block px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-[#FC6301]/15 transition-colors"
                >
                  Virtual Instruments
                </Link>
                <Link
                  href="/categories/sounds"
                  className="block px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-[#FC6301]/15 transition-colors"
                >
                  Sample Packs &amp; Loops
                </Link>
                <Link
                  href="/store"
                  className="block px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-[#FC6301]/15 transition-colors"
                >
                  All Products
                </Link>
              </div>
            )}
          </div>

          {/* Server status badge */}
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Server status: Operational</span>
          </span>
        </div>

        {/* Right side navigation buttons */}
        <div className="flex items-center gap-3 text-xs text-zinc-300">
          <Link
            href="/store"
            className="hover:text-white transition-colors hidden sm:inline-flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
            <span>Store</span>
          </Link>
          <Link
            href="/account"
            className="hover:text-white transition-colors flex items-center gap-1.5 bg-[#16110e] hover:bg-[#201813] border border-[#2a1d15] px-3.5 py-1.5 rounded-lg"
          >
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sign in</span>
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SCREEN 1: HERO LANDING STATE (Matching Image 1 Screenshot)               */}
      {/* ========================================================================= */}
      {!isChatStarted ? (
        <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full py-12 sm:py-20 flex-grow flex flex-col justify-center">
          
          {/* Floating Server Status Pill (Top Right, matching Screenshot 1) */}
          <div className="w-full flex justify-end mb-4 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#120e0b]/90 border border-white/[0.08] text-xs text-zinc-300 shadow-sm backdrop-blur-sm">
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
              <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#FC6301]/90 uppercase">
                Producer Toy Support
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
                How can we help?
              </h1>
            </div>

            {/* Problem Input Pill + Circle Arrow Button */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleHeroSubmit()
              }}
              className="max-w-xl mx-auto w-full"
            >
              <div className="flex items-center justify-center gap-3 w-full">
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder="Describe your problem here"
                  className="w-full bg-[#140f0c]/90 hover:bg-[#1a130f] focus:bg-[#1a130f] border border-[#2b1c14] focus:border-[#FC6301]/70 rounded-full px-6 py-3.5 sm:py-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-xl shadow-black/40 backdrop-blur-md"
                />

                <button
                  type="submit"
                  aria-label="Submit problem"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1a130f] hover:bg-[#FC6301] border border-[#2b1c14] hover:border-[#FC6301] text-zinc-400 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer flex-shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
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

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-2xl mx-auto">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => handleHeroSubmit(q.query)}
                  className="text-xs px-3.5 py-1.5 rounded-full bg-[#140f0c]/80 hover:bg-[#FC6301]/20 border border-[#261810] hover:border-[#FC6301]/50 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </main>
      ) : (
        /* ========================================================================= */
        /* SCREEN 2: CHAT ASSISTANT INTERACTION (Exact Match with Screenshot 2)     */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          
          {/* Header Title: YOUR CHAT WITH / Epic Support Assistant (Exact Screenshot 2) */}
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

            {/* Date Pill (Sep 25, 2026, matching screenshot 2) */}
            <div className="pt-4">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#1a1512] border border-[#2a1d15] text-[11px] text-zinc-400 font-medium">
                {formatCurrentDate()}
              </span>
            </div>
          </div>

          {/* Main Chat Feed */}
          <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 overflow-y-auto space-y-6">
            
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  /* User Bubble (Right-aligned, with "You 10:18 PM" metadata & gradient pill from screenshot) */
                  <div key={msg.id} className="flex flex-col items-end space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="text-xs text-zinc-400 pr-1 flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-200">You</span>
                      <span className="text-[11px] text-zinc-400">{msg.timestamp}</span>
                    </div>

                    <div className="bg-gradient-to-r from-amber-300 via-orange-400 to-[#FC6301] text-zinc-950 font-semibold px-5 py-3 rounded-2xl rounded-tr-sm max-w-lg shadow-lg text-sm sm:text-[15px] leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                )
              }

              /* Assistant Bubble (Left-aligned, exact card style from screenshot 2) */
              return (
                <div key={msg.id} className="flex flex-col items-start space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-2xl">
                  
                  {/* Assistant Header: Icon + Name + Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 px-1">
                    <div className="w-5 h-5 rounded-md bg-[#251811] border border-[#3d251a] flex items-center justify-center text-[#FC6301]">
                      <Bot size={13} />
                    </div>
                    <span className="font-semibold text-zinc-200 text-xs">Producer Toy Support Assistant</span>
                    <span className="text-[11px] text-zinc-400">{msg.timestamp}</span>
                  </div>

                  {/* Message Content Card */}
                  <div className="bg-[#181412] border border-[#2d1e16] text-zinc-200 rounded-2xl rounded-tl-sm p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-3.5 shadow-xl w-full">
                    
                    {/* Text / Greeting */}
                    {msg.content && (
                      <p className="text-zinc-200">{msg.content}</p>
                    )}

                    {/* Structured Knowledge Article Resolution (Exact layout from screenshot 2) */}
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
                          Are you downloading on a PC, macOS Apple Silicon, or need help with a DAW (FL Studio, Ableton, Logic)?
                        </p>

                        {/* Answer Sources Dropdown (Exact accordion pill from screenshot 2) */}
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

                        {/* Feedback query */}
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
                </div>
              )
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 px-1 animate-pulse">
                <div className="w-5 h-5 rounded-md bg-[#251811] border border-[#3d251a] flex items-center justify-center text-[#FC6301]">
                  <Bot size={13} />
                </div>
                <span>Producer Toy Support Assistant is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </main>

          {/* Bottom Fixed Chat Bar (Exact match with Screenshot 2) */}
          <footer className="relative z-20 w-full border-t border-white/[0.06] bg-[#080706]/95 backdrop-blur-md px-4 sm:px-6 py-3.5">
            <form
              onSubmit={handleChatSubmit}
              className="max-w-3xl mx-auto flex items-center gap-3"
            >
              {/* 3 Dots / Menu Button */}
              <button
                type="button"
                onClick={() => handleChatSubmit()}
                title="Options"
                className="w-10 h-10 rounded-full bg-[#16110e] hover:bg-[#201813] border border-[#2b1d15] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
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
                  className="w-full bg-[#140f0c] hover:bg-[#1a1410] focus:bg-[#1a1410] border border-[#2b1d15] focus:border-[#FC6301]/70 rounded-full pl-5 pr-12 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                />

                {/* Circle Arrow Submit Button */}
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  aria-label="Send message"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#201712] hover:bg-[#FC6301] disabled:opacity-30 disabled:hover:bg-[#201712] text-zinc-400 hover:text-white disabled:text-zinc-600 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
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
