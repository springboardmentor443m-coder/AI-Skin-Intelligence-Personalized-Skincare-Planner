import { create } from 'zustand'

export type Theme = 'dark' | 'premium-black' | 'light' | 'ocean' | 'forest'

export const themeConfig: Record<Theme, { name: string; colors: Record<string, string> }> = {
  dark: {
    name: 'Dark',
    colors: {
      '--background': '#0a0a0a',
      '--foreground': '#fafafa',
      '--card': '#1a1a1a',
      '--card-foreground': '#fafafa',
      '--primary': '#10b981',
      '--accent': '#06b6d4',
      '--muted': '#374151',
      '--muted-foreground': '#9ca3af',
    },
  },
  'premium-black': {
    name: 'Premium Black',
    colors: {
      '--background': '#000000',
      '--foreground': '#ffffff',
      '--card': '#0f0f0f',
      '--card-foreground': '#ffffff',
      '--primary': '#fbbf24',
      '--accent': '#f59e0b',
      '--muted': '#262626',
      '--muted-foreground': '#a3a3a3',
    },
  },
  light: {
    name: 'Light',
    colors: {
      '--background': '#ffffff',
      '--foreground': '#0a0a0a',
      '--card': '#f9fafb',
      '--card-foreground': '#0a0a0a',
      '--primary': '#059669',
      '--accent': '#0891b2',
      '--muted': '#e5e7eb',
      '--muted-foreground': '#6b7280',
    },
  },
  ocean: {
    name: 'Ocean',
    colors: {
      '--background': '#0a1428',
      '--foreground': '#e8f1f5',
      '--card': '#1a2b48',
      '--card-foreground': '#e8f1f5',
      '--primary': '#0ea5e9',
      '--accent': '#06b6d4',
      '--muted': '#1f3a52',
      '--muted-foreground': '#94a3b8',
    },
  },
  forest: {
    name: 'Forest',
    colors: {
      '--background': '#0f2818',
      '--foreground': '#f0fdf4',
      '--card': '#1e3a2a',
      '--card-foreground': '#f0fdf4',
      '--primary': '#10b981',
      '--accent': '#34d399',
      '--muted': '#1f4d31',
      '--muted-foreground': '#86efac',
    },
  },
}

interface ThemeState {
  currentTheme: Theme
  setTheme: (theme: Theme) => void
  initialize: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: 'dark',
  setTheme: (theme: Theme) => {
    localStorage.setItem('ai-skin-theme', theme)
    applyTheme(theme)
    set({ currentTheme: theme })
  },
  initialize: () => {
    const savedTheme = (localStorage.getItem('ai-skin-theme') as Theme) || 'dark'
    applyTheme(savedTheme)
    set({ currentTheme: savedTheme })
  },
}))

export function applyTheme(theme: Theme) {
  const config = themeConfig[theme]
  const root = document.documentElement

  Object.entries(config.colors).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
