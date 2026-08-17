/**
 * pages/AssessmentDetail.jsx — Single Assessment Detail
 * ========================================================
 * Phase 10+: History Detail (Improved)
 *
 * Shows the full results for a single saved assessment, including:
 *   - Top prediction, confidence, risk level
 *   - Uploaded image display
 *   - All 7 class probability bars (with full condition names)
 *   - Product recommendations
 *   - Daily routine
 *   - Dermatologist guidance
 *   - AI disclaimer
 *
 * ⚠️ Results are AI-generated educational assessments — NOT medical diagnoses.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Sparkles, LogOut, ArrowLeft, CheckCircle, AlertTriangle,
  ShoppingBag, Clock, Loader2, Info, MessageCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { fetchAssessment, getRecommendations } from "../services/api";
import ProductCard from "../components/ProductCard";
import DailyRoutine from "../components/DailyRoutine";
import DermatologistGuidance from "../components/DermatologistGuidance";
import ChatBot from "../components/ChatBot";

// ── HAM10000 class metadata ────────────────────────────────────────────────────
const CLASS_META = {
  akiec: { label: "Actinic Keratoses / Intraepithelial Carcinoma", color: "#f59e0b", risk: "High" },
  bcc:   { label: "Basal Cell Carcinoma",                          color: "#ef4444", risk: "High" },
  bkl:   { label: "Benign Keratosis",                              color: "#10b981", risk: "Low"  },
  df:    { label: "Dermatofibroma",                                color: "#3b82f6", risk: "Low"  },
  mel:   { label: "Melanoma",                                      color: "#dc2626", risk: "High" },
  nv:    { label: "Melanocytic Nevus",                             color: "#6366f1", risk: "Low"  },
  vasc:  { label: "Vascular Lesions",                              color: "#8b5cf6", risk: "Low"  },
};

const CONDITION_DESCRIPTIONS = {
  akiec: "Actinic Keratoses are rough, scaly patches caused by long-term sun exposure. They can progress to invasive skin cancer if untreated.",
  bcc:   "Basal Cell Carcinoma is the most common form of skin cancer. It grows slowly and is highly treatable when caught early.",
  bkl:   "Benign Keratosis includes seborrheic keratoses and similar non-cancerous growths. Generally harmless, but should be monitored.",
  df:    "Dermatofibroma is a common benign skin growth, usually firm and small. It is typically harmless and doesn't require treatment.",
  mel:   "Melanoma is a serious form of skin cancer that develops in the cells that give skin its color. Early detection is critical.",
  nv:    "Melanocytic Nevi (moles) are common benign skin lesions. Most are harmless, but regular monitoring with the ABCDE rule is recommended.",
  vasc:  "Vascular Lesions include angiomas and port-wine stains — benign blood vessel marks. Most are harmless but a dermatologist can advise.",
};

const RISK_STYLES = {
  High:   { card: "bg-red-50 border-red-200",     icon: "text-red-500",     badge: "bg-red-100 text-red-700",     bar: "bg-red-500"     },
  Medium: { card: "bg-amber-50 border-amber-200", icon: "text-amber-500",   badge: "bg-amber-100 text-amber-700", bar: "bg-amber-500"   },
  Low:    { card: "bg-emerald-50 border-emerald-200", icon: "text-emerald-500", badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500" },
};

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Main component ─────────────────────────────────────────────────────────────
function AssessmentDetail() {
  const { user, token, logout } = useAuth();
  const navigate  = useNavigate();
  const { id }    = useParams();

  const [assessment, setAssessment]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [recLoading, setRecLoading]       = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAssessment(Number(id), token);
        setAssessment(data);

        // Non-blocking: fetch recommendations after assessment loads
        setRecLoading(true);
        getRecommendations(
          {
            predicted_class:       data.predicted_class,
            risk_level:            data.risk_level,
            has_previous_analysis: false,
            language:              "en",
          },
          token,
        )
          .then(rec => setRecommendations(rec))
          .catch(() => setRecommendations(null))
          .finally(() => setRecLoading(false));

      } catch (err) {
        const msg = err?.detail === "Assessment not found."
          ? "Assessment not found or you do not have access to it."
          : (typeof err?.detail === "string" ? err.detail : "Unable to load assessment.");
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const riskLevel  = assessment?.risk_level ?? "Low";
  const riskStyle  = RISK_STYLES[riskLevel] ?? RISK_STYLES.Low;

  const sortedScores = assessment
    ? Object.entries(assessment.all_scores).sort(([, a], [, b]) => b - a)
    : [];

  const conditionDescription = assessment
    ? (CONDITION_DESCRIPTIONS[assessment.predicted_class] ?? "")
    : "";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles size={22} className="text-blue-600" />
            <span className="text-lg font-bold text-gray-900">AI Skin Intelligence</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-gray-600">{user?.full_name}</span>
            <button
              id="detail-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 py-10">

        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={16} /> Back to history
        </Link>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center gap-4">
            <Loader2 size={32} className="text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading assessment…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex items-center gap-4">
            <AlertTriangle size={24} className="text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Unable to load assessment</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && assessment && (
          <>
            {/* Page header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Analysis Details</h1>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <Clock size={13} />
                {formatDate(assessment.created_at)}
                <span className="text-gray-300">·</span>
                <span className="font-mono text-xs">#{assessment.id}</span>
              </div>
            </div>

            {/* ── Section 1: AI Analysis Result ──────────────────────────── */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
                AI Analysis Result
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top prediction card */}
                <div className={`rounded-xl border p-5 ${riskStyle.card}`}>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={22} className={`${riskStyle.icon} shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
                        Predicted Condition
                      </p>
                      <p className="font-bold text-gray-900 text-lg leading-tight">
                        {assessment.predicted_label}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        Code: <span className="font-semibold text-gray-600">{assessment.predicted_class}</span>
                      </p>

                      {/* Confidence bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Confidence</span>
                          <span className="font-bold text-gray-800">
                            {(assessment.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="bg-white/60 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full ${riskStyle.bar} transition-all`}
                            style={{ width: `${(assessment.confidence * 100).toFixed(1)}%` }}
                          />
                        </div>
                      </div>

                      {/* Risk badge */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${riskStyle.badge}`}>
                          {riskLevel} Risk
                        </span>
                        <span className="text-xs text-gray-400">AI-generated educational assessment</span>
                      </div>
                    </div>
                  </div>

                  {/* Condition description */}
                  {conditionDescription && (
                    <div className="mt-4 pt-4 border-t border-white/50 flex items-start gap-2">
                      <Info size={13} className="text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 leading-relaxed">{conditionDescription}</p>
                    </div>
                  )}
                </div>

                {/* Probability bars */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">
                    Probability Distribution
                  </p>
                  <div className="flex flex-col gap-3">
                    {sortedScores.map(([cls, score], i) => {
                      const meta  = CLASS_META[cls] ?? { label: cls, color: "#6b7280" };
                      const pct   = (score * 100).toFixed(1);
                      const isTop = i === 0;
                      return (
                        <div key={cls}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                              <span
                                className={`font-semibold truncate ${isTop ? "text-gray-900" : "text-gray-500"}`}
                                title={meta.label}
                              >
                                {meta.label}
                              </span>
                              {isTop && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded-full font-semibold shrink-0">
                                  top
                                </span>
                              )}
                            </div>
                            <span className={`shrink-0 ${isTop ? "font-bold text-gray-900" : "text-gray-400"}`}>
                              {pct}%
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: meta.color,
                                opacity: isTop ? 1 : 0.6,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  <strong>Educational use only.</strong> This AI result is not a confirmed clinical diagnosis.
                  Only a qualified dermatologist can examine, diagnose, and recommend treatment for skin conditions.
                </p>
              </div>
            </section>

            {/* ── Section 2: Product Recommendations ─────────────────────── */}
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={18} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recommended Products</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                  General skin care only · not treatments
                </span>
              </div>

              {recLoading && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 flex items-center gap-3">
                  <Loader2 size={18} className="text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-500">Loading product recommendations…</p>
                </div>
              )}

              {!recLoading && recommendations?.products?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {recommendations.products.map(product => (
                    <ProductCard key={product.id} product={product} riskLevel={riskLevel} />
                  ))}
                </div>
              )}

              {!recLoading && recommendations?.products?.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                  <p className="text-sm text-gray-500">
                    No product suggestions available for this condition.
                    Please consult a dermatologist for personalized skincare advice.
                  </p>
                </div>
              )}

              {!recLoading && !recommendations && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-sm text-amber-700">
                    Product recommendations could not be loaded. Try viewing from the{" "}
                    <Link to={`/recommendations/${id}`} className="underline font-medium">
                      Recommendations page
                    </Link>
                    .
                  </p>
                </div>
              )}
            </section>

            {/* ── Section 3: Daily Routine ───────────────────────────────── */}
            {!recLoading && recommendations?.routine && (
              <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                <DailyRoutine routine={recommendations.routine} />
              </section>
            )}

            {/* ── Section 4: Dermatologist Guidance ─────────────────────── */}
            {!recLoading && recommendations?.dermatologist_guidance && (
              <section className="mb-6">
                <DermatologistGuidance guidance={recommendations.dermatologist_guidance} />
              </section>
            )}

            {/* ── Fallback dermatologist guidance ───────────────────────── */}
            {!recLoading && !recommendations && (
              <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
                <p className="font-semibold text-amber-900 mb-1">When to Consult a Dermatologist</p>
                <p className="text-sm text-amber-800">
                  Consult a qualified dermatologist for any high-risk result, rapid changes,
                  bleeding, pain, persistent itching, or if you are unsure. This AI result is
                  educational context, not a confirmed diagnosis.
                </p>
              </section>
            )}

            {/* ── Action row ─────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                to="/assessment"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                New Analysis
              </Link>
              <Link
                to="/history"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 transition-colors"
              >
                View History
              </Link>
              <Link
                to={`/recommendations/${assessment.id}`}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-violet-700 text-sm font-semibold px-5 py-2.5 rounded-xl border border-violet-200 transition-colors"
              >
                Full Recommendations
              </Link>
            </div>
          </>
        )}
      </main>

      {/* ── Floating chatbot ────────────────────────────────────────────── */}
      <ChatBot
        analysisContext={assessment ? {
          condition:     assessment.predicted_label,
          conditionCode: assessment.predicted_class,
          confidence:    assessment.confidence,
          riskLevel,
          recommendations,
        } : null}
      />
    </div>
  );
}

export default AssessmentDetail;
