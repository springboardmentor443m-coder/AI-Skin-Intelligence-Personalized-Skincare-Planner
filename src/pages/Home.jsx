import { motion } from 'framer-motion'
import { ArrowRight, Camera, ChartLine, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import FeatureCard from '../components/FeatureCard'

const features = [
  {
    icon: Sparkles,
    title: 'Smart skincare matching',
    description: 'Get recommendations tailored to your skin type, goals, and sensitivities without the guesswork.',
  },
  {
    icon: Camera,
    title: 'Image-guided analysis',
    description: 'Visual insights and AI-assisted recommendations help you monitor changes more consistently.',
  },
  {
    icon: ChartLine,
    title: 'Progress tracking',
    description: 'Measure improvements over time with a premium tracker designed for long-term skin health.',
  },
]

const steps = [
  'Create your profile and skin goals.',
  'Upload a photo or answer a short assessment.',
  'Receive a personalized routine and progress plan.',
]

const testimonials = [
  {
    quote: 'The experience feels premium and truly tailored to my skin needs.',
    name: 'Ananya P.',
    role: 'Product Designer',
  },
  {
    quote: 'I finally have one place to track my routine and see what is working.',
    name: 'Karthik S.',
    role: 'Startup Founder',
  },
]

export default function Home() {
  return (
    <main>
      <Hero />

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-600">Core capabilities</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">A refined experience for skin confidence.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">Everything is designed for clarity, confidence, and a calm, modern skincare journey.</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-white/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-600">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Personalization in three thoughtful steps.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">The journey is simple: understand your skin, act with confidence, and track what changes over time.</p>
            </div>
            <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              {steps.map((step, index) => (
                <div key={step} className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-semibold text-white">{index + 1}</div>
                  <p className="text-sm leading-7 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-600">Trusted by modern skincare seekers</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Momentum that feels personal, not generic.</h2>
          </div>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600">
            Start your plan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {testimonials.map((item) => (
            <motion.blockquote key={item.name} whileHover={{ y: -4 }} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-500">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Sparkles key={idx} className="h-4 w-4" />
                ))}
              </div>
              <p className="mt-4 text-lg leading-8 text-slate-700">“{item.quote}”</p>
              <footer className="mt-6">
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">{item.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </section>
    </main>
  )
}
