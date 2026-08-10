// Skincare Storage & API Sync Utility

const HISTORY_KEY = 'skin-intelligence-history'
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8000' : 'http://localhost:8000'

export async function fetchAnalysisHistoryFromAPI() {
  const token = localStorage.getItem('skin-intelligence-token')
  try {
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const res = await fetch(`${API_BASE_URL}/predictions/history`, { headers })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.predictions)) {
        const mapped = data.predictions.map((p) => ({
          id: p.id,
          disease: p.disease,
          confidence: p.confidence,
          confidenceValue: parseFloat(p.confidence || '90') / 100,
          date: p.created_at || new Date().toISOString(),
          image: p.image || getFallbackImageForCondition(p.disease),
          recommendation: p.recommendation,
        }))
        localStorage.setItem(HISTORY_KEY, JSON.stringify(mapped))
        return mapped
      }
    }
  } catch {
    console.warn('Backend history fetch fallback to local cache')
  }
  return getAnalysisHistory()
}

export function getAnalysisHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveAnalysisRecord(record) {
  try {
    const current = getAnalysisHistory()
    const newRecord = {
      id: record.id || `scan-${Date.now()}`,
      disease: record.disease || 'Normal',
      confidence: record.confidence || '95.00%',
      confidenceValue: typeof record.confidenceValue === 'number' ? record.confidenceValue : 0.95,
      date: record.date || new Date().toISOString(),
      image: record.image || getFallbackImageForCondition(record.disease),
      recommendation: record.recommendation || null,
    }
    const updated = [newRecord, ...current.filter((item) => item.id !== newRecord.id)]
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    return updated
  } catch (e) {
    console.error('Failed to save record:', e)
    return []
  }
}

export async function deleteAnalysisRecord(id) {
  const token = localStorage.getItem('skin-intelligence-token')
  try {
    if (typeof id === 'number' || !isNaN(Number(id))) {
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      await fetch(`${API_BASE_URL}/predictions/history/${id}`, {
        method: 'DELETE',
        headers,
      })
    }
  } catch (e) {
    console.error('API delete error:', e)
  }

  const current = getAnalysisHistory()
  const updated = current.filter((item) => item.id !== id && String(item.id) !== String(id))
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  return updated
}

export function getLatestAnalysis() {
  const history = getAnalysisHistory()
  return history.length > 0 ? history[0] : null
}

// Calculate Health Score Dynamically
export function calculateHealthScore(history = []) {
  if (!history || history.length === 0) {
    return { score: 90, status: 'Balanced', weeklyChange: '+0%', monthlyChange: '+0%' }
  }

  const baseScores = {
    Normal: 96,
    Acne: 82,
    Psoriasis: 75,
    Eczema: 76,
    Rosacea: 78,
    Ringworm: 74,
    Melanoma: 65,
  }

  const latest = history[0]
  const base = baseScores[latest.disease] || 85
  const confidenceBonus = (latest.confidenceValue || 0.9) * 4

  const totalScore = Math.min(100, Math.max(50, Math.round(base + confidenceBonus)))

  const weeklyChange = history.length > 1 ? '+8%' : '+5%'
  const monthlyChange = history.length > 2 ? '+14%' : '+10%'

  let status = 'Optimal Barrier'
  if (totalScore < 75) status = 'Requires Active Care'
  else if (totalScore < 85) status = 'Improving Barrier'

  return {
    score: totalScore,
    status,
    weeklyChange,
    monthlyChange,
  }
}

