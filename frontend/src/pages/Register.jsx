import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
  ShieldCheck,
  Zap,
  ChevronDown,
  Info,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { registerUser } from "../services/api";

// ── Helper: basic email format check ──────────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/*
  Available roles for public self-registration.
  ⚠️  Administrator is intentionally excluded here.
      Admin accounts must be created or assigned by the platform team directly.
*/
const ROLES = [
  { value: "",                    label: "Select your role..." },
  { value: "user",                label: "User" },
  { value: "skincare_consultant", label: "Skincare Consultant" },
  { value: "dermatologist",       label: "Dermatologist" },
];

function Register() {
  const navigate = useNavigate();

  // ── Form field state ───────────────────────────────────────────────────────
  const [fullName, setFullName]                       = useState("");
  const [email, setEmail]                             = useState("");
  const [password, setPassword]                       = useState("");
  const [confirmPassword, setConfirmPassword]         = useState("");
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole]                               = useState("");
  const [agreedToTerms, setAgreedToTerms]             = useState(false);

  // ── Validation errors — one message per field ──────────────────────────────
  const [errors, setErrors] = useState({});

  // ── API interaction state ──────────────────────────────────────────────────
  const [isLoading, setIsLoading]   = useState(false);
  const [apiSuccess, setApiSuccess] = useState("");  // success banner
  const [apiError, setApiError]     = useState("");   // error banner

  // Clear a single field's error as the user types
  function clearError(field) {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  // Run all client-side validation rules; returns true only if all fields pass
  function validate() {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters.";
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!role) {
      newErrors.role = "Please select your role.";
    }

    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the Terms and Conditions to register.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiSuccess("");
    setApiError("");

    if (!validate()) return;

    setIsLoading(true);
    try {
      await registerUser({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });

      setApiSuccess("Account created successfully! Redirecting you to the sign-in page…");

      // Wait 1.5 s then navigate to login
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      // FastAPI error bodies have a `detail` field
      const detail = err?.detail;
      if (typeof detail === "string") {
        setApiError(detail);
      } else if (Array.isArray(detail)) {
        // Pydantic validation error — show the first message
        setApiError(detail[0]?.msg ?? "Registration failed. Please check your inputs.");
      } else {
        setApiError("Registration failed. Please try again later.");
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
            Start your personalized skin journey today.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-10">
            Create your account and let our AI guide you toward healthier,
            better-understood skin.
          </p>
          <ul className="space-y-4 text-blue-100">
            <li className="flex items-center gap-3">
              <CheckCircle size={20} className="text-blue-300 shrink-0" />
              <span>Free AI-powered skin assessment</span>
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-blue-300 shrink-0" />
              <span>Your data is always private and secure</span>
            </li>
            <li className="flex items-center gap-3">
              <Zap size={20} className="text-blue-300 shrink-0" />
              <span>Personalized results in minutes</span>
            </li>
          </ul>
        </div>

        <p className="text-blue-300 text-sm">
          © {new Date().getFullYear()} AI Skin Intelligence Platform
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════
          RIGHT PANEL — Registration Form
          ════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <Sparkles size={24} className="text-blue-600" />
            <span className="text-xl font-bold text-blue-600">AI Skin Intelligence</span>
          </div>

          {/* Page heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 mb-8 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          {/* ── Success banner ──────────────────────────────────────────────── */}
          {apiSuccess && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <Info size={18} className="shrink-0 mt-0.5" />
              <span>{apiSuccess}</span>
            </div>
          )}

          {/* ── Error banner ────────────────────────────────────────────────── */}
          {apiError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* ── Registration Form ────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Full Name ───────────────────────────────────── */}
            <div>
              <label
                htmlFor="reg-fullname"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="reg-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); clearError("fullName"); }}
                  placeholder="Jane Smith"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60
                    ${errors.fullName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white"
                    }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Email ───────────────────────────────────────── */}
            <div>
              <label
                htmlFor="reg-email"
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
                  id="reg-email"
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

            {/* Password ────────────────────────────────────── */}
            <div>
              <label
                htmlFor="reg-password"
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
                  id="reg-password"
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

            {/* Confirm Password ────────────────────────────── */}
            <div>
              <label
                htmlFor="reg-confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                  placeholder="Re-enter your password"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60
                    ${errors.confirmPassword
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role dropdown ───────────────────────────────── */}
            <div>
              <label
                htmlFor="reg-role"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                I am a...
              </label>
              <div className="relative">
                {/* Custom dropdown caret icon */}
                <ChevronDown
                  size={18}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  id="reg-role"
                  value={role}
                  onChange={(e) => { setRole(e.target.value); clearError("role"); }}
                  disabled={isLoading}
                  className={`w-full pl-4 pr-10 py-3 border rounded-xl text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition disabled:opacity-60
                    ${errors.role ? "border-red-400 bg-red-50" : "border-gray-200"}
                    ${!role ? "text-gray-400" : "text-gray-900"}`}
                >
                  {ROLES.map((r) => (
                    <option
                      key={r.value}
                      value={r.value}
                      disabled={r.value === ""}
                    >
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.role && (
                <p className="mt-1.5 text-xs text-red-500">{errors.role}</p>
              )}
              <p className="mt-1.5 text-xs text-gray-400">
                Administrator accounts are managed by the platform team and cannot be self-registered.
              </p>
            </div>

            {/* Terms and Conditions checkbox ───────────────── */}
            <div>
              <label
                htmlFor="reg-terms"
                className="flex items-start gap-3 cursor-pointer select-none"
              >
                <input
                  id="reg-terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => { setAgreedToTerms(e.target.checked); clearError("terms"); }}
                  disabled={isLoading}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:underline font-medium"
                    onClick={(e) => e.preventDefault()}
                  >
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:underline font-medium"
                    onClick={(e) => e.preventDefault()}
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1.5 text-xs text-red-500">{errors.terms}</p>
              )}
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
                  Creating your account…
                </>
              ) : (
                "Create my account"
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Register;