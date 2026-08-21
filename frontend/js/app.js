// ===================== CONSTANTS ===================== //
const CONCERN_OPTIONS = ["acne", "hyperpigmentation", "dark_spots", "wrinkles", "fine_lines",
  "redness", "uneven_skin_tone", "enlarged_pores", "dry_skin", "oily_skin", "sensitive_skin",
  "dull_skin", "sun_damage"];
const ALLERGY_OPTIONS = ["Fragrance", "Retinol", "Salicylic Acid", "Benzoyl Peroxide", "Vitamin C"];
const LIFESTYLE_OPTIONS = ["smoking", "high_stress", "poor_diet", "alcohol", "no_sunscreen",
  "exercise", "balanced_diet", "low_stress", "non_smoker", "daily_sunscreen"];
const SKIN_TYPES = ["normal", "dry", "oily", "combination", "sensitive"];
const AGE_GROUPS = ["teen", "20s", "30s", "40s", "50+"];
const PRODUCT_CATEGORIES = ["Face Wash", "Toner", "Serum", "Treatment", "Moisturizer", "Sunscreen", "Face Masks"];

const NAV_ICONS = {
  dashboard: `<circle cx="4" cy="4" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="12" r="2"/>`,
  profile: `<circle cx="8" cy="5.5" r="3"/><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/>`,
  assessment: `<path d="M8 1.5l2 4 4.5.6-3.3 3.1.8 4.4L8 11.5l-4 2.1.8-4.4L1.5 6.1 6 5.5z"/>`,
  routine: `<path d="M2 8a6 6 0 1 1 2 4.5"/><path d="M2 12v-3h3"/><path d="M8 5v3l2 1.5"/>`,
  ingredients: `<path d="M6 2h4v3.5L12.5 12a2 2 0 0 1-1.8 2.8H5.3A2 2 0 0 1 3.5 12L6 5.5V2z"/><path d="M5 9h6"/>`,
  products: `<path d="M3 5l1-2h8l1 2"/><rect x="2.5" y="5" width="11" height="9" rx="1"/><path d="M6 8a2 2 0 0 0 4 0"/>`,
  progress: `<path d="M2 13.5V9l3.5-3 3 2.5L14 3"/><path d="M10.5 3H14v3.5"/>`,
  notifications: `<path d="M8 2a3 3 0 0 0-3 3v2.5c0 .8-.3 1.5-.9 2.1L3 11h10l-1.1-1.4c-.6-.6-.9-1.3-.9-2.1V5a3 3 0 0 0-3-3z"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0"/>`,
  reports: `<path d="M4 1.5h5l3 3v10H4z"/><path d="M9 1.5V5h3"/><path d="M6 8.5h4M6 11h4"/>`,
  clients: `<circle cx="5.5" cy="5" r="2.3"/><circle cx="11" cy="6" r="1.8"/><path d="M1.5 13c0-2.3 1.8-4 4-4s4 1.7 4 4"/><path d="M9.5 9.5c1.7.1 3 1.5 3 3.5"/>`,
  "admin-dashboard": `<path d="M8 1.5l5 2.2v3.6c0 3.5-2.1 6-5 7.2-2.9-1.2-5-3.7-5-7.2V3.7z"/><path d="M5.8 8l1.5 1.5 3-3"/>`,
  "admin-users": `<circle cx="5" cy="5" r="2"/><circle cx="11" cy="5" r="2"/><path d="M1.5 13c0-2.2 1.6-3.8 3.5-3.8s3.5 1.6 3.5 3.8"/><path d="M9 9.3c1.8.2 3 1.7 3 3.7"/>`,
};
function navIcon(id) {
  return `<svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${NAV_ICONS[id] || ""}</svg>`;
}

const NAV_BY_ROLE = {
  user: [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "profile", label: "My Profile", icon: "profile" },
    { id: "assessment", label: "Assessment", icon: "assessment" },
    { id: "routine", label: "Routine", icon: "routine" },
    { id: "ingredients", label: "Ingredients", icon: "ingredients" },
    { id: "products", label: "Products", icon: "products" },
    { id: "progress", label: "Progress", icon: "progress" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "reports", label: "Reports", icon: "reports" },
  ],
  consultant: [
    { id: "clients", label: "Clients", icon: "clients" },
    { id: "ingredients", label: "Ingredient Reference", icon: "ingredients" },
    { id: "products", label: "Product Catalog", icon: "products" },
  ],
  dermatologist: [
    { id: "clients", label: "Patients", icon: "clients" },
    { id: "ingredients", label: "Ingredient Reference", icon: "ingredients" },
    { id: "products", label: "Product Catalog", icon: "products" },
  ],
  admin: [
    { id: "admin-dashboard", label: "Platform Overview", icon: "admin" },
    { id: "admin-users", label: "All Users", icon: "clients" },
  ],
};