// Generate Weekly Plan dynamically from prediction history
export function generateWeeklyPlanFromHistory(history = []) {
  const latest = history.length > 0 ? history[0] : null
  const disease = latest?.disease || 'Normal'
  const rec = latest?.recommendation || {}

  const morningSteps = rec.skincare_routine?.morning || [
    'Gentle Cleanser',
    'Hydrating Serum',
    'Lightweight Moisturizer',
    'Broad-Spectrum SPF 50',
  ]

  const nightSteps = rec.skincare_routine?.night || [
    'Gentle Cleanser',
    'Barrier Repair Serum',
    'Ceramide Night Cream',
  ]

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const focuses = [
    `Pore unclogging & ${disease} targeted care`,
    'Barrier hydration & soothing rest',
    'Gentle active ingredient absorption',
    'Antioxidant protection & hydration',
    'Skin texture maintenance',
    'Deep moisture recovery',
    'Weekly barrier reset',
  ]

  return days.map((day, idx) => ({
    day,
    morning: morningSteps,
    night: nightSteps,
    focus: focuses[idx],
  }))
}

// Generate Dynamic Product Recommendations based on prediction
export function getProductsForCondition(disease = 'Normal') {
  const allProducts = {
    Acne: [
      {
        id: 'acne-1',
        name: '2% Salicylic Acid BHA Serum',
        brand: 'DermoLab Professional',
        category: 'Serums',
        bestFor: 'Acne & clogged pores',
        ingredients: ['2% Salicylic Acid', 'Zinc PCA', 'Tea Tree Extract'],
        price: '$24.99',
        rating: '4.9 ★',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
        description: 'Exfoliates deep inside pores to dissolve sebum and prevent breakouts.',
      },
      {
        id: 'acne-2',
        name: 'Niacinamide 10% + Zinc 1% Gel',
        brand: 'ClariSkin Medical',
        category: 'Serums',
        bestFor: 'Oil control & pore tightening',
        ingredients: ['10% Niacinamide', '1% Zinc PCA'],
        price: '$18.50',
        rating: '4.8 ★',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
        description: 'Reduces skin congestion and balances sebum production.',
      },
      {
        id: 'acne-3',
        name: 'Oil-Free Mattifying SPF 50',
        brand: 'SunShield Medical',
        category: 'Sunscreen',
        bestFor: 'Acne-prone UV defense',
        ingredients: ['Zinc Oxide', 'Niacinamide', 'Silica'],
        price: '$22.00',
        rating: '4.9 ★',
        image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80',
        description: 'Non-comedogenic physical sunscreen with a matte finish.',
      },
    ],
    Normal: [
      {
        id: 'norm-1',
        name: 'Daily Ceramide Hydrating Cream',
        brand: 'Ceramide Clinical',
        category: 'Moisturizers',
        bestFor: 'Normal & balanced skin',
        ingredients: ['Ceramides NP', 'Hyaluronic Acid', 'Glycerin'],
        price: '$26.00',
        rating: '5.0 ★',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
        description: 'Maintains optimal lipid barrier and 24-hour hydration.',
      },
      {
        id: 'norm-2',
        name: 'Vitamin C 15% Glow Serum',
        brand: 'DermoLab Professional',
        category: 'Serums',
        bestFor: 'Antioxidant radiance & even tone',
        ingredients: ['L-Ascorbic Acid', 'Ferulic Acid', 'Vitamin E'],
        price: '$32.00',
        rating: '4.9 ★',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
        description: 'Brightens skin tone and neutralizes environmental free radicals.',
      },
      {
        id: 'norm-3',
        name: 'pH 5.5 Hydrating Gentle Cleanser',
        brand: 'PureCare Bio',
        category: 'Cleansers',
        bestFor: 'Gentle daily cleansing',
        ingredients: ['Glycerin', 'Panthenol', 'Chamomile'],
        price: '$18.00',
        rating: '4.9 ★',
        image: 'https://images.unsplash.com/photo-1512290900673-7002b5217a41?auto=format&fit=crop&w=400&q=80',
        description: 'Soap-free cleanser that protects the skin’s natural mantle.',
      },
    ],
  }

  return allProducts[disease] || allProducts.Acne
}

function getFallbackImageForCondition(disease) {
  const images = {
    Acne: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80',
    Normal: 'https://images.unsplash.com/photo-1512290900673-7002b5217a41?auto=format&fit=crop&w=400&q=80',
    Eczema: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
  }
  return images[disease] || images.Normal
}
