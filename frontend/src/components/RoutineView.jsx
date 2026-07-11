import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../client.js";

function StepRow({ step, onToggle }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 0",
        borderBottom: "1px solid var(--color-line)",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={Boolean(step.done)}
        onChange={() => onToggle(step)}
        style={{ marginTop: 4 }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontWeight: 500,
              textDecoration: step.done ? "line-through" : "none",
              color: step.done ? "var(--color-gray)" : "var(--color-ink)",
            }}
          >
            {step.name}
          </span>
          {step.product && (
            <span className="mono" style={{ fontSize: 12, color: "var(--color-gray)" }}>
              {step.product}
            </span>
          )}
        </div>
        {step.note && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-ink-soft)" }}>
            {step.note}
          </p>
        )}
      </div>
    </label>
  );
}

function RoutineBlock({ title, steps, onToggle }) {
  const completed = steps.filter((s) => s.done).length;
  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span className="eyebrow">{title}</span>
        <span className="mono" style={{ fontSize: 12, color: "var(--color-gray)" }}>
          {completed}/{steps.length}
        </span>
      </div>
      <div>
        {steps.map((step) => (
          <StepRow key={step.id} step={step} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
}

export default function RoutineView() {
  const [routine, setRoutine] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    api
      .getRoutine()
      .then((data) => {
        if (cancelled) return;
        setRoutine(data);
        setStatus(data && (data.morning?.length || data.evening?.length) ? "ready" : "empty");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggle(step) {
    const nextDone = !step.done;
    setRoutine((prev) => {
      if (!prev) return prev;
      const update = (list) =>
        list.map((s) => (s.id === step.id ? { ...s, done: nextDone } : s));
      return { ...prev, morning: update(prev.morning || []), evening: update(prev.evening || []) };
    });
    try {
      await api.markStepComplete(step.id, nextDone);
    } catch {
      // revert on failure
      setRoutine((prev) => {
        if (!prev) return prev;
        const revert = (list) =>
          list.map((s) => (s.id === step.id ? { ...s, done: !nextDone } : s));
        return { ...prev, morning: revert(prev.morning || []), evening: revert(prev.evening || []) };
      });
    }
  }

  if (status === "loading") {
    return <p style={{ color: "var(--color-gray)" }}>Loading your routine…</p>;
  }

  if (status === "error") {
    return (
      <div className="card">
        <span className="eyebrow">Something didn't load</span>
        <p>We couldn't reach the routine service. Try refreshing the page.</p>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="card" style={{ textAlign: "center", padding: 48 }}>
        <span className="eyebrow">No routine yet</span>
        <h2 style={{ fontSize: 26, marginBottom: 12 }}>Build your routine</h2>
        <p style={{ color: "var(--color-ink-soft)", maxWidth: 420, margin: "0 auto 24px" }}>
          Complete the skin assessment first so we can put together AM and PM
          steps suited to your skin.
        </p>
        <Link to="/assessment" className="btn-primary" style={{ textDecoration: "none" }}>
          Start assessment
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <RoutineBlock title="Morning" steps={routine.morning || []} onToggle={handleToggle} />
      <RoutineBlock title="Evening" steps={routine.evening || []} onToggle={handleToggle} />
    </div>
  );
}
