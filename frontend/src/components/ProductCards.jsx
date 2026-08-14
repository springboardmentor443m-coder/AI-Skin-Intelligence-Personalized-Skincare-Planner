import React from 'react';
import { Package, Star, CheckCircle2, Tag } from 'lucide-react';


export default function ProductCards({ products }) {

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-xs">

        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
          <Package className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-800">
          No Product Recommendations Yet
        </h3>

        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please upload or capture a skin scan first to generate tailored medical-grade treatment recommendations.
        </p>

      </div>
    );
  }


  return (
    <div className="space-y-6">

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <Package className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Targeted Product Recommendations
            </h2>

            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Matched using TF-IDF & Cosine Similarity vector engine
            </p>
          </div>

        </div>

        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          {products.length} Matched Treatments
        </span>

      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {products.map((product, idx) => {

          const name =
            product.name ||
            product.product_name ||
            'Dermatological Treatment';

          const brand =
            product.brand ||
            'Clinical Grade';

          const price =
            product.price ||
            '$12.99';

          const rating =
            product.rating ||
            4.5;

          const ingredients =
            product.key_ingredients ||
            product.ingredients ||
            'Active Formulations';


          return (
            <div
              key={idx}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between space-y-4 text-slate-200"
            >

              <div className="space-y-3">

                <div className="flex items-center justify-between text-xs">

                  <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-[10px] bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1">

                    <Tag className="w-3 h-3" />

                    Dermatological Treatment

                  </span>

                  <div className="flex items-center gap-1 text-amber-400 font-black">

                    <Star className="w-3.5 h-3.5 fill-amber-400" />

                    <span>{rating}</span>

                  </div>

                </div>


                <div>

                  <h3 className="text-base font-extrabold text-white leading-snug line-clamp-2">
                    {name}
                  </h3>

                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Brand:
                    <span className="text-slate-300">
                      {' '}{brand}
                    </span>
                  </p>

                </div>


                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 line-clamp-2">

                  <span className="font-bold text-emerald-400">
                    Actives:{' '}
                  </span>

                  {ingredients}

                </div>

              </div>


              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">

                <div>

                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Est. Price
                  </span>

                  <span className="text-lg font-black text-emerald-400">
                    {price}
                  </span>

                </div>

                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">

                  <CheckCircle2 className="w-3.5 h-3.5" />

                  Optimal Match

                </span>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}