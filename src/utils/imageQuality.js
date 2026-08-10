/**
 * Production-grade Image Quality & Face Detection Utility
 * Zero external heavy bundle dependencies - 100% browser compatible.
 */

/**
 * Detect faces in HTMLImageElement, HTMLVideoElement, or HTMLCanvasElement
 * Uses native browser FaceDetector API when available, with canvas skin-feature fallback.
 */
export async function detectFaces(element) {
  if (!element) return []

  // 1. Try Native Browser FaceDetector API (Chrome / Edge native acceleration)
  if ('FaceDetector' in window) {
    try {
      const faceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
      const faces = await faceDetector.detect(element)
      if (faces && faces.length > 0) {
        return faces.map((f) => ({
          x: f.boundingBox.x,
          y: f.boundingBox.y,
          width: f.boundingBox.width,
          height: f.boundingBox.height,
          score: 0.95,
        }))
      }
    } catch (e) {
      console.warn('Native FaceDetector fallback to canvas analyzer:', e)
    }
  }

  // 2. Fallback canvas skin-tone & facial region detector
  return fallbackDetectFace(element)
}

/**
 * Fallback canvas skin-tone & oval feature detector
 */
function fallbackDetectFace(element) {
  try {
    const canvas = document.createElement('canvas')
    const width = element.videoWidth || element.naturalWidth || element.width || 640
    const height = element.videoHeight || element.naturalHeight || element.height || 480

    if (width === 0 || height === 0) return []

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return []

    ctx.drawImage(element, 0, 0, width, height)
    const imgData = ctx.getImageData(0, 0, width, height)
    const data = imgData.data

    let minX = width
    let maxX = 0
    let minY = height
    let maxY = 0
    let skinPixelCount = 0
    let greenPixelCount = 0
    let bluePixelCount = 0
    let topBorderSkinCount = 0
    let totalSampled = 0
    const step = 4

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        totalSampled++
        const i = (y * width + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Green dominance (plants / grass / trees)
        if (g > r + 10 && g > b + 10) {
          greenPixelCount++
        }
        // Blue dominance (sky / water)
        if (b > r + 15 && b > g + 10) {
          bluePixelCount++
        }

        // YCbCr skin color transformation & validation
        // Y = 0.299R + 0.587G + 0.114B
        // Cb = 128 - 0.168736R - 0.331264G + 0.5B
        // Cr = 128 + 0.5R - 0.418688G - 0.081312B
        const yVal = 0.299 * r + 0.587 * g + 0.114 * b
        const cbVal = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
        const crVal = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b

        const isSkin =
          yVal >= 20 &&
          yVal <= 245 &&
          cbVal >= 77 &&
          cbVal <= 128 &&
          crVal >= 133 &&
          crVal <= 173

        if (isSkin) {
          skinPixelCount++
          if (y < height * 0.15) topBorderSkinCount++
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    const skinRatio = skinPixelCount / totalSampled
    const greenRatio = greenPixelCount / totalSampled
    const blueRatio = bluePixelCount / totalSampled
    const topBorderRatio = topBorderSkinCount / (totalSampled * 0.15)

    // Filter out landscapes (foliage, sky/water, sunset borders)
    if (greenRatio > 0.22 || blueRatio > 0.22 || topBorderRatio > 0.55) {
      return []
    }

    const faceRegionWidth = maxX - minX
    const faceRegionHeight = maxY - minY

    if (skinRatio >= 0.12 && skinRatio <= 0.85 && faceRegionWidth > 50 && faceRegionHeight > 50) {
      return [
        {
          x: minX,
          y: minY,
          width: faceRegionWidth,
          height: faceRegionHeight,
          score: 0.85,
        },
      ]
    }
  } catch (e) {
    console.warn('Fallback face detection error:', e)
  }
  return []
}

/**
 * Calculate brightness / luminance score (0-100%)
 */
export function calculateBrightness(canvas, ctx) {
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  let totalLuminance = 0
  const sampleStep = 4 // sample every 4th pixel for speed

  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // Standard relative luminance formula
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    totalLuminance += luminance
  }

  const avgLuminance = totalLuminance / (data.length / (4 * sampleStep))
  const brightnessScore = Math.min(100, Math.round((avgLuminance / 255) * 100))

  let status = 'optimal'
  let message = 'Optimal Lighting'
  if (brightnessScore < 30) {
    status = 'too_dark'
    message = 'Lighting is too low'
  } else if (brightnessScore > 92) {
    status = 'too_bright'
    message = 'Lighting is too bright'
  }

  return { score: brightnessScore, status, message }
}

/**
 * Calculate image blur score using Laplacian Variance on grayscale pixels
 */
export function calculateBlurScore(canvas, ctx) {
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // Convert to grayscale grid
  const gray = new Float32Array(width * height)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    gray[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b
  }

  // Apply 3x3 Laplacian Kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
  let mean = 0
  const laplacianValues = []
  const step = 2

  for (let y = 1; y < height - 1; y += step) {
    for (let x = 1; x < width - 1; x += step) {
      const idx = y * width + x
      const lap =
        gray[idx - width] +
        gray[idx - 1] -
        4 * gray[idx] +
        gray[idx + 1] +
        gray[idx + width]
      laplacianValues.push(lap)
      mean += lap
    }
  }

  mean /= laplacianValues.length

  let variance = 0
  for (let i = 0; i < laplacianValues.length; i++) {
    const diff = laplacianValues[i] - mean
    variance += diff * diff
  }
  variance /= laplacianValues.length

  // Map variance to 0-100 score
  const blurScore = Math.min(100, Math.round((variance / 300) * 100))
  const isSharp = variance > 20

  return {
    score: Math.max(15, blurScore),
    variance,
    isSharp,
    message: isSharp ? 'Image is sharp & focused' : 'Image is blurry. Please hold steady.',
  }
}

/**
 * Comprehensive Image Quality & Skin/Face Target Validator
 */
export async function validateImageQuality(element) {
  const faces = await detectFaces(element)
  const canvas = document.createElement('canvas')
  const width = element.videoWidth || element.naturalWidth || element.width || 640
  const height = element.videoHeight || element.naturalHeight || element.height || 480
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (ctx) {
    ctx.drawImage(element, 0, 0, width, height)
  }

  const brightness = ctx ? calculateBrightness(canvas, ctx) : { score: 75, message: 'Optimal' }
  const blur = ctx ? calculateBlurScore(canvas, ctx) : { score: 80, isSharp: true, message: 'Focused' }

  let skinPixelCount = 0
  let greenPixelCount = 0
  let bluePixelCount = 0
  let totalSampled = 0
  const step = 4

  if (ctx) {
    const imgData = ctx.getImageData(0, 0, width, height)
    const data = imgData.data
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        totalSampled++
        const i = (y * width + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        if (g > r + 10 && g > b + 10) greenPixelCount++
        if (b > r + 15 && b > g + 10) bluePixelCount++

        const yVal = 0.299 * r + 0.587 * g + 0.114 * b
        const cbVal = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
        const crVal = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b

        if (yVal >= 20 && yVal <= 245 && cbVal >= 77 && cbVal <= 128 && crVal >= 133 && crVal <= 173) {
          skinPixelCount++
        }
      }
    }
  }

  const skinRatio = totalSampled > 0 ? skinPixelCount / totalSampled : 0
  const greenRatio = totalSampled > 0 ? greenPixelCount / totalSampled : 0
  const blueRatio = totalSampled > 0 ? bluePixelCount / totalSampled : 0

  const faceDetected = faces.length > 0
  const hasSkin = skinRatio >= 0.12 && greenRatio <= 0.22 && blueRatio <= 0.22
  const isLandscape = greenRatio > 0.22 || blueRatio > 0.22
  const isUnrelatedObject = !faceDetected && skinRatio < 0.12

  const skinOrFaceValid = faceDetected || hasSkin
  const isValid = brightness.score >= 20 && brightness.score <= 98 && blur.isSharp && skinOrFaceValid && !isLandscape

  const errors = []
  if (brightness.score < 20) errors.push('Lighting is too dark for accurate diagnosis.')
  if (brightness.score > 98) errors.push('Lighting is overexposed.')
  if (!blur.isSharp) errors.push('Image is blurry. Please hold steady.')
  if (!skinOrFaceValid || isLandscape || isUnrelatedObject) {
    errors.push("This doesn't appear to be a clear skin/face image. Please upload a clear photo of the affected skin area.")
  }

  const qualityScore = Math.min(100, Math.round(blur.score * 0.5 + brightness.score * 0.5))

  return {
    isValid,
    brightnessScore: brightness.score,
    brightnessMessage: brightness.message,
    blurScore: blur.score,
    isSharp: blur.isSharp,
    blurMessage: blur.message,
    faceDetected,
    hasSkin,
    skinRatio: Math.round(skinRatio * 100),
    qualityScore,
    faceCount: faces.length,
    primaryFace: faces.length > 0 ? faces[0] : null,
    errors,
  }
}

