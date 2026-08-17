/** MSC-6 dataset classes (Multi-Class Skin Condition Image Dataset). */
export const MSC6_CLASSES = [
  "acne",
  "eczema",
  "dark_spots",
  "rosacea",
  "wrinkles",
  "normal_skin",
] as const;

export type Msc6Class = (typeof MSC6_CLASSES)[number];

export const CONDITION_LABELS: Record<string, string> = {
  acne: "Acne",
  eczema: "Eczema",
  dark_spots: "Dark Spots",
  rosacea: "Rosacea",
  wrinkles: "Wrinkles",
  normal_skin: "Normal Skin",
};

export function conditionLabel(value?: string | null): string {
  if (!value) return "—";
  return CONDITION_LABELS[value] ?? value;
}

export const SKIN_TYPES = ["Oily", "Dry", "Combination", "Normal", "Sensitive"] as const;

export const SKIN_CONCERNS = [
  "Acne",
  "Dark Spots",
  "Hyperpigmentation",
  "Redness",
  "Dryness",
  "Wrinkles",
  "Fine Lines",
  "Uneven Skin Tone",
] as const;

export const AGE_GROUPS = ["Under 18", "18-24", "25-34", "35-44", "45-54", "55+"] as const;
export const LIFESTYLES = ["Sedentary", "Balanced", "Active", "High stress", "Shift work"] as const;
export const SUN_EXPOSURE = ["Minimal", "Moderate", "High"] as const;
export const ENVIRONMENTS = ["Humid", "Dry", "Urban / polluted", "Cold", "Temperate"] as const;
export const BUDGETS = ["Budget", "Mid", "Premium"] as const;
export const GOALS = [
  "Clearer skin",
  "Even tone",
  "Hydration",
  "Barrier repair",
  "Anti-ageing",
  "Simpler routine",
] as const;

export const PRODUCT_CATEGORIES = [
  "Face Wash",
  "Moisturizer",
  "Sunscreen",
  "Serum",
  "Toner",
  "Treatment",
  "Face Mask",
] as const;

export const FEEDBACK_OPTIONS = [
  "Better",
  "Same",
  "Slightly irritated",
  "Very irritated",
  "Unsure",
] as const;

export const NOTIFICATION_KINDS = [
  { kind: "morning_routine", label: "Morning routine reminder" },
  { kind: "evening_routine", label: "Evening routine reminder" },
  { kind: "hydration", label: "Hydration reminder" },
  { kind: "sleep", label: "Sleep wind-down reminder" },
  { kind: "weekly_assessment", label: "Weekly skin assessment" },
  { kind: "progress_check", label: "Progress check" },
  { kind: "replenishment", label: "Product replenishment" },
] as const;

export const MEDICAL_DISCLAIMER =
  "AI skin assessments are for informational and educational purposes and are not a medical diagnosis.";
