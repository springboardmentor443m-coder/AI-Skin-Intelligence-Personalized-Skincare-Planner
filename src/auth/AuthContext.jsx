import { createContext, useEffect, useMemo, useState } from 'react'

const TOKEN_KEY = 'skin-intelligence-token'
const SESSION_KEY = 'skin-intelligence-session'
const API_BASE_URL = 'http://localhost:8000'

const AuthContext = createContext(null)

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('Failed to write storage:', err)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStorage(SESSION_KEY, null))
  const [loading, setLoading] = useState(true)

  const logout = () => {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  // Verify JWT token on initial app load
  useEffect(() => {
    let active = true
    const token = window.localStorage.getItem(TOKEN_KEY)

    if (!token) {
      setTimeout(() => {
        if (active) setLoading(false)
      }, 0)
      return () => { active = false }
    }

    fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token expired or invalid')
        return res.json()
      })
      .then((data) => {
        if (active && data.user) {
          setUser(data.user)
          writeStorage(SESSION_KEY, data.user)
        }
      })
      .catch(() => {
        if (active) logout()
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        return { ok: false, message: data.detail || 'Registration failed.' }
      }

      if (data.token) {
        window.localStorage.setItem(TOKEN_KEY, data.token)
      }
      writeStorage(SESSION_KEY, data.user)
      setUser(data.user)

      return { ok: true }
    } catch {
      return { ok: false, message: 'Server connection error. Is backend running?' }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        return { ok: false, message: data.detail || 'Login failed.' }
      }

      if (data.token) {
        window.localStorage.setItem(TOKEN_KEY, data.token)
      }
      writeStorage(SESSION_KEY, data.user)
      setUser(data.user)

      return { ok: true }
    } catch {
      return { ok: false, message: 'Server connection error. Is backend running?' }
    }
  }

  const loginWithGoogle = async (profile) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          sub: profile.sub || profile.id,
          picture: profile.picture,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        return { ok: false, message: data.detail || 'Google sign-in failed.' }
      }

      if (data.token) {
        window.localStorage.setItem(TOKEN_KEY, data.token)
      }
      writeStorage(SESSION_KEY, data.user)
      setUser(data.user)

      return { ok: true }
    } catch {
      return { ok: false, message: 'Server connection error. Is backend running?' }
    }
  }



  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      loginWithGoogle,
      logout,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }