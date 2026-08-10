import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  X,
  Minus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Square,
  Sparkles,
  User,
  ShieldCheck,
} from 'lucide-react'
import { getLatestAnalysis, getAnalysisHistory } from '../utils/skincareStorage'
import { calculateSkinHealthScore } from '../utils/healthScoreCalculator'
import { useAuth } from '../auth/useAuth'

const API_BASE_URL = import.meta.env.DEV ? '' : 'http://127.0.0.1:8000'

const QUICK_CHIPS = [
  'Explain my analysis',
  'Recommend products',
  'Morning routine',
  'Night routine',
  'Ingredients for acne',
  'Products for oily skin',
  'Improve my skin score',
  'Compare my previous scan',
]

const GREETING_PATTERNS = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|how are you|who are you)[\s!.]*$/i

// Medical Robot Avatar SVG Component
function MedicalRobotAvatar({ size = 36, className = '' }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-600 p-1.5 shadow-md shadow-emerald-500/20 border border-emerald-300/30 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-sm"
      >
        {/* Robot Head Outer Structure */}
        <rect x="12" y="14" width="40" height="34" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
        {/* Glowing Visor */}
        <rect x="18" y="22" width="28" height="14" rx="7" fill="#0369a1" />
        {/* Friendly Expressive Robot Eyes */}
        <circle cx="26" cy="29" r="3.5" fill="#38bdf8" />
        <circle cx="38" cy="29" r="3.5" fill="#38bdf8" />
        <circle cx="27" cy="28" r="1.2" fill="#ffffff" />
        <circle cx="39" cy="28" r="1.2" fill="#ffffff" />
        {/* Medical Cross Badge on Visor/Helmet */}
        <path d="M32 6V12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="5" r="3" fill="#10b981" />
        {/* Smile Arc */}
        <path d="M27 41C29 43 35 43 37 41" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        {/* Side Ear Antennas */}
        <rect x="6" y="24" width="6" height="10" rx="3" fill="#38bdf8" />
        <rect x="52" y="24" width="6" height="10" rx="3" fill="#38bdf8" />
      </svg>
    </div>
  )
}

// Lightweight Markdown Renderer (Headings, Bold, Bullet Lists, Code Blocks)
function MarkdownText({ content }) {
  if (!content) return null

  const lines = content.split('\n')
  const elements = []
  let inCodeBlock = false
  let codeBuffer = []
  let listBuffer = []

  const flushList = (keyPrefix) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="my-2 space-y-1 list-disc list-inside text-slate-200">
          {listBuffer.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      )
      listBuffer = []
    }
  }

  const flushCode = (keyPrefix) => {
    if (codeBuffer.length > 0) {
      elements.push(
        <pre key={`${keyPrefix}-code`} className="my-2 overflow-x-auto rounded-xl bg-slate-950 p-3 text-[11px] font-mono text-emerald-300 border border-slate-800">
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      )
      codeBuffer = []
    }
  }

  const parseInlineMarkdown = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g)
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-white">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="italic text-slate-200">{part.slice(1, -1)}</em>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[11px] text-emerald-300">{part.slice(1, -1)}</code>
      }
      return part
    })
  }

  lines.forEach((line, index) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCode(index)
        inCodeBlock = false
      } else {
        flushList(index)
        inCodeBlock = true
      }
      return
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      return
    }

    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      listBuffer.push(line.replace(/^[-*•]\s*/, ''))
      return
    } else {
      flushList(index)
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={index} className="mt-3 mb-1 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          {parseInlineMarkdown(line.replace('### ', ''))}
        </h4>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={index} className="mt-3 mb-1 text-sm font-extrabold text-white">
          {parseInlineMarkdown(line.replace('## ', ''))}
        </h3>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={index} className="h-1.5" />)
    } else {
      elements.push(
        <p key={index} className="leading-relaxed">
          {parseInlineMarkdown(line)}
        </p>
      )
    }
  })

  flushList('end')
  flushCode('end')

  return <div className="space-y-1 text-xs">{elements}</div>
}

