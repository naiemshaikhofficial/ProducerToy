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
          "Hey 👋 I'm the Producer Toy Support Assistant. I'm here to help you with your Producer Toy questions and issues.",
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
        <div className="support-page-container relative w-full flex-1 min-h-[calc(100vh-76px)] bg-[#0c0a1a] text-white font-sans selection:bg-[#0074e4] selection:text-white overflow-hidden flex flex-col items-center justify-center">
          
          {/* Ambient Glowing Background Lights matching Epic Games screenshot */}
          <div className="absolute inset-0 bg-[#0c0a1a] pointer-events-none -z-0" />
          
          {/* Angled neon violet/magenta light beam on left */}
          <div className="absolute -top-20 -left-20 w-[650px] h-[350px] -rotate-45 bg-gradient-to-r from-purple-600/30 via-fuchsia-600/20 to-transparent blur-3xl pointer-events-none -z-0" />
          <div className="absolute top-1/4 left-1/10 w-[420px] h-[420px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-0" />

          {/* Deep ambient violet bloom in center & bottom */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] h-[650px] bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,_rgba(147,51,234,0.14),_rgba(88,28,135,0.06)_50%,_transparent_80%)] blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none -z-0" />

          {/* Server Status Pill (Top Right Corner, as circled in screenshot) */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#141026]/90 border border-white/10 text-xs sm:text-[13px] text-zinc-300 shadow-xl backdrop-blur-md">
              <span className="text-zinc-400">Server status:</span>
              <span className="inline-flex items-center gap-1.5 text-[#00d66c] font-medium text-xs sm:text-[13px]">
                <span className="w-3.5 h-3.5 rounded-full bg-[#00d66c] flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                All systems operational
              </span>
            </div>
          </div>

          {/* Center Hero Heading & Input (Strictly centered vertically & horizontally) */}
          <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 w-full py-8 flex flex-col items-center justify-center text-center my-auto">
            <div className="space-y-2.5 mb-6 sm:mb-8">
              <p className="text-sm sm:text-base font-normal text-zinc-300 tracking-normal">
                Producer Toy Support
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-[54px] font-bold text-white tracking-tight leading-tight">
                How can we help?
              </h1>
            </div>

            {/* Problem Input Box + Blue Circle Arrow Button */}
            <form onSubmit={handleHeroSubmit} className="w-full max-w-[580px] mx-auto">
              <div className="flex items-center gap-3 w-full">
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => {
                    setHeroInput(e.target.value)
                    if (inputError) setInputError('')
                  }}
                  placeholder="Describe your problem here"
                  className={`flex-1 bg-[#141026]/90 hover:bg-[#191430] focus:bg-[#191430] border rounded-xl px-5 py-3.5 sm:py-4 text-sm sm:text-[15px] text-white placeholder-zinc-400 focus:outline-none transition-all shadow-2xl backdrop-blur-md ${
                    inputError
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-white/15 focus:border-[#0074e4]'
                  }`}
                />

                <button
                  type="submit"
                  disabled={isHeroLoading}
                  aria-label="Submit problem"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0074e4] hover:bg-[#0062c4] active:scale-95 text-white flex items-center justify-center transition-all shadow-lg shadow-[#0074e4]/30 cursor-pointer flex-shrink-0"
                >
                  {isHeroLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  )}
                </button>
              </div>

              {/* Validation Error: ▲ Describe the problem in more detail. */}
              {inputError && (
                <div className="text-left pt-2.5 px-3 flex items-center gap-1.5 text-xs text-rose-400 font-medium animate-in fade-in">
                  <AlertTriangle size={13} className="text-rose-500 flex-shrink-0" />
                  <span>{inputError}</span>
                </div>
              )}
            </form>

            {/* Disclaimer Note */}
            <p className="text-xs sm:text-[13px] text-zinc-400/90 mt-5 sm:mt-6">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-zinc-300 hover:text-white underline underline-offset-2">
                Terms
              </Link>{' '}
              and acknowledge our{' '}
              <Link href="/privacy" className="text-zinc-300 hover:text-white underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </main>
        </div>
      ) : (
        /* ========================================================================= */
        /* SCREEN 2: CHAT ASSISTANT INTERACTION (Full Website Scroll, Exact Theme)   */
        /* ========================================================================= */
        <div className="support-page-container w-full flex-1 min-h-[calc(100vh-76px)] bg-[#0c0a1a] text-white font-sans flex flex-col justify-between relative">
          
          {/* Header Title: YOUR CHAT WITH / Producer Toy Support Assistant */}
          <div className="text-center pt-8 pb-3 relative bg-[#0c0a1a]">
            <button
              onClick={handleResetToHero}
              className="absolute left-4 sm:left-8 top-8 text-zinc-400 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer transition-colors px-3 py-1.5 rounded-lg bg-[#141026] border border-white/10"
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

            {/* Date Pill */}
            <div className="pt-3">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#16122a] border border-white/10 text-[11px] text-zinc-400 font-medium">
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
                    /* Full Assistant Response Card (Exact Match with Circled Screenshot) */
                    <div className="bg-[#15110e] border border-white/[0.08] text-zinc-200 rounded-2xl rounded-tl-sm p-6 text-sm sm:text-[14.5px] leading-relaxed space-y-4 shadow-2xl w-full">
                      
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

                {/* Writing Box Input */}
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Write a message..."
                  disabled={isTyping}
                  className="flex-1 bg-[#141026] hover:bg-[#18132e] focus:bg-[#18132e] border border-white/10 focus:border-[#0074e4] rounded-xl px-5 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                />

                {/* Circle Arrow Button (Epic blue) */}
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  aria-label="Send message"
                  className="w-11 h-11 rounded-full bg-[#0074e4] hover:bg-[#0062c4] disabled:opacity-30 disabled:hover:bg-[#0074e4] text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-lg shadow-[#0074e4]/25 active:scale-95"
                >
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </main>

        </div>
      )}
    </>
  )
}
