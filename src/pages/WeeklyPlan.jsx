import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Sun, Moon, CheckCircle2, Circle, Sparkles } from 'lucide-react'
import { fetchAnalysisHistoryFromAPI, generateWeeklyPlanFromHistory } from '../utils/skincareStorage'
import LifestyleTrackerCards from '../components/LifestyleTrackerCards'

const API_BASE = import.meta.env.DEV ? '' : 'http://127.0.0.1:8000'

export default function WeeklyPlan() {
  const [latestScan, setLatestScan] = useState(null)
  const [weeklyPlan, setWeeklyPlan] = useState([])
  const [loading, setLoading] = useState(true)
  const [completedSteps, setCompletedSteps] = useState({})
  const [activeDay, setActiveDay] = useState('Monday')

  // Lifestyle parameters state
  const [lifestyleData, setLifestyleData] = useState({
    sleep_hours: 7.5,
    water_intake: 2.5,
    exercise_mins: 30,
    stress_level: 'Moderate',
    environmental_exposure: 'Medium',
  })

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function loadPlanAndHistory() {
      setLoading(true)
      const history = await fetchAnalysisHistoryFromAPI()
      if (history.length > 0) {
        setLatestScan(history[0])
      }
      const generated = generateWeeklyPlanFromHistory(history)
      setWeeklyPlan(generated)

      // Fetch routine completion history from API
      try {
        const token = localStorage.getItem('skin-intelligence-token')
        if (token) {
          const res = await fetch(`${API_BASE}/routine/history`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const data = await res.json()
            const completedMap = {}
            data.routine_history?.forEach((item) => {
              if (item.completed) {
                const key = `${item.date_str}-${item.routine_type}-${item.task_name}`
                completedMap[key] = true
              }
            })
            setCompletedSteps(completedMap)
          }
        }
      } catch (err) {
        console.warn('Could not fetch routine history from MySQL:', err)
      }

      setLoading(false)
    }
    loadPlanAndHistory()
  }, [])

  const toggleStep = async (day, type, idx, taskName) => {
    const key = `${todayStr}-${type}-${taskName}`
    const isNowChecked = !completedSteps[key]

    setCompletedSteps((prev) => ({
      ...prev,
      [key]: isNowChecked,
    }))

    // Record completion in MySQL
    try {
      const token = localStorage.getItem('skin-intelligence-token')
      if (token) {
        await fetch(`${API_BASE}/routine/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date_str: todayStr,
            routine_type: type,
            task_name: taskName,
            completed: isNowChecked,
          }),
        })
      }
    } catch (err) {
      console.warn('Could not save routine completion to MySQL:', err)
    }
  }

  const currentDayData = weeklyPlan.find((item) => item.day === activeDay) || weeklyPlan[0]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CalendarDays className="h-3.5 w-3.5" /> AI Dynamic Routine Generator
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Weekly Skincare & Daily Routine Planner</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Tailored morning and night routines generated from your skin type and recent scan insights ({latestScan?.disease || 'Normal'}).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 sm:text-right">
            <span className="font-semibold text-slate-900">Active Condition Context:</span>
            <p className="font-bold text-emerald-600">{latestScan?.disease || 'Normal Balanced Skin'}</p>
          </div>
        </div>
      </div>

      {/* Interactive Lifestyle Trackers */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <LifestyleTrackerCards values={lifestyleData} onChange={setLifestyleData} />
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-[1.75rem] bg-white border border-slate-200" />
      ) : (
        <>
          {/* Days Tabs (Monday - Sunday) */}
          <div className="flex overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm no-scrollbar">
            {weeklyPlan.map((planItem) => {
              const isActive = planItem.day === activeDay
              return (
                <button
                  key={planItem.day}
                  onClick={() => setActiveDay(planItem.day)}
                  className={`flex-1 min-w-[100px] rounded-xl py-3 text-center text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{planItem.day}</span>
                  <p className={`mt-0.5 text-[10px] ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {planItem.focus.split('&')[0]}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Routine Cards Grid for Active Day */}
          {currentDayData && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Morning Routine */}
              <motion.div
                key={`${activeDay}-morning`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[1.75rem] border border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-white p-6 shadow-sm sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-amber-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-amber-100 p-2.5 text-amber-700">
                        <Sun className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Morning Routine Checklist</h3>
                        <p className="text-xs text-amber-800 font-medium">Protect, hydrate & prepare for the day</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      AM
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {currentDayData.morning.map((step, idx) => {
                      const key = `${todayStr}-morning-${step}`
                      const isChecked = completedSteps[key]
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleStep(activeDay, 'morning', idx, step)}
                          className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                            isChecked
                              ? 'border-emerald-300 bg-emerald-50/60 text-slate-500 line-through'
                              : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-semibold text-slate-800">{step}</span>
                          </div>
                          {isChecked ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-amber-100 flex items-center justify-between text-xs text-amber-900">
                  <span className="font-semibold">Today's Morning Checklist</span>
                  <span className="font-bold text-emerald-700">Saved to MySQL</span>
                </div>
              </motion.div>

              {/* Night Routine */}
              <motion.div
                key={`${activeDay}-night`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[1.75rem] border border-sky-200/80 bg-gradient-to-br from-sky-50/50 via-white to-white p-6 shadow-sm sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-sky-100 p-2.5 text-sky-700">
                        <Moon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Night Routine Checklist</h3>
                        <p className="text-xs text-sky-800 font-medium">Cleanse, repair & restore skin barrier</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                      PM
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {currentDayData.night.map((step, idx) => {
                      const key = `${todayStr}-night-${step}`
                      const isChecked = completedSteps[key]
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleStep(activeDay, 'night', idx, step)}
                          className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                            isChecked
                              ? 'border-emerald-300 bg-emerald-50/60 text-slate-500 line-through'
                              : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-900">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-semibold text-slate-800">{step}</span>
                          </div>
                          {isChecked ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-sky-100 flex items-center justify-between text-xs text-sky-900">
                  <span className="font-semibold">Today's Night Checklist</span>
                  <span className="font-bold text-emerald-700">Saved to MySQL</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Routine Focus Note */}
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-900 p-6 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Daily Routine Strategy</h4>
            </div>
            <p className="mt-2 text-lg font-semibold text-white">{currentDayData?.focus}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Routines are synchronized with your latest diagnostic prediction ({latestScan?.disease || 'Normal'}).
            </p>
          </div>
        </>
      )}
    </div>
  )
}
