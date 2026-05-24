import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import UserAvatar from '../components/UserAvatar'
import { user as userApi, getUser, clearSession } from '../api'

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
})

export default function Settings() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(getUser())
  const [plans, setPlans]       = useState([])
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [message, setMessage]   = useState('')
  const [error, setError]       = useState('')

  useEffect(() => {
    Promise.all([userApi.me(), userApi.plans()])
      .then(([me, plansRes]) => {
        setUserData(me.user)
        setUsername(me.user.username || '')
        setEmail(me.user.email || '')
        setPlans(plansRes.plans || [])
        localStorage.setItem('disha_user', JSON.stringify(me.user))
      })
      .catch(() => {
        clearSession()
        navigate('/login')
      })
  }, [navigate])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const data = await userApi.update({
        username: username.trim(),
        email:    email.trim(),
      })
      setUserData(data.user)
      localStorage.setItem('disha_user', JSON.stringify(data.user))
      setMessage('Profile saved successfully.')
    } catch (err) {
      setError(err.error || err.message || 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpgrade(planId) {
    if (planId !== 'premium') {
      setError('Organisation plans — contact support@disha.app')
      return
    }
    if (userData?.is_premium) return

    setError('')
    setMessage('')
    setUpgrading(true)
    try {
      const data = await userApi.upgrade({ plan: 'premium' })
      setUserData(data.user)
      localStorage.setItem('disha_user', JSON.stringify(data.user))
      setMessage('Welcome to Suraksha Premium! SOS audio and unlimited AI are now unlocked.')
    } catch (err) {
      setError(err.error || err.message || 'Upgrade failed. Is the backend running?')
    } finally {
      setUpgrading(false)
    }
  }

  const isPremium = userData?.is_premium
  const tokensDisplay = userData?.tokens_remaining == null ? '∞' : userData?.tokens_remaining
  const premiumPlan = plans.find(p => p.id === 'premium')
  const freePlan = plans.find(p => p.id === 'free')

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen">
      <Sidebar />

      <header className="fixed top-0 right-0 z-40 h-20 flex items-center px-6 bg-background/80 backdrop-blur-md border-b border-white/5"  className='md:left-72'>
        <div className="flex items-center gap-4 md:ml-72">
          <span className="font-headline-lg text-headline-lg text-secondary font-bold">Settings</span>
        </div>
      </header>

      <main className="pt-20 pb-12 px-4 md:px-8 md:ml-72 max-w-3xl">
        {(message || error) && (
          <motion.div
            {...fadeUp(0)}
            className={[
              'mb-6 px-4 py-3 rounded-2xl text-sm border',
              error ? 'bg-error/10 border-error/30 text-error' : 'bg-secondary/10 border-secondary/30 text-secondary',
            ].join(' ')}
          >
            {error || message}
          </motion.div>
        )}

        {/* Profile */}
        <motion.section {...fadeUp(0.05)} className="glass-card rounded-3xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <UserAvatar username={userData?.username} size="md" />
            <div>
              <h2 className="font-headline-md text-on-surface text-lg font-bold">Your profile</h2>
              <p className="text-on-surface-variant text-sm">Update how DISHA greets you</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
                Username
              </label>
              <input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-surface-container-high/50 rounded-xl border border-white/10 px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface-container-high/50 rounded-xl border border-white/10 px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-full bg-primary-container text-white font-bold hover:brightness-110 transition-all disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </motion.section>

        {/* Plan */}
        <motion.section {...fadeUp(0.1)} className="glass-card rounded-3xl p-6 md:p-8 mb-6">
          <h2 className="font-headline-md text-on-surface text-lg font-bold mb-1">Subscription</h2>
          <p className="text-on-surface-variant text-sm mb-6">
            Current plan:{' '}
            <span className="text-secondary font-semibold">{userData?.plan_display || 'Free'}</span>
            {!isPremium && userData?.monthly_limit != null && (
              <span className="text-on-surface-variant"> · {tokensDisplay} / {userData.monthly_limit} AI queries left</span>
            )}
            {isPremium && <span className="text-on-surface-variant"> · Unlimited AI queries</span>}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`rounded-2xl p-5 border ${!isPremium ? 'border-primary/40 bg-primary/5' : 'border-white/10'}`}>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">{freePlan?.name || 'Free'}</p>
              <p className="text-2xl font-bold text-on-surface mb-3">₹0</p>
              <ul className="text-xs text-on-surface-variant space-y-1.5">
                {(freePlan?.features || []).slice(0, 4).map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-primary">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`rounded-2xl p-5 border ${isPremium ? 'border-secondary/40 bg-secondary/5' : 'border-white/10'}`}>
              <p className="text-xs uppercase tracking-widest text-secondary mb-1">{premiumPlan?.name || 'Premium'}</p>
              <p className="text-2xl font-bold text-on-surface mb-3">₹{premiumPlan?.price_inr ?? 79}<span className="text-sm font-normal text-on-surface-variant">/mo</span></p>
              <ul className="text-xs text-on-surface-variant space-y-1.5 mb-4">
                {(premiumPlan?.features || []).map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-secondary">✓</span>{f}
                  </li>
                ))}
              </ul>
              {isPremium ? (
                <span className="inline-flex items-center gap-1 text-secondary text-xs font-bold uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Active
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpgrade('premium')}
                  disabled={upgrading}
                  className="w-full py-3 rounded-full bg-secondary text-on-secondary font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {upgrading ? 'Upgrading…' : 'Upgrade to Premium'}
                </button>
              )}
              <p className="text-[10px] text-on-surface-variant mt-2">Demo mode: no real payment required.</p>
            </div>
          </div>
        </motion.section>

        {/* Shortcuts */}
        <motion.section {...fadeUp(0.15)} className="glass-card rounded-3xl p-6 md:p-8">
          <h2 className="font-headline-md text-on-surface text-lg font-bold mb-4">Quick links</h2>
          <div className="space-y-2">
            <Link
              to="/app/sos"
              className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-error/30 hover:bg-error/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                <span className="text-sm font-medium text-on-surface">Emergency contacts & SOS</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface">chevron_right</span>
            </Link>
            <Link
              to="/app/dashboard"
              className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">dashboard</span>
                <span className="text-sm font-medium text-on-surface">Back to dashboard</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface">chevron_right</span>
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
