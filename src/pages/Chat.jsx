import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Bot,
  User as UserIcon,
  AlertCircle,
  RefreshCw,
  Info,
  Square,
  RotateCcw,
  Sparkle
} from 'lucide-react'
import { useAuth } from '../auth/useAuth'

const API_BASE_URL = 'http://localhost:8000'

const SUGGESTION_CHIPS = [
  { label: 'Acne & Pimples', prompt: 'What active ingredients and routine help clear acne and pimples?' },
  { label: 'Oily Skin Care', prompt: 'How do I manage oily skin and enlarged pores without over-drying?' },
  { label: 'Dry Skin Hydration', prompt: 'What is the best routine to restore hydration and repair a damaged skin barrier?' },
  { label: 'SPF & Sunscreen', prompt: 'How often should I reapply SPF and what sunscreen type fits sensitive skin?' },
  { label: 'Daily Skincare Routine', prompt: 'Can you structure a simple morning and night skincare routine for me?' },
  { label: 'Active Ingredients', prompt: 'How should I combine Niacinamide, Retinol, and Vitamin C safely?' },
]

function formatTimestamp(isoString) {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// Lightweight Markdown Renderer (Headings, Bullets, Bold, Code Blocks)
function MarkdownText({ content }) {
  if (!content) return null

  // Split into lines
  const lines = content.split('\n')
  const elements = []
  let inCodeBlock = false
  let codeBuffer = []
  let listBuffer = []

  const flushList = (keyPrefix) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="my-2 space-y-1.5 list-disc list-inside text-slate-200">
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
        <pre key={`${keyPrefix}-code`} className="my-3 overflow-x-auto rounded-xl bg-slate-900/90 p-3 text-xs font-mono text-emerald-300 border border-white/10">
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      )
      codeBuffer = []
    }
  }

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCode(idx)
        inCodeBlock = false
      } else {
        flushList(idx)
        inCodeBlock = true
      }
      return
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      return
    }

    const trimmed = line.trim()

    // Bullet point
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      const cleanLine = trimmed.replace(/^([-*]|\d+\.)\s+/, '')
      listBuffer.push(cleanLine)
      return
    }

    flushList(idx)

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={idx} className="my-2 text-sm font-semibold text-emerald-300">
          {parseInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
        </h4>
      )
    } else if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      elements.push(
        <h3 key={idx} className="my-2.5 text-base font-semibold text-white">
          {parseInlineMarkdown(trimmed.replace(/^#+\s+/, ''))}
        </h3>
      )
    } else if (trimmed === '') {
      elements.push(<div key={idx} className="h-2" />)
    } else {
      elements.push(
        <p key={idx} className="my-1 text-sm leading-relaxed">
          {parseInlineMarkdown(line)}
        </p>
      )
    }
  })

  flushList('end')
  flushCode('end')

  return <div>{elements}</div>
}

function parseInlineMarkdown(text) {
  // Parse **bold** and `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">{part.slice(1, -1)}</code>
    }
    return part
  })
}

