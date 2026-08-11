import { ClipboardList, Cpu, Lightbulb, TrendingUp } from "lucide-react";

/*
  Each step represents one stage in the user's journey through the platform.
  We present this as the INTENDED workflow — not as a currently live AI feature.
*/
const steps = [
  {
    icon: ClipboardList,
    title: "Complete Your Skin Profile",
    description:
      "Answer a short questionnaire about your skin type, concerns, lifestyle, and current routine. No technical knowledge needed.",
  },
  {
    icon: Cpu,
    title: "AI Analyzes Your Data",
    description:
      "Our machine learning model processes your responses and identifies your unique skin patterns and needs.",
  },
  {
    icon: Lightbulb,
    title: "Receive Personalized Insights",
    description:
      "Get a clear skin health breakdown and a curated list of product recommendations tailored specifically to you.",
  },
  {
    icon: TrendingUp,
    title: "Track & Improve Over Time",
    description:
      "Log your progress, update your profile as your skin changes, and watch your skincare routine evolve with you.",
  },
];

function HowItWorks() {
  return (
    /*
      id="how-it-works" matches href="#how-it-works" anchor in Navbar.jsx
      Clicking "How It Works" in the nav smoothly scrolls here.
    */
    <section id="how-it-works" className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section heading */}
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="mt-2 text-4xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Getting personalized skincare insights takes just a few minutes.
            Follow these four simple steps to start your skin journey.
          </p>
        </div>

        {/* Steps grid: 1 column on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center">

                {/* Numbered icon circle */}
                <div className="relative mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 mb-6">
                  <Icon size={30} className="text-white" />

                  {/*
                    Step number badge — positioned at the top-right of the circle
                    Uses index + 1 so it shows 1, 2, 3, 4
                  */}
                  <span className="absolute -top-2 -right-1 w-7 h-7 bg-white text-blue-600 text-xs font-bold border-2 border-blue-100 rounded-full flex items-center justify-center shadow-sm">
                    {index + 1}
                  </span>
                </div>

                {/* Step title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {step.title}
                </h3>

                {/* Step description */}
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;
