import { Flame, Droplets, Sun, Moon, Layers, AlertCircle, Activity, Grid2X2 } from "lucide-react";

/*
  Eight common skin concerns the platform is designed to help users understand.
  
  IMPORTANT: These are presented as EDUCATIONAL awareness areas, not medical diagnoses.
  The disclaimer at the bottom of this section reinforces this clearly.
*/
const concerns = [
  {
    icon: Flame,
    label: "Acne & Breakouts",
    description: "Excess sebum, clogged pores, and skin inflammation",
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: Droplets,
    label: "Dry & Dehydrated",
    description: "Lack of moisture and a weakened skin barrier",
    iconColor: "text-sky-500",
    iconBg: "bg-sky-50",
    border: "border-sky-100",
  },
  {
    icon: Sun,
    label: "Oily Skin",
    description: "Overactive sebaceous glands and unwanted shine",
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-50",
    border: "border-yellow-100",
  },
  {
    icon: Moon,
    label: "Dark Spots",
    description: "Post-inflammatory hyperpigmentation and sun damage",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    icon: Layers,
    label: "Uneven Skin Tone",
    description: "Redness, discoloration, and skin blotchiness",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50",
    border: "border-rose-100",
  },
  {
    icon: AlertCircle,
    label: "Sensitive Skin",
    description: "Reactivity, redness, itching, and irritation",
    iconColor: "text-pink-500",
    iconBg: "bg-pink-50",
    border: "border-pink-100",
  },
  {
    icon: Activity,
    label: "Wrinkles & Fine Lines",
    description: "Visible signs of aging and loss of elasticity",
    iconColor: "text-purple-500",
    iconBg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    icon: Grid2X2,
    label: "Enlarged Pores",
    description: "Visible pores and rough, uneven skin texture",
    iconColor: "text-teal-500",
    iconBg: "bg-teal-50",
    border: "border-teal-100",
  },
];

function SkinConcerns() {
  return (
    <section className="bg-gray-50 py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section heading */}
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Analysis Areas
          </span>
          <h2 className="mt-2 text-4xl font-bold text-gray-900">
            Skin Concerns We Help You Understand
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Our AI assessment is designed to help you identify and better
            understand a wide range of common skin concerns.
          </p>
        </div>

        {/*
          Concern cards: 2 columns on mobile, 3 on tablet, 4 on desktop.
          Each card has a colored icon, a label, and a brief description.
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {concerns.map((concern, index) => {
            const Icon = concern.icon;
            return (
              <div
                key={index}
                className={`bg-white border rounded-2xl p-6 hover:shadow-md transition-shadow duration-300 ${concern.border}`}
              >
                {/* Colored icon badge */}
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${concern.iconBg}`}>
                  <Icon size={22} className={concern.iconColor} />
                </div>

                {/* Concern label */}
                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                  {concern.label}
                </h3>

                {/* Short description */}
                <p className="text-gray-500 text-xs leading-relaxed">
                  {concern.description}
                </p>
              </div>
            );
          })}
        </div>

        {/*
          Disclaimer: This is important to include to be transparent
          that this is an educational AI tool, not medical advice.
        */}
        <p className="mt-10 text-center text-sm text-gray-400">
          ⚠️ This platform is an AI-assisted educational tool and is{" "}
          <strong>not</strong> a substitute for professional medical or
          dermatological advice. Always consult a qualified dermatologist.
        </p>

      </div>
    </section>
  );
}

export default SkinConcerns;
