import React, { useState } from 'react';
import { Calendar, Sparkles, Clock, RotateCw } from 'lucide-react';

export default function RoutinePlanner({ routineData, skinConcern = 'Acne', recommendedProducts = [] }) {
  const [flippedCard, setFlippedCard] = useState(null);

  // Extract primary product names for active ingredient context
  const productNames = recommendedProducts.map(p => p.name || p.product_name).filter(Boolean);
  const activeProduct1 = productNames[0] || 'Targeted Active Treatment';
  const activeProduct2 = productNames[1] || 'Barrier Repair Hydrator';

  // Parser for raw Groq string output ("---Day 1---\nAM Routine: ...")
  const parseRoutineText = (text) => {
    if (!text || typeof text !== 'string') return [];

    const dayBlocks = text.split(/(?:---|###|\*\*\*|\n|^)(?:Day\s*\d+|DAY\s*\d+)/i).filter(b => b.trim().length > 10);

    return dayBlocks.map((block, idx) => {
      const amMatch = block.match(/(?:AM\s*Routine|Morning|AM):\s*([^\n]+(?:\n(?!(?:PM|Precautions|---|\*\*\*)).*)*)/i);
      const pmMatch = block.match(/(?:PM\s*Routine|Evening|PM):\s*([^\n]+(?:\n(?!(?:Precautions|---|\*\*\*)).*)*)/i);

      return {
        day: `DAY 0${idx + 1}`,
        am: amMatch ? amMatch[1].replace(/[\*\_\*]/g, '').trim() : null,
        pm: pmMatch ? pmMatch[1].replace(/[\*\_\*]/g, '').trim() : null
      };
    }).filter(item => item.am || item.pm);
  };

  // 1. Universal Condition Routine Generator (Covers ALL model classes)
  const generateUniversalRoutine = (concern) => {
    const normalized = (concern || '').toLowerCase();

    if (normalized.includes('dark spot') || normalized.includes('pigmentation')) {
      return Array.from({ length: 7 }, (_, i) => ({
        day: `DAY 0${i + 1}`,
        am: `Gentle Brightening Cleanser, ${activeProduct1} (Vitamin C / Niacinamide), Lightweight Hydrator, Broad Spectrum SPF 50+`,
        pm: `Gentle Cleanser, ${activeProduct2} (Targeted Pigment Corrector), Barrier Support Night Cream`
      }));
    }

    if (normalized.includes('wrinkle') || normalized.includes('fine line')) {
      return Array.from({ length: 7 }, (_, i) => ({
        day: `DAY 0${i + 1}`,
        am: `Hydrating Peptide Cleanser, Antioxidant Serum, ${activeProduct1}, Firming SPF 50+`,
        pm: `Gentle Cleansing Balm, ${activeProduct2} (Retinoid / Anti-Aging Complex), Deep Moisture Repair Cream`
      }));
    }

    if (normalized.includes('blackhead') || normalized.includes('pore')) {
      return Array.from({ length: 7 }, (_, i) => ({
        day: `DAY 0${i + 1}`,
        am: `Salicylic Acid Exfoliating Cleanser, ${activeProduct1}, Oil-Free Hydrating Gel, Mineral SPF 50+`,
        pm: `Pore-Clarifying Cleanser, ${activeProduct2} (Clay / BHA Treatment), Non-Comedogenic Moisturizer`
      }));
    }

    if (normalized.includes('puffy') || normalized.includes('eye')) {
      return Array.from({ length: 7 }, (_, i) => ({
        day: `DAY 0${i + 1}`,
        am: `Chilled Eye Gel / Cold Compress, ${activeProduct1} (Caffeine Serum), Lightweight Hydrating Lotion, SPF 50+`,
        pm: `Micellar Gentle Cleanser, ${activeProduct2} (Peptide Eye Repair Concentrate), Soothing Overnight Mask`
      }));
    }

    if (normalized.includes('clear')) {
      return Array.from({ length: 7 }, (_, i) => ({
        day: `DAY 0${i + 1}`,
        am: `Gentle Balanced Cleanser, Hydrating Vitamin Serum, Moisturizing Lotion, Daily Sunscreen SPF 50+`,
        pm: `Gentle Cleanser, ${activeProduct1}, Nourishing Barrier Restorative Night Cream`
      }));
    }

    // Default Fallback: Acne / Active Blemishes
    return Array.from({ length: 7 }, (_, i) => ({
      day: `DAY 0${i + 1}`,
      am: `Salicylic Acid 2% Cleanser, ${activeProduct1} (Niacinamide / Oil Control), Oil-Free Gel Moisturizer, Mineral SPF 50+`,
      pm: `Gentle Foaming Cleanser, ${activeProduct2} (Benzoyl Peroxide / Spot Treatment), Non-Comedogenic Barrier Cream`
    }));
  };

  // 2. Resolve Routine Days
  let rawText = typeof routineData === 'string' ? routineData : (routineData?.routine_7_day || '');
  let parsedDays = routineData?.days || parseRoutineText(rawText);

  // Generate routine based on the exact predicted condition from image upload
  const dynamicConditionDays = generateUniversalRoutine(skinConcern);

  const finalDays = Array.from({ length: 7 }, (_, idx) => {
    const parsed = parsedDays[idx];
    const fallback = dynamicConditionDays[idx];
    return {
      day: `DAY 0${idx + 1}`,
      am: (parsed && parsed.am) ? parsed.am : fallback.am,
      pm: (parsed && parsed.pm) ? parsed.pm : fallback.pm
    };
  });

  const toggleFlip = (index) => {
    setFlippedCard(flippedCard === index ? null : index);
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <Calendar className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              7-Day Personalized Skincare Planner
            </h2>

            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Click any day card to flip and view AM/PM regimen details
            </p>
          </div>

        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 self-start sm:self-auto flex items-center gap-1.5 capitalize">
          <Sparkles className="w-4 h-4" />
          {skinConcern} Regimen
        </span>

      </div>


      {/* 7-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

        {finalDays.map((item, idx) => {

          const isFlipped = flippedCard === idx;
          const dayTitle = item.day;

          return (
            <div
              key={idx}
              onClick={() => toggleFlip(idx)}
              className="cursor-pointer group h-[260px] perspective-1000"
            >

              <div
                className={`relative w-full h-full duration-500 transition-all transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >

                {/* FRONT SIDE - MINIMALIST DARK CARD */}

                <div className="absolute inset-0 w-full h-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between items-center text-center backface-hidden group-hover:border-emerald-500/50 transition">

                  <div className="w-full flex justify-end">
                    <RotateCw className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                  </div>

                  {/* Centered DAY Title */}

                  <div className="my-auto">
                    <h3 className="text-3xl font-black text-white tracking-tight">
                      {dayTitle}
                    </h3>
                  </div>

                  {/* Flip Details Footer */}

                  <div className="pt-3 border-t border-slate-800/80 w-full">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1 group-hover:text-emerald-400 transition">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Click card to flip details
                    </span>
                  </div>

                </div>


                {/* BACK SIDE - AM/PM REGIMEN DETAILS */}

                <div className="absolute inset-0 w-full h-full bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between rotate-y-180 backface-hidden text-slate-200">

                  <div className="space-y-4 overflow-y-auto pr-1 text-xs my-auto">

                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">

                      <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">
                        {dayTitle} Regimen
                      </span>

                      <span className="text-[10px] font-bold text-slate-500">
                        Click to flip
                      </span>

                    </div>


                    {/* AM Routine */}

                    <div className="space-y-1">

                      <span className="font-bold text-slate-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        AM Regimen
                      </span>

                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed pl-5">
                        {item.am}
                      </p>

                    </div>


                    {/* PM Routine */}

                    <div className="space-y-1">

                      <span className="font-bold text-slate-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        PM Regimen
                      </span>

                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed pl-5">
                        {item.pm}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}