// Minimal hand-drawn stroke icons - no external icon library dependency.
const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="4.5" rx="1.5"/><rect x="14" y="9.5" width="7" height="11.5" rx="1.5"/><rect x="3" y="12" width="7" height="9" rx="1.5"/>',
  profile: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c0-3.6 3.6-5.8 7.5-5.8s7.5 2.2 7.5 5.8"/>',
  assessment: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8"/><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20H8"/><path d="M20 8V5.5A1.5 1.5 0 0 0 18.5 4H16"/><path d="M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16"/><circle cx="12" cy="12" r="2.8"/>',
  routine: '<rect x="4" y="4" width="16" height="16" rx="2"/><polyline points="8 12.5 10.7 15 16 9"/>',
  ingredients: '<path d="M12 3c3.8 4.7 5.6 7.6 5.6 10.3a5.6 5.6 0 1 1-11.2 0C6.4 10.6 8.2 7.7 12 3z"/>',
  products: '<path d="M6.2 8h11.6l-1 12.2H7.2L6.2 8z"/><path d="M9 8V6.2a3 3 0 0 1 6 0V8"/>',
  progress: '<polyline points="4 16 9.5 10.2 13 13.5 20 6"/><polyline points="14.5 6 20 6 20 11.3"/>',
  notifications: '<path d="M6 10a6 6 0 0 1 12 0c0 4.6 1.8 5.8 1.8 5.8H4.2S6 14.6 6 10z"/><path d="M10 19.8a2 2 0 0 0 4 0"/>',
  reports: '<path d="M6.5 3h8L19 7.5V21h-12.5V3z"/><path d="M14.5 3v4.5H19"/><line x1="9" y1="13" x2="16" y2="13"/><line x1="9" y1="16.5" x2="16" y2="16.5"/>',
  clients: '<circle cx="8.7" cy="8.2" r="3"/><path d="M3 20c0-3.2 2.8-5.2 5.7-5.2s5.7 2 5.7 5.2"/><circle cx="16.8" cy="9" r="2.3"/><path d="M14.8 13c2.4 0 5 1.4 5 4.6"/>',
  admin: '<line x1="5" y1="20" x2="5" y2="12.5"/><line x1="12" y1="20" x2="12" y2="6"/><line x1="19" y1="20" x2="19" y2="15.5"/>',
};
function iconSvg(name, cls = "nav-icon") {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}

let state = {
  profile: null,
  currentView: null,
  clientDetailId: null,
};

// ===================== UTIL ===================== //
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function titleCase(s) { return (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }
function formatDate(d) { return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }
function formatDateTime(d) { return new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
function notice(type, text) { return `<div class="notice notice-${type}">${escapeHtml(text)}</div>`; }
function setContent(html) { document.getElementById("view-content").innerHTML = html; }

// ===================== AUTH SCREEN ===================== //
function initAuthScreen() {
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const isLogin = tab.dataset.tab === "login";
      document.getElementById("login-form").classList.toggle("hidden", !isLogin);
      document.getElementById("register-form").classList.toggle("hidden", isLogin);
    });
  });

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("login-error");
    errEl.textContent = "";
    try {
      const user = await API.post("/api/auth/login", {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value,
      });
      API.setSession(user);
      await bootApp();
    } catch (err) {
      errEl.textContent = err.message;
    }
  });

  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("register-error");
    errEl.textContent = "";
    try {
      const user = await API.post("/api/auth/register", {
        full_name: document.getElementById("register-name").value,
        email: document.getElementById("register-email").value,
        password: document.getElementById("register-password").value,
        role: document.getElementById("register-role").value,
      });
      API.setSession(user);
      await bootApp();
    } catch (err) {
      errEl.textContent = err.message;
    }
  });
}

// ===================== APP SHELL / NAV ===================== //
function renderApp() {
  const loggedIn = !!API.currentUser;
  document.getElementById("auth-screen").classList.toggle("hidden", loggedIn);
  document.getElementById("app-shell").classList.toggle("hidden", !loggedIn);
  if (loggedIn) buildSidebar();
}

function buildSidebar() {
  const user = API.currentUser;
  document.getElementById("sidebar-user-name").textContent = user.full_name || user.email;
  document.getElementById("sidebar-user-role").textContent = user.role;

  const items = NAV_BY_ROLE[user.role] || NAV_BY_ROLE.user;
  const nav = document.getElementById("sidebar-nav");
  nav.innerHTML = items.map((item) =>
    `<button class="nav-item" data-view="${item.id}">${navIcon(item.id)}<span>${escapeHtml(item.label)}</span></button>`
  ).join("");
  nav.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.view));
  });

  if (!state.currentView || !items.find((i) => i.id === state.currentView)) {
    navigateTo(items[0].id);
  } else {
    navigateTo(state.currentView);
  }
}

