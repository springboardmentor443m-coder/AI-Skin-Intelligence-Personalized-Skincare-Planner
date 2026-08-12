import React, { useState } from 'react';
import {
  FileText,
  Printer,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsAndExports = ({ reports, userProfile }) => {
  const [selectedReport, setSelectedReport] = useState(reports[0]);
  const [exportNotice, setExportNotice] = useState('');

  const handleExportCSV = async (report) => {
    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report, format: 'csv' }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skincare_report_${report.id}.csv`;
      a.click();
      setExportNotice(`Exported report ${report.id} to CSV.`);
      setTimeout(() => setExportNotice(''), 3000);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="aqua-gradient-bg rounded-3xl p-6 text-white shadow-xl border border-cyan-300/40 aqua-glow relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-white border border-white/30">
            <FileText className="w-3.5 h-3.5 text-cyan-200" />
            <span>Clinical Documentation & Report Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Clinical Reports & PDF / Excel Exporter
          </h2>
          <p className="text-xs sm:text-sm text-cyan-50 font-medium max-w-2xl">
            Generate certified dermatological reports, active chemical routine schedules, and longitudinal exports.
          </p>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 bg-cyan-100 border border-cyan-300 text-cyan-900 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-cyan-700" />
          <span>{exportNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Directory */}
        <div className="apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900">Clinical & Skin Reports</h3>
          <div className="space-y-2">
            {reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedReport.id === rep.id
                    ? 'bg-cyan-100/90 border-cyan-400 font-bold shadow-xs'
                    : 'bg-white/80 hover:bg-cyan-50 border-cyan-100 font-medium'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">{rep.type}</span>
                  <span className="text-[10px] text-slate-500">{rep.generatedAt}</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2">{rep.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formatted Report View & Printable Layout */}
        <div className="lg:col-span-2 apple-glass rounded-3xl p-6 border border-cyan-200/60 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-cyan-100">
            <div>
              <span className="text-[10px] font-extrabold text-cyan-800 uppercase tracking-wider block">
                Official Clinical Telemetry Record
              </span>
              <h3 className="font-extrabold text-xl text-slate-900">{selectedReport.type}</h3>
              <p className="text-xs text-slate-600 font-medium">Patient: {selectedReport.userName} • Date: {selectedReport.generatedAt}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExportCSV(selectedReport)}
                className="px-3.5 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-900 border border-cyan-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-700" />
                <span>Excel/CSV</span>
              </button>

              <button
                onClick={handleTriggerPrint}
                className="px-3.5 py-2 aqua-gradient-bg text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all hover:brightness-110"
              >
                <Printer className="w-4 h-4" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          {/* Printable Report Box */}
          <div className="p-6 bg-white/90 rounded-2xl border border-cyan-200 space-y-4 print:p-0 print:bg-white text-xs shadow-xs">
            <div className="flex items-center justify-between border-b border-cyan-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl aqua-gradient-bg text-white flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-5 h-5 text-cyan-100" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">DermaGlow Clinical Platform</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Clinical Dermatological Telemetry & Active Composition Assessment</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block font-bold">Health Score</span>
                <span className="text-2xl font-black text-cyan-800">{selectedReport.score}/100</span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-extrabold text-sm text-slate-900">1. Executive Clinical Summary</h5>
              <p className="text-slate-800 leading-relaxed p-3.5 bg-cyan-50/80 rounded-xl border border-cyan-100 font-medium">
                {selectedReport.summary}
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-extrabold text-sm text-slate-900">2. Identified Skin Profile Concerns</h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedReport.concernsList.map((c, i) => (
                  <span key={i} className="px-3 py-1 bg-cyan-100 text-cyan-900 border border-cyan-300 rounded-lg text-xs font-bold">
                    • {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-extrabold text-sm text-slate-900">3. Prescribed Chemical Composition Routine</h5>
              <p className="text-slate-900 leading-relaxed p-3.5 bg-cyan-50/80 rounded-xl border border-cyan-100 font-mono text-[11px] font-medium">
                {selectedReport.prescribedPlan}
              </p>
            </div>

            <div className="pt-4 border-t border-cyan-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span className="flex items-center space-x-1 text-cyan-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span>Verified by Board Certified Dermatologist & Gemini AI</span>
              </span>
              <span>Report ID: {selectedReport.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
