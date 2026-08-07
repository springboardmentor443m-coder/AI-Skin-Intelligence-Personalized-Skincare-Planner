import React, { useState } from 'react';

interface HeaderProps {
  currentScreen: string;
  setScreen: (screen: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  setScreen,
  darkMode,
  setDarkMode
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isSpecialScreen = ['landing', 'login', 'register', 'forgot-password'].includes(currentScreen);
  if (isSpecialScreen) return null;

  const mockNotifications = [
    { id: 1, text: "Skin Scan analysis complete. Health Score is 84%.", time: "2 hours ago", unread: true },
    { id: 2, text: "Your Morning Skincare Routine reminder.", time: "7 hours ago", unread: false },
    { id: 3, text: "New dermatologist recommendation available.", time: "1 day ago", unread: false }
  ];

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.toLowerCase().includes('product') || searchQuery.toLowerCase().includes('moisturizer')) {
      setScreen('products');
    } else if (searchQuery.toLowerCase().includes('routine') || searchQuery.toLowerCase().includes('morning')) {
      setScreen('routine');
    } else if (searchQuery.toLowerCase().includes('ingredient') || searchQuery.toLowerCase().includes('retinol')) {
      setScreen('ingredients');
    } else if (searchQuery.toLowerCase().includes('progress') || searchQuery.toLowerCase().includes('trend')) {
      setScreen('progress');
    } else {
      alert(`Search results for "${searchQuery}" not found. Try searching: "products", "routine", "ingredients", or "progress".`);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 ml-sidebar-width h-16 bg-surface/60 backdrop-blur-xl border-b border-outline-variant/20 z-40 px-container-padding flex justify-between items-center shadow-sm shadow-tertiary/5">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center bg-surface-container-low px-4 py-2 rounded-full w-96 border border-outline-variant/30">
        <span className="material-symbols-outlined text-on-surface-variant text-xl mr-2">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search concerns, ingredients, products..."
          className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs w-full text-on-surface placeholder:text-on-surface-variant/60"
        />
      </form>

      {/* Action Icons */}
      <div className="flex items-center gap-4 relative">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer active:scale-95 text-on-surface-variant"
          title="Toggle Light/Dark Theme"
        >
          <span className="material-symbols-outlined">{darkMode ? 'light_mode' : 'contrast'}</span>
        </button>

        {/* Notifications Button */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer active:scale-95 relative text-on-surface-variant"
          title="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full animate-pulse"></span>
        </button>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="absolute right-12 top-12 w-80 bg-surface-container-highest border border-outline-variant/30 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-outline-variant/10">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Notifications</h4>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-[10px] text-primary dark:text-primary-container font-bold hover:underline"
              >
                Mark all read
              </button>
            </div>
            <div className="space-y-3">
              {mockNotifications.map((notif) => (
                <div key={notif.id} className="flex gap-2 p-2 hover:bg-surface-container-high rounded-lg cursor-pointer transition-colors">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${notif.unread ? 'bg-primary dark:bg-primary-container' : 'bg-transparent'}`}></span>
                  <div>
                    <p className="text-[11px] leading-relaxed text-on-surface">{notif.text}</p>
                    <p className="text-[9px] text-on-surface-variant mt-0.5">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Profile Trigger */}
        <button
          onClick={() => setScreen('profile')}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer active:scale-95"
          title="View Profile"
        >
          <span className="material-symbols-outlined text-primary dark:text-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
        </button>
      </div>
    </header>
  );
};