export default function FloatingAIAssistant() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [hoverTooltip, setHoverTooltip] = useState(false)

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: 'Hello! I am your AI Dermatology Assistant. I am automatically synced with your latest skin scan, health score, and skincare profile. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const chatEndRef = useRef(null)
  const abortControllerRef = useRef(null)
  const msgCounterRef = useRef(10)

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isMinimized])

  // Context gathering
  const latestAnalysis = getLatestAnalysis()
  const allScans = getAnalysisHistory()
  const computedScore = calculateSkinHealthScore({
    condition: latestAnalysis?.disease || 'Normal',
    sleepHours: 7.5,
    waterIntake: 2.5,
  })

  const contextData = {
    latestPrediction: latestAnalysis?.disease || 'Normal Balanced Skin',
    confidence: latestAnalysis?.confidence || '94.0%',
    healthScore: computedScore.score,
    totalScans: allScans.length,
    userName: user?.full_name || user?.name || 'Patient',
    skinType: user?.skin_type || 'Combination',
  }

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleClearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: 'Chat cleared. How can I assist you with your skin analysis or daily routine?',
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim()
    if (!query || isStreaming) return

    setError('')
    if (!textToSend) setInput('')

    const count = msgCounterRef.current
    msgCounterRef.current += 1
    const userMsgId = `user-${count}`
    const tempAssistantId = `assistant-${count}`

    const tempUserMsg = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    }

    // Intercept common simple greetings client-side to save API costs
    if (GREETING_PATTERNS.test(query)) {
      const greetingReply = {
        id: tempAssistantId,
        role: 'assistant',
        content: `Hello ${contextData.userName}! I am your AI Dermatology Assistant. I see your latest skin evaluation is **${contextData.latestPrediction}** with a health score of **${contextData.healthScore}/100**. How can I help you with your routine or product recommendations today?`,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, tempUserMsg, greetingReply])
      return
    }

    const tempAssistantMsg = {
      id: tempAssistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempUserMsg, tempAssistantMsg])
    setIsLoading(true)
    setIsStreaming(true)

    const token = localStorage.getItem('skin-intelligence-token')
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          question: query,
          context: {
            disease: contextData.latestPrediction,
            confidence: contextData.confidence,
            health_score: contextData.healthScore,
            total_scans: contextData.totalScans,
            user_name: contextData.userName,
          },
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.detail || 'AI service unavailable right now.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let firstChunkReceived = false

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunkText = decoder.decode(value, { stream: true })
        const lines = chunkText.split('\n\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonPayload = JSON.parse(line.replace(/^data:\s*/, ''))

              if (jsonPayload.chunk) {
                if (!firstChunkReceived) {
                  firstChunkReceived = true
                  setIsLoading(false)
                }
                const newChunk = jsonPayload.chunk
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempAssistantId
                      ? { ...msg, content: msg.content + newChunk }
                      : msg
                  )
                )
              }
            } catch (e) {
              console.warn('Chunk parse error:', e)
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Streaming error:', err)
        setError('Failed to reach AI server. Please try again.')
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAssistantId
              ? {
                  ...msg,
                  content:
                    'I am currently experiencing network latency. Here is what I can tell you based on your record: Your active condition is **' +
                    contextData.latestPrediction +
                    '**. Please follow your daily AM/PM checklist.',
                }
              : msg
          )
        )
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      handleSend(lastUserMsg.content)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Chat Window Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              height: isMinimized ? '70px' : '560px',
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-4 w-[92vw] sm:w-[420px] rounded-[2.5rem] bg-slate-950/95 text-white border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden ring-1 ring-emerald-500/20"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-3.5 bg-slate-900/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <MedicalRobotAvatar size={34} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-extrabold text-white">AI Dermatology Assistant</h3>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />
                  </div>
                  <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Synced with {contextData.latestPrediction}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMinimized((prev) => !prev)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  <Minus className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleClearChat}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
                  title="Clear Conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  title="Close Assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Quick Suggestions Chips Bar */}
                <div className="flex overflow-x-auto gap-1.5 px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 no-scrollbar shrink-0">
                  {QUICK_CHIPS.map((chip, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleSend(chip)}
                      disabled={isStreaming}
                      className="rounded-full bg-slate-900 hover:bg-emerald-500/20 px-3 py-1 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30 transition whitespace-nowrap flex items-center gap-1"
                    >
                      <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user'
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && <MedicalRobotAvatar size={28} className="shrink-0 mt-0.5" />}

                        <div className={`relative max-w-[85%] rounded-2xl p-3.5 shadow-sm space-y-1 ${
                          isUser
                            ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}>
                          <MarkdownText content={msg.content} />

                          {!isUser && msg.content && (
                            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Clinical AI Assist</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopy(msg.id, msg.content)}
                                  className="hover:text-emerald-400 transition flex items-center gap-1"
                                  title="Copy text"
                                >
                                  {copiedId === msg.id ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleRegenerate}
                                  className="hover:text-emerald-400 transition flex items-center gap-1"
                                  title="Regenerate response"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {isUser && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                            <User className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {isLoading && (
                    <div className="flex gap-2.5 items-center">
                      <MedicalRobotAvatar size={28} />
                      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 text-xs text-slate-300 flex items-center gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                        <span>Analyzing skin parameters...</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl bg-rose-500/10 p-3 text-[11px] text-rose-300 border border-rose-500/20">
                      {error}
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Bottom Input Field */}
                <div className="p-3 border-t border-slate-800 bg-slate-900/90 shrink-0">
                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={handleStopGenerating}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500/20 py-2 text-xs font-bold text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition"
                    >
                      <Square className="h-3.5 w-3.5 fill-rose-400" /> Stop Generating
                    </button>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Ask anything about your skin analysis, SPF, or products..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 rounded-2xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition placeholder:text-slate-500"
                      />
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition disabled:opacity-40 shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circular Trigger Button with Hover Tooltip */}
      <div className="relative flex items-center">
        {/* Tooltip on Hover */}
        <AnimatePresence>
          {hoverTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-16 rounded-full bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-emerald-300 border border-emerald-500/30 shadow-lg whitespace-nowrap pointer-events-none"
            >
              Need skincare help?
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Circular Trigger Button */}
        <motion.button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev)
            setIsMinimized(false)
          }}
          onMouseEnter={() => setHoverTooltip(true)}
          onMouseLeave={() => setHoverTooltip(false)}
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-600 shadow-2xl shadow-emerald-500/40 border border-emerald-300/40 text-white hover:scale-105 active:scale-95 transition-all"
          title="Open AI Dermatology Assistant"
        >
          <MedicalRobotAvatar size={42} />

          {/* Unread Online Status Dot */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950" />
          </span>
        </motion.button>
      </div>

    </div>
  )
}
