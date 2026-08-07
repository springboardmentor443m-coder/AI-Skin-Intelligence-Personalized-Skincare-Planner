import type { UserProfileData } from '../App';

interface SidebarProps {
  currentScreen: string;
  setScreen: (screen: string) => void;
  setUserRole: (role: string) => void;
  onLogout: () => void;
  userProfile: UserProfileData;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  setScreen,
  setUserRole,
  onLogout,
  userProfile
}) => {
  const isSpecialScreen = ['landing', 'login', 'register', 'forgot-password'].includes(currentScreen);
  if (isSpecialScreen) return null;

  const userNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'scan', label: 'AI Skin Scan', icon: 'camera_front' },
    { id: 'analysis', label: 'Skin Analysis', icon: 'biotech' },
    { id: 'routine', label: 'Personalized Routine', icon: 'calendar_today' },
    { id: 'ingredients', label: 'Ingredient Intelligence', icon: 'science' },
    { id: 'products', label: 'Product Recommendations', icon: 'shopping_bag' },
    { id: 'progress', label: 'Progress Tracking', icon: 'insights' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
    { id: 'consultant-chat', label: 'AI Consultant Chat', icon: 'chat_bubble' },
    { id: 'history', label: 'Scan History', icon: 'history' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  const portals = [
    { id: 'consultant', label: 'Consultant Portal', icon: 'supervised_user_circle', role: 'consultant' },
    { id: 'dermatologist', label: 'Dermatologist Portal', icon: 'medical_services', role: 'dermatologist' },
    { id: 'admin', label: 'Admin Dashboard', icon: 'admin_panel_settings', role: 'admin' },
  ];

  const handlePortalClick = (screenId: string, role: string) => {
    setUserRole(role);
    setScreen(screenId);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-sidebar-width bg-surface-container-lowest/40 dark:bg-zinc-900/40 backdrop-blur-2xl border-r border-white/10 shadow-xl shadow-tertiary/10 z-50 flex flex-col h-full py-base gap-2">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-outline-variant/10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('landing')}>
          <span className="material-symbols-outlined text-primary text-3xl font-bold">auto_awesome</span>
          <div>
            <h1 className="font-display text-lg text-primary font-bold leading-none">Aetheris AI</h1>
            <p className="text-[10px] text-on-surface-variant font-medium tracking-widest uppercase mt-1">Skin Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Areas */}
      <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-2">Patient Services</p>
          {userNavItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-primary hover:bg-primary/5 hover:translate-x-1'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-1 border-t border-outline-variant/10 pt-4">
          <p className="px-4 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-2">Staff Portals</p>
          {portals.map((portal) => {
            const isActive = currentScreen === portal.id;
            return (
              <button
                key={portal.id}
                onClick={() => handlePortalClick(portal.id, portal.role)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                  isActive
                    ? 'bg-secondary/10 text-secondary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-secondary hover:bg-secondary/5 hover:translate-x-1'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{portal.icon}</span>
                <span className="text-xs font-semibold">{portal.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pro Membership & Profile Summary */}
      <div className="p-4 border-t border-outline-variant/10 mt-auto bg-surface-container-low/20 dark:bg-zinc-900/20">
        <div className="glass-panel p-3.5 rounded-xl border border-primary/20 bg-primary/5 mb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">PRO MEMBER</p>
          </div>
          <p className="text-[10px] text-on-surface-variant leading-relaxed mb-3">Unlock molecular diagnostics & expert dermatologist chat.</p>
          <button 
            onClick={() => setScreen('profile')}
            className="w-full py-1.5 bg-gradient-to-r from-primary to-tertiary text-white text-[10px] font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-transform"
          >
            Manage Membership
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/10 overflow-hidden">
              <img 
                className="w-full h-full object-cover" 
                alt="Elena Thorne" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeJrOzApKKzahJRbrDTojv5G4rBl50MwXRnClqB8YFZLzfMmM9vupYmjL-K-eEQ11BAYlO0cu6yT6AQ1Ye5QoPAygf_rtVqz1l-Xuav-D5HvbHm-BpoyRACEzJVWnQRod3Y9dhrIM6hTH-ejjFlQSOQyN9aESHj9Fy5TC4jrPeXfuzFDWz9JPIL6q0BbPbIC4bPgl3z2b9AOk-QlEi7EMi3U4DuuP5mKegpdXE4Uel_X-Swq9pfOl4R3dyVurM3vcnn8ylOIxwQkhv"
              />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{userProfile.name}</p>
              <p className="text-[9px] text-on-surface-variant font-medium tracking-wide uppercase">{userProfile.skinType} Skin</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="material-symbols-outlined text-on-surface-variant hover:text-error text-lg cursor-pointer p-1 rounded-full hover:bg-error/5 transition-colors"
            title="Log Out"
          >
            logout
          </button>
        </div>
      </div>
    </aside>
  );
};
