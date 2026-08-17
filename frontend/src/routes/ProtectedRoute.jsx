/**
 * routes/ProtectedRoute.jsx — Route Guard for Authenticated Pages
 * ================================================================
 * Phase 5: Backend Integration
 *
 * What this component does:
 *   Checks whether the user is authenticated before rendering a protected page.
 *
 *   - If loading (rehydrating session from localStorage): shows nothing.
 *   - If the user is NOT logged in: redirects to /login.
 *   - If the user IS logged in: renders the protected page normally.
 *
 * Usage in App.jsx:
 *   <Route
 *     path="/dashboard"
 *     element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
 *   />
 *
 * How it works:
 *   It reads auth state from AuthContext (via useAuth()).
 *   The <Navigate> component from react-router-dom performs the redirect.
 *   `replace` is used so the login page doesn't appear in browser history —
 *   pressing Back after being redirected won't loop back to the login page.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * @param {{ children: React.ReactNode }} props
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While we're checking localStorage / verifying the token with the backend,
  // render nothing to avoid a flash of the wrong page.
  if (loading) {
    return null;
  }

  // If not authenticated, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated — render the requested page
  return children;
}
