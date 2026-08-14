import { useEffect, useState, useCallback } from "react";
import {
  getMyProfile,
  saveProfile,
  clearScanData,
  getRecommendations,
  getWeeklyPlan,
  queryRAGAdvisor,
} from "./api.js";
import PhotoAnalysis from "./PhotoAnalysis.jsx";
import { translations, translateConcern, translateSkinType, translateRoutineText } from "./translations.js";

// ── Score Ring ──────────────────────────────────────────────
const CIRC = 2 * Math.PI * 76;

function ScoreRing({ score }) {
  const has = typeof score === "number";
  const offset = has ? CIRC * (1 - score / 100) : CIRC;

  return (
    <div className="score-ring">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="76" fill="none"
          stroke="rgba(0,0,0,0.06)" strokeWidth="12" />
        <circle cx="90" cy="90" r="76" fill="none"
          stroke="var(--rose)" strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={has ? offset : CIRC}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="score-ring__value">
        {has ? (
          <>
            <div className="score-ring__num">{score}</div>
            <div className="score-ring__label">/ 100</div>
          </>
        ) : (
          <div className="score-ring__label" style={{ maxWidth: 90, textAlign: "center" }}>
            Awaiting scan
          </div>
        )}
      </div>
    </div>
  );
}

// ── Profile Tab ────────────────────────────────────────────
const emptyForm = {
  skin_type: "", age_group: "", skin_concerns: "",
  allergies: "", sleep_quality: "", water_intake_liters: "",
};

