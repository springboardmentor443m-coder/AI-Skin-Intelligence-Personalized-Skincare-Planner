import React from 'react';
import { useAuth } from '../context/auth';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, LogOut, LayoutDashboard, UserCheck, Shield, Activity, 
  Droplet, Calendar, AlertCircle, TrendingUp, Compass, Heart, 
  FileText, Settings, UserPlus
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock data for analytics widgets
  const stats = [
    { name: 'Skin Health Index', value: '82%', change: '+4% vs last week', icon: Activity, color: 'text-pink-400 bg-pink-500/10' },
    { name: 'Hydration Level', value: '74%', change: 'Optimal', icon: Droplet, color: 'text-cyan-400 bg-cyan-500/10' },
    { name: 'Routine Compliance', value: '18/21 days', change: '85.7% accuracy', icon: Calendar, color: 'text-emerald-400 bg-emerald-500/10' },
    { name: 'Active Concerns', value: '2 Detected', change: 'Acne, Dryness', icon: AlertCircle, color: 'text-amber-400 bg-amber-500/10' },
  ];

  return (
    <div className="relative min-h-screen bg-[#070b14] text-slate-100 flex overflow-hidden">
      
      {/* Background Neon Orbs */}
      <div className="glow-orb-pink w-[500px] h-[500px] -top-40 -left-40" />
      <div className="glow-orb-cyan w-[500px] h-[500px] -bottom-40 -right-40" />

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0a0f1d]/80 border-r border-slate-800/80 backdrop-blur-xl hidden md:flex flex-col z-20">
        
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-pink-500 to-cyan-500 rounded-lg shadow-md shadow-pink-500/15">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            GlowAI
          </span>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium transition-all">
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </a>
          
          {/* User Specific Links */}
          {user?.role === 'user' && (
            <>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent transition-all">
                <Activity className="h-5 w-5" />
                <span>Skin Diagnostics</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent transition-all">
                <Calendar className="h-5 w-5" />
                <span>Routines & Planner</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent transition-all">
                <Compass className="h-5 w-5" />
                <span>Ingredient Scanner</span>
              </a>
            </>
          )}

          {/* Consultant Specific Links */}
          {user?.role === 'consultant' && (
            <>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent transition-all">
                <UserCheck className="h-5 w-5" />
                <span>Client Consultations</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent transition-all">
                <FileText className="h-5 w-5" />
                <span>Routine Templates</span>
              </a>
            </>
          )}

          {/* Dermatologist Specific Links */}
          {user?.role === 'dermatologist' && (
            <>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent transition-all">
                <Shield className="h-5 w-5" />
                <span>Patient Referrals</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent transition-all">
                <Heart className="h-5 w-5" />
                <span>Clinical Reviews</span>
              </a>
            </>
          )}

          {/* Admin Specific Links */}
          {user?.role === 'admin' && (
            <>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent transition-all">
                <UserPlus className="h-5 w-5" />
                <span>Manage Users</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent transition-all">
                <Settings className="h-5 w-5" />
                <span>System Health</span>
              </a>
            </>
          )}
        </nav>

        {/* User Info Footbar */}
        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-pink-500/20 border border-pink-500/35 flex items-center justify-center font-bold text-pink-400 text-sm flex-shrink-0">
              {user?.first_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-pink-400 rounded-lg transition-colors"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto z-10">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/85 bg-[#070b14]/75 backdrop-blur-md flex items-center justify-between px-6 md:px-8 flex-shrink-0">
          <div className="flex items-center md:hidden space-x-3">
            <div className="p-2 bg-gradient-to-tr from-pink-500 to-cyan-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-lg">GlowAI</span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-slate-400 text-sm">Workspace /</span>
            <span className="text-slate-200 text-sm font-medium">Dashboard Overview</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 text-xs font-semibold rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 capitalize">
              Role: {user?.role}
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-300 text-sm md:hidden"
            >
              <LogOut className="h-4 w-4" />
              <span>Exit</span>
            </button>
          </div>
        </header>

        {/* Dashboard Grid Content */}
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Welcome Jumbotron Card */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg border border-slate-800/65">
            <div className="space-y-2 max-w-xl z-10">
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-pink-300 bg-clip-text text-transparent">
                Welcome back, {user?.first_name || 'Innovator'}!
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your AI Skin Diagnostics engine is online. Connect a camera feed or upload images to measure acne levels, pigmentation compatibility, and track skin wellness scores.
              </p>
              <div className="pt-2">
                <button className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold rounded-lg shadow-md shadow-pink-500/20 text-xs transition-all duration-300 flex items-center space-x-2 hover:scale-[1.02]">
                  <Sparkles className="h-4 w-4" />
                  <span>Launch Diagnostics Scanner</span>
                </button>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 md:opacity-20 pointer-events-none transform translate-x-12 translate-y-12">
              <Sparkles className="h-64 w-64 text-pink-500" />
            </div>
          </div>

          {/* Quick Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-xl flex items-center space-x-4 border border-slate-850 hover:border-pink-500/30 transition-all duration-300 shadow-md">
                <div className={`p-3 rounded-lg ${stat.color} flex-shrink-0`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stat.name}</p>
                  <h4 className="text-2xl font-bold text-white mt-0.5">{stat.value}</h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 text-pink-400 mr-1" />
                    {stat.change}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Visual Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* AI Action Center Placeholder */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">AI Diagnosis & Skin Mapping</h3>
                <p className="text-slate-400 text-sm">Visualize current anomalies and view skin composition predictions.</p>
              </div>
              
              {/* Simulated UI Area */}
              <div className="border border-dashed border-slate-800 rounded-xl h-64 bg-slate-900/30 flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 animate-pulse">
                  <Activity className="h-6 w-6" />
                </div>
                <h5 className="font-semibold text-slate-300 text-sm">No Diagnosis Uploaded</h5>
                <p className="text-slate-500 text-xs mt-1 max-w-xs">
                  Run a routine scan to evaluate acne, pigmentation index, pore health, and wrinkle progression charts.
                </p>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-500">Models Loaded: EfficientNetB0, MobileNetV2</span>
                <span className="text-xs text-cyan-400 cursor-pointer hover:underline">API Docs Reference</span>
              </div>
            </div>

            {/* Ingredient Intelligence / Compatibility panel */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Ingredient Intelligence</h3>
                <p className="text-slate-400 text-sm font-light">Checks ingredient allergies and compatibility scores.</p>
              </div>
              
              <div className="space-y-4">
                {/* Simulated list */}
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Salicylic Acid</p>
                    <p className="text-xs text-pink-400">Compatible with Oily Type</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">98% Safe</span>
                </div>

                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Retinol (0.5%)</p>
                    <p className="text-xs text-amber-400">Caution: Sensitive Skins</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Check compatibility</span>
                </div>

                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Hyaluronic Acid</p>
                    <p className="text-xs text-cyan-400">Compatible with Dry Type</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">100% Safe</span>
                </div>
              </div>

              <div className="pt-2 text-center border-t border-slate-850">
                <a href="#" className="text-xs font-semibold text-pink-400 hover:text-pink-300 hover:underline">
                  Analyze Skincare Product Ingredients
                </a>
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
};

export default Dashboard;
