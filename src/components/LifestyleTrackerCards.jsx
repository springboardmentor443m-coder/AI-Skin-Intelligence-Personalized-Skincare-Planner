import { Moon, Droplets, Dumbbell, Flame, Sun } from 'lucide-react'

export default function LifestyleTrackerCards({ values, onChange }) {
  const current = {
    sleep: values?.sleep_hours || 7.5,
    water: values?.water_intake || 2.5,
    exercise: values?.exercise_mins || 30,
    stress: values?.stress_level || 'Moderate',
    sun: values?.environmental_exposure || 'Medium',
  }

  const updateField = (field, val) => {
    if (onChange) {
      onChange({ ...current, [field]: val })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Flame className="h-4 w-4 text-emerald-500" /> Dynamic Lifestyle Trackers
        </h3>
        <span className="text-[11px] text-slate-500 font-medium">Updates Health Score in real-time</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Sleep Tracker */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-400 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Moon className="h-3.5 w-3.5" />
              </div>
              Sleep Duration
            </div>
            <span className="text-xs font-extrabold text-indigo-600">{current.sleep} hrs</span>
          </div>

          <input
            type="range"
            min="4"
            max="11"
            step="0.5"
            value={current.sleep}
            onChange={(e) => updateField('sleep', Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <p className="text-[10px] text-slate-400">Optimal range: 7.0 - 9.0 hrs/night</p>
        </div>

        {/* Water Intake Tracker */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-400 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <Droplets className="h-3.5 w-3.5" />
              </div>
              Hydration (Water)
            </div>
            <span className="text-xs font-extrabold text-sky-600">{current.water} L</span>
          </div>

          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.25"
            value={current.water}
            onChange={(e) => updateField('water', Number(e.target.value))}
            className="w-full accent-sky-500"
          />
          <p className="text-[10px] text-slate-400">Target: 2.5 Liters daily</p>
        </div>

        {/* Exercise Tracker */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-400 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Dumbbell className="h-3.5 w-3.5" />
              </div>
              Daily Exercise
            </div>
            <span className="text-xs font-extrabold text-emerald-600">{current.exercise} mins</span>
          </div>

          <input
            type="range"
            min="0"
            max="120"
            step="10"
            value={current.exercise}
            onChange={(e) => updateField('exercise', Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <p className="text-[10px] text-slate-400">Promotes micro-circulation & detoxification</p>
        </div>

        {/* Stress Level */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-400 transition space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Stress Level</span>
            <span className="text-amber-600 font-extrabold">{current.stress}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {['Low', 'Moderate', 'High'].map((lvl) => (
              <button
                type="button"
                key={lvl}
                onClick={() => updateField('stress', lvl)}
                className={`rounded-xl py-1.5 text-[11px] font-bold transition border ${
                  current.stress === lvl
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Sun / UV Exposure */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-400 transition space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1">
              <Sun className="h-3.5 w-3.5 text-amber-500" /> Sun Exposure
            </span>
            <span className="text-amber-600 font-extrabold">{current.sun}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {['Low', 'Medium', 'High'].map((exp) => (
              <button
                type="button"
                key={exp}
                onClick={() => updateField('sun', exp)}
                className={`rounded-xl py-1.5 text-[11px] font-bold transition border ${
                  current.sun === exp
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {exp}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
