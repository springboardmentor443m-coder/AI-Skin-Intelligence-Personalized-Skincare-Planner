import { useState } from 'react'
import Landing from './components/Landing'
import Auth from './components/Auth'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing')
  const [userId, setUserId] = useState(null)
  const [isNewUser, setIsNewUser] = useState(true)

  const handleLogin = (id, isLogin) => {
    setUserId(id)
    setIsNewUser(!isLogin)
    setCurrentScreen(isLogin ? 'dashboard' : 'onboarding')
  }

  const handleLogout = () => {
    setUserId(null)
    setCurrentScreen('landing')
  }

  return (
    <div className="app-wrapper">
      <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'rgba(30,30,36,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)', cursor: 'pointer' }} onClick={() => setCurrentScreen('landing')}>
            Skinly
          </h2>
          {currentScreen !== 'landing' && currentScreen !== 'auth' && (
             <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Logged in as User #{userId}</span>
          )}
        </div>
      </header>

      <main className="main-content">
        {currentScreen === 'landing' && <Landing onStart={() => setCurrentScreen('auth')} />}
        {currentScreen === 'auth' && <Auth onLogin={handleLogin} />}
        {currentScreen === 'onboarding' && <Onboarding userId={userId} isNewUser={isNewUser} onComplete={() => setCurrentScreen('dashboard')} />}
        {currentScreen === 'dashboard' && <Dashboard userId={userId} onLogout={handleLogout} onEditProfile={() => setCurrentScreen('onboarding')} />}
      </main>
    </div>
  )
}

export default App
