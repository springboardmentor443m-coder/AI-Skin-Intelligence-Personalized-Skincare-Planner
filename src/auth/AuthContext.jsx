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
    const session = { name: account.name, email: account.email }
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

    const session = { name: account.name, email: account.email }
    writeStorage(SESSION_KEY, session)
    setUser(session)
    return { ok: true }
  }

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  const value = useMemo(() => ({ user, register, login, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
