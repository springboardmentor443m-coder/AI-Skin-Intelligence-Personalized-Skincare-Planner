import { UserCheck, BookOpen, LineChart, Bot } from "lucide-react";

/*
  Four key benefits of using this platform.
  Focuses on value without making medical claims.
*/
const benefits = [
  {
    icon: UserCheck,
    title: "Personalized for You",
    description:
      "No two skins are alike. Our AI creates a skin profile unique to you — not generic advice from a blog post.",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    icon: BookOpen,
    title: "Clear & Understandable",
    description:
      "Results are presented in simple, jargon-free language so you know exactly what your skin needs and why.",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
  },
  {
    icon: LineChart,
    title: "Track Over Time",
    description:
      "Monitor your skin's improvements across weeks and months. See what's working and adjust your routine accordingly.",
    iconColor: "text-green-400",
    iconBg: "bg-green-100",
  },
  {
    icon: Bot,
    title: "AI-Powered Intelligence",
    description:
      "Powered by machine learning to give you insights that are fast, smart, and continuously improving.",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-100",
  },
];

function WhyChooseUs() {
  return (
    /*
      Dark section — creates a strong visual contrast between the
      white HowItWorks section above and the gray-50 SkinConcerns section below.
    */
    <section className="bg-gray-900 py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section heading (white text on dark background) */}
        <div className="text-center mb-16">
          <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">
            Our Advantage
          </span>
          <h2 className="mt-2 text-4xl font-bold text-white">
            Why Choose AI Skin Intelligence?
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            We combine technology and simplicity to help you build a skincare
            routine backed by data — not guesswork.
          </p>
        </div>

        {/* 4-column grid of white cards on the dark background */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-shadow duration-300"
              >
                {/* Colored icon badge */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 ${benefit.iconBg}`}>
                  <Icon size={28} className={benefit.iconColor} />
                </div>

                {/* Benefit title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {benefit.title}
                </h3>

                {/* Benefit description */}
                <p className="text-gray-500 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default WhyChooseUs;
