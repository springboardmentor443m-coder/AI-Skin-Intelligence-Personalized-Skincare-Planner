import { conditionLabel } from "./constants";

export type PlanProfile = {
  skinType?: string | null;
  concerns?: string[];
  sensitivities?: string[];
  budget?: string | null;
  goals?: string[];
};

export type GeneratedDay = {
  dayNumber: number;
  title: string;
  focus: string;
  morningSteps: string[];
  eveningSteps: string[];
  notes: string;
  tasks: { label: string; category: string }[];
};

export type GeneratedPlan = {
  rationale: string;
  days: GeneratedDay[];
};

const ACTIVE_BY_CONDITION: Record<string, { active: string; note: string }> = {
  acne: { active: "2% salicylic acid (BHA)", note: "Introduce actives slowly to limit purging." },
  eczema: { active: "Ceramide + colloidal oatmeal balm", note: "Prioritise barrier repair over exfoliation." },
  dark_spots: { active: "10% vitamin C or 4% niacinamide", note: "Daily SPF is non-negotiable for pigment." },
  rosacea: { active: "Azelaic acid 10%", note: "Avoid heat, alcohol-heavy toners and physical scrubs." },
  wrinkles: { active: "Encapsulated retinal 0.05%", note: "Buffer retinoids with moisturiser if stinging." },
  normal_skin: { active: "Antioxidant serum", note: "Maintenance focus: protect and hydrate." },
};

const FOCUS_CYCLE = [
  "Reset & barrier prep",
  "Gentle cleansing rhythm",
  "First active introduction",
  "Hydration layering",
  "Targeted treatment",
  "Recovery & soothing",
  "Review & consolidate",
];

export function generatePlan(condition: string, profile: PlanProfile): GeneratedPlan {
  const cfg = ACTIVE_BY_CONDITION[condition] ?? ACTIVE_BY_CONDITION["normal_skin"]!;
  const sensitive =
    (profile.sensitivities?.length ?? 0) > 0 || profile.skinType === "Sensitive" || condition === "rosacea";
  const oily = profile.skinType === "Oily" || profile.skinType === "Combination";

  const cleanser = oily ? "Gel cleanser (pH 5.5)" : "Cream cleanser";
  const moisturiser = oily ? "Oil-free gel moisturiser" : "Ceramide cream";
  const spf = "Broad-spectrum SPF 50 (2 finger lengths)";

  const days: GeneratedDay[] = Array.from({ length: 7 }, (_, i) => {
    const day = i + 1;
    const activeDay = sensitive ? [3, 5, 7].includes(day) : day >= 3;
    const morningSteps = [
      `Rinse or ${cleanser.toLowerCase()}`,
      day % 2 === 0 ? "Hydrating toner / essence" : "Niacinamide 5% serum",
      moisturiser,
      spf,
    ];
    const eveningSteps = [
      "Micellar or oil pre-cleanse",
      cleanser,
      activeDay ? cfg.active : "Soothing hydrating serum",
      moisturiser,
      day === 6 ? "Overnight barrier mask" : "Lip & eye care",
    ];

    return {
      dayNumber: day,
      title: `Day ${day} — ${FOCUS_CYCLE[i]}`,
      focus: FOCUS_CYCLE[i]!,
      morningSteps,
      eveningSteps,
      notes:
        day === 1
          ? cfg.note
          : activeDay
            ? "Patch test first if this active is new to you."
            : "Rest day for actives — hydration and SPF only.",
      tasks: [
        { label: "Morning routine complete", category: "morning" },
        { label: "Evening routine complete", category: "evening" },
        { label: "SPF reapplied at midday", category: "protection" },
        { label: "Drank 2.5L+ of water", category: "lifestyle" },
        { label: "7+ hours of sleep", category: "lifestyle" },
      ],
    };
  });

  const rationale = `Built for ${conditionLabel(condition)}${
    profile.skinType ? ` on ${profile.skinType.toLowerCase()} skin` : ""
  }. Core active: ${cfg.active}. ${
    sensitive ? "Actives are spaced every other day because of reported sensitivity." : "Actives ramp up from day 3."
  } Goals tracked: ${profile.goals?.length ? profile.goals.join(", ") : "overall skin health"}.`;

  return { rationale, days };
}
