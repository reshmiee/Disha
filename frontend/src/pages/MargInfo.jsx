import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import LandingNav from '../components/LandingNav'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
}

const FEATURES = [
  {
    icon: 'shield_with_heart',
    title: 'Nocturnal Safety',
    body: 'AI-calculated safety scores based on lighting levels, pedestrian footfall, and historical incident data — updated in real time.',
  },
  {
    icon: 'sensors',
    title: 'Real-time Sync',
    body: 'Immediate connection to local safety networks and emergency response services. Always a step ahead.',
  },
  {
    icon: 'route',
    title: 'Smart Routing',
    body: 'Our proprietary algorithm analyses millions of data points to calculate the safest path forward in milliseconds.',
  },
  {
    icon: 'groups',
    title: 'Community Reports',
    body: 'Validated, anonymous reports from a trusted community of 50,000+ members enrich every safety score.',
  },
  {
    icon: 'check_in',
    title: 'Auto Check-in',
    body: "Scheduled check-ins alert your trusted contacts if you don't respond — silent protection, always on.",
  },
  {
    icon: 'lock',
    title: 'Private by Design',
    body: 'Your location data is encrypted end-to-end and never sold or shared. Your sanctuary, your privacy.',
  },
]

export default function MargInfo() {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      <LandingNav activePage="marg" />

      {/* ── HERO ── */}
      <section className="min-h-screen flex items-center pt-20 px-8 md:px-16 lg:px-24 relative overflow-hidden">
        {/* Atmospheric glows */}
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-primary-container/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <motion.div {...fadeUp}>
            <p className="font-label-caps text-label-caps text-primary tracking-widest mb-6">
              THE PILLAR OF PROTECTION
            </p>
            <h1
              className="text-white mb-6 leading-tight"
              style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.1, fontWeight: 700 }}
            >
              MARG
            </h1>
            <h2
              className="text-on-surface-variant mb-8"
              style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.3 }}
            >
              Predictive Urban Navigation
            </h2>
            <p className="text-body-lg text-on-surface-variant mb-10 max-w-lg">
              Leveraging real-time city data and community validation to chart the safest paths. Not just a map — a
              guardian that anticipates the landscape before you arrive.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-3 bg-primary-container text-on-primary-container font-label-caps text-label-caps px-10 py-5 rounded-full tracking-widest hover:bg-primary-container/80 transition-all active:scale-95"
            >
              Access MARG
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </motion.div>

          {/* Live corridor card */}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
            <div className="glass-panel rounded-[40px] p-8" style={{ boxShadow: '0 0 60px rgba(235,178,255,0.15)' }}>
              <div className="flex justify-between items-center mb-6">
                <span className="font-label-caps text-label-caps text-primary tracking-widest">LIVE CORRIDOR</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-on-surface-variant">Active</span>
                </div>
              </div>

              <div className="h-40 bg-black/40 rounded-2xl relative overflow-hidden mb-6">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 160">
                  <path d="M0 80 Q75 40 150 80 T300 80" fill="none" stroke="#ebb2ff" strokeWidth="1" opacity="0.3" />
                  <path d="M0 100 Q75 60 150 90 T300 70" fill="none" stroke="#ebb2ff" strokeWidth="0.5" opacity="0.15" />
                  <circle cx="180" cy="75" r="4" fill="#ebb2ff" opacity="0.8" />
                  <circle cx="180" cy="75" r="10" fill="#ebb2ff" opacity="0.2" />
                </svg>
                <div className="absolute bottom-4 left-4 text-xs text-primary font-label-caps tracking-widest">
                  ROUTE CALCULATED
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { area: 'Koregaon Park', score: '98% Secure', color: 'text-primary' },
                  { area: 'MG Road Corridor', score: '84% Secure', color: 'text-tertiary' },
                  { area: 'Kothrud West', score: '91% Secure', color: 'text-primary' },
                ].map(({ area, score, color }) => (
                  <div key={area} className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">{area}</span>
                    <span className={`${color} font-semibold text-sm`}>{score}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-32 px-8 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <p className="font-label-caps text-label-caps text-primary tracking-widest text-center mb-4">HOW IT WORKS</p>
          <h3
            className="text-white text-center mb-16"
            style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 36 }}
          >
            Built around your safety
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map(({ icon, title, body }, i) => (
              <motion.div
                key={title}
                className="glass-panel p-8 rounded-3xl hover:border-primary/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
              >
                <span className="material-symbols-outlined text-primary text-4xl mb-6 block">{icon}</span>
                <h4 className="text-white font-semibold text-xl mb-3">{title}</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-8 md:px-16 text-center">
        <div className="glass-panel max-w-2xl mx-auto rounded-3xl p-16">
          <h3
            className="text-white mb-4"
            style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 32 }}
          >
            Ready to navigate safely?
          </h3>
          <p className="text-on-surface-variant mb-10">Join DISHA and let MARG guide every step of your journey.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/login"
              className="inline-flex items-center gap-3 bg-primary-container text-on-primary-container font-label-caps text-label-caps px-10 py-4 rounded-full tracking-widest hover:bg-primary-container/80 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-3 border border-primary/30 text-primary font-label-caps text-label-caps px-10 py-4 rounded-full tracking-widest hover:bg-primary/10 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 text-center border-t border-white/5">
        <p className="font-label-caps text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
          © 2024 DISHA Empowerment Foundation
        </p>
      </footer>
    </div>
  )
}