async function navigateTo(viewId, params = {}) {
  state.currentView = viewId;
  document.querySelectorAll(".nav-item").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === viewId));
  setContent(`<div class="empty-state"><span class="spinner"></span></div>`);
  try {
    const renderers = {
      dashboard: viewDashboardUser, profile: viewProfile, assessment: viewAssessment,
      routine: viewRoutine, ingredients: viewIngredients, products: viewProducts,
      progress: viewProgress, notifications: viewNotifications, reports: viewReports,
      clients: viewClients, "client-detail": () => viewClientDetail(params.clientId),
      "admin-dashboard": viewAdminDashboard, "admin-users": viewAdminUsers,
    };
    const fn = renderers[viewId];
    if (fn) await fn();
    else setContent(notice("error", "View not found."));
  } catch (err) {
    setContent(notice("error", err.message || "Something went wrong loading this page."));
  }
}

document.getElementById("logout-btn").addEventListener("click", () => {
  API.clearSession();
  state = { profile: null, currentView: null, clientDetailId: null };
  renderApp();
});

async function bootApp() {
  renderApp();
}

// ===================== DASHBOARD (user) ===================== //
async function viewDashboardUser() {
  const d = await API.get("/api/dashboard/user");
  const hasScore = d.latest_score !== null && d.latest_score !== undefined;
  const pct = hasScore ? Math.round(d.latest_score) : 0;

  setContent(`
    <div class="view-header">
      <h2>Welcome back, ${escapeHtml((d.full_name || "").split(" ")[0] || "there")}</h2>
      <p>Here's where your skin health stands today.</p>
    </div>

    <div class="card">
      ${hasScore ? `
        <div class="score-ring-wrap">
          <div class="score-ring" style="--pct:${pct}">
            <div class="score-ring-inner">
              <div class="score-ring-value">${pct}</div>
              <div class="score-ring-label">/ 100</div>
            </div>
          </div>
          <div class="score-breakdown">
            ${scoreBarRow("Condition", d.score_breakdown.condition, 35)}
            ${scoreBarRow("Lifestyle", d.score_breakdown.lifestyle, 20)}
            ${scoreBarRow("Sleep", d.score_breakdown.sleep, 15)}
            ${scoreBarRow("Routine", d.score_breakdown.routine, 20)}
            ${scoreBarRow("Hydration", d.score_breakdown.hydration, 10)}
          </div>
        </div>
      ` : `
        <div class="empty-state">
          <h4>No assessment yet</h4>
          <p>Run your first skin assessment to see your Skin Health Score.</p>
          <button class="btn btn-primary mt-16" onclick="navigateTo('assessment')">Run assessment</button>
        </div>
      `}
    </div>

    <div class="grid-3 mt-16">
      <div class="stat-card">
        <div class="stat-label">Skin type</div>
        <div class="stat-value" style="font-size:20px;">${escapeHtml(titleCase(d.skin_type) || "Not set")}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active routines</div>
        <div class="stat-value">${d.active_routines}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Unread alerts</div>
        <div class="stat-value">${d.unread_notifications}</div>
      </div>
    </div>
  `);
}

function scoreBarRow(label, value, weight) {
  return `
    <div class="score-bar-row">
      <span>${label} <span class="text-soft">(${weight}%)</span></span>
      <div class="score-bar-track"><div class="score-bar-fill" style="width:${value}%"></div></div>
      <span class="score-bar-value">${value}</span>
    </div>`;
}

