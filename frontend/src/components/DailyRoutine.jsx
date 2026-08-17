/**
 * components/DailyRoutine.jsx — Daily Skincare Routine Timeline
 * ===============================================================
 * Renders a structured Morning / Daytime / Night / Daily Habits routine
 * as a clean, card-based timeline layout.
 *
 * Props:
 *   routine: {
 *     morning:      Array<{ step, title, description }>
 *     daytime:      { do: string[], avoid: string[] }
 *     night:        Array<{ step, title, description }>
 *     daily_habits: string[]
 *   }
 */

import { Sun, Moon, Zap, Droplets, CheckCircle, XCircle, ChevronRight } from "lucide-react";

// ── Section config ────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    key:        "morning",
    label:      "Morning Routine",
    emoji:      "🌅",
    Icon:       Sun,
    iconBg:     "bg-amber-100",
    iconColour: "text-amber-600",
    cardBg:     "bg-amber-50",
    borderCol:  "border-amber-200",
    stepBg:     "bg-amber-500",
    connLine:   "bg-amber-200",
  },
  {
    key:        "daytime",
    label:      "During the Day",
    emoji:      "☀️",
    Icon:       Zap,
    iconBg:     "bg-sky-100",
    iconColour: "text-sky-600",
    cardBg:     "bg-sky-50",
    borderCol:  "border-sky-200",
    stepBg:     "bg-sky-500",
    connLine:   "bg-sky-200",
  },
  {
    key:        "night",
    label:      "Night Routine",
    emoji:      "🌙",
    Icon:       Moon,
    iconBg:     "bg-violet-100",
    iconColour: "text-violet-600",
    cardBg:     "bg-violet-50",
    borderCol:  "border-violet-200",
    stepBg:     "bg-violet-500",
    connLine:   "bg-violet-200",
  },
  {
    key:        "daily_habits",
    label:      "Daily Habits",
    emoji:      "💧",
    Icon:       Droplets,
    iconBg:     "bg-emerald-100",
    iconColour: "text-emerald-600",
    cardBg:     "bg-emerald-50",
    borderCol:  "border-emerald-200",
    stepBg:     "bg-emerald-500",
    connLine:   "bg-emerald-200",
  },
];

// ── Step list (morning / night) ────────────────────────────────────────────────
function StepList({ steps, stepBg, connLine }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.step} className="flex gap-4">
            {/* Step indicator + connector line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full ${stepBg} text-white flex items-center
                            justify-center text-[11px] font-bold shrink-0 z-10`}
              >
                {step.step}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 ${connLine} my-1`} />
              )}
            </div>
            {/* Content */}
            <div className={`pb-${isLast ? "0" : "4"} flex-1 min-w-0`}>
              <p className="font-semibold text-gray-900 text-sm mb-0.5">{step.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Daytime dos + avoids ───────────────────────────────────────────────────────
function DaytimeContent({ daytime }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Do's */}
      <div>
        <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-1">
          <CheckCircle size={11} className="text-emerald-500" />
          Do
        </p>
        <ul className="flex flex-col gap-2">
          {daytime.do.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle size={9} className="text-emerald-600" />
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Avoids */}
      <div>
        <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
          <XCircle size={11} className="text-red-500" />
          Avoid
        </p>
        <ul className="flex flex-col gap-2">
          {daytime.avoid.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <XCircle size={9} className="text-red-500" />
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Daily Habits list ──────────────────────────────────────────────────────────
function HabitsList({ habits }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {habits.map((habit, i) => (
        <li key={i} className="flex items-start gap-2">
          <ChevronRight size={13} className="text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">{habit}</p>
        </li>
      ))}
    </ul>
  );
}

// ── Main exported component ────────────────────────────────────────────────────
function DailyRoutine({ routine }) {
  if (!routine) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">
          Personalised
        </p>
        <h3 className="text-lg font-bold text-gray-900">Your Daily Skin-Care Routine</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          General guidance based on your AI assessment result. Adjust to suit your skin's needs.
        </p>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map(({ key, label, emoji, Icon, iconBg, iconColour, cardBg, borderCol, stepBg, connLine }) => {
          const data = routine[key];
          if (!data) return null;

          return (
            <div
              key={key}
              className={`${cardBg} border ${borderCol} rounded-2xl p-5`}
            >
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon size={17} className={iconColour} />
                </div>
                <div>
                  <span className="text-base mr-1">{emoji}</span>
                  <span className="font-bold text-gray-900 text-sm">{label}</span>
                </div>
              </div>

              {/* Content varies by section type */}
              {key === "morning" && (
                <StepList steps={data} stepBg={stepBg} connLine={connLine} />
              )}
              {key === "night" && (
                <StepList steps={data} stepBg={stepBg} connLine={connLine} />
              )}
              {key === "daytime" && <DaytimeContent daytime={data} />}
              {key === "daily_habits" && <HabitsList habits={data} />}
            </div>
          );
        })}
      </div>

      {/* Note */}
      <p className="text-[11px] text-gray-400 leading-relaxed">
        ℹ️ This routine is general skin-care guidance and is not a personalised medical plan.
        If you have a prescription or specific medical advice, follow that above all else.
      </p>
    </div>
  );
}

export default DailyRoutine;
