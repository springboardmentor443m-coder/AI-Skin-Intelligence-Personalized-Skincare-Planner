import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
  ShieldCheck,
  Zap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { loginUser } from "../services/api";
import { useAuth } from "../hooks/useAuth";

// ── Helper: basic email format check ──────────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ── Form field state ───────────────────────────────────────────────────────
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);

  // ── Validation errors — one message per field ──────────────────────────────
  const [errors, setErrors] = useState({});

  // ── API interaction state ──────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError]   = useState("");

  // Clear a single field's error as the user types
  function clearError(field) {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  // Run all client-side validation rules; returns true only if everything passes
  function validate() {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await loginUser({ email: email.trim(), password });

      // Store token + user in AuthContext (and localStorage)
      login(data.access_token, data.user);

      // Redirect to the dashboard
      navigate("/dashboard");
    } catch (err) {
      const detail = err?.detail;
      if (typeof detail === "string") {
        setApiError(detail);
      } else {
        setApiError("Login failed. Please check your email and password.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ── Component JSX ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">

      {/* ════════════════════════════════════════════════════════════
          LEFT PANEL — Branding (hidden on mobile, shown on lg+)
          ════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex-col justify-between p-12 text-white">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Sparkles size={28} />
          <span className="text-xl font-bold">AI Skin Intelligence</span>
        </Link>

        {/* Tagline + feature list */}
        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Welcome back to your skin journey.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-10">
            Log in to access your personalized skin analysis, recommendations,
            and progress tracking.
          </p>
          <ul className="space-y-4 text-blue-100">
            <li className="flex items-center gap-3">
              <CheckCircle size={20} className="text-blue-300 shrink-0" />
              <span>AI-powered skin type analysis</span>
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-blue-300 shrink-0" />
              <span>Personalized skincare recommendations</span>
            </li>
            <li className="flex items-center gap-3">
              <Zap size={20} className="text-blue-300 shrink-0" />
              <span>Track your skin health progress</span>
            </li>
          </ul>
        </div>

        <p className="text-blue-300 text-sm">
          © {new Date().getFullYear()} AI Skin Intelligence Platform
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════
          RIGHT PANEL — Login Form
          ════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile-only logo (left panel is hidden on mobile) */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <Sparkles size={24} className="text-blue-600" />
            <span className="text-xl font-bold text-blue-600">AI Skin Intelligence</span>
          </div>

          {/* Page heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-500 mb-8 text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          {/* ── Error banner ────────────────────────────────────────────────── */}
          {apiError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* ── Login Form ──────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email ──────────────────────────────────────── */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60
                    ${errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white"
                    }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password ───────────────────────────────────── */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                  placeholder="Min. 8 characters"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60
                    ${errors.password
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white"
                    }`}
                />
                {/* Show / Hide password toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember me + Forgot password ──────────────── */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-remember"
                className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 select-none"
              >
                <input
                  id="login-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>

              <a
                href="#"
                className="text-sm text-blue-600 hover:underline font-medium"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit button ───────────────────────────────── */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in to your account"
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500">
            New to the platform?{" "}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create a free account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;