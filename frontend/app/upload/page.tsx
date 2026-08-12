'use client'

import { useState, useRef } from 'react'
import { ProtectedLayout } from '@/components/protected-layout'
import { useAuthStore } from '@/lib/auth-store'
import { uploadImageForAnalysis, useAnalysisHistory, askDermatologist } from '@/hooks/use-skin-analysis'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, CheckCircle, AlertCircle, Loader, Sparkles, ChevronDown, SunMedium, MoonStar, Lightbulb, Droplets } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import AIChat from '@/components/AIChat'

export default function UploadPage() {
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const { mutate: mutateHistory } = useAnalysisHistory()

  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [chatLoading, setChatLoading] = useState(false)
   // Personalization inputs
  const [skinType, setSkinType] = useState('')
  const [budget, setBudget] = useState('')
  const [skinGoals, setSkinGoals] = useState<string[]>([])
  const [additionalDetails, setAdditionalDetails] = useState('')

  const skinGoalOptions = [
    'Acne & breakouts',
    'Dark spots',
    'Pigmentation',
    'Dryness',
    'Oil control',
    'Pores',
    'Fine lines & wrinkles',
    'Skin texture',
    'Sensitivity',
    'Overall skin health',
  ]

  const toggleSkinGoal = (goal: string) => {
    setSkinGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((item) => item !== goal)
        : [...prev, goal]
    )
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleSubmit = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setError('')

    try {
      const response = await uploadImageForAnalysis(selectedFile, {
        age: user?.age,
        gender: user?.gender,
        skin_type: skinType,
        budget,
        skin_goals: skinGoals,
        additional_details: additionalDetails,
      })
      setResult(response.analysis)
      mutateHistory()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze image. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setPreview(null)
    setSelectedFile(null)
    setResult(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setChatInput('')
    setChatMessages([])
  }

  const handleSend = async () => {
    if (!chatInput.trim() || !result) return

    const userMessage = chatInput

    setChatMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
      },
    ])

    setChatInput('')
    setChatLoading(true)

    try {
      const recommendations = result.recommendations?.map((r: any) => r.description) || []

      const response = await askDermatologist(userMessage, result.skin_type, recommendations)

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
        },
      ])
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const weeklyPlanEntries = result?.weekly_plan ? Object.entries(result.weekly_plan) : []

  return (
    <ProtectedLayout>
      <div className="mx-auto max-w-5xl space-y-8 p-6 sm:p-8 lg:p-10">
        <div className="rounded-[28px] border border-[#f3e3da] bg-[linear-gradient(135deg,#fffdfb_0%,#fff8f3_100%)] p-6 shadow-[0_18px_50px_rgba(59,47,47,0.06)]">
          <span className="section-kicker">AI-powered skin analysis</span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#3b2f2f] sm:text-4xl">Analyze your skin with a premium ritual</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8a736f] sm:text-base">
            Upload a photo to receive an elegant assessment, tailored recommendations, and a calm weekly care plan.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              <div
                onClick={() => !preview && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="cursor-pointer rounded-[24px] border border-dashed border-[#f3e3da] bg-white/80 p-8 text-center shadow-[0_16px_45px_rgba(59,47,47,0.04)] transition hover:-translate-y-0.5 hover:border-[#d89c8b] hover:bg-[#fffdfb] sm:p-12"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                  className="hidden"
                />

                {preview ? (
                  <div className="space-y-5">
                    <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-[20px] border border-[#f3e3da] shadow-sm">
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-[#3b2f2f]">{selectedFile?.name}</p>
                      <p className="text-sm text-[#8a736f]">
                        {(selectedFile?.size || 0) / 1024 / 1024 < 1
                          ? `${Math.round((selectedFile?.size || 0) / 1024)} KB`
                          : `${((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        reset()
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-[#f3e3da] bg-[#fff8f3] px-4 py-2 text-sm font-medium text-[#3b2f2f] transition hover:bg-[#f8ede7]"
                    >
                      <X className="h-4 w-4" />
                      Choose Different Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#fff2eb] text-[#d89c8b]">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="mb-1 text-lg font-semibold text-[#3b2f2f]">Drag and drop your image here</p>
                      <p className="text-sm text-[#8a736f]">or click to select from your computer</p>
                    </div>
                    <p className="text-xs text-[#8a736f]">Supported formats: JPG, PNG, WebP • Max 10MB</p>
                  </div>
                )}
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 rounded-[16px] border border-[#f3e3da] bg-[#fff8f3] p-4 text-[#d66a5a]">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              {preview && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 sm:p-8"
                >
                  <div className="mb-6">
                    <span className="section-kicker">Personalize your analysis</span>

                    <h3 className="mt-3 text-2xl font-semibold text-[#3b2f2f]">
                      Tell us a little about your skin
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#8a736f]">
                      These details help us make your recommendations and weekly routine more relevant to you.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    {/* Skin Type */}
                    <div>
                      <label
                        htmlFor="skinType"
                        className="mb-2 block text-sm font-semibold text-[#3b2f2f]"
                      >
                        Skin type
                      </label>

                      <select
                        id="skinType"
                        value={skinType}
                        onChange={(e) => setSkinType(e.target.value)}
                        className="w-full rounded-[14px] border border-[#f3e3da] bg-white px-4 py-3 text-sm text-[#3b2f2f] outline-none transition focus:border-[#d89c8b] focus:ring-2 focus:ring-[#d89c8b]/10"
                      >
                        <option value="">Select your skin type</option>
                        <option value="normal">Normal</option>
                        <option value="dry">Dry</option>
                        <option value="oily">Oily</option>
                        <option value="combination">Combination</option>
                        <option value="sensitive">Sensitive</option>
                        <option value="not_sure">I'm not sure</option>
                      </select>
                    </div>

                    {/* Budget */}
                    <div>
                      <label
                        htmlFor="budget"
                        className="mb-2 block text-sm font-semibold text-[#3b2f2f]"
                      >
                        Monthly skincare budget
                      </label>

                      <select
                        id="budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full rounded-[14px] border border-[#f3e3da] bg-white px-4 py-3 text-sm text-[#3b2f2f] outline-none transition focus:border-[#d89c8b] focus:ring-2 focus:ring-[#d89c8b]/10"
                      >
                        <option value="">Select your budget</option>
                        <option value="under_500">Under ₹500</option>
                        <option value="500_1000">₹500 – ₹1,000</option>
                        <option value="1000_2000">₹1,000 – ₹2,000</option>
                        <option value="2000_3000">₹2,000 – ₹3,000</option>
                        <option value="3000_plus">₹3,000+</option>
                      </select>
                    </div>
                  </div>

                  {/* Skin Goals */}
                  <div className="mt-6">
                    <label className="mb-3 block text-sm font-semibold text-[#3b2f2f]">
                      What would you like to improve?
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {skinGoalOptions.map((goal) => {
                        const selected = skinGoals.includes(goal)

                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => toggleSkinGoal(goal)}
                            className={`rounded-full border px-3.5 py-2 text-sm transition ${
                              selected
                                ? 'border-[#d89c8b] bg-[#fff0e9] text-[#b96f5d] shadow-sm'
                                : 'border-[#f3e3da] bg-white text-[#8a736f] hover:border-[#d89c8b] hover:bg-[#fff8f3]'
                            }`}
                          >
                            {selected && '✓ '}
                            {goal}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="mt-6">
                    <label
                      htmlFor="additionalDetails"
                      className="mb-2 block text-sm font-semibold text-[#3b2f2f]"
                    >
                      Additional details
                      <span className="ml-2 font-normal text-[#a58f89]">
                        Optional
                      </span>
                    </label>

                    <textarea
                      id="additionalDetails"
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      rows={4}
                      placeholder="Tell us anything important about your skin, current routine, allergies, products you use, or concerns..."
                      className="w-full resize-none rounded-[14px] border border-[#f3e3da] bg-white px-4 py-3 text-sm text-[#3b2f2f] outline-none placeholder:text-[#b7a7a2] transition focus:border-[#d89c8b] focus:ring-2 focus:ring-[#d89c8b]/10"
                    />
                  </div>

                  {/* Selection Summary */}
                  {(skinType || budget || skinGoals.length > 0) && (
                    <div className="mt-5 rounded-[14px] border border-[#f3e3da] bg-[#fffaf7] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a58f89]">
                        Your analysis profile
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-sm">
                        {skinType && (
                          <span className="rounded-full bg-white px-3 py-1.5 text-[#6f5c57]">
                            {skinType === 'not_sure'
                              ? "Skin type: Not sure"
                              : `Skin type: ${skinType}`}
                          </span>
                        )}

                        {budget && (
                          <span className="rounded-full bg-white px-3 py-1.5 text-[#6f5c57]">
                            Budget: {budget.replaceAll('_', ' ')}
                          </span>
                        )}

                        {skinGoals.length > 0 && (
                          <span className="rounded-full bg-white px-3 py-1.5 text-[#6f5c57]">
                            {skinGoals.length} goal{skinGoals.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {preview && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="premium-button w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Analyze My Skin
                    </>
                  )}
                </motion.button>
              )}

              <div className="glass-card p-6">
                <p className="font-semibold text-[#3b2f2f]">Tips for best results</p>
                <ul className="mt-3 space-y-2 text-sm text-[#8a736f]">
                  <li className="flex gap-2"><span className="text-[#d89c8b]">•</span><span>Use good lighting and clear frontal shots</span></li>
                  <li className="flex gap-2"><span className="text-[#d89c8b]">•</span><span>Avoid heavy makeup or filters</span></li>
                  <li className="flex gap-2"><span className="text-[#d89c8b]">•</span><span>Let your face fill most of the frame</span></li>
                  <li className="flex gap-2"><span className="text-[#d89c8b]">•</span><span>Keep consistency for better progress tracking</span></li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
              <div className="glass-card p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#eef8f2] text-[#7a9d8e]">
                  <CheckCircle className="h-8 w-8" />
                </motion.div>
                <h2 className="text-3xl font-semibold text-[#3b2f2f]">Analysis complete</h2>
                <p className="mt-2 text-sm text-[#8a736f]">Your skin health assessment is ready and beautifully organized</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="glass-card p-6">
                  <p className="mb-2 text-sm text-[#8a736f]">Skin type</p>
                  <h3 className="text-2xl font-semibold text-[#3b2f2f]">{result.skin_type}</h3>
                </div>
                <div className="glass-card p-6">
                  <p className="mb-2 text-sm text-[#8a736f]">Confidence</p>
                  <h3 className="text-2xl font-semibold text-[#3b2f2f]">{Number(result.confidence).toFixed(2)}%</h3>
                </div>
              </div>

              {result.conditions && result.conditions.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="mb-4 text-lg font-semibold text-[#3b2f2f]">Detected conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.conditions.map((condition: string, i: number) => (
                      <motion.span key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} className="rounded-full border border-[#f3e3da] bg-[#fff8f3] px-3 py-1.5 text-sm font-medium text-[#c98b72]">
                        {condition}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="glass-card p-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#3b2f2f]">Recommendations</h3>
                      <p className="mt-1 text-sm text-[#8a736f]">Curated skincare essentials for your routine</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {result.recommendations.map((rec: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -4, scale: 1.01, boxShadow: '0 16px 40px rgba(59,47,47,0.08)' }}
                        className="overflow-hidden rounded-[18px] border border-[#f3e3da] bg-white shadow-[0_10px_30px_rgba(59,47,47,0.05)] transition-all duration-200"
                      >
                        <div className="flex h-32 items-center justify-center border-b border-[#f3e3da] bg-[linear-gradient(135deg,#fff8f3_0%,#f8ede7_100%)] p-4">
                          <div className="flex h-24 w-full max-w-[140px] items-center justify-center rounded-[14px] border border-white/70 bg-white/80 shadow-inner">
                            <div className="flex flex-col items-center gap-2 text-[#d89c8b]">
                              <div className="flex h-12 w-10 items-center justify-center rounded-[10px] border border-[#f3e3da] bg-[#fff2eb]">
                                <Sparkles className="h-5 w-5" />
                              </div>
                              <div className="h-2.5 w-10 rounded-full bg-[#f3e3da]" />
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold leading-6 text-[#3b2f2f]">{rec.product_type}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[#8a736f]">Skincare routine</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${rec.priority === 'high' ? 'bg-[#fff1ec] text-[#d66a5a]' : rec.priority === 'medium' ? 'bg-[#fff6e7] text-[#d7a35a]' : 'bg-[#eef8f2] text-[#7a9d8e]'}`}>
                              {rec.priority}
                            </span>
                          </div>

                          <p className="text-sm leading-6 text-[#8a736f]">{rec.description}</p>

                          <div className="mt-4 flex items-center justify-between rounded-[14px] border border-[#f3e3da] bg-[#fffdfb] px-3 py-2">
                            <span className="text-sm font-medium text-[#3b2f2f]">Routine label</span>
                            <span className="text-sm font-semibold text-[#d89c8b]">Morning</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {result.weekly_plan && (
                <div className="glass-card p-6 md:p-8">
                  <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <div className="section-kicker">7-day ritual</div>
                      <h3 className="mt-3 text-2xl font-semibold text-[#3b2f2f]">Your Personalized 7-Day Ritual</h3>
                      <p className="mt-2 text-sm leading-6 text-[#8a736f]">Generated from today&apos;s AI skin analysis.</p>
                    </div>
                  </div>

                  <div className="relative space-y-4 pl-7">
                    <div className="absolute left-[10px] top-0 h-full w-px bg-[#f3e3da]" />
                    {weeklyPlanEntries.map(([day, routine]: [string, any], index) => {
                      const isOpen = expandedDay === day

                      return (
                        <div key={day} className="relative">
                          <div className="absolute left-[-28px] top-4 h-5 w-5 rounded-full border-4 border-[#fff8f3] bg-[#d89c8b] shadow-sm" />
                          <div className="overflow-hidden rounded-[20px] border border-[#f3e3da] bg-[#fffdfb] shadow-[0_10px_30px_rgba(59,47,47,0.04)]">
                            <button
                              onClick={() => setExpandedDay(isOpen ? null : day)}
                              aria-expanded={isOpen}
                              className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"
                            >
                              <div>
                                <p className="text-lg font-semibold text-[#3b2f2f]">{day}</p>
                                <p className="mt-1 text-sm text-[#8a736f]">Daily skincare plan</p>
                              </div>
                              <ChevronDown className={`h-5 w-5 text-[#8a736f] transition ${isOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden border-t border-[#f3e3da]"
                                >
                                  <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
                                    <div className="rounded-[16px] border border-[#f3e3da] bg-white p-4 shadow-sm">
                                      <div className="flex items-center gap-2">
                                        <SunMedium className="h-4 w-4 text-[#d89c8b]" />
                                        <h4 className="text-sm font-semibold text-[#3b2f2f]">Morning Routine</h4>
                                      </div>
                                      <p className="mt-3 text-sm leading-6 text-[#8a736f]">{routine.morning}</p>
                                    </div>

                                    <div className="rounded-[16px] border border-[#f3e3da] bg-white p-4 shadow-sm">
                                      <div className="flex items-center gap-2">
                                        <MoonStar className="h-4 w-4 text-[#d89c8b]" />
                                        <h4 className="text-sm font-semibold text-[#3b2f2f]">Night Routine</h4>
                                      </div>
                                      <p className="mt-3 text-sm leading-6 text-[#8a736f]">{routine.night}</p>
                                    </div>

                                    <div className="rounded-[16px] border border-[#f3e3da] bg-white p-4 shadow-sm">
                                      <div className="flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4 text-[#d89c8b]" />
                                        <h4 className="text-sm font-semibold text-[#3b2f2f]">Daily Tip</h4>
                                      </div>
                                      <p className="mt-3 text-sm leading-6 text-[#8a736f]">{routine.tip}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <AIChat skinType={result.skin_type} recommendations={result.recommendations} />

              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={reset} className="flex-1 rounded-[16px] border border-[#f3e3da] bg-white px-4 py-3 font-semibold text-[#3b2f2f] transition hover:bg-[#fff8f3]">
                  Analyze another image
                </button>
                <Link href="/history" className="flex-1 rounded-[16px] bg-[#d89c8b] px-4 py-3 text-center font-semibold text-white transition hover:bg-[#c98b72]">
                  View history
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedLayout>
  )
}
