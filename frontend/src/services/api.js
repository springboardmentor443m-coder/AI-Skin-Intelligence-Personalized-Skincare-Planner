/**
 * services/api.js — API Service Layer
 * =====================================
 * Phase 6: Frontend ↔ Backend Integration
 *
 * What this module does:
 *   Provides clean, reusable functions for calling the FastAPI backend.
 *   All fetch calls go through this file so that:
 *     1. The base URL comes from the environment variable VITE_API_URL
 *        (defined in frontend/.env) — never hardcoded in components.
 *     2. Error handling is consistent: HTTP errors AND network failures
 *        are both caught and turned into friendly thrown objects.
 *     3. Route handlers in pages/components stay clean and focused on UI logic.
 *
 * Environment variable:
 *   VITE_API_URL=http://127.0.0.1:8000   (set in frontend/.env)
 *   Vite makes this available as import.meta.env.VITE_API_URL at build time.
 *
 * Functions exported:
 *   registerUser(payload)         → POST /api/auth/register
 *   loginUser(payload)            → POST /api/auth/login
 *   fetchMe(token)                → GET  /api/auth/me
 *   authFetch(path, token, opts)  → Authenticated request helper for future routes
 */

// ── Base URL — read from environment, fallback to localhost for safety ─────────
//
// import.meta.env.VITE_API_URL is replaced at build time by Vite.
// The fallback ("http://127.0.0.1:8000") only applies if the variable is
// missing from .env — in practice you should always have it set.
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Internal helper: makes a JSON fetch request and returns parsed JSON.
 *
 * Handles two categories of failure:
 *   1. Network failure (server offline, DNS error, timeout)
 *      → Throws { detail: "Cannot connect to the server. Is the backend running?" }
 *   2. HTTP error (4xx, 5xx responses from FastAPI)
 *      → Throws the parsed JSON error body (FastAPI always includes a `detail` field)
 *
 * @param {string} path      - API path, e.g. "/api/auth/register"
 * @param {object} [options] - fetch options (method, body, headers, etc.)
 * @returns {Promise<object>} Parsed JSON response body on success
 * @throws  {object}         Error object with a `detail` string field
 */
async function apiFetch(path, options = {}) {
  let response;

  // Destructure `headers` out of options so that `...rest` does NOT override
  // the merged headers object below. Without this, `...options` would include
  // `options.headers` which would completely replace the Content-Type we set.
  const { headers: callerHeaders, ...rest } = options;

  try {
    // Merge caller-provided headers with the default Content-Type.
    // `callerHeaders` (e.g. Authorization) are merged IN to the headers object,
    // and `rest` (method, body, etc.) are spread WITHOUT touching headers.
    response = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(callerHeaders || {}),
      },
    });
  } catch {
    // fetch() itself throws only on network-level failures (server down, no internet, etc.)
    // Convert to a consistent error shape that components can display to the user.
    throw {
      detail:
        "Cannot connect to the server. Please make sure the backend is running and try again.",
    };
  }

  // Parse the response body as JSON (FastAPI always returns JSON)
  if (response.status === 204) {
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    // Unexpected non-JSON response (e.g. nginx 502 HTML page)
    throw {
      detail: `Unexpected server response (HTTP ${response.status}). Please try again.`,
    };
  }

  // If the HTTP status is not 2xx, throw the error body so callers can handle it.
  // FastAPI error bodies always look like:  { "detail": "Some message" }
  if (!response.ok) {
    throw data;
  }

  return data;
}

// ── Auth API calls ────────────────────────────────────────────────────────────

/**
 * Register a new user account.
 *
 * @param {{ full_name: string, email: string, password: string, role: string }} payload
 * @returns {Promise<{ id, email, full_name, role, is_active, created_at }>}
 * @throws  {{ detail: string | Array }} On validation or duplicate-email error
 */
export async function registerUser(payload) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Log in with email and password.
 *
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ access_token: string, token_type: string, user: object }>}
 * @throws  {{ detail: string }} On wrong credentials or deactivated account
 */
export async function loginUser(payload) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch the currently authenticated user's profile.
 * Used by AuthContext to rehydrate the session on page refresh.
 *
 * @param {string} token - The JWT access token stored in localStorage
 * @returns {Promise<{ id, email, full_name, role, is_active, created_at }>}
 * @throws  {{ detail: string }} On expired/invalid token
 */
export async function fetchMe(token) {
  return apiFetch("/api/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Generic authenticated request helper.
 * Use this for any future protected API endpoints.
 *
 * @param {string} path     - API path, e.g. "/api/skin/results"
 * @param {string} token    - JWT access token from AuthContext
 * @param {object} [opts]   - Additional fetch options (method, body, etc.)
 * @returns {Promise<object>}
 *
 * Example:
 *   const results = await authFetch("/api/skin/results", token);
 *   const created = await authFetch("/api/skin/assess", token, {
 *     method: "POST",
 *     body: JSON.stringify({ skin_type: "oily" }),
 *   });
 */
export async function authFetch(path, token, opts = {}) {
  return apiFetch(path, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
}

/**
 * Send a skin lesion image to the prediction endpoint.
 *
 * IMPORTANT: We do NOT set Content-Type here. When sending FormData,
 * the browser automatically sets Content-Type to "multipart/form-data"
 * with the correct boundary string. Setting it manually would break
 * the boundary and cause a 422 error on the FastAPI side.
 *
 * @param {File}   file   - The image File object from an <input type="file">
 * @param {string} token  - JWT access token from AuthContext
 * @returns {Promise<{
 *   class:       string,
 *   label:       string,
 *   confidence:  number,
 *   all_scores:  Record<string, number>,
 *   disclaimer:  string,
 * }>}
 * @throws {{ detail: string }} On validation errors, auth errors, or server errors
 */
export async function predictSkin(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  let response;
  try {
    response = await fetch(`${BASE_URL}/api/predict`, {
      method: "POST",
      headers: {
        // Authorization is manual; Content-Type is intentionally omitted
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw {
      detail:
        "Cannot connect to the server. Please make sure the backend is running and try again.",
    };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw {
      detail: `Unexpected server response (HTTP ${response.status}). Please try again.`,
    };
  }

  if (!response.ok) {
    throw data;
  }

  return data;
}

/**
 * Fetch the authenticated user's assessment history (newest first).
 *
 * @param {string} token - JWT access token
 * @returns {Promise<{ total: number, assessments: Array }>}
 */
export async function fetchAssessments(token) {
  return authFetch("/api/assessments", token);
}

/**
 * Fetch a single assessment by ID.
 * Returns HTTP 404 if the assessment does not belong to this user.
 *
 * @param {number} id    - Assessment ID
 * @param {string} token - JWT access token
 * @returns {Promise<AssessmentResponse>}
 */
export async function fetchAssessment(id, token) {
  return authFetch(`/api/assessments/${id}`, token);
}

/**
 * Fetch educational recommendations for an assessment.
 *
 * @param {number} id    - Assessment ID
 * @param {string} token - JWT access token
 * @returns {Promise<RecommendationsResponse>}
 */
export async function fetchRecommendations(id, token) {
  return authFetch(`/api/assessments/${id}/recommendations`, token);
}

export async function getSkinProfile(token) {
  return authFetch("/api/skin-profile", token);
}

export async function updateSkinProfile(payload, token) {
  return authFetch("/api/skin-profile", token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getProducts(token) {
  return authFetch("/api/products", token);
}

export async function addProduct(payload, token) {
  return authFetch("/api/products", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id, token) {
  return authFetch(`/api/products/${id}`, token, { method: "DELETE" });
}

export async function getMedicalReports(token) {
  return authFetch("/api/medical-reports", token);
}

export async function getMedicalReport(id, token) {
  let response;
  try {
    response = await fetch(`${BASE_URL}/api/medical-reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw {
      detail:
        "Cannot connect to the server. Please make sure the backend is running and try again.",
    };
  }

  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = { detail: `Unexpected server response (HTTP ${response.status}).` };
    }
    throw data;
  }

  return response.blob();
}

export async function uploadMedicalReport(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  let response;
  try {
    response = await fetch(`${BASE_URL}/api/medical-reports`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    throw {
      detail:
        "Cannot connect to the server. Please make sure the backend is running and try again.",
    };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw {
      detail: `Unexpected server response (HTTP ${response.status}). Please try again.`,
    };
  }

  if (!response.ok) throw data;
  return data;
}

export async function deleteMedicalReport(id, token) {
  return authFetch(`/api/medical-reports/${id}`, token, { method: "DELETE" });
}

export async function getSkinHistory(token) {
  return authFetch("/api/skin-history", token);
}

export async function createSkinHistory(payload, token) {
  return authFetch("/api/skin-history", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSkinHistory(id, payload, token) {
  return authFetch(`/api/skin-history/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteSkinHistory(id, token) {
  return authFetch(`/api/skin-history/${id}`, token, { method: "DELETE" });
}

/**
 * Fetch product recommendations and daily routine for a prediction result.
 *
 * @param {{ predicted_class: string, risk_level: string, skin_type?: string, has_previous_analysis?: boolean, language?: string }} payload
 * @param {string} token - JWT access token
 * @returns {Promise<RecommendationResponse>}
 */
export async function getRecommendations(payload, token) {
  return authFetch("/api/recommend", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

