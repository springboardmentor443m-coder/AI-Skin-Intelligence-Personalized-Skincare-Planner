import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  User,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
  UserPlus,
  LogIn,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'user',
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    pass: 'user123',
    title: 'Skincare Consumer / Patient',
    badge: 'Patient Portal',
    icon: User,
    description: 'Personalized 360° skin assessment, daily routine checklists, and live camera photo capture.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    permissions: ['Daily Checklists', 'Camera Assessment', 'Personal Routine', 'Product Matching'],
  },
  {
    role: 'consultant',
    name: 'Aria Chen',
    email: 'consultant@dermaglow.med',
    pass: 'consultant123',
    title: 'Skincare Consultant',
    badge: 'Consultant Portal',
    icon: UserCheck,
    description: 'Review client telemetry, modify multi-step routine plans, and send tailored formulations.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    permissions: ['Client Management', 'Routine Publishing', 'Ingredient Analysis', 'Export Reports'],
  },
  {
    role: 'dermatologist',
    name: 'Dr. Evelyn Vance, MD',
    email: 'evelyn.vance@dermaglow.med',
    pass: 'md123',
    title: 'Medical Dermatologist (MD)',
    badge: 'Clinical Telemetry',
    icon: Stethoscope,
    description: 'Clinical skin diagnostic tools, Gemini AI Clinical Copilot, and medical prescriptions.',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    permissions: ['Pathology Review', 'Gemini AI Copilot', 'Prescriptions', 'Clinical Exports'],
  },
  {
    role: 'admin',
    name: 'System Administrator',
    email: 'admin@dermaglow.med',
    pass: 'admin123',
    title: 'Platform Administrator',
    badge: 'RBAC & System Health',
    icon: ShieldCheck,
    description: 'Role-based access control, user role management, system health metrics, and latency logs.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    permissions: ['Role Assignment', 'System Monitoring', 'RBAC Management', 'Security Audits'],
  },
];

const LOCAL_STORAGE_KEY = 'dermaglow_registered_users';

