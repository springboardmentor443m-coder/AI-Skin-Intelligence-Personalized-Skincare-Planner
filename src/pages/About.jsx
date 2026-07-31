import { ShieldCheck, Sparkles, Stethoscope } from 'lucide-react'

const principles = [
  { title: 'Clear insights', detail: 'Translate an image-based signal into understandable, educational guidance.', icon: Sparkles },
  { title: 'Gentle routines', detail: 'Favor practical habits, barrier support, and responsible product education.', icon: ShieldCheck },
  { title: 'Human judgment', detail: 'Encourage professional care when symptoms are persistent, severe, or unusual.', icon: Stethoscope },
]

export default function About() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-white shadow-[0_25px_70px_rgba(16,185,129,0.16)] sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">About the planner</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl">Thoughtful skincare guidance, made easier to understand.</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50">AI Skin Intelligence is a college project that combines image classification with structured skincare education to help people build calmer, more consistent routines.</p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {principles.map(({ title, detail, icon: Icon }) => (
          <article key={title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <Icon className="h-6 w-6 text-emerald-600" />
            <h2 className="mt-5 text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{detail}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
