import React, { useState } from 'react';

interface Ingredient {
  name: string;
  benefits: string;
  suitability: string;
  avoidMixing: string;
  warning: string;
  description: string;
  compatibility: number;
}

export const Ingredients: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient>({
    name: 'Niacinamide (Vitamin B3)',
    benefits: 'Regulates sebum, minimizes pore appearance, reinforces skin lipid barrier, blocks pigmentation transfers.',
    suitability: 'All Skin Types, sensitive skin friendly',
    avoidMixing: 'High concentration Vitamin C (L-Ascorbic Acid) simultaneously, as it may cause facial flushing (use alternately).',
    warning: 'Generally safe. Mild irritation if layered with strong AHA/BHAs in sensitive profiles.',
    description: 'Niacinamide is a water-soluble vitamin that works with natural substances in your skin to visibly improve enlarged pores, uneven skin tone, fine lines, dullness, and a weakened surface barrier.',
    compatibility: 98
  });

  const ingredientsList: Ingredient[] = [
    {
      name: 'Niacinamide (Vitamin B3)',
      benefits: 'Regulates sebum, minimizes pore appearance, reinforces skin lipid barrier, blocks pigmentation transfers.',
      suitability: 'All Skin Types, sensitive skin friendly',
      avoidMixing: 'High concentration Vitamin C (L-Ascorbic Acid) simultaneously, as it may cause facial flushing (use alternately).',
      warning: 'Generally safe. Mild irritation if layered with strong AHA/BHAs in sensitive profiles.',
      description: 'Niacinamide is a water-soluble vitamin that works with natural substances in your skin to visibly improve enlarged pores, uneven skin tone, fine lines, dullness, and a weakened surface barrier.',
      compatibility: 98
    },
    {
      name: 'Retinol (Vitamin A)',
      benefits: 'Boosts collagen production, speeds up cellular turn-over, treats fine lines and deep wrinkles.',
      suitability: 'Mature Skin, Oily/Acne-prone. Caution for sensitive skin.',
      avoidMixing: 'Salicylic Acid, Benzoyl Peroxide, Glycolic Acid (AHA) in the same application phase.',
      warning: 'May cause dryness, redness, and peeling during initial 2-4 weeks. Increases UV sensitivity. Use SPF daily.',
      description: 'Retinol is an over-the-counter formulation of vitamin A. It penetrates the stratum corneum to stimulate cell regeneration, resurface skin textures, and prevent collagen degradation.',
      compatibility: 84
    },
    {
      name: 'Hyaluronic Acid',
      benefits: 'Draws moisture deep into dermal layers, plumps skin volume, reduces fine dehydration lines.',
      suitability: 'Dry Skin, Combination, Sensitive Skin',
      avoidMixing: 'None. Safe to mix with all cosmetic actives.',
      warning: 'None. Extremely low allergen potential.',
      description: 'Hyaluronic Acid is a naturally occurring polysaccharide in human skin tissue. It acts as a powerful humectant, capable of binding up to 1,000 times its molecular weight in water.',
      compatibility: 95
    },
    {
      name: 'Vitamin C (L-Ascorbic Acid)',
      benefits: 'Powerful antioxidant, targets post-inflammatory hyperpigmentation, brightens skin tone.',
      suitability: 'Combination Skin, Dullness, Pigmented areas',
      avoidMixing: 'Retinol, Niacinamide (use at separate times of the day).',
      warning: 'Can oxidize if exposed to light/air. Irritates sensitive skin at concentrations >15%.',
      description: 'Vitamin C is an essential micronutrient and potent antioxidant. It neutralizes free radical damage caused by UV rays, inhibits melanin synthesis, and promotes collagen synthesis.',
      compatibility: 92
    },
    {
      name: 'Salicylic Acid (BHA)',
      benefits: 'Exfoliates deep inside pore linings, dissolves sebum plugs, treats blackheads and acne flares.',
      suitability: 'Oily Skin, Acne-prone profiles',
      avoidMixing: 'Retinol, Glycolic Acid (prevents severe barrier stripping).',
      warning: 'Do not use if allergic to aspirin. Can be drying if overused.',
      description: 'Salicylic Acid is a oil-soluble beta hydroxy acid. Because of its lipid solubility, it easily penetrates deep into oil glands to clear debris, regulate oil, and calm skin inflammation.',
      compatibility: 88
    }
  ];

  const filtered = ingredientsList.filter(ing => 
    ing.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Ingredient Intelligence</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-1">Search molecular formulas, check active compatibility, and cross-reference allergen warnings.</p>
      </div>

      <div className="grid grid-cols-12 gap-card-gap">
        {/* Ingredients Search & List */}
        <div className="col-span-12 lg:col-span-5 glass-card p-6 rounded-2xl border border-white/20 flex flex-col justify-between min-h-[450px]">
          <div>
            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search active ingredients..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-on-surface"
              />
            </div>
            
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
              {filtered.map((ing, idx) => {
                const isSelected = selectedIngredient.name === ing.name;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedIngredient(ing)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border flex justify-between items-center ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary font-bold'
                        : 'bg-surface-container-low dark:bg-zinc-850 border-transparent hover:border-outline-variant/30 text-on-surface'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold">{ing.name}</h4>
                      <p className="text-[9px] text-on-surface-variant font-medium mt-0.5 max-w-[200px] truncate">{ing.benefits}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ing.compatibility >= 95 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
                      }`}>
                        {ing.compatibility}% Fit
                      </span>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-10 text-xs text-on-surface-variant font-medium">
                  No molecular ingredients matched.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-outline-variant/10 pt-4 mt-6">
            <div className="flex gap-2 items-center text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-base">info</span>
              <p className="text-[9px] font-medium leading-relaxed">Always perform a patch test on your forearm before applying new chemical formulas.</p>
            </div>
          </div>
        </div>

        {/* Selected Ingredient Intelligence details */}
        <div className="col-span-12 lg:col-span-7 glass-card p-6 rounded-2xl border border-white/20 min-h-[450px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display text-lg font-bold text-on-surface">{selectedIngredient.name}</h3>
                <span className="text-[9px] text-primary font-semibold uppercase tracking-wider block mt-1">Chemical Properties &amp; Biometrics</span>
              </div>
              <div className="text-center bg-primary/10 text-primary px-3 py-1.5 rounded-xl border border-primary/20">
                <span className="text-lg font-display font-bold leading-none block">{selectedIngredient.compatibility}%</span>
                <span className="text-[8px] font-bold text-on-surface-variant uppercase">Match Score</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Scientific Description</h4>
                <p className="text-xs text-on-surface dark:text-zinc-200 leading-relaxed font-medium">
                  {selectedIngredient.description}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Dermal Benefits</h4>
                <p className="text-xs text-on-surface dark:text-zinc-200 leading-relaxed font-medium">
                  {selectedIngredient.benefits}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low dark:bg-zinc-800/40 p-3 rounded-xl border border-outline-variant/10">
                  <h4 className="text-[9px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">thumb_up</span> Suitable For
                  </h4>
                  <p className="text-[10px] text-on-surface dark:text-zinc-200 mt-1 font-medium">{selectedIngredient.suitability}</p>
                </div>

                <div className="bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                  <h4 className="text-[9px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">do_not_disturb_on</span> Avoid Mixing
                  </h4>
                  <p className="text-[10px] text-on-surface dark:text-zinc-200 mt-1 font-medium">{selectedIngredient.avoidMixing}</p>
                </div>
              </div>

              <div className="bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/10">
                <h4 className="text-[9px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span> Allergy Warning &amp; Side-Effects
                </h4>
                <p className="text-[10px] text-on-surface dark:text-zinc-200 mt-1 font-medium leading-relaxed">{selectedIngredient.warning}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant/10 pt-4 mt-6 flex justify-end">
            <button 
              onClick={() => alert(`Dermal compatibility report downloaded for ${selectedIngredient.name}`)}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white text-xs font-bold rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Download Spec Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
