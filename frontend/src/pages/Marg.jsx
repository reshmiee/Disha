import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import LiveMap from '../components/LiveMap'
import TokenBadge from '../components/TokenBadge'
import UserAvatar from '../components/UserAvatar'
import { useUserProfile } from '../hooks/useUserProfile'

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
})

const EMPOWER_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNCMLW7ulTkbs_KE1jTMILzG8NptmIiQ5Op4Y0J1Nop6E1EAgMRFADFOFkh8l-YoQhJfQWmG1X26-UGz8wbkSSQNXB6ANHPYNK1oXG6zKb66GLpaORu4itW5PfN_7Kijfa8n3GuWaCrbI-82YdyqJpm3AilIf70eH5W6Nv2CWlGn8SXWTKgkLkDJOeuivZ4wM7zCQJUsOniMzBePNEIJqJIM9tpNyrYN3tgIQU5ku8KKvWk0YIreOBeLJL18ttj2wfPPl4rfDvDh7X'

const NEARBY = [
  { icon: 'local_police',    color: 'text-secondary',         name: 'City Central Station', dist: '0.4 km', status: 'Active Response Unit',  dot: 'bg-green-500' },
  { icon: 'medical_services',color: 'text-primary-fixed-dim', name: "St. Mary's ER",         dist: '1.2 km', status: 'Emergency Ready',        dot: 'bg-green-500' },
  { icon: 'verified_user',   color: 'text-tertiary',          name: 'Safe Haven Shop',       dist: '0.2 km', status: 'Public Guardian Store',  dot: 'bg-secondary' },
]

export default function Marg() {
  const userData = useUserProfile()
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return (
    <div className="bg-background text-on-background font-body-md overflow-hidden">
      <Sidebar />

      <motion.header
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="fixed top-0 right-0 z-40 flex justify-between items-center h-20 px-6 bg-background/80 backdrop-blur-md border-b border-white/5"
        style={{ left: 0 }}
      >
        <div className="flex items-center gap-4 md:ml-72">
          <span className="text-base font-bold text-secondary">MARG</span>
          <span className="h-4 w-px bg-outline-variant hidden sm:block" />
          <span className="font-label-md text-label-md text-on-surface-variant hidden sm:block">Live Safety Path Navigation</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <TokenBadge user={userData} />
          <button type="button" className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors">notifications</button>
          <UserAvatar username={userData?.username} />
        </div>
      </motion.header>

      <main className="mt-16 flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>

        <motion.section {...fadeUp(0.1)} className="relative flex-1 min-h-[300px] md:min-h-0 bg-surface-container-lowest overflow-hidden md:ml-72">
          <div className="absolute inset-0 z-0 min-h-[300px]">
            <LiveMap key="marg-map" coords={coords} height="100%" zoom={15} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(19,19,19,0.35) 100%)' }} />
          </div>

          <div className="absolute top-6 left-6 z-10">
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" style={{ boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
              <span className="text-on-surface font-label-md text-label-md">
                {coords ? 'Current Zone: High Safety Rating' : 'Waiting for GPS…'}
              </span>
            </div>
          </div>

          <div className="absolute z-20" style={{ top: '60%', left: '55%' }}>
            <div className="bg-secondary p-2 rounded-full cursor-pointer hover:scale-110 transition-transform" style={{ boxShadow: '0 0 15px rgba(248,189,42,0.5)' }}>
              <span className="material-symbols-outlined text-on-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_police</span>
            </div>
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" viewBox="0 0 1000 1000">
            <path d="M 350 400 Q 450 450 550 600" fill="none" stroke="#f8bd2a" strokeDasharray="8 12" strokeLinecap="round" strokeWidth="3">
              <animate attributeName="stroke-dashoffset" dur="10s" from="0" repeatCount="indefinite" to="200" />
            </path>
          </svg>
        </motion.section>

        <motion.aside {...fadeUp(0.2)} className="w-full md:w-[420px] bg-background/95 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/5 flex flex-col overflow-y-auto z-30">
          <div className="p-6 space-y-8">

            <div className="space-y-4">
              <h2 className="font-headline-md text-headline-md text-on-surface">Route Suggester</h2>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">my_location</span>
                  <input className="w-full bg-transparent border-b border-outline-variant focus:border-primary py-3 pl-12 pr-4 outline-none transition-colors text-on-surface placeholder:text-outline-variant"
                    placeholder="Current Location" value={from} onChange={e => setFrom(e.target.value)} />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary">location_on</span>
                  <input className="w-full bg-transparent border-b border-outline-variant focus:border-secondary py-3 pl-12 pr-4 outline-none transition-colors text-on-surface placeholder:text-outline-variant"
                    placeholder="Where to?" value={to} onChange={e => setTo(e.target.value)} />
                </div>
              </div>
              <button className="w-full bg-primary-container text-white py-4 rounded-xl font-bold hover:brightness-110 transition-all glow-purple flex items-center justify-center gap-2">
                Calculate Safe Path
              </button>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-secondary">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-label-sm text-label-sm text-secondary uppercase">Recommended Path</p>
                  <h3 className="font-headline-md text-on-surface text-lg">MARG-01 Secure Trail</h3>
                </div>
                <span className="bg-secondary/20 text-secondary px-2 py-1 rounded text-[10px] font-bold">12 MIN</span>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant text-sm flex-wrap">
                {[{ icon: 'brightness_high', label: 'Well-lit' }, { icon: 'local_police', label: 'Police Near' }, { icon: 'groups', label: 'Crowded' }].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">{icon}</span>{label}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-headline-md text-headline-md text-on-surface">Nearby Help</h2>
                <button className="text-primary font-label-sm text-label-sm hover:underline">See All</button>
              </div>
              <div className="space-y-3">
                {NEARBY.map(({ icon, color, name, dist, status, dot }) => (
                  <div key={name} className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:bg-surface-variant/40 transition-colors cursor-pointer group">
                    <div className={`w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-on-surface">{name}</h4>
                        <span className="text-outline text-xs">{dist}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${dot}`} />
                        <span className="text-on-surface-variant text-xs">{status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl h-48 group">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={EMPOWER_IMG} alt="Empowerment story" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-label-sm text-label-sm text-primary uppercase">Empowerment Story</p>
                <h4 className="text-on-surface font-bold">14,000+ Journeys Secured this week.</h4>
              </div>
            </div>

          </div>
        </motion.aside>
      </main>
    </div>
  )
}
