import { useRef, useState } from "react";
import { analyzePhoto } from "./api.js";
import { translations, translateConcern, translateSkinType } from "./translations.js";

function ScanOverlay({ t }) {
  return (
    <div className="scan-overlay">
      <div className="scan-sweep" />
      <div className="scan-rings">
        <div className="scan-ring" />
        <div className="scan-ring" />
        <div className="scan-ring" />
        <div className="scan-ring" />
        <div className="scan-dot" />
      </div>
      <div className="scan-label">{t.analyzing}</div>
    </div>
  );
}

function ScoreBarList({ scores, type, lang }) {
  const sorted = Object.entries(scores || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="score-bar-list">
      {sorted.map(([name, value]) => {
        const translatedName = type === "skin_type" 
          ? translateSkinType(name, lang) 
          : translateConcern(name, lang);
        return (
          <div className="score-bar" key={name}>
            <span className="score-bar__label">{translatedName}</span>
            <span className="score-bar__value">{value}%</span>
            <div className="score-bar__track">
              <div
                className="score-bar__fill"
                style={{ width: `${Math.min(value, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ResultBlock({ title, result, labelKey, type, lang }) {
  if (!result) return null;
  const topVal = result[labelKey];
  const translatedBadge = type === "skin_type"
    ? translateSkinType(topVal, lang)
    : translateConcern(topVal, lang);

  return (
    <div className="result-block">
      <div className="result-block__header">
        <span className="result-block__title">{title}</span>
        {result.is_confident ? (
          <span className="tag tag--rose">
            {translatedBadge} · {result.confidence}%
          </span>
        ) : (
          <span className="tag tag--pending">Inconclusive</span>
        )}
      </div>
      <ScoreBarList scores={result.all_scores} type={type} lang={lang} />
    </div>
  );
}

export default function PhotoAnalysis({
  token,
  onAnalyzed,
  preview,
  setPreview,
  result,
  setResult,
  lang = "en",
}) {
  const fileInputRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const t = translations[lang] || translations.en;

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
    setError("");
    setResult(null);
    runAnalysis(file);
    e.target.value = "";
  }

  async function runAnalysis(file) {
    setScanning(true);
    try {
      const data = await analyzePhoto(token, file);
      setResult(data);
      onAnalyzed?.();
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="card glass" style={{ padding: 28, marginTop: 24 }}>
      <h2 className="section-title">{t.scanTitle}</h2>
      <p className="section-sub">{t.scanSub}</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* Upload Zone */}
      <div
        className="upload-zone"
        onClick={() => !scanning && fileInputRef.current?.click()}
        style={{ cursor: scanning ? "default" : "pointer" }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Uploaded Face" className="upload-zone__preview" />
            {scanning && <ScanOverlay t={t} />}
          </>
        ) : (
          <div className="upload-zone__placeholder">
            <div className="upload-zone__icon">📷</div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-soft)" }}>
              {t.clickToUpload}
            </span>
            <span style={{ fontSize: 12.5 }}>JPEG · PNG · WEBP · Max 8 MB</span>
          </div>
        )}
      </div>

      {!scanning && (
        <button
          className="btn-ghost"
          style={{ marginTop: 14, width: "100%", justifyContent: "center" }}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? t.chooseDifferentPhoto : t.choosePhoto}
        </button>
      )}

      {scanning && (
        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 13.5,
            color: "var(--sage-deep)",
            fontWeight: 600,
            animation: "fadeInOut 1.8s ease-in-out infinite",
          }}
        >
          {t.analyzing}
        </div>
      )}

      {error && <div className="error-banner" style={{ marginTop: 16 }}>{error}</div>}

      {/* Results (PERSISTED across tab switches) */}
      {result && !scanning && (
        <div className="analysis-results">
          <div className="divider-label">{t.analysisResults}</div>

          <ResultBlock
            title={t.concernDetected}
            result={result.concern}
            labelKey="top_concern"
            type="concern"
            lang={lang}
          />
          <ResultBlock
            title={t.typeDetected}
            result={result.skin_type}
            labelKey="top_type"
            type="skin_type"
            lang={lang}
          />

          <div className="disclaimer-text">{t.disclaimer}</div>
        </div>
      )}
    </div>
  );
}