/**
 * Crop face from Image or Canvas with generous padding (for full face & skin context)
 */
export async function cropFaceFromElement(element, faceBox) {
  const srcWidth = element.videoWidth || element.naturalWidth || element.width || 640
  const srcHeight = element.videoHeight || element.naturalHeight || element.height || 480

  const targetDim = 512
  const canvas = document.createElement('canvas')
  canvas.width = targetDim
  canvas.height = targetDim

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  let cropX
  let cropY
  let cropWidth
  let cropHeight

  if (faceBox && faceBox.width > 0 && faceBox.height > 0) {
    const paddingX = faceBox.width * 0.35
    const paddingY = faceBox.height * 0.35

    cropX = Math.max(0, faceBox.x - paddingX)
    cropY = Math.max(0, faceBox.y - paddingY)
    cropWidth = Math.min(srcWidth - cropX, faceBox.width + paddingX * 2)
    cropHeight = Math.min(srcHeight - cropY, faceBox.height + paddingY * 2)

    const maxDim = Math.max(cropWidth, cropHeight)
    const centerX = cropX + cropWidth / 2
    const centerY = cropY + cropHeight / 2

    cropX = Math.max(0, Math.min(srcWidth - maxDim, centerX - maxDim / 2))
    cropY = Math.max(0, Math.min(srcHeight - maxDim, centerY - maxDim / 2))
    cropWidth = Math.min(srcWidth - cropX, maxDim)
    cropHeight = Math.min(srcHeight - cropY, maxDim)
  } else {
    const minSide = Math.min(srcWidth, srcHeight)
    cropX = (srcWidth - minSide) / 2
    cropY = (srcHeight - minSide) / 2
    cropWidth = minSide
    cropHeight = minSide
  }

  ctx.drawImage(element, cropX, cropY, cropWidth, cropHeight, 0, 0, targetDim, targetDim)
  const previewUrl = canvas.toDataURL('image/jpeg', 0.92)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
  const file = new File([blob], `cropped_face_${Date.now()}.jpg`, { type: 'image/jpeg' })

  return {
    file,
    previewUrl,
    width: targetDim,
    height: targetDim,
  }
}
