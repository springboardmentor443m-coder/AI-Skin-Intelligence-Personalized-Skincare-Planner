import { Brain, ScanSearch, BarChart3, ShieldCheck, Zap, FlaskConical } from "lucide-react";

/*
  Each feature object stores:
  - icon: the Lucide icon component (not pre-rendered JSX — this is the correct React pattern)
  - title: card heading
  - description: card body text
  - iconColor: text color class for the icon
  - iconBg: background color class for the icon circle
*/
const features = [
  {
    icon: ScanSearch,
    title: "AI Skin Analysis",
    description:
      "Answer a detailed skin questionnaire and our AI engine will map your skin type, tone, and current condition with precision.",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    icon: Brain,
    title: "Smart Recommendations",
    description:
      "Receive a personalized skincare routine — cleansers, serums, moisturizers — matched precisely to your unique skin profile.",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Track how your skin changes over time. Visualize improvements and stay motivated with detailed progress reports.",
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    icon: FlaskConical,
    title: "Ingredient Intelligence",
    description:
      "Understand what's inside your products. Our AI flags harmful ingredients and highlights what truly works for your skin.",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "No long waits. Get your skin analysis and product recommendations within seconds, powered by a fast ML backend.",
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "Your skin data is encrypted and never shared with third parties. Your privacy is our top priority.",
    iconColor: "text-teal-600",
    iconBg: "bg-teal-100",
  },
];

function Features() {
  return (
    /*
      id="features" matches href="#features" anchor in Navbar.jsx
      Clicking "Features" in the nav smoothly scrolls to this section.
    */
    <section id="features" className="bg-gray-50 py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section heading */}
        <div className="text-center mb-16">
          {/* Small label above the main heading — common in modern landing pages */}
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            What We Offer
          </span>
          <h2 className="mt-2 text-4xl font-bold text-gray-900">
            Everything You Need for Healthier Skin
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with dermatological knowledge
            to give you a truly personalized skincare experience.
          </p>
        </div>

        {/* 3-column responsive grid of feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon; // Render the icon component dynamically
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
              >
                {/* Colored icon badge circle */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 ${feature.iconBg}`}>
                  <Icon size={24} className={feature.iconColor} />
                </div>

                {/* Card title */}
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>

                {/* Card description */}
                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default Features;


