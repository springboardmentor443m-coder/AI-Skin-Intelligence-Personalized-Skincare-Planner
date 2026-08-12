import React, { useState } from 'react';
import {
  Stethoscope,
  ShieldAlert,
  FileText,
  CheckCircle2,
  Send,
  Microscope,
  Sparkles,
} from 'lucide-react';

export const DermatologistDashboard = ({
  profile,
  assessment,
  onConsultationSubmit,
}) => {
  const [selectedPatient, setSelectedPatient] = useState(profile);
  const [rxNotes, setRxNotes] = useState(
    '1. Niacinamide 10% + Zinc PCA 1% in AM routine.\n2. Salicylic Acid 2% + LHA formulation in PM routine.\n3. Strict broad-spectrum SPF 50+ PA++++ reapplication.'
  );
  const [aiAssistantQuery, setAiAssistantQuery] = useState('');
  const [aiAssistantReply, setAiAssistantReply] = useState('');
  const [isConsultingAi, setIsConsultingAi] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleAskDermatologyAi = async () => {
    if (!aiAssistantQuery.trim()) return;
    setIsConsultingAi(true);
    const reply = await onConsultationSubmit(aiAssistantQuery);
    setAiAssistantReply(reply);
    setIsConsultingAi(false);
  };

  const handleApproveCase = () => {
    setStatusMessage('Clinical Case Approved & Signed off by Dermatologist.');
    setTimeout(() => setStatusMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="aqua-gradient-bg rounded-3xl p-6 text-white shadow-xl border border-cyan-300/40 aqua-glow relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-white border border-white/30">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-200" />
            <span>Dermatology Clinical Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Medical Diagnostics & Formulations
          </h2>
          <p className="text-xs sm:text-sm text-cyan-50 font-medium max-w-2xl">
            Review skin profile telemetry, confirm diagnoses, and issue active chemical treatment plans.
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 text-xs text-white">
          <span className="block font-medium text-cyan-100">Board Certified:</span>
          <strong className="text-sm font-extrabold text-white">Dr. Evelyn Vance, MD</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Clinical Overview */}
        <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-100">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
              <Microscope className="w-4 h-4 text-cyan-700" />
              <span>Patient Telemetry</span>
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300">
              Verified ID
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3.5 bg-white/90 rounded-2xl border border-cyan-100 space-y-1 shadow-xs">
              <span className="font-extrabold text-sm text-slate-900 block">{selectedPatient.name}</span>
              <p className="text-slate-600 font-medium">
                Age: {selectedPatient.ageGroup} • Profile Skin Type: <strong className="text-slate-900">{selectedPatient.skinType}</strong>
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-1">
              <span className="font-bold text-amber-900 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>Allergies & Sensitivities</span>
              </span>
              <p className="text-slate-800 font-bold">
                {selectedPatient.allergies.join(', ') || 'None reported'}
              </p>
            </div>

            <div className="p-3.5 bg-cyan-100/90 rounded-2xl border border-cyan-300 space-y-1">
              <span className="font-bold text-cyan-900 block">Calculated Skin Health Score</span>
              <span className="text-3xl font-black text-cyan-800">{assessment.overallScore}/100</span>
              <p className="text-slate-700 text-[11px] font-medium">
                Barrier Index: {assessment.barrierHealthScore}% • Hydration: {assessment.hydrationScore}%
              </p>
            </div>
          </div>
        </div>

        {/* Diagnostic Assessment & Chemical Composition Review */}
        <div className="lg:col-span-2 apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-100">
            <h3 className="font-extrabold text-lg text-slate-900">AI Profile Assessment & Chemical Compositions</h3>
            <span className="text-xs text-slate-500 font-medium">Date: {new Date().toLocaleDateString()}</span>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-extrabold text-slate-900">Detected Skin Pathology & Severity</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assessment.concerns.map((c, idx) => (
                <div key={idx} className="p-3.5 bg-white/90 rounded-2xl border border-cyan-100 shadow-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-slate-900">{c.concern}</span>
                    <span className="text-[10px] font-bold text-cyan-900 bg-cyan-100 px-2.5 py-0.5 rounded-full border border-cyan-300">
                      {c.severity} ({c.score}/100)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{c.recommendationNote}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Prescription / Treatment Instructions */}
          <div className="space-y-2">
            <label className="block font-bold text-xs text-slate-900 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-cyan-700" />
              <span>Dermatologist Treatment Plan & Prescriptions</span>
            </label>
            <textarea
              rows={4}
              value={rxNotes}
              onChange={(e) => setRxNotes(e.target.value)}
              className="w-full p-3.5 text-xs border border-cyan-200 bg-white/90 rounded-2xl text-slate-900 font-mono font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* AI Clinical Assistant Tool */}
          <div className="bg-white/90 rounded-2xl p-4 border border-cyan-200 space-y-3 shadow-xs">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-cyan-700" />
              <span>Consult Gemini Clinical Copilot</span>
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask AI clinical copilot (e.g., 'Suggest salicylic acid concentration for oily skin')..."
                value={aiAssistantQuery}
                onChange={(e) => setAiAssistantQuery(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs border border-cyan-200 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAskDermatologyAi}
                disabled={isConsultingAi}
                className="px-4 py-2.5 aqua-gradient-bg text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 hover:brightness-110"
              >
                {isConsultingAi ? 'Consulting...' : 'Ask Copilot'}
              </button>
            </div>

            {aiAssistantReply && (
              <div className="p-3.5 bg-cyan-50 rounded-xl border border-cyan-200 text-xs text-slate-800 font-medium leading-relaxed max-h-40 overflow-y-auto">
                <strong className="text-cyan-900 block mb-1 font-bold">Copilot Answer:</strong>
                {aiAssistantReply}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            {statusMessage && (
              <span className="text-xs font-bold text-cyan-800 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                <span>{statusMessage}</span>
              </span>
            )}
            <button
              onClick={handleApproveCase}
              className="ml-auto px-6 py-3 rounded-2xl aqua-gradient-bg text-white font-bold text-xs shadow-md flex items-center space-x-2 hover:brightness-110 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Approve & Sign Medical Prescription</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
