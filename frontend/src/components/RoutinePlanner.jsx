import React, { useState } from 'react';
import { Calendar, Sparkles, Clock, RotateCw } from 'lucide-react';

export default function RoutinePlanner({
  routineData,
  skinConcern = 'Acne',
  recommendedProducts = []
}) {
  const [flippedCard, setFlippedCard] = useState(null);

  /*
   * ============================================================
   * PRODUCT CONTEXT
   * ============================================================
   */

  const productNames = recommendedProducts
    .map((p) => p?.name || p?.product_name)
    .filter(Boolean);

  const activeProduct1 =
    productNames[0] || 'Targeted Active Treatment';

  const activeProduct2 =
    productNames[1] || 'Barrier Repair Hydrator';

  const activeProduct3 =
    productNames[2] || 'Supportive Treatment';

  const activeProduct4 =
    productNames[3] || 'Hydrating Treatment';

  const activeProduct5 =
    productNames[4] || 'Maintenance Treatment';


  /*
   * ============================================================
   * GET RAW ROUTINE TEXT
   * ============================================================
   */

  const getRawRoutineText = () => {
    if (typeof routineData === 'string') {
      return routineData;
    }

    if (
      routineData &&
      typeof routineData.routine_7_day === 'string'
    ) {
      return routineData.routine_7_day;
    }

    if (
      routineData &&
      typeof routineData.routine === 'string'
    ) {
      return routineData.routine;
    }

    return '';
  };


  /*
   * ============================================================
   * ROBUST 7-DAY ROUTINE PARSER
   *
   * Handles Groq output such as:
   *
   * ### ---Day 1---
   * **AM Routine:**
   * 1. Gentle cleanser
   * 2. Moisturizer
   *
   * **PM Routine:**
   * 1. Cleanser
   * 2. Treatment
   *
   * ### ---Day 2---
   * ...
   * ============================================================
   */

  const parseRoutineText = (text) => {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const lines = text
      .replace(/\r/g, '')
      .split('\n')
      .map((line) => line.trim());

    const days = [];

    let currentDay = null;
    let currentSection = null;

    for (const originalLine of lines) {

      if (!originalLine) {
        continue;
      }

      /*
       * Remove Markdown formatting only for parsing.
       */

      const line = originalLine
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .trim();


      /*
       * ========================================================
       * DAY HEADING
       *
       * Supports:
       *
       * ### ---Day 1---
       * ---Day 1---
       * ### Day 1
       * Day 1
       * **Day 1**
       * ========================================================
       */

      const dayMatch = line.match(
        /^(?:#{1,6}\s*)?(?:[-*_]+\s*)?Day\s*(\d+)\s*(?:[-*_]+)?\s*:?\s*$/i
      );

      if (dayMatch) {

        /*
         * Save previous day before starting new day.
         */

        if (currentDay) {
          days.push(currentDay);
        }

        const dayNumber = parseInt(dayMatch[1], 10);

        currentDay = {
          day: `DAY ${String(dayNumber).padStart(2, '0')}`,
          am: '',
          pm: ''
        };

        currentSection = null;

        continue;
      }


      /*
       * Ignore everything before Day 1.
       */

      if (!currentDay) {
        continue;
      }


      /*
       * ========================================================
       * AM ROUTINE
       * ========================================================
       */

      const amMatch = line.match(
        /^AM\s*(?:Routine|Regimen|Morning)?\s*:\s*(.*)$/i
      );

      if (amMatch) {

        currentSection = 'am';

        currentDay.am = amMatch[1]
          .replace(/\*\*/g, '')
          .trim();

        continue;
      }


      /*
       * ========================================================
       * PM ROUTINE
       * ========================================================
       */

      const pmMatch = line.match(
        /^PM\s*(?:Routine|Regimen|Evening)?\s*:\s*(.*)$/i
      );

      if (pmMatch) {

        currentSection = 'pm';

        currentDay.pm = pmMatch[1]
          .replace(/\*\*/g, '')
          .trim();

        continue;
      }


      /*
       * ========================================================
       * MULTI-LINE AM CONTENT
       * ========================================================
       */

      if (currentSection === 'am') {

        currentDay.am =
          `${currentDay.am} ${line}`
            .replace(/\*\*/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        continue;
      }


      /*
       * ========================================================
       * MULTI-LINE PM CONTENT
       * ========================================================
       */

      if (currentSection === 'pm') {

        currentDay.pm =
          `${currentDay.pm} ${line}`
            .replace(/\*\*/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        continue;
      }
    }


    /*
     * Save the final day.
     */

    if (currentDay) {
      days.push(currentDay);
    }


    /*
     * ========================================================
     * CLEAN AND SORT DAYS
     * ========================================================
     */

    const uniqueDays = [];

    const seenDays = new Set();

    for (const day of days) {

      if (
        !day ||
        (!day.am && !day.pm)
      ) {
        continue;
      }

      if (!seenDays.has(day.day)) {

        seenDays.add(day.day);

        uniqueDays.push(day);
      }
    }


    const finalParsedDays = uniqueDays
      .sort((a, b) => {

        const dayA = parseInt(
          a.day.replace(/\D/g, ''),
          10
        );

        const dayB = parseInt(
          b.day.replace(/\D/g, ''),
          10
        );

        return dayA - dayB;
      })
      .slice(0, 7);


    /*
     * ========================================================
     * DEBUG
     * ========================================================
     */

    console.log(
      'RoutinePlanner parsed AI days:',
      finalParsedDays
    );

    console.log(
      'RoutinePlanner parsed day count:',
      finalParsedDays.length
    );

    finalParsedDays.forEach((day, index) => {

      console.log(
        `DAY ${index + 1} AM:`,
        day.am
      );

      console.log(
        `DAY ${index + 1} PM:`,
        day.pm
      );

    });


    return finalParsedDays;
  };


  /*
   * ============================================================
   * FALLBACK ROUTINE
   *
   * Used ONLY if the backend routine cannot be parsed.
   * ============================================================
   */

  const generateUniversalRoutine = (concern) => {

    const normalized =
      (concern || '').toLowerCase();

    let baseAM = '';
    let basePM = '';


    if (
      normalized.includes('dark spot') ||
      normalized.includes('pigmentation')
    ) {

      baseAM =
        'Gentle Brightening Cleanser, Lightweight Hydrator, Broad Spectrum SPF 50+';

      basePM =
        `${activeProduct1}, Barrier Support Night Cream`;

    }

    else if (
      normalized.includes('wrinkle') ||
      normalized.includes('fine line')
    ) {

      baseAM =
        'Hydrating Cleanser, Antioxidant Serum, Firming SPF 50+';

      basePM =
        `${activeProduct1}, Deep Moisture Repair Cream`;

    }

    else if (
      normalized.includes('blackhead') ||
      normalized.includes('pore')
    ) {

      baseAM =
        'Salicylic Acid Cleanser, Oil-Free Hydrating Gel, Mineral SPF 50+';

      basePM =
        `${activeProduct1}, Non-Comedogenic Moisturizer`;

    }

    else if (
      normalized.includes('puffy') ||
      normalized.includes('eye')
    ) {

      baseAM =
        'Gentle Cleanser, Caffeine Eye Serum, Lightweight Hydrator, SPF 50+';

      basePM =
        `${activeProduct1}, Soothing Overnight Moisturizer`;

    }

    else if (
      normalized.includes('clear')
    ) {

      baseAM =
        'Gentle Balanced Cleanser, Hydrating Serum, Moisturizer, SPF 50+';

      basePM =
        `${activeProduct1}, Barrier Restorative Night Cream`;

    }

    else {

      baseAM =
        'Gentle Cleanser, Lightweight Moisturizer, Mineral SPF 50+';

      basePM =
        `${activeProduct1}, Non-Comedogenic Barrier Cream`;
    }


    /*
     * Progressive fallback.
     */

    return [
      {
        day: 'DAY 01',
        am: baseAM,
        pm: `Gentle Cleanser, ${activeProduct1} small patch test, Barrier Moisturizer`
      },

      {
        day: 'DAY 02',
        am: `${baseAM}, no additional active`,
        pm: `Gentle Cleanser, ${activeProduct1} thin layer for first full-face use, Barrier Moisturizer`
      },

      {
        day: 'DAY 03',
        am: `${baseAM}, add ${activeProduct3}`,
        pm: `Gentle Cleanser, continue ${activeProduct1}, Hydrating Barrier Support`
      },

      {
        day: 'DAY 04',
        am: `${baseAM}, continue ${activeProduct3}`,
        pm: `Gentle Cleanser, alternate ${activeProduct1} with ${activeProduct2}, Barrier Moisturizer`
      },

      {
        day: 'DAY 05',
        am: `${baseAM}, add ${activeProduct4}`,
        pm: `Gentle Cleanser, alternate ${activeProduct1} and ${activeProduct2}, increase only if tolerated`
      },

      {
        day: 'DAY 06',
        am: `${baseAM}, include ${activeProduct4} and ${activeProduct5}`,
        pm: `Gentle Cleanser, regular rotation of ${activeProduct1} and ${activeProduct2}, Recovery Moisturizer`
      },

      {
        day: 'DAY 07',
        am: `${baseAM}, full maintenance routine with ${activeProduct3}`,
        pm: `Gentle Cleanser, maintenance rotation of ${activeProduct1}, ${activeProduct2} and ${activeProduct5}, Barrier Cream`
      }
    ];
  };


  /*
   * ============================================================
   * RESOLVE ROUTINE DATA
   * ============================================================
   */

  const rawText = getRawRoutineText();

  let parsedDays = [];


  /*
   * First use structured backend days if available.
   */

  if (
    routineData &&
    Array.isArray(routineData.days) &&
    routineData.days.length > 0
  ) {

    parsedDays = routineData.days
      .filter(
        (day) =>
          day &&
          (day.am || day.pm)
      )
      .slice(0, 7)
      .map((day, index) => ({
        day:
          day.day ||
          `DAY ${String(index + 1).padStart(2, '0')}`,

        am:
          typeof day.am === 'string'
            ? day.am.trim()
            : '',

        pm:
          typeof day.pm === 'string'
            ? day.pm.trim()
            : ''
      }));
  }


  /*
   * If structured days are not available,
   * parse the raw Groq response.
   */

  if (parsedDays.length === 0) {
    parsedDays = parseRoutineText(rawText);
  }


  /*
   * ============================================================
   * DETERMINE WHETHER AI ROUTINE WAS SUCCESSFULLY PARSED
   * ============================================================
   */

  const usingAI =
    parsedDays.length > 0;


  /*
   * ============================================================
   * FINAL DAYS
   *
   * IMPORTANT:
   *
   * If AI returned Day 1-7, use those exact routines.
   *
   * We DO NOT replace all seven days with the fallback just
   * because one day happens to be missing.
   * ============================================================
   */

  const fallbackDays =
    generateUniversalRoutine(skinConcern);


  let finalDays;


  if (usingAI) {

    finalDays =
      Array.from({ length: 7 }, (_, idx) => {

        const aiDay =
          parsedDays.find(
            (day) =>
              day.day ===
              `DAY ${String(idx + 1).padStart(2, '0')}`
          );

        const fallback =
          fallbackDays[idx];

        return {
          day:
            `DAY ${String(idx + 1).padStart(2, '0')}`,

          am:
            aiDay?.am ||
            fallback.am,

          pm:
            aiDay?.pm ||
            fallback.pm
        };
      });

  } else {

    finalDays = fallbackDays;
  }


  /*
   * ============================================================
   * FINAL DEBUG
   * ============================================================
   */

  console.log(
    'RoutinePlanner usingAI:',
    usingAI
  );

  console.log(
    'RoutinePlanner finalDays:',
    finalDays
  );


  /*
   * ============================================================
   * CARD FLIP
   * ============================================================
   */

  const toggleFlip = (index) => {

    setFlippedCard(
      flippedCard === index
        ? null
        : index
    );

  };


  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="space-y-6">

      {/* Header */}

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


      {/* 7-Day Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

        {finalDays.map((item, idx) => {

          const isFlipped =
            flippedCard === idx;

          const dayTitle =
            item.day ||
            `DAY ${String(idx + 1).padStart(2, '0')}`;

          return (

            <div
              key={idx}
              onClick={() => toggleFlip(idx)}
              className="cursor-pointer group h-[260px] perspective-1000"
            >

              <div
                className={`relative w-full h-full duration-500 transition-all transform-style-3d ${
                  isFlipped
                    ? 'rotate-y-180'
                    : ''
                }`}
              >

                {/* FRONT */}

                <div className="absolute inset-0 w-full h-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between items-center text-center backface-hidden group-hover:border-emerald-500/50 transition">

                  <div className="w-full flex justify-end">

                    <RotateCw className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />

                  </div>

                  <div className="my-auto">

                    <h3 className="text-3xl font-black text-white tracking-tight">

                      {dayTitle}

                    </h3>

                  </div>

                  <div className="pt-3 border-t border-slate-800/80 w-full">

                    <span className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1 group-hover:text-emerald-400 transition">

                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />

                      Click card to flip details

                    </span>

                  </div>

                </div>


                {/* BACK */}

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


                    {/* AM */}

                    <div className="space-y-1">

                      <span className="font-bold text-slate-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">

                        <Clock className="w-3.5 h-3.5 text-amber-400" />

                        AM Regimen

                      </span>

                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed pl-5">

                        {item.am || 'AM routine unavailable'}

                      </p>

                    </div>


                    {/* PM */}

                    <div className="space-y-1">

                      <span className="font-bold text-slate-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">

                        <Clock className="w-3.5 h-3.5 text-indigo-400" />

                        PM Regimen

                      </span>

                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed pl-5">

                        {item.pm || 'PM routine unavailable'}

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