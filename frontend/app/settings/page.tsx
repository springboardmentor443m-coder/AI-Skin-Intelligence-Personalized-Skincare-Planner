'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/protected-layout'
import { useAuthStore } from '@/lib/auth-store'
import { motion } from 'framer-motion'
import {
  User,
  Lock,
  Bell,
  Eye,
  Sun,
  Download,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SettingSection {
  id: string
  icon: React.ReactNode
  title: string
  description: string
}

const sections: SettingSection[] = [
  {
    id: 'profile',
    icon: <User className="w-5 h-5" />,
    title: 'Profile',
    description: 'Manage your personal information',
  },
  {
    id: 'password',
    icon: <Lock className="w-5 h-5" />,
    title: 'Security',
    description: 'Change your password and security settings',
  },
  {
    id: 'notifications',
    icon: <Bell className="w-5 h-5" />,
    title: 'Notifications',
    description: 'Manage email and push notifications',
  },
  {
    id: 'privacy',
    icon: <Eye className="w-5 h-5" />,
    title: 'Privacy',
    description: 'Control your data and privacy settings',
  },
]

export default function SettingsPage() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('profile')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [analysisReminders, setAnalysisReminders] = useState(true)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
  }

  return (
    <ProtectedLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences and settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <motion.div
                className="glass-card p-2 rounded-xl space-y-1"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    variants={item}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-white/5'
                    }`}
                  >
                    {section.icon}
                    <span className="text-sm font-medium">{section.title}</span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Logout Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={handleLogout}
                className="w-full mt-4 flex items-center gap-2 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-8 rounded-xl space-y-6"
              >
                {activeSection === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">
                        Profile Information
                      </h2>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name || ''}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-muted-foreground focus:outline-none disabled:opacity-50"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed. Contact support to update.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Account Created
                      </label>
                      <input
                        type="text"
                        defaultValue={
                          user?.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : ''
                        }
                        disabled
                        className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-muted-foreground focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition">
                      Save Changes
                    </button>
                  </div>
                )}

                {activeSection === 'password' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">
                        Change Password
                      </h2>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        At least 8 characters with mixed case
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        placeholder="••••••••"
                      />
                    </div>

                    <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition">
                      Update Password
                    </button>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">
                        Notification Preferences
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-foreground">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about your analyses and recommendations
                          </p>
                        </div>
                        <button
                          onClick={() => setEmailNotifications(!emailNotifications)}
                          className={`relative w-12 h-6 rounded-full transition ${
                            emailNotifications ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <motion.div
                            animate={{ x: emailNotifications ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full"
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-foreground">
                            Weekly Analysis Reminders
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Get reminded to perform your weekly skin analysis
                          </p>
                        </div>
                        <button
                          onClick={() => setAnalysisReminders(!analysisReminders)}
                          className={`relative w-12 h-6 rounded-full transition ${
                            analysisReminders ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <motion.div
                            animate={{ x: analysisReminders ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full"
                          />
                        </button>
                      </div>
                    </div>

                    <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition">
                      Save Preferences
                    </button>
                  </div>
                )}

                {activeSection === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">
                        Privacy Settings
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-lg border border-border space-y-3">
                        <p className="font-medium text-foreground">Data Usage</p>
                        <p className="text-sm text-muted-foreground">
                          Your skin analysis data is used to improve your personalized
                          recommendations and track your progress.
                        </p>
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-4 h-4 rounded border-border"
                          />
                          <span className="text-sm text-foreground">
                            Allow data usage for AI model improvement
                          </span>
                        </label>
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg border border-border space-y-3">
                        <p className="font-medium text-foreground">Data Download</p>
                        <p className="text-sm text-muted-foreground">
                          Download a copy of all your skin analysis data and history.
                        </p>
                        <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-foreground rounded-lg transition font-medium text-sm">
                          <Download className="w-4 h-4" />
                          Download My Data
                        </button>
                      </div>
                    </div>

                    <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition">
                      Save Settings
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