function ProfileTab({ token, profile, onProfileSaved, onGoToScan, onClearScan, t, lang }) {
  const [editing, setEditing] = useState(!profile);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openEdit() {
    setForm({
      skin_type: profile?.skin_type || "",
      age_group: profile?.age_group || "",
      skin_concerns: (profile?.skin_concerns || []).join(", "),
      allergies: (profile?.allergies || []).join(", "),
      sleep_quality: profile?.sleep_quality || "",
      water_intake_liters: profile?.water_intake_liters ?? "",
    });
    setEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const toList = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
      const saved = await saveProfile(token, {
        skin_type: form.skin_type || null,
        age_group: form.age_group || null,
        skin_concerns: toList(form.skin_concerns),
        allergies: toList(form.allergies),
        sleep_quality: form.sleep_quality || null,
        water_intake_liters: form.water_intake_liters ? Number(form.water_intake_liters) : null,
      });
      onProfileSaved(saved);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function f(key) {
    return (e) => setForm({ ...form, [key]: e.target.value });
  }

  const hasScanScore = profile?.skin_health_score != null;

  return (
    <div className="dash-grid section-reveal">
      {/* Left Score Card */}
      <div className="card glass score-card">
        <div className="score-card-label">{t.scoreLabel}</div>
        <ScoreRing score={profile?.skin_health_score ?? null} />
        
        {hasScanScore ? (
          <>
            <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(239, 246, 255, 0.9)", border: "1px solid rgba(191, 219, 254, 0.9)", borderRadius: 10, fontSize: 11.5, color: "#1e40af", textAlign: "center", width: "100%" }}>
              <div style={{ fontWeight: 700 }}>📌 Saved Previous AI Scan</div>
              <div style={{ fontSize: 10.5, marginTop: 2, opacity: 0.85 }}>
                {profile.scanned_at
                  ? `Scanned: ${new Date(profile.scanned_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                  : "Saved from past session"}
              </div>
            </div>
            <p className="score-pending" style={{ fontSize: 11, marginTop: 8 }}>
              This score was saved from your previous AI photo scan. Upload a new photo to get fresh results.
            </p>
          </>
        ) : (
          <p className="score-pending">{t.scoreSub}</p>
        )}

        {profile && (
          <div style={{ marginTop: 18, width: "100%" }}>
            <div className="divider-label" style={{ margin: "0 0 12px" }}>{t.aiDetected}</div>
            <div className="tag-row" style={{ justifyContent: "center" }}>
              <span className={`tag ${hasScanScore && profile.detected_skin_type ? "tag--rose" : "tag--pending"}`}>
                {hasScanScore && profile.detected_skin_type ? `🧬 ${translateSkinType(profile.detected_skin_type)}` : "Skin type: Pending scan"}
              </span>
              <span className={`tag ${hasScanScore && profile.detected_concern ? "tag--emerald" : "tag--pending"}`}>
                {hasScanScore && profile.detected_concern ? `⚡ ${translateConcern(profile.detected_concern)}` : "Concern: Pending scan"}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          <button
            type="button"
            className="btn-primary"
            style={{ fontSize: 12.5, padding: "9px 14px", borderRadius: 9, width: "100%" }}
            onClick={onGoToScan}
          >
            {hasScanScore ? "📸 Upload New Photo / Re-Scan" : "📷 Start AI Photo Scan"}
          </button>
          
          {hasScanScore && (
            <button
              type="button"
              className="btn-ghost"
              style={{ fontSize: 11.5, color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)", padding: "7px 12px", borderRadius: 8, width: "100%" }}
              onClick={onClearScan}
            >
              🗑️ Clear Saved Scan Data
            </button>
          )}
        </div>
      </div>

      {/* Right Details */}
      <div className="card glass" style={{ padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 className="section-title">{t.profileTab}</h2>
            <p className="section-sub" style={{ marginBottom: 0 }}>
              Self-reported details used to personalize your routine.
            </p>
          </div>
          {!editing && (
            <button className="btn-ghost" onClick={openEdit}>
              {profile ? t.editProfile : t.createProfile}
            </button>
          )}
        </div>

        {error && <div className="error-banner">{error}</div>}

        {!editing && profile && (
          <>
            <div className="detail-grid">
              {[
                [
                  t.skinType,
                  profile.detected_skin_type
                    ? `${translateSkinType(profile.detected_skin_type, lang)} (⚡ AI Detected)`
                    : (profile.skin_type ? translateSkinType(profile.skin_type, lang) : "Pending AI Scan")
                ],
                [t.ageGroup, profile.age_group],
                [t.sleepQuality, profile.sleep_quality],
                [t.waterIntake, profile.water_intake_liters ? `${profile.water_intake_liters} L / day` : null],
              ].map(([label, val]) => (
                <div className="detail-item" key={label}>
                  <label>{label}</label>
                  <div>{val || "—"}</div>
                </div>
              ))}
            </div>

            {["skin_concerns", "allergies"].map((key) => {
              let items = profile[key] || [];
              if (key === "skin_concerns" && profile.detected_concern) {
                // Prepend AI detected concern if present
                const detectedTag = `${translateConcern(profile.detected_concern, lang)} (⚡ AI Detected)`;
                items = [detectedTag, ...items.filter(c => c.toLowerCase() !== profile.detected_concern.toLowerCase())];
              }
              const labels = { skin_concerns: t.skinConcerns, allergies: t.allergies };
              return (
                <div key={key} style={{ marginTop: 18 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", fontWeight: 700 }}>
                    {labels[key]}
                  </label>
                  <div className="tag-row">
                    {items.length ? items.map((c) => (
                      <span className="tag" key={c}>{c.includes("⚡") ? c : translateConcern(c, lang)}</span>
                    )) : <span className="tag tag--pending">None listed</span>}
                  </div>
                </div>
              );
            })}

          </>
        )}

        {editing && (
          <form className="form-card" onSubmit={handleSave}>
            <div className="form-grid">
              <div className="field">
                <label>{t.skinType} <span style={{ fontSize: 11, fontStyle: "italic", fontWeight: 400, opacity: 0.75 }}>(Optional — Auto-detected by AI Scan)</span></label>
                <select value={form.skin_type} onChange={f("skin_type")}>
                  <option value="">Select…</option>
                  {["oily", "dry", "normal", "combination"].map((v) => (
                    <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t.ageGroup}</label>
                <input type="text" placeholder="e.g. 20-25" value={form.age_group} onChange={f("age_group")} />
              </div>
              <div className="field field--full">
                <label>{t.skinConcerns} <span style={{ fontSize: 11, fontStyle: "italic", fontWeight: 400, opacity: 0.75 }}>(Optional — Auto-detected by AI Scan)</span></label>
                <input type="text" placeholder="e.g. Wrinkles, Prevention (Auto-detected from photo scan)" value={form.skin_concerns} onChange={f("skin_concerns")} />
              </div>
              <div className="field">
                <label>{t.allergies}</label>
                <input type="text" placeholder="e.g. Fragrance, Nuts, or 'None'" value={form.allergies} onChange={f("allergies")} />
                <span style={{ fontSize: 11, color: "var(--ink-soft)", opacity: 0.8, marginTop: 2, display: "block" }}>
                  Enter 'None' or leave blank if you have no known allergies.
                </span>
              </div>
              <div className="field">
                <label>{t.sleepQuality}</label>
                <select value={form.sleep_quality} onChange={f("sleep_quality")}>
                  <option value="">Select…</option>
                  {["poor", "average", "good"].map((v) => (
                    <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t.waterIntake}</label>
                <input type="number" step="0.1" placeholder="2.0" value={form.water_intake_liters} onChange={f("water_intake_liters")} />
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button className="btn-primary" type="submit" style={{ width: "auto", padding: "12px 28px" }} disabled={saving}>
                {saving ? "Saving…" : t.saveProfile}
              </button>
              {profile && (
                <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>{t.cancel}</button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Upgraded Planner Tab with Dual Modes & Full Multilingual Support ────────
function PlannerTab({ token, t, lang, profile, onGoToScan }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("natural"); // "natural" | "clinical"
  const [checkedSteps, setCheckedSteps] = useState({});

  useEffect(() => {
    setLoading(true);
    getWeeklyPlan(token)
      .then(setPlan)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, profile]);

  function toggleStep(dayName, stepIdx) {
    const key = `${mode}-${dayName}-${stepIdx}`;
    setCheckedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (loading) return <div className="loading-text">⏳ Building your personalized 7-day skincare planner…</div>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!plan) return null;

  const hasDetectedConcern = Boolean(
    plan?.has_scan ||
    profile?.skin_health_score != null ||
    profile?.detected_concern ||
    (profile?.skin_concerns && profile.skin_concerns.length > 0) ||
    plan?.concern_label
  );

  if (!hasDetectedConcern) {
    return (
      <div className="card glass section-reveal" style={{ padding: 40, textAlign: "center", maxWidth: 620, margin: "40px auto", borderRadius: 20 }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>📷</div>
        <h2 className="section-title" style={{ fontSize: 24, marginBottom: 12 }}>
          AI Photo Scan or Profile Setup Required
        </h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14.5, lineHeight: 1.6, marginBottom: 24 }}>
          Please complete your <strong>Skin Profile</strong> or run an <strong>AI Photo Scan</strong> to unlock your personalized 7-Day Skincare Routine!
        </p>
        <button
          className="btn-primary"
          style={{ width: "auto", padding: "12px 32px", fontSize: 15, borderRadius: 10 }}
          onClick={onGoToScan}
        >
          📷 Start AI Photo Scan
        </button>
      </div>
    );
  }

  const todayEng = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const activeDays = mode === "natural" ? (plan.natural_days || plan.days) : (plan.clinical_days || plan.days);

  return (
    <div className="section-reveal">
      {/* 💧 Low Water Intake Alert Banner */}
      {plan.hydration_alert && (
        <div
          className="card glass"
          style={{
            padding: "16px 20px",
            marginBottom: 20,
            borderLeft: "4px solid #e07a5f",
            background: "rgba(224, 122, 95, 0.12)",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            borderRadius: 14,
          }}
        >
          <span style={{ fontSize: 26, lineHeight: 1 }}>💧</span>
          <div>
            <strong style={{ color: "var(--rose-deep)", fontSize: 15, display: "block", marginBottom: 4 }}>
              Dehydration Warning ({plan.water_intake_liters ?? "Low"} L/day)
            </strong>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
              {plan.hydration_alert}
            </p>
          </div>
        </div>
      )}

      {/* 😴 Sleep Quality Alert Banner */}
      {plan.sleep_alert && (
        <div
          className="card glass"
          style={{
            padding: "16px 20px",
            marginBottom: 20,
            borderLeft: "4px solid #3a86ff",
            background: "rgba(58, 134, 255, 0.10)",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            borderRadius: 14,
          }}
        >
          <span style={{ fontSize: 26, lineHeight: 1 }}>😴</span>
          <div>
            <strong style={{ color: "#3a86ff", fontSize: 15, display: "block", marginBottom: 4 }}>
              Sleep & Recovery Alert
            </strong>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
              {plan.sleep_alert}
            </p>
          </div>
        </div>
      )}

      <div className="planner-header card glass" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 className="section-title" style={{ fontSize: 22 }}>
              {t.plannerTitle}
            </h2>
            <p className="section-sub" style={{ marginBottom: 8 }}>
              {t.plannerSub} <strong style={{ color: "var(--rose-deep)" }}>{translateRoutineText(plan.concern_label, lang)}</strong>
            </p>
            <div className="planner-goal">🎯 {translateRoutineText(plan.goal, lang)}</div>

            {plan.water_intake_liters != null && (
              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <span className={`tag ${plan.water_intake_liters < 3.0 ? "tag--pending" : "tag--rose"}`} style={{ fontSize: 12, fontWeight: 600 }}>
                  💧 Water Intake: {plan.water_intake_liters} L/day {plan.water_intake_liters < 3.0 ? "(Target: 3.0L)" : "✓ Optimal"}
                </span>
                {plan.sleep_quality && (
                  <span className="tag tag--rose" style={{ fontSize: 12, fontWeight: 600 }}>
                    😴 Sleep: {plan.sleep_quality}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Routine Mode Switcher — Natural First */}
          <div className="planner-mode-switcher">
            <button
              className={`mode-btn ${mode === "natural" ? "active" : ""}`}
              onClick={() => setMode("natural")}
            >
              🌿 {t.naturalMode}
            </button>
            <button
              className={`mode-btn ${mode === "clinical" ? "active" : ""}`}
              onClick={() => setMode("clinical")}
            >
              🧪 {t.clinicalMode}
            </button>
          </div>
        </div>

        {mode === "clinical" && plan.key_actives && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-faint)" }}>
              {t.keyActives}
            </span>
            {plan.key_actives.map((act) => (
              <span key={act} className="tag tag--emerald" style={{ fontSize: 11 }}>{translateRoutineText(act, lang)}</span>
            ))}
          </div>
        )}

        {mode === "natural" && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--sage-deep)", fontWeight: 500 }}>
            {t.naturalNotice}
          </div>
        )}
      </div>

      <div className="planner-grid">
        {activeDays.map((day, i) => {
          const isToday = day.day === todayEng;
          const dayNameTranslated = t.days[day.day] || day.day;
          return (
            <div
              key={day.day}
              className={`day-card ${isToday ? "day-card--active" : "day-card--rest"}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="day-name">
                <span>{dayNameTranslated}</span>
                {isToday && <span className="day-badge">TODAY</span>}
              </div>

              {day.focus && (
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--rose-deep)", marginBottom: 12 }}>
                  {t.focus} {translateRoutineText(day.focus, lang)}
                </div>
              )}

              {/* AM Routine */}
              <div className="routine-block">
                <div className="routine-time am">{t.morning}</div>
                <ul className="routine-steps">
                  {day.am.map((step, sIdx) => {
                    const checkKey = `${mode}-${day.day}-am-${sIdx}`;
                    const done = checkedSteps[checkKey];
                    return (
                      <li
                        key={sIdx}
                        className="routine-step"
                        onClick={() => toggleStep(day.day, `am-${sIdx}`)}
                        style={{ cursor: "pointer", opacity: done ? 0.5 : 1, textDecoration: done ? "line-through" : "none" }}
                      >
                        <input type="checkbox" checked={!!done} readOnly style={{ accentColor: "var(--rose)", marginRight: 4 }} />
                        <span>{translateRoutineText(step, lang)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* PM Routine */}
              <div className="routine-block" style={{ marginTop: 14 }}>
                <div className="routine-time pm">{t.evening}</div>
                <ul className="routine-steps">
                  {day.pm.map((step, sIdx) => {
                    const checkKey = `${mode}-${day.day}-pm-${sIdx}`;
                    const done = checkedSteps[checkKey];
                    return (
                      <li
                        key={sIdx}
                        className="routine-step"
                        onClick={() => toggleStep(day.day, `pm-${sIdx}`)}
                        style={{ cursor: "pointer", opacity: done ? 0.5 : 1, textDecoration: done ? "line-through" : "none" }}
                      >
                        <input type="checkbox" checked={!!done} readOnly style={{ accentColor: "var(--sky)", marginRight: 4 }} />
                        <span>{translateRoutineText(step, lang)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Active Highlight */}
              {day.active_highlight && (
                <div style={{ marginTop: 10, padding: "8px 10px", background: "var(--sage-tint)", borderRadius: 8, fontSize: 11.5, color: "var(--sage-deep)", border: "1px solid rgba(107,142,104,0.2)" }}>
                  {translateRoutineText(day.active_highlight, lang)}
                </div>
              )}

              {/* Tip */}
              {day.tip && (
                <div className="day-tip">
                  <span>{translateRoutineText(day.tip, lang)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SVG Photo Fallback ────────────────────────────────────
function ProductPhoto({ src, alt, brand, category }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="amazon-card__svg-photo">
        <svg viewBox="0 0 100 120" width="80" height="96" fill="none">
          <rect x="25" y="35" width="50" height="70" rx="8" fill="#f0ede8" stroke="#c4826a" strokeWidth="2" />
          <path d="M40 20 H60 V35 H40 Z" fill="#c4826a" />
          <circle cx="50" cy="65" r="14" fill="#f9ede8" stroke="#c4826a" strokeWidth="1.5" />
          <text x="50" y="69" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#a8664e">
            {brand ? brand.charAt(0) : "S"}
          </text>
        </svg>
        <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>
          {category || "Skincare Product"}
        </span>
      </div>
    );
  }

  return (
    <img
      className="amazon-card__img"
      src={src}
      alt={alt}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

// ── Amazon Product Card ────────────────────────────────────
function AmazonProductCard({ product, t }) {
  const price = product.price_inr || 1995;
  const mrp = product.mrp_inr || Math.round(price * 1.35);
  const discount = product.discount_pct || 26;

  const amazonSearchUrl = product.purchase_url || `https://www.amazon.in/s?k=${encodeURIComponent(product.name)}`;

  return (
    <div className="amazon-card">
      <div className="amazon-card__top">
        <span className="amazon-card__sponsored">
          {product.sponsored ? "Sponsored ℹ️" : "AI Matched ⭐"}
        </span>
        {product.matched_because && (
          <span className="amazon-card__match-badge">
            {product.matched_because}
          </span>
        )}
      </div>

      <div className="amazon-card__img-container">
        <ProductPhoto
          src={product.image_url}
          alt={product.name}
          brand={product.brand}
          category={product.category}
        />
      </div>

      <div className="amazon-card__content">
        <div className="amazon-card__brand">{product.brand || "SKINCARE"}</div>
        <div className="amazon-card__title" title={product.name}>
          {product.name}
        </div>

        <div style={{ marginTop: 4 }}>
          <span className="amazon-card__cat-pill">{product.category || "Skincare"}</span>
        </div>

        <div className="amazon-card__rating-row">
          <span className="amazon-card__stars">4.3 ★★★★☆</span>
          <span className="amazon-card__review-count">{product.review_count || "(1,420)"}</span>
        </div>

        <div className="amazon-card__price-row">
          <span className="amazon-card__price">₹{price.toLocaleString("en-IN")}</span>
          <span className="amazon-card__mrp">M.R.P.: <del>₹{mrp.toLocaleString("en-IN")}</del></span>
          <span className="amazon-card__discount">({discount}% off)</span>
        </div>

        <div className="amazon-card__offer">
          Up to 5% back with Amazon Pay ICICI card
        </div>

        <div className="amazon-card__delivery">
          <strong>{t.freeDelivery}</strong>
          <br />
          {t.fastestDelivery}
        </div>

        <a
          className="amazon-yellow-btn"
          href={amazonSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.addToCart}
        </a>
      </div>
    </div>
  );
}

function ProductsTab({ token, t }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRecommendations(token)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 24 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card" style={{ height: 420, borderRadius: 16 }}>
          <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
        </div>
      ))}
    </div>
  );

  if (error) return <div className="error-banner">{error}</div>;
  if (!data) return null;

  const products = data.products || [];
  const based = data.based_on;

  return (
    <div className="section-reveal">
      <div style={{ marginBottom: 24 }}>
        <h2 className="section-title">{t.productsTitle}</h2>
        <p className="section-sub">{t.productsSub}</p>

        {based && (Object.keys(based.weighted_concerns || {}).length > 0 || based.skin_type) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {based.skin_type && (
              <span className="tag tag--emerald">Skin type: {based.skin_type}</span>
            )}
            {Object.entries(based.weighted_concerns || {})
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([c]) => (
                <span className="tag tag--rose" key={c}>Targeting: {translateConcern(c)}</span>
              ))}
          </div>
        )}
      </div>

      <div className="amazon-grid">
        {products.map((p, i) => (
          <AmazonProductCard key={p.id || i} product={p} t={t} />
        ))}
      </div>
    </div>
  );
}



// ── Dataset RAG AI Skincare Advisor Widget ─────────────────────────────
// ── Dataset RAG AI Skincare Advisor Widget ─────────────────────────────
function RAGSkincareAdvisor({ t, userConcern, userSkinType, profile, lang = "en" }) {
  const [open, setOpen] = useState(false);

  const scanAnalysis = profile ? {
    concern_scores: profile.concern_scores,
    skin_health_score: profile.skin_health_score,
    detected_concern: profile.detected_concern || userConcern,
    detected_concern_confidence: profile.detected_concern_confidence,
    detected_skin_type: profile.detected_skin_type || userSkinType,
  } : null;

  const initialWelcome = "Hello! I am your DermaSense AI Skincare Advisor powered by Groq LLM & RAG. Connected to your AI photo scan output & product dataset! Ask me anything about your skin concerns, ingredient compatibility, custom routines, or general questions 🌿";

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: initialWelcome,
      source: "Groq LLM (llama-3.3-70b) + Dataset RAG Engine",
      products: []
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitQuestion(userText) {
    if (!userText || loading) return;
    const qText = userText.trim();
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { sender: "user", text: qText }]);

    try {
      const res = await queryRAGAdvisor({
        query: qText,
        userConcern: userConcern,
        userSkinType: userSkinType,
        scanAnalysis: scanAnalysis,
        lang: lang
      });

      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.answer || "No response generated.",
          source: res.rag_source || "Groq LLM + Dataset RAG Engine",
          products: res.retrieved_products || []
        }
      ]);
    } catch (err) {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `⚠️ RAG Error: ${err.message || "Could not fetch RAG response."}`,
          source: "Error",
          products: []
        }
      ]);
    }
  }

  function handleSend(e) {
    e.preventDefault();
    submitQuestion(input);
  }

  return (
    <>
      <button className="chatbot-trigger" onClick={() => setOpen(!open)}>
        {t.askSkinAI || "💬 DermaSense AI"}
      </button>

      {open && (
        <div className="chatbot-window card">
          <div className="chatbot-header">
            <div>
              <strong>{t.ragTitle || "✦ DermaSense AI Skincare Advisor"}</strong>
              <div style={{ fontSize: 11, opacity: 0.85 }}>
                ⚡ Groq LLM (llama-3.3-70b) RAG Engine Active
              </div>
            </div>
            <div>
              <button className="btn-ghost" style={{ padding: "3px 8px" }} onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
          </div>

          {/* Active AI Scan Connection Banner */}
          {profile && (
            <div style={{ padding: "6px 12px", background: "linear-gradient(90deg, #ecfdf5, #f0fdf4)", borderBottom: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
              <div style={{ color: "#166534", fontWeight: 600 }}>
                📊 Scan Connected: <strong>Health Score {profile.skin_health_score || 80}/100</strong>
              </div>
              <div style={{ color: "#15803d", fontSize: 10, fontStyle: "italic" }}>
                {profile.detected_concern || "General Care"}
              </div>
            </div>
          )}

          <div className="chatbot-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble ${m.sender}`}>
                <div style={{ whiteSpace: "pre-line" }}>{m.text}</div>
                {m.source && m.sender === "ai" && (
                  <div style={{ fontSize: 10, marginTop: 6, opacity: 0.75, fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: 4 }}>
                    Source: {m.source}
                  </div>
                )}
                {m.products && m.products.length > 0 && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>🛍️ Matched Skincare Products (from Dataset):</span>
                    {m.products.slice(0, 3).map((prod, pIdx) => {
                      const buyUrl = prod.purchase_url || `https://www.amazon.in/s?k=${encodeURIComponent(prod.name)}`;
                      return (
                        <a
                          key={pIdx}
                          href={buyUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 10px",
                            background: "linear-gradient(135deg, #faf7f2, #f5f0e8)",
                            borderRadius: 8,
                            border: "1px solid rgba(196,130,106,0.2)",
                            textDecoration: "none",
                            color: "var(--ink)"
                          }}
                        >
                          <div style={{ width: 34, height: 34, borderRadius: 6, background: "var(--rose-tint)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                            🧴
                          </div>
                          <div style={{ flex: 1, minWidth: 0, fontSize: 11.5 }}>
                            <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--ink)" }}>{prod.name}</div>
                            <div style={{ fontSize: 10.5, color: "#166534", fontWeight: 700, marginTop: 2 }}>
                              {prod.brand ? `${prod.brand} • ` : ""}₹{prod.price_inr || 999}
                            </div>
                          </div>
                          <span style={{ fontSize: 10.5, fontWeight: 700, background: "#f59e0b", color: "#fff", padding: "3px 7px", borderRadius: 6 }}>
                            Buy 🛒
                          </span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="chat-bubble ai">✦ RAG Vector Retrieval & Synthesis running…</div>}
          </div>

          {/* Quick RAG Question Chips */}
          <div style={{ padding: "6px 10px", display: "flex", gap: 6, overflowX: "auto", borderTop: "1px solid var(--border)", background: "var(--surface-md)" }}>
            {[
              "📊 Explain my scan scores & health score",
              "🧪 Can I mix Retinol with Niacinamide or Vit C?",
              "☀️ Design my custom AM & PM routine",
              "🌿 Best natural home remedies for my skin",
              "🚫 Ingredients I should avoid",
              "🥗 Diet & lifestyle habits for skin glow"
            ].map((chipText) => (
              <button
                key={chipText}
                type="button"
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 14,
                  border: "1px solid var(--border-hi)",
                  background: "var(--surface)",
                  color: "var(--ink-soft)",
                  whiteSpace: "nowrap",
                  cursor: "pointer"
                }}
                onClick={() => submitQuestion(chipText)}
              >
                {chipText}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="chatbot-input-row">
            <input
              type="text"
              placeholder={t.ragPlaceholder || "Ask any skincare question or doubt..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ width: "auto", padding: "8px 16px" }} disabled={loading}>
              {t.send || "Send"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// ── Main Dashboard Component ───────────────────────────────
export default function Dashboard({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [analysisKey, setAnalysisKey] = useState(0);

  // ── Photo State (Resets on site reload, stays active during in-memory tab switches!) ──
  const [scanPreview, setScanPreview] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  // ── English Language Reference ──
  const t = translations.en;
  const lang = "en";

  const loadProfile = useCallback(() => {
    return getMyProfile(token)
      .then((data) => setProfile(data))
      .catch((err) => {
        if (err?.message && (err.message.includes("Could not validate credentials") || err.message.includes("Unauthorized") || err.message.includes("401"))) {
          onLogout();
        }
      });
  }, [token, onLogout]);

  useEffect(() => {
    setLoading(true);
    loadProfile().finally(() => setLoading(false));
  }, [loadProfile]);

  function handleAnalyzed(result) {
    if (result?.concern?.top_concern || result?.skin_type?.top_type) {
      setProfile((prev) => ({
        ...(prev || {}),
        detected_concern: result.concern?.top_concern || prev?.detected_concern,
        detected_skin_type: result.skin_type?.top_type || prev?.detected_skin_type,
      }));
    }
    loadProfile();
    setAnalysisKey((k) => k + 1);
  }

  async function handleClearScan() {
    if (!window.confirm("Are you sure you want to clear your saved AI scan data? This will reset your score to Awaiting Scan.")) return;
    try {
      const updated = await clearScanData(token);
      setProfile(updated);
      setScanPreview(null);
      setScanResult(null);
      setAnalysisKey((k) => k + 1);
    } catch (err) {
      alert("Failed to clear scan data: " + err.message);
    }
  }

  const tabs = [
    { id: "profile",  label: t.profileTab },
    { id: "scan",     label: t.scanTab },
    { id: "planner",  label: t.plannerTab },
    { id: "products", label: t.productsTab },
  ];

  function handleLogout() {
    setScanPreview(null);
    setScanResult(null);
    try {
      sessionStorage.removeItem("saved_scan_preview");
      sessionStorage.removeItem("saved_scan_result");
    } catch (e) {}
    onLogout();
  }

  return (
    <div className="dash-shell">
      <div className="app-bg" />

      {/* Top Navigation Bar */}
      <div className="dash-topbar">
        <div className="dash-brand">
          <div className="dash-brand-icon">✦</div>
          {t.brand}
        </div>

        <div className="topbar-right">
          {profile?.skin_health_score != null && profile?.detected_concern && (
            <span className="tag tag--rose" style={{ fontSize: 12 }}>
              ⚡ {translateConcern(profile.detected_concern)}
            </span>
          )}
          <button className="btn-ghost" onClick={handleLogout}>{t.signOut}</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="section-tabs">
        {tabs.map((tItem) => (
          <button
            key={tItem.id}
            className={`tab-btn ${tab === tItem.id ? "active" : ""}`}
            onClick={() => setTab(tItem.id)}
          >
            {tItem.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="dash-content">
        {loading ? (
          <div className="loading-text">Loading your profile…</div>
        ) : (
          <>
            {tab === "profile" && (
              <ProfileTab
                token={token}
                profile={profile}
                onProfileSaved={setProfile}
                onGoToScan={() => setTab("scan")}
                onClearScan={handleClearScan}
                t={t}
                lang={lang}
              />
            )}

            {tab === "scan" && (
              <div className="section-reveal">
                <PhotoAnalysis
                  token={token}
                  onAnalyzed={handleAnalyzed}
                  preview={scanPreview}
                  setPreview={setScanPreview}
                  result={scanResult}
                  setResult={setScanResult}
                  lang={lang}
                />
              </div>
            )}

            {tab === "planner" && (
              <PlannerTab
                key={`planner-${analysisKey}-${lang}-${profile?.water_intake_liters}-${profile?.updated_at}`}
                token={token}
                t={t}
                lang={lang}
                profile={profile}
                onGoToScan={() => setTab("scan")}
              />
            )}

            {tab === "products" && (
              <ProductsTab key={`products-${analysisKey}-${lang}`} token={token} t={t} />
            )}
          </>
        )}
      </div>

      {/* Dataset RAG AI Skincare Advisor */}
      <RAGSkincareAdvisor
        t={t}
        userConcern={profile?.detected_concern}
        userSkinType={profile?.detected_skin_type}
        profile={profile}
      />
    </div>
  );
}