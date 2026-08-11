/**
 * pages/Profile.jsx — User Profile Page (Phase 6)
 * ==================================================
 * Protected page — only accessible when logged in.
 * Shows the currently logged-in user's account information from AuthContext.
 * Profile editing will be added in a future phase.
 */

import { Link, useNavigate } from "react-router-dom";
import { Sparkles, LogOut, ArrowLeft, User, Mail, Shield, Calendar } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// Role display labels — mirrors Dashboard.jsx
const ROLE_LABELS = {
  user:                "Member",
  skincare_consultant: "Skincare Consultant",
  dermatologist:       "Dermatologist",
  admin:               "Administrator",
};

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const roleLabel  = ROLE_LABELS[user?.role] ?? user?.role ?? "Member";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles size={22} className="text-blue-600" />
            <span className="text-lg font-bold text-gray-900">AI Skin Intelligence</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-gray-600">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Avatar + name card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-5 mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-900">{user?.full_name}</p>
            <span className="inline-block mt-1 text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Details grid */}
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {/* Email */}
          <div className="flex items-center gap-4 px-6 py-4">
            <Mail size={18} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Email address</p>
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-4 px-6 py-4">
            <Shield size={18} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Account role</p>
              <p className="text-sm font-medium text-gray-900">{roleLabel}</p>
            </div>
          </div>

          {/* Member since */}
          <div className="flex items-center gap-4 px-6 py-4">
            <Calendar size={18} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Member since</p>
              <p className="text-sm font-medium text-gray-900">{memberSince}</p>
            </div>
          </div>

          {/* Account status */}
          <div className="flex items-center gap-4 px-6 py-4">
            <User size={18} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Account status</p>
              <p className="text-sm font-medium text-green-600">
                {user?.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Profile editing will be available in a future update.
        </p>
      </main>
    </div>
  );
}

export default Profile;