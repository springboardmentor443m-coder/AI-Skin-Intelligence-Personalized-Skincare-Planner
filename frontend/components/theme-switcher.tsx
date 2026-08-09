'use client'

import { useEffect, useState } from 'react'
import { useThemeStore, themeConfig, type Theme } from '@/lib/theme-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette } from 'lucide-react'

export function ThemeSwitcher() {
  const { currentTheme, setTheme, initialize } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    initialize()
  }, [initialize])

  if (!mounted) return null

  const themes: Theme[] = ['dark', 'premium-black', 'light', 'ocean', 'forest']

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all hover:bg-white/5 text-sidebar-foreground hover:text-primary"
        title="Switch theme"
      >
        <Palette className="w-5 h-5" />
        <span className="text-sm font-medium flex-1 text-left">
          {themeConfig[currentTheme].name}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4"
        >
          ▼
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-sidebar border border-sidebar-border rounded-lg shadow-xl overflow-hidden z-50"
          >
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => {
                  setTheme(theme)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left transition-all flex items-center gap-3 ${
                  currentTheme === theme
                    ? 'bg-primary/20 text-primary'
                    : 'text-sidebar-foreground hover:bg-white/5'
                }`}
              >
                <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                  {currentTheme === theme && (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <span className="text-sm font-medium">{themeConfig[theme].name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
