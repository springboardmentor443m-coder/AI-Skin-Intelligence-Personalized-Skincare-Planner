import { useRef, useState } from "react";
import { analyzePhoto } from "./api.js";

function ScorePill({ label, value }) {
  return (
    <div className="score-pill">
      <span className="score-pill__label">{label}</span>
      <div className="score-pill__track">
        <div
          className="score-pill__fill"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="score-pill__value">{value}%</span>
    </div>
  );
}

function ResultBlock({ title, result, labelKey }) {
  if (!result) return null;

  const sorted = Object.entries(result.all_scores || {}).sort(
    (a, b) => b[1] - a[1]
  );
  const topThree = sorted.slice(0, 3);

  return (
    <div className="analysis-result">
      <div className="analysis-result__header">
        <span className="analysis-result__title">{title}</span>
        {result.is_confident ? (
          <span className="tag">
            {result[labelKey]} · {result.confidence}%
          </span>
        ) : (
          <span className="tag tag--pending">No strong result</span>
        )}
      </div>
      {result.is_confident && (
        <div className="score-pill-list">
          {topThree.map(([name, value]) => (
            <ScorePill key={name} label={name} value={value} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PhotoAnalysis({ token, onAnalyzed }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setError("");
    setResult(null);
    runAnalysis(file);
  }

  async function runAnalysis(file) {
    setLoading(true);
    try {
      const data = await analyzePhoto(token, file);
      setResult(data);
      onAnalyzed?.(); // let the parent refresh the profile (detected_* fields)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card photo-analysis-card">
      <h2 className="section-title">Analyze a photo</h2>
      <p className="section-sub">
        Upload a clear, close-up photo of your skin. Our AI will estimate
        your skin type and any visible concerns.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
        {preview ? (
          <img src={preview} alt="Preview" className="upload-zone__preview" />
        ) : (
          <div className="upload-zone__placeholder">
            <span className="upload-zone__icon">＋</span>
            <span>Click to choose a photo</span>
          </div>
        )}
      </div>

      <button
        className="btn-ghost"
        style={{ marginTop: 12 }}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? "Choose a different photo" : "Choose photo"}
      </button>

      {loading && <div className="loading-text">Analyzing your photo…</div>}
      {error && <div className="error-banner" style={{ marginTop: 16 }}>{error}</div>}

      {result && !loading && (
        <div className="analysis-results">
          <ResultBlock
            title="Skin Concern"
            result={result.concern}
            labelKey="top_concern"
          />
          <ResultBlock
            title="Skin Type"
            result={result.skin_type}
            labelKey="top_type"
          />
          <p className="disclaimer-text">
            AI-estimated based on photo quality and lighting — not a medical
            diagnosis. For best results, use a clear, close-up photo in good
            light.
          </p>
        </div>
      )}
    </div>
  );
}