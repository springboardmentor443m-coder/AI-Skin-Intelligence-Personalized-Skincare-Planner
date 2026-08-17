/**
 * components/ProductCard.jsx — Skincare Product Recommendation Card
 * ===================================================================
 * Renders a single product recommendation with:
 *   - Large, prominent product image (with elegant fallback)
 *   - Name, category badge, price range
 *   - "Why this may be useful" section
 *   - Key features as pill chips
 *   - Collapsible "How to use & precautions" section
 *   - BUY NOW button — opens Amazon/Google Shopping search for the product
 */

import { useState } from "react";
import {
  ChevronDown, ChevronUp,
  ShoppingBag, Shield, CheckCircle, ShoppingCart,
} from "lucide-react";

// ── Category colour mapping ───────────────────────────────────────────────────
const CATEGORY_COLOURS = {
  "Sun Protection":       "bg-amber-100 text-amber-800 border-amber-200",
  "Moisturiser":          "bg-sky-100 text-sky-800 border-sky-200",
  "Cleanser":             "bg-teal-100 text-teal-800 border-teal-200",
  "Serum":                "bg-violet-100 text-violet-800 border-violet-200",
  "Exfoliating Cleanser": "bg-orange-100 text-orange-800 border-orange-200",
};
const DEFAULT_COLOUR = "bg-gray-100 text-gray-700 border-gray-200";

// ── Category gradient backgrounds for image placeholder ───────────────────────
const CATEGORY_GRADIENTS = {
  "Sun Protection":       "from-amber-100 to-yellow-200",
  "Moisturiser":          "from-sky-100 to-blue-200",
  "Cleanser":             "from-teal-100 to-emerald-200",
  "Serum":                "from-violet-100 to-purple-200",
  "Exfoliating Cleanser": "from-orange-100 to-amber-200",
};
const DEFAULT_GRADIENT = "from-blue-100 to-indigo-200";

// ── Risk border colours ───────────────────────────────────────────────────────
const RISK_BORDER = {
  High:   "border-red-100",
  Medium: "border-amber-100",
  Low:    "border-gray-200",
};

/**
 * Build a Buy Now URL. Priority:
 *   1. Use product.product_link if present
 *   2. Otherwise generate an Amazon India search URL for the product name
 */
function buildBuyUrl(product) {
  if (product.product_link) return product.product_link;
  const query = encodeURIComponent(product.name + " skincare");
  return `https://www.amazon.in/s?k=${query}`;
}


function ProductCard({ product, riskLevel = "Low" }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const catColour   = CATEGORY_COLOURS[product.category]   ?? DEFAULT_COLOUR;
  const catGradient = CATEGORY_GRADIENTS[product.category] ?? DEFAULT_GRADIENT;
  const borderClass = RISK_BORDER[riskLevel] ?? "border-gray-200";
  const buyUrl      = buildBuyUrl(product);

  return (
    <div
      className={`bg-white rounded-2xl border ${borderClass} overflow-hidden
                  flex flex-col hover:shadow-xl transition-all duration-300 group`}
    >
      {/* ── Product Image ──────────────────────────────────────────────────── */}
      <div
        className={`relative h-52 bg-gradient-to-br ${catGradient} overflow-hidden shrink-0`}
      >
        {!imgError && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Elegant fallback */
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/70 backdrop-blur flex items-center justify-center shadow-sm">
              <ShoppingBag size={30} className="text-gray-400" />
            </div>
            <p className="text-xs font-medium text-gray-500">{product.category}</p>
          </div>
        )}

        {/* Category badge — top left */}
        <div className="absolute top-3 left-3">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm bg-white/80 ${catColour}`}>
            {product.category}
          </span>
        </div>

        {/* Price badge — top right */}
        {product.price_range && (
          <div className="absolute top-3 right-3">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 shadow-sm">
              {product.price_range}
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Product name */}
        <h3 className="font-bold text-gray-900 text-sm leading-snug">
          {product.name}
        </h3>

        {/* Short description */}
        <p className="text-xs text-gray-500 leading-relaxed">
          {product.description}
        </p>

        {/* Why useful */}
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide mb-1">
            Why this may help
          </p>
          <p className="text-xs text-blue-800 leading-relaxed">
            {product.why_useful}
          </p>
        </div>

        {/* Key features */}
        <div>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Key Features
          </p>
          <div className="flex flex-wrap gap-1.5">
            {product.key_features.map((feat, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600
                           px-2 py-0.5 rounded-full border border-gray-200"
              >
                <CheckCircle size={9} className="text-emerald-500" />
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Collapsible: How to use + Precautions */}
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700
                     font-medium w-fit transition-colors"
          aria-expanded={expanded}
        >
          {expanded
            ? <><ChevronUp size={13} /> Show less</>
            : <><ChevronDown size={13} /> How to use &amp; precautions</>
          }
        </button>

        {expanded && (
          <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">

            {product.suitable_skin_types?.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Suitable for
                </p>
                <p className="text-xs text-gray-600">
                  {product.suitable_skin_types.join("  ·  ")}
                </p>
              </div>
            )}

            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                How to use
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">{product.how_to_use}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Shield size={13} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-amber-800 mb-0.5">Precautions</p>
                  <p className="text-xs text-amber-700 leading-relaxed">{product.precautions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BUY NOW button ───────────────────────────────────────────────── */}
        <div className="mt-auto pt-3">
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            id={`buy-product-${product.id}`}
            className="w-full flex items-center justify-center gap-2
                       bg-gradient-to-r from-green-500 to-emerald-600
                       hover:from-green-600 hover:to-emerald-700
                       active:scale-95
                       text-white text-sm font-bold
                       px-4 py-3 rounded-xl
                       transition-all duration-200
                       shadow-md shadow-green-200
                       hover:shadow-lg hover:shadow-green-300"
          >
            <ShoppingCart size={15} />
            Buy Now
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
