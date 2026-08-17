/**
 * pages/AssessmentHistory.jsx — Assessment History Page (Improved)
 * =================================================================
 * Shows all of the authenticated user's skin assessments, newest first.
 * Each entry shows: date, condition, confidence bar, risk badge, View Details button.
 *
 * ⚠️ DISCLAIMER: Results shown are AI-generated educational assessments.
 *    They are NOT medical diagnoses.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, LogOut, ArrowLeft, History, Scan,
  ChevronRight, AlertTriangle, Clock, BarChart3,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { fetchAssessments } from "../services/api";
import ChatBot from "../components/ChatBot";

// ── HAM10000 condition colors ──────────────────────────────────────────────────
const CLASS_COLORS = {
  akiec: "#f59e0b",
  bcc:   "#ef4444",
  bkl:   "#10b981",
  df:    "#3b82f6",
  mel:   "#dc2626",
  nv:    "#6366f1",
  vasc:  "#8b5cf6",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function RiskBadge({ risk }) {
  const styles = {
    High:   "bg-red-100 text-red-700 border border-red-200",
    Medium: "bg-amber-100 text-amber-700 border border-amber-200",
    Low:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles[risk] ?? styles.Low}`}>
      {risk} Risk
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function AssessmentHistory() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAssessments(token);
        setAssessments(data.assessments ?? []);
      } catch (err) {
        const msg = typeof err?.detail === "string"
          ? err.detail
          : "Unable to load assessment history. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

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
            <Link to="/dashboard" className="hidden md:inline text-sm font-medium text-gray-600 hover:text-blue-600">
              Dashboard
            </Link>
            <span className="hidden sm:block text-sm text-gray-600">{user?.full_name}</span>
            <button
              id="history-logout-btn"
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
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analysis History</h1>
            <p className="text-gray-500 text-sm mt-1">
              Your previous AI-powered educational skin analyses.
            </p>
          </div>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Scan size={16} /> New Analysis
          </Link>
        </div>

        {/* Stats bar */}
        {!loading && !error && assessments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <BarChart3 size={18} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="font-bold text-gray-900">{assessments.length}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">High Risk</p>
                <p className="font-bold text-gray-900">{assessments.filter(a => a.risk_level === "High").length}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Low Risk</p>
                <p className="font-bold text-gray-900">{assessments.filter(a => a.risk_level !== "High").length}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <Clock size={18} className="text-violet-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Latest</p>
                <p className="font-bold text-gray-900 text-xs">
                  {assessments[0] ? new Date(assessments[0].created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-sm text-gray-400 animate-pulse">Loading your assessments…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && assessments.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-14 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <History size={28} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              No previous assessments yet
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Complete your first skin analysis to see results here.
            </p>
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Scan size={16} /> Start Analysis
            </Link>
          </div>
        )}

        {/* Assessment list */}
        {!loading && !error && assessments.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-400 mb-1">
              {assessments.length} assessment{assessments.length !== 1 ? "s" : ""} · newest first
            </p>

            {assessments.map((a) => {
              const barColor = CLASS_COLORS[a.predicted_class] ?? "#6b7280";
              const confPct  = (a.confidence * 100).toFixed(1);
              return (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-sm p-5 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Date + ID */}
                    <div className="shrink-0 min-w-[140px]">
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
                        <Clock size={11} />
                        {formatDate(a.created_at)}
                      </div>
                      <span className="text-xs text-gray-300 font-mono">#{a.id}</span>
                    </div>

                    {/* Condition + confidence */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{a.predicted_label}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden max-w-[160px]">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${confPct}%`, backgroundColor: barColor }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">{confPct}% confidence</span>
                      </div>
                    </div>

                    {/* Risk + action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <RiskBadge risk={a.risk_level} />
                      <Link
                        to={`/history/${a.id}`}
                        id={`view-detail-${a.id}`}
                        className="inline-flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-1.5 rounded-lg transition-colors"
                      >
                        View Details <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Floating chatbot */}
      <ChatBot />
    </div>
  );
}

export default AssessmentHistory;
