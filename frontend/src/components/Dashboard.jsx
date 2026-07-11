import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../client.js";

function ScoreRing({ score = 0, label = "Skin score" }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: "relative", width: 160, height: 160 }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="10"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--color-rose)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        {/* signature scan-sweep: a thin line that circles the ring once on load */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--color-teal)"
          strokeWidth="2"
          strokeDasharray={`2 ${circumference - 2}`}
          transform="rotate(-90 80 80)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="-90 80 80"
            to="270 80 80"
            dur="2.4s"
            repeatCount="1"
          />
        </circle>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="mono" style={{ fontSize: 32, fontWeight: 500 }}>
          {score}
        </span>
        <span style={{ fontSize: 11, color: "var(--color-gray)" }}>{label}</span>
      </div>
    </div>
  );
}

function Trend({ history }) {
  if (!history || history.length === 0) return null;
  const max = Math.max(...history.map((h) => h.score));
  const min = Math.min(...history.map((h) => h.score));
  const span = Math.max(max - min, 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
      {history.map((point, i) => {
        const height = 12 + ((point.score - min) / span) * 48;
        return (
          <div
            key={point.date ?? i}
            title={`${point.date}: ${point.score}`}
            style={{
              width: 10,
              height,
              borderRadius: 3,
              background: i === history.length - 1 ? "var(--color-rose)" : "var(--color-teal-dim)",
            }}
          />
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | empty | error

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [summaryRes, historyRes] = await Promise.all([
          api.getDashboardSummary(),
          api.getSkinScoreHistory(),
        ]);
        if (cancelled) return;
        setSummary(summaryRes);
        setHistory(historyRes?.points ?? []);
        setStatus(summaryRes ? "ready" : "empty");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return <p style={{ color: "var(--color-gray)" }}>Loading your dashboard…</p>;
  }

  if (status === "error") {
    return (
      <div className="card">
        <span className="eyebrow">Something didn't load</span>
        <p>We couldn't reach the analytics service. Try refreshing the page.</p>
      </div>
    );
  }

  if (status === "empty" || !summary) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 48 }}>
        <span className="eyebrow">No assessment yet</span>
        <h2 style={{ fontSize: 28, marginBottom: 12 }}>Start your first skin assessment</h2>
        <p style={{ color: "var(--color-ink-soft)", maxWidth: 420, margin: "0 auto 24px" }}>
          Answer a short questionnaire and upload a photo so we can build your
          baseline skin score and a routine tailored to it.
        </p>
        <Link to="/assessment" className="btn-primary" style={{ textDecoration: "none" }}>
          Take the assessment
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        className="card"
        style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}
      >
        <ScoreRing score={summary.overall_score} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <span className="eyebrow">Overall skin score</span>
          <h2 style={{ fontSize: 26, marginBottom: 8 }}>
            {summary.headline || "Your skin is trending steady"}
          </h2>
          <p style={{ color: "var(--color-ink-soft)", marginBottom: 16 }}>
            {summary.summary_text}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(summary.flags || []).map((flag) => (
              <span key={flag} className="pill warn">
                {flag}
              </span>
            ))}
            {(summary.strengths || []).map((s) => (
              <span key={s} className="pill">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <span className="eyebrow">Score over time</span>
        <Trend history={history} />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Link to="/routine" className="card" style={{ textDecoration: "none", color: "inherit" }}>
          <span className="eyebrow">Today</span>
          <h3 style={{ fontSize: 20 }}>View your routine</h3>
          <p style={{ color: "var(--color-ink-soft)", fontSize: 14 }}>
            {summary.routine_steps_remaining ?? 0} steps left today
          </p>
        </Link>
        <Link
          to="/assessment"
          className="card"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <span className="eyebrow">Reassess</span>
          <h3 style={{ fontSize: 20 }}>Update your assessment</h3>
          <p style={{ color: "var(--color-ink-soft)", fontSize: 14 }}>
            Retake the questionnaire to refine your recommendations
          </p>
        </Link>
      </section>
    </div>
  );
}
