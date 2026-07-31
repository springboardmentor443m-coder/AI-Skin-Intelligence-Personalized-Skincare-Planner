import { motion } from 'framer-motion'
import { ShieldAlert, Sparkles, Droplets } from 'lucide-react'
import RoutineCard from '../components/RoutineCard'

const concerns = ['Dryness', 'Barrier sensitivity', 'Uneven tone']
const ingredients = [
  { name: 'Niacinamide', detail: 'Brightens and soothes' },
  { name: 'Ceramides', detail: 'Supports the skin barrier' },
  { name: 'Hyaluronic acid', detail: 'Boosts hydration' },
  { name: 'Panthenol', detail: 'Calms and comforts' },
]
const products = [
  { name: 'Barrier Recovery Cream', detail: 'Ceramide-rich daily moisturizer', tag: 'Best for dry skin' },
  { name: 'Calming Serum', detail: 'Niacinamide + panthenol blend', tag: 'Gentle and soothing' },
  { name: 'Daily SPF 50', detail: 'Broad-spectrum mineral protection', tag: 'Non-irritating' },
]
const avoid = ['Over-exfoliating acids', 'Heavy fragrance', 'Hot water cleansing']

export default function Recommendations() {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Recommendations</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">A thoughtful routine designed around your concerns and comfort.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">The interface is refined to feel premium and calm, with just the right amount of detail for each product, ingredient, and routine step.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Detected concerns</p>
              <p className="text-sm text-slate-500">Based on your current profile and previous analysis.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {concerns.map((concern) => (
              <span key={concern} className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">{concern}</span>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-50 p-2 text-sky-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Recommended ingredients</p>
              <p className="text-sm text-slate-500">Gentle, barrier-supporting, and hydration-forward.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {ingredients.map((ingredient) => (
              <motion.div whileHover={{ y: -3 }} key={ingredient.name} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{ingredient.name}</p>
                <p className="mt-1 text-sm text-slate-500">{ingredient.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-50 p-2 text-amber-600">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Recommended products</p>
              <p className="text-sm text-slate-500">The right staples for comfort and consistency.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {products.map((product) => (
              <motion.div whileHover={{ y: -2 }} key={product.name} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{product.tag}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{product.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RoutineCard title="Morning routine" items={['Gentle cleanse', 'Niacinamide serum', 'Moisturizer', 'Broad-spectrum SPF']} accent="bg-emerald-50 text-emerald-700" />
          <RoutineCard title="Night routine" items={['Double cleanse if needed', 'Ceramide serum', 'Repair cream', 'Minimal actives']} accent="bg-sky-50 text-sky-700" />
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-rose-50 p-2 text-rose-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">Things to avoid</p>
            <p className="text-sm text-slate-500">Minimalism and gentleness are the goal while your barrier recovers.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {avoid.map((item) => (
            <span key={item} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">{item}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
