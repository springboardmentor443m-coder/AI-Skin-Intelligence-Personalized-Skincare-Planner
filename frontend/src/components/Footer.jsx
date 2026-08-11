import { Link } from "react-router-dom";
import { Sparkles, Mail, Phone, MapPin } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">

      {/*
        id="about" matches href="#about" anchor in Navbar.jsx
        Clicking "About" in the nav smoothly scrolls to this section.
      */}
      <div id="about" className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Column 1 — Brand & About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-blue-400" size={24} />
              <span className="text-xl font-bold text-white">
                AI Skin Intelligence
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              A final-year AI project designed to help you understand your skin
              better through machine learning and personalized recommendations.
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-400 transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-400 shrink-0" />
                <span>aiskinplatform@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-400 shrink-0" />
                <span>+66 00 000 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-blue-400 shrink-0" />
                <span>Bangkok, Thailand</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="border-t border-gray-700 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AI Skin Intelligence Platform. All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;

