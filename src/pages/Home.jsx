import { useState } from 'react'
import { ArrowRight, Camera, ChartLine, Sparkles, ChevronDown, ChevronUp, Star, Quote } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import Hero from '../components/Hero'
import FeatureCard from '../components/FeatureCard'
import Footer from '../components/Footer'
import { useAuth } from '../auth/useAuth'

const features = [
  {
    icon: Sparkles,
    title: 'Smart Skincare Matching',
    description: 'Get active ingredient recommendations tailored to your specific skin type, goals, and sensitivities without guesswork.',
  },
  {
    icon: Camera,
    title: 'Image-Guided Diagnostics',
    description: 'Upload skin close-ups to receive real-time disease detection, severity ratings, and clinical routine advice.',
  },
  {
    icon: ChartLine,
    title: 'Progress Tracking & Comparison',
    description: 'Measure improvements over time with side-by-side Before & After visual comparison and historical trend analytics.',
  },
]

const steps = [
  { number: '1', title: 'Create Your Profile', desc: 'Sign up in seconds and record your skin type and known allergies.' },
  { number: '2', title: 'Upload Skin Image', desc: 'Capture or upload a portrait photo for instant AI condition diagnostic analysis.' },
  { number: '3', title: 'Receive Personalized Routine', desc: 'Get a day-by-day Monday–Sunday AM/PM routine and targeted product recommendations.' },
]

const testimonials = [
  {
    name: 'Dr. Sarah Jenkins',
    role: 'Board-Certified Dermatologist',
    text: 'DermoCare AI bridges clinical diagnostic precision with daily patient routine tracking. The ingredient intelligence module is exceptionally thorough.',
    rating: '5.0 ★',
  },
  {
    name: 'Elena Rostova',
    role: 'Verified Patient',
    text: 'The auto face-crop and smart camera guidance made scanning effortless. My skin barrier improved noticeably within 3 weeks of following the AM/PM checklist.',
    rating: '5.0 ★',
  },
  {
    name: 'Marcus Vance',
    role: 'Skincare Enthusiast',
    text: 'Being able to ask the AI Chatbot questions using my exact skin scan history is incredible. It feels like having a personal dermatologist in my pocket.',
    rating: '5.0 ★',
  },
]

const faqs = [
  {
    question: 'How accurate is the AI skin diagnosis?',
    answer: 'Our AI model is trained on clinically validated dermatology datasets to classify common skin conditions (Acne, Normal, Eczema, Psoriasis, Rosacea, etc.) with high confidence scores displayed alongside every scan.',
  },
  {
    question: 'Are my uploaded skin photos stored securely?',
    answer: 'Yes, your images and diagnosis records are encrypted and stored in our secure MySQL database linked to your account.',
  },
  {
    question: 'Is DermoCare AI free to start?',
    answer: 'Yes, creating an account, running skin analyses, generating weekly routines, and chatting with the AI assistant are free to start.',
  },
]

export default function Home() {
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState(null)

  // After login: Hide marketing landing page, show workspace app only
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <Hero />

      {/* Core Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-emerald-600">Core Capabilities</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            A Refined Experience for Skin Confidence
          </h2>
          <p className="mt-3 text-base leading-8 text-slate-600">
            Everything is designed for clarity, confidence, and a calm, medical-grade skincare journey.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white py-20 border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-emerald-600">How It Works</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Personalization in 3 Simple Steps
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Understand your skin barrier, act with active ingredient precision, and monitor recovery over time.
              </p>
            </div>
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.number} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-xs">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-extrabold text-white">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-emerald-600">Clinical Testimonials</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">Trusted by Patients & Dermatologists</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item, idx) => (
            <div key={idx} className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div>
                <Quote className="h-8 w-8 text-emerald-500/30 mb-2" />
                <p className="text-xs leading-relaxed text-slate-600 italic">"{item.text}"</p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                  <p className="text-[10px] font-semibold text-emerald-600">{item.role}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-extrabold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-500" /> {item.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-emerald-600">FAQ</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-2 text-sm text-slate-600">Everything you need to know about DermoCare AI.</p>
        </div>

        <div className="mt-10 space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <button
                onClick={() => toggleFaq(idx)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
              >
                <span>{faq.question}</span>
                {openFaq === idx ? <ChevronUp className="h-4 w-4 text-emerald-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>
              {openFaq === idx && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-5 text-xs leading-relaxed text-slate-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Marketing CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-8 text-white shadow-2xl sm:p-12 text-center">
          <span className="rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
            Start Your Journey Today
          </span>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl max-w-2xl mx-auto">
            Ready to Restore & Balance Your Skin Barrier?
          </h2>
          <p className="mt-3 text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Join thousands receiving personalized AI skin diagnostics and day-by-day active skincare plans.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 hover:scale-[1.03]"
            >
              <span>Start Free Analysis</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
