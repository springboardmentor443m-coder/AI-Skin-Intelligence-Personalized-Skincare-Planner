import React, { useState } from 'react';
import {
  Sparkles,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Droplet,
  Moon,
  Clock,
  ChevronDown,
  User,
  Sliders,
  X,
  LogOut,
} from 'lucide-react';

export const Navbar = ({
  currentRole,
  onRoleChange,
  userProfile,
  onUpdateProfile,
  notifications,
  onMarkNotificationRead,
  healthScore,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editProfile, setEditProfile] = useState(userProfile);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateProfile(editProfile);
    setShowProfileModal(false);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'user':
        return <User className="w-4 h-4 text-cyan-700" />;
      case 'consultant':
        return <UserCheck className="w-4 h-4 text-cyan-800" />;
      case 'dermatologist':
        return <Stethoscope className="w-4 h-4 text-teal-800" />;
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-slate-700" />;
      default:
        return <User className="w-4 h-4 text-cyan-700" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'user':
        return 'Skincare Consumer';
      case 'consultant':
        return 'Skincare Consultant';
      case 'dermatologist':
        return 'Dermatologist (MD)';
      case 'admin':
        return 'Platform Admin';
      default:
        return 'Skincare Consumer';
    }
  };

  return (
    <header className="sticky top-0 z-40 apple-glass border-b border-cyan-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Platform Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl aqua-gradient-bg flex items-center justify-center text-white shadow-md aqua-glow-sm">
            <Sparkles className="w-5 h-5 text-cyan-100" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">DermaGlow</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300/60">
                AI Skin Intelligence
              </span>
            </div>
            <p className="text-[11px] text-slate-600 hidden sm:block font-medium">
              Personalized Skincare Planner & Clinical Platform
            </p>
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Health Score Pill */}
          <div className="hidden md:flex items-center space-x-2 bg-cyan-50/90 border border-cyan-200 px-3.5 py-1.5 rounded-full shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
            <span className="text-xs text-slate-600 font-bold">Skin Health:</span>
            <span className="text-xs font-black text-cyan-800">{healthScore}/100</span>
          </div>

          {/* Role Selector Switcher */}
          <div className="relative group">
            <div className="flex items-center space-x-2 bg-white/80 hover:bg-cyan-50 transition-colors px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 cursor-pointer border border-cyan-200 shadow-xs">
              {getRoleIcon(currentRole)}
              <span className="hidden sm:inline-block font-bold">{getRoleLabel(currentRole)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div className="absolute right-0 mt-1 w-56 apple-glass rounded-2xl shadow-xl border border-cyan-200/80 py-1 hidden group-hover:block z-50">
              <div className="px-3.5 py-2 border-b border-cyan-100 text-[10px] font-extrabold text-cyan-800 uppercase tracking-widest">
                Switch Role Context
              </div>
              {['user', 'consultant', 'dermatologist', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => onRoleChange(r)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-cyan-100/60 transition-colors font-medium ${
                    currentRole === r ? 'bg-cyan-100/90 text-cyan-900 font-bold' : 'text-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(r)}
                    <span>{getRoleLabel(r)}</span>
                  </div>
                  {currentRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-cyan-100/60 rounded-xl transition-colors"
              title="Notifications & Reminders"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 apple-glass rounded-3xl shadow-2xl border border-cyan-200/80 p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-cyan-100 mb-3">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-cyan-700" />
                    <h3 className="font-extrabold text-base text-slate-900">Routine & Health Alerts</h3>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-500 hover:text-slate-900 p-1 rounded-full hover:bg-cyan-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onMarkNotificationRead(item.id)}
                      className={`p-3 rounded-2xl text-xs border transition-all cursor-pointer ${
                        item.isRead
                          ? 'bg-white/60 border-cyan-100 text-slate-600'
                          : 'bg-cyan-100/80 border-cyan-300 text-slate-900 font-semibold shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-cyan-900 flex items-center gap-1.5">
                          {item.category === 'routine' && <Clock className="w-3 h-3 text-cyan-700" />}
                          {item.category === 'hydration' && <Droplet className="w-3 h-3 text-teal-600" />}
                          {item.category === 'sleep' && <Moon className="w-3 h-3 text-cyan-800" />}
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{item.timestamp}</span>
                      </div>
                      <p className="text-slate-700 font-medium">{item.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-2 p-0.5 rounded-full border border-cyan-200 hover:border-cyan-500 transition-all shadow-xs"
              title="Edit Skin Profile & Settings"
            >
              <div className="w-8 h-8 rounded-full aqua-gradient-bg flex items-center justify-center text-white text-xs font-bold">
                {userProfile.name ? userProfile.name.charAt(0) : 'A'}
              </div>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center space-x-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline text-xs font-bold">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="apple-glass rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-cyan-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-100 mb-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-cyan-700" />
                <h3 className="text-xl font-extrabold text-slate-900">Skin Profile & Lifestyle</h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-500 hover:text-slate-900 p-1 rounded-full hover:bg-cyan-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editProfile.name}
                  onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-cyan-200 rounded-xl font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Required Skin Type</label>
                  <select
                    value={editProfile.skinType}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, skinType: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-cyan-200 rounded-xl font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Oily">Oily</option>
                    <option value="Dry">Dry</option>
                    <option value="Combination">Combination</option>
                    <option value="Normal">Normal</option>
                    <option value="Sensitive">Sensitive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Age Group</label>
                  <select
                    value={editProfile.ageGroup}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, ageGroup: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-cyan-200 rounded-xl font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55+">55+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Daily Water Intake (Liters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editProfile.lifestyle.waterIntakeLiters}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        lifestyle: {
                          ...editProfile.lifestyle,
                          waterIntakeLiters: parseFloat(e.target.value) || 2,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-cyan-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Sleep Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editProfile.lifestyle.sleepHours}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        lifestyle: {
                          ...editProfile.lifestyle,
                          sleepHours: parseFloat(e.target.value) || 7,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-cyan-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Known Allergies (comma separated)
                </label>
                <input
                  type="text"
                  value={editProfile.allergies.join(', ')}
                  onChange={(e) =>
                    setEditProfile({
                      ...editProfile,
                      allergies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-cyan-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-cyan-100">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-cyan-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl aqua-gradient-bg text-white font-bold shadow-md hover:brightness-110"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
