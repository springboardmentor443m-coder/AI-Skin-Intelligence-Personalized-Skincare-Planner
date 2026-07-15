const BASE_URL = "http://127.0.0.1:8000";

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body.detail === "string"
        ? body.detail
        : Array.isArray(body.detail)
        ? body.detail.map((d) => d.msg).join(", ")
        : "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return res.json();
}

export async function signup({ full_name, email, password }) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, password, role: "user" }),
  });
  return handleResponse(res);
}

export async function login({ email, password }) {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  return handleResponse(res);
}

export async function getMyProfile(token) {
  const res = await fetch(`${BASE_URL}/skin-profile/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null; // no profile created yet
  return handleResponse(res);
}

export async function saveProfile(token, profile) {
  const res = await fetch(`${BASE_URL}/skin-profile/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });
  return handleResponse(res);
}
