import { useState } from "react";
import { signup, login } from "./api.js";

function RingsVisual() {
  // Signature element: concentric scan rings, echoing the skin-analysis theme
  return (
    <svg viewBox="0 0 400 400" fill="none">
      {[170, 135, 100, 65].map((r, i) => (
        <circle
          key={r}
          cx="200"
          cy="200"
          r={r}
          stroke="#eef3ec"
          strokeOpacity={0.15 + i * 0.08}
          strokeWidth="1.5"
        />
      ))}
      <circle cx="200" cy="200" r="30" fill="#d98ba0" fillOpacity="0.85" />
    </svg>
  );
}

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        await signup({ full_name: fullName, email, password });
      }
      const { access_token } = await login({ email, password });
      onAuthenticated(access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="auth-visual__rings">
          <RingsVisual />
        </div>
        <div className="auth-visual__brand">Skin Intelligence</div>
        <div className="auth-visual__quote">
          <p>Skincare that reads your skin before it reads a label.</p>
          <span>Personalized routines · Ingredient intelligence</span>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="auth-card__sub">
            {mode === "login"
              ? "Log in to see your skin profile and routine."
              : "Set up your profile to get personalized skincare guidance."}
          </p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "login"
                ? "Log in"
                : "Create account"}
            </button>
          </form>

          <div className="auth-toggle">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button type="button" onClick={() => setMode("signup")}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")}>
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
