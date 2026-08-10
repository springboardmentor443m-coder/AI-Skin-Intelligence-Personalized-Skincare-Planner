import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, User as UserIcon, Menu } from 'lucide-react';

export const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full glass-card border-b border-slate-200/50 dark:border-slate-800/50 px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-orange-400 bg-clip-text text-transparent">
            DermaAI
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 text-xs font-semibold bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full border border-brand-200/30">
            Skin Intelligence
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-200 cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {user.full_name || user.email}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                {user.role}
              </span>
            </div>
            
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-200 to-brand-500 dark:from-brand-900 dark:to-brand-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;
