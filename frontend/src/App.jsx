import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import HeroScanner from './components/HeroScanner';
import ProductGrid from './components/ProductGrid';
import RoutinePlanner from './components/RoutinePlanner';
import ProgressTracker from './components/ProgressTracker';
import AuthModal from './components/AuthModal';
import HistoryDrawer from './components/HistoryDrawer';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(() => {
    try {
      const saved = localStorage.getItem('latest_skin_analysis');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [historyList, setHistoryList] = useState([]);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  // Persist analysisResult to localStorage
  useEffect(() => {
    if (analysisResult) {
      localStorage.setItem('latest_skin_analysis', JSON.stringify(analysisResult));
    }
  }, [analysisResult]);

  // Configure Axios Defaults
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      fetchCurrentUser();
      fetchUserHistory();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setHistoryList([]);
    }
  }, [authToken]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
      setCurrentUser(res.data);
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  const fetchUserHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/history`);
      if (res.data && res.data.history) {
        setHistoryList(res.data.history);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (fullName, email, password) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      full_name: fullName,
      email: email,
      password: password
    });
    const { access_token, user } = res.data;
    localStorage.setItem('token', access_token);
    setAuthToken(access_token);
    setCurrentUser(user);
  };

  const handleLogin = async (email, password) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: email,
      password: password
    });
    const { access_token, user } = res.data;
    localStorage.setItem('token', access_token);
    setAuthToken(access_token);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken('');
    setCurrentUser(null);
  };

  const [errorMessage, setErrorMessage] = useState('');

  const handleAnalyzeImage = async (file) => {
    setIsAnalyzing(true);
    setErrorMessage('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/assessments/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysisResult(res.data);
      if (authToken) {
        fetchUserHistory();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Error analyzing image. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCompareProgressIds = async (pastId, currId) => {
    const res = await axios.post(`${API_BASE_URL}/api/progress/compare-ids`, {
      past_assessment_id: pastId,
      current_assessment_id: currId
    });
    return res.data;
  };

  const handleSelectHistoryItem = async (item) => {
    const stype = item.analysis?.skin_type?.prediction || "Normal";
    const sconcern = item.analysis?.skin_concerns?.prediction || "Normal";

    // Fetch products & 7-day routine for this past scan
    try {
      const recRes = await axios.post(`${API_BASE_URL}/api/recommendations/generate`, {
        skin_type: stype,
        skin_concern: sconcern
      });
      
      setAnalysisResult({
        id: item._id,
        analysis: item.analysis,
        product_recommendations: recRes.data.product_recommendations,
        weekly_routine: recRes.data.weekly_routine
      });
    } catch (err) {
      console.error("Error generating recs for past scan:", err);
      setAnalysisResult({
        id: item._id,
        analysis: item.analysis,
        product_recommendations: null,
        weekly_routine: null
      });
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Background Glows */}
      <div className="ambient-bg">
        <div className="glow-purple"></div>
        <div className="glow-cyan"></div>
        <div className="glow-emerald"></div>
      </div>

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main App Body */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1, paddingBottom: '60px' }}>
        
        {/* Scanner & AI Predictions */}
        <HeroScanner
          onAnalyze={handleAnalyzeImage}
          isAnalyzing={isAnalyzing}
          analysisResult={analysisResult}
          errorMessage={errorMessage}
        />

        {/* Tailored Product Recommendations */}
        {analysisResult?.product_recommendations && (
          <ProductGrid recommendations={analysisResult.product_recommendations} />
        )}

        {/* Groq LLM 7-Day Routine Planner */}
        {analysisResult?.weekly_routine && (
          <RoutinePlanner 
            weeklyRoutine={analysisResult.weekly_routine} 
            analysisId={analysisResult.id}
          />
        )}

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-dim)', position: 'relative', zIndex: 1 }}>
        <p>AI Skin Intelligence & Personalized Skincare Planner © 2026 — Powered by PyTorch, FastAPIs, MongoDB & Groq LLM</p>
      </footer>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        onSelectHistoryItem={handleSelectHistoryItem}
        onOpenProgressTracker={() => setIsProgressOpen(true)}
      />

      <ProgressTracker
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
        historyList={historyList}
        onCompareIds={handleCompareProgressIds}
      />

    </div>
  );
}
