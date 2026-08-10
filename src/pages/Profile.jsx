import { useState, useEffect } from 'react'
import {
  Camera,
  UserRound,
  ShieldAlert,
  Sparkles,
  Droplets,
  MoonStar,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { getAnalysisHistory } from '../utils/skincareStorage'
import SkinProfileWizardModal from '../components/SkinProfileWizardModal'
import { calculateSkinHealthScore } from '../utils/healthScoreCalculator'

const API_BASE = import.meta.env.DEV ? '' : 'http://127.0.0.1:8000'

export default function Profile() {
  const { user } = useAuth()
  const history = getAnalysisHistory()

  const [profile, setProfile] = useState({
    age: 25,
    gender: 'Unspecified',
    skin_type: 'Combination',
    skin_concerns: ['Acne & Pimples'],
    allergies: 'None',
    skin_sensitivity: 'Moderate',
    sleep_hours: 7.5,
    water_intake: 2.5,
    lifestyle: 'Moderate',
    environmental_exposure: 'Medium',
  })

  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [photoPreview, setPhotoPreview] = useState('')
  const [message, setMessage] = useState('')

  // Fetch skin profile from MySQL
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem('skin-intelligence-token')
        if (!token) return

        const res = await fetch(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            setProfile(data.profile)
          }
        }
      } catch (err) {
        console.warn('Could not fetch skin profile from MySQL:', err)
      }
    }
    fetchProfile()
  }, [])

  const handleSaveProfile = async (updatedProfile) => {
    setProfile(updatedProfile)
    setIsWizardOpen(false)
    setMessage('Profile updated successfully.')
    setTimeout(() => setMessage(''), 3000)

    try {
      const token = localStorage.getItem('skin-intelligence-token')
      if (!token) return

      await fetch(`${API_BASE}/auth/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      })
    } catch (err) {
      console.warn('Could not save skin profile to MySQL:', err)
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const latestScan = history[0]
  const computedScore = calculateSkinHealthScore({
    condition: latestScan?.disease || 'Normal',
    sleepHours: profile.sleep_hours,
    waterIntake: profile.water_intake,
    lifestyle: profile.lifestyle,
  })

  const userName = user?.full_name || user?.name || 'Alicia Chen'
  const userEmail = user?.email || 'user@example.com'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700">
          <UserRound className="h-4 w-4" /> Personal Health Record
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Healthcare Profile & Parameters
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Manage your clinical skin profile, environmental exposure, allergies, and health indicators stored in MySQL.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        
        {/* Profile Card Summary */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-sky-600 text-3xl font-extrabold text-white shadow-lg">
              {photoPreview ? (
                <img src={photoPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                userName
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
              )}
            </div>
            <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-slate-900 p-2 text-white shadow-md hover:bg-slate-800 transition">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-slate-900">{userName}</h2>
          <p className="text-xs font-semibold text-emerald-600">{userEmail}</p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" /> Skin Type: {profile.skin_type}
          </div>

          {/* Quick Metrics Badges */}
          <div className="mt-6 w-full space-y-2 border-t border-slate-100 pt-5 text-left text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-slate-500 font-medium">Age & Gender</span>
              <span className="font-bold text-slate-900">{profile.age} yrs • {profile.gender}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-slate-500 font-medium">Total Scan History</span>
              <span className="font-bold text-slate-900">{history.length} Scans Completed</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-emerald-900 border border-emerald-200">
              <span className="font-semibold">Calculated Health Score</span>
              <span className="font-extrabold text-emerald-700">{computedScore.score} / 100</span>
            </div>
          </div>

          <div className="mt-6 w-full space-y-2">
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-xs font-bold text-white hover:bg-emerald-600 transition shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              Launch Profile Wizard
            </button>
          </div>
        </div>

        {/* Detailed Profile Form */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Personal Medical Parameters</h3>
            {message && <span className="text-xs font-bold text-emerald-600">{message}</span>}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Age</span>
              <span className="font-bold text-slate-800 text-sm">{profile.age} years</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Gender</span>
              <span className="font-bold text-slate-800 text-sm">{profile.gender}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Primary Skin Type</span>
              <span className="font-bold text-emerald-700 text-sm">{profile.skin_type}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Skin Sensitivity</span>
              <span className="font-bold text-slate-800 text-sm">{profile.skin_sensitivity}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Droplets className="h-3 w-3 text-sky-500" /> Daily Water Intake
              </span>
              <span className="font-bold text-sky-700 text-sm">{profile.water_intake} Liters</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <MoonStar className="h-3 w-3 text-indigo-500" /> Sleep Duration
              </span>
              <span className="font-bold text-indigo-700 text-sm">{profile.sleep_hours} Hours/night</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 sm:col-span-2">
              <span className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 text-rose-500" /> Known Allergies
              </span>
              <span className="font-semibold text-slate-800">{profile.allergies || 'None reported'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 sm:col-span-2">
              <span className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-emerald-500" /> Primary Skin Concerns
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(Array.isArray(profile.skin_concerns) ? profile.skin_concerns : [profile.skin_concerns]).map((c, i) => (
                  <span key={i} className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Activity Level</span>
              <span className="font-semibold text-slate-800">{profile.lifestyle}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Sun & UV Exposure</span>
              <span className="font-semibold text-slate-800">{profile.environmental_exposure}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Onboarding Profile Wizard Modal */}
      <SkinProfileWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSave={handleSaveProfile}
        initialProfile={profile}
      />
    </div>
  )
}