export default function Chat() {
  const { user } = useAuth()
  const location = useLocation()
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isFetchingHistory, setIsFetchingHistory] = useState(true)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [error, setError] = useState('')
  const [activeAnalysis, setActiveAnalysis] = useState(location.state?.analysis || null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, isStreaming])

  // Fetch chat history from MySQL
  useEffect(() => {
    const fetchHistory = async () => {
      const token = window.localStorage.getItem('skin-intelligence-token')
      if (!token) {
        setIsFetchingHistory(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/chat/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          const formatted = (data.history || []).flatMap((item) => [
            {
              id: `q-${item.id}`,
              dbId: item.id,
              role: 'user',
              content: item.question,
              timestamp: item.created_at,
            },
            {
              id: `a-${item.id}`,
              dbId: item.id,
              role: 'assistant',
              content: item.answer,
              prediction_reference: item.prediction_reference,
              timestamp: item.created_at,
            },
          ])
          setMessages(formatted)
        }
      } catch (err) {
        console.error('Failed to load chat history:', err)
      }
    }

    fetchHistory()
  }, [])

  const msgCounterRef = useRef(1)

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

    const tempAssistantMsg = {
      id: tempAssistantId,
      role: 'assistant',
      content: '',
      prediction_reference: activeAnalysis?.disease || null,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempUserMsg, tempAssistantMsg])
    setIsLoading(true)
    setIsStreaming(true)

    const token = window.localStorage.getItem('skin-intelligence-token')
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: query,
          context: activeAnalysis
            ? {
                disease: activeAnalysis.disease,
                confidence: activeAnalysis.confidence,
                recommendation: activeAnalysis.recommendation,
              }
            : null,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.detail || 'AI service currently unavailable.')
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

              if (jsonPayload.done) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempAssistantId
                      ? { ...msg, dbId: jsonPayload.id, timestamp: jsonPayload.created_at || msg.timestamp }
                      : msg
                  )
                )
              }
            } catch {
              // Non-JSON line fallback
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.')
      } else {
        console.error('Stream error:', err)
        setError(err.message || 'The AI chat service is currently unavailable. Please try again.')
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAssistantId && !msg.content
              ? { ...msg, content: 'I am currently unable to connect to the AI model. Please verify your connection or try again later.' }
              : msg
          )
        )
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  const handleRegenerate = () => {
    // Find last user message
    const userMsgs = messages.filter((m) => m.role === 'user')
    if (userMsgs.length > 0) {
      const lastUserMsg = userMsgs[userMsgs.length - 1].content
      handleSend(lastUserMsg)
    }
  }

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) return

    const token = window.localStorage.getItem('skin-intelligence-token')
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        setMessages([])
      }
    } catch (err) {
      console.error('Error clearing history:', err)
    }
  }

  const handleDeleteItem = async (dbId) => {
    if (!dbId) return
    const token = window.localStorage.getItem('skin-intelligence-token')
    try {
      const response = await fetch(`${API_BASE_URL}/chat/${dbId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        setMessages((prev) => prev.filter((m) => m.dbId !== dbId))
      }
    } catch (err) {
      console.error('Error deleting chat item:', err)
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      {/* Header Banner */}
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm shadow-slate-200/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/15 p-2.5 text-emerald-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">AI Dermatology Assistant</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Llama 3.3 70B Stream
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Token-by-token live answers, routine advice, ingredient breakdown & disease guidance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Chat
              </button>
            )}
          </div>
        </div>

        {/* Active Analysis Context Badge */}
        {activeAnalysis && (
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-emerald-600" />
              <span>
                Active Analysis Context: <strong>{activeAnalysis.disease}</strong> ({activeAnalysis.confidence})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveAnalysis(null)}
              className="font-semibold text-emerald-700 hover:text-emerald-950 underline"
            >
              Detach context
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Feed */}
      <div className="flex-1 overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-slate-950 p-4 sm:p-6 text-white shadow-inner">
        {isFetchingHistory ? (
          <div className="flex h-full items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="h-5 w-5 animate-spin text-emerald-400" />
            <span className="text-sm">Loading conversation history…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-400">
              <Bot className="h-10 w-10" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">Hello {user?.full_name || user?.name || 'there'}!</h2>
            <p className="mt-2 max-w-md text-sm text-slate-400 leading-relaxed">
              Ask me anything about your skin conditions, morning & night routines, active ingredients, sunscreen, or diet for healthy skin.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-2xl">
              {SUGGESTION_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(chip.prompt)}
                  className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/15 hover:text-white"
                >
                  ✨ {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[85%] sm:max-w-[75%] rounded-[1.25rem] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 text-white rounded-br-none shadow-md shadow-emerald-500/20'
                        : 'bg-white/10 text-slate-100 border border-white/10 rounded-bl-none'
                    }`}
                  >
                    {msg.prediction_reference && (
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        <Sparkle className="h-3 w-3" /> Context: {msg.prediction_reference}
                      </div>
                    )}

                    {/* Markdown Formatted Text */}
                    {msg.content ? (
                      <MarkdownText content={msg.content} />
                    ) : (
                      <div className="flex items-center gap-2 py-1 text-slate-400">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:0.2s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:0.4s]" />
                      </div>
                    )}

                    {/* Timestamp & Footer Actions */}
                    <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-1.5 text-[10px] text-slate-400">
                      <span>{formatTimestamp(msg.timestamp)}</span>
                      {msg.role === 'assistant' && msg.content && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.content, idx)}
                            className="flex items-center gap-1 hover:text-emerald-300 transition"
                          >
                            {copiedIndex === idx ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                          </button>

                          {idx === messages.length - 1 && !isStreaming && (
                            <button
                              type="button"
                              onClick={handleRegenerate}
                              className="flex items-center gap-1 hover:text-emerald-300 transition"
                              title="Regenerate response"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Retry</span>
                            </button>
                          )}

                          {msg.dbId && (
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(msg.dbId)}
                              className="hover:text-rose-400 transition"
                              title="Delete message"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Suggestion Chips */}
      {messages.length > 0 && !isStreaming && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="whitespace-nowrap text-slate-400 font-medium text-[11px]">Quick prompts:</span>
          {SUGGESTION_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip.prompt)}
              className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 shadow-xs"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar & Streaming Controls */}
      <div className="flex flex-col gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-200/70"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            rows={1}
            placeholder="Ask anything about skin conditions, routines, products... (Shift+Enter for newline)"
            className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 max-h-32"
            disabled={isStreaming}
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={handleStopGenerating}
              className="flex h-10 px-4 items-center justify-center gap-1.5 rounded-xl bg-rose-500 text-white font-semibold text-xs transition hover:bg-rose-600 shadow-sm"
              title="Stop generating"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
