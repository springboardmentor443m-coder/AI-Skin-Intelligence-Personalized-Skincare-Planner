/**
 * Weighted Skin Health Scoring Engine
 * 
 * Weights:
 * - Skin Condition Severity & Prediction: 30%
 * - Lifestyle & Stress: 15%
 * - Sleep Duration: 15%
 * - Hydration / Water Intake: 15%
 * - Routine Completion Rate: 15%
 * - Weekly / Monthly Progress: 10%
 */

export function calculateSkinHealthScore({
  condition = 'Normal',
  sleepHours = 7.5,
  waterIntake = 2.5,
  lifestyle = 'Moderate',
  routineCompletionRate = 85, // 0 - 100%
  progressTrend = 'Improving',
}) {
  // 1. Condition Score (30%)
  let conditionScore = 90
  const condLower = (condition || '').toLowerCase()
  if (condLower.includes('normal') || condLower.includes('healthy')) {
    conditionScore = 98
  } else if (condLower.includes('acne') || condLower.includes('rosacea')) {
    conditionScore = 68
  } else if (condLower.includes('eczema') || condLower.includes('dermatitis')) {
    conditionScore = 62
  } else if (condLower.includes('keratosis') || condLower.includes('pigmentation')) {
    conditionScore = 75
  } else if (condLower.includes('melanoma') || condLower.includes('basal') || condLower.includes('carcinoma')) {
    conditionScore = 40
  }

  // 2. Lifestyle Score (15%)
  let lifestyleScore = 80
  const lifeLower = (lifestyle || '').toLowerCase()
  if (lifeLower.includes('active') || lifeLower.includes('healthy')) {
    lifestyleScore = 95
  } else if (lifeLower.includes('moderate')) {
    lifestyleScore = 82
  } else if (lifeLower.includes('sedentary') || lifeLower.includes('high stress')) {
    lifestyleScore = 60
  }

  // 3. Sleep Score (15%)
  let sleepScore
  const sleepNum = Number(sleepHours) || 7.5
  if (sleepNum >= 7 && sleepNum <= 9) {
    sleepScore = 100
  } else if (sleepNum >= 6 && sleepNum < 7) {
    sleepScore = 80
  } else if (sleepNum > 9) {
    sleepScore = 85
  } else {
    sleepScore = 55
  }

  // 4. Hydration Score (15%)
  let hydrationScore
  const waterNum = Number(waterIntake) || 2.5
  if (waterNum >= 2.5) {
    hydrationScore = 100
  } else if (waterNum >= 2.0) {
    hydrationScore = 85
  } else if (waterNum >= 1.5) {
    hydrationScore = 70
  } else {
    hydrationScore = 50
  }

  // 5. Routine Completion Score (15%)
  const routineScore = Math.max(0, Math.min(100, Number(routineCompletionRate) || 85))

  // 6. Progress Trend Score (10%)
  let progressScore = 85
  const trendLower = (progressTrend || '').toLowerCase()
  if (trendLower.includes('improv') || trendLower.includes('good')) {
    progressScore = 95
  } else if (trendLower.includes('stable') || trendLower.includes('consistent')) {
    progressScore = 85
  } else if (trendLower.includes('declin') || trendLower.includes('flare')) {
    progressScore = 65
  }

  // Weighted total score
  const totalScore = Math.round(
    conditionScore * 0.30 +
    lifestyleScore * 0.15 +
    sleepScore * 0.15 +
    hydrationScore * 0.15 +
    routineScore * 0.15 +
    progressScore * 0.10
  )

  const finalScore = Math.max(15, Math.min(100, totalScore))

  let statusTier
  let color
  if (finalScore >= 85) {
    statusTier = 'Optimal Skin Health'
    color = 'emerald'
  } else if (finalScore >= 70) {
    statusTier = 'Good Skin Balance'
    color = 'teal'
  } else if (finalScore >= 55) {
    statusTier = 'Moderate Sensitivity'
    color = 'amber'
  } else {
    statusTier = 'Needs Clinical Care'
    color = 'rose'
  }

  return {
    score: finalScore,
    statusTier,
    color,
    breakdown: {
      conditionScore,
      lifestyleScore,
      sleepScore,
      hydrationScore,
      routineScore,
      progressScore,
    }
  }
}
