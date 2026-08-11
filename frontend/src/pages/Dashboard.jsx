/**
 * pages/Dashboard.jsx — Authenticated User Dashboard
 * ====================================================
 * Phase 9 + 10: Enhanced Dashboard
 *
 * Shows:
 *   - Personalized welcome header
 *   - Real assessment stats fetched from GET /api/assessments
 *   - Prominent "Start Skin Assessment" CTA
 *   - Quick-action cards (Assessment, History, Profile)
 *   - Recent assessments summary (newest 3)
 *   - Proper loading and empty states
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, LogOut, Scan, Clock, ShieldCheck,
  ChevronRight, Activity, User, History,
  AlertTriangle, TrendingUp,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { fetchAssessments } from "../services/api";

// ── Role display labels ───────────────────────────────────────────────────────
const ROLE_LABELS = {
  user:                "Member",
  skincare_consultant: "Skincare Consultant",
  dermatologist:       "Dermatologist",
  administrator:       "Administrator",
};

// ── Risk badge helper ─────────────────────────────────────────────────────────
function RiskBadge({ risk }) {
  const styles = {
    High:   "bg-red-100 text-red-700 border border-red-200",
    Medium: "bg-amber-100 text-amber-700 border border-amber-200",
    Low:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[risk] ?? styles.Low}`}>
      {risk} Risk
    </span>
  );
}

// ── Format date helper ────────────────────────────────────────────────────────
function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Main component ─────────────────────────────────────────────────────────────
function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError]     = useState("");

  // ── Fetch real history on mount ───────────────────────────────────────────
  useEffect(() => {
    async function loadHistory() {
      if (!token) { setLoadingHistory(false); return; }
      try {
        const data = await fetchAssessments(token);
        setAssessments(data.assessments ?? []);
      } catch (err) {
        setHistoryError("Unable to load assessment history.");
      } finally {
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, [token]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const firstName  = user?.full_name?.split(" ")[0] ?? "there";
  const roleLabel  = ROLE_LABELS[user?.role] ?? user?.role ?? "Member";
  const latest     = assessments[0] ?? null;
  const recentThree = assessments.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navigation bar ─────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Sparkles size={22} className="text-blue-600" />
            <span className="text-lg font-bold text-gray-900">AI Skin Intelligence</span>
          </Link>

          {/* Nav links + user info */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600">
              <Link to="/assessment" className="hover:text-blue-600 transition-colors">Assessment</Link>
              <Link to="/history"    className="hover:text-blue-600 transition-colors">History</Link>
              <Link to="/profile"    className="hover:text-blue-600 transition-colors">Profile</Link>
            </nav>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
              <p className="text-xs text-gray-500">{roleLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              id="dashboard-logout-btn"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Use the AI-powered educational skin assessment tool below.
            Results are for research purposes only — not a medical diagnosis.
          </p>
        </div>

        {/* ── Account info card ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-lg truncate">{user?.full_name}</p>
            <p className="text-gray-500 text-sm truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
              {roleLabel}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <Activity size={16} className="text-green-500" />
            Account active
          </div>
        </div>

        {/* ── Stats cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          {/* Total assessments */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total</span>
              <TrendingUp size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loadingHistory ? "—" : assessments.length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Assessments</p>
          </div>

          {/* Latest condition */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Latest</span>
              <Scan size={16} className="text-violet-500" />
            </div>
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {loadingHistory ? "—" : (latest?.predicted_label ?? "None yet")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">
              {latest ? latest.predicted_class : "—"}
            </p>
          </div>

          {/* Latest risk */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Risk</span>
              <ShieldCheck size={16} className="text-teal-500" />
            </div>
            {loadingHistory ? (
              <p className="text-sm font-bold text-gray-400">—</p>
            ) : latest ? (
              <RiskBadge risk={latest.risk_level} />
            ) : (
              <p className="text-xs text-gray-400">No data yet</p>
            )}
          </div>

          {/* Last date */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Last date</span>
              <Clock size={16} className="text-orange-500" />
            </div>
            <p className="text-sm font-bold text-gray-900">
              {loadingHistory ? "—" : (latest ? formatDate(latest.created_at) : "Never")}
            </p>
          </div>
        </div>

        {/* ── Hero CTA — Start Skin Assessment ────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h2 className="text-xl font-bold mb-1">Start a New Skin Assessment</h2>
            <p className="text-blue-100 text-sm leading-relaxed max-w-md">
              Upload a skin lesion image and get an AI-powered educational analysis
              using EfficientNetB0 trained on the HAM10000 dataset.
            </p>
            <p className="text-blue-200 text-xs mt-2">
              ⚠️ Educational use only — not a medical diagnosis.
            </p>
          </div>
          <Link
            to="/assessment"
            id="start-assessment-btn"
            className="shrink-0 flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <Scan size={18} />
            Start Assessment
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* ── Quick-action cards ──────────────────────────────────────────── */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <Link
            to="/assessment"
            className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md p-6 transition-all flex flex-col gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Scan size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Skin Assessment</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Upload a skin lesion image for AI-powered educational analysis.
              </p>
            </div>
            <div className="flex items-center text-blue-600 text-sm font-medium gap-1 group-hover:gap-2 transition-all">
              Get started <ChevronRight size={16} />
            </div>
          </Link>

          <Link
            to="/history"
            className="group bg-white rounded-2xl border border-gray-200 hover:border-violet-300 hover:shadow-md p-6 transition-all flex flex-col gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
              <History size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Assessment History</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Review all your previous skin assessments and educational results.
              </p>
            </div>
            <div className="flex items-center text-violet-600 text-sm font-medium gap-1 group-hover:gap-2 transition-all">
              View history <ChevronRight size={16} />
            </div>
          </Link>

          <Link
            to="/profile"
            className="group bg-white rounded-2xl border border-gray-200 hover:border-teal-300 hover:shadow-md p-6 transition-all flex flex-col gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <User size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">My Profile</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                View your account information and membership details.
              </p>
            </div>
            <div className="flex items-center text-teal-600 text-sm font-medium gap-1 group-hover:gap-2 transition-all">
              View profile <ChevronRight size={16} />
            </div>
          </Link>
        </div>

        {/* ── Recent assessments ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Assessments</h2>
          {assessments.length > 0 && (
            <Link to="/history" className="text-sm text-blue-600 hover:underline font-medium">
              View all
            </Link>
          )}
        </div>

        {/* Loading */}
        {loadingHistory && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400 animate-pulse">Loading history…</p>
          </div>
        )}

        {/* Error */}
        {!loadingHistory && historyError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{historyError}</p>
          </div>
        )}

        {/* Empty state */}
        {!loadingHistory && !historyError && assessments.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <History size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-semibold mb-1">No previous assessments yet</p>
            <p className="text-sm text-gray-500 mb-5">
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

        {/* Recent list */}
        {!loadingHistory && !historyError && recentThree.length > 0 && (
          <div className="flex flex-col gap-3">
            {recentThree.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Date */}
                <div className="shrink-0">
                  <p className="text-xs text-gray-400">{formatDate(a.created_at)}</p>
                </div>

                {/* Condition */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{a.predicted_label}</p>
                  <p className="text-xs text-gray-500 font-mono">
                    {a.predicted_class} · {(a.confidence * 100).toFixed(1)}% confidence
                  </p>
                </div>

                {/* Risk */}
                <RiskBadge risk={a.risk_level} />

                {/* View details */}
                <Link
                  to={`/history/${a.id}`}
                  className="shrink-0 flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium"
                >
                  View details <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default Dashboard;