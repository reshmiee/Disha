import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { auth, setSession } from '../api'

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida/ADBb0uhXcB0iq3Gbqj4EVoxxlmKe7lCN5IqLWL5bT_iZkSj6uLyPpdsmH0gZQAX-OAeD6s7C8oNrRBr3bHW4sHZbkkvm1EKqI5mhibqmnTaXB19oZr20RGx-9RxnXTkpBNGVG-HopOdWYwbYKxNwYAelAbQe7tq-YyBuShxEBtN6BmYUWkXhPqjUE3rH4cIBnRRH7IJ5uYOYNej0Zjg3c6erNFuaX7HUFsWDNzakjVFxJqTgbVmHzhiBF_YA_gju'

function Field({ label, id, children, hint }) {
  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-end">
        <label htmlFor={id} className="block uppercase text-on-surface-variant"
          style={{ fontFamily: 'Montserrat', fontSize: 12, letterSpacing: '0.2em', fontWeight: 600 }}>
          {label}
        </label>
        {hint}
      </div>
      <div className="relative">
        {children}
        <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary transition-all duration-500 group-focus-within:w-full" />
      </div>
    </div>
  )
}

const inputCls =
  'w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 text-on-surface focus:ring-0 focus:outline-none transition-all duration-300 text-sm'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Custom cursor — matching HTML original
  useEffect(() => {
    const cursor = document.getElementById('disha-cursor')
    const dot    = document.getElementById('disha-cursor-dot')
    if (!cursor || !dot) return

    const move = (e) => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top  = e.clientY + 'px'
      dot.style.left    = e.clientX + 'px'
      dot.style.top     = e.clientY + 'px'
    }
    const down = () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(0.8)'
      cursor.style.background = 'rgba(188,78,216,0.1)'
    }
    const up = () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)'
      cursor.style.background = 'transparent'
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mousedown', down)
    document.addEventListener('mouseup', up)

    const els = document.querySelectorAll('button, a, input')
    els.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '64px'
        cursor.style.height = '64px'
        cursor.style.borderColor = 'rgba(235,178,255,0.5)'
        cursor.style.backgroundColor = 'rgba(235,178,255,0.05)'
      })
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '32px'
        cursor.style.height = '32px'
        cursor.style.borderColor = 'rgba(235,178,255,0.3)'
        cursor.style.backgroundColor = 'transparent'
      })
    })

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mousedown', down)
      document.removeEventListener('mouseup', up)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await auth.login({ username, password })
      setSession(data.access, data.refresh, data.user)
      navigate('/app/dashboard')
    } catch (err) {
      setError(err.error || err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Custom cursor elements */}
      <div id="disha-cursor" className="hidden lg:block" />
      <div id="disha-cursor-dot" className="hidden lg:block" />

      <main className="flex h-screen w-full overflow-hidden film-grain"
        style={{ background: '#121414', color: '#e2e2e2', fontFamily: 'Montserrat, sans-serif' }}>

        {/* ── Left: Cinematic hero ── */}
        <section className="hidden lg:flex relative w-1/2 h-full items-end p-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={HERO_IMG} alt="Empowered woman at dusk" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(18,20,20,0.9) 0%, rgba(18,20,20,0.2) 50%, transparent 100%)' }} />
          </div>
          <motion.div
            className="relative z-10 max-w-xl"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="mb-4 italic"
              style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(36px, 4vw, 72px)', lineHeight: 1.1, fontWeight: 700, color: '#fff9ef' }}>
              Your Sanctuary,{' '}
              <span style={{ fontWeight: 400, opacity: 0.9 }}>Your Strength.</span>
            </h1>
            <p className="max-w-sm" style={{ fontFamily: 'Montserrat', fontSize: 18, lineHeight: '28px', fontWeight: 400, color: '#d2c1d3' }}>
              Enter a protected ecosystem designed for clarity, safety, and personal empowerment.
            </p>
          </motion.div>

          {/* Brand anchor */}
          <div className="absolute top-12 left-12 z-10">
            <Link to="/" style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 28, fontWeight: 700, color: '#ebb2ff', letterSpacing: '0.2em' }}
              className="hover:opacity-80 transition-opacity">
              DISHA
            </Link>
          </div>
        </section>

        {/* ── Right: Login form ── */}
        <section className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 md:p-10 relative overflow-y-auto"
          style={{ background: '#0c0f0f' }}>
          {/* Atmospheric glows */}
          <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'rgba(123,31,162,0.08)', filter: 'blur(120px)' }} />
          <div className="absolute bottom-1/4 -left-20 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'rgba(102,75,0,0.08)', filter: 'blur(120px)' }} />

          <motion.div
            className="w-full max-w-md p-10 rounded-3xl relative z-10 glass-pane hover:scale-[1.01] transition-transform duration-500 shadow-2xl"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <header className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 border"
                style={{ background: 'rgba(123,31,162,0.2)', borderColor: 'rgba(235,178,255,0.2)' }}>
                <span className="material-symbols-outlined text-primary text-3xl">shield_with_heart</span>
              </div>
              <h2 className="mb-2" style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 48, lineHeight: '56px', fontWeight: 600, color: '#fff9ef' }}>
                Welcome Back
              </h2>
              <p style={{ fontFamily: 'Montserrat', fontSize: 16, color: '#d2c1d3' }}>
                Verify your identity to proceed to the sanctuary.
              </p>
            </header>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl border text-center text-xs"
                style={{ background: 'rgba(255,180,171,0.1)', borderColor: 'rgba(255,180,171,0.3)', color: '#ffb4ab', fontFamily: 'Montserrat' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <Field label="Username" id="username">
                <input
                  id="username" type="text" value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="your_username"
                  className={inputCls}
                  style={{ fontFamily: 'Montserrat', color: '#e2e2e2' }}
                  autoComplete="username" required
                />
              </Field>

              <Field label="Secure Phrase" id="password"
                hint={
                  <a href="#" className="hover:text-primary transition-colors"
                    style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: '0.3em', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(235,178,255,0.6)' }}>
                    Recover Access
                  </a>
                }
              >
                <input
                  id="password" type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={inputCls}
                  style={{ fontFamily: 'Montserrat', color: '#e2e2e2' }}
                  autoComplete="current-password" required
                />
              </Field>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="w-4 h-4 bg-surface-container rounded border-outline-variant text-primary" />
                <label htmlFor="remember" className="text-on-surface-variant text-sm select-none" style={{ fontFamily: 'Montserrat' }}>
                  Trust this device for 30 cycles
                </label>
              </div>

              <div className="pt-6">
                <button
                  type="submit" disabled={loading}
                  className="w-full py-5 rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-70 transition-all duration-300 active:scale-95 shimmer-hover"
                  style={{
                    fontFamily: 'Montserrat', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700,
                    background: '#7b1fa2', color: '#e8aaff',
                    boxShadow: '0 4px 20px rgba(123,31,162,0.2)'
                  }}
                >
                  {loading ? (
                    <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span>Entering…</>
                  ) : (
                    <>Commence Entry <span className="material-symbols-outlined text-lg">arrow_forward</span></>
                  )}
                </button>
              </div>
            </form>

            <footer className="mt-12 text-center">
              <p className="text-on-surface-variant text-sm" style={{ fontFamily: 'Montserrat' }}>
                Not a member?{' '}
                <Link to="/signup" className="text-primary font-semibold hover:underline underline-offset-4 ml-1"
                  style={{ textDecorationColor: 'rgba(235,178,255,0.3)' }}>
                  Request Invitation
                </Link>
              </p>
            </footer>
          </motion.div>

          <div className="absolute bottom-10 text-center w-full pointer-events-none">
            <p style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: '0.4em', fontWeight: 600, color: '#353534', textTransform: 'uppercase' }}>
              Secure Environment © 2024 DISHA Empowerment Foundation
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
