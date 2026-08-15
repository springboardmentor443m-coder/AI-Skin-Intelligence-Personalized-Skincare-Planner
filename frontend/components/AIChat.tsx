'use client'

import { useState } from 'react'
import { askDermatologist } from '@/hooks/use-skin-analysis'
import { Sparkles, Send } from 'lucide-react'

type AIChatProps = {
  skinType: string
  recommendations: any[]
  weeklyPlan?: Record<string, any>
}

export default function AIChat({ skinType, recommendations, weeklyPlan }: AIChatProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: userMessage,
      },
    ])

    setInput('')
    setLoading(true)

    try {
      const response = await askDermatologist(userMessage, skinType, recommendations.map((r) => r.description), weeklyPlan )

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.reply,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Sorry, something went wrong.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#fff2eb] text-[#d89c8b]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#3b2f2f]">AI dermatologist</h2>
          <p className="text-sm text-[#8a736f]">Ask anything about your skincare plan</p>
        </div>
      </div>

      <div className="h-80 space-y-3 overflow-y-auto rounded-[18px] border border-[#f3e3da] bg-[#fffdfb] p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center rounded-[16px] border border-dashed border-[#f3e3da] bg-[#fff8f3] p-4 text-center text-sm text-[#8a736f]">
            Start the conversation with a question about your routine, concerns, or product choices.
          </div>
        )}

        {messages.map((m, index) => (
          <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[16px] px-4 py-3 text-sm leading-6 ${m.role === 'user' ? 'bg-[#d89c8b] text-white' : 'border border-[#f3e3da] bg-white text-[#3b2f2f]'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="soft-input flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend()
            }
          }}
          placeholder="Ask about your skincare..."
        />

        <button onClick={handleSend} disabled={loading} className="rounded-[16px] bg-[#d89c8b] px-4 py-3 text-white transition hover:bg-[#c98b72] disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? '...' : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}