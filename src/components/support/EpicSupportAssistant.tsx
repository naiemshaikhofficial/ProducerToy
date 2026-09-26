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
  Ban,
} from 'lucide-react'
import {
  KNOWLEDGE_BASE,
  KnowledgeArticle,
} from './supportKnowledgeData'
import { askGroqSupportAction } from '@/actions/groqSupportAction'
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
  isGreeting?: boolean
}

interface EpicSupportAssistantProps {
  initialTab?: string
  initialTicketNumber?: string
  initialEmail?: string
}

export function EpicSupportAssistant({
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
  const optionsMenuRef = useRef<HTMLDivElement>(null)

  // Options popover menu (End chat)
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target as Node)) {
        setIsOptionsMenuOpen(false)
      }
    }
    if (isOptionsMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOptionsMenuOpen])

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

  // Fallback local matching
  const findLocalAnswer = (query: string): KnowledgeArticle | null => {
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

  // Submit from Screen 1 (Hero Landing)
  const handleHeroSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const query = heroInput.trim()

    // Validation: Require descriptive query (e.g. not short like "sd")
    if (!query || query.length < 4 || query.split(/\s+/).length < 2) {
      setInputError('Describe the problem in more detail.')
      return
    }

    setInputError('')
    setIsHeroLoading(true)

    const time = formatCurrentTime()

    // Spin for 600ms then transition to Screen 2
    setTimeout(async () => {
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
        isGreeting: true,
        isThinking: false,
      }

      const thinkingMsgId = `thinking-${Date.now()}`
      const thinkingMsg: ChatMessage = {
        id: thinkingMsgId,
        sender: 'assistant',
        timestamp: time,
        isThinking: true,
      }

      setMessages([userMsg, introMsg, thinkingMsg])

      // Query Groq AI with fallback to local knowledge
      try {
        const [groqRes] = await Promise.all([
          askGroqSupportAction(query, []),
          new Promise((r) => setTimeout(r, 650)),
        ])

        if (groqRes && groqRes.success && groqRes.answer) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === thinkingMsgId
                ? {
                    id: `asst-${Date.now()}`,
                    sender: 'assistant',
                    timestamp: formatCurrentTime(),
                    content: groqRes.answer,
                    isThinking: false,
                    isSourcesOpen: false,
                  }
                : m
            )
          )
        } else {
          // Local fallback
          const localMatch = findLocalAnswer(query)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === thinkingMsgId
                ? {
                    id: `asst-${Date.now()}`,
                    sender: 'assistant',
                    timestamp: formatCurrentTime(),
                    article: localMatch || undefined,
                    content: localMatch ? undefined : `I couldn't find an exact solution for "${query}". Would you like to connect with our audio engineers?`,
                    needsTicket: !localMatch,
                    isThinking: false,
                  }
                : m
            )
          )
        }
      } catch (err) {
        const localMatch = findLocalAnswer(query)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingMsgId
              ? {
                  id: `asst-${Date.now()}`,
                  sender: 'assistant',
                  timestamp: formatCurrentTime(),
                  article: localMatch || undefined,
                  needsTicket: !localMatch,
                  isThinking: false,
                }
              : m
          )
        )
      }
    }, 600)
  }

  // Submit from bottom input bar on Screen 2 (Chat)
  const handleChatSubmit = async (e?: React.FormEvent) => {
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

    // Build recent conversation history for Groq
    const history = messages
      .filter((m) => !m.isThinking && (m.content || m.article?.question))
      .slice(-4)
      .map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content || m.article?.shortAnswer || '',
      }))

    try {
      const [groqRes] = await Promise.all([
        askGroqSupportAction(text, history),
        new Promise((r) => setTimeout(r, 650)),
      ])
      setIsTyping(false)

      if (groqRes && groqRes.success && groqRes.answer) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingMsgId
              ? {
                  id: `asst-${Date.now()}`,
                  sender: 'assistant',
                  timestamp: formatCurrentTime(),
                  content: groqRes.answer,
                  isThinking: false,
                  isSourcesOpen: false,
                }
              : m
          )
        )
      } else {
        const localMatch = findLocalAnswer(text)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingMsgId
              ? {
                  id: `asst-${Date.now()}`,
                  sender: 'assistant',
                  timestamp: formatCurrentTime(),
                  article: localMatch || undefined,
                  content: localMatch ? undefined : `I couldn't find an automated solution for "${text}". Would you like to raise a support ticket?`,
                  needsTicket: !localMatch,
                  isThinking: false,
                }
              : m
          )
        )
      }
    } catch (e) {
      setIsTyping(false)
      const localMatch = findLocalAnswer(text)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsgId
            ? {
                id: `asst-${Date.now()}`,
                sender: 'assistant',
                timestamp: formatCurrentTime(),
                article: localMatch || undefined,
                needsTicket: !localMatch,
                isThinking: false,
              }
            : m
        )
      )
    }
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
    <>
      {/* ========================================================================= */}
      {/* SCREEN 1: HERO LANDING STATE (Exact Match with Screenshot 1 & 2)          */}
      {/* ========================================================================= */}
      {!isChatStarted ? (
        <div className="support-page-container relative w-full flex-1 min-h-[calc(100vh-76px)] bg-[#080706] text-white font-sans selection:bg-[#FC6301] selection:text-white overflow-hidden flex flex-col items-center justify-center">
          
          {/* Ambient Glowing Background Lights with Studio Elements Circled in Screenshot */}
          <div className="absolute inset-0 bg-[#080706] pointer-events-none -z-0" />
          
          {/* 1. Angled Studio Light Rig / Beams on Left (Circled in screenshot) */}
          <div className="absolute -top-16 -left-20 w-[620px] h-[340px] -rotate-45 bg-gradient-to-r from-[#FC6301]/25 via-amber-500/18 to-transparent blur-3xl pointer-events-none -z-0" />
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 -z-0 overflow-hidden">
            <defs>
              <linearGradient id="ptStudioBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FC6301" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M -80 180 L 400 520" stroke="url(#ptStudioBeam)" strokeWidth="2" fill="none" />
            <path d="M 60 40 L 480 480" stroke="url(#ptStudioBeam)" strokeWidth="1.5" strokeDasharray="6 8" fill="none" />
          </svg>

          {/* 2. Vertical Studio Light Pillar on Bottom Left (Circled in screenshot) */}
          <div className="absolute bottom-0 left-[16%] w-[130px] h-[360px] bg-gradient-to-t from-[#FC6301]/18 via-amber-600/08 to-transparent blur-2xl rounded-full pointer-events-none -z-0" />

          {/* 3. Soft Lens Flare / Bokeh Orb at Bottom Center (Circled in screenshot) */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[220px] h-[180px] bg-[radial-gradient(circle_at_50%_50%,_rgba(252,99,1,0.14),_rgba(245,158,11,0.05)_50%,_transparent_75%)] blur-2xl pointer-events-none -z-0" />

          {/* 4. Vertical Ambient Beam on Right (Circled in screenshot) */}
          <div className="absolute top-1/4 right-[7%] w-[140px] h-[440px] bg-gradient-to-b from-amber-500/15 via-[#FC6301]/10 to-transparent blur-2xl rounded-full pointer-events-none -z-0" />

          {/* Center ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1100px] h-[550px] bg-[radial-gradient(ellipse_75%_55%_at_50%_45%,_rgba(252,99,1,0.12),_transparent_70%)] blur-3xl pointer-events-none -z-0" />

          {/* Server Status: Square/rectangular with slightly rounded sides and subtle border (Exact Match with Screenshot) */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-8 z-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#110d0a]/95 border border-white/15 text-xs text-zinc-300 shadow-lg backdrop-blur-md">
              <span className="text-zinc-400">Server status:</span>
              <span className="inline-flex items-center gap-1.5 text-[#00d66c] font-semibold text-xs">
                <span className="w-3.5 h-3.5 rounded-full bg-[#00d66c] flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                All systems operational
              </span>
            </div>
          </div>

          {/* Center Hero Heading & Input (Strictly centered vertically & horizontally) */}
          <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 w-full py-8 flex flex-col items-center justify-center text-center my-auto">
            <div className="space-y-2 mb-6 sm:mb-7">
              <p className="text-sm font-normal text-zinc-300 tracking-normal">
                Producer Toy Support
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                How can we help?
              </h1>
            </div>

            {/* Problem Input Box: Square-ish with slightly rounded sides (rounded-lg) and matched width */}
            <form onSubmit={handleHeroSubmit} className="w-full max-w-[490px] mx-auto">
              <div className="flex items-center gap-2.5 w-full">
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => {
                    setHeroInput(e.target.value)
                    if (inputError) setInputError('')
                  }}
                  placeholder="Describe your problem here"
                  className={`flex-1 bg-[#130f0c]/90 hover:bg-[#18130f] focus:bg-[#18130f] border rounded-lg px-4.5 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-xl backdrop-blur-md ${
                    inputError
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-white/20 hover:border-white/30 focus:border-[#FC6301]'
                  }`}
                />

                <button
                  type="submit"
                  disabled={isHeroLoading}
                  aria-label="Submit problem"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                    heroInput.trim()
                      ? 'bg-[#FC6301] hover:bg-[#ff751a] text-white shadow-lg shadow-[#FC6301]/30 active:scale-95'
                      : 'bg-[#1b1511] hover:bg-[#241c16] border border-white/10 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {isHeroLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  )}
                </button>
              </div>

              {/* Validation Error: ▲ Describe the problem in more detail. */}
              {inputError && (
                <div className="text-left pt-2 px-2 flex items-center gap-1.5 text-xs text-rose-400 font-medium animate-in fade-in">
                  <AlertTriangle size={13} className="text-rose-500 flex-shrink-0" />
                  <span>{inputError}</span>
                </div>
              )}
            </form>

            {/* Disclaimer Note */}
            <p className="text-xs text-zinc-400/90 mt-5">
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
          </main>
        </div>
      ) : (
        /* ========================================================================= */
        /* SCREEN 2: CHAT ASSISTANT INTERACTION (Exact Match with Epic Games Layout) */
        /* ========================================================================= */
        <div className="support-page-container w-full flex-1 min-h-[calc(100vh-76px)] bg-[#080706] text-white font-sans flex flex-col justify-between relative overflow-hidden">
          
          {/* Top Dissolve Background (Exact Epic Games Atmospheric Fade) */}
          <div className="absolute top-0 left-0 right-0 h-[380px] overflow-hidden pointer-events-none -z-0">
            {/* Glowing Angled Light Beam & Warm Ambience */}
            <div className="absolute -top-16 -left-16 w-[700px] h-[320px] -rotate-45 bg-gradient-to-r from-[#FC6301]/25 via-amber-500/18 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute top-1/4 left-1/5 w-[420px] h-[420px] bg-[#FC6301]/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-8 right-1/4 w-[480px] h-[320px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Abstract Glowing Lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-20 overflow-hidden"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="chatDissolveLine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FC6301" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M -100 150 L 500 50 L 1000 280 L 1600 80" fill="none" stroke="url(#chatDissolveLine)" strokeWidth="1.5" />
              <path d="M 50 320 L 700 140 L 1200 300 L 1800 180" fill="none" stroke="url(#chatDissolveLine)" strokeWidth="1" strokeDasharray="4 6" />
            </svg>

            {/* Smooth Vertical Dissolve Gradient Fade to pure dark background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080706]/75 to-[#080706]" />
          </div>

          {/* Header Title: YOUR CHAT WITH / Producer Toy Support Assistant (Centered over dissolve background) */}
          <div className="text-center pt-8 pb-3 relative z-10">
            <button
              onClick={handleResetToHero}
              className="absolute left-4 sm:left-8 top-8 text-zinc-400 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer transition-colors px-3 py-1.5 rounded-lg bg-[#14100c]/80 border border-white/10 backdrop-blur-md"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Start over</span>
            </button>

            <div className="space-y-1">
              <p className="text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-zinc-400 font-mono">
                Your Chat With
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Producer Toy Support Assistant
              </h2>
            </div>

            {/* Date Pill */}
            <div className="pt-3">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#16120e]/80 border border-white/10 text-[11px] text-zinc-400 font-medium backdrop-blur-sm shadow-sm">
                {formatCurrentDate()}
              </span>
            </div>
          </div>

          {/* Main Chat Feed with Full Website Scroll (No nested scrollbar, scrolls entire page) */}
          <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-44 flex-1">
            
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  /* User Bubble (Right-aligned, with "You [Time]" & Producer Toy sunset orange gradient) */
                  <div key={msg.id} className="flex flex-col items-end space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="text-xs text-zinc-400 pr-1 flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-300">You</span>
                      <span className="text-[11px] text-zinc-500">{msg.timestamp}</span>
                    </div>

                    <div className="bg-gradient-to-r from-[#de5200] via-[#FC6301] to-[#ff7b2b] text-white font-medium px-5 py-3 rounded-2xl rounded-tr-xs max-w-lg shadow-lg shadow-[#FC6301]/20 text-sm sm:text-[14.5px] leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                )
              }

              /* Assistant Bubble */
              return (
                <div key={msg.id} className="flex flex-col items-start space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 w-full max-w-2xl">
                  
                  {/* Assistant Header: Bot Icon + Name + Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 px-1">
                    <div className="w-5 h-5 rounded-md bg-[#251811] border border-[#3d251a] flex items-center justify-center text-[#FC6301]">
                      <Bot size={13} />
                    </div>
                    <span className="font-semibold text-zinc-200 text-xs">Producer Toy Support Assistant</span>
                    <span className="text-[11px] text-zinc-500">{msg.timestamp}</span>
                  </div>

                  {/* Thinking Spinner Card (Exact Match with Epic Games Screenshot) */}
                  {msg.isThinking ? (
                    <div className="inline-flex items-center gap-3 bg-[#15110e] border border-white/[0.08] text-zinc-300 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-xl w-fit">
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-[#FC6301] animate-spin flex-shrink-0" />
                      <span className="text-zinc-300 text-sm font-normal">Thinking...</span>
                    </div>
                  ) : (
                    <div className="bg-[#15110e] border border-white/[0.08] text-zinc-200 rounded-2xl rounded-tl-sm px-5 py-4 text-sm sm:text-[14.5px] leading-relaxed space-y-3.5 shadow-xl w-full">
                      
                      {/* AI Content */}
                      {msg.content && (
                        <div className="whitespace-pre-line text-zinc-200">
                          {msg.content}
                        </div>
                      )}

                      {/* Structured Local Fallback Resolution if used */}
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
                        </div>
                      )}

                      {/* Answer Sources Dropdown & Helpful Feedback ONLY on genuine answer cards (NOT on greetings) */}
                      {!msg.isGreeting && (
                        <>
                          {/* Answer Sources Dropdown (Exact Screenshot 4) */}
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
                                  <span>Producer Toy Official Knowledge Base &bull; Technical Support Desk</span>
                                  <Link
                                    href="/library"
                                    className="inline-flex items-center gap-1 text-[#FC6301] hover:underline"
                                  >
                                    <span>Go to Library</span>
                                    <ExternalLink size={11} />
                                  </Link>
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
                        </>
                      )}

                      {/* Inline Ticket Escalation Form (If answer didn't help or requested) */}
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
                              onClick={() => handleCreateTicket(msg.id, msg.content || 'Technical Assistance')}
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

            {/* Writing Box at Bottom of Chat (Exact 1:1 Match with Epic Games Screenshot) */}
            <div className="pt-4 pb-12">
              <form
                onSubmit={handleChatSubmit}
                className="flex items-center gap-3 w-full"
              >
                {/* 3 Dots / Menu Button with End Chat Popover */}
                <div className="relative" ref={optionsMenuRef}>
                  {/* End Chat Popover Tooltip (Opens directly ABOVE the button) */}
                  {isOptionsMenuOpen && (
                    <div className="absolute bottom-full mb-3 left-0 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOptionsMenuOpen(false)
                          handleResetToHero()
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1c1410] hover:bg-[#281b15] border border-[#33221a] text-xs font-semibold text-zinc-200 hover:text-white shadow-2xl transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Ban size={13} className="text-zinc-400" />
                        <span>End chat</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsOptionsMenuOpen((prev) => !prev)}
                    title="Options"
                    aria-label="Chat options"
                    className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                      isOptionsMenuOpen
                        ? 'bg-[#241710] border-[#FC6301]/60 text-white'
                        : 'bg-[#16120e] hover:bg-[#1e1510] border-white/[0.08] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {/* Writing Box Input (Exact Epic Games rounded box with subtle border) */}
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Write a message..."
                  disabled={isTyping}
                  className="flex-1 bg-[#14100c] hover:bg-[#1a140f] focus:bg-[#1a140f] border border-white/15 focus:border-[#FC6301] rounded-2xl px-5 py-3.5 text-sm sm:text-[14.5px] text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                />

                {/* Circle Arrow Button (Producer Toy Orange) */}
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  aria-label="Send message"
                  className="w-11 h-11 rounded-full bg-[#FC6301] hover:bg-[#ff751a] disabled:opacity-30 disabled:hover:bg-[#FC6301] text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-lg shadow-[#FC6301]/25 active:scale-95"
                >
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </form>
            </div>
          </main>

        </div>
      )}
    </>
  )
}
