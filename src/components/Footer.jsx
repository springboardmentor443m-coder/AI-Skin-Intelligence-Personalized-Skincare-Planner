import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">AI Skin Intelligence</p>
              <p className="text-sm text-slate-400">Premium skincare planning.</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
            A modern skincare platform blending medical-grade insights with AI-assisted planning for a more confident routine.
          </p>
        </div>

        <div>
          <p className="font-semibold text-white">Quick Links</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#features" className="transition hover:text-emerald-400">Features</a></li>
            <li><a href="#how-it-works" className="transition hover:text-emerald-400">How it works</a></li>
            <li><a href="#testimonials" className="transition hover:text-emerald-400">Testimonials</a></li>
            <li><Link to="/about" className="transition hover:text-emerald-400">About</Link></li>
            <li><Link to="/contact" className="transition hover:text-emerald-400">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-white">Stay connected</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            Explore the platform <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  )
}
