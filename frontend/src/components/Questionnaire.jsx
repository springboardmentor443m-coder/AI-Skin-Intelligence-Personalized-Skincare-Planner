import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../client.js";

const SKIN_TYPES = ["Dry", "Oily", "Combination", "Normal", "Sensitive"];
const CONCERNS = [
  "Acne & breakouts",
  "Fine lines & wrinkles",
  "Dark spots",
  "Redness",
  "Uneven texture",
  "Dullness",
  "Large pores",
];
const GOALS = ["Clearer skin", "Even tone", "Smoother texture", "Firmness", "Hydration", "Prevention"];

const STEPS = ["Skin type", "Concerns", "Goals", "Photo", "Review"];

function StepDots({ current }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
      {STEPS.map((label, i) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            className="mono"
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              background: i <= current ? "var(--color-ink)" : "var(--color-line)",
              color: i <= current ? "var(--color-bg)" : "var(--color-gray)",
            }}
          >
            {i + 1}
          </span>
          <span
            style={{
              fontSize: 13,
              color: i === current ? "var(--color-ink)" : "var(--color-gray)",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChoiceGrid({ options, selected, onToggle, multi = true }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {options.map((option) => {
        const isSelected = multi ? selected.includes(option) : selected === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={isSelected ? "btn-primary" : "btn-secondary"}
            style={{ borderRadius: 999 }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export default function Questionnaire() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [skinType, setSkinType] = useState("");
  const [concerns, setConcerns] = useState([]);
  const [goals, setGoals] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const toggleConcern = (value) =>
    setConcerns((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  const toggleGoal = (value) =>
    setGoals((prev) => (prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]));

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  const canAdvance = [
    Boolean(skinType),
    concerns.length > 0,
    goals.length > 0,
    true, // photo optional
    true,
  ][step];

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await api.submitQuestionnaire({ skin_type: skinType, concerns, goals });

      if (photo) {
        const formData = new FormData();
        formData.append("photo", photo);
        await api.uploadSkinPhoto(formData);
      }

      const assessment = await api.getLatestAssessment();
      setResult(assessment);
    } catch (err) {
      setError(err.message || "Something went wrong submitting your assessment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 48 }}>
        <span className="eyebrow">Assessment complete</span>
        <h2 style={{ fontSize: 28, marginBottom: 12 }}>
          Your score: <span className="mono">{result.overall_score ?? "—"}</span>
        </h2>
        <p style={{ color: "var(--color-ink-soft)", maxWidth: 460, margin: "0 auto 24px" }}>
          {result.summary_text || "We've built your personalized routine based on these answers."}
        </p>
        <button className="btn-primary" onClick={() => navigate("/routine")}>
          View my routine
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <StepDots current={step} />

      {step === 0 && (
        <div>
          <h3 style={{ marginBottom: 12 }}>What's your skin type?</h3>
          <ChoiceGrid
            options={SKIN_TYPES}
            selected={skinType}
            multi={false}
            onToggle={setSkinType}
          />
        </div>
      )}

      {step === 1 && (
        <div>
          <h3 style={{ marginBottom: 12 }}>What are you noticing right now?</h3>
          <ChoiceGrid options={CONCERNS} selected={concerns} onToggle={toggleConcern} />
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ marginBottom: 12 }}>What would you like to work toward?</h3>
          <ChoiceGrid options={GOALS} selected={goals} onToggle={toggleGoal} />
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ marginBottom: 8 }}>Add a clear, makeup-free photo</h3>
          <p style={{ color: "var(--color-ink-soft)", fontSize: 14, marginBottom: 16 }}>
            Optional, but it sharpens your score and recommendations. Taken in even,
            natural light works best.
          </p>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview of uploaded skin photo"
              style={{
                display: "block",
                marginTop: 16,
                maxWidth: 220,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-line)",
              }}
            />
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 style={{ marginBottom: 12 }}>Review your answers</h3>
          <dl style={{ display: "grid", gap: 10, fontSize: 14 }}>
            <div>
              <dt className="eyebrow" style={{ marginBottom: 2 }}>
                Skin type
              </dt>
              <dd style={{ margin: 0 }}>{skinType}</dd>
            </div>
            <div>
              <dt className="eyebrow" style={{ marginBottom: 2 }}>
                Concerns
              </dt>
              <dd style={{ margin: 0 }}>{concerns.join(", ")}</dd>
            </div>
            <div>
              <dt className="eyebrow" style={{ marginBottom: 2 }}>
                Goals
              </dt>
              <dd style={{ margin: 0 }}>{goals.join(", ")}</dd>
            </div>
            <div>
              <dt className="eyebrow" style={{ marginBottom: 2 }}>
                Photo
              </dt>
              <dd style={{ margin: 0 }}>{photo ? photo.name : "Not provided"}</dd>
            </div>
          </dl>
          {error && (
            <p style={{ color: "var(--color-rose)", marginTop: 16, fontSize: 14 }}>{error}</p>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
        <button
          className="btn-secondary"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            className="btn-primary"
            disabled={!canAdvance}
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          >
            Continue
          </button>
        ) : (
          <button className="btn-primary" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Submitting…" : "Submit assessment"}
          </button>
        )}
      </div>
    </div>
  );
}