// ===================== PROFILE ===================== //
async function viewProfile() {
  const p = await API.get("/api/profile");
  state.profile = p;

  setContent(`
    <div class="view-header"><h2>My Skin Profile</h2><p>This drives your assessment, routine, and product recommendations.</p></div>
    <form id="profile-form" class="card">
      <div class="form-grid">
        <div class="form-field">
          <label>Skin type</label>
          <select id="pf-skin-type">
            <option value="">Not sure - let assessment decide</option>
            ${SKIN_TYPES.map((t) => `<option value="${t}" ${p.skin_type === t ? "selected" : ""}>${titleCase(t)}</option>`).join("")}
          </select>
        </div>
        <div class="form-field">
          <label>Age group</label>
          <select id="pf-age-group">
            <option value="">Select</option>
            ${AGE_GROUPS.map((a) => `<option value="${a}" ${p.age_group === a ? "selected" : ""}>${a}</option>`).join("")}
          </select>
        </div>
        <div class="form-field">
          <label>Sleep hours / night</label>
          <input type="number" id="pf-sleep-hours" step="0.5" min="0" max="14" value="${p.sleep_hours}">
        </div>
        <div class="form-field">
          <label>Sleep quality (1-10 self-rated)</label>
          <input type="number" id="pf-sleep-quality" min="1" max="10" value="${p.sleep_quality}">
        </div>
        <div class="form-field">
          <label>Water intake (liters/day)</label>
          <input type="number" id="pf-water" step="0.1" min="0" max="8" value="${p.water_intake_liters}">
        </div>
        <div class="form-field">
          <label>Environmental exposure (sun/pollution)</label>
          <select id="pf-exposure">
            ${["low", "moderate", "high"].map((v) => `<option value="${v}" ${p.environmental_exposure === v ? "selected" : ""}>${titleCase(v)}</option>`).join("")}
          </select>
        </div>
        <div class="form-field">
          <label>Budget preference</label>
          <select id="pf-budget">
            ${["low", "mid", "high"].map((v) => `<option value="${v}" ${p.budget_preference === v ? "selected" : ""}>${titleCase(v)}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="form-field full mt-16">
        <label>Skin concerns</label>
        <div class="checkbox-grid" id="pf-concerns">
          ${CONCERN_OPTIONS.map((c) => chip(c, p.concerns.includes(c), "concern")).join("")}
        </div>
      </div>
      <div class="form-field full mt-16">
        <label>Known allergies</label>
        <div class="checkbox-grid" id="pf-allergies">
          ${ALLERGY_OPTIONS.map((c) => chip(c, p.allergies.includes(c), "allergy")).join("")}
        </div>
      </div>
      <div class="form-field full mt-16">
        <label>Lifestyle habits</label>
        <div class="checkbox-grid" id="pf-lifestyle">
          ${LIFESTYLE_OPTIONS.map((c) => chip(c, p.lifestyle_habits.includes(c), "lifestyle")).join("")}
        </div>
      </div>

      <div id="profile-msg"></div>
      <button type="submit" class="btn btn-primary mt-16">Save profile</button>
    </form>
  `);

  document.querySelectorAll(".chip-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const isAllergy = btn.dataset.kind === "allergy";
      if (isAllergy) btn.classList.toggle("allergy-selected");
      else btn.classList.toggle("selected");
    });
  });

  document.getElementById("profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("profile-msg");
    msgEl.innerHTML = "";
    const payload = {
      skin_type: document.getElementById("pf-skin-type").value || null,
      age_group: document.getElementById("pf-age-group").value || null,
      sleep_hours: parseFloat(document.getElementById("pf-sleep-hours").value),
      sleep_quality: parseInt(document.getElementById("pf-sleep-quality").value),
      water_intake_liters: parseFloat(document.getElementById("pf-water").value),
      environmental_exposure: document.getElementById("pf-exposure").value,
      budget_preference: document.getElementById("pf-budget").value,
      concerns: selectedChips("pf-concerns"),
      allergies: selectedChips("pf-allergies"),
      sensitivities: [],
      lifestyle_habits: selectedChips("pf-lifestyle"),
    };
    try {
      await API.put("/api/profile", payload);
      msgEl.innerHTML = notice("success", "Profile saved.");
    } catch (err) {
      msgEl.innerHTML = notice("error", err.message);
    }
  });
}
function chip(value, selected, kind) {
  const cls = kind === "allergy" ? (selected ? "chip-toggle allergy-selected" : "chip-toggle") : (selected ? "chip-toggle selected" : "chip-toggle");
  return `<button type="button" class="${cls}" data-kind="${kind}" data-value="${escapeHtml(value)}">${escapeHtml(titleCase(value))}</button>`;
}
function selectedChips(containerId) {
  return Array.from(document.getElementById(containerId).querySelectorAll(".selected, .allergy-selected"))
    .map((el) => el.dataset.value);
}

// ===================== ASSESSMENT ===================== //
async function viewAssessment() {
  const history = await API.get("/api/assessment/history");
  const latest = history[0];

  setContent(`
    <div class="view-header"><h2>Skin Assessment</h2><p>Runs your skin-type prediction and condition scoring against your saved profile.</p></div>

    <div class="card">
      <h3>Run a new assessment</h3>
      <p class="text-soft">Optionally upload a clear, well-lit face photo to use the trained skin-type model. Without a photo, a profile-based estimate is used instead.</p>
      <form id="assessment-form" class="mt-16">
        <input type="file" id="assessment-image" accept="image/*">
        <div id="assessment-msg" class="mt-16"></div>
        <button type="submit" class="btn btn-primary mt-16" id="assessment-submit">Run assessment</button>
      </form>
    </div>

    ${latest ? `
      <div class="card">
        <h3>Latest result — ${formatDateTime(latest.created_at)}</h3>
        <p><strong>Predicted skin type:</strong> ${titleCase(latest.predicted_skin_type)} (${Math.round(latest.predicted_confidence * 100)}% confidence)</p>
        <p class="mt-16"><strong>Condition score:</strong> ${latest.condition_score} / 100</p>
        ${latest.concerns_detected.length ? `<div class="tag-row mt-16">${latest.concerns_detected.map((c) => `<span class="tag">${titleCase(c)}</span>`).join("")}</div>` : ""}
        ${latest.risk_flags.length ? `<div class="mt-16">${latest.risk_flags.map((f) => `<div class="risk-flag">${escapeHtml(f)}</div>`).join("")}</div>` : ""}
      </div>
    ` : ""}

    <div class="card">
      <h3>History</h3>
      ${history.length ? `
        <table>
          <thead><tr><th>Date</th><th>Skin type</th><th>Condition score</th><th>Concerns</th></tr></thead>
          <tbody>
            ${history.map((h) => `<tr>
              <td>${formatDate(h.created_at)}</td>
              <td>${titleCase(h.predicted_skin_type)}</td>
              <td>${h.condition_score}</td>
              <td>${h.concerns_detected.map(titleCase).join(", ") || "—"}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      ` : `<div class="empty-state"><p>No assessments yet.</p></div>`}
    </div>
  `);

  document.getElementById("assessment-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("assessment-submit");
    const msgEl = document.getElementById("assessment-msg");
    const fileInput = document.getElementById("assessment-image");
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Running...`;
    try {
      const fd = new FormData();
      if (fileInput.files[0]) fd.append("image", fileInput.files[0]);
      await API.postForm("/api/assessment/run", fd);
      await viewAssessment();
    } catch (err) {
      msgEl.innerHTML = notice("error", err.message);
      btn.disabled = false; btn.textContent = "Run assessment";
    }
  });
}

// ===================== ROUTINE ===================== //
async function viewRoutine() {
  const current = await API.get("/api/routine/current");
  const morning = current.find((r) => r.period === "morning");
  const evening = current.find((r) => r.period === "evening");

  setContent(`
    <div class="view-header">
      <div class="flex-between">
        <div><h2>Personalized Routine</h2><p>Generated from your skin profile - concerns, allergies, and interactions are accounted for.</p></div>
        <button class="btn btn-primary" id="regen-btn">Generate new routine</button>
      </div>
    </div>
    <div id="routine-msg"></div>

    <div class="grid-2">
      <div class="card">
        <div class="flex-between"><h3>Morning</h3>${morning ? `<button class="btn btn-ghost btn-sm" onclick="logRoutine('morning')">Mark done today</button>` : ""}</div>
        ${morning ? renderRoutineSteps(morning.steps) : `<p class="text-soft">Not generated yet.</p>`}
      </div>
      <div class="card">
        <div class="flex-between"><h3>Evening</h3>${evening ? `<button class="btn btn-ghost btn-sm" onclick="logRoutine('evening')">Mark done today</button>` : ""}</div>
        ${evening ? renderRoutineSteps(evening.steps) : `<p class="text-soft">Not generated yet.</p>`}
      </div>
    </div>
  `);

  document.getElementById("regen-btn").addEventListener("click", async () => {
    const msgEl = document.getElementById("routine-msg");
    try {
      const result = await API.post("/api/routine/generate", {});
      msgEl.innerHTML = notice("success", "New routine generated.");
      await viewRoutine();
      if (result.weekly && result.weekly.length) {
        renderWeeklyBanner(result.weekly);
      }
    } catch (err) {
      msgEl.innerHTML = notice("error", err.message);
    }
  });
}
function renderRoutineSteps(steps) {
  return `<div class="routine-steps">${steps.map((s) => `
    <div class="routine-step">
      <div class="routine-step-num">${s.order}</div>
      <div class="routine-step-body">
        <strong>${escapeHtml(s.step)}${s.suggested_ingredient ? ` — ${escapeHtml(s.suggested_ingredient)}` : ""}</strong>
        <span>${escapeHtml(s.reason)}</span>
      </div>
    </div>`).join("")}</div>`;
}
function renderWeeklyBanner(weekly) {
  const content = document.getElementById("view-content");
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `<h3>Weekly treatments</h3>` + weekly.map((w) =>
    `<p style="margin-bottom:6px;"><strong>${escapeHtml(w.day)}:</strong> ${escapeHtml(w.treatment)} <span class="text-soft">— ${escapeHtml(w.reason)}</span></p>`
  ).join("");
  content.appendChild(div);
}
async function logRoutine(period) {
  try {
    await API.post(`/api/routine/log/${period}`, {});
    document.getElementById("routine-msg").innerHTML = notice("success", `Logged ${period} routine for today.`);
  } catch (err) {
    document.getElementById("routine-msg").innerHTML = notice("error", err.message);
  }
}

// ===================== INGREDIENTS ===================== //
async function viewIngredients() {
  const suitable = API.currentUser.role === "user" ? await API.get("/api/ingredients/suitable") : await API.get("/api/ingredients");

  setContent(`
    <div class="view-header"><h2>Ingredient Intelligence</h2><p>${API.currentUser.role === "user" ? "Ingredients matched to your skin type and concerns." : "Full ingredient reference."}</p></div>

    <div class="card">
      <h3>Check ingredient interactions</h3>
      <p class="text-soft">Select ingredients to check whether they're safe to layer together.</p>
      <div class="checkbox-grid mt-16" id="interaction-picker">
        ${suitable.map((i) => `<button type="button" class="chip-toggle" data-value="${escapeHtml(i.name)}">${escapeHtml(i.name)}</button>`).join("")}
      </div>
      <button class="btn btn-secondary mt-16" id="check-interactions-btn">Check interactions</button>
      <div id="interaction-result" class="mt-16"></div>
    </div>

    <div class="card">
      <h3>${API.currentUser.role === "user" ? "Suitable for you" : "All ingredients"}</h3>
      ${suitable.map((i) => `
        <div class="product-card">
          <div>
            <div class="product-name">${escapeHtml(i.name)} <span class="text-soft">— ${escapeHtml(i.category || "")}</span></div>
            <div class="product-meta">${escapeHtml(i.description || "")}</div>
            <div class="tag-row">
              ${i.concerns_treated.map((c) => `<span class="tag">${titleCase(c)}</span>`).join("")}
              ${i.common_allergen ? `<span class="tag" style="background:var(--accent-coral-tint);color:var(--accent-coral);">Common allergen</span>` : ""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `);

  document.querySelectorAll("#interaction-picker .chip-toggle").forEach((btn) => {
    btn.addEventListener("click", () => btn.classList.toggle("selected"));
  });
  document.getElementById("check-interactions-btn").addEventListener("click", async () => {
    const names = selectedChips("interaction-picker");
    const resultEl = document.getElementById("interaction-result");
    if (names.length < 2) { resultEl.innerHTML = notice("warn", "Select at least 2 ingredients."); return; }
    try {
      const result = await API.post("/api/ingredients/check-interactions", { ingredient_names: names });
      if (result.safe_to_combine) {
        resultEl.innerHTML = notice("success", "No known conflicts - safe to combine.");
      } else {
        resultEl.innerHTML = result.conflicts.map((c) => `<div class="conflict-flag">${escapeHtml(c.note)}</div>`).join("");
      }
    } catch (err) {
      resultEl.innerHTML = notice("error", err.message);
    }
  });
}

// ===================== PRODUCTS ===================== //
async function viewProducts(activeCategory = null) {
  const isUser = API.currentUser.role === "user";
  const recs = isUser ? await API.get("/api/products/recommendations") : [];
  const all = activeCategory ? await API.get(`/api/products?category=${encodeURIComponent(activeCategory)}`) : await API.get("/api/products");

  setContent(`
    <div class="view-header"><h2>Products</h2><p>${isUser ? "Recommended for your profile, plus the full catalog." : "Full product catalog."}</p></div>

    ${isUser ? `
      <div class="card">
        <h3>Recommended for you</h3>
        ${recs.length ? recs.map(productCard).join("") : `<p class="text-soft">Set your skin profile to get personalized recommendations.</p>`}
      </div>
    ` : ""}

    <div class="card">
      <h3>Browse catalog</h3>
      <div class="filter-row">
        <button class="filter-pill ${!activeCategory ? "active" : ""}" data-cat="">All</button>
        ${PRODUCT_CATEGORIES.map((c) => `<button class="filter-pill ${activeCategory === c ? "active" : ""}" data-cat="${c}">${c}</button>`).join("")}
      </div>
      ${all.slice(0, 30).map(productCard).join("")}
      ${all.length > 30 ? `<p class="text-soft mt-16">Showing 30 of ${all.length}. Filter by category to narrow down.</p>` : ""}
    </div>
  `);

  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => viewProducts(btn.dataset.cat || null));
  });
}
function productCard(p) {
  return `
    <div class="product-card">
      <div>
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-meta">${escapeHtml(p.brand || "")} · ${escapeHtml(p.category)}</div>
        <div class="tag-row">
          ${(p.suitable_concerns || []).slice(0, 3).map((c) => `<span class="tag">${titleCase(c)}</span>`).join("")}
          ${p.suitability_score !== undefined ? `<span class="tag" style="background:var(--primary-tint);color:var(--primary-dark);">Match ${Math.round(p.suitability_score)}%</span>` : ""}
        </div>
      </div>
      <div class="product-price">$${p.price.toFixed(2)}</div>
    </div>`;
}

