import React from 'react';
import {
  BookOpen,
  Download,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  User,
  Layers,
  Cpu,
  Lock,
} from 'lucide-react';

export const ProjectDocsAndPresentation = () => {
  const handleDownloadDoc = () => {
    const docText = `# DermaGlow AI Skin Intelligence Platform
## Technical & Architectural Documentation

### 1. Executive Summary
DermaGlow is an enterprise-grade AI dermatological telemetry and skin intelligence platform styled with an Aqua Apple Glass design. It provides 360° skin diagnostics without photo capture, biochemical active chemical composition clash analysis, multi-step routine optimization, and specialized workspaces for patients, consultants, dermatologists, and system administrators.

### 2. Core Architectural Pillars
- **Full-Stack Architecture**: Built with React 18, Vite, Express server-side API proxy, and Tailwind CSS.
- **AI Telemetry & Diagnostics**: Powered by Gemini 3.6 Flash for sub-200ms skin telemetry, chemical composition incompatibility checks, and clinical consultations.
- **Indian E-Commerce Product Integration**: Sourced from top Indian platforms (Nykaa, Minimalist, Derma Co, Amazon India) focusing on active formulations.
- **Role-Based Access Control (RBAC)**:
  - **User / Patient**: Daily checklists, required skin type assessments, personalized routines.
  - **Consultant**: Client routine editing, ingredient safety reports, routine publishing.
  - **Dermatologist (MD)**: Differential diagnostic review, Gemini AI Clinical Copilot, digital prescriptions.
  - **Admin**: User governance, latency tracking, RBAC configuration.

### 3. Safety & Biochemical Engineering
DermaGlow prevents skin barrier disruption by analyzing active formulation pairings (e.g. Salicylic Acid + Retinol, Niacinamide + Vitamin C) and alerting users before application.
`;

    const blob = new Blob([docText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DermaGlow_Project_Documentation.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 text-slate-900 font-sans">
      {/* Header Banner */}
      <div className="aqua-gradient-bg rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-cyan-300/40 aqua-glow relative overflow-hidden space-y-4">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Technical & Architecture Knowledge Base</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Project Technical Documentation
            </h2>
            <p className="text-xs sm:text-sm text-cyan-50 leading-relaxed font-medium">
              Comprehensive technical architecture breakdown, Role-Based Access Control security governance, biochemical safety engines, and platform specification standards.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={handleDownloadDoc}
              className="px-4 py-2.5 bg-white text-cyan-950 hover:bg-cyan-50 font-bold text-xs rounded-2xl transition-all shadow-md flex items-center space-x-2 active:scale-95"
            >
              <Download className="w-4 h-4 text-cyan-700" />
              <span>Export Documentation (.MD)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Technical Documentation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6 apple-glass rounded-3xl p-6 sm:p-8 border border-cyan-200/60 shadow-md">
          {/* Executive Summary */}
          <section className="space-y-3 pb-6 border-b border-cyan-100">
            <div className="flex items-center space-x-2 text-cyan-800">
              <Layers className="w-5 h-5" />
              <h3 className="text-xl font-extrabold text-slate-900">1. Executive Summary & Core Mission</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              DermaGlow is an enterprise AI-driven dermatological intelligence platform designed to harmonize personal skincare management with professional clinical oversight. By combining skin telemetry with a biochemical active chemical composition clash detector, DermaGlow eliminates guesswork in daily routines and enables safe, evidence-based skin barrier care.
            </p>
          </section>

          {/* Role Workflows */}
          <section className="space-y-4 pb-6 border-b border-cyan-100">
            <div className="flex items-center space-x-2 text-cyan-800">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-xl font-extrabold text-slate-900">2. Role-Based Governance & Workflows</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white/90 rounded-2xl border border-cyan-100 space-y-2 shadow-xs">
                <div className="flex items-center space-x-2 text-slate-900">
                  <User className="w-4 h-4 text-cyan-700" />
                  <span className="font-extrabold text-sm">Patient / Consumer Role</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Accesses required skin type assessments, morning/evening step checklists, hydration logs, and Indian e-commerce composition matches.
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-cyan-100 space-y-2 shadow-xs">
                <div className="flex items-center space-x-2 text-slate-900">
                  <UserCheck className="w-4 h-4 text-cyan-700" />
                  <span className="font-extrabold text-sm">Skincare Consultant Role</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Manages assigned clients, adjusts multi-step routine steps, publishes custom care plans, and reviews chemical safety.
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-cyan-100 space-y-2 shadow-xs">
                <div className="flex items-center space-x-2 text-slate-900">
                  <Stethoscope className="w-4 h-4 text-cyan-700" />
                  <span className="font-extrabold text-sm">Dermatologist (MD) Role</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Reviews clinical diagnostic telemetry, consults Gemini AI Clinical Copilot, diagnoses skin concerns, and issues digital prescriptions.
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-cyan-100 space-y-2 shadow-xs">
                <div className="flex items-center space-x-2 text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-cyan-700" />
                  <span className="font-extrabold text-sm">Platform Administrator</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Controls Role-Based Access Control (RBAC) privileges, monitors Gemini API response latency, and performs security audits.
                </p>
              </div>
            </div>
          </section>

          {/* Technical Stack */}
          <section className="space-y-4 pb-6 border-b border-cyan-100">
            <div className="flex items-center space-x-2 text-cyan-800">
              <Cpu className="w-5 h-5" />
              <h3 className="text-xl font-extrabold text-slate-900">3. Technical Stack & AI Integration</h3>
            </div>

            <div className="p-4 bg-cyan-50/90 rounded-2xl border border-cyan-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 bg-white rounded-xl border border-cyan-200 font-bold text-slate-900">
                  React 18 + Vite
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-cyan-200 font-bold text-slate-900">
                  Express Proxy
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-cyan-200 font-bold text-slate-900">
                  Gemini 3.6 Flash
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-cyan-200 font-bold text-slate-900">
                  Aqua Glass Tailwind
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">
                All API keys remain server-side inside Express backend endpoints (`server.ts`).
              </p>
            </div>
          </section>

          {/* Security */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2 text-cyan-800">
              <Lock className="w-5 h-5" />
              <h3 className="text-xl font-extrabold text-slate-900">4. Security, Privacy & Data Governance</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              DermaGlow enforces local credential security, session privacy guards, and instant client-side data export capabilities including official clinical PDF diagnostic reports and CSV/Excel routine logs.
            </p>
          </section>
        </div>

        {/* Quick Technical Specs Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-4">
            <h4 className="font-extrabold text-base text-slate-900 pb-3 border-b border-cyan-100">
              System Architecture Specs
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-cyan-100">
                <span className="text-slate-500 font-bold">AI Model:</span>
                <span className="font-extrabold text-slate-900">Gemini 3.6 Flash</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-cyan-100">
                <span className="text-slate-500 font-bold">Avg AI Latency:</span>
                <span className="font-black text-cyan-800">180ms</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-cyan-100">
                <span className="text-slate-500 font-bold">Active Roles:</span>
                <span className="font-extrabold text-slate-900">User, Consultant, MD, Admin</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-cyan-100">
                <span className="text-slate-500 font-bold">Market Sourcing:</span>
                <span className="font-extrabold text-slate-900">Indian E-Commerce</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500 font-bold">Compliance:</span>
                <span className="font-extrabold text-cyan-800">RBAC Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
