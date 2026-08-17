/**
 * AI Skin Health Score.
 * Weighted blend of assessment, lifestyle, sleep, routine consistency and hydration.
 * This is a wellness-tracking indicator, not a medical score.
 */

export type ScoreInputs = {
  condition?: string | null;
  confidence?: number | null;
  lifestyle?: string | null;
  sleepQuality?: number | null; // 1-10
  routineAdherence?: number | null; // 0-100
  waterIntakeLitres?: number | null;
};

export type ScoreBreakdown = {
  condition: number;
  lifestyle: number;
  sleep: number;
  routine: number;
  hydration: number;
  total: number;
};

const CONDITION_BASE: Record<string, number> = {
  normal_skin: 92,
  wrinkles: 72,
  dark_spots: 68,
  rosacea: 60,
  acne: 58,
  eczema: 54,
};

const LIFESTYLE_BASE: Record<string, number> = {
  Active: 88,
  Balanced: 78,
  Sedentary: 58,
  "Shift work": 52,
  "High stress": 46,
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function computeConditionScore(condition?: string | null, confidence?: number | null) {
  if (!condition) return 60;
  const base = CONDITION_BASE[condition] ?? 65;
  if (confidence == null) return base;
  // A confident non-normal prediction weighs slightly more heavily.
  const c = confidence > 1 ? confidence / 100 : confidence;
  if (condition === "normal_skin") return clamp(base * (0.9 + 0.1 * c));
  return clamp(base - (base * 0.15 * c));
}

export function computeSkinHealthScore(input: ScoreInputs): ScoreBreakdown {
  const condition = computeConditionScore(input.condition, input.confidence);
  const lifestyle = input.lifestyle ? (LIFESTYLE_BASE[input.lifestyle] ?? 65) : 60;
  const sleep = input.sleepQuality != null ? clamp(input.sleepQuality * 10) : 60;
  const routine = input.routineAdherence != null ? clamp(input.routineAdherence) : 50;
  const hydration =
    input.waterIntakeLitres != null ? clamp((input.waterIntakeLitres / 3) * 100) : 55;

  const total = Math.round(
    condition * 0.35 + lifestyle * 0.2 + sleep * 0.15 + routine * 0.2 + hydration * 0.1,
  );

  return {
    condition: Math.round(condition),
    lifestyle: Math.round(lifestyle),
    sleep: Math.round(sleep),
    routine: Math.round(routine),
    hydration: Math.round(hydration),
    total: clamp(total),
  };
}

export function scoreBand(score?: number | null): string {
  if (score == null) return "Not scored";
  if (score < 40) return "Poor";
  if (score < 60) return "Needs Attention";
  if (score < 75) return "Fair";
  if (score < 90) return "Good";
  return "Excellent";
}
