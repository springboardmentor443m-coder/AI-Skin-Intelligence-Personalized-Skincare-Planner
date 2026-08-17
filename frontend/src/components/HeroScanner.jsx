import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Camera, Sparkles, Activity, Zap, HeartPulse, Video, AlertTriangle } from 'lucide-react';
import ClinicalReportPDF from './ClinicalReportPDF';

export default function HeroScanner({ onAnalyze, isAnalyzing, analysisResult, errorMessage, currentUser }) {
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'camera'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanTicker, setScanTicker] = useState("System Ready");
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Animated scan status ticker
  useEffect(() => {
    if (isAnalyzing) {
      const tickers = [
        "Mapping 68 Biometric Facial Landmarks...",
        "Evaluating Epidermal Sebum & Lipids Ratio...",
        "Analyzing Melanin Concentration & Dark Spots...",
        "Calculating Collagen Elasticity & Pore Density...",
        "Querying Groq Llama-3.3 70B AI Dermatologist..."
      ];
      let i = 0;
      setScanTicker(tickers[0]);
      const interval = setInterval(() => {
        i = (i + 1) % tickers.length;
        setScanTicker(tickers[i]);
      }, 900);
      return () => clearInterval(interval);
    } else {
      setScanTicker("Biometric Scanning Complete");
    }
  }, [isAnalyzing]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access webcam. Please allow camera permissions in your browser.");
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleModeChange = (mode) => {
    setInputMode(mode);
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const captureLivePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `live_webcam_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        stopCamera();
        setInputMode('file');
      }
    }, 'image/jpeg', 0.95);
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleScanSubmit = () => {
    if (selectedFile) {
      onAnalyze(selectedFile);
    }
  };

  const skinType = analysisResult?.analysis?.skin_type;
  const skinConcerns = analysisResult?.analysis?.skin_concerns;

  const normalProb = skinConcerns?.all_probabilities?.["Normal"] || 0.1;
  const healthScore = Math.min(98, Math.max(35, Math.round((normalProb * 60) + 40)));

  return (
    <section style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="glass-pill float-anim" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', marginBottom: '16px', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
          <Sparkles size={16} color="#818CF8" />
          <span style={{ fontSize: '13px', fontWeight: 700 }} className="text-gradient">
            PyTorch Deep Learning + Groq Llama-3.3 70B Dermatologist Engine
          </span>
        </div>
        <h2 style={{ fontSize: '46px', fontWeight: 800, lineHeight: 1.15, marginBottom: '14px', letterSpacing: '-0.5px' }}>
          Facial AI Intelligence & <br /><span className="text-gradient">Personalized Skincare Planner</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
          Experience clinical-grade biometric facial analysis. Capture a live camera selfie or upload a photo to detect skin type, measure 9 concern categories, and generate a dynamic 7-Day Routine.
        </p>
      </div>

      {/* Main Scanner Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: analysisResult ? '1fr 1.1fr' : '1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Biometric Upload & Reticle Card */}
        <div className="glass-card" style={{ padding: '32px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#06B6D4" />
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Biometric Scanner</h3>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: isAnalyzing ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: isAnalyzing ? '#06B6D4' : 'var(--text-muted)' }}>
              {isAnalyzing ? "ANALYZING..." : "STANDBY"}
            </span>
          </div>

          {/* Facial Image Guidance Note */}
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '8px 12px', borderRadius: '10px', fontSize: '11px', color: '#818CF8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡 <strong>Guidelines:</strong> Please capture or upload a clear, front-facing photo of your face under bright, natural lighting.</span>
          </div>

          {/* Mode Selector Tabs (Upload File vs Live Camera) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => handleModeChange('file')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: inputMode === 'file' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(6, 182, 212, 0.4))' : 'transparent',
                color: inputMode === 'file' ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: inputMode === 'file' ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <UploadCloud size={15} /> Upload Photo
            </button>
            <button
              onClick={() => handleModeChange('camera')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: inputMode === 'camera' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(6, 182, 212, 0.4))' : 'transparent',
                color: inputMode === 'camera' ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: inputMode === 'camera' ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Video size={15} /> Live Camera
            </button>
          </div>

          {/* Live Video / Drop Zone Container */}
          {inputMode === 'camera' ? (
            <div style={{ position: 'relative', width: '100%', borderRadius: '20px', overflow: 'hidden', minHeight: '320px', background: '#05070F', border: '2px solid rgba(6, 182, 212, 0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Biometric Overlay over Live Video */}
              <div className="biometric-overlay">
                <div className="reticle-corner reticle-tl"></div>
                <div className="reticle-corner reticle-tr"></div>
                <div className="reticle-corner reticle-bl"></div>
                <div className="reticle-corner reticle-br"></div>
              </div>

              <div style={{ position: 'absolute', bottom: '16px', display: 'flex', gap: '12px' }}>
                <button
                  onClick={captureLivePhoto}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '13px', background: 'linear-gradient(135deg, #10B981, #06B6D4)' }}
                >
                  <Camera size={16} /> Snap Live Photo
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(6, 182, 212, 0.4)',
                borderRadius: '20px',
                padding: '24px',
                background: previewUrl ? '#05070F' : 'rgba(6, 182, 212, 0.02)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e.target.files[0])}
                accept="image/*"
                style={{ display: 'none' }}
              />

              {previewUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img
                    src={previewUrl}
                    alt="Face Scan Preview"
                    style={{ maxHeight: '290px', width: 'auto', borderRadius: '14px', objectFit: 'cover', border: '1px solid rgba(6, 182, 212, 0.3)' }}
                  />
                  
                  {/* Biometric Reticle Corners */}
                  <div className="biometric-overlay">
                    <div className="reticle-corner reticle-tl"></div>
                    <div className="reticle-corner reticle-tr"></div>
                    <div className="reticle-corner reticle-bl"></div>
                    <div className="reticle-corner reticle-br"></div>
                    {isAnalyzing && <div className="scan-laser"></div>}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                    <UploadCloud size={36} color="#06B6D4" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Upload Facial Photograph</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '300px', margin: '0 auto' }}>
                    Click to browse or drag & drop high-resolution face image
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Ticker & Submit Button */}
          <div style={{ marginTop: '20px' }}>
            
            {errorMessage && (
              <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#FB7185', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', lineHeight: 1.4 }}>
                <AlertTriangle size={20} style={{ flexShrink: 0, color: '#F43F5E' }} />
                <span><strong>Face Detection Failed:</strong> {errorMessage}</span>
              </div>
            )}

            {selectedFile && !errorMessage && (
              <div style={{ fontSize: '12px', color: '#06B6D4', fontWeight: 600, textAlign: 'center', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Zap size={14} className={isAnalyzing ? "animate-spin" : ""} />
                <span>{scanTicker}</span>
              </div>
            )}

            <button
              onClick={handleScanSubmit}
              disabled={!selectedFile || isAnalyzing}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', opacity: (!selectedFile || isAnalyzing) ? 0.6 : 1 }}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="animate-spin" size={20} />
                  <span>Processing Neural Network Assessment...</span>
                </>
              ) : (
                <>
                  <Camera size={20} />
                  <span>Run AI Facial Intelligence Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Showcase Card */}
        {analysisResult && (
          <div className="glass-card" style={{ padding: '32px' }}>
            
            {/* Header with Radial Health Score & PDF Export */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Assessment Dashboard</span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, marginTop: '2px' }}>Facial Diagnostics</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ClinicalReportPDF
                  analysisResult={analysisResult}
                  currentUser={currentUser}
                />

                {/* Skin Health Radial Score Meter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(16, 185, 129, 0.08)', padding: '8px 16px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', display: 'block' }}>Skin Health Index</span>
                    <span style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF' }}>{healthScore}<span style={{ fontSize: '13px', color: '#10B981' }}>/100</span></span>
                  </div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
                    <HeartPulse size={20} color="#FFFFFF" />
                  </div>
                </div>
              </div>
            </div>

            {/* Predicted Skin Type Badge */}
            <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.25)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Classified Skin Profile</span>
                <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#818CF8', marginTop: '2px' }}>
                  {skinType?.prediction} Skin Type
                </h4>
              </div>
              <span className="glass-pill" style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: '#818CF8' }}>
                {((skinType?.confidence || 0) * 100).toFixed(1)}% Confidence
              </span>
            </div>

            {/* Skin Concerns Breakdown */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>9-Point Skin Concern Analysis</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#F43F5E' }}>
                  Primary: {skinConcerns?.prediction}
                </span>
              </div>

              {/* Progress Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {skinConcerns?.all_probabilities && Object.entries(skinConcerns.all_probabilities).map(([concernKey, probValue]) => {
                  const isPrimary = concernKey === skinConcerns.prediction;
                  const isNormal = concernKey === 'Normal';
                  const barColor = isNormal ? '#10B981' : (isPrimary ? '#F43F5E' : '#818CF8');

                  return (
                    <div key={concernKey} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: isPrimary ? 800 : 500, color: isPrimary ? '#F43F5E' : 'var(--text-main)' }}>
                          {concernKey} {isPrimary && "📍"}
                        </span>
                        <span style={{ fontWeight: 700, color: barColor }}>{(probValue * 100).toFixed(1)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${probValue * 100}%`, height: '100%', background: barColor, borderRadius: '3px', transition: 'width 0.6s ease' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
