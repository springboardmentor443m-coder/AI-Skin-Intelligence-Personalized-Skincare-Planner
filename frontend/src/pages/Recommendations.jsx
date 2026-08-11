/**
 * pages/Recommendations.jsx — Educational Recommendations
 * =========================================================
 * Phase 10: Recommendations
 *
 * Fetches educational guidance from GET /api/assessments/{id}/recommendations
 * and displays tier-appropriate guidance based on the assessment's risk level.
 *
 * ⚠️ IMPORTANT — EDUCATIONAL USE ONLY:
 *   These recommendations are general educational information.
 *   They are NOT medical advice and must NOT be used for clinical decisions.
 *   Always consult a qualified dermatologist.
 *
 * Route: /recommendations/:id
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Sparkles, LogOut, ArrowLeft, Star, AlertTriangle,
  CheckCircle, Loader2, ShieldAlert, ShieldCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { fetchRecommendations } from "../services/api";

// ── Risk display config ────────────────────────────────────────────────────────
const RISK_CONFIG = {
  High: {
    icon:       ShieldAlert,
    iconColor:  "text-red-500",
    bg:         "bg-red-50 border-red-200",
    badge:      "bg-red-100 text-red-700",
    headerBg:   "from-red-500 to-red-600",
    itemBorder: "border-red-100",
    dotColor:   "bg-red-400",
  },
  Medium: {
    icon:       ShieldAlert,
    iconColor:  "text-amber-500",
    bg:         "bg-amber-50 border-amber-200",
    badge:      "bg-amber-100 text-amber-700",
    headerBg:   "from-amber-500 to-amber-600",
    itemBorder: "border-amber-100",
    dotColor:   "bg-amber-400",
  },
  Low: {
    icon:       ShieldCheck,
    iconColor:  "text-emerald-500",
    bg:         "bg-emerald-50 border-emerald-200",
    badge:      "bg-emerald-100 text-emerald-700",
    headerBg:   "from-emerald-500 to-teal-600",
    itemBorder: "border-emerald-100",
    dotColor:   "bg-emerald-400",
  },
};

// ── Main component ─────────────────────────────────────────────────────────────
function Recommendations() {
  const { user, token, logout } = useAuth();
  const navigate  = useNavigate();
  const { id }    = useParams();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // If accessed without an ID (e.g. /recommendations directly), show helpful message
  const hasId = !!id;

  useEffect(() => {
    if (!hasId) { setLoading(false); return; }
    async function load() {
      try {
        const result = await fetchRecommendations(Number(id), token);
        setData(result);
      } catch (err) {
        const msg = typeof err?.detail === "string"
          ? err.detail
          : "Unable to load recommendations. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token, hasId]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const risk    = data?.risk_level ?? "Low";
  const config  = RISK_CONFIG[risk] ?? RISK_CONFIG.Low;
  const RiskIcon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles size={22} className="text-blue-600" />
            <span className="text-lg font-bold text-gray-900">AI Skin Intelligence</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-gray-600">{user?.full_name}</span>
            <button
              id="recommendations-logout-btn"
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
      <main className="max-w-4xl mx-auto px-6 py-10">

        <Link
          to={id ? `/history/${id}` : "/history"}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={16} /> Back to assessment
        </Link>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center gap-4">
            <Loader2 size={32} className="text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading recommendations…</p>
          </div>
        )}

        {/* No ID — accessed directly at /recommendations */}
        {!loading && !hasId && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mx-auto mb-6">
              <Star size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Educational Recommendations</h1>
            <p className="text-gray-500 mb-1">
              Educational guidance appears here after you complete a skin assessment.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Complete a skin assessment first, then view recommendations from the detail page.
            </p>
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Start Assessment
            </Link>
          </div>
        )}

        {/* Error */}
        {!loading && hasId && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex items-center gap-4">
            <AlertTriangle size={24} className="text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Unable to load recommendations</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && data && (
          <>
            {/* Page header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Educational Recommendations</h1>
              <p className="text-gray-500 text-sm mt-1">
                General educational guidance based on your AI assessment result.
              </p>
            </div>

            {/* IMPORTANT disclaimer — always shown first */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  AI-Generated Educational Guidance Only
                </p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  These recommendations are general educational information.
                  They are <strong>NOT medical advice</strong> and must NOT be used to make
                  clinical decisions. Always consult a qualified dermatologist or healthcare
                  professional for any skin concerns.
                </p>
              </div>
            </div>

            {/* Assessment summary card */}
            <div className={`rounded-2xl border p-5 mb-6 flex items-center gap-4 ${config.bg}`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.headerBg} flex items-center justify-center shrink-0`}>
                <RiskIcon size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Assessment Result</p>
                <p className="font-bold text-gray-900">{data.predicted_label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
                    {data.risk_level} Risk
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{data.predicted_class}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">
                    {(data.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
              </div>
              <Link
                to={`/history/${id}`}
                className="shrink-0 text-xs text-blue-600 hover:underline font-medium"
              >
                View full result
              </Link>
            </div>

            {/* Recommendations list */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-5">
                General Educational Guidance
              </p>
              <div className="flex flex-col gap-4">
                {data.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${config.itemBorder} bg-gray-50`}
                  >
                    <div className={`w-6 h-6 rounded-full ${config.dotColor} flex items-center justify-center shrink-0 mt-0.5`}>
                      <CheckCircle size={12} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-0.5">{rec.title}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer disclaimer */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle size={14} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">{data.disclaimer}</p>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/assessment"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                New Assessment
              </Link>
              <Link
                to="/history"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 transition-colors"
              >
                View History
              </Link>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default Recommendations;