'use client'

import { useState, useRef, useEffect } from 'react'
import { ProtectedLayout } from '@/components/protected-layout'
import { apiClient } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle, Sparkles, Loader } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI skincare assistant. I can help you understand your skin analysis results, recommend products, answer skincare questions, and track your progress. What would you like to know?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Placeholder for Gemini integration
      // Once GEMINI_API_KEY is available, this will call your backend to use Gemini
      const response = await apiClient.post('/api/chat', {
        message: input,
        conversation_history: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || 'I\'m still learning! Please check back soon.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      // Fallback response when backend is not available
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'I\'m here to help with skincare advice! For now, I can discuss general skincare tips, explain your skin analysis results, and recommend routines. When Gemini is integrated, I\'ll have even more personalized insights for you.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && !isLoading) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <ProtectedLayout>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Skincare Assistant</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered skincare guidance and recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-2xl space-y-2 ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    } flex flex-col`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'glass-card'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="glass-card px-4 py-3 rounded-lg flex items-center gap-2">
                  <Loader className="w-4 h-4 text-accent animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-6 bg-background/50 backdrop-blur">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about skincare..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                'What\'s acne?',
                'How to hydrate?',
                'Best routine?',
                'Skincare myths?',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(suggestion)
                  }}
                  className="text-xs px-3 py-2 bg-white/5 hover:bg-white/10 text-muted-foreground rounded-lg transition border border-border/50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
