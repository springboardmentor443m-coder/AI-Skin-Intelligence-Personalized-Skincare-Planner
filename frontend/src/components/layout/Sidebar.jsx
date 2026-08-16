import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  User as UserIcon, 
  Stethoscope, 
  Users, 
  ShieldAlert, 
  ShieldCheck,
  Sparkles,
  Settings,
  ShoppingBag,
  TrendingUp,
  X
} from 'lucide-react';


export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  // Define navigation links based on user roles
  const getNavLinks = () => {
    const base = [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/profile', label: 'Skin Profile', icon: UserIcon },
      { to: '/tracker', label: 'Progress Tracker', icon: TrendingUp },
      { to: '/routines', label: 'Routine Planner', icon: Sparkles },
      { to: '/ingredients', label: 'Ingredient Analyzer', icon: ShieldCheck },
      { to: '/recommendations', label: 'Product Picks', icon: ShoppingBag }
    ];


    if (role === 'dermatologist' || role === 'admin') {
      base.push({ to: '/dermatologist-portal', label: 'Dermatologist Console', icon: Stethoscope });
    }

    if (role === 'consultant' || role === 'admin') {
      base.push({ to: '/consultant-portal', label: 'Consultant Hub', icon: Users });
    }

    if (role === 'admin') {
      base.push({ to: '/admin-portal', label: 'Admin Console', icon: ShieldAlert });
    }

    return base;
  };

  const navLinks = getNavLinks();

  const activeStyle = "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/10 transition-all duration-200";
  const inactiveStyle = "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-600 hover:text-brand-500 hover:bg-brand-50/50 dark:text-slate-350 dark:hover:text-brand-400 dark:hover:bg-slate-800/40 transition-all duration-200";


  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 glass-card border-r border-slate-200/50 dark:border-slate-800/50 p-4 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 lg:h-[calc(100vh-65px)] print:hidden ${

          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between lg:hidden mb-6">
          <span className="font-bold text-slate-800 dark:text-slate-200">Navigation</span>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Brand Banner */}
        <div className="mb-8 p-4 bg-gradient-to-br from-brand-50 to-brand-100/30 dark:from-slate-900 dark:to-brand-900/10 rounded-2xl border border-brand-200/20">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <Sparkles className="w-5 h-5 animate-pulse-soft" />
            <span className="text-xs uppercase font-extrabold tracking-wider">Plan Activated</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Welcome back! Monitor concerns, analyze scans, and track routine progress.
          </p>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          AuraSkin AI v1.0.0

        </div>
      </aside>
    </>
  );
};
export default Sidebar;
