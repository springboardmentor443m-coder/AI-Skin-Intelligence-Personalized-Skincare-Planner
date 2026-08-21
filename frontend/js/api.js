// Thin fetch wrapper. Same-origin (FastAPI serves this frontend), so no base URL needed.
const API = {
  currentUser: null, // {id, email, full_name, role} - set after login, persisted in localStorage

  loadSession() {
    const raw = localStorage.getItem("skinai_user");
    if (raw) {
      try { this.currentUser = JSON.parse(raw); } catch (e) { this.currentUser = null; }
    }
    return this.currentUser;
  },

  setSession(user) {
    this.currentUser = user;
    localStorage.setItem("skinai_user", JSON.stringify(user));
  },

  clearSession() {
    this.currentUser = null;
    localStorage.removeItem("skinai_user");
  },

  async request(method, path, { body = null, isForm = false, auth = true } = {}) {
    const headers = {};
    if (auth && this.currentUser) headers["X-User-Id"] = String(this.currentUser.id);
    if (!isForm && body !== null) headers["Content-Type"] = "application/json";

    const res = await fetch(path, {
      method,
      headers,
      body: body === null ? undefined : (isForm ? body : JSON.stringify(body)),
    });

    if (res.status === 401) {
      this.clearSession();
      renderApp();
      throw new Error("Session expired. Please log in again.");
    }

    const contentType = res.headers.get("content-type") || "";
    if (!res.ok) {
      let detail = `Request failed (${res.status})`;
      if (contentType.includes("application/json")) {
        const errBody = await res.json().catch(() => null);
        if (errBody && errBody.detail) detail = errBody.detail;
      }
      throw new Error(detail);
    }

    if (contentType.includes("application/json")) return res.json();
    return res; // caller handles blobs (PDF/Excel downloads) itself
  },

  get(path) { return this.request("GET", path); },
  post(path, body) { return this.request("POST", path, { body }); },
  put(path, body) { return this.request("PUT", path, { body }); },
  postForm(path, formData) { return this.request("POST", path, { body: formData, isForm: true }); },

  async download(path, filename) {
    const res = await this.request("GET", path);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    window.URL.revokeObjectURL(url);
  },
};
