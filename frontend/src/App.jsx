import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SkinAssessment from "./pages/SkinAssessment";
import AssessmentHistory from "./pages/AssessmentHistory";
import AssessmentDetail from "./pages/AssessmentDetail";
import Recommendations from "./pages/Recommendations";
import Profile from "./pages/Profile";

/**
 * App.jsx — Root Application Component
 * ======================================
 * Phase 9 + 10: Assessment history, detail, and recommendations routes added.
 *
 * Route map:
 *   Public:
 *     /            → Home
 *     /login       → Login
 *     /register    → Register
 *
 *   Protected (require authentication):
 *     /dashboard          → Dashboard (with real history stats)
 *     /assessment         → Skin Assessment (upload + predict)
 *     /history            → Assessment History list
 *     /history/:id        → Assessment Detail (single result)
 *     /recommendations/:id → Educational Recommendations
 *     /profile            → User Profile
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes — accessible without logging in */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <SkinAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AssessmentHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history/:id"
            element={
              <ProtectedRoute>
                <AssessmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations/:id"
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;