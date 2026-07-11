const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const token = localStorage.getItem("dermis_token");

  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `Request to ${path} failed with ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : res.text();
}

export const api = {
  // assessment.py
  submitQuestionnaire: (answers) =>
    request("/assessment/questionnaire", { method: "POST", body: answers }),
  uploadSkinPhoto: (formData) =>
    request("/assessment/photo", { method: "POST", body: formData, isFormData: true }),
  getLatestAssessment: () => request("/assessment/latest"),

  // routine.py
  getRoutine: () => request("/routine"),
  markStepComplete: (stepId, done) =>
    request(`/routine/steps/${stepId}`, { method: "PATCH", body: { done } }),

  // analytics.py
  getSkinScoreHistory: () => request("/analytics/score-history"),
  getDashboardSummary: () => request("/analytics/summary"),
};
