import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, ChevronRight, ChevronLeft, User, HeartPulse, Droplets } from 'lucide-react'

const CONCERNS_OPTIONS = [
  'Acne & Pimples',
  'Dark Spots & Hyperpigmentation',
  'Wrinkles & Fine Lines',
  'Redness & Rosacea',
  'Enlarged Pores',
  'Dryness & Flaking',
  'Uneven Skin Texture',
  'Dark Circles',
]

export default function SkinProfileWizardModal({ isOpen, onClose, onSave, initialProfile }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(() => ({
    age: initialProfile?.age || 25,
    gender: initialProfile?.gender || 'Unspecified',
    skin_type: initialProfile?.skin_type || 'Combination',
    skin_concerns: initialProfile?.skin_concerns || ['Acne & Pimples'],
    allergies: initialProfile?.allergies || 'None',
    skin_sensitivity: initialProfile?.skin_sensitivity || 'Moderate',
    sleep_hours: initialProfile?.sleep_hours || 7.5,
    water_intake: initialProfile?.water_intake || 2.5,
    lifestyle: initialProfile?.lifestyle || 'Moderate',
    environmental_exposure: initialProfile?.environmental_exposure || 'Medium',
  }))

  if (!isOpen) return null

  const toggleConcern = (concern) => {
    setFormData((prev) => {
      const exists = prev.skin_concerns.includes(concern)
      if (exists) {
        return { ...prev, skin_concerns: prev.skin_concerns.filter((c) => c !== concern) }
      } else {
        return { ...prev, skin_concerns: [...prev.skin_concerns, concern] }
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 transition-all">
      <div className="relative w-full max-w-xl rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-900 overflow-hidden">
        
        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Clinical Onboarding</span>
              <h3 className="text-lg font-extrabold text-slate-900">Personalized Skin Profile Wizard</h3>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">Step {step} of 3</span>
        </div>

        {/* Step Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b pb-2">
                  <User className="h-4 w-4 text-emerald-600" /> Basic Information & Skin Type
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      min="12"
                      max="100"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Unspecified">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Primary Skin Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'].map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setFormData({ ...formData, skin_type: type })}
                        className={`rounded-2xl p-3 text-xs font-bold transition border ${
                          formData.skin_type === type
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b pb-2">
                  <HeartPulse className="h-4 w-4 text-emerald-600" /> Skin Concerns & Sensitivity
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Select Your Skin Concerns (Select all that apply)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONCERNS_OPTIONS.map((concern) => {
                      const isSelected = formData.skin_concerns.includes(concern)
                      return (
                        <button
                          type="button"
                          key={concern}
                          onClick={() => toggleConcern(concern)}
                          className={`rounded-2xl p-3 text-left text-xs font-semibold transition border flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <span>{concern}</span>
                          {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Skin Sensitivity</label>
                    <select
                      value={formData.skin_sensitivity}
                      onChange={(e) => setFormData({ ...formData, skin_sensitivity: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Low">Low (Tolerates most products)</option>
                      <option value="Moderate">Moderate (Occasional redness)</option>
                      <option value="High">High (Reacts easily)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Known Allergies</label>
                    <input
                      type="text"
                      placeholder="e.g. Fragrance, Aspirin, Nuts"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b pb-2">
                  <Droplets className="h-4 w-4 text-emerald-600" /> Lifestyle & Environment
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Nightly Sleep Duration</span>
                      <span className="text-emerald-600 font-extrabold">{formData.sleep_hours} Hours</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      step="0.5"
                      value={formData.sleep_hours}
                      onChange={(e) => setFormData({ ...formData, sleep_hours: Number(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Daily Water Intake</span>
                      <span className="text-emerald-600 font-extrabold">{formData.water_intake} Liters</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="5.0"
                      step="0.25"
                      value={formData.water_intake}
                      onChange={(e) => setFormData({ ...formData, water_intake: Number(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Daily Activity Level</label>
                      <select
                        value={formData.lifestyle}
                        onChange={(e) => setFormData({ ...formData, lifestyle: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Active">Active / Regular Workout</option>
                        <option value="Moderate">Moderate Activity</option>
                        <option value="Sedentary">Sedentary / Desk Work</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Sun & UV Exposure</label>
                      <select
                        value={formData.environmental_exposure}
                        onChange={(e) => setFormData({ ...formData, environmental_exposure: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 p-3 text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Low">Low (Indoor most of day)</option>
                        <option value="Medium">Medium (Occasional outdoor)</option>
                        <option value="High">High (Outdoor / High UV)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition"
              >
                Skip for now
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-600 transition"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-slate-800 transition"
              >
                <Check className="h-4 w-4 text-emerald-400" /> Save Profile
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  )
}
