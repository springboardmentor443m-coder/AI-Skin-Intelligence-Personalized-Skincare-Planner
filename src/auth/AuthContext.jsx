import { createContext, useMemo, useState } from 'react'

const SESSION_KEY = 'skin-intelligence-session'
const USERS_KEY = 'skin-intelligence-users'

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
  window.localStorage.setItem(key, JSON.stringify(value))
}

function buildSession(account, provider = 'email') {
  const name = account.name?.trim() || account.email?.split('@')[0] || 'User'

  return {
    name,
    email: account.email,
    picture: account.picture || '',
    provider,
    googleId: account.googleId || '',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStorage(SESSION_KEY, null))

  const register = (name, email, password) => {
    const normalizedEmail = email.trim().toLowerCase()
    const users = readStorage(USERS_KEY, [])

    if (users.some((item) => item.email === normalizedEmail)) {
      return { ok: false, message: 'An account with this email already exists.' }
    }

    const account = { name: name.trim(), email: normalizedEmail, password }
    writeStorage(USERS_KEY, [...users, account])
    const session = buildSession(account, 'email')
    writeStorage(SESSION_KEY, session)
    setUser(session)
    return { ok: true }
  }

  const login = (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()
    const users = readStorage(USERS_KEY, [])
    const account = users.find((item) => item.email === normalizedEmail)

    if (!account || account.password !== password) {
      return { ok: false, message: 'Email or password is incorrect.' }
    }

    const session = buildSession(account, 'email')
    writeStorage(SESSION_KEY, session)
    setUser(session)
    return { ok: true }
  }

  const googleLogin = async (credential) => {
    if (!credential) {
      return { ok: false, message: 'Google sign-in was cancelled.' }
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || ''

    try {
      const response = await fetch(`${apiBaseUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        return { ok: false, message: data.detail || 'Google sign-in failed.' }
      }

      const users = readStorage(USERS_KEY, [])
      const normalizedEmail = data.email?.toLowerCase()
      const existing = users.find((item) => item.email === normalizedEmail)
      const account = {
        name: data.name || data.email?.split('@')[0] || 'Google user',
        email: normalizedEmail,
        password: existing?.password || '',
        picture: data.picture || '',
        googleId: data.googleId || '',
      }

      const nextUsers = existing
        ? users.map((item) => (item.email === normalizedEmail ? { ...item, ...account } : item))
        : [...users, account]

      writeStorage(USERS_KEY, nextUsers)
      const session = buildSession(account, 'google')
      writeStorage(SESSION_KEY, session)
      setUser(session)
      return { ok: true, user: session }
    } catch {
      return { ok: false, message: 'Unable to reach the authentication service. Please try again.' }
    }
  }

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  const value = useMemo(() => ({ user, register, login, logout, googleLogin }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
