import React, { useState } from 'react';

interface LandingPageProps {
  setScreen: (screen: string) => void;
  onStartScan: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setScreen, onStartScan }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: 'biotech',
      title: 'Real-Time Skin Analysis',
      desc: 'Position your face in our clinical scanner for instant diagnostics of pores, redness, wrinkles, and hydration indices.'
    },
    {
      icon: 'calendar_today',
      title: 'Personalized Routine',
      desc: 'Receive morning and night protocol guidelines mapped to your skin concern profile and molecular ingredients checklist.'
    },
    {
      icon: 'shopping_bag',
      title: 'Product Recommendations',
      desc: 'Dermatologist-approved product catalog recommendations filtered by budget, skin goals, and allergen concerns.'
    },
    {
      icon: 'insights',
      title: 'Progress Tracking',
      desc: 'Visually monitor your skin repair journey with before-and-after image comparisons, progress charts, and health histories.'
    }
  ];

  const testimonials = [
    {
      quote: "Aetheris AI transformed how I select ingredients. The molecular analysis flagged compatibility issues I struggled with for years.",
      author: "Dr. Sarah Jenkins",
      role: "Clinical Dermatologist"
    },
    {
      quote: "My skin health score improved from 64% to 84% in just two months following my personalized morning vitamin C routines.",
      author: "Elena Thorne",
      role: "User & Skincare enthusiast"
    }
  ];

  const faqs = [
    {
      q: "How does the AI analyze my skin?",
      a: "Our AI scans high-resolution biometrics in real-time to analyze key dermal parameters including moisture retention, pore density, and skin barrier structural integrity."
    },
    {
      q: "Are the skincare recommendations dermatologist approved?",
      a: "Yes! Aetheris routines and ingredients are vetted by professional dermatologists who consult on our platform to ensure pharmaceutical safety standards."
    },
    {
      q: "How often should I scan my face?",
      a: "For optimal progress tracking, we recommend performing a live webcam scan once a week under similar ambient lighting conditions."
    }
  ];

  return (
    <div className="bg-background text-on-surface w-full min-h-screen">
      {/* Landing Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-surface/60 backdrop-blur-xl border-b border-outline-variant/20 z-50 flex justify-between items-center px-12">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('landing')}>
          <span className="material-symbols-outlined text-primary dark:text-primary-container text-3xl font-bold">auto_awesome</span>
          <div>
            <h1 className="font-display text-lg text-primary dark:text-primary-container font-bold leading-none">Aetheris AI</h1>
            <p className="text-[9px] text-on-surface-variant font-medium tracking-widest uppercase">Skin Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setScreen('landing')} className="text-xs font-semibold text-primary dark:text-primary-container hover:opacity-80">Home</button>
          <button onClick={() => setScreen('login')} className="text-xs font-semibold text-on-surface-variant hover:text-primary dark:hover:text-primary-container transition-colors">Sign In</button>
          <button 
            onClick={() => setScreen('register')} 
            className="px-5 py-2 bg-gradient-to-r from-primary to-tertiary text-white rounded-full text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-all active:scale-95"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-12 overflow-hidden bg-radial from-primary/10 via-background to-background">
        {/* Glow Shaders */}
        <div className="absolute top-24 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-48 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span className="text-xs font-bold tracking-wider uppercase">Next-Gen Skincare</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl text-on-surface font-bold leading-tight">
              AI Skin Intelligence &amp; <span className="text-primary">Personalized</span> Skincare Planner
            </h2>
            <p className="font-body text-base text-on-surface-variant max-w-lg leading-relaxed">
              Unlock the biology of your skin. Our AI scan maps 40+ biometric markers to curate clinical-grade, personalized skincare routines tailored to your unique skin type.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={onStartScan}
                className="px-8 py-4 bg-gradient-to-r from-primary to-tertiary text-white rounded-full font-bold shadow-2xl shadow-primary/30 flex items-center gap-3 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <span className="material-symbols-outlined">camera_front</span>
                Start AI Scan
              </button>
              <button 
                onClick={() => setScreen('login')}
                className="px-8 py-4 glass-panel text-primary rounded-full font-bold border border-primary/20 hover:bg-primary/5 transition-all cursor-pointer"
              >
                Sign In to Dashboard
              </button>
            </div>
          </div>

          {/* Futuristic Face Scanning Animation / Mock Illustration */}
          <div className="flex justify-center relative">
            <div className="relative w-full max-w-md aspect-square bg-surface-container-low dark:bg-zinc-800/40 rounded-3xl overflow-hidden glass-card p-6 flex items-center justify-center border border-white/20">
              {/* Central Glowing Face Frame */}
              <div className="relative w-72 h-72 border border-primary/20 rounded-full flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-[spin_40s_linear_infinite]"></div>
                
                {/* SVG Facial Biometrics Mesh Representation */}
                <svg className="w-56 h-56 text-primary/50 relative z-10 floating" viewBox="0 0 100 100" fill="none">
                  {/* Face outline */}
                  <path d="M50 15 C30 15 25 35 25 55 C25 75 35 85 50 85 C65 85 75 75 75 55 C75 35 70 15 50 15 Z" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                  {/* Eyes */}
                  <circle cx="40" cy="45" r="3" stroke="currentColor" strokeWidth="1" />
                  <circle cx="60" cy="45" r="3" stroke="currentColor" strokeWidth="1" />
                  {/* Nose */}
                  <path d="M50 45 L50 60 L47 62" stroke="currentColor" strokeWidth="1" />
                  {/* Mouth */}
                  <path d="M40 70 Q50 75 60 70" stroke="currentColor" strokeWidth="1" />
                  {/* Biometric Nodes */}
                  <circle cx="50" cy="20" r="1.5" fill="#256960" className="animate-pulse" />
                  <circle cx="30" cy="40" r="1.5" fill="#6050af" className="animate-pulse" />
                  <circle cx="70" cy="40" r="1.5" fill="#6050af" className="animate-pulse" />
                  <circle cx="40" cy="55" r="1.5" fill="#2b5f9f" className="animate-pulse" />
                  <circle cx="60" cy="55" r="1.5" fill="#2b5f9f" className="animate-pulse" />
                  <circle cx="50" cy="80" r="1.5" fill="#ba1a1a" className="animate-pulse" />
                  
                  {/* Connecting mesh lines */}
                  <line x1="50" y1="20" x2="30" y2="40" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="50" y1="20" x2="70" y2="40" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="30" y1="40" x2="40" y2="45" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="70" y1="40" x2="60" y2="45" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="40" y1="45" x2="50" y2="45" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="60" y1="45" x2="50" y2="45" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="50" y1="45" x2="50" y2="60" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="40" y1="55" x2="50" y2="60" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="60" y1="55" x2="50" y2="60" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="50" y1="60" x2="50" y2="80" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="40" y1="70" x2="50" y2="80" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                  <line x1="60" y1="70" x2="50" y2="80" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                </svg>

                {/* Laser scan animation line overlay */}
                <div className="absolute inset-x-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan-move_4s_linear_infinite] z-20"></div>

                {/* Tracking stats */}
                <div className="absolute -top-4 -right-4 glass-panel px-3 py-1.5 rounded-lg border-white/30 text-[10px] font-bold text-secondary uppercase animate-pulse">
                  FACIAL SCAN: ACTIVE
                </div>
                <div className="absolute -bottom-4 -left-4 glass-panel px-3 py-1.5 rounded-lg border-white/30 text-[10px] font-bold text-primary uppercase">
                  MATCH INDEX: 98.4%
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature Cards Section */}
      <section className="py-20 px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[11px] font-bold text-primary tracking-widest uppercase mb-2 block">Dermal Features</span>
          <h3 className="font-display text-3xl font-bold">Comprehensive Skincare Management</h3>
          <p className="text-on-surface-variant text-sm mt-3">From real-time biometrics to tailored product lines, Aetheris AI plans every step of your skin rejuvenation journey.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-outline-variant/20 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                </div>
                <h4 className="font-display text-base font-bold text-on-surface mb-2">{feature.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{feature.desc}</p>
              </div>
              <button 
                onClick={() => setScreen('login')}
                className="mt-6 text-xs font-bold text-primary flex items-center gap-1 hover:underline text-left cursor-pointer"
              >
                Explore Screen
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-12 bg-surface-container-low/30 dark:bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-secondary tracking-widest uppercase mb-2 block">TRUSTED BY CLINICIANS</span>
            <h3 className="font-display text-2xl font-bold">User Testimonials</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="glass-card p-8 rounded-2xl border border-white/20 relative">
                <span className="material-symbols-outlined text-4xl text-primary/10 absolute top-4 left-4" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                <p className="text-xs text-on-surface leading-relaxed relative z-10 italic">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-[10px]">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">{t.author}</h5>
                    <p className="text-[9px] text-on-surface-variant font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-12 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold text-primary tracking-widest uppercase mb-block mb-2">FAQ</span>
          <h3 className="font-display text-2xl font-bold">Frequently Asked Questions</h3>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="border-b border-outline-variant/20 py-4">
                <button 
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center text-left text-xs font-bold text-on-surface hover:text-primary transition-colors py-2"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-sm font-bold">
                    {isOpen ? 'remove' : 'add'}
                  </span>
                </button>
                {isOpen && (
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-2 pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-surface-container-high dark:bg-zinc-950/60 border-t border-outline-variant/10 py-12 px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl font-bold">auto_awesome</span>
              <span className="font-display text-sm font-bold text-on-surface">Aetheris AI</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">Precision-based molecular diagnostics & AI skincare planner.</p>
          </div>
          <div>
            <h5 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-4">Platform</h5>
            <ul className="space-y-2 text-[10px] text-on-surface-variant font-medium">
              <li><button onClick={onStartScan} className="hover:text-primary">Live Face Scan</button></li>
              <li><button onClick={() => setScreen('login')} className="hover:text-primary">Clinical Reports</button></li>
              <li><button onClick={() => setScreen('login')} className="hover:text-primary">Routine Planner</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-4">Dermatology</h5>
            <ul className="space-y-2 text-[10px] text-on-surface-variant font-medium">
              <li><button onClick={() => setScreen('login')} className="hover:text-secondary">Consultant Portal</button></li>
              <li><button onClick={() => setScreen('login')} className="hover:text-secondary">Dermatologist Clinical</button></li>
              <li><button onClick={() => setScreen('login')} className="hover:text-secondary">Molecular Ingredients</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[11px] font-bold text-on-surface uppercase tracking-widest mb-4">Legal</h5>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">© 2026 Aetheris AI Inc. All rights reserved. Vetted by professional clinical researchers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
