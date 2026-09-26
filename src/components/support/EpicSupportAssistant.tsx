'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  Lock,
  LogIn,
} from 'lucide-react'
import {
  KNOWLEDGE_BASE,
  KnowledgeArticle,
} from './supportKnowledgeData'
import { askGroqSupportAction, RecommendedProduct } from '@/actions/groqSupportAction'
import { createSupportTicketAction } from '@/actions/supportActions'
import { useAuth } from '@/context/AuthContext'

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  timestamp: string
  content?: string
  article?: KnowledgeArticle
  recommendedProducts?: RecommendedProduct[]
  userQuery?: string
  isSourcesOpen?: boolean
  feedback?: 'yes' | 'no'
  needsTicket?: boolean
  ticketNumber?: string
  isThinking?: boolean
  isGreeting?: boolean
}

interface AnswerSourceItem {
  title: string
  label: string
  href: string
}

function getAnswerSources(msg: ChatMessage): AnswerSourceItem[] {
  const sources: AnswerSourceItem[] = []
  const textCombined = `${msg.userQuery || ''} ${msg.content || ''}`.toLowerCase()

  // 1. If message specifically recommended products (e.g. Tabla Master's, Sexy Drill)
  if (msg.recommendedProducts && msg.recommendedProducts.length > 0) {
    for (const prod of msg.recommendedProducts) {
      sources.push({
        title: `Producer Toy Catalog • ${prod.name}`,
        label: `View ${prod.name}`,
        href: `/p/${prod.slug}`,
      })
    }
  }

  // 2. If message matched a local knowledge article
  if (msg.article) {
    if (msg.article.actionCta) {
      sources.push({
        title: `Producer Toy Knowledge Base • ${msg.article.categoryLabel}`,
        label: msg.article.actionCta.label,
        href: msg.article.actionCta.href,
      })
    } else {
      switch (msg.article.category) {
        case 'downloads':
        case 'serial_keys':
          sources.push({
            title: 'Producer Toy Official Cloud CDN • My Library',
            label: 'Go to Library',
            href: '/library',
          })
          break
        case 'free_and_licensing':
          sources.push({
            title: 'Producer Toy Official Licensing & Free Audio Tier',
            label: 'Browse Free VSTs',
            href: '/free-vst-plugins',
          })
          break
        case 'billing_invoices':
          sources.push({
            title: 'Producer Toy Orders, Invoices & Tax Desk',
            label: 'View Invoices',
            href: '/account?tab=transactions',
          })
          break
        case 'refunds':
          sources.push({
            title: 'Producer Toy Customer Guarantee & Refund Terms',
            label: 'Refund Policy',
            href: '/refund-policy',
          })
          break
        case 'account':
          sources.push({
            title: 'Producer Toy Account & Security Portal',
            label: 'Account Settings',
            href: '/account',
          })
          break
        default:
          sources.push({
            title: `Producer Toy Knowledge Base • ${msg.article.categoryLabel}`,
            label: 'Support Desk',
            href: '/support',
          })
          break
      }
    }
  }

  // 3. Extract markdown links from msg.content
  if (msg.content) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let match: RegExpExecArray | null
    while ((match = linkRegex.exec(msg.content)) !== null) {
      const linkText = match[1].trim()
      const linkHref = match[2].trim()

      if (!sources.some((s) => s.href === linkHref)) {
        let title = 'Producer Toy Official Knowledge Base'
        let label = linkText

        if (linkHref.startsWith('/p/')) {
          title = `Producer Toy Catalog • ${linkText}`
          label = `View ${linkText}`
        } else if (linkHref === '/store') {
          title = 'Producer Toy Store • Sound Catalog'
          label = 'Browse Store'
        } else if (linkHref === '/free-vst-plugins') {
          title = 'Producer Toy Free Audio Tier • 100% Free Tools'
          label = 'Browse Free VSTs'
        } else if (linkHref.startsWith('/account')) {
          title = 'Producer Toy Account & Transactions'
          label = 'Account Dashboard'
        } else if (linkHref === '/library') {
          title = 'Producer Toy Cloud Downloads • My Library'
          label = 'Go to Library'
        } else if (linkHref === '/refund-policy') {
          title = 'Producer Toy Customer Guarantee & Terms'
          label = 'Refund Policy'
        } else if (linkHref === '/support') {
          title = 'Producer Toy Technical Support Desk'
          label = 'Support Desk'
        }

        sources.push({ title, label, href: linkHref })
      }
    }
  }

  // 4. Keyword-based matching if no sources discovered yet
  if (sources.length === 0) {
    if (textCombined.includes('tabla') || textCombined.includes('indian')) {
      sources.push({
        title: "Producer Toy Catalog • Tabla Master's",
        label: "View Tabla Master's",
        href: '/p/tabla-masters',
      })
    } else if (textCombined.includes('drill') || textCombined.includes('808')) {
      sources.push({
        title: 'Producer Toy Catalog • Sexy Drill',
        label: 'View Sexy Drill',
        href: '/p/sexy-drill',
      })
    } else if (textCombined.includes('free') || textCombined.includes('vst') || textCombined.includes('plugin')) {
      sources.push({
        title: 'Producer Toy Free Audio Tier • Royalty-Free VSTs',
        label: 'Browse Free VSTs',
        href: '/free-vst-plugins',
      })
    } else if (textCombined.includes('sample') || textCombined.includes('pack') || textCombined.includes('loop') || textCombined.includes('sound') || textCombined.includes('store')) {
      sources.push({
        title: 'Producer Toy Store • Sample Packs & Audio Tools',
        label: 'Browse Store',
        href: '/store',
      })
    } else if (textCombined.includes('download') || textCombined.includes('purchase') || textCombined.includes('library') || textCombined.includes('serial')) {
      sources.push({
        title: 'Producer Toy Cloud Downloads • User Library',
        label: 'Go to Library',
        href: '/library',
      })
    } else if (textCombined.includes('invoice') || textCombined.includes('receipt') || textCombined.includes('billing') || textCombined.includes('transaction')) {
      sources.push({
        title: 'Producer Toy Orders & Tax Receipts',
        label: 'View Invoices',
        href: '/account?tab=transactions',
      })
    } else if (textCombined.includes('refund') || textCombined.includes('money back')) {
      sources.push({
        title: 'Producer Toy Customer Guarantee & Refund Terms',
        label: 'Refund Policy',
        href: '/refund-policy',
      })
    } else if (textCombined.includes('fl studio') || textCombined.includes('ableton') || textCombined.includes('logic') || textCombined.includes('daw') || textCombined.includes('install')) {
      sources.push({
        title: 'Producer Toy Technical Audio & DAW Integration Guide',
        label: 'Support Desk',
        href: '/support',
      })
    }
  }

  // 5. Final fallback
  if (sources.length === 0) {
    sources.push({
      title: 'Producer Toy Official Knowledge Base • Technical Support Desk',
      label: 'Support Desk',
      href: '/support',
    })
  }

  // Deduplicate by href
  const uniqueMap = new Map<string, AnswerSourceItem>()
  for (const s of sources) {
    if (!uniqueMap.has(s.href)) {
      uniqueMap.set(s.href, s)
    }
  }

  return Array.from(uniqueMap.values()).slice(0, 2)
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

  const { user } = useAuth()

  // Ticket creation inline state
  const [ticketName, setTicketName] = useState('')
  const [ticketEmail, setTicketEmail] = useState(initialEmail)
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)
  const [ticketError, setTicketError] = useState('')

  // Sync authenticated user info
  useEffect(() => {
    if (user?.email && !ticketEmail) {
      setTicketEmail(user.email)
    }
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
    if (fullName && !ticketName) {
      setTicketName(fullName)
    }
  }, [user])

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

  // Sticky sub-header bar state for Screen 2 (Exact Epic Games feature)
  const [isSubHeaderVisible, setIsSubHeaderVisible] = useState(false)

  useEffect(() => {
    if (!isChatStarted) {
      setIsSubHeaderVisible(false)
      return
    }

    const handleScroll = () => {
      // Reveal sticky sub-header when user scrolls down past header (> 90px)
      if (window.scrollY > 90) {
        setIsSubHeaderVisible(true)
      } else {
        setIsSubHeaderVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isChatStarted])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isChatStarted) {
      scrollToBottom()
    }
  }, [messages, isTyping, isChatStarted])

  // Parses markdown links [Text](/url) and bold **text** into clickable React elements without raw asterisks
  const renderBoldText = (text: string, keyPrefix: string): React.ReactNode => {
    if (!text) return null
    // If text has unmatched or stray double asterisks, clean them up safely
    const boldRegex = /\*\*([^*]+)\*\*/g
    const parts = text.split(boldRegex)
    if (parts.length === 1) {
      return text.replace(/\*\*/g, '')
    }

    return parts.map((part, pIdx) => {
      if (pIdx % 2 === 1) {
        return (
          <strong key={`${keyPrefix}-bold-${pIdx}`} className="font-semibold text-white">
            {part}
          </strong>
        )
      }
      return part.replace(/\*\*/g, '')
    })
  }

  const renderFormattedAnswer = (text: string) => {
    if (!text) return null

    // Clean up lines: remove leading asterisks or dashes
    const rawLines = text.split('\n')

    return rawLines.map((rawLine, lIdx) => {
      // Strip starting asterisks, dashes, or markdown headers (e.g. "* Item", "- Item", "### Header")
      const line = rawLine.replace(/^[\*\-]\s+/, '').replace(/^#{1,4}\s+/, '').trim()

      if (!line) {
        return <span key={lIdx} className="block h-2" />
      }

      // Check if line starts with a number like "1. " or "2. "
      const numMatch = line.match(/^(\d+\.)\s+(.*)$/)
      let prefix: React.ReactNode = null
      let contentToParse = line

      if (numMatch) {
        prefix = <span className="font-bold text-white mr-1.5">{numMatch[1]}</span>
        contentToParse = numMatch[2]
      }

      const elements: React.ReactNode[] = []
      let lastIndex = 0
      let match: RegExpExecArray | null

      // Matches bold links **[Text](url)** as well as standard [Text](url)
      const lineRegex = /(?:\*\*\[([^\]]+)\]\(([^)]+)\)\*\*|\[([^\]]+)\]\(([^)]+)\))/g
      while ((match = lineRegex.exec(contentToParse)) !== null) {
        const fullMatch = match[0]
        const linkText = match[1] || match[3]
        const url = match[2] || match[4]
        const isBold = fullMatch.startsWith('**')
        const matchIndex = match.index

        if (matchIndex > lastIndex) {
          const before = contentToParse.substring(lastIndex, matchIndex)
          elements.push(renderBoldText(before, `l-${lIdx}-b-${lastIndex}`))
        }

        const isExternal = url.startsWith('http://') || url.startsWith('https://')
        const linkContent = isBold ? (
          <strong className="font-bold">{linkText}</strong>
        ) : (
          linkText
        )

        if (isExternal) {
          elements.push(
            <a
              key={`link-${lIdx}-${matchIndex}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FC6301] hover:text-[#ff751a] font-semibold underline underline-offset-2 decoration-[#FC6301]/60 hover:decoration-[#ff751a] inline-flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              <span>{linkContent}</span>
              <ExternalLink size={12} className="inline ml-0.5" />
            </a>
          )
        } else {
          elements.push(
            <Link
              key={`link-${lIdx}-${matchIndex}`}
              href={url}
              className="text-[#FC6301] hover:text-[#ff751a] font-semibold underline underline-offset-2 decoration-[#FC6301]/60 hover:decoration-[#ff751a] transition-colors cursor-pointer"
            >
              {linkContent}
            </Link>
          )
        }

        lastIndex = matchIndex + fullMatch.length
      }

      if (lastIndex < contentToParse.length) {
        elements.push(renderBoldText(contentToParse.substring(lastIndex), `l-${lIdx}-a-${lastIndex}`))
      }

      return (
        <div key={lIdx} className="leading-relaxed">
          {prefix}
          {elements}
        </div>
      )
    })
  }

  // Fallback local matching
  const findLocalAnswer = (query: string): KnowledgeArticle | null => {
    const raw = query.trim().toLowerCase()
    if (!raw) return null

    const stopWords = new Set(['what', 'is', 'a', 'the', 'to', 'in', 'on', 'for', 'how', 'do', 'i', 'can', 'from', 'where', 'me', 'my', 'of'])
    const tokens = raw.split(/\s+/).filter((t) => t.length > 2 && !stopWords.has(t))
    if (tokens.length === 0) return null

    let bestArticle: KnowledgeArticle | null = null
    let highestScore = 0

    for (const article of KNOWLEDGE_BASE) {
      let score = 0
      const qLower = article.question.toLowerCase()
      const aLower = article.shortAnswer.toLowerCase()
      const tagString = article.tags.join(' ').toLowerCase()

      if (qLower.includes(raw)) score += 100
      if (tagString.includes(raw)) score += 80

      tokens.forEach((token) => {
        if (qLower.includes(token)) score += 25
        if (tagString.includes(token)) score += 20
        if (aLower.includes(token)) score += 5
      })

      if (score > highestScore) {
        highestScore = score
        bestArticle = article
      }
    }

    return highestScore >= 50 ? bestArticle : null
  }

  // Submit from Screen 1 (Hero Landing)
  const handleHeroSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const query = heroInput.trim()

    // Validation: Require descriptive query (at least 3 chars)
    if (!query || query.length < 3) {
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
                    recommendedProducts: groqRes.recommendedProducts,
                    userQuery: query,
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
                    userQuery: query,
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
                  userQuery: query,
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
                  recommendedProducts: groqRes.recommendedProducts,
                  userQuery: text,
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
                  userQuery: text,
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
                userQuery: text,
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
    const emailToSend = ticketEmail.trim() || user?.email || ''
    if (!emailToSend) {
      setTicketError('Please provide your email address.')
      return
    }

    setIsSubmittingTicket(true)
    setTicketError('')

    try {
      const customerName = ticketName.trim() || user?.user_metadata?.full_name || 'Producer'
      const queryText = subjectQuery || 'Technical Support Inquiry'

      // 1. Create ticket in Supabase database with user association
      const res = await createSupportTicketAction({
        name: customerName,
        email: emailToSend,
        category: 'Senior Audio Engineering Desk',
        priority: 'NORMAL',
        subject: queryText,
        description: `Customer submitted via Producer Toy Support Assistant.\nInquiry: "${queryText}".\nDirect senior audio engineer assistance requested.`,
      })

      if (res && res.success && res.ticketNumber) {
        // 2. Dispatch email directly to support@producertoy.com via FormSubmit.co
        try {
          await fetch('https://formsubmit.co/ajax/support@producertoy.com', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              _subject: `[Senior Audio Desk] New Support Ticket #${res.ticketNumber} from ${customerName}`,
              ticket_number: res.ticketNumber,
              customer_name: customerName,
              customer_email: emailToSend,
              account_type: user?.id ? `Registered Member (${user.email})` : 'Guest Account',
              inquiry_details: queryText,
              message: `New ticket #${res.ticketNumber} submitted to Senior Audio Engineering Desk.\n\nCustomer: ${customerName} (${emailToSend})\nInquiry Details: "${queryText}"\nCreated At: ${new Date().toLocaleString()}`,
              _replyto: emailToSend,
              _template: 'table',
              _captcha: 'false',
            }),
          })
        } catch (formSubmitErr) {
          console.warn('[FormSubmit Notification Warning]', formSubmitErr)
        }

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
    setIsSubHeaderVisible(false)
    setHeroInput('')
    setInputError('')
    setChatInput('')
    setMessages([])
    setIsTyping(false)
    setIsHeroLoading(false)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* SCREEN 1: HERO LANDING STATE (Exact 1:1 Epic Games Style in Orange Shade) */}
      {/* ========================================================================= */}
      {!isChatStarted ? (
        <div className="support-page-container relative w-full flex-1 min-h-[calc(100vh-76px)] bg-[#070503] text-white font-sans selection:bg-[#FC6301] selection:text-white overflow-hidden flex flex-col items-center justify-center">
          
          {/* Ambient Glowing Background: Exact Epic Games 3D angled geometry & elements in rich orange shade */}
          {/* Deep Volumetric Atmospheric Orange Glow & Light Cones */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_12%_15%,_rgba(252,99,1,0.40)_0%,_rgba(255,115,25,0.22)_32%,_rgba(245,158,11,0.08)_60%,_transparent_80%)] pointer-events-none z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_90%_25%,_rgba(252,99,1,0.20)_0%,_rgba(245,158,11,0.06)_40%,_transparent_70%)] pointer-events-none z-0" />

          {/* Large Angled Volumetric Light Shaft slicing from top-left across screen */}
          <div className="absolute -top-36 -left-32 w-[900px] h-[650px] -rotate-[38deg] bg-gradient-to-r from-[#FC6301]/40 via-amber-500/22 to-transparent blur-3xl pointer-events-none z-0" />
          <div className="absolute top-1/4 right-[2%] w-[260px] h-[600px] bg-gradient-to-b from-[#FC6301]/25 via-amber-600/12 to-transparent blur-3xl rounded-full pointer-events-none z-0" />
          
          {/* Authentic Producer Toy Musical Elements (Studio DAW EQ, Glowing Audio Waves, Musical Notes & Sequencer) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Neon Musical Gradients */}
              <linearGradient id="ptMusicGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe0b2" stopOpacity="1" />
                <stop offset="35%" stopColor="#ffb366" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#FC6301" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#d9480f" stopOpacity="0.4" />
              </linearGradient>

              <linearGradient id="ptAudioBarGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FC6301" stopOpacity="0.15" />
                <stop offset="60%" stopColor="#ff7a1a" stopOpacity="0.65" />
                <stop offset="95%" stopColor="#ffca80" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="ptWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FC6301" stopOpacity="0" />
                <stop offset="20%" stopColor="#ff7a1a" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#ffb366" stopOpacity="0.9" />
                <stop offset="80%" stopColor="#FC6301" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FC6301" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="ptVinylGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffaa40" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#FC6301" stopOpacity="0.15" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>

              {/* Glowing Filters for Studio Neon Illumination */}
              <filter id="ptMusicGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="ptSoftNoteBlur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            {/* --- 1. ANALOG SYNTH AUDIO SINE WAVEFORMS --- */}
            {/* Primary flowing audio frequency wave */}
            <path
              d="M-60,330 C180,240 320,400 540,320 C760,240 920,410 1140,330 C1280,270 1380,360 1500,320"
              fill="none"
              stroke="url(#ptWaveGrad)"
              strokeWidth="2.5"
              filter="url(#ptMusicGlow)"
              opacity="0.85"
            />
            {/* Secondary harmonic resonance wave */}
            <path
              d="M-40,350 Q120,290 280,360 T600,330 T920,370 T1240,320 T1480,350"
              fill="none"
              stroke="#ffaa40"
              strokeWidth="1.2"
              strokeDasharray="6 6"
              opacity="0.45"
            />

            {/* --- 2. FLOATING MUSICAL NOTES (♪, ♫, ♩) --- */}
            {/* Musical Element A: Large Beamed Eighth Note (♫) floating in mid-left field */}
            <g transform="translate(240, 240) rotate(-12)" filter="url(#ptMusicGlow)" opacity="0.9">
              {/* Left Note Head (Angled Ellipse) */}
              <ellipse cx="25" cy="85" rx="18" ry="13" transform="rotate(-20 25 85)" fill="url(#ptMusicGold)" />
              {/* Right Note Head */}
              <ellipse cx="85" cy="65" rx="18" ry="13" transform="rotate(-20 85 65)" fill="url(#ptMusicGold)" />
              {/* Vertical Stems */}
              <rect x="38" y="15" width="4.5" height="70" rx="2" fill="url(#ptMusicGold)" />
              <rect x="98" y="-5" width="4.5" height="70" rx="2" fill="url(#ptMusicGold)" />
              {/* Dual Top Connecting Beams */}
              <polygon points="38,15 102.5,-5 102.5,6 38,26" fill="url(#ptMusicGold)" />
              <polygon points="38,32 102.5,12 102.5,20 38,40" fill="url(#ptMusicGold)" opacity="0.8" />
              {/* Note Sparkle Accent */}
              <circle cx="28" cy="82" r="3.5" fill="#ffffff" opacity="0.8" />
              <circle cx="88" cy="62" r="3.5" fill="#ffffff" opacity="0.8" />
            </g>

            {/* Musical Element B: Floating Single Eighth Note (♪) with curved flag on right side */}
            <g transform="translate(1120, 260) rotate(14)" filter="url(#ptMusicGlow)" opacity="0.88">
              {/* Note Head */}
              <ellipse cx="25" cy="85" rx="17" ry="12" transform="rotate(-22 25 85)" fill="url(#ptMusicGold)" />
              {/* Stem */}
              <rect x="38" y="10" width="4.5" height="75" rx="2" fill="url(#ptMusicGold)" />
              {/* Curved Note Flag */}
              <path
                d="M42.5,10 C70,22 82,50 78,82 C72,55 58,40 42.5,35 Z"
                fill="url(#ptMusicGold)"
              />
              <circle cx="28" cy="82" r="3" fill="#ffffff" opacity="0.75" />
            </g>

            {/* Musical Element C: Soft Ambient Background Quarter Note (♩) near lower-left */}
            <g transform="translate(130, 480) rotate(-8)" filter="url(#ptSoftNoteBlur)" opacity="0.65">
              <ellipse cx="26" cy="80" rx="20" ry="14" transform="rotate(-20 26 80)" fill="url(#ptMusicGold)" />
              <rect x="41" y="5" width="5" height="75" rx="2" fill="url(#ptMusicGold)" />
            </g>

            {/* Musical Element D: Delicate Treble Clef Silhouette Flourish (Right background) */}
            <path
              d="M1280,480 C1270,450 1285,420 1305,420 C1325,420 1335,445 1320,470 C1305,495 1270,520 1270,555 C1270,580 1290,600 1315,595 C1330,590 1340,575 1335,560 C1330,548 1315,548 1310,558 M1300,390 L1300,620 C1300,640 1285,655 1265,650 C1250,645 1245,630 1255,620 C1265,612 1280,620 1280,630"
              fill="none"
              stroke="#FC6301"
              strokeWidth="2.4"
              strokeLinecap="round"
              filter="url(#ptMusicGlow)"
              opacity="0.5"
            />

            {/* --- 3. STUDIO DAW EQUALIZER (EQ) SPECTRUM VISUALIZER BARS --- */}
            {/* Left Cluster EQ Bars (Bass / Low-Mid Frequencies) */}
            <g transform="translate(340, 390)">
              {/* Horizontal Reference Line (-6dB mark) */}
              <line x1="-15" y1="50" x2="115" y2="50" stroke="#FC6301" strokeWidth="1" strokeDasharray="3 4" opacity="0.3" />
              {/* Frequency Bars */}
              <rect x="0" y="45" width="8" height="50" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.75" />
              <rect x="16" y="25" width="8" height="70" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.85" />
              <rect x="32" y="8" width="8" height="87" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.95" />
              <rect x="48" y="32" width="8" height="63" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.8" />
              <rect x="64" y="18" width="8" height="77" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.9" />
              <rect x="80" y="40" width="8" height="55" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.7" />
              <rect x="96" y="52" width="8" height="43" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.6" />

              {/* Peak Floating Decibel Indicator Dots */}
              <rect x="0" y="38" width="8" height="3" rx="1.5" fill="#ffe0b2" opacity="0.9" />
              <rect x="16" y="18" width="8" height="3" rx="1.5" fill="#ffe0b2" opacity="0.9" />
              <rect x="32" y="0" width="8" height="3.5" rx="1.5" fill="#ffffff" filter="url(#ptMusicGlow)" opacity="1" />
              <rect x="48" y="24" width="8" height="3" rx="1.5" fill="#ffe0b2" opacity="0.85" />
              <rect x="64" y="10" width="8" height="3" rx="1.5" fill="#ffe0b2" opacity="0.9" />
              <rect x="80" y="32" width="8" height="3" rx="1.5" fill="#ffe0b2" opacity="0.75" />
              <rect x="96" y="45" width="8" height="3" rx="1.5" fill="#ffe0b2" opacity="0.65" />
            </g>

            {/* Right Cluster EQ Bars (Mid / High-Treble Air Frequencies) */}
            <g transform="translate(1000, 390)">
              {/* Horizontal Reference Line (-6dB mark) */}
              <line x1="-15" y1="50" x2="115" y2="50" stroke="#FC6301" strokeWidth="1" strokeDasharray="3 4" opacity="0.3" />
              {/* Frequency Bars */}
              <rect x="0" y="48" width="8" height="47" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.65" />
              <rect x="16" y="30" width="8" height="65" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.8" />
              <rect x="32" y="14" width="8" height="81" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.9" />
              <rect x="48" y="5" width="8" height="90" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.95" />
              <rect x="64" y="28" width="8" height="67" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.85" />
              <rect x="80" y="44" width="8" height="51" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.7" />
              <rect x="96" y="55" width="8" height="40" rx="4" fill="url(#ptAudioBarGrad)" opacity="0.6" />

              {/* Peak Floating Decibel Indicator Dots */}
              <rect x="0" y="41" width="8" height="3" rx="1.5" fill="#ffe0b2" opacity="0.75" />
              <rect x="16" y="22" width="8" height="3" rx="1.5" fill="#ffe0b2" opacity="0.85" />
              <rect x="32" y="6" width="8" height="3" rx="1.5" fill="#ffe0b2" opacity="0.9" />
              <rect x="48" y="-3" width="8" height="3.5" rx="1.5" fill="#ffffff" filter="url(#ptMusicGlow)" opacity="1" />
              <rect x="64" y="20" width="8" height="3" rx="1.5" fill="#ffe0b2" opacity="0.85" />
              <rect x="80" y="36" width="8" height="3" rx="1.5" fill="#ffe0b2" opacity="0.75" />
              <rect x="96" y="48" width="8" height="3" rx="1.5" fill="#ffe0b2" opacity="0.6" />
            </g>

            {/* --- 4. STUDIO ROTARY CUTOFF KNOB & VINYL RECORD GROOVES --- */}
            <g transform="translate(160, 260)">
              {/* Concentric Vinyl Sampling Grooves */}
              <circle cx="0" cy="0" r="130" fill="none" stroke="url(#ptVinylGrad)" strokeWidth="1" strokeDasharray="6 8" opacity="0.45" />
              <circle cx="0" cy="0" r="95" fill="none" stroke="url(#ptVinylGrad)" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.55" />
              <circle cx="0" cy="0" r="60" fill="none" stroke="url(#ptVinylGrad)" strokeWidth="1.4" opacity="0.65" />
              {/* Synthesizer Rotary Filter Knob Active Arc (Cutoff 75%) */}
              <circle cx="0" cy="0" r="32" fill="#140a04" stroke="#FC6301" strokeWidth="2" opacity="0.9" />
              <path
                d="M -22,22 A 32,32 0 1,1 22,22"
                fill="none"
                stroke="#ffaa40"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#ptMusicGlow)"
              />
              {/* Indicator Notch */}
              <line x1="0" y1="-18" x2="0" y2="-28" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" filter="url(#ptMusicGlow)" />
            </g>

            {/* --- 5. 16-STEP BEAT SEQUENCER (808 / MPC DRUM GRID UNDER SEARCH) --- */}
            <g transform="translate(460, 600)" opacity="0.6">
              {/* Sequencer Track Rail */}
              <line x1="0" y1="8" x2="520" y2="8" stroke="#FC6301" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
              {/* 16 Step Rhythm Trigger Pads with Accent on Quarter Beats (1, 5, 9, 13) */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((step) => {
                const isDownbeat = step % 4 === 0
                return (
                  <circle
                    key={step}
                    cx={step * 34.5 + 8}
                    cy={8}
                    r={isDownbeat ? 5 : 3}
                    fill={isDownbeat ? '#ffca80' : '#FC6301'}
                    filter={isDownbeat ? 'url(#ptMusicGlow)' : undefined}
                    opacity={isDownbeat ? 0.95 : 0.6}
                  />
                )
              })}
            </g>
          </svg>

          {/* Floating Glowing Bokeh Dust Particles (Subtle Animation) */}
          <div className="absolute top-1/4 left-[24%] w-3 h-3 rounded-full bg-[#FC6301] blur-[1px] opacity-80 pointer-events-none z-0 animate-pulse" />
          <div className="absolute top-[32%] left-[28%] w-1.5 h-1.5 rounded-full bg-amber-400 opacity-95 pointer-events-none z-0 shadow-[0_0_10px_#f59e0b]" />
          <div className="absolute bottom-1/3 left-[17%] w-4 h-4 rounded-full bg-[#ff7824] blur-[2px] opacity-75 pointer-events-none z-0" />
          <div className="absolute top-[22%] right-[23%] w-2 h-2 rounded-full bg-amber-400 opacity-75 pointer-events-none z-0 shadow-[0_0_8px_#f59e0b]" />
          <div className="absolute bottom-1/4 right-[21%] w-3 h-3 rounded-full bg-[#FC6301] blur-[1px] opacity-80 pointer-events-none z-0 animate-pulse" />
          <div className="absolute top-[48%] left-[14%] w-2 h-2 rounded-full bg-amber-300 opacity-85 pointer-events-none z-0 shadow-[0_0_6px_#fcd34d]" />
          <div className="absolute top-[60%] right-[32%] w-1.5 h-1.5 rounded-full bg-[#ff9a42] opacity-75 pointer-events-none z-0" />

          {/* Center ambient warm aura behind heading */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[950px] h-[520px] bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,_rgba(252,99,1,0.18),_transparent_70%)] blur-3xl pointer-events-none z-0" />

          {/* Server Status: Exact Epic Games style with green dot & checkmark */}
          <div className="absolute top-5 right-6 sm:top-6 sm:right-10 z-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-[#140e0a] border border-[#2b201a] text-xs text-zinc-300 shadow-xl">
              <span className="text-zinc-400 font-normal">Server status:</span>
              <span className="inline-flex items-center gap-1.5 text-[#00d66c] font-semibold text-xs">
                <span className="w-3.5 h-3.5 rounded-full bg-[#00d66c] flex items-center justify-center text-black">
                  <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                All systems operational
              </span>
            </div>
          </div>

          {/* Center Hero Heading & Input (Strictly centered 1:1 with Epic Games) */}
          <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 w-full py-8 flex flex-col items-center justify-center text-center my-auto">
            <div className="space-y-2 mb-7 sm:mb-8">
              <p className="text-sm sm:text-[15px] font-medium text-zinc-300 tracking-normal">
                Producer Toy Support
              </p>
              <h1 className="text-4xl sm:text-[48px] font-bold text-white tracking-tight leading-tight">
                How can we help?
              </h1>
            </div>

            {/* Problem Input Box: Exact 1:1 match with Epic Games screenshot */}
            <form onSubmit={handleHeroSubmit} className="w-full max-w-[650px] mx-auto">
              <div className="flex items-center gap-3 w-full">
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => {
                    setHeroInput(e.target.value)
                    if (inputError) setInputError('')
                  }}
                  placeholder="Describe your problem here"
                  className={`flex-1 bg-[#130d08] hover:bg-[#18100a] focus:bg-[#18100a] border rounded-[10px] px-5 py-3 sm:py-3.5 text-sm sm:text-[15px] text-white placeholder-zinc-500 focus:outline-none transition-all shadow-xl ${
                    inputError
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-white/20 hover:border-white/30 focus:border-[#FC6301]'
                  }`}
                />

                <button
                  type="submit"
                  disabled={isHeroLoading || heroInput.trim().length < 3}
                  aria-label="Submit problem"
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    heroInput.trim().length >= 3
                      ? 'bg-[#FC6301] hover:bg-[#ff751a] text-white shadow-lg shadow-[#FC6301]/40 cursor-pointer active:scale-95'
                      : 'bg-white/[0.07] text-white/20 border border-white/5 cursor-not-allowed pointer-events-none'
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

            {/* Disclaimer Note (Underlined links exactly like Epic Games screenshot) */}
            <p className="text-xs text-zinc-400 mt-4.5">
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
        /* SCREEN 2: CHAT ASSISTANT INTERACTION (100% Crisp, Pure Dark, No Overlays) */
        /* ========================================================================= */
        <div className="support-page-container w-full flex-1 min-h-[calc(100vh-76px)] bg-[#080706] text-white font-sans flex flex-col justify-between relative">
          
          {/* Epic Games Sticky Sub-Header: Seamless extension of site header with centered title (Solid, Zero Glassmorphism) */}
          <div
            className={`fixed top-[60px] sm:top-[72px] lg:top-[76px] left-0 right-0 z-40 h-13 sm:h-14 bg-[#121212] border-b border-[#252525] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center px-4 ${
              isSubHeaderVisible
                ? 'translate-y-0 opacity-100 shadow-md shadow-black/50 pointer-events-auto'
                : '-translate-y-full opacity-0 pointer-events-none'
            }`}
          >
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.24em] uppercase text-zinc-200 select-none font-sans">
              Producer Toy Support Assistant
            </span>
          </div>

          {/* Header Title with Self-Contained Glow strictly behind title (Never touches messages) */}
          <div className="text-center pt-8 pb-3 relative overflow-hidden">
            {/* Ambient Glow strictly behind the header title area */}
            <div className="absolute inset-0 pointer-events-none -z-0 overflow-hidden">
              <div className="absolute -top-16 -left-16 w-[500px] h-[220px] -rotate-45 bg-gradient-to-r from-[#FC6301]/25 via-amber-500/15 to-transparent blur-3xl" />
              <div className="absolute top-2 left-1/4 w-[340px] h-[180px] bg-[#FC6301]/10 rounded-full blur-[90px]" />
              <div className="absolute top-2 right-1/4 w-[340px] h-[180px] bg-amber-600/10 rounded-full blur-[90px]" />
            </div>

            <button
              onClick={handleResetToHero}
              className="absolute left-4 sm:left-8 top-8 text-zinc-400 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer transition-colors px-3 py-1.5 rounded-lg bg-[#14100c] border border-white/10 relative z-10"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Start over</span>
            </button>

            <div className="space-y-1 relative z-10">
              <p className="text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-zinc-400 font-mono">
                Your Chat With
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Producer Toy Support Assistant
              </h2>
            </div>

            {/* Date Pill */}
            <div className="pt-3 relative z-10">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#16120e] border border-white/10 text-[11px] text-zinc-400 font-medium shadow-sm">
                {formatCurrentDate()}
              </span>
            </div>
          </div>

          {/* Main Chat Feed (100% Crystal Clear, Crisp Full Opacity on All Messages) */}
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
                  
                  {/* Assistant Header: Clean Robot Avatar (NO box, NO squeezing) + Name + Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 px-1">
                    <Image
                      src="/images/robot-avatar.png"
                      alt="Producer Toy Support Assistant"
                      width={22}
                      height={22}
                      className="w-[22px] h-[22px] object-contain shrink-0"
                    />
                    <span className="font-semibold text-zinc-200 text-xs">Producer Toy Support Assistant</span>
                    <span className="text-[11px] text-zinc-500">{msg.timestamp}</span>
                  </div>

                  {/* Thinking Spinner Card with Clean Robot Avatar */}
                  {msg.isThinking ? (
                    <div className="inline-flex items-center gap-3 bg-[#18181c] border border-white/[0.08] text-zinc-300 rounded-2xl rounded-tl-sm px-6 py-4 shadow-xl w-fit">
                      <Image
                        src="/images/robot-avatar.png"
                        alt="Thinking..."
                        width={22}
                        height={22}
                        className="w-[22px] h-[22px] object-contain shrink-0"
                      />
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-[#FC6301] animate-spin flex-shrink-0" />
                      <span className="text-zinc-300 text-sm font-normal">Thinking...</span>
                    </div>
                  ) : (
                    <div className="bg-[#18181c] border border-white/[0.08] text-[#d1d1d6] rounded-2xl rounded-tl-sm p-6 sm:p-7 text-[14.5px] sm:text-[15px] leading-relaxed space-y-4 shadow-2xl w-full">
                      
                      {/* AI Content with Clickable Direct Redirect Links */}
                      {msg.content && (
                        <div className="text-[#d1d1d6] leading-relaxed space-y-2">
                          {renderFormattedAnswer(msg.content)}
                        </div>
                      )}

                      {/* Product Overview Poster Cards (Rendered with high-res poster, details, and direct button) */}
                      {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                        <div className="pt-2 pb-1 space-y-3">
                          {msg.recommendedProducts.map((prod) => (
                            <div
                              key={prod.id}
                              className="rounded-xl bg-[#202024] border border-[#2f2f35] hover:border-[#FC6301]/60 p-4 sm:p-5 transition-all duration-200 shadow-lg group"
                            >
                              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                                {/* Poster Image with Zoom on hover */}
                                <Link
                                  href={`/p/${prod.slug}`}
                                  className="w-full sm:w-32 h-36 sm:h-32 rounded-lg overflow-hidden shrink-0 relative bg-[#151518] border border-[#303036] shadow-sm group-hover:border-[#FC6301]/50 transition-colors block"
                                >
                                  <Image
                                    src={prod.cover_image}
                                    alt={prod.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, 128px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </Link>

                                {/* Product Details & Overview (Clean Minimalist Solid Style) */}
                                <div className="flex-1 space-y-2 text-left w-full">
                                  {/* Title and Price Header */}
                                  <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <Link href={`/p/${prod.slug}`}>
                                      <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FC6301] transition-colors flex items-center gap-1.5">
                                        <span>{prod.name}</span>
                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#FC6301]" />
                                      </h4>
                                    </Link>

                                    <div className="flex items-baseline gap-1.5">
                                      {prod.original_price_usd && (
                                        <span className="text-xs text-zinc-500 line-through">
                                          ${prod.original_price_usd}
                                        </span>
                                      )}
                                      <span className="text-base font-extrabold text-white">
                                        ${prod.price_usd}
                                      </span>
                                    </div>
                                  </div>

                                  <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                                    {prod.short_description ||
                                      'High-fidelity, professionally recorded sounds crafted specifically for music producers and beatmakers.'}
                                  </p>

                                  {/* Action button aligned to right */}
                                  <div className="pt-2 flex justify-end">
                                    <Link
                                      href={`/p/${prod.slug}`}
                                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FC6301] hover:bg-[#ff751a] text-white font-bold text-xs shadow-md transition-all shrink-0 active:scale-95"
                                    >
                                      <span>View Product</span>
                                      <ArrowRight size={13} strokeWidth={2.5} />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
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
                          {/* Answer Sources Dropdown (Exact Match with Epic Games Screenshot) */}
                          <div className="pt-2">
                            <button
                              onClick={() => toggleSources(msg.id)}
                              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#222227] hover:bg-[#2b2b32] border border-white/5 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer font-medium"
                            >
                              <span>Answer sources</span>
                              {msg.isSourcesOpen ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
                            </button>

                            {msg.isSourcesOpen && (
                              <div className="mt-2 p-3 rounded-xl bg-[#18181c] border border-[#2b2b32] space-y-2.5 text-xs animate-in fade-in">
                                {getAnswerSources(msg).map((source, sIdx) => (
                                  <div key={sIdx} className="flex items-center justify-between text-zinc-300 gap-3">
                                    <span className="truncate text-zinc-300 font-normal">{source.title}</span>
                                    <Link
                                      href={source.href}
                                      className="inline-flex items-center gap-1 text-[#FC6301] hover:underline font-medium shrink-0"
                                    >
                                      <span>{source.label}</span>
                                      <ExternalLink size={11} />
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Helpful feedback toggle (Solid Buttons, Zero Glassmorphism) */}
                          <div className="pt-3 border-t border-[#26262b] flex items-center justify-between text-xs text-zinc-400">
                            <span>Did this solve your problem?</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleFeedback(msg.id, true)}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                                  msg.feedback === 'yes'
                                    ? 'bg-emerald-600 text-white border-emerald-500'
                                    : 'bg-[#222228] text-zinc-300 hover:text-white border-[#33333d]'
                                }`}
                              >
                                <ThumbsUp size={12} />
                                <span>Yes</span>
                              </button>
                              <button
                                onClick={() => handleFeedback(msg.id, false)}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                                  msg.feedback === 'no'
                                    ? 'bg-rose-600 text-white border-rose-500'
                                    : 'bg-[#222228] text-zinc-300 hover:text-white border-[#33333d]'
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
                          {!user ? (
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#FC6301]/20 flex items-center justify-center shrink-0 text-[#FC6301] mt-0.5">
                                  <Lock size={15} />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-white">
                                    Sign In Required for Ticket Tracking
                                  </p>
                                  <p className="text-xs text-zinc-400 leading-relaxed">
                                    Please sign in to your Producer Toy account to submit this ticket to our senior audio engineering desk. This allows our team to connect your licenses and enables 1-click tracking from your dashboard.
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 pt-1">
                                <Link
                                  href={`/auth?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/support')}`}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FC6301] hover:bg-[#ea580c] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                                >
                                  <LogIn size={13} />
                                  <span>Sign In to Submit & Track</span>
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-zinc-200 font-medium">
                                  Submit this request directly to our senior audio engineering desk:
                                </p>
                                <span className="text-[10px] text-zinc-400 bg-[#221812] px-2 py-0.5 rounded border border-[#332218]">
                                  {user.email}
                                </span>
                              </div>

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
                            </>
                          )}
                        </div>
                      )}

                      {/* Ticket Confirmation (Solid Opaque, Zero Glassmorphism) */}
                      {msg.ticketNumber && (
                        <div className="p-4 rounded-xl bg-[#142019] border border-[#22442e] space-y-2.5 text-xs text-emerald-300 shadow-lg animate-in fade-in">
                          <p className="font-semibold flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 size={14} />
                            Ticket #{msg.ticketNumber} created!
                          </p>
                          <p className="text-zinc-300 leading-relaxed">
                            Our senior audio engineers have received your inquiry at <span className="text-white font-medium">support@producertoy.com</span>. A confirmation was sent to <span className="text-white font-medium">{ticketEmail}</span>.
                          </p>
                          <div className="pt-1">
                            <Link
                              href="/account"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1b3324] hover:bg-[#23422e] border border-[#2d583b] text-emerald-200 hover:text-white font-medium text-xs transition-colors"
                            >
                              <span>Track in Account Dashboard</span>
                              <ExternalLink size={12} />
                            </Link>
                          </div>
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

                {/* Circle Arrow Button (Exact Epic Games Dynamic States, Zero Glassmorphism) */}
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  aria-label="Send message"
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 active:scale-95 ${
                    chatInput.trim().length > 0
                      ? 'bg-[#FC6301] hover:bg-[#ff751a] text-white shadow-lg shadow-[#FC6301]/40 cursor-pointer'
                      : 'bg-white/[0.07] text-white/20 border border-white/5 cursor-not-allowed pointer-events-none'
                  }`}
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
