import { useEffect, useState } from "react";
import { getMyProfile, saveProfile } from "./api.js";
import PhotoAnalysis from "./PhotoAnalysis.jsx";
import "./photo-analysis.css";

const CIRCUMFERENCE = 2 * Math.PI * 74;

function ScoreRing({ score }) {
  const hasScore = typeof score === "number";
  const pct = hasScore ? score / 100 : 0;
  const offset = CIRCUMFERENCE * (1 - pct);

  return (
    <div className="score-ring">
      <svg width="168" height="168" viewBox="0 0 168 168">
        <circle cx="84" cy="84" r="74" fill="none" stroke="#eaeee6" strokeWidth="12" />
        {hasScore && (
          <circle
            cx="84"
            cy="84"
            r="74"
            fill="none"
            stroke="#b5687e"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      <div className="score-ring__value">
        {hasScore ? (
          <>
            <div className="score-ring__num">{score}</div>
            <div className="score-ring__label">out of 100</div>
          </>
        ) : (
          <div className="score-ring__label" style={{ maxWidth: 100 }}>
            Awaiting first score
          </div>
        )}
      </div>
    </div>
  );
}

const emptyForm = {
  skin_type: "",
  age_group: "",
  skin_concerns: "",
  allergies: "",
  sensitivities: "",
  sleep_quality: "",
  water_intake_liters: "",
};

export default function Dashboard({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function loadProfile() {
    return getMyProfile(token)
      .then((data) => {
        setProfile(data);
        if (!data) setEditing(true);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    setLoading(true);
    loadProfile().finally(() => setLoading(false));
  }, [token]);

  function toListInputValue(list) {
    return Array.isArray(list) ? list.join(", ") : "";
  }

  function openEdit() {
    setForm({
      skin_type: profile?.skin_type || "",
      age_group: profile?.age_group || "",
      skin_concerns: toListInputValue(profile?.skin_concerns),
      allergies: toListInputValue(profile?.allergies),
      sensitivities: toListInputValue(profile?.sensitivities),
      sleep_quality: profile?.sleep_quality || "",
      water_intake_liters: profile?.water_intake_liters ?? "",
    });
    setEditing(true);
  }

  function toList(str) {
    return str.split(",").map((s) => s.trim()).filter(Boolean);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        skin_type: form.skin_type || null,
        age_group: form.age_group || null,
        skin_concerns: toList(form.skin_concerns),
        allergies: toList(form.allergies),
        sensitivities: toList(form.sensitivities),
        sleep_quality: form.sleep_quality || null,
        water_intake_liters: form.water_intake_liters
          ? Number(form.water_intake_liters)
          : null,
      };
      const saved = await saveProfile(token, payload);
      setProfile(saved);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <div className="dash-brand">
          <span className="dash-brand__dot" />
          Skin Intelligence
        </div>
        <button className="btn-ghost" onClick={onLogout}>
          Log out
        </button>
      </div>

      {loading ? (
        <div className="loading-text">Loading your profile…</div>
      ) : (
        <div className="dash-grid">
          <div className="card score-card">
            <h3>Skin health score</h3>
            <ScoreRing score={profile?.skin_health_score ?? null} />
            <p className="score-pending">
              This fills in once the scoring engine analyzes your profile
              and photos.
            </p>
          </div>

          <div>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 className="section-title">Your skin profile</h2>
                  <p className="section-sub">
                    Self-reported details used to personalize your routine.
                  </p>
                </div>
                {!editing && (
                  <button className="btn-ghost" onClick={openEdit}>
                    {profile ? "Edit" : "Create profile"}
                  </button>
                )}
              </div>

              {error && <div className="error-banner">{error}</div>}

              {!editing && profile && (
                <>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Skin type (self-reported)</label>
                      <div>{profile.skin_type || "—"}</div>
                    </div>
                    <div className="detail-item">
                      <label>Age group</label>
                      <div>{profile.age_group || "—"}</div>
                    </div>
                    <div className="detail-item">
                      <label>Sleep quality</label>
                      <div>{profile.sleep_quality || "—"}</div>
                    </div>
                    <div className="detail-item">
                      <label>Water intake</label>
                      <div>
                        {profile.water_intake_liters
                          ? `${profile.water_intake_liters} L / day`
                          : "—"}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 22 }}>
                    <label style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-faint)" }}>
                      Skin concerns (self-reported)
                    </label>
                    <div className="tag-row">
                      {profile.skin_concerns?.length ? (
                        profile.skin_concerns.map((c) => (
                          <span className="tag" key={c}>{c}</span>
                        ))
                      ) : (
                        <span className="tag tag--pending">None listed</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <label style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-faint)" }}>
                      AI-detected (from photo analysis)
                    </label>
                    <div className="tag-row">
                      <span className={`tag ${!profile.detected_skin_type ? "tag--pending" : ""}`}>
                        {profile.detected_skin_type
                          ? `Skin type: ${profile.detected_skin_type}`
                          : "Skin type: pending"}
                      </span>
                      <span className={`tag ${!profile.detected_concern ? "tag--pending" : ""}`}>
                        {profile.detected_concern
                          ? `Concern: ${profile.detected_concern}`
                          : "Concern: pending"}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {editing && (
                <form className="form-card" onSubmit={handleSave}>
                  <div className="form-grid">
                    <div className="field">
                      <label>Skin type</label>
                      <select value={form.skin_type} onChange={(e) => setForm({ ...form, skin_type: e.target.value })}>
                        <option value="">Select…</option>
                        <option value="oily">Oily</option>
                        <option value="dry">Dry</option>
                        <option value="normal">Normal</option>
                        <option value="combination">Combination</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Age group</label>
                      <input type="text" placeholder="e.g. 20-25" value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value })} />
                    </div>
                    <div className="field field--full">
                      <label>Skin concerns (comma-separated)</label>
                      <input type="text" placeholder="acne, dark_spots, redness" value={form.skin_concerns} onChange={(e) => setForm({ ...form, skin_concerns: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Allergies</label>
                      <input type="text" placeholder="fragrance, nuts" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Sensitivities</label>
                      <input type="text" placeholder="alcohol, sulfates" value={form.sensitivities} onChange={(e) => setForm({ ...form, sensitivities: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Sleep quality</label>
                      <select value={form.sleep_quality} onChange={(e) => setForm({ ...form, sleep_quality: e.target.value })}>
                        <option value="">Select…</option>
                        <option value="poor">Poor</option>
                        <option value="average">Average</option>
                        <option value="good">Good</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Water intake (liters/day)</label>
                      <input type="number" step="0.1" placeholder="2" value={form.water_intake_liters} onChange={(e) => setForm({ ...form, water_intake_liters: e.target.value })} />
                    </div>
                  </div>

                  <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                    <button className="btn-primary" type="submit" style={{ width: "auto", padding: "12px 24px" }} disabled={saving}>
                      {saving ? "Saving…" : "Save profile"}
                    </button>
                    {profile && (
                      <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            <PhotoAnalysis token={token} onAnalyzed={loadProfile} />
          </div>
        </div>
      )}
    </div>
  );
}