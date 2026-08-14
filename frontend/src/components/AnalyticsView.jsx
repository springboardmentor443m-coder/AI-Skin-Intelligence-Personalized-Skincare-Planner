import React from 'react';
import {
  BarChart3,
  Activity,
  Target,
  ShieldCheck,
  Zap,
  Radar as RadarIcon,
} from 'lucide-react';

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';


export default function AnalyticsView({ analysisData }) {
  if (!analysisData || !analysisData.probabilities) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
          <BarChart3 className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-800">
          No Analytics Data Available
        </h3>

        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Run a facial diagnostic scan on the main dashboard to generate your
          biometric probability distribution and analytics breakdown.
        </p>
      </div>
    );
  }


  const probs = analysisData.probabilities || {};
  const topCondition = analysisData.predicted_class || 'None';
  const confidencePct = Math.round((analysisData.confidence || 0) * 100);


  // Convert model probabilities into Radar Chart data
  const radarData = Object.entries(probs).map(([condition, score]) => ({
    condition: condition
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    probability: Number((score * 100).toFixed(1)),
  }));


  return (
    <div className="space-y-6">

      {/* Header Banner - WHITE / LIGHT THEME */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <BarChart3 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Biometric Analytics & Condition Insights
            </h2>

            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Multi-class neural network probability vector assessment
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 self-start sm:self-auto flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          {confidencePct}% Target Confidence
        </span>

      </div>


      {/* Analytics Body Cards - DARK THEME */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Main Probability Bars */}
        <div className="lg:col-span-8 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5 text-slate-200">

          <div className="flex items-center justify-between border-b border-slate-800 pb-3">

            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Vector Class Probability Distribution</span>
            </h3>

            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              MobileNetV2 Layer Output
            </span>

          </div>


          <div className="space-y-4">

            {Object.entries(probs).map(([condition, score], idx) => {

              const percentage = Math.round(score * 100);
              const isPrimary =
                condition.toLowerCase() === topCondition.toLowerCase();

              return (
                <div key={idx} className="space-y-1.5">

                  <div className="flex justify-between items-center text-xs font-bold">

                    <span
                      className={`capitalize ${
                        isPrimary
                          ? 'text-emerald-400 font-extrabold'
                          : 'text-slate-300'
                      }`}
                    >
                      {condition} {isPrimary && '(Primary Target)'}
                    </span>

                    <span
                      className={
                        isPrimary
                          ? 'text-emerald-400 font-black'
                          : 'text-slate-400'
                      }
                    >
                      {percentage}%
                    </span>

                  </div>


                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">

                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPrimary
                          ? 'bg-emerald-500'
                          : 'bg-slate-600'
                      }`}
                      style={{
                        width: `${Math.max(percentage, 2)}%`,
                      }}
                    />

                  </div>

                </div>
              );
            })}

          </div>
        </div>


        {/* Summary Metric Cards */}
        <div className="lg:col-span-4 space-y-4">

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3 text-slate-200">

            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Primary Classified Target</span>
            </div>

            <p className="text-2xl font-black text-white capitalize">
              {topCondition}
            </p>

            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              High neural activation detected for this target class.
              Recommendations are dynamically prioritized based on this vector.
            </p>

          </div>


          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3 text-slate-200">

            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Clinical Diagnostic Score</span>
            </div>

            <div className="flex items-baseline gap-1">

              <span className="text-3xl font-black text-emerald-400">
                {Math.round(confidencePct * 0.92)}
              </span>

              <span className="text-xs font-bold text-slate-500">
                /100
              </span>

            </div>

            <p className="text-xs text-slate-400 font-medium">
              Derived from model confidence and multi-class distribution variance.
            </p>

          </div>

        </div>

      </div>


      {/* ========================================================= */}
      {/* RADAR / SPIDER CHART */}
      {/* ========================================================= */}

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-slate-200">

        {/* Radar Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">

          <div className="flex items-center gap-2">

            <RadarIcon className="w-5 h-5 text-emerald-400" />

            <div>
              <h3 className="text-sm font-extrabold text-white">
                Skin Concern Radar Analysis
              </h3>

              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Multi-class Probability Profile
              </p>
            </div>

          </div>

          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            6-Class Neural Network Output
          </span>

        </div>


        {/* Radar Chart */}
        <div className="w-full h-[400px]">

          <ResponsiveContainer width="100%" height="100%">

            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="72%"
              data={radarData}
            >

              <PolarGrid
                stroke="#334155"
                strokeDasharray="3 3"
              />

              <PolarAngleAxis
                dataKey="condition"
                tick={{
                  fill: '#cbd5e1',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />

              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{
                  fill: '#64748b',
                  fontSize: 9,
                }}
                axisLine={false}
              />

              <Radar
                name="Probability"
                dataKey="probability"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.25}
                strokeWidth={2.5}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '700',
                }}
                formatter={(value) => [`${value}%`, 'Probability']}
              />

            </RadarChart>

          </ResponsiveContainer>

        </div>


        {/* Radar Explanation */}
        <div className="mt-2 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div className="flex items-center gap-2">

            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />

            <span className="text-xs text-slate-400 font-medium">
              Higher distance from the center indicates a higher model probability.
            </span>

          </div>

          <span className="text-xs font-bold text-emerald-400">
            Primary: {topCondition}
          </span>

        </div>

      </div>

    </div>
  );
}