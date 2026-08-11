/**
 * pages/AssessmentHistory.jsx — Assessment History Page
 * =======================================================
 * Phase 10: History
 *
 * Shows all of the authenticated user's skin assessments, newest first.
 * Each entry links to AssessmentDetail for full results + recommendations.
 *
 * ⚠️ DISCLAIMER: Results shown are AI-generated educational assessments.
 *    They are NOT medical diagnoses.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, LogOut, ArrowLeft, History, Scan,
  ChevronRight, AlertTriangle, Clock, ShieldCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { fetchAssessments } from "../services/api";

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
            <h1 className="text-2xl font-bold text-gray-900">Assessment History</h1>
            <p className="text-gray-500 text-sm mt-1">
              Your previous AI-powered educational skin assessments.
            </p>
          </div>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Scan size={16} /> New Assessment
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Educational & Research Use Only.</strong>{" "}
            These AI assessments are NOT medical diagnoses. Always consult a qualified
            dermatologist or healthcare professional for any skin concerns.
          </p>
        </div>

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
              Complete your first skin assessment to see results here.
            </p>
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Scan size={16} /> Start Assessment
            </Link>
          </div>
        )}

        {/* Assessment list */}
        {!loading && !error && assessments.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Count */}
            <p className="text-xs text-gray-400 mb-1">
              {assessments.length} assessment{assessments.length !== 1 ? "s" : ""} · newest first
            </p>

            {assessments.map((a) => (
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

                  {/* Condition */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{a.predicted_label}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {a.predicted_class} · {(a.confidence * 100).toFixed(1)}% confidence
                    </p>
                  </div>

                  {/* Risk */}
                  <div className="flex items-center gap-3 shrink-0">
                    <RiskBadge risk={a.risk_level} />
                    <Link
                      to={`/history/${a.id}`}
                      id={`view-detail-${a.id}`}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium"
                    >
                      View details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default AssessmentHistory;
