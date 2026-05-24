import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { auth, setSession } from '../api'

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida/ADBb0uhXcB0iq3Gbqj4EVoxxlmKe7lCN5IqLWL5bT_iZkSj6uLyPpdsmH0gZQAX-OAeD6s7C8oNrRBr3bHW4sHZbkkvm1EKqI5mhibqmnTaXB19oZr20RGx-9RxnXTkpBNGVG-HopOdWYwbYKxNwYAelAbQe7tq-YyBuShxEBtN6BmYUWkXhPqjUE3rH4cIBnRRH7IJ5uYOYNej0Zjg3c6erNFuaX7HUFsWDNzakjVFxJqTgbVmHzhiBF_YA_gju'

const STRENGTH_LEVELS = [
  { width: '20%',  color: '#ffb4ab', label: 'Weak' },
  { width: '40%',  color: '#ffb4ab', label: 'Fair' },
  { width: '60%',  color: '#e8c170', label: 'Good' },
  { width: '80%',  color: '#ebb2ff', label: 'Strong' },
  { width: '100%', color: '#ebb2ff', label: 'Very Strong' },
]

function scorePassword(val) {
  if (!val) return null
  let score = 0
  if (val.length >= 8)          score++
  if (val.length >= 12)         score++
  if (/[A-Z]/.test(val))        score++
  if (/[0-9]/.test(val))        score++
  if (/[^A-Za-z0-9]/.test(val)) score++
  return STRENGTH_LEVELS[Math.min(score, 4)]
}

function Field({ label, id, error, children }) {
  return (
    <div className="space-y-1 group">
      <label htmlFor={id} className="block uppercase tracking-[0.2em] text-[11px] font-semibold text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        {children}
        <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary transition-all duration-500 group-focus-within:w-full" />
      </div>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full bg-transparent border-0 border-b border-outline-variant py-2.5 px-0 text-on-surface focus:ring-0 focus:outline-none transition-all duration-300 placeholder:text-outline text-sm'

export default function Signup() {
  const navigate = useNavigate()

  const [fields, setFields] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPwd, setShowPwd]   = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)

  const strength = scorePassword(fields.password)

  function set(key) {
    return e => setFields(f => ({ ...f, [key]: e.target.value }))
  }

  function validate() {
    const errs = {}
    if (!fields.username.trim())                                  errs.username = 'Please enter a username.'
    if (!fields.email.trim() || !fields.email.includes('@'))      errs.email    = 'Please enter a valid email.'
    if (fields.password.length < 8)                               errs.password = 'Password must be at least 8 characters.'
    if (fields.password !== fields.confirm)                       errs.confirm  = 'Phrases do not match.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      const data = await auth.signup({
        username: fields.username,
        password: fields.password,
        email:    fields.email,
      })
      setSession(data.access, data.refresh, data.user)
      navigate('/app/dashboard')
    } catch (err) {
      setApiError(err.error || err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="flex h-screen w-full bg-background text-on-surface film-grain"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      {/* ── Left: Cinematic hero ── */}
      <section className="hidden lg:flex relative w-1/2 h-full items-end p-12 xl:p-16 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMG} alt="Empowered woman at golden hour" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        </div>
        <motion.div
          className="relative z-10 max-w-lg"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-secondary mb-3 italic"
            style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1, fontWeight: 700 }}>
            Begin Your<br /><span className="font-normal opacity-90">Journey.</span>
          </h1>
          <p className="text-on-surface-variant max-w-sm text-base leading-6">
            Join a sanctuary built for your clarity, safety, and empowerment. Every step forward is protected.
          </p>
        </motion.div>
        <div className="absolute top-8 left-10 z-10">
          <Link to="/" className="text-primary tracking-widest font-bold hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 24 }}>
            DISHA
          </Link>
        </div>
      </section>

      {/* ── Right: Sign Up form ── */}
      <section className="w-full lg:w-1/2 h-full flex items-center justify-center bg-[#0c0f0f] p-6 md:p-10 relative overflow-y-auto">
        <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(123,31,162,0.08)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(99,52,165,0.08)', filter: 'blur(100px)' }} />

        <motion.div
          className="w-full max-w-sm p-8 rounded-2xl shadow-2xl relative z-10"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(60px)', border: '0.5px solid rgba(255,255,255,0.1)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <header className="mb-7 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-container/20 mb-4 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
            </div>
            <h2 className="text-secondary mb-1.5"
              style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 26, lineHeight: '34px', fontWeight: 600 }}>
              Create Your Sanctuary
            </h2>
            <p className="text-on-surface-variant text-xs">Your data is encrypted and never shared.</p>
          </header>

          {/* API Error */}
          {apiError && (
            <div className="mb-5 px-4 py-2.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs text-center">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            <Field label="Username" id="username" error={errors.username}>
              <input
                id="username" type="text" value={fields.username}
                onChange={set('username')} placeholder="your_username"
                className={inputCls} autoComplete="username"
              />
            </Field>

            <Field label="Email Address" id="email" error={errors.email}>
              <input
                id="email" type="email" value={fields.email}
                onChange={set('email')} placeholder="name@domain.com"
                className={inputCls} autoComplete="email"
              />
            </Field>

            <Field label="Secure Phrase" id="password" error={errors.password}>
              <input
                id="password" type={showPwd ? 'text' : 'password'} value={fields.password}
                onChange={set('password')} placeholder="Min. 8 characters"
                className={`${inputCls} pr-8`} autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-0 top-2.5 text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-base">{showPwd ? 'visibility_off' : 'visibility'}</span>
              </button>
              {fields.password && (
                <div className="mt-1.5">
                  <div className="h-0.5 bg-outline-variant rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-400"
                      style={{ width: strength?.width, backgroundColor: strength?.color }} />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: strength?.color }}>
                    {strength?.label}
                  </p>
                </div>
              )}
            </Field>

            <Field label="Confirm Phrase" id="confirm" error={errors.confirm}>
              <input
                id="confirm" type={showConf ? 'text' : 'password'} value={fields.confirm}
                onChange={set('confirm')} placeholder="Repeat your phrase"
                className={`${inputCls} pr-8`} autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConf(v => !v)}
                className="absolute right-0 top-2.5 text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-base">{showConf ? 'visibility_off' : 'visibility'}</span>
              </button>
            </Field>

            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="w-full bg-primary-container text-on-primary-container py-3.5 rounded-xl uppercase tracking-[0.3em] font-bold text-[11px] shadow-lg hover:bg-primary-container/80 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span>Creating sanctuary…</>
                ) : (
                  <>Enter the Sanctuary <span className="material-symbols-outlined text-base">arrow_forward</span></>
                )}
              </button>
            </div>
          </form>

          <footer className="mt-6 text-center">
            <p className="text-on-surface-variant text-xs">
              Already a member?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 ml-1">
                Sign In
              </Link>
            </p>
          </footer>
        </motion.div>

        <div className="absolute bottom-6 text-center w-full pointer-events-none">
          <p className="text-[10px] uppercase tracking-[0.4em] text-outline">
            Secure Environment © 2024 DISHA Empowerment Foundation
          </p>
        </div>
      </section>
    </main>
  )
}
