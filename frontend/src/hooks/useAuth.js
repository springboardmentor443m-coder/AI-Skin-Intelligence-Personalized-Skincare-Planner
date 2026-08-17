/**
 * hooks/useAuth.js — Custom hook for accessing AuthContext
 * =========================================================
 * Phase 6: Frontend ↔ Backend Integration
 *
 * Why a separate file?
 *   React Fast Refresh requires that files exporting hooks (non-components)
 *   and files exporting components be separate. Splitting useAuth into its
 *   own file:
 *     1. Fixes the "Could not Fast Refresh" Vite HMR warning.
 *     2. Follows the React convention of co-locating hooks in src/hooks/.
 *     3. Makes imports cleaner in components.
 *
 * Usage:
 *   import { useAuth } from '../hooks/useAuth';
 *   const { user, token, login, logout, loading } = useAuth();
 */

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Custom hook to access auth state and actions from AuthContext.
 *
 * Must be called inside a component that is a descendant of <AuthProvider>.
 *
 * @returns {{
 *   user:    object | null,   // Authenticated user profile, or null if logged out
 *   token:   string | null,   // JWT access token, or null if logged out
 *   loading: boolean,         // True while rehydrating session from localStorage
 *   login:   function,        // login(token, user) — call after successful API login
 *   logout:  function,        // logout() — clears token and redirects
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth() must be called inside an <AuthProvider>. " +
      "Make sure your component is a descendant of <AuthProvider> in App.jsx."
    );
  }
  return context;
}
