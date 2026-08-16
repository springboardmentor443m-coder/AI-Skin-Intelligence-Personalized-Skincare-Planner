import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, User as UserIcon, Menu } from 'lucide-react';

export const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full glass-card border-b border-slate-200/50 dark:border-slate-800/50 px-4 md:px-6 py-3 flex items-center justify-between print:hidden">

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
            AuraSkin AI
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 text-xs font-semibold bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full border border-brand-200/30">
            Precision Skin Health
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Switcher Sliding Capsule */}
        <div 
          onClick={toggleTheme}
          className="relative w-14 h-8 bg-slate-100 dark:bg-slate-800 rounded-full p-1 cursor-pointer flex items-center justify-between transition-all duration-300 border border-slate-200/40 dark:border-slate-700/40 shadow-inner select-none"
          title="Toggle between normal and dark screens"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500 z-10 ml-0.5" />
          <Moon className="w-3.5 h-3.5 text-blue-400 z-10 mr-0.5" />
          <div 
            className={`absolute w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform duration-300 ${
              theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </div>


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
