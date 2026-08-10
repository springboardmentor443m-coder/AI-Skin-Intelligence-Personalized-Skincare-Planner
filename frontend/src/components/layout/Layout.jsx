import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      {/* Global Navbar */}
      <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
      
      <div className="flex-1 flex relative overflow-hidden">
        {/* Role-Based Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Body */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-h-[calc(100vh-65px)]">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default Layout;
