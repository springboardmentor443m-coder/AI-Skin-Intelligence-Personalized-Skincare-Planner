import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navigate, useLocation } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import { AuthProvider } from './auth/AuthContext'
import { useAuth } from './auth/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import About from './pages/About'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import SkinAnalysis from './pages/SkinAnalysis'
import Recommendations from './pages/Recommendations'
import Progress from './pages/Progress'
import Profile from './pages/Profile'
import ChatBot from "./components/ChatBot";
import './App.css'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        {/* ChatBot appears on every page */}
        <ChatBot />

        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis" element={<SkinAnalysis />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>

      </AuthProvider>
    </BrowserRouter>
  )
}

export default App