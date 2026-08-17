import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

function CallToAction() {
  return (
    /*
      Final CTA section — the last persuasive push before the footer.
      Uses a blue gradient to stand out strongly from surrounding sections.
    */
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">

        {/* Small badge pill */}
        <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-full mb-8">
          <Sparkles size={16} />
          <span>Start Your Journey Today</span>
        </div>

        {/* Main CTA headline */}
        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          Ready to Discover What Your Skin Truly Needs?
        </h2>

        {/* Supporting text — no medical claims, honest framing */}
        <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
          Take the free skin analysis and receive personalized insights powered
          by AI. No medical expertise required — just honest answers about your
          skin.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          {/* Primary: go to registration */}
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Register — It&apos;s Free
            <ArrowRight size={20} />
          </Link>

          {/* Secondary: go to login for returning users */}
          <Link
            to="/login"
            className="flex items-center justify-center border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-white/10 transition-colors"
          >
            Already have an account? Login
          </Link>
        </div>

      </div>
    </section>
  );
}

export default CallToAction;
