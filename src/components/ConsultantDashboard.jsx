import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  CheckCircle2,
  Send,
  Sparkles,
} from 'lucide-react';

export const ConsultantDashboard = ({
  profile,
  assessment,
  routine,
  onUpdateRoutineByConsultant,
}) => {
  const [activeClient, setActiveClient] = useState(profile);
  const [searchTerm, setSearchTerm] = useState('');
  const [consultantNotes, setConsultantNotes] = useState(
    'Client exhibits mild acne along T-zone and fading post-inflammatory hyperpigmentation. Approved current morning Vitamin C (10%) and evening Niacinamide (10%) + Zinc PCA.'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const sampleClients = [
    {
      id: 'usr_001',
      name: profile.name,
      skinType: profile.skinType,
      score: assessment.overallScore,
      lastCheckin: 'Today',
      status: 'Active Review',
    },
    {
      id: 'usr_002',
      name: 'Marcus Vance',
      skinType: 'Dry',
      score: 64,
      lastCheckin: '2 days ago',
      status: 'Needs Advice',
    },
    {
      id: 'usr_003',
      name: 'Elena Rostova',
      skinType: 'Sensitive',
      score: 79,
      lastCheckin: 'Yesterday',
      status: 'Routine Approved',
    },
  ];

  const handleSaveAssessmentNotes = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="aqua-gradient-bg rounded-3xl p-6 text-white shadow-xl border border-cyan-300/40 aqua-glow relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-white border border-white/30">
            <UserCheck className="w-3.5 h-3.5 text-cyan-200" />
            <span>Skincare Consultant Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Client Routine Management Portal
          </h2>
          <p className="text-xs sm:text-sm text-cyan-50 font-medium max-w-2xl">
            Review AI skin assessments, adjust active compositions, and publish expert guidance.
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 text-xs text-white">
          <span className="block font-medium text-cyan-100">Assigned Clients:</span>
          <strong className="text-lg font-black text-white">12 Clients</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client List */}
        <div className="apple-glass rounded-3xl p-5 border border-cyan-200/60 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900">Assigned Clients</h3>
            <span className="text-xs text-slate-500 font-bold">3 Pending</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-cyan-700" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs border border-cyan-200 rounded-xl bg-white/90 text-slate-900 font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2">
            {sampleClients.map((client) => (
              <div
                key={client.id}
                onClick={() => setActiveClient(profile)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeClient.id === client.id
                    ? 'bg-cyan-100/90 border-cyan-400 shadow-xs'
                    : 'bg-white/80 hover:bg-cyan-50 border-cyan-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block">{client.name}</span>
                    <span className="text-[11px] text-slate-600 font-medium">
                      {client.skinType} Skin • Health {client.score}/100
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      client.status === 'Needs Advice'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Client Assessment & Routine Editor */}
        <div className="lg:col-span-2 apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-cyan-100">
            <div>
              <span className="text-xs font-extrabold text-cyan-800 uppercase tracking-wider">
                Reviewing Profile
              </span>
              <h3 className="font-extrabold text-xl text-slate-900">{activeClient.name}</h3>
              <p className="text-xs text-slate-600 font-medium">
                Skin Type: <strong className="text-slate-900">{activeClient.skinType}</strong> • Allergies: <strong className="text-slate-900">{activeClient.allergies.join(', ')}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold block">AI Health Score</span>
              <span className="text-2xl font-black text-cyan-800">{assessment.overallScore}/100</span>
            </div>
          </div>

          {/* AI Skin Assessment Insights */}
          <div className="bg-white/90 rounded-2xl p-4 border border-cyan-200 space-y-3 shadow-xs">
            <h4 className="font-extrabold text-base text-slate-900 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-cyan-700" />
              <span>AI Assessment Report</span>
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{assessment.aiSummary}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              {assessment.concerns.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900">{c.concern}</span>
                    <span className="text-[10px] font-bold text-cyan-900 bg-cyan-100 px-1.5 py-0.5 rounded-md">
                      {c.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium">{c.recommendationNote}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Routine Adjustment Editor */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-base text-slate-900">Assigned Morning & Evening Schedule</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white/90 rounded-2xl border border-cyan-100">
                <span className="font-bold text-cyan-800 block mb-1">Morning Steps</span>
                <ul className="space-y-1 text-slate-800 text-[11px] font-medium">
                  {routine.morningSteps.map((s) => (
                    <li key={s.id}>
                      • {s.productName} ({s.category})
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-cyan-50/90 rounded-2xl border border-cyan-200">
                <span className="font-bold text-cyan-900 block mb-1">Evening Steps</span>
                <ul className="space-y-1 text-slate-800 text-[11px] font-medium">
                  {routine.eveningSteps.map((s) => (
                    <li key={s.id}>
                      • {s.productName} ({s.category})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Consultant Notes & Approval */}
          <div className="space-y-2">
            <label className="block font-bold text-xs text-slate-900">
              Consultant Advice & Recommendation Notes
            </label>
            <textarea
              rows={3}
              value={consultantNotes}
              onChange={(e) => setConsultantNotes(e.target.value)}
              className="w-full p-3.5 text-xs border border-cyan-200 bg-white/90 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess && (
              <span className="text-xs font-bold text-cyan-800 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                <span>Recommendation Published to Client Dashboard!</span>
              </span>
            )}
            <div className="ml-auto flex space-x-2">
              <button
                onClick={handleSaveAssessmentNotes}
                className="px-5 py-2.5 rounded-2xl aqua-gradient-bg text-white font-bold text-xs shadow-md flex items-center space-x-2 hover:brightness-110 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Publish Recommendation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