export const LoginScreen = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('signin');
  
  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Sign Up State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('user');
  const [regSkinType, setRegSkinType] = useState('Combination');

  // General UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoSection, setShowDemoSection] = useState(false);

  // Load existing registered users
  const [registeredUsers, setRegisteredUsers] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setRegisteredUsers(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage read error
    }
  }, []);

  const saveRegisteredUsers = (users) => {
    setRegisteredUsers(users);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // Ignore localStorage write error
    }
  };

  // Real User Registration Handler
  const handleSignUp = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-verify.');
      return;
    }

    // Check if email already exists
    const normalizedEmail = regEmail.trim().toLowerCase();
    const existsInReg = registeredUsers.some((u) => u.email.toLowerCase() === normalizedEmail);
    const existsInDemo = DEMO_ACCOUNTS.some((a) => a.email.toLowerCase() === normalizedEmail);

    if (existsInReg || existsInDemo) {
      setErrorMsg('An account with this email address already exists. Please sign in instead.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newUser = {
        id: `usr_real_${Date.now()}`,
        name: regName.trim(),
        email: normalizedEmail,
        pass: regPassword,
        role: regRole,
        skinType: regSkinType,
        avatarUrl:
          regRole === 'dermatologist'
            ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
            : regRole === 'consultant'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
            : regRole === 'admin'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...registeredUsers, newUser];
      saveRegisteredUsers(updatedUsers);

      const profile = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        skinType: newUser.skinType,
        ageGroup: '25-34',
        skinConcerns: ['Acne', 'Uneven Skin Tone'],
        allergies: [],
        sensitivities: [],
        lifestyle: {
          sleepHours: 7.5,
          sleepQuality: 'Good',
          waterIntakeLiters: 2.2,
          uvExposure: 'Moderate',
          pollutionExposure: 'Moderate',
          stressLevel: 'Moderate',
          climate: 'Temperate',
        },
        routineConsistency: 85,
      };

      setIsLoading(false);
      onLogin(profile, newUser.role);
    }, 500);
  };

  // Real User Sign-In Handler
  const handleSignIn = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const normalizedEmail = loginEmail.trim().toLowerCase();

      // Check registered real users first
      const foundReal = registeredUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (foundReal) {
        if (foundReal.pass !== loginPassword) {
          setIsLoading(false);
          setErrorMsg('Incorrect password. Please verify your credentials.');
          return;
        }

        const profile = {
          id: foundReal.id,
          name: foundReal.name,
          email: foundReal.email,
          role: foundReal.role,
          avatarUrl: foundReal.avatarUrl,
          skinType: foundReal.skinType,
          ageGroup: '25-34',
          skinConcerns: ['Acne'],
          allergies: [],
          sensitivities: [],
          lifestyle: {
            sleepHours: 7.5,
            sleepQuality: 'Good',
            waterIntakeLiters: 2.2,
            uvExposure: 'Moderate',
            pollutionExposure: 'Moderate',
            stressLevel: 'Moderate',
            climate: 'Temperate',
          },
          routineConsistency: 85,
        };

        setIsLoading(false);
        onLogin(profile, foundReal.role);
        return;
      }

      // Check Demo Accounts
      const foundDemo = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === normalizedEmail);

      if (foundDemo) {
        if (foundDemo.pass !== loginPassword) {
          setIsLoading(false);
          setErrorMsg('Incorrect password for demo account. Password is: ' + foundDemo.pass);
          return;
        }

        const profile = {
          id: foundDemo.email === 'marcus.vance@example.com' ? 'usr_001' : `usr_${foundDemo.role}`,
          name: foundDemo.name,
          email: foundDemo.email,
          role: foundDemo.role,
          avatarUrl: foundDemo.avatarUrl,
          skinType: 'Combination',
          ageGroup: '25-34',
          skinConcerns: ['Acne', 'Uneven Skin Tone'],
          allergies: ['Fragrance / Essential Oils'],
          sensitivities: ['Salicylic Acid (>2%)'],
          lifestyle: {
            sleepHours: 7.5,
            sleepQuality: 'Good',
            waterIntakeLiters: 2.2,
            uvExposure: 'Moderate',
            pollutionExposure: 'High',
            stressLevel: 'Moderate',
            climate: 'Humid/Tropical',
          },
          routineConsistency: 88,
        };

        setIsLoading(false);
        onLogin(profile, foundDemo.role);
        return;
      }

      // If no match found, create a new session profile or show invalid error
      setIsLoading(false);
      setErrorMsg('No account found with this email. Click "Create Real Account" to register!');
    }, 500);
  };

  const handleQuickDemoLogin = (acc) => {
    setLoginEmail(acc.email);
    setLoginPassword(acc.pass);
    setIsLoading(true);

    setTimeout(() => {
      const profile = {
        id: acc.email === 'marcus.vance@example.com' ? 'usr_001' : `usr_${acc.role}`,
        name: acc.name,
        email: acc.email,
        role: acc.role,
        avatarUrl: acc.avatarUrl,
        skinType: 'Combination',
        ageGroup: '25-34',
        skinConcerns: ['Acne', 'Uneven Skin Tone'],
        allergies: ['Fragrance / Essential Oils'],
        sensitivities: ['Salicylic Acid (>2%)'],
        lifestyle: {
          sleepHours: 7.5,
          sleepQuality: 'Good',
          waterIntakeLiters: 2.2,
          uvExposure: 'Moderate',
          pollutionExposure: 'High',
          stressLevel: 'Moderate',
          climate: 'Humid/Tropical',
        },
        routineConsistency: 88,
      };

      setIsLoading(false);
      onLogin(profile, acc.role);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] font-sans flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Top Header Branding */}
      <div className="max-w-md w-full text-center space-y-3 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
          DermaGlow Portal
        </h1>
        <p className="text-xs sm:text-sm text-[#66625D]">
          Sign in to your account or create a new user profile with personalized skincare access.
        </p>
      </div>

      <div className="max-w-xl w-full bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E2DD] shadow-sm space-y-6">
        {/* Auth Mode Toggle Tabs */}
        <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-[#E5E2DD]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              authMode === 'signin'
                ? 'bg-white text-[#1A1A1A] shadow-xs border border-[#E5E2DD]'
                : 'text-[#66625D] hover:text-[#1A1A1A]'
            }`}
          >
            <LogIn className="w-4 h-4 text-[#4A5D4E]" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              authMode === 'signup'
                ? 'bg-white text-[#1A1A1A] shadow-xs border border-[#E5E2DD]'
                : 'text-[#66625D] hover:text-[#1A1A1A]'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#4A5D4E]" />
            <span>Create Real Account</span>
          </button>
        </div>

        {/* Success or Error Alerts */}
        {errorMsg && (
          <div className="p-3 bg-[#FAF3F0] border border-[#E5E2DD] text-[#8B6D5C] rounded-xl text-xs font-semibold flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#8B6D5C]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-[#EBF0EC] border border-[#4A5D4E]/30 text-[#4A5D4E] rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* REAL USER SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A1A1A]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C867E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. user@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#E5E2DD] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#1A1A1A]">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C867E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E5E2DD] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C867E] hover:text-[#1A1A1A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#4A5D4E] hover:bg-[#3D4D40] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 active:scale-98"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* REAL USER SIGN UP (REGISTER) FORM */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A1A1A]">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C867E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#E5E2DD] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A1A1A]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C867E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="sarah.jenkins@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#E5E2DD] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A1A1A]">Account Role & Workspace Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { r: 'user', label: 'Patient / Consumer', icon: User },
                  { r: 'consultant', label: 'Skincare Consultant', icon: UserCheck },
                  { r: 'dermatologist', label: 'Dermatologist (MD)', icon: Stethoscope },
                  { r: 'admin', label: 'Platform Admin', icon: ShieldCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = regRole === item.r;
                  return (
                    <button
                      type="button"
                      key={item.r}
                      onClick={() => setRegRole(item.r)}
                      className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                        isSelected
                          ? 'border-[#4A5D4E] bg-[#EBF0EC] text-[#1A1A1A] font-semibold ring-1 ring-[#4A5D4E]'
                          : 'border-[#E5E2DD] bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[#66625D]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#4A5D4E]' : 'text-[#8C867E]'}`} />
                      <span className="text-xs truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skin Type Selection (for users) */}
            {regRole === 'user' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1A1A1A]">Skin Type Profile</label>
                <select
                  value={regSkinType}
                  onChange={(e) => setRegSkinType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E5E2DD] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#4A5D4E] font-medium"
                >
                  <option value="Combination">Combination Skin</option>
                  <option value="Oily">Oily Skin</option>
                  <option value="Dry">Dry Skin</option>
                  <option value="Sensitive">Sensitive Skin</option>
                  <option value="Normal">Normal Skin</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1A1A1A]">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E5E2DD] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#4A5D4E] font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1A1A1A]">Confirm Password</label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E5E2DD] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#4A5D4E] font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#4A5D4E] hover:bg-[#3D4D40] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 active:scale-98"
            >
              {isLoading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Real Account & Launch</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Collapsible Demo Quick-Test Section */}
        <div className="border-t border-[#E5E2DD] pt-4">
          <button
            type="button"
            onClick={() => setShowDemoSection(!showDemoSection)}
            className="w-full flex items-center justify-between text-xs text-[#66625D] hover:text-[#1A1A1A] font-semibold transition-colors py-1"
          >
            <span className="flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-[#8C867E]" />
              <span>Or click here to test with Demo Role Accounts</span>
            </span>
            {showDemoSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDemoSection && (
            <div className="mt-3 grid grid-cols-2 gap-2 pt-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickDemoLogin(acc)}
                    className="p-2.5 bg-[#FAF8F5] hover:bg-[#EBF0EC] border border-[#E5E2DD] rounded-xl text-left space-y-1 transition-all"
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-[#1A1A1A]">
                      <Icon className="w-3.5 h-3.5 text-[#4A5D4E]" />
                      <span className="capitalize">{acc.role}</span>
                    </div>
                    <span className="text-[10px] text-[#66625D] block truncate">{acc.email}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
