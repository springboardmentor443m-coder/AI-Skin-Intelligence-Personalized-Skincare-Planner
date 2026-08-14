// ============================================================
// AI SKIN INTELLIGENCE
// SKIN COMPARISON VIEW
// ============================================================
//
// Purpose:
//   Compare the user's previous and latest skin scans.
//
// Data source:
//   GET /api/comparison
//
// Backend comparison flow:
//
//   Previous Scan
//        ↓
//   Latest Scan
//        ↓
//   Compare 6 CNN probabilities
//        ↓
//   Calculate Before → After changes
//        ↓
//   Send probability changes to Groq
//        ↓
//   Generate AI comparison report
//
// Important:
//   Probability changes are AI model outputs.
//   They are NOT medical measurements or diagnoses.
//
// ============================================================

import React, {
  useEffect,
  useState,
} from 'react';

import {
  Activity,
  FileText,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Radar,
  AlertCircle,
  Info,
} from 'lucide-react';

import {
  getComparison,
} from '../services/api';


// ============================================================
// COMPONENT
// ============================================================

export default function ComparisonView() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    comparisonData,
    setComparisonData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');


  // ==========================================================
  // LOAD COMPARISON WHEN PAGE OPENS
  // ==========================================================

  useEffect(() => {

    fetchComparison();

  }, []);


  // ==========================================================
  // FETCH COMPARISON FROM BACKEND
  // ==========================================================

  const fetchComparison = async () => {

    setLoading(true);
    setError('');

    try {

      const data =
        await getComparison();

      console.log(
        'Skin comparison data:',
        data
      );

      setComparisonData(data);

    } catch (err) {

      console.error(
        'Comparison API Error:',
        err
      );

      const backendMessage =
        err?.response?.data?.detail;

      setError(
        backendMessage ||
        err?.message ||
        'Unable to load skin comparison.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {

    return (

      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">

        <RefreshCw
          className="
            w-8 h-8
            text-emerald-600
            animate-spin
            mx-auto
          "
        />

        <div>

          <p className="text-sm font-semibold text-slate-600">
            Preparing your skin progress comparison...
          </p>

          <p className="text-[11px] text-slate-400 mt-1">
            Comparing your previous and latest AI scan.
          </p>

        </div>

      </div>

    );
  }


  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {

    return (

      <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center space-y-4 shadow-sm">

        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto">

          <AlertCircle className="w-6 h-6 text-rose-600" />

        </div>


        <div>

          <h3 className="text-base font-black text-slate-900">
            Comparison Could Not Be Loaded
          </h3>

          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {error}
          </p>

        </div>


        <button
          type="button"
          onClick={fetchComparison}
          className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            bg-emerald-600
            hover:bg-emerald-500
            text-white
            rounded-xl
            text-xs
            font-bold
            transition
          "
        >

          <RefreshCw className="w-4 h-4" />

          Try Again

        </button>

      </div>

    );
  }


  // ============================================================
  // NOT ENOUGH SCANS
  // ============================================================

  if (
    !comparisonData ||
    comparisonData.available === false
  ) {

    return (

      <div className="space-y-6">

        {/* ------------------------------------------------------
            PAGE HEADER
        ------------------------------------------------------ */}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">

              <Activity className="w-6 h-6" />

            </div>


            <div>

              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Skin Progress Comparison
              </h2>

              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Compare your previous and latest AI skin analysis
              </p>

            </div>

          </div>

        </div>


        {/* ------------------------------------------------------
            EMPTY STATE
        ------------------------------------------------------ */}

        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">

          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">

            <Activity className="w-7 h-7 text-emerald-600" />

          </div>


          <h3 className="text-base font-black text-slate-900">
            Two Scans Are Required
          </h3>


          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">

            Upload at least two skin scans to compare
            the AI model's probability distributions
            and generate a personalized progress report.

          </p>


          <div className="mt-5 inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">

            <Info className="w-4 h-4 text-slate-400" />

            <span className="text-[11px] font-semibold text-slate-500">
              The comparison uses your two most recent scans.
            </span>

          </div>

        </div>

      </div>

    );
  }


  // ============================================================
  // SAFE DATA EXTRACTION
  // ============================================================

  const baseline =
    comparisonData.baseline || {};

  const current =
    comparisonData.current || {};

  const changes =
    comparisonData.changes || {};

  const confidenceChange =
    Number(
      comparisonData.confidence_change
    ) || 0;


  // ============================================================
  // SIX MODEL CLASSES
  // ============================================================

  const radarClasses = [

    'acne',

    'blackheads',

    'clear skin',

    'dark spots',

    'puffy eyes',

    'wrinkles',

  ];


  const radarLabels = [

    'Acne',

    'Blackheads',

    'Clear Skin',

    'Dark Spots',

    'Puffy Eyes',

    'Wrinkles',

  ];


  // ============================================================
  // DATE FORMATTER
  // ============================================================

  const formatDate = (date) => {

    if (!date) {
      return 'Scan';
    }

    try {

      const parsedDate =
        new Date(date);

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return 'Scan';
      }

      return parsedDate.toLocaleString(
        [],
        {
          dateStyle: 'medium',
          timeStyle: 'short',
        }
      );

    } catch {

      return 'Scan';

    }

  };


  // ============================================================
  // SAFE NUMBER FORMATTER
  // ============================================================

  const formatPercentage = (
    value
  ) => {

    const number =
      Number(value) || 0;

    return number.toFixed(1);

  };


  // ============================================================
  // CHANGE CLASSIFICATION
  // ============================================================

  const getChangeType = (
    condition,
    change
  ) => {

    const numericChange =
      Number(change) || 0;


    if (
      Math.abs(numericChange) < 0.05
    ) {

      return 'neutral';

    }


    if (
      condition === 'clear skin'
    ) {

      return numericChange > 0
        ? 'positive'
        : 'negative';

    }


    return numericChange < 0
      ? 'positive'
      : 'negative';

  };


  // ============================================================
  // RADAR CHART CONFIGURATION
  // ============================================================

  const center = 150;

  const radius = 105;


  // ============================================================
  // RADAR POINT
  // ============================================================

  const getPoint = (
    value,
    index
  ) => {

    const angle =
      (
        Math.PI * 2 * index
      ) /
      radarClasses.length -
      Math.PI / 2;


    const normalized =
      Math.max(
        0,
        Math.min(
          100,
          Number(value) || 0
        )
      ) / 100;


    const r =
      radius * normalized;


    return {

      x:
        center +
        r *
          Math.cos(angle),

      y:
        center +
        r *
          Math.sin(angle),

    };

  };


  // ============================================================
  // RADAR AXIS POINT
  // ============================================================

  const getAxisPoint = (
    index
  ) => {

    const angle =
      (
        Math.PI * 2 * index
      ) /
      radarClasses.length -
      Math.PI / 2;


    return {

      x:
        center +
        radius *
          Math.cos(angle),

      y:
        center +
        radius *
          Math.sin(angle),

    };

  };


  // ============================================================
  // CREATE RADAR POLYGON
  // ============================================================

  const createPolygonPoints = (
    type
  ) => {

    return radarClasses

      .map(
        (
          condition,
          index
        ) => {

          const item =
            changes[
              condition
            ] || {};


          const value =
            type === 'before'
              ? Number(
                  item.before
                ) || 0
              : Number(
                  item.after
                ) || 0;


          const point =
            getPoint(
              value,
              index
            );


          return `${point.x},${point.y}`;

        }
      )

      .join(' ');

  };


  const beforePolygon =
    createPolygonPoints(
      'before'
    );


  const afterPolygon =
    createPolygonPoints(
      'after'
    );


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="space-y-6">


      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">


        <div className="flex items-center gap-3">

          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">

            <Activity className="w-6 h-6" />

          </div>


          <div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              AI Skin Progress Comparison
            </h2>

            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Previous scan compared with your latest scan
            </p>

          </div>

        </div>


        {/* Neutral confidence information */}

        <div className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">

          <Activity className="w-4 h-4 text-slate-400" />

          Model Confidence:

          <span className="text-slate-900">

            {confidenceChange > 0
              ? `+${formatPercentage(
                  confidenceChange
                )}`
              : formatPercentage(
                  confidenceChange
                )}

            {' '}pts

          </span>

        </div>

      </div>


      {/* ======================================================
          BEFORE / AFTER SCANS
          ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


        {/* ====================================================
            BEFORE
            ==================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">


          <div className="flex justify-between items-center">

            <div>

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Before Scan
              </span>

              <span className="text-[11px] text-slate-500">
                {formatDate(
                  baseline.date
                )}
              </span>

            </div>

          </div>


          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">

            {baseline.image_url ? (

              <img
                src={
                  baseline.image_url
                }
                alt="Previous skin scan"
                className="w-full h-full object-cover"
              />

            ) : (

              <div className="flex items-center justify-center h-full text-xs text-slate-400 font-semibold">
                Previous image unavailable
              </div>

            )}

          </div>


          <div className="flex justify-between items-center">


            <div>

              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Primary Condition
              </span>

              <span className="text-lg font-black text-slate-900 capitalize">
                {baseline.class ||
                  'Unknown'}
              </span>

            </div>


            <div className="text-right">

              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Model Confidence
              </span>

              <span className="text-lg font-black text-slate-700">

                {formatPercentage(
                  baseline.confidence
                )}%

              </span>

            </div>

          </div>

        </div>


        {/* ====================================================
            LATEST
            ==================================================== */}

        <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm space-y-4">


          <div className="flex justify-between items-center">

            <div>

              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                Latest Scan
              </span>

              <span className="text-[11px] text-slate-500">
                {formatDate(
                  current.date
                )}
              </span>

            </div>

          </div>


          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-emerald-200">

            {current.image_url ? (

              <img
                src={
                  current.image_url
                }
                alt="Latest skin scan"
                className="w-full h-full object-cover"
              />

            ) : (

              <div className="flex items-center justify-center h-full text-xs text-slate-400 font-semibold">
                Latest image unavailable
              </div>

            )}

          </div>


          <div className="flex justify-between items-center">


            <div>

              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Primary Condition
              </span>

              <span className="text-lg font-black text-slate-900 capitalize">
                {current.class ||
                  'Unknown'}
              </span>

            </div>


            <div className="text-right">

              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Model Confidence
              </span>

              <span className="text-lg font-black text-emerald-600">

                {formatPercentage(
                  current.confidence
                )}%

              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          PROBABILITY CHANGES
          GREEN + BLACK ANALYTICS THEME
          ====================================================== */}

      <div className="
        bg-slate-950
        rounded-2xl
        border
        border-emerald-900/60
        p-6
        shadow-xl
      ">


        <div className="
          flex
          items-center
          gap-2
          border-b
          border-emerald-900/60
          pb-4
        ">

          <Activity className="w-5 h-5 text-emerald-400" />

          <div>

            <h3 className="
              text-sm
              font-black
              text-emerald-400
              uppercase
              tracking-wider
            ">
              Model Probability Changes
            </h3>

            <p className="
              text-[11px]
              text-slate-500
              mt-0.5
            ">
              Before → Latest → Change
            </p>

          </div>

        </div>


        <div className="mt-5 space-y-5">


          {radarClasses.map(
            (
              condition,
              index
            ) => {

              const item =
                changes[
                  condition
                ] || {

                  before: 0,

                  after: 0,

                  change: 0,

                };


              const change =
                Number(
                  item.change
                ) || 0;


              const changeType =
                getChangeType(
                  condition,
                  change
                );


              const label =
                radarLabels[
                  index
                ];


              return (

                <div
                  key={condition}
                  className="space-y-2"
                >


                  {/* ------------------------------------------
                      LABELS
                      ------------------------------------------ */}

                  <div className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-2
                  ">


                    <span className="
                      text-xs
                      font-bold
                      text-slate-200
                    ">
                      {label}
                    </span>


                    <div className="
                      flex
                      items-center
                      gap-3
                      text-[11px]
                      font-bold
                    ">


                      <span className="text-slate-500">
                        {formatPercentage(
                          item.before
                        )}%
                      </span>


                      <span className="text-emerald-900">
                        →
                      </span>


                      <span className="text-emerald-300">
                        {formatPercentage(
                          item.after
                        )}%
                      </span>


                      {/* Change */}

                      <span
                        className={`
                          flex
                          items-center
                          gap-0.5
                          min-w-[65px]
                          justify-end
                          ${
                            changeType ===
                            'positive'
                              ? 'text-emerald-400'
                              : changeType ===
                                'negative'
                              ? 'text-rose-400'
                              : 'text-slate-500'
                          }
                        `}
                      >

                        {changeType ===
                        'positive' ? (

                          <TrendingDown className="w-3.5 h-3.5" />

                        ) : changeType ===
                          'negative' ? (

                          <TrendingUp className="w-3.5 h-3.5" />

                        ) : null}


                        {change > 0
                          ? `+${formatPercentage(
                              change
                            )}`
                          : formatPercentage(
                              change
                            )}

                        {' '}pts

                      </span>

                    </div>

                  </div>


                  {/* ------------------------------------------
                      LATEST PROBABILITY BAR
                      ------------------------------------------ */}

                  <div className="
                    w-full
                    h-2
                    bg-slate-800
                    rounded-full
                    overflow-hidden
                    border
                    border-emerald-950
                  ">

                    <div
                      className={`
                        h-full
                        rounded-full
                        transition-all
                        duration-700
                        ${
                          condition ===
                          'clear skin'
                            ? `
                              bg-emerald-400
                              shadow-[0_0_8px_rgba(52,211,153,0.55)]
                            `
                            : `
                              bg-emerald-700
                            `
                        }
                      `}
                      style={{
                        width: `${Math.max(
                          1,
                          Math.min(
                            100,
                            Number(
                              item.after
                            ) || 0
                          )
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              );

            }
          )}

        </div>


        {/* ====================================================
            EXPLANATION
            ==================================================== */}

        <div className="
          mt-6
          p-4
          bg-slate-900
          rounded-xl
          border
          border-emerald-900/60
        ">

          <div className="flex items-start gap-2">

            <Info className="
              w-4
              h-4
              text-emerald-500
              flex-shrink-0
              mt-0.5
            " />

            <p className="
              text-[11px]
              text-slate-400
              leading-relaxed
            ">

              <span className="
                font-bold
                text-emerald-400
              ">
                How to read this:
              </span>{' '}

              A decrease in the probability of a skin-concern
              class generally means the model is assigning less
              probability to that class in the latest scan.
              For the clear-skin class, an increase is generally
              favorable. These changes are model outputs and
              should not be treated as clinically validated
              measurements.

            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          RADAR CHART
          GREEN + BLACK ANALYTICS THEME
          ====================================================== */}

      <div className="
        bg-slate-950
        rounded-2xl
        border
        border-emerald-900/60
        p-6
        shadow-xl
      ">


        <div className="
          flex
          items-center
          gap-2
          border-b
          border-emerald-900/60
          pb-4
        ">

          <Radar className="w-5 h-5 text-emerald-400" />

          <div>

            <h3 className="
              text-sm
              font-black
              text-emerald-400
              uppercase
              tracking-wider
            ">
              Before vs Latest Probability Profile
            </h3>

            <p className="
              text-[11px]
              text-slate-500
              mt-0.5
            ">
              Six-class AI probability distribution
            </p>

          </div>

        </div>


        <div className="
          flex
          flex-col
          items-center
          justify-center
          mt-5
        ">


          <svg
            viewBox="0 0 300 300"
            className="w-full max-w-[420px] h-auto"
          >


            {/* ==================================================
                RADAR GRID RINGS
                ================================================== */}

            {[25, 50, 75, 100].map(
              (level) => {

                const points =
                  radarClasses
                    .map(
                      (
                        _,
                        index
                      ) => {

                        const point =
                          getPoint(
                            level,
                            index
                          );

                        return `${point.x},${point.y}`;

                      }
                    )
                    .join(' ');


                return (

                  <polygon
                    key={level}
                    points={points}
                    fill="none"
                    stroke="#14532d"
                    strokeWidth="1"
                  />

                );

              }
            )}


            {/* ==================================================
                AXIS LINES
                ================================================== */}

            {radarClasses.map(
              (
                _,
                index
              ) => {

                const point =
                  getAxisPoint(
                    index
                  );


                return (

                  <line
                    key={index}
                    x1={center}
                    y1={center}
                    x2={point.x}
                    y2={point.y}
                    stroke="#14532d"
                    strokeWidth="1"
                  />

                );

              }
            )}


            {/* ==================================================
                BEFORE PROFILE
                ================================================== */}

            <polygon
              points={
                beforePolygon
              }
              fill="rgba(255,255,255,0.06)"
              stroke="#94a3b8"
              strokeWidth="2"
            />


            {/* ==================================================
                LATEST PROFILE
                ================================================== */}

            <polygon
              points={
                afterPolygon
              }
              fill="rgba(16,185,129,0.18)"
              stroke="#10b981"
              strokeWidth="2.5"
            />


            {/* ==================================================
                BEFORE DATA POINTS
                ================================================== */}

            {radarClasses.map(
              (
                condition,
                index
              ) => {

                const point =
                  getPoint(
                    Number(
                      changes[
                        condition
                      ]?.before
                    ) || 0,
                    index
                  );


                return (

                  <circle
                    key={`before-${condition}`}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill="#94a3b8"
                  />

                );

              }
            )}


            {/* ==================================================
                LATEST DATA POINTS
                ================================================== */}

            {radarClasses.map(
              (
                condition,
                index
              ) => {

                const point =
                  getPoint(
                    Number(
                      changes[
                        condition
                      ]?.after
                    ) || 0,
                    index
                  );


                return (

                  <circle
                    key={`after-${condition}`}
                    cx={point.x}
                    cy={point.y}
                    r="3.5"
                    fill="#10b981"
                  />

                );

              }
            )}


            {/* ==================================================
                RADAR LABELS
                ================================================== */}

            {radarClasses.map(
              (
                condition,
                index
              ) => {

                const angle =
                  (
                    Math.PI * 2 *
                    index
                  ) /
                  radarClasses.length -
                  Math.PI / 2;


                const labelX =
                  center +
                  (radius + 25) *
                    Math.cos(angle);


                const labelY =
                  center +
                  (radius + 25) *
                    Math.sin(angle);


                return (

                  <text
                    key={`label-${condition}`}
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#d1fae5"
                  >
                    {
                      radarLabels[
                        index
                      ]
                    }
                  </text>

                );

              }
            )}

          </svg>


          {/* ====================================================
              RADAR LEGEND
              ==================================================== */}

          <div className="
            flex
            items-center
            gap-6
            mt-2
          ">


            <div className="flex items-center gap-2">

              <span className="
                w-3
                h-3
                rounded-full
                bg-slate-400
              " />

              <span className="
                text-[11px]
                font-bold
                text-slate-300
              ">
                Before
              </span>

            </div>


            <div className="flex items-center gap-2">

              <span className="
                w-3
                h-3
                rounded-full
                bg-emerald-500
                shadow-[0_0_8px_rgba(16,185,129,0.6)]
              " />

              <span className="
                text-[11px]
                font-bold
                text-slate-300
              ">
                Latest
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          AI GENERATED COMPARISON REPORT
          UNCHANGED
          ====================================================== */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5 text-slate-200">


        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">

          <FileText className="w-5 h-5 text-emerald-400" />

          <div>

            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider">
              AI Skin Progress Analysis
            </h3>

            <p className="text-[11px] text-slate-500 mt-0.5">
              Generated from your before/after probability changes
            </p>

          </div>

        </div>


        <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-5">


          {comparisonData.report ? (

            <div className="space-y-3">

              {comparisonData.report
                .split('\n')
                .map(
                  (
                    line,
                    index
                  ) => {

                    const trimmed =
                      line.trim();


                    if (!trimmed) {

                      return (

                        <div
                          key={index}
                          className="h-1"
                        />

                      );

                    }


                    if (
                      trimmed.startsWith(
                        '###'
                      )
                    ) {

                      return (

                        <h4
                          key={index}
                          className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider pt-2"
                        >

                          {trimmed
                            .replace(
                              /^###\s*/,
                              ''
                            )
                            .replace(
                              /^\d+\.\s*/,
                              ''
                            )}

                        </h4>

                      );

                    }


                    if (
                      trimmed.startsWith(
                        '- '
                      ) ||
                      trimmed.startsWith(
                        '* '
                      )
                    ) {

                      return (

                        <p
                          key={index}
                          className="text-xs text-slate-300 leading-relaxed font-medium pl-2"
                        >

                          •{' '}

                          {trimmed
                            .replace(
                              /^[-*]\s*/,
                              ''
                            )
                            .replace(
                              /\*\*/g,
                              ''
                            )}

                        </p>

                      );

                    }


                    return (

                      <p
                        key={index}
                        className="text-xs text-slate-300 leading-relaxed font-medium"
                      >

                        {trimmed
                          .replace(
                            /\*\*/g,
                            ''
                          )}

                      </p>

                    );

                  }
                )}

            </div>

          ) : (

            <p className="text-xs text-slate-400">
              No AI comparison report was generated.
            </p>

          )}

        </div>


        {/* ====================================================
            REPORT DISCLAIMER
            ==================================================== */}

        <div className="flex items-start gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-3">

          <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />

          <p className="text-[10px] text-slate-500 leading-relaxed">

            The AI report interprets changes in the facial
            classification model's probability distribution.
            It does not establish clinical improvement and
            should not be considered a medical diagnosis.

          </p>

        </div>

      </div>


      {/* ======================================================
          REFRESH COMPARISON
          UNCHANGED
          ====================================================== */}

      <div className="flex justify-center pb-2">

        <button
          type="button"
          onClick={fetchComparison}
          className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            bg-white
            hover:bg-slate-50
            text-slate-700
            border
            border-slate-200
            rounded-xl
            text-xs
            font-bold
            transition
            shadow-sm
          "
        >

          <RefreshCw className="w-4 h-4 text-emerald-600" />

          Refresh Comparison

        </button>

      </div>

    </div>

  );
}