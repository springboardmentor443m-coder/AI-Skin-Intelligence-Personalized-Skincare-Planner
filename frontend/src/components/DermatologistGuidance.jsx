/**
 * components/DermatologistGuidance.jsx — Dermatologist Consultation Guidance
 * ============================================================================
 * Renders the "When to Consult a Dermatologist" section with:
 *   - Urgency-appropriate header colour (routine / soon / urgent)
 *   - Warning signs list
 *   - General monitoring advice
 *   - Clear "this is not a diagnosis" messaging
 *
 * Props:
 *   guidance: {
 *     urgency:         "routine" | "soon" | "urgent"
 *     urgency_message: string
 *     warning_signs:   string[]
 *     general_advice:  string
 *   }
 */

import { ShieldAlert, ShieldCheck, AlertTriangle, Activity } from "lucide-react";

// ── Urgency display config ────────────────────────────────────────────────────
const URGENCY_CONFIG = {
  urgent: {
    Icon:       ShieldAlert,
    headerBg:   "bg-red-600",
    headerText: "text-white",
    badgeBg:    "bg-red-100",
    badgeText:  "text-red-700",
    borderCol:  "border-red-200",
    cardBg:     "bg-red-50",
    dotCol:     "bg-red-400",
    label:      "Seek Medical Attention Promptly",
  },
  soon: {
    Icon:       AlertTriangle,
    headerBg:   "bg-amber-500",
    headerText: "text-white",
    badgeBg:    "bg-amber-100",
    badgeText:  "text-amber-700",
    borderCol:  "border-amber-200",
    cardBg:     "bg-amber-50",
    dotCol:     "bg-amber-400",
    label:      "Consult a Dermatologist Soon",
  },
  routine: {
    Icon:       ShieldCheck,
    headerBg:   "bg-emerald-600",
    headerText: "text-white",
    badgeBg:    "bg-emerald-100",
    badgeText:  "text-emerald-700",
    borderCol:  "border-emerald-200",
    cardBg:     "bg-emerald-50",
    dotCol:     "bg-emerald-400",
    label:      "Schedule a Routine Skin Check",
  },
};

const DEFAULT_CONFIG = URGENCY_CONFIG.routine;


function DermatologistGuidance({ guidance }) {
  if (!guidance) return null;

  const config   = URGENCY_CONFIG[guidance.urgency] ?? DEFAULT_CONFIG;
  const { Icon } = config;

  return (
    <div className={`rounded-2xl border ${config.borderCol} overflow-hidden`}>

      {/* ── Coloured header ────────────────────────────────────────────────── */}
      <div className={`${config.headerBg} px-6 py-4 flex items-center gap-3`}>
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Icon size={19} className={config.headerText} />
        </div>
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-widest ${config.headerText} opacity-80`}>
            When to Consult a Dermatologist
          </p>
          <p className={`font-bold text-sm ${config.headerText}`}>
            {config.label}
          </p>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className={`${config.cardBg} p-5 flex flex-col gap-5`}>

        {/* Urgency message */}
        <p className="text-sm text-gray-700 leading-relaxed">
          {guidance.urgency_message}
        </p>

        {/* Warning signs */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-gray-500" />
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Warning signs to watch for
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {guidance.warning_signs.map((sign, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${config.dotCol} shrink-0 mt-1.5`}
                />
                <p className="text-xs text-gray-600 leading-relaxed">{sign}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* General advice */}
        <div className="bg-white/70 rounded-xl p-4 border border-white">
          <p className="text-xs text-gray-600 leading-relaxed">
            {guidance.general_advice}
          </p>
        </div>

        {/* Always-visible disclaimer */}
        <div className="flex items-start gap-2.5 bg-white/50 rounded-xl p-3 border border-gray-200">
          <AlertTriangle size={14} className="text-gray-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-500 leading-relaxed">
            <strong>This AI result is for educational purposes only</strong> and is NOT a confirmed
            clinical diagnosis. Only a qualified dermatologist or healthcare professional
            can examine, diagnose, and recommend treatment for skin conditions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DermatologistGuidance;
