import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './screens/LandingPage';
import { Auth } from './screens/Auth';
import { Dashboard } from './screens/Dashboard';
import { CameraScan } from './screens/CameraScan';
import { AnalysisResults } from './screens/AnalysisResults';
import { SkincareRoutine } from './screens/SkincareRoutine';
import { Ingredients } from './screens/Ingredients';
import { ProductRecommendations } from './screens/ProductRecommendations';
import { ProgressTracking } from './screens/ProgressTracking';
import { Reports } from './screens/Reports';
import { UserProfile } from './screens/UserProfile';
import { ConsultantDashboard } from './screens/ConsultantDashboard';
import { DermatologistDashboard } from './screens/DermatologistDashboard';
import { AdminDashboard } from './screens/AdminDashboard';
import { ConsultantChat } from './screens/ConsultantChat';
import { History } from './screens/History';

export interface UserProfileData {
  name: string;
  email: string;
  dob: string;
  phone: string;
  skinType: string;
  sensitivity: string;
  skinGoals: string[];
  allergies: string[];
  waterTarget: number;
  sleepSchedule: string;
}

export interface ScanMetrics {
  acne: number;
  dryness: number;
  oily: number;
  pigmentation: number;
  redness: number;
  fineLines: number;
  score: number;
  skinType?: string;
  darkSpots?: number;
  whiteheads?: number;
  acneDetected?: boolean;
  darkSpotsDetected?: boolean;
  whiteheadsDetected?: boolean;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [currentScreen, setScreen] = useState<string>(() => {
    const savedLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (savedLoggedIn) {
      return localStorage.getItem('currentScreen') || 'dashboard';
    }
    return 'landing';
  });

