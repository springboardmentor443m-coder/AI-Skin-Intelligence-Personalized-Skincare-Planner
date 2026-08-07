import React, { useState } from 'react';
import type { UserProfileData, ScanMetrics } from '../App';

interface Patient {
  id: number;
  name: string;
  age: number;
  aiDiagnosis: string;
  clinicalNotes: string;
  status: string;
}

interface DermatologistDashboardProps {
  userProfile: UserProfileData;
  scanMetrics: ScanMetrics;
}

export const DermatologistDashboard: React.FC<DermatologistDashboardProps> = ({ userProfile, scanMetrics }) => {
  const [patients, setPatients] = useState<Patient[]>([
    { id: 1, name: userProfile.name, age: 26, aiDiagnosis: `Elevated T-Zone Sebum (${scanMetrics.oily}%), Cheek Redness (${scanMetrics.redness}%), Moisture (${100 - scanMetrics.dryness}%)`, clinicalNotes: 'Suggesting Salicylic Acid AM routine + Centella Asiatica in PM. Avoid mixing with Ascorbic Acid.', status: 'Review Complete' },
    { id: 2, name: 'Marcus Sterling', age: 34, aiDiagnosis: 'Mild Acne Congestion, Optimal Hydration', clinicalNotes: 'Prescribing Adapalene gel at night. Keep daily SPF 50.', status: 'Awaiting Signature' },
  ]);

  React.useEffect(() => {
    setPatients(prev => prev.map(p => {
      if (p.id === 1) {
        return {
          ...p,
          name: userProfile.name,
          aiDiagnosis: `Elevated T-Zone Sebum (${scanMetrics.oily}%), Cheek Redness (${scanMetrics.redness}%), Moisture (${100 - scanMetrics.dryness}%)`
        };
      }
      return p;
    }));
  }, [scanMetrics, userProfile.name]);

  const [selectedId, setSelectedId] = useState(1);
  const selectedPatient = patients.find(p => p.id === selectedId) || patients[0];

  const handleUpdateNotes = (notes: string) => {
    setPatients(patients.map(p => p.id === selectedId ? { ...p, clinicalNotes: notes } : p));
  };

  const handleSaveNotes = () => {
    alert(`Clinical notes saved and signed off for patient ${selectedPatient.name}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Dermatology Clinical Portal</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-1">Review biometric diagnostic outputs, write medical-grade treatment prescriptions, and validate AI models.</p>
      </div>

      <div className="grid grid-cols-12 gap-card-gap">
        {/* Patient Selection list */}
        <div className="col-span-12 lg:col-span-4 glass-card p-6 rounded-2xl border border-white/20">
          <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider mb-4">Patient Queue</h3>
          <div className="space-y-2">
            {patients.map(p => (
              <div 
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                  p.id === selectedId 
                    ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                    : 'bg-surface-container-low dark:bg-zinc-800/40 border-transparent text-on-surface hover:border-outline-variant/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold">{p.name}</h4>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'Review Complete' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-medium mt-1.5 truncate">AI: {p.aiDiagnosis}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic Notes Editor */}
        <div className="col-span-12 lg:col-span-8 glass-card p-6 rounded-2xl border border-white/20 flex flex-col justify-between min-h-[400px]">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-outline-variant/10 pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-on-surface">{selectedPatient.name}</h3>
                <p className="text-[10px] text-on-surface-variant font-semibold uppercase mt-0.5">Age: {selectedPatient.age} • Biometric Evaluation Logs</p>
              </div>
              <button 
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-secondary text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Sign &amp; Approve
              </button>
            </div>

            <div className="space-y-4">
              {/* AI Diagnosis Panel */}
              <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Biometric Findings</span>
                </div>
                <p className="text-xs text-on-surface font-medium leading-relaxed">{selectedPatient.aiDiagnosis}</p>
              </div>

              {/* Treatment Notes Input */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="treatmentNotes">Clinical Treatment Notes &amp; Formulas</label>
                <textarea
                  id="treatmentNotes"
                  value={selectedPatient.clinicalNotes}
                  onChange={(e) => handleUpdateNotes(e.target.value)}
                  rows={5}
                  className="w-full p-4 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 focus:border-primary/20 focus:ring-0 rounded-2xl text-xs text-on-surface leading-relaxed focus:outline-none"
                  placeholder="Enter medical treatment recommendations, contraindicated ingredients, etc..."
                />
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant/10 pt-4 mt-6 flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
            <span>Dermatologist: Dr. Sarah Jenkins</span>
            <span>Aetheris Medical Credentials V2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
