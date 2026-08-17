/**
 * pages/SkinAssessment.jsx — AI Skin Lesion Analysis
 * =====================================================
 * Phase 8: ML Inference UI
 *
 * What this page does:
 *   1. Lets the user pick or drag-and-drop a skin lesion image
 *   2. Shows a preview of the selected image
 *   3. Sends the image to POST /api/predict (JWT-authenticated)
 *   4. Displays:
 *        - Top predicted class and confidence
 *        - Full probability bar chart for all 7 classes
 *        - A prominent medical disclaimer
 *        - Friendly error messages
 *
 * ⚠️ MEDICAL DISCLAIMER:
 *   This tool is for EDUCATIONAL and RESEARCH purposes only.
 *   It is NOT a medical diagnostic tool. Always consult a
 *   qualified dermatologist for clinical decisions.
 */

import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, LogOut, ArrowLeft, Upload, X, Loader2,
  AlertTriangle, CheckCircle, Info, ChevronRight, History,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { predictSkin } from "../services/api";
import ChatBot from "../components/ChatBot";

// ── HAM10000 class metadata (mirrors ml/src/config.py) ───────────────────────
const CLASS_META = {
  akiec: {
    label: "Actinic Keratoses / Intraepithelial Carcinoma",
    color: "#f59e0b", risk: "High",
    description: "Rough, scaly patches from long-term sun exposure. Can progress to invasive cancer if untreated. Professional evaluation is important.",
  },
  bcc: {
    label: "Basal Cell Carcinoma",
    color: "#ef4444", risk: "High",
    description: "The most common form of skin cancer. Grows slowly and is highly treatable when caught early. Consult a dermatologist promptly.",
  },
  bkl: {
    label: "Benign Keratosis",
    color: "#10b981", risk: "Low",
    description: "Non-cancerous growths including seborrheic keratoses. Common with age. Generally harmless but worth monitoring.",
  },
  df: {
    label: "Dermatofibroma",
    color: "#3b82f6", risk: "Low",
    description: "A common benign skin growth, usually firm and small. Typically harmless — avoid scratching or traumatising the area.",
  },
  mel: {
    label: "Melanoma",
    color: "#dc2626", risk: "High",
    description: "A serious form of skin cancer. Early detection is critical. Please consult a qualified dermatologist as soon as possible for proper evaluation.",
  },
  nv: {
    label: "Melanocytic Nevus",
    color: "#6366f1", risk: "Low",
    description: "Common moles. Most are benign. Monitor regularly using the ABCDE rule — any changes should be evaluated by a dermatologist.",
  },
  vasc: {
    label: "Vascular Lesions",
    color: "#8b5cf6", risk: "Low",
    description: "Benign blood-vessel related marks such as angiomas. Most are harmless. A dermatologist can assess if any action is needed.",
  },
};

// Risk level display helpers
const RISK_STYLES = {
  High:   { card: "bg-red-50 border-red-200",     icon: "text-red-500",     badge: "bg-red-100 text-red-700",     bar: "bg-red-500"     },
  Medium: { card: "bg-amber-50 border-amber-200", icon: "text-amber-500",   badge: "bg-amber-100 text-amber-700", bar: "bg-amber-500"   },
  Low:    { card: "bg-emerald-50 border-emerald-200", icon: "text-emerald-500", badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500" },
};

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];

// ── Helper: extract a readable error message from API error objects ───────────
function getErrorMessage(err) {
  if (!err) return "An unknown error occurred.";
  if (typeof err.detail === "string") return err.detail;
  if (Array.isArray(err.detail)) {
    return err.detail.map((e) => e.msg || JSON.stringify(e)).join(" ");
  }
  if (typeof err === "string") return err;
  return "An unexpected error occurred. Please try again.";
}

