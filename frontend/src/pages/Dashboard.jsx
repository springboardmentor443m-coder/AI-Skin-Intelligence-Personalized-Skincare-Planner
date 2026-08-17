import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ChevronRight,
  Clock,
  History,
  Loader2,
  LogOut,
  MessageCircle,
  Plus,
  Scan,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  addProduct,
  createSkinHistory,
  deleteMedicalReport,
  deleteProduct,
  fetchAssessments,
  getMedicalReports,
  getProducts,
  getRecommendations,
  getSkinHistory,
  getSkinProfile,
  predictSkin,
  updateSkinProfile,
  uploadMedicalReport,
} from "../services/api";
import ProductCard from "../components/ProductCard";
import DailyRoutine from "../components/DailyRoutine";
import DermatologistGuidance from "../components/DermatologistGuidance";
import ChatBot from "../components/ChatBot";

const ROLE_LABELS = {
  user: "Member",
  skincare_consultant: "Skincare Consultant",
  dermatologist: "Dermatologist",
  administrator: "Administrator",
};

const SKIN_TYPES = [
  { value: "normal", label: "Normal" },
  { value: "dry", label: "Dry" },
  { value: "oily", label: "Oily" },
  { value: "combination", label: "Combination" },
  { value: "sensitive", label: "Sensitive" },
  { value: "not_sure", label: "Not sure" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "te", label: "Telugu" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "mr", label: "Marathi" },
  { value: "bn", label: "Bengali" },
];

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];
const REPORT_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

const CLASS_META = {
  akiec: { risk: "High",  label: "Actinic Keratoses",   color: "#f59e0b" },
  bcc:   { risk: "High",  label: "Basal Cell Carcinoma", color: "#ef4444" },
  bkl:   { risk: "Low",   label: "Benign Keratosis",     color: "#10b981" },
  df:    { risk: "Low",   label: "Dermatofibroma",       color: "#3b82f6" },
  mel:   { risk: "High",  label: "Melanoma",             color: "#dc2626" },
  nv:    { risk: "Low",   label: "Melanocytic Nevus",    color: "#6366f1" },
  vasc:  { risk: "Low",   label: "Vascular Lesions",     color: "#8b5cf6" },
};

function getErrorMessage(err) {
  if (!err) return "An unknown error occurred.";
  if (typeof err.detail === "string") return err.detail;
  if (Array.isArray(err.detail)) return err.detail.map((e) => e.msg || JSON.stringify(e)).join(" ");
  if (typeof err === "string") return err;
  return "An unexpected error occurred. Please try again.";
}

