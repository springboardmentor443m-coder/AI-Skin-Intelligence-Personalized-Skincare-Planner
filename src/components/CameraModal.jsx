import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, X, RotateCcw, Check, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react'
import { detectFaces, calculateBrightness, cropFaceFromElement } from '../utils/imageQuality'

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)

  const [stream, setStream] = useState(null)
  const [facingMode, setFacingMode] = useState('user') // 'user' (front) or 'environment' (back)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null) // Data URL of snapped frame
  const [capturedFile, setCapturedFile] = useState(null) // File object for API submit
  const [cameraError, setCameraError] = useState('')
  const [isPermissionDenied, setIsPermissionDenied] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  // Live face detection & guidance state
  const [detectedFaceBox, setDetectedFaceBox] = useState(null)
  const [guidanceMessage, setGuidanceMessage] = useState('Position your face inside the guide')
  const [isFaceCentered, setIsFaceCentered] = useState(false)
  const [isLightingGood, setIsLightingGood] = useState(true)
  const [faceCount, setFaceCount] = useState(0)

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  // Check available media devices
  useEffect(() => {
    async function checkDevices() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const videoDevices = devices.filter((device) => device.kind === 'videoinput')
          setHasMultipleCameras(videoDevices.length > 1)
        }
      } catch (err) {
        console.warn('Could not enumerate devices:', err)
      }
    }
    if (isOpen) {
      checkDevices()
    }
  }, [isOpen])

  // Start camera stream
  useEffect(() => {
    async function startCamera() {
      if (!isOpen) return
      setIsInitializing(true)
      setCameraError('')
      setIsPermissionDenied(false)
      stopStream()

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported by your browser.')
        }

        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((e) => console.warn('Play interrupted:', e))
          }
        }
      } catch (err) {
        console.error('Camera initialization error:', err)
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setIsPermissionDenied(true)
          setCameraError('Camera access is required for live skin scanning.')
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No camera device was detected on your device.')
        } else {
          setCameraError(err.message || 'Unable to access camera. Please check permissions and try again.')
        }
      } finally {
        setIsInitializing(false)
      }
    }

    if (isOpen && !capturedImage) {
      startCamera()
    }

    return () => {
      stopStream()
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isOpen, facingMode, capturedImage, stopStream])

  // Real-time Face Detection & Position Guidance loop
  useEffect(() => {
    let active = true

    async function runLiveAnalysis() {
      if (!isOpen || capturedImage || !videoRef.current || videoRef.current.readyState < 2) {
        if (active) animFrameRef.current = requestAnimationFrame(runLiveAnalysis)
        return
      }

      const video = videoRef.current
      try {
        const faces = await detectFaces(video)
        setFaceCount(faces.length)

        if (faces.length > 0) {
          const face = faces[0]
          const vidW = video.videoWidth || 640
          const vidH = video.videoHeight || 480

          // Calculate face center relative to video
          const faceCenterX = face.x + face.width / 2
          const faceCenterY = face.y + face.height / 2

          // Normalize bounding box for UI overlay (0-100%)
          setDetectedFaceBox({
            left: `${(face.x / vidW) * 100}%`,
            top: `${(face.y / vidH) * 100}%`,
            width: `${(face.width / vidW) * 100}%`,
            height: `${(face.height / vidH) * 100}%`,
            rawFace: face,
          })

          const isCenteredX = faceCenterX > vidW * 0.25 && faceCenterX < vidW * 0.75
          const isCenteredY = faceCenterY > vidH * 0.2 && faceCenterY < vidH * 0.8
          const isGoodSize = face.width > vidW * 0.2

          if (!isGoodSize) {
            setGuidanceMessage('Move closer')
            setIsFaceCentered(false)
          } else if (!isCenteredX) {
            if (facingMode === 'user') {
              setGuidanceMessage(faceCenterX < vidW * 0.35 ? 'Move left' : 'Move right')
            } else {
              setGuidanceMessage(faceCenterX < vidW * 0.35 ? 'Move right' : 'Move left')
            }
            setIsFaceCentered(false)
          } else if (!isCenteredY) {
            setGuidanceMessage('Center face in oval guide')
            setIsFaceCentered(false)
          } else {
            setGuidanceMessage('✓ Face Detected')
            setIsFaceCentered(true)
          }
        } else {
          setDetectedFaceBox(null)
          setGuidanceMessage('Position face inside the guide')
          setIsFaceCentered(false)
        }

        // Fast brightness check on canvas
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = 160
        tempCanvas.height = 120
        const ctx = tempCanvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          ctx.drawImage(video, 0, 0, 160, 120)
          const brightness = calculateBrightness(tempCanvas, ctx)
          setIsLightingGood(brightness.status !== 'too_dark')
        }
      } catch (e) {
        console.warn('Live face detection loop error:', e)
      }

      if (active) {
        setTimeout(() => {
          animFrameRef.current = requestAnimationFrame(runLiveAnalysis)
        }, 150)
      }
    }

    if (isOpen && !capturedImage) {
      animFrameRef.current = requestAnimationFrame(runLiveAnalysis)
    }

    return () => {
      active = false
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isOpen, capturedImage, facingMode])

  const handleClose = () => {
    stopStream()
    setCapturedImage(null)
    setCapturedFile(null)
    setCameraError('')
    setIsPermissionDenied(false)
    setDetectedFaceBox(null)
    onClose()
  }

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  // Auto Face Crop on Capture
  const handleTakeSnapshot = async () => {
    if (!videoRef.current) return
    const video = videoRef.current

    // Auto crop face region with 35% margin for skin context
    const croppedResult = await cropFaceFromElement(
      video,
      detectedFaceBox ? detectedFaceBox.rawFace : null
    )

    if (croppedResult) {
      setCapturedImage(croppedResult.previewUrl)
      setCapturedFile(croppedResult.file)
    } else {
      // Fallback if canvas crop fails
      const fallbackCanvas = document.createElement('canvas')
      fallbackCanvas.width = video.videoWidth || 640
      fallbackCanvas.height = video.videoHeight || 480
      const ctx = fallbackCanvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const dataUrl = fallbackCanvas.toDataURL('image/jpeg', 0.92)
        setCapturedImage(dataUrl)
        fallbackCanvas.toBlob((blob) => {
          if (blob) {
            setCapturedFile(new File([blob], `skin_scan_${Date.now()}.jpg`, { type: 'image/jpeg' }))
          }
        }, 'image/jpeg', 0.92)
      }
    }

    stopStream()
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setCapturedFile(null)
    setDetectedFaceBox(null)
  }

  const handleConfirmUsePhoto = () => {
    if (capturedImage && capturedFile) {
      onCapture({
        file: capturedFile,
        previewUrl: capturedImage,
      })
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 transition-all">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl text-white">
        
        {/* Top Dialog Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Clinical AI Live Camera</h3>
              <p className="text-[11px] text-slate-400 font-medium">Smart Face Detection & Quality Validation</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Camera Viewport / Captured Preview */}
        <div className="relative h-80 sm:h-96 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center max-w-md space-y-3">
              <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
              <h4 className="text-base font-bold text-white">Camera Access Notice</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
              {isPermissionDenied && (
                <p className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  Please enable camera permission in your browser address bar settings and click "Try Again".
                </p>
              )}
            </div>
          ) : capturedImage ? (
            /* Captured Cropped Face Preview */
            <div className="relative h-full w-full flex items-center justify-center p-4">
              <img
                src={capturedImage}
                alt="Captured cropped face"
                className="max-h-full max-w-full object-contain rounded-2xl border border-slate-700 shadow-2xl"
              />
              <div className="absolute top-4 left-4 rounded-full bg-emerald-500/90 backdrop-blur-md px-3 py-1 text-xs font-extrabold text-white flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="h-3.5 w-3.5" /> Auto-Cropped Face Ready
              </div>
            </div>
          ) : (
            /* Live Video Stream & Green Face Bounding Box */
            <div className="relative h-full w-full flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Hidden Canvas for Brightness Analysis */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Google Lens / Clinical Face Oval Guide Overlay */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4">
                {/* Oval Face Guide */}
                <div
                  className={`h-64 w-52 rounded-[50%] border-2 transition-all duration-300 ${
                    isFaceCentered
                      ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                      : 'border-white/60 bg-transparent'
                  }`}
                />

                {/* Detected Dynamic Green Bounding Box */}
                {detectedFaceBox && (
                  <div
                    className="absolute rounded-2xl border-2 border-emerald-400 bg-emerald-500/10 transition-all duration-150"
                    style={{
                      left: detectedFaceBox.left,
                      top: detectedFaceBox.top,
                      width: detectedFaceBox.width,
                      height: detectedFaceBox.height,
                    }}
                  />
                )}
              </div>

              {/* Live Feedback Banner */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 px-4 py-1.5 text-xs font-bold text-white flex items-center gap-2 shadow-lg">
                <span
                  className={`h-2 w-2 rounded-full animate-pulse ${
                    isFaceCentered ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span>{guidanceMessage}</span>
              </div>

              {/* Quality Checklist Badges */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-semibold text-slate-300 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800">
                <span className="flex items-center gap-1">
                  <UserCheck className={`h-3.5 w-3.5 ${faceCount === 1 ? 'text-emerald-400' : 'text-amber-400'}`} />
                  {faceCount === 1 ? '1 Face Detected' : faceCount > 1 ? 'Multiple Faces' : 'Searching Face...'}
                </span>

                <span className="flex items-center gap-1">
                  <ShieldCheck className={`h-3.5 w-3.5 ${isLightingGood ? 'text-emerald-400' : 'text-rose-400'}`} />
                  {isLightingGood ? 'Good Lighting ✓' : 'Low Lighting ✕'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="border-t border-slate-800 p-5 sm:px-8 bg-slate-900 flex items-center justify-between">
          {capturedImage ? (
            /* Action Buttons for Captured Photo */
            <div className="flex w-full items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-5 py-3 text-xs font-bold text-white hover:bg-slate-700 transition"
              >
                <RotateCcw className="h-4 w-4" /> Retake Photo
              </button>

              <button
                type="button"
                onClick={handleConfirmUsePhoto}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition"
              >
                <Check className="h-4 w-4" /> Use Photo for Analysis
              </button>
            </div>
          ) : (
            /* Action Buttons for Live Stream */
            <div className="flex w-full items-center justify-between">
              {hasMultipleCameras ? (
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="rounded-full bg-slate-800 p-3 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  title="Switch Front/Back Camera"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              ) : (
                <div className="w-10" />
              )}

              {/* Shutter Trigger Button */}
              <button
                type="button"
                onClick={handleTakeSnapshot}
                disabled={isInitializing || !!cameraError}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 p-1 shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition disabled:opacity-50"
              >
                <div className="h-12 w-12 rounded-full border-2 border-white bg-emerald-400" />
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
