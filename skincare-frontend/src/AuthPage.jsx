import { useState } from "react";
import { signup, login } from "./api.js";

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
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
      {/* ── LEFT PANEL ── */}
      <div className="auth-visual">
        <div className="auth-visual__orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        <div className="auth-visual__brand">
          <div className="auth-visual__brand-icon">✦</div>
          Skin Intelligence
        </div>

        <div>
          <div className="auth-visual__quote">
            <p>
              AI that reads your skin <span>before</span> you read a label.
            </p>
            <p className="sub">Personalized routines · AI Scan · Ingredient Intelligence</p>
          </div>

          <div className="auth-features">
            {[
              { icon: "🔬", title: "AI Photo Analysis", desc: "Upload a selfie — our model detects skin type & concerns instantly" },
              { icon: "📅", title: "7-Day Planner", desc: "A personalized routine built around your exact skin concern" },
              { icon: "🛍️", title: "Smart Products", desc: "Products matched to your AI analysis, with direct buy links" },
            ].map((f) => (
              <div className="auth-feature" key={f.title}>
                <span className="auth-feature-icon">{f.icon}</span>
                <div className="auth-feature-text">
                  <strong>{f.title}</strong>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-form-side">
        <div className="auth-card">
          <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="auth-card__sub">
            {mode === "login"
              ? "Sign in to view your AI skin analysis and routine."
              : "Join and get your personalized skincare plan in minutes."}
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
                ? "Sign in →"
                : "Create account →"}
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
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
