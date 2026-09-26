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
  MoreVertical,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ArrowLeft,
  Ban,
  Lock,
  LogIn,
  RotateCcw,
  Download,
  Receipt,
  FileText,
  ShieldCheck,
  Bell,
} from 'lucide-react'
import {
  KNOWLEDGE_BASE,
  KnowledgeArticle,
} from './supportKnowledgeData'
import {
  askGroqSupportAction,
  RecommendedProduct,
  VerifiedDownload,
  VerifiedOrder,
  ComingSoonProduct,
  subscribeDropAlertAction,
} from '@/actions/groqSupportAction'
import { openPrintableInvoice } from '@/lib/invoiceUtils'
import { createSupportTicketAction } from '@/actions/supportActions'
import { useAuth } from '@/context/AuthContext'

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  timestamp: string
  content?: string
  article?: KnowledgeArticle
  recommendedProducts?: RecommendedProduct[]
  verifiedDownload?: VerifiedDownload | null
  verifiedOrder?: VerifiedOrder | null
  comingSoonProduct?: ComingSoonProduct | null
  canEscalateToTicket?: boolean
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

function ComingSoonAlertBox({
  productName,
  productSlug,
  initialEmail,
}: {
  productName: string
  productSlug: string
  initialEmail: string
}) {
  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail)
  }, [initialEmail])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setStatus('loading')
    try {
      const res = await subscribeDropAlertAction(email, productSlug, productName)
      setStatus('success')
      setMsg(res.message || `You're on the list! We'll alert you the moment ${productName} drops.`)
    } catch {
      setStatus('success')
      setMsg(`Notification alert set for ${email}!`)
    }
  }

  if (status === 'success') {
    return (
      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
        <CheckCircle2 size={14} className="shrink-0" />
        <span>{msg}</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email for instant drop alert..."
          className="flex-1 min-w-[200px] bg-[#1a1a1e] border border-[#2e2e36] focus:border-[#FC6301] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FC6301] hover:bg-[#ff751a] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
        >
          {status === 'loading' ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Bell size={12} />
          )}
          <span>Notify Me on Drop</span>
        </button>
      </div>
      <p className="text-[10.5px] text-zinc-400 leading-normal">
        You will receive a VIP early-access launch notification the exact minute {productName} is live in the store.
      </p>
    </form>
  )
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
  const [isChatEnded, setIsChatEnded] = useState(false)

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

  // Parses markdown links [Text](/url), bold **text**, and single *text* into clean bold elements without raw asterisks
  const renderBoldText = (text: string, keyPrefix: string): React.ReactNode => {
    if (!text) return null

    // Match both **bold** and *italic/bold*
    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g
    const elements: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    let idx = 0

    while ((match = regex.exec(text)) !== null) {
      const matchStart = match.index
      const matchEnd = regex.lastIndex

      if (matchStart > lastIndex) {
        const plainText = text.substring(lastIndex, matchStart).replace(/\*/g, '')
        if (plainText) {
          elements.push(<span key={`${keyPrefix}-t-${idx++}`}>{plainText}</span>)
        }
      }

      // match[2] is inside **, match[3] is inside *
      const boldContent = match[2] || match[3] || ''
      if (boldContent) {
        elements.push(
          <strong key={`${keyPrefix}-b-${idx++}`} className="font-semibold text-white">
            {boldContent}
          </strong>
        )
      }

      lastIndex = matchEnd
    }

    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex).replace(/\*/g, '')
      if (remaining) {
        elements.push(<span key={`${keyPrefix}-t-${idx++}`}>{remaining}</span>)
      }
    }

    return elements.length > 0 ? elements : text.replace(/\*/g, '')
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

      setMessages([introMsg, userMsg, thinkingMsg])

      // Query Groq AI with fallback to local knowledge
      try {
        const clientUser = user
          ? {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.email?.split('@')[0],
            }
          : undefined

        const [groqRes] = await Promise.all([
          askGroqSupportAction(query, [], clientUser),
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
                    verifiedDownload: groqRes.verifiedDownload,
                    verifiedOrder: groqRes.verifiedOrder,
                    comingSoonProduct: groqRes.comingSoonProduct,
                    canEscalateToTicket: groqRes.canEscalateToTicket,
                    needsTicket: !!groqRes.canEscalateToTicket,
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
      const clientUser = user
        ? {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0],
          }
        : undefined

      const [groqRes] = await Promise.all([
        askGroqSupportAction(text, history, clientUser),
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
                  verifiedDownload: groqRes.verifiedDownload,
                  verifiedOrder: groqRes.verifiedOrder,
                  comingSoonProduct: groqRes.comingSoonProduct,
                  canEscalateToTicket: groqRes.canEscalateToTicket,
                  needsTicket: !!groqRes.canEscalateToTicket,
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
    if (helpful) {
      setIsChatEnded(true)
    }
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
      
      // Look up target message to extract the exact user question
      const targetMsg = messages.find((m) => m.id === msgId)
      const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user')
      const exactUserQuestion = 
        targetMsg?.userQuery?.trim() || 
        subjectQuery?.trim() || 
        lastUserMsg?.content?.trim() || 
        'Technical Support Inquiry'

      // Construct formatted full conversation transcript
      const conversationHistory = messages
        .filter((m) => !m.isThinking && (m.content || m.userQuery))
        .map((m) => {
          const role = m.sender === 'user' ? 'Customer' : 'Producer Toy Support Assistant'
          const text = m.content || m.userQuery || ''
          return `[${m.timestamp}] ${role}:\n${text}`
        })
        .join('\n\n--------------------\n\n')

      // 1. Create ticket in Supabase database with user association
      const res = await createSupportTicketAction({
        name: customerName,
        email: emailToSend,
        category: 'Senior Audio Engineering Desk',
        priority: 'NORMAL',
        subject: exactUserQuestion.slice(0, 150),
        description: `User Inquiry: "${exactUserQuestion}"\n\n=== FULL CONVERSATION TRANSCRIPT ===\n${conversationHistory}`,
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
              _subject: `[Senior Audio Desk] New Support Ticket #${res.ticketNumber}: "${exactUserQuestion}" from ${customerName}`,
              ticket_number: res.ticketNumber,
              customer_name: customerName,
              customer_email: emailToSend,
              account_type: user?.id ? `Registered Member (${user.email})` : 'Guest Account',
              user_question: exactUserQuestion,
              inquiry_details: exactUserQuestion,
              full_conversation: conversationHistory,
              message: `New ticket #${res.ticketNumber} submitted to Senior Audio Engineering Desk.\n\nCustomer: ${customerName} (${emailToSend})\nUser Question: "${exactUserQuestion}"\n\n=== FULL CONVERSATION TRANSCRIPT ===\n${conversationHistory}\n\nCreated At: ${new Date().toLocaleString()}`,
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
        setIsChatEnded(true)
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
    setIsChatEnded(false)
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
          
          {/* Epic Games Exact Match: Cinematic Camera Depth-of-Field Blurred Bokeh & Out-of-Focus 3D Stage Beams */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Camera Lens Depth-of-Field Blur Filters */}
              <filter id="epicBokehExtreme" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="30" />
              </filter>
              <filter id="epicBokehHeavy" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="18" />
              </filter>
              <filter id="epicBokehMedium" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
              <filter id="epicBokehSoft" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
              <filter id="epicNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Glowing Beams Gradients */}
              <linearGradient id="epicOrangeBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffb366" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#FC6301" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#d9480f" stopOpacity="0.1" />
              </linearGradient>

              <linearGradient id="epicMutedBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffaa40" stopOpacity="0.6" />
                <stop offset="60%" stopColor="#FC6301" stopOpacity="0.3" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="epicTrussFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FC6301" stopOpacity="0.12" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.04" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>

              {/* Music Notation Gradient */}
              <linearGradient id="musicNoteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe4c4" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#ffaa40" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FC6301" stopOpacity="0.4" />
              </linearGradient>

              {/* Music Wave Gradient */}
              <linearGradient id="musicWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffaa40" stopOpacity="0.1" />
                <stop offset="25%" stopColor="#FC6301" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#ffc078" stopOpacity="0.9" />
                <stop offset="75%" stopColor="#FC6301" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#d9480f" stopOpacity="0.1" />
              </linearGradient>

              {/* Circular Camera Aperture Bokeh Disc */}
              <radialGradient id="musicBokehCircle" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff0db" stopOpacity="0.55" />
                <stop offset="45%" stopColor="#ffaa40" stopOpacity="0.32" />
                <stop offset="85%" stopColor="#FC6301" stopOpacity="0.14" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* --- 1. FLOWING ANALOG AUDIO WAVEFORMS (CINEMATIC SOUNDSCAPES) --- */}
            {/* Primary Undulating Analog Audio Wave across midground */}
            <path
              d="M -60 380 C 140 240, 320 540, 540 360 S 840 200, 1080 430 S 1320 270, 1500 380"
              fill="none"
              stroke="url(#musicWaveGradient)"
              strokeWidth="4.5"
              filter="url(#epicBokehMedium)"
              opacity="0.85"
            />

            {/* High-Frequency Audio Ripple / Transient Wave */}
            <path
              d="M -40 440 Q 60 390, 160 440 T 360 440 T 560 440 T 760 440 T 960 440 T 1160 440 T 1360 440 T 1480 440"
              fill="none"
              stroke="url(#epicMutedBeam)"
              strokeWidth="2.5"
              filter="url(#epicBokehHeavy)"
              opacity="0.5"
            />

            {/* Deep Sub-Bass Ambient Wave (lower field depth) */}
            <path
              d="M -80 620 C 220 480, 500 740, 820 590 S 1220 470, 1520 640"
              fill="none"
              stroke="url(#epicOrangeBeam)"
              strokeWidth="6"
              filter="url(#epicBokehExtreme)"
              opacity="0.35"
            />

            {/* --- 2. GLOWING MUSICAL NOTATION WITH CAMERA DEPTH-OF-FIELD BOKEH --- */}
            {/* Beamed Eighth Note Pair ♫ (Mid-Left Floating Bokeh Disc) */}
            <g transform="translate(320, 350) rotate(-14) scale(1.15)" filter="url(#epicBokehMedium)">
              <ellipse cx="0" cy="40" rx="18" ry="12" transform="rotate(-25 0 40)" fill="url(#musicNoteGradient)" />
              <ellipse cx="62" cy="25" rx="18" ry="12" transform="rotate(-25 62 25)" fill="url(#musicNoteGradient)" />
              <rect x="14" y="-22" width="4.5" height="62" rx="2" fill="url(#musicNoteGradient)" />
              <rect x="76" y="-37" width="4.5" height="62" rx="2" fill="url(#musicNoteGradient)" />
              <polygon points="14,-22 80.5,-37 80.5,-24 14,-9" fill="url(#musicNoteGradient)" />
            </g>

            {/* Eighth Note with Curved Flag ♪ (Top-Right Atmospheric Bokeh) */}
            <g transform="translate(1120, 310) rotate(12) scale(1.05)" filter="url(#epicBokehMedium)">
              <ellipse cx="0" cy="30" rx="17" ry="11.5" transform="rotate(-25 0 30)" fill="url(#musicNoteGradient)" />
              <rect x="13" y="-32" width="4.2" height="62" rx="2" fill="url(#musicNoteGradient)" />
              <path d="M 17 -32 C 38 -25, 45 -5, 32 16 C 41 0, 37 -19, 17 -26 Z" fill="url(#musicNoteGradient)" />
            </g>

            {/* Foreground Deep-Blur Beamed Notes ♫ (Bottom-Left Depth) */}
            <g transform="translate(140, 630) rotate(-20) scale(1.5)" filter="url(#epicBokehExtreme)" opacity="0.38">
              <ellipse cx="0" cy="40" rx="24" ry="16" transform="rotate(-25 0 40)" fill="#FC6301" />
              <ellipse cx="78" cy="20" rx="24" ry="16" transform="rotate(-25 78 20)" fill="#FC6301" />
              <rect x="18" y="-32" width="6" height="72" rx="3" fill="#FC6301" />
              <rect x="96" y="-52" width="6" height="72" rx="3" fill="#FC6301" />
              <polygon points="18,-32 102,-52 102,-36 18,-16" fill="#FC6301" />
            </g>

            {/* Single Quarter Note ♩ (Lower-Right) */}
            <g transform="translate(900, 580) rotate(-10) scale(0.9)" filter="url(#epicBokehSoft)" opacity="0.55">
              <ellipse cx="0" cy="26" rx="15" ry="10" transform="rotate(-25 0 26)" fill="url(#musicNoteGradient)" />
              <rect x="12" y="-32" width="3.8" height="58" rx="1.8" fill="url(#musicNoteGradient)" />
            </g>

            {/* --- 3. DAW STUDIO AUDIO EQUALIZER SPECTRUM BARS (OUT-OF-FOCUS) --- */}
            <g transform="translate(610, 230)" filter="url(#epicBokehHeavy)" opacity="0.45">
              <rect x="0" y="45" width="9" height="55" rx="4.5" fill="url(#epicOrangeBeam)" />
              <rect x="18" y="22" width="9" height="78" rx="4.5" fill="url(#epicOrangeBeam)" />
              <rect x="36" y="8" width="9" height="92" rx="4.5" fill="url(#epicOrangeBeam)" />
              <rect x="54" y="32" width="9" height="68" rx="4.5" fill="url(#epicOrangeBeam)" />
              <rect x="72" y="14" width="9" height="86" rx="4.5" fill="url(#epicOrangeBeam)" />
              <rect x="90" y="38" width="9" height="62" rx="4.5" fill="url(#epicOrangeBeam)" />
              <rect x="108" y="55" width="9" height="45" rx="4.5" fill="url(#epicOrangeBeam)" />
              <rect x="126" y="34" width="9" height="66" rx="4.5" fill="url(#epicOrangeBeam)" />
              <rect x="144" y="18" width="9" height="82" rx="4.5" fill="url(#epicOrangeBeam)" />
              <rect x="162" y="48" width="9" height="52" rx="4.5" fill="url(#epicOrangeBeam)" />
            </g>

            {/* --- 4. STUDIO MONITOR ACOUSTIC SOUND RIPPLE RINGS --- */}
            <g transform="translate(230, 470)" filter="url(#epicBokehHeavy)" opacity="0.32">
              <circle cx="0" cy="0" r="75" fill="none" stroke="#FC6301" strokeWidth="2.5" strokeDasharray="6 8" />
              <circle cx="0" cy="0" r="120" fill="none" stroke="#ffaa40" strokeWidth="2" strokeDasharray="10 12" />
              <circle cx="0" cy="0" r="165" fill="none" stroke="#FC6301" strokeWidth="1.5" strokeDasharray="14 16" />
            </g>

            {/* --- 5. NATURAL CIRCULAR CAMERA APERTURE BOKEH ORBS --- */}
            <circle cx="480" cy="430" r="42" fill="url(#musicBokehCircle)" filter="url(#epicBokehMedium)" opacity="0.8" />
            <circle cx="280" cy="300" r="56" fill="url(#musicBokehCircle)" filter="url(#epicBokehHeavy)" opacity="0.65" />
            <circle cx="1060" cy="390" r="48" fill="url(#musicBokehCircle)" filter="url(#epicBokehMedium)" opacity="0.75" />
            <circle cx="740" cy="650" r="64" fill="url(#musicBokehCircle)" filter="url(#epicBokehHeavy)" opacity="0.5" />
            <circle cx="860" cy="560" r="32" fill="url(#musicBokehCircle)" filter="url(#epicBokehSoft)" opacity="0.7" />
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
        <div className="support-page-container w-full h-[calc(100dvh-60px)] sm:h-[calc(100dvh-72px)] lg:h-[calc(100dvh-76px)] bg-[#080706] text-white font-sans flex flex-col overflow-hidden relative">
          
          {/* 1. Epic Games Sticky Header (Fixed at top of chat view, Zero Glassmorphism) */}
          <div className="flex-shrink-0 w-full bg-[#080706] z-20 relative">
            <div className="w-full h-12 sm:h-13 flex items-center justify-center px-4 border-b border-white/[0.04]">
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.24em] uppercase text-zinc-300 select-none font-sans">
                Producer Toy Support Assistant
              </span>
            </div>
            {/* Top Dissolve Gradient: Messages fade smoothly into background as they scroll up */}
            <div 
              className="absolute top-full left-0 right-0 h-10 sm:h-14 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to bottom, #080706 0%, rgba(8, 7, 6, 0.85) 40%, rgba(8, 7, 6, 0.3) 75%, transparent 100%)',
              }}
            />
          </div>

          {/* 2. Scrollable Chat Feed Area (ONLY THIS SCROLLS!) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden w-full relative z-0">
            {/* Header Title with Seamlessly Dissolved Musical Bokeh Atmosphere */}
            <div className="relative w-full pt-8 pb-2 text-center select-none">
            {/* Seamless Ambient Musical Bokeh Backdrop: 100% dissolved into #080706 with ZERO cutoff line */}
            <div 
              className="absolute inset-x-0 top-0 h-[340px] pointer-events-none select-none overflow-hidden -z-0"
              style={{
                maskImage: 'linear-gradient(to bottom, black 25%, rgba(0,0,0,0.6) 65%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 25%, rgba(0,0,0,0.6) 65%, transparent 100%)'
              }}
            >
              {/* Deep Atmospheric Studio Stage Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[220px] bg-[radial-gradient(ellipse_75%_50%_at_50%_10%,_rgba(252,99,1,0.16)_0%,_rgba(255,123,43,0.06)_45%,_transparent_75%)] blur-3xl" />
              <div className="absolute -top-16 -left-12 w-[500px] h-[200px] -rotate-[30deg] bg-gradient-to-r from-[#FC6301]/16 via-amber-500/08 to-transparent blur-3xl" />
              <div className="absolute -top-16 -right-12 w-[500px] h-[200px] rotate-[30deg] bg-gradient-to-l from-[#FC6301]/14 via-amber-600/06 to-transparent blur-3xl" />

              {/* Chat Header Musical Bokeh SVG (Center kept completely clean and dark for 100% text contrast) */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1200 340"
                preserveAspectRatio="xMidYMin slice"
              >
                <defs>
                  <filter id="chatBokehHeavy" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="16" />
                  </filter>
                  <filter id="chatBokehMedium" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="8" />
                  </filter>
                  <linearGradient id="chatNoteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffe4c4" stopOpacity="0.75" />
                    <stop offset="45%" stopColor="#ffaa40" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#FC6301" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="chatWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="20%" stopColor="#FC6301" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="#ffaa40" stopOpacity="0.45" />
                    <stop offset="80%" stopColor="#FC6301" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>

                {/* Soft Glowing Audio Wave traversing far behind header */}
                <path
                  d="M 20 180 C 220 110, 420 240, 600 170 S 950 90, 1180 190"
                  fill="none"
                  stroke="url(#chatWaveGrad)"
                  strokeWidth="3"
                  filter="url(#chatBokehMedium)"
                  opacity="0.45"
                />

                {/* Soft Blurred Floating Beamed Notes ♫ (Far left side) */}
                <g transform="translate(180, 100) rotate(-14) scale(0.7)" filter="url(#chatBokehMedium)" opacity="0.45">
                  <ellipse cx="0" cy="30" rx="14" ry="9" transform="rotate(-25 0 30)" fill="url(#chatNoteGrad)" />
                  <ellipse cx="44" cy="20" rx="14" ry="9" transform="rotate(-25 44 20)" fill="url(#chatNoteGrad)" />
                  <rect x="11" y="-15" width="3.5" height="45" rx="1.5" fill="url(#chatNoteGrad)" />
                  <rect x="55" y="-25" width="3.5" height="45" rx="1.5" fill="url(#chatNoteGrad)" />
                  <polygon points="11,-15 58.5,-25 58.5,-16 11,-6" fill="url(#chatNoteGrad)" />
                </g>

                {/* Soft Eighth Note ♪ (Far right side) */}
                <g transform="translate(1020, 110) rotate(14) scale(0.65)" filter="url(#chatBokehMedium)" opacity="0.4">
                  <ellipse cx="0" cy="24" rx="13" ry="8.5" transform="rotate(-25 0 24)" fill="url(#chatNoteGrad)" />
                  <rect x="10" y="-24" width="3" height="48" rx="1.5" fill="url(#chatNoteGrad)" />
                  <path d="M 13 -24 C 28 -19, 33 -4, 24 12 C 30 0, 27 -14, 13 -19 Z" fill="url(#chatNoteGrad)" />
                </g>

                {/* Outer Camera Aperture Bokeh Orbs (Pushed away from center) */}
                <circle cx="280" cy="190" r="16" fill="#ffca80" filter="url(#chatBokehHeavy)" opacity="0.25" />
                <circle cx="920" cy="180" r="18" fill="#FC6301" filter="url(#chatBokehHeavy)" opacity="0.2" />
              </svg>
            </div>

            {/* Title Text Content (Crisp, High-Contrast, Zero Center Obscurity) */}
            <div className="space-y-1.5 relative z-10 px-4">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.24em] uppercase text-zinc-400 font-mono">
                Your Chat With
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Producer Toy Support Assistant
              </h2>
            </div>
          </div>

          {/* Main Chat Feed (100% Crystal Clear, Crisp Full Opacity on All Messages) */}
          <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-10 pt-2 pb-48 flex-1 space-y-8 sm:space-y-10">
            
            {/* Date Pill: Positioned well below the title with generous breathing room, exactly like Epic Games */}
            <div className="text-center pt-8 pb-4 sm:pb-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#18181c] border border-white/[0.08] text-xs text-zinc-400 font-medium select-none shadow-sm">
                {formatCurrentDate()}
              </span>
            </div>
            
            {/* Compute latest non-greeting assistant message ID */}
            {(() => {
              const nonGreetingAsst = messages.filter((m) => m.sender === 'assistant' && !m.isGreeting && !m.isThinking)
              const latestAsstId = nonGreetingAsst.length > 0 ? nonGreetingAsst[nonGreetingAsst.length - 1].id : null

              return messages.map((msg) => {
                const isLatestAssistant = msg.id === latestAsstId

                if (msg.sender === 'user') {
                  return (
                    /* User Bubble (Right-aligned, with "You [Time]" & Producer Toy sunset orange gradient) */
                    <div key={msg.id} className="flex flex-col items-end space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="text-xs text-zinc-400 pr-1 flex items-center gap-2">
                        <span className="font-semibold text-zinc-300">You</span>
                        <span className="text-[11px] text-zinc-500">{msg.timestamp}</span>
                      </div>

                      <div className="bg-gradient-to-r from-[#de5200] via-[#FC6301] to-[#ff7b2b] text-white font-medium px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl rounded-tr-xs max-w-xl sm:max-w-2xl shadow-lg shadow-[#FC6301]/20 text-[14.5px] sm:text-[15.5px] leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  )
                }

                /* Assistant Bubble */
                return (
                  <div key={msg.id} className="flex flex-col items-start space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200 w-full max-w-4xl">
                    
                    {/* Assistant Header: Clean Robot Avatar (NO box, NO squeezing) + Name + Timestamp */}
                    <div className="flex items-center gap-2.5 text-xs sm:text-[13px] text-zinc-400 px-1">
                      <Image
                        src="/images/robot-avatar.png"
                        alt="Producer Toy Support Assistant"
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain shrink-0"
                      />
                      <span className="font-semibold text-zinc-200 text-xs sm:text-[13px]">Producer Toy Support Assistant</span>
                      <span className="text-[11px] sm:text-xs text-zinc-500">{msg.timestamp}</span>
                    </div>

                    {/* Thinking Spinner Card with Clean Robot Avatar */}
                    {msg.isThinking ? (
                      <div className="inline-flex items-center gap-3.5 bg-[#18181c] border border-white/[0.08] text-zinc-300 rounded-2xl rounded-tl-xs px-7 py-5 shadow-xl w-fit">
                        <Image
                          src="/images/robot-avatar.png"
                          alt="Thinking..."
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain shrink-0"
                        />
                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-[#FC6301] animate-spin flex-shrink-0" />
                        <span className="text-zinc-300 text-sm sm:text-[15px] font-normal">Thinking...</span>
                      </div>
                    ) : (
                      <div className="bg-[#18181c] border border-white/[0.08] text-[#d1d1d6] rounded-2xl sm:rounded-[22px] rounded-tl-xs p-6 sm:p-8 md:p-9 text-[15px] sm:text-[16px] leading-[1.75] space-y-5 shadow-2xl w-full">
                        
                        {/* AI Content with Clickable Direct Redirect Links */}
                        {msg.content && (
                          <div className="text-[#d1d1d6] leading-[1.75] space-y-3.5">
                            {renderFormattedAnswer(msg.content)}
                          </div>
                        )}

                        {/* Autonomous Resolution: Verified Purchase & Instant Direct CDN Download */}
                        {msg.verifiedDownload && (
                          <div className="rounded-xl bg-[#141417] border border-[#2d2d34] p-4 sm:p-5 space-y-3.5 shadow-xl">
                            <div className="flex items-center justify-between gap-2 border-b border-[#2d2d34] pb-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                  <CheckCircle2 size={12} />
                                </div>
                                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                                  Official Purchase Verified &bull; Instant Secure Download
                                </span>
                              </div>
                              {msg.verifiedDownload.orderNumber && (
                                <span className="text-[10px] font-mono text-zinc-500">
                                  #{msg.verifiedDownload.orderNumber}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3.5">
                              {msg.verifiedDownload.coverImage && (
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden relative bg-[#18181b] border border-[#333] shrink-0">
                                  <Image
                                    src={msg.verifiedDownload.coverImage}
                                    alt={msg.verifiedDownload.productName}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <h4 className="text-sm sm:text-base font-bold text-white truncate">
                                  {msg.verifiedDownload.productName}
                                </h4>
                                <p className="text-[11px] sm:text-xs text-zinc-400">
                                  {msg.verifiedDownload.fileSize || 'Studio Master Archive (24-bit WAV / 44.1kHz)'}
                                </p>
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#222228] text-zinc-300 border border-[#333]">
                                  100% Royalty-Free Commercial License Active
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-1 flex-wrap">
                              <a
                                href={msg.verifiedDownload.downloadUrl}
                                download
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FC6301] hover:bg-[#ff751a] text-white text-xs sm:text-[13px] font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                              >
                                <Download size={14} />
                                <span>Download {msg.verifiedDownload.productName}</span>
                              </a>

                              <Link
                                href="/library"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#202025] hover:bg-[#282830] text-zinc-300 hover:text-white border border-[#333] text-xs font-semibold transition-all"
                              >
                                <span>View in My Library</span>
                                <ArrowRight size={12} />
                              </Link>
                            </div>
                          </div>
                        )}

                        {/* Autonomous Resolution: Verified Order & Official Tax Invoice Breakdown */}
                        {msg.verifiedOrder && (
                          <div className="rounded-xl bg-[#141417] border border-[#2d2d34] p-4 sm:p-5 space-y-3.5 shadow-xl">
                            <div className="flex items-center justify-between gap-2 border-b border-[#2d2d34] pb-2.5">
                              <div className="flex items-center gap-2">
                                <Receipt size={15} className="text-[#FC6301]" />
                                <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider">
                                  Official Tax Invoice &bull; Order #{msg.verifiedOrder.orderNumber}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                                ● Payment Completed
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-1">
                              <div className="bg-[#1c1c20] p-2.5 rounded-lg border border-[#27272a]">
                                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Date</span>
                                <span className="text-zinc-200 font-semibold">
                                  {new Date(msg.verifiedOrder.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="bg-[#1c1c20] p-2.5 rounded-lg border border-[#27272a]">
                                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Total Paid</span>
                                <span className="text-white font-bold">
                                  {msg.verifiedOrder.currency === 'INR' ? '₹' : '$'}
                                  {msg.verifiedOrder.amount}
                                </span>
                              </div>
                              <div className="bg-[#1c1c20] p-2.5 rounded-lg border border-[#27272a]">
                                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Gateway</span>
                                <span className="text-zinc-200 font-semibold capitalize">
                                  {msg.verifiedOrder.gateway || 'Razorpay'}
                                </span>
                              </div>
                              <div className="bg-[#1c1c20] p-2.5 rounded-lg border border-[#27272a]">
                                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Transaction ID</span>
                                <span className="text-zinc-300 font-mono text-[11px] truncate block">
                                  {msg.verifiedOrder.paymentId ? msg.verifiedOrder.paymentId.slice(-10).toUpperCase() : 'VERIFIED'}
                                </span>
                              </div>
                            </div>

                            {msg.verifiedOrder.items && msg.verifiedOrder.items.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                                  Purchased Items:
                                </span>
                                <div className="space-y-1">
                                  {msg.verifiedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-[#1c1c20] text-zinc-300">
                                      <span className="font-medium text-white">{item.name}</span>
                                      <span className="font-mono text-zinc-400">
                                        {msg.verifiedOrder?.currency === 'INR' ? '₹' : '$'}{item.price}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-3 pt-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!msg.verifiedOrder) return
                                  openPrintableInvoice(
                                    {
                                      id: msg.verifiedOrder.orderNumber,
                                      purchased_at: msg.verifiedOrder.date,
                                      amount_paid: msg.verifiedOrder.amount,
                                      currency: msg.verifiedOrder.currency,
                                      razorpay_payment_id: msg.verifiedOrder.paymentId,
                                      customer_name: msg.verifiedOrder.customerName,
                                      customer_email: msg.verifiedOrder.customerEmail,
                                      billing_address: msg.verifiedOrder.billingAddress,
                                      billing_city: msg.verifiedOrder.billingCity,
                                      billing_state: msg.verifiedOrder.billingState,
                                      billing_zip: msg.verifiedOrder.billingZip,
                                      billing_country: msg.verifiedOrder.billingCountry,
                                      products: {
                                        id: msg.verifiedOrder.items[0]?.id || 'prod',
                                        name: msg.verifiedOrder.items.map((it) => it.name).join(', ') || 'Producer Toy Asset',
                                        product_type: msg.verifiedOrder.items[0]?.product_type || 'sample_pack',
                                        price_usd: msg.verifiedOrder.amount,
                                      },
                                    },
                                    msg.verifiedOrder.customerEmail,
                                    msg.verifiedOrder.customerName
                                  )
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FC6301] hover:bg-[#ff751a] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                              >
                                <FileText size={13} />
                                <span>View &amp; Print Official Tax Invoice</span>
                              </button>

                              <Link
                                href="/account?tab=transactions"
                                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#202025] hover:bg-[#282830] text-zinc-300 hover:text-white border border-[#333] text-xs font-semibold transition-all"
                              >
                                <span>All Invoices in Account</span>
                                <ExternalLink size={11} />
                              </Link>
                            </div>
                          </div>
                        )}

                        {/* Autonomous Resolution: Coming Soon Drop Alert Interactive Card */}
                        {msg.comingSoonProduct && (
                          <div className="rounded-xl bg-[#141417] border border-[#2d2d34] p-4 sm:p-5 space-y-3.5 shadow-xl">
                            <div className="flex items-center justify-between gap-2 border-b border-[#2d2d34] pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                                  Official Drop Alert &bull; Coming Soon
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-zinc-400 bg-[#222228] px-2 py-0.5 rounded border border-white/5">
                                In Final Audio Mastering
                              </span>
                            </div>

                            <div className="flex items-center gap-3.5">
                              {msg.comingSoonProduct.cover_image && (
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden relative bg-[#18181b] border border-[#333] shrink-0">
                                  <Image
                                    src={msg.comingSoonProduct.cover_image}
                                    alt={msg.comingSoonProduct.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <h4 className="text-sm sm:text-base font-bold text-white truncate">
                                  {msg.comingSoonProduct.name}
                                </h4>
                                <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-1">
                                  {msg.comingSoonProduct.short_description || 'High-fidelity audio sample pack in final production.'}
                                </p>
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#222228] text-amber-300 border border-amber-500/20">
                                  Expected Launch Price: ${msg.comingSoonProduct.price_usd}
                                </span>
                              </div>
                            </div>

                            {/* Drop Alert Subscription Input & CTA */}
                            <ComingSoonAlertBox
                              productName={msg.comingSoonProduct.name}
                              productSlug={msg.comingSoonProduct.slug}
                              initialEmail={user?.email || ''}
                            />

                            <div className="pt-1 border-t border-[#222228] flex items-center justify-between">
                              <Link
                                href={`/p/${msg.comingSoonProduct.slug}`}
                                className="inline-flex items-center gap-1.5 text-xs text-[#FC6301] hover:underline font-semibold"
                              >
                                <span>Preview {msg.comingSoonProduct.name} Page</span>
                                <ArrowRight size={12} />
                              </Link>
                              <span className="text-[11px] text-zinc-500">
                                Status: Not yet purchasable
                              </span>
                            </div>
                          </div>
                        )}

                      {/* Product Overview Poster Cards (Mobile 2x2 Grid with Exact Square 1:1 Posters) */}
                      {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                        <div
                          className={`pt-2 pb-1 ${
                            msg.recommendedProducts.length === 1
                              ? 'grid grid-cols-1 sm:grid-cols-2 max-w-sm'
                              : 'grid grid-cols-2 gap-2 sm:gap-3.5'
                          }`}
                        >
                          {msg.recommendedProducts.map((prod) => (
                            <div
                              key={prod.id}
                              className="rounded-xl bg-[#202024] border border-[#2f2f35] hover:border-[#FC6301]/60 p-2 sm:p-3.5 transition-all duration-200 shadow-lg group flex flex-col justify-between"
                            >
                              <div>
                                {/* Exact 1:1 Square Poster Image */}
                                <Link
                                  href={`/p/${prod.slug}`}
                                  className="aspect-square w-full rounded-lg overflow-hidden relative bg-[#151518] border border-[#303036] shadow-sm group-hover:border-[#FC6301]/50 transition-colors block mb-2 sm:mb-2.5"
                                >
                                  <Image
                                    src={prod.cover_image}
                                    alt={prod.name}
                                    fill
                                    sizes="(max-width: 640px) 50vw, 240px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </Link>

                                {/* Product Details: Title & Price Header */}
                                <div className="space-y-1">
                                  <Link href={`/p/${prod.slug}`} className="block">
                                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#FC6301] transition-colors line-clamp-1 leading-snug">
                                      {prod.name}
                                    </h4>
                                  </Link>

                                  <div className="flex items-baseline gap-1.5 flex-wrap">
                                    {prod.original_price_usd && (
                                      <span className="text-[10px] sm:text-xs text-zinc-500 line-through">
                                        ${prod.original_price_usd}
                                      </span>
                                    )}
                                    <span className="text-xs sm:text-sm font-extrabold text-white">
                                      ${prod.price_usd}
                                    </span>
                                  </div>

                                  {/* Description (2 lines clamp on mobile) */}
                                  <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-2 leading-tight pt-0.5">
                                    {prod.short_description ||
                                      'High-fidelity, professionally recorded sounds crafted specifically for music producers and beatmakers.'}
                                  </p>
                                </div>
                              </div>

                              {/* View Product CTA Button */}
                              <div className="pt-2.5 sm:pt-3 mt-auto">
                                <Link
                                  href={`/p/${prod.slug}`}
                                  className="w-full inline-flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 rounded-lg bg-[#FC6301] hover:bg-[#ff751a] text-white font-bold text-[11px] sm:text-xs shadow-md transition-all active:scale-95 text-center"
                                >
                                  <span>View Product</span>
                                  <ArrowRight size={12} strokeWidth={2.5} />
                                </Link>
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

                          {/* Helpful feedback toggle ONLY on the latest assistant response before feedback is chosen */}
                          {isLatestAssistant && !msg.ticketNumber && !msg.feedback && (
                            <div className="pt-3 border-t border-[#26262b] flex items-center justify-between text-xs text-zinc-400">
                              <span>Did this solve your problem?</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleFeedback(msg.id, true)}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer bg-[#222228] text-zinc-300 hover:text-white border-[#33333d]"
                                >
                                  <ThumbsUp size={12} />
                                  <span>Yes</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFeedback(msg.id, false)}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer bg-[#222228] text-zinc-300 hover:text-white border-[#33333d]"
                                >
                                  <ThumbsDown size={12} />
                                  <span>No</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* If user clicked 'Yes': Show Chat Ended faint */}
                          {msg.feedback === 'yes' && (
                            <div className="pt-3 border-t border-[#26262b] space-y-1.5 animate-in fade-in">
                              <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                                <CheckCircle2 size={14} className="text-emerald-400" />
                                <span>Glad that helped!</span>
                              </p>
                              <p className="text-xs text-zinc-500 font-medium select-none">
                                Chat ended.
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Inline Ticket Escalation Form (Pure Solid Dark, Zero Glassmorphism) */}
                      {msg.needsTicket && !msg.ticketNumber && (
                        <div className="mt-4 pt-4 border-t border-[#26262b] space-y-3.5 animate-in fade-in">
                          {!user ? (
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#202025] border border-white/5 flex items-center justify-center shrink-0 text-[#FC6301] mt-0.5">
                                  <Lock size={15} />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs sm:text-[13px] font-semibold text-white">
                                    Sign In Required for Ticket Tracking
                                  </p>
                                  <p className="text-xs text-zinc-400 leading-relaxed">
                                    Please sign in to your Producer Toy account to submit this ticket directly to our senior audio engineering desk. This allows our team to connect your licenses and enables 1-click tracking.
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 pt-1">
                                <Link
                                  href={`/auth?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/support')}`}
                                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FC6301] hover:bg-[#ff751a] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                                >
                                  <LogIn size={13} />
                                  <span>Sign In to Submit & Track</span>
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <p className="text-xs sm:text-[13px] text-zinc-200 font-medium">
                                  Submit this request directly to our senior audio engineering desk:
                                </p>
                                <span className="text-[11px] text-zinc-400 bg-[#202025] px-2.5 py-0.5 rounded-md border border-white/5 font-mono">
                                  {user.email}
                                </span>
                              </div>

                              {ticketError && (
                                <p className="text-xs text-rose-400">{ticketError}</p>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={ticketName}
                                  onChange={(e) => setTicketName(e.target.value)}
                                  placeholder="Your Name (Optional)"
                                  className="bg-[#202025] border border-[#2e2e36] focus:border-[#FC6301] rounded-lg px-3.5 py-2.5 text-xs sm:text-[13px] text-white placeholder-zinc-500 focus:outline-none transition-colors"
                                />
                                <input
                                  type="email"
                                  required
                                  value={ticketEmail}
                                  onChange={(e) => setTicketEmail(e.target.value)}
                                  placeholder="Your Email *"
                                  className="bg-[#202025] border border-[#2e2e36] focus:border-[#FC6301] rounded-lg px-3.5 py-2.5 text-xs sm:text-[13px] text-white placeholder-zinc-500 focus:outline-none transition-colors"
                                />
                              </div>

                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleCreateTicket(msg.id, msg.userQuery)}
                                  disabled={isSubmittingTicket}
                                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FC6301] hover:bg-[#ff751a] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
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

                      {/* Generic Confirmation Acknowledgement (Zero Glassmorphism, Clean Native Text) */}
                      {msg.ticketNumber && (
                        <div className="pt-3.5 border-t border-[#26262b] space-y-2.5 animate-in fade-in">
                          <p className="font-semibold text-white text-sm sm:text-[14.5px] flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-[#00d66c] shrink-0" />
                            <span>We have received your request!</span>
                          </p>
                          <p className="text-zinc-300 text-xs sm:text-[13.5px] leading-relaxed">
                            Our team has received your message and will review it shortly. We will get back to you directly via email.
                          </p>
                          <p className="pt-1 text-xs text-zinc-500 font-medium select-none">
                            Chat ended.
                          </p>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )
            })})()}

            <div ref={messagesEndRef} />
          </main>
        </div>

        {/* 3. Epic Games Sticky Bottom Search / Input Bar (Stuck permanently at bottom, Zero Glassmorphism) */}
        <div className="flex-shrink-0 w-full bg-[#080706] z-20 relative border-t border-white/[0.04]">
          {/* Top Subtle Gradient Fade above the input bar */}
          <div 
            className="absolute -top-6 left-0 right-0 h-6 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, #080706 0%, rgba(8, 7, 6, 0.7) 50%, transparent 100%)',
            }}
          />

          {/* Solid Bottom Bar Container (100% Solid #080706, No Glassmorphism) */}
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-10 pb-5 sm:pb-6 pt-3">
            {isChatEnded || messages.some((m) => !!m.ticketNumber || m.feedback === 'yes') ? (
              <div className="w-full animate-in fade-in zoom-in-95 duration-200">
                <button
                  type="button"
                  onClick={handleResetToHero}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-[#FC6301] hover:bg-[#ff751a] text-white font-bold text-sm sm:text-[15px] transition-all duration-200 shadow-xl shadow-[#FC6301]/25 active:scale-[0.99] cursor-pointer"
                >
                  <RotateCcw size={16} strokeWidth={2.4} />
                  <span>Start New Conversation</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleChatSubmit}
                className="flex items-center gap-2.5 sm:gap-3 w-full"
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
                          setIsChatEnded(true)
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
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                      isOptionsMenuOpen
                        ? 'bg-[#241710] border-[#FC6301]/60 text-white'
                        : 'bg-[#18181c] hover:bg-[#222228] border-white/[0.08] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>

                {/* Writing Box Input (Exact Epic Games rounded box with subtle border, solid #141417, no glassmorphism) */}
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Write a message..."
                  disabled={isTyping}
                  className="flex-1 bg-[#141417] hover:bg-[#18181c] focus:bg-[#18181c] border border-white/10 focus:border-[#FC6301] rounded-xl px-5 py-3 text-sm sm:text-[14.5px] text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                />

                {/* Circle Arrow Button (Exact Epic Games Dynamic States, Zero Glassmorphism) */}
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  aria-label="Send message"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 active:scale-95 ${
                    chatInput.trim().length > 0
                      ? 'bg-[#FC6301] hover:bg-[#ff751a] text-white shadow-lg shadow-[#FC6301]/40 cursor-pointer'
                      : 'bg-white/[0.06] text-white/20 border border-white/5 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </form>
            )}
          </div>
        </div>

        </div>
      )}
    </>
  )
}