  const [, setUserRole] = useState<string>('user');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Central User Profile State (Persisted)
  const [userProfile, setUserProfile] = useState<UserProfileData>(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      name: 'Elena Thorne',
      email: 'elena.thorne@gmail.com',
      dob: '1998-05-12',
      phone: '+1 (555) 234-8291',
      skinType: 'Combination',
      sensitivity: 'Sensitive',
      skinGoals: ['Hydration', 'Brightening', 'Barrier Repair'],
      allergies: ['Fragrance', 'Benzoyl Peroxide'],
      waterTarget: 2.0,
      sleepSchedule: '22:30 - 06:30'
    };
  });

  // Central Scan Results State (Persisted)
  const [scanMetrics, setScanMetrics] = useState<ScanMetrics>(() => {
    const saved = localStorage.getItem('scanMetrics');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      acne: 28,
      dryness: 55,
      oily: 78,
      pigmentation: 34,
      redness: 62,
      fineLines: 15,
      score: 78
    };
  });

  // Captured Face Image (Persisted)
  const [capturedImage, setCapturedImage] = useState<string | null>(() => {
    return localStorage.getItem('capturedImage');
  });

  // Keep localStorage in sync with userProfile changes
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Keep document element in sync with darkMode state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [darkMode]);

  // Keep localStorage in sync with screen changes
  const handleSetScreen = (screen: string) => {
    const isPublic = ['landing', 'login', 'register', 'forgot-password'].includes(screen);
    if (!isPublic && !isLoggedIn) {
      setScreen('login');
      localStorage.setItem('currentScreen', 'login');
    } else {
      setScreen(screen);
      localStorage.setItem('currentScreen', screen);
    }
  };

  const handleLogin = (name?: string, email?: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    if (name && email) {
      const updated = {
        ...userProfile,
        name: name,
        email: email
      };
      setUserProfile(updated);
      localStorage.setItem('userProfile', JSON.stringify(updated));
    }
    setScreen('dashboard');
    localStorage.setItem('currentScreen', 'dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('currentScreen');
    localStorage.removeItem('scanMetrics');
    localStorage.removeItem('capturedImage');
    setCapturedImage(null);
    setUserRole('user');
    setScreen('landing');
  };

  const handleStartScan = () => {
    if (!isLoggedIn) {
      setScreen('login');
      localStorage.setItem('currentScreen', 'login');
    } else {
      setScreen('scan');
      localStorage.setItem('currentScreen', 'scan');
    }
  };

  const handleScanComplete = (metrics: ScanMetrics, image: string) => {
    setScanMetrics(metrics);
    setCapturedImage(image);
    localStorage.setItem('scanMetrics', JSON.stringify(metrics));
    localStorage.setItem('capturedImage', image);

    // Dynamically update the userProfile skinType from the scan result
    const predictedType = metrics.skinType || 'Normal';
    const updatedProfile = {
      ...userProfile,
      skinType: predictedType
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

    setScreen('analysis');
    localStorage.setItem('currentScreen', 'analysis');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-background text-on-surface'}`}>
      
      {/* Navigation Sidebar */}
      <Sidebar 
        currentScreen={currentScreen} 
        setScreen={handleSetScreen} 
        setUserRole={setUserRole} 
        onLogout={handleLogout} 
        userProfile={userProfile}
      />

      {/* Top Header */}
      <Header 
        currentScreen={currentScreen} 
        setScreen={handleSetScreen} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />

      {/* Main Page Content Wrapper */}
      <div className={`${isLoggedIn && !['landing', 'login', 'register', 'forgot-password'].includes(currentScreen) ? 'ml-sidebar-width pt-20 pb-12 px-container-padding' : ''}`}>
        <main className={`${isLoggedIn && !['landing', 'login', 'register', 'forgot-password'].includes(currentScreen) ? 'max-w-7xl mx-auto' : ''}`}>
          
          {currentScreen === 'landing' && (
            <LandingPage setScreen={handleSetScreen} onStartScan={handleStartScan} />
          )}

          {currentScreen === 'login' && (
            <Auth onLogin={handleLogin} setScreen={handleSetScreen} initialMode="login" />
          )}

          {currentScreen === 'register' && (
            <Auth onLogin={handleLogin} setScreen={handleSetScreen} initialMode="register" />
          )}

          {currentScreen === 'forgot-password' && (
            <Auth onLogin={handleLogin} setScreen={handleSetScreen} initialMode="forgot" />
          )}

          {isLoggedIn && (
            <>
              {currentScreen === 'dashboard' && (
                <Dashboard setScreen={handleSetScreen} onStartScan={handleStartScan} userProfile={userProfile} scanMetrics={scanMetrics} />
              )}

              {currentScreen === 'scan' && (
                <CameraScan onScanComplete={handleScanComplete} userEmail={userProfile.email} />
              )}

              {currentScreen === 'analysis' && (
                <AnalysisResults setScreen={handleSetScreen} scanMetrics={scanMetrics} capturedImage={capturedImage} />
              )}

              {currentScreen === 'consultant-chat' && (
                <ConsultantChat scanMetrics={scanMetrics} />
              )}

              {currentScreen === 'history' && (
                <History setScreen={handleSetScreen} userEmail={userProfile.email} onSelectScan={handleScanComplete} />
              )}

              {currentScreen === 'routine' && (
                <SkincareRoutine />
              )}

              {currentScreen === 'ingredients' && (
                <Ingredients />
              )}

              {currentScreen === 'products' && (
                <ProductRecommendations />
              )}

              {currentScreen === 'progress' && (
                <ProgressTracking />
              )}

              {currentScreen === 'reports' && (
                <Reports userProfile={userProfile} scanMetrics={scanMetrics} />
              )}

              {currentScreen === 'profile' && (
                <UserProfile userProfile={userProfile} setUserProfile={setUserProfile} />
              )}

              {currentScreen === 'consultant' && (
                <ConsultantDashboard userProfile={userProfile} scanMetrics={scanMetrics} />
              )}

              {currentScreen === 'dermatologist' && (
                <DermatologistDashboard userProfile={userProfile} scanMetrics={scanMetrics} />
              )}

              {currentScreen === 'admin' && (
                <AdminDashboard userProfile={userProfile} />
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;
