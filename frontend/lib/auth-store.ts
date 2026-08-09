import { create } from 'zustand'
import { User } from './types'

interface AuthState {
  user: User | null
  token: string |null
  isLoading: boolean
  isAuthenticated: boolean

  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token)
      } else {
        localStorage.removeItem('access_token')
      }
    }

    set({
      token,
      isAuthenticated: !!token,
    })
  },

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
    }

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')

      set({
        token,
        isAuthenticated: !!token,
        isLoading: false,
      })
    } else {
      set({
        isLoading: false,
      })
    }
  },
}))