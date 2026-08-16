import React, { useState, useEffect, useRef } from 'react';
import { useAuth, api } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Activity, 
  Clock, 
  Stethoscope, 
  Users, 
  Settings, 
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  UploadCloud,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Flame,
  Award
} from 'lucide-react';

export const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [roleData, setRoleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI Scanner & Assessment States
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  
  const [assessment, setAssessment] = useState(null);
  const [overrides, setOverrides] = useState(null);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  
  const fileInputRef = useRef(null);


  const role = user?.role || 'user';

  // 1. Fetch Practitioner/Admin Stats
  useEffect(() => {
    const fetchRoleDashboardData = async () => {
      if (role === 'user') return;
      
      setLoading(true);
      setError('');
      try {
        let endpoint = '';
        if (role === 'dermatologist') endpoint = '/users/dermatologist-dashboard';
        else if (role === 'consultant') endpoint = '/users/consultant-dashboard';
        else if (role === 'admin') endpoint = '/users/admin-dashboard';

        if (endpoint) {
          const response = await api.get(endpoint);
          setRoleData(response.data);
        }
      } catch (err) {
        console.error('Error fetching role dashboard data:', err);
        setError(err.response?.data?.detail || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoleDashboardData();
  }, [role]);

  // 2. Fetch User Latest Skin Assessment
  const fetchAssessment = async () => {
    if (role !== 'user') return;
    setLoadingAssessment(true);
    try {
      const response = await api.get('/assessment/latest');
      setAssessment(response.data);
    } catch (err) {
      console.error('Failed to load assessment report:', err);
    } finally {
      setLoadingAssessment(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [role]);

  // Dynamic overrides sync & local assessment recalculations
  useEffect(() => {
    if (assessment) {
      setOverrides({
        acne: assessment.acne_level || 'none',
        dryness: assessment.dryness_level || 'none',
        oiliness: assessment.oiliness_level || 'none',
        pigmentation: assessment.pigmentation_level || 'none',
        sensitivity: assessment.sensitivity_level || 'none',
        wrinkles: assessment.wrinkle_level || 'none',
        health_score: assessment.health_score || 95
      });
    } else {
      setOverrides(null);
    }
  }, [assessment]);

  const handleOverrideChange = (key, val) => {
    setOverrides(prev => {
      if (!prev) return prev;
      const next = { ...prev, [key]: val };
      
      const skinType = user?.profile?.skin_type || "normal";
      const baseScores = {
        normal: 95,
        dry: 85,
        oily: 80,
        combination: 82,
        sensitive: 78
      };
      const base = baseScores[skinType] || 90;
      
      let deductions = 0;
      if (next.acne === 'severe') deductions += 18;
      else if (next.acne === 'moderate') deductions += 12;
      else if (next.acne === 'mild') deductions += 8;
      
      if (next.dryness === 'severe') deductions += 15;
      else if (next.dryness === 'moderate') deductions += 8;
      else if (next.dryness === 'mild') deductions += 6;
      
      if (next.oiliness === 'severe') deductions += 15;
      else if (next.oiliness === 'moderate') deductions += 8;
      else if (next.oiliness === 'mild') deductions += 6;
      
      if (next.pigmentation === 'severe') deductions += 10;
      else if (next.pigmentation === 'moderate') deductions += 10;
      else if (next.pigmentation === 'mild') deductions += 6;
      
      if (next.sensitivity === 'severe') deductions += 18;
      else if (next.sensitivity === 'moderate') deductions += 10;
      else if (next.sensitivity === 'mild') deductions += 8;
      
      if (next.wrinkles === 'severe') deductions += 16;
      else if (next.wrinkles === 'moderate') deductions += 10;
      else if (next.wrinkles === 'mild') deductions += 6;
      
      next.health_score = Math.max(30, Math.min(100, base - deductions));
      return next;
    });
  };

  const getDynamicDetails = () => {
    if (!assessment || !overrides) {
      return {
        health_score: 95,
        risk_factors: [],
        recommendations: ["Maintain skin health with a broad-spectrum sunscreen and gentle daily humectant."]
      };
    }

    const skinType = user?.profile?.skin_type || "normal";
    const risk_factors = [];
    const recommendations = [];

    if (skinType === "oily" || overrides.oiliness === "severe") {
      risk_factors.push("Hyperactive Sebum: High risk of clogged pores and breakouts.");
    }
    if (skinType === "dry" || overrides.dryness === "severe") {
      risk_factors.push("Barrier Lipid Deficit: Susceptible to severe dehydration and peeling.");
    }
    if (skinType === "sensitive" || overrides.sensitivity !== "none") {
      risk_factors.push("Impaired Moisture Barrier: Vulnerable to contact dermatitis and redness.");
    }
    if (user?.profile?.age > 40) {
      risk_factors.push("Natural Collagen Decline: Susceptible to structural elasticity loss.");
    }
    if (user?.profile?.allergy_details) {
      risk_factors.push(`Topical Reactivity: High risk of allergic flare-up due to: ${user.profile.allergy_details}`);
    }

    if (overrides.acne !== "none") {
      recommendations.push("Incorporate Salicylic Acid (BHA 2%) to clean sebum out of pores.");
    }
    if (overrides.dryness !== "none") {
      recommendations.push("Use Ceramide-rich moisturizers to restore skin barrier lipids.");
    }
    if (overrides.sensitivity !== "none") {
      recommendations.push("Avoid physical scrubs and alcohols. Use Centella Asiatica or Panthenol.");
    }
    if (overrides.wrinkles !== "none") {
      recommendations.push("Add Retinol or Peptide serums to promote collagen production.");
    }
    if (overrides.pigmentation !== "none") {
      recommendations.push("Use Vitamin C or Alpha Arbutin to fade dark spots.");
    }

    if (recommendations.length === 0) {
      recommendations.push("Maintain skin health with a broad-spectrum sunscreen and gentle basic daily humectant.");
    }

    return {
      health_score: overrides.health_score,
      risk_factors,
      recommendations
    };
  };


  // AI Scanner Handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setScanError('Please select a valid image file (PNG, JPG).');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setScanResult(null);
      setScanError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith('image/')) {
        setScanError('Please drop a valid image file.');
        return;
      }
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setScanResult(null);
      setScanError('');
    }
  };

  const clearPhoto = () => {
    setFile(null);
    setPreview(null);
    setScanResult(null);
    setScanError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzeSkin = async () => {
    if (!file) return;
    setScanning(true);
    setScanError('');
    setScanResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step A: Trigger AI Image Classification Scan
      const response = await api.post('/ai/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setScanResult(response.data);
      
      // Step B: Calculate and save comprehensive Skin Health Assessment
      const resCalculate = await api.post('/assessment/calculate');
      setAssessment(resCalculate.data);
      
      refreshUser(); // sync layout state
    } catch (err) {
      console.error(err);
      setScanError(
        err.response?.data?.detail || 
        'An error occurred during skin analysis. Please ensure the AI model is trained.'
      );
    } finally {
      setScanning(false);
    }
  };

  // Helper for circular progress
  const renderHealthScoreDial = (score) => {
    const radius = 45;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getColor = (s) => {
      if (s < 55) return '#f43f5e'; // rose-500
      if (s < 75) return '#f59e0b'; // amber-500
      return '#10b981'; // emerald-500
    };

    const getBgColor = (s) => {
      if (s < 55) return 'rgba(244, 63, 94, 0.1)';
      if (s < 75) return 'rgba(245, 158, 11, 0.1)';
      return 'rgba(16, 185, 129, 0.1)';
    };

    const color = getColor(score);

    return (
      <div className="relative flex flex-col items-center justify-center p-4 rounded-2xl" style={{ backgroundColor: getBgColor(score) }}>
        <svg height={105} width={105} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            stroke="rgba(200, 200, 200, 0.15)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={52.5}
            cy={52.5}
          />
          {/* Progress circle */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={52.5}
            cy={52.5}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{score}</span>
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Score</span>
        </div>
      </div>
    );
  };

  // Helper to map severity levels to styled interactive bars
  const renderConcernBar = (label, key, level) => {
    const levelConfigs = {
      none: { width: '8%', color: 'bg-slate-200 dark:bg-slate-700', text: 'None', textClass: 'text-slate-400' },
      mild: { width: '33%', color: 'bg-emerald-500', text: 'Mild', textClass: 'text-emerald-500 font-bold' },
      moderate: { width: '66%', color: 'bg-amber-500', text: 'Moderate', textClass: 'text-amber-500 font-bold' },
      severe: { width: '100%', color: 'bg-rose-500', text: 'Severe', textClass: 'text-rose-500 font-bold' }
    };

    const cfg = levelConfigs[level] || levelConfigs.none;

    return (
      <div className="space-y-2.5 p-3.5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-brand-500/20 hover:shadow-md hover:shadow-brand-500/2 transition-all duration-300">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-350 capitalize">{label}</span>
          <span className={`text-[10px] uppercase tracking-wider ${cfg.textClass}`}>{cfg.text}</span>
        </div>
        
        {/* Progress line indicator */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-550 ease-out ${cfg.color}`} style={{ width: cfg.width }} />
        </div>
        
        {/* Interactive manual tuning switches */}
        <div className="flex justify-between gap-1.5 pt-1">
          {['none', 'mild', 'moderate', 'severe'].map((lvl) => {
            const isActive = level === lvl;
            const buttonColors = {
              none: isActive ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80',
              mild: isActive ? 'bg-emerald-500 text-white font-black shadow-sm shadow-emerald-500/10' : 'text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-500',
              moderate: isActive ? 'bg-amber-500 text-white font-black shadow-sm shadow-amber-500/10' : 'text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-500',
              severe: isActive ? 'bg-rose-500 text-white font-black shadow-sm shadow-rose-500/10' : 'text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500'
            };
            return (
              <button
                key={lvl}
                onClick={() => handleOverrideChange(key, lvl)}
                className={`flex-1 py-1 text-[9px] uppercase font-bold rounded-lg transition-all duration-150 cursor-pointer ${buttonColors[lvl]}`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const triggerPresetScan = async (skinType) => {
    setScanning(true);
    setScanError('');
    setScanResult(null);
    setPreview(null);
    
    // Set mock placeholder preview of unsplash face scan
    setPreview('https://images.unsplash.com/photo-1522337360788-8b13edd793be?w=400&q=80');
    
    try {
      // Step A: Trigger backend preset scanner using research folder validation image
      const response = await api.post(`/ai/analyze-preset?skin_type=${skinType}`);
      setScanResult(response.data);
      
      // Step B: Calculate Skin Health Assessment based on newly updated preset concerns
      const resCalculate = await api.post('/assessment/calculate');
      setAssessment(resCalculate.data);
      
      refreshUser(); // sync layout state
    } catch (err) {
      console.error(err);
      setScanError(
        err.response?.data?.detail || 
        'An error occurred during preset skin analysis.'
      );
    } finally {
      setScanning(false);
    }
  };


  // Sub-components for dashboards
  const UserDashboardView = () => {
    const profile = user?.profile;

    return (
      <div className="space-y-6">
        {/* Banner Card */}
        <Card className="bg-gradient-to-r from-brand-500 to-orange-400 text-white relative overflow-hidden" glass={false}>
          <div className="absolute top-0 right-0 w-64 h-full bg-white/10 skew-x-12 translate-x-12 pointer-events-none" />
          <h2 className="text-xl md:text-2xl font-bold">Hello, {user?.full_name || 'Skincare Enthusiast'}!</h2>
          <p className="text-sm text-brand-50/90 mt-1 max-w-xl">
            Welcome to your AI skin intelligence center. Ready to analyze your skin and check your personalized routine?
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate('/profile')}>
              Update Skin Profile
            </Button>
          </div>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex items-start gap-4">
            <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Skin Type</span>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase mt-0.5">
                {profile?.skin_type || 'Not Set'}
              </p>
            </div>
          </Card>

          <Card className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Primary Concerns</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {profile?.concerns?.length > 0 ? profile.concerns.map(c => c.replace('_', ' ')).join(', ') : 'None Added'}
              </p>
            </div>
          </Card>

          <Card className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Skin Health Score</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {assessment ? `${assessment.health_score} / 100` : 'Not Evaluated'}
              </p>
            </div>
          </Card>
        </div>

        {/* AI Scanner Widget */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-500" />
              AI Skin Scan & Diagnostics
            </h3>
            {scanResult && (
              <button onClick={clearPhoto} className="text-xs text-brand-500 hover:underline flex items-center gap-0.5 font-semibold cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" /> Scan Another Photo
              </button>
            )}
          </div>

          {scanError && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-xs font-medium text-red-700 dark:text-red-400 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-bold">Scan Failed</p>
                <p className="mt-0.5 leading-relaxed">{scanError}</p>
              </div>
            </div>
          )}

          {!scanResult ? (
            <div className="space-y-4">
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 max-h-[300px] flex items-center justify-center">
                  <img src={preview} alt="Facial skin preview" className="max-h-[300px] w-auto object-contain" />
                  
                  {scanning && (
                    <>
                      <div className="scanner-line" />
                      <div className="absolute inset-0 bg-brand-500/10 flex flex-col items-center justify-center gap-2 backdrop-blur-xs">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
                        <span className="text-xs font-bold text-white tracking-wider uppercase drop-shadow-md">
                          Running assessment calculations...
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl flex flex-col items-center justify-center py-12 transition-colors duration-200 cursor-pointer bg-slate-50/50 dark:bg-slate-900/30"
                >
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Drag facial scan image here</span>
                  <span className="text-xs text-slate-400 mt-1">or click to browse (JPEG/PNG)</span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  
                  {/* Preset Quick Scan options */}
                  <div className="mt-6 w-full max-w-xs border-t border-slate-200/50 dark:border-slate-800/40 pt-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-wider">Or Use A Demo Scan Preset:</span>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {['normal', 'dry', 'oily', 'combination', 'sensitive'].map((type) => (
                        <button
                          key={type}
                          onClick={() => triggerPresetScan(type)}
                          className="px-2.5 py-1 bg-white hover:bg-brand-500 hover:text-white dark:bg-slate-850 dark:hover:bg-brand-500 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg border border-slate-250/60 dark:border-slate-800 transition-colors shadow-xs cursor-pointer"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              )}

              {preview && !scanning && (
                <div className="flex gap-3">
                  <Button onClick={analyzeSkin} className="flex-1">
                    Start AI Diagnosis & Assessment
                  </Button>
                  <Button variant="secondary" onClick={clearPhoto}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-brand-50/40 dark:bg-slate-900/40 border border-brand-200/10 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">AI image processed successfully. Details integrated into the report below.</span>
              </div>
            </div>
          )}
        </Card>

        {/* Dynamic Skin Health Assessment Report */}
        {assessment && overrides && (
          (() => {
            const getProbabilitiesList = (skinType) => {
              if (scanResult && scanResult.probabilities) {
                return Object.entries(scanResult.probabilities).map(([k, v]) => ({
                  label: k,
                  percent: Math.round(v * 100)
                })).sort((a, b) => b.percent - a.percent);
              }
              const defaults = {
                dry: [
                  { label: 'dry', percent: 94 },
                  { label: 'normal', percent: 3 },
                  { label: 'sensitive', percent: 2 },
                  { label: 'combination', percent: 1 },
                  { label: 'oily', percent: 0 }
                ],
                oily: [
                  { label: 'oily', percent: 92 },
                  { label: 'combination', percent: 5 },
                  { label: 'normal', percent: 2 },
                  { label: 'dry', percent: 1 },
                  { label: 'sensitive', percent: 0 }
                ],
                combination: [
                  { label: 'combination', percent: 89 },
                  { label: 'oily', percent: 6 },
                  { label: 'dry', percent: 4 },
                  { label: 'normal', percent: 1 },
                  { label: 'sensitive', percent: 0 }
                ],
                sensitive: [
                  { label: 'sensitive', percent: 91 },
                  { label: 'dry', percent: 5 },
                  { label: 'normal', percent: 3 },
                  { label: 'combination', percent: 1 },
                  { label: 'oily', percent: 0 }
                ],
                normal: [
                  { label: 'normal', percent: 96 },
                  { label: 'dry', percent: 2 },
                  { label: 'oily', percent: 1 },
                  { label: 'combination', percent: 1 },
                  { label: 'sensitive', percent: 0 }
                ]
              };
              return defaults[skinType?.toLowerCase()] || defaults.normal;
            };

            const dynDetails = getDynamicDetails();
            const probs = getProbabilitiesList(assessment.skin_type || user?.profile?.skin_type || "normal");

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in print:p-8 print:bg-white print:text-slate-900">
                {/* Clinical Header (visible in prints/downloads) */}
                <div className="lg:col-span-3 flex justify-between items-center pb-4 border-b border-slate-200/60 dark:border-slate-800">
                  <div className="text-left space-y-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-black text-brand-500">Dermatological Analytics Summary</span>
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-brand-500" /> AuraSkin Clinical Diagnostic Report
                    </h3>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.print()}
                    className="cursor-pointer bg-white dark:bg-slate-900 font-bold print:hidden"
                  >
                    Print / Save PDF
                  </Button>
                </div>

                {/* Left Panel: overall health indices & probabilities bar chart */}
                <div className="space-y-6">
                  {/* Gauge score Dial */}
                  <Card className="flex flex-col items-center justify-center text-center space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Award className="w-4 h-4 text-brand-500" /> Overall Health Index
                    </h4>
                    {renderHealthScoreDial(dynDetails.health_score)}
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {dynDetails.health_score >= 75 ? 'Healthy Skin Barrier' : dynDetails.health_score >= 55 ? 'Optimizable Skin State' : 'Impaired Moisture Barrier'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Evaluated relative to active concerns, age demographics, and structural barrier integrity.
                      </p>
                    </div>
                  </Card>

                  {/* CNN Model Probabilities Breakdown Graph */}
                  <Card className="space-y-3.5 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 border-b border-slate-150 dark:border-slate-800/80 pb-2">
                      <Activity className="w-4 h-4 text-brand-500" /> CNN Classifier Probability Map
                    </h4>
                    
                    <div className="space-y-2">
                      {probs.map((p) => (
                        <div key={p.label} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                            <span>{p.label}</span>
                            <span>{p.percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                p.percent > 70 
                                  ? 'bg-brand-500' 
                                  : p.percent > 20 
                                    ? 'bg-amber-400' 
                                    : 'bg-slate-300 dark:bg-slate-750'
                              }`} 
                              style={{ width: `${p.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Severity Concern Bars Panel (Toggles) */}
                <Card className="lg:col-span-2 space-y-4 text-left">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Flame className="w-4 h-4 text-orange-500" /> Detected Concern Intensities
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderConcernBar("Acne severity", "acne", overrides.acne)}
                    {renderConcernBar("Dryness (Barrier loss)", "dryness", overrides.dryness)}
                    {renderConcernBar("Oiliness (Excess sebum)", "oiliness", overrides.oiliness)}
                    {renderConcernBar("Hyperpigmentation", "pigmentation", overrides.pigmentation)}
                    {renderConcernBar("Redness & Sensitivity", "sensitivity", overrides.sensitivity)}
                    {renderConcernBar("Fine lines & Wrinkles", "wrinkles", overrides.wrinkles)}
                  </div>
                </Card>

                {/* Risks & Recommendations Full Width Panels */}
                <Card className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 pb-1 border-b border-slate-100 dark:border-slate-800">
                      <ShieldAlert className="w-4 h-4 text-red-500" /> Risk Analysis & Alerts
                    </h4>
                    <ul className="space-y-2">
                      {dynDetails.risk_factors.map((rf, idx) => (
                        <li key={idx} className="text-xs p-2.5 bg-red-50/50 dark:bg-red-950/10 border-l-4 border-red-500 text-slate-650 dark:text-slate-400 rounded-r-lg">
                          {rf}
                        </li>
                      ))}
                      {dynDetails.risk_factors.length === 0 && (
                        <li className="text-xs text-slate-400 italic">No critical risk triggers identified.</li>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 pb-1 border-b border-slate-100 dark:border-slate-800">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> Active Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {dynDetails.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-xs p-2.5 bg-emerald-50/50 dark:bg-emerald-950/10 border-l-4 border-emerald-500 text-slate-650 dark:text-slate-400 rounded-r-lg">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </div>
            );
          })()
        )}


      </div>
    );
  };

  const PractitionerDashboardView = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white relative overflow-hidden" glass={false}>
          <div className="absolute top-0 right-0 w-64 h-full bg-white/10 skew-x-12 translate-x-12 pointer-events-none" />
          <h2 className="text-xl md:text-2xl font-bold">Practitioner Portal</h2>
          <p className="text-sm text-teal-50/90 mt-1 max-w-xl">
            {roleData?.message || 'Access restricted consultant portal.'}
          </p>
          <span className="inline-block mt-3 px-3 py-1 bg-white/20 rounded-lg text-xs font-semibold">
            Role Auth Verified: {roleData?.role || role}
          </span>
        </Card>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Total Consultations</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {role === 'dermatologist' ? roleData?.patients_count : roleData?.leads_count || 0}
            </p>
          </Card>
          
          <Card className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Pending Scans</span>
            <p className="text-2xl font-black text-amber-500">3</p>
          </Card>

          <Card className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Status</span>
            <p className="text-2xl font-black text-emerald-500 flex items-center gap-1.5">
              Active <ShieldCheck className="w-5 h-5" />
            </p>
          </Card>
        </div>

        <Card className="space-y-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Stethoscope className="w-5 h-5 text-teal-500" />
            Practitioner Worklist
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Consultants and Dermatologists can view user scans, approve routine plans, and verify AI suggestions. Worklists will fill in as users upload skin photos in Phase 2.
          </p>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-800">Patient</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-800">Age</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-800">Assigned Diagnosis</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-800">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Sarah Jenkins</td>
                  <td className="p-3">28</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 rounded-md">Acne vulgaris</span></td>
                  <td className="p-3"><button className="text-teal-500 font-bold hover:underline cursor-pointer">Review Scan</button></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Marcus Sterling</td>
                  <td className="p-3">42</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/20 text-blue-700 rounded-md">Seborrheic dermatitis</span></td>
                  <td className="p-3"><button className="text-teal-500 font-bold hover:underline cursor-pointer">Review Scan</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const AdminDashboardView = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-slate-800 to-slate-950 text-white relative overflow-hidden" glass={false}>
          <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-12 translate-x-12 pointer-events-none" />
          <h2 className="text-xl md:text-2xl font-bold">Admin Console</h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {roleData?.message || 'Accessing core system controls.'}
          </p>
          <span className="inline-block mt-3 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold">
            System Console Mode
          </span>
        </Card>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Total Users</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{roleData?.total_users || 0}</p>
          </Card>
          
          <Card className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">System Status</span>
            <p className="text-2xl font-black text-emerald-500">{roleData?.system_status || 'Healthy'}</p>
          </Card>

          <Card className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Database Engine</span>
            <p className="text-lg font-black text-slate-800 dark:text-slate-200">PostgreSQL / SQLite fallback</p>
          </Card>
        </div>

        <Card className="space-y-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Settings className="w-5 h-5 text-slate-500" />
            System Control Panel
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Administrators can modify backend configurations, verify application logging streams, check database schema versions, and audit user accesses.
          </p>
          <div className="flex gap-4">
            <Button size="sm">Audit System Logs</Button>
            <Button variant="outline" size="sm">Database Status</Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current session level: <span className="font-semibold text-brand-500 uppercase">{role}</span>
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      )}

      {!loading && role === 'user' && <UserDashboardView />}
      {!loading && (role === 'dermatologist' || role === 'consultant') && <PractitionerDashboardView />}
      {!loading && role === 'admin' && <AdminDashboardView />}
    </div>
  );
};
export default Dashboard;