// ===================== PROGRESS ===================== //
async function viewProgress() {
  const trend = await API.get("/api/progress/trend");
  const scores = await API.get("/api/progress/scores");

  const maxScore = Math.max(100, ...scores.map((s) => s.overall_score));
  const chartHtml = scores.length ? `
    <div style="display:flex; align-items:flex-end; gap:6px; height:140px; padding-top:10px;">
      ${scores.slice(-14).map((s) => `
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:6px;">
          <div style="width:100%; background:var(--primary); border-radius:3px 3px 0 0; height:${(s.overall_score / maxScore) * 120}px;" title="${s.overall_score}"></div>
        </div>`).join("")}
    </div>
  ` : `<div class="empty-state"><p>No score history yet - run an assessment first.</p></div>`;

  setContent(`
    <div class="view-header"><h2>Progress Tracking</h2><p>Skin Health Score over time.</p></div>

    <div class="grid-3">
      <div class="stat-card">
        <div class="stat-label">Latest score</div>
        <div class="stat-value">${trend.latest_score ?? "—"}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Trend</div>
        <div class="stat-value" style="font-size:18px; text-transform:capitalize;">${trend.trend.replace(/_/g, " ")}</div>
        <div class="stat-sub">${trend.change > 0 ? "+" : ""}${trend.change ?? 0} pts since first assessment</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">First score</div>
        <div class="stat-value">${trend.first_score ?? "—"}</div>
      </div>
    </div>

    <div class="card mt-16">
      <h3>Score history (last 14 assessments)</h3>
      ${chartHtml}
    </div>

    <div class="card">
      <h3>Add a progress note</h3>
      <form id="note-form" style="display:flex; gap:10px;">
        <input type="text" id="note-text" placeholder="e.g. Skin feels less oily this week" style="flex:1; padding:9px 11px; border:1px solid var(--border); border-radius:6px;">
        <button class="btn btn-secondary" type="submit">Add note</button>
      </form>
      <div id="note-msg" class="mt-16"></div>
    </div>
  `);

  document.getElementById("note-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("note-text");
    try {
      await API.post("/api/progress/notes", { note: input.value });
      document.getElementById("note-msg").innerHTML = notice("success", "Note added.");
      input.value = "";
    } catch (err) {
      document.getElementById("note-msg").innerHTML = notice("error", err.message);
    }
  });
}

// ===================== NOTIFICATIONS ===================== //
async function viewNotifications() {
  const list = await API.get("/api/notifications");
  setContent(`
    <div class="view-header">
      <div class="flex-between">
        <div><h2>Notifications</h2><p>Routine reminders and skin-health alerts.</p></div>
        <button class="btn btn-secondary" id="gen-reminders-btn">Generate reminders</button>
      </div>
    </div>
    <div id="notif-msg"></div>
    <div class="card">
      ${list.length ? list.map((n) => `
        <div class="notif-item ${n.is_read ? "read" : ""}" data-id="${n.id}">
          <div class="notif-dot"></div>
          <div style="flex:1;">
            <div class="notif-text">${escapeHtml(n.message)}</div>
            <div class="notif-time">${formatDateTime(n.created_at)} · ${titleCase(n.type)}</div>
          </div>
          ${!n.is_read ? `<button class="btn btn-ghost btn-sm mark-read-btn" data-id="${n.id}">Mark read</button>` : ""}
        </div>
      `).join("") : `<div class="empty-state"><h4>No notifications yet</h4><p>Generate reminders based on your current profile.</p></div>`}
    </div>
  `);

  document.getElementById("gen-reminders-btn").addEventListener("click", async () => {
    try {
      await API.post("/api/notifications/generate-reminders", {});
      await viewNotifications();
    } catch (err) {
      document.getElementById("notif-msg").innerHTML = notice("error", err.message);
    }
  });
  document.querySelectorAll(".mark-read-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await API.post(`/api/notifications/${btn.dataset.id}/read`, {});
      await viewNotifications();
    });
  });
}

// ===================== REPORTS ===================== //
async function viewReports() {
  setContent(`
    <div class="view-header"><h2>Reports &amp; Export</h2><p>Download your skin health data.</p></div>
    <div class="grid-2">
      <div class="card">
        <h3>Skin Health Report (PDF)</h3>
        <p class="text-soft">Profile, latest score breakdown, risk flags, and active routine.</p>
        <button class="btn btn-primary mt-16" id="pdf-btn">Download PDF</button>
      </div>
      <div class="card">
        <h3>Progress Data (Excel)</h3>
        <p class="text-soft">Full score history as a spreadsheet.</p>
        <button class="btn btn-primary mt-16" id="excel-btn">Download Excel</button>
      </div>
    </div>
    <div id="report-msg" class="mt-16"></div>
  `);
  document.getElementById("pdf-btn").addEventListener("click", async () => {
    try { await API.download("/api/reports/pdf", "skin_health_report.pdf"); }
    catch (err) { document.getElementById("report-msg").innerHTML = notice("error", err.message); }
  });
  document.getElementById("excel-btn").addEventListener("click", async () => {
    try { await API.download("/api/reports/excel", "skin_progress_report.xlsx"); }
    catch (err) { document.getElementById("report-msg").innerHTML = notice("error", err.message); }
  });
}

