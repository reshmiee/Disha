import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import TokenBadge from '../components/TokenBadge'
import UserAvatar from '../components/UserAvatar'
import { user as userApi, auth, getUser, clearSession } from '../api'

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
})

const MAP_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBcPxAiIC5YFkxO1X5kTNJW5c1gbDLCU_AQrleC-DgvLcBoe__IOJ8Ruq_ay1kKd7hT4_HDGweBSmErJncggOwovWQGMWoVv8rA87iiebOratA-CckMy1skjYHrvDE2yGDm8kufa9UNkVk_HSw8J4NK2Ns08Pn4QQdEYEHkpI8_azA6UNeTOeVt0_zhuDtPI-kr0YzdRQlUOe_nmriTrx_1Gc7tjtnfCsbdSZm2eoyngrlK-oC34C8FQsfCE7KK0U9l2TWdqfSlFrvj'

export default function Dashboard() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(getUser())

  useEffect(() => {
    userApi.me()
      .then(data => {
        setUserData(data.user)
        localStorage.setItem('disha_user', JSON.stringify(data.user))
      })
      .catch(() => {
        clearSession()
        navigate('/login')
      })
  }, [])

  async function handleLogout() {
    try { await auth.logout() } catch (_) {}
    clearSession()
    navigate('/login')
  }

  const isPremium = userData?.is_premium
  const username  = userData?.username || 'there'

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary/30 min-h-screen">
      <Sidebar />

      {/* ── Top App Bar ── */}
      <header className="fixed top-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5 h-20 flex justify-between items-center px-4 md:px-6 left-0 md:left-72">
        <div className="flex items-center gap-3 md:ml-72">
          <div className="relative group">
            <input className="bg-surface-container border-none rounded-full px-5 py-2 w-40 md:w-56 focus:ring-1 focus:ring-primary text-on-surface text-sm transition-all" placeholder="Search resources..." type="text" />
            <span className="material-symbols-outlined absolute right-3 top-2 text-on-surface-variant text-[18px]">search</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">

          <TokenBadge user={userData} />

          {/* Premium badge */}
          {isPremium && (
            <div className="hidden sm:flex items-center gap-1 bg-secondary/10 px-2.5 py-1 rounded-full border border-secondary/20">
              <span className="material-symbols-outlined text-secondary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <span className="text-secondary text-xs font-bold uppercase tracking-widest">Premium</span>
            </div>
          )}

          <Link to="/app/sos"
            className="text-xs text-error bg-error/10 px-3 py-1.5 rounded-full border border-error/20 hover:bg-error/20 transition-all uppercase tracking-widest">
            Emergency
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors hidden sm:block text-[20px]">notifications</span>
            <button onClick={handleLogout} title="Sign out"
              className="text-on-surface-variant hover:text-error transition-colors hidden sm:block">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
            <UserAvatar username={userData?.username} />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-24 pb-8 px-4 md:px-6 min-h-screen md:ml-72">

        {/* Token warning banner */}
        {!isPremium && userData?.tokens_remaining === 0 && (
          <motion.div {...fadeUp(0)} className="mb-5 px-5 py-3.5 rounded-2xl bg-error/10 border border-error/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-error text-[20px]">warning</span>
              <p className="text-error text-sm font-medium">You've used all your AI queries this month. Upgrade for unlimited access.</p>
            </div>
            <Link to="/app/settings" className="text-xs font-bold uppercase tracking-widest text-error border border-error/40 px-3 py-1.5 rounded-full hover:bg-error/10 transition-all flex-shrink-0">
              Upgrade
            </Link>
          </motion.div>
        )}

        {/* Low token warning */}
        {!isPremium && userData?.tokens_remaining > 0 && userData?.tokens_remaining <= 5 && (
          <motion.div {...fadeUp(0)} className="mb-5 px-5 py-3.5 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
              <p className="text-secondary text-sm font-medium">Only {userData.tokens_remaining} AI queries left this month.</p>
            </div>
            <Link to="/app/settings" className="text-xs font-bold uppercase tracking-widest text-secondary border border-secondary/40 px-3 py-1.5 rounded-full hover:bg-secondary/10 transition-all flex-shrink-0">
              Go Premium ₹79
            </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-12 gap-5 md:gap-6">

          {/* MARG Map Card */}
          <motion.div {...fadeUp(0.1)} className="col-span-12 lg:col-span-7 glass-card rounded-2xl overflow-hidden flex flex-col group transition-all hover:border-primary/30">
            <div className="p-5 md:p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">map</span>MARG | Safety Path
                </h3>
                <p className="text-on-surface-variant text-sm mt-0.5">Real-time protective surveillance and navigation.</p>
              </div>
              <Link to="/app/sos" className="p-3 bg-error text-on-error rounded-full animate-pulse">
                <span className="material-symbols-outlined text-[20px]">emergency_share</span>
              </Link>
            </div>
            <div className="relative h-[220px] md:h-[280px]">
              <img alt="Map Preview" className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-700" src={MAP_IMG} />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-between items-end gap-3">
                <div className="glass-card p-3 rounded-xl border-white/10 flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[18px]">near_me</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-tighter">Current Zone</p>
                    <p className="font-bold text-on-surface text-sm">Live Location</p>
                  </div>
                </div>
                <Link to="/app/marg" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 glow-purple text-sm">Live Check-in</Link>
              </div>
            </div>
          </motion.div>

          {/* SWAR Card */}
          <motion.div {...fadeUp(0.2)} className="col-span-12 lg:col-span-5">
            <div className="glass-card p-5 md:p-6 rounded-2xl h-full flex flex-col border-none bg-gradient-to-br from-secondary/5 to-transparent">
              <h3 className="text-base font-bold text-secondary flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-[20px]">record_voice_over</span>SWAR | Voice Hub
              </h3>
              <div className="space-y-3 flex-1">
                <Link to="/app/swar" className="group block p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-secondary/10 hover:border-secondary/30 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-on-surface text-sm">Dilemma Solver</h4>
                    <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform text-[18px]">arrow_forward</span>
                  </div>
                  <p className="text-on-surface-variant text-xs">Get instant clarity and ethical guidance on complex situations.</p>
                </Link>
                <Link to="/app/swar" className="group block p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-primary/10 hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-on-surface text-sm">Vent Space</h4>
                    <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform text-[18px]">arrow_forward</span>
                  </div>
                  <p className="text-on-surface-variant text-xs">A safe, anonymous digital garden to release your thoughts.</p>
                </Link>
              </div>
              <div className="mt-5 p-4 rounded-xl bg-secondary/10 border border-secondary/20 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-secondary text-xs font-semibold mb-1 italic">Empowerment Quote</p>
                  <p className="text-on-surface text-sm">"The path you walk is yours alone, but you never walk it without support."</p>
                </div>
                <span className="material-symbols-outlined absolute -right-3 -bottom-3 text-secondary/10 text-7xl rotate-12">format_quote</span>
              </div>
            </div>
          </motion.div>

          {/* Bottom 3 cards */}
          <motion.div {...fadeUp(0.3)} className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            <div className="glass-card p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-error/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error text-[18px]">local_police</span>
                </div>
                <h4 className="font-semibold text-on-surface text-sm">Police Near You</h4>
              </div>
              <ul className="space-y-3">
                {[{ name: 'Dial 100', dist: 'Police Emergency' }, { name: 'Women Helpline', dist: '1091 — Free call' }].map(({ name, dist }) => (
                  <li key={name} className="flex justify-between items-center group cursor-pointer">
                    <div><p className="font-bold text-on-surface text-sm">{name}</p><p className="text-xs text-on-surface-variant">{dist}</p></div>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-[18px]">call</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">medical_services</span>
                </div>
                <h4 className="font-semibold text-on-surface text-sm">Emergency Lines</h4>
              </div>
              <ul className="space-y-3">
                {[{ name: 'Ambulance', dist: '108 — Free call' }, { name: 'Universal Emergency', dist: '112 — All services' }].map(({ name, dist }) => (
                  <li key={name} className="flex justify-between items-center group cursor-pointer">
                    <div><p className="font-bold text-on-surface text-sm">{name}</p><p className="text-xs text-on-surface-variant">{dist}</p></div>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-[18px]">call</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-5 rounded-xl flex flex-col justify-center items-center text-center bg-primary-container/10 border-primary/20">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 relative">
                <div className="absolute inset-0 bg-primary/40 rounded-full animate-ripple" />
                <span className="material-symbols-outlined text-primary text-2xl">volunteer_activism</span>
              </div>
              <p className="font-bold text-on-surface text-sm mb-1">Need to talk to someone?</p>
              <p className="text-on-surface-variant text-xs mb-3">iCall Mental Health Helpline — 9152987821</p>
              <a href="tel:9152987821" className="bg-primary/20 text-primary border border-primary/40 px-5 py-1.5 rounded-full font-bold hover:bg-primary/30 transition-all text-xs">
                Call Now
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Floating FAB */}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.4 }}
        className="fixed bottom-8 right-8 flex flex-col items-center gap-2 z-50">
        <Link to="/app/sos" className="w-14 h-14 rounded-full bg-secondary text-on-secondary flex items-center justify-center glow-gold shadow-2xl hover:scale-110 active:scale-90 transition-all group">
          <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">add_moderator</span>
        </Link>
        <span className="bg-background/80 backdrop-blur-md text-secondary text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-secondary/20 uppercase tracking-[0.2em]">Guard</span>
      </motion.div>
    </div>
  )
}