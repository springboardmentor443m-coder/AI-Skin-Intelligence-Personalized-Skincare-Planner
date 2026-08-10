import { motion } from 'framer-motion'
import {
  UploadCloud,
  Sparkles,
  ScanLine,
  Camera,
  Image as GalleryIcon,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShoppingBag,
  Star,
  Info,
  Stethoscope,
  Sun,
  Moon,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Download,
  RotateCcw,
} from 'lucide-react'
import { useRef, useState } from 'react'
import CameraModal from '../components/CameraModal'
import AnalysisProgressModal from '../components/AnalysisProgressModal'
import AIExplainabilityCard from '../components/AIExplainabilityCard'
import { validateImageQuality, cropFaceFromElement } from '../utils/imageQuality'
import { saveAnalysisRecord } from '../utils/skincareStorage'
import { generateClinicalPDFReport } from '../utils/reportGenerator'
import { useAuth } from '../auth/useAuth'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024
const API_URL = import.meta.env.DEV ? '/api/predict' : 'http://127.0.0.1:8000/predict'

export default function SkinAnalysis() {
  const { user } = useAuth()
  const galleryInputRef = useRef(null)

  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageResolution, setImageResolution] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false)

  // Quality Validation State
  const [qualityMetrics, setQualityMetrics] = useState(null)
  const [isValidating, setIsValidating] = useState(false)

  const runQualityAnalysisAndCrop = async (rawFile, rawDataUrl) => {
    setIsValidating(true)
    setError('')

    const img = new Image()
    img.src = rawDataUrl
    await new Promise((resolve) => {
      img.onload = resolve
    })

    const metrics = await validateImageQuality(img)
    setQualityMetrics(metrics)

    if (metrics.faceDetected && metrics.primaryFace) {
      // Auto Face Crop for gallery upload
      const cropped = await cropFaceFromElement(img, metrics.primaryFace)
      if (cropped) {
        setSelectedFile(cropped.file)
        setImagePreview(cropped.previewUrl)
        setImageResolution(`${cropped.width} × ${cropped.height} px`)
        setIsValidating(false)
        return
      }
    }

    // Fallback to original image if face crop not applicable
    setSelectedFile(rawFile)
    setImagePreview(rawDataUrl)
    setImageResolution(`${img.naturalWidth} × ${img.naturalHeight} px`)
    setIsValidating(false)
  }

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
      const dataUrl = reader.result
      setResult(null)
      runQualityAnalysisAndCrop(file, dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleCameraCapture = ({ file, previewUrl }) => {
    setResult(null)
    runQualityAnalysisAndCrop(file, previewUrl)
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    handleFile(file)
  }

  const onAnalyze = async () => {
    if (!selectedFile) {
      setError('Upload or capture an image first to analyze it.')
      return
    }

    if (qualityMetrics && !qualityMetrics.isValid) {
      setError(qualityMetrics.errors[0] || 'Image quality validation failed. Please retake.')
      return
    }

    setIsLoading(true)
    setIsProgressModalOpen(true)
    setError('')
    setResult(null)

    try {
      const startTime = performance.now()
      const formData = new FormData()
      formData.append('file', selectedFile)

      let token = window.localStorage.getItem('skin-intelligence-token')
      const headers = {}
      if (token) {
        token = token.replace(/^"(.*)"$/, '$1').trim()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      }

      const uploadStart = performance.now()
      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: formData,
      })
      const uploadEnd = performance.now()

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.message || (typeof errorData?.detail === 'string' ? errorData.detail : null) || 'Unable to analyze the image right now.'
        throw new Error(msg)
      }

      const data = await response.json()
      const endTime = performance.now()

      console.log(`[PERFORMANCE]
Frontend quality check & prep: ${Math.round(uploadStart - startTime)} ms
Upload/HTTP request to /predict: ${Math.round(uploadEnd - uploadStart)} ms
Response processing: ${Math.round(endTime - uploadEnd)} ms
Total frontend time: ${Math.round(endTime - startTime)} ms`)

      // Handle Invalid Non-Skin/Face Images
      if (data.valid_image === false) {
        setError(
          data.message ||
            "This doesn't appear to be a clear skin/face image. Please upload a clear photo of the affected skin area."
        )
        return
      }

      // Handle Low-Confidence / Ambiguous Skin Images
      if (!data.prediction || data.is_ambiguous) {
        setError(
          data.message || 'Unable to confidently identify a skin condition.'
        )
        return
      }

      // Process Valid & Confident Prediction
      const conditionName = data.prediction
      const confNum = Number(data.confidence || 0)
      const confFormatted = `${(confNum * 100).toFixed(2)}%`

      const analysisResult = {
        disease: conditionName,
        confidence: confFormatted,
        confidenceValue: confNum,
        recommendation: data.recommendation,
        image: imagePreview,
      }

      setResult(analysisResult)
      // Save scan record locally for history & comparison ONLY when valid & confident
      saveAnalysisRecord({
        disease: conditionName,
        confidence: confFormatted,
        confidenceValue: confNum,
        image: imagePreview,
        recommendation: data.recommendation,
      })
    } catch (err) {
      console.error(err)
      setError(err.message || 'We could not analyze the image. Please try again with a clear photo.')
    } finally {
      setIsLoading(false)
      setIsProgressModalOpen(false)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setImagePreview('')
    setImageResolution('')
    setQualityMetrics(null)
    setResult(null)
    setError('')
  }

  const handleExportPDF = () => {
    if (!result) return
    generateClinicalPDFReport({
      userName: user?.full_name || user?.name || 'Patient Profile',
      userEmail: user?.email || '',
      predictionResult: result,
      healthScore: 92,
      date: new Date().toLocaleDateString(),
    })
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700">
          <ScanLine className="h-4 w-4" /> AI Skin Diagnostics
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Clinical-Grade Smart Face Scanner
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Automatic face detection, smart face cropping, and clinical AI analysis to detect skin conditions and recommend targeted routines.
        </p>
      </div>

      {/* Analysis Flow: Step 1 & Step 2 */}
      <div className="grid gap-6 xl:grid-cols-2">
        
        {/* Step 1: Upload Area */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                1
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upload or Capture Image</h2>
                <p className="text-xs text-slate-500">Live smart camera or gallery upload with auto face-cropping</p>
              </div>
            </div>

            {/* Drag & Drop Box */}
            <div
              onDragOver={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`mt-6 rounded-[1.5rem] border-2 border-dashed p-8 text-center transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50/80 hover:border-emerald-400'
              }`}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="mt-4 text-base font-bold text-slate-800">Drag & drop your photo here</p>
              <p className="mt-1 text-xs text-slate-500">Supports PNG, JPG, JPEG, WEBP up to 10MB</p>

              {/* Action Buttons: Camera & Gallery */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
                >
                  <Camera className="h-4 w-4 text-emerald-400" />
                  Use Camera
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition"
                >
                  <GalleryIcon className="h-4 w-4" />
                  Browse Gallery
                </button>
              </div>

              {/* Hidden file input for Gallery ONLY */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFile(e.target.files[0])
                    e.target.value = ''
                  }
                }}
              />
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ensure good lighting and focus</span>
            {selectedFile && (
              <button onClick={removeImage} className="font-semibold text-rose-600 hover:underline">
                Remove photo
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Image Preview Card & Validation Scores */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  2
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Analyzed Image Preview</h2>
                  <p className="text-xs text-slate-500">Inspected for skin/face presence, blur, and lighting</p>
                </div>
              </div>

              {qualityMetrics && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 ${
                    qualityMetrics.isValid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {qualityMetrics.isValid ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Ready for Analysis ✓
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5" /> Quality Issue ✕
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Preview Container: Fixed height, object-contain, centered */}
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-950 h-72 sm:h-80 relative flex items-center justify-center p-3 shadow-inner">
              {isValidating ? (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-400 border-t-transparent" />
                  <span className="text-xs font-semibold">Running Local Quality Inspection...</span>
                </div>
              ) : imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Cropped face analysis preview"
                  className="max-h-full max-w-full object-contain object-center rounded-xl shadow-lg transition-all"
                />
              ) : (
                <div className="text-center text-slate-400 p-6">
                  <GalleryIcon className="mx-auto h-12 w-12 text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No Image Selected</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Image preview and quality metrics will render here.
                  </p>
                </div>
              )}
            </div>

            {/* Quality Metrics & File Details */}
            {selectedFile && qualityMetrics && (
              <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                {/* Validation Status Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Target Status</p>
                    <p
                      className={`font-semibold mt-0.5 ${
                        qualityMetrics.faceDetected || qualityMetrics.hasSkin ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {qualityMetrics.faceDetected
                        ? 'Face Detected ✓'
                        : qualityMetrics.hasSkin
                        ? 'Skin Area Detected ✓'
                        : 'No Skin/Face ✕'}
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Quality Score</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{qualityMetrics.qualityScore} / 100</p>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Brightness Score</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{qualityMetrics.brightnessScore}%</p>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Resolution</p>
                    <p className="font-semibold text-emerald-700 mt-0.5">{imageResolution}</p>
                  </div>
                </div>

                {/* Validation Warnings Notice */}
                {!qualityMetrics.isValid && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700 space-y-1">
                    {qualityMetrics.errors.map((err, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                    Retake
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                    Replace
                  </button>

                  <button
                    type="button"
                    onClick={removeImage}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Analyze Action Button */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!selectedFile || isLoading || (qualityMetrics && !qualityMetrics.isValid)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Analyzing Image with Clinical AI…</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run AI Prediction</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Clinical Progress Stepped Loading Modal */}
      <AnalysisProgressModal isOpen={isProgressModalOpen} />

      {/* Step 3: Prediction Result Card */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
              <div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                  Step 3: AI Prediction Result
                </span>
                <h2 className="mt-3 text-3xl font-extrabold text-white">{result.disease}</h2>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-600 transition"
                >
                  <Download className="h-4 w-4" /> Export Clinical PDF
                </button>
                <div className="rounded-2xl bg-white/10 p-4 border border-white/10 text-right">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Model Confidence</p>
                  <p className="text-2xl font-extrabold text-emerald-400">{result.confidence}</p>
                </div>
              </div>
            </div>

            {/* Structured Details Grid */}
            <div className="mt-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Clinical Overview</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">
                  {result.recommendation?.description || 'Detected condition guidance.'}
                </p>
              </div>

              {/* Causes & Symptoms */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" /> Causes
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {result.recommendation?.causes?.map((c, i) => <li key={i}>{c}</li>) || <li>Blocked pores & oil</li>}
                  </ul>
                </div>

                <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5" /> Symptoms
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {result.recommendation?.symptoms?.map((s, i) => <li key={i}>{s}</li>) || <li>Mild redness & bumps</li>}
                  </ul>
                </div>
              </div>

              {/* Do's & Don'ts */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" /> Do's
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-slate-200">
                    {result.recommendation?.dos?.map((d, i) => <li key={i}>✓ {d}</li>) || <li>Cleanse gently daily</li>}
                  </ul>
                </div>

                <div className="rounded-2xl bg-rose-500/10 p-4 border border-rose-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" /> Don'ts
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-slate-200">
                    {result.recommendation?.donts?.map((d, i) => <li key={i}>✕ {d}</li>) || <li>Do not pop pimples</li>}
                  </ul>
                </div>
              </div>

              {/* Routines & Ingredients */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5" /> Morning Routine
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300">
                    {result.recommendation?.skincare_routine?.morning?.map((m, i) => <li key={i}>• {m}</li>) || <li>Gentle Cleanser & SPF</li>}
                  </ul>
                </div>

                <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5" /> Night Routine
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300">
                    {result.recommendation?.skincare_routine?.night?.map((n, i) => <li key={i}>• {n}</li>) || <li>Cleanser & Barrier Cream</li>}
                  </ul>
                </div>

                <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Key Active Ingredients
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result.recommendation?.recommended_ingredients?.map((ing, i) => (
                      <span key={i} className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300">
                        {ing}
                      </span>
                    )) || <span className="text-xs text-slate-300">Salicylic Acid, Niacinamide</span>}
                  </div>
                </div>
              </div>

              {/* Doctor Advice */}
              <div className="rounded-2xl bg-sky-500/10 p-4 border border-sky-500/30 flex items-start gap-3">
                <Stethoscope className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">Doctor Advice</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200">
                    {result.recommendation?.when_to_consult_doctor || 'Consult a dermatologist if irritation persists.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Diagnostic Transparency & Explainability Card */}
          <AIExplainabilityCard prediction={result} />

          {/* Product Recommendations */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700">
                <ShoppingBag className="h-4 w-4" /> Targeted Products
              </div>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Recommended Skincare Products</h2>
              <p className="text-xs text-slate-500">Selected specifically to target {result.disease}</p>
            </div>

            {/* Product Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  name: 'Salicylic Acid 2% Clarifying Serum',
                  brand: 'DermoLab Professional',
                  bestFor: `Best for ${result.disease} & unclogging pores`,
                  ingredients: '2% BHA, Zinc PCA, Tea Tree Extract',
                  price: '$24.99',
                  rating: '4.9 ★',
                  image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
                },
                {
                  name: 'Barrier Defense Repair Cream',
                  brand: 'Ceramide Clinical',
                  bestFor: 'Barrier repair & deep hydration',
                  ingredients: '3 Essential Ceramides, Hyaluronic Acid',
                  price: '$29.50',
                  rating: '4.8 ★',
                  image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
                },
                {
                  name: 'Calming Mineral Sunscreen SPF 50',
                  brand: 'SunShield Medical',
                  bestFor: 'Sensitive skin UV protection',
                  ingredients: 'Zinc Oxide, Niacinamide, Vitamin E',
                  price: '$22.00',
                  rating: '5.0 ★',
                  image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80',
                },
              ].map((product, idx) => (
                <div key={idx} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-emerald-400 hover:shadow-md transition">
                  <div>
                    <div className="h-40 overflow-hidden rounded-xl bg-slate-900">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{product.brand}</span>
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-500" /> {product.rating}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-slate-900">{product.name}</h3>

                    {/* Best For Tag */}
                    <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      {product.bestFor}
                    </span>

                    {/* Why these products? / Ingredients */}
                    <div className="mt-3 border-t border-slate-200 pt-2 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">Why this product?</p>
                      <p className="text-[11px] text-slate-500 leading-tight">Formulated specifically to calm {result.disease} inflammation.</p>
                      <p className="mt-1.5 font-semibold text-slate-800">Key Ingredients:</p>
                      <p className="text-[11px] text-emerald-700 font-medium">{product.ingredients}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-base font-bold text-slate-900">{product.price}</span>
                    <button
                      type="button"
                      onClick={() => alert(`Buy placeholder clicked for ${product.name}`)}
                      className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
                    >
                      Buy Now (Placeholder)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
