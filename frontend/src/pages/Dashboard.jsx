import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SkinScanner from '../components/SkinScanner';
import AnalysisResult from '../components/AnalysisResult';
import ProductCards from '../components/ProductCards';
import RoutinePlanner from '../components/RoutinePlanner';
import AnalyticsView from '../components/AnalyticsView';
import HistoryView from '../components/HistoryView';
import ComparisonView from '../components/ComparisonView';
import GlowAIChatbot from '../components/GlowAIChatbot';
import { analyzeSkin } from '../services/api';
import { Activity, ShieldCheck, AlertCircle, X } from 'lucide-react';

export default function Dashboard({ username, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analysisData, setAnalysisData] = useState(null);
  const [savedPreviewUrl, setSavedPreviewUrl] = useState(null);

  // Error shown when diagnostic API fails.
  // This prevents the entire Dashboard from becoming a blank page.
  const [analysisError, setAnalysisError] = useState('');

  // Updated: receives image + manual personalization details
  const handleAnalysis = async (imageFile, userDetails) => {
    try {
      // Clear previous error before starting a new analysis.
      setAnalysisError('');

      const data = await analyzeSkin(imageFile, userDetails);
      console.log(
  '========== 7 DAY ROUTINE FROM BACKEND =========='
);

console.log(
  'routine_7_day:',
  data?.routine_7_day
);

console.log(
  'routine_7_day type:',
  typeof data?.routine_7_day
);

console.log(
  'routine_7_day length:',
  data?.routine_7_day?.length
);

console.log(
  '================================================='
);

      // Safety check:
      // Do not allow an invalid/empty API response to crash the UI.
      if (!data || typeof data !== 'object') {
        throw new Error(
          'The server returned an invalid diagnostic response.'
        );
      }

      setAnalysisData(data);

    } catch (error) {
      console.error('Skin analysis failed:', error);

      let message = 'Unable to analyze the image. Please try again.';

      // Axios response error
      if (error?.response?.data?.detail) {
        const detail = error.response.data.detail;

        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail
            .map((item) => {
              if (typeof item === 'string') {
                return item;
              }

              if (item?.msg) {
                return item.msg;
              }

              return 'Invalid input.';
            })
            .join(' ');
        } else if (typeof detail === 'object' && detail !== null) {
          message =
            detail.msg ||
            detail.message ||
            'The server rejected the submitted information.';
        }
      } else if (error?.message) {
        message = error.message;
      }

      setAnalysisError(message);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return `Good morning ${username}! 😊`;
    }

    if (hour >= 12 && hour < 17) {
      return `Good afternoon ${username}! 😊`;
    }

    return `Good evening ${username}! 😊`;
  };

  const healthScore = analysisData
    ? Math.round((analysisData.confidence || 0.88) * 92)
    : 0;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">

      {/* 1. SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        <Header
          username={username}
          onLogout={onLogout}
          setActiveTab={setActiveTab}
        />

        <main className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">

          {/* ================= DASHBOARD & SCANNER ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">

              {/* Greeting Header */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {getGreeting()}
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Biometric Skin Health Analysis & Personal Skincare Studio
                </p>
              </div>

              {/* Error Banner */}
              {analysisError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-red-800">
                      Diagnostic request failed
                    </p>

                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                      {analysisError}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAnalysisError('')}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Health Score & Condition Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Skin Health Score */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Skin Health Score
                    </span>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-emerald-600">
                        {analysisData ? healthScore : 'None'}
                      </span>

                      {analysisData && (
                        <span className="text-xs font-bold text-slate-400">
                          /100
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-emerald-600/90 mt-0.5 block">
                      {analysisData
                        ? 'Clinical Accuracy Assessment'
                        : 'Awaiting Image Upload'}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>

                {/* Classified Condition */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Classified Condition
                    </span>

                    <span className="text-2xl font-black text-slate-900 capitalize block">
                      {analysisData?.predicted_class || 'None'}
                    </span>

                    <span className="text-xs text-slate-400 mt-0.5 block">
                      {analysisData
                        ? 'Primary Model Vector Target'
                        : 'Upload photo to analyze'}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Biometric Diagnostic Studio */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                <div className="lg:col-span-5">
                  <SkinScanner
                    onAnalysisComplete={handleAnalysis}
                    savedPreviewUrl={savedPreviewUrl}
                    setSavedPreviewUrl={setSavedPreviewUrl}
                  />
                </div>

                <div className="lg:col-span-7">
                  <AnalysisResult result={analysisData} />
                </div>

              </div>
            </div>
          )}

          {/* ================= DEDICATED TAB VIEWS ================= */}

          {activeTab === 'comparison' && (
            <ComparisonView
              activeAnalysis={analysisData}
              savedPreviewUrl={savedPreviewUrl}
            />
          )}

          {activeTab === 'routine' && (
            <RoutinePlanner
              routineData={analysisData?.routine_7_day}
              skinConcern={analysisData?.predicted_class || 'Acne'}
              recommendedProducts={
                analysisData?.recommended_products || []
              }
            />
          )}

          {activeTab === 'products' && (
            <ProductCards
              products={analysisData?.recommended_products}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              analysisData={analysisData}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              activeAnalysis={analysisData}
              savedPreviewUrl={savedPreviewUrl}
              setSavedPreviewUrl={setSavedPreviewUrl}
            />
          )}

        </main>

        {/* Floating GlowAI Chatbot */}
        <GlowAIChatbot />

      </div>
    </div>
  );
}