/**
 * context/AuthContext.jsx — Global Authentication State
 * =======================================================
 * Phase 6: Frontend ↔ Backend Integration
 *
 * What this module does:
 *   Provides a React Context that holds the authenticated user's state
 *   and makes it available to every component in the app — without prop drilling.
 *
 * What it provides (via useAuth() hook in hooks/useAuth.js):
 *   user     {object|null}   The authenticated user profile, or null if logged out.
 *   token    {string|null}   The raw JWT string, or null if logged out.
 *   loading  {boolean}       True while we're rehydrating state from localStorage.
 *   login()  {function}      Stores the token + user, and updates state.
 *   logout() {function}      Clears token + user from state and localStorage.
 *
 * Persistence strategy:
 *   The JWT is stored in localStorage under the key "auth_token".
 *   On app mount, we read the stored token and call GET /api/auth/me
 *   to verify it's still valid and fetch the current user profile.
 *   This rehydrates the session across page refreshes.
 *
 * NOTE: useAuth() hook is in src/hooks/useAuth.js (separate file).
 *   This is required for Vite Fast Refresh to work correctly — React Fast Refresh
 *   requires that files exporting components and files exporting hooks be separate.
 *
 * Usage:
 *   // In any component:
 *   import { useAuth } from '../hooks/useAuth';
 *   const { user, logout } = useAuth();
 */

import { createContext, useEffect, useState } from "react";
import { fetchMe } from "../services/api";

// ── Export the context object so useAuth.js can import it ─────────────────────
//
// We export AuthContext as a named export (not just the Provider).
// The useAuth hook in hooks/useAuth.js imports this directly.
export const AuthContext = createContext(null);

const TOKEN_KEY = "auth_token"; // localStorage key for JWT storage

// ── AuthProvider ──────────────────────────────────────────────────────────────

/**
 * Wrap your app in <AuthProvider> to make auth state available everywhere.
 * Place it at the top of the component tree in App.jsx.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // true while rehydrating

  // ── Rehydrate session on mount ────────────────────────────────────────────
  //
  // When the app first loads or the page is refreshed, check localStorage
  // for an existing token. If found, verify it with the backend (GET /api/auth/me)
  // and restore the user session. This prevents the user from being logged out
  // on a simple page refresh.
  //
  // If the token is expired or invalid, it's silently removed.
  useEffect(() => {
    async function rehydrate() {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        // No token stored — user is not logged in
        setLoading(false);
        return;
      }

      try {
        // Verify the token is still valid by calling the protected /me endpoint
        const userData = await fetchMe(storedToken);
        setToken(storedToken);
        setUser(userData);
      } catch {
        // Token is expired, invalid, or backend is unreachable.
        // Clear the stale token so the user isn't stuck in a broken state.
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        // Always stop the loading state, regardless of success or failure
        setLoading(false);
      }
    }

    rehydrate();
  }, []);

  // ── login(token, user) ────────────────────────────────────────────────────
  //
  // Called by the Login page after a successful POST /api/auth/login.
  // Stores the JWT in localStorage and updates React state.
  //
  // @param {string} newToken  - The JWT access token from the API response
  // @param {object} userData  - The user profile from the API response
  function login(newToken, userData) {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(userData);
  }

  // ── logout() ──────────────────────────────────────────────────────────────
  //
  // Clears all auth state and removes the JWT from localStorage.
  // After calling logout(), components using useAuth() will see user = null,
  // which causes ProtectedRoute to redirect to /login.
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  // The value object is what every useAuth() consumer receives
  const value = { user, token, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
