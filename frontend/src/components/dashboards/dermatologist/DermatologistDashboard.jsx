import { useState } from 'react';
import ScoreRing from '@/components/shared/ScoreRing';
import Modal from '@/components/shared/Modal';

const PATIENTS = [
  { id: 1, name: 'Amara Okafor', score: 82, concern: 'Post-inflammatory hyperpigmentation', severity: 'Mild' },
  { id: 2, name: 'Priya Nair', score: 58, concern: 'Perioral dermatitis', severity: 'Moderate' },
  { id: 3, name: 'Noah Kim', score: 49, concern: 'Cystic acne, jawline', severity: 'Severe' },
];

const SEVERITY_STYLES = {
  Mild: 'bg-amber-light text-ink-800',
  Moderate: 'bg-slate-light text-ink-800',
  Severe: 'bg-ink-700 text-white',
};

export default function DermatologistDashboard() {
  const [selected, setSelected] = useState(null);
  const [treatmentNote, setTreatmentNote] = useState('');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PATIENTS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="card flex items-center gap-4 p-5 text-left transition-shadow hover:shadow-none hover:ring-2 hover:ring-ink-100"
          >
            <ScoreRing score={p.score} size={88} label="" />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-ink-800">{p.name}</p>
              <p className="truncate text-xs text-ink-400">{p.concern}</p>
              <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${SEVERITY_STYLES[p.severity]}`}>
                {p.severity}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div id="reports" className="card p-6">
        <p className="eyebrow">Clinical reporting</p>
        <h3 className="mb-2 font-display text-lg font-bold text-ink-800">Select a patient to add a treatment note</h3>
        <p className="text-sm text-ink-400">
          Selecting a patient card opens their clinical panel where you can log findings and recommend a treatment plan.
        </p>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
            <button
              className="btn-primary"
              onClick={() => {
                setSelected(null);
                setTreatmentNote('');
              }}
            >
              Save note
            </button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-surface-sunken p-3">
              <span className="text-xs font-semibold text-ink-500">Primary concern</span>
              <span className="text-sm font-medium text-ink-800">{selected.concern}</span>
            </div>
            <div>
              <label htmlFor="note" className="mb-1.5 block text-xs font-semibold text-ink-500">Treatment note</label>
              <textarea
                id="note"
                rows={4}
                value={treatmentNote}
                onChange={(e) => setTreatmentNote(e.target.value)}
                className="input-field resize-none"
                placeholder="e.g. Begin 0.025% tretinoin nightly, reassess in 6 weeks."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
