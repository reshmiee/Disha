import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function LandingNav({ activePage = null }) {
  const isInfoPage = activePage !== null
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-[100]"
        style={{
          height: isInfoPage ? 56 : 'auto',
          background: isInfoPage
            ? 'rgba(8,8,8,0.8)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
          backdropFilter: 'blur(8px)',
          borderBottom: isInfoPage ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        <div
          className="flex items-center justify-between mx-auto w-full"
          style={{
            maxWidth: 1100,
            padding: isInfoPage ? '0 32px' : '16px 32px',
            height: isInfoPage ? 56 : 'auto',
          }}
        >
        {/* Logo — Bodoni Moda as in HTML */}
        <Link to="/" style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 28, fontWeight: 700, color: '#ebb2ff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          DISHA
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/marg"
            style={{ fontFamily: 'Montserrat', fontSize: 12, letterSpacing: '0.3em', fontWeight: 600, textTransform: 'uppercase' }}
            className={activePage === 'marg' ? 'text-primary border-b border-primary pb-0.5' : 'text-on-surface hover:text-primary transition-colors'}>
            MARG
          </Link>
          <Link to="/swar"
            style={{ fontFamily: 'Montserrat', fontSize: 12, letterSpacing: '0.3em', fontWeight: 600, textTransform: 'uppercase' }}
            className={activePage === 'swar' ? 'text-[#e8c170] border-b pb-0.5' : 'text-on-surface hover:text-[#e8c170] transition-colors'}
            onMouseEnter={e => { if (activePage !== 'swar') e.currentTarget.style.color = '#e8c170' }}
            onMouseLeave={e => { if (activePage !== 'swar') e.currentTarget.style.color = '' }}>
            SWAR
          </Link>
          {!isInfoPage && (
            <>
              <a href="#" style={{ fontFamily: 'Montserrat', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600 }}
                className="text-on-surface-variant hover:text-on-surface transition-colors">Sanctuary</a>
              <a href="#" style={{ fontFamily: 'Montserrat', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600 }}
                className="text-on-surface-variant hover:text-on-surface transition-colors">About</a>
            </>
          )}
          <Link to="/login"
            className="hover:bg-primary hover:text-on-primary transition-all duration-500"
            style={{
              fontFamily: 'Montserrat', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600,
              background: 'rgba(235,178,255,0.1)', border: '1px solid rgba(235,178,255,0.2)',
              color: '#ebb2ff', padding: '8px 32px', borderRadius: 9999
            }}>
            Secure Access
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Open menu" onClick={() => setMobileOpen(true)}>
          <span className="material-symbols-outlined text-[28px]">menu</span>
        </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 h-screen w-72 border-l border-white/10 z-[120] flex flex-col py-10 px-8 gap-8"
              style={{ background: '#201f1f' }}
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-4">
                <span style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 24, fontWeight: 700, color: '#ebb2ff' }}>DISHA</span>
                <button onClick={() => setMobileOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              {[{ to: '/marg', label: 'MARG' }, { to: '/swar', label: 'SWAR' }].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  style={{ fontFamily: 'Montserrat', fontSize: 14, letterSpacing: '0.3em', fontWeight: 600, textTransform: 'uppercase' }}>
                  {label}
                </Link>
              ))}
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="mt-auto w-full text-center hover:bg-primary hover:text-on-primary transition-all"
                style={{
                  fontFamily: 'Montserrat', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600,
                  background: 'rgba(235,178,255,0.1)', border: '1px solid rgba(235,178,255,0.2)',
                  color: '#ebb2ff', padding: '12px 32px', borderRadius: 9999
                }}>
                Secure Access
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}