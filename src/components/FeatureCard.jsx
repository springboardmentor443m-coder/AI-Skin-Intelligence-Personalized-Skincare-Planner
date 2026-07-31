import { motion } from 'framer-motion'

export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.article whileHover={{ y: -6, scale: 1.01 }} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
      <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </motion.article>
  )
}
