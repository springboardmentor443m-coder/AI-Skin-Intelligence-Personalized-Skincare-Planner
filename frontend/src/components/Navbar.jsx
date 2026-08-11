import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";

function Navbar() {
  // Controls whether the mobile dropdown menu is open or closed
  const [mobileOpen, setMobileOpen] = useState(false);

  // Helper: close the mobile menu when a link is clicked
  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* ── Logo ── Clicking takes the user back to the Home page */}
        <Link to="/" className="flex items-center gap-2" onClick={closeMobile}>
          <Sparkles className="text-blue-600" size={26} />
          <span className="text-xl font-bold text-blue-600">AI Skin Intelligence</span>
        </Link>

        {/* ── Desktop Navigation ── Hidden on mobile, shown on md+ screens */}
        <div className="hidden md:flex items-center gap-7 font-medium text-gray-600 text-sm">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          <Link to="/login" className="hover:text-blue-600 transition-colors">Login</Link>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            Get Started
          </Link>
        </div>

        {/* ── Mobile Hamburger Button ── Only visible on small screens */}
        <button
          className="md:hidden text-gray-600 hover:text-blue-600 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {/* Show X icon when open, hamburger when closed */}
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

      </div>

      {/* ── Mobile Dropdown Menu ── Shown only when mobileOpen is true */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-5 flex flex-col gap-4 font-medium text-gray-600">
          <Link to="/" onClick={closeMobile} className="hover:text-blue-600 transition-colors">Home</Link>
          <a href="#features" onClick={closeMobile} className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#how-it-works" onClick={closeMobile} className="hover:text-blue-600 transition-colors">How It Works</a>
          <a href="#about" onClick={closeMobile} className="hover:text-blue-600 transition-colors">About</a>
          <Link to="/login" onClick={closeMobile} className="hover:text-blue-600 transition-colors">Login</Link>
          <Link
            to="/register"
            onClick={closeMobile}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg text-center hover:bg-blue-700 transition-colors font-semibold"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;