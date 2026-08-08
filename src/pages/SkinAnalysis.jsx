import { motion } from 'framer-motion'
import { UploadCloud, Sparkles, ScanLine, RefreshCcw, ImagePlus } from 'lucide-react'
import { useRef, useState } from 'react'
import { saveSkinAnalysisContext } from '../utils/chatbotContext'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024
const API_URL = import.meta.env.DEV ? '/api/predict' : 'http://127.0.0.1:8000/predict'

export default function SkinAnalysis() {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFile = (file) => {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a PNG, JPG, JPEG, or WEBP image.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('File is too large. Please choose an image up to 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
      setSelectedFile(file)
      setError('')
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    handleFile(file)
  }

  const onAnalyze = async () => {
    if (!selectedFile) {
      setError('Upload an image first to analyze it.')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.detail || 'Unable to analyze the image right now.')
      }

      const data = await response.json()
      const nextResult = {
        disease: data.prediction || 'Unknown',
        confidence: `${(Number(data.confidence || 0) * 100).toFixed(2)}%`,
        recommendation: data.recommendation,
      }
      setResult(nextResult)
      saveSkinAnalysisContext({
        condition: nextResult.disease,
        confidence: Number(data.confidence || 0),
        recommendation: data.recommendation?.description || data.recommendation || '',
      })
    } catch (err) {
      console.error(err)
      setError('We could not analyze the image. Please try again with a clear photo.')
    } finally {
      setIsLoading(false)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setImagePreview('')
    setResult(null)
    setError('')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Skin analysis</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Upload an image and preview a polished analysis experience.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Upload a clear image to receive a model prediction and an educational routine tailored to the detected condition.</p>
          </div>
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">Local preview mode</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Upload image</p>
              <p className="text-sm text-slate-500">Drag and drop a portrait or close-up photo to begin.</p>
            </div>
          </div>

          <motion.div
            onDragOver={(event) => {
              event.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`mt-6 rounded-[1.5rem] border border-dashed p-8 text-center transition ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
              <ScanLine className="h-8 w-8" />
            </div>
            <p className="mt-5 text-lg font-semibold text-slate-800">Drop your image here</p>
            <p className="mt-2 text-sm text-slate-500">PNG, JPG, JPEG, or WEBP up to 10MB</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">Browse file</button>
              <button type="button" onClick={removeImage} disabled={!selectedFile} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50">Remove image</button>
            </div>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
          </motion.div>

          {error && <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>}

          <div className="mt-6 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Image preview</p>
              {selectedFile && <p className="text-sm text-slate-500">{selectedFile.name}</p>}
            </div>
            {imagePreview ? (
              <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white">
                <img src={imagePreview} alt="Selected skincare preview" className="h-64 w-full object-cover" />
              </div>
            ) : (
              <div className="mt-4 flex h-64 items-center justify-center rounded-[1.25rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_60%),linear-gradient(135deg,_#e2e8f0_0%,_#f8fafc_100%)] text-slate-500">
                <div className="text-center">
                  <ImagePlus className="mx-auto h-8 w-8" />
                  <p className="mt-2 text-sm">Preview appears here once you upload an image.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-50 p-2 text-sky-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">Prediction result</p>
                  <p className="text-sm text-slate-500">Live analysis powered by the AI backend.</p>
                </div>
              </div>
              <button type="button" onClick={onAnalyze} disabled={isLoading} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70">
                {isLoading ? 'Analyzing…' : 'Analyze'}
              </button>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-slate-950 p-6 text-white">
              {isLoading ? (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  <span>Analyzing your image…</span>
                </div>
              ) : result ? (
                <>
                  <p className="text-sm text-emerald-300">Disease name</p>
                  <p className="mt-2 text-2xl font-semibold">{result.disease}</p>
                  <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                    <span className="text-sm text-slate-300">Confidence percentage</span>
                    <span className="text-lg font-semibold text-emerald-300">{result.confidence}</span>
                  </div>
                  {result.recommendation && (
                    <div className="mt-5 space-y-4 rounded-2xl bg-white/10 p-4">
                      <div>
                        <p className="text-sm font-semibold text-emerald-300">Personalized guidance</p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">{result.recommendation.description}</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Morning</p>
                          <ul className="mt-2 space-y-1 text-sm text-slate-200">
                            {result.recommendation.skincare_routine?.morning?.map((step) => <li key={step}>{step}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Night</p>
                          <ul className="mt-2 space-y-1 text-sm text-slate-200">
                            {result.recommendation.skincare_routine?.night?.map((step) => <li key={step}>{step}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
                  Upload an image and click analyze to receive a live skin-condition prediction.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span>Replace image anytime</span>
              <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-2 font-semibold text-emerald-600">
                <RefreshCcw className="h-4 w-4" />
                Replace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
