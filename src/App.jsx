import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { UserDashboard } from './components/UserDashboard';
import { ConsultantDashboard } from './components/ConsultantDashboard';
import { DermatologistDashboard } from './components/DermatologistDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SkinAssessmentView } from './components/SkinAssessmentView';
import { RoutinePlanner } from './components/RoutinePlanner';
import { IngredientIntelligence } from './components/IngredientIntelligence';
import { ProductRecommendations } from './components/ProductRecommendations';
import { ProgressTracking } from './components/ProgressTracking';
import { ReportsAndExports } from './components/ReportsAndExports';
import { ProjectDocsAndPresentation } from './components/ProjectDocsAndPresentation';

import {
  INITIAL_USER_PROFILE,
  INITIAL_ASSESSMENT,
  INITIAL_ROUTINE,
  INGREDIENTS_DATABASE,
  PRODUCTS_DATABASE,
  INITIAL_PROGRESS_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CLINICAL_REPORTS,
} from './data/mockData';

import {
  LayoutDashboard,
  Camera,
  Sparkles,
  FlaskConical,
  ShoppingBag,
  TrendingUp,
  FileText,
  BookOpen,
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentRole, setCurrentRole] = useState('user');
  const [activeTab, setActiveTab] = useState('dashboard');

  const [userProfile, setUserProfile] = useState(INITIAL_USER_PROFILE);
  const [assessmentResult, setAssessmentResult] = useState(INITIAL_ASSESSMENT);
  const [personalizedRoutine, setPersonalizedRoutine] = useState(INITIAL_ROUTINE);
  const [progressLogs, setProgressLogs] = useState(INITIAL_PROGRESS_LOGS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [reports, setReports] = useState(INITIAL_CLINICAL_REPORTS);

  const [allUsersList, setAllUsersList] = useState([
    INITIAL_USER_PROFILE,
    {
      id: 'usr_002',
      name: 'Dr. Evelyn Vance',
      email: 'evelyn.vance@dermaglow.med',
      role: 'dermatologist',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      skinType: 'Normal',
      ageGroup: '35-44',
      skinConcerns: [],
      allergies: [],
      sensitivities: [],
      lifestyle: {
        sleepHours: 8,
        sleepQuality: 'Excellent',
        waterIntakeLiters: 3,
        uvExposure: 'Low',
        pollutionExposure: 'Low',
        stressLevel: 'Low',
        climate: 'Temperate',
      },
      routineConsistency: 95,
    },
    {
      id: 'usr_003',
      name: 'Marcus Vance',
      email: 'marcus.vance@example.com',
      role: 'user',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      skinType: 'Dry',
      ageGroup: '35-44',
      skinConcerns: ['Dry Skin', 'Redness'],
      allergies: ['Sulfates'],
      sensitivities: ['High Alcohol'],
      lifestyle: {
        sleepHours: 6.5,
        sleepQuality: 'Average',
        waterIntakeLiters: 1.8,
        uvExposure: 'High',
        pollutionExposure: 'Moderate',
        stressLevel: 'High',
        climate: 'Dry/Arid',
      },
      routineConsistency: 72,
    },
  ]);

  const handleLogin = (user, role) => {
    setUserProfile(user);
    setCurrentRole(role);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Toggle step completion in routine
  const handleToggleRoutineStep = (stepId, timeOfDay) => {
    setPersonalizedRoutine((prev) => {
      const updateStep = (steps) =>
        steps.map((s) => (s.id === stepId ? { ...s, completedToday: !s.completedToday } : s));

      return {
        ...prev,
        morningSteps: timeOfDay === 'morning' ? updateStep(prev.morningSteps) : prev.morningSteps,
        eveningSteps: timeOfDay === 'evening' ? updateStep(prev.eveningSteps) : prev.eveningSteps,
        weeklyTreatments: timeOfDay === 'weekly' ? updateStep(prev.weeklyTreatments) : prev.weeklyTreatments,
      };
    });
  };

  const handleUpdateProfile = (updated) => {
    setUserProfile(updated);
  };

  const handleUpdateLifestyle = (water, sleep) => {
    setUserProfile((prev) => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        waterIntakeLiters: water,
        sleepHours: sleep,
      },
    }));
  };

  const handleMarkNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleAssessmentCompleted = (newAssessment) => {
    setAssessmentResult(newAssessment);
  };

  const handleAddLogEntry = (entry) => {
    setProgressLogs((prev) => [entry, ...prev]);
  };

  const handleRoleUpdateForUser = (userId, newRole) => {
    setAllUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (userId === userProfile.id) {
      setCurrentRole(newRole);
    }
  };

  const handleConsultationSubmit = async (query) => {
    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: query,
          profile: userProfile,
          assessment: assessmentResult,
        }),
      });
      const data = await response.json();
      return data.response || 'Dermatological AI advice generated successfully.';
    } catch (err) {
      console.error('Consultation error:', err);
      return 'Dr. Vance Note: Please continue your regular barrier hydration routine.';
    }
  };

  // If not authenticated, present LoginScreen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Get nav tabs relevant to current role
  const allNavTabs = [
    { id: 'dashboard', label: currentRole === 'user' ? 'Dashboard' : `${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Workspace`, icon: LayoutDashboard, roles: ['user', 'consultant', 'dermatologist', 'admin'] },
    { id: 'assessment', label: 'Skin Assessment', icon: Camera, roles: ['user', 'dermatologist'] },
    { id: 'routine', label: 'Personalized Routine', icon: Sparkles, roles: ['user', 'consultant'] },
    { id: 'ingredients', label: 'Ingredient Intelligence', icon: FlaskConical, roles: ['user', 'consultant', 'dermatologist', 'admin'] },
    { id: 'products', label: 'Product Recommendations', icon: ShoppingBag, roles: ['user', 'consultant'] },
    { id: 'progress', label: 'Progress & Analytics', icon: TrendingUp, roles: ['user', 'consultant'] },
    { id: 'reports', label: 'Reports & Exports', icon: FileText, roles: ['user', 'consultant', 'dermatologist', 'admin'] },
    { id: 'docs', label: 'Project Documentation', icon: BookOpen, roles: ['user', 'consultant', 'dermatologist', 'admin'] },
  ];

  const visibleNavTabs = allNavTabs.filter((tab) => tab.roles.includes(currentRole));

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] font-sans flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        healthScore={assessmentResult.overallScore}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-2 border-b border-[#E5E2DD] overflow-x-auto pb-3 scrollbar-none">
          {visibleNavTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#4A5D4E] text-white shadow-xs'
                    : 'text-[#66625D] hover:text-[#1A1A1A] hover:bg-[#F4F1EA]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic View Content based on Tab & Active Role */}
        {activeTab === 'dashboard' && (
          <>
            {currentRole === 'user' && (
              <UserDashboard
                profile={userProfile}
                assessment={assessmentResult}
                routine={personalizedRoutine}
                products={PRODUCTS_DATABASE}
                onToggleRoutineStep={handleToggleRoutineStep}
                onNavigateToTab={setActiveTab}
                onUpdateLifestyle={handleUpdateLifestyle}
              />
            )}
            {currentRole === 'consultant' && (
              <ConsultantDashboard
                profile={userProfile}
                assessment={assessmentResult}
                routine={personalizedRoutine}
                onUpdateRoutineByConsultant={setPersonalizedRoutine}
              />
            )}
            {currentRole === 'dermatologist' && (
              <DermatologistDashboard
                profile={userProfile}
                assessment={assessmentResult}
                onConsultationSubmit={handleConsultationSubmit}
              />
            )}
            {currentRole === 'admin' && (
              <AdminDashboard
                users={allUsersList}
                onRoleUpdate={handleRoleUpdateForUser}
              />
            )}
          </>
        )}

        {activeTab === 'assessment' && (
          <SkinAssessmentView
            userProfile={userProfile}
            latestAssessment={assessmentResult}
            onAssessmentCompleted={handleAssessmentCompleted}
            onNavigateToRoutine={() => setActiveTab('routine')}
          />
        )}

        {activeTab === 'routine' && (
          <RoutinePlanner
            routine={personalizedRoutine}
            userProfile={userProfile}
            assessment={assessmentResult}
            onToggleStep={handleToggleRoutineStep}
            onUpdateRoutine={setPersonalizedRoutine}
          />
        )}

        {activeTab === 'ingredients' && (
          <IngredientIntelligence
            ingredients={INGREDIENTS_DATABASE}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'products' && (
          <ProductRecommendations
            products={PRODUCTS_DATABASE}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTracking
            logs={progressLogs}
            userProfile={userProfile}
            onAddLogEntry={handleAddLogEntry}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsAndExports
            reports={reports}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'docs' && <ProjectDocsAndPresentation />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E2DD] bg-[#FAF8F5] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#66625D] gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#4A5D4E]" />
            <span className="font-serif italic font-medium text-sm text-[#1A1A1A]">DermaGlow AI Skin Intelligence</span>
            <span>• Editorial Clinical Platform</span>
          </div>
          <p>© 2026 AI Skin Intelligence Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
