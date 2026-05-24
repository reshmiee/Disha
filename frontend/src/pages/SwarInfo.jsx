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
    icon: 'psychology',
    title: 'Empathetic AI',
    body: 'Trained on psychological resilience frameworks to provide immediate, non-judgmental validation when you need it most.',
  },
  {
    icon: 'visibility_off',
    title: 'Fully Anonymous',
    body: 'Your conversations are private by default. No names, no traces — just a safe space to express yourself freely.',
  },
  {
    icon: 'mic',
    title: 'Voice & Text',
    body: 'Speak or type — SWAR adapts to how you communicate, meeting you exactly where you are.',
  },
  {
    icon: 'crisis_alert',
    title: 'Crisis Detection',
    body: 'SWAR recognises escalating distress and can seamlessly connect you to real human support or emergency services.',
  },
  {
    icon: 'translate',
    title: 'Multilingual',
    body: 'Express yourself in your mother tongue. SWAR understands and responds in the language that feels most natural to you.',
  },
  {
    icon: 'schedule',
    title: 'Always Available',
    body: 'SWAR is available 24/7, 365 days a year. No appointments, no waiting rooms — support whenever you need it.',
  },
]

export default function SwarInfo() {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      <LandingNav activePage="swar" />

      {/* ── HERO ── */}
      <section className="min-h-screen flex items-center pt-20 px-8 md:px-16 lg:px-24 relative overflow-hidden">
        {/* Atmospheric glows */}
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-tertiary-container/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-tertiary/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <motion.div {...fadeUp}>
            <p className="font-label-caps text-label-caps text-tertiary tracking-widest mb-6">
              THE PILLAR OF VOICE
            </p>
            <h1
              className="text-white mb-6 leading-tight"
              style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.1, fontWeight: 700 }}
            >
              SWAR
            </h1>
            <h2
              className="text-on-surface-variant mb-8"
              style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.3 }}
            >
              Empathetic Intelligence
            </h2>
            <p className="text-body-lg text-on-surface-variant mb-10 max-w-lg">
              When the world feels complex, SWAR provides the clarity you need. An anonymous, high-fidelity AI
              designed to listen, validate, and guide — without judgment.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-3 border border-tertiary/50 text-tertiary font-label-caps text-label-caps px-10 py-5 rounded-full tracking-widest hover:bg-tertiary/10 transition-all active:scale-95"
            >
              Access SWAR
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </motion.div>

          {/* Voice / chat card */}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
            <div className="glass-panel rounded-[40px] p-8" style={{ boxShadow: '0 0 60px rgba(232,193,112,0.12)' }}>
              {/* Card header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-xl">psychology</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-caps text-[10px] text-tertiary tracking-widest uppercase">SWAR</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                  </div>
                  <p className="text-xs text-on-surface-variant">Empathy Engine Active</p>
                </div>

                {/* Wave bars */}
                <div className="ml-auto flex items-end gap-0.5 h-8">
                  {[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
                    <div
                      key={i}
                      className="w-1 bg-tertiary rounded-full wave-bar"
                      style={{
                        opacity: i === 0 || i === 4 ? 0.6 : i === 1 || i === 3 ? 0.8 : 1,
                        animationDelay: `${delay}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Quote */}
              <p
                className="text-white italic leading-relaxed mb-6"
                style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 22, lineHeight: 1.5 }}
              >
                "True strength is not found in the absence of fear, but in the deliberate choice of your next step."
              </p>

              <div className="flex items-center gap-2 mb-8">
                <span className="w-1 h-1 bg-tertiary rounded-full animate-pulse" />
                <span className="text-[10px] font-label-caps text-on-surface-variant tracking-widest">
                  PROCESSING EMPATHY NODES...
                </span>
              </div>

              {/* Simulated chat */}
              <div className="space-y-3 border-t border-white/5 pt-6">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-tertiary/20 flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary text-sm">person</span>
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-on-surface-variant max-w-xs">
                    I feel overwhelmed and don't know what to do next.
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-tertiary/10 border border-tertiary/20 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-tertiary max-w-xs">
                    I hear you. Let's take this one step at a time — you're not alone in this.
                  </div>
                  <div className="w-7 h-7 rounded-full bg-tertiary/20 flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary text-sm">psychology</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-32 px-8 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <p className="font-label-caps text-label-caps text-tertiary tracking-widest text-center mb-4">WHAT SWAR OFFERS</p>
          <h3
            className="text-white text-center mb-16"
            style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 36 }}
          >
            A voice that truly listens
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map(({ icon, title, body }, i) => (
              <motion.div
                key={title}
                className="glass-panel p-8 rounded-3xl hover:border-tertiary/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
              >
                <span className="material-symbols-outlined text-tertiary text-4xl mb-6 block">{icon}</span>
                <h4 className="text-white font-semibold text-xl mb-3">{title}</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-8 md:px-16 text-center">
        <div className="glass-panel max-w-2xl mx-auto rounded-3xl p-16 border-tertiary/10">
          <h3
            className="text-white mb-4"
            style={{ fontFamily: 'Bodoni Moda, serif', fontSize: 32 }}
          >
            You deserve to be heard.
          </h3>
          <p className="text-on-surface-variant mb-10">Join DISHA and let SWAR walk beside you through every moment.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/login"
              className="inline-flex items-center gap-3 border border-tertiary/40 text-tertiary font-label-caps text-label-caps px-10 py-4 rounded-full tracking-widest hover:bg-tertiary/10 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-3 bg-tertiary-container text-tertiary font-label-caps text-label-caps px-10 py-4 rounded-full tracking-widest hover:bg-tertiary-container/80 transition-all"
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
