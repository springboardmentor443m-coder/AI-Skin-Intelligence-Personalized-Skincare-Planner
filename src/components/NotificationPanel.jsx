import { useState } from 'react'
import { Bell, Sun, Droplets, ShieldAlert, ShoppingBag, X } from 'lucide-react'

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'morning',
    title: 'Morning Routine Reminder',
    message: 'Time for your Morning Gentle Cleanser & Broad Spectrum SPF 30+.',
    icon: Sun,
    color: 'amber',
  },
  {
    id: 2,
    type: 'water',
    title: 'Hydration Alert',
    message: 'Drink a glass of water to maintain skin cell turgor & hydration.',
    icon: Droplets,
    color: 'sky',
  },
  {
    id: 3,
    type: 'sunscreen',
    title: 'Wear Sunscreen SPF 50',
    message: 'High UV exposure detected today. Reapply SPF before going outdoors.',
    icon: ShieldAlert,
    color: 'emerald',
  },
  {
    id: 4,
    type: 'low_product',
    title: 'Salicylic Serum Low',
    message: 'Your Salicylic Acid Clarifying Serum is estimated at ~10% remaining.',
    icon: ShoppingBag,
    color: 'purple',
  },
]

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5 text-emerald-500" /> Active Skincare Reminders ({notifications.length})
        </h4>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {notifications.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm hover:border-emerald-300 transition gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-800">
                  <Icon className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                  <p className="mt-0.5 text-[11px] text-slate-600 leading-snug">{item.message}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="text-slate-400 hover:text-slate-700 p-1 transition"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
