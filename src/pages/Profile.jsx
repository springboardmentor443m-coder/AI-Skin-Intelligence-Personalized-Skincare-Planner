import { Camera, Mail, UserRound, ShieldAlert, Sparkles, Droplets, MoonStar, Save, XCircle, PencilLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'

const initialProfile = {
  name: 'Alicia Chen',
  email: 'alicia@example.com',
  age: '29',
  gender: 'Female',
  skinType: 'Sensitive Combination',
  lifestyle: 'Early riser, indoor work, moderate sun exposure',
  waterIntake: '2.5L/day',
  sleepHours: '7.5 hours',
  allergies: 'Fragrance, essential oils',
  concerns: 'Dryness, mild sensitivity',
}

function buildProfileData(user) {
  return {
    ...initialProfile,
    name: user?.name || initialProfile.name,
    email: user?.email || initialProfile.email,
  }
}

export default function Profile() {
  const { user } = useAuth()
  const [formData, setFormData] = useState(() => buildProfileData(user))
  const [isEditing, setIsEditing] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(user?.picture || '')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((current) => ({
      ...current,
      name: user?.name || current.name,
      email: user?.email || current.email,
    }))

    if (user?.picture) {
      setPhotoPreview(user.picture)
    }
  }, [user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSave = (event) => {
    event.preventDefault()
    setIsEditing(false)
    setMessage('Profile updated locally. Your updates are ready for future sync.')
  }

  const handleCancel = () => {
    setFormData(buildProfileData(user))
    setIsEditing(false)
    setMessage('Changes discarded. Your last saved values remain intact.')
  }

  const avatarSrc = photoPreview || user?.picture || ''

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">A clean profile experience that feels personal and calm.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Edit your skin profile locally, keep your notes organized, and update your routine preferences in seconds.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-sky-600 text-3xl font-semibold text-white">
                {avatarSrc ? <img src={avatarSrc} alt="Profile preview" className="h-full w-full object-cover" /> : formData.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
              </div>
              <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-slate-900 p-2 text-white shadow-lg">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-900">{formData.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{user?.provider === 'google' ? 'Signed in with Google' : 'Personal skincare profile'}</p>
            <p className="mt-1 text-sm text-slate-500">{formData.email}</p>
            <button type="button" onClick={() => setIsEditing((value) => !value)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
              <PencilLine className="h-4 w-4" />
              {isEditing ? 'Editing mode' : 'Edit profile'}
            </button>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">Personal information</p>
                <p className="text-sm text-slate-500">Everything you want to keep close at hand.</p>
              </div>
            </div>
            {message && <p className="text-sm text-emerald-600">{message}</p>}
          </div>

          <form onSubmit={handleSave} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
              <input name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <input name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Age</span>
              <input name="age" value={formData.age} onChange={handleChange} disabled={!isEditing} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Gender</span>
              <input name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Skin type</span>
              <input name="skinType" value={formData.skinType} onChange={handleChange} disabled={!isEditing} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Lifestyle</span>
              <input name="lifestyle" value={formData.lifestyle} onChange={handleChange} disabled={!isEditing} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Water intake</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Droplets className="h-4 w-4 text-slate-400" />
                <input name="waterIntake" value={formData.waterIntake} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Sleep hours</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <MoonStar className="h-4 w-4 text-slate-400" />
                <input name="sleepHours" value={formData.sleepHours} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Allergies</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <ShieldAlert className="h-4 w-4 text-slate-400" />
                <input name="allergies" value={formData.allergies} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Skin concerns</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Sparkles className="h-4 w-4 text-slate-400" />
                <input name="concerns" value={formData.concerns} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70" />
              </div>
            </label>

            {isEditing && (
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
                  <Save className="h-4 w-4" />
                  Save changes
                </button>
                <button type="button" onClick={handleCancel} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-600">
                  <XCircle className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
