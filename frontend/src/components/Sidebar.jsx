import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SupportModal from './SupportModal'

const NAV_ITEMS = [
  { label: 'MARG Safety', icon: 'shield_with_heart', to: '/app/marg' },
  { label: 'SWAR Voice',  icon: 'auto_awesome',      to: '/app/swar' },
  { label: 'Community',   icon: 'groups',             to: '/app/community' },
  { label: 'Resources',   icon: 'menu_book',          to: '/app/resources' },
  { label: 'Settings',    icon: 'settings',           to: '/app/settings' },
]

export default function Sidebar({ disabled = false }) {
  const location = useLocation()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)

  function handleSignOut() {
    localStorage.removeItem('disha_auth')
    navigate('/login')
  }

  const sidebarContent = (
    <>
      {/* Logo — Bodoni Moda exactly as in HTML dashboard */}
      <div className="px-6 mb-10">
        <Link to="/app/dashboard" onClick={() => setOpen(false)}>
          <h1 style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 32, fontWeight: 700, color: '#ebb2ff', letterSpacing: '0.3em', lineHeight: '1.2' }}>
            DISHA
          </h1>
        </Link>
        <p style={{ fontFamily: 'Montserrat', fontSize: 12, letterSpacing: '0.08em', fontWeight: 500, color: '#d2c1d3', opacity: 0.7, marginTop: 4 }}>
          Empowerment Journey
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map(({ label, icon, to }) => {
          const isActive = location.pathname === to
          return (
            <Link
              key={to} to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95"
              style={isActive ? {
                background: 'rgba(123,31,162,0.2)', color: '#ebb2ff', fontWeight: 700,
                borderLeft: '4px solid #ebb2ff', paddingLeft: 12
              } : {
                color: '#d2c1d3'
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#e5e2e1'; e.currentTarget.style.background = 'rgba(53,53,52,0.3)'; e.currentTarget.style.backdropFilter = 'blur(8px)' } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#d2c1d3'; e.currentTarget.style.background = ''; e.currentTarget.style.backdropFilter = '' } }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontFamily: 'Montserrat', fontSize: 14, letterSpacing: '0.05em', fontWeight: 600 }}>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-4 space-y-4">
        <Link
          to="/app/sos"
          onClick={() => setOpen(false)}
          className="w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
          style={{
            background: '#93000a', color: '#ffdad6',
            fontFamily: 'Montserrat', fontSize: 14, fontWeight: 700,
            boxShadow: '0 0 20px rgba(147,0,10,0.3)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>emergency</span>
          Emergency SOS
        </Link>

        <div className="pt-6 border-t border-white/5 space-y-1">
          <button
            type="button"
            onClick={() => { setOpen(false); setSupportOpen(true) }}
            className="w-full flex items-center gap-4 px-4 py-2 transition-all rounded-xl"
            style={{ color: '#d2c1d3', fontFamily: 'Montserrat', fontSize: 14, letterSpacing: '0.05em', fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.color = '#e5e2e1'}
            onMouseLeave={e => e.currentTarget.style.color = '#d2c1d3'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>help</span>
            <span>Support</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-4 py-2 transition-all rounded-xl"
            style={{ color: '#d2c1d3', fontFamily: 'Montserrat', fontSize: 14, letterSpacing: '0.05em', fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.color = '#e5e2e1'}
            onMouseLeave={e => e.currentTarget.style.color = '#d2c1d3'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-5 left-4 z-[200] text-on-surface-variant hover:text-primary transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined text-[26px]">menu</span>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className={[
          'md:hidden fixed top-0 left-0 h-screen w-72 z-[160] flex flex-col py-5',
          'backdrop-blur-3xl border-r border-white/10 shadow-2xl',
          'transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ background: '#201f1f', ...(disabled ? { opacity: 0.3, pointerEvents: 'none' } : {}) }}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar — exactly w-72 = 288px as in HTML */}
      <aside
        className="hidden md:flex h-screen w-72 fixed left-0 top-0 backdrop-blur-3xl border-r border-white/10 shadow-sm z-50 flex-col py-5"
        style={{ background: '#201f1f', ...(disabled ? { opacity: 0.3, pointerEvents: 'none' } : {}) }}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
