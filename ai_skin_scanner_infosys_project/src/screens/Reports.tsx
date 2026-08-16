import type { UserProfileData, ScanMetrics } from '../App';

interface ReportsProps {
  userProfile: UserProfileData;
  scanMetrics: ScanMetrics;
}

export const Reports: React.FC<ReportsProps> = ({ userProfile, scanMetrics }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">Clinical PDF Reports</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Download and print professional-grade diagnostic reports for dermatology consultation.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-tertiary text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">print</span>
          Print All Reports
        </button>
      </div>

      <div className="glass-card p-8 rounded-2xl border border-white/20 max-w-4xl mx-auto space-y-8 bg-white dark:bg-zinc-900 print:shadow-none print:border-none">
        
        {/* Report Header */}
        <div className="flex justify-between items-start border-b border-outline-variant/30 pb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-4xl font-bold">auto_awesome</span>
            <div>
              <h1 className="font-display text-xl font-bold text-on-surface leading-none">Aetheris AI Clinical Report</h1>
              <p className="text-[9px] text-on-surface-variant font-semibold uppercase tracking-wider mt-1">Molecular Dermatology &amp; Biometrics</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-on-surface">{userProfile.name}</p>
            <p className="text-[10px] text-on-surface-variant">Patient ID: #THOR-92849</p>
            <p className="text-[9px] text-on-surface-variant mt-1">Date generated: today</p>
          </div>
        </div>

        {/* Diagnostic Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low dark:bg-zinc-800/40 p-4 rounded-xl text-center border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Health Index</p>
            <h3 className="text-2xl font-display font-bold text-primary mt-1">{scanMetrics.score} / 100</h3>
            <p className="text-[8px] text-on-surface-variant mt-1">Optimal recovery parameters</p>
          </div>
          <div className="bg-surface-container-low dark:bg-zinc-800/40 p-4 rounded-xl text-center border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Skin Status</p>
            <h3 className="text-2xl font-display font-bold text-secondary mt-1">{userProfile.skinType}</h3>
            <p className="text-[8px] text-on-surface-variant mt-1">Redness index: {scanMetrics.redness}%</p>
          </div>
          <div className="bg-surface-container-low dark:bg-zinc-800/40 p-4 rounded-xl text-center border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Dermal Age</p>
            <h3 className="text-2xl font-display font-bold text-on-surface mt-1">26 Years</h3>
            <p className="text-[8px] text-on-surface-variant mt-1">Turnover rate matches baseline</p>
          </div>
        </div>

        {/* Detailed Assessment */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/10 pb-2">I. Biometric Assessment</h3>
          <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed text-on-surface dark:text-zinc-200">
            <div className="space-y-2">
              <p className="font-semibold text-primary">T-Zone Sebum Activity:</p>
              <p className="text-on-surface-variant text-[11px]">Sebum metrics reflect active lipids ({scanMetrics.oily}%) resulting in {scanMetrics.oily > 60 ? 'pore congestion' : 'minimal shine'}. Exfoliative salicylic treatments are recommended for routine inclusion.</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-secondary">Cheek Moisture Index:</p>
              <p className="text-on-surface-variant text-[11px]">Hydration index stands at {100 - scanMetrics.dryness}%, representing a {scanMetrics.dryness > 40 ? 'mild moisture deficit' : 'well-hydrated barrier'}. Increased use of humectants and ceramides is recommended.</p>
            </div>
          </div>
        </div>

        {/* Recommendations list */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/10 pb-2">II. Clinical Protocols</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Morning Routine Plan</h4>
              <ul className="list-disc pl-5 text-[11px] text-on-surface-variant space-y-1.5 leading-relaxed">
                <li>pH Balancing Cleanser (Salicylic Acid)</li>
                <li>Lumina C+ Molecular Serum (Brightening)</li>
                <li>SPF 50 Protection Factor</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Night Routine Plan</h4>
              <ul className="list-disc pl-5 text-[11px] text-on-surface-variant space-y-1.5 leading-relaxed">
                <li>Double cleansing milky wash</li>
                <li>Barrier Bio-Complex (Centella)</li>
                <li>Retinol 0.5% (Collagen induction)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Recommendations Table */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/10 pb-2">III. Recommended Product Formulations</h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 text-on-surface-variant text-[9px] font-bold uppercase tracking-wider">
                <th className="py-2">Product Formulation</th>
                <th className="py-2">Active Ingredients</th>
                <th className="py-2">Fit %</th>
                <th className="py-2 text-right">Dosage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface-variant text-[10px] font-medium">
              <tr>
                <td className="py-2.5 font-bold text-on-surface">Lumina C+ Molecular Serum</td>
                <td className="py-2.5">L-Ascorbic Acid, Ferulic Acid</td>
                <td className="py-2.5 text-primary font-bold">98% Match</td>
                <td className="py-2.5 text-right">4 drops in AM</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-on-surface">Barrier Bio-Complex Cream</td>
                <td className="py-2.5">Centella Asiatica, Ceramides</td>
                <td className="py-2.5 text-secondary font-bold">92% Match</td>
                <td className="py-2.5 text-right">Dime size in PM</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end border-t border-outline-variant/30 pt-8 mt-12 text-center text-xs">
          <div>
            <div className="w-32 border-b border-outline-variant/50 pb-1"></div>
            <p className="text-[9px] text-on-surface-variant uppercase tracking-wider mt-1.5 font-semibold">System AI Signature</p>
          </div>
          <div>
            <div className="w-32 border-b border-outline-variant/50 pb-1 italic font-semibold">Dr. S. Jenkins</div>
            <p className="text-[9px] text-on-surface-variant uppercase tracking-wider mt-1.5 font-semibold">Consulting Dermatologist</p>
          </div>
        </div>

      </div>
    </div>
  );
};
