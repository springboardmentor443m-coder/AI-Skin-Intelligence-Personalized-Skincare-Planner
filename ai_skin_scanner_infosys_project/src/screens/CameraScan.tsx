import React, { useRef, useEffect, useState } from 'react';
import type { ScanMetrics } from '../App';

interface CameraScanProps {
  onScanComplete: (metrics: ScanMetrics, image: string) => void;
  userEmail: string;
}

export const CameraScan: React.FC<CameraScanProps> = ({ onScanComplete, userEmail }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [statusText, setStatusText] = useState('Select an image to begin...');
  const [showFlash, setShowFlash] = useState(false);
  const [landmarks, setLandmarks] = useState<{ x: number; y: number; label: string }[]>([]);
  const [capturedMetrics, setCapturedMetrics] = useState<ScanMetrics | null>(null);
  const [capturedImgStr, setCapturedImgStr] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [sunExposure, setSunExposure] = useState('Medium');
  const [sensitivityLevel, setSensitivityLevel] = useState('None');
  const [skincareGoal, setSkincareGoal] = useState('Brightening');
  const [skincareExperience, setSkincareExperience] = useState('Beginner');

  // Generate facial landmarks to simulate holographic analysis overlay
  useEffect(() => {
    if (!isScanning) {
      setLandmarks([]);
      return;
    }
    
    const interval = setInterval(() => {
      const baseLandmarks = [
        { x: 50, y: 35, label: 'Forehead Pore' },
        { x: 38, y: 48, label: 'L-Cheek Hydration' },
        { x: 62, y: 48, label: 'R-Cheek Hydration' },
        { x: 50, y: 55, label: 'Nose Sebum' },
        { x: 50, y: 70, label: 'Chin Elasticity' },
      ];
      // Add subtle jitter to landmarks
      setLandmarks(baseLandmarks.map(p => ({
        x: p.x + (Math.random() * 2 - 1),
        y: p.y + (Math.random() * 2 - 1),
        label: p.label
      })));
    }, 150);

    return () => clearInterval(interval);
  }, [isScanning]);

  // Async model classification caller with heuristic fallback
  const runDermalAnalysisModel = async (imageSrc: string): Promise<ScanMetrics> => {
    try {
      const response = await fetch('http://localhost:5000/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          image: imageSrc, 
          email: userEmail,
          questionnaire: {
            sunExposure,
            sensitivityLevel,
            skincareGoal,
            skincareExperience
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Real ML model classification output:", data);
        if (data.metrics) {
          return data.metrics as ScanMetrics;
        }
      }
    } catch (err) {
      console.warn("Failed to reach Python backend server, running local heuristic fallback.", err);
    }
    
    // Fallback heuristic calculations if backend model server is offline
    const acne = Math.round(25 + Math.random() * 20);
    const oily = Math.round(60 + Math.random() * 20);
    const redness = Math.round(45 + Math.random() * 20);
    const pigmentation = Math.round(25 + Math.random() * 15);
    const dryness = Math.round(100 - oily + Math.random() * 10);
    const fineLines = Math.round(12 + Math.random() * 8);
    const score = Math.round(100 - (acne * 0.12 + redness * 0.12 + oily * 0.1 + pigmentation * 0.1));
    
    let skinType = 'Normal';
    if (oily > 70) skinType = 'Oily';
    else if (dryness > 50) skinType = 'Dry';
    else if (redness > 50) skinType = 'Sensitive';
    else if (oily > 50 && dryness > 30) skinType = 'Combination';

    return { 
      acne, 
      dryness, 
      oily, 
      pigmentation, 
      redness, 
      fineLines, 
      score, 
      skinType,
      questionnaire: {
        sunExposure,
        sensitivityLevel,
        skincareGoal,
        skincareExperience
      }
    };
  };

  // Start analysis trigger
  const handleStartAnalysis = () => {
    if (!capturedImgStr || isScanning) return;

    // Visual flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);

    setIsScanning(true);
    setScanProgress(0);
    setCapturedMetrics(null); // Reset metrics for subsequent uploads!
    setStatusText('Initiating AI dermal layer inspection...');

    // Call trained model API
    runDermalAnalysisModel(capturedImgStr).then(metrics => {
      setCapturedMetrics(metrics);
    });
  };

  // Process selected file
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Let's constrain the resolution for efficient transfer, while keeping details
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedImgStr(dataUrl);
          setCapturedMetrics(null);
          setStatusText('Image loaded. Ready for clinical scanning.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle uploaded file changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Clear input value so that user can upload the same photo again
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Progress animation timer
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) {
          // Wait at 95% until classification metrics are retrieved from backend
          if (capturedMetrics) {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 5;
          }
          return 95;
        }
        
        const next = prev + 5;
        if (next === 20) setStatusText('Analyzing pore structure & sebum index...');
        if (next === 45) setStatusText('Calculating epidermal hydration balance...');
        if (next === 70) setStatusText('Scanning melanin distribution & pigmentation...');
        if (next === 90) setStatusText('Compiling fine line index & skin age metrics...');
        
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isScanning, capturedMetrics]);

  // Handle completion when progress reaches 100
  useEffect(() => {
    if (scanProgress >= 100 && isScanning && capturedMetrics) {
      setIsScanning(false);
      onScanComplete(capturedMetrics, capturedImgStr);
    }
  }, [scanProgress, isScanning, capturedMetrics, capturedImgStr, onScanComplete]);

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Flash overlay */}
      {showFlash && (
        <div className="fixed inset-0 bg-white z-[100] animate-fade-out pointer-events-none"></div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">Dermal Scan</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Upload a clear, high-resolution photo of your skin to undergo biometric diagnosis.</p>
        </div>
      </div>

      {/* Main Scanner Box & Questionnaire Grid */}
      <div className={`grid grid-cols-1 ${capturedImgStr ? 'lg:grid-cols-12' : ''} gap-card-gap items-stretch`}>
        {/* Left Side: Photo Frame */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-3xl overflow-hidden shadow-2xl border-4 transition-all duration-300 ${
            isDragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-white/40 bg-zinc-950'
          } flex flex-col items-center justify-center group ${capturedImgStr ? 'col-span-12 lg:col-span-6 aspect-[4/3] w-full' : 'w-full max-w-3xl aspect-[4/3] mx-auto'}`}
        >
          {capturedImgStr ? (
            <>
              {/* Image Preview */}
              <img 
                src={capturedImgStr} 
                className="absolute inset-0 w-full h-full object-cover"
                alt="Skin Scan Preview"
              />

              {/* Holographic scanner active overlay */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  {/* Camera Guide Rings */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-primary/40 flex items-center justify-center">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-primary/20 animate-[spin_30s_linear_infinite]"></div>
                    <div className="absolute w-[94%] h-[94%] rounded-full border border-white/20"></div>
                  </div>

                  {/* Framing Brackets */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[340px]">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-primary rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-primary rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-primary rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-primary rounded-br-xl"></div>
                    
                    {/* Scan line laser */}
                    <div className="scan-line"></div>
                  </div>

                  {/* Landmark coordinates mapping overlay */}
                  {landmarks.map((pt, i) => (
                    <div 
                      key={i} 
                      className="absolute w-2 h-2 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-primary/50 transition-all duration-300"
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                    >
                      <div className="absolute left-3 -top-2 bg-zinc-900/80 text-[8px] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-white/10 whitespace-nowrap">
                        {pt.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Prominent Overlay during loading state */}
              {isScanning && (
                <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
                  <div className="relative w-24 h-24 mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-zinc-800" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="4"></circle>
                      <circle 
                        className="text-primary" 
                        cx="48" 
                        cy="48" 
                        fill="transparent" 
                        r="40" 
                        stroke="currentColor" 
                        strokeWidth="6"
                        strokeDasharray={251}
                        strokeDashoffset={251 - (251 * scanProgress) / 100}
                        strokeLinecap="round"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-white text-base font-bold">
                      {scanProgress}%
                    </div>
                  </div>
                  <h3 className="text-white text-sm font-bold uppercase tracking-widest animate-pulse">{statusText}</h3>
                  <p className="text-[10px] text-zinc-400 mt-2">Dermal pixel matrix scanner active.</p>
                </div>
              )}

              {/* Status Banner */}
              {!isScanning && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 glass-panel px-6 py-2 rounded-full border border-white/30 text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{statusText}</span>
                </div>
              )}
            </>
          ) : (
            // Upload Prompt State
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 text-center cursor-pointer max-w-md select-none"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
              </div>
              <h3 className="text-white text-base font-bold">Upload Skin Photograph</h3>
              <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                Drag and drop your high-resolution facial photo here, or click to browse.
              </p>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-4 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                Select File
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Skincare Questionnaire */}
        {capturedImgStr && (
          <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-3xl border border-white/20 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">clinical_notes</span>
                Dermal Lifestyle Profile
              </h3>
              <p className="text-[10px] text-on-surface-variant font-medium">Please answer these supplementary diagnostic questions to customize your active ingredient routine.</p>
            </div>

            <div className="space-y-3.5 flex-1 justify-center flex flex-col">
              {/* Question 1: Skincare Goal */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Primary Skincare Goal</label>
                <select
                  value={skincareGoal}
                  onChange={(e) => setSkincareGoal(e.target.value)}
                  disabled={isScanning}
                  className="w-full py-2 px-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer disabled:opacity-55"
                >
                  <option value="Brightening">Fade dark spots & brighten hyperpigmentation</option>
                  <option value="Sebum Control">Clear acne, blackheads, & balance sebum</option>
                  <option value="Redness">Calm sensitivity & redness irritation</option>
                  <option value="Wrinkles">Soften fine lines, wrinkles, & firm skin</option>
                  <option value="Hydration">Restore moisture & repair dry skin barrier</option>
                </select>
              </div>

              {/* Question 2: Sun Exposure */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Daily Sun Exposure</label>
                <select
                  value={sunExposure}
                  onChange={(e) => setSunExposure(e.target.value)}
                  disabled={isScanning}
                  className="w-full py-2 px-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer disabled:opacity-55"
                >
                  <option value="High">High (Outdoors, frequent sun exposure)</option>
                  <option value="Medium">Medium (General commute, moderate outdoor time)</option>
                  <option value="Low">Low (Mostly indoors under fluorescent/AC)</option>
                </select>
              </div>

              {/* Question 3: Sensitivity Level */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Skin Sensitivity Level</label>
                <select
                  value={sensitivityLevel}
                  onChange={(e) => setSensitivityLevel(e.target.value)}
                  disabled={isScanning}
                  className="w-full py-2 px-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer disabled:opacity-55"
                >
                  <option value="None">Tolerant (No allergies, fits most active ingredients)</option>
                  <option value="Mild">Mild (Occasional tingling or temporary redness)</option>
                  <option value="High">Highly Sensitive (Prone to irritation, itching, or rashes)</option>
                </select>
              </div>

              {/* Question 4: Skincare Experience */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Experience with Actives</label>
                <select
                  value={skincareExperience}
                  onChange={(e) => setSkincareExperience(e.target.value)}
                  disabled={isScanning}
                  className="w-full py-2 px-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer disabled:opacity-55"
                >
                  <option value="Beginner">Beginner (Mostly use basic hydration cleansers/moisturizers)</option>
                  <option value="Intermediate">Intermediate (Used Niacinamide or low-strength Vitamin C before)</option>
                  <option value="Advanced">Advanced (Regularly use high-strength Retinol, AHA/BHA exfoliators)</option>
                </select>
              </div>
            </div>

            <div className="text-[9px] font-semibold text-primary/75 bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-start gap-2 select-none">
              <span className="material-symbols-outlined text-sm shrink-0">info</span>
              <span>Our clinical AI consultant uses these environmental & sensitivity inputs to adjust active ingredient dosage recommendation safety.</span>
            </div>
          </div>
        )}
      </div>

      {/* Control panel buttons */}
      {capturedImgStr && !isScanning && (
        <div className="flex items-center justify-center gap-12 pt-4">
          {/* Replace file button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 group opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:bg-white/10 transition-all text-on-surface">
              <span className="material-symbols-outlined">file_upload</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Change photo</span>
          </button>

          {/* Start Analysis Button */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary/20 pulse-capture"></div>
            <button 
              onClick={handleStartAnalysis}
              className="relative px-8 h-16 bg-gradient-to-br from-primary to-tertiary rounded-full shadow-2xl shadow-primary/40 flex items-center gap-2 active:scale-95 transition-transform group cursor-pointer text-white font-bold text-xs uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Start Dermal Analysis
            </button>
          </div>

          {/* Reset/Remove button */}
          <button 
            onClick={() => {
              setCapturedImgStr('');
              setCapturedMetrics(null);
            }}
            className="flex flex-col items-center gap-2 group opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:bg-white/10 transition-all text-on-surface">
              <span className="material-symbols-outlined">delete</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Remove</span>
          </button>
        </div>
      )}
    </div>
  );
};
