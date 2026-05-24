import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

// Landing & info
import Landing   from './pages/Landing'
import MargInfo  from './pages/MargInfo'
import SwarInfo  from './pages/SwarInfo'

// Auth
import Login  from './pages/Login'
import Signup from './pages/Signup'

// App pages
import Dashboard from './pages/Dashboard'
import Marg      from './pages/Marg'
import Swar      from './pages/Swar'
import SOS       from './pages/SOS'
import Settings  from './pages/Settings'
// Placeholder for unbuilt pages
import Sidebar from './components/Sidebar'

function ComingSoon({ page }) {
  return (
    <div className="flex h-screen bg-background text-on-surface" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <Sidebar />
      <main className="flex-1 md:ml-72 flex flex-col items-center justify-center gap-4 p-8">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: 64 }}>construction</span>
        <h1
          className="text-secondary text-center"
          style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700 }}
        >
          {page}
        </h1>
        <p className="text-on-surface-variant text-center max-w-sm text-lg">
          This section is coming soon. We're building something great for you.
        </p>
      </main>
    </div>
  )
}

/* ─── ScrollToTop ─── */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

/* ─── Auth guard ─── */
function ProtectedRoute({ children }) {
  const auth = localStorage.getItem('disha_auth')
  return auth ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public landing */}
        <Route path="/"     element={<Landing />} />
        <Route path="/marg" element={<MargInfo />} />
        <Route path="/swar" element={<SwarInfo />} />

        {/* Auth */}
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* App pages — protected */}
        <Route path="/app/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/app/marg"      element={<ProtectedRoute><Marg /></ProtectedRoute>} />
        <Route path="/app/swar"      element={<ProtectedRoute><Swar /></ProtectedRoute>} />
        <Route path="/app/sos"       element={<ProtectedRoute><SOS /></ProtectedRoute>} />

        {/* Coming soon pages — protected so login persists */}
        <Route path="/app/community" element={<ProtectedRoute><ComingSoon page="Community" /></ProtectedRoute>} />
        <Route path="/app/resources" element={<ProtectedRoute><ComingSoon page="Resources" /></ProtectedRoute>} />
        <Route path="/app/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}