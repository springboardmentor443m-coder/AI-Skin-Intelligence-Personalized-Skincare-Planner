import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import ScoreRing from '@/components/shared/ScoreRing';

const PILLARS = [
  {
    title: 'Assessment',
    copy: 'A guided intake reads lifestyle, hydration, and sun exposure alongside photos to build a clinical-grade baseline.',
  },
  {
    title: 'Scoring',
    copy: 'A weighted model turns barrier strength, tone, and texture into one number you can track over months, not guesses.',
  },
  {
    title: 'Routine',
    copy: 'Morning, evening, weekly, and seasonal steps regenerate automatically as your score and the season shift.',
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>AI Skin Intelligence — Know your skin, in numbers</title>
      </Head>
      <Navbar role="guest" />

      <main>
        <section className="relative overflow-hidden bg-ink-radial px-6 py-24 text-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="animate-fadeUp">
              <p className="eyebrow text-amber-light">Clinical-grade skin intelligence</p>
              <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.1] sm:text-5xl">
                Your skin, read like data —
                <span className="text-amber"> not guesswork.</span>
              </h1>
              <p className="mt-5 max-w-md text-ink-100">
                One assessment builds a live skin health score, flags ingredient conflicts before they reach your
                cart, and rebuilds your routine as conditions change.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/signup" className="btn-accent">Start your assessment</Link>
                <Link href="#scoring" className="btn-ghost !border-white/30 !text-white hover:!border-white">
                  See how scoring works
                </Link>
              </div>
              <div className="mt-10 flex gap-8 text-sm text-ink-200">
                <div>
                  <p className="font-display text-2xl font-bold text-white">40+</p>
                  <p>Signals per assessment</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-white">1,200+</p>
                  <p>Ingredients cross-checked</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-white">3</p>
                  <p>Clinical roles supported</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center rounded-xl2 bg-white/5 p-10 backdrop-blur">
              <ScoreRing score={74} size={220} label="Live demo score" sublabel="Recalculated after every check-in" />
            </div>
          </div>
        </section>

        <section id="product" className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow">How the platform is organized</p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold text-ink-800">
            Three connected systems, one running score.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="card p-6">
                <h3 className="font-display text-lg font-bold text-ink-800">{p.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{p.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="scoring" className="bg-surface-sunken px-6 py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow">The scoring model</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink-800">
                One score, weighted from real inputs.
              </h2>
              <p className="mt-4 text-sm text-ink-500">
                Hydration, barrier strength, and tone evenness are each scored independently, then combined into a
                single number so progress is legible at a glance — and defensible when a dermatologist asks how it
                was calculated.
              </p>
            </div>
            <div className="flex justify-center">
              <ScoreRing score={68} size={180} label="Hydration" sublabel="This week" />
            </div>
          </div>
        </section>

        <section id="clinics" className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="eyebrow">For clinics and consultants</p>
          <h2 className="mx-auto mt-2 max-w-xl font-display text-3xl font-bold text-ink-800">
            Give every practitioner a caseload view, not a spreadsheet.
          </h2>
          <Link href="/signup" className="btn-primary mt-8 inline-flex">Set up a clinic account</Link>
        </section>
      </main>

      <footer className="border-t border-ink-100 px-6 py-8 text-center text-xs text-ink-300">
        © {new Date().getFullYear()} AI Skin Intelligence
      </footer>
    </>
  );
}