// ===================== CONSULTANT / DERMATOLOGIST ===================== //
async function viewClients() {
  const clients = await API.get("/api/dashboard/consultant/clients");
  setContent(`
    <div class="view-header"><h2>${API.currentUser.role === "dermatologist" ? "Patients" : "Clients"}</h2><p>Everyone using the platform as a skincare consumer.</p></div>
    <div class="card">
      ${clients.length ? `
        <table>
          <thead><tr><th>Name</th><th>Skin type</th><th>Concerns</th><th>Latest score</th><th></th></tr></thead>
          <tbody>
            ${clients.map((c) => `<tr>
              <td>${escapeHtml(c.full_name || c.email)}</td>
              <td>${titleCase(c.skin_type) || "—"}</td>
              <td>${c.concerns.map(titleCase).join(", ") || "—"}</td>
              <td>${c.latest_score ?? "—"}</td>
              <td><button class="btn btn-ghost btn-sm" onclick="navigateTo('client-detail', {clientId: ${c.id}})">View</button></td>
            </tr>`).join("")}
          </tbody>
        </table>
      ` : `<div class="empty-state"><p>No clients yet.</p></div>`}
    </div>
  `);
}

async function viewClientDetail(clientId) {
  const d = await API.get(`/api/dashboard/consultant/client/${clientId}`);
  setContent(`
    <div class="view-header">
      <button class="btn btn-ghost btn-sm" onclick="navigateTo('clients')">&larr; Back to list</button>
      <h2 class="mt-16">${escapeHtml(d.full_name || d.email)}</h2>
      <p>${escapeHtml(d.email)}</p>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>Profile</h3>
        <p><strong>Skin type:</strong> ${titleCase(d.profile.skin_type) || "Not set"}</p>
        <p class="mt-16"><strong>Concerns:</strong> ${d.profile.concerns.map(titleCase).join(", ") || "None"}</p>
        <p class="mt-16"><strong>Allergies:</strong> ${d.profile.allergies.join(", ") || "None"}</p>
      </div>
      <div class="card">
        <h3>Score history</h3>
        ${d.score_history.length ? `
          <table><thead><tr><th>Date</th><th>Score</th></tr></thead><tbody>
            ${d.score_history.map((s) => `<tr><td>${formatDate(s.date)}</td><td>${s.score}</td></tr>`).join("")}
          </tbody></table>
        ` : `<p class="text-soft">No scores yet.</p>`}
      </div>
    </div>

    <div class="card">
      <h3>Assessments</h3>
      ${d.assessments.length ? `
        <table>
          <thead><tr><th>Date</th><th>Condition score</th><th>Concerns detected</th></tr></thead>
          <tbody>
            ${d.assessments.map((a) => `<tr><td>${formatDate(a.created_at)}</td><td>${a.condition_score}</td><td>${a.concerns.map(titleCase).join(", ") || "—"}</td></tr>`).join("")}
          </tbody>
        </table>
      ` : `<p class="text-soft">No assessments yet.</p>`}
    </div>
  `);
}

// ===================== ADMIN ===================== //
async function viewAdminDashboard() {
  const d = await API.get("/api/dashboard/admin");
  setContent(`
    <div class="view-header"><h2>Platform Overview</h2><p>System-wide usage stats.</p></div>
    <div class="grid-3">
      <div class="stat-card"><div class="stat-label">Users</div><div class="stat-value">${d.total_users}</div></div>
      <div class="stat-card"><div class="stat-label">Consultants</div><div class="stat-value">${d.total_consultants}</div></div>
      <div class="stat-card"><div class="stat-label">Dermatologists</div><div class="stat-value">${d.total_dermatologists}</div></div>
      <div class="stat-card"><div class="stat-label">Assessments run</div><div class="stat-value">${d.total_assessments}</div></div>
      <div class="stat-card"><div class="stat-label">Routines generated</div><div class="stat-value">${d.total_routines_generated}</div></div>
    </div>
  `);
}
async function viewAdminUsers() {
  const users = await API.get("/api/dashboard/admin/users");
  setContent(`
    <div class="view-header"><h2>All Users</h2><p>${users.length} accounts registered.</p></div>
    <div class="card">
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
        <tbody>
          ${users.map((u) => `<tr>
            <td>${escapeHtml(u.full_name || "—")}</td>
            <td>${escapeHtml(u.email)}</td>
            <td><span class="badge badge-role-${u.role}">${u.role}</span></td>
            <td>${formatDate(u.created_at)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `);
}

// ===================== INIT ===================== //
initAuthScreen();
API.loadSession();
renderApp();
if (API.currentUser) bootApp();