function formatDate(isoString) {
  if (!isoString) return "Never";
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const reportInputRef = useRef(null);

  const [assessments, setAssessments] = useState([]);
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [historyId, setHistoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [profile, setProfile] = useState({
    age: "",
    skin_type: "",
    preferred_language: "en",
  });
  const [hasPreviousAnalysis, setHasPreviousAnalysis] = useState("");
  const [history, setHistory] = useState({
    condition_name: "",
    previous_analysis_date: "",
    previous_symptoms: "",
    previous_treatment: "",
    skin_outcome: "",
    notes: "",
  });
  const [productDraft, setProductDraft] = useState({
    product_name: "",
    category: "",
    brand: "",
    usage_frequency: "",
    notes: "",
  });
  const [reportFile, setReportFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [analysisStatus, setAnalysisStatus]   = useState("idle");
  const [result, setResult]                   = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [recLoading, setRecLoading]           = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      if (!token) return;
      try {
        const [assessmentData, profileData, productData, reportData, historyData] = await Promise.all([
          fetchAssessments(token),
          getSkinProfile(token),
          getProducts(token),
          getMedicalReports(token),
          getSkinHistory(token),
        ]);

        setAssessments(assessmentData.assessments ?? []);
        setProducts(productData.products ?? []);
        setReports(reportData.reports ?? []);
        if (profileData) {
          setProfile({
            age: profileData.age ?? "",
            skin_type: profileData.skin_type ?? "",
            preferred_language: profileData.preferred_language ?? "en",
          });
        }
        if (historyData) {
          setHistoryId(historyData.id);
          setHasPreviousAnalysis("yes");
          setHistory({
            condition_name: historyData.condition_name ?? "",
            previous_analysis_date: historyData.previous_analysis_date ?? "",
            previous_symptoms: historyData.previous_symptoms ?? "",
            previous_treatment: historyData.previous_treatment ?? "",
            skin_outcome: historyData.skin_outcome ?? "",
            notes: historyData.notes ?? "",
          });
        }
      } catch (err) {
        setErrorMsg(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [token]);

  const latest = assessments[0] ?? null;
  const roleLabel = ROLE_LABELS[user?.role] ?? "Member";
  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  const sortedScores = result
    ? Object.entries(result.all_scores).sort(([, a], [, b]) => b - a)
    : [];

  const personalized = useMemo(() => {
    if (!result) return null;
    const risk = CLASS_META[result.class]?.risk ?? "Low";
    const skinTypeLabel = SKIN_TYPES.find((item) => item.value === profile.skin_type)?.label ?? "your skin type";
    const ageText = profile.age ? `At age ${profile.age},` : "Based on your profile,";
    const hasProducts = products.length > 0;

    return {
      risk,
      suggestions: [
        `${ageText} keep your routine gentle and consistent for ${skinTypeLabel.toLowerCase()} skin.`,
        hasProducts
          ? "Review your current products for irritation, especially if symptoms changed after starting one."
          : "Start with a simple cleanser, moisturizer, and daily sunscreen before adding active products.",
        hasPreviousAnalysis === "yes"
          ? "Use your previous history as context, but treat this image as the current assessment."
          : "Save this first analysis so future comparisons have a clear baseline.",
      ],
      precautions: [
        "Do not scratch, pick, bleach, or apply harsh exfoliants to the affected area.",
        "Patch test new skincare products and stop using anything that causes burning, swelling, or worsening redness.",
        risk === "High"
          ? "Because this result is high risk, arrange an in-person dermatologist review promptly."
          : "Monitor the area for changes in size, shape, color, bleeding, itching, or pain.",
      ],
      morning: [
        "Gentle cleanser",
        "Light moisturizer suited to your skin type",
        "Broad-spectrum SPF 30+ sunscreen",
      ],
      evening: [
        "Gentle cleanser",
        "Moisturizer or barrier-supporting cream",
        "Avoid strong actives unless a clinician has advised them",
      ],
    };
  }, [hasPreviousAnalysis, products.length, profile.age, profile.skin_type, result]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function validateBeforeAnalysis() {
    if (!profile.age || Number(profile.age) <= 0) return "Please enter a valid age.";
    if (!profile.skin_type) return "Please select your skin type.";
    if (!hasPreviousAnalysis) return "Please answer whether you have had a skin analysis before.";
    if (hasPreviousAnalysis === "yes") {
      const hasHistoryText = Object.values(history).some((value) => String(value || "").trim());
      if (!hasHistoryText && reports.length === 0 && !reportFile) {
        return "Please add a previous report or enter previous skin history information.";
      }
    }
    if (!imageFile) return "Please upload a current skin image before analysis.";
    return "";
  }

  async function saveContext() {
    await updateSkinProfile(
      {
        age: Number(profile.age),
        skin_type: profile.skin_type,
        preferred_language: profile.preferred_language,
      },
      token,
    );

    if (hasPreviousAnalysis === "yes") {
      const savedHistory = await createSkinHistory(
        {
          condition_name: history.condition_name || null,
          previous_analysis_date: history.previous_analysis_date || null,
          previous_symptoms: history.previous_symptoms || null,
          previous_treatment: history.previous_treatment || null,
          skin_outcome: history.skin_outcome || null,
          notes: history.notes || null,
        },
        token,
      );
      setHistoryId(savedHistory.id);

      if (reportFile) {
        const savedReport = await uploadMedicalReport(reportFile, token);
        setReports((current) => [savedReport, ...current]);
        setReportFile(null);
        if (reportInputRef.current) reportInputRef.current.value = "";
      }
    }
  }

  async function handleAnalyze() {
    const validation = validateBeforeAnalysis();
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    setAnalysisStatus("analyzing");
    setErrorMsg("");
    setStatusMsg("Saving your context and running skin analysis...");
    setResult(null);
    setRecommendations(null);
    setRecLoading(false);

    try {
      await saveContext();
      const data = await predictSkin(imageFile, token);
      setResult(data);
      setAnalysisStatus("done");
      setStatusMsg("Analysis complete. Your context was saved securely.");
      const refreshed = await fetchAssessments(token);
      setAssessments(refreshed.assessments ?? []);

      // Non-blocking: fetch recommendations after prediction.
      // A failure here never breaks the main prediction result.
      const riskLevel = CLASS_META[data.class]?.risk ?? "Low";
      setRecLoading(true);
      getRecommendations(
        {
          predicted_class:       data.class,
          risk_level:            riskLevel,
          skin_type:             profile.skin_type || null,
          has_previous_analysis: hasPreviousAnalysis === "yes",
          language:              profile.preferred_language || "en",
        },
        token,
      )
        .then((rec) => setRecommendations(rec))
        .catch(() => setRecommendations(null))
        .finally(() => setRecLoading(false));

    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setAnalysisStatus("error");
      setStatusMsg("");
    }
  }

  function handleImageSelect(file) {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setErrorMsg("Unsupported image type. Please upload a JPEG, PNG, WebP, or BMP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Skin image must be 10 MB or smaller.");
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setAnalysisStatus("idle");
    setErrorMsg("");
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    setResult(null);
    setAnalysisStatus("idle");
    setRecommendations(null);
    setRecLoading(false);
  }

  function handleReportSelect(file) {
    if (!file) return;
    if (!REPORT_TYPES.includes(file.type)) {
      setErrorMsg("Unsupported report type. Please upload a PDF, JPG, JPEG, or PNG file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Medical report must be 10 MB or smaller.");
      return;
    }
    setReportFile(file);
    setErrorMsg("");
  }

  async function handleAddProduct() {
    if (!productDraft.product_name.trim()) {
      setErrorMsg("Please enter a product name before adding it.");
      return;
    }
    try {
      const saved = await addProduct(
        {
          product_name: productDraft.product_name,
          category: productDraft.category || null,
          brand: productDraft.brand || null,
          usage_frequency: productDraft.usage_frequency || null,
          notes: productDraft.notes || null,
        },
        token,
      );
      setProducts((current) => [saved, ...current]);
      setProductDraft({ product_name: "", category: "", brand: "", usage_frequency: "", notes: "" });
      setErrorMsg("");
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  }

  async function handleDeleteProduct(id) {
    try {
      await deleteProduct(id, token);
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  }

  async function handleDeleteReport(id) {
    try {
      await deleteMedicalReport(id, token);
      setReports((current) => current.filter((report) => report.id !== id));
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles size={22} className="text-blue-600" />
            <span className="text-lg font-bold text-gray-900">AI Skin Intelligence</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/assessment" className="hidden md:inline text-sm font-medium text-gray-600 hover:text-blue-600">
              Skin Analysis
            </Link>
            <Link to="/history" className="hidden md:inline text-sm font-medium text-gray-600 hover:text-blue-600">
              History
            </Link>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
              <p className="text-xs text-gray-500">{roleLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {firstName}</h1>
          <p className="text-gray-500 mt-1">
            Complete your profile context first, then run the current AI Skin Analysis.
          </p>
        </div>

        {/* ── Stats Overview ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total analyses */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? "—" : assessments.length}</p>
              <p className="text-xs text-gray-500">Analyses</p>
            </div>
          </div>

          {/* Latest result */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 md:col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <Scan size={15} className="text-violet-500" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Latest Result</p>
            </div>
            <p className="font-bold text-gray-900">{latest?.predicted_label ?? "No analysis yet"}</p>
            {latest ? (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-semibold text-gray-700">{(latest.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${latest.risk_level === "High" ? "bg-red-500" : "bg-emerald-500"}`}
                    style={{ width: `${(latest.confidence * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Upload an image to begin</p>
            )}
          </div>

          {/* Last date */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Last Analysis</p>
              <p className="font-bold text-gray-900 text-sm">{formatDate(latest?.created_at)}</p>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Link
            to="/assessment"
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl p-4 transition-all active:scale-95"
          >
            <Scan size={20} />
            <div>
              <p className="font-semibold text-sm">New Skin Analysis</p>
              <p className="text-blue-200 text-xs">Upload & analyze an image</p>
            </div>
          </Link>
          <Link
            to="/history"
            className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl p-4 transition-all active:scale-95"
          >
            <History size={20} className="text-violet-500" />
            <div>
              <p className="font-semibold text-sm">View History</p>
              <p className="text-gray-400 text-xs">{assessments.length} previous analyses</p>
            </div>
          </Link>
          <button
            onClick={() => document.getElementById("chatbot-toggle-btn")?.click()}
            className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl p-4 transition-all active:scale-95"
          >
            <MessageCircle size={20} className="text-emerald-500" />
            <div className="text-left">
              <p className="font-semibold text-sm">AI Skin Care Assistant</p>
              <p className="text-gray-400 text-xs">Ask skincare questions</p>
            </div>
          </button>
        </div>

        {(errorMsg || statusMsg) && (
          <div className={`mb-6 border rounded-xl p-4 flex gap-3 ${errorMsg ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
            {errorMsg ? <AlertTriangle size={18} className="text-red-500 shrink-0" /> : <CheckCircle size={18} className="text-emerald-600 shrink-0" />}
            <p className={`text-sm ${errorMsg ? "text-red-700" : "text-emerald-700"}`}>{errorMsg || statusMsg}</p>
          </div>
        )}

        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">About You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Age</span>
              <input
                type="number"
                min="1"
                value={profile.age}
                onChange={(e) => setProfile((current) => ({ ...current, age: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Skin type</span>
              <select
                value={profile.skin_type}
                onChange={(e) => setProfile((current) => ({ ...current, skin_type: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select skin type</option>
                {SKIN_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Language</span>
              <select
                value={profile.preferred_language}
                onChange={(e) => setProfile((current) => ({ ...current, preferred_language: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {LANGUAGES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={18} className="text-violet-600" />
            <h2 className="text-lg font-semibold text-gray-900">Previous Analysis</h2>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-3">Have you had a skin analysis before?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className={`border rounded-xl p-4 cursor-pointer ${hasPreviousAnalysis === "no" ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}>
              <input
                type="radio"
                name="previous-analysis"
                value="no"
                checked={hasPreviousAnalysis === "no"}
                onChange={(e) => setHasPreviousAnalysis(e.target.value)}
                className="mr-2"
              />
              <span className="font-medium text-gray-900">No - This is my first analysis</span>
            </label>
            <label className={`border rounded-xl p-4 cursor-pointer ${hasPreviousAnalysis === "yes" ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}>
              <input
                type="radio"
                name="previous-analysis"
                value="yes"
                checked={hasPreviousAnalysis === "yes"}
                onChange={(e) => setHasPreviousAnalysis(e.target.value)}
                className="mr-2"
              />
              <span className="font-medium text-gray-900">Yes - I have previous analysis/history</span>
            </label>
          </div>
        </section>

        {hasPreviousAnalysis === "yes" && (
          <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <History size={18} className="text-teal-600" />
              <h2 className="text-lg font-semibold text-gray-900">Previous Information</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-3">Previous Medical Report</p>
                <input
                  ref={reportInputRef}
                  type="file"
                  accept={REPORT_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => handleReportSelect(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => reportInputRef.current?.click()}
                  className="inline-flex items-center gap-2 border border-gray-200 hover:border-blue-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700"
                >
                  <Upload size={16} /> Choose report
                </button>
                {reportFile && (
                  <div className="mt-3 flex items-center justify-between gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <span className="text-sm text-blue-800 truncate">{reportFile.name}</span>
                    <button type="button" onClick={() => setReportFile(null)} className="text-blue-700">
                      <X size={16} />
                    </button>
                  </div>
                )}
                {reports.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {reports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between gap-3 text-sm border border-gray-100 rounded-lg px-3 py-2">
                        <span className="truncate">{report.file_name}</span>
                        <button type="button" onClick={() => handleDeleteReport(report.id)} className="text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Previous condition or diagnosis" value={history.condition_name} onChange={(e) => setHistory((current) => ({ ...current, condition_name: e.target.value }))} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" type="date" value={history.previous_analysis_date} onChange={(e) => setHistory((current) => ({ ...current, previous_analysis_date: e.target.value }))} />
                <textarea className="border border-gray-200 rounded-lg px-3 py-2 text-sm" rows="2" placeholder="Previous symptoms" value={history.previous_symptoms} onChange={(e) => setHistory((current) => ({ ...current, previous_symptoms: e.target.value }))} />
                <textarea className="border border-gray-200 rounded-lg px-3 py-2 text-sm" rows="2" placeholder="Previous treatment or advice" value={history.previous_treatment} onChange={(e) => setHistory((current) => ({ ...current, previous_treatment: e.target.value }))} />
                <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm" value={history.skin_outcome} onChange={(e) => setHistory((current) => ({ ...current, skin_outcome: e.target.value }))}>
                  <option value="">Outcome since last analysis</option>
                  <option value="improved">Improved</option>
                  <option value="worse">Worsened</option>
                  <option value="no_change">Stayed the same</option>
                </select>
              </div>
            </div>
            {historyId && <p className="text-xs text-gray-400 mt-3">Previous history saved as record #{historyId}.</p>}
          </section>
        )}

        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={18} className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Current Skincare Products</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm md:col-span-2" placeholder="Product name" value={productDraft.product_name} onChange={(e) => setProductDraft((current) => ({ ...current, product_name: e.target.value }))} />
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Category" value={productDraft.category} onChange={(e) => setProductDraft((current) => ({ ...current, category: e.target.value }))} />
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Brand" value={productDraft.brand} onChange={(e) => setProductDraft((current) => ({ ...current, brand: e.target.value }))} />
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Frequency" value={productDraft.usage_frequency} onChange={(e) => setProductDraft((current) => ({ ...current, usage_frequency: e.target.value }))} />
          </div>
          <button type="button" onClick={handleAddProduct} className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            <Plus size={16} /> Add Product
          </button>
          {products.length === 0 ? (
            <p className="text-sm text-gray-400 mt-4">No products added yet. This is optional for first-time users.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{product.product_name}</p>
                    <p className="text-xs text-gray-500">{[product.brand, product.category, product.usage_frequency].filter(Boolean).join(" · ")}</p>
                  </div>
                  <button type="button" onClick={() => handleDeleteProduct(product.id)} className="text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Scan size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Upload Skin Image</h2>
          </div>
          <input ref={imageInputRef} type="file" accept={IMAGE_TYPES.join(",")} className="hidden" onChange={(e) => handleImageSelect(e.target.files?.[0])} />
          {!imageFile ? (
            <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-xl py-10 flex flex-col items-center gap-3 text-gray-600">
              <Upload size={24} className="text-blue-600" />
              <span className="text-sm font-medium">Upload current skin image</span>
              <span className="text-xs text-gray-400">JPEG, PNG, WebP, BMP · max 10 MB</span>
            </button>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-5">
              <div className="relative border border-gray-200 rounded-xl overflow-hidden">
                <img src={imagePreview} alt="Selected skin" className="w-full h-56 object-cover" />
                <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-gray-900/70 text-white rounded-full w-8 h-8 flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-col justify-center gap-3">
                <p className="font-semibold text-gray-900">{imageFile.name}</p>
                <p className="text-sm text-gray-500">This image will be analyzed as your current assessment. Previous history is used only as context for suggestions.</p>
                <button type="button" onClick={() => imageInputRef.current?.click()} className="self-start text-sm text-blue-600 hover:underline">
                  Change image
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="flex justify-end mb-8">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analysisStatus === "analyzing"}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl"
          >
            {analysisStatus === "analyzing" ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {hasPreviousAnalysis === "yes" ? "Continue to Skin Analysis" : "Run First Skin Analysis"}
            <ChevronRight size={16} />
          </button>
        </div>

        {result && personalized && (
          <section className="bg-white border border-gray-200 rounded-xl p-6 mb-8">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle size={20} className="text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Analysis Result</h2>
            </div>



            {/* ── Row 1: AI result + suggestions/precautions ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* AI result card + probability bars */}
              <div className="border border-gray-200 rounded-xl p-5">

                {/* Uploaded image thumbnail */}
                {imagePreview && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Analyzed skin image"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}

                <p className="text-xs font-semibold uppercase text-gray-400 mb-1">AI Analysis Result</p>
                <p className="text-xl font-bold text-gray-900">{result.label}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-sm text-gray-500">
                    Confidence: <strong>{(result.confidence * 100).toFixed(1)}%</strong>
                  </p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    personalized.risk === "High"
                      ? "bg-red-100 text-red-700"
                      : personalized.risk === "Medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}>{personalized.risk} Risk</span>
                </div>

                {/* AI disclaimer */}
                <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    This is an AI-assisted skin-condition classification and should not be considered a
                    definitive medical diagnosis.
                  </p>
                </div>

                {/* Probability distribution */}
                <p className="text-xs font-semibold uppercase text-gray-400 mt-4 mb-2">Probability Distribution</p>
                <div className="space-y-2">
                  {sortedScores.map(([cls, score], i) => {
                    const meta = CLASS_META[cls] ?? { label: cls, color: "#6b7280" };
                    const pct = (score * 100).toFixed(1);
                    const isTop = i === 0;
                    return (
                      <div key={cls} className="flex items-center gap-2 text-xs">
                        <span
                          className={`w-32 truncate ${isTop ? "font-semibold" : "text-gray-500"}`}
                          title={meta.label}
                        >
                          {meta.label}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: meta.color, opacity: isTop ? 1 : 0.65 }}
                          />
                        </div>
                        <span className={`w-10 text-right shrink-0 ${isTop ? "font-bold text-gray-800" : "text-gray-400"}`}>
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suggestions + Precautions */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="font-semibold text-blue-900 mb-2">Personalised Suggestions</p>
                  <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                    {personalized.suggestions.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="font-semibold text-red-900 mb-2">Precautions</p>
                  <ul className="list-disc pl-5 text-sm text-red-800 space-y-1">
                    {personalized.precautions.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* ── High-risk safety note ───────────────────────────────────── */}
            {recommendations?.safety_note && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed font-medium">
                  {recommendations.safety_note}
                </p>
              </div>
            )}

            {/* ── Product Recommendations ─────────────────────────────────── */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <ShoppingBag size={18} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">Recommended Products</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                  General skin care only · not treatments
                </span>
              </div>

              {/* Loading state */}
              {recLoading && (
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <Loader2 size={18} className="text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-500">Loading product suggestions…</p>
                </div>
              )}

              {/* Products grid */}
              {!recLoading && recommendations && recommendations.products?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {recommendations.products.map((product) => (
                    <ProductCard key={product.id} product={product} riskLevel={personalized.risk} />
                  ))}
                </div>
              )}

              {/* No products for this condition */}
              {!recLoading && recommendations && recommendations.products?.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                  <p className="text-sm text-gray-500">
                    No product suggestions are available for this condition. Please consult a
                    dermatologist for personalised skin-care advice.
                  </p>
                </div>
              )}

              {/* Fallback: recommendations failed — show simple routine cards */}
              {!recLoading && !recommendations && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="font-semibold text-blue-900 mb-2">Morning Routine</p>
                    <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                      {personalized.morning.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                    <p className="font-semibold text-violet-900 mb-2">Evening Routine</p>
                    <ul className="list-disc pl-5 text-sm text-violet-800 space-y-1">
                      {personalized.evening.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              )}


            </div>

            {/* ── Daily Routine ───────────────────────────────────────────── */}
            {!recLoading && recommendations?.routine && (
              <div className="mb-8">
                <DailyRoutine routine={recommendations.routine} />
              </div>
            )}

            {/* ── Dermatologist Guidance ──────────────────────────────────── */}
            <div className="mb-6">
              {!recLoading && recommendations?.dermatologist_guidance ? (
                <DermatologistGuidance guidance={recommendations.dermatologist_guidance} />
              ) : !recLoading ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-semibold text-amber-900 mb-1">When to Consult a Dermatologist</p>
                  <p className="text-sm text-amber-800">
                    Consult a qualified dermatologist for any high-risk result, rapid changes,
                    bleeding, pain, persistent itching, or if you are unsure. This AI result is
                    educational context, not a confirmed diagnosis.
                  </p>
                </div>
              ) : null}
            </div>

            {/* ── Footer — history link ───────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                This assessment has been saved to your history automatically.
              </p>
              <Link
                to="/history"
                className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:underline font-medium"
              >
                <History size={14} />
                View Assessment History
                <ChevronRight size={14} />
              </Link>
            </div>
          </section>
        )}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
            <Link to="/history" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {assessments.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-sm text-gray-500">
              No previous analyses yet.
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.slice(0, 3).map((item) => (
                <Link key={item.id} to={`/history/${item.id}`} className="bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{item.predicted_label}</p>
                    <p className="text-xs text-gray-500">{formatDate(item.created_at)} · {(item.confidence * 100).toFixed(1)}% confidence</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Floating AI Chatbot ──────────────────────────────────────────── */}
      <ChatBot
        analysisContext={result ? {
          condition:     result.label,
          conditionCode: result.class,
          confidence:    result.confidence,
          riskLevel:     personalized?.risk ?? "Low",
          recommendations,
        } : null}
      />
    </div>
  );
}

export default Dashboard;