// ── Main component ─────────────────────────────────────────────────────────────
function SkinAssessment() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile]     = useState(null);   // File object
  const [previewUrl, setPreviewUrl]         = useState(null);   // Object URL for <img>
  const [isDragging, setIsDragging]         = useState(false);  // Drag-over highlight
  const [status, setStatus]                 = useState("idle"); // idle | analyzing | done | error
  const [result, setResult]                 = useState(null);   // API response
  const [errorMsg, setErrorMsg]             = useState("");

  const fileInputRef = useRef(null);

  // ── Logout ─────────────────────────────────────────────────────────────────
  function handleLogout() {
    logout();
    navigate("/login");
  }

  // ── File selection / validation ────────────────────────────────────────────
  function processFile(file) {
    if (!file) return;

    // Client-side type check (the backend also validates)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMsg("Unsupported file type. Please upload a JPEG, PNG, WebP, or BMP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File too large. Maximum allowed size is 10 MB.");
      return;
    }

    // Revoke previous preview URL to avoid memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setErrorMsg("");
    setStatus("idle");
  }

  function handleFileInput(e) {
    processFile(e.target.files?.[0] ?? null);
    // Reset input so the same file can be re-selected after clearing
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0] ?? null);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function clearImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMsg("");
    setStatus("idle");
  }

  // ── Submit to backend ──────────────────────────────────────────────────────
  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || status === "analyzing") return;

    setStatus("analyzing");
    setResult(null);
    setErrorMsg("");

    try {
      const data = await predictSkin(selectedFile, token);
      setResult(data);
      setStatus("done");
      // Note: the backend auto-saves the assessment to PostgreSQL on success.
      // The history page will pick it up via GET /api/assessments.
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setStatus("error");
    }
  }, [selectedFile, token, status]);

  // ── Derived display values ─────────────────────────────────────────────────
  const sortedScores = result
    ? Object.entries(result.all_scores).sort(([, a], [, b]) => b - a)
    : [];

  const topClass   = result ? CLASS_META[result.class] : null;
  const riskLevel  = topClass?.risk ?? "Low";
  const riskStyle  = RISK_STYLES[riskLevel] ?? RISK_STYLES.Low;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navigation bar (matches Dashboard style) ─────────────────────── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles size={22} className="text-blue-600" />
            <span className="text-lg font-bold text-gray-900">AI Skin Intelligence</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-gray-600">{user?.full_name}</span>
            <Link
              to="/history"
              className="hidden md:flex items-center gap-1 text-sm text-gray-600 hover:text-violet-600 transition-colors"
            >
              <History size={15} /> History
            </Link>
            <button
              id="assessment-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600
                         border border-gray-200 hover:border-red-200 hover:bg-red-50
                         px-3 py-2 rounded-lg transition-all"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Back link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Skin Analysis</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Upload a skin lesion image for AI-powered classification using
            EfficientNetB0 trained on HAM10000.
          </p>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Upload panel ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
            <h2 className="font-semibold text-gray-900">Upload Image</h2>

            {!selectedFile ? (
              /* Drop zone */
              <div
                id="drop-zone"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  flex-1 border-2 border-dashed rounded-xl flex flex-col items-center
                  justify-center gap-3 py-12 cursor-pointer transition-all
                  ${isDragging
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}
                `}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Upload size={22} className="text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Click to browse or drag &amp; drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPEG, PNG, WebP, BMP · max 10 MB
                  </p>
                </div>
              </div>
            ) : (
              /* Image preview */
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={previewUrl}
                  alt="Selected skin lesion"
                  className="w-full object-cover max-h-64"
                />
                <button
                  id="clear-image-btn"
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-900/70
                             text-white flex items-center justify-center hover:bg-gray-900
                             transition-colors"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              id="skin-image-input"
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={handleFileInput}
            />

            {/* Select / Change button */}
            {selectedFile && (
              <button
                id="change-image-btn"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:underline self-start"
              >
                Change image
              </button>
            )}

            {/* Analyse button */}
            <button
              id="analyze-btn"
              onClick={handleAnalyze}
              disabled={!selectedFile || status === "analyzing"}
              className={`
                w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl
                text-sm font-semibold transition-all
                ${selectedFile && status !== "analyzing"
                  ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"}
              `}
            >
              {status === "analyzing" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analysing…
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Analyse Image
                </>
              )}
            </button>

            {/* Client-side / network error */}
            {status === "error" && errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{errorMsg}</p>
              </div>
            )}
          </div>

          {/* ── Results panel ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
            <h2 className="font-semibold text-gray-900">Analysis Results</h2>

            {/* Idle state */}
            {status === "idle" && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Info size={22} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  Upload an image and click <strong>Analyse Image</strong> to see results.
                </p>
              </div>
            )}

            {/* Analysing state */}
            {status === "analyzing" && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 size={32} className="text-blue-500 animate-spin" />
                <p className="text-sm text-gray-500 font-medium">Running AI analysis…</p>
                <p className="text-xs text-gray-400">This may take a few seconds.</p>
              </div>
            )}

            {/* Error state (no result shown) */}
            {status === "error" && !result && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={22} className="text-red-500" />
                </div>
                <p className="text-sm text-red-600 font-medium">Analysis failed</p>
                <p className="text-xs text-gray-400 text-center max-w-xs">{errorMsg}</p>
              </div>
            )}

            {/* Results */}
            {status === "done" && result && (
              <div className="flex flex-col gap-5">

                {/* Top prediction badge */}
                <div
                  className={`rounded-xl p-4 flex items-start gap-3 border ${riskStyle.card}`}
                >
                  <CheckCircle
                    size={22}
                    className={`${riskStyle.icon} shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
                      Predicted Condition
                    </p>
                    <p className="font-bold text-gray-900 leading-snug">
                      {result.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      Code: <span className="font-semibold">{result.class}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {/* Confidence percentage */}
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${riskStyle.bar}`}
                          style={{ width: `${(result.confidence * 100).toFixed(1)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-800 w-12 text-right shrink-0">
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    {/* Risk label */}
                    <span
                      className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${riskStyle.badge}`}
                    >
                      {riskLevel} Risk
                    </span>
                    <p className="text-xs text-gray-400 mt-1">AI-generated educational assessment</p>

                    {/* Condition description */}
                    {topClass?.description && (
                      <div className="mt-3 pt-3 border-t border-current border-opacity-20 flex items-start gap-2">
                        <Info size={12} className="shrink-0 mt-0.5 opacity-60" />
                        <p className="text-xs leading-relaxed opacity-80">{topClass.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* All class probability bars with full names */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                    Probability Distribution
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {sortedScores.map(([cls, score], i) => {
                      const meta        = CLASS_META[cls] ?? { label: cls, color: "#6b7280" };
                      const pct         = (score * 100).toFixed(1);
                      const isTop       = i === 0;
                      return (
                        <div key={cls}>
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <span
                              className={`truncate max-w-[160px] ${isTop ? "font-bold text-gray-900" : "text-gray-500"}`}
                              title={meta.label}
                            >
                              {meta.label}
                            </span>
                            <span className={`shrink-0 ml-2 ${isTop ? "font-bold text-gray-800" : "text-gray-400"}`}>
                              {pct}%
                            </span>
                          </div>
                          {/* Bar */}
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: meta.color,
                                opacity: isTop ? 1 : 0.65,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Disclaimer */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    This is an AI-assisted classification and should not be considered a definitive
                    medical diagnosis. Always consult a qualified dermatologist.
                  </p>
                </div>



                {/* Re-analyse button */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <button
                    id="reanalyze-btn"
                    onClick={clearImage}
                    className="flex items-center justify-center gap-1 text-sm text-blue-600
                               hover:underline"
                  >
                    Analyse another image
                    <ChevronRight size={14} />
                  </button>
                  <Link
                    to="/history"
                    className="flex items-center gap-1 text-sm text-violet-600 hover:underline font-medium"
                  >
                    <History size={14} />
                    View in History
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── How it works note ──────────────────────────────────────────── */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            How It Works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-500">
            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 font-bold
                               flex items-center justify-center shrink-0 text-[10px]">1</span>
              <p>Upload a clear, well-lit photo of the skin lesion.</p>
            </div>
            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 font-bold
                               flex items-center justify-center shrink-0 text-[10px]">2</span>
              <p>The image is preprocessed (224×224, ImageNet normalisation) and
                 passed through EfficientNetB0.</p>
            </div>
            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 font-bold
                               flex items-center justify-center shrink-0 text-[10px]">3</span>
              <p>The model outputs probabilities for 7 HAM10000 skin lesion classes.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Floating chatbot */}
      <ChatBot
        analysisContext={result ? {
          condition:     result.label,
          conditionCode: result.class,
          confidence:    result.confidence,
          riskLevel,
        } : null}
      />
    </div>
  );
}

export default SkinAssessment;
