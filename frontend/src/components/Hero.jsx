import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-[90vh] flex items-center justify-center py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">

        {/* ── Badge ── Small pill above the headline */}
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-8">
          <Sparkles size={16} />
          <span>AI-Powered Skin Analysis Platform</span>
        </div>

        {/* ── Main Headline ── */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
          Understand Your Skin.{" "}
          <span className="text-blue-600">Transform</span> Your Routine.
        </h1>

        {/* ── Subheadline ── */}
        <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
          Our AI-powered platform analyzes your unique skin profile and delivers
          personalized skincare recommendations — helping you build a routine
          that truly works for you.
        </p>

        {/* ── CTA Button ── */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg shadow-blue-200"
          >
            Start Your Skin Analysis
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* ── Trust Indicator Badges ── */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-blue-500" />
            <span>Privacy Protected</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-blue-500" />
            <span>AI-Powered Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-500" />
            <span>Personalized Results</span>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